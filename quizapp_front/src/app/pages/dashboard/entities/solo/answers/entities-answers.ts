import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AnswerService, Answer, AnswerSearchCriteria, PagedResponse } from '../../../../../core/services/answer.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { AuthService } from '../../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-entities-answers',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  templateUrl: './entities-answers.html',
  styleUrl: './entities-answers.scss'
})
export class EntitiesAnswersComponent implements OnInit, OnDestroy {
  // Exposer Math pour utilisation dans le template
  Math = Math;
  
  // Variable pour éviter les appels multiples
  private loadingTimeout: any;
  
  // Signaux pour la réactivité
  answers = signal<Answer[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  
  // Critères de recherche
  searchCriteria: AnswerSearchCriteria = {
    idDe: '',
    idA: '',
    answerText: '',
    search_string: ''
  };

  // Recherche rapide
  quickSearch = '';
  
  // État de la recherche avancée
  showAdvancedSearch = false;
  
  // Contrôle d'affichage des réponses supprimées
  showDeletedAnswers = true;
  
  // Options de pagination
  pageSizeOptions = [5, 10, 20, 50, 100];
  private readonly PAGE_SIZE_STORAGE_KEY = 'entities-answers-page-size';
  
  // État de la popup de confirmation
  showDeleteConfirmation = false;
  answerToDelete: Answer | null = null;
  
  // État de la popup de restauration
  showRestoreConfirmation = signal<boolean>(false);
  answerToRestore = signal<Answer | null>(null);
  
  // État de la popup d'édition
  showEditDialog = signal<boolean>(false);
  answerToEdit = signal<Answer | null>(null);
  editFormData = {
    id: 0,
    answerText: '',
    questionId: 0,
    displayOrder: 1
  };

  // État de la popup de création
  showCreateDialog = signal<boolean>(false);
  createFormData = {
    answerText: '',
    questionId: 0,
    displayOrder: 1
  };
  
  // Critères de recherche avancée
  advancedCriteria: AnswerSearchCriteria = {
    idDe: '',
    idA: '',
    answerText: '',
    questionId: undefined,
    isDeleted: undefined,
    search_string: ''
  };

  constructor(
    private answerService: AnswerService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('🚀 Initialisation EntitiesAnswersComponent');
    this.initializePageSizePreference();
    
    // Lire le paramètre page depuis l'URL
    this.route.params.subscribe(params => {
      const pageParam = params['page'];
      if (pageParam && !isNaN(+pageParam) && +pageParam > 0) {
        this.currentPage.set(+pageParam - 1);
      } else {
        this.currentPage.set(0);
      }
    });
    
    this.loadAnswers();
  }

  ngOnDestroy() {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  private initializePageSizePreference(): void {
    this.pageSize.set(this.getStoredPageSize());
  }

  private getStoredPageSize(): number {
    try {
      const stored = localStorage.getItem(this.PAGE_SIZE_STORAGE_KEY);
      if (stored) {
        const size = parseInt(stored, 10);
        if (this.pageSizeOptions.includes(size)) {
          return size;
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération de la taille de page:', error);
    }
    return 10;
  }

  private storePageSize(size: number): void {
    try {
      localStorage.setItem(this.PAGE_SIZE_STORAGE_KEY, size.toString());
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde de la taille de page:', error);
    }
  }

  loadAnswers() {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    
    this.loadingTimeout = setTimeout(() => {
      this.performLoadAnswers();
    }, 100);
  }

  private performLoadAnswers() {
    this.isLoading.set(true);
    console.log('📥 Chargement des réponses...');

    const criteria = {
      ...this.searchCriteria,
      page: this.currentPage(),
      size: this.pageSize(),
      isDeleted: this.showDeletedAnswers ? undefined : false
    };

    // Utiliser getAllAnswersByCriteria pour le super admin
    this.answerService.getAllAnswersByCriteria(criteria).subscribe({
      next: (response: PagedResponse<Answer>) => {
        console.log('✅ Réponses reçues:', response);
        this.answers.set(response.content);
        this.totalElements.set(response.totalElements);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des réponses:', error);
        this.notificationService.error('Erreur', 'Erreur lors du chargement des réponses');
        this.isLoading.set(false);
      }
    });
  }

  searchAnswers() {
    console.log('🔍 Recherche avec critères:', this.searchCriteria);
    this.currentPage.set(0);
    this.loadAnswers();
  }

  clearSearch() {
    this.searchCriteria = {
      idDe: '',
      idA: '',
      answerText: '',
      search_string: ''
    };
    this.quickSearch = '';
    this.showAdvancedSearch = false;
    this.resetAdvancedSearch();
    this.searchAnswers();
  }

  createAnswer() {
    this.createFormData = {
      answerText: '',
      questionId: 0,
      displayOrder: 1
    };
    this.showCreateDialog.set(true);
  }

  closeCreateDialog() {
    this.showCreateDialog.set(false);
    this.createFormData = {
      answerText: '',
      questionId: 0,
      displayOrder: 1
    };
  }

  async validateAnswerCreation() {
    const formData = this.createFormData;

    if (!formData.answerText.trim()) {
      this.notificationService.warning('Attention', 'Le texte de la réponse est requis');
      return;
    }

    try {
      const newAnswer: any = await this.answerService.createAnswer({
        answerText: formData.answerText.trim(),
        questionId: formData.questionId,
        displayOrder: formData.displayOrder
      } as Partial<Answer>).toPromise();

      if (newAnswer && newAnswer.hasError) {
        const errorMessage = newAnswer.status?.message || 'Erreur lors de la création';
        this.notificationService.error('Erreur', errorMessage);
        return;
      }

      this.notificationService.success('Succès', 'Réponse créée avec succès');
      this.closeCreateDialog();
      this.loadAnswers();
    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error);
      this.notificationService.error('Erreur', `Erreur lors de la création: ${error?.error?.message || error?.message || 'Erreur inconnue'}`);
    }
  }

  editAnswer(answer: Answer) {
    this.answerToEdit.set(answer);
    this.editFormData = {
      id: answer.id,
      answerText: answer.answerText || '',
      questionId: answer.questionId || 0,
      displayOrder: answer.displayOrder || 1
    };
    this.showEditDialog.set(true);
  }

  closeEditDialog() {
    this.showEditDialog.set(false);
    this.answerToEdit.set(null);
    this.editFormData = {
      id: 0,
      answerText: '',
      questionId: 0,
      displayOrder: 1
    };
  }

  async validateAnswerEdit() {
    const formData = this.editFormData;
    const currentAnswer = this.answerToEdit();
    
    if (!currentAnswer) {
      this.notificationService.error('Erreur', 'Aucune réponse sélectionnée pour modification');
      return;
    }

    if (!formData.answerText.trim()) {
      this.notificationService.warning('Attention', 'Le texte de la réponse est requis');
      return;
    }

    try {
      const updatedAnswer: any = await this.answerService.updateAnswer(currentAnswer.id, {
        id: currentAnswer.id,
        answerText: formData.answerText.trim(),
        questionId: formData.questionId || undefined,
        displayOrder: formData.displayOrder
      }).toPromise();

      if (updatedAnswer && updatedAnswer.hasError) {
        const errorMessage = updatedAnswer.status?.message || 'Erreur lors de la mise à jour';
        this.notificationService.error('Erreur', errorMessage);
        return;
      }

      this.notificationService.success('Succès', 'Réponse modifiée avec succès');
      this.closeEditDialog();
      this.loadAnswers();
    } catch (error: any) {
      console.error('❌ Erreur lors de la modification:', error);
      this.notificationService.error('Erreur', `Erreur lors de la modification: ${error?.error?.message || error?.message || 'Erreur inconnue'}`);
    }
  }

  deleteAnswerFromEdit() {
    const answer = this.answerToEdit();
    if (answer) {
      this.closeEditDialog();
      this.deleteAnswer(answer);
    }
  }

  deleteAnswer(answer: Answer) {
    this.answerToDelete = answer;
    this.showDeleteConfirmation = true;
  }

  confirmDeleteAnswer() {
    if (!this.answerToDelete) return;
    
    this.answerService.deleteAnswer(this.answerToDelete.id).subscribe({
      next: () => {
        this.notificationService.success('Succès', 'Réponse supprimée avec succès');
        
        if (this.answerToDelete) {
          this.answerToDelete.isDeleted = true;
        }
        
        this.showDeletedAnswers = true;
        this.cancelDeleteAnswer();
        this.loadAnswers();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la suppression:', error);
        this.notificationService.error('Erreur', 'Erreur lors de la suppression de la réponse');
        this.cancelDeleteAnswer();
      }
    });
  }

  cancelDeleteAnswer() {
    this.showDeleteConfirmation = false;
    this.answerToDelete = null;
  }

  restoreAnswer(answer: Answer) {
    this.answerToRestore.set(answer);
    this.showRestoreConfirmation.set(true);
  }

  confirmRestoreAnswer() {
    const answerToRestore = this.answerToRestore();
    if (!answerToRestore) return;
    
    this.answerService.restoreAnswer(answerToRestore.id).subscribe({
      next: () => {
        this.notificationService.success('Succès', 'Réponse restaurée avec succès');
        answerToRestore.isDeleted = false;
        this.cancelRestoreAnswer();
        this.loadAnswers();
      },
      error: (error: any) => {
        this.notificationService.error('Erreur', 'Erreur lors de la restauration de la réponse');
        this.cancelRestoreAnswer();
      }
    });
  }

  cancelRestoreAnswer() {
    this.showRestoreConfirmation.set(false);
    this.answerToRestore.set(null);
  }

  // Gestion de la pagination
  goToPage(page: number) {
    this.currentPage.set(page);
    this.router.navigate(['/dashboard/entities/answers', page + 1]);
    this.loadAnswers();
  }

  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newSize = parseInt(target.value, 10);
    this.changePageSize(newSize);
  }

  changePageSize(newSize: number) {
    if (isNaN(newSize) || !this.pageSizeOptions.includes(newSize)) {
      return;
    }
    
    this.pageSize.set(newSize);
    this.storePageSize(newSize);
    this.currentPage.set(0);
    this.loadAnswers();
  }

  toggleDeletedAnswers() {
    this.showDeletedAnswers = !this.showDeletedAnswers;
    this.currentPage.set(0);
    this.loadAnswers();
  }

  goBackToEntities() {
    this.router.navigate(['/dashboard/entities']);
  }

  trackByAnswerId(index: number, answer: Answer): number {
    return answer.id;
  }

  onQuickSearch() {
    this.searchCriteria.answerText = '';
    this.searchCriteria.search_string = this.quickSearch.trim();
    this.showAdvancedSearch = false;
    
    setTimeout(() => {
      this.searchAnswers();
    }, 300);
  }

  openAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  applyAdvancedSearch() {
    this.searchCriteria = { ...this.advancedCriteria };
    this.quickSearch = '';
    this.searchCriteria.search_string = '';
    this.searchAnswers();
  }

  resetAdvancedSearch() {
    this.advancedCriteria = {
      idDe: '',
      idA: '',
      answerText: '',
      questionId: undefined,
      isDeleted: undefined,
      search_string: ''
    };
    this.applyAdvancedSearch();
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalElements() / this.pageSize());
    const pages: number[] = [];
    const currentPage = this.currentPage();
    
    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages, start + 5);
    
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  hasPreviousPage(): boolean {
    return this.currentPage() > 0;
  }

  hasNextPage(): boolean {
    return this.currentPage() < Math.ceil(this.totalElements() / this.pageSize()) - 1;
  }

  previousPage() {
    if (this.hasPreviousPage()) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  nextPage() {
    if (this.hasNextPage()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  truncateText(text: string | undefined, maxLength: number = 50): string {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
