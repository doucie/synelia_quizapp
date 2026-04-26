import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { CandidateInterviewEntityService, CandidateInterviewEntity, PagedCandidateInterviewResponse, CandidateInterviewSearchCriteria } from '../../../../../core/services/candidate-interview-entity.service';
import { EvaluationService, Evaluation } from '../../../../../core/services/evaluation.service';
import { ApplicationService, Application } from '../../../../../core/services/application.service';
import { InterviewService, Interview } from '../../../../../core/services/interview.service';

@Component({
  selector: 'app-entities-candidate-interview',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-candidate-interview.html',
  styleUrls: ['./entities-candidate-interview.scss']
})
export class EntitiesCandidateInterviewComponent extends EntityCrudBase<CandidateInterviewEntity, CandidateInterviewSearchCriteria, PagedCandidateInterviewResponse> {
  private service = inject(CandidateInterviewEntityService);
  private evaluationService = inject(EvaluationService);
  private applicationService = inject(ApplicationService);
  private interviewFkService = inject(InterviewService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesCandidateInterviewPageSize';
  protected override readonly entityName = 'entretiens candidat';
  protected override readonly entityTypeApi = 'candidate-interview';

  // Expansion
  expandedItems = signal<Set<number>>(new Set());
  childData = signal<{[id: number]: Evaluation[]}>({});
  loadingChildren = signal<{[id: number]: boolean}>({});

  allApplications = signal<Application[]>([]);
  allInterviews = signal<Interview[]>([]);

  advancedCriteria: CandidateInterviewSearchCriteria = {};
  editFormData: CandidateInterviewEntity = {};
  createFormData: Partial<CandidateInterviewEntity> = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'applicationId', label: 'Application ID', priority: 1 },
    { key: 'interviewId', label: 'Interview ID', priority: 1 },
    { key: 'startDate', label: 'Début', priority: 2 },
    { key: 'duration', label: 'Durée (min)', priority: 2 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: CandidateInterviewSearchCriteria): Observable<PagedCandidateInterviewResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<CandidateInterviewEntity>): Observable<any> { return this.service.create(item as CandidateInterviewEntity); }
  protected performUpdate(item: CandidateInterviewEntity): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  override ngOnInit() {
    super.ngOnInit();
    this.applicationService.getAllApplicationsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allApplications.set(res.content) });
    this.interviewFkService.getAllInterviewsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allInterviews.set(res.content) });
  }

  toggleExpansion(id: number) {
    if (this.expandedItems().has(id)) {
      this.expandedItems.set(new Set());
    } else {
      this.expandedItems.set(new Set([id]));
      this.loadChildren(id);
    }
  }

  isExpanded(id: number): boolean { return this.expandedItems().has(id); }

  loadChildren(id: number) {
    if (this.loadingChildren()[id]) return;
    this.loadingChildren.set({ ...this.loadingChildren(), [id]: true });
    this.evaluationService.getAllEvaluationsByCriteria({ candidateInterviewId: id, size: 100 }).subscribe({
      next: (res) => { this.childData.set({ ...this.childData(), [id]: res.content }); this.loadingChildren.set({ ...this.loadingChildren(), [id]: false }); },
      error: () => { this.childData.set({ ...this.childData(), [id]: [] }); this.loadingChildren.set({ ...this.loadingChildren(), [id]: false }); }
    });
  }

  getChildren(id: number): Evaluation[] { return this.childData()[id] || []; }
  isLoadingChildren(id: number): boolean { return this.loadingChildren()[id] || false; }
  trackByChildId(index: number, item: any): number { return item.id; }
}
