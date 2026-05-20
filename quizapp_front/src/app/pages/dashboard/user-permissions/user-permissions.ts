import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PERMISSION_CATEGORIES, PermissionCategory } from '../../../core/constants/permissions.constants';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../shared/filter-select/filter-select';

interface UserItem {
  id?: number;
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
  userRole?: string;
}

interface UserOverride {
  id?: number;
  userId?: number;
  functionality?: string;
  isAllowed?: boolean;
  accessType?: 'GRANT' | 'DENY';
}

interface UserGroupMembership {
  id?: number;
  userId?: number;
  businessGroupId?: number;
  groupName?: string;
}

interface SpringBootRequest<T> {
  data?: T;
  user?: number;
}

interface SpringBootResponse<T> {
  hasError: boolean;
  items?: T[];
  item?: T;
  status?: { message?: string };
}

@Component({
  selector: 'app-user-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterSelectComponent, FilterSelectOptionDirective],
  templateUrl: './user-permissions.html',
  styleUrl: './user-permissions.scss'
})
export class UserPermissionsComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private apiUrl = environment.apiUrl;

  // State
  users = signal<UserItem[]>([]);
  selectedUser = signal<UserItem | null>(null);
  userOverrides = signal<Map<string, 'GRANT' | 'DENY'>>(new Map());
  userGroups = signal<UserGroupMembership[]>([]);
  isLoadingUsers = signal(false);
  isLoadingDetail = signal(false);
  searchQuery = signal('');
  savingKeys = signal<Set<string>>(new Set());

  editTab = signal<'groups' | 'overrides'>('overrides');
  categories: PermissionCategory[] = PERMISSION_CATEGORIES;

  // Admin base permissions — loaded dynamically
  adminBasePermissions = signal<Set<string>>(new Set());

  // Available groups for adding
  availableGroups = signal<{ id: number; groupName: string }[]>([]);
  addGroupId = signal<number | null>(null);

  isSuperAdmin = computed(() => {
    return this.normalizeSystemRole(this.selectedUser()?.userRole) === 'SUPER_ADMIN';
  });

  isAdmin = computed(() => {
    return this.normalizeSystemRole(this.selectedUser()?.userRole) === 'ADMIN';
  });

  deniedFunctionalities = computed(() =>
    Array.from(this.userOverrides().entries())
      .filter(([, accessType]) => accessType === 'DENY')
      .map(([functionality]) => functionality)
  );

  assignedGroupNames = computed(() =>
    this.userGroups()
      .map(group => group.groupName?.trim())
      .filter((groupName): groupName is string => !!groupName)
  );

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.users();
    return this.users().filter(u =>
      (u.userFirstName?.toLowerCase().includes(query)) ||
      (u.userLastName?.toLowerCase().includes(query)) ||
      (u.userEmail?.toLowerCase().includes(query))
    );
  });

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadAdminBasePermissions();
    this.loadAvailableGroups();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoadingUsers.set(true);
    const request: SpringBootRequest<any> = { data: {} };
    this.http.post<SpringBootResponse<UserItem>>(`${this.apiUrl}/userManager/getAllByCriteria`, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.users.set(res.items || []);
          this.isLoadingUsers.set(false);
        },
        error: () => this.isLoadingUsers.set(false)
      });
  }

  selectUser(user: UserItem): void {
    this.selectedUser.set(user);
    this.editTab.set('overrides');
    this.loadUserDetail(user.id!);
  }

  backToList(): void {
    this.selectedUser.set(null);
    this.userOverrides.set(new Map());
    this.userGroups.set([]);
  }

  loadUserDetail(userId: number): void {
    this.isLoadingDetail.set(true);

    // Load overrides
    const overrideReq: SpringBootRequest<any> = { data: { userId } };
    this.http.post<SpringBootResponse<UserOverride>>(`${this.apiUrl}/userPermissionOverride/getByUser`, overrideReq)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const map = new Map<string, 'GRANT' | 'DENY'>();
          (res.items || []).forEach(o => {
            const accessType = o.accessType || this.toAccessType(o.isAllowed);
            if (o.functionality && accessType) {
              map.set(o.functionality, accessType);
            }
          });
          this.userOverrides.set(map);
          this.isLoadingDetail.set(false);
        },
        error: () => this.isLoadingDetail.set(false)
      });

    // Load user groups
    const groupReq: SpringBootRequest<any> = { data: { userId } };
    this.http.post<SpringBootResponse<UserGroupMembership>>(`${this.apiUrl}/userBusinessGroup/getByUser`, groupReq)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.userGroups.set(res.items || []);
        }
      });
  }

  loadAdminBasePermissions(): void {
    const request: SpringBootRequest<any> = { data: { systemRole: 'ADMIN' } };
    this.http.post<SpringBootResponse<any>>(`${this.apiUrl}/systemRolePermission/getByRole`, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const perms = new Set<string>();
          (res.items || []).forEach((p: any) => {
            if (p.functionality) perms.add(p.functionality);
          });
          this.adminBasePermissions.set(perms);
        }
      });
  }

  loadAvailableGroups(): void {
    const request: SpringBootRequest<any> = { data: {} };
    this.http.post<SpringBootResponse<any>>(`${this.apiUrl}/businessGroup/getByCriteria`, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.availableGroups.set((res.items || []).map((g: any) => ({ id: g.id, groupName: g.groupName })));
        }
      });
  }

  getOverrideState(functionality: string): 'default' | 'GRANT' | 'DENY' {
    return this.userOverrides().get(functionality) || 'default';
  }

  getOverrideExplanation(functionality: string): string | null {
    if (this.getOverrideState(functionality) !== 'DENY') {
      return null;
    }

    return 'DENY individuel actif: ce droit est retiré a cet utilisateur, meme si son role ou un groupe metier le lui accorde.';
  }

  isDenyDisabled(functionality: string): boolean {
    return this.isAdmin() && this.adminBasePermissions().has(functionality);
  }

  cycleOverride(functionality: string): void {
    if (this.isSuperAdmin()) return;

    const current = this.getOverrideState(functionality);
    let next: 'default' | 'GRANT' | 'DENY';

    if (current === 'default') {
      next = 'GRANT';
    } else if (current === 'GRANT') {
      if (this.isDenyDisabled(functionality)) {
        next = 'default';
      } else {
        next = 'DENY';
      }
    } else {
      next = 'default';
    }

    this.applyOverride(functionality, next);
  }

  setOverride(functionality: string, value: 'default' | 'GRANT' | 'DENY'): void {
    if (this.isSuperAdmin()) return;
    if (value === 'DENY' && this.isDenyDisabled(functionality)) return;
    this.applyOverride(functionality, value);
  }

  private applyOverride(functionality: string, value: 'default' | 'GRANT' | 'DENY'): void {
    const userId = this.selectedUser()?.id;
    if (!userId) return;

    const saving = new Set(this.savingKeys());
    saving.add(functionality);
    this.savingKeys.set(saving);

    if (value === 'default') {
      // Remove the override
      const request: SpringBootRequest<any> = { data: { userId, functionality } };
      this.http.post<SpringBootResponse<any>>(`${this.apiUrl}/userPermissionOverride/removeOverride`, request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            const map = new Map(this.userOverrides());
            map.delete(functionality);
            this.userOverrides.set(map);
            this.removeSaving(functionality);
          },
          error: () => this.removeSaving(functionality)
        });
    } else {
      // Set GRANT or DENY
      const request: SpringBootRequest<any> = { data: { userId, functionality, isAllowed: value === 'GRANT' } };
      this.http.post<SpringBootResponse<any>>(`${this.apiUrl}/userPermissionOverride/setOverride`, request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            const map = new Map(this.userOverrides());
            map.set(functionality, value);
            this.userOverrides.set(map);
            this.removeSaving(functionality);
          },
          error: () => this.removeSaving(functionality)
        });
    }
  }

  private removeSaving(key: string): void {
    const saving = new Set(this.savingKeys());
    saving.delete(key);
    this.savingKeys.set(saving);
  }

  isSaving(key: string): boolean {
    return this.savingKeys().has(key);
  }

  // ── Groups ────────────────────

  addUserToGroup(): void {
    const userId = this.selectedUser()?.id;
    const groupId = this.addGroupId();
    if (!userId || !groupId) return;

    const request: SpringBootRequest<any> = { data: { userId, businessGroupId: groupId } };
    this.http.post<SpringBootResponse<any>>(`${this.apiUrl}/businessGroup/assignUser`, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.addGroupId.set(null);
          this.loadUserDetail(userId);
        }
      });
  }

  removeUserFromGroup(membership: UserGroupMembership): void {
    const userId = this.selectedUser()?.id;
    if (!userId || !membership.businessGroupId) return;

    if (!confirm(`Retirer cet utilisateur du groupe "${membership.groupName}" ?`)) return;

    const request: SpringBootRequest<any> = { data: { userId, businessGroupId: membership.businessGroupId } };
    this.http.post<SpringBootResponse<any>>(`${this.apiUrl}/businessGroup/removeUser`, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadUserDetail(userId)
      });
  }

  getRoleBadgeClass(): string {
    const role = this.normalizeSystemRole(this.selectedUser()?.userRole);
    if (role === 'SUPER_ADMIN') return 'badge-super';
    if (role === 'ADMIN') return 'badge-admin';
    return 'badge-user';
  }

  getRoleLabel(): string {
    const role = this.normalizeSystemRole(this.selectedUser()?.userRole);
    if (role === 'SUPER_ADMIN') return 'Super Admin';
    if (role === 'ADMIN') return 'Administrateur';
    if (role === 'RECRUITER') return 'Recruteur';
    if (role === 'CANDIDATE') return 'Candidat';
    return 'Utilisateur';
  }

  getUserCardRoleBadgeClass(user: UserItem): string {
    const role = this.normalizeSystemRole(user.userRole);
    if (role === 'SUPER_ADMIN') return 'badge-super';
    if (role === 'ADMIN') return 'badge-admin';
    return 'badge-user';
  }

  getUserCardRoleLabel(user: UserItem): string {
    const role = this.normalizeSystemRole(user.userRole);
    if (role === 'SUPER_ADMIN') return 'Super Admin';
    if (role === 'ADMIN') return 'Administrateur';
    if (role === 'RECRUITER') return 'Recruteur';
    if (role === 'CANDIDATE') return 'Candidat';
    return user.userRole || 'Utilisateur';
  }

  private toAccessType(isAllowed?: boolean): 'GRANT' | 'DENY' | undefined {
    if (isAllowed === true) return 'GRANT';
    if (isAllowed === false) return 'DENY';
    return undefined;
  }

  private normalizeSystemRole(rawRole?: string | null): string {
    const normalizedRole = (rawRole || '').trim().toUpperCase();
    switch (normalizedRole) {
      case 'SUPER':
      case 'SUPER_ADMIN':
      case 'ROLE_SUPER':
      case 'ROLE_SUPER_ADMIN':
        return 'SUPER_ADMIN';
      case 'ADMIN':
      case 'ROLE_ADMIN':
        return 'ADMIN';
      case 'RECRUITER':
      case 'UTILISATEUR':
      case 'ROLE_RECRUITER':
      case 'ROLE_UTILISATEUR':
        return 'RECRUITER';
      case 'CANDIDATE':
      case 'ROLE_CANDIDATE':
        return 'CANDIDATE';
      default:
        return normalizedRole;
    }
  }
}
