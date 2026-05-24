import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UserPermissionOverride {
  id?: number;
  userId?: number;
  functionality?: string;
  isAllowed?: boolean;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
}

export interface UserPermissionOverrideMutationPayload {
  id?: number;
  userId?: number;
  functionality?: string;
  isAllowed?: boolean;
}

export interface UserPermissionOverrideCriteria {
  userId?: number;
  functionality?: string;
  isAllowed?: boolean;
  page?: number;
  size?: number;
  isDeleted?: boolean;
  idDe?: string;
  idA?: string;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
  search_string?: string;
}

export interface PagedUserPermissionOverrideResponse {
  content: UserPermissionOverride[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class UserPermissionOverrideCrudService {
  private apiUrl = `${environment.apiUrl}/userPermissionOverride`;

  constructor(private http: HttpClient) {}

  private getCurrentUserId(): number | undefined {
    const user = localStorage.getItem('user');
    if (user) { try { return JSON.parse(user).id; } catch (e) { return undefined; } }
    return undefined;
  }

  getAllByCriteria(criteria: UserPermissionOverrideCriteria = {}): Observable<PagedUserPermissionOverrideResponse> {
    const request = {
      user: this.getCurrentUserId()?.toString() || '1',
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        searchString: criteria.search_string || '',
        ...(criteria.userId && { userId: criteria.userId }),
        ...(criteria.functionality && { functionality: criteria.functionality }),
      }
    };
    return this.http.post<any>(`${this.apiUrl}/getByCriteria`, request).pipe(
      map(response => {
        const items = response?.items || [];
        const total = response?.count || items.length;
        const pageSize = criteria.size || 10;
        return { content: items, totalElements: total, totalPages: Math.ceil(total / pageSize), size: pageSize, number: criteria.page || 0 };
      }),
      catchError(() => of({ content: [], totalElements: 0, totalPages: 0, size: criteria.size || 10, number: criteria.page || 0 }))
    );
  }

  create(item: UserPermissionOverrideMutationPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/setOverride`, { user: this.getCurrentUserId(), data: item });
  }

  update(item: UserPermissionOverrideMutationPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/setOverride`, { user: this.getCurrentUserId(), data: item });
  }

  delete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { user: this.getCurrentUserId(), data: { id } });
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/setOverride`, { user: this.getCurrentUserId(), data: { id } });
  }
}
