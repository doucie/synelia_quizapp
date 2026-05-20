import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface EntityPermissionItem {
  id?: number;
  entityType?: string;
  entityId?: number;
  permissionKey?: string;
  userId?: number;
  businessGroupId?: number;
  systemRole?: string;
  granted?: boolean;
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
}

export interface EntityPermissionCrudCriteria {
  entityType?: string;
  entityId?: number;
  permissionKey?: string;
  userId?: number;
  businessGroupId?: number;
  systemRole?: string;
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

export interface PagedEntityPermissionResponse {
  content: EntityPermissionItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class EntityPermissionCrudService {
  private apiUrl = `${environment.apiUrl}/entityPermission`;

  constructor(private http: HttpClient) {}

  private getCurrentUserId(): number | undefined {
    const user = localStorage.getItem('user');
    if (user) { try { return JSON.parse(user).id; } catch (e) { return undefined; } }
    return undefined;
  }

  getAllByCriteria(criteria: EntityPermissionCrudCriteria = {}): Observable<PagedEntityPermissionResponse> {
    const request = {
      user: this.getCurrentUserId()?.toString() || '1',
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : '',
        searchString: criteria.search_string || '',
        ...(criteria.entityType && { entityType: criteria.entityType }),
        ...(criteria.entityId && { entityId: criteria.entityId }),
        ...(criteria.permissionKey && { permissionKey: criteria.permissionKey }),
        ...(criteria.userId && { userId: criteria.userId }),
        ...(criteria.businessGroupId && { businessGroupId: criteria.businessGroupId }),
        ...(criteria.systemRole && { systemRole: criteria.systemRole }),
      }
    };
    return this.http.post<any>(`${this.apiUrl}/getByCriteria`, request).pipe(
      map(response => {
        const items = (response?.items || []).map((item: any) => this.normalizeItem(item));
        const total = response?.count || items.length;
        const pageSize = criteria.size || 10;
        return { content: items, totalElements: total, totalPages: Math.ceil(total / pageSize), size: pageSize, number: criteria.page || 0 };
      }),
      catchError(() => of({ content: [], totalElements: 0, totalPages: 0, size: criteria.size || 10, number: criteria.page || 0 }))
    );
  }

  create(item: EntityPermissionItem): Observable<any> {
    return this.http.post(`${this.apiUrl}/grant`, { user: this.getCurrentUserId(), data: this.prepareItemPayload(item) });
  }

  update(item: EntityPermissionItem): Observable<any> {
    return this.http.post(`${this.apiUrl}/grant`, { user: this.getCurrentUserId(), data: this.prepareItemPayload(item) });
  }

  delete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { user: this.getCurrentUserId(), data: { id } });
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/grant`, { user: this.getCurrentUserId(), data: { id, isDeleted: false } });
  }

  private normalizeItem(item: any): EntityPermissionItem {
    return {
      id: item.id,
      entityType: item.entityType || item.entity_type || undefined,
      entityId: this.toOptionalNumber(item.entityId ?? item.entity_id),
      permissionKey: item.permissionKey || item.permission_key || undefined,
      userId: this.toOptionalNumber(item.userId ?? item.user_id),
      businessGroupId: this.toOptionalNumber(item.businessGroupId ?? item.business_group_id),
      systemRole: item.systemRole || item.system_role || undefined,
      granted: item.granted ?? true,
      userFirstName: item.userFirstName || item.user_first_name || undefined,
      userLastName: item.userLastName || item.user_last_name || undefined,
      userEmail: item.userEmail || item.user_email || undefined,
      userName: item.userName || item.user_name || undefined,
      userRole: item.userRole || item.user_role || undefined,
      createdAt: item.createdAt || item.created_at || undefined,
      createdBy: this.toOptionalNumber(item.createdBy ?? item.created_by),
      updatedAt: item.updatedAt || item.updated_at || undefined,
      updatedBy: this.toOptionalNumber(item.updatedBy ?? item.updated_by),
      isDeleted: item.isDeleted ?? item.is_deleted ?? false
    };
  }

  private prepareItemPayload(item: EntityPermissionItem): EntityPermissionItem {
    const payload: EntityPermissionItem = { ...item };

    if (!payload.systemRole?.trim()) {
      delete payload.systemRole;
    }

    return payload;
  }

  private toOptionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? undefined : numericValue;
  }
}
