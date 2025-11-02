import { Component, OnInit, OnDestroy, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, of, catchError } from 'rxjs';
import { Application, ApplicationService } from '../../../core/services/application.service';
import { CampaignService, Campaign } from '../../../core/services/campaign.service';
import { SourceTokenService, SourceToken } from '../../../services/source-token.service';
import { Decision, DecisionService } from '../../../core/services/decision.service';
import { User, UserService } from '../../../core/services/user.service';

interface ApplicationWithCampaign extends Application {
  campaignTitle?: string;
  campaignId?: number;
  sourceTokenLabel?: string;
  createdAt?: string;
  decisions?: Decision[];
}

@Component({
  selector: 'app-decisions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './decisions.html',
  styleUrl: './decisions-modern.scss'
})
export class DecisionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Signals
  applications = signal<ApplicationWithCampaign[]>([]);
  decisions = signal<Decision[]>([]);
  users = signal<Map<number, User>>(new Map()); // Map pour stocker les utilisateurs par ID
  loading = signal(false);
  searchQuery = signal('');
  searchTerm = signal(''); // Nouveau signal pour la recherche moderne
  selectedFilter = signal<'ALL' | 'SUBMITTED' | 'PRE_SCREEN' | 'FINAL'>('ALL'); // Nouveau signal pour les filtres
  selectedApplication = signal<ApplicationWithCampaign | null>(null);
  showApplicationSuggestions = signal(false);

  // Modal de décision
  showDecisionModal = signal(false);
  decisionModalStep = signal<number | null>(null);

  // Modal de prévisualisation CV
  showCvModal = signal(false);
  cvModalUrl = signal<string | null>(null);
  cvModalCandidateName = signal<string>('');

  constructor(
    private applicationService: ApplicationService,
    private campaignService: CampaignService,
    private sourceTokenService: SourceTokenService,
    private decisionService: DecisionService,
    private userService: UserService,
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
   * Computed - Candidatures filtrées pour suggestions et affichage principal
   */
  filteredApplications = computed(() => {
    const query = this.searchTerm().toLowerCase();
    const filter = this.selectedFilter();
    let apps = this.applications();

    // Appliquer le filtre par statut
    if (filter !== 'ALL') {
      if (filter === 'SUBMITTED') {
        apps = apps.filter(app => app.applicationStatus === 'SUBMITTED');
      } else if (filter === 'PRE_SCREEN') {
        apps = apps.filter(app => app.applicationStatus?.startsWith('PRE_SCREEN') || false);
      } else if (filter === 'FINAL') {
        apps = apps.filter(app => app.applicationStatus?.startsWith('FINAL') || false);
      }
    }

    // Appliquer la recherche textuelle
    if (query) {
      apps = apps.filter(app =>
        (app.candidateFirstName || '').toLowerCase().includes(query) ||
        (app.candidateLastName || '').toLowerCase().includes(query) ||
        (app.candidateEmail || '').toLowerCase().includes(query) ||
        (app.campaignTitle || '').toLowerCase().includes(query) ||
        ((app.candidateFirstName || '') + ' ' + (app.candidateLastName || '')).toLowerCase().includes(query)
      );
    }

    return apps;
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
      {
        id: 1,
        name: 'Candidature',
        status: this.getStepStatus(status, 1),
        description: this.getStepDescription(status, 1),
        details: [
          {
            label: 'Email vérifié',
            value: app.emailVerified !== null ? (app.emailVerified ? 'Oui' : 'Non') : 'Non vérifié',
            type: 'text'
          },
          {
            label: 'Score du quiz',
            value: app.quizScore !== null ? `${app.quizScore}/100` : 'Quiz non passé',
            type: 'text'
          },
          {
            label: 'CV',
            value: 'Voir le CV',
            type: 'button',
            action: 'viewCV'
          }
        ]
      },
      {
        id: 2,
        name: 'Pré-sélection',
        status: this.getStepStatus(status, 2),
        description: this.getStepDescription(status, 2),
        details: [
          {
            label: 'Date d\'entretien',
            value: app.interviewDate ? this.formatDate(app.interviewDate) : 'Non planifié',
            type: 'text'
          },
          {
            label: 'Statut entretien',
            value: app.interviewStatus || 'Non planifié',
            type: 'text'
          },
          {
            label: 'Score d\'évaluation',
            value: app.evaluationScore !== null ? `${app.evaluationScore}/100` : 'Non évalué',
            type: 'text'
          }
        ]
      },
      {
        id: 3,
        name: 'Décision finale',
        status: this.getStepStatus(status, 3),
        description: this.getStepDescription(status, 3),
        details: []
      }
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
    console.log(`\n📋 Chargement des décisions réelles pour l'application ${applicationId}`);

    this.decisionService.getDecisionsByApplicationId(applicationId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('📦 Réponse complète du service:', response);
        console.log('📦 hasError:', response.hasError);
        console.log('📦 items:', response.items);
        console.log('📦 count:', response.count);
        
        if (response.hasError) {
          console.error('❌ Erreur lors du chargement des décisions:', response.status.message);
          this.decisions.set([]);
        } else {
          const decisions = response.items || [];
          console.log(`\n✅ ${decisions.length} décisions chargées depuis l'API pour l'application ${applicationId}`);
          console.log('📋 Détail des décisions:', JSON.stringify(decisions, null, 2));
          this.decisions.set(decisions);
          
          // Charger les informations des utilisateurs pour les décisions
          this.loadUsersForDecisions(decisions);
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des décisions:', error);
        this.decisions.set([]);
      }
    });
  }

  /**
   * Charge les informations des utilisateurs pour les décisions
   */
  loadUsersForDecisions(decisions: Decision[]): void {
    const userIds = [...new Set(decisions.map(d => d.userId).filter(id => id !== undefined))] as number[];
    
    if (userIds.length === 0) {
      return;
    }

    console.log(`\n👤 Chargement des informations de ${userIds.length} utilisateurs`);

    // Créer des observables pour chaque utilisateur à charger
    const userObservables = userIds.map(userId => 
      this.userService.getById(userId).pipe(
        catchError((error: any) => {
          console.error(`❌ Erreur lors du chargement de l'utilisateur ${userId}:`, error);
          return of(null);
        })
      )
    );

    forkJoin(userObservables).pipe(takeUntil(this.destroy$)).subscribe({
      next: (users: (User | null)[]) => {
        const usersMap = new Map(this.users());
        
        users.forEach((user, index) => {
          if (user) {
            usersMap.set(userIds[index], user);
          }
        });
        
        this.users.set(usersMap);
        console.log(`✅ ${usersMap.size} utilisateurs chargés`);
      },
      error: (error: any) => {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  /**
   * Prend une décision pour la candidature sélectionnée
   */
  takeDecision(action: 'APPROVE' | 'CANCEL'): void {
    const app = this.selectedApplication();
    if (!app) {
      console.error('❌ Aucune candidature sélectionnée');
      return;
    }

    const currentStatus = app.applicationStatus || 'PENDING';
    console.log('📝 Prise de décision:', {
      action,
      currentStatus,
      applicationId: app.id
    });

    // Déterminer le type de décision et isCancel basé sur le statut actuel et l'action
    let decisionType: string;
    let isCancel: boolean;

    if (currentStatus === 'SUBMITTED') {
      // Décision de pré-sélection
      if (action === 'APPROVE') {
        decisionType = 'PRE_SCREEN_ACCEPTED';
        isCancel = false;
      } else {
        decisionType = 'PRE_SCREEN_REJECTED';
        isCancel = false;
      }
    } else if (currentStatus === 'PRE_SCREEN_ACCEPTED') {
      // Décision finale
      if (action === 'APPROVE') {
        decisionType = 'FINAL_ACCEPTED';
        isCancel = false;
      } else {
        decisionType = 'FINAL_REJECTED';
        isCancel = false;
      }
    } else {
      console.error('❌ Statut invalide pour prendre une décision:', currentStatus);
      return;
    }

    // Récupérer l'utilisateur connecté
    const userId = this.getCurrentUserId();

    const decision: Decision = {
      decisionType: decisionType,
      isCancel: isCancel,
      applicationId: app.id!,
      userId: userId,
      createdAt: new Date().toISOString(),
      createdBy: userId
    };

    console.log('📤 Envoi de la décision:', decision);

    this.loading.set(true);
    this.decisionService.createDecision(decision).subscribe({
      next: (response: any) => {
        if (response.hasError) {
          console.error('❌ Erreur lors de la création de la décision:', response.status.message);
          alert('Erreur: ' + response.status.message);
        } else {
          console.log('✅ Décision créée avec succès');
          alert(`Décision ${action === 'APPROVE' ? 'acceptée' : 'rejetée'} avec succès!`);
          // Recharger les décisions et les candidatures
          this.loadDecisionsForApplication(app.id!);
          this.loadApplications();
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Erreur lors de la création de la décision:', error);
        alert('Erreur réseau lors de la création de la décision');
        this.loading.set(false);
      }
    });
  }

  /**
   * Annule la dernière décision
   */
  undoLastDecision(): void {
    const decisions = this.selectedApplicationDecisions();
    if (decisions.length === 0) return;

    // Trouver la dernière décision (la plus récente)
    const lastDecision = decisions[0]; // Les décisions sont triées par date décroissante

    if (!lastDecision.id) return;

    this.loading.set(true);
    this.decisionService.deleteDecision(lastDecision.id).subscribe({
      next: (response: any) => {
        if (response.hasError) {
          console.error('❌ Erreur lors de l\'annulation de la décision:', response.status.message);
          // TODO: Afficher une notification d'erreur
        } else {
          console.log('✅ Décision annulée avec succès');
          // Recharger les décisions
          const app = this.selectedApplication();
          if (app) {
            this.loadDecisionsForApplication(app.id!);
            // Recharger les candidatures pour mettre à jour le statut
            this.loadApplications();
          }
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Erreur lors de l\'annulation de la décision:', error);
        this.loading.set(false);
      }
    });
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
      if (status === 'PRE_SCREEN_ACCEPTED' || status.startsWith('FINAL_')) return 'completed';
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
  getDecisionActionClass(isCancel: boolean): string {
    return isCancel ? 'decision-cancel' : 'decision-approve';
  }

  /**
   * Obtient le label pour l'action de décision
   */
  getDecisionActionLabel(isCancel: boolean): string {
    return isCancel ? 'Annulation' : 'Décision';
  }

  /**
   * Gère les actions des boutons dans les détails des étapes
   */
  handleDetailAction(action: string): void {
    const app = this.selectedApplication();
    if (!app) return;

    switch (action) {
      case 'viewCV':
        this.viewCV(app);
        break;
      default:
        console.warn('Action non reconnue:', action);
    }
  }

  /**
   * Vérifie si une décision a été prise pour une étape donnée
   */
  hasDecisionForStep(stepId: number): boolean {
    const app = this.selectedApplication();
    if (!app) return false;

    const status = app.applicationStatus || 'PENDING';

    // Étape 2 (Pré-sélection) : une décision a été prise si le statut est PRE_SCREEN_ACCEPTED ou PRE_SCREEN_REJECTED
    if (stepId === 2) {
      return status === 'PRE_SCREEN_ACCEPTED' || status === 'PRE_SCREEN_REJECTED';
    }

    // Étape 3 (Décision finale) : une décision a été prise si le statut est FINAL_ACCEPTED ou FINAL_REJECTED
    if (stepId === 3) {
      return status === 'FINAL_ACCEPTED' || status === 'FINAL_REJECTED';
    }

    return false;
  }

  /**
   * Vérifie si on peut prendre une décision pour une étape donnée
   */
  canTakeDecisionForStep(stepId: number): boolean {
    const app = this.selectedApplication();
    if (!app) return false;

    const currentStatus = app.applicationStatus || 'PENDING';

    // Étape 2 (Pré-sélection) : seulement si SUBMITTED (et pas encore de décision)
    if (stepId === 2) {
      return currentStatus === 'SUBMITTED';
    }

    // Étape 3 (Décision finale) : seulement si PRE_SCREEN_ACCEPTED ou INTERVIEWING
    if (stepId === 3) {
      return currentStatus === 'PRE_SCREEN_ACCEPTED' || currentStatus === 'INTERVIEWING';
    }

    return false;
  }

  /**
   * Vérifie si on peut annuler une décision pour une étape donnée
   */
  canCancelDecisionForStep(stepId: number): boolean {
    const app = this.selectedApplication();
    if (!app) return false;

    const currentStatus = app.applicationStatus || 'PENDING';

    // Étape 2 (Pré-sélection) : on peut annuler si PRE_SCREEN_ACCEPTED ou PRE_SCREEN_REJECTED
    if (stepId === 2) {
      return currentStatus === 'PRE_SCREEN_ACCEPTED' || currentStatus === 'PRE_SCREEN_REJECTED';
    }

    // Étape 3 (Décision finale) : on peut annuler si FINAL_ACCEPTED ou FINAL_REJECTED
    if (stepId === 3) {
      return currentStatus === 'FINAL_ACCEPTED' || currentStatus === 'FINAL_REJECTED';
    }

    return false;
  }

  /**
   * Obtient les options de décision pour une étape
   */
  getDecisionOptionsForStep(stepId: number): { approveLabel: string; cancelLabel: string } {
    if (stepId === 2) {
      return {
        approveLabel: 'Pré-sélection acceptée',
        cancelLabel: 'Pré-sélection refusée'
      };
    } else if (stepId === 3) {
      return {
        approveLabel: 'Embaucher',
        cancelLabel: 'Rejeter'
      };
    }
    return { approveLabel: 'Accepter', cancelLabel: 'Refuser' };
  }

  /**
   * Ouvre la popup de décision pour une étape
   */
  openDecisionModal(stepId: number): void {
    this.decisionModalStep.set(stepId);
    this.showDecisionModal.set(true);
  }

  /**
   * Annule la décision pour une étape donnée
   */
  undoDecisionForStep(stepId: number): void {
    const app = this.selectedApplication();
    if (!app) return;

    const currentStatus = app.applicationStatus || 'PENDING';
    
    // Déterminer le type de décision à annuler basé sur l'étape et le statut actuel
    let decisionType = currentStatus; // Le type de décision est le statut actuel
    
    // Créer une nouvelle entrée de décision avec isCancel = true
    const cancelDecision: Decision = {
      decisionType: decisionType,
      isCancel: true, // true indique que c'est une annulation
      applicationId: app.id!,
      userId: this.getCurrentUserId(),
      createdAt: new Date().toISOString(),
      createdBy: this.getCurrentUserId()
    };

    this.loading.set(true);
    this.decisionService.createDecision(cancelDecision).subscribe({
      next: (response: any) => {
        if (response.hasError) {
          console.error('❌ Erreur lors de l\'annulation de la décision:', response.status.message);
          this.loading.set(false);
        } else {
          console.log('✅ Décision annulée avec succès');
          
          // Recharger les candidatures d'abord
          this.loadApplications();
          
          // Attendre un peu puis recharger les décisions et resélectionner l'application
          setTimeout(() => {
            this.loadDecisionsForApplication(app.id!);
            
            // Resélectionner l'application pour forcer le rafraîchissement de l'affichage
            const updatedApps = this.applications();
            const updatedApp = updatedApps.find(a => a.id === app.id);
            if (updatedApp) {
              this.selectedApplication.set(updatedApp);
            }
            
            this.loading.set(false);
          }, 500);
        }
      },
      error: (error: any) => {
        console.error('❌ Erreur lors de l\'annulation de la décision:', error);
        this.loading.set(false);
      }
    });
  }

  /**
   * Prend une décision pour une étape spécifique
   */
  takeDecisionForStep(stepId: number, action: 'APPROVE' | 'CANCEL'): void {
    const app = this.selectedApplication();
    if (!app) return;

    // Déterminer le type de décision basé sur l'étape
    let decisionType = 'PRE_SCREEN_ACCEPTED';
    if (stepId === 2) {
      decisionType = action === 'APPROVE' ? 'PRE_SCREEN_ACCEPTED' : 'PRE_SCREEN_REJECTED';
    } else if (stepId === 3) {
      decisionType = action === 'APPROVE' ? 'FINAL_ACCEPTED' : 'FINAL_REJECTED';
    }

    const decision: Decision = {
      decisionType: decisionType,
      isCancel: action === 'CANCEL', // true si c'est une annulation/rejet, false si c'est une approbation
      applicationId: app.id!,
      userId: this.getCurrentUserId(),
      createdAt: new Date().toISOString(),
      createdBy: this.getCurrentUserId()
    };

    this.loading.set(true);
    this.decisionService.createDecision(decision).subscribe({
      next: (response: any) => {
        if (response.hasError) {
          console.error('❌ Erreur lors de la création de la décision:', response.status.message);
          this.loading.set(false);
        } else {
          console.log('✅ Décision créée avec succès');
          // Fermer la modal
          this.closeDecisionModal();
          
          // Recharger les candidatures d'abord
          this.loadApplications();
          
          // Attendre un peu puis recharger les décisions et resélectionner l'application
          setTimeout(() => {
            this.loadDecisionsForApplication(app.id!);
            
            // Resélectionner l'application pour forcer le rafraîchissement de l'affichage
            const updatedApps = this.applications();
            const updatedApp = updatedApps.find(a => a.id === app.id);
            if (updatedApp) {
              this.selectedApplication.set(updatedApp);
            }
            
            this.loading.set(false);
          }, 500);
        }
      },
      error: (error: any) => {
        console.error('❌ Erreur lors de la création de la décision:', error);
        this.loading.set(false);
      }
    });
  }

  /**
   * Récupère l'ID de l'utilisateur connecté
   */
  getCurrentUserId(): number {
    const currentUserData = localStorage.getItem('user');
    if (currentUserData) {
      try {
        const user = JSON.parse(currentUserData);
        return user.id || 1;
      } catch (e) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', e);
        return 1;
      }
    }
    return 1;
  }

  /**
   * Récupère le pseudo d'un utilisateur par son ID
   */
  getUserPseudo(userId: number): string {
    const user = this.users().get(userId);
    return user?.pseudo || user?.username || 'Utilisateur inconnu';
  }

  /**
   * Ferme la popup de décision
   */
  closeDecisionModal(): void {
    this.showDecisionModal.set(false);
    this.decisionModalStep.set(null);
  }

  /**
   * Prend une décision depuis la modal
   */
  takeDecisionFromModal(action: 'APPROVE' | 'CANCEL'): void {
    const stepId = this.decisionModalStep();
    if (!stepId) return;

    this.takeDecisionForStep(stepId, action);
    this.closeDecisionModal();
  }

  /**
   * Ferme la popup de prévisualisation CV
   */
  closeCvModal(): void {
    this.showCvModal.set(false);
    this.cvModalUrl.set(null);
    this.cvModalCandidateName.set('');
  }

  /**
   * Télécharge le CV actuellement affiché
   */
  downloadCurrentCV(): void {
    const cvUrl = this.cvModalUrl();
    const candidateName = this.cvModalCandidateName();
    if (cvUrl) {
      const link = document.createElement('a');
      link.href = cvUrl;
      link.download = `CV_${candidateName}.pdf`;
      link.click();
    }
  }

  /**
   * Ouvre le CV actuellement affiché dans un nouvel onglet
   */
  openCurrentCVInNewTab(): void {
    const cvUrl = this.cvModalUrl();
    if (cvUrl) {
      window.open(cvUrl, '_blank');
    }
  }

  /**
   * Affiche un aperçu du CV du candidat
   */
  viewCV(application: ApplicationWithCampaign): void {
    if (!application.candidateCvPath) {
      console.warn('CV non disponible pour cette candidature');
      return;
    }

    // Ouvrir la popup de prévisualisation
    const cvUrl = this.applicationService.getCvDownloadUrl(application.candidateCvPath);
    if (cvUrl) {
      this.cvModalUrl.set(cvUrl);
      this.cvModalCandidateName.set(this.getCandidateName(application));
      this.showCvModal.set(true);
    } else {
      console.error('Impossible de générer l\'URL du CV');
    }
  }

  // ===========================
  // NOUVELLES MÉTHODES POUR LE DESIGN MODERNE
  // ===========================

  /**
   * Récupère les initiales d'un nom de candidat
   */
  getCandidateInitials(app: ApplicationWithCampaign): string {
    const name = this.getCandidateName(app);
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  /**
   * Filtre les candidatures en fonction du terme de recherche ET du filtre sélectionné
   */
  filterApplications(): void {
    // Mise à jour du signal searchQuery pour déclencher le computed
    this.searchQuery.set(this.searchTerm());
  }

  /**
   * Définit le filtre actif
   */
  setFilter(filter: 'ALL' | 'SUBMITTED' | 'PRE_SCREEN' | 'FINAL'): void {
    this.selectedFilter.set(filter);
  }

  /**
   * Récupère les candidatures par statut
   */
  getApplicationsByStatus(status: string): ApplicationWithCampaign[] {
    return this.applications().filter(app => app.applicationStatus === status);
  }

  /**
   * Compte le nombre de décisions en attente (PRE_SCREEN_*)
   */
  getPendingDecisionsCount(): number {
    return this.applications().filter(app =>
      app.applicationStatus?.startsWith('PRE_SCREEN') || false
    ).length;
  }

  /**
   * Compte le nombre de décisions finales (FINAL_*)
   */
  getFinalDecisionsCount(): number {
    return this.applications().filter(app =>
      app.applicationStatus?.startsWith('FINAL') || false
    ).length;
  }

  /**
   * Obtient la classe CSS pour un statut
   */
  getStatusClass(status: string | undefined): string {
    if (!status) return 'pending';
    if (status === 'PENDING') return 'pending';
    if (status === 'SUBMITTED') return 'submitted';
    if (status?.startsWith('PRE_SCREEN')) {
      if (status === 'PRE_SCREEN_ACCEPTED') return 'accepted';
      if (status === 'PRE_SCREEN_REJECTED') return 'rejected';
      return 'prescreen';
    }
    if (status === 'FINAL_ACCEPTED') return 'success';
    if (status === 'FINAL_REJECTED') return 'error';
    return 'pending';
  }

  /**
   * Obtient le label d'un statut
   */
  getStatusLabel(status: string | undefined): string {
    if (!status) return 'En attente';
    const labels: Record<string, string> = {
      'PENDING': 'Quiz en cours',
      'SUBMITTED': 'En attente de décision',
      'PRE_SCREEN_ACCEPTED': 'Pré-sélectionné',
      'PRE_SCREEN_REJECTED': 'Non pré-sélectionné',
      'FINAL_ACCEPTED': 'Accepté',
      'FINAL_REJECTED': 'Rejeté'
    };
    return labels[status] || status;
  }

  /**
   * Formate une date avec l'heure
   */
  formatDateTime(date: string | undefined): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  }

  /**
   * Obtient la classe CSS pour le statut d'entretien
   */
  getInterviewStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'warning',
      'SCHEDULED': 'info',
      'STARTED': 'info',
      'OVER': 'success',
      'PASSED': 'success',
      'FAILED': 'error',
      'POSTPONED': 'warning',
      'ARCHIVED': 'muted'
    };
    return statusMap[status] || 'muted';
  }

  /**
   * Obtient l'icône Bootstrap pour le statut d'entretien
   */
  getInterviewStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      'PENDING': 'bi bi-hourglass-split',
      'SCHEDULED': 'bi bi-calendar-check',
      'STARTED': 'bi bi-play-circle',
      'OVER': 'bi bi-check-circle-fill',
      'PASSED': 'bi bi-check-circle-fill',
      'FAILED': 'bi bi-x-circle-fill',
      'POSTPONED': 'bi bi-clock-history',
      'ARCHIVED': 'bi bi-archive'
    };
    return iconMap[status] || 'bi bi-question-circle';
  }

  /**
   * Obtient le label pour le statut d'entretien
   */
  getInterviewStatusLabel(status: string): string {
    const labelMap: Record<string, string> = {
      'PENDING': 'En attente',
      'SCHEDULED': 'Planifié',
      'STARTED': 'En cours',
      'OVER': 'Terminé',
      'PASSED': 'Réussi',
      'FAILED': 'Échoué',
      'POSTPONED': 'Reporté',
      'ARCHIVED': 'Archivé'
    };
    return labelMap[status] || status;
  }
}
