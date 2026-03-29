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
  formId?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
}

export interface FormVersionSearchCriteria {
  page?: number;
  size?: number;
  search_string?: string;
  idDe?: string;
  idA?: string;
  formId?: number;
  isPublished?: boolean;
  isLocked?: boolean;
  isDeleted?: boolean;
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
    const currentUserData = localStorage.getItem('user');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id?.toString() || '1' : '1';

    const request = {
      user: currentUserId,
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        id: criteria.idDe || '',
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : '',
        searchString: criteria.search_string || '',
        ...(criteria.formId && { formId: criteria.formId }),
        ...(criteria.isPublished !== undefined && { isPublished: criteria.isPublished }),
        ...(criteria.isLocked !== undefined && { isLocked: criteria.isLocked }),
        ...(criteria.idDe && criteria.idDe.trim() && { idStart: criteria.idDe }),
        ...(criteria.idA && criteria.idA.trim() && { idEnd: criteria.idA })
      }
    };

    return this.http.post<any>(`${this.apiUrl}/getAllByCriteria`, request).pipe(
      map(response => {
        if (!response || (!response.items && !response.item)) {
          return { content: [], totalElements: 0, totalPages: 0, size: criteria.size || 10, number: criteria.page || 0 };
        }
        const items = response.items || (response.item ? [response.item] : []);
        const totalElements = response.totalCount || response.count || items.length;
        const pageSize = criteria.size || 10;
        return { content: items, totalElements, totalPages: Math.ceil(totalElements / pageSize), size: pageSize, number: criteria.page || 0 };
      }),
      catchError(error => { console.error('Erreur formVersion:', error); return throwError(() => error); })
    );
  }

  create(item: FormVersion): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { user: 1, datas: [item] });
  }

  update(item: FormVersion): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: 1, datas: [item] });
  }

  delete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { user: 1, datas: [{ id }] });
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: 1, datas: [{ id, isDeleted: false }] });
  }

  /**
   * Custom actions: fork a locked version, duplicate a question for a version
   */
  custom(action: string, formVersionId: number, questionId?: number): Observable<any> {
    const data: any = { action, id: formVersionId };
    if (questionId) { data.questionId = questionId; }
    return this.http.post(`${this.apiUrl}/custom`, { user: 1, datas: [data] });
  }
}
