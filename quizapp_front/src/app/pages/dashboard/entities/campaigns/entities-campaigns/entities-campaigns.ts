import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntityTemplateComponent } from '../../shared/entity-template.component';

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

  // Gestion des événements émis par le template
  onQuickSearch(value: string) {
    console.log('Recherche rapide campagnes:', value);
    // Logique de filtrage des campagnes
  }

  toggleDeletedUsers() {
    this.showDeletedUsers = !this.showDeletedUsers;
    console.log('Afficher campagnes supprimées:', this.showDeletedUsers);
    // Logique pour afficher/masquer les campagnes supprimées
  }

  openAdvancedSearch() {
    console.log('Ouvrir filtres avancés campagnes');
    // Logique pour ouvrir le panneau de recherche avancée
  }

  createUser() {  // Renommer en createCampaign si souhaité
    console.log('Créer une nouvelle campagne');
    // Logique pour ouvrir le modal de création de campagne
  }
}