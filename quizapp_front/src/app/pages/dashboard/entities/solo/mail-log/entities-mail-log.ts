import { Component, inject } from '@angular/core';
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
import { MailLogCrudService, MailLogItem, MailLogItemMutationPayload, MailLogCriteria, PagedMailLogResponse } from '../../../../../core/services/mail-log-crud.service';

@Component({
  selector: 'app-entities-mail-log',
  standalone: true,
  imports: [FilterSelectComponent, FilterSelectOptionDirective, CommonModule, FormsModule, FilterCheckboxComponent, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-mail-log.html',
  styleUrls: ['./entities-mail-log.scss']
})
export class EntitiesMailLogComponent extends EntityCrudBase<MailLogItem, MailLogCriteria, PagedMailLogResponse, MailLogItemMutationPayload> {
  private service = inject(MailLogCrudService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesMailLogPageSize';
  protected override readonly entityName = 'logs email';
  protected override readonly entityTypeApi = 'mailLog';

  advancedCriteria: MailLogCriteria = {};
  editFormData: MailLogItem = {};
  createFormData: MailLogItemMutationPayload = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'recipientEmail', label: 'Destinataire', priority: 1 },
    { key: 'status', label: 'Statut', priority: 1 },
    { key: 'recipientUserId', label: 'Recipient User ID', priority: 2 },
    { key: 'senderUserId', label: 'Sender User ID', priority: 2 },
    { key: 'emailTemplateId', label: 'Template ID', priority: 2 },
    { key: 'sentAt', label: 'Envoyé le', priority: 2 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 }
  ];

  protected fetchAll(criteria: MailLogCriteria): Observable<PagedMailLogResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: MailLogItemMutationPayload): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: MailLogItem): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}