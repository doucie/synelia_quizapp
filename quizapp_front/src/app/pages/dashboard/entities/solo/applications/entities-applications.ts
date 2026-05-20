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
import { ApplicationService, Application, PagedApplicationResponse, ApplicationSearchCriteria } from '../../../../../core/services/application.service';
import { CandidateAnswersService, CandidateAnswer } from '../../../../../core/services/candidate-answers.service';
import { CandidateAskService, CandidateAsk } from '../../../../../core/services/candidate-ask.service';
import { CandidateTokenService, CandidateToken } from '../../../../../core/services/candidate-token.service';
import { CandidateInterviewEntityService, CandidateInterviewEntity } from '../../../../../core/services/candidate-interview-entity.service';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { EntityPermissionService } from '../../../../../core/services/entity-permission.service';
import { PermissionService } from '../../../../../core/services/permission.service';
import { SourceTokenService, SourceToken, SourceTokenResponse } from '../../../../../services/source-token.service';
import { FormVersionService, FormVersion } from '../../../../../core/services/form-version.service';
import { getManualCorrectionStatusClass, getManualCorrectionStatusLabel, ManualCorrectionStatus } from '../../../../../core/constants/manual-correction-status.constants';

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
  childAsks = signal<{[id: number]: CandidateAsk[]}>({});
  childTokens = signal<{[id: number]: CandidateToken[]}>({});
  childInterviews = signal<{[id: number]: CandidateInterviewEntity[]}>({});
  loadingChildren = signal<{[id: number]: boolean}>({});
  childTab = signal<{[id: number]: string}>({});
  manualCorrectionDrafts = signal<Record<number, { manualIsCorrect: boolean | null; manualCorrectionComment: string }>>({});
  manualCorrectionSaving = signal<Set<number>>(new Set());
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
    { key: 'quizScore', label: 'Score Quiz', priority: 2 },
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
    const done = () => { loaded++; if (loaded >= 4) this.loadingChildren.set({ ...this.loadingChildren(), [id]: false }); };
    this.candidateAnswersService.getAllByCriteria({ applicationId: id, size: 100 }).subscribe({
      next: (r) => {
        this.childAnswers.set({ ...this.childAnswers(), [id]: r.content });
        this.seedManualCorrectionDrafts(r.content);
        done();
      },
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

  isTextAnswer(answer: CandidateAnswer): boolean {
    return (answer.questionType || '').toUpperCase() === 'TEXT';
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

  isManualCorrectionSaving(answerId: number | undefined): boolean {
    return answerId ? this.manualCorrectionSaving().has(answerId) : false;
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
}
