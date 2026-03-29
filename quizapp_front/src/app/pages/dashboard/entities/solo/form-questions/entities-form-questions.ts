import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { FormQuestionsService, FormQuestions, PagedFormQuestionsResponse, FormQuestionsSearchCriteria } from '../../../../../core/services/form-questions.service';

@Component({
  selector: 'app-entities-form-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-form-questions.html',
  styleUrls: ['./entities-form-questions.scss']
})
export class EntitiesFormQuestionsComponent extends EntityCrudBase<FormQuestions, FormQuestionsSearchCriteria, PagedFormQuestionsResponse> {
  private service = inject(FormQuestionsService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesFormQuestionsPageSize';
  protected override readonly entityName = 'questions formulaire';

  advancedCriteria: FormQuestionsSearchCriteria = {};
  editFormData: FormQuestions = {};
  createFormData: Partial<FormQuestions> = {};

  protected fetchAll(criteria: FormQuestionsSearchCriteria): Observable<PagedFormQuestionsResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<FormQuestions>): Observable<any> { return this.service.create(item as FormQuestions); }
  protected performUpdate(item: FormQuestions): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
