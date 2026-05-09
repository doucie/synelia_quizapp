import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { UserPermissionOverrideCrudService, UserPermissionOverride, PagedUserPermissionOverrideResponse, UserPermissionOverrideCriteria } from '../../../../../core/services/user-permission-override-crud.service';

@Component({
  selector: 'app-entities-user-permission-overrides',
  standalone: true,
  imports: [FilterSelectComponent, FilterSelectOptionDirective, CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-user-permission-overrides.html',
  styleUrls: ['./entities-user-permission-overrides.scss']
})
export class EntitiesUserPermissionOverridesComponent extends EntityCrudBase<UserPermissionOverride, UserPermissionOverrideCriteria, PagedUserPermissionOverrideResponse> {
  private service = inject(UserPermissionOverrideCrudService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesUserPermissionOverridesPageSize';
  protected override readonly entityName = 'surcharges permissions utilisateur';
  protected override readonly entityTypeApi = 'userPermissionOverride';

  advancedCriteria: UserPermissionOverrideCriteria = {};
  editFormData: UserPermissionOverride = {};
  createFormData: Partial<UserPermissionOverride> = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'userId', label: 'User ID', priority: 1 },
    { key: 'feature', label: 'Fonctionnalité', priority: 1 },
    { key: 'allowed', label: 'Autorisé', priority: 2 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: UserPermissionOverrideCriteria): Observable<PagedUserPermissionOverrideResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<UserPermissionOverride>): Observable<any> { return this.service.create(item as UserPermissionOverride); }
  protected performUpdate(item: UserPermissionOverride): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
