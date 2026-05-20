import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { FilterCheckboxComponent } from '../../../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { PERMISSION_CATEGORIES } from '../../../../../core/constants/permissions.constants';
import { BusinessGroupCrudService, BusinessGroup } from '../../../../../core/services/business-group-crud.service';
import { BusinessGroupPermissionService, BusinessGroupPermission, PagedBusinessGroupPermissionResponse, BusinessGroupPermissionCriteria } from '../../../../../core/services/business-group-permission.service';

interface FunctionalityOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-entities-business-group-permissions',
  standalone: true,
  imports: [FilterSelectComponent, FilterSelectOptionDirective, CommonModule, FormsModule, FilterCheckboxComponent, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-business-group-permissions.html',
  styleUrls: ['./entities-business-group-permissions.scss']
})
export class EntitiesBusinessGroupPermissionsComponent extends EntityCrudBase<BusinessGroupPermission, BusinessGroupPermissionCriteria, PagedBusinessGroupPermissionResponse> {
  private service = inject(BusinessGroupPermissionService);
  private businessGroupCrudService = inject(BusinessGroupCrudService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesBusinessGroupPermissionsPageSize';
  protected override readonly entityName = 'permissions groupe métier';
  protected override readonly entityTypeApi = 'businessGroupPermission';

  readonly businessGroups = signal<BusinessGroup[]>([]);
  advancedCriteria: BusinessGroupPermissionCriteria = {};
  editFormData: BusinessGroupPermission = {};
  createFormData: Partial<BusinessGroupPermission> = {};
  readonly functionalityOptions: FunctionalityOption[] = PERMISSION_CATEGORIES.flatMap((category) =>
    category.permissions.map((permission) => ({
      value: permission.key,
      label: `${category.label} - ${permission.label}`,
    }))
  );
  private readonly functionalityLabelMap = new Map(this.functionalityOptions.map((option) => [option.value, option.label]));

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'functionality', label: 'Fonctionnalité', priority: 1 },
    { key: 'businessGroupId', label: 'Groupe métier', priority: 2 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  override ngOnInit(): void {
    super.ngOnInit();
    this.businessGroupCrudService.getAllByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({
      next: (response) => this.businessGroups.set(response.content),
    });
  }

  protected fetchAll(criteria: BusinessGroupPermissionCriteria): Observable<PagedBusinessGroupPermissionResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<BusinessGroupPermission>): Observable<any> { return this.service.create(item as BusinessGroupPermission); }
  protected performUpdate(item: BusinessGroupPermission): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  getBusinessGroupLabel(businessGroupId?: number): string {
    if (!businessGroupId) {
      return '-';
    }

    const businessGroup = this.businessGroups().find((item) => item.id === businessGroupId);
    return businessGroup?.groupName || `#${businessGroupId}`;
  }

  getFunctionalityLabel(functionality?: string): string {
    if (!functionality) {
      return '-';
    }

    return this.functionalityLabelMap.get(functionality) ?? functionality;
  }

  openBusinessGroupsWorkspace(): void {
    this.router.navigate(['/dashboard/business-groups']);
  }
}
