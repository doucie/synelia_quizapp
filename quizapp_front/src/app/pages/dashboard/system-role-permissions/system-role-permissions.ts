import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth/auth.service';
import { FilterCheckboxComponent } from '../../../shared/filter-checkbox/filter-checkbox';
import { PERMISSION_CATEGORIES, PermissionCategory, PermissionDef } from '../../../core/constants/permissions.constants';
import { SpringBootRequest, SpringBootResponse } from '../../../core/models/spring-boot.interfaces';

interface RolePermission {
  id?: number;
  systemRole?: string;
  functionality?: string;
}

interface PermissionGroup {
  id: string;
  title: string;
  permissions: PermissionDef[];
}

interface DisplayPermissionCategory extends PermissionCategory {
  groups: PermissionGroup[];
}

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

  activeTab = signal<RoleTab>('ADMIN');
  isLoading = signal(false);
  saving = signal(false);
  categories: DisplayPermissionCategory[] = PERMISSION_CATEGORIES.map(category => ({
    ...category,
    groups: this.buildPermissionGroups(category)
  }));

  // Permissions par rôle : Map<functionality, boolean>
  adminPermissions = signal<Set<string>>(new Set());
  recruiterPermissions = signal<Set<string>>(new Set());

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

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

  getPermissionActionLabel(functionality: string): string {
    const action = functionality.split('_')[0];
    switch (action) {
      case 'VIEW':
        return 'Voir';
      case 'CREATE':
        return 'Créer';
      case 'UPDATE':
        return 'Modifier';
      case 'DELETE':
        return 'Supprimer';
      case 'MANAGE':
        return 'Gérer';
      case 'ADVANCE':
        return 'Avancer';
      case 'MIGRATE':
        return 'Migrer';
      default:
        return action;
    }
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
            this.recruiterPermissions.set(keys);
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

  private buildPermissionGroups(category: PermissionCategory): PermissionGroup[] {
    switch (category.label) {
      case 'Pipeline':
        return this.createGroups(category.permissions, [
          { id: 'pipeline-templates', title: 'Templates de pipeline', matchers: ['PIPELINE_TEMPLATE'] },
          { id: 'pipeline-stages', title: 'Étapes du pipeline', matchers: ['PIPELINE_STAGE'] },
          { id: 'pipeline-progress', title: 'Progression des candidatures', matchers: ['APPLICATION_PROGRESS'] },
          { id: 'pipeline-actions', title: 'Actions métier', matchers: ['ADVANCE_PIPELINE', 'MIGRATE_CANDIDATE_PIPELINE'] }
        ]);
      case 'Administration':
        return this.createGroups(category.permissions, [
          { id: 'admin-app-config', title: 'Configuration application', matchers: ['APP_CONFIG'] },
          { id: 'admin-email', title: 'Modèles email', matchers: ['EMAIL_TEMPLATE'] },
          { id: 'admin-smtp', title: 'SMTP', matchers: ['SMTP_CONFIG'] },
          { id: 'admin-legal', title: 'Textes légaux', matchers: ['LEGAL_TEXT'] },
          { id: 'admin-invitation', title: 'Invitations', matchers: ['INVITATION_CODE'] }
        ]);
      case 'Départements & Spécialités':
        return this.createGroups(category.permissions, [
          { id: 'departments', title: 'Départements', matchers: ['DEPARTMENTS'] },
          { id: 'specialities', title: 'Spécialités', matchers: ['SPECIALITIES'] }
        ]);
      case 'Questions & Réponses':
        return this.createGroups(category.permissions, [
          { id: 'questions', title: 'Questions', matchers: ['QUESTION'] },
          { id: 'answers', title: 'Réponses', matchers: ['ANSWER'] }
        ]);
      case 'Groupes & Permissions':
        return this.createGroups(category.permissions, [
          { id: 'business-groups', title: 'Groupes métiers', matchers: ['BUSINESS_GROUP'] },
          { id: 'system-roles', title: 'Rôles système', matchers: ['MANAGE_SYSTEM_ROLES'] },
          { id: 'entity-permissions', title: 'Permissions entité', matchers: ['ENTITY_PERMISSION'] }
        ]);
      default:
        return [{ id: category.label.toLowerCase(), title: '', permissions: category.permissions }];
    }
  }

  private createGroups(
    permissions: PermissionDef[],
    definitions: Array<{ id: string; title: string; matchers: string[] }>
  ): PermissionGroup[] {
    return definitions
      .map(definition => ({
        id: definition.id,
        title: definition.title,
        permissions: permissions.filter(permission =>
          definition.matchers.some(matcher => permission.key.includes(matcher) || permission.key === matcher)
        )
      }))
      .filter(group => group.permissions.length > 0);
  }
}
