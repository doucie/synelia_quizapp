import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { EntityPermissionCrudService, EntityPermissionItem, PagedEntityPermissionResponse, EntityPermissionCrudCriteria } from '../../../../../core/services/entity-permission-crud.service';

@Component({
  selector: 'app-entities-entity-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-entity-permissions.html',
  styleUrls: ['./entities-entity-permissions.scss']
})
export class EntitiesEntityPermissionsComponent extends EntityCrudBase<EntityPermissionItem, EntityPermissionCrudCriteria, PagedEntityPermissionResponse> {
  private service = inject(EntityPermissionCrudService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesEntityPermissionsPageSize';
  protected override readonly entityName = 'permissions entité';
  protected override readonly entityTypeApi = 'entityPermission';

  advancedCriteria: EntityPermissionCrudCriteria = {};
  editFormData: EntityPermissionItem = {};
  createFormData: Partial<EntityPermissionItem> = {};

  protected fetchAll(criteria: EntityPermissionCrudCriteria): Observable<PagedEntityPermissionResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<EntityPermissionItem>): Observable<any> { return this.service.create(item as EntityPermissionItem); }
  protected performUpdate(item: EntityPermissionItem): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
