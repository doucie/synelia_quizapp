import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Application, ApplicationService } from '../../../core/services/application.service';
import { CampaignService, Campaign } from '../../../core/services/campaign.service';
import { SourceTokenService, SourceToken } from '../../../services/source-token.service';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';

type SortOrder = 'recent' | 'oldest';
type ViewMode = 'grid' | 'list';

interface ApplicationWithCampaign extends Application {
  campaignTitle?: string;
  campaignId?: number;
  sourceTokenLabel?: string;
}

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, ClickOutsideDirective],
  templateUrl: './applications.html',
  styleUrl: './applications.scss'
})
export class ApplicationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Signals
  applications = signal<ApplicationWithCampaign[]>([]);
  followedCampaigns = signal<Campaign[]>([]);
  sharedCampaignIds = signal<Set<number>>(new Set());
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
  
  // Signals pour modal CV
  cvPreviewUrl = signal<SafeResourceUrl | null>(null);
  cvPreviewCandidateName = signal<string>('');
  currentCvPath = signal<string>('');

  constructor(
    private applicationService: ApplicationService,
    private campaignService: CampaignService,
    private sourceTokenService: SourceTokenService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
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
      }
    });
    
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.applications().filter(a => a.applicationStatus === 'PENDING' || !a.applicationStatus).length
  );
  
  verifiedApplications = computed(() => 
    this.applications().filter(a => a.emailVerified === true).length
  );
  
  completedQuizApplications = computed(() => 
    this.applications().filter(a => a.quizStatus === 'COMPLETED').length
  );

  /**
   * Charge les données
   */
  loadData(): void {
    this.loading.set(true);
    
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
      allCampaigns: this.campaignService.getAllCampaignsByCriteria({ size: 1000, page: 0 }),
      myCampaigns: this.campaignService.getMyCampaigns({ size: 100, page: 0 }),
      sharedCampaigns: this.campaignService.getSharedCampaigns(),
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
        
        // Extraire les IDs des campagnes où l'utilisateur a au moins un droit
        const sharedIds = new Set<number>();
        results.campaignAccesses.forEach((access: any) => {
          const campaignId = access.campaignId || access.campaigns_id;
          const hasAnyRight = 
            access.canUpdate || access.can_update ||
            access.canDelete || access.can_delete ||
            access.canEvaluate || access.can_evaluate ||
            access.isAdmin || access.is_admin;
          
          if (campaignId && hasAnyRight) {
            sharedIds.add(campaignId);
            console.log(`✅ Campagne ${campaignId} accessible (au moins un droit)`, {
              canUpdate: access.canUpdate || access.can_update,
              canDelete: access.canDelete || access.can_delete,
              canEvaluate: access.canEvaluate || access.can_evaluate,
              isAdmin: access.isAdmin || access.is_admin
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
   * Obtient le statut d'une étape de progression
   * @param applicationStatus Le statut de la candidature
   * @param step Numéro de l'étape (1: Candidature, 2: Pré-sélection, 3: Final)
   * @returns 'pending' | 'active' | 'completed' | 'rejected' | 'archived'
   */
  getStepStatus(applicationStatus: string = 'PENDING', step: number): string {
    const status = applicationStatus.toUpperCase();
    
    // Étape 1: Candidature (PENDING → SUBMITTED)
    if (step === 1) {
      if (status === 'PENDING') return 'active';
      if (status === 'PENDING_ARCHIVED') return 'archived';
      // Si on est au-delà de PENDING, c'est completed
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
   * Obtient le texte du tooltip pour une étape de progression
   * @param applicationStatus Le statut de la candidature
   * @param step Numéro de l'étape (1: Candidature, 2: Pré-sélection, 3: Final)
   * @returns Le texte descriptif du tooltip
   */
  getStepTooltip(applicationStatus: string = 'PENDING', step: number): string {
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
      const date = new Date(dateString);
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
      'SCHEDULED': 'Planifié',
      'CONFIRMED': 'Confirmé',
      'COMPLETED': 'Effectué',
      'CANCELLED': 'Annulé',
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
      'SCHEDULED': 'interview-scheduled',
      'CONFIRMED': 'interview-confirmed',
      'COMPLETED': 'interview-completed',
      'CANCELLED': 'interview-cancelled',
      'NO_SHOW': 'interview-no-show',
      'PENDING': 'interview-pending'
    };
    
    return statusMap[status] || 'interview-pending';
  }

  /**
   * Vérifie si on peut planifier un entretien pour cette candidature
   * Conditions: application_status = PRE_SCREEN_ACCEPTED && pas d'interview
   */
  canScheduleInterview(app: ApplicationWithCampaign): boolean {
    // Peut planifier un entretien si :
    // - La candidature est soumise (SUBMITTED) ou pré-sélection acceptée (PRE_SCREEN_ACCEPTED)
    // - Pas d'entretien déjà planifié
    const validStatuses = ['SUBMITTED', 'PRE_SCREEN_ACCEPTED'];
    return validStatuses.includes(app.applicationStatus || '') && !app.interviewDate;
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
    this.router.navigate(['/dashboard/interview-new'], {
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
  viewApplicationDetails(applicationId: number): void {
    this.router.navigate(['/dashboard/candidates', applicationId]);
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
   * Toggle le filtre des campagnes partagées
   */
  toggleSharedCampaignsFilter(): void {
    this.showOnlySharedCampaigns.set(!this.showOnlySharedCampaigns());
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
}
