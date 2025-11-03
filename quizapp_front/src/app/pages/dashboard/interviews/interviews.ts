import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Interview, InterviewService } from '../../../core/services/interview.service';
import { Application, ApplicationService } from '../../../core/services/application.service';
import { Campaign, CampaignService } from '../../../core/services/campaign.service';

interface InterviewWithDetails extends Interview {
  candidateName?: string;
  candidateEmail?: string;
  campaignTitle?: string;
  applicationId?: number;
  candidateFirstName?: string;
  candidateLastName?: string;
  quizScorePercent?: number;
}

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interviews.html',
  styleUrl: './interviews.scss'
})
export class InterviewsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Signals
  interviews = signal<InterviewWithDetails[]>([]);
  applications = signal<Application[]>([]);
  campaigns = signal<Map<number, Campaign>>(new Map());
  loading = signal(false);
  searchTerm = signal('');
  selectedFilter = signal<'ALL' | 'SCHEDULED' | 'STARTED' | 'OVER' | 'PENDING'>('ALL');
  selectedInterview = signal<InterviewWithDetails | null>(null);
  
  // Modal de création/édition - Désactivé, on utilise une page dédiée maintenant
  showInterviewModal = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  editingInterview = signal<InterviewWithDetails | null>(null);

  constructor(
    private interviewService: InterviewService,
    private applicationService: ApplicationService,
    private campaignService: CampaignService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Computed - Interviews filtrées
   */
  filteredInterviews = computed(() => {
    const query = this.searchTerm().toLowerCase();
    const filter = this.selectedFilter();
    let items = this.interviews();

    // Filtre par statut
    if (filter !== 'ALL') {
      items = items.filter(interview => interview.interviewStatus === filter);
    }

    // Recherche textuelle
    if (query) {
      items = items.filter(interview =>
        (interview.candidateName || '').toLowerCase().includes(query) ||
        (interview.candidateEmail || '').toLowerCase().includes(query) ||
        (interview.campaignTitle || '').toLowerCase().includes(query) ||
        (interview.interviewLocation || '').toLowerCase().includes(query)
      );
    }

    return items.sort((a, b) => {
      const dateA = a.interviewDate ? new Date(a.interviewDate).getTime() : 0;
      const dateB = b.interviewDate ? new Date(b.interviewDate).getTime() : 0;
      return dateB - dateA;
    });
  });

  /**
   * Computed - Applications éligibles pour un entretien
   */
  eligibleApplications = computed(() => {
    return this.applications().filter(app => 
      app.applicationStatus === 'PRE_SCREEN_ACCEPTED' || 
      app.applicationStatus === 'INTERVIEWING'
    );
  });

  /**
   * Charge toutes les données
   */
  loadData(): void {
    this.loading.set(true);

    forkJoin({
      interviews: this.interviewService.getAllInterviews(),
      applications: this.applicationService.getApplicationsByCriteria({}),
      campaigns: this.campaignService.getAllCampaignsByCriteria({})
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        // Traiter les campaigns
        if (response.campaigns.content) {
          const campaignsMap = new Map<number, Campaign>();
          response.campaigns.content.forEach((campaign: Campaign) => {
            if (campaign.id) {
              campaignsMap.set(campaign.id, campaign);
            }
          });
          this.campaigns.set(campaignsMap);
        }

        // Traiter les applications
        if (response.applications.items) {
          this.applications.set(response.applications.items);
        }

        // Enrichir et traiter les interviews
        if (response.interviews.items) {
          this.enrichInterviews(response.interviews.items);
        }

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données:', error);
        this.loading.set(false);
      }
    });
  }

  /**
   * Enrichit les interviews avec les données des candidats et campagnes
   */
  enrichInterviews(interviews: Interview[]): void {
    const enriched: InterviewWithDetails[] = interviews.map(interview => {
      // Trouver l'application correspondante via campaignId
      const application = this.applications().find(app => 
        app.sourceTokenId === interview.campaignId
      );
      
      const campaign = interview.campaignId ? this.campaigns().get(interview.campaignId) : undefined;

      return {
        ...interview,
        candidateName: application ? 
          `${application.candidateFirstName || ''} ${application.candidateLastName || ''}`.trim() : 
          'Candidat inconnu',
        candidateEmail: application?.candidateEmail,
        campaignTitle: campaign?.campaignTitle || campaign?.campaignName,
        applicationId: application?.id,
        candidateFirstName: application?.candidateFirstName,
        candidateLastName: application?.candidateLastName,
        quizScorePercent: application?.quizScorePercent
      };
    });

    this.interviews.set(enriched);
  }

  /**
   * Sélectionne une interview
   */
  selectInterview(interview: InterviewWithDetails): void {
    this.selectedInterview.set(interview);
  }

  /**
   * Définit le filtre actif
   */
  setFilter(filter: 'ALL' | 'SCHEDULED' | 'STARTED' | 'OVER' | 'PENDING'): void {
    this.selectedFilter.set(filter);
  }

  /**
   * Ouvre la page de création
   */
  openCreateModal(): void {
    this.router.navigate(['/dashboard/interviews/create']);
  }

  /**
   * Ouvre la page d'édition
   */
  openEditModal(interview: InterviewWithDetails): void {
    this.router.navigate(['/dashboard/interviews/edit', interview.id]);
  }

  /**
   * Change le statut d'une interview
   */
  changeStatus(interview: InterviewWithDetails, newStatus: string): void {
    if (!interview.id) return;

    const updated: Interview = {
      ...interview,
      interviewStatus: newStatus as any
    };

    this.loading.set(true);
    this.interviewService.updateInterview(updated).subscribe({
      next: (response) => {
        if (!response.hasError) {
          this.loadData();
        } else {
          alert('Erreur: ' + response.status.message);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert('Erreur lors du changement de statut');
        this.loading.set(false);
      }
    });
  }

  /**
   * Supprime une interview
   */
  deleteInterview(interview: InterviewWithDetails): void {
    if (!interview.id) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet entretien ?')) {
      return;
    }

    this.loading.set(true);
    this.interviewService.deleteInterview(interview.id).subscribe({
      next: (response) => {
        if (!response.hasError) {
          alert('Entretien supprimé avec succès');
          this.selectedInterview.set(null);
          this.loadData();
        } else {
          alert('Erreur: ' + response.status.message);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
        this.loading.set(false);
      }
    });
  }

  /**
   * Obtient les initiales d'un nom
   */
  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  /**
   * Formate une date
   */
  formatDateTime(date: string | undefined): string {
    return this.interviewService.formatDate(date);
  }

  /**
   * Divise une date en date et heure
   */
  splitDateTime(dateTime: string): { date: string; time: string } {
    if (!dateTime) return { date: '', time: '' };
    
    try {
      // Format attendu: dd/MM/yyyy HH:mm
      const [datePart, timePart] = dateTime.split(' ');
      const [day, month, year] = datePart.split('/');
      return {
        date: `${year}-${month}-${day}`,
        time: timePart || ''
      };
    } catch (e) {
      return { date: '', time: '' };
    }
  }

  /**
   * Obtient le label d'un statut
   */
  getStatusLabel(status: string | undefined): string {
    if (!status) return 'N/A';
    return this.interviewService.getStatusLabel(status);
  }

  /**
   * Obtient la classe CSS d'un statut
   */
  getStatusClass(status: string | undefined): string {
    if (!status) return 'muted';
    return this.interviewService.getStatusClass(status);
  }

  /**
   * Compte les interviews par statut
   */
  getInterviewsByStatus(status: string): number {
    return this.interviews().filter(i => i.interviewStatus === status).length;
  }

  /**
   * Obtient l'icône pour un type d'entretien
   */
  getInterviewTypeIcon(type: string | undefined): string {
    const icons: Record<string, string> = {
      'TECHNICAL': 'bi-code-slash',
      'HR': 'bi-people',
      'PHONE': 'bi-telephone',
      'VIDEO': 'bi-camera-video',
      'ONSITE': 'bi-building'
    };
    return icons[type || 'TECHNICAL'] || 'bi-calendar-check';
  }

  /**
   * Obtient le nom du candidat d'une application
   */
  getCandidateName(app: Application): string {
    return `${app.candidateFirstName || ''} ${app.candidateLastName || ''}`.trim() || 'Candidat';
  }
}
