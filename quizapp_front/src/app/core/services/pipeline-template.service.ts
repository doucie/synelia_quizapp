import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PipelineTemplate } from '../models/pipeline.interfaces';

// ── Interfaces requête / réponse ────────────────────
export interface PipelineTemplateRequest {
  user?: number;
  datas?: PipelineTemplate[];
  data?: Partial<PipelineTemplate>;
  size?: number;
  index?: number;
  isSimpleLoading?: boolean;
}

export interface PipelineTemplateResponse {
  hasError: boolean;
  status: { code: string; message: string };
  items?: PipelineTemplate[];
  item?: PipelineTemplate;
  count?: number;
  httpCode?: number;
}

export interface PipelineTemplateCriteria {
  templateName?: string;
  isDefault?: boolean;
  isActive?: boolean;
  isLocked?: boolean;
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

export interface PagedPipelineTemplateResponse {
  content: PipelineTemplate[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class PipelineTemplateService {
  private apiUrl = `${environment.apiUrl}/pipelineTemplate`;

  constructor(private http: HttpClient) {}

  // ── CRUD standard ──────────────────────────────────

  getAllByCriteria(criteria: PipelineTemplateCriteria = {}): Observable<PagedPipelineTemplateResponse> {
    const request = {
      user: this.getCurrentUserId()?.toString() || '1',
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : '',
        searchString: criteria.search_string || '',
        ...(criteria.templateName && { templateName: criteria.templateName }),
        ...(criteria.isDefault !== undefined && { isDefault: criteria.isDefault }),
        ...(criteria.isActive !== undefined && { isActive: criteria.isActive }),
        ...(criteria.isLocked !== undefined && { isLocked: criteria.isLocked }),
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

  create(template: Partial<PipelineTemplate>): Observable<PipelineTemplateResponse> {
    return this.http.post<PipelineTemplateResponse>(`${this.apiUrl}/create`, {
      user: this.getCurrentUserId(), datas: [template]
    }).pipe(catchError(this.handleError('création du template')));
  }

  update(template: PipelineTemplate): Observable<PipelineTemplateResponse> {
    return this.http.post<PipelineTemplateResponse>(`${this.apiUrl}/update`, {
      user: this.getCurrentUserId(), datas: [template]
    }).pipe(catchError(this.handleError('mise à jour du template')));
  }

  delete(id: number): Observable<PipelineTemplateResponse> {
    return this.http.post<PipelineTemplateResponse>(`${this.apiUrl}/delete`, {
      user: this.getCurrentUserId(), datas: [{ id }]
    }).pipe(catchError(this.handleError('suppression du template')));
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, {
      user: this.getCurrentUserId(), datas: [{ id, isDeleted: false }]
    });
  }

  // ── Méthodes spécifiques pipeline ──────────────────

  setDefault(id: number): Observable<PipelineTemplateResponse> {
    return this.http.post<PipelineTemplateResponse>(`${this.apiUrl}/setDefault`, {
      user: this.getCurrentUserId(), data: { id }
    }).pipe(catchError(this.handleError('définition comme défaut')));
  }

  duplicate(id: number, templateName: string): Observable<PipelineTemplateResponse> {
    return this.http.post<PipelineTemplateResponse>(`${this.apiUrl}/duplicate`, {
      user: this.getCurrentUserId(), data: { id, templateName }
    }).pipe(catchError(this.handleError('duplication du template')));
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
    } as PipelineTemplateResponse);
  }
}
