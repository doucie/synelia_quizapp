import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { CampaignService, Campaign } from '../../../core/services/campaign.service';

type CampaignTab = 'all' | 'my-campaigns' | 'shared';
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
  
  // Signals
  allCampaigns = signal<Campaign[]>([]);
  myCampaigns = signal<Campaign[]>([]);
  sharedCampaigns = signal<Campaign[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  filterStatus = signal<'all' | 'active' | 'pending' | 'closed'>('all');
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
   * Computed - Campagnes affichées selon l'onglet actif
   */
  displayedCampaigns = computed(() => {
    const tab = this.activeTab();
    const query = this.searchQuery().toLowerCase();
    const status = this.filterStatus();
    
    let campaigns: Campaign[] = [];
    switch(tab) {
      case 'all':
        campaigns = this.allCampaigns();
        break;
      case 'my-campaigns':
        campaigns = this.myCampaigns();
        break;
      case 'shared':
        campaigns = this.sharedCampaigns();
        break;
    }
    
    if (query) {
      campaigns = campaigns.filter(campaign => 
        (campaign.campaignTitle || '').toLowerCase().includes(query) ||
        (campaign.campaignDesc || '').toLowerCase().includes(query) ||
        (campaign.specialityLibelle || '').toLowerCase().includes(query)
      );
    }
    
    if (status !== 'all') {
      campaigns = campaigns.filter(campaign => 
        (campaign.campaignStatus || 'PENDING').toLowerCase() === status
      );
    }
    
    return campaigns;
  });

  allCount = computed(() => this.allCampaigns().length);
  myCount = computed(() => this.myCampaigns().length);
  sharedCount = computed(() => this.sharedCampaigns().length);

  activeCount = computed(() => 
    this.displayedCampaigns().filter(c => c.campaignStatus === 'ACTIVE').length
  );
  
  pendingCount = computed(() => 
    this.displayedCampaigns().filter(c => c.campaignStatus === 'PENDING').length
  );
  
  closedCount = computed(() => 
    this.displayedCampaigns().filter(c => c.campaignStatus === 'CLOSED').length
  );

  loadCampaigns(): void {
    this.loading.set(true);
    
    forkJoin({
      all: this.campaignService.getAllCampaignsByCriteria({ size: 100, page: 0 }),
      my: this.campaignService.getMyCampaigns({ size: 100, page: 0 }),
      shared: this.campaignService.getSharedCampaigns()
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

  setFilterStatus(status: 'all' | 'active' | 'pending' | 'closed'): void {
    this.filterStatus.set(status);
  }

  toggleViewMode(): void {
    this.viewMode.set(this.viewMode() === 'grid' ? 'list' : 'grid');
  }

  getStatusClass(status?: string): string {
    switch((status || 'PENDING').toLowerCase()) {
      case 'active': return 'status-active';
      case 'closed': return 'status-closed';
      case 'pending': 
      default: return 'status-pending';
    }
  }

  getStatusLabel(status?: string): string {
    switch((status || 'PENDING').toLowerCase()) {
      case 'active': return 'En cours';
      case 'closed': return 'Terminée';
      case 'pending': 
      default: return 'En attente';
    }
  }

  formatDate(date?: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getApplicationsCount(campaign: Campaign): number {
    return 0; // À implémenter selon la structure de Campaign
  }

  isMyCampaign(campaign: Campaign): boolean {
    return this.myCampaigns().some(c => c.id === campaign.id);
  }

  viewCampaignDetails(campaignId: number): void {
    this.router.navigate(['/dashboard/campaigns', campaignId]);
  }

  toggleCampaignExpansion(event: Event, campaignId: number): void {
    event.stopPropagation();
    if (this.expandedCampaignId() === campaignId) {
      this.expandedCampaignId.set(null);
    } else {
      this.expandedCampaignId.set(campaignId);
    }
  }

  isCampaignExpanded(campaignId: number): boolean {
    return this.expandedCampaignId() === campaignId;
  }

  refreshCampaigns(): void {
    this.loadCampaigns();
  }

  createNewCampaign(): void {
    this.router.navigate(['/dashboard/campaigns/new']);
  }
}
