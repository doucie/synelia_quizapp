import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { FilterCheckboxComponent } from '../../../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { DecisionService, Decision, PagedDecisionResponse, DecisionCriteria } from '../../../../../core/services/decision.service';
import { ApplicationService, Application } from '../../../../../core/services/application.service';
import { PipelineStageService } from '../../../../../core/services/pipeline-stage.service';
import { UserService, User } from '../../../../../core/services/user.service';

interface DecisionPipelineStageRef {
  id?: number;
  stageLabel?: string;
  stageType?: string;
}

@Component({
  selector: 'app-entities-decisions',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-decisions.html',
  styleUrls: ['./entities-decisions.scss']
})
export class EntitiesDecisionsComponent extends EntityCrudBase<Decision, DecisionCriteria, PagedDecisionResponse> {
  private service = inject(DecisionService);
  private applicationService = inject(ApplicationService);
  private pipelineStageService = inject(PipelineStageService);
  private userService = inject(UserService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesDecisionsPageSize';
  protected override readonly entityName = 'décisions';
  protected override readonly entityTypeApi = 'decisions';

  allApplications = signal<Application[]>([]);
  allPipelineStages = signal<DecisionPipelineStageRef[]>([]);
  allUsers = signal<User[]>([]);

  advancedCriteria: DecisionCriteria = {};
  editFormData: Decision = { decisionType: '', isCancel: false, applicationId: 0, userId: 0 };
  createFormData: Partial<Decision> = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'applicationId', label: 'Candidature', priority: 1 },
    { key: 'userId', label: 'Utilisateur', priority: 2 },
    { key: 'decisionType', label: 'Type Décision', priority: 1 },
    { key: 'cancelled', label: 'Annulée', priority: 2 },
    { key: 'pipelineStage', label: 'Étape Pipeline', priority: 2 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: DecisionCriteria): Observable<PagedDecisionResponse> { return this.service.getAllDecisionsByCriteria(criteria); }
  protected performCreate(item: Partial<Decision>): Observable<any> { return this.service.createDecision(item as Decision); }
  protected performUpdate(item: Decision): Observable<any> { return this.service.updateDecision(item as Decision); }
  protected performDelete(id: number): Observable<any> { return this.service.deleteDecision(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restoreDecision(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  override ngOnInit() {
    super.ngOnInit();
    this.applicationService.getAllApplicationsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allApplications.set(res.content) });
    this.pipelineStageService.getAllByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allPipelineStages.set(res.content) });
    this.userService.getByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allUsers.set(res.content) });
  }

  getApplicationDisplay(applicationId?: number): string {
    if (!applicationId) {
      return '-';
    }

    const application = this.allApplications().find((item) => item.id === applicationId);
    if (!application) {
      return `#${applicationId}`;
    }

    const fullName = [application.candidateFirstName, application.candidateLastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (fullName) {
      return `#${applicationId} - ${fullName}`;
    }

    if (application.candidateEmail) {
      return `#${applicationId} - ${application.candidateEmail}`;
    }

    return `#${applicationId}`;
  }

  getUserDisplay(userId?: number): string {
    if (!userId) {
      return '-';
    }

    const user = this.allUsers().find((item) => item.id === userId);
    if (!user) {
      return `#${userId}`;
    }

    const fullName = [user.prenom || user.firstName, user.nom || user.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (fullName && user.email) {
      return `${fullName} (${user.email})`;
    }

    return fullName || user.email || `#${userId}`;
  }

  getPipelineStageDisplay(pipelineStageId?: number): string {
    if (!pipelineStageId) {
      return '-';
    }

    const pipelineStage = this.allPipelineStages().find((item) => item.id === pipelineStageId);
    if (!pipelineStage) {
      return `#${pipelineStageId}`;
    }

    const label = pipelineStage.stageLabel || pipelineStage.stageType;
    return label ? `${label} (#${pipelineStageId})` : `#${pipelineStageId}`;
  }
}
