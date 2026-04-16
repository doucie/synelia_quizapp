import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PipelineStage } from '../models/pipeline.interfaces';

// ── Interfaces requête / réponse ────────────────────
export interface PipelineStageRequest {
  user?: number;
  datas?: PipelineStage[];
  data?: Partial<PipelineStage>;
  size?: number;
  index?: number;
  isSimpleLoading?: boolean;
}

export interface PipelineStageResponse {
  hasError: boolean;
  status: { code: string; message: string };
  items?: PipelineStage[];
  item?: PipelineStage;
  count?: number;
  httpCode?: number;
}

export interface PipelineStageCriteria {
  stageType?: string;
  stageLabel?: string;
  pipelineTemplateId?: number;
  isRequired?: boolean;
  isEliminatory?: boolean;
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

export interface PagedPipelineStageResponse {
  content: PipelineStage[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class PipelineStageService {
  private apiUrl = `${environment.apiUrl}/pipelineStage`;

  constructor(private http: HttpClient) {}

  // ── CRUD standard ──────────────────────────────────

  getAllByCriteria(criteria: PipelineStageCriteria = {}): Observable<PagedPipelineStageResponse> {
    const request = {
      user: this.getCurrentUserId()?.toString() || '1',
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : '',
        searchString: criteria.search_string || '',
        ...(criteria.stageType && { stageType: criteria.stageType }),
        ...(criteria.stageLabel && { stageLabel: criteria.stageLabel }),
        ...(criteria.pipelineTemplateId && { pipelineTemplateId: criteria.pipelineTemplateId }),
        ...(criteria.isRequired !== undefined && { isRequired: criteria.isRequired }),
        ...(criteria.isEliminatory !== undefined && { isEliminatory: criteria.isEliminatory }),
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

  create(stage: Partial<PipelineStage>): Observable<PipelineStageResponse> {
    return this.http.post<PipelineStageResponse>(`${this.apiUrl}/create`, {
      user: this.getCurrentUserId(), datas: [stage]
    }).pipe(catchError(this.handleError('création de l\'étape')));
  }

  update(stage: PipelineStage): Observable<PipelineStageResponse> {
    return this.http.post<PipelineStageResponse>(`${this.apiUrl}/update`, {
      user: this.getCurrentUserId(), datas: [stage]
    }).pipe(catchError(this.handleError('mise à jour de l\'étape')));
  }

  delete(id: number): Observable<PipelineStageResponse> {
    return this.http.post<PipelineStageResponse>(`${this.apiUrl}/delete`, {
      user: this.getCurrentUserId(), datas: [{ id }]
    }).pipe(catchError(this.handleError('suppression de l\'étape')));
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, {
      user: this.getCurrentUserId(), datas: [{ id, isDeleted: false }]
    });
  }

  // ── Méthodes spécifiques ───────────────────────────

  getByTemplate(templateId: number): Observable<PipelineStageResponse> {
    return this.http.post<PipelineStageResponse>(`${this.apiUrl}/byTemplate`, {
      user: this.getCurrentUserId(), data: { pipelineTemplateId: templateId }
    }).pipe(catchError(this.handleError('récupération des étapes du template')));
  }

  reorder(templateId: number, orderedStageIds: number[]): Observable<PipelineStageResponse> {
    return this.http.post<PipelineStageResponse>(`${this.apiUrl}/reorder`, {
      user: this.getCurrentUserId(), data: { pipelineTemplateId: templateId, orderedStageIds }
    }).pipe(catchError(this.handleError('réordonnancement des étapes')));
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
    } as PipelineStageResponse);
  }
}
