import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { EvaluationService, Evaluation, PagedEvaluationResponse, EvaluationSearchCriteria } from '../../../../../core/services/evaluation.service';

@Component({
  selector: 'app-entities-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-evaluations.html',
  styleUrls: ['./entities-evaluations.scss']
})
export class EntitiesEvaluationsComponent extends EntityCrudBase<Evaluation, EvaluationSearchCriteria, PagedEvaluationResponse> {
  private evaluationService = inject(EvaluationService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesEvaluationsPageSize';
  protected override readonly entityName = 'évaluations';

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
}
