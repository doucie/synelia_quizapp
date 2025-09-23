import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntityTemplateComponent } from '../../shared/entity-template.component';
import { SearchField, SearchCriteria } from '../../shared/models/search.model';

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

}