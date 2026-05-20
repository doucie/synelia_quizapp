import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityCrudBase, BaseSearchCriteria, BasePagedResponse, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { FilterCheckboxComponent } from '../../../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { EmailTemplateService, EmailTemplate } from '../../../../../core/services/email-template.service';

interface EmailTemplateCriteria extends BaseSearchCriteria {
  templateKey?: string;
  isActive?: boolean;
}

interface PagedEmailTemplateResponse extends BasePagedResponse<EmailTemplate> {}

@Component({
  selector: 'app-entities-email-templates',
  standalone: true,
  imports: [FilterSelectComponent, FilterSelectOptionDirective, CommonModule, FormsModule, FilterCheckboxComponent, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
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

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'templateKey', label: 'Clé', priority: 1 },
    { key: 'subjectTemplate', label: 'Sujet', priority: 1 },
    { key: 'description', label: 'Description', priority: 3 },
    { key: 'isActive', label: 'Actif', priority: 2 },
    { key: 'isDeleted', label: 'Supprimé', priority: 3 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

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

  openEmailEditorWorkspace(): void {
    this.router.navigate(['/dashboard/email-editor']);
  }
}
