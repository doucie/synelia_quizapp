import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface GroupChangeRequest {
  id?: number;
  userId?: number;
  targetGroupId?: number;
  reason?: string;
  status?: string;
  requestedAt?: string;
  processedAt?: string;
  processedBy?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  // Transient display fields
  userName?: string;
  userEmail?: string;
  targetGroupName?: string;
}

export interface GroupChangeRequestCriteria {
  userId?: number;
  targetGroupId?: number;
  status?: string;
  page?: number;
  size?: number;
  isDeleted?: boolean;
}

export interface PagedGroupChangeRequestResponse {
  content: GroupChangeRequest[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class GroupChangeRequestService {
  private apiUrl = `${environment.apiUrl}/groupChangeRequest`;

  constructor(private http: HttpClient) {}

  private getCurrentUserId(): number | undefined {
    const user = localStorage.getItem('user');
    if (user) { try { return JSON.parse(user).id; } catch (e) { return undefined; } }
    return undefined;
  }

  getAllByCriteria(criteria: GroupChangeRequestCriteria = {}): Observable<PagedGroupChangeRequestResponse> {
    const request = {
      user: this.getCurrentUserId()?.toString() || '1',
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : 'false',
        ...(criteria.userId && { userId: criteria.userId }),
        ...(criteria.targetGroupId && { targetGroupId: criteria.targetGroupId }),
        ...(criteria.status && { status: criteria.status }),
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

  create(item: GroupChangeRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { user: this.getCurrentUserId(), datas: [item] });
  }

  update(item: GroupChangeRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: this.getCurrentUserId(), datas: [item] });
  }

  delete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { user: this.getCurrentUserId(), datas: [{ id }] });
  }

  approve(id: number): Observable<any> {
    return this.update({ id, status: 'APPROVED' });
  }

  reject(id: number): Observable<any> {
    return this.update({ id, status: 'REJECTED' });
  }
}
