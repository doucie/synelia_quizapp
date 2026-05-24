import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PERMISSION_CATEGORIES, PermissionCategory, PermissionOverrideAccessType, getSystemRoleBadgeClass, getSystemRoleLabel, normalizeSystemRole } from '../../../core/constants/permissions.constants';
import { PermissionAdminService, PermissionAdminUser, PermissionBusinessGroupOption, PermissionUserGroupMembership } from '../../../core/services/permission-admin.service';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../shared/filter-select/filter-select';

@Component({
  selector: 'app-user-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterSelectComponent, FilterSelectOptionDirective],
  templateUrl: './user-permissions.html',
  styleUrl: './user-permissions.scss'
})
export class UserPermissionsComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private permissionAdminService = inject(PermissionAdminService);

  // State
  users = signal<PermissionAdminUser[]>([]);
  selectedUser = signal<PermissionAdminUser | null>(null);
  userOverrides = signal<Map<string, PermissionOverrideAccessType>>(new Map());
  userGroups = signal<PermissionUserGroupMembership[]>([]);
  isLoadingUsers = signal(false);
  isLoadingDetail = signal(false);
  searchQuery = signal('');
  savingKeys = signal<Set<string>>(new Set());

  editTab = signal<'groups' | 'overrides'>('overrides');
  categories: PermissionCategory[] = PERMISSION_CATEGORIES;

  // Admin base permissions — loaded dynamically
  adminBasePermissions = signal<Set<string>>(new Set());

  // Available groups for adding
  availableGroups = signal<PermissionBusinessGroupOption[]>([]);
  addGroupId = signal<number | null>(null);

  isSuperAdmin = computed(() => {
    return normalizeSystemRole(this.selectedUser()?.userRole) === 'SUPER_ADMIN';
  });

  isAdmin = computed(() => {
    return normalizeSystemRole(this.selectedUser()?.userRole) === 'ADMIN';
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
    this.permissionAdminService.getPermissionUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.isLoadingUsers.set(false);
        },
        error: () => this.isLoadingUsers.set(false)
      });
  }

  selectUser(user: PermissionAdminUser): void {
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
    this.permissionAdminService.getUserOverrideMap(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (map) => {
          this.userOverrides.set(map);
          this.isLoadingDetail.set(false);
        },
        error: () => this.isLoadingDetail.set(false)
      });

    // Load user groups
    this.permissionAdminService.getUserGroupMemberships(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (memberships) => {
          this.userGroups.set(memberships);
        }
      });
  }

  loadAdminBasePermissions(): void {
    this.permissionAdminService.getPermissionKeysByRole('ADMIN')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (perms) => {
          this.adminBasePermissions.set(perms);
        }
      });
  }

  loadAvailableGroups(): void {
    this.permissionAdminService.getAvailableBusinessGroups()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (groups) => {
          this.availableGroups.set(groups);
        }
      });
  }

  getOverrideState(functionality: string): 'default' | PermissionOverrideAccessType {
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
    let next: 'default' | PermissionOverrideAccessType;

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

  setOverride(functionality: string, value: 'default' | PermissionOverrideAccessType): void {
    if (this.isSuperAdmin()) return;
    if (value === 'DENY' && this.isDenyDisabled(functionality)) return;
    this.applyOverride(functionality, value);
  }

  private applyOverride(functionality: string, value: 'default' | PermissionOverrideAccessType): void {
    const userId = this.selectedUser()?.id;
    if (!userId) return;

    const saving = new Set(this.savingKeys());
    saving.add(functionality);
    this.savingKeys.set(saving);

    if (value === 'default') {
      this.permissionAdminService.clearUserOverride(userId, functionality)
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
      this.permissionAdminService.setUserOverride(userId, functionality, value)
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

    this.permissionAdminService.assignUserToBusinessGroup(userId, groupId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.addGroupId.set(null);
          this.loadUserDetail(userId);
        }
      });
  }

  removeUserFromGroup(membership: PermissionUserGroupMembership): void {
    const userId = this.selectedUser()?.id;
    if (!userId || !membership.businessGroupId) return;

    if (!confirm(`Retirer cet utilisateur du groupe "${membership.groupName}" ?`)) return;

    this.permissionAdminService.removeUserFromBusinessGroup(userId, membership.businessGroupId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadUserDetail(userId)
      });
  }

  getRoleBadgeClass(): string {
    return getSystemRoleBadgeClass(this.selectedUser()?.userRole);
  }

  getRoleLabel(): string {
    return getSystemRoleLabel(this.selectedUser()?.userRole);
  }

  getUserCardRoleBadgeClass(user: PermissionAdminUser): string {
    return getSystemRoleBadgeClass(user.userRole);
  }

  getUserCardRoleLabel(user: PermissionAdminUser): string {
    return getSystemRoleLabel(user.userRole);
  }
}
