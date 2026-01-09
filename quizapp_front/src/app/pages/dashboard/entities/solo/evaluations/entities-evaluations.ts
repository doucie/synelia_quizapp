import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EvaluationService, Evaluation, PagedEvaluationResponse, EvaluationSearchCriteria } from '../../../../../core/services/evaluation.service';

@Component({
  selector: 'app-entities-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-evaluations.html',
  styleUrls: ['./entities-evaluations.scss']
})
export class EntitiesEvaluationsComponent implements OnInit {
  private evaluationService = inject(EvaluationService);
  private router = inject(Router);

  evaluations = signal<Evaluation[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  
  showEditDialog = signal<boolean>(false);
  showCreateDialog = signal<boolean>(false);
  showRestoreConfirmation = signal<boolean>(false);
  evaluationToRestore = signal<Evaluation | null>(null);

  quickSearch = '';
  showAdvancedSearch = false;
  advancedCriteria: EvaluationSearchCriteria = {};
  showDeletedEvaluations = false;
  
  showDeleteConfirmation = false;
  evaluationToDelete: Evaluation | null = null;
  
  editFormData: Evaluation = {};
  createFormData: Partial<Evaluation> = {};

  hasPreviousPage = computed(() => this.currentPage() > 0);
  hasNextPage = computed(() => this.currentPage() < this.totalPages() - 1);

  Math = Math;

  ngOnInit(): void {
    const savedPageSize = localStorage.getItem('entitiesEvaluationsPageSize');
    if (savedPageSize) {
      this.pageSize.set(parseInt(savedPageSize, 10));
    }
    this.loadEvaluations();
  }

  loadEvaluations(): void {
    this.isLoading.set(true);
    
    const criteria: EvaluationSearchCriteria = {
      page: this.currentPage(),
      size: this.pageSize(),
      ...this.advancedCriteria,
      isDeleted: this.showDeletedEvaluations ? undefined : false
    };
    
    if (this.quickSearch && this.quickSearch.trim()) {
      criteria.search_string = this.quickSearch.trim();
    }

    this.evaluationService.getAllEvaluationsByCriteria(criteria).subscribe({
      next: (response: PagedEvaluationResponse) => {
        this.evaluations.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des évaluations:', error);
        this.isLoading.set(false);
      }
    });
  }

  onQuickSearch(): void {
    this.currentPage.set(0);
    this.loadEvaluations();
  }

  openAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  applyAdvancedSearch(): void {
    this.currentPage.set(0);
    this.loadEvaluations();
    this.showAdvancedSearch = false;
  }

  resetAdvancedSearch(): void {
    this.advancedCriteria = {};
    this.quickSearch = '';
    this.currentPage.set(0);
    this.loadEvaluations();
  }

  toggleDeletedEvaluations(): void {
    this.showDeletedEvaluations = !this.showDeletedEvaluations;
    this.currentPage.set(0);
    this.loadEvaluations();
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.currentPage.update(p => p - 1);
      this.loadEvaluations();
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update(p => p + 1);
      this.loadEvaluations();
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadEvaluations();
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newSize = parseInt(select.value, 10);
    this.pageSize.set(newSize);
    localStorage.setItem('entitiesEvaluationsPageSize', newSize.toString());
    this.currentPage.set(0);
    this.loadEvaluations();
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

  trackByEvaluationId(index: number, evaluation: Evaluation): number {
    return evaluation.id || index;
  }

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

  goBackToEntities(): void {
    this.router.navigate(['/dashboard']);
  }

  createEvaluation(): void {
    this.createFormData = {};
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  validateEvaluationCreation(): void {
    this.evaluationService.createEvaluation(this.createFormData as Evaluation, 1).subscribe({
      next: () => {
        this.closeCreateDialog();
        this.loadEvaluations();
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        alert('Erreur lors de la création de l\'évaluation');
      }
    });
  }

  editEvaluation(evaluation: Evaluation): void {
    this.editFormData = { ...evaluation };
    this.showEditDialog.set(true);
  }

  closeEditDialog(): void {
    this.showEditDialog.set(false);
  }

  validateEvaluationEdit(): void {
    this.evaluationService.updateEvaluation(this.editFormData).subscribe({
      next: () => {
        this.closeEditDialog();
        this.loadEvaluations();
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        alert('Erreur lors de la modification de l\'évaluation');
      }
    });
  }

  deleteEvaluation(evaluation: Evaluation): void {
    this.evaluationToDelete = evaluation;
    this.showDeleteConfirmation = true;
  }

  cancelDeleteEvaluation(): void {
    this.evaluationToDelete = null;
    this.showDeleteConfirmation = false;
  }

  confirmDeleteEvaluation(): void {
    if (this.evaluationToDelete?.id) {
      this.evaluationService.deleteEvaluation(this.evaluationToDelete.id).subscribe({
        next: () => {
          this.cancelDeleteEvaluation();
          this.loadEvaluations();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de l\'évaluation');
        }
      });
    }
  }

  deleteEvaluationFromEdit(): void {
    if (this.editFormData.id) {
      this.closeEditDialog();
      this.evaluationToDelete = this.editFormData;
      this.showDeleteConfirmation = true;
    }
  }

  restoreEvaluation(evaluation: Evaluation): void {
    this.evaluationToRestore.set(evaluation);
    this.showRestoreConfirmation.set(true);
  }

  cancelRestoreEvaluation(): void {
    this.evaluationToRestore.set(null);
    this.showRestoreConfirmation.set(false);
  }

  confirmRestoreEvaluation(): void {
    const evaluation = this.evaluationToRestore();
    if (evaluation?.id) {
      this.evaluationService.restoreEvaluation(evaluation.id).subscribe({
        next: () => {
          this.cancelRestoreEvaluation();
          this.loadEvaluations();
        },
        error: (error) => {
          console.error('Erreur lors de la restauration:', error);
          alert('Erreur lors de la restauration de l\'évaluation');
        }
      });
    }
  }
}
