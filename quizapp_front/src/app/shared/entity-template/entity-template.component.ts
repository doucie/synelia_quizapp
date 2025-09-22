import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-entity-template',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './entity-template.component.html',
    styleUrls: ['./entity-template.component.scss']
})
export class EntityTemplateComponent {

    @Input() pageClass: string = 'entity-page'; // Valeur par défaut

    // Propriétés pour le header
    @Input() headerTitle: string = 'Titre de la page';
    @Input() headerDescription: string = 'Description de la page';
    @Input() breadcrumbCurrent: string = 'Page actuelle';
    @Input() showBreadcrumb: boolean = true; // Afficher ou non le fil d'Ariane

    // Méthode pour gérer la navigation retour
    goBack() {
        // Implémentation de la navigation retour
        // Par exemple :
        // this.router.navigate(['/dashboard/entities']);
    }
}