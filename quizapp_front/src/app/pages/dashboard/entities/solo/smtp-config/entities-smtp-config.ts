import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityCrudBase, BaseSearchCriteria, BasePagedResponse } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { SmtpConfigService, SmtpConfig } from '../../../../../core/services/smtp-config.service';

interface SmtpConfigCriteria extends BaseSearchCriteria {
  host?: string;
  isActive?: boolean;
}

interface PagedSmtpConfigResponse extends BasePagedResponse<SmtpConfig> {}

@Component({
  selector: 'app-entities-smtp-config',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-smtp-config.html',
  styleUrls: ['./entities-smtp-config.scss']
})
export class EntitiesSmtpConfigComponent extends EntityCrudBase<SmtpConfig, SmtpConfigCriteria, PagedSmtpConfigResponse> {
  private service = inject(SmtpConfigService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesSmtpConfigPageSize';
  protected override readonly entityName = 'config SMTP';
  protected override readonly entityTypeApi = 'smtpConfig';

  advancedCriteria: SmtpConfigCriteria = {};
  editFormData: SmtpConfig = {} as SmtpConfig;
  createFormData: Partial<SmtpConfig> = {};

  protected fetchAll(criteria: SmtpConfigCriteria): Observable<PagedSmtpConfigResponse> {
    const { page, size, ...data } = criteria;
    return this.service.getByCriteria(data, page, size).pipe(
      map(resp => ({
        content: resp.items,
        totalElements: resp.count,
        totalPages: Math.ceil(resp.count / (size || 10))
      }))
    );
  }
  protected performCreate(item: Partial<SmtpConfig>): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: SmtpConfig): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.update({ id, isDeleted: false }); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
