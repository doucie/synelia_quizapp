import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { DetailField } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { FilterCheckboxComponent } from '../../../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { InterviewService, Interview, PagedInterviewResponse, InterviewSearchCriteria } from '../../../../../core/services/interview.service';
import { EntityPermissionService } from '../../../../../core/services/entity-permission.service';
import { EntityPermission } from '../../../../../core/models/permission.interfaces';
import { CandidateInterviewEntityService, CandidateInterviewEntity } from '../../../../../core/services/candidate-interview-entity.service';
import { CampaignService, Campaign } from '../../../../../core/services/campaign.service';
import { ApplicationService, Application } from '../../../../../core/services/application.service';

@Component({
  selector: 'app-entities-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-interviews.html',
  styleUrls: ['./entities-interviews.scss']
})
export class EntitiesInterviewsComponent extends EntityCrudBase<Interview, InterviewSearchCriteria, PagedInterviewResponse> {
  private interviewService = inject(InterviewService);
  private entityPermissionService = inject(EntityPermissionService);
  private candidateInterviewEntityService = inject(CandidateInterviewEntityService);
  private campaignFkService = inject(CampaignService);
  private applicationFkService = inject(ApplicationService);
  allCampaigns = signal<Campaign[]>([]);
  allApplications = signal<Application[]>([]);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesInterviewsPageSize';
  protected override readonly entityName = 'entretiens';
  protected override readonly entityTypeApi = 'interviews';

  // Expansion
  expandedItems = signal<Set<number>>(new Set());
  childCruds = signal<{[id: number]: any[]}>({});
  childCandidateInterviews = signal<{[id: number]: CandidateInterviewEntity[]}>({});
  loadingChildren = signal<{[id: number]: boolean}>({});
  childTab = signal<{[id: number]: string}>({});

  advancedCriteria: InterviewSearchCriteria = {};
  editFormData: Interview = { interviewType: 'ONLINE' };
  createFormData: Partial<Interview> = { interviewType: 'ONLINE', interviewStatus: 'PENDING' };

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'date', label: 'Date', priority: 2 },
    { key: 'type', label: 'Type', priority: 2 },
    { key: 'location', label: 'Lieu / Lien', priority: 3 },
    { key: 'status', label: 'Statut', priority: 2 },
    { key: 'pipelineContext', label: 'Contexte pipeline', priority: 2 },
    { key: 'applicationProgressId', label: 'Occurrence', priority: 3 },
    { key: 'campaign', label: 'Campagne', priority: 2 },
    { key: 'application', label: 'Candidature', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  override detailFields: DetailField[] = [
    { key: 'id', label: 'ID', type: 'id', editable: false },
    { key: 'applicationId', label: 'Candidature', type: 'id', editable: false, displayValue: (entity) => this.getApplicationDisplay(entity?.applicationId, entity?.candidateName) },
    { key: 'campaignId', label: 'Campagne', type: 'id', editable: false, displayValue: (entity) => this.getCampaignDisplay(entity?.campaignId, entity?.campaignTitle) },
    { key: 'interviewDate', label: 'Date et heure', type: 'text', editable: false, displayValue: (entity) => this.formatDate(entity?.interviewDate) },
    { key: 'interviewType', label: 'Type', type: 'text', displayValue: (entity) => this.getTypeLabel(entity?.interviewType) },
    { key: 'interviewStatus', label: 'Statut', type: 'text', displayValue: (entity) => this.getStatusLabel(entity?.interviewStatus) },
    { key: 'applicationProgressId', label: 'Occurrence pipeline', type: 'id', editable: false, displayValue: (entity) => this.getApplicationProgressDisplay(entity?.applicationProgressId) },
    { key: 'interviewRound', label: 'Round', type: 'text', editable: false, displayValue: (entity) => this.getInterviewRoundDisplay(entity?.interviewRound) },
    { key: 'pipelineStageLabel', label: 'Étape pipeline', type: 'text', editable: false, displayValue: (entity) => this.getPipelineStageDisplay(entity) },
    { key: 'interviewMailSent', label: 'Invitation envoyée', type: 'boolean' },
    { key: 'interviewLocation', label: 'Lieu', type: 'text' },
    { key: 'meetLink', label: 'Lien visio', type: 'text' },
    { key: 'evaluationRoomCode', label: 'Lien évaluation', type: 'text', editable: false },
    { key: 'interviewNote', label: 'Note', type: 'text' },
    { key: 'createdAt', label: 'Créé le', type: 'date', editable: false },
    { key: 'updatedAt', label: 'Modifié le', type: 'date', editable: false },
  ];

  protected fetchAll(criteria: InterviewSearchCriteria): Observable<PagedInterviewResponse> {
    return this.interviewService.getAllInterviewsByCriteria(criteria);
  }

  protected performCreate(item: Partial<Interview>): Observable<any> {
    return this.interviewService.createInterview(item as Interview);
  }

  protected performUpdate(item: Interview): Observable<any> {
    return this.interviewService.updateInterview(item);
  }

  protected performDelete(id: number): Observable<any> {
    return this.interviewService.deleteInterview(id);
  }

  protected performRestore(id: number): Observable<any> {
    return this.interviewService.restoreInterview(id);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.campaignFkService.getAllCampaignsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allCampaigns.set(res.content) });
    this.applicationFkService.getAllApplicationsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allApplications.set(res.content) });
  }

  protected resetAdvancedCriteriaValues(): void {
    this.advancedCriteria = {};
  }

  protected resetCreateFormData(): void {
    this.createFormData = { interviewType: 'ONLINE', interviewStatus: 'PENDING' };
  }

  override validateCreate(): void {
    if (!this.createFormData.interviewType) {
      alert('Veuillez sélectionner un type d\'entretien');
      return;
    }
    super.validateCreate();
  }

  override formatDate(date: string | undefined): string {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return date;
    }
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return '-';
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'SCHEDULED': 'Planifié',
      'STARTED': 'En cours',
      'OVER': 'Terminé',
      'PASSED': 'Réussi',
      'FAILED': 'Échoué',
      'POSTPONED': 'Reporté',
      'ARCHIVED': 'Archivé'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    const classes: Record<string, string> = {
      'PENDING': 'status-pending',
      'SCHEDULED': 'status-scheduled',
      'STARTED': 'status-started',
      'OVER': 'status-over',
      'PASSED': 'status-passed',
      'FAILED': 'status-failed',
      'POSTPONED': 'status-postponed',
      'ARCHIVED': 'status-archived'
    };
    return classes[status] || '';
  }

  getTypeLabel(type: string | undefined): string {
    if (!type) return '-';
    const labels: Record<string, string> = {
      'ONLINE': 'En ligne',
      'IN_PERSON': 'En personne'
    };
    return labels[type] || type;
  }

  getCampaignDisplay(campaignId?: number, campaignTitle?: string): string {
    if (campaignTitle?.trim()) {
      return campaignId ? `${campaignTitle.trim()} (#${campaignId})` : campaignTitle.trim();
    }

    if (!campaignId) {
      return '-';
    }

    const campaign = this.allCampaigns().find((item) => item.id === campaignId);
    const label = campaign?.campaignTitle || campaign?.campaignName;
    return label ? `${label} (#${campaignId})` : `#${campaignId}`;
  }

  getApplicationDisplay(applicationId?: number, candidateName?: string): string {
    if (candidateName?.trim() && applicationId) {
      return `#${applicationId} - ${candidateName.trim()}`;
    }

    if (!applicationId) {
      return '-';
    }

    const application = this.allApplications().find((item) => item.id === applicationId);
    if (!application) {
      return `#${applicationId}`;
    }

    const fullName = [application.candidateFirstName, application.candidateLastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (fullName) {
      return `#${applicationId} - ${fullName}`;
    }

    return application.candidateEmail ? `#${applicationId} - ${application.candidateEmail}` : `#${applicationId}`;
  }

  getApplicationProgressDisplay(applicationProgressId?: number): string {
    return applicationProgressId ? `Occurrence #${applicationProgressId}` : '-';
  }

  getInterviewRoundDisplay(interviewRound?: number): string {
    return interviewRound ? `Round ${interviewRound}` : '-';
  }

  getPipelineStageDisplay(interview?: Partial<Interview> | null): string {
    if (!interview) {
      return '-';
    }

    const label = (interview.pipelineStageLabel || interview.pipelineStageType || '').trim();
    const suffixParts: string[] = [];

    if (interview.pipelineStageType && interview.pipelineStageType !== interview.pipelineStageLabel) {
      suffixParts.push(interview.pipelineStageType);
    }

    if (interview.pipelineStageOrder != null) {
      suffixParts.push(`ordre ${interview.pipelineStageOrder}`);
    }

    const suffix = suffixParts.length ? ` (${suffixParts.join(', ')})` : '';

    if (label) {
      return `${label}${suffix}`;
    }

    return interview.pipelineStageId ? `#${interview.pipelineStageId}${suffix}` : '-';
  }

  getInterviewContextDisplay(interview?: Partial<Interview> | null): string {
    if (!interview) {
      return '-';
    }

    const parts = [
      interview.interviewRound ? this.getInterviewRoundDisplay(interview.interviewRound) : '',
      interview.pipelineStageLabel || ''
    ].filter(Boolean);

    return parts.length ? parts.join(' - ') : '-';
  }

  getCandidateInterviewDateDisplay(candidateInterview?: CandidateInterviewEntity | null): string {
    const value = candidateInterview?.interviewDate;
    if (!value) {
      return '-';
    }

    return value.includes('/') ? value : this.formatDate(value);
  }

  getCandidateInterviewStatusLabel(status?: string | null): string {
    return status ? this.getStatusLabel(status) : 'Non répondu';
  }

  getCandidateInterviewStatusClass(status?: string | null): string {
    return status ? this.getStatusClass(status) : '';
  }

  getCandidateResponseState(candidateInterview?: CandidateInterviewEntity | null): 'RESCHEDULE_REQUESTED' | 'DECLINED' | null {
    if (!candidateInterview) {
      return null;
    }

    if (candidateInterview.alternativeDateRequested) {
      return 'RESCHEDULE_REQUESTED';
    }

    if (candidateInterview.declineReason) {
      return 'DECLINED';
    }

    return null;
  }

  hasCandidateResponse(candidateInterview?: CandidateInterviewEntity | null): boolean {
    return this.getCandidateResponseState(candidateInterview) !== null;
  }

  getCandidateResponseLabel(candidateInterview?: CandidateInterviewEntity | null): string {
    const state = this.getCandidateResponseState(candidateInterview);
    if (state === 'RESCHEDULE_REQUESTED') {
      return 'Demande de replanification';
    }
    if (state === 'DECLINED') {
      return 'Créneau refusé';
    }
    return 'Aucune réponse';
  }

  getCandidateResponseClass(candidateInterview?: CandidateInterviewEntity | null): string {
    const state = this.getCandidateResponseState(candidateInterview);
    if (state === 'RESCHEDULE_REQUESTED') {
      return 'candidate-response-badge candidate-response-badge--warning';
    }
    if (state === 'DECLINED') {
      return 'candidate-response-badge candidate-response-badge--error';
    }
    return 'candidate-response-badge';
  }

  getCandidateResponseDetail(candidateInterview?: CandidateInterviewEntity | null): string {
    if (!candidateInterview) {
      return '';
    }

    if (candidateInterview.alternativeDateRequested) {
      return `Date demandée: ${candidateInterview.alternativeDateRequested}`;
    }

    return candidateInterview.declineReason?.trim() || '';
  }

  getCandidateInterviewDurationDisplay(candidateInterview?: CandidateInterviewEntity | null): string {
    return candidateInterview?.interviewDuration ? `${candidateInterview.interviewDuration} min` : '';
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

  getChildTab(id: number): string { return this.childTab()[id] || 'cruds'; }
  setChildTab(id: number, tab: string) { this.childTab.set({ ...this.childTab(), [id]: tab }); }

  loadChildren(id: number) {
    if (this.loadingChildren()[id]) return;
    this.loadingChildren.set({ ...this.loadingChildren(), [id]: true });
    let loaded = 0;
    const done = () => { loaded++; if (loaded >= 2) this.loadingChildren.set({ ...this.loadingChildren(), [id]: false }); };
    this.entityPermissionService.getForEntity('INTERVIEW', id).subscribe({
      next: (res) => {
        // Agréger par userId pour compatibilité template
        const permsMap = new Map<number, any>();
        (res.items || []).forEach((p: EntityPermission) => {
          if (!p.userId) return;
          if (!permsMap.has(p.userId)) {
            permsMap.set(p.userId, { id: p.id, userId: p.userId, isAdmin: false, canEvaluate: false, canScheduleInterview: false, canAddComments: false, isDeleted: false });
          }
          const entry = permsMap.get(p.userId)!;
          if (p.granted) {
            if (p.permissionKey === 'MANAGE_APP_CONFIG') entry.isAdmin = true;
            if (p.permissionKey === 'VIEW_EVALUATIONS') entry.canEvaluate = true;
            if (p.permissionKey === 'SCHEDULE_INTERVIEW') entry.canScheduleInterview = true;
            if (p.permissionKey === 'ADD_COMMENTS') entry.canAddComments = true;
          }
        });
        this.childCruds.set({ ...this.childCruds(), [id]: Array.from(permsMap.values()) });
        done();
      },
      error: () => { this.childCruds.set({ ...this.childCruds(), [id]: [] }); done(); }
    });
    this.candidateInterviewEntityService.getAllByCriteria({ interviewId: id, size: 100 }).subscribe({
      next: (r) => { this.childCandidateInterviews.set({ ...this.childCandidateInterviews(), [id]: r.content }); done(); },
      error: () => { this.childCandidateInterviews.set({ ...this.childCandidateInterviews(), [id]: [] }); done(); }
    });
  }

  getCruds(id: number): any[] { return this.childCruds()[id] || []; }
  getCandidateInterviews(id: number): CandidateInterviewEntity[] { return this.childCandidateInterviews()[id] || []; }
  isLoadingChildren(id: number): boolean { return this.loadingChildren()[id] || false; }
  trackByChildId(index: number, item: any): number { return item.id; }
}
