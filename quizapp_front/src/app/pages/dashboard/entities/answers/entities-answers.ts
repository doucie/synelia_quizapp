import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService, User, UserSearchCriteria, PagedResponse } from '../../../../core/services/user.service';
import { QuestionService, Question, QuestionSearchCriteria } from '../../../../core/services/question.service';
import { AnswerService, Answer, AnswerSearchCriteria } from '../../../../core/services/answer.service';
import { NotificationService } from '../../../../core/services/notification.service';

// Interface pour les critères de recherche avancés des réponses
export interface AnswerAdvancedSearchCriteria extends AnswerSearchCriteria {
  // Champs supplémentaires pour la recherche avancée
}

@Component({
  selector: 'app-entities-answers',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  questions = signal<Question[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(this.getStoredPageSize()); // Utiliser la taille stockée ou 10 par défaut

  // Critères de recherche
  searchCriteria: AnswerSearchCriteria = {
    idDe: '',
    idA: '',
    answerText: '',
    questionId: undefined,
    isCorrect: undefined,
    search_string: ''
  };

  // Recherche rapide
  quickSearch = '';

  // État de la recherche avancée
  showAdvancedSearch = false;

  // Contrôle d'affichage des réponses supprimées
  showDeletedAnswers = true; // Par défaut, afficher toutes les réponses

  // Options de pagination avec 10 par défaut
  pageSizeOptions = [5, 10, 20, 50, 100];
  private readonly PAGE_SIZE_STORAGE_KEY = 'entities-answers-page-size';

  // État des modals
  showModal = false;
  showDeleteModal = false;
  showRestoreModal = false;
  isEditing = false;

  // Données du formulaire
  currentAnswer: Answer = {
    id: 0,
    answerText: '',
    questionId: undefined,
    isCorrect: false,
    displayOrder: 1
  };

  // Critères de recherche avancée
  advancedCriteria: AnswerAdvancedSearchCriteria = {
    idDe: '',
    idA: '',
    answerText: '',
    questionId: undefined,
    isCorrect: undefined,
    isDeleted: undefined,
    search_string: ''
  };

  constructor(
    private userService: UserService,
    private questionService: QuestionService,
    private answerService: AnswerService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('🚀 Initialisation EntitiesAnswersComponent');
    console.log('📦 Taille de page au démarrage:', this.pageSize());
    this.loadQuestions();
    this.loadAnswers();
  }

  ngOnDestroy() {
    // Nettoyer le timeout s'il existe
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  /**
   * Récupère la taille de page stockée dans le localStorage
   */
  private getStoredPageSize(): number {
    try {
      const stored = localStorage.getItem(this.PAGE_SIZE_STORAGE_KEY);
      console.log('🔍 Valeur dans le cache:', stored);
      if (stored) {
        const size = parseInt(stored, 10);
        // Vérifier que la valeur est valide
        if (this.pageSizeOptions.includes(size)) {
          console.log('✅ Taille de page récupérée du cache:', size);
          return size;
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération de la taille de page:', error);
    }
    console.log('📋 Utilisation de la valeur par défaut: 10');
    return 10; // Valeur par défaut
  }

  /**
   * Stocke la taille de page dans le localStorage
   */
  private storePageSize(size: number): void {
    try {
      const key = this.PAGE_SIZE_STORAGE_KEY;
      const value = size.toString();
      console.log('💾 AVANT sauvegarde - clé:', key, 'valeur:', value);

      localStorage.setItem(key, value);

      // Vérification immédiate
      const stored = localStorage.getItem(key);
      console.log('🔍 APRÈS sauvegarde - valeur lue:', stored);
      console.log('📦 Taille de page sauvegardée dans le cache:', size);
    } catch (error) {
      console.warn('❌ Erreur lors de la sauvegarde de la taille de page:', error);
    }
  }

  /**
   * Charge la liste des questions pour les filtres
   */
  loadQuestions() {
    this.questionService.getAllQuestions().subscribe({
      next: (questions) => {
        this.questions.set(questions);
        console.log('✅ Questions chargées pour les filtres:', questions.length);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des questions:', error);
        this.questions.set([]);
      }
    });
  }

  /**
   * Charge la liste des réponses
   */
  loadAnswers() {
    // Annuler le timeout précédent s'il existe
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }

    // Débounce pour éviter les appels multiples rapides
    this.loadingTimeout = setTimeout(() => {
      this.performLoadAnswers();
    }, 100);
  }

  /**
   * Exécute réellement le chargement des réponses
   */
  private performLoadAnswers() {
    this.isLoading.set(true);
    console.log(`📥 Chargement des réponses...`);
    console.log('🔍 Critères de recherche utilisés:', this.searchCriteria);

    // Préparer les critères avec la pagination
    const criteria: AnswerSearchCriteria = {
      ...this.searchCriteria,
      size: this.pageSize(),
      page: this.currentPage(),
      isDeleted: this.showDeletedAnswers ? undefined : false
    };

    this.answerService.getAllAnswersByCriteria(criteria).subscribe({
      next: (response) => {
        console.log('✅ Réponses chargées:', response.content.length);
        this.answers.set(response.content);
        this.totalElements.set(response.totalElements);
        this.isLoading.set(false);

        console.log('🎯 État final après chargement:');
        console.log('- Nombre de réponses affichées:', this.answers().length);
        console.log('- Total des réponses:', this.totalElements());
        console.log('- Page actuelle:', this.currentPage());
        console.log('- Taille de page:', this.pageSize());
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des réponses:', error);
        this.answers.set([]);
        this.totalElements.set(0);
        this.isLoading.set(false);
        this.notificationService.error('Erreur', 'Impossible de charger les réponses');
      }
    });
  }

  /**
   * Recherche rapide utilisant search_string
   */
  onQuickSearch() {
    console.log('🔍 onQuickSearch appelée');
    console.log('🔍 Valeur de quickSearch AVANT trim:', this.quickSearch);
    console.log('🔍 Valeur de quickSearch APRÈS trim:', this.quickSearch.trim());

    // Réinitialiser les critères de recherche individuels
    this.searchCriteria.idDe = '';
    this.searchCriteria.idA = '';
    this.searchCriteria.answerText = '';
    this.searchCriteria.questionId = undefined;
    this.searchCriteria.isCorrect = undefined;
    this.searchCriteria.isDeleted = undefined;

    // Utiliser search_string pour la recherche globale
    this.searchCriteria.search_string = this.quickSearch.trim();

    console.log('🔍 Valeur assignée à searchCriteria.search_string:', this.searchCriteria.search_string);
    console.log('🔍 searchCriteria complet:', this.searchCriteria);

    // Fermer la recherche avancée si elle était ouverte
    this.showAdvancedSearch = false;

    // Remettre à la première page
    this.currentPage.set(0);

    // Débounce pour éviter trop de requêtes
    setTimeout(() => {
      this.loadAnswers();
    }, 300);
  }

  /**
   * Bascule l'affichage des réponses supprimées
   */
  toggleDeletedAnswers() {
    this.showDeletedAnswers = !this.showDeletedAnswers;
    console.log('🔄 Basculement affichage réponses supprimées:', this.showDeletedAnswers);
    this.currentPage.set(0); // Remettre à la première page
    this.loadAnswers();
  }

  /**
   * Ouvre/ferme la recherche avancée
   */
  openAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
    console.log('🔍 Recherche avancée:', this.showAdvancedSearch ? 'ouverte' : 'fermée');
  }

  /**
   * Applique les filtres avancés
   */
  applyAdvancedSearch() {
    console.log('🎯 Application des filtres avancés:', this.advancedCriteria);
    this.searchCriteria = { ...this.advancedCriteria };

    // Vider la recherche rapide quand on applique les filtres avancés
    this.quickSearch = '';

    this.currentPage.set(0); // Remettre à la première page
    this.loadAnswers();
    this.showAdvancedSearch = false;
  }

  /**
   * Réinitialise tous les filtres de recherche
   */
  clearSearch() {
    this.searchCriteria = {
      idDe: '',
      idA: '',
      answerText: '',
      questionId: undefined,
      isCorrect: undefined,
      search_string: ''
    };
    this.quickSearch = '';
    this.showAdvancedSearch = false;
    this.resetAdvancedSearch();
    this.currentPage.set(0);
    this.loadAnswers();
  }

  /**
   * Réinitialise les filtres avancés
   */
  resetAdvancedSearch() {
    console.log('🔄 Réinitialisation des filtres avancés');
    this.advancedCriteria = {
      idDe: '',
      idA: '',
      answerText: '',
      questionId: undefined,
      isCorrect: undefined,
      isDeleted: undefined,
      search_string: ''
    };
    this.searchCriteria = { ...this.advancedCriteria };
    this.currentPage.set(0);
    this.loadAnswers();
  }

  /**
   * Change la taille de page
   */
  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newSize = parseInt(target.value, 10);
    console.log('📏 Changement de taille de page:', newSize);

    this.pageSize.set(newSize);
    this.storePageSize(newSize); // Sauvegarder dans le localStorage
    this.currentPage.set(0); // Remettre à la première page
    this.loadAnswers();
  }

  /**
   * Va à une page spécifique
   */
  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      console.log('📄 Aller à la page:', page);
      this.currentPage.set(page);
      this.loadAnswers();
    }
  }

  /**
   * Calcule le nombre total de pages
   */
  totalPages(): number {
    return Math.ceil(this.totalElements() / this.pageSize());
  }

  /**
   * Génère les numéros de pages pour la pagination
   */
  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalElements() / this.pageSize());
    const pages: number[] = [];
    const currentPage = this.currentPage();

    // Afficher au maximum 5 pages autour de la page courante
    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages, start + 5);

    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Vérifie s'il y a une page précédente
   */
  hasPreviousPage(): boolean {
    return this.currentPage() > 0;
  }

  /**
   * Vérifie s'il y a une page suivante
   */
  hasNextPage(): boolean {
    return this.currentPage() < Math.ceil(this.totalElements() / this.pageSize()) - 1;
  }

  /**
   * Va à la page précédente
   */
  previousPage() {
    if (this.hasPreviousPage()) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  /**
   * Va à la page suivante
   */
  nextPage() {
    if (this.hasNextPage()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  /**
   * TrackBy function pour optimiser le rendu de la liste
   */
  trackByAnswerId(index: number, answer: Answer): number {
    return answer.id;
  }

  /**
   * Retourne aux entités
   */
  goBackToEntities() {
    console.log('⬅️ Retour aux entités');
    this.router.navigate(['/dashboard/entities']);
  }

  /**
   * Ouvre le modal de création
   */
  createAnswer() {
    console.log('➕ Ouverture modal création réponse');
    this.isEditing = false;
    this.currentAnswer = {
      id: 0,
      answerText: '',
      questionId: undefined,
      isCorrect: false,
      displayOrder: 1
    };
    this.showModal = true;
  }

  /**
   * Ouvre le modal d'édition
   */
  editAnswer(answer: Answer) {
    console.log('✏️ Ouverture modal édition réponse:', answer);
    this.isEditing = true;
    this.currentAnswer = { ...answer };
    this.showModal = true;
  }

  /**
   * Ferme le modal
   */
  closeModal() {
    console.log('❌ Fermeture modal');
    this.showModal = false;
    this.currentAnswer = {
      id: 0,
      answerText: '',
      questionId: undefined,
      isCorrect: false,
      displayOrder: 1
    };
  }

  /**
   * Sauvegarde la réponse
   */
  saveAnswer() {
    console.log('💾 Sauvegarde réponse:', this.currentAnswer);

    if (!this.currentAnswer.answerText?.trim()) {
      console.error('Le texte de la réponse est requis');
      this.notificationService.error('Erreur de validation', 'Le texte de la réponse est requis');
      return;
    }

    if (!this.currentAnswer.questionId) {
      console.error('La question associée est requise');
      this.notificationService.error('Erreur de validation', 'La question associée est requise');
      return;
    }

    if (this.currentAnswer.isCorrect === undefined) {
      console.error('Le statut correct/incorrect est requis');
      this.notificationService.error('Erreur de validation', 'Le statut correct/incorrect est requis');
      return;
    }

    // Validation avec le service
    const validation = this.answerService.validateAnswer(this.currentAnswer);
    if (!validation.isValid) {
      console.error('Erreurs de validation:', validation.errors);
      this.notificationService.error('Erreur de validation', validation.errors.join(', '));
      return;
    }

    // Désactiver le bouton de sauvegarde pendant le traitement
    this.isLoading.set(true);

    // Nettoyer les données
    const cleanAnswer = this.answerService.sanitizeAnswer(this.currentAnswer);

    const saveObservable = this.isEditing
      ? this.answerService.updateAnswer(cleanAnswer.id, cleanAnswer)
      : this.answerService.createAnswer(cleanAnswer);

    saveObservable.subscribe({
      next: (response) => {
        if (this.isEditing) {
          console.log('✅ Réponse modifiée avec succès:', response);
          this.notificationService.success('Succès', 'Réponse modifiée avec succès');
        } else {
          console.log('✅ Réponse créée avec succès:', response);
          this.notificationService.success('Succès', 'Réponse créée avec succès');
        }

        this.closeModal();
        this.loadAnswers();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        this.isLoading.set(false);
        const errorMessage = this.isEditing ? 'Erreur lors de la modification' : 'Erreur lors de la création';
        this.notificationService.error('Erreur', errorMessage);
      }
    });
  }

  /**
   * Supprime la réponse depuis la popup d'édition
   */
  deleteAnswerFromEdit() {
    const answer = this.currentAnswer;
    if (answer && answer.id > 0) {
      this.closeModal();
      this.deleteAnswer(answer);
    }
  }

  /**
   * Ouvre le modal de confirmation de suppression
   */
  deleteAnswer(answer: Answer) {
    console.log('🗑️ Ouverture modal suppression réponse:', answer);
    this.currentAnswer = answer;
    this.showDeleteModal = true;
  }

  /**
   * Ferme le modal de suppression
   */
  closeDeleteModal() {
    console.log('❌ Fermeture modal suppression');
    this.showDeleteModal = false;
    this.currentAnswer = {
      id: 0,
      answerText: '',
      questionId: undefined,
      isCorrect: false,
      displayOrder: 1
    };
  }

  /**
   * Confirme la suppression
   */
  confirmDelete() {
    console.log('✅ Confirmation suppression réponse:', this.currentAnswer);

    if (!this.currentAnswer || !this.currentAnswer.id) {
      console.error('❌ Aucune réponse sélectionnée pour la suppression');
      this.notificationService.error('Erreur', 'Aucune réponse sélectionnée');
      return;
    }

    // Vérifier les données associées avant suppression
    this.answerService.checkAssociatedData(this.currentAnswer.id).subscribe({
      next: (checkResult) => {
        if (!checkResult.canDelete && checkResult.associatedCount > 0) {
          console.warn('⚠️ Impossible de supprimer: données associées');
          this.notificationService.error(
            'Suppression impossible',
            `Cette réponse a ${checkResult.associatedCount} donnée(s) associée(s).`
          );
          this.closeDeleteModal();
          return;
        }

        // Procéder à la suppression
        this.isLoading.set(true);
        this.answerService.deleteAnswer(this.currentAnswer.id).subscribe({
          next: () => {
            console.log('✅ Réponse supprimée avec succès:', this.currentAnswer);
            this.notificationService.success('Succès', 'Réponse supprimée avec succès');
            this.closeDeleteModal();
            this.loadAnswers();
          },
          error: (error) => {
            console.error('❌ Erreur lors de la suppression:', error);
            this.isLoading.set(false);
            this.notificationService.error('Erreur', 'Erreur lors de la suppression');
          }
        });
      },
      error: (error) => {
        console.error('❌ Erreur lors de la vérification des associations:', error);
        this.notificationService.error('Erreur', 'Impossible de vérifier les associations');
        this.closeDeleteModal();
      }
    });
  }

  /**
   * Ferme le modal de restauration
   */
  closeRestoreModal() {
    console.log('❌ Fermeture modal restauration');
    this.showRestoreModal = false;
    this.currentAnswer = {
      id: 0,
      answerText: '',
      questionId: undefined,
      isCorrect: false,
      displayOrder: 1
    };
  }

  /**
   * Confirme la restauration
   */
  confirmRestore() {
    console.log('✅ Confirmation restauration réponse:', this.currentAnswer);

    if (!this.currentAnswer || !this.currentAnswer.id) {
      console.error('❌ Aucune réponse sélectionnée pour la restauration');
      this.notificationService.error('Erreur', 'Aucune réponse sélectionnée');
      return;
    }

    // Désactiver le bouton pendant la restauration
    this.isLoading.set(true);

    this.answerService.restoreAnswer(this.currentAnswer.id).subscribe({
      next: (response) => {
        console.log('✅ Réponse restaurée avec succès:', response);
        this.notificationService.success('Succès', 'Réponse restaurée avec succès');
        this.closeRestoreModal();
        this.loadAnswers();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la restauration:', error);
        this.isLoading.set(false);
        this.notificationService.error('Erreur', 'Erreur lors de la restauration');
      }
    });
  }

  /**
   * Restaure une réponse supprimée
   */
  restoreAnswer(answer: Answer) {
    console.log('♻️ Ouverture modal restauration pour:', answer);
    this.currentAnswer = { ...answer };
    this.showRestoreModal = true;
  }

  /**
   * Obtient le texte de la question associée à une réponse
   */
  getQuestionText(answer: Answer): string {
    const question = this.questions().find(q => q.id === answer.questionId);
    return question?.questionText || 'Question inconnue';
  }

  /**
   * Obtient le texte de la question courante
   */
  getCurrentQuestionText(): string {
    return this.getQuestionText(this.currentAnswer);
  }

  /**
   * Vérifie la longueur du texte de la réponse
   */
  getAnswerTextLength(answer: Answer): number {
    return answer.answerText?.length || 0;
  }

  /**
   * Vérifie la longueur du texte de la réponse courante
   */
  getCurrentAnswerTextLength(): number {
    return this.currentAnswer.answerText?.length || 0;
  }

  // Getters pour éviter les erreurs TypeScript dans les templates

  /**
   * Getter pour la page actuelle (pour éviter les erreurs TypeScript)
   */
  get currentPageValue(): number {
    return this.currentPage();
  }

  /**
   * Getter pour la taille de page (pour éviter les erreurs TypeScript)
   */
  get pageSizeValue(): number {
    return this.pageSize();
  }

  /**
   * Getter pour le nombre total d'éléments (pour éviter les erreurs TypeScript)
   */
  get totalElementsValue(): number {
    return this.totalElements();
  }

  /**
   * Calcule l'index de départ pour la pagination
   */
  get paginationStartIndex(): number {
    return (this.currentPageValue * this.pageSizeValue) + 1;
  }

  /**
   * Calcule l'index de fin pour la pagination
   */
  get paginationEndIndex(): number {
    return Math.min((this.currentPageValue + 1) * this.pageSizeValue, this.totalElementsValue);
  }

  /**
   * Obtient le nombre de réponses correctes
   */
  getCorrectAnswersCount(): number {
    return this.answers().filter(answer => answer.isCorrect).length;
  }

  /**
   * Obtient le nombre de réponses incorrectes
   */
  getIncorrectAnswersCount(): number {
    return this.answers().filter(answer => !answer.isCorrect).length;
  }
}