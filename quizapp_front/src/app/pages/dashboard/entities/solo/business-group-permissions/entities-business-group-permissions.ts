import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { BusinessGroupPermissionService, BusinessGroupPermission, PagedBusinessGroupPermissionResponse, BusinessGroupPermissionCriteria } from '../../../../../core/services/business-group-permission.service';

@Component({
  selector: 'app-entities-business-group-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-business-group-permissions.html',
  styleUrls: ['./entities-business-group-permissions.scss']
})
export class EntitiesBusinessGroupPermissionsComponent extends EntityCrudBase<BusinessGroupPermission, BusinessGroupPermissionCriteria, PagedBusinessGroupPermissionResponse> {
  private service = inject(BusinessGroupPermissionService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesBusinessGroupPermissionsPageSize';
  protected override readonly entityName = 'permissions groupe métier';
  protected override readonly entityTypeApi = 'businessGroupPermission';

  advancedCriteria: BusinessGroupPermissionCriteria = {};
  editFormData: BusinessGroupPermission = {};
  createFormData: Partial<BusinessGroupPermission> = {};

  protected fetchAll(criteria: BusinessGroupPermissionCriteria): Observable<PagedBusinessGroupPermissionResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<BusinessGroupPermission>): Observable<any> { return this.service.create(item as BusinessGroupPermission); }
  protected performUpdate(item: BusinessGroupPermission): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
