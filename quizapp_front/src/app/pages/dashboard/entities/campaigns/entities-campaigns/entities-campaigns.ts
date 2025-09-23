import { Component, signal, inject, OnInit } from '@angular/core';  // Ajouter signal
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampaignService, Campaign, CampaignSearchCriteria } from '../../../../../core/services/campaign.service';  // Adapter le chemin
import { EntityTemplateComponent } from '../../shared/entity-template.component';
import {
  SearchField,
  SearchCriteria,
  TableColumn,
  TableAction,
  TableConfig,
  PaginationInfo,
  StatsInfo,
  ModalConfig,
  FormField
} from '../../shared/models/search.model';

@Component({
  selector: 'app-entities-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityTemplateComponent],
  templateUrl: './entities-campaigns.html',
  styleUrl: './entities-campaigns.scss'
})
export class EntitiesCampaignsComponent implements OnInit {
  // Injection du service
  private campaignService = inject(CampaignService);
  // Propriétés pour le template (adaptées aux campagnes)
  quickSearch: string = '';
  showDeletedUsers: boolean = false;

  createCampaign() {
    this.showModal = true;
    this.modalConfig = {
      title: 'Création d\'une nouvelle campagne',
      fields: this.campaignFormFields,
      submitLabel: 'Créer la campagne',
      cancelLabel: 'Annuler',
      showDeleteButton: false
    };
    this.modalFormData = {};
  }

  // État du panneau
  showAdvancedSearch: boolean = false;

  // État du modal
  showModal: boolean = false;
  modalConfig: ModalConfig | null = null;
  modalFormData: any = {};

  // Getter pour modalConfig qui retourne une valeur par défaut si null
  get safeModalConfig(): ModalConfig {
    return this.modalConfig || {
      title: '',
      fields: [],
      submitLabel: '',
      cancelLabel: ''
    };
  }

  // Configuration des champs du formulaire modal
  campaignFormFields: FormField[] = [
    { key: 'campaignTitle', label: 'Titre de la campagne', type: 'text', required: true },
    { key: 'campaignDesc', label: 'Description', type: 'textarea' },
    { key: 'campaignStatus', label: 'Statut', type: 'select', required: true, options: [
      { value: 'draft', label: 'Brouillon' },
      { value: 'active', label: 'Active' },
      { value: 'closed', label: 'Fermée' }
    ]},
    { key: 'campaignStart', label: 'Date de début', type: 'date' },
    { key: 'campaignEnd', label: 'Date de fin', type: 'date' },
    { key: 'maxApply', label: 'Nombre max de candidatures', type: 'number' }
  ];

  // Configuration des champs
  campaignSearchFields: SearchField[] = [
    { key: 'campaignTitle', label: 'Titre de la campagne', type: 'text', placeholder: 'Rechercher par titre' },
    { key: 'campaignStatus', label: 'Statut', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'draft', label: 'Brouillon' },
      { value: 'closed', label: 'Fermée' }
    ]},
    { key : 'campaignDateRang', label: 'Période de la campagne', type: 'date_range'},
    { key: 'maxApply', label: 'Nombre max de candidatures', type: 'range', placeholder: 'candidatures' },
  ];

  advancedSearchCriteria: SearchCriteria = {};

  // Gestion des événements émis par le template
  onQuickSearch(value: string) {
    this.quickSearch = value;
    console.log('Recherche rapide campagnes:', value);
    this.currentPage.set(0); // Reset to first page
    this.loadCampaigns();
  }


  toggleDeletedUsers() {
    this.showDeletedUsers = !this.showDeletedUsers;
    console.log('Afficher campagnes supprimées:', this.showDeletedUsers);
    this.currentPage.set(0); // Reset to first page
    this.loadCampaigns();
  }

  onAdvancedSearchToggle() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
    console.log('Panneau avancé:', this.showAdvancedSearch);
  }

  onAdvancedSearchApply(criteria: SearchCriteria) {
    this.advancedSearchCriteria = criteria;
    console.log('Appliquer filtres campagnes:', criteria);

    // Convertir les critères frontend vers le format backend
    const backendCriteria: CampaignSearchCriteria = {
      campaignTitle: criteria['campaignTitle'],
      campaignStatus: criteria['campaignStatus'],
      campaignStartDe: criteria['campaignDateRang']?.start,
      campaignStartA: criteria['campaignDateRang']?.end,
      maxApply: criteria['maxApply'],
      page: 0, // Reset to first page
      size: this.pageSize(),
      search_string: this.quickSearch || undefined,
      isDeleted: this.showDeletedUsers ? undefined : false
    };

    this.currentPage.set(0);
    this.loadCampaigns(backendCriteria);
  }

  onAdvancedSearchReset() {
    this.advancedSearchCriteria = {};
    console.log('Filtres campagnes réinitialisés');
    this.currentPage.set(0);
    this.loadCampaigns();
  }


  
  // Propriétés pour le tableau
  campaigns = signal<Campaign[]>([]);
  isLoading = signal(false);
  currentPage = signal(0);
  pageSize = signal(10);
  totalElements = signal(0);

  ngOnInit() {
    this.loadCampaigns();
  }

  // Charger les campagnes depuis l'API
  loadCampaigns(criteria?: CampaignSearchCriteria) {
    this.isLoading.set(true);
    const searchCriteria: CampaignSearchCriteria = {
      page: this.currentPage(),
      size: this.pageSize(),
      search_string: this.quickSearch || undefined,
      isDeleted: this.showDeletedUsers ? undefined : false,
      ...criteria
    };

    console.log('🚀 Loading campaigns with criteria:', searchCriteria);

    this.campaignService.getByCriteria(searchCriteria).subscribe({
      next: (response) => {
        console.log('✅ Campaigns loaded successfully:', response);
        console.log('✅ Content length:', response.content?.length);
        console.log('✅ First campaign:', response.content?.[0]);

        // Filtrer côté frontend si nécessaire
        let filteredContent = response.content;
        if (!this.showDeletedUsers) {
          filteredContent = response.content.filter(campaign => !campaign.isDeleted);
          console.log('✅ Filtered content (non-deleted only):', filteredContent.length);
        }

        this.campaigns.set(filteredContent);
        this.totalElements.set(response.totalElements);
        this.isLoading.set(false);
        console.log('✅ Campaigns signal updated:', this.campaigns());
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des campagnes:', error);
        this.campaigns.set([]);
        this.totalElements.set(0);
        this.isLoading.set(false);
      }
    });
  }

  // Configuration du tableau
  campaignTableConfig: TableConfig = {
    columns: [
      { key: 'id', label: 'ID', type: 'text', width: '80px' },
      { key: 'campaignTitle', label: 'Titre', type: 'text' },
      { key: 'campaignDesc', label: 'Description', type: 'text' },
      { key: 'campaignStatus', label: 'Statut', type: 'badge', format: (status: string) => this.getStatusLabel(status) },
      { key: 'campaignStart', label: 'Début', type: 'date' },
      { key: 'campaignEnd', label: 'Fin', type: 'date' },
      { key: 'maxApply', label: 'Max candidatures', type: 'text' },
      { key: 'actions', label: 'Actions', type: 'actions' }
    ],
    actions: [
      {
        key: 'edit',
        label: 'Modifier la campagne',
        icon: 'M12 20H21 M16.5 3.5A2.12 2.12 0 0 1 19 6L7 18L3 19L4 15L16.5 3.5Z',
        class: 'primary',
        condition: (campaign: any) => !campaign.isDeleted  // Typer le paramètre
      },
      {
        key: 'delete',
        label: 'Supprimer la campagne',
        icon: 'M3 6H5H21 M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6H19Z M10 11V17 M14 11V17',
        class: 'danger',
        condition: (campaign: any) => !campaign.isDeleted  // Typer le paramètre
      },
      {
        key: 'restore',
        label: 'Restaurer la campagne',
        icon: 'M3 12A9 9 0 1 0 12 3 L8 7L12 11',
        class: 'success',
        condition: (campaign: any) => campaign.isDeleted  // Typer le paramètre
      }
    ],
    trackBy: 'id',
    emptyState: {
      title: 'Aucune campagne trouvée',
      message: 'Aucune campagne ne correspond aux critères de recherche actuels.',
      icon: 'M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21 M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.6977C21.7033 16.0414 20.9994 15.5752 20.2 15.3742 M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55332C18.7122 5.25594 19.0078 6.11684 19.0078 7.005C19.0078 7.89316 18.7122 8.75406 18.1676 9.45668C17.623 10.1593 16.8604 10.6597 16 10.88'
    }
  };

  // Informations de pagination
  get paginationInfo(): PaginationInfo {
    return {
      currentPage: this.currentPage(),
      totalElements: this.totalElements(),
      pageSize: this.pageSize(),
      totalPages: Math.ceil(this.totalElements() / this.pageSize())
    };
  }

  // Informations de statistiques
  get statsInfo(): StatsInfo {
    return {
      total: this.totalElements(),
      active: this.getActiveCampaignsCount(),
      draft: this.getDraftCampaignsCount(),
      closed: this.getClosedCampaignsCount()
    };
  }

  // Méthodes pour le tableau
  onTableAction(event: { action: string; item: any }) {
    const { action, item } = event;
    switch (action) {
      case 'edit':
        this.editCampaign(item);
        break;
      case 'delete':
        this.deleteCampaign(item);
        break;
      case 'restore':
        this.restoreCampaign(item);
        break;
    }
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    console.log('Page changée:', page);
    this.loadCampaigns();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(0);
    console.log('Taille de page changée:', size);
    this.loadCampaigns();
  }

  // Méthodes utilitaires
  getStatusLabel(status: string): string {  // Typer le paramètre
    const labels: { [key: string]: string } = {
      'active': 'Active',
      'draft': 'Brouillon',
      'closed': 'Fermée'
    };
    return labels[status] || status;
  }

  getActiveCampaignsCount(): number {
    return this.campaigns().filter((c: any) => c.status === 'active').length;  // Typer le paramètre
  }

  getDraftCampaignsCount(): number {
    return this.campaigns().filter((c: Campaign) => c.campaignStatus === 'draft').length;
  }

  getClosedCampaignsCount(): number {
    return this.campaigns().filter((c: Campaign) => c.campaignStatus === 'closed').length;
  }

  // Méthodes pour les campagnes (à implémenter avec l'API)
  editCampaign(campaign: any) {  // Déjà typé
    this.showModal = true;
    this.modalConfig = {
      title: 'Modification de la campagne',
      fields: this.campaignFormFields,
      submitLabel: 'Valider les modifications',
      cancelLabel: 'Annuler',
      showDeleteButton: true,
      deleteLabel: 'Supprimer la campagne'
    };
    this.modalFormData = { ...campaign };
  }

  deleteCampaign(campaign: Campaign) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la campagne "${campaign.campaignTitle}" ?`)) {
      this.campaignService.delete(campaign.id).subscribe({
        next: () => {
          console.log('Campagne supprimée:', campaign.id);
          this.loadCampaigns(); // Recharger la liste
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de la campagne');
        }
      });
    }
  }

  restoreCampaign(campaign: Campaign) {
    const updateData = { ...campaign, isDeleted: false };
    this.campaignService.update(campaign.id, updateData).subscribe({
      next: () => {
        console.log('Campagne restaurée:', campaign.id);
        this.loadCampaigns(); // Recharger la liste
      },
      error: (error) => {
        console.error('Erreur lors de la restauration:', error);
        alert('Erreur lors de la restauration de la campagne');
      }
    });
  }

  // Gestion du modal
  onModalClose() {
    this.showModal = false;
    this.modalFormData = {};
    this.modalConfig = null;
  }

  onModalSubmit(formData: any) {
    console.log('Soumission campagne:', formData);

    if (formData.id) {
      // Modification
      this.campaignService.update(formData.id, formData).subscribe({
        next: () => {
          console.log('Campagne modifiée:', formData.id);
          this.loadCampaigns();
          this.onModalClose();
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          alert('Erreur lors de la modification de la campagne');
        }
      });
    } else {
      // Création
      this.campaignService.create(formData).subscribe({
        next: () => {
          console.log('Campagne créée');
          this.loadCampaigns();
          this.onModalClose();
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          alert('Erreur lors de la création de la campagne');
        }
      });
    }
  }

  onModalDelete() {
    if (this.modalFormData?.id) {
      this.deleteCampaign(this.modalFormData);
      this.onModalClose();
    }
  }
}