import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin, of, takeUntil } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Application, ApplicationService } from '../../../core/services/application.service';
import { CampaignService, Campaign } from '../../../core/services/campaign.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { ApplicationProgressService } from '../../../core/services/application-progress.service';
import { InterviewService, Interview } from '../../../core/services/interview.service';
import { DecisionService, Decision } from '../../../core/services/decision.service';
import {
  PipelineStage,
  ApplicationProgress,
  STAGE_TYPE_LABELS,
  normalizePipelineStageType
} from '../../../core/models/pipeline.interfaces';
import { getApplicationStatusLabel, isRejectedStatus, resolveApplicationStatusFromMirrors } from '../../../core/constants/application-status.constants';

type ActionKind = 'advance' | 'fail' | 'skip';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidate-detail.html',
  styleUrl: './candidate-detail.scss'
})
export class CandidateDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private applicationId!: number;

  // ── State ───────────────────────────────────────────
  application = signal<Application | null>(null);
  campaign = signal<Campaign | null>(null);
  stages = signal<PipelineStage[]>([]);
  progressList = signal<ApplicationProgress[]>([]);
  interviews = signal<Interview[]>([]);
  decisions = signal<Decision[]>([]);

  loading = signal(true);
  errorMessage = signal<string | null>(null);

  actionLoading = signal<Record<string, boolean>>({});

  showRejectModal = signal(false);
  rejectStageId = signal<number | null>(null);
  rejectReason = signal('');

  expandedStages = signal<Record<number, boolean>>({});

  // ── Computed ────────────────────────────────────────
  candidateName = computed(() => {
    const a = this.application();
    if (!a) return '—';
    return `${a.candidateFirstName || ''} ${a.candidateLastName || ''}`.trim() || 'Candidat';
  });

  candidateInitials = computed(() => {
    const a = this.application();
    if (!a) return '?';
    const f = (a.candidateFirstName || '').trim();
    const l = (a.candidateLastName || '').trim();
    return ((f[0] || '') + (l[0] || '')).toUpperCase() || '?';
  });

  statusLabel = computed(() => getApplicationStatusLabel(resolveApplicationStatusFromMirrors(this.application())));

  statusClass = computed(() => {
    const status = resolveApplicationStatusFromMirrors(this.application());
    if (status === 'FINAL_ACCEPTED') return 'badge-success';
    if (isRejectedStatus(status)) return 'badge-error';
    if (status === 'PENDING' || status === 'WITHDRAWN') return 'badge-neutral';
    return 'badge-primary';
  });

  /** Progression triée chronologiquement par stageOrder puis par id. */
  orderedProgress = computed(() => {
    const stageOrder = new Map<number, number>();
    this.stages().forEach((s, i) => { if (s.id) stageOrder.set(s.id, s.stageOrder ?? i); });
    return [...this.progressList()].sort((a, b) => {
      const oa = a.pipelineStageId ? stageOrder.get(a.pipelineStageId) ?? 9999 : 9999;
      const ob = b.pipelineStageId ? stageOrder.get(b.pipelineStageId) ?? 9999 : 9999;
      if (oa !== ob) return oa - ob;
      return (a.id || 0) - (b.id || 0);
    });
  });

  currentProgress = computed(() =>
    this.orderedProgress().find(p => p.progressStatus === 'IN_PROGRESS') || null
  );

  currentStageLabel = computed(() => {
    const p = this.currentProgress();
    if (!p) return '—';
    const stage = this.stages().find(s => s.id === p.pipelineStageId);
    return stage?.stageLabel || p.stageName || 'Étape courante';
  });

  /** Progressions pointant vers un stage absent des stages actifs. */
  inactiveProgressCount = computed(() => {
    const ids = new Set(this.stages().map(s => s.id).filter((id): id is number => !!id));
    return this.progressList().filter(p => p.pipelineStageId && !ids.has(p.pipelineStageId)).length;
  });

  /** Nombre total de questions du quiz (premier quiz attempt). */
  totalQuestions = computed(() => {
    const attempts = this.application()?.quizAttempts;
    if (!attempts || attempts.length === 0) return 0;
    return attempts[0].totalQuestions || 0;
  });

  /** Dernier quiz attempt (résumé attempt, source unique du statut quiz). */
  currentQuizAttempt = computed(() => {
    const attempts = this.application()?.quizAttempts;
    if (!attempts || attempts.length === 0) return null;
    return attempts[0];
  });

  /** Retrouve le PipelineStage correspondant à une progression. */
  getStageForProgress(p: ApplicationProgress): PipelineStage | undefined {
    return this.stages().find(s => s.id === p.pipelineStageId);
  }

  /** Liste des interviews pour une progress donnée. */
  interviewsForProgress(progressId: number | undefined): Interview[] {
    if (!progressId) return [];
    return this.interviews().filter(i => i.applicationProgressId === progressId);
  }

  /** Liste des décisions pour une progress donnée. */
  decisionsForProgress(progressId: number | undefined): Decision[] {
    if (!progressId) return [];
    return this.decisions().filter(d => d.applicationProgressId === progressId);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private campaignService: CampaignService,
    private pipelineStageService: PipelineStageService,
    private applicationProgressService: ApplicationProgressService,
    private interviewService: InterviewService,
    private decisionService: DecisionService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || isNaN(+id)) {
      this.errorMessage.set('Candidature introuvable.');
      this.loading.set(false);
      return;
    }
    this.applicationId = +id;
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Chargement ──────────────────────────────────────
  private loadAll(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.applicationService.getApplicationsByCriteria({ id: this.applicationId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const app = response?.items?.[0] || null;
          if (!app) {
            this.errorMessage.set('Candidature introuvable.');
            this.loading.set(false);
            return;
          }
          this.application.set(app);
          this.loadRelatedData(app);
        },
        error: () => {
          this.errorMessage.set('Impossible de charger la candidature.');
          this.loading.set(false);
        }
      });
  }

  private loadRelatedData(app: Application): void {
    const campaignId = app.campaignId || this.route.snapshot.queryParams['campaignId'];
    const numericCampaignId = campaignId ? Number(campaignId) : null;

    forkJoin({
      campaign: numericCampaignId
        ? this.campaignService.getCampaignById(numericCampaignId).pipe(catchError(() => of(null)))
        : of(null),
      progress: this.applicationProgressService.getAllByCriteria({
        applicationId: this.applicationId,
        isDeleted: false,
        size: 200
      }).pipe(catchError(() => of({ content: [] as ApplicationProgress[], totalElements: 0, totalPages: 0, size: 0, number: 0 }))),
      interviews: this.interviewService.getAllInterviewsByCriteria({
        applicationId: this.applicationId,
        isDeleted: false,
        size: 200
      }).pipe(catchError(() => of({ content: [] as Interview[], totalElements: 0, totalPages: 0, size: 0, number: 0 }))),
      decisions: this.decisionService.getDecisionsByApplicationId(this.applicationId)
        .pipe(catchError(() => of({ hasError: true, status: { code: '', message: '' }, items: [] as Decision[] })))
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ campaign, progress, interviews, decisions }) => {
        this.campaign.set(campaign || null);
        this.progressList.set(progress.content || []);
        this.interviews.set(interviews.content || []);
        this.decisions.set(decisions.items || []);

        const templateId = campaign?.pipelineTemplateId;
        if (templateId) {
          this.pipelineStageService.getByTemplate(templateId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (stagesResponse: any) => {
                const items: PipelineStage[] = stagesResponse?.items || [];
                this.stages.set(items.sort((a, b) => (a.stageOrder || 0) - (b.stageOrder || 0)));
                this.autoExpandCurrent();
                this.loading.set(false);
              },
              error: () => {
                this.autoExpandCurrent();
                this.loading.set(false);
              }
            });
        } else {
          this.autoExpandCurrent();
          this.loading.set(false);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  private autoExpandCurrent(): void {
    const current = this.currentProgress();
    if (current?.id) {
      this.expandedStages.set({ [current.id]: true });
    }
  }

  refresh(): void {
    this.loadAll();
  }

  private refreshProgress(): void {
    this.applicationProgressService.getAllByCriteria({
      applicationId: this.applicationId,
      isDeleted: false,
      size: 200
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => this.progressList.set(res.content || [])
    });
    // recharge aussi application pour les agrégats / statuts globaux
    this.applicationService.getApplicationsByCriteria({ id: this.applicationId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => { const a = r?.items?.[0]; if (a) this.application.set(a); } });
  }

  // ── Helpers UI ──────────────────────────────────────
  stageTypeLabel(type: string | undefined): string {
    if (!type) return '—';
    const norm = normalizePipelineStageType(type as any) || type;
    return STAGE_TYPE_LABELS[norm as keyof typeof STAGE_TYPE_LABELS] || type;
  }

  progressStatusClass(status: string | undefined): string {
    switch (status) {
      case 'PASSED': return 'badge-success';
      case 'FAILED': return 'badge-error';
      case 'SKIPPED': return 'badge-warning';
      case 'IN_PROGRESS': return 'badge-primary';
      default: return 'badge-neutral';
    }
  }

  progressStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'PASSED': return 'Validée';
      case 'FAILED': return 'Refusée';
      case 'SKIPPED': return 'Sautée';
      case 'IN_PROGRESS': return 'En cours';
      default: return 'En attente';
    }
  }

  interviewStatusClass(status: string | undefined): string {
    switch (status) {
      case 'PASSED': return 'badge-success';
      case 'FAILED': return 'badge-error';
      case 'SCHEDULED':
      case 'STARTED': return 'badge-primary';
      case 'POSTPONED': return 'badge-warning';
      case 'OVER': return 'badge-info';
      case 'ARCHIVED': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  }

  decisionTypeClass(type: string | undefined): string {
    if (!type) return 'badge-neutral';
    if (type.includes('ACCEPTED')) return 'badge-success';
    if (type.includes('REJECTED')) return 'badge-error';
    return 'badge-info';
  }

  decisionTypeLabel(type: string | undefined): string {
    switch (type) {
      case 'PRE_SCREEN_ACCEPTED': return 'Présélection acceptée';
      case 'PRE_SCREEN_REJECTED': return 'Présélection refusée';
      case 'FINAL_ACCEPTED': return 'Décision finale acceptée';
      case 'FINAL_REJECTED': return 'Décision finale refusée';
      default: return type || '—';
    }
  }

  quizStatusClass(): string {
    switch (this.currentQuizAttempt()?.quizStatus) {
      case 'COMPLETED': return 'badge-success';
      case 'STARTED': return 'badge-primary';
      case 'ABANDONED': return 'badge-error';
      default: return 'badge-neutral';
    }
  }

  quizStatusLabel(): string {
    switch (this.currentQuizAttempt()?.quizStatus) {
      case 'COMPLETED': return 'Terminé';
      case 'STARTED': return 'En cours';
      case 'ABANDONED': return 'Abandonné';
      default: return 'En attente';
    }
  }

  isCurrentProgress(p: ApplicationProgress): boolean {
    return p === this.currentProgress();
  }

  isExpanded(progressId: number | undefined): boolean {
    return !!(progressId && this.expandedStages()[progressId]);
  }

  toggleExpand(progressId: number | undefined): void {
    if (!progressId) return;
    this.expandedStages.set({
      ...this.expandedStages(),
      [progressId]: !this.expandedStages()[progressId]
    });
  }

  isActionLoading(key: string): boolean {
    return !!this.actionLoading()[key];
  }

  private setActionLoading(key: string, value: boolean): void {
    this.actionLoading.set({ ...this.actionLoading(), [key]: value });
  }

  // ── Actions pipeline ────────────────────────────────
  advanceCurrent(): void {
    const app = this.application();
    if (!app?.id || app.applicationAbandoned) return;
    const key = `advance-${app.id}`;
    if (this.isActionLoading(key)) return;
    this.setActionLoading(key, true);

    this.applicationProgressService.advance(app.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.hasError) this.refreshProgress();
          this.setActionLoading(key, false);
        },
        error: () => this.setActionLoading(key, false)
      });
  }

  openRejectModal(stageId: number): void {
    this.rejectStageId.set(stageId);
    this.rejectReason.set('');
    this.showRejectModal.set(true);
  }

  cancelReject(): void {
    this.showRejectModal.set(false);
    this.rejectStageId.set(null);
    this.rejectReason.set('');
  }

  confirmReject(): void {
    const app = this.application();
    const stageId = this.rejectStageId();
    if (!app?.id || !stageId) return;
    const key = `fail-${stageId}`;
    this.setActionLoading(key, true);
    this.showRejectModal.set(false);

    this.applicationProgressService.fail(app.id, stageId, this.rejectReason() || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.hasError) this.refreshProgress();
          this.setActionLoading(key, false);
        },
        error: () => this.setActionLoading(key, false)
      });
  }

  skipCurrent(stage: PipelineStage): void {
    const app = this.application();
    if (!app?.id || !stage.id || app.applicationAbandoned) return;
    if (stage.isRequired) return; // jamais skipper un round obligatoire
    const key = `skip-${stage.id}`;
    if (this.isActionLoading(key)) return;
    this.setActionLoading(key, true);

    this.applicationProgressService.skip(app.id, stage.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.hasError) this.refreshProgress();
          this.setActionLoading(key, false);
        },
        error: () => this.setActionLoading(key, false)
      });
  }

  canActOnCurrent(p: ApplicationProgress): boolean {
    const app = this.application();
    return !!app && !app.applicationAbandoned && p.progressStatus === 'IN_PROGRESS';
  }

  canSkipCurrent(p: ApplicationProgress): boolean {
    if (!this.canActOnCurrent(p)) return false;
    const stage = this.stages().find(s => s.id === p.pipelineStageId);
    return !!stage && !stage.isRequired;
  }

  // ── Navigation vers les écrans métier ───────────────
  goBack(): void {
    this.router.navigate(['/dashboard/candidates']);
  }

  planInterview(stage?: PipelineStage): void {
    const app = this.application();
    if (!app) return;
    this.router.navigate(['/dashboard/interviews/create'], {
      queryParams: {
        applicationId: app.id,
        campaignId: this.campaign()?.id || app.campaignId,
        pipelineStageId: stage?.id
      }
    });
  }

  openInterview(interview: Interview): void {
    // l'évaluation s'ouvre via le lien fourni par le backend
    if (interview.interviewEvaluationsLink) {
      this.router.navigate(['/dashboard/evaluation', interview.interviewEvaluationsLink]);
    } else {
      this.router.navigate(['/dashboard/interviews']);
    }
  }

  openDecision(): void {
    this.router.navigate(['/dashboard/decisions'], {
      queryParams: { applicationId: this.application()?.id }
    });
  }

  openQuizAnswers(): void {
    const app = this.application();
    if (!app?.id) return;
    this.router.navigate(['/dashboard/entities/candidate-answers'], {
      queryParams: { applicationId: app.id }
    });
  }

  viewCv(): void {
    const path = this.application()?.candidateCvPath;
    if (path) window.open(path, '_blank');
  }

  formatDate(value: string | undefined): string {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  }
}
