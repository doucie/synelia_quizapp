import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UserBusinessGroup {
  id?: number;
  userId?: number;
  businessGroupId?: number;
  isModerator?: boolean;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
}

export interface UserBusinessGroupMutationPayload {
  id?: number;
  userId?: number;
  businessGroupId?: number;
  isModerator?: boolean;
  isDeleted?: boolean;
}

export interface UserBusinessGroupCriteria {
  userId?: number;
  businessGroupId?: number;
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

export interface PagedUserBusinessGroupResponse {
  content: UserBusinessGroup[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class UserBusinessGroupService {
  private apiUrl = `${environment.apiUrl}/userBusinessGroup`;

  constructor(private http: HttpClient) {}

  private getCurrentUserId(): number | undefined {
    const user = localStorage.getItem('user');
    if (user) { try { return JSON.parse(user).id; } catch (e) { return undefined; } }
    return undefined;
  }

  getAllByCriteria(criteria: UserBusinessGroupCriteria = {}): Observable<PagedUserBusinessGroupResponse> {
    const request = {
      user: this.getCurrentUserId()?.toString() || '1',
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : '',
        searchString: criteria.search_string || '',
        ...(criteria.userId && { userId: criteria.userId }),
        ...(criteria.businessGroupId && { businessGroupId: criteria.businessGroupId }),
        ...(criteria.idDe && { idStart: criteria.idDe }),
        ...(criteria.idA && { idEnd: criteria.idA }),
        ...(criteria.dateCreationDe && { dateCreationDe: criteria.dateCreationDe }),
        ...(criteria.dateCreationA && { dateCreationA: criteria.dateCreationA }),
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

  create(item: UserBusinessGroupMutationPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { user: this.getCurrentUserId(), datas: [item] });
  }

  update(item: UserBusinessGroupMutationPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: this.getCurrentUserId(), datas: [item] });
  }

  delete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { user: this.getCurrentUserId(), datas: [{ id }] });
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: this.getCurrentUserId(), datas: [{ id, isDeleted: false }] });
  }
}
