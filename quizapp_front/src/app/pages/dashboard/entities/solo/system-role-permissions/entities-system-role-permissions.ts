import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { PERMISSION_CATEGORIES } from '../../../../../core/constants/permissions.constants';
import { SystemRolePermissionCrudService, SystemRolePermission, SystemRolePermissionMutationPayload, PagedSystemRolePermissionResponse, SystemRolePermissionCriteria } from '../../../../../core/services/system-role-permission-crud.service';

interface SystemRoleOption {
  value: string;
  label: string;
}

interface FunctionalityOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-entities-system-role-permissions',
  standalone: true,
  imports: [FilterSelectComponent, FilterSelectOptionDirective, CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-system-role-permissions.html',
  styleUrls: ['./entities-system-role-permissions.scss']
})
export class EntitiesSystemRolePermissionsComponent extends EntityCrudBase<SystemRolePermission, SystemRolePermissionCriteria, PagedSystemRolePermissionResponse, SystemRolePermissionMutationPayload> {
  private service = inject(SystemRolePermissionCrudService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesSystemRolePermissionsPageSize';
  protected override readonly entityName = 'permissions rôles système';
  protected override readonly entityTypeApi = 'systemRolePermission';
  override canRestoreItems = false;

  advancedCriteria: SystemRolePermissionCriteria = {};
  editFormData: SystemRolePermission = {};
  createFormData: SystemRolePermissionMutationPayload = {};
  readonly systemRoleOptions: SystemRoleOption[] = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'RECRUITER', label: 'Recruteur' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
  ];
  readonly functionalityOptions: FunctionalityOption[] = PERMISSION_CATEGORIES.flatMap((category) =>
    category.permissions.map((permission) => ({
      value: permission.key,
      label: `${category.label} - ${permission.label}`,
    }))
  );
  private readonly systemRoleLabelMap = new Map(this.systemRoleOptions.map((option) => [option.value, option.label]));
  private readonly functionalityLabelMap = new Map(this.functionalityOptions.map((option) => [option.value, option.label]));

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'systemRole', label: 'Rôle', priority: 1 },
    { key: 'functionality', label: 'Fonctionnalité', priority: 1 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: SystemRolePermissionCriteria): Observable<PagedSystemRolePermissionResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: SystemRolePermissionMutationPayload): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: SystemRolePermission): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  getSystemRoleLabel(role?: string): string {
    if (!role) {
      return '-';
    }

    return this.systemRoleLabelMap.get(role) ?? role;
  }

  getFunctionalityLabel(functionality?: string): string {
    if (!functionality) {
      return '-';
    }

    return this.functionalityLabelMap.get(functionality) ?? functionality;
  }

  openSystemRolePermissionsWorkspace(): void {
    this.router.navigate(['/dashboard/system-role-permissions']);
  }
}
