import { Component, inject, signal, OnInit } from '@angular/core';
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
import { PipelineStageService, PipelineStageCriteria, PagedPipelineStageResponse } from '../../../../../core/services/pipeline-stage.service';
import { PipelineTemplateService } from '../../../../../core/services/pipeline-template.service';
import { PipelineStage, PipelineTemplate, StageType, STAGE_TYPES, STAGE_TYPE_LABELS } from '../../../../../core/models/pipeline.interfaces';

@Component({
  selector: 'app-entities-pipeline-stages',
  standalone: true,
  imports: [FilterSelectComponent, FilterSelectOptionDirective, CommonModule, FormsModule, FilterCheckboxComponent, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-pipeline-stages.html',
  styleUrls: ['./entities-pipeline-stages.scss']
})
export class EntitiesPipelineStagesComponent extends EntityCrudBase<PipelineStage, PipelineStageCriteria, PagedPipelineStageResponse> implements OnInit {
  private service = inject(PipelineStageService);
  private templateService = inject(PipelineTemplateService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesPipelineStagesPageSize';
  protected override readonly entityName = 'étapes de pipeline';
  protected override readonly entityTypeApi = 'pipeline-stages';

  advancedCriteria: PipelineStageCriteria = {};
  editFormData: PipelineStage = {};
  createFormData: Partial<PipelineStage> = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'stageLabel', label: 'Libellé', priority: 1 },
    { key: 'stageType', label: 'Type', priority: 2 },
    { key: 'stageOrder', label: 'Ordre', priority: 2 },
    { key: 'isActive', label: 'Active', priority: 2 },
    { key: 'isRequired', label: 'Obligatoire', priority: 2 },
    { key: 'isEliminatory', label: 'Éliminatoire', priority: 2 },
    { key: 'pipelineTemplateId', label: 'Template', priority: 2 },
    { key: 'configJson', label: 'Config', priority: 3 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  allTemplates = signal<PipelineTemplate[]>([]);
  createTemplateStages = signal<PipelineStage[]>([]);
  editTemplateStages = signal<PipelineStage[]>([]);
  stageTypes: StageType[] = [...STAGE_TYPES];
  templateScopedView = signal<{ id: number; name: string } | null>(null);

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadTemplates();
  }

  private loadTemplates(): void {
    this.templateService.getAllByCriteria({ size: 999 }).subscribe(res => this.allTemplates.set(res.content || []));
  }

  getTemplateName(id?: number): string {
    if (!id) return '-';
    return this.allTemplates().find(t => t.id === id)?.templateName || `#${id}`;
  }

  isTemplateLocked(templateId?: number): boolean {
    if (!templateId) {
      return false;
    }

    return !!this.allTemplates().find(template => template.id === templateId)?.isLocked;
  }

  isCreateTargetLocked(): boolean {
    return this.isTemplateLocked(this.createFormData.pipelineTemplateId);
  }

  isEditStageLocked(): boolean {
    return !!this.editFormData.isLocked;
  }

  getEditableStageTypes(currentType?: StageType, templateStages: PipelineStage[] = [], currentStageId?: number): StageType[] {
    const availableTypes = this.stageTypes;
    if (!currentType || availableTypes.includes(currentType)) {
      return availableTypes;
    }

    return [currentType, ...availableTypes];
  }

  getStageTypeLabel(type?: StageType): string {
    return type ? STAGE_TYPE_LABELS[type] || type : '-';
  }

  getConfigPlaceholder(type?: StageType): string {
    switch (type) {
      case 'QUIZ':
        return '{"passingScore":60,"allowSkip":false,"inactivityTimeoutMinutes":30}';
      case 'INTERVIEW':
        return '{"passingScore":50}';
      default:
        return '{"allowSkip":true,"passingScore":50}';
    }
  }

  getConfigHelp(type?: StageType): string {
    switch (type) {
      case 'QUIZ':
        return 'QUIZ porte le besoin métier de test et peut utiliser passingScore pour définir le seuil de validation.';
      case 'INTERVIEW':
        return 'INTERVIEW peut utiliser passingScore pour définir le seuil de validation.';
      default:
        return 'Laisse vide si ce type d’étape n’a pas besoin de configuration spécifique.';
    }
  }

  viewTemplateStages(item: PipelineStage): void {
    if (!item.pipelineTemplateId) {
      this.notificationService.warning('Attention', 'Aucun template parent trouvé pour cette étape.');
      return;
    }

    const templateId = item.pipelineTemplateId;
    const templateName = this.getTemplateName(templateId);

    this.isLoading.set(true);
    this.quickSearch = '';
    this.service.getByTemplate(templateId).subscribe({
      next: (response) => {
        if (response?.hasError) {
          this.notificationService.error('Erreur', response.status?.message || 'Erreur lors du chargement des étapes du template');
          this.isLoading.set(false);
          return;
        }

        const stages = response.items || (response.item ? [response.item] : []);
        this.templateScopedView.set({ id: templateId, name: templateName });
        this.advancedCriteria.pipelineTemplateId = templateId;
        this.currentPage.set(0);
        this.items.set(stages);
        this.totalElements.set(stages.length);
        this.totalPages.set(stages.length > 0 ? 1 : 0);
        this.isLoading.set(false);
        requestAnimationFrame(() => this.initAutoHideColumns());
      },
      error: (error) => {
        this.notificationService.error('Erreur', this.getErrorMessage(error, 'Erreur lors du chargement des étapes du template'));
        this.isLoading.set(false);
      }
    });
  }

  clearTemplateScopedView(): void {
    if (!this.templateScopedView()) {
      return;
    }

    this.templateScopedView.set(null);
    this.advancedCriteria.pipelineTemplateId = undefined;
    this.currentPage.set(0);
    this.loadItems();
  }

  override openCreateDialog(): void {
    super.openCreateDialog();

    const scopedTemplateId = this.templateScopedView()?.id;
    if (scopedTemplateId) {
      this.createFormData = {
        ...this.createFormData,
        pipelineTemplateId: scopedTemplateId
      };
      this.onCreateTemplateChange(scopedTemplateId);
      return;
    }

    this.createTemplateStages.set([]);
  }

  override openEditDialog(item: PipelineStage): void {
    super.openEditDialog(item);
    this.onEditTemplateChange(item.pipelineTemplateId);
  }

  override closeCreateDialog(): void {
    this.createTemplateStages.set([]);
    super.closeCreateDialog();
  }

  override closeEditDialog(): void {
    this.editTemplateStages.set([]);
    super.closeEditDialog();
  }

  onCreateTemplateChange(templateId?: number): void {
    this.loadTemplateStages(templateId, stages => this.createTemplateStages.set(stages));
  }

  onEditTemplateChange(templateId?: number): void {
    this.loadTemplateStages(templateId, stages => this.editTemplateStages.set(stages));
  }

  openPipelineStageWorkspace(): void {
    const scopedTemplate = this.templateScopedView();
    if (scopedTemplate?.id) {
      this.router.navigate(['/dashboard/pipeline-templates', scopedTemplate.id, 'edit']);
      return;
    }

    this.router.navigate(['/dashboard/pipeline-templates']);
  }

  override onQuickSearch(): void {
    this.templateScopedView.set(null);
    super.onQuickSearch();
  }

  override applyAdvancedSearch(): void {
    this.templateScopedView.set(null);
    super.applyAdvancedSearch();
  }

  override resetAdvancedSearch(): void {
    this.templateScopedView.set(null);
    super.resetAdvancedSearch();
  }

  override toggleDeletedItems(): void {
    this.templateScopedView.set(null);
    super.toggleDeletedItems();
  }

  override onPageSizeChange(event: Event): void {
    this.templateScopedView.set(null);
    super.onPageSizeChange(event);
  }

  private normalizeConfigJson(value: string | null | undefined): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  private validateStagePayload(stage: Partial<PipelineStage>): string | null {
    if (!stage.stageLabel?.trim()) {
      return 'Le libellé est requis';
    }
    if (!stage.stageType) {
      return 'Le type est requis';
    }
    if (!stage.pipelineTemplateId) {
      return 'Le template est requis';
    }

    const configJson = this.normalizeConfigJson(stage.configJson);

    if (configJson) {
      try {
        const parsed = JSON.parse(configJson) as Record<string, unknown>;
        if (Array.isArray(parsed) || parsed === null) {
          return 'config_json doit être un objet JSON';
        }

        if (parsed['passingScore'] !== undefined) {
          const passingScore = Number(parsed['passingScore']);
          if (Number.isNaN(passingScore) || passingScore < 0 || passingScore > 100) {
            return 'passingScore doit être compris entre 0 et 100';
          }
        }

        if (parsed['allowSkip'] !== undefined && typeof parsed['allowSkip'] !== 'boolean') {
          return 'allowSkip doit être un booléen';
        }
      } catch {
        return 'config_json doit être un JSON valide';
      }
    }

    return null;
  }

  override validateCreate(): void {
    const payload: Partial<PipelineStage> = {
      ...this.createFormData,
      stageLabel: this.createFormData.stageLabel?.trim(),
      configJson: this.normalizeConfigJson(this.createFormData.configJson)
    };

    const validationError = this.validateStagePayload(payload);
    if (validationError) {
      this.notificationService.warning('Attention', validationError);
      return;
    }

    this.performCreate(payload).subscribe({
      next: (response: any) => {
        if (response?.hasError) {
          this.notificationService.error('Erreur', response.status?.message || 'Erreur lors de la création');
          return;
        }
        this.closeCreateDialog();
        this.loadItems();
      },
      error: (error) => {
        this.notificationService.error('Erreur', error?.error?.status?.message || 'Erreur lors de la création');
      }
    });
  }

  override validateEdit(): void {
    const payload: PipelineStage = {
      ...this.editFormData,
      stageLabel: this.editFormData.stageLabel?.trim(),
      configJson: this.normalizeConfigJson(this.editFormData.configJson)
    };

    const validationError = this.validateStagePayload(payload);
    if (validationError) {
      this.notificationService.warning('Attention', validationError);
      return;
    }

    this.performUpdate(payload).subscribe({
      next: (response: any) => {
        if (response?.hasError) {
          this.notificationService.error('Erreur', response.status?.message || 'Erreur lors de la mise à jour');
          return;
        }
        this.closeEditDialog();
        this.loadItems();
      },
      error: (error) => {
        this.notificationService.error('Erreur', error?.error?.status?.message || 'Erreur lors de la mise à jour');
      }
    });
  }

  override confirmDelete(item: PipelineStage): void {
    if (item.isLocked) {
      this.notificationService.warning('Étape déjà atteinte', 'Cette étape est utilisée par des candidatures: elle sera archivée (désactivée) plutôt que supprimée.');
    }

    super.confirmDelete(item);
  }

  override deleteFromEdit(): void {
    if (this.editFormData.isLocked) {
      this.notificationService.warning('Étape déjà atteinte', 'Cette étape est utilisée par des candidatures: elle sera archivée (désactivée) plutôt que supprimée.');
    }

    super.deleteFromEdit();
  }

  protected fetchAll(criteria: PipelineStageCriteria): Observable<PagedPipelineStageResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<PipelineStage>): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: PipelineStage): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  private loadTemplateStages(templateId: number | undefined, onLoaded: (stages: PipelineStage[]) => void): void {
    if (!templateId) {
      onLoaded([]);
      return;
    }

    this.service.getByTemplate(templateId).subscribe({
      next: (response) => {
        const stages = response?.items || (response?.item ? [response.item] : []);
        onLoaded(stages);
      },
      error: () => onLoaded([])
    });
  }
}
