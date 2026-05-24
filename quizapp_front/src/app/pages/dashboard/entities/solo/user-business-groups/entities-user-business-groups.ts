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
import { BusinessGroupCrudService, BusinessGroup } from '../../../../../core/services/business-group-crud.service';
import { UserService, User } from '../../../../../core/services/user.service';
import { UserBusinessGroupService, UserBusinessGroup, UserBusinessGroupMutationPayload, PagedUserBusinessGroupResponse, UserBusinessGroupCriteria } from '../../../../../core/services/user-business-group.service';

@Component({
  selector: 'app-entities-user-business-groups',
  standalone: true,
  imports: [FilterSelectComponent, FilterSelectOptionDirective, CommonModule, FormsModule, FilterCheckboxComponent, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-user-business-groups.html',
  styleUrls: ['./entities-user-business-groups.scss']
})
export class EntitiesUserBusinessGroupsComponent extends EntityCrudBase<UserBusinessGroup, UserBusinessGroupCriteria, PagedUserBusinessGroupResponse, UserBusinessGroupMutationPayload> {
  private service = inject(UserBusinessGroupService);
  private userService = inject(UserService);
  private businessGroupCrudService = inject(BusinessGroupCrudService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesUserBusinessGroupsPageSize';
  protected override readonly entityName = 'utilisateurs groupes métier';
  protected override readonly entityTypeApi = 'userBusinessGroup';

  readonly allUsers = signal<User[]>([]);
  readonly businessGroups = signal<BusinessGroup[]>([]);
  advancedCriteria: UserBusinessGroupCriteria = {};
  editFormData: UserBusinessGroup = {};
  createFormData: UserBusinessGroupMutationPayload = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'userId', label: 'Utilisateur', priority: 1 },
    { key: 'businessGroupId', label: 'Groupe métier', priority: 1 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  override ngOnInit(): void {
    super.ngOnInit();
    this.userService.getByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({
      next: (response) => this.allUsers.set(response.content),
    });
    this.businessGroupCrudService.getAllByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({
      next: (response) => this.businessGroups.set(response.content),
    });
  }

  protected fetchAll(criteria: UserBusinessGroupCriteria): Observable<PagedUserBusinessGroupResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: UserBusinessGroupMutationPayload): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: UserBusinessGroup): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

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

  getBusinessGroupLabel(businessGroupId?: number): string {
    if (!businessGroupId) {
      return '-';
    }

    const businessGroup = this.businessGroups().find((item) => item.id === businessGroupId);
    return businessGroup?.groupName || `#${businessGroupId}`;
  }

  openUserPermissionsWorkspace(): void {
    this.router.navigate(['/dashboard/user-permissions']);
  }
}
