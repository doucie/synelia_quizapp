import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { CampaignService, Campaign } from '../../../core/services/campaign.service';

type CampaignTab = 'all' | 'my-campaigns' | 'shared';

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
    
    // Sélectionner les campagnes selon l'onglet
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
    
    // Filtrer par recherche
    if (query) {
      campaigns = campaigns.filter(campaign => 
        (campaign.campaignTitle || '').toLowerCase().includes(query) ||
        (campaign.campaignDesc || '').toLowerCase().includes(query) ||
        (campaign.specialityLibelle || '').toLowerCase().includes(query)
      );
    }
    
    // Filtrer par statut
    if (status !== 'all') {
      campaigns = campaigns.filter(campaign => 
        (campaign.campaignStatus || 'PENDING').toLowerCase() === status
      );
    }
    
    return campaigns;
  });

  /**
   * Computed - Nombre de campagnes par onglet
   */
  allCount = computed(() => this.allCampaigns().length);
  myCount = computed(() => this.myCampaigns().length);
  sharedCount = computed(() => this.sharedCampaigns().length);

  /**
   * Computed - Statistiques de statut
   */
  activeCount = computed(() => 
    this.displayedCampaigns().filter(c => c.campaignStatus === 'ACTIVE').length
  );
  
  pendingCount = computed(() => 
    this.displayedCampaigns().filter(c => c.campaignStatus === 'PENDING').length
  );
  
  closedCount = computed(() => 
    this.displayedCampaigns().filter(c => c.campaignStatus === 'CLOSED').length
  );

  /**
   * Charge toutes les campagnes
   */
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
        console.log('📊 [CampaignsComponent] Toutes les campagnes:', results.all.content);
        console.log('📊 [CampaignsComponent] Mes campagnes:', results.my.content);
        console.log('📊 [CampaignsComponent] Campagnes partagées:', results.shared);
        
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

  /**
   * Change l'onglet actif
   */
  setActiveTab(tab: CampaignTab): void {
    this.activeTab.set(tab);
    // Réinitialiser les filtres lors du changement d'onglet
    this.searchQuery.set('');
    this.filterStatus.set('all');
  }

  /**
   * Change le filtre de statut
   */
  setFilterStatus(status: 'all' | 'active' | 'pending' | 'closed'): void {
    this.filterStatus.set(status);
  }

  /**
   * Obtient la classe CSS pour le badge de statut
   */
  getStatusClass(status?: string): string {
    switch((status || 'PENDING').toLowerCase()) {
      case 'active': return 'status-active';
      case 'closed': return 'status-closed';
      case 'pending': 
      default: return 'status-pending';
    }
  }

  /**
   * Obtient le libellé du statut
   */
  getStatusLabel(status?: string): string {
    switch((status || 'PENDING').toLowerCase()) {
      case 'active': return 'En cours';
      case 'closed': return 'Terminée';
      case 'pending': 
      default: return 'En attente';
    }
  }

  /**
   * Formatte une date
   */
  formatDate(date?: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Obtient l'icône pour l'accès
   */
  getAccessIcon(campaign: Campaign): string {
    if (campaign.allCanUpdate) {
      return 'public'; // Icône pour accès public (tous les recruteurs)
    }
    
    // Vérifier si la campagne est dans "mes campagnes"
    if (this.isMyCampaign(campaign)) {
      return 'person'; // Icône pour créateur
    }
    
    return 'group'; // Icône pour accès partagé
  }

  /**
   * Vérifie si une campagne appartient à l'utilisateur
   */
  isMyCampaign(campaign: Campaign): boolean {
    return this.myCampaigns().some(c => c.id === campaign.id);
  }

  /**
   * Obtient le tooltip pour l'accès
   */
  getAccessTooltip(campaign: Campaign): string {
    if (campaign.allCanUpdate) {
      return 'Tous les recruteurs peuvent modifier';
    }
    
    const isMyCampaign = this.myCampaigns().some(c => c.id === campaign.id);
    if (isMyCampaign) {
      return 'Vous êtes le créateur';
    }
    
    return 'Accès partagé';
  }

  /**
   * Navigation vers les détails d'une campagne
   */
  viewCampaignDetails(campaignId: number): void {
    this.router.navigate(['/dashboard/campaigns', campaignId]);
  }

  /**
   * Rafraîchit la liste des campagnes
   */
  refreshCampaigns(): void {
    this.loadCampaigns();
  }
}
