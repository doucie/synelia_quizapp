import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface FormVersion {
  id?: number;
  versionNumber?: number;
  isPublished?: boolean;
  isLocked?: boolean;
  randomQuestions?: boolean;
  formId?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

export interface FormVersionSearchCriteria {
  page?: number;
  size?: number;
  search_string?: string;
  idDe?: string;
  idA?: string;
  formId?: number;
  versionNumber?: number;
  isPublished?: boolean;
  isLocked?: boolean;
  randomQuestions?: boolean;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

export interface PagedFormVersionResponse {
  content: FormVersion[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class FormVersionService {
  private apiUrl = `${environment.apiUrl}/formversion`;

  constructor(private http: HttpClient) {}

  getAllByCriteria(criteria: FormVersionSearchCriteria = {}): Observable<PagedFormVersionResponse> {
    const request = {
      user: this.getCurrentUserId(),
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        id: criteria.idDe || '',
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : '',
        searchString: criteria.search_string || '',
        ...(criteria.formId && { formId: criteria.formId }),
        ...(criteria.versionNumber && { versionNumber: criteria.versionNumber }),
        ...(criteria.isPublished !== undefined && { isPublished: criteria.isPublished }),
        ...(criteria.isLocked !== undefined && { isLocked: criteria.isLocked }),
        ...(criteria.randomQuestions !== undefined && { randomQuestions: criteria.randomQuestions }),
        ...(criteria.dateCreationDe && { dateCreationDe: criteria.dateCreationDe }),
        ...(criteria.dateCreationA && { dateCreationA: criteria.dateCreationA }),
        ...(criteria.dateModificationDe && { dateModificationDe: criteria.dateModificationDe }),
        ...(criteria.dateModificationA && { dateModificationA: criteria.dateModificationA }),
        ...(criteria.idDe && criteria.idDe.trim() && { idStart: criteria.idDe }),
        ...(criteria.idA && criteria.idA.trim() && { idEnd: criteria.idA })
      }
    };

    return this.http.post<any>(`${this.apiUrl}/getAllByCriteria`, request).pipe(
      map(response => {
        if (!response || (!response.items && !response.item)) {
          return { content: [], totalElements: 0, totalPages: 0, size: criteria.size || 10, number: criteria.page || 0 };
        }
        const items = (response.items || (response.item ? [response.item] : [])).map((item: any) => this.normalizeFormVersion(item));
        const totalElements = response.totalCount || response.count || items.length;
        const pageSize = criteria.size || 10;
        return { content: items, totalElements, totalPages: Math.ceil(totalElements / pageSize), size: pageSize, number: criteria.page || 0 };
      }),
      catchError(error => { console.error('Erreur formVersion:', error); return throwError(() => error); })
    );
  }

  create(item: FormVersion): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { user: this.getCurrentUserId(), datas: [this.prepareFormVersion(item)] });
  }

  update(item: FormVersion): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: this.getCurrentUserId(), datas: [this.prepareFormVersion(item)] });
  }

  delete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { user: this.getCurrentUserId(), datas: [{ id }] });
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: this.getCurrentUserId(), datas: [{ id, isDeleted: false }] });
  }

  /**
   * Custom actions: fork a locked version, duplicate a question for a version
   */
  custom(action: string, formVersionId: number, questionId?: number): Observable<any> {
    const data: any = { action, id: formVersionId };
    if (questionId) { data.questionId = questionId; }
    return this.http.post(`${this.apiUrl}/custom`, { user: this.getCurrentUserId(), datas: [data] });
  }

  private normalizeFormVersion(item: any): FormVersion {
    return {
      id: this.toOptionalNumber(item.id),
      versionNumber: this.toOptionalNumber(item.versionNumber ?? item.version_number),
      isPublished: item.isPublished ?? item.is_published ?? false,
      isLocked: item.isLocked ?? item.is_locked ?? false,
      randomQuestions: item.randomQuestions ?? item.random_questions ?? false,
      formId: this.toOptionalNumber(item.formId ?? item.form_id),
      createdAt: item.createdAt || item.created_at || undefined,
      createdBy: this.toOptionalNumber(item.createdBy ?? item.created_by),
      updatedAt: item.updatedAt || item.updated_at || undefined,
      updatedBy: this.toOptionalNumber(item.updatedBy ?? item.updated_by),
      isDeleted: item.isDeleted ?? item.is_deleted ?? false
    };
  }

  private prepareFormVersion(item: FormVersion): FormVersion {
    return {
      ...item,
      randomQuestions: item.randomQuestions ?? false
    };
  }

  private getCurrentUserId(): number {
    try {
      const user = localStorage.getItem('user');
      return user ? Number(JSON.parse(user).id) || 0 : 0;
    } catch {
      return 0;
    }
  }

  private toOptionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
}
