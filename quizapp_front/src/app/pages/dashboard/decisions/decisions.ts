import { Component, OnInit, OnDestroy, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Application, ApplicationService } from '../../../core/services/application.service';
import { CampaignService, Campaign } from '../../../core/services/campaign.service';
import { SourceTokenService, SourceToken } from '../../../services/source-token.service';
import { Decision, DecisionService } from '../../../core/services/decision.service';

interface ApplicationWithCampaign extends Application {
  campaignTitle?: string;
  campaignId?: number;
  sourceTokenLabel?: string;
}

@Component({
  selector: 'app-decisions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './decisions.html',
  styleUrl: './decisions.scss'
})
export class DecisionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Signals
  applications = signal<ApplicationWithCampaign[]>([]);
  decisions = signal<Decision[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  selectedApplication = signal<ApplicationWithCampaign | null>(null);
  showApplicationSuggestions = signal(false);

  constructor(
    private applicationService: ApplicationService,
    private campaignService: CampaignService,
    private sourceTokenService: SourceTokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Computed - Candidatures filtrées pour suggestions
   */
  filteredApplications = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const apps = this.applications();

    if (!query) {
      return apps.slice(0, 10); // Limiter à 10 résultats par défaut
    }

    return apps.filter(app =>
      (app.candidateFirstName || '').toLowerCase().includes(query) ||
      (app.candidateLastName || '').toLowerCase().includes(query) ||
      (app.candidateEmail || '').toLowerCase().includes(query) ||
      (app.campaignTitle || '').toLowerCase().includes(query)
    ).slice(0, 10);
  });

  /**
   * Computed - Décisions de l'application sélectionnée
   */
  selectedApplicationDecisions = computed(() => {
    const selectedApp = this.selectedApplication();
    if (!selectedApp) return [];

    return this.decisions().filter(decision =>
      decision.applicationId === selectedApp.id
    ).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  });

  /**
   * Computed - Étapes de progression de l'application
   */
  applicationSteps = computed(() => {
    const app = this.selectedApplication();
    if (!app) return [];

    const status = app.applicationStatus || 'PENDING';
    const steps = [
      { id: 1, name: 'Candidature', status: this.getStepStatus(status, 1), description: this.getStepDescription(status, 1) },
      { id: 2, name: 'Pré-sélection', status: this.getStepStatus(status, 2), description: this.getStepDescription(status, 2) },
      { id: 3, name: 'Décision finale', status: this.getStepStatus(status, 3), description: this.getStepDescription(status, 3) }
    ];

    return steps;
  });

  /**
   * Charge les candidatures
   */
  loadApplications(): void {
    this.loading.set(true);

    // Récupérer l'ID de l'utilisateur connecté
    const currentUserData = localStorage.getItem('user');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id : null;

    if (!currentUserId) {
      console.error('❌ Utilisateur non connecté');
      this.loading.set(false);
      return;
    }

    // Charger les candidatures avec enrichissement
    this.applicationService.getApplicationsByCriteria({}).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.items) {
          this.enrichApplications(response.items);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des candidatures:', error);
        this.loading.set(false);
      }
    });
  }

  /**
   * Enrichit les candidatures avec les informations de campagne
   */
  enrichApplications(applications: Application[]): void {
    console.log(`\n� Enrichissement de ${applications.length} candidatures`);

    // Créer des maps pour un accès rapide
    const enrichedApplications: ApplicationWithCampaign[] = applications.map(app => {
      // Pour l'instant, on ne fait qu'ajouter les propriétés
      // TODO: Enrichir avec les vraies données de campagne quand disponible
      return {
        ...app,
        campaignTitle: 'Campagne inconnue',
        campaignId: undefined,
        sourceTokenLabel: 'N/A'
      };
    });

    console.log(`\n✅ ${enrichedApplications.length} candidatures enrichies`);
    this.applications.set(enrichedApplications);
  }

  /**
   * Sélectionne une candidature
   */
  selectApplication(application: ApplicationWithCampaign): void {
    this.selectedApplication.set(application);
    this.searchQuery.set(`${application.candidateFirstName} ${application.candidateLastName} - ${application.candidateEmail}`);
    this.showApplicationSuggestions.set(false);

    // Charger les décisions pour cette candidature
    this.loadDecisionsForApplication(application.id!);
  }

  /**
   * Charge les décisions pour une candidature
   */
  loadDecisionsForApplication(applicationId: number): void {
    // TODO: Implémenter le service pour charger les décisions depuis l'API
    // Pour l'instant, on simule des données d'exemple
    const mockDecisions: Decision[] = [
      {
        id: 1,
        decisionType: 'PRE_SCREEN_ACCEPTED',
        decisionAction: 'APPROVE',
        applicationId: applicationId,
        userId: 1,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours avant
        createdBy: 1,
        userName: 'Alice Dupont'
      },
      {
        id: 2,
        decisionType: 'PRE_SCREEN_ACCEPTED',
        decisionAction: 'APPROVE',
        applicationId: applicationId,
        userId: 2,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 jours avant
        createdBy: 2,
        userName: 'Bob Martin'
      },
      {
        id: 3,
        decisionType: 'FINAL_REJECTED',
        decisionAction: 'CANCEL',
        applicationId: applicationId,
        userId: 1,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 jours avant
        createdBy: 1,
        userName: 'Alice Dupont'
      }
    ];

    console.log(`\n📋 Chargement de ${mockDecisions.length} décisions mockées pour l'application ${applicationId}`);
    this.decisions.set(mockDecisions);
  }

  /**
   * Efface la recherche
   */
  clearSearch(): void {
    this.searchQuery.set('');
    this.selectedApplication.set(null);
    this.decisions.set([]);
    this.showApplicationSuggestions.set(false);
  }

  /**
   * Ferme les suggestions
   */
  closeSuggestions(): void {
    this.showApplicationSuggestions.set(false);
  }

  /**
   * Gère les clics en dehors de la zone de recherche
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const searchContainer = target.closest('.search-container');

    // Si le clic n'est pas dans le conteneur de recherche, ferme les suggestions
    if (!searchContainer && this.showApplicationSuggestions()) {
      this.closeSuggestions();
    }
  }

  /**
   * Obtient le statut d'une étape
   */
  getStepStatus(applicationStatus: string = 'PENDING', step: number): string {
    const status = applicationStatus.toUpperCase();

    // Étape 1: Candidature (PENDING → SUBMITTED)
    if (step === 1) {
      if (status === 'PENDING') return 'active';
      if (status === 'PENDING_ARCHIVED') return 'archived';
      return 'completed';
    }

    // Étape 2: Pré-sélection (PRE_SCREEN)
    if (step === 2) {
      if (status === 'PENDING' || status === 'PENDING_ARCHIVED') return 'pending';
      if (status === 'SUBMITTED') return 'active';
      if (status.startsWith('PRE_SCREEN_REJECTED')) return 'rejected';
      if (status === 'PRE_SCREEN_ACCEPTED' || status === 'INTERVIEWING' || status.startsWith('FINAL_')) return 'completed';
      return 'pending';
    }

    // Étape 3: Final (FINAL_ACCEPTED / FINAL_REJECTED)
    if (step === 3) {
      if (!status.startsWith('FINAL_')) return 'pending';
      if (status.startsWith('FINAL_ACCEPTED')) return 'completed';
      if (status.startsWith('FINAL_REJECTED')) return 'rejected';
      return 'pending';
    }

    return 'pending';
  }

  /**
   * Obtient la description d'une étape
   */
  getStepDescription(applicationStatus: string = 'PENDING', step: number): string {
    const status = applicationStatus.toUpperCase();

    // Étape 1: Candidature
    if (step === 1) {
      if (status === 'PENDING') return 'Candidature en attente d\'envoi';
      if (status === 'PENDING_ARCHIVED') return 'Candidature archivée (non envoyée)';
      return 'Candidature envoyée';
    }

    // Étape 2: Pré-sélection
    if (step === 2) {
      if (status === 'PENDING' || status === 'PENDING_ARCHIVED')
        return 'Pré-sélection : en attente d\'envoi de candidature';
      if (status === 'SUBMITTED') return 'Pré-sélection en cours';
      if (status === 'PRE_SCREEN_ACCEPTED') return 'Pré-sélection acceptée';
      if (status === 'INTERVIEWING') return 'Pré-sélection acceptée - En entretien';
      if (status === 'PRE_SCREEN_REJECTED') return 'Pré-sélection refusée';
      if (status === 'PRE_SCREEN_REJECTED_ARCHIVED') return 'Pré-sélection refusée (archivé)';
      if (status.startsWith('FINAL_ACCEPTED')) return 'Pré-sélection acceptée';
      return 'Pré-sélection en attente';
    }

    // Étape 3: Final
    if (step === 3) {
      if (status === 'PENDING' || status === 'PENDING_ARCHIVED' || status === 'SUBMITTED' ||
          status.startsWith('PRE_SCREEN_REJECTED'))
        return 'Décision finale : en attente de pré-sélection';
      if (status === 'PRE_SCREEN_ACCEPTED') return 'Décision finale en attente';
      if (status === 'INTERVIEWING') return 'Décision finale : entretien en cours';
      if (status === 'FINAL_ACCEPTED') return 'Candidature acceptée ✓';
      if (status === 'FINAL_ACCEPTED_ARCHIVED') return 'Candidature acceptée (archivé)';
      if (status === 'FINAL_REJECTED') return 'Candidature refusée';
      if (status === 'FINAL_REJECTED_ARCHIVED') return 'Candidature refusée (archivé)';
      return 'Décision finale en attente';
    }

    return '';
  }

  /**
   * Obtient la classe CSS pour le statut d'une étape
   */
  getStepClass(status: string): string {
    switch (status) {
      case 'completed': return 'step-completed';
      case 'active': return 'step-active';
      case 'rejected': return 'step-rejected';
      case 'archived': return 'step-archived';
      default: return 'step-pending';
    }
  }

  /**
   * Obtient le nom complet du candidat
   */
  getCandidateName(app: ApplicationWithCampaign): string {
    return `${app.candidateFirstName || ''} ${app.candidateLastName || ''}`.trim() || 'Candidat';
  }

  /**
   * Formate une date
   */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  }

  /**
   * Obtient la classe CSS pour l'action de décision
   */
  getDecisionActionClass(action: 'APPROVE' | 'CANCEL'): string {
    return action === 'APPROVE' ? 'decision-approve' : 'decision-cancel';
  }

  /**
   * Obtient le libellé pour l'action de décision
   */
  getDecisionActionLabel(action: 'APPROVE' | 'CANCEL'): string {
    return action === 'APPROVE' ? 'Approuvé' : 'Annulé';
  }
}