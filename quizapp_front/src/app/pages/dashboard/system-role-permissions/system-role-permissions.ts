import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth/auth.service';
import { PERMISSION_CATEGORIES, PermissionCategory } from '../../../core/constants/permissions.constants';
import { SpringBootRequest, SpringBootResponse } from '../../../core/models/spring-boot.interfaces';

interface RolePermission {
  id?: number;
  systemRole?: string;
  functionality?: string;
}

type RoleTab = 'ADMIN' | 'UTILISATEUR';

@Component({
  selector: 'app-system-role-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-role-permissions.html',
  styleUrls: ['./system-role-permissions.scss']
})
export class SystemRolePermissionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeTab = signal<RoleTab>('ADMIN');
  isLoading = signal(false);
  saving = signal(false);
  categories = PERMISSION_CATEGORIES;

  // Permissions par rôle : Map<functionality, boolean>
  adminPermissions = signal<Set<string>>(new Set());
  utilisateurPermissions = signal<Set<string>>(new Set());

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPermissions('ADMIN');
    this.loadPermissions('UTILISATEUR');
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
      : this.utilisateurPermissions();
    return perms.has(functionality);
  }

  togglePermission(functionality: string): void {
    const tab = this.activeTab();
    const permsSignal = tab === 'ADMIN' ? this.adminPermissions : this.utilisateurPermissions;
    const current = new Set(permsSignal());

    if (current.has(functionality)) {
      this.removePermission(tab, functionality, current, permsSignal);
    } else {
      this.addPermission(tab, functionality, current, permsSignal);
    }
  }

  private loadPermissions(role: string): void {
    this.isLoading.set(true);
    const userId = parseInt(this.authService.getCurrentUserId());
    const request: SpringBootRequest<any> = {
      data: { systemRole: role },
      user: userId
    };

    this.http.post<SpringBootResponse<RolePermission>>(
      '/systemRolePermission/getByRole', request
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (!res.hasError && res.items) {
          const keys = new Set(res.items.map(p => p.functionality || '').filter(f => f));
          if (role === 'ADMIN') {
            this.adminPermissions.set(keys);
          } else {
            this.utilisateurPermissions.set(keys);
          }
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
    const userId = parseInt(this.authService.getCurrentUserId());
    const request: SpringBootRequest<any> = {
      data: { systemRole: role, functionality },
      user: userId
    };

    this.http.post<SpringBootResponse<RolePermission>>(
      '/systemRolePermission/add', request
    ).pipe(takeUntil(this.destroy$)).subscribe({
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
    const userId = parseInt(this.authService.getCurrentUserId());
    const request: SpringBootRequest<any> = {
      data: { systemRole: role, functionality },
      user: userId
    };

    this.http.post<SpringBootResponse<RolePermission>>(
      '/systemRolePermission/remove', request
    ).pipe(takeUntil(this.destroy$)).subscribe({
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
