import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SpecialityService, Speciality, SpecialitySearchCriteria, PagedResponse } from '../../../../core/services/speciality.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-entities-specialities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-specialities.html',
  styleUrl: './entities-specialities.scss'
})
export class EntitiesSpecialitiesComponent implements OnInit, OnDestroy {
  // Exposer Math pour utilisation dans le template
  Math = Math;

  // Variable pour éviter les appels multiples
  private loadingTimeout: any;

  // Signaux pour la réactivité
  specialities = signal<Speciality[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(this.getStoredPageSize()); // Utiliser la taille stockée ou 10 par défaut

  // Critères de recherche
  searchCriteria: SpecialitySearchCriteria = {
    idDe: '',
    idA: '',
    nom: '',
    description: '',
    search_string: ''
  };

  // Recherche rapide
  quickSearch = '';

  // État de la recherche avancée
  showAdvancedSearch = false;

  // Contrôle d'affichage des spécialités supprimées
  showDeletedSpecialities = true; // Par défaut, afficher toutes les spécialités

  // Options de pagination avec 10 par défaut
  pageSizeOptions = [5, 10, 20, 50, 100];
  private readonly PAGE_SIZE_STORAGE_KEY = 'entities-specialities-page-size';

  // État de la popup de confirmation
  showDeleteConfirmation = false;
  specialityToDelete: Speciality | null = null;

  // État de la popup de restauration
  showRestoreConfirmation = signal<boolean>(false);
  specialityToRestore = signal<Speciality | null>(null);

  // État de la popup d'édition
  showEditDialog = signal<boolean>(false);
  specialityToEdit = signal<Speciality | null>(null);
  editFormData = {
    id: 0,
    nom: '',
    description: ''
  };

  // Critères de recherche avancée
  advancedCriteria: SpecialitySearchCriteria = {
    idDe: '',
    idA: '',
    nom: '',
    description: '',
    isDeleted: undefined,
    dateCreationDe: '',
    dateCreationA: '',
    dateModificationDe: '',
    dateModificationA: ''
  };

  constructor(
    private specialityService: SpecialityService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSpecialities();
  }

  ngOnDestroy(): void {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  // Récupération de la taille de page stockée
  private getStoredPageSize(): number {
    const stored = localStorage.getItem(this.PAGE_SIZE_STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 10;
  }

  // Stockage de la taille de page
  private storePageSize(size: number): void {
    localStorage.setItem(this.PAGE_SIZE_STORAGE_KEY, size.toString());
  }

  // Chargement des spécialités
  loadSpecialities(): void {
    this.isLoading.set(true);

    // Appliquer les critères de recherche
    const criteria: SpecialitySearchCriteria = {
      ...this.searchCriteria,
      page: this.currentPage(),
      size: this.pageSize(),
      isDeleted: this.showDeletedSpecialities ? undefined : false
    };

    this.specialityService.getAll(criteria).subscribe({
      next: (response: PagedResponse<Speciality>) => {
        this.specialities.set(response.items);
        this.totalElements.set(response.totalElements);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des spécialités:', error);
        this.notificationService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors du chargement des spécialités'
        });
        this.isLoading.set(false);
      }
    });
  }

  // Recherche rapide
  onQuickSearch(): void {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }

    this.loadingTimeout = setTimeout(() => {
      this.searchCriteria.search_string = this.quickSearch;
      this.currentPage.set(0);
      this.loadSpecialities();
    }, 300);
  }

  // Recherche avancée
  onAdvancedSearch(): void {
    this.searchCriteria = { ...this.advancedCriteria };
    this.currentPage.set(0);
    this.loadSpecialities();
    this.showAdvancedSearch = false;
  }

  // Réinitialisation de la recherche
  resetSearch(): void {
    this.searchCriteria = {
      idDe: '',
      idA: '',
      nom: '',
      description: '',
      search_string: ''
    };
    this.quickSearch = '';
    this.advancedCriteria = {
      idDe: '',
      idA: '',
      nom: '',
      description: '',
      isDeleted: undefined,
      dateCreationDe: '',
      dateCreationA: '',
      dateModificationDe: '',
      dateModificationA: ''
    };
    this.currentPage.set(0);
    this.loadSpecialities();
  }

  // Changement de page
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadSpecialities();
  }

  // Changement de taille de page
  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.storePageSize(size);
    this.currentPage.set(0);
    this.loadSpecialities();
  }

  // Changement de taille de page depuis l'événement
  onPageSizeChangeEvent(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const size = parseInt(target.value, 10);
    this.onPageSizeChange(size);
  }

  // Basculement affichage spécialités supprimées
  toggleDeletedSpecialities(): void {
    this.showDeletedSpecialities = !this.showDeletedSpecialities;
    this.currentPage.set(0);
    this.loadSpecialities();
  }

  // Ouverture popup recherche avancée
  openAdvancedSearch(): void {
    this.showAdvancedSearch = true;
  }

  // Fermeture popup recherche avancée
  closeAdvancedSearch(): void {
    this.showAdvancedSearch = false;
  }

  // Ouverture popup d'édition
  openEditDialog(speciality: Speciality): void {
    this.specialityToEdit.set(speciality);
    this.editFormData = {
      id: speciality.id,
      nom: speciality.nom || '',
      description: speciality.description || ''
    };
    this.showEditDialog.set(true);
  }

  // Fermeture popup d'édition
  closeEditDialog(): void {
    this.showEditDialog.set(false);
    this.specialityToEdit.set(null);
  }

  // Sauvegarde des modifications
  saveEdit(): void {
    if (!this.specialityToEdit()) return;

    const updatedSpeciality: Partial<Speciality> = {
      nom: this.editFormData.nom,
      description: this.editFormData.description
    };

    this.specialityService.update(this.specialityToEdit()!.id, updatedSpeciality).subscribe({
      next: (result) => {
        this.notificationService.show({
          type: 'success',
          title: 'Succès',
          message: 'Spécialité mise à jour avec succès'
        });
        this.closeEditDialog();
        this.loadSpecialities();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        this.notificationService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la mise à jour de la spécialité'
        });
      }
    });
  }

  // Ouverture popup de confirmation de suppression
  openDeleteConfirmation(speciality: Speciality): void {
    this.specialityToDelete = speciality;
    this.showDeleteConfirmation = true;
  }

  // Fermeture popup de confirmation de suppression
  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation = false;
    this.specialityToDelete = null;
  }

  // Confirmation de suppression
  confirmDelete(): void {
    if (!this.specialityToDelete) return;

    this.specialityService.delete(this.specialityToDelete.id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'Succès',
          message: 'Spécialité supprimée avec succès'
        });
        this.closeDeleteConfirmation();
        this.loadSpecialities();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.notificationService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la suppression de la spécialité'
        });
      }
    });
  }

  // Ouverture popup de restauration
  openRestoreConfirmation(speciality: Speciality): void {
    this.specialityToRestore.set(speciality);
    this.showRestoreConfirmation.set(true);
  }

  // Fermeture popup de restauration
  closeRestoreConfirmation(): void {
    this.showRestoreConfirmation.set(false);
    this.specialityToRestore.set(null);
  }

  // Confirmation de restauration
  confirmRestore(): void {
    if (!this.specialityToRestore()) return;

    this.specialityService.restore(this.specialityToRestore()!.id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'Succès',
          message: 'Spécialité restaurée avec succès'
        });
        this.closeRestoreConfirmation();
        this.loadSpecialities();
      },
      error: (error) => {
        console.error('Erreur lors de la restauration:', error);
        this.notificationService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la restauration de la spécialité'
        });
      }
    });
  }

  // Navigation retour
  goBackToEntities(): void {
    this.router.navigate(['/dashboard/entities']);
  }

  // Création d'une nouvelle spécialité
  createSpeciality(): void {
    const newSpeciality: Partial<Speciality> = {
      nom: '',
      description: ''
    };

    this.specialityService.create(newSpeciality).subscribe({
      next: (result) => {
        this.notificationService.show({
          type: 'success',
          title: 'Succès',
          message: 'Spécialité créée avec succès'
        });
        this.loadSpecialities();
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        this.notificationService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la création de la spécialité'
        });
      }
    });
  }

  // Fonction trackBy pour optimiser le rendu de la liste
  trackBySpecialityId(index: number, speciality: Speciality): number {
    return speciality.id;
  }

  // Suppression depuis la popup d'édition
  deleteSpecialityFromEdit(): void {
    if (!this.specialityToEdit()) return;

    this.specialityService.delete(this.specialityToEdit()!.id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'Succès',
          message: 'Spécialité supprimée avec succès'
        });
        this.closeEditDialog();
        this.loadSpecialities();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.notificationService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la suppression de la spécialité'
        });
      }
    });
  }

  // Formatage de date
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';

    // Gérer le format DD/MM/YYYY du backend
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        // Convertir DD/MM/YYYY en YYYY-MM-DD pour JavaScript
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        const isoDate = `${year}-${month}-${day}`;
        return new Date(isoDate).toLocaleDateString('fr-FR');
      }
    }

    // Format ISO ou autre
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  // Calcul du nombre total de pages
  get totalPages(): number {
    return Math.ceil(this.totalElements() / this.pageSize());
  }

  // Vérification si on peut aller à la page suivante
  get canGoNext(): boolean {
    return this.currentPage() < this.totalPages - 1;
  }

  // Vérification si on peut aller à la page précédente
  get canGoPrevious(): boolean {
    return this.currentPage() > 0;
  }
}