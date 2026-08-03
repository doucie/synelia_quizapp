import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { FilterCheckboxComponent } from '../../../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { ApplicationService, Application, ApplicationQuizAttemptSummary, PagedApplicationResponse, ApplicationSearchCriteria } from '../../../../../core/services/application.service';
import { CandidateAnswersService, CandidateAnswer } from '../../../../../core/services/candidate-answers.service';
import { CandidateAskService, CandidateAsk } from '../../../../../core/services/candidate-ask.service';
import { CandidateTokenService, CandidateToken } from '../../../../../core/services/candidate-token.service';
import { CandidateInterviewEntityService, CandidateInterviewEntity } from '../../../../../core/services/candidate-interview-entity.service';
import { ApplicationProgressService } from '../../../../../core/services/application-progress.service';
import { DecisionService, Decision } from '../../../../../core/services/decision.service';
import { EvaluationService, Evaluation, EvaluationItem } from '../../../../../core/services/evaluation.service';
import { ApplicationProgress } from '../../../../../core/models/pipeline.interfaces';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { EntityPermissionService } from '../../../../../core/services/entity-permission.service';
import { PermissionService } from '../../../../../core/services/permission.service';
import { SourceTokenService, SourceToken, SourceTokenResponse } from '../../../../../services/source-token.service';
import { FormVersionService, FormVersion } from '../../../../../core/services/form-version.service';
import { getManualCorrectionStatusClass, getManualCorrectionStatusLabel, ManualCorrectionStatus } from '../../../../../core/constants/manual-correction-status.constants';
import { resolveApplicationStatusFromMirrors } from '../../../../../core/constants/application-status.constants';
import {
  formatEvaluationItemValue as formatEvaluationItemDisplayValue,
  getEvaluationItemLabel as getEvaluationItemDisplayLabel,
  getEvaluationItemNote as getEvaluationItemDisplayNote,
  resolveCandidateMark as resolveEvaluationCandidateMark
} from '../../../../../core/utils/evaluation-score.utils';

interface QuestionManualCorrectionDraft {
  manualCorrectionScore: number | null;
  manualCorrectionComment: string;
}

interface AnswerAttemptGroup {
  key: string;
  applicationQuizAttemptId: number | null;
  label: string;
  isLegacy: boolean;
  quizToken: string | null;
  quizStatus: string | null;
  manualCorrectionStatus: string | null;
  score: number | null;
  scorePercent: number | null;
  createdAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  lastActivityAt: string | null;
  answers: CandidateAnswer[];
}

interface InterviewEvaluationEntry {
  id?: number;
  candidateInterviewId?: number;
  interviewId?: number | null;
  interviewLabel: string;
  interviewDate?: string | null;
  interviewStatus?: string | null;
  candidateMark?: number;
  recruiterComment?: string;
  evaluationItems: EvaluationItem[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  isDeleted?: boolean;
}

@Component({
  selector: 'app-entities-applications',
  standalone: true,
  imports: [FilterSelectComponent, FilterSelectOptionDirective, CommonModule, FormsModule, FilterCheckboxComponent, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-applications.html',
  styleUrl: './entities-applications.scss'
})
export class EntitiesApplicationsComponent extends EntityCrudBase<Application, ApplicationSearchCriteria, PagedApplicationResponse> {
  private applicationService = inject(ApplicationService);
  private candidateAnswersService = inject(CandidateAnswersService);
  private candidateAskService = inject(CandidateAskService);
  private candidateTokenService = inject(CandidateTokenService);
  private candidateInterviewEntityService = inject(CandidateInterviewEntityService);
  private applicationProgressService = inject(ApplicationProgressService);
  private decisionService = inject(DecisionService);
  private evaluationService = inject(EvaluationService);
  private authService = inject(AuthService);
  private entityPermissionService = inject(EntityPermissionService);
  private permissionService = inject(PermissionService);
  private sourceTokenFkService = inject(SourceTokenService);
  private formVersionFkService = inject(FormVersionService);
  allSourceTokens = signal<SourceToken[]>([]);
  allFormVersions = signal<FormVersion[]>([]);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesApplicationsPageSize';
  protected override readonly entityName = 'candidatures';
  protected override readonly entityTypeApi = 'applications';

  // Expansion
  expandedItems = signal<Set<number>>(new Set());
  childAnswers = signal<{[id: number]: CandidateAnswer[]}>({});
  childAnswerGroups = signal<{[id: number]: AnswerAttemptGroup[]}>({});
  childQuizAttempts = signal<{[id: number]: ApplicationQuizAttemptSummary[]}>({});
  childAsks = signal<{[id: number]: CandidateAsk[]}>({});
  childTokens = signal<{[id: number]: CandidateToken[]}>({});
  childInterviews = signal<{[id: number]: CandidateInterviewEntity[]}>({});
  childDecisions = signal<{[id: number]: Decision[]}>({});
  childProgresses = signal<{[id: number]: ApplicationProgress[]}>({});
  childInterviewEvaluations = signal<{[id: number]: InterviewEvaluationEntry[]}>({});
  loadingChildren = signal<{[id: number]: boolean}>({});
  childTab = signal<{[id: number]: string}>({});
  manualCorrectionDrafts = signal<Record<number, { manualIsCorrect: boolean | null; manualCorrectionComment: string }>>({});
  manualCorrectionSaving = signal<Set<number>>(new Set());
  manualQuestionCorrectionDrafts = signal<Record<string, QuestionManualCorrectionDraft>>({});
  manualQuestionCorrectionSaving = signal<Set<string>>(new Set());
  quizAttemptCreationLoading = signal<Set<number>>(new Set());
  campaignPermissionKeys = signal<Record<number, string[]>>({});
  campaignPermissionLoading = signal<Set<number>>(new Set());

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

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'candidate', label: 'Candidat', priority: 1 },
    { key: 'email', label: 'Email', priority: 2 },
    { key: 'phone', label: 'Téléphone', priority: 3 },
    { key: 'status', label: 'Statut', priority: 2 },
    { key: 'quizScore', label: 'Quiz courant', priority: 2 },
    { key: 'preselectionCurrent', label: 'Pré-sélection courante', priority: 2 },
    { key: 'interviewCurrent', label: 'Entretien courant', priority: 2 },
    { key: 'evaluationCurrent', label: 'Évaluation courante', priority: 2 },
    { key: 'finalDecisionCurrent', label: 'Décision finale courante', priority: 2 },
    { key: 'pipelineCurrent', label: 'Étape courante', priority: 2 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

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
    this.sourceTokenFkService.getSourceTokensByCriteria({}).subscribe({
      next: (res: SourceTokenResponse) => {
        this.allSourceTokens.set(res.items || []);
        this.expandedItems().forEach(id => this.ensureManualCorrectionPermissionForApplicationId(id));
      }
    });
    this.formVersionFkService.getAllByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allFormVersions.set(res.content) });
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
      'FINAL_REJECTED_ARCHIVED': 'Rejeté (archivé)',
      'WITHDRAWN': 'Retiré'
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
      'FINAL_REJECTED_ARCHIVED': 'status-final-rejected-archived',
      'WITHDRAWN': 'status-withdrawn'
    };
    return classes[status] || '';
  }

  getDisplayStatusLabel(application?: Application | null): string {
    if (!application) {
      return '-';
    }

    const finalDecisionType = this.getCurrentFinalDecisionType(application);
    if (finalDecisionType) {
      return this.getCurrentFinalDecisionLabel(finalDecisionType);
    }

    const currentStageType = this.getCurrentPipelineStageType(application);
    if (currentStageType === 'INTERVIEW' || currentStageType === 'EVALUATION' || this.getCurrentInterviewStatus(application)) {
      return this.getCurrentPipelineStageLabel(application) || 'Entretien';
    }

    const preselectionDecisionType = this.getCurrentPreselectionDecisionType(application);
    if (preselectionDecisionType) {
      return this.getCurrentPreselectionDecisionLabel(preselectionDecisionType);
    }

    if (currentStageType === 'PRESELECTION') {
      return this.getCurrentPipelineStageLabel(application) || 'Pré-sélection';
    }

    if (currentStageType === 'QUIZ' || currentStageType === 'TECHNICAL_TEST' || this.hasCurrentQuizSummary(application)) {
      return this.getCurrentPipelineStageLabel(application) || 'Quiz';
    }

    if (currentStageType === 'DECISION') {
      return this.getCurrentPipelineStageLabel(application) || 'Décision finale';
    }

    return this.getStatusLabel(resolveApplicationStatusFromMirrors(application));
  }

  getDisplayStatusClass(application?: Application | null): string {
    if (!application) {
      return '';
    }

    const finalDecisionType = this.getCurrentFinalDecisionType(application);
    if (finalDecisionType) {
      return this.getCurrentFinalDecisionClass(finalDecisionType);
    }

    const currentStageType = this.getCurrentPipelineStageType(application);
    if (currentStageType === 'INTERVIEW' || currentStageType === 'EVALUATION' || this.getCurrentInterviewStatus(application)) {
      return 'status-interviewing';
    }

    const preselectionDecisionType = this.getCurrentPreselectionDecisionType(application);
    if (preselectionDecisionType) {
      return this.getCurrentPreselectionDecisionClass(preselectionDecisionType);
    }

    if (currentStageType === 'PRESELECTION' || currentStageType === 'DECISION') {
      return 'status-pending';
    }

    if (currentStageType === 'QUIZ' || currentStageType === 'TECHNICAL_TEST' || this.hasCurrentQuizSummary(application)) {
      return 'status-submitted';
    }

    return this.getStatusClass(resolveApplicationStatusFromMirrors(application));
  }

  getManualCorrectionStatusLabel(status: ManualCorrectionStatus | string | undefined): string {
    return getManualCorrectionStatusLabel(status);
  }

  getManualCorrectionStatusClass(status: ManualCorrectionStatus | string | undefined): string {
    return getManualCorrectionStatusClass(status);
  }

  getResolvedAskStatus(item: CandidateAsk): string {
    return item.askStatus || (item.isVerified ? 'APPROVED' : 'PENDING');
  }

  getAskStatusLabel(item: CandidateAsk): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      APPROVED: 'Validée',
      REJECTED: 'Refusée'
    };
    const status = this.getResolvedAskStatus(item);
    return labels[status] || status;
  }

  getAskStatusBadgeClass(item: CandidateAsk): string {
    const status = this.getResolvedAskStatus(item);
    if (status === 'APPROVED') {
      return 'active';
    }
    if (status === 'REJECTED') {
      return 'inactive';
    }
    return 'pending';
  }

  getAskRequestTypeLabel(item: CandidateAsk): string {
    const labels: Record<string, string> = {
      IDENTITY: 'Correction identité',
      EMAIL: 'Correction email',
      PHONE: 'Correction téléphone'
    };
    return labels[item.requestType || ''] || item.requestType || 'Demande candidat';
  }

  getAskRequestedSummary(item: CandidateAsk): string {
    switch ((item.requestType || '').toUpperCase()) {
      case 'IDENTITY': {
        const fullName = [item.firstName, item.lastName].filter(Boolean).join(' ').trim();
        return fullName ? `Nouvelle identité demandée : ${fullName}` : 'Nouvelle identité demandée';
      }
      case 'EMAIL':
        return item.newEmail ? `Nouvel email demandé : ${item.newEmail}` : 'Nouvel email demandé';
      case 'PHONE':
        return item.newPhone ? `Nouveau téléphone demandé : ${item.newPhone}` : 'Nouveau téléphone demandé';
      default: {
        const parts = [
          [item.firstName, item.lastName].filter(Boolean).join(' ').trim(),
          item.newEmail,
          item.newPhone
        ].filter(Boolean);
        return parts.length ? parts.join(' - ') : 'Demande candidat';
      }
    }
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

  getChildTab(id: number): string { return this.childTab()[id] || 'answers'; }
  setChildTab(id: number, tab: string) { this.childTab.set({ ...this.childTab(), [id]: tab }); }

  loadChildren(id: number) {
    if (this.loadingChildren()[id]) return;
    this.ensureManualCorrectionPermissionForApplicationId(id);
    this.loadingChildren.set({ ...this.loadingChildren(), [id]: true });
    let loaded = 0;
    const done = () => { loaded++; if (loaded >= 7) this.loadingChildren.set({ ...this.loadingChildren(), [id]: false }); };
    this.candidateAnswersService.getAllByCriteria({ applicationId: id, size: 100 }).subscribe({
      next: (r) => {
        const answers = r.content || [];
        this.childAnswers.set({ ...this.childAnswers(), [id]: answers });
        this.refreshAnswerAttemptGroups(id);
        this.seedManualCorrectionDrafts(answers);
        this.seedManualQuestionCorrectionDrafts(answers);
        done();
      },
      error: () => {
        this.childAnswers.set({ ...this.childAnswers(), [id]: [] });
        this.refreshAnswerAttemptGroups(id);
        done();
      }
    });
    this.applicationService.getApplicationDetail(id).subscribe({
      next: (application) => {
        this.childQuizAttempts.set({ ...this.childQuizAttempts(), [id]: application?.quizAttempts || [] });
        this.refreshAnswerAttemptGroups(id);
        done();
      },
      error: () => {
        this.childQuizAttempts.set({ ...this.childQuizAttempts(), [id]: [] });
        this.refreshAnswerAttemptGroups(id);
        done();
      }
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
      next: (r) => {
        const interviews = r.content || [];
        this.childInterviews.set({ ...this.childInterviews(), [id]: interviews });
        this.loadInterviewEvaluations(id, interviews, done);
      },
      error: () => {
        this.childInterviews.set({ ...this.childInterviews(), [id]: [] });
        this.childInterviewEvaluations.set({ ...this.childInterviewEvaluations(), [id]: [] });
        done();
      }
    });
    this.decisionService.getDecisionsByApplicationId(id).subscribe({
      next: (r) => { this.childDecisions.set({ ...this.childDecisions(), [id]: this.sortDecisionsForDisplay(r.items || []) }); done(); },
      error: () => { this.childDecisions.set({ ...this.childDecisions(), [id]: [] }); done(); }
    });
    this.applicationProgressService.getByApplication(id).subscribe({
      next: (response) => {
        const progresses = response?.items || (response?.item ? [response.item] : []);
        this.childProgresses.set({ ...this.childProgresses(), [id]: this.sortApplicationProgressesForDisplay(progresses) });
        done();
      },
      error: () => {
        this.childProgresses.set({ ...this.childProgresses(), [id]: [] });
        done();
      }
    });
  }

  getAnswers(id: number): CandidateAnswer[] { return this.childAnswers()[id] || []; }
  getAnswerAttemptGroups(id: number): AnswerAttemptGroup[] { return this.childAnswerGroups()[id] || []; }
  getQuizAttempts(id: number): ApplicationQuizAttemptSummary[] { return this.childQuizAttempts()[id] || []; }
  getAsks(id: number): CandidateAsk[] { return this.childAsks()[id] || []; }
  getTokens(id: number): CandidateToken[] { return this.childTokens()[id] || []; }
  getInterviews(id: number): CandidateInterviewEntity[] { return this.sortInterviewsForDisplay(this.childInterviews()[id] || []); }
  getInterviewEvaluations(id: number): InterviewEvaluationEntry[] { return this.childInterviewEvaluations()[id] || []; }
  getDecisions(id: number): Decision[] { return this.childDecisions()[id] || []; }
  getApplicationProgresses(id: number): ApplicationProgress[] { return this.childProgresses()[id] || []; }
  isLoadingChildren(id: number): boolean { return this.loadingChildren()[id] || false; }
  trackByChildId(index: number, item: any): number { return item.id; }
  trackByAnswerAttemptGroup(index: number, group: AnswerAttemptGroup): string { return group.key; }

  getCurrentQuizAttemptGroup(id: number): AnswerAttemptGroup | null {
    return this.getAnswerAttemptGroups(id).find(group => !group.isLegacy) || null;
  }

  getCurrentQuizStatus(application?: Application | null): string {
    const currentAttempt = application?.id ? this.getCurrentQuizAttemptGroup(application.id) : null;
    return currentAttempt?.quizStatus || '';
  }

  getCurrentQuizScorePercent(application?: Application | null): number | null {
    const currentAttempt = application?.id ? this.getCurrentQuizAttemptGroup(application.id) : null;
    return currentAttempt?.scorePercent ?? null;
  }

  getCurrentQuizManualCorrectionStatus(application?: Application | null): string {
    const currentAttempt = application?.id ? this.getCurrentQuizAttemptGroup(application.id) : null;
    if (currentAttempt?.manualCorrectionStatus && currentAttempt.manualCorrectionStatus !== 'NOT_REQUIRED') {
      return currentAttempt.manualCorrectionStatus;
    }
    return '';
  }

  getCurrentQuizToken(application?: Application | null): string {
    const currentAttempt = application?.id ? this.getCurrentQuizAttemptGroup(application.id) : null;
    return currentAttempt?.quizToken || '';
  }

  getQuizAttemptStatusLabel(status?: string | null): string {
    switch ((status || '').trim().toUpperCase()) {
      case 'PENDING':
        return 'En attente';
      case 'STARTED':
        return 'En cours';
      case 'COMPLETED':
        return 'Termine';
      default:
        return status || '';
    }
  }

  getQuizAttemptStatusClass(status?: string | null): string {
    switch ((status || '').trim().toUpperCase()) {
      case 'PENDING':
        return 'attempt-status-pending';
      case 'STARTED':
        return 'attempt-status-started';
      case 'COMPLETED':
        return 'attempt-status-completed';
      default:
        return '';
    }
  }

  getCurrentInterview(id: number): CandidateInterviewEntity | null {
    return this.getInterviews(id)[0] || null;
  }

  getCurrentInterviewStatus(application?: Application | null): string {
    if (!application) {
      return '';
    }

    return this.getCurrentInterview(application.id || 0)?.interviewStatus || application.interviewStatus || '';
  }

  getCurrentInterviewDate(application?: Application | null): string {
    if (!application) {
      return '';
    }

    const interview = this.getCurrentInterview(application.id || 0);
    return this.getInterviewDisplayDate(interview) || application.interviewDate || '';
  }

  getInterviewStatusLabel(status?: string | null): string {
    switch ((status || '').trim().toUpperCase()) {
      case 'PENDING':
        return 'En attente';
      case 'SCHEDULED':
        return 'Planifié';
      case 'STARTED':
        return 'En cours';
      case 'OVER':
        return 'Terminé';
      case 'PASSED':
        return 'Réussi';
      case 'FAILED':
        return 'Échoué';
      case 'POSTPONED':
        return 'Reporté';
      case 'ARCHIVED':
        return 'Archivé';
      default:
        return status || '';
    }
  }

  getInterviewStatusClass(status?: string | null): string {
    switch ((status || '').trim().toUpperCase()) {
      case 'PENDING':
        return 'interview-status-pending';
      case 'SCHEDULED':
        return 'interview-status-scheduled';
      case 'STARTED':
        return 'interview-status-started';
      case 'OVER':
      case 'PASSED':
        return 'interview-status-over';
      case 'FAILED':
        return 'interview-status-failed';
      case 'POSTPONED':
        return 'interview-status-postponed';
      case 'ARCHIVED':
        return 'interview-status-archived';
      default:
        return '';
    }
  }

  getInterviewDisplayDate(interview?: CandidateInterviewEntity | null): string {
    return interview?.interviewDate || interview?.interviewStart || '';
  }

  getInterviewResponseSummary(interview?: CandidateInterviewEntity | null): string {
    if (!interview) {
      return '';
    }
    if (interview.alternativeDateRequested) {
      return `Replanification demandée pour le ${interview.alternativeDateRequested}`;
    }
    if (interview.declineReason) {
      return `Refus candidat : ${interview.declineReason}`;
    }
    return '';
  }

  getInterviewEvaluationAverageLabel(interview?: CandidateInterviewEntity | null): string {
    if (interview?.evaluationPercentage == null) {
      return '';
    }
    return `Moyenne ${this.formatAttemptNumber(interview.evaluationPercentage)}`;
  }

  getInterviewEvaluationSummary(interview?: CandidateInterviewEntity | null): string {
    if (!interview) {
      return '';
    }

    const parts: string[] = [];
    if (interview.evaluationScore != null) {
      parts.push(`${this.formatAttemptNumber(interview.evaluationScore)} pts`);
    }
    if (interview.evaluationNumber != null) {
      parts.push(`${this.formatAttemptNumber(interview.evaluationNumber)} évaluation${interview.evaluationNumber > 1 ? 's' : ''}`);
    }
    return parts.join(' - ');
  }

  hasCurrentQuizSummary(application: Application): boolean {
    return !!this.getCurrentQuizStatus(application)
      || this.getCurrentQuizScorePercent(application) != null
      || !!this.getCurrentQuizManualCorrectionStatus(application)
      || !!this.getCurrentQuizToken(application);
  }

  hasCurrentInterviewSummary(application: Application): boolean {
    return !!this.getCurrentInterviewStatus(application) || !!this.getCurrentInterviewDate(application);
  }

  hasCurrentPreselectionSummary(application: Application): boolean {
    return !!this.getCurrentPreselectionDecisionType(application) || !!this.getCurrentPreselectionDecisionDate(application);
  }

  getCurrentPreselectionDecision(application?: Application | null): Decision | null {
    return this.getCurrentDecisionByTypes(application, ['PRE_SCREEN_ACCEPTED', 'PRE_SCREEN_REJECTED']);
  }

  getCurrentPreselectionDecisionType(application?: Application | null): string {
    const runtimeDecision = this.getCurrentPreselectionDecision(application);
    if (runtimeDecision?.decisionType) {
      return runtimeDecision.decisionType;
    }

    if (application?.id && this.hasLoadedDecisions(application.id)) {
      return '';
    }

    return application?.currentPreselectionDecisionType || '';
  }

  getCurrentPreselectionDecisionDate(application?: Application | null): string {
    const runtimeDecision = this.getCurrentPreselectionDecision(application);
    if (runtimeDecision) {
      return this.getDecisionDisplayDate(runtimeDecision);
    }

    if (application?.id && this.hasLoadedDecisions(application.id)) {
      return '';
    }

    return application?.currentPreselectionDecisionDate || '';
  }

  getCurrentPreselectionDecisionLabel(decisionType?: string | null): string {
    switch ((decisionType || '').trim().toUpperCase()) {
      case 'PRE_SCREEN_ACCEPTED':
        return 'Acceptée';
      case 'PRE_SCREEN_REJECTED':
        return 'Refusée';
      default:
        return decisionType || '';
    }
  }

  getCurrentPreselectionDecisionClass(decisionType?: string | null): string {
    switch ((decisionType || '').trim().toUpperCase()) {
      case 'PRE_SCREEN_ACCEPTED':
        return 'status-prescreen-accepted';
      case 'PRE_SCREEN_REJECTED':
        return 'status-prescreen-rejected';
      default:
        return '';
    }
  }

  hasCurrentFinalDecisionSummary(application: Application): boolean {
    return !!this.getCurrentFinalDecisionType(application) || !!this.getCurrentFinalDecisionDate(application);
  }

  getCurrentFinalDecision(application?: Application | null): Decision | null {
    return this.getCurrentDecisionByTypes(application, ['FINAL_ACCEPTED', 'FINAL_REJECTED']);
  }

  getCurrentFinalDecisionType(application?: Application | null): string {
    const runtimeDecision = this.getCurrentFinalDecision(application);
    if (runtimeDecision?.decisionType) {
      return runtimeDecision.decisionType;
    }

    if (application?.id && this.hasLoadedDecisions(application.id)) {
      return '';
    }

    return application?.currentFinalDecisionType || '';
  }

  getCurrentFinalDecisionDate(application?: Application | null): string {
    const runtimeDecision = this.getCurrentFinalDecision(application);
    if (runtimeDecision) {
      return this.getDecisionDisplayDate(runtimeDecision);
    }

    if (application?.id && this.hasLoadedDecisions(application.id)) {
      return '';
    }

    return application?.currentFinalDecisionDate || '';
  }

  getCurrentFinalDecisionLabel(decisionType?: string | null): string {
    switch ((decisionType || '').trim().toUpperCase()) {
      case 'FINAL_ACCEPTED':
        return 'Acceptée';
      case 'FINAL_REJECTED':
        return 'Refusée';
      default:
        return decisionType || '';
    }
  }

  getCurrentFinalDecisionClass(decisionType?: string | null): string {
    switch ((decisionType || '').trim().toUpperCase()) {
      case 'FINAL_ACCEPTED':
        return 'status-final-accepted';
      case 'FINAL_REJECTED':
        return 'status-final-rejected';
      default:
        return '';
    }
  }

  getDecisionLabel(decisionType?: string | null): string {
    switch ((decisionType || '').trim().toUpperCase()) {
      case 'PRE_SCREEN_ACCEPTED':
        return 'Pré-sélection acceptée';
      case 'PRE_SCREEN_REJECTED':
        return 'Pré-sélection refusée';
      case 'FINAL_ACCEPTED':
        return 'Décision finale : Accepté';
      case 'FINAL_REJECTED':
        return 'Décision finale : Rejeté';
      default:
        return decisionType || '';
    }
  }

  getDecisionTypeClass(decisionType?: string | null): string {
    switch ((decisionType || '').trim().toUpperCase()) {
      case 'PRE_SCREEN_ACCEPTED':
        return 'status-prescreen-accepted';
      case 'PRE_SCREEN_REJECTED':
        return 'status-prescreen-rejected';
      case 'FINAL_ACCEPTED':
        return 'status-final-accepted';
      case 'FINAL_REJECTED':
        return 'status-final-rejected';
      default:
        return '';
    }
  }

  getDecisionActionLabel(isCancel?: boolean | null): string {
    return isCancel ? 'Annulation' : 'Décision';
  }

  getDecisionDisplayDate(decision?: Decision | null): string {
    return decision?.updatedAt || decision?.createdAt || '';
  }

  private hasLoadedDecisions(applicationId: number): boolean {
    return Object.prototype.hasOwnProperty.call(this.childDecisions(), applicationId);
  }

  private getCurrentDecisionByTypes(application: Application | null | undefined, decisionTypes: string[]): Decision | null {
    if (!application?.id) {
      return null;
    }

    const allowedTypes = new Set(decisionTypes.map(type => type.trim().toUpperCase()));
    const decisions = this.getDecisions(application.id);
    const canceledDecisionIds = new Set(
      decisions
        .filter(decision => !!decision.isCancel && decision.cancelsDecisionId != null)
        .map(decision => decision.cancelsDecisionId as number)
    );

    return decisions.find(decision => {
      if (decision.isCancel) {
        return false;
      }

      const normalizedType = (decision.decisionType || '').trim().toUpperCase();
      if (!allowedTypes.has(normalizedType)) {
        return false;
      }

      return decision.id == null || !canceledDecisionIds.has(decision.id);
    }) || null;
  }

  getDecisionApplicationProgress(applicationId: number, decision?: Decision | null): ApplicationProgress | null {
    const progressId = decision?.applicationProgressId;
    if (progressId == null) {
      return null;
    }
    return this.getApplicationProgresses(applicationId).find(progress => progress.id === progressId) || null;
  }

  getDecisionOccurrenceLabel(applicationId: number, decision?: Decision | null): string {
    const progress = this.getDecisionApplicationProgress(applicationId, decision);
    if (!progress) {
      return decision?.applicationProgressId != null ? `Occurrence #${decision.applicationProgressId}` : '';
    }

    const stageLabel = this.getApplicationProgressStageLabel(progress);
    if (stageLabel && progress.stageOrder != null) {
      return `${stageLabel} · etape ${progress.stageOrder}`;
    }
    if (stageLabel) {
      return stageLabel;
    }
    if (progress.stageOrder != null) {
      return `Etape ${progress.stageOrder}`;
    }
    return `Occurrence #${progress.id}`;
  }

  getDecisionModeLabel(decision?: Decision | null): string {
    switch ((decision?.decisionMode || '').trim().toUpperCase()) {
      case 'CANCEL':
        return 'Annulation historisée';
      case 'OVERRIDE':
        return 'Override';
      case 'ROLLBACK':
        return 'Rollback';
      case 'STANDARD':
        return 'Décision standard';
      default:
        return decision?.decisionMode || '';
    }
  }

  getDecisionCancellationTarget(applicationId: number, decision?: Decision | null): Decision | null {
    const targetId = decision?.cancelsDecisionId;
    if (targetId == null) {
      return null;
    }
    return this.getDecisions(applicationId).find(item => item.id === targetId) || null;
  }

  getDecisionCancellationLabel(applicationId: number, decision?: Decision | null): string {
    const target = this.getDecisionCancellationTarget(applicationId, decision);
    if (!target) {
      return decision?.cancelsDecisionId != null ? `Annule la décision #${decision.cancelsDecisionId}` : '';
    }

    const occurrenceLabel = this.getDecisionOccurrenceLabel(applicationId, target);
    return `Annule ${this.getDecisionLabel(target.decisionType)} #${target.id}${occurrenceLabel ? ` · ${occurrenceLabel}` : ''}`;
  }

  isDecisionCurrentOccurrence(applicationId: number, decision?: Decision | null): boolean {
    const progressId = decision?.applicationProgressId;
    return progressId != null && this.getCurrentApplicationProgress(applicationId)?.id === progressId;
  }

  getCurrentApplicationProgress(applicationId: number): ApplicationProgress | null {
    const progresses = this.getApplicationProgresses(applicationId);
    return progresses.find(progress => (progress.progressStatus || '').toUpperCase() === 'IN_PROGRESS')
      || progresses.find(progress => (progress.progressStatus || '').toUpperCase() === 'PENDING')
      || null;
  }

  getCurrentPipelineProgress(application?: Application | null): ApplicationProgress | null {
    if (!application?.id) {
      return null;
    }

    return this.getCurrentApplicationProgress(application.id);
  }

  getInterviewEvaluationDisplayDate(evaluation?: InterviewEvaluationEntry | null): string {
    return evaluation?.updatedAt || evaluation?.createdAt || '';
  }

  getInterviewEvaluationEvaluatorLabel(evaluation?: InterviewEvaluationEntry | null): string {
    if (!evaluation?.createdBy) {
      return '';
    }
    return `Évaluateur #${evaluation.createdBy}`;
  }

  getInterviewEvaluationScoreClass(score?: number | null): string {
    if (score == null) {
      return '';
    }
    if (score >= 80) {
      return 'evaluation-score-excellent';
    }
    if (score >= 60) {
      return 'evaluation-score-good';
    }
    if (score >= 40) {
      return 'evaluation-score-average';
    }
    return 'evaluation-score-poor';
  }

  getInterviewEvaluationDisplayMark(evaluation?: InterviewEvaluationEntry | null): number | null {
    return resolveEvaluationCandidateMark(evaluation?.evaluationItems ?? [], evaluation?.candidateMark ?? null);
  }

  hasInterviewEvaluationItems(evaluation?: InterviewEvaluationEntry | null): boolean {
    return !!evaluation?.evaluationItems?.length;
  }

  trackInterviewEvaluationItem(index: number, item: EvaluationItem): number | string {
    return item.id ?? item.pipelineStageEvaluationCriterionId ?? index;
  }

  getInterviewEvaluationItemLabel(item: EvaluationItem): string {
    return getEvaluationItemDisplayLabel(item);
  }

  formatInterviewEvaluationItemValue(item: EvaluationItem): string {
    return formatEvaluationItemDisplayValue(item);
  }

  getInterviewEvaluationItemNote(item: EvaluationItem): string | null {
    return getEvaluationItemDisplayNote(item);
  }

  hasCurrentPipelineStageSummary(application: Application): boolean {
    return !!this.getCurrentPipelineProgress(application)
      || !!application.currentPipelineStageType
      || !!application.currentPipelineStageLabel
      || !!application.currentPipelineProgressStatus;
  }

  getPipelineStageTypeLabel(stageType?: string | null): string {
    switch ((stageType || '').trim().toUpperCase()) {
      case 'CANDIDATURE':
        return 'Candidature';
      case 'QUIZ':
        return 'Quiz';
      case 'PRESELECTION':
        return 'Pré-sélection';
      case 'INTERVIEW':
        return 'Entretien';
      case 'EVALUATION':
        return 'Évaluation';
      case 'DECISION':
        return 'Décision';
      case 'TECHNICAL_TEST':
        return 'Quiz';
      default:
        return stageType || '';
    }
  }

  getCurrentPipelineStageLabel(application?: Application | null): string {
    if (!application) {
      return '';
    }

    const currentProgress = this.getCurrentPipelineProgress(application);
    if (currentProgress) {
      return this.getApplicationProgressStageLabel(currentProgress);
    }

    if (application.currentPipelineStageLabel) {
      return application.currentPipelineStageLabel;
    }

    return this.getPipelineStageTypeLabel(application.currentPipelineStageType);
  }

  getCurrentPipelineStageType(application?: Application | null): string {
    return this.getCurrentPipelineProgress(application)?.stageType || application?.currentPipelineStageType || '';
  }

  getCurrentPipelineProgressStatus(application?: Application | null): string {
    return this.getCurrentPipelineProgress(application)?.progressStatus || application?.currentPipelineProgressStatus || '';
  }

  getApplicationProgressStageLabel(progress?: ApplicationProgress | null): string {
    if (!progress) {
      return '';
    }

    return progress.stageName?.trim() || this.getPipelineStageTypeLabel(progress.stageType);
  }

  getApplicationProgressTimelineSummary(progress?: ApplicationProgress | null): string {
    if (!progress) {
      return '';
    }

    const parts: string[] = [];
    if (progress.startedAt) {
      parts.push(`Démarrée ${progress.startedAt}`);
    }
    if (progress.completedAt) {
      parts.push(`Terminée ${progress.completedAt}`);
    }
    return parts.join(' - ');
  }

  getApplicationProgressDecisionMakerLabel(progress?: ApplicationProgress | null): string {
    if (!progress) {
      return '';
    }

    const fullName = `${progress.decidedByFirstName || ''} ${progress.decidedByLastName || ''}`.trim();
    if (fullName) {
      return fullName;
    }

    return progress.decidedById ? `#${progress.decidedById}` : '';
  }

  getPipelineProgressStatusLabel(status?: string | null): string {
    switch ((status || '').trim().toUpperCase()) {
      case 'IN_PROGRESS':
        return 'En cours';
      case 'PENDING':
        return 'En attente';
      case 'PASSED':
        return 'Réussie';
      case 'FAILED':
        return 'Échouée';
      case 'SKIPPED':
        return 'Ignorée';
      default:
        return status || '';
    }
  }

  getPipelineProgressStatusClass(status?: string | null): string {
    switch ((status || '').trim().toUpperCase()) {
      case 'IN_PROGRESS':
        return 'pipeline-progress-in-progress';
      case 'PENDING':
        return 'pipeline-progress-pending';
      case 'PASSED':
        return 'pipeline-progress-passed';
      case 'FAILED':
        return 'pipeline-progress-failed';
      case 'SKIPPED':
        return 'pipeline-progress-skipped';
      default:
        return '';
    }
  }

  hasCurrentInterviewEvaluationSummary(application: Application): boolean {
    const currentInterview = application.id ? this.getCurrentInterview(application.id) : null;
    const runtimeSummary = currentInterview
      ? this.getInterviewEvaluationAverageLabel(currentInterview) || this.getInterviewEvaluationSummary(currentInterview)
      : '';

    return !!runtimeSummary
      || application.currentInterviewEvaluationScore != null
      || application.currentInterviewEvaluationNumber != null
      || application.currentInterviewEvaluationPercentage != null;
  }

  getCurrentInterviewEvaluationAverageLabel(application?: Application | null): string {
    if (application?.id) {
      const currentInterview = this.getCurrentInterview(application.id);
      const runtimeLabel = this.getInterviewEvaluationAverageLabel(currentInterview);
      if (runtimeLabel) {
        return runtimeLabel;
      }
    }

    if (application?.currentInterviewEvaluationPercentage == null) {
      return '';
    }
    return `Moyenne ${this.formatAttemptNumber(application.currentInterviewEvaluationPercentage)}`;
  }

  getCurrentInterviewEvaluationSummary(application?: Application | null): string {
    if (!application) {
      return '';
    }

    if (application.id) {
      const currentInterview = this.getCurrentInterview(application.id);
      const runtimeSummary = this.getInterviewEvaluationSummary(currentInterview);
      if (runtimeSummary) {
        return runtimeSummary;
      }
    }

    const parts: string[] = [];
    if (application.currentInterviewEvaluationScore != null) {
      parts.push(`${this.formatAttemptNumber(application.currentInterviewEvaluationScore)} pts`);
    }
    if (application.currentInterviewEvaluationNumber != null) {
      parts.push(`${this.formatAttemptNumber(application.currentInterviewEvaluationNumber)} évaluation${application.currentInterviewEvaluationNumber > 1 ? 's' : ''}`);
    }
    return parts.join(' - ');
  }

  private sortDecisionsForDisplay(decisions: Decision[]): Decision[] {
    return [...decisions].sort((left, right) => {
      const leftDate = this.parseDecisionDateToTimestamp(this.getDecisionDisplayDate(left));
      const rightDate = this.parseDecisionDateToTimestamp(this.getDecisionDisplayDate(right));
      if (leftDate !== rightDate) {
        return rightDate - leftDate;
      }
      return (right.id || 0) - (left.id || 0);
    });
  }

  private loadInterviewEvaluations(
    applicationId: number,
    interviews: CandidateInterviewEntity[],
    onComplete: () => void
  ): void {
    const validInterviews = interviews.filter(interview => !!interview.id);

    if (validInterviews.length === 0) {
      this.childInterviewEvaluations.set({ ...this.childInterviewEvaluations(), [applicationId]: [] });
      onComplete();
      return;
    }

    const collectedEvaluations: InterviewEvaluationEntry[] = [];
    let loaded = 0;
    const finalize = () => {
      loaded++;
      if (loaded >= validInterviews.length) {
        this.childInterviewEvaluations.set({
          ...this.childInterviewEvaluations(),
          [applicationId]: this.sortInterviewEvaluationsForDisplay(collectedEvaluations)
        });
        onComplete();
      }
    };

    for (const interview of validInterviews) {
      this.evaluationService.getEvaluationsByCandidateInterviewId(interview.id!).subscribe({
        next: (response) => {
          collectedEvaluations.push(...this.mapInterviewEvaluationsForDisplay(interview, response.items || []));
          finalize();
        },
        error: () => finalize()
      });
    }
  }

  private mapInterviewEvaluationsForDisplay(
    interview: CandidateInterviewEntity,
    evaluations: Evaluation[]
  ): InterviewEvaluationEntry[] {
    const interviewLabel = `Entretien #${interview.interviewId || interview.id}`;

    return evaluations.map(evaluation => ({
      id: evaluation.id,
      candidateInterviewId: interview.id,
      interviewId: interview.interviewId || interview.id || null,
      interviewLabel,
      interviewDate: this.getInterviewDisplayDate(interview),
      interviewStatus: interview.interviewStatus || null,
      candidateMark: evaluation.candidateMark,
      recruiterComment: evaluation.recruiterComment,
      evaluationItems: evaluation.evaluationItems ?? [],
      createdAt: evaluation.createdAt,
      updatedAt: evaluation.updatedAt,
      createdBy: evaluation.createdBy,
      isDeleted: evaluation.isDeleted
    }));
  }

  private sortApplicationProgressesForDisplay(progresses: ApplicationProgress[]): ApplicationProgress[] {
    return [...progresses].sort((left, right) => {
      const leftOrder = left.stageOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.stageOrder ?? Number.MAX_SAFE_INTEGER;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      const leftStarted = this.parseDisplayDateValue(left.startedAt || left.createdAt);
      const rightStarted = this.parseDisplayDateValue(right.startedAt || right.createdAt);
      if (leftStarted !== rightStarted) {
        return leftStarted - rightStarted;
      }

      return (left.id || 0) - (right.id || 0);
    });
  }

  private sortInterviewEvaluationsForDisplay(evaluations: InterviewEvaluationEntry[]): InterviewEvaluationEntry[] {
    return [...evaluations].sort((left, right) => {
      const leftDate = this.parseDisplayDateValue(this.getInterviewEvaluationDisplayDate(left));
      const rightDate = this.parseDisplayDateValue(this.getInterviewEvaluationDisplayDate(right));
      if (leftDate !== rightDate) {
        return rightDate - leftDate;
      }

      return (right.id || 0) - (left.id || 0);
    });
  }

  private parseDecisionDateToTimestamp(value?: string | null): number {
    if (!value) {
      return 0;
    }

    const isoTimestamp = Date.parse(value);
    if (!Number.isNaN(isoTimestamp)) {
      return isoTimestamp;
    }

    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!match) {
      return 0;
    }

    const [, day, month, year, hours = '00', minutes = '00', seconds = '00'] = match;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds)
    ).getTime();
  }

  getAnswerAttemptScoreLabel(group: AnswerAttemptGroup): string {
    const scorePercent = group.scorePercent;
    const score = group.score;

    if (scorePercent != null && score != null) {
      return `${this.formatAttemptNumber(scorePercent)} % (${this.formatAttemptNumber(score)} pts)`;
    }
    if (scorePercent != null) {
      return `${this.formatAttemptNumber(scorePercent)} %`;
    }
    if (score != null) {
      return `${this.formatAttemptNumber(score)} pts`;
    }
    return '';
  }

  getAnswerAttemptActivitySummary(group: AnswerAttemptGroup): string {
    const parts: string[] = [];
    if (group.createdAt) {
      parts.push(`Creee ${group.createdAt}`);
    }
    if (group.startedAt) {
      parts.push(`Demarrage ${group.startedAt}`);
    }
    if (group.completedAt) {
      parts.push(`Fin ${group.completedAt}`);
    }
    if (!group.completedAt && group.lastActivityAt) {
      parts.push(`Derniere activite ${group.lastActivityAt}`);
    }
    return parts.join(' - ');
  }

  isQuizAttemptCreationLoading(applicationId: number | undefined): boolean {
    return applicationId ? this.quizAttemptCreationLoading().has(applicationId) : false;
  }

  isTextAnswer(answer: CandidateAnswer): boolean {
    return (answer.questionType || '').toUpperCase() === 'TEXT';
  }

  isQuestionManualCorrection(answer: CandidateAnswer): boolean {
    return answer.manualCorrectionRequired === true;
  }

  hasManualCorrectionPermission(application: Application): boolean {
    if (this.permissionService.hasPermission('CORRECT_TEST')) {
      return true;
    }

    const campaignId = this.getCampaignIdForApplication(application);
    if (!campaignId) {
      return false;
    }
    const permissionKeys = this.campaignPermissionKeys()[campaignId] || [];
    return permissionKeys.includes('ADMIN') || permissionKeys.includes('CREATOR') || permissionKeys.includes('CORRECT_TEST');
  }

  isManualCorrectionPermissionLoading(application: Application): boolean {
    const campaignId = this.getCampaignIdForApplication(application);
    return campaignId ? this.campaignPermissionLoading().has(campaignId) : false;
  }

  getManualCorrectionDecision(answer: CandidateAnswer): string {
    if (!answer.id) return '';
    const draft = this.manualCorrectionDrafts()[answer.id];
    if (!draft || draft.manualIsCorrect === null) return '';
    return draft.manualIsCorrect ? 'true' : 'false';
  }

  getManualCorrectionComment(answer: CandidateAnswer): string {
    if (!answer.id) return '';
    return this.manualCorrectionDrafts()[answer.id]?.manualCorrectionComment || '';
  }

  isPrimaryQuestionAnswer(application: Application, answer: CandidateAnswer): boolean {
    if (!application.id || !answer.questionId) {
      return false;
    }

    const carrier = this.getQuestionManualCorrectionCarrier(application.id, answer.questionId, answer.applicationQuizAttemptId);
    return !!carrier?.id && carrier.id === answer.id;
  }

  getManualQuestionCorrectionScore(answer: CandidateAnswer): string {
    const score = this.getCurrentManualQuestionCorrectionScore(answer);
    return score === null || score === undefined ? '' : String(score);
  }

  getManualQuestionCorrectionComment(answer: CandidateAnswer): string {
    const key = this.buildManualQuestionCorrectionKey(answer.applicationId, answer.questionId, answer.applicationQuizAttemptId);
    return key ? this.manualQuestionCorrectionDrafts()[key]?.manualCorrectionComment || '' : '';
  }

  updateManualCorrectionDecision(answerId: number | undefined, value: string): void {
    if (!answerId) return;
    const current = this.manualCorrectionDrafts()[answerId] || { manualIsCorrect: null, manualCorrectionComment: '' };
    this.manualCorrectionDrafts.set({
      ...this.manualCorrectionDrafts(),
      [answerId]: {
        ...current,
        manualIsCorrect: value === '' ? null : value === 'true'
      }
    });
  }

  updateManualCorrectionComment(answerId: number | undefined, value: string): void {
    if (!answerId) return;
    const current = this.manualCorrectionDrafts()[answerId] || { manualIsCorrect: null, manualCorrectionComment: '' };
    this.manualCorrectionDrafts.set({
      ...this.manualCorrectionDrafts(),
      [answerId]: {
        ...current,
        manualCorrectionComment: value
      }
    });
  }

  updateManualQuestionCorrectionScore(answer: CandidateAnswer, value: string | number): void {
    const key = this.buildManualQuestionCorrectionKey(answer.applicationId, answer.questionId, answer.applicationQuizAttemptId);
    if (!key) {
      return;
    }

    const rawValue = typeof value === 'number' ? String(value) : value;
    const trimmedValue = rawValue.trim();
    const parsedValue = trimmedValue === '' ? null : Number.parseInt(trimmedValue, 10);
    const current = this.manualQuestionCorrectionDrafts()[key] || { manualCorrectionScore: null, manualCorrectionComment: '' };

    this.manualQuestionCorrectionDrafts.set({
      ...this.manualQuestionCorrectionDrafts(),
      [key]: {
        ...current,
        manualCorrectionScore: Number.isNaN(parsedValue as number) ? null : parsedValue
      }
    });
  }

  updateManualQuestionCorrectionComment(answer: CandidateAnswer, value: string): void {
    const key = this.buildManualQuestionCorrectionKey(answer.applicationId, answer.questionId, answer.applicationQuizAttemptId);
    if (!key) {
      return;
    }

    const current = this.manualQuestionCorrectionDrafts()[key] || { manualCorrectionScore: null, manualCorrectionComment: '' };
    this.manualQuestionCorrectionDrafts.set({
      ...this.manualQuestionCorrectionDrafts(),
      [key]: {
        ...current,
        manualCorrectionComment: value
      }
    });
  }

  saveManualCorrection(answer: CandidateAnswer): void {
    if (!answer.id) {
      return;
    }

    const draft = this.manualCorrectionDrafts()[answer.id];
    if (!draft || draft.manualIsCorrect === null) {
      this.notificationService.error('Erreur', 'Choisissez si la réponse libre est correcte ou incorrecte.');
      return;
    }

    const saving = new Set(this.manualCorrectionSaving());
    saving.add(answer.id);
    this.manualCorrectionSaving.set(saving);

    this.candidateAnswersService.manualCorrect(answer.id, draft.manualIsCorrect, draft.manualCorrectionComment || null).subscribe({
      next: () => {
        this.notificationService.success('Succès', 'La correction manuelle a été enregistrée.');
        if (answer.applicationId) {
          this.loadChildren(answer.applicationId);
        }
        this.loadItems();
        this.removeManualCorrectionSaving(answer.id!);
      },
      error: (error) => {
        const message = error?.error?.status?.message || 'Impossible d’enregistrer la correction manuelle.';
        this.notificationService.error('Erreur', message);
        this.removeManualCorrectionSaving(answer.id!);
      }
    });
  }

  saveManualQuestionCorrection(answer: CandidateAnswer): void {
    const key = this.buildManualQuestionCorrectionKey(answer.applicationId, answer.questionId, answer.applicationQuizAttemptId);
    if (!key || !answer.applicationId || !answer.questionId) {
      return;
    }

    const draft = this.manualQuestionCorrectionDrafts()[key];
    if (!draft || draft.manualCorrectionScore === null) {
      this.notificationService.error('Erreur', 'Saisissez une note manuelle pour cette question.');
      return;
    }

    const maxScore = this.getManualQuestionCorrectionMaxScore(answer);
    if (draft.manualCorrectionScore < 0 || draft.manualCorrectionScore > maxScore) {
      this.notificationService.error('Erreur', `La note manuelle doit être comprise entre 0 et ${maxScore}.`);
      return;
    }

    const saving = new Set(this.manualQuestionCorrectionSaving());
    saving.add(key);
    this.manualQuestionCorrectionSaving.set(saving);

    this.candidateAnswersService.manualCorrectQuestion(
      answer.applicationId,
      answer.questionId,
      draft.manualCorrectionScore,
      draft.manualCorrectionComment || null,
      answer.applicationQuizAttemptId ?? null
    ).subscribe({
      next: () => {
        this.notificationService.success('Succès', 'La note manuelle a été enregistrée.');
        this.loadChildren(answer.applicationId!);
        this.loadItems();
        this.removeManualQuestionCorrectionSaving(key);
      },
      error: (error) => {
        const message = error?.error?.status?.message || 'Impossible d’enregistrer la note manuelle.';
        this.notificationService.error('Erreur', message);
        this.removeManualQuestionCorrectionSaving(key);
      }
    });
  }

  createQuizAttempt(application: Application, event?: Event): void {
    event?.stopPropagation();

    if (!application.id) {
      return;
    }
    if (!application.emailVerified) {
      this.notificationService.error('Erreur', 'L’email du candidat doit être vérifié avant de créer une nouvelle tentative de quiz.');
      return;
    }
    if (typeof window !== 'undefined' && !window.confirm('Créer une nouvelle tentative de quiz et générer un nouveau lien public pour ce candidat ?')) {
      return;
    }

    const loading = new Set(this.quizAttemptCreationLoading());
    loading.add(application.id);
    this.quizAttemptCreationLoading.set(loading);

    this.applicationService.createQuizAttempt(application.id).subscribe({
      next: (response) => {
        const createdApplication = response.items?.[0];
        const quizToken = createdApplication?.searchString;
        if (quizToken) {
          const quizUrl = this.buildQuizAttemptPublicUrl(application.id!, quizToken);
          this.copyQuizAttemptLink(quizUrl);
        } else {
          this.notificationService.success('Succès', 'Nouvelle tentative de quiz créée.');
        }

        this.loadChildren(application.id!);
        this.loadItems();
        this.removeQuizAttemptCreationLoading(application.id!);
      },
      error: (error) => {
        const message = error?.error?.status?.message || 'Impossible de créer une nouvelle tentative de quiz.';
        this.notificationService.error('Erreur', message);
        this.removeQuizAttemptCreationLoading(application.id!);
      }
    });
  }

  copyExistingQuizAttemptLink(applicationId: number, group: AnswerAttemptGroup, event?: Event): void {
    event?.stopPropagation();
    if (!group.quizToken) {
      return;
    }

    this.copyQuizAttemptLink(this.buildQuizAttemptPublicUrl(applicationId, group.quizToken));
  }

  copyCurrentQuizAttemptLink(applicationId: number, event?: Event): void {
    const group = this.getCurrentQuizAttemptGroup(applicationId);
    if (!group) {
      return;
    }

    this.copyExistingQuizAttemptLink(applicationId, group, event);
  }

  copyCurrentApplicationQuizLink(application: Application, event?: Event): void {
    event?.stopPropagation();
    const quizToken = this.getCurrentQuizToken(application);
    if (!application.id || !quizToken) {
      return;
    }

    this.copyQuizAttemptLink(this.buildQuizAttemptPublicUrl(application.id, quizToken));
  }

  private sortInterviewsForDisplay(interviews: CandidateInterviewEntity[]): CandidateInterviewEntity[] {
    const priority: Record<string, number> = {
      STARTED: 0,
      SCHEDULED: 1,
      POSTPONED: 2,
      PENDING: 3,
      OVER: 4,
      PASSED: 5,
      FAILED: 6,
      ARCHIVED: 7
    };

    return [...interviews].sort((left, right) => {
      const leftPriority = priority[(left.interviewStatus || '').toUpperCase()] ?? 99;
      const rightPriority = priority[(right.interviewStatus || '').toUpperCase()] ?? 99;
      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      const leftDate = this.parseDisplayDateValue(this.getInterviewDisplayDate(left));
      const rightDate = this.parseDisplayDateValue(this.getInterviewDisplayDate(right));
      if (leftDate !== rightDate) {
        return rightDate - leftDate;
      }

      return (right.id || 0) - (left.id || 0);
    });
  }

  private parseDisplayDateValue(value?: string | null): number {
    const trimmed = value?.trim();
    if (!trimmed) {
      return 0;
    }

    const nativeValue = Date.parse(trimmed);
    if (!Number.isNaN(nativeValue)) {
      return nativeValue;
    }

    const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/);
    if (!match) {
      return 0;
    }

    const [, day, month, year, hour = '00', minute = '00'] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
  }

  isManualCorrectionSaving(answerId: number | undefined): boolean {
    return answerId ? this.manualCorrectionSaving().has(answerId) : false;
  }

  isManualQuestionCorrectionSaving(answer: CandidateAnswer): boolean {
    const key = this.buildManualQuestionCorrectionKey(answer.applicationId, answer.questionId, answer.applicationQuizAttemptId);
    return key ? this.manualQuestionCorrectionSaving().has(key) : false;
  }

  private seedManualCorrectionDrafts(answers: CandidateAnswer[]): void {
    if (!answers?.length) {
      return;
    }

    const nextDrafts = { ...this.manualCorrectionDrafts() };
    for (const answer of answers) {
      if (!answer.id || !this.isTextAnswer(answer) || nextDrafts[answer.id]) {
        continue;
      }
      nextDrafts[answer.id] = {
        manualIsCorrect: answer.manualIsCorrect ?? null,
        manualCorrectionComment: answer.manualCorrectionComment || ''
      };
    }
    this.manualCorrectionDrafts.set(nextDrafts);
  }

  private seedManualQuestionCorrectionDrafts(answers: CandidateAnswer[]): void {
    if (!answers?.length) {
      return;
    }

    const nextDrafts = { ...this.manualQuestionCorrectionDrafts() };
    const handledKeys = new Set<string>();
    for (const answer of answers) {
      if (!answer.manualCorrectionRequired) {
        continue;
      }

      const key = this.buildManualQuestionCorrectionKey(answer.applicationId, answer.questionId, answer.applicationQuizAttemptId);
      if (!key || handledKeys.has(key) || nextDrafts[key]) {
        continue;
      }

      const carrier = answer.applicationId && answer.questionId
        ? this.getQuestionManualCorrectionCarrierFromAnswers(answers, answer.applicationId, answer.questionId, answer.applicationQuizAttemptId)
        : answer;

      nextDrafts[key] = {
        manualCorrectionScore: carrier?.manualCorrectionScore ?? null,
        manualCorrectionComment: carrier?.manualCorrectionComment || ''
      };
      handledKeys.add(key);
    }

    this.manualQuestionCorrectionDrafts.set(nextDrafts);
  }

  private removeQuizAttemptCreationLoading(applicationId: number): void {
    const loading = new Set(this.quizAttemptCreationLoading());
    loading.delete(applicationId);
    this.quizAttemptCreationLoading.set(loading);
  }

  private buildQuizAttemptPublicUrl(applicationId: number, quizToken: string): string {
    return `${window.location.origin}/quiz/${applicationId}/${quizToken}`;
  }

  private copyQuizAttemptLink(quizUrl: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(quizUrl).then(() => {
        this.notificationService.success('Succès', 'Nouvelle tentative créée. Le lien du quiz a été copié dans le presse-papiers.');
      }).catch(() => {
        this.notificationService.success('Succès', `Nouvelle tentative créée. Lien du quiz : ${quizUrl}`);
      });
      return;
    }

    this.notificationService.success('Succès', `Nouvelle tentative créée. Lien du quiz : ${quizUrl}`);
  }

  private ensureManualCorrectionPermissionForApplicationId(applicationId: number): void {
    const application = this.items().find(item => item.id === applicationId);
    if (!application) {
      return;
    }

    const campaignId = this.getCampaignIdForApplication(application);
    if (!campaignId) {
      return;
    }

    if (this.campaignPermissionKeys()[campaignId] || this.campaignPermissionLoading().has(campaignId)) {
      return;
    }

    const currentUserId = Number(this.authService.getCurrentUserId());
    if (!currentUserId) {
      return;
    }

    const loading = new Set(this.campaignPermissionLoading());
    loading.add(campaignId);
    this.campaignPermissionLoading.set(loading);

    this.entityPermissionService.getForEntity('CAMPAIGN', campaignId).subscribe({
      next: (response) => {
        const permissionKeys = Array.from(new Set(
          (response.items || [])
            .filter(permission => Number(permission.userId) === currentUserId && permission.granted)
            .map(permission => permission.permissionKey || '')
            .filter(Boolean)
        ));
        this.campaignPermissionKeys.set({
          ...this.campaignPermissionKeys(),
          [campaignId]: permissionKeys
        });
        this.removeCampaignPermissionLoading(campaignId);
      },
      error: () => {
        this.campaignPermissionKeys.set({
          ...this.campaignPermissionKeys(),
          [campaignId]: []
        });
        this.removeCampaignPermissionLoading(campaignId);
      }
    });
  }

  private getCampaignIdForApplication(application: Application): number | null {
    if (!application.sourceTokenId) {
      return null;
    }

    const sourceToken = this.allSourceTokens().find(token => token.id === application.sourceTokenId);
    return sourceToken?.campaignId || sourceToken?.campaigns_id || null;
  }

  private removeCampaignPermissionLoading(campaignId: number): void {
    const loading = new Set(this.campaignPermissionLoading());
    loading.delete(campaignId);
    this.campaignPermissionLoading.set(loading);
  }

  private removeManualCorrectionSaving(answerId: number): void {
    const saving = new Set(this.manualCorrectionSaving());
    saving.delete(answerId);
    this.manualCorrectionSaving.set(saving);
  }

  private removeManualQuestionCorrectionSaving(key: string): void {
    const saving = new Set(this.manualQuestionCorrectionSaving());
    saving.delete(key);
    this.manualQuestionCorrectionSaving.set(saving);
  }

  private refreshAnswerAttemptGroups(applicationId: number): void {
    this.childAnswerGroups.set({
      ...this.childAnswerGroups(),
      [applicationId]: this.buildAnswerAttemptGroups(this.getAnswers(applicationId), this.getQuizAttempts(applicationId))
    });
  }

  private buildAnswerAttemptGroups(answers: CandidateAnswer[], quizAttempts: ApplicationQuizAttemptSummary[]): AnswerAttemptGroup[] {
	if (!answers?.length && !quizAttempts?.length) {
	  return [];
	}

    const groups = new Map<string, AnswerAttemptGroup>();
    for (const answer of this.sortAnswersForDisplay(answers)) {
      const applicationQuizAttemptId = answer.applicationQuizAttemptId ?? null;
      const key = applicationQuizAttemptId != null ? `attempt-${applicationQuizAttemptId}` : 'legacy';
      const existingGroup = groups.get(key);

      if (existingGroup) {
        existingGroup.answers.push(answer);
        continue;
      }

      groups.set(key, {
        key,
        applicationQuizAttemptId,
        label: applicationQuizAttemptId != null ? `Tentative #${applicationQuizAttemptId}` : 'Réponses legacy',
        isLegacy: applicationQuizAttemptId == null,
      quizToken: null,
        quizStatus: answer.applicationQuizAttemptQuizStatus ?? null,
        manualCorrectionStatus: answer.applicationQuizAttemptManualCorrectionStatus ?? null,
        score: answer.applicationQuizAttemptScore ?? null,
        scorePercent: answer.applicationQuizAttemptScorePercent ?? null,
      createdAt: null,
        startedAt: answer.applicationQuizAttemptStartedAt ?? null,
        completedAt: answer.applicationQuizAttemptCompletedAt ?? null,
        lastActivityAt: answer.applicationQuizAttemptLastActivityAt ?? null,
        answers: [answer]
      });
    }

    for (const attempt of this.sortQuizAttemptsForDisplay(quizAttempts || [])) {
      const applicationQuizAttemptId = attempt.id ?? null;
      if (applicationQuizAttemptId == null) {
      continue;
      }

      const key = `attempt-${applicationQuizAttemptId}`;
      const existingGroup = groups.get(key);
      if (existingGroup) {
      existingGroup.quizToken = existingGroup.quizToken ?? attempt.quizToken ?? null;
      existingGroup.quizStatus = existingGroup.quizStatus ?? attempt.quizStatus ?? null;
      existingGroup.manualCorrectionStatus = existingGroup.manualCorrectionStatus ?? (attempt.manualCorrectionStatus as string | null) ?? null;
      existingGroup.score = existingGroup.score ?? attempt.score ?? null;
      existingGroup.scorePercent = existingGroup.scorePercent ?? attempt.scorePercent ?? null;
      existingGroup.createdAt = existingGroup.createdAt ?? attempt.createdAt ?? null;
      existingGroup.startedAt = existingGroup.startedAt ?? attempt.startedAt ?? null;
      existingGroup.completedAt = existingGroup.completedAt ?? attempt.completedAt ?? null;
      existingGroup.lastActivityAt = existingGroup.lastActivityAt ?? attempt.lastActivityAt ?? null;
      continue;
      }

      groups.set(key, {
      key,
      applicationQuizAttemptId,
      label: `Tentative #${applicationQuizAttemptId}`,
      isLegacy: false,
      quizToken: attempt.quizToken ?? null,
      quizStatus: attempt.quizStatus ?? null,
      manualCorrectionStatus: (attempt.manualCorrectionStatus as string | null) ?? null,
      score: attempt.score ?? null,
      scorePercent: attempt.scorePercent ?? null,
      createdAt: attempt.createdAt ?? null,
      startedAt: attempt.startedAt ?? null,
      completedAt: attempt.completedAt ?? null,
      lastActivityAt: attempt.lastActivityAt ?? null,
      answers: []
      });
    }

    return Array.from(groups.values()).sort((left, right) => {
      if (left.applicationQuizAttemptId == null && right.applicationQuizAttemptId == null) {
        return 0;
      }
      if (left.applicationQuizAttemptId == null) {
        return 1;
      }
      if (right.applicationQuizAttemptId == null) {
        return -1;
      }
      return right.applicationQuizAttemptId - left.applicationQuizAttemptId;
    });
  }

    private sortQuizAttemptsForDisplay(quizAttempts: ApplicationQuizAttemptSummary[]): ApplicationQuizAttemptSummary[] {
    return [...quizAttempts].sort((left, right) => {
      const leftId = left.id ?? -1;
      const rightId = right.id ?? -1;
      return rightId - leftId;
    });
    }

  private sortAnswersForDisplay(answers: CandidateAnswer[]): CandidateAnswer[] {
    return [...answers].sort((left, right) => {
      const leftAttempt = left.applicationQuizAttemptId ?? -1;
      const rightAttempt = right.applicationQuizAttemptId ?? -1;
      if (leftAttempt !== rightAttempt) {
        return rightAttempt - leftAttempt;
      }

      const leftQuestion = left.questionId ?? Number.MAX_SAFE_INTEGER;
      const rightQuestion = right.questionId ?? Number.MAX_SAFE_INTEGER;
      if (leftQuestion !== rightQuestion) {
        return leftQuestion - rightQuestion;
      }

      const leftOrder = left.answerOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.answerOrder ?? Number.MAX_SAFE_INTEGER;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return (left.id ?? Number.MAX_SAFE_INTEGER) - (right.id ?? Number.MAX_SAFE_INTEGER);
    });
  }

  private formatAttemptNumber(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
  }

  private buildManualQuestionCorrectionKey(applicationId?: number, questionId?: number, applicationQuizAttemptId?: number): string | null {
    if (!applicationId || !questionId) {
      return null;
    }
    return applicationQuizAttemptId
      ? `${applicationId}-${applicationQuizAttemptId}-${questionId}`
      : `${applicationId}-${questionId}`;
  }

  private getCurrentManualQuestionCorrectionScore(answer: CandidateAnswer): number | null {
    const key = this.buildManualQuestionCorrectionKey(answer.applicationId, answer.questionId, answer.applicationQuizAttemptId);
    if (!key) {
      return answer.manualCorrectionScore ?? null;
    }

    return this.manualQuestionCorrectionDrafts()[key]?.manualCorrectionScore ?? answer.manualCorrectionScore ?? null;
  }

  getManualQuestionCorrectionMaxScore(answer: CandidateAnswer): number {
    return Math.max(answer.questionScore ?? 0, 0);
  }

  private getQuestionManualCorrectionCarrier(applicationId: number, questionId: number, applicationQuizAttemptId?: number): CandidateAnswer | null {
    return this.getQuestionManualCorrectionCarrierFromAnswers(this.getAnswers(applicationId), applicationId, questionId, applicationQuizAttemptId);
  }

  private getQuestionManualCorrectionCarrierFromAnswers(answers: CandidateAnswer[], applicationId: number, questionId: number, applicationQuizAttemptId?: number): CandidateAnswer | null {
    const candidates = answers.filter(item => {
      if (item.applicationId !== applicationId || item.questionId !== questionId || item.isDeleted === true) {
        return false;
      }
      if (applicationQuizAttemptId != null) {
        return item.applicationQuizAttemptId === applicationQuizAttemptId;
      }
      return item.applicationQuizAttemptId == null;
    });
    let carrier: CandidateAnswer | null = null;
    for (const candidate of candidates) {
      if (!carrier || this.isBetterQuestionManualCorrectionCarrier(candidate, carrier)) {
        carrier = candidate;
      }
    }
    return carrier;
  }

  private isBetterQuestionManualCorrectionCarrier(candidate: CandidateAnswer, current: CandidateAnswer): boolean {
    if ((candidate.manualCorrectionScore ?? null) !== null && (current.manualCorrectionScore ?? null) === null) {
      return true;
    }
    if ((candidate.manualCorrectionScore ?? null) === null && (current.manualCorrectionScore ?? null) !== null) {
      return false;
    }

    const isTextQuestion = this.isTextAnswer(candidate);
    if (isTextQuestion) {
      if (candidate.answerId == null && current.answerId != null) {
        return true;
      }
      if (candidate.answerId != null && current.answerId == null) {
        return false;
      }
    }

    if (candidate.answerOrder != null && current.answerOrder != null && candidate.answerOrder !== current.answerOrder) {
      return candidate.answerOrder < current.answerOrder;
    }
    if (candidate.answerOrder != null && current.answerOrder == null) {
      return true;
    }
    if (candidate.answerOrder == null && current.answerOrder != null) {
      return false;
    }

    if (candidate.answerId != null && current.answerId != null && candidate.answerId !== current.answerId) {
      return candidate.answerId < current.answerId;
    }
    if (candidate.answerId != null && current.answerId == null) {
      return true;
    }
    if (candidate.answerId == null && current.answerId != null) {
      return false;
    }

    return (candidate.id ?? Number.MAX_SAFE_INTEGER) < (current.id ?? Number.MAX_SAFE_INTEGER);
  }
}
