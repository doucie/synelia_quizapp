import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { FormQuestionsService, FormQuestions, PagedFormQuestionsResponse, FormQuestionsSearchCriteria } from '../../../../../core/services/form-questions.service';
import { FormVersionService, FormVersion } from '../../../../../core/services/form-version.service';
import { QuestionService, Question } from '../../../../../core/services/question.service';

@Component({
  selector: 'app-entities-form-questions',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-form-questions.html',
  styleUrls: ['./entities-form-questions.scss']
})
export class EntitiesFormQuestionsComponent extends EntityCrudBase<FormQuestions, FormQuestionsSearchCriteria, PagedFormQuestionsResponse> {
  private service = inject(FormQuestionsService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesFormQuestionsPageSize';
  protected override readonly entityName = 'questions formulaire';
  protected override readonly entityTypeApi = 'form-questions';

  // FK dropdowns
  private fvService = inject(FormVersionService);
  private questionService = inject(QuestionService);
  allFormVersions = signal<FormVersion[]>([]);
  allQuestions = signal<Question[]>([]);

  override ngOnInit(): void {
    super.ngOnInit();
    this.fvService.getAllByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({
      next: (res) => this.allFormVersions.set(res.content)
    });
    this.questionService.getAllByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({
      next: (res) => this.allQuestions.set(res.content)
    });
  }

  advancedCriteria: FormQuestionsSearchCriteria = {};
  editFormData: FormQuestions = {};
  createFormData: Partial<FormQuestions> = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'order', label: 'Ordre', priority: 1 },
    { key: 'chronoOverride', label: 'Chrono Override', priority: 3 },
    { key: 'versionId', label: 'Version ID', priority: 2 },
    { key: 'questionId', label: 'Question ID', priority: 2 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: FormQuestionsSearchCriteria): Observable<PagedFormQuestionsResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<FormQuestions>): Observable<any> { return this.service.create(item as FormQuestions); }
  protected performUpdate(item: FormQuestions): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
