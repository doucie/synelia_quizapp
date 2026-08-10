import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, of, map, catchError, switchMap } from 'rxjs';
import { Interview, InterviewService } from '../../../core/services/interview.service';
import { Application, ApplicationService } from '../../../core/services/application.service';
import { Campaign, CampaignService } from '../../../core/services/campaign.service';
import { CandidateInterviewEntityService } from '../../../core/services/candidate-interview-entity.service';
import { Evaluation, EvaluationItem, EvaluationService } from '../../../core/services/evaluation.service';
import { InterviewParticipant, InterviewParticipantService } from '../../../core/services/interview-participant.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { User, UserService } from '../../../core/services/user.service';
import {
  formatEvaluationItemValue,
  getEvaluationItemLabel,
  resolveCandidateMark
} from '../../../core/utils/evaluation-score.utils';

interface EvaluatorSubmissionStatus {
  participantId?: number;
  userId: number;
  displayName: string;
  hasSubmitted: boolean;
  hasFinished: boolean;
  isOnline: boolean;
  isCurrentUser: boolean;
  latestMark?: number | null;
}

interface InterviewWithDetails extends Interview {
  candidateName?: string;
  candidateEmailDisplay?: string;
  campaignTitle?: string;
  applicationId?: number;
  candidateFirstName?: string;
  candidateLastName?: string;
  quizScorePercent?: number;
  interviewTitle?: string;
	candidateInterviewId?: number;
	submittedEvaluationCount?: number;
	latestEvaluationMark?: number | null;
  submittedEvaluationAverageMark?: number | null;
	latestEvaluationComment?: string;
	latestEvaluationItems?: EvaluationItem[];
	latestEvaluationAt?: string;
  evaluatorStatuses?: EvaluatorSubmissionStatus[];
  interviewRound?: number;
  interviewStageLabel?: string;
}

@Component({
  selector: 'app-evaluations-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluations-list.html',
  styleUrl: './evaluations-list.scss'
})
export class EvaluationsListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Signals
  interviews = signal<InterviewWithDetails[]>([]);
  applications = signal<Application[]>([]);
  campaigns = signal<Map<number, Campaign>>(new Map());
  loading = signal(false);
  searchTerm = signal('');
  selectedFilter = signal<'ALL' | 'IN_PROGRESS' | 'CLOSED'>('ALL');
  currentUserId = signal<number>(0);

  // Computed: interviews filtrés (seulement IN_PROGRESS et CLOSED pour les évaluations)
  filteredInterviews = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const filter = this.selectedFilter();
    
    return this.interviews()
      .filter(interview => {
        // Seulement les entretiens qui peuvent être évalués (IN_PROGRESS ou CLOSED)
        if (!['IN_PROGRESS', 'CLOSED'].includes(interview.interviewStatus || '')) {
          return false;
        }
        
        // Filtre par statut
        if (filter !== 'ALL' && interview.interviewStatus !== filter) {
          return false;
        }
        
        // Recherche
        if (term) {
          const searchFields = [
            interview.candidateName,
            interview.candidateEmailDisplay,
            interview.campaignTitle,
            interview.interviewTitle
          ].filter(Boolean).join(' ').toLowerCase();
          
          return searchFields.includes(term);
        }
        
        return true;
      })
      .sort((a, b) => {
        // Trier par date de fin décroissante pour CLOSED, puis par date de début pour IN_PROGRESS
        if (a.interviewStatus === 'CLOSED' && b.interviewStatus === 'CLOSED') {
          return new Date(b.endedAt || 0).getTime() - new Date(a.endedAt || 0).getTime();
        }
        if (a.interviewStatus === 'IN_PROGRESS' && b.interviewStatus === 'IN_PROGRESS') {
          return new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime();
        }
        // IN_PROGRESS avant CLOSED
        return a.interviewStatus === 'IN_PROGRESS' ? -1 : 1;
      });
  });

  // Stats
  totalEvaluations = computed(() => this.interviews().filter(i => ['IN_PROGRESS', 'CLOSED'].includes(i.interviewStatus || '')).length);
  inProgressCount = computed(() => this.interviews().filter(i => i.interviewStatus === 'IN_PROGRESS').length);
  completedCount = computed(() => this.interviews().filter(i => i.interviewStatus === 'CLOSED').length);

  constructor(
    private router: Router,
    private interviewService: InterviewService,
    private applicationService: ApplicationService,
    private campaignService: CampaignService,
		private candidateInterviewEntityService: CandidateInterviewEntityService,
		private evaluationService: EvaluationService,
		private interviewParticipantService: InterviewParticipantService,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserId.set(parseInt(currentUser.id));
    }
  }

  loadData(): void {
    this.loading.set(true);

    forkJoin({
      interviews: this.interviewService.getAllInterviews(),
      applications: this.applicationService.getApplicationsByCriteria({}),
      campaigns: this.campaignService.getMyCampaigns({ isDeleted: false })
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ interviews, applications, campaigns }) => {
          // Mapper les campagnes
          const campaignMap = new Map<number, Campaign>();
          if (campaigns.content) {
            campaigns.content.forEach((c: Campaign) => campaignMap.set(c.id!, c));
          }
          this.campaigns.set(campaignMap);

          // Stocker les applications
          if (!applications.hasError && applications.items) {
            this.applications.set(applications.items);
          }

          // Enrichir les interviews
          if (!interviews.hasError && interviews.items) {
            const enrichedInterviews: InterviewWithDetails[] = interviews.items.map((interview: Interview) => {
              const app = this.applications().find(a => a.id === interview.applicationId);
              const campaign = campaignMap.get(interview.campaignId || 0);

              return {
                ...interview,
                candidateName: app ? `${app.candidateFirstName || ''} ${app.candidateLastName || ''}`.trim() : 'Candidat inconnu',
                candidateEmailDisplay: app?.candidateEmail || '',
                campaignTitle: campaign?.campaignTitle || 'Campagne inconnue',
                candidateFirstName: app?.candidateFirstName,
                candidateLastName: app?.candidateLastName,
                quizScorePercent: app?.aggregatedQuizScorePercent,
                interviewStageLabel: interview.pipelineStageLabel,
                interviewTitle: `Entretien #${interview.id}`
              };
            });

            this.interviews.set(enrichedInterviews);
			this.loadEvaluationSnapshots(enrichedInterviews);
          }

          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur chargement:', err);
          this.notificationService.error('Erreur', 'Impossible de charger les données');
          this.loading.set(false);
        }
      });
  }

  setFilter(filter: 'ALL' | 'IN_PROGRESS' | 'CLOSED'): void {
    this.selectedFilter.set(filter);
  }

  openEvaluation(interview: InterviewWithDetails): void {
    if (interview.evaluationRoomCode) {
      this.router.navigate(['/dashboard/evaluate', interview.evaluationRoomCode]);
    } else {
      this.notificationService.warning('Attention', 'Lien d\'évaluation non disponible');
    }
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'IN_PROGRESS': return 'En cours';
      case 'CLOSED': return 'Clôturé';
      default: return status || 'Inconnu';
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'IN_PROGRESS': return 'in-progress';
      case 'CLOSED': return 'completed';
      default: return '';
    }
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDerivedMark(value: number | null | undefined): string {
    if (value === undefined || value === null) {
      return '-';
    }

    return `${Number.isInteger(value) ? value : value.toFixed(1)}/100`;
  }

  getLatestEvaluationPreviewItems(interview: InterviewWithDetails): EvaluationItem[] {
    return (interview.latestEvaluationItems ?? []).slice(0, 3);
  }

  hasLatestEvaluationPreview(interview: InterviewWithDetails): boolean {
    return this.getLatestEvaluationPreviewItems(interview).length > 0;
  }

  hasEvaluatorStatuses(interview: InterviewWithDetails): boolean {
    return (interview.evaluatorStatuses ?? []).length > 0;
  }

  getSubmittedEvaluatorCount(interview: InterviewWithDetails): number {
    return (interview.evaluatorStatuses ?? []).filter(status => status.hasSubmitted).length;
  }

  trackEvaluationPreviewItem(index: number, item: EvaluationItem): number | string {
    return item.id ?? item.pipelineStageEvaluationCriterionId ?? index;
  }

  trackEvaluatorStatus(index: number, status: EvaluatorSubmissionStatus): number {
    return status.participantId ?? status.userId ?? index;
  }

  getEvaluationPreviewLabel(item: EvaluationItem): string {
    return getEvaluationItemLabel(item);
  }

  getEvaluationPreviewValue(item: EvaluationItem): string {
    return formatEvaluationItemValue(item);
  }

  hasInterviewStageContext(interview: InterviewWithDetails): boolean {
    return !!interview.interviewRound || !!interview.interviewStageLabel;
  }

  getEvaluatorStatusLabel(status: EvaluatorSubmissionStatus): string {
    if (status.hasSubmitted) {
      return 'Soumis';
    }
    if (status.hasFinished) {
      return 'Termine';
    }
    if (status.isOnline) {
      return 'En ligne';
    }
    return 'Assigne';
  }

  getEvaluatorStatusClass(status: EvaluatorSubmissionStatus): string {
    if (status.hasSubmitted) {
      return 'submitted';
    }
    if (status.hasFinished) {
      return 'finished';
    }
    if (status.isOnline) {
      return 'online';
    }
    return 'assigned';
  }

  goToInterviews(): void {
    this.router.navigate(['/dashboard/interviews']);
  }

  private loadEvaluationSnapshots(interviews: InterviewWithDetails[]): void {
    const interviewIds = interviews
      .map(interview => interview.id)
      .filter((interviewId): interviewId is number => interviewId !== undefined && interviewId !== null);

    if (interviewIds.length === 0) {
      return;
    }

    this.candidateInterviewEntityService.getAllByCriteria({
      page: 0,
      size: Math.max(interviewIds.length * 2, 100),
      isDeleted: false
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        const candidateInterviews = (response.content || []).filter(candidateInterview =>
          candidateInterview.id != null
          && candidateInterview.interviewId != null
          && interviewIds.includes(candidateInterview.interviewId)
        );

        if (candidateInterviews.length === 0) {
          return;
        }

        forkJoin({
          evaluationResults: forkJoin(candidateInterviews.map(candidateInterview =>
            this.evaluationService.getEvaluationsByCandidateInterviewId(candidateInterview.id!).pipe(
              map(evaluationsResponse => ({
                candidateInterview,
                evaluations: (evaluationsResponse.items || []).filter(evaluation => !evaluation.isDeleted)
              })),
              catchError(() => of({
                candidateInterview,
                evaluations: [] as Evaluation[]
              }))
            )
          )),
          participantsResponse: this.interviewParticipantService.getAllByCriteria({
            page: 0,
            size: Math.max(interviewIds.length * 4, 100),
            isDeleted: false
          }).pipe(
            catchError(() => of({ content: [] as InterviewParticipant[] }))
          )
        }).pipe(
          switchMap(({ evaluationResults, participantsResponse }) => {
            const participants = (participantsResponse.content || []).filter(participant =>
              participant.interviewId != null
              && interviewIds.includes(participant.interviewId)
              && !participant.isDeleted
            );

            if (participants.length === 0) {
              return of({
                evaluationResults,
                participants,
                usersById: new Map<number, User>()
              });
            }

            return this.userService.getByCriteria({ page: 0, size: 9999, isDeleted: false }).pipe(
              map(response => {
                const relevantUserIds = new Set(participants.map(participant => participant.userId));
                const usersById = new Map<number, User>();
                (response.content || [])
                  .filter(user => relevantUserIds.has(user.id))
                  .forEach(user => usersById.set(user.id, user));

                return {
                  evaluationResults,
                  participants,
                  usersById
                };
              }),
              catchError(() => of({
                evaluationResults,
                participants,
                usersById: new Map<number, User>()
              }))
            );
          }),
          takeUntil(this.destroy$)
        ).subscribe({
          next: ({ evaluationResults, participants, usersById }) => {
            this.interviews.set(this.mergeEvaluationSnapshots(this.interviews(), evaluationResults, participants, usersById));
          }
        });
      }
    });
  }

  private mergeEvaluationSnapshots(
    interviews: InterviewWithDetails[],
    results: Array<{ candidateInterview: { id?: number; interviewId?: number | undefined }; evaluations: Evaluation[] }>,
    participants: InterviewParticipant[],
    usersById: Map<number, User>
  ): InterviewWithDetails[] {
    const summariesByInterviewId = new Map<number, {
      candidateInterviewId?: number;
      evaluations: Evaluation[];
    }>();
    const participantsByInterviewId = new Map<number, InterviewParticipant[]>();

    participants.forEach(participant => {
      if (participant.interviewId == null) {
        return;
      }
      const existingParticipants = participantsByInterviewId.get(participant.interviewId) || [];
      existingParticipants.push(participant);
      participantsByInterviewId.set(participant.interviewId, existingParticipants);
    });

    results.forEach(result => {
      const interviewId = result.candidateInterview.interviewId;
      if (interviewId == null) {
        return;
      }
      const currentSummary = summariesByInterviewId.get(interviewId) || {
        candidateInterviewId: result.candidateInterview.id,
        evaluations: [] as Evaluation[]
      };
      if (currentSummary.candidateInterviewId == null && result.candidateInterview.id != null) {
        currentSummary.candidateInterviewId = result.candidateInterview.id;
      }
      currentSummary.evaluations.push(...result.evaluations);
      summariesByInterviewId.set(interviewId, currentSummary);
    });

    return interviews.map(interview => {
      if (interview.id == null) {
        return interview;
      }

      const summary = summariesByInterviewId.get(interview.id);
      const evaluations = summary?.evaluations ?? [];
      const latestEvaluation = this.selectLatestEvaluation(evaluations);
      return {
        ...interview,
        candidateInterviewId: summary?.candidateInterviewId ?? interview.candidateInterviewId,
        submittedEvaluationCount: evaluations.length,
        submittedEvaluationAverageMark: this.deriveAverageEvaluationMark(evaluations),
        latestEvaluationMark: latestEvaluation
          ? resolveCandidateMark(latestEvaluation.evaluationItems ?? [], latestEvaluation.globalScore)
          : null,
        latestEvaluationComment: latestEvaluation?.globalComment || undefined,
        latestEvaluationItems: latestEvaluation?.evaluationItems ?? [],
        latestEvaluationAt: latestEvaluation?.updatedAt || latestEvaluation?.createdAt,
        evaluatorStatuses: this.buildEvaluatorStatuses(
          participantsByInterviewId.get(interview.id) || [],
          evaluations,
          usersById
        )
      };
    });
  }

  private buildEvaluatorStatuses(
    participants: InterviewParticipant[],
    evaluations: Evaluation[],
    usersById: Map<number, User>
  ): EvaluatorSubmissionStatus[] {
    const evaluationsByParticipantId = new Map<number, Evaluation[]>();

    evaluations.forEach(evaluation => {
      if (evaluation.interviewParticipantId == null) {
        return;
      }

      const existingEvaluations = evaluationsByParticipantId.get(evaluation.interviewParticipantId) || [];
      existingEvaluations.push(evaluation);
      evaluationsByParticipantId.set(evaluation.interviewParticipantId, existingEvaluations);
    });

    return participants
      .filter((participant): participant is InterviewParticipant & { id: number } => participant.id != null)
      .map(participant => {
        const participantEvaluations = evaluationsByParticipantId.get(participant.id) || [];
        const latestParticipantEvaluation = this.selectLatestEvaluation(participantEvaluations);

        return {
          participantId: participant.id,
          userId: participant.userId,
          displayName: this.getEvaluatorDisplayName(usersById.get(participant.userId), participant.userId),
          hasSubmitted: participantEvaluations.length > 0,
          hasFinished: !!participant.hasFinished,
          isOnline: !!participant.isOnline,
          isCurrentUser: participant.userId === this.currentUserId(),
          latestMark: latestParticipantEvaluation
            ? resolveCandidateMark(latestParticipantEvaluation.evaluationItems ?? [], latestParticipantEvaluation.globalScore)
            : null
        };
      })
      .sort((left, right) => {
        if (left.hasSubmitted !== right.hasSubmitted) {
          return left.hasSubmitted ? -1 : 1;
        }
        if (left.isCurrentUser !== right.isCurrentUser) {
          return left.isCurrentUser ? -1 : 1;
        }
        if (left.hasFinished !== right.hasFinished) {
          return left.hasFinished ? -1 : 1;
        }
        return left.displayName.localeCompare(right.displayName, 'fr', { sensitivity: 'base' });
      });
  }

  private getEvaluatorDisplayName(user: User | undefined, userId: number): string {
    const fullName = `${user?.prenom || user?.firstName || ''} ${user?.nom || user?.lastName || ''}`.trim();
    if (fullName) {
      return fullName;
    }

    const username = user?.pseudo || user?.username;
    if (username) {
      return username;
    }

    return `Evaluateur #${userId}`;
  }

  private deriveAverageEvaluationMark(evaluations: Evaluation[]): number | null {
    const marks = evaluations
      .map(evaluation => resolveCandidateMark(evaluation.evaluationItems ?? [], evaluation.globalScore))
      .filter((mark): mark is number => mark !== undefined && mark !== null && !Number.isNaN(mark));

    if (marks.length === 0) {
      return null;
    }

    const average = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
    return Math.round(average * 10) / 10;
  }

  private selectLatestEvaluation(evaluations: Evaluation[]): Evaluation | null {
    if (evaluations.length === 0) {
      return null;
    }

    return [...evaluations].sort((left, right) => {
      const leftTime = this.parseDateValue(left.updatedAt || left.createdAt);
      const rightTime = this.parseDateValue(right.updatedAt || right.createdAt);
      if (leftTime !== rightTime) {
        return rightTime - leftTime;
      }
      return (right.id || 0) - (left.id || 0);
    })[0];
  }

  private parseDateValue(dateValue?: string): number {
    if (!dateValue) {
      return 0;
    }

    const frenchDateMatch = dateValue.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (frenchDateMatch) {
      const [, day, month, year, hours = '00', minutes = '00', seconds = '00'] = frenchDateMatch;
      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours),
        Number(minutes),
        Number(seconds)
      ).getTime();
    }

    const timestamp = new Date(dateValue).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}
