import { Component, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-entity-template',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './entity-template.component.html',
    styleUrls: ['./entity-template.component.scss']
})
export class EntityTemplateComponent {

    @Input() pageClass: string = 'entity-page'; // Valeur par défaut

    /* =================
     Header
    ================= */
    @Input() headerTitle: string = 'Titre de la page';
    @Input() headerDescription: string = 'Description de la page';
    @Input() breadcrumbCurrent: string = 'Page actuelle';
    @Input() showBreadcrumb: boolean = true; // Afficher ou non le fil d'Ariane

    // Méthode pour gérer la navigation retour
    goBack() {
        // TODO: Implement navigation
        console.log('Go back clicked');
    }

    /* =================
     Toolbar
    ================= */
    @Input() showToolbar: boolean = true;
    @Input() showQuickSearch: boolean = true;
    @Input() quickSearchPlaceholder: string = 'Rechercher...';
    @Input() showDeletedToggle: boolean = false;
    @Input() deletedToggleLabel: string = 'Afficher les éléments supprimés';
    @Input() showAdvancedSearchButton: boolean = true;
    @Input() advancedSearchButtonLabel: string = 'Filtres avancés';
    @Input() showCreateButton: boolean = true;
    @Input() createButtonLabel: string = 'Nouvel élément';

    // Toolbar state inputs (liés depuis le parent)
    @Input() quickSearch: string = '';
    @Input() showDeletedUsers: boolean = false;

    // Toolbar output events
    @Output() quickSearchChange = new EventEmitter<string>();
    @Output() deletedToggleChange = new EventEmitter<boolean>();
    @Output() openAdvancedSearch = new EventEmitter<void>();
    @Output() createItem = new EventEmitter<void>();

    // Méthodes pour émettre les événements
    onQuickSearch(value: string) {
        this.quickSearchChange.emit(value);
    }

    onToggleDeleted() {
        this.showDeletedUsers = !this.showDeletedUsers;
        this.deletedToggleChange.emit(this.showDeletedUsers);
    }

    onOpenAdvancedSearch() {
        this.openAdvancedSearch.emit();
    }

    onCreateItem() {
        this.createItem.emit();
    }
}