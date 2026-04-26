import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { PipelineTemplateService, PipelineTemplateCriteria, PagedPipelineTemplateResponse } from '../../../../../core/services/pipeline-template.service';
import { PipelineTemplate } from '../../../../../core/models/pipeline.interfaces';

@Component({
  selector: 'app-entities-pipeline-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
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

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'name', label: 'Nom', priority: 1 },
    { key: 'description', label: 'Description', priority: 3 },
    { key: 'isDefault', label: 'Par défaut', priority: 2 },
    { key: 'active', label: 'Actif', priority: 2 },
    { key: 'locked', label: 'Verrouillé', priority: 2 },
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
}
