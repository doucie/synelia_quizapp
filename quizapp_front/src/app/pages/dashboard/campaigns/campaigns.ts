import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';
import { CampaignService, Campaign, CampaignAccessRecord } from '../../../core/services/campaign.service';
import { CampaignStatusFilter, getCampaignStatusClass, getCampaignStatusLabel, matchesCampaignStatusFilter } from '../../../core/constants/campaign-status.constants';
import { PermissionService } from '../../../core/services/permission.service';
import { AuthService } from '../../../core/services/auth/auth.service';

type CampaignTab = 'all' | 'my-campaigns' | 'shared' | 'archived';
type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './campaigns.html',
  styleUrls: ['./campaigns.scss']
})
export class CampaignsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);

  // Signals
  allCampaigns = signal<Campaign[]>([]);
  myCampaigns = signal<Campaign[]>([]);
  sharedCampaigns = signal<Campaign[]>([]);
  archivedCampaigns = signal<Campaign[]>([]);
  campaignAccessMap = signal<Record<number, CampaignAccessRecord>>({});
  loading = signal(false);
  searchQuery = signal('');
  filterStatus = signal<CampaignStatusFilter>('all');
  activeTab = signal<CampaignTab>('all');
  viewMode = signal<ViewMode>('grid');
  expandedCampaignId = signal<number | null>(null);

  constructor(
    private campaignService: CampaignService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCampaigns();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Computed - Campagnes de base selon l'onglet actif et la recherche
   */
  visibleCampaigns = computed(() => {
    const tab = this.activeTab();
    const query = this.searchQuery().toLowerCase();

    let campaigns: Campaign[] = [];
    switch (tab) {
      case 'all':
        campaigns = this.allCampaigns().filter(c => !c.isArchived);
        break;
      case 'my-campaigns':
        campaigns = this.myCampaigns().filter(c => !c.isArchived);
        break;
      case 'shared':
        campaigns = this.sharedCampaigns().filter(c => !c.isArchived);
        break;
      case 'archived':
        campaigns = this.archivedCampaigns();
        break;
    }

    if (query) {
      campaigns = campaigns.filter(campaign =>
        (campaign.campaignTitle || '').toLowerCase().includes(query) ||
        (campaign.campaignDesc || '').toLowerCase().includes(query) ||
        (campaign.specialityLibelle || '').toLowerCase().includes(query)
      );
    }

    campaigns = campaigns.filter(campaign => !campaign.isDeleted);

    return campaigns;
  });

  /**
   * Computed - Campagnes affichées selon l'onglet actif, la recherche et le filtre statut
   */
  displayedCampaigns = computed(() => {
    const status = this.filterStatus();
    const campaigns = this.visibleCampaigns();

    if (status === 'all') {
      return campaigns;
    }

    return campaigns.filter(campaign => matchesCampaignStatusFilter(campaign.campaignStatus, status));
  });

  filteredStatusCount(status: Exclude<CampaignStatusFilter, 'all'>): number {
    return this.visibleCampaigns().filter(campaign => matchesCampaignStatusFilter(campaign.campaignStatus, status)).length;
  }

  currentTabCount = computed(() => this.visibleCampaigns().length);
  allCount = computed(() => this.allCampaigns().filter(c => !c.isArchived).length);
  myCount = computed(() => this.myCampaigns().filter(c => !c.isArchived).length);
  sharedCount = computed(() => this.sharedCampaigns().filter(c => !c.isArchived).length);
  archivedCount = computed(() => this.archivedCampaigns().length);

  activeCount = computed(() => this.filteredStatusCount('active'));
  pendingCount = computed(() => this.filteredStatusCount('pending'));
  closedCount = computed(() => this.filteredStatusCount('closed'));
  canCreateCampaigns = computed(() => this.permissionService.hasPermission('CREATE_CAMPAIGNS'));
  shouldShowCreateAction = computed(() => !this.searchQuery() && this.filterStatus() === 'all' && this.canCreateCampaigns());

  loadCampaigns(): void {
    this.loading.set(true);
    const currentUserId = this.getCurrentUserId();

    forkJoin({
      all: this.campaignService.getAllCampaignsByCriteria({ size: 100, page: 0, isDeleted: false }),
      my: this.campaignService.getMyCampaigns({ size: 100, page: 0, isDeleted: false }),
      shared: this.campaignService.getSharedCampaigns({ isDeleted: false }),
      accesses: currentUserId > 0
        ? this.campaignService.getCampaignAccessesByUser(currentUserId)
        : of([])
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (results) => {
        console.log('📦 Données brutes reçues:', results);

        if (results.all.content && results.all.content.length > 0) {
          console.log('🔍 Exemple de campagne (toutes):', results.all.content[0]);
        }
        if (results.my.content && results.my.content.length > 0) {
          console.log('🔍 Exemple de campagne (mes):', results.my.content[0]);
        }
        if (results.shared && results.shared.length > 0) {
          console.log('🔍 Exemple de campagne (partagées):', results.shared[0]);
        }

        this.allCampaigns.set(results.all.content || []);
        this.myCampaigns.set(results.my.content || []);
        this.sharedCampaigns.set(results.shared || []);
        this.archivedCampaigns.set((results.all.content || []).filter(c => c.isArchived));
        this.campaignAccessMap.set(this.campaignService.buildCampaignAccessMap(results.accesses as CampaignAccessRecord[]));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des campagnes:', error);
        this.loading.set(false);
      }
    });
  }

  setActiveTab(tab: CampaignTab): void {
    this.activeTab.set(tab);
    this.searchQuery.set('');
    this.filterStatus.set('all');
  }

  setFilterStatus(status: CampaignStatusFilter): void {
    this.filterStatus.set(status);
  }

  toggleViewMode(): void {
    this.viewMode.set(this.viewMode() === 'grid' ? 'list' : 'grid');
  }

  refreshCampaigns(): void {
    this.loadCampaigns();
  }

  createNewCampaign(): void {
    if (!this.canCreateCampaigns()) {
      return;
    }

    this.router.navigate(['/dashboard/campaigns/new']);
  }

  getEmptyStateMessage(): string {
    if (this.searchQuery() || this.filterStatus() !== 'all') {
      return 'Aucune campagne ne correspond à vos critères de recherche.';
    }

    if (this.activeTab() === 'my-campaigns') {
      return this.canCreateCampaigns()
        ? 'Vous n\'avez pas encore créé de campagne.'
        : 'Vous n\'avez accès à aucune campagne dont vous êtes propriétaire.';
    }

    if (this.activeTab() === 'shared') {
      return 'Aucune campagne n\'a été partagée avec vous.';
    }

    return this.canCreateCampaigns()
      ? 'Commencez par créer votre première campagne de recrutement.'
      : 'Aucune campagne accessible n\'est disponible pour le moment.';
  }

  getStatusClass(status?: string): string {
    return getCampaignStatusClass(status);
  }

  getStatusLabel(status?: string): string {
    return getCampaignStatusLabel(status);
  }

  formatDate(date?: string): string {
    if (!date) {
      return 'N/A';
    }

    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  isMyCampaign(campaign: Campaign): boolean {
    return this.myCampaigns().some(current => current.id === campaign.id);
  }

  isOwnerCampaign(campaign: Campaign): boolean {
    const access = this.getCampaignAccess(campaign);
    return this.isMyCampaign(campaign) || Boolean(access?.isCreator);
  }

  canEditCampaign(campaign: Campaign): boolean {
    if (this.isOwnerCampaign(campaign)) {
      return true;
    }

    if (this.hasGlobalEditAccess()) {
      return true;
    }

    const access = this.getCampaignAccess(campaign);
    return Boolean(access && (access.isAdmin || access.isCreator || access.canUpdate));
  }

  requiresAdminModeForEdit(campaign: Campaign): boolean {
    return !this.canEditCampaign(campaign) && this.hasAdminModeEditFallback(campaign);
  }

  openCampaignDetails(event: Event, campaignId: number): void {
    event.stopPropagation();
    this.viewCampaignDetails(campaignId);
  }

  openCampaignEdition(event: Event, campaign: Campaign): void {
    event.stopPropagation();

    if (!campaign.id) {
      return;
    }

    if (this.requiresAdminModeForEdit(campaign)) {
      this.viewCampaignDetails(campaign.id);
      return;
    }

    if (!this.canEditCampaign(campaign)) {
      return;
    }

    this.router.navigate(['/dashboard/campaigns', campaign.id, 'edit']);
  }

  getEditActionLabel(campaign: Campaign): string {
    return this.requiresAdminModeForEdit(campaign) ? 'Activer le mode admin' : 'Modifier';
  }

  viewCampaignDetails(campaignId: number): void {
    this.router.navigate(['/dashboard/campaigns', campaignId]);
  }

  toggleCampaignExpansion(event: Event, campaignId: number): void {
    event.stopPropagation();
    this.expandedCampaignId.set(this.expandedCampaignId() === campaignId ? null : campaignId);
  }

  isCampaignExpanded(campaignId: number): boolean {
    return this.expandedCampaignId() === campaignId;
  }

  private getCurrentUserId(): number {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? Number(currentUser.id) || 0 : 0;
  }

  private getCampaignAccess(campaign: Campaign): CampaignAccessRecord | null {
    if (!campaign.id) {
      return null;
    }

    return this.campaignAccessMap()[campaign.id] || null;
  }

  private hasGlobalEditAccess(): boolean {
    return this.permissionService.hasPermission('UPDATE_CAMPAIGNS') && Boolean(this.authService.getCurrentUser()?.adminMode);
  }

  private hasAdminModeEditFallback(_campaign: Campaign): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || currentUser.adminMode) {
      return false;
    }

    return this.permissionService.hasPermission('UPDATE_CAMPAIGNS')
      && ['admin', 'super'].includes((currentUser.role || '').toLowerCase());
  }
}
