import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityCrudBase, BaseSearchCriteria, BasePagedResponse } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { AppConfigService, AppConfig } from '../../../../../core/services/app-config.service';

interface AppConfigCriteria extends BaseSearchCriteria {
  configName?: string;
  isActive?: boolean;
}

interface PagedAppConfigResponse extends BasePagedResponse<AppConfig> {}

@Component({
  selector: 'app-entities-app-config',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-app-config.html',
  styleUrls: ['./entities-app-config.scss']
})
export class EntitiesAppConfigComponent extends EntityCrudBase<AppConfig, AppConfigCriteria, PagedAppConfigResponse> {
  private service = inject(AppConfigService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesAppConfigPageSize';
  protected override readonly entityName = 'config application';
  protected override readonly entityTypeApi = 'appConfig';

  advancedCriteria: AppConfigCriteria = {};
  editFormData: AppConfig = {} as AppConfig;
  createFormData: Partial<AppConfig> = {};

  protected fetchAll(criteria: AppConfigCriteria): Observable<PagedAppConfigResponse> {
    const { page, size, ...data } = criteria;
    return this.service.getByCriteria(data, page, size).pipe(
      map(resp => ({
        content: resp.items,
        totalElements: resp.count,
        totalPages: Math.ceil(resp.count / (size || 10))
      }))
    );
  }
  protected performCreate(item: Partial<AppConfig>): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: AppConfig): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.update({ id, isDeleted: false }); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
