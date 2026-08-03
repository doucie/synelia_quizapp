import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Application, ApplicationQuizAttemptSummary, ApplicationService } from '../../../core/services/application.service';
import { CampaignService, Campaign, CampaignAccessRecord } from '../../../core/services/campaign.service';
import { CandidateInterviewEntity, CandidateInterviewEntityService } from '../../../core/services/candidate-interview-entity.service';
import { PermissionService } from '../../../core/services/permission.service';
import { SourceTokenService, SourceToken } from '../../../services/source-token.service';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { ApplicationProgressService } from '../../../core/services/application-progress.service';
import { PipelineStage, ApplicationProgress } from '../../../core/models/pipeline.interfaces';
import { APPLICATION_STATUS, getApplicationStatusLabel, isRejectedStatus } from '../../../core/constants/application-status.constants';
import { FilterCheckboxComponent } from '../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../shared/filter-select/filter-select';

type SortOrder = 'recent' | 'oldest';
type ViewMode = 'grid' | 'list';

interface ApplicationWithCampaign extends Application {
  campaignTitle?: string;
  campaignId?: number;
  sourceTokenLabel?: string;
  applicationAbandoned?: boolean;
}

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, ClickOutsideDirective, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective],
  templateUrl: './applications.html',
  styleUrl: './applications.scss'
})
export class ApplicationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Signals
  applications = signal<ApplicationWithCampaign[]>([]);
  followedCampaigns = signal<Campaign[]>([]);
  sharedCampaignIds = signal<Set<number>>(new Set());
  campaignAccessMap = signal<Record<number, CampaignAccessRecord>>({});
  loading = signal(false);
  searchQuery = signal('');
  selectedCampaign = signal<number | null>(null);
  selectedSource = signal<string | null>(null);
  campaignSearchQuery = signal(''); // Recherche rapide campagne
  sourceSearchQuery = signal(''); // Recherche rapide source
  showCampaignSuggestions = signal(false); // Afficher suggestions campagne
  showSourceSuggestions = signal(false); // Afficher suggestions source
  sortOrder = signal<SortOrder>('recent');
  viewMode = signal<ViewMode>('grid');
  showOnlySharedCampaigns = signal(false); // Décochée par défaut
  lockedCampaignId = signal<number | null>(null); // Campagne verrouillée depuis l'URL
  focusedApplicationId = signal<number | null>(null);
  
  // Signals pour modal CV
  cvPreviewUrl = signal<SafeResourceUrl | null>(null);
  cvPreviewCandidateName = signal<string>('');
  currentCvPath = signal<string>('');

  // Pipeline dynamique
  campaignStagesMap = signal<Record<number, PipelineStage[]>>({});
  applicationProgressMap = signal<Record<number, ApplicationProgress[]>>({});
  applicationQuizAttemptsMap = signal<Record<number, ApplicationQuizAttemptSummary[]>>({});
  applicationQuizAttemptsLoadedMap = signal<Record<number, boolean>>({});
  applicationInterviewsMap = signal<Record<number, CandidateInterviewEntity[]>>({});
  applicationInterviewsLoadedMap = signal<Record<number, boolean>>({});

  constructor(
    private applicationService: ApplicationService,
    private campaignService: CampaignService,
    private sourceTokenService: SourceTokenService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private pipelineStageService: PipelineStageService,
    private applicationProgressService: ApplicationProgressService,
    private candidateInterviewEntityService: CandidateInterviewEntityService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    // Vérifier si une campagne est verrouillée via le fragment (#campaign123)
    this.route.fragment.pipe(takeUntil(this.destroy$)).subscribe(fragment => {
      if (fragment && fragment.startsWith('campaign')) {
        const campaignId = parseInt(fragment.replace('campaign', ''), 10);
        if (!isNaN(campaignId)) {
          console.log(`🔒 Campagne verrouillée: #${campaignId}`);
          this.lockedCampaignId.set(campaignId);
        }

		this.focusedApplicationId.set(null);
		return;
	  }

	  if (fragment && fragment.startsWith('application-')) {
		const applicationId = parseInt(fragment.replace('application-', ''), 10);
		if (!isNaN(applicationId)) {
		  this.focusedApplicationId.set(applicationId);
		}
		return;
      }

	  this.focusedApplicationId.set(null);
    });
    
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onStageFilterChange(value: string | number | boolean | null): void {
    this.setStageFilter(typeof value === 'number' ? value : null);
  }

  onSharedCampaignsFilterChange(checked: boolean): void {
    this.showOnlySharedCampaigns.set(checked);
  }

  /**
   * Computed - Candidatures affichées après filtrage et tri
   */
  displayedApplications = computed(() => {
    let apps = [...this.applications()];
    const query = this.searchQuery().toLowerCase();
    const campaignSearchQuery = this.campaignSearchQuery().toLowerCase();
    const sourceSearchQuery = this.sourceSearchQuery().toLowerCase();
    const lockedCampaignId = this.lockedCampaignId();
    const sort = this.sortOrder();
    const showOnlyShared = this.showOnlySharedCampaigns();
    const sharedCampaignIds = this.sharedCampaignIds();
    const stageFilter = this.selectedStageFilter();
    const progressMap = this.applicationProgressMap();
    
    // Filtrer par campagne verrouillée (priorité absolue)
    if (lockedCampaignId !== null) {
      apps = apps.filter(app => app.campaignId === lockedCampaignId);
    }
    
    // Filtrer par campagnes partagées
    if (showOnlyShared) {
      apps = apps.filter(app => 
        app.campaignId && sharedCampaignIds.has(app.campaignId)
      );
    }
    
    // Filtrer par recherche globale
    if (query) {
      apps = apps.filter(app => 
        (app.candidateFirstName || '').toLowerCase().includes(query) ||
        (app.candidateLastName || '').toLowerCase().includes(query) ||
        (app.candidateEmail || '').toLowerCase().includes(query) ||
        (app.campaignTitle || '').toLowerCase().includes(query)
      );
    }
    
    // Filtrer par recherche campagne (seulement si pas de campagne verrouillée)
    if (campaignSearchQuery && lockedCampaignId === null) {
      apps = apps.filter(app => 
        (app.campaignTitle || '').toLowerCase().includes(campaignSearchQuery)
      );
    }
    
    // Filtrer par recherche source
    if (sourceSearchQuery) {
      apps = apps.filter(app => 
        (app.sourceTokenLabel || '').toLowerCase().includes(sourceSearchQuery)
      );
    }

    // Filtrer par étape du pipeline
    if (stageFilter !== null) {
      apps = apps.filter(app => {
        if (!app.id) return false;
        const progressList = progressMap[app.id] || [];
        const progress = progressList.find(p => p.pipelineStageId === stageFilter);
        return progress && (progress.progressStatus === 'IN_PROGRESS' || progress.progressStatus === 'PENDING');
      });
    }
    
    // Trier
    apps.sort((a, b) => {
      const dateA = a.id || 0;
      const dateB = b.id || 0;
      return sort === 'recent' ? dateB - dateA : dateA - dateB;
    });
    
    return apps;
  });

  /**
   * Computed - Sources uniques
   */
  availableSources = computed(() => {
    const sources = new Set<string>();
    this.applications().forEach(app => {
      if (app.sourceTokenLabel) {
        sources.add(app.sourceTokenLabel);
      }
    });
    return Array.from(sources).sort();
  });

  /**
   * Computed - Campagnes filtrées pour suggestions
   */
  filteredCampaigns = computed(() => {
    const query = this.campaignSearchQuery().toLowerCase();
    const campaigns = this.followedCampaigns();
    
    if (!query) {
      return campaigns; // Toutes les campagnes si pas de recherche
    }
    
    return campaigns.filter(campaign => 
      campaign.campaignTitle?.toLowerCase().includes(query)
    );
  });

  /**
   * Computed - Sources filtrées pour suggestions
   */
  filteredSources = computed(() => {
    const query = this.sourceSearchQuery().toLowerCase();
    const sources = this.availableSources();
    
    if (!query) {
      return sources; // Toutes les sources si pas de recherche
    }
    
    return sources.filter(source => 
      source.toLowerCase().includes(query)
    );
  });

  /**
   * Computed - Campagne verrouillée (pour affichage)
   */
  lockedCampaign = computed(() => {
    const lockedId = this.lockedCampaignId();
    if (lockedId === null) return null;
    
    const allCampaigns = this.followedCampaigns();
    return allCampaigns.find(c => c.id === lockedId) || null;
  });

  /**
   * Computed - Statistiques
   */
  totalApplications = computed(() => this.applications().length);
  
  pendingApplications = computed(() => 
    this.applications().filter(a => this.isApplicationPendingInCurrentRound(a)).length
  );
  
  verifiedApplications = computed(() => 
    this.applications().filter(a => a.emailVerified === true).length
  );
  
  completedQuizApplications = computed(() => 
    this.applications().filter(a => this.getCurrentQuizStatus(a) === 'COMPLETED').length
  );

  /**
   * Charge les données
   */
  loadData(): void {
    this.loading.set(true);
    this.applicationProgressMap.set({});
    this.applicationQuizAttemptsMap.set({});
    this.applicationQuizAttemptsLoadedMap.set({});
    this.applicationInterviewsMap.set({});
    this.applicationInterviewsLoadedMap.set({});
    
    // D'abord récupérer l'ID de l'utilisateur connecté
    const currentUserData = localStorage.getItem('user');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id : null;
    
    if (!currentUserId) {
      console.error('❌ Utilisateur non connecté');
      this.loading.set(false);
      return;
    }

    console.log('👤 ID utilisateur connecté:', currentUserId);
    
    // Charger les campagnes et les accès en parallèle
    forkJoin({
      allCampaigns: this.campaignService.getAllCampaignsByCriteria({ size: 1000, page: 0, isDeleted: false }),
      myCampaigns: this.campaignService.getMyCampaigns({ size: 100, page: 0, isDeleted: false }),
      sharedCampaigns: this.campaignService.getSharedCampaigns({ isDeleted: false }),
      campaignAccesses: this.campaignService.getCampaignAccessesByUser(currentUserId),
      applications: this.applicationService.getApplicationsByCriteria({}),
      sourceTokens: this.sourceTokenService.getSourceTokensByCriteria({})
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (results) => {
        console.log('📦 Données chargées:', {
          allCampaigns: results.allCampaigns.content?.length || 0,
          myCampaigns: results.myCampaigns.content?.length || 0,
          sharedCampaigns: results.sharedCampaigns?.length || 0,
          campaignAccesses: results.campaignAccesses.length || 0,
          applications: results.applications.items?.length || 0,
          sourceTokens: results.sourceTokens.items?.length || 0
        });

        // Pour l'enrichissement, on utilise TOUTES les campagnes
        const allCampaignsForEnrichment = results.allCampaigns.content || [];
        const accessMap = this.campaignService.buildCampaignAccessMap(results.campaignAccesses || []);
        this.campaignAccessMap.set(accessMap);
        
        // Extraire les IDs des campagnes où l'utilisateur a au moins un droit
        const sharedIds = new Set<number>();
        Object.values(accessMap).forEach((access) => {
          if (access.campaignId && this.hasAnyCampaignAccess(access) && !access.isCreator) {
            sharedIds.add(access.campaignId);
            console.log(`✅ Campagne ${access.campaignId} accessible (au moins un droit)`, {
              canUpdate: access.canUpdate,
              canDelete: access.canDelete,
              canEvaluate: access.canEvaluate,
              canPlanify: access.canPlanify,
              canAdvancePipeline: access.canAcceptPreScreen || access.canAcceptFinal,
              follow: access.follow,
              isAdmin: access.isAdmin
            });
          }
        });
        
        console.log(`🔑 ${sharedIds.size} campagnes partagées avec droits:`, Array.from(sharedIds));
        this.sharedCampaignIds.set(sharedIds);
        
        // Enrichir les candidatures avec les infos de campagne (utiliser TOUTES les campagnes)
        this.enrichApplications(
          results.applications.items || [],
          results.sourceTokens.items || [],
          allCampaignsForEnrichment
        );
        
        // Pour followedCampaigns (suggestions de filtre), extraire les campagnes des candidatures affichées
        const campaignIdsInApplications = new Set<number>();
        (results.applications.items || []).forEach((app: Application) => {
          if (app.sourceTokenId) {
            const sourceToken = (results.sourceTokens.items || []).find((st: SourceToken) => st.id === app.sourceTokenId);
            if (sourceToken?.campaignId) {
              campaignIdsInApplications.add(sourceToken.campaignId);
            }
          }
        });
        
        // Filtrer les campagnes pour ne garder que celles qui ont des candidatures
        const campaignsWithApplications = allCampaignsForEnrichment.filter(campaign => 
          campaign.id && campaignIdsInApplications.has(campaign.id)
        );
        
        console.log(`📋 ${campaignsWithApplications.length} campagnes avec candidatures:`, 
          campaignsWithApplications.map(c => `#${c.id}: ${c.campaignTitle}`)
        );
        
        this.followedCampaigns.set(campaignsWithApplications);
        
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des données:', error);
        this.loading.set(false);
      }
    });
  }

  /**
   * Enrichit les candidatures avec les informations de campagne
   */
  enrichApplications(
    applications: Application[], 
    sourceTokens: SourceToken[], 
    campaigns: Campaign[]
  ): void {
    console.log(`\n� Enrichissement de ${applications.length} candidatures`);
    
    // Créer des maps pour un accès rapide
    const sourceTokenById = new Map<number, SourceToken>();
    sourceTokens.forEach(token => {
      if (token.id) {
        sourceTokenById.set(token.id, token);
      }
    });
    
    const campaignById = new Map<number, Campaign>();
    campaigns.forEach(campaign => {
      if (campaign.id) {
        campaignById.set(campaign.id, campaign);
      }
    });
    
    console.log(`� Maps créées: ${sourceTokenById.size} source tokens, ${campaignById.size} campagnes`);
    
    // Log détaillé des source tokens
    Array.from(sourceTokenById.values()).forEach(st => {
      console.log(`  📌 SourceToken #${st.id}: "${st.sourceTokenName}" → campaignId=${st.campaignId}`);
    });
    
    // Log détaillé des campaigns
    Array.from(campaignById.values()).forEach(c => {
      console.log(`  📌 Campaign #${c.id}: "${c.campaignTitle}"`);
    });
    
    // Enrichir toutes les candidatures
    const enrichedApplications: ApplicationWithCampaign[] = applications.map(app => {
      console.log(`  🔍 Application #${app.id}: sourceTokenId=${app.sourceTokenId}`);
      
      let campaignTitle = 'Campagne inconnue';
      let campaignId: number | undefined = undefined;
      let sourceTokenLabel = 'N/A';
      
      // Essayer de trouver le source token
      if (app.sourceTokenId && sourceTokenById.has(app.sourceTokenId)) {
        const sourceToken = sourceTokenById.get(app.sourceTokenId)!;
        sourceTokenLabel = sourceToken.sourceTokenName || `Token #${app.sourceTokenId}`;
        
        // Essayer de trouver la campagne via le source token
        if (sourceToken.campaignId && campaignById.has(sourceToken.campaignId)) {
          const campaign = campaignById.get(sourceToken.campaignId)!;
          campaignTitle = campaign.campaignTitle || campaignTitle;
          campaignId = campaign.id;
          
          console.log(`  ✅ Candidature #${app.id} → Campagne "${campaignTitle}" via Token "${sourceTokenLabel}"`);
        } else if (sourceToken.campaignName) {
          // Si on a pas trouvé la campagne dans la map, utiliser le nom du DTO
          campaignTitle = sourceToken.campaignName;
          console.log(`  ⚠️ Candidature #${app.id} → Campagne "${campaignTitle}" (via nom du token)`);
        } else {
          console.log(`  ⚠️ Candidature #${app.id} → Campaign ID ${sourceToken.campaignId} non trouvée`);
        }
      } else {
        console.log(`  ❌ Candidature #${app.id} → Source Token ${app.sourceTokenId} non trouvé`);
      }
      
      return {
        ...app,
        campaignTitle,
        campaignId,
        sourceTokenLabel
      };
    });
    
    console.log(`\n✅ ${enrichedApplications.length} candidatures enrichies et affichées`);
    this.applications.set(enrichedApplications);
    this.scrollToFocusedApplication();

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
        this.loadRuntimeDetailsForApplication(app.id);
      }
    });
  }

  /**
   * Change le filtre de campagne (gardé pour compatibilité mais non utilisé)
   */
  setSelectedCampaign(campaignId: number | null): void {
    this.selectedCampaign.set(campaignId);
  }

  /**
   * Change le filtre de source (gardé pour compatibilité mais non utilisé)
   */
  setSelectedSource(source: string | null): void {
    this.selectedSource.set(source);
  }

  /**
   * Change la recherche rapide de campagne
   */
  setCampaignSearchQuery(query: string): void {
    this.campaignSearchQuery.set(query);
    this.showCampaignSuggestions.set(true); // Afficher suggestions lors de la saisie
  }

  /**
   * Change la recherche rapide de source
   */
  setSourceSearchQuery(query: string): void {
    this.sourceSearchQuery.set(query);
    this.showSourceSuggestions.set(true); // Afficher suggestions lors de la saisie
  }

  /**
   * Sélectionne une campagne depuis les suggestions
   */
  selectCampaign(campaign: Campaign): void {
    this.campaignSearchQuery.set(campaign.campaignTitle || '');
    this.showCampaignSuggestions.set(false);
  }

  /**
   * Sélectionne une source depuis les suggestions
   */
  selectSource(source: string): void {
    this.sourceSearchQuery.set(source);
    this.showSourceSuggestions.set(false);
  }

  /**
   * Efface la recherche campagne
   */
  clearCampaignSearch(): void {
    this.campaignSearchQuery.set('');
    this.showCampaignSuggestions.set(false);
  }

  /**
   * Efface la recherche source
   */
  clearSourceSearch(): void {
    this.sourceSearchQuery.set('');
    this.showSourceSuggestions.set(false);
  }

  /**
   * Ferme les suggestions campagne (clickOutside)
   */
  closeCampaignSuggestions(): void {
    this.showCampaignSuggestions.set(false);
  }

  /**
   * Ferme les suggestions source (clickOutside)
   */
  closeSourceSuggestions(): void {
    this.showSourceSuggestions.set(false);
  }

  /**
   * Change l'ordre de tri
   */
  toggleSortOrder(): void {
    this.sortOrder.set(this.sortOrder() === 'recent' ? 'oldest' : 'recent');
  }

  /**
   * Change le mode d'affichage
   */
  toggleViewMode(): void {
    this.viewMode.set(this.viewMode() === 'grid' ? 'list' : 'grid');
  }

  /**
   * Obtient la classe CSS pour le statut
   */
  getStatusClass(status?: string): string {
    switch((status || 'PENDING').toLowerCase()) {
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      case 'pending': 
      default: return 'status-pending';
    }
  }

  /**
   * Obtient le libellé du statut
   */
  getStatusLabel(status?: string): string {
    switch((status || 'PENDING').toLowerCase()) {
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Rejeté';
      case 'pending': 
      default: return 'En attente';
    }
  }

  /**
   * Obtient les étapes du pipeline pour une candidature (via sa campagne)
   */
  getStagesForApp(app: ApplicationWithCampaign): PipelineStage[] {
    if (!app.campaignId) return [];
    return this.campaignStagesMap()[app.campaignId] || [];
  }

  getCurrentStage(app: ApplicationWithCampaign): PipelineStage | null {
    const resolvedStage = this.getResolvedCurrentStage(app);
    if (resolvedStage) {
      return resolvedStage;
    }

    const stages = this.getStagesForApp(app);
    return stages.length > 0 ? stages[stages.length - 1] : null;
  }

  private getResolvedCurrentStage(app: ApplicationWithCampaign): PipelineStage | null {
    const stages = this.getStagesForApp(app);
    for (const stage of stages) {
      const status = this.getDynamicStepStatus(app, stage.id!);
      if (status === 'active' || status === 'pending') {
        return stage;
      }
    }

    return null;
  }

  /**
   * Obtient le progrès d'une candidature pour une étape donnée
   */
  getProgressForStage(appId: number, stageId: number): ApplicationProgress | undefined {
    const progressList = this.applicationProgressMap()[appId] || [];
    return progressList.find(p => p.pipelineStageId === stageId);
  }

  /**
   * Obtient le statut visuel d'une étape pour une candidature
   * Utilise le pipeline dynamique si disponible, sinon fallback sur le statut legacy
   */
  getDynamicStepStatus(app: ApplicationWithCampaign, stageId: number): string {
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
   * Obtient le tooltip pour une étape dynamique
   */
  getDynamicStepTooltip(app: ApplicationWithCampaign, stage: PipelineStage): string {
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

  // Signals pour actions pipeline
  actionLoading = signal<Record<string, boolean>>({});
  showRejectModal = signal(false);
  rejectModalAppId = signal<number | null>(null);
  rejectModalStageId = signal<number | null>(null);
  rejectReason = signal('');

  // Signal pour filtre par étape
  selectedStageFilter = signal<number | null>(null);

  /**
   * Computed - Étapes disponibles pour le filtre (union de toutes les campagnes)
   */
  availableStagesForFilter = computed(() => {
    const stagesMap = this.campaignStagesMap();
    const allStages = new Map<number, PipelineStage>();
    Object.values(stagesMap).forEach(stages => {
      stages.forEach(stage => {
        if (stage.id && !allStages.has(stage.id)) {
          allStages.set(stage.id, stage);
        }
      });
    });
    return Array.from(allStages.values()).sort((a, b) => (a.stageOrder || 0) - (b.stageOrder || 0));
  });

  /**
   * Vérifie si une action est en cours sur app+stage
   */
  isActionLoading(appId: number, stageId: number): boolean {
    return this.actionLoading()[`${appId}-${stageId}`] || false;
  }

  /**
   * Peut-on valider cette étape pour ce candidat ?
   * Seulement si le statut est IN_PROGRESS ou PENDING
   */
  canAdvanceStage(app: ApplicationWithCampaign, stageId: number): boolean {
    const status = this.getDynamicStepStatus(app, stageId);
    return this.canAdvancePipelineForCampaign(app.campaignId) && (status === 'active' || status === 'pending');
  }

  /**
   * Peut-on refuser cette étape pour ce candidat ?
   * Seulement si le statut est IN_PROGRESS ou PENDING
   */
  canRejectStage(app: ApplicationWithCampaign, stageId: number): boolean {
    const status = this.getDynamicStepStatus(app, stageId);
    return this.canAdvancePipelineForCampaign(app.campaignId) && (status === 'active' || status === 'pending');
  }

  /**
   * Peut-on passer cette étape ?
   * Oui si elle est skippable et qu'aucun email requis n'est encore en attente.
   */
  canSkipStage(app: ApplicationWithCampaign, stage: PipelineStage): boolean {
    if (!stage.id || !this.isStageSkippable(stage)) return false;
    const progress = this.getProgressForStage(app.id!, stage.id);
    if (stage.emailRequired && !Boolean(progress?.mailSent)) return false;
    const status = this.getDynamicStepStatus(app, stage.id!);
    return this.canAdvancePipelineForCampaign(app.campaignId) && (status === 'active' || status === 'pending');
  }

  getSkipActionTitle(stage: PipelineStage): string {
    if (stage.emailRequired) {
      return 'Ignorer cette étape après envoi de l’email requis';
    }

    return stage.isRequired
      ? 'Ignorer cette étape (autorisé par la configuration du pipeline)'
      : 'Ignorer cette étape';
  }

  /**
   * Valide l'étape courante du candidat (advance)
   */
  advanceStage(app: ApplicationWithCampaign, stageId: number, event: Event): void {
    event.stopPropagation();
    if (!app.id || this.isActionLoading(app.id, stageId)) return;

    const key = `${app.id}-${stageId}`;
    this.actionLoading.set({ ...this.actionLoading(), [key]: true });

    this.applicationProgressService.advance(app.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.hasError) {
            this.refreshProgressForApplication(app.id!);
          }
          this.actionLoading.set({ ...this.actionLoading(), [key]: false });
        },
        error: () => {
          this.actionLoading.set({ ...this.actionLoading(), [key]: false });
        }
      });
  }

  /**
   * Ouvre la modale de refus
   */
  openRejectModal(app: ApplicationWithCampaign, stageId: number, event: Event): void {
    event.stopPropagation();
    this.rejectModalAppId.set(app.id!);
    this.rejectModalStageId.set(stageId);
    this.rejectReason.set('');
    this.showRejectModal.set(true);
  }

  /**
   * Confirme le refus
   */
  confirmReject(): void {
    const appId = this.rejectModalAppId();
    const stageId = this.rejectModalStageId();
    if (!appId || !stageId) return;

    const key = `${appId}-${stageId}`;
    this.actionLoading.set({ ...this.actionLoading(), [key]: true });
    this.showRejectModal.set(false);

    this.applicationProgressService.fail(appId, stageId, this.rejectReason() || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.hasError) {
            this.refreshProgressForApplication(appId);
          }
          this.actionLoading.set({ ...this.actionLoading(), [key]: false });
        },
        error: () => {
          this.actionLoading.set({ ...this.actionLoading(), [key]: false });
        }
      });
  }

  /**
   * Annule la modale de refus
   */
  cancelReject(): void {
    this.showRejectModal.set(false);
    this.rejectModalAppId.set(null);
    this.rejectModalStageId.set(null);
    this.rejectReason.set('');
  }

  /**
   * Passe (skip) une étape skippable du pipeline
   */
  skipStage(app: ApplicationWithCampaign, stage: PipelineStage, event: Event): void {
    event.stopPropagation();
    if (!app.id || !stage.id || this.isActionLoading(app.id, stage.id)) return;

    const key = `${app.id}-${stage.id}`;
    this.actionLoading.set({ ...this.actionLoading(), [key]: true });

    this.applicationProgressService.skip(app.id, stage.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (!res.hasError) {
            this.refreshProgressForApplication(app.id!);
          }
          this.actionLoading.set({ ...this.actionLoading(), [key]: false });
        },
        error: () => {
          this.actionLoading.set({ ...this.actionLoading(), [key]: false });
        }
      });
  }

  /**
   * Recharge le progrès d'une candidature (après action)
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
   * Sélectionne un filtre par étape
   */
  setStageFilter(stageId: number | null): void {
    this.selectedStageFilter.set(stageId);
  }

  /**
   * Charge les étapes du pipeline pour une campagne donnée
   */
  loadPipelineStagesForCampaign(campaignId: number, templateId: number): void {
    const currentMap = this.campaignStagesMap();
    if (currentMap[campaignId]) return; // Déjà chargé

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
    if (currentMap[applicationId]) return; // Déjà chargé

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
   * Obtient le statut d'une étape de progression (legacy/fallback)
   * @param applicationStatus Le statut de la candidature
   * @param step Numéro de l'étape (1: Candidature, 2: Pré-sélection, 3: Final)
   * @returns 'pending' | 'active' | 'completed' | 'rejected' | 'archived'
   */
  getStepStatus(applicationStatus: string = 'PENDING', step: number): string {
    const status = applicationStatus.toUpperCase();
    
    // Étape 1: Candidature (PENDING → SUBMITTED)
    if (step === 1) {
      if (status === APPLICATION_STATUS.PENDING) return 'active';
      if (status === APPLICATION_STATUS.PENDING_ARCHIVED) return 'archived';
      return 'completed';
    }
    
    // Étape 2: Pré-sélection (PRE_SCREEN)
    if (step === 2) {
      if (status === APPLICATION_STATUS.PENDING || status === APPLICATION_STATUS.PENDING_ARCHIVED) return 'pending';
      if (status === APPLICATION_STATUS.SUBMITTED) return 'active';
      if (status.startsWith('PRE_SCREEN_REJECTED')) return 'rejected';
      if (status === APPLICATION_STATUS.PRE_SCREEN_ACCEPTED || status.startsWith('FINAL_')) return 'completed';
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
   * Obtient le texte du tooltip pour une étape de progression
   * @param applicationStatus Le statut de la candidature
   * @param step Numéro de l'étape (1: Candidature, 2: Pré-sélection, 3: Final)
   * @returns Le texte descriptif du tooltip
   */
  getStepTooltip(applicationStatus: string = 'PENDING', step: number): string {
    const status = applicationStatus.toUpperCase();
    
    // Étape 1: Candidature
    if (step === 1) {
      if (status === APPLICATION_STATUS.PENDING) return 'Candidature en attente d\'envoi';
      if (status === APPLICATION_STATUS.PENDING_ARCHIVED) return 'Candidature archivée (non envoyée)';
      return 'Candidature envoyée';
    }
    
    // Étape 2: Pré-sélection
    if (step === 2) {
      if (status === APPLICATION_STATUS.PENDING || status === APPLICATION_STATUS.PENDING_ARCHIVED) 
        return 'Pré-sélection : en attente d\'envoi de candidature';
      if (status === APPLICATION_STATUS.SUBMITTED) return 'Pré-sélection en cours';
      if (status === APPLICATION_STATUS.PRE_SCREEN_ACCEPTED) return 'Pré-sélection acceptée';
      if (status === APPLICATION_STATUS.PRE_SCREEN_REJECTED) return 'Pré-sélection refusée';
      if (status === APPLICATION_STATUS.PRE_SCREEN_REJECTED_ARCHIVED) return 'Pré-sélection refusée (archivé)';
      if (status.startsWith('FINAL_ACCEPTED')) return 'Pré-sélection acceptée';
      return 'Pré-sélection en attente';
    }
    
    // Étape 3: Final
    if (step === 3) {
      if (status === APPLICATION_STATUS.PENDING || status === APPLICATION_STATUS.PENDING_ARCHIVED || status === APPLICATION_STATUS.SUBMITTED || 
          status.startsWith('PRE_SCREEN_REJECTED')) 
        return 'Décision finale : en attente de pré-sélection';
      if (status === APPLICATION_STATUS.PRE_SCREEN_ACCEPTED) return 'Décision finale en attente';
      if (status === APPLICATION_STATUS.FINAL_ACCEPTED) return 'Candidature acceptée ✓';
      if (status === APPLICATION_STATUS.FINAL_ACCEPTED_ARCHIVED) return 'Candidature acceptée (archivé)';
      if (status === APPLICATION_STATUS.FINAL_REJECTED) return 'Candidature refusée';
      if (status === APPLICATION_STATUS.FINAL_REJECTED_ARCHIVED) return 'Candidature refusée (archivé)';
      return 'Décision finale en attente';
    }
    
    return '';
  }

  /**
   * Obtient le nom complet du candidat
   */
  getCandidateName(app: Application): string {
    return `${app.candidateFirstName || ''} ${app.candidateLastName || ''}`.trim() || 'Candidat';
  }

  /**
   * Obtient les initiales du candidat
   */
  getCandidateInitials(app: Application): string {
    const firstName = app.candidateFirstName || 'C';
    const lastName = app.candidateLastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0) || ''}`.toUpperCase();
  }

  /**
   * Formate une date au format français
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      let timestamp = Date.parse(dateString);
      if (Number.isNaN(timestamp)) {
        timestamp = this.parseRuntimeTimestamp(dateString);
      }
      if (Number.isNaN(timestamp) || timestamp <= 0) {
        return 'N/A';
      }
      const date = new Date(timestamp);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  }

  /**
   * Obtient le label du status d'interview
   */
  getInterviewStatusLabel(status: string | undefined): string {
    if (!status) return 'En attente';
    
    const statusMap: { [key: string]: string } = {
      'STARTED': 'En cours',
      'SCHEDULED': 'Planifié',
      'CONFIRMED': 'Confirmé',
      'COMPLETED': 'Effectué',
      'OVER': 'Terminé',
      'PASSED': 'Réussi',
      'FAILED': 'Échoué',
      'POSTPONED': 'Reporté',
      'ARCHIVED': 'Archivé',
      'CANCELLED': 'Annulé',
      'DECLINED': 'Refusé',
      'NO_SHOW': 'Absent',
      'PENDING': 'En attente'
    };
    
    return statusMap[status] || status;
  }

  /**
   * Obtient la classe CSS pour le status d'interview
   */
  getInterviewStatusClass(status: string | undefined): string {
    if (!status) return 'interview-pending';
    
    const statusMap: { [key: string]: string } = {
      'STARTED': 'interview-confirmed',
      'SCHEDULED': 'interview-scheduled',
      'CONFIRMED': 'interview-confirmed',
      'COMPLETED': 'interview-completed',
      'OVER': 'interview-completed',
      'PASSED': 'interview-completed',
      'FAILED': 'interview-cancelled',
      'POSTPONED': 'interview-pending',
      'ARCHIVED': 'badge-neutral',
      'CANCELLED': 'interview-cancelled',
      'DECLINED': 'interview-cancelled',
      'NO_SHOW': 'interview-no-show',
      'PENDING': 'interview-pending'
    };
    
    return statusMap[status] || 'interview-pending';
  }

  /**
   * Vérifie si on peut planifier un entretien pour cette candidature
   * Conditions: stage runtime courante = INTERVIEW && pas d'interview runtime
   */
  canScheduleInterview(app: ApplicationWithCampaign): boolean {
    if (!this.canPlanifyInterviewForCampaign(app.campaignId)) {
      return false;
    }

    const currentStageType = (this.getResolvedCurrentStage(app)?.stageType || '').toUpperCase();
    const hasCurrentInterview = Boolean(this.getCurrentInterviewDate(app));

    return currentStageType === 'INTERVIEW' && !hasCurrentInterview;
  }

  /**
   * Planifier un entretien pour cette candidature
   */
  scheduleInterview(app: ApplicationWithCampaign): void {
    if (!this.canScheduleInterview(app)) {
      console.log('Cannot schedule interview - conditions not met');
      return;
    }
    
    console.log('Navigating to interview form with app:', app.id);
    
    // Naviguer vers la page de création d'interview avec l'ID de la candidature
    this.router.navigate(['/dashboard/interviews/create'], {
      queryParams: {
        applicationId: app.id,
        candidateName: `${app.candidateFirstName} ${app.candidateLastName}`,
        campaignId: app.campaignId,
        campaignTitle: app.campaignTitle
      }
    }).then(success => {
      console.log('Navigation result:', success);
    }).catch(error => {
      console.error('Navigation error:', error);
    });
  }

  /**
   * Navigation vers les détails
   */
  viewApplicationDetails(applicationId: number, campaignId?: number): void {
    const extras: any = {};
    if (campaignId) {
      extras.queryParams = { campaignId };
    }
    this.router.navigate(['/dashboard/candidates', applicationId], extras);
  }

  /**
   * Rafraîchit la liste
   */
  refreshApplications(): void {
    this.loadData();
  }

  /**
   * Réinitialise les filtres
   */
  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCampaign.set(null);
    this.selectedSource.set(null);
    this.campaignSearchQuery.set('');
    this.sourceSearchQuery.set('');
    this.showOnlySharedCampaigns.set(false); // Retour à l'état par défaut (décochée)
  }

  /**
   * Déverrouille la campagne et retourne à la liste complète
   */
  unlockCampaign(): void {
    this.lockedCampaignId.set(null);
    this.router.navigate(['/dashboard/candidates']);
  }

  /**
   * Copie le texte dans le presse-papier
   */
  copyToClipboard(text: string, label: string, event: Event): void {
    event.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      console.log(`✅ ${label} copié: ${text}`);
      // Optionnel: afficher un toast/notification
    }).catch(err => {
      console.error(`❌ Erreur lors de la copie du ${label}:`, err);
    });
  }

  /**
   * Ouvre l'aperçu du CV
   */
  openCVPreview(app: Application, event: Event): void {
    event.stopPropagation();
    if (app.candidateCvPath) {
      this.currentCvPath.set(app.candidateCvPath);
      this.cvPreviewCandidateName.set(this.getCandidateName(app));
      this.cvPreviewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(app.candidateCvPath));
    }
  }

  /**
   * Ferme l'aperçu du CV
   */
  closeCVPreview(): void {
    this.cvPreviewUrl.set(null);
    this.cvPreviewCandidateName.set('');
    this.currentCvPath.set('');
  }

  /**
   * Télécharge le CV actuellement affiché
   */
  downloadCurrentCV(): void {
    const cvPath = this.currentCvPath();
    const candidateName = this.cvPreviewCandidateName();
    if (cvPath) {
      const link = document.createElement('a');
      link.href = cvPath;
      link.download = `CV_${candidateName}.pdf`;
      link.click();
    }
  }

  /**
   * Ouvre le CV actuellement affiché dans un nouvel onglet
   */
  openCurrentCVInNewTab(): void {
    const cvPath = this.currentCvPath();
    if (cvPath) {
      window.open(cvPath, '_blank');
    }
  }

  /**
   * Télécharge le CV
   */
  downloadCV(app: Application, event: Event): void {
    event.stopPropagation();
    if (app.candidateCvPath) {
      const link = document.createElement('a');
      link.href = app.candidateCvPath;
      link.download = `CV_${this.getCandidateName(app)}.pdf`;
      link.click();
    }
  }

  /**
   * Ouvre le CV dans un nouvel onglet
   */
  openCVInNewTab(app: Application, event: Event): void {
    event.stopPropagation();
    if (app.candidateCvPath) {
      window.open(app.candidateCvPath, '_blank');
    }
  }

  private scrollToFocusedApplication(): void {
    const applicationId = this.focusedApplicationId();
    if (applicationId == null || typeof document === 'undefined') {
      return;
    }

    requestAnimationFrame(() => {
      const target = document.getElementById(`application-${applicationId}`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /**
   * Obtient la couleur du score
   */
  getScoreColor(score: number | null | undefined): string {
    if (!score && score !== 0) return 'neutral';
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  }

  getQuizBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'COMPLETED': return 'badge-success';
      case 'IN_PROGRESS': return 'badge-info';
      case 'ABANDONED': return 'badge-error';
      case 'NOT_REQUIRED': return 'badge-neutral';
      default: return 'badge-info';
    }
  }

  getInterviewBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'COMPLETED':
      case 'DONE':
      case 'OVER':
      case 'PASSED':
        return 'badge-success';
      case 'STARTED':
      case 'SCHEDULED':
      case 'PLANNED':
      case 'POSTPONED':
        return 'badge-info';
      case 'FAILED':
      case 'DECLINED':
      case 'CANCELLED':
        return 'badge-error';
      default: return 'badge-neutral';
    }
  }

  getCurrentStageId(app: ApplicationWithCampaign): number | null {
    return this.getCurrentStage(app)?.id || null;
  }

  getFallbackPipelineStepStatus(app: ApplicationWithCampaign, step: number): string {
    const progresses = this.getSortedProgressesForFallback(app);
    if (progresses.length === 0) {
      return this.getStepStatus(app.applicationStatus, step);
    }

    const lastIndex = progresses.length - 1;
    const bucketStatuses = progresses.reduce<Record<number, string[]>>((acc, progress, index) => {
      const slot = index === 0 ? 1 : index === lastIndex ? 3 : 2;
      acc[slot].push(this.getProgressVisualStatus(progress.progressStatus));
      return acc;
    }, { 1: [], 2: [], 3: [] });

    return this.aggregateFallbackBucketStatus(bucketStatuses[step] || []);
  }

  getFallbackPipelineLabel(app: ApplicationWithCampaign): string {
    const progresses = this.getSortedProgressesForFallback(app);
    if (progresses.length === 0) {
      return this.getLegacyStageLabel(app.applicationStatus);
    }

    const currentProgress = progresses.find(progress => {
      const visualStatus = this.getProgressVisualStatus(progress.progressStatus);
      return visualStatus === 'active' || visualStatus === 'pending';
    });

    if (currentProgress) {
      return this.getProgressStageLabel(currentProgress);
    }

    const lastProgress = progresses[progresses.length - 1];
    const lastStatus = this.getProgressVisualStatus(lastProgress?.progressStatus);
    if (lastStatus === 'completed') {
      return 'Terminé';
    }
    if (lastStatus === 'rejected') {
      return 'Refusé';
    }

    return this.getProgressStageLabel(lastProgress) || this.getLegacyStageLabel(app.applicationStatus);
  }

  isApplicationPendingInCurrentRound(app: ApplicationWithCampaign): boolean {
    const currentStage = this.getCurrentStage(app);
    if (currentStage?.id) {
      return this.getDynamicStepStatus(app, currentStage.id) === 'pending';
    }

    return app.applicationStatus === APPLICATION_STATUS.PENDING || !app.applicationStatus;
  }

  getCurrentQuizStatus(app: ApplicationWithCampaign): string {
    return app.id ? this.getCurrentQuizAttempt(app.id)?.quizStatus || '' : '';
  }

  getCurrentQuizScorePercent(app: ApplicationWithCampaign): number | null {
    return app.id ? this.getCurrentQuizAttempt(app.id)?.scorePercent ?? null : null;
  }

  getCurrentInterviewDate(app: ApplicationWithCampaign): string {
    if (app.id && this.hasLoadedInterviewRuntime(app.id)) {
      return this.getCurrentInterview(app.id)?.interviewDate || '';
    }
    return app.interviewDate || '';
  }

  getCurrentInterviewStatus(app: ApplicationWithCampaign): string {
    if (app.id && this.hasLoadedInterviewRuntime(app.id)) {
      return this.getCurrentInterview(app.id)?.interviewStatus || '';
    }
    return app.interviewStatus || '';
  }

  getCurrentEvaluationScore(app: ApplicationWithCampaign): number | null {
    if (app.id && this.hasLoadedInterviewRuntime(app.id)) {
      return this.getCurrentInterview(app.id)?.evaluationScore ?? null;
    }
    return app.evaluationScore ?? null;
  }

  getCurrentStageName(app: ApplicationWithCampaign): string {
    const stages = this.getStagesForApp(app);
    for (const stage of stages) {
      const status = this.getDynamicStepStatus(app, stage.id!);
      if (status === 'active') return stage.stageLabel || 'En cours';
      if (status === 'pending') return stage.stageLabel || 'En attente';
    }
    const last = stages[stages.length - 1];
    if (last) {
      const lastStatus = this.getDynamicStepStatus(app, last.id!);
      if (lastStatus === 'completed') return 'Terminé';
      if (lastStatus === 'rejected') return 'Refusé';
    }
    return 'N/A';
  }

  getLegacyStageLabel(status: string | undefined): string {
    switch (status) {
      case 'ACCEPTED': return 'Accepté';
      case 'REJECTED': return 'Refusé';
      case 'COMPLETED': return 'Terminé';
      case 'IN_PROGRESS': return 'En cours';
      default: return 'En attente';
    }
  }

  private isStageSkippable(stage: PipelineStage): boolean {
    if (!stage) {
      return false;
    }

    if (stage.stageType === 'CANDIDATURE' || stage.stageType === 'DECISION') {
      return false;
    }

    if (!stage.isRequired) {
      return true;
    }

    const config = this.readStageConfig(stage);
    return config?.allowSkip === true;
  }

  private readStageConfig(stage: PipelineStage): { allowSkip?: boolean } | null {
    const rawConfig = stage.configJson?.trim();
    if (!rawConfig) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawConfig);
      return parsed && typeof parsed === 'object' ? parsed as { allowSkip?: boolean } : null;
    } catch {
      return null;
    }
  }

  private hasAnyCampaignAccess(access: CampaignAccessRecord): boolean {
    return access.canUpdate
      || access.canDelete
      || access.canEvaluate
      || access.canPlanify
      || access.canAcceptPreScreen
      || access.canAcceptFinal
      || access.follow
      || access.isAdmin
      || access.isCreator;
  }

  private canAdvancePipelineForCampaign(campaignId?: number | null): boolean {
    if (this.permissionService.hasAnyPermission(['ADVANCE_PIPELINE', 'UPDATE_APPLICATION_PROGRESS'])) {
      return true;
    }
    if (!campaignId) {
      return false;
    }
    const access = this.campaignAccessMap()[campaignId];
    return Boolean(access && (access.isAdmin || access.isCreator || access.canAcceptPreScreen || access.canAcceptFinal));
  }

  private loadRuntimeDetailsForApplication(applicationId: number): void {
    if (this.hasLoadedQuizRuntime(applicationId) && this.hasLoadedInterviewRuntime(applicationId)) {
      return;
    }

    this.applicationService.getApplicationDetail(applicationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (applicationDetail) => {
          this.applicationQuizAttemptsMap.set({
            ...this.applicationQuizAttemptsMap(),
            [applicationId]: this.sortQuizAttemptsForDisplay(applicationDetail?.quizAttempts || [])
          });
          this.applicationQuizAttemptsLoadedMap.set({
            ...this.applicationQuizAttemptsLoadedMap(),
            [applicationId]: true
          });
        },
        error: () => {
          this.applicationQuizAttemptsMap.set({
            ...this.applicationQuizAttemptsMap(),
            [applicationId]: []
          });
          this.applicationQuizAttemptsLoadedMap.set({
            ...this.applicationQuizAttemptsLoadedMap(),
            [applicationId]: true
          });
        }
      });

    this.candidateInterviewEntityService.getAllByCriteria({
      applicationId,
      isDeleted: false,
      size: 100
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.applicationInterviewsMap.set({
            ...this.applicationInterviewsMap(),
            [applicationId]: this.sortCandidateInterviewsForDisplay(response.content || [])
          });
          this.applicationInterviewsLoadedMap.set({
            ...this.applicationInterviewsLoadedMap(),
            [applicationId]: true
          });
        },
        error: () => {
          this.applicationInterviewsMap.set({
            ...this.applicationInterviewsMap(),
            [applicationId]: []
          });
          this.applicationInterviewsLoadedMap.set({
            ...this.applicationInterviewsLoadedMap(),
            [applicationId]: true
          });
        }
      });
  }

  private hasLoadedQuizRuntime(applicationId: number): boolean {
    return this.applicationQuizAttemptsLoadedMap()[applicationId] === true;
  }

  private hasLoadedInterviewRuntime(applicationId: number): boolean {
    return this.applicationInterviewsLoadedMap()[applicationId] === true;
  }

  private getSortedProgressesForFallback(app: ApplicationWithCampaign): ApplicationProgress[] {
    if (!app.id) {
      return [];
    }

    const progresses = this.applicationProgressMap()[app.id] || [];
    return [...progresses].sort((left, right) => {
      const leftOrder = left.stageOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.stageOrder ?? Number.MAX_SAFE_INTEGER;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return (left.id || 0) - (right.id || 0);
    });
  }

  private getProgressVisualStatus(progressStatus?: string | null): string {
    switch ((progressStatus || '').trim().toUpperCase()) {
      case 'IN_PROGRESS':
        return 'active';
      case 'PASSED':
        return 'completed';
      case 'FAILED':
        return 'rejected';
      case 'SKIPPED':
        return 'skipped';
      case 'PENDING':
      default:
        return 'pending';
    }
  }

  private aggregateFallbackBucketStatus(statuses: string[]): string {
    if (statuses.includes('rejected')) {
      return 'rejected';
    }
    if (statuses.includes('active')) {
      return 'active';
    }
    if (statuses.includes('pending')) {
      return 'pending';
    }
    if (statuses.includes('completed')) {
      return 'completed';
    }
    if (statuses.includes('skipped')) {
      return 'skipped';
    }
    return 'pending';
  }

  private getProgressStageLabel(progress?: ApplicationProgress | null): string {
    if (!progress) {
      return '';
    }

    if (progress.stageName?.trim()) {
      return progress.stageName;
    }

    switch ((progress.stageType || '').trim().toUpperCase()) {
      case 'CANDIDATURE':
        return 'Candidature';
      case 'QUIZ':
      case 'TECHNICAL_TEST':
        return 'Quiz';
      case 'PRESELECTION':
        return 'Pré-sélection';
      case 'INTERVIEW':
        return 'Entretien';
      case 'EVALUATION':
        return 'Évaluation';
      case 'DECISION':
        return 'Décision';
      default:
        return '';
    }
  }

  private getCurrentQuizAttempt(applicationId: number): ApplicationQuizAttemptSummary | null {
    return this.applicationQuizAttemptsMap()[applicationId]?.[0] || null;
  }

  private getCurrentInterview(applicationId: number): CandidateInterviewEntity | null {
    return this.applicationInterviewsMap()[applicationId]?.[0] || null;
  }

  private sortQuizAttemptsForDisplay(attempts: ApplicationQuizAttemptSummary[]): ApplicationQuizAttemptSummary[] {
    return [...attempts].sort((left, right) => {
      const leftTimestamp = this.parseRuntimeTimestamp(left.lastActivityAt || left.completedAt || left.startedAt || left.updatedAt || left.createdAt);
      const rightTimestamp = this.parseRuntimeTimestamp(right.lastActivityAt || right.completedAt || right.startedAt || right.updatedAt || right.createdAt);
      if (leftTimestamp !== rightTimestamp) {
        return rightTimestamp - leftTimestamp;
      }

      return (right.id || 0) - (left.id || 0);
    });
  }

  private sortCandidateInterviewsForDisplay(interviews: CandidateInterviewEntity[]): CandidateInterviewEntity[] {
    const priority: Record<string, number> = {
      STARTED: 0,
      SCHEDULED: 1,
      PENDING: 2,
      OVER: 3,
      PASSED: 3,
      FAILED: 4,
      POSTPONED: 5,
      ARCHIVED: 6
    };

    return [...interviews].sort((left, right) => {
      const leftPriority = priority[(left.interviewStatus || '').toUpperCase()] ?? 99;
      const rightPriority = priority[(right.interviewStatus || '').toUpperCase()] ?? 99;
      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      const leftTimestamp = this.parseRuntimeTimestamp(left.interviewDate || left.interviewStart || left.updatedAt || left.createdAt);
      const rightTimestamp = this.parseRuntimeTimestamp(right.interviewDate || right.interviewStart || right.updatedAt || right.createdAt);
      if (leftTimestamp !== rightTimestamp) {
        return rightTimestamp - leftTimestamp;
      }

      return (right.id || 0) - (left.id || 0);
    });
  }

  private parseRuntimeTimestamp(value?: string | null): number {
    if (!value) {
      return 0;
    }

    const isoTimestamp = Date.parse(value);
    if (!Number.isNaN(isoTimestamp)) {
      return isoTimestamp;
    }

    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!match) {
      return 0;
    }

    const [, day, month, year, hours = '00', minutes = '00', seconds = '00'] = match;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds)
    ).getTime();
  }

  private canPlanifyInterviewForCampaign(campaignId?: number | null): boolean {
  if (this.permissionService.hasAnyPermission(['CREATE_INTERVIEWS', 'UPDATE_INTERVIEWS', 'PLANIFY'])) {
      return true;
    }
    if (!campaignId) {
      return false;
    }
    const access = this.campaignAccessMap()[campaignId];
    return Boolean(access && (access.isAdmin || access.isCreator || access.canPlanify));
  }
}
