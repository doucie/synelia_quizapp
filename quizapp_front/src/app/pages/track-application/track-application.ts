import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../shared/filter-select/filter-select';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

type InterviewResponseAction = 'ACCEPT' | 'DECLINE' | 'REQUEST_RESCHEDULE';
type CandidateAskRequestType = 'IDENTITY' | 'EMAIL' | 'PHONE';
type CandidateAskStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface TrackingStage {
  id: number;
  stageLabel: string;
  stageType: string;
  stageOrder: number;
  isRequired: boolean;
  isEliminatory: boolean;
  progress?: TrackingProgress;
}

interface TrackingProgress {
  id: number;
  pipelineStageId: number;
  progressStatus: string;
  startedAt: string | null;
  completedAt: string | null;
  score: number | null;
}

interface TrackingApplication {
  id: number;
  candidateFirstName: string;
  candidateLastName: string;
  candidateEmail: string;
  trackingCode?: string | null;
  trackedStatus: string;
  quizStatus: string;
  applicationAbandoned?: boolean;
  publicActionsLocked?: boolean;
  publicLockReason?: string | null;
  canWithdraw?: boolean;
  createdAt: string;
  emailVerified: boolean;
  campaignTitle: string;
}

interface TrackingQuiz {
  applicationId: number;
  applicationQuizAttemptId?: number | null;
  applicationProgressId?: number | null;
  pipelineStageId?: number | null;
  pipelineStageType?: string | null;
  pipelineStageLabel?: string | null;
  pipelineStageOrder?: number | null;
  quizToken: string | null;
  quizStatus: string | null;
  canResume: boolean;
  startedAt: string | null;
  completedAt: string | null;
  lastActivityAt: string | null;
}

interface TrackingInterview {
  id: number;
  candidateInterviewId?: number | null;
  interviewId: number;
  applicationProgressId?: number | null;
  pipelineStageId?: number | null;
  pipelineStageType?: string | null;
  pipelineStageLabel?: string | null;
  pipelineStageOrder?: number | null;
  interviewDate: string | null;
  interviewDuration: number | null;
  interviewType: string;
  interviewStatus: string;
  interviewLocation: string | null;
  meetLink: string | null;
  interviewMailSent: boolean;
  interviewNote: string | null;
  declineReason: string | null;
  alternativeDateRequested: string | null;
  responseState: string;
  canRespond: boolean;
}

interface TrackingCandidateAsk {
  id: number;
  requestType: CandidateAskRequestType;
  askStatus: CandidateAskStatus;
  isVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  newEmail: string | null;
  newPhone: string | null;
  decisionReason: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface InterviewDraft {
  declineReason: string;
  alternativeDateRequested: string;
}

interface CandidateAskDraft {
  requestType: CandidateAskRequestType | '';
  firstName: string;
  lastName: string;
  newEmail: string;
  newPhone: string;
}

interface TrackingResponse {
  hasError: boolean;
  message?: string;
  application?: TrackingApplication;
  quiz?: TrackingQuiz | null;
  stages?: any[];
  progress?: any[];
  interviews?: TrackingInterview[];
  asks?: TrackingCandidateAsk[];
}

@Component({
  selector: 'app-track-application',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterSelectComponent, FilterSelectOptionDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './track-application.html',
  styleUrls: ['./track-application.scss']
})
export class TrackApplicationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  trackingCode = '';
  email = '';
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  application = signal<TrackingApplication | null>(null);
  quiz = signal<TrackingQuiz | null>(null);
  stages = signal<TrackingStage[]>([]);
  interviews = signal<TrackingInterview[]>([]);
  asks = signal<TrackingCandidateAsk[]>([]);
  interviewSuccessMessage = signal<string | null>(null);
  interviewErrorMessage = signal<string | null>(null);
  askSuccessMessage = signal<string | null>(null);
  askErrorMessage = signal<string | null>(null);
  withdrawSuccessMessage = signal<string | null>(null);
  withdrawErrorMessage = signal<string | null>(null);
  submittingInterviewId = signal<number | null>(null);
  submittingAsk = signal(false);
  submittingWithdraw = signal(false);

  selectedInterviewAction: Record<number, InterviewResponseAction | null> = {};
  interviewDrafts: Record<number, InterviewDraft> = {};
  askDraft: CandidateAskDraft = this.createEmptyAskDraft();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const prefilledCode = this.route.snapshot.queryParamMap.get('code');
    const prefilledEmail = this.route.snapshot.queryParamMap.get('email');

    if (prefilledCode) {
      this.trackingCode = prefilledCode;
    }
    if (prefilledEmail) {
      this.email = prefilledEmail;
    }
    if (prefilledCode && prefilledEmail) {
      this.trackApplication();
    }
  }

  trackApplication() {
    if (!this.trackingCode || !this.email) return;

    this.loading.set(true);
    this.errorMessage.set(null);
    this.application.set(null);
    this.quiz.set(null);
    this.stages.set([]);
    this.interviews.set([]);
    this.asks.set([]);
    this.interviewSuccessMessage.set(null);
    this.interviewErrorMessage.set(null);
    this.askSuccessMessage.set(null);
    this.askErrorMessage.set(null);
    this.withdrawSuccessMessage.set(null);
    this.withdrawErrorMessage.set(null);
    this.selectedInterviewAction = {};
    this.interviewDrafts = {};
    this.askDraft = this.createEmptyAskDraft();

    this.http.post<TrackingResponse>(`${environment.apiUrl}/applications/track`, {
      trackingCode: this.trackingCode.trim(),
      email: this.email.trim()
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.hasError) {
          this.errorMessage.set(res.message || 'Une erreur est survenue.');
          return;
        }
        this.application.set(res.application || null);
        this.quiz.set(res.quiz || null);
        // Fusionner stages + progress
        const stageList: TrackingStage[] = (res.stages || []).map((s: any) => {
          const progress = (res.progress || []).find((p: any) => p.pipelineStageId === s.id);
          return { ...s, progress: progress || undefined };
        });
        this.stages.set(stageList);
        this.syncInterviewState(res.interviews || []);
        this.syncCandidateAskState(res.asks || []);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Impossible de contacter le serveur. Veuillez réessayer.');
      }
    });
  }

  getStatusIcon(stage: TrackingStage): string {
    if (!stage.progress) return '⏳';
    switch (stage.progress.progressStatus) {
      case 'IN_PROGRESS': return '🔄';
      case 'PASSED': return '✅';
      case 'FAILED': return '❌';
      case 'SKIPPED': return '⏭️';
      default: return '⏳';
    }
  }

  getStatusClass(stage: TrackingStage): string {
    if (!stage.progress) return 'pending';
    switch (stage.progress.progressStatus) {
      case 'IN_PROGRESS': return 'in-progress';
      case 'PASSED': return 'passed';
      case 'FAILED': return 'failed';
      case 'SKIPPED': return 'skipped';
      default: return 'pending';
    }
  }

  getStatusLabel(stage: TrackingStage): string {
    if (!stage.progress) return 'En attente';
    switch (stage.progress.progressStatus) {
      case 'IN_PROGRESS': return 'En cours';
      case 'PASSED': return 'Réussi';
      case 'FAILED': return 'Échoué';
      case 'SKIPPED': return 'Ignoré';
      default: return 'En attente';
    }
  }

  getApplicationStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'NEW': 'Nouvelle',
      'IN_PROGRESS': 'En cours',
      'ACCEPTED': 'Acceptée',
      'REJECTED': 'Refusée',
      'WITHDRAWN': 'Retirée'
    };
    return labels[status] || status;
  }

  getApplicationStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'NEW': 'status-new',
      'IN_PROGRESS': 'status-in-progress',
      'ACCEPTED': 'status-accepted',
      'REJECTED': 'status-rejected',
      'WITHDRAWN': 'status-withdrawn'
    };
    return classes[status] || 'status-new';
  }

  getQuizStatusLabel(status: string | null): string {
    const labels: Record<string, string> = {
      PENDING: 'Prêt à démarrer',
      STARTED: 'En cours',
      COMPLETED: 'Terminé',
      MANUAL_CORRECTION_PENDING: 'En correction manuelle',
      AUTO_PASSED: 'Réussi',
      AUTO_FAILED: 'Échoué'
    };

    return status ? (labels[status] || status) : 'Indisponible';
  }

  getQuizResumeUrl(quiz: TrackingQuiz): string | null {
    if (!quiz.quizToken) {
      return null;
    }

    return `/quiz/${quiz.applicationId}/${quiz.quizToken}`;
  }

  getQuizOccurrenceLabel(quiz: TrackingQuiz): string | null {
    if (quiz.pipelineStageLabel?.trim()) {
      return quiz.pipelineStageLabel.trim();
    }

    if (quiz.pipelineStageType?.trim()) {
      return quiz.pipelineStageType.trim().replace(/_/g, ' ');
    }

    return null;
  }

  getQuizActionLabel(quiz: TrackingQuiz): string {
    return quiz.quizStatus === 'STARTED' ? 'Reprendre le quiz' : 'Commencer le quiz';
  }

  canWithdrawApplication(app: TrackingApplication): boolean {
    return Boolean(app.canWithdraw) && !this.submittingWithdraw();
  }

  getDisplayedTrackingCode(app: TrackingApplication): string {
    return (app.trackingCode || this.trackingCode || '').trim().toUpperCase();
  }

  getCurrentStage(): TrackingStage | null {
    const list = this.stages();
    return list.find(s => s.progress?.progressStatus === 'IN_PROGRESS') || null;
  }

  onAskTypeChange(requestType: CandidateAskRequestType | '') {
    this.askSuccessMessage.set(null);
    this.askErrorMessage.set(null);
    this.askDraft = {
      ...this.createEmptyAskDraft(),
      requestType
    };
  }

  submitCandidateAsk() {
    if (!this.application()) {
      return;
    }
    if (this.arePublicActionsLocked()) {
      this.askErrorMessage.set(this.getPublicLockReason());
      return;
    }

    const requestType = this.askDraft.requestType;
    if (!requestType) {
      this.askErrorMessage.set('Veuillez choisir le type de correction à demander.');
      return;
    }

    this.submittingAsk.set(true);
    this.askSuccessMessage.set(null);
    this.askErrorMessage.set(null);

    this.http.post<TrackingResponse>(`${environment.apiUrl}/applications/submit-ask`, {
      trackingCode: this.trackingCode.trim(),
      email: this.email.trim(),
      requestType,
      firstName: requestType === 'IDENTITY' ? this.normalizeOptionalField(this.askDraft.firstName) : null,
      lastName: requestType === 'IDENTITY' ? this.normalizeOptionalField(this.askDraft.lastName) : null,
      newEmail: requestType === 'EMAIL' ? this.normalizeOptionalField(this.askDraft.newEmail)?.toLowerCase() ?? null : null,
      newPhone: requestType === 'PHONE' ? this.normalizeOptionalField(this.askDraft.newPhone) : null
    }).subscribe({
      next: (res) => {
        this.submittingAsk.set(false);
        if (res.hasError) {
          this.askErrorMessage.set(res.message || 'Impossible d’enregistrer votre demande pour le moment.');
          return;
        }

        this.askSuccessMessage.set(res.message || 'Votre demande a bien été enregistrée.');
        this.syncCandidateAskState(res.asks || []);
        this.askDraft = this.createEmptyAskDraft();
      },
      error: () => {
        this.submittingAsk.set(false);
        this.askErrorMessage.set('Impossible de transmettre votre demande pour le moment.');
      }
    });
  }

  getAskRequestTypeLabel(requestType: CandidateAskRequestType): string {
    const labels: Record<CandidateAskRequestType, string> = {
      IDENTITY: 'Nom / prénom',
      EMAIL: 'Adresse email',
      PHONE: 'Téléphone'
    };
    return labels[requestType];
  }

  getAskStatusLabel(ask: TrackingCandidateAsk): string {
    const labels: Record<CandidateAskStatus, string> = {
      PENDING: 'En attente',
      APPROVED: 'Validée',
      REJECTED: 'Refusée'
    };
    return labels[ask.askStatus] || ask.askStatus;
  }

  getAskStatusClass(ask: TrackingCandidateAsk): string {
    const classes: Record<CandidateAskStatus, string> = {
      PENDING: 'candidate-ask-status--pending',
      APPROVED: 'candidate-ask-status--approved',
      REJECTED: 'candidate-ask-status--rejected'
    };
    return classes[ask.askStatus] || classes.PENDING;
  }

  getAskSummary(ask: TrackingCandidateAsk): string {
    if (ask.requestType === 'EMAIL') {
      return ask.newEmail || 'Aucune adresse fournie';
    }
    if (ask.requestType === 'PHONE') {
      return ask.newPhone || 'Aucun numéro fourni';
    }

    const identityParts = [ask.firstName, ask.lastName].filter((value): value is string => !!value && value.trim().length > 0);
    return identityParts.length > 0 ? identityParts.join(' ') : 'Aucune correction fournie';
  }

  getInterviewAction(interviewId: number): InterviewResponseAction | null {
    return this.selectedInterviewAction[interviewId] || null;
  }

  setInterviewAction(interviewId: number, action: InterviewResponseAction) {
    this.interviewSuccessMessage.set(null);
    this.interviewErrorMessage.set(null);
    this.selectedInterviewAction[interviewId] = action;
  }

  cancelInterviewAction(interviewId: number) {
    this.selectedInterviewAction[interviewId] = null;
    this.interviewErrorMessage.set(null);
  }

  submitInterviewAction(interview: TrackingInterview, actionOverride?: InterviewResponseAction) {
    const action = actionOverride || this.getInterviewAction(interview.id);
    if (!action) {
      return;
    }
    if (this.arePublicActionsLocked()) {
      this.interviewErrorMessage.set(this.getPublicLockReason());
      return;
    }

    const draft = this.interviewDrafts[interview.id] || { declineReason: '', alternativeDateRequested: '' };
    if (action === 'DECLINE' && !draft.declineReason.trim()) {
      this.interviewErrorMessage.set('Veuillez préciser la raison du refus avant validation.');
      return;
    }
    if (action === 'REQUEST_RESCHEDULE' && !draft.alternativeDateRequested.trim()) {
      this.interviewErrorMessage.set('Veuillez proposer une autre date avant validation.');
      return;
    }

    this.submittingInterviewId.set(interview.id);
    this.interviewSuccessMessage.set(null);
    this.interviewErrorMessage.set(null);

    this.http.post<TrackingResponse>(`${environment.apiUrl}/applications/respond-interview`, {
      trackingCode: this.trackingCode.trim(),
      email: this.email.trim(),
      candidateInterviewId: String(this.getCandidateInterviewId(interview)),
      action,
      declineReason: draft.declineReason.trim(),
      alternativeDateRequested: draft.alternativeDateRequested
    }).subscribe({
      next: (res) => {
        this.submittingInterviewId.set(null);
        if (res.hasError) {
          this.interviewErrorMessage.set(res.message || 'Impossible d’enregistrer votre réponse.');
          return;
        }

        this.interviewSuccessMessage.set(res.message || 'Votre réponse a bien été enregistrée.');
        this.selectedInterviewAction[interview.id] = null;
        this.syncInterviewState(res.interviews || []);
      },
      error: () => {
        this.submittingInterviewId.set(null);
        this.interviewErrorMessage.set('Impossible de transmettre votre réponse pour le moment.');
      }
    });
  }

  isSubmittingInterview(interviewId: number): boolean {
    return this.submittingInterviewId() === interviewId;
  }

  submitWithdrawal() {
    const app = this.application();
    if (!app || !app.canWithdraw) {
      return;
    }
    if (!window.confirm('Retirer définitivement votre candidature ? Cette action bloquera les actions publiques sur ce dossier.')) {
      return;
    }

    this.submittingWithdraw.set(true);
    this.withdrawSuccessMessage.set(null);
    this.withdrawErrorMessage.set(null);

    this.http.post<TrackingResponse>(`${environment.apiUrl}/applications/withdraw`, {
      trackingCode: this.trackingCode.trim(),
      email: this.email.trim()
    }).subscribe({
      next: (res) => {
        this.submittingWithdraw.set(false);
        if (res.hasError) {
          this.withdrawErrorMessage.set(res.message || 'Impossible de retirer votre candidature pour le moment.');
          return;
        }

        this.withdrawSuccessMessage.set(res.message || 'Votre candidature a bien été retirée.');
        this.application.set(res.application || null);
        this.quiz.set(res.quiz || null);
        this.syncInterviewState(res.interviews || []);
        this.syncCandidateAskState(res.asks || []);
      },
      error: () => {
        this.submittingWithdraw.set(false);
        this.withdrawErrorMessage.set('Impossible de retirer votre candidature pour le moment.');
      }
    });
  }

  arePublicActionsLocked(): boolean {
    return Boolean(this.application()?.publicActionsLocked);
  }

  getPublicLockReason(): string {
    return this.application()?.publicLockReason || 'Cette candidature a été retirée. Les actions publiques ne sont plus disponibles.';
  }

  getInterviewTypeLabel(type: string): string {
    return type === 'IN_PERSON' ? 'Entretien en présentiel' : 'Entretien en visioconférence';
  }

  getInterviewStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'En préparation',
      SCHEDULED: 'Planifié',
      STARTED: 'En cours',
      OVER: 'Terminé',
      POSTPONED: 'Replanification demandée',
      ARCHIVED: 'Archivé'
    };

    return labels[status] || status;
  }

  getInterviewStatusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'pending',
      SCHEDULED: 'scheduled',
      STARTED: 'started',
      OVER: 'over',
      POSTPONED: 'postponed',
      ARCHIVED: 'archived'
    };

    return classes[status] || 'pending';
  }

  getInterviewResponseLabel(state: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Aucune réponse envoyée',
      DECLINED: 'Refus transmis',
      RESCHEDULE_REQUESTED: 'Nouvelle date demandée'
    };

    return labels[state] || state;
  }

  getInterviewResponseClass(state: string): string {
    const classes: Record<string, string> = {
      PENDING: 'response-pending',
      DECLINED: 'response-declined',
      RESCHEDULE_REQUESTED: 'response-reschedule'
    };

    return classes[state] || 'response-pending';
  }

  getInterviewAccessLabel(interview: TrackingInterview): string {
    if (interview.interviewType === 'IN_PERSON') {
      return interview.interviewLocation || 'Lieu à préciser';
    }

    return interview.meetLink || 'Lien communiqué ultérieurement';
  }

  getCandidateInterviewId(interview: TrackingInterview): number {
    return interview.candidateInterviewId ?? interview.id;
  }

	getInterviewOccurrenceLabel(interview: TrackingInterview): string | null {
		if (interview.pipelineStageLabel?.trim()) {
			return interview.pipelineStageLabel.trim();
		}

		if (interview.pipelineStageType?.trim()) {
			return interview.pipelineStageType.trim().replace(/_/g, ' ');
		}

		return null;
	}

  private syncInterviewState(interviews: TrackingInterview[]) {
    const sortedInterviews = [...interviews].sort((left, right) => {
      const leftOrder = typeof left.pipelineStageOrder === 'number' ? left.pipelineStageOrder : Number.MAX_SAFE_INTEGER;
      const rightOrder = typeof right.pipelineStageOrder === 'number' ? right.pipelineStageOrder : Number.MAX_SAFE_INTEGER;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      const leftStart = left.interviewDate ? new Date(left.interviewDate).getTime() : Number.MAX_SAFE_INTEGER;
      const rightStart = right.interviewDate ? new Date(right.interviewDate).getTime() : Number.MAX_SAFE_INTEGER;
      if (leftStart !== rightStart) {
        return leftStart - rightStart;
      }

      return left.id - right.id;
    });

    this.interviews.set(sortedInterviews);
    this.selectedInterviewAction = sortedInterviews.reduce<Record<number, InterviewResponseAction | null>>((state, interview) => {
      state[interview.id] = this.selectedInterviewAction[interview.id] || null;
      return state;
    }, {});
    this.interviewDrafts = sortedInterviews.reduce<Record<number, InterviewDraft>>((state, interview) => {
      state[interview.id] = this.interviewDrafts[interview.id] || {
        declineReason: interview.declineReason || '',
        alternativeDateRequested: interview.alternativeDateRequested
          ? interview.alternativeDateRequested.slice(0, 16)
          : ''
      };
      return state;
    }, {});
  }

  private syncCandidateAskState(asks: TrackingCandidateAsk[]) {
    this.asks.set(asks);
  }

  private createEmptyAskDraft(): CandidateAskDraft {
    return {
      requestType: '',
      firstName: '',
      lastName: '',
      newEmail: '',
      newPhone: ''
    };
  }

  private normalizeOptionalField(value: string): string | null {
    const normalizedValue = value?.trim();
    return normalizedValue ? normalizedValue : null;
  }
}
