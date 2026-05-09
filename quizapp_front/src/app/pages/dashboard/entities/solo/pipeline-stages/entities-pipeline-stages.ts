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
import { PipelineStage, PipelineTemplate, StageType } from '../../../../../core/models/pipeline.interfaces';

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
    { key: 'label', label: 'Libellé', priority: 1 },
    { key: 'type', label: 'Type', priority: 2 },
    { key: 'order', label: 'Ordre', priority: 2 },
    { key: 'mandatory', label: 'Obligatoire', priority: 2 },
    { key: 'eliminatory', label: 'Éliminatoire', priority: 2 },
    { key: 'template', label: 'Template', priority: 2 },
    { key: 'config', label: 'Config', priority: 3 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  allTemplates = signal<PipelineTemplate[]>([]);
  stageTypes: StageType[] = ['CANDIDATURE', 'QUIZ', 'PRESELECTION', 'INTERVIEW', 'TECHNICAL_TEST', 'EVALUATION', 'DECISION', 'CUSTOM'];

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

  getStageTypeLabel(type?: StageType): string {
    const labels: Record<StageType, string> = {
      CANDIDATURE: 'Candidature', QUIZ: 'Quiz', PRESELECTION: 'Présélection', INTERVIEW: 'Entretien',
      TECHNICAL_TEST: 'Test technique', EVALUATION: 'Évaluation', DECISION: 'Décision', CUSTOM: 'Personnalisé'
    };
    return type ? labels[type] || type : '-';
  }

  getConfigPlaceholder(type?: StageType): string {
    switch (type) {
      case 'TECHNICAL_TEST':
        return '{"testMode":"INTERNAL","passingScore":60} ou {"testMode":"EXTERNAL","externalUrl":"https://...","passingScore":60}';
      case 'EVALUATION':
        return '{"passingScore":50,"allowSkip":false}';
      case 'CUSTOM':
        return '{"label":"Étape libre","allowSkip":true}';
      case 'INTERVIEW':
        return '{"passingScore":50}';
      default:
        return '{"allowSkip":true,"passingScore":50}';
    }
  }

  getConfigHelp(type?: StageType): string {
    switch (type) {
      case 'TECHNICAL_TEST':
        return 'TECHNICAL_TEST exige un JSON avec testMode INTERNAL ou EXTERNAL. Si EXTERNAL, externalUrl est obligatoire.';
      case 'CUSTOM':
        return 'CUSTOM exige un JSON non vide. Utilise-le pour définir le comportement métier attendu de l’étape.';
      case 'EVALUATION':
        return 'EVALUATION peut utiliser passingScore pour définir le seuil de validation.';
      case 'INTERVIEW':
        return 'INTERVIEW peut utiliser passingScore pour définir le seuil de validation si aucune étape EVALUATION n’existe.';
      default:
        return 'Laisse vide si ce type d’étape n’a pas besoin de configuration spécifique.';
    }
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
    if (stage.stageType === 'TECHNICAL_TEST' && !configJson) {
      return 'TECHNICAL_TEST exige un config_json';
    }
    if (stage.stageType === 'CUSTOM' && !configJson) {
      return 'CUSTOM exige un config_json';
    }

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

        if (stage.stageType === 'TECHNICAL_TEST') {
          const testMode = String(parsed['testMode'] ?? '').toUpperCase();
          if (testMode !== 'INTERNAL' && testMode !== 'EXTERNAL') {
            return 'TECHNICAL_TEST attend testMode INTERNAL ou EXTERNAL';
          }
          if (testMode === 'EXTERNAL' && !String(parsed['externalUrl'] ?? '').trim()) {
            return 'TECHNICAL_TEST externe: externalUrl est requis';
          }
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

  protected fetchAll(criteria: PipelineStageCriteria): Observable<PagedPipelineStageResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<PipelineStage>): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: PipelineStage): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
