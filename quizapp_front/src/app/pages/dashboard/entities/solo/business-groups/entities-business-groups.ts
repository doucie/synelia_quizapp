import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { FilterCheckboxComponent } from '../../../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { BusinessGroupCrudService, BusinessGroup, PagedBusinessGroupResponse, BusinessGroupCriteria } from '../../../../../core/services/business-group-crud.service';
import { BusinessGroupPermissionService, BusinessGroupPermission } from '../../../../../core/services/business-group-permission.service';
import { UserBusinessGroupService, UserBusinessGroup } from '../../../../../core/services/user-business-group.service';

@Component({
  selector: 'app-entities-business-groups',
  standalone: true,
  imports: [FilterSelectComponent, FilterSelectOptionDirective, CommonModule, FormsModule, FilterCheckboxComponent, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-business-groups.html',
  styleUrls: ['./entities-business-groups.scss']
})
export class EntitiesBusinessGroupsComponent extends EntityCrudBase<BusinessGroup, BusinessGroupCriteria, PagedBusinessGroupResponse> {
  private service = inject(BusinessGroupCrudService);
  private permissionService = inject(BusinessGroupPermissionService);
  private userBusinessGroupService = inject(UserBusinessGroupService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesBusinessGroupsPageSize';
  protected override readonly entityName = 'groupes métier';
  protected override readonly entityTypeApi = 'businessGroup';

  advancedCriteria: BusinessGroupCriteria = {};
  editFormData: BusinessGroup = {};
  createFormData: Partial<BusinessGroup> = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'name', label: 'Nom', priority: 1 },
    { key: 'description', label: 'Description', priority: 3 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  // Signaux pour l'expansion
  expandedGroups = signal<Set<number>>(new Set());
  groupPermissions = signal<{[groupId: number]: BusinessGroupPermission[]}>({});
  groupMembers = signal<{[groupId: number]: UserBusinessGroup[]}>({});
  loadingChildren = signal<{[groupId: number]: boolean}>({});
  childTab = signal<{[groupId: number]: string}>({});

  protected fetchAll(criteria: BusinessGroupCriteria): Observable<PagedBusinessGroupResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<BusinessGroup>): Observable<any> { return this.service.create(item as BusinessGroup); }
  protected performUpdate(item: BusinessGroup): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  openBusinessGroupsWorkspace(): void {
    this.router.navigate(['/dashboard/business-groups']);
  }

  // --- Expansion ---

  toggleGroupExpansion(groupId: number) {
    if (this.expandedGroups().has(groupId)) {
      this.expandedGroups.set(new Set());
    } else {
      this.expandedGroups.set(new Set([groupId]));
      this.loadGroupChildren(groupId);
    }
  }

  isGroupExpanded(groupId: number): boolean {
    return this.expandedGroups().has(groupId);
  }

  loadGroupChildren(groupId: number) {
    if (this.loadingChildren()[groupId]) return;
    this.loadingChildren.set({ ...this.loadingChildren(), [groupId]: true });

    this.permissionService.getAllByCriteria({ businessGroupId: groupId, size: 100 }).subscribe({
      next: (res) => this.groupPermissions.set({ ...this.groupPermissions(), [groupId]: res.content }),
      error: () => this.groupPermissions.set({ ...this.groupPermissions(), [groupId]: [] })
    });

    this.userBusinessGroupService.getAllByCriteria({ businessGroupId: groupId, size: 100 }).subscribe({
      next: (res) => {
        this.groupMembers.set({ ...this.groupMembers(), [groupId]: res.content });
        this.loadingChildren.set({ ...this.loadingChildren(), [groupId]: false });
      },
      error: () => {
        this.groupMembers.set({ ...this.groupMembers(), [groupId]: [] });
        this.loadingChildren.set({ ...this.loadingChildren(), [groupId]: false });
      }
    });
  }

  isLoadingChildren(groupId: number): boolean {
    return this.loadingChildren()[groupId] || false;
  }

  getGroupPermissions(groupId: number): BusinessGroupPermission[] {
    return this.groupPermissions()[groupId] || [];
  }

  getGroupMembers(groupId: number): UserBusinessGroup[] {
    return this.groupMembers()[groupId] || [];
  }

  getChildTab(groupId: number): string {
    return this.childTab()[groupId] || 'permissions';
  }

  setChildTab(groupId: number, tab: string) {
    this.childTab.set({ ...this.childTab(), [groupId]: tab });
  }

  trackByChildId(index: number, item: any): number {
    return item.id;
  }
}
