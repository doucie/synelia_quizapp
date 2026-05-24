import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { PERMISSION_CATEGORIES } from '../../../../../core/constants/permissions.constants';
import { UserService, User } from '../../../../../core/services/user.service';
import { UserPermissionOverrideCrudService, UserPermissionOverride, UserPermissionOverrideMutationPayload, PagedUserPermissionOverrideResponse, UserPermissionOverrideCriteria } from '../../../../../core/services/user-permission-override-crud.service';

interface FunctionalityOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-entities-user-permission-overrides',
  standalone: true,
  imports: [FilterSelectComponent, FilterSelectOptionDirective, CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-user-permission-overrides.html',
  styleUrls: ['./entities-user-permission-overrides.scss']
})
export class EntitiesUserPermissionOverridesComponent extends EntityCrudBase<UserPermissionOverride, UserPermissionOverrideCriteria, PagedUserPermissionOverrideResponse, UserPermissionOverrideMutationPayload> {
  private service = inject(UserPermissionOverrideCrudService);
  private userService = inject(UserService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesUserPermissionOverridesPageSize';
  protected override readonly entityName = 'surcharges permissions utilisateur';
  protected override readonly entityTypeApi = 'userPermissionOverride';
  override canRestoreItems = false;

  readonly allUsers = signal<User[]>([]);
  advancedCriteria: UserPermissionOverrideCriteria = {};
  editFormData: UserPermissionOverride = {};
  createFormData: UserPermissionOverrideMutationPayload = {};
  readonly functionalityOptions: FunctionalityOption[] = PERMISSION_CATEGORIES.flatMap((category) =>
    category.permissions.map((permission) => ({
      value: permission.key,
      label: `${category.label} - ${permission.label}`,
    }))
  );
  private readonly functionalityLabelMap = new Map(this.functionalityOptions.map((option) => [option.value, option.label]));

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'userId', label: 'User ID', priority: 1 },
    { key: 'functionality', label: 'Fonctionnalité', priority: 1 },
    { key: 'isAllowed', label: 'Autorisé', priority: 2 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: UserPermissionOverrideCriteria): Observable<PagedUserPermissionOverrideResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: UserPermissionOverrideMutationPayload): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: UserPermissionOverride): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  override ngOnInit(): void {
    super.ngOnInit();
    this.userService.getByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({
      next: (response) => this.allUsers.set(response.content),
    });
  }

  getUserDisplay(userId?: number): string {
    if (!userId) {
      return '-';
    }

    const user = this.allUsers().find((item) => item.id === userId);
    if (!user) {
      return `#${userId}`;
    }

    const fullName = [user.prenom || user.firstName, user.nom || user.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (fullName && user.email) {
      return `${fullName} (${user.email})`;
    }

    return fullName || user.email || `#${userId}`;
  }

  getFunctionalityLabel(functionality?: string): string {
    if (!functionality) {
      return '-';
    }

    return this.functionalityLabelMap.get(functionality) ?? functionality;
  }

  openUserPermissionsWorkspace(): void {
    this.router.navigate(['/dashboard/user-permissions']);
  }
}
