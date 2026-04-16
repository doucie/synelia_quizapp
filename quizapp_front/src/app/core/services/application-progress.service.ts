import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApplicationProgress } from '../models/pipeline.interfaces';

// ── Interfaces requête / réponse ────────────────────
export interface ApplicationProgressRequest {
  user?: number;
  datas?: ApplicationProgress[];
  data?: Partial<ApplicationProgress>;
  size?: number;
  index?: number;
  isSimpleLoading?: boolean;
}

export interface ApplicationProgressResponse {
  hasError: boolean;
  status: { code: string; message: string };
  items?: ApplicationProgress[];
  item?: ApplicationProgress;
  count?: number;
  httpCode?: number;
}

export interface ApplicationProgressCriteria {
  applicationId?: number;
  pipelineStageId?: number;
  progressStatus?: string;
  decidedById?: number;
  isDeleted?: boolean;
  search_string?: string;
  idDe?: string;
  idA?: string;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
  page?: number;
  size?: number;
}

export interface PagedApplicationProgressResponse {
  content: ApplicationProgress[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class ApplicationProgressService {
  private apiUrl = `${environment.apiUrl}/applicationProgress`;

  constructor(private http: HttpClient) {}

  // ── CRUD standard ──────────────────────────────────

  getAllByCriteria(criteria: ApplicationProgressCriteria = {}): Observable<PagedApplicationProgressResponse> {
    const request = {
      user: this.getCurrentUserId()?.toString() || '1',
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : '',
        searchString: criteria.search_string || '',
        ...(criteria.applicationId && { applicationId: criteria.applicationId }),
        ...(criteria.pipelineStageId && { pipelineStageId: criteria.pipelineStageId }),
        ...(criteria.progressStatus && { progressStatus: criteria.progressStatus }),
        ...(criteria.decidedById && { decidedById: criteria.decidedById }),
        ...(criteria.idDe?.trim() && { idStart: criteria.idDe }),
        ...(criteria.idA?.trim() && { idEnd: criteria.idA }),
        ...(criteria.dateCreationDe && { dateCreationDe: criteria.dateCreationDe }),
        ...(criteria.dateCreationA && { dateCreationA: criteria.dateCreationA }),
        ...(criteria.dateModificationDe && { dateModificationDe: criteria.dateModificationDe }),
        ...(criteria.dateModificationA && { dateModificationA: criteria.dateModificationA })
      }
    };
    return this.http.post<any>(`${this.apiUrl}/getByCriteria`, request).pipe(
      map(response => {
        const items = response?.items || (response?.item ? [response.item] : []);
        const total = response?.totalCount || response?.count || items.length;
        const pageSize = criteria.size || 10;
        return { content: items, totalElements: total, totalPages: Math.ceil(total / pageSize), size: pageSize, number: criteria.page || 0 };
      }),
      catchError(() => of({ content: [], totalElements: 0, totalPages: 0, size: criteria.size || 10, number: criteria.page || 0 }))
    );
  }

  create(progress: Partial<ApplicationProgress>): Observable<ApplicationProgressResponse> {
    return this.http.post<ApplicationProgressResponse>(`${this.apiUrl}/create`, {
      user: this.getCurrentUserId(), datas: [progress]
    }).pipe(catchError(this.handleError('création du progrès')));
  }

  update(progress: ApplicationProgress): Observable<ApplicationProgressResponse> {
    return this.http.post<ApplicationProgressResponse>(`${this.apiUrl}/update`, {
      user: this.getCurrentUserId(), datas: [progress]
    }).pipe(catchError(this.handleError('mise à jour du progrès')));
  }

  delete(id: number): Observable<ApplicationProgressResponse> {
    return this.http.post<ApplicationProgressResponse>(`${this.apiUrl}/delete`, {
      user: this.getCurrentUserId(), datas: [{ id }]
    }).pipe(catchError(this.handleError('suppression du progrès')));
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, {
      user: this.getCurrentUserId(), datas: [{ id, isDeleted: false }]
    });
  }

  // ── Méthodes spécifiques pipeline ──────────────────

  getByApplication(applicationId: number): Observable<ApplicationProgressResponse> {
    return this.http.post<ApplicationProgressResponse>(`${this.apiUrl}/byApplication`, {
      user: this.getCurrentUserId(), data: { applicationId }
    }).pipe(catchError(this.handleError('récupération du progrès candidat')));
  }

  advance(applicationId: number): Observable<ApplicationProgressResponse> {
    return this.http.post<ApplicationProgressResponse>(`${this.apiUrl}/advance`, {
      user: this.getCurrentUserId(), data: { applicationId }
    }).pipe(catchError(this.handleError('avancement de l\'étape')));
  }

  fail(applicationId: number, stageId: number, notes?: string): Observable<ApplicationProgressResponse> {
    return this.http.post<ApplicationProgressResponse>(`${this.apiUrl}/fail`, {
      user: this.getCurrentUserId(), data: { applicationId, pipelineStageId: stageId, notes }
    }).pipe(catchError(this.handleError('échec de l\'étape')));
  }

  skip(applicationId: number, stageId: number): Observable<ApplicationProgressResponse> {
    return this.http.post<ApplicationProgressResponse>(`${this.apiUrl}/skip`, {
      user: this.getCurrentUserId(), data: { applicationId, pipelineStageId: stageId }
    }).pipe(catchError(this.handleError('passage de l\'étape')));
  }

  getCurrentStage(applicationId: number): Observable<ApplicationProgressResponse> {
    return this.http.post<ApplicationProgressResponse>(`${this.apiUrl}/currentStage`, {
      user: this.getCurrentUserId(), data: { applicationId }
    }).pipe(catchError(this.handleError('récupération de l\'étape courante')));
  }

  // ── Migration pipeline ────────────────────────────

  getMigratableCandidates(campaignId: number, newTemplateId: number): Observable<{ migratableApplicationIds: number[], count: number }> {
    return this.http.post<any>(`${this.apiUrl}/migratableCandidates`, {
      user: this.getCurrentUserId(), data: { campaignId, newTemplateId }
    }).pipe(
      map(response => ({
        migratableApplicationIds: response?.items?.[0]?.migratableApplicationIds || [],
        count: response?.count || 0
      })),
      catchError(() => of({ migratableApplicationIds: [] as number[], count: 0 }))
    );
  }

  migrateMultipleCandidates(applicationIds: number[], newTemplateId: number): Observable<ApplicationProgressResponse> {
    return this.http.post<ApplicationProgressResponse>(`${this.apiUrl}/migrateMultiple`, {
      user: this.getCurrentUserId(), data: { migratableApplicationIds: applicationIds, newTemplateId }
    }).pipe(catchError(this.handleError('migration des candidats')));
  }

  // ── Utilitaires ────────────────────────────────────

  private getCurrentUserId(): number | undefined {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).id : undefined;
    } catch { return undefined; }
  }

  private handleError(action: string) {
    return () => of({
      hasError: true,
      status: { code: 'ERROR', message: `Erreur lors de la ${action}` },
      httpCode: 500
    } as ApplicationProgressResponse);
  }
}
