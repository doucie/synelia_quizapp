import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Form {
  id?: number;
  formName?: string;
  formDesc?: string;
  isActive?: boolean;
  campaignId?: number;
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

export interface FormSearchCriteria {
  page?: number;
  size?: number;
  search_string?: string;
  idDe?: string;
  idA?: string;
  formName?: string;
  campaignId?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

export interface PagedFormResponse {
  content: Form[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class FormService {
  private apiUrl = `${environment.apiUrl}/form`;

  constructor(private http: HttpClient) {}

  getAllByCriteria(criteria: FormSearchCriteria = {}): Observable<PagedFormResponse> {
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
        ...(criteria.formName && { formName: criteria.formName }),
        ...(criteria.campaignId && { campaignId: criteria.campaignId }),
        ...(criteria.isActive !== undefined && { isActive: criteria.isActive }),
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
        const items = response.items || (response.item ? [response.item] : []);
        const totalElements = response.totalCount || response.count || items.length;
        const pageSize = criteria.size || 10;
        return { content: items, totalElements, totalPages: Math.ceil(totalElements / pageSize), size: pageSize, number: criteria.page || 0 };
      }),
      catchError(error => { console.error('Erreur form:', error); return throwError(() => error); })
    );
  }

  create(item: Form): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { user: 1, datas: [item] });
  }

  update(item: Form): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: 1, datas: [item] });
  }

  delete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { user: 1, datas: [{ id }] });
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: 1, datas: [{ id, isDeleted: false }] });
  }
}
