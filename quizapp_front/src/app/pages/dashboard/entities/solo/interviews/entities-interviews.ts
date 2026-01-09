import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InterviewService, Interview, PagedInterviewResponse, InterviewSearchCriteria } from '../../../../../core/services/interview.service';

@Component({
  selector: 'app-entities-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-interviews.html',
  styleUrls: ['./entities-interviews.scss']
})
export class EntitiesInterviewsComponent implements OnInit {
  private interviewService = inject(InterviewService);
  private router = inject(Router);

  // Signaux pour les données
  interviews = signal<Interview[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  
  // Signaux pour les dialogues
  showEditDialog = signal<boolean>(false);
  showCreateDialog = signal<boolean>(false);
  showRestoreConfirmation = signal<boolean>(false);
  interviewToRestore = signal<Interview | null>(null);

  // Recherche rapide
  quickSearch = '';
  
  // Filtres avancés
  showAdvancedSearch = false;
  advancedCriteria: InterviewSearchCriteria = {};
  
  // Afficher les interviews supprimées
  showDeletedInterviews = false;
  
  // Suppression
  showDeleteConfirmation = false;
  interviewToDelete: Interview | null = null;
  
  // Formulaire d'édition
  editFormData: Interview = {
    interviewType: 'ONLINE'
  };
  
  // Formulaire de création
  createFormData: Partial<Interview> = {
    interviewType: 'ONLINE',
    interviewStatus: 'PENDING'
  };

  // Signaux calculés
  hasPreviousPage = computed(() => this.currentPage() > 0);
  hasNextPage = computed(() => this.currentPage() < this.totalPages() - 1);

  // Référence à Math pour le template
  Math = Math;

  ngOnInit(): void {
    const savedPageSize = localStorage.getItem('entitiesInterviewsPageSize');
    if (savedPageSize) {
      this.pageSize.set(parseInt(savedPageSize, 10));
    }
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.isLoading.set(true);
    
    const criteria: InterviewSearchCriteria = {
      page: this.currentPage(),
      size: this.pageSize(),
      ...this.advancedCriteria,
      isDeleted: this.showDeletedInterviews ? undefined : false
    };
    
    if (this.quickSearch && this.quickSearch.trim()) {
      criteria.search_string = this.quickSearch.trim();
    }

    this.interviewService.getAllInterviewsByCriteria(criteria).subscribe({
      next: (response: PagedInterviewResponse) => {
        this.interviews.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des interviews:', error);
        this.isLoading.set(false);
      }
    });
  }

  onQuickSearch(): void {
    this.currentPage.set(0);
    this.loadInterviews();
  }

  openAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  applyAdvancedSearch(): void {
    this.currentPage.set(0);
    this.loadInterviews();
    this.showAdvancedSearch = false;
  }

  resetAdvancedSearch(): void {
    this.advancedCriteria = {};
    this.quickSearch = '';
    this.currentPage.set(0);
    this.loadInterviews();
  }

  toggleDeletedInterviews(): void {
    this.showDeletedInterviews = !this.showDeletedInterviews;
    this.currentPage.set(0);
    this.loadInterviews();
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.currentPage.update(p => p - 1);
      this.loadInterviews();
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update(p => p + 1);
      this.loadInterviews();
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadInterviews();
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newSize = parseInt(select.value, 10);
    this.pageSize.set(newSize);
    localStorage.setItem('entitiesInterviewsPageSize', newSize.toString());
    this.currentPage.set(0);
    this.loadInterviews();
  }

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

  trackByInterviewId(index: number, interview: Interview): number {
    return interview.id || index;
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return date;
    }
  }

  goBackToEntities(): void {
    this.router.navigate(['/dashboard']);
  }

  createInterview(): void {
    this.createFormData = {
      interviewType: 'ONLINE',
      interviewStatus: 'PENDING'
    };
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  validateInterviewCreation(): void {
    if (!this.createFormData.interviewType) {
      alert('Veuillez sélectionner un type d\'entretien');
      return;
    }

    this.interviewService.createInterview(this.createFormData as Interview).subscribe({
      next: () => {
        this.closeCreateDialog();
        this.loadInterviews();
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        alert('Erreur lors de la création de l\'entretien');
      }
    });
  }

  editInterview(interview: Interview): void {
    this.editFormData = { ...interview };
    this.showEditDialog.set(true);
  }

  closeEditDialog(): void {
    this.showEditDialog.set(false);
  }

  validateInterviewEdit(): void {
    this.interviewService.updateInterview(this.editFormData).subscribe({
      next: () => {
        this.closeEditDialog();
        this.loadInterviews();
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        alert('Erreur lors de la modification de l\'entretien');
      }
    });
  }

  deleteInterview(interview: Interview): void {
    this.interviewToDelete = interview;
    this.showDeleteConfirmation = true;
  }

  cancelDeleteInterview(): void {
    this.interviewToDelete = null;
    this.showDeleteConfirmation = false;
  }

  confirmDeleteInterview(): void {
    if (this.interviewToDelete?.id) {
      this.interviewService.deleteInterview(this.interviewToDelete.id).subscribe({
        next: () => {
          this.cancelDeleteInterview();
          this.loadInterviews();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de l\'entretien');
        }
      });
    }
  }

  deleteInterviewFromEdit(): void {
    if (this.editFormData.id) {
      this.closeEditDialog();
      this.interviewToDelete = this.editFormData;
      this.showDeleteConfirmation = true;
    }
  }

  restoreInterview(interview: Interview): void {
    this.interviewToRestore.set(interview);
    this.showRestoreConfirmation.set(true);
  }

  cancelRestoreInterview(): void {
    this.interviewToRestore.set(null);
    this.showRestoreConfirmation.set(false);
  }

  confirmRestoreInterview(): void {
    const interview = this.interviewToRestore();
    if (interview?.id) {
      this.interviewService.restoreInterview(interview.id).subscribe({
        next: () => {
          this.cancelRestoreInterview();
          this.loadInterviews();
        },
        error: (error) => {
          console.error('Erreur lors de la restauration:', error);
          alert('Erreur lors de la restauration de l\'entretien');
        }
      });
    }
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return '-';
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'SCHEDULED': 'Planifié',
      'STARTED': 'En cours',
      'OVER': 'Terminé',
      'PASSED': 'Réussi',
      'FAILED': 'Échoué',
      'POSTPONED': 'Reporté',
      'ARCHIVED': 'Archivé'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    const classes: Record<string, string> = {
      'PENDING': 'status-pending',
      'SCHEDULED': 'status-scheduled',
      'STARTED': 'status-started',
      'OVER': 'status-over',
      'PASSED': 'status-passed',
      'FAILED': 'status-failed',
      'POSTPONED': 'status-postponed',
      'ARCHIVED': 'status-archived'
    };
    return classes[status] || '';
  }

  getTypeLabel(type: string | undefined): string {
    if (!type) return '-';
    const labels: Record<string, string> = {
      'ONLINE': 'En ligne',
      'IN_PERSON': 'En personne'
    };
    return labels[type] || type;
  }
}
