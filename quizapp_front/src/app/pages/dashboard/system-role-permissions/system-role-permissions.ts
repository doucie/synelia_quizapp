import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FilterCheckboxComponent } from '../../../shared/filter-checkbox/filter-checkbox';
import { DisplayPermissionCategory, PermissionGroup, buildDisplayPermissionCategories, getPermissionActionLabel } from '../../../core/constants/permissions.constants';
import { PermissionAdminService } from '../../../core/services/permission-admin.service';

type RoleTab = 'ADMIN' | 'RECRUITER';

@Component({
  selector: 'app-system-role-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent],
  templateUrl: './system-role-permissions.html',
  styleUrls: ['./system-role-permissions.scss']
})
export class SystemRolePermissionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private permissionAdminService = inject(PermissionAdminService);
  readonly getPermissionActionLabel = getPermissionActionLabel;

  activeTab = signal<RoleTab>('ADMIN');
  isLoading = signal(false);
  saving = signal(false);
  categories: DisplayPermissionCategory[] = buildDisplayPermissionCategories();

  // Permissions par rôle : Map<functionality, boolean>
  adminPermissions = signal<Set<string>>(new Set());
  recruiterPermissions = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.refreshPermissions();
  }

  refreshPermissions(): void {
    this.loadPermissions('ADMIN');
    this.loadPermissions('RECRUITER');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setTab(tab: RoleTab): void {
    this.activeTab.set(tab);
  }

  isChecked(functionality: string): boolean {
    const perms = this.activeTab() === 'ADMIN'
      ? this.adminPermissions()
      : this.recruiterPermissions();
    return perms.has(functionality);
  }

  countActiveInCategory(category: { permissions: { key: string }[] }): number {
    const perms = this.activeTab() === 'ADMIN'
      ? this.adminPermissions()
      : this.recruiterPermissions();
    return category.permissions.filter(p => perms.has(p.key)).length;
  }

  countActiveInGroup(group: PermissionGroup): number {
    const perms = this.activeTab() === 'ADMIN'
      ? this.adminPermissions()
      : this.recruiterPermissions();
    return group.permissions.filter(p => perms.has(p.key)).length;
  }

  togglePermission(functionality: string): void {
    const tab = this.activeTab();
    const permsSignal = tab === 'ADMIN' ? this.adminPermissions : this.recruiterPermissions;
    const current = new Set(permsSignal());

    if (current.has(functionality)) {
      this.removePermission(tab, functionality, current, permsSignal);
    } else {
      this.addPermission(tab, functionality, current, permsSignal);
    }
  }

  private loadPermissions(role: string): void {
    this.isLoading.set(true);
    this.permissionAdminService.getPermissionKeysByRole(role)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (keys) => {
        if (role === 'ADMIN') {
          this.adminPermissions.set(keys);
        } else {
          this.recruiterPermissions.set(keys);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  private addPermission(
    role: string, functionality: string,
    current: Set<string>, permsSignal: typeof this.adminPermissions
  ): void {
    this.saving.set(true);
    this.permissionAdminService.addPermissionToRole(role, functionality)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (res) => {
        if (!res.hasError) {
          current.add(functionality);
          permsSignal.set(new Set(current));
        }
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  private removePermission(
    role: string, functionality: string,
    current: Set<string>, permsSignal: typeof this.adminPermissions
  ): void {
    this.saving.set(true);
    this.permissionAdminService.removePermissionFromRole(role, functionality)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (res) => {
        if (!res.hasError) {
          current.delete(functionality);
          permsSignal.set(new Set(current));
        }
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

}
