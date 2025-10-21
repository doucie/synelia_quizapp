import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Application, ApplicationService } from '../../../core/services/application.service';
import { CampaignService, Campaign } from '../../../core/services/campaign.service';
import { SourceTokenService, SourceToken } from '../../../services/source-token.service';

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
  imports: [CommonModule, FormsModule],
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
  sortOrder = signal<SortOrder>('recent');
  viewMode = signal<ViewMode>('grid');
  showOnlySharedCampaigns = signal(false); // Décochée par défaut
  
  // Signals pour modal CV
  cvPreviewUrl = signal<SafeResourceUrl | null>(null);
  cvPreviewCandidateName = signal<string>('');
  currentCvPath = signal<string>('');

  constructor(
    private applicationService: ApplicationService,
    private campaignService: CampaignService,
    private sourceTokenService: SourceTokenService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
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
    const campaignId = this.selectedCampaign();
    const source = this.selectedSource();
    const sort = this.sortOrder();
    const showOnlyShared = this.showOnlySharedCampaigns();
    const sharedCampaignIds = this.sharedCampaignIds();
    
    // Filtrer par campagnes partagées
    if (showOnlyShared) {
      apps = apps.filter(app => 
        app.campaignId && sharedCampaignIds.has(app.campaignId)
      );
    }
    
    // Filtrer par recherche
    if (query) {
      apps = apps.filter(app => 
        (app.candidateFirstName || '').toLowerCase().includes(query) ||
        (app.candidateLastName || '').toLowerCase().includes(query) ||
        (app.candidateEmail || '').toLowerCase().includes(query) ||
        (app.campaignTitle || '').toLowerCase().includes(query)
      );
    }
    
    // Filtrer par campagne
    if (campaignId !== null) {
      apps = apps.filter(app => app.campaignId === campaignId);
    }
    
    // Filtrer par source
    if (source !== null) {
      apps = apps.filter(app => app.sourceTokenLabel === source);
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
      campaigns: this.campaignService.getMyCampaigns({ size: 100, page: 0 }),
      sharedCampaigns: this.campaignService.getSharedCampaigns(),
      campaignAccesses: this.campaignService.getCampaignAccessesByUser(currentUserId),
      applications: this.applicationService.getApplicationsByCriteria({}),
      sourceTokens: this.sourceTokenService.getSourceTokensByCriteria({})
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (results) => {
        console.log('📦 Données chargées:', {
          campaigns: results.campaigns.content?.length || 0,
          sharedCampaigns: results.sharedCampaigns?.length || 0,
          campaignAccesses: results.campaignAccesses.length || 0,
          applications: results.applications.items?.length || 0,
          sourceTokens: results.sourceTokens.items?.length || 0
        });

        const allCampaigns = [
          ...(results.campaigns.content || []),
          ...(results.sharedCampaigns || [])
        ];
        
        this.followedCampaigns.set(allCampaigns);
        
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
        
        // Enrichir les candidatures avec les infos de campagne
        this.enrichApplications(
          results.applications.items || [],
          results.sourceTokens.items || [],
          allCampaigns
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
   * Change le filtre de campagne
   */
  setSelectedCampaign(campaignId: number | null): void {
    this.selectedCampaign.set(campaignId);
  }

  /**
   * Change le filtre de source
   */
  setSelectedSource(source: string | null): void {
    this.selectedSource.set(source);
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
    this.showOnlySharedCampaigns.set(false); // Retour à l'état par défaut (décochée)
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
