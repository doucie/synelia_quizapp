import { Component, OnInit, OnDestroy, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, of, catchError } from 'rxjs';
import { Application, ApplicationService } from '../../../core/services/application.service';
import { CampaignService, Campaign, CampaignAccessRecord } from '../../../core/services/campaign.service';
import { SourceTokenService, SourceToken } from '../../../services/source-token.service';
import { Decision, DecisionService } from '../../../core/services/decision.service';
import { PermissionService } from '../../../core/services/permission.service';
import { User, UserService } from '../../../core/services/user.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { APPLICATION_STATUS } from '../../../core/constants/application-status.constants';
import { ApplicationProgressService } from '../../../core/services/application-progress.service';
import { PipelineStage, ApplicationProgress } from '../../../core/models/pipeline.interfaces';

interface ApplicationWithCampaign extends Application {
  campaignTitle?: string;
  campaignId?: number;
  sourceTokenLabel?: string;
  createdAt?: string;
  decisions?: Decision[];
}

type DecisionFilter = 'ALL' | 'SUBMITTED' | 'PRE_SCREEN' | 'FINAL';

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
  campaignAccessMap = signal<Record<number, CampaignAccessRecord>>({});
  loading = signal(false);
  searchQuery = signal('');
  searchTerm = signal(''); // Nouveau signal pour la recherche moderne
  selectedFilter = signal<DecisionFilter>('ALL'); // Nouveau signal pour les filtres
  selectedApplication = signal<ApplicationWithCampaign | null>(null);
  showApplicationSuggestions = signal(false);

  // Modal de décision
  showDecisionModal = signal(false);
  decisionModalStep = signal<number | null>(null);

  // Modal de prévisualisation CV
  showCvModal = signal(false);
  cvModalUrl = signal<string | null>(null);
  cvModalCandidateName = signal<string>('');

  // Pipeline dynamique
  campaignStagesMap = signal<Record<number, PipelineStage[]>>({});
  applicationProgressMap = signal<Record<number, ApplicationProgress[]>>({});

  constructor(
    private applicationService: ApplicationService,
    private campaignService: CampaignService,
    private sourceTokenService: SourceTokenService,
    private decisionService: DecisionService,
    private userService: UserService,
    private router: Router,
    private pipelineStageService: PipelineStageService,
    private applicationProgressService: ApplicationProgressService,
    private permissionService: PermissionService
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
    let apps = this.applications().filter(app => this.matchesDecisionFilter(app, filter));

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
   * Obtient les étapes du pipeline pour la candidature sélectionnée (via sa campagne)
   */
  getStagesForSelectedApp(): PipelineStage[] {
    const app = this.selectedApplication();
    if (!app || !app.campaignId) return [];
    return this.campaignStagesMap()[app.campaignId] || [];
  }

  /**
   * Obtient le progrès d'une candidature pour une étape donnée
   */
  getProgressForStage(appId: number, stageId: number): ApplicationProgress | undefined {
    const progressList = this.applicationProgressMap()[appId] || [];
    return progressList.find(p => p.pipelineStageId === stageId);
  }

  /**
   * Obtient le statut visuel d'une étape pour la candidature sélectionnée
   */
  getDynamicStepStatus(stageId: number): string {
    const app = this.selectedApplication();
    if (!app) return 'pending';
    const progress = this.getProgressForStage(app.id!, stageId);
    if (!progress) return 'pending';
    switch (progress.progressStatus) {
      case 'IN_PROGRESS': return 'active';
      case 'PASSED': return 'completed';
      case 'FAILED': return 'rejected';
      case 'SKIPPED': return 'skipped';
      case 'PENDING':
      default: return 'pending';
    }
  }

  /**
   * Obtient la description pour une étape dynamique
   */
  getDynamicStepDescription(stage: PipelineStage): string {
    const app = this.selectedApplication();
    if (!app) return '';
    const progress = this.getProgressForStage(app.id!, stage.id!);
    if (!progress || progress.progressStatus === 'PENDING') return `${stage.stageLabel} : en attente`;
    switch (progress.progressStatus) {
      case 'IN_PROGRESS': return `${stage.stageLabel} : en cours`;
      case 'PASSED': return `${stage.stageLabel} : validé`;
      case 'FAILED': return `${stage.stageLabel} : refusé`;
      case 'SKIPPED': return `${stage.stageLabel} : ignoré`;
      default: return `${stage.stageLabel}`;
    }
  }

  /**
   * Charge les candidatures avec enrichissement campagne + pipeline
   */
  loadApplications(): void {
    this.loading.set(true);

    const currentUserData = localStorage.getItem('user');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id : null;

    if (!currentUserId) {
      console.error('❌ Utilisateur non connecté');
      this.loading.set(false);
      return;
    }

    forkJoin({
      applications: this.applicationService.getApplicationsByCriteria({}),
      sourceTokens: this.sourceTokenService.getSourceTokensByCriteria({}),
      campaigns: this.campaignService.getAllCampaignsByCriteria({ size: 1000, page: 0, isDeleted: false }),
      campaignAccesses: this.campaignService.getCampaignAccessesByUser(currentUserId)
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (results) => {
        this.campaignAccessMap.set(this.campaignService.buildCampaignAccessMap(results.campaignAccesses || []));
        this.enrichApplications(
          results.applications.items || [],
          results.sourceTokens.items || [],
          results.campaigns.content || []
        );
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des données:', error);
        this.loading.set(false);
      }
    });
  }

  /**
   * Enrichit les candidatures avec les informations de campagne et charge les pipelines
   */
  enrichApplications(applications: Application[], sourceTokens: SourceToken[], campaigns: Campaign[]): void {
    const sourceTokenById = new Map<number, SourceToken>();
    sourceTokens.forEach(token => { if (token.id) sourceTokenById.set(token.id, token); });

    const campaignById = new Map<number, Campaign>();
    campaigns.forEach(campaign => { if (campaign.id) campaignById.set(campaign.id, campaign); });

    const enrichedApplications: ApplicationWithCampaign[] = applications.map(app => {
      let campaignTitle = 'Campagne inconnue';
      let campaignId: number | undefined = undefined;
      let sourceTokenLabel = 'N/A';

      if (app.sourceTokenId && sourceTokenById.has(app.sourceTokenId)) {
        const sourceToken = sourceTokenById.get(app.sourceTokenId)!;
        sourceTokenLabel = sourceToken.sourceTokenName || `Token #${app.sourceTokenId}`;

        if (sourceToken.campaignId && campaignById.has(sourceToken.campaignId)) {
          const campaign = campaignById.get(sourceToken.campaignId)!;
          campaignTitle = campaign.campaignTitle || campaignTitle;
          campaignId = campaign.id;
        } else if (sourceToken.campaignName) {
          campaignTitle = sourceToken.campaignName;
        }
      }

      return { ...app, campaignTitle, campaignId, sourceTokenLabel };
    });

    this.applications.set(enrichedApplications);

    // Charger les pipelines dynamiques pour chaque campagne et candidature
    const campaignTemplateIds = new Map<number, number>();
    campaigns.forEach(c => {
      if (c.id && c.pipelineTemplateId) {
        campaignTemplateIds.set(c.id, c.pipelineTemplateId);
      }
    });
    enrichedApplications.forEach(app => {
      if (app.campaignId && campaignTemplateIds.has(app.campaignId)) {
        this.loadPipelineStagesForCampaign(app.campaignId, campaignTemplateIds.get(app.campaignId)!);
      }
      if (app.id) {
        this.loadProgressForApplication(app.id);
      }
    });
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

    // Charger le progrès pipeline (forcer le rafraîchissement)
    if (application.id) {
      this.refreshProgressForApplication(application.id);
    }
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
   * Prend une décision pour une étape du pipeline
   */
  takeDecisionForStage(stage: PipelineStage, action: 'APPROVE' | 'CANCEL'): void {
    const app = this.selectedApplication();
    if (!app) return;
    if (!this.hasDecisionPermissionForCampaign(app.campaignId)) return;

    const decisionType = this.mapStageToDecisionType(stage, action === 'APPROVE');
    if (!decisionType) {
      console.error('❌ Type de décision non déterminé pour l\'étape', stage.stageType);
      return;
    }

    const decision: Decision = {
      decisionType: decisionType,
      isCancel: false,
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
          alert('Erreur: ' + response.status.message);
        } else {
          console.log('✅ Décision créée avec succès');
          alert(`Décision ${action === 'APPROVE' ? 'acceptée' : 'rejetée'} avec succès!`);
          this.closeDecisionModal();
          this.loadDecisionsForApplication(app.id!);
          this.loadApplications();
          // Rafraîchir le progrès pipeline
          setTimeout(() => this.refreshProgressForApplication(app.id!), 500);
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
   * Mappe un type d'étape pipeline vers un type de décision backend
   */
  private mapStageToDecisionType(stage: PipelineStage, isAccepted: boolean): string | null {
    switch (stage.stageType) {
      case 'PRESELECTION':
        return isAccepted ? APPLICATION_STATUS.PRE_SCREEN_ACCEPTED : APPLICATION_STATUS.PRE_SCREEN_REJECTED;
      case 'DECISION':
        return isAccepted ? APPLICATION_STATUS.FINAL_ACCEPTED : APPLICATION_STATUS.FINAL_REJECTED;
      default:
        return null;
    }
  }

  /**
   * Annule la dernière décision
   */
  undoLastDecision(): void {
    const decisions = this.selectedApplicationDecisions();
    if (decisions.length === 0) return;

    const app = this.selectedApplication();
    if (!app || !this.hasDecisionPermissionForCampaign(app.campaignId)) return;

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
  hasDecisionForStage(stage: PipelineStage): boolean {
    if (stage.stageType !== 'PRESELECTION' && stage.stageType !== 'DECISION') return false;
    const status = this.getDynamicStepStatus(stage.id!);
    return status === 'completed' || status === 'rejected';
  }

  /**
   * Vérifie si on peut prendre une décision pour une étape donnée
   */
  canTakeDecisionForStage(stage: PipelineStage): boolean {
    if (stage.stageType !== 'PRESELECTION' && stage.stageType !== 'DECISION') return false;
    const status = this.getDynamicStepStatus(stage.id!);
    return this.hasDecisionPermissionForSelectedApplication() && status === 'active';
  }

  /**
   * Vérifie si on peut annuler une décision pour une étape donnée
   */
  canCancelDecisionForStage(stage: PipelineStage): boolean {
    if (stage.stageType !== 'PRESELECTION' && stage.stageType !== 'DECISION') return false;
    const status = this.getDynamicStepStatus(stage.id!);
    return this.hasDecisionPermissionForSelectedApplication() && (status === 'completed' || status === 'rejected');
  }

  /**
   * Obtient les options de décision pour une étape
   */
  getDecisionOptionsForStage(stage: PipelineStage): { approveLabel: string; cancelLabel: string } {
    switch (stage.stageType) {
      case 'PRESELECTION':
        return { approveLabel: 'Pré-sélection acceptée', cancelLabel: 'Pré-sélection refusée' };
      case 'DECISION':
        return { approveLabel: 'Embaucher', cancelLabel: 'Rejeter' };
      default:
        return { approveLabel: 'Accepter', cancelLabel: 'Refuser' };
    }
  }

  /**
   * Ouvre la popup de décision pour une étape
   */
  openDecisionModal(stageId: number): void {
    if (!this.hasDecisionPermissionForSelectedApplication()) return;
    this.decisionModalStep.set(stageId);
    this.showDecisionModal.set(true);
  }

  /**
   * Annule la décision pour une étape donnée (pipeline-aware)
   */
  undoDecisionForStage(stage: PipelineStage): void {
    const app = this.selectedApplication();
    if (!app) return;
    if (!this.hasDecisionPermissionForCampaign(app.campaignId)) return;

    const progress = this.getProgressForStage(app.id!, stage.id!);
    if (!progress) return;

    const decisionType = this.mapStageToDecisionType(stage, progress.progressStatus === 'PASSED');
    if (!decisionType) return;

    const cancelDecision: Decision = {
      decisionType: decisionType,
      isCancel: true,
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
          this.loadApplications();
          setTimeout(() => {
            this.loadDecisionsForApplication(app.id!);
            this.refreshProgressForApplication(app.id!);
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
    const stageId = this.decisionModalStep();
    if (!stageId) return;

    if (!this.hasDecisionPermissionForSelectedApplication()) return;

    const stages = this.getStagesForSelectedApp();
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;

    this.takeDecisionForStage(stage, action);
  }

  private hasDecisionPermissionForSelectedApplication(): boolean {
    return this.hasDecisionPermissionForCampaign(this.selectedApplication()?.campaignId);
  }

  private hasDecisionPermissionForCampaign(campaignId?: number | null): boolean {
    if (this.permissionService.hasAnyPermission(['CREATE_DECISIONS', 'UPDATE_DECISIONS', 'DELETE_DECISIONS', 'ADVANCE_PIPELINE'])) {
      return true;
    }
    if (!campaignId) {
      return false;
    }
    const access = this.campaignAccessMap()[campaignId];
    return Boolean(access && (access.isAdmin || access.isCreator || access.canAcceptPreScreen || access.canAcceptFinal));
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
  // PIPELINE
  // ===========================

  /**
   * Charge les étapes du pipeline pour une campagne donnée
   */
  loadPipelineStagesForCampaign(campaignId: number, templateId: number): void {
    const currentMap = this.campaignStagesMap();
    if (currentMap[campaignId]) return;

    this.pipelineStageService.getByTemplate(templateId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const stages = (response.items || []).sort((a, b) => (a.stageOrder || 0) - (b.stageOrder || 0));
          this.campaignStagesMap.set({ ...this.campaignStagesMap(), [campaignId]: stages });
        }
      });
  }

  /**
   * Charge le progrès pour une candidature
   */
  loadProgressForApplication(applicationId: number): void {
    const currentMap = this.applicationProgressMap();
    if (currentMap[applicationId]) return;

    this.applicationProgressService.getAllByCriteria({
      applicationId,
      isDeleted: false,
      size: 100
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.applicationProgressMap.set({
          ...this.applicationProgressMap(),
          [applicationId]: response.content || []
        });
      }
    });
  }

  /**
   * Rafraîchit le progrès pour une candidature (force le rechargement)
   */
  refreshProgressForApplication(applicationId: number): void {
    this.applicationProgressService.getAllByCriteria({
      applicationId,
      isDeleted: false,
      size: 100
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.applicationProgressMap.set({
          ...this.applicationProgressMap(),
          [applicationId]: response.content || []
        });
      }
    });
  }

  /**
   * Obtient le label pour un type de décision
   */
  getDecisionLabel(decisionType: string): string {
    const labels: Record<string, string> = {
      [APPLICATION_STATUS.PRE_SCREEN_ACCEPTED]: 'Pré-sélection acceptée',
      [APPLICATION_STATUS.PRE_SCREEN_REJECTED]: 'Pré-sélection refusée',
      [APPLICATION_STATUS.FINAL_ACCEPTED]: 'Décision finale : Accepté',
      [APPLICATION_STATUS.FINAL_REJECTED]: 'Décision finale : Rejeté'
    };
    return labels[decisionType] || decisionType;
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

  getFilterCount(filter: Exclude<DecisionFilter, 'ALL'>): number {
    return this.applications().filter(app => this.matchesDecisionFilter(app, filter)).length;
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
  getPreScreenDecisionsCount(): number {
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

  private matchesDecisionFilter(app: ApplicationWithCampaign, filter: DecisionFilter): boolean {
    if (filter === 'ALL') {
      return true;
    }

    if (filter === 'SUBMITTED') {
      return app.applicationStatus === APPLICATION_STATUS.SUBMITTED;
    }

    if (filter === 'PRE_SCREEN') {
      return app.applicationStatus === APPLICATION_STATUS.PRE_SCREEN_ACCEPTED;
    }

    return app.applicationStatus?.startsWith('FINAL') || false;
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
