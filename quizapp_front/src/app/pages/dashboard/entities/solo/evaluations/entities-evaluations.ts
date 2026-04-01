import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { EvaluationService, Evaluation, PagedEvaluationResponse, EvaluationSearchCriteria } from '../../../../../core/services/evaluation.service';
import { CandidateInterviewEntityService, CandidateInterviewEntity } from '../../../../../core/services/candidate-interview-entity.service';

@Component({
  selector: 'app-entities-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-evaluations.html',
  styleUrls: ['./entities-evaluations.scss']
})
export class EntitiesEvaluationsComponent extends EntityCrudBase<Evaluation, EvaluationSearchCriteria, PagedEvaluationResponse> {
  private evaluationService = inject(EvaluationService);
  private candidateInterviewService = inject(CandidateInterviewEntityService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesEvaluationsPageSize';
  protected override readonly entityName = 'évaluations';
  protected override readonly entityTypeApi = 'evaluations';

  allCandidateInterviews = signal<CandidateInterviewEntity[]>([]);

  advancedCriteria: EvaluationSearchCriteria = {};
  editFormData: Evaluation = {};
  createFormData: Partial<Evaluation> = {};

  protected fetchAll(criteria: EvaluationSearchCriteria): Observable<PagedEvaluationResponse> {
    return this.evaluationService.getAllEvaluationsByCriteria(criteria);
  }

  protected performCreate(item: Partial<Evaluation>): Observable<any> {
    return this.evaluationService.createEvaluation(item as Evaluation, 1);
  }

  protected performUpdate(item: Evaluation): Observable<any> {
    return this.evaluationService.updateEvaluation(item);
  }

  protected performDelete(id: number): Observable<any> {
    return this.evaluationService.deleteEvaluation(id);
  }

  protected performRestore(id: number): Observable<any> {
    return this.evaluationService.restoreEvaluation(id);
  }

  protected resetAdvancedCriteriaValues(): void {
    this.advancedCriteria = {};
  }

  protected resetCreateFormData(): void {
    this.createFormData = {};
  }

  override ngOnInit() {
    super.ngOnInit();
    this.candidateInterviewService.getAllByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allCandidateInterviews.set(res.content) });
  }
}
