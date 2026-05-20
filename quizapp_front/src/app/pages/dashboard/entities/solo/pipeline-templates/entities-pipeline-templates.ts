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
import { PipelineTemplateService, PipelineTemplateCriteria, PagedPipelineTemplateResponse } from '../../../../../core/services/pipeline-template.service';
import { PipelineTemplate } from '../../../../../core/models/pipeline.interfaces';

@Component({
  selector: 'app-entities-pipeline-templates',
  standalone: true,
  imports: [FilterSelectComponent, FilterSelectOptionDirective, CommonModule, FormsModule, FilterCheckboxComponent, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-pipeline-templates.html',
  styleUrls: ['./entities-pipeline-templates.scss']
})
export class EntitiesPipelineTemplatesComponent extends EntityCrudBase<PipelineTemplate, PipelineTemplateCriteria, PagedPipelineTemplateResponse> {
  private service = inject(PipelineTemplateService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesPipelineTemplatesPageSize';
  protected override readonly entityName = 'templates de pipeline';
  protected override readonly entityTypeApi = 'pipeline-templates';

  advancedCriteria: PipelineTemplateCriteria = {};
  editFormData: PipelineTemplate = {};
  createFormData: Partial<PipelineTemplate> = {};
  showDuplicateModal = signal(false);
  showSetDefaultConfirm = signal(false);
  templateToDuplicate = signal<PipelineTemplate | null>(null);
  templateToSetDefault = signal<PipelineTemplate | null>(null);
  duplicateName = signal('');
  isDuplicating = false;
  isSettingDefault = false;

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'templateName', label: 'Nom', priority: 1 },
    { key: 'templateDesc', label: 'Description', priority: 3 },
    { key: 'isDefault', label: 'Par défaut', priority: 2 },
    { key: 'isActive', label: 'Actif', priority: 2 },
    { key: 'isLocked', label: 'Verrouillé', priority: 2 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: PipelineTemplateCriteria): Observable<PagedPipelineTemplateResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<PipelineTemplate>): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: PipelineTemplate): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  canEditTemplate(item: PipelineTemplate | null | undefined): boolean {
    return !!item && !item.isDeleted && !item.isLocked;
  }

  canDeleteTemplate(item: PipelineTemplate | null | undefined): boolean {
    return this.canEditTemplate(item);
  }

  canDuplicateTemplate(item: PipelineTemplate | null | undefined): boolean {
    return !!item && !item.isDeleted;
  }

  canSetDefaultTemplate(item: PipelineTemplate | null | undefined): boolean {
    return !!item && !item.isDeleted && !item.isDefault;
  }

  openPipelineTemplatesWorkspace(): void {
    this.router.navigate(['/dashboard/pipeline-templates']);
  }

  openDuplicateModal(item: PipelineTemplate): void {
    if (!this.canDuplicateTemplate(item)) {
      return;
    }

    this.templateToDuplicate.set(item);
    this.duplicateName.set(`${item.templateName || 'Template'} (copie)`);
    this.showDuplicateModal.set(true);
  }

  closeDuplicateModal(): void {
    if (this.isDuplicating) {
      return;
    }

    this.templateToDuplicate.set(null);
    this.duplicateName.set('');
    this.showDuplicateModal.set(false);
  }

  confirmDuplicate(): void {
    const template = this.templateToDuplicate();
    const name = this.duplicateName().trim();

    if (!template?.id || !name || this.isDuplicating) {
      return;
    }

    this.isDuplicating = true;
    this.service.duplicate(template.id, name).subscribe({
      next: (response) => {
        if (response?.hasError) {
          this.notificationService.error('Erreur', response.status?.message || 'Erreur lors de la duplication du template');
          this.isDuplicating = false;
          return;
        }

        this.notificationService.success('Succès', response.status?.message || 'Template dupliqué avec succès');
        this.isDuplicating = false;
        this.templateToDuplicate.set(null);
        this.duplicateName.set('');
        this.showDuplicateModal.set(false);
        this.loadItems();
      },
      error: (error) => {
        this.notificationService.error('Erreur', this.getErrorMessage(error, 'Erreur lors de la duplication du template'));
        this.isDuplicating = false;
      }
    });
  }

  openSetDefaultConfirm(item: PipelineTemplate): void {
    if (!this.canSetDefaultTemplate(item)) {
      return;
    }

    this.templateToSetDefault.set(item);
    this.showSetDefaultConfirm.set(true);
  }

  closeSetDefaultConfirm(): void {
    if (this.isSettingDefault) {
      return;
    }

    this.templateToSetDefault.set(null);
    this.showSetDefaultConfirm.set(false);
  }

  confirmSetDefault(): void {
    const template = this.templateToSetDefault();

    if (!template?.id || this.isSettingDefault) {
      return;
    }

    this.isSettingDefault = true;
    this.service.setDefault(template.id).subscribe({
      next: (response) => {
        if (response?.hasError) {
          this.notificationService.error('Erreur', response.status?.message || 'Erreur lors de la définition du template par défaut');
          this.isSettingDefault = false;
          return;
        }

        this.notificationService.success('Succès', response.status?.message || 'Template défini par défaut');
        this.isSettingDefault = false;
        this.templateToSetDefault.set(null);
        this.showSetDefaultConfirm.set(false);
        this.loadItems();
      },
      error: (error) => {
        this.notificationService.error('Erreur', this.getErrorMessage(error, 'Erreur lors de la définition du template par défaut'));
        this.isSettingDefault = false;
      }
    });
  }
}
