import { Component, signal } from '@angular/core';  // Ajouter signal
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
export class EntitiesCampaignsComponent {
  // Propriétés pour le template (adaptées aux campagnes)
  quickSearch: string = '';
  showDeletedUsers: boolean = false;

  createCampaign() {  // Renommer en createCampaign si souhaité
    console.log('Créer une nouvelle campagne');
    // Logique pour ouvrir le modal de création de campagne
  }

  // État du panneau
  showAdvancedSearch: boolean = false;

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
    // Logique de filtrage des campagnes
  }


  toggleDeletedUsers() {
    this.showDeletedUsers = !this.showDeletedUsers;
    console.log('Afficher campagnes supprimées:', this.showDeletedUsers);
    // Logique pour afficher/masquer les campagnes supprimées
  }

  onAdvancedSearchToggle() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
    console.log('Panneau avancé:', this.showAdvancedSearch);
  }

  onAdvancedSearchApply(criteria: SearchCriteria) {
    this.advancedSearchCriteria = criteria;
    console.log('Appliquer filtres campagnes:', criteria);
    // Logique de filtrage des campagnes
  }

  onAdvancedSearchReset() {
    this.advancedSearchCriteria = {};
    console.log('Filtres campagnes réinitialisés');
  }


  
  // Propriétés pour le tableau
  campaigns = signal<any[]>([
    // Données de test - remplace par tes vraies données
    { id: 1, title: 'Campagne Dev Fullstack', description: 'Recrutement développeurs', status: 'active', startDate: '2024-01-01', endDate: '2024-12-31', maxApplications: 50, isDeleted: false },
    { id: 2, title: 'Campagne Marketing', description: 'Recrutement marketeurs', status: 'draft', startDate: '2024-02-01', endDate: '2024-11-30', maxApplications: 20, isDeleted: false },
  ]);
  isLoading = signal(false);
  currentPage = signal(0);
  pageSize = signal(10);
  totalElements = signal(2);

  // Configuration du tableau
  campaignTableConfig: TableConfig = {
    columns: [
      { key: 'id', label: 'ID', type: 'text', width: '80px' },
      { key: 'title', label: 'Titre', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'status', label: 'Statut', type: 'badge', format: (status: string) => this.getStatusLabel(status) },  // Typer le paramètre
      { key: 'startDate', label: 'Début', type: 'date' },
      { key: 'endDate', label: 'Fin', type: 'date' },
      { key: 'maxApplications', label: 'Max candidatures', type: 'text' },
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
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(0);
    console.log('Taille de page changée:', size);
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
    return this.campaigns().filter((c: any) => c.status === 'draft').length;  // Typer le paramètre
  }

  getClosedCampaignsCount(): number {
    return this.campaigns().filter((c: any) => c.status === 'closed').length;  // Typer le paramètre
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

  deleteCampaign(campaign: any) {  // Déjà typé
    console.log('Supprimer campagne:', campaign);
    // Implémenter la logique de suppression
  }

  restoreCampaign(campaign: any) {  // Déjà typé
    console.log('Restaurer campagne:', campaign);
    // Implémenter la logique de restauration
  }

  // Propriétés pour le modal
  showModal: boolean = false;
  modalConfig: ModalConfig = { title: '', fields: [], submitLabel: '', cancelLabel: '' };
  modalFormData: any = {};

  // Configuration des champs du formulaire
  campaignFormFields: FormField[] = [
    { key: 'id', label: 'ID', type: 'text', readonly: true },
    { key: 'title', label: 'Titre de la campagne', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'status', label: 'Statut', type: 'select', required: true, options: [
      { value: 'active', label: 'Active' },
      { value: 'draft', label: 'Brouillon' },
      { value: 'closed', label: 'Fermée' }
    ]},
    { key: 'startDate', label: 'Date de début', type: 'date', required: true },
    { key: 'endDate', label: 'Date de fin', type: 'date', required: true },
    { key: 'maxApplications', label: 'Nombre max de candidatures', type: 'number' },
  ];

  // Gestion du modal
  onModalClose() {
    this.showModal = false;
    this.modalFormData = {};
  }

  onModalSubmit(formData: any) {
    console.log('Soumission campagne:', formData);
    // Implémenter la logique de sauvegarde
    this.showModal = false;
  }

  onModalDelete() {
    console.log('Suppression campagne:', this.modalFormData);
    // Implémenter la logique de suppression
    this.showModal = false;
  }


}