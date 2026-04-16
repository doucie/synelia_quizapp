import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { PipelineStageService, PipelineStageCriteria, PagedPipelineStageResponse } from '../../../../../core/services/pipeline-stage.service';
import { PipelineTemplateService } from '../../../../../core/services/pipeline-template.service';
import { PipelineStage, PipelineTemplate, StageType } from '../../../../../core/models/pipeline.interfaces';

@Component({
  selector: 'app-entities-pipeline-stages',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
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

  protected fetchAll(criteria: PipelineStageCriteria): Observable<PagedPipelineStageResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<PipelineStage>): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: PipelineStage): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
