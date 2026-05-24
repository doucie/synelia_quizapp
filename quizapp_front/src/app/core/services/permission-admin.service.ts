import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { PermissionOverrideAccessType, buildUserOverrideMap } from '../constants/permissions.constants';
import { SpringBootRequest, SpringBootResponse } from '../models/spring-boot.interfaces';
import { AuthService } from './auth/auth.service';
import { UserService } from './user.service';

interface SystemRolePermissionRecord {
  id?: number;
  systemRole?: string;
  functionality?: string;
}

interface UserPermissionOverrideRecord {
  id?: number;
  userId?: number;
  functionality?: string;
  isAllowed?: boolean;
  accessType?: PermissionOverrideAccessType;
}

export interface PermissionUserGroupMembership {
  id?: number;
  userId?: number;
  businessGroupId?: number;
  groupName?: string;
}

export interface PermissionBusinessGroupOption {
  id: number;
  groupName: string;
}

export interface PermissionAdminUser {
  id?: number;
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
  userRole?: string;
}

export interface PermissionBusinessGroupMember {
  id?: number;
  userId?: number;
  businessGroupId?: number;
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
  isModerator?: boolean;
}

interface BusinessGroupRecord {
  id?: number;
  groupName?: string;
}

@Injectable({ providedIn: 'root' })
export class PermissionAdminService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  getPermissionUsers(): Observable<PermissionAdminUser[]> {
    return this.userService.getByCriteria({ page: 0, size: 9999, isDeleted: false }).pipe(
      map(response => (response.content || []).map(user => ({
        id: user.id,
        userFirstName: user.prenom || user.firstName || '',
        userLastName: user.nom || user.lastName || '',
        userEmail: user.email || '',
        userRole: user.role || user.userRole || ''
      })))
    );
  }

  getPermissionKeysByRole(systemRole: string): Observable<Set<string>> {
    return this.withCurrentUser(userId =>
      this.http.post<SpringBootResponse<SystemRolePermissionRecord>>('/systemRolePermission/getByRole', {
        data: { systemRole },
        user: userId
      } satisfies SpringBootRequest<{ systemRole: string }>).pipe(
        map(response => new Set((response.items || []).map(item => item.functionality || '').filter(Boolean)))
      )
    );
  }

  addPermissionToRole(systemRole: string, functionality: string): Observable<SpringBootResponse<SystemRolePermissionRecord>> {
    return this.withCurrentUser(userId =>
      this.http.post<SpringBootResponse<SystemRolePermissionRecord>>('/systemRolePermission/add', {
        data: { systemRole, functionality },
        user: userId
      } satisfies SpringBootRequest<{ systemRole: string; functionality: string }>)
    );
  }

  removePermissionFromRole(systemRole: string, functionality: string): Observable<SpringBootResponse<SystemRolePermissionRecord>> {
    return this.withCurrentUser(userId =>
      this.http.post<SpringBootResponse<SystemRolePermissionRecord>>('/systemRolePermission/remove', {
        data: { systemRole, functionality },
        user: userId
      } satisfies SpringBootRequest<{ systemRole: string; functionality: string }>)
    );
  }

  getUserOverrideMap(userId: number): Observable<Map<string, PermissionOverrideAccessType>> {
    return this.withCurrentUser(currentUserId =>
      this.http.post<SpringBootResponse<UserPermissionOverrideRecord>>('/userPermissionOverride/getByUser', {
        data: { userId },
        user: currentUserId
      } satisfies SpringBootRequest<{ userId: number }>).pipe(
        map(response => buildUserOverrideMap(response.items || []))
      )
    );
  }

  setUserOverride(
    userId: number,
    functionality: string,
    accessType: PermissionOverrideAccessType
  ): Observable<SpringBootResponse<unknown>> {
    return this.withCurrentUser(currentUserId =>
      this.http.post<SpringBootResponse<unknown>>('/userPermissionOverride/setOverride', {
        data: { userId, functionality, isAllowed: accessType === 'GRANT' },
        user: currentUserId
      } satisfies SpringBootRequest<{ userId: number; functionality: string; isAllowed: boolean }>)
    );
  }

  clearUserOverride(userId: number, functionality: string): Observable<SpringBootResponse<unknown>> {
    return this.withCurrentUser(currentUserId =>
      this.http.post<SpringBootResponse<unknown>>('/userPermissionOverride/removeOverride', {
        data: { userId, functionality },
        user: currentUserId
      } satisfies SpringBootRequest<{ userId: number; functionality: string }>)
    );
  }

  getUserGroupMemberships(userId: number): Observable<PermissionUserGroupMembership[]> {
    return this.withCurrentUser(currentUserId =>
      this.http.post<SpringBootResponse<PermissionUserGroupMembership>>('/userBusinessGroup/getByUser', {
        data: { userId },
        user: currentUserId
      } satisfies SpringBootRequest<{ userId: number }>).pipe(
        map(response => response.items || [])
      )
    );
  }

  getAvailableBusinessGroups(): Observable<PermissionBusinessGroupOption[]> {
    return this.withCurrentUser(currentUserId =>
      this.http.post<SpringBootResponse<BusinessGroupRecord>>('/businessGroup/getByCriteria', {
        data: {},
        user: currentUserId
      } satisfies SpringBootRequest<Record<string, never>>).pipe(
        map(response => (response.items || [])
          .filter((group): group is Required<Pick<BusinessGroupRecord, 'id' | 'groupName'>> => !!group.id && !!group.groupName)
          .map(group => ({ id: group.id, groupName: group.groupName })))
      )
    );
  }

  getBusinessGroupMembers(businessGroupId: number): Observable<PermissionBusinessGroupMember[]> {
    return this.withCurrentUser(currentUserId =>
      this.http.post<SpringBootResponse<PermissionBusinessGroupMember>>('/businessGroup/getUsersInGroup', {
        data: { businessGroupId },
        user: currentUserId
      } satisfies SpringBootRequest<{ businessGroupId: number }>).pipe(
        map(response => response.items || [])
      )
    );
  }

  assignUserToBusinessGroup(userId: number, businessGroupId: number): Observable<SpringBootResponse<unknown>> {
    return this.withCurrentUser(currentUserId =>
      this.http.post<SpringBootResponse<unknown>>('/businessGroup/assignUser', {
        data: { userId, businessGroupId },
        user: currentUserId
      } satisfies SpringBootRequest<{ userId: number; businessGroupId: number }>)
    );
  }

  removeUserFromBusinessGroup(userId: number, businessGroupId: number): Observable<SpringBootResponse<unknown>> {
    return this.withCurrentUser(currentUserId =>
      this.http.post<SpringBootResponse<unknown>>('/businessGroup/removeUser', {
        data: { userId, businessGroupId },
        user: currentUserId
      } satisfies SpringBootRequest<{ userId: number; businessGroupId: number }>)
    );
  }

  private withCurrentUser<T>(requestFactory: (userId: number) => Observable<T>): Observable<T> {
    const userId = Number(this.authService.getCurrentUserId());

    if (!userId) {
      return throwError(() => new Error('Contexte utilisateur manquant. Les actions de permissions nécessitent une session authentifiée.'));
    }

    return requestFactory(userId);
  }
}