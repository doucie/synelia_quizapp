import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ApplicationService, Application, PagedApplicationResponse, ApplicationSearchCriteria } from '../../../../../core/services/application.service';
import { CandidateAnswersService, CandidateAnswer } from '../../../../../core/services/candidate-answers.service';
import { CandidateAskService, CandidateAsk } from '../../../../../core/services/candidate-ask.service';
import { CandidateTokenService, CandidateToken } from '../../../../../core/services/candidate-token.service';
import { CandidateInterviewEntityService, CandidateInterviewEntity } from '../../../../../core/services/candidate-interview-entity.service';
import { SourceTokenService, SourceToken, SourceTokenResponse } from '../../../../../services/source-token.service';

@Component({
  selector: 'app-entities-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-applications.html',
  styleUrl: './entities-applications.scss'
})
export class EntitiesApplicationsComponent extends EntityCrudBase<Application, ApplicationSearchCriteria, PagedApplicationResponse> {
  private applicationService = inject(ApplicationService);
  private candidateAnswersService = inject(CandidateAnswersService);
  private candidateAskService = inject(CandidateAskService);
  private candidateTokenService = inject(CandidateTokenService);
  private candidateInterviewEntityService = inject(CandidateInterviewEntityService);
  private sourceTokenFkService = inject(SourceTokenService);
  allSourceTokens = signal<SourceToken[]>([]);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesApplicationsPageSize';
  protected override readonly entityName = 'candidatures';
  protected override readonly entityTypeApi = 'applications';

  // Expansion
  expandedItems = signal<Set<number>>(new Set());
  childAnswers = signal<{[id: number]: CandidateAnswer[]}>({});
  childAsks = signal<{[id: number]: CandidateAsk[]}>({});
  childTokens = signal<{[id: number]: CandidateToken[]}>({});
  childInterviews = signal<{[id: number]: CandidateInterviewEntity[]}>({});
  loadingChildren = signal<{[id: number]: boolean}>({});
  childTab = signal<{[id: number]: string}>({});

  advancedCriteria: ApplicationSearchCriteria = {};
  editFormData: Application = {
    candidateFirstName: '',
    candidateLastName: '',
    candidateEmail: '',
    candidatePhone: '',
    candidateBirthDate: ''
  };
  createFormData: Partial<Application> = {
    candidateFirstName: '',
    candidateLastName: '',
    candidateEmail: '',
    candidatePhone: '',
    candidateBirthDate: ''
  };

  protected fetchAll(criteria: ApplicationSearchCriteria): Observable<PagedApplicationResponse> {
    return this.applicationService.getAllApplicationsByCriteria(criteria);
  }

  protected performCreate(item: Partial<Application>): Observable<any> {
    return this.applicationService.createApplication(item as Application);
  }

  protected performUpdate(item: Application): Observable<any> {
    return this.applicationService.updateApplication(item);
  }

  protected performDelete(id: number): Observable<any> {
    return this.applicationService.deleteApplication(id);
  }

  protected performRestore(id: number): Observable<any> {
    return this.applicationService.restoreApplication(id);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.sourceTokenFkService.getSourceTokensByCriteria({}).subscribe({ next: (res: SourceTokenResponse) => this.allSourceTokens.set(res.items || []) });
  }

  protected resetAdvancedCriteriaValues(): void {
    this.advancedCriteria = {};
  }

  protected resetCreateFormData(): void {
    this.createFormData = {
      candidateFirstName: '',
      candidateLastName: '',
      candidateEmail: '',
      candidatePhone: '',
      candidateBirthDate: ''
    };
  }

  override validateCreate(): void {
    if (!this.createFormData.candidateFirstName || !this.createFormData.candidateLastName ||
        !this.createFormData.candidateEmail || !this.createFormData.candidatePhone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    super.validateCreate();
  }

  truncateText(text: string | undefined, maxLength: number): string {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return '-';
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'PENDING_ARCHIVED': 'En attente (archivé)',
      'SUBMITTED': 'Soumis',
      'PRE_SCREEN_ACCEPTED': 'Pré-sélectionné',
      'PRE_SCREEN_REJECTED': 'Pré-rejeté',
      'PRE_SCREEN_REJECTED_ARCHIVED': 'Pré-rejeté (archivé)',
      'INTERVIEWING': 'En entretien',
      'FINAL_ACCEPTED': 'Accepté',
      'FINAL_ACCEPTED_ARCHIVED': 'Accepté (archivé)',
      'FINAL_REJECTED': 'Rejeté',
      'FINAL_REJECTED_ARCHIVED': 'Rejeté (archivé)'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    const classes: Record<string, string> = {
      'PENDING': 'status-pending',
      'PENDING_ARCHIVED': 'status-pending-archived',
      'SUBMITTED': 'status-submitted',
      'PRE_SCREEN_ACCEPTED': 'status-prescreen-accepted',
      'PRE_SCREEN_REJECTED': 'status-prescreen-rejected',
      'PRE_SCREEN_REJECTED_ARCHIVED': 'status-prescreen-rejected-archived',
      'INTERVIEWING': 'status-interviewing',
      'FINAL_ACCEPTED': 'status-final-accepted',
      'FINAL_ACCEPTED_ARCHIVED': 'status-final-accepted-archived',
      'FINAL_REJECTED': 'status-final-rejected',
      'FINAL_REJECTED_ARCHIVED': 'status-final-rejected-archived'
    };
    return classes[status] || '';
  }

  toggleExpansion(id: number) {
    const s = new Set(this.expandedItems());
    if (s.has(id)) { s.delete(id); } else { s.add(id); this.loadChildren(id); }
    this.expandedItems.set(s);
  }

  isExpanded(id: number): boolean { return this.expandedItems().has(id); }

  getChildTab(id: number): string { return this.childTab()[id] || 'answers'; }
  setChildTab(id: number, tab: string) { this.childTab.set({ ...this.childTab(), [id]: tab }); }

  loadChildren(id: number) {
    if (this.loadingChildren()[id]) return;
    this.loadingChildren.set({ ...this.loadingChildren(), [id]: true });
    let loaded = 0;
    const done = () => { loaded++; if (loaded >= 4) this.loadingChildren.set({ ...this.loadingChildren(), [id]: false }); };
    this.candidateAnswersService.getAllByCriteria({ applicationId: id, size: 100 }).subscribe({
      next: (r) => { this.childAnswers.set({ ...this.childAnswers(), [id]: r.content }); done(); },
      error: () => { this.childAnswers.set({ ...this.childAnswers(), [id]: [] }); done(); }
    });
    this.candidateAskService.getAllByCriteria({ applicationId: id, size: 100 }).subscribe({
      next: (r) => { this.childAsks.set({ ...this.childAsks(), [id]: r.content }); done(); },
      error: () => { this.childAsks.set({ ...this.childAsks(), [id]: [] }); done(); }
    });
    this.candidateTokenService.getAllByCriteria({ applicationId: id, size: 100 }).subscribe({
      next: (r) => { this.childTokens.set({ ...this.childTokens(), [id]: r.content }); done(); },
      error: () => { this.childTokens.set({ ...this.childTokens(), [id]: [] }); done(); }
    });
    this.candidateInterviewEntityService.getAllByCriteria({ applicationId: id, size: 100 }).subscribe({
      next: (r) => { this.childInterviews.set({ ...this.childInterviews(), [id]: r.content }); done(); },
      error: () => { this.childInterviews.set({ ...this.childInterviews(), [id]: [] }); done(); }
    });
  }

  getAnswers(id: number): CandidateAnswer[] { return this.childAnswers()[id] || []; }
  getAsks(id: number): CandidateAsk[] { return this.childAsks()[id] || []; }
  getTokens(id: number): CandidateToken[] { return this.childTokens()[id] || []; }
  getInterviews(id: number): CandidateInterviewEntity[] { return this.childInterviews()[id] || []; }
  isLoadingChildren(id: number): boolean { return this.loadingChildren()[id] || false; }
  trackByChildId(index: number, item: any): number { return item.id; }
}
