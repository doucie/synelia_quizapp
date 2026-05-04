import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Interview, InterviewService } from '../../../core/services/interview.service';
import { Application, ApplicationService } from '../../../core/services/application.service';
import { Campaign, CampaignService } from '../../../core/services/campaign.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserService } from '../../../core/services/user.service';

interface InterviewWithDetails extends Interview {
  candidateName?: string;
  candidateEmailDisplay?: string;
  campaignTitle?: string;
  applicationId?: number;
  candidateFirstName?: string;
  candidateLastName?: string;
  quizScorePercent?: number;
  interviewTitle?: string;
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
  selectedFilter = signal<'ALL' | 'STARTED' | 'OVER'>('ALL');
  currentUserId = signal<number>(0);

  // Computed: interviews filtrés (seulement STARTED et OVER pour les évaluations)
  filteredInterviews = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const filter = this.selectedFilter();
    
    return this.interviews()
      .filter(interview => {
        // Seulement les entretiens qui peuvent être évalués (STARTED ou OVER)
        if (!['STARTED', 'OVER'].includes(interview.interviewStatus || '')) {
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
        // Trier par date de fin décroissante pour OVER, puis par date de début pour STARTED
        if (a.interviewStatus === 'OVER' && b.interviewStatus === 'OVER') {
          return new Date(b.endedAt || 0).getTime() - new Date(a.endedAt || 0).getTime();
        }
        if (a.interviewStatus === 'STARTED' && b.interviewStatus === 'STARTED') {
          return new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime();
        }
        // STARTED avant OVER
        return a.interviewStatus === 'STARTED' ? -1 : 1;
      });
  });

  // Stats
  totalEvaluations = computed(() => this.interviews().filter(i => ['STARTED', 'OVER'].includes(i.interviewStatus || '')).length);
  inProgressCount = computed(() => this.interviews().filter(i => i.interviewStatus === 'STARTED').length);
  completedCount = computed(() => this.interviews().filter(i => i.interviewStatus === 'OVER').length);

  constructor(
    private router: Router,
    private interviewService: InterviewService,
    private applicationService: ApplicationService,
    private campaignService: CampaignService,
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
                quizScorePercent: app?.quizScorePercent,
                interviewTitle: `Entretien #${interview.id}`
              };
            });

            this.interviews.set(enrichedInterviews);
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

  setFilter(filter: 'ALL' | 'STARTED' | 'OVER'): void {
    this.selectedFilter.set(filter);
  }

  openEvaluation(interview: InterviewWithDetails): void {
    if (interview.interviewEvaluationsLink) {
      this.router.navigate(['/dashboard/evaluate', interview.interviewEvaluationsLink]);
    } else {
      this.notificationService.warning('Attention', 'Lien d\'évaluation non disponible');
    }
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'STARTED': return 'En cours';
      case 'OVER': return 'Terminé';
      default: return status || 'Inconnu';
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'STARTED': return 'started';
      case 'OVER': return 'completed';
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

  formatScore(score: number | undefined, total: number | undefined): string {
    if (score === undefined || score === null) return '-';
    if (total === undefined || total === null || total === 0) return `${score}`;
    return `${score}/${total}`;
  }

  formatPercentage(value: number | undefined): string {
    if (value === undefined || value === null) return '-';
    return `${value.toFixed(1)}/5`;
  }

  goToInterviews(): void {
    this.router.navigate(['/dashboard/interviews']);
  }
}
