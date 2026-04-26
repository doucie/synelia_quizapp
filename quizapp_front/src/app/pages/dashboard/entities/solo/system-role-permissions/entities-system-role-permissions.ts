import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { SystemRolePermissionCrudService, SystemRolePermission, PagedSystemRolePermissionResponse, SystemRolePermissionCriteria } from '../../../../../core/services/system-role-permission-crud.service';

@Component({
  selector: 'app-entities-system-role-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-system-role-permissions.html',
  styleUrls: ['./entities-system-role-permissions.scss']
})
export class EntitiesSystemRolePermissionsComponent extends EntityCrudBase<SystemRolePermission, SystemRolePermissionCriteria, PagedSystemRolePermissionResponse> {
  private service = inject(SystemRolePermissionCrudService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesSystemRolePermissionsPageSize';
  protected override readonly entityName = 'permissions rôles système';
  protected override readonly entityTypeApi = 'systemRolePermission';

  advancedCriteria: SystemRolePermissionCriteria = {};
  editFormData: SystemRolePermission = {};
  createFormData: Partial<SystemRolePermission> = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'role', label: 'Rôle', priority: 1 },
    { key: 'feature', label: 'Fonctionnalité', priority: 1 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: SystemRolePermissionCriteria): Observable<PagedSystemRolePermissionResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<SystemRolePermission>): Observable<any> { return this.service.create(item as SystemRolePermission); }
  protected performUpdate(item: SystemRolePermission): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
