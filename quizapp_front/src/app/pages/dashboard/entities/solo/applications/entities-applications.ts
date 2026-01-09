import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApplicationService, Application, PagedApplicationResponse, ApplicationSearchCriteria } from '../../../../../core/services/application.service';

@Component({
  selector: 'app-entities-applications',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  templateUrl: './entities-applications.html',
  styleUrl: './entities-applications.scss'
})
export class EntitiesApplicationsComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private router = inject(Router);

  // Signaux pour les données
  applications = signal<Application[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  
  // Signaux pour les dialogues
  showEditDialog = signal<boolean>(false);
  showCreateDialog = signal<boolean>(false);
  showRestoreConfirmation = signal<boolean>(false);
  applicationToRestore = signal<Application | null>(null);

  // Recherche rapide
  quickSearch = '';
  
  // Filtres avancés
  showAdvancedSearch = false;
  advancedCriteria: ApplicationSearchCriteria = {};
  
  // Afficher les applications supprimées
  showDeletedApplications = false;
  
  // Suppression
  showDeleteConfirmation = false;
  applicationToDelete: Application | null = null;
  
  // Formulaire d'édition
  editFormData: Application = {
    candidateFirstName: '',
    candidateLastName: '',
    candidateEmail: '',
    candidatePhone: '',
    candidateBirthDate: ''
  };
  
  // Formulaire de création
  createFormData: Partial<Application> = {
    candidateFirstName: '',
    candidateLastName: '',
    candidateEmail: '',
    candidatePhone: '',
    candidateBirthDate: ''
  };

  // Signaux calculés
  hasPreviousPage = computed(() => this.currentPage() > 0);
  hasNextPage = computed(() => this.currentPage() < this.totalPages() - 1);

  // Référence à Math pour le template
  Math = Math;

  ngOnInit(): void {
    // Récupérer la taille de page depuis le localStorage
    const savedPageSize = localStorage.getItem('entitiesApplicationsPageSize');
    if (savedPageSize) {
      this.pageSize.set(parseInt(savedPageSize, 10));
    }
    this.loadApplications();
  }

  /**
   * Charge les applications
   */
  loadApplications(): void {
    this.isLoading.set(true);
    
    const criteria: ApplicationSearchCriteria = {
      page: this.currentPage(),
      size: this.pageSize(),
      ...this.advancedCriteria,
      isDeleted: this.showDeletedApplications ? undefined : false
    };
    
    // Ajouter la recherche rapide
    if (this.quickSearch && this.quickSearch.trim()) {
      criteria.search_string = this.quickSearch.trim();
    }

    this.applicationService.getAllApplicationsByCriteria(criteria).subscribe({
      next: (response: PagedApplicationResponse) => {
        this.applications.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des applications:', error);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Recherche rapide
   */
  onQuickSearch(): void {
    this.currentPage.set(0);
    this.loadApplications();
  }

  /**
   * Ouvre/ferme le panneau de recherche avancée
   */
  openAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  /**
   * Applique la recherche avancée
   */
  applyAdvancedSearch(): void {
    this.currentPage.set(0);
    this.loadApplications();
    this.showAdvancedSearch = false;
  }

  /**
   * Réinitialise la recherche avancée
   */
  resetAdvancedSearch(): void {
    this.advancedCriteria = {};
    this.quickSearch = '';
    this.currentPage.set(0);
    this.loadApplications();
  }

  /**
   * Toggle l'affichage des applications supprimées
   */
  toggleDeletedApplications(): void {
    this.showDeletedApplications = !this.showDeletedApplications;
    this.currentPage.set(0);
    this.loadApplications();
  }

  /**
   * Navigation vers la page précédente
   */
  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.currentPage.update(p => p - 1);
      this.loadApplications();
    }
  }

  /**
   * Navigation vers la page suivante
   */
  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update(p => p + 1);
      this.loadApplications();
    }
  }

  /**
   * Va à une page spécifique
   */
  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadApplications();
  }

  /**
   * Changement de taille de page
   */
  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newSize = parseInt(select.value, 10);
    this.pageSize.set(newSize);
    localStorage.setItem('entitiesApplicationsPageSize', newSize.toString());
    this.currentPage.set(0);
    this.loadApplications();
  }

  /**
   * Génère les numéros de page à afficher
   */
  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  /**
   * Track by pour la liste
   */
  trackByApplicationId(index: number, app: Application): number {
    return app.id || index;
  }

  /**
   * Formate une date
   */
  formatDate(date: string | undefined): string {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return date;
    }
  }

  /**
   * Tronque le texte
   */
  truncateText(text: string | undefined, maxLength: number): string {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  /**
   * Retour aux entités
   */
  goBackToEntities(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Ouvre le dialogue de création
   */
  createApplication(): void {
    this.createFormData = {
      candidateFirstName: '',
      candidateLastName: '',
      candidateEmail: '',
      candidatePhone: '',
      candidateBirthDate: ''
    };
    this.showCreateDialog.set(true);
  }

  /**
   * Ferme le dialogue de création
   */
  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  /**
   * Valide la création
   */
  validateApplicationCreation(): void {
    if (!this.createFormData.candidateFirstName || !this.createFormData.candidateLastName || 
        !this.createFormData.candidateEmail || !this.createFormData.candidatePhone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.applicationService.createApplication(this.createFormData as Application).subscribe({
      next: () => {
        this.closeCreateDialog();
        this.loadApplications();
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        alert('Erreur lors de la création de l\'application');
      }
    });
  }

  /**
   * Ouvre le dialogue d'édition
   */
  editApplication(app: Application): void {
    this.editFormData = { ...app };
    this.showEditDialog.set(true);
  }

  /**
   * Ferme le dialogue d'édition
   */
  closeEditDialog(): void {
    this.showEditDialog.set(false);
  }

  /**
   * Valide la modification
   */
  validateApplicationEdit(): void {
    this.applicationService.updateApplication(this.editFormData).subscribe({
      next: () => {
        this.closeEditDialog();
        this.loadApplications();
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        alert('Erreur lors de la modification de l\'application');
      }
    });
  }

  /**
   * Ouvre la confirmation de suppression
   */
  deleteApplication(app: Application): void {
    this.applicationToDelete = app;
    this.showDeleteConfirmation = true;
  }

  /**
   * Annule la suppression
   */
  cancelDeleteApplication(): void {
    this.applicationToDelete = null;
    this.showDeleteConfirmation = false;
  }

  /**
   * Confirme la suppression
   */
  confirmDeleteApplication(): void {
    if (this.applicationToDelete?.id) {
      this.applicationService.deleteApplication(this.applicationToDelete.id).subscribe({
        next: () => {
          this.cancelDeleteApplication();
          this.loadApplications();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de l\'application');
        }
      });
    }
  }

  /**
   * Supprime depuis le dialogue d'édition
   */
  deleteApplicationFromEdit(): void {
    if (this.editFormData.id) {
      this.closeEditDialog();
      this.applicationToDelete = this.editFormData;
      this.showDeleteConfirmation = true;
    }
  }

  /**
   * Ouvre la confirmation de restauration
   */
  restoreApplication(app: Application): void {
    this.applicationToRestore.set(app);
    this.showRestoreConfirmation.set(true);
  }

  /**
   * Annule la restauration
   */
  cancelRestoreApplication(): void {
    this.applicationToRestore.set(null);
    this.showRestoreConfirmation.set(false);
  }

  /**
   * Confirme la restauration
   */
  confirmRestoreApplication(): void {
    const app = this.applicationToRestore();
    if (app?.id) {
      this.applicationService.restoreApplication(app.id).subscribe({
        next: () => {
          this.cancelRestoreApplication();
          this.loadApplications();
        },
        error: (error) => {
          console.error('Erreur lors de la restauration:', error);
          alert('Erreur lors de la restauration de l\'application');
        }
      });
    }
  }

  /**
   * Retourne le label du statut
   */
  getStatusLabel(status: string | undefined): string {
    if (!status) return '-';
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'PENDING_ARCHIVED': 'En attente (archivé)',
      'SUBMITTED': 'Soumis',
      'PRE_SCREEN_ACCEPTED': 'Pré-sélectionné',
      'PRE_SCREEN_REJECTED': 'Pré-rejeté',
      'PRE_SCREEN_REJECTED_ARCHIVED': 'Pré-rejeté (archivé)',
      'INTERVIEWING': 'En entretien',
      'FINAL_ACCEPTED': 'Accepté',
      'FINAL_ACCEPTED_ARCHIVED': 'Accepté (archivé)',
      'FINAL_REJECTED': 'Rejeté',
      'FINAL_REJECTED_ARCHIVED': 'Rejeté (archivé)'
    };
    return labels[status] || status;
  }

  /**
   * Retourne la classe CSS du statut
   */
  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    const classes: Record<string, string> = {
      'PENDING': 'status-pending',
      'PENDING_ARCHIVED': 'status-pending-archived',
      'SUBMITTED': 'status-submitted',
      'PRE_SCREEN_ACCEPTED': 'status-prescreen-accepted',
      'PRE_SCREEN_REJECTED': 'status-prescreen-rejected',
      'PRE_SCREEN_REJECTED_ARCHIVED': 'status-prescreen-rejected-archived',
      'INTERVIEWING': 'status-interviewing',
      'FINAL_ACCEPTED': 'status-final-accepted',
      'FINAL_ACCEPTED_ARCHIVED': 'status-final-accepted-archived',
      'FINAL_REJECTED': 'status-final-rejected',
      'FINAL_REJECTED_ARCHIVED': 'status-final-rejected-archived'
    };
    return classes[status] || '';
  }
}
