import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { CandidateAnswersService, CandidateAnswer, PagedCandidateAnswerResponse, CandidateAnswerSearchCriteria } from '../../../../../core/services/candidate-answers.service';

@Component({
  selector: 'app-entities-candidate-answers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-candidate-answers.html',
  styleUrls: ['./entities-candidate-answers.scss']
})
export class EntitiesCandidateAnswersComponent extends EntityCrudBase<CandidateAnswer, CandidateAnswerSearchCriteria, PagedCandidateAnswerResponse> {
  private service = inject(CandidateAnswersService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesCandidateAnswersPageSize';
  protected override readonly entityName = 'réponses candidat';

  advancedCriteria: CandidateAnswerSearchCriteria = {};
  editFormData: CandidateAnswer = {};
  createFormData: Partial<CandidateAnswer> = {};

  protected fetchAll(criteria: CandidateAnswerSearchCriteria): Observable<PagedCandidateAnswerResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<CandidateAnswer>): Observable<any> { return this.service.create(item as CandidateAnswer); }
  protected performUpdate(item: CandidateAnswer): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
