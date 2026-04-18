import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { UserBusinessGroupService, UserBusinessGroup, PagedUserBusinessGroupResponse, UserBusinessGroupCriteria } from '../../../../../core/services/user-business-group.service';

@Component({
  selector: 'app-entities-user-business-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-user-business-groups.html',
  styleUrls: ['./entities-user-business-groups.scss']
})
export class EntitiesUserBusinessGroupsComponent extends EntityCrudBase<UserBusinessGroup, UserBusinessGroupCriteria, PagedUserBusinessGroupResponse> {
  private service = inject(UserBusinessGroupService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesUserBusinessGroupsPageSize';
  protected override readonly entityName = 'utilisateurs groupes métier';
  protected override readonly entityTypeApi = 'userBusinessGroup';

  advancedCriteria: UserBusinessGroupCriteria = {};
  editFormData: UserBusinessGroup = {};
  createFormData: Partial<UserBusinessGroup> = {};

  protected fetchAll(criteria: UserBusinessGroupCriteria): Observable<PagedUserBusinessGroupResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<UserBusinessGroup>): Observable<any> { return this.service.create(item as UserBusinessGroup); }
  protected performUpdate(item: UserBusinessGroup): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
