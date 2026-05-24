import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SystemRolePermission {
  id?: number;
  systemRole?: string;
  functionality?: string;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
}

export interface SystemRolePermissionMutationPayload {
  id?: number;
  systemRole?: string;
  functionality?: string;
}

export interface SystemRolePermissionCriteria {
  systemRole?: string;
  functionality?: string;
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

export interface PagedSystemRolePermissionResponse {
  content: SystemRolePermission[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class SystemRolePermissionCrudService {
  private apiUrl = `${environment.apiUrl}/systemRolePermission`;

  constructor(private http: HttpClient) {}

  private getCurrentUserId(): number | undefined {
    const user = localStorage.getItem('user');
    if (user) { try { return JSON.parse(user).id; } catch (e) { return undefined; } }
    return undefined;
  }

  getAllByCriteria(criteria: SystemRolePermissionCriteria = {}): Observable<PagedSystemRolePermissionResponse> {
    const request = {
      user: this.getCurrentUserId()?.toString() || '1',
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        searchString: criteria.search_string || '',
        ...(criteria.systemRole && { systemRole: criteria.systemRole }),
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

  create(item: SystemRolePermissionMutationPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/addPermission`, { user: this.getCurrentUserId(), data: item });
  }

  update(item: SystemRolePermissionMutationPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: this.getCurrentUserId(), data: item });
  }

  delete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { user: this.getCurrentUserId(), data: { id } });
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/addPermission`, { user: this.getCurrentUserId(), data: { id } });
  }
}
