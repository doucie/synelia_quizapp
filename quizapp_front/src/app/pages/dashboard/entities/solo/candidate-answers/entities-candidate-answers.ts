import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { CandidateAnswersService, CandidateAnswer, PagedCandidateAnswerResponse, CandidateAnswerSearchCriteria } from '../../../../../core/services/candidate-answers.service';
import { ApplicationService, Application } from '../../../../../core/services/application.service';
import { AnswerService, Answer } from '../../../../../core/services/answer.service';
import { QuestionService, Question } from '../../../../../core/services/question.service';

@Component({
  selector: 'app-entities-candidate-answers',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-candidate-answers.html',
  styleUrls: ['./entities-candidate-answers.scss']
})
export class EntitiesCandidateAnswersComponent extends EntityCrudBase<CandidateAnswer, CandidateAnswerSearchCriteria, PagedCandidateAnswerResponse> {
  private service = inject(CandidateAnswersService);
  private applicationService = inject(ApplicationService);
  private answerService = inject(AnswerService);
  private questionService = inject(QuestionService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesCandidateAnswersPageSize';
  protected override readonly entityName = 'réponses candidat';
  protected override readonly entityTypeApi = 'candidate-answers';

  allApplications = signal<Application[]>([]);
  allAnswers = signal<Answer[]>([]);
  allQuestions = signal<Question[]>([]);

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

  override ngOnInit() {
    super.ngOnInit();
    this.applicationService.getAllApplicationsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allApplications.set(res.content) });
    this.answerService.getAllByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allAnswers.set(res.content) });
    this.questionService.getAllByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allQuestions.set(res.content) });
  }
}
