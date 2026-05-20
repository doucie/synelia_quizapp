import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EntityPermission } from '../models/permission.interfaces';

export interface EntityPermissionResponse {
  status: { code: string; message: string };
  hasError: boolean;
  count: number;
  httpCode: number;
  items: EntityPermission[];
}

/**
 * Service for entity-level permissions (campaign, interview, etc.).
 * Replaces the legacy campaign/interview permission tables.
 */
@Injectable({
  providedIn: 'root'
})
export class EntityPermissionService {
  private apiUrl = `${environment.apiUrl}/entityPermission`;

  constructor(private http: HttpClient) {}

  /** Get all permissions for a given entity (e.g. CAMPAIGN / INTERVIEW) */
  getForEntity(entityType: string, entityId: number): Observable<EntityPermissionResponse> {
    return this.http.post<EntityPermissionResponse>(
      `${this.apiUrl}/getForEntity`,
      { user: 1, data: { entityType, entityId: entityId.toString() } }
    ).pipe(
      map(response => ({
        ...response,
        items: (response.items || []).map(permission => this.normalizePermission(permission))
      }))
    );
  }

  /** Grant a permission on an entity to a user */
  grant(userId: number, entityType: string, entityId: number, permissionKey: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/grant`, {
      user: 1,
      data: { userId: userId.toString(), entityType, entityId: entityId.toString(), permissionKey }
    });
  }

  /** Revoke a permission on an entity from a user */
  revoke(userId: number, entityType: string, entityId: number, permissionKey: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/revoke`, {
      user: 1,
      data: { userId: userId.toString(), entityType, entityId: entityId.toString(), permissionKey }
    });
  }

  /** Get users who have a specific permission on an entity */
  getUsersWithPermission(entityType: string, entityId: number, permissionKey: string): Observable<EntityPermission[]> {
    return this.getForEntity(entityType, entityId).pipe(
      map(resp => (resp.items || []).filter(p => p.permissionKey === permissionKey && p.granted))
    );
  }

  /** Get evaluators for a campaign (users with EVALUATE on CAMPAIGN entity) */
  getCampaignEvaluators(campaignId: number): Observable<EntityPermission[]> {
    return this.getUsersWithPermission('CAMPAIGN', campaignId, 'EVALUATE');
  }

  /** Get test correctors for a campaign (users with CORRECT_TEST on CAMPAIGN entity) */
  getCampaignTestCorrectors(campaignId: number): Observable<EntityPermission[]> {
    return this.getUsersWithPermission('CAMPAIGN', campaignId, 'CORRECT_TEST');
  }

  /** Get evaluators for an interview (users with VIEW_EVALUATIONS on INTERVIEW entity) */
  getInterviewEvaluators(interviewId: number): Observable<EntityPermission[]> {
    return this.getUsersWithPermission('INTERVIEW', interviewId, 'VIEW_EVALUATIONS');
  }

  /** Bulk grant permissions for multiple users on an entity */
  grantBulk(userIds: number[], entityType: string, entityId: number, permissionKeys: string[]): Observable<any[]> {
    const requests: Observable<any>[] = [];
    for (const userId of userIds) {
      for (const key of permissionKeys) {
        requests.push(this.grant(userId, entityType, entityId, key));
      }
    }
    // Execute sequentially to avoid overwhelming the backend
    return new Observable(subscriber => {
      let idx = 0;
      const results: any[] = [];
      const next = () => {
        if (idx >= requests.length) {
          subscriber.next(results);
          subscriber.complete();
          return;
        }
        requests[idx++].subscribe({
          next: r => { results.push(r); next(); },
          error: err => subscriber.error(err)
        });
      };
      next();
    });
  }

  private normalizePermission(permission: EntityPermission): EntityPermission {
    return {
      ...permission,
      userId: this.toOptionalNumber((permission as any).userId ?? (permission as any).user_id),
      businessGroupId: this.toOptionalNumber((permission as any).businessGroupId ?? (permission as any).business_group_id),
      entityId: this.toOptionalNumber((permission as any).entityId ?? (permission as any).entity_id),
      systemRole: (permission as any).systemRole || (permission as any).system_role || undefined,
      granted: permission.granted ?? true
    };
  }

  private toOptionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? undefined : numericValue;
  }
}
