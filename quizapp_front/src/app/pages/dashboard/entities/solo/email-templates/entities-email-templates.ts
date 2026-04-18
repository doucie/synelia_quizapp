import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityCrudBase, BaseSearchCriteria, BasePagedResponse } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { EmailTemplateService, EmailTemplate } from '../../../../../core/services/email-template.service';

interface EmailTemplateCriteria extends BaseSearchCriteria {
  templateKey?: string;
  isActive?: boolean;
}

interface PagedEmailTemplateResponse extends BasePagedResponse<EmailTemplate> {}

@Component({
  selector: 'app-entities-email-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-email-templates.html',
  styleUrls: ['./entities-email-templates.scss']
})
export class EntitiesEmailTemplatesComponent extends EntityCrudBase<EmailTemplate, EmailTemplateCriteria, PagedEmailTemplateResponse> {
  private service = inject(EmailTemplateService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesEmailTemplatesPageSize';
  protected override readonly entityName = 'modèles email';
  protected override readonly entityTypeApi = 'emailTemplate';

  advancedCriteria: EmailTemplateCriteria = {};
  editFormData: EmailTemplate = {} as EmailTemplate;
  createFormData: Partial<EmailTemplate> = {};

  protected fetchAll(criteria: EmailTemplateCriteria): Observable<PagedEmailTemplateResponse> {
    const { page, size, ...data } = criteria;
    return this.service.getByCriteria(data, page, size).pipe(
      map(resp => ({
        content: resp.items,
        totalElements: resp.count,
        totalPages: Math.ceil(resp.count / (size || 10))
      }))
    );
  }
  protected performCreate(item: Partial<EmailTemplate>): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: EmailTemplate): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.update({ id, isDeleted: false }); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
