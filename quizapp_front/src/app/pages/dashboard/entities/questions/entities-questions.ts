import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService, User, UserSearchCriteria, PagedResponse } from '../../../../core/services/user.service';
import { DepartmentService, Department, DepartmentSearchCriteria } from '../../../../core/services/department.service';
import { QuestionService, Question, QuestionSearchCriteria } from '../../../../core/services/question.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-entities-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-questions.html',
  styleUrl: './entities-questions.scss'
})
export class EntitiesQuestionsComponent implements OnInit, OnDestroy {
  // Exposer Math pour utilisation dans le template
  Math = Math;

  // Variable pour éviter les appels multiples
  private loadingTimeout: any;

  // Signaux pour la réactivité
  questions = signal<Question[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(this.getStoredPageSize()); // Utiliser la taille stockée ou 10 par défaut

  // Liste des spécialités pour les filtres
  specialities: Department[] = [];

  // Critères de recherche
  searchCriteria: QuestionSearchCriteria = {
    idDe: '',
    idA: '',
    questionText: '',
    specialityId: undefined,
    questionType: '',
    difficultyLevel: '',
    search_string: ''
  };

  // Recherche rapide
  quickSearch = '';

  // État de la recherche avancée
  showAdvancedSearch = false;

  // Contrôle d'affichage des questions supprimées
  showDeletedQuestions = true; // Par défaut, afficher toutes les questions

  // Options de pagination avec 10 par défaut
  pageSizeOptions = [5, 10, 20, 50, 100];
  private readonly PAGE_SIZE_STORAGE_KEY = 'entities-questions-page-size';

  // État des modals
  showModal = false;
  showDeleteModal = false;
  showRestoreModal = false;
  isEditing = false;

  // Données du formulaire
  currentQuestion: Question = {
    id: 0,
    questionText: '',
    specialityId: undefined,
    questionType: '',
    difficultyLevel: '',
    points: 0,
    timeLimit: 0
  };

  // Critères de recherche avancée
  advancedCriteria: QuestionSearchCriteria = {
    idDe: '',
    idA: '',
    questionText: '',
    specialityId: undefined,
    questionType: '',
    difficultyLevel: '',
    isDeleted: undefined,
    search_string: ''
  };

  constructor(
    private userService: UserService,
    private departmentService: DepartmentService,
    private questionService: QuestionService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('🚀 Initialisation EntitiesQuestionsComponent');
    console.log('📦 Taille de page au démarrage:', this.pageSize());
    this.loadSpecialities();
    this.loadQuestions();
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
   * Charge la liste des spécialités
   */
  loadSpecialities() {
    // Pour l'instant, on utilise le service des départements comme spécialités
    // TODO: Créer un service dédié pour les spécialités
    this.departmentService.getAllDepartmentsByCriteria({}).subscribe({
      next: (response) => {
        this.specialities = response.content || [];
        console.log('✅ Spécialités chargées:', this.specialities.length);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des spécialités:', error);
        this.specialities = [];
      }
    });
  }

  /**
   * Charge la liste des questions
   */
  loadQuestions() {
    // Annuler le timeout précédent s'il existe
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }

    // Débounce pour éviter les appels multiples rapides
    this.loadingTimeout = setTimeout(() => {
      this.performLoadQuestions();
    }, 100);
  }

  /**
   * Exécute réellement le chargement des questions
   */
  private performLoadQuestions() {
    this.isLoading.set(true);
    console.log(`📥 Chargement des questions...`);
    console.log('🔍 Critères de recherche utilisés:', this.searchCriteria);

    // Préparer les critères avec la pagination
    const criteria: QuestionSearchCriteria = {
      ...this.searchCriteria,
      size: this.pageSize(),
      page: this.currentPage(),
      isDeleted: this.showDeletedQuestions ? undefined : false
    };

    this.questionService.getAllQuestionsByCriteria(criteria).subscribe({
      next: (response) => {
        console.log('✅ Questions chargées:', response.content.length);
        console.log('🔍 Contenu de response.content:', response.content);
        console.log('🔍 Première question:', response.content[0]);
        console.log('🔍 Propriétés de la première question:', response.content[0] ? Object.keys(response.content[0]) : 'Aucune question');
        console.log('🔍 Valeurs de la première question:', response.content[0] ? JSON.stringify(response.content[0], null, 2) : 'Aucune question');

        this.questions.set(response.content);
        this.totalElements.set(response.totalElements);
        this.isLoading.set(false);

        console.log('🎯 État final après chargement:');
        console.log('- Nombre de questions affichées:', this.questions().length);
        console.log('- Total des questions:', this.totalElements());
        console.log('- Page actuelle:', this.currentPage());
        console.log('- Taille de page:', this.pageSize());
        console.log('- Questions dans le signal:', this.questions());
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des questions:', error);
        this.questions.set([]);
        this.totalElements.set(0);
        this.isLoading.set(false);
        this.notificationService.error('Erreur', 'Impossible de charger les questions');
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
    this.searchCriteria.questionText = '';
    this.searchCriteria.specialityId = undefined;
    this.searchCriteria.questionType = '';
    this.searchCriteria.difficultyLevel = '';
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
      this.loadQuestions();
    }, 300);
  }

  /**
   * Bascule l'affichage des questions supprimées
   */
  toggleDeletedQuestions() {
    this.showDeletedQuestions = !this.showDeletedQuestions;
    console.log('🔄 Basculement affichage questions supprimées:', this.showDeletedQuestions);
    this.currentPage.set(0); // Remettre à la première page
    this.loadQuestions();
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
    this.loadQuestions();
    this.showAdvancedSearch = false;
  }

  /**
   * Réinitialise tous les filtres de recherche
   */
  clearSearch() {
    this.searchCriteria = {
      idDe: '',
      idA: '',
      questionText: '',
      specialityId: undefined,
      questionType: '',
      difficultyLevel: '',
      search_string: ''
    };
    this.quickSearch = '';
    this.showAdvancedSearch = false;
    this.resetAdvancedSearch();
    this.currentPage.set(0);
    this.loadQuestions();
  }

  /**
   * Réinitialise les filtres avancés
   */
  resetAdvancedSearch() {
    console.log('🔄 Réinitialisation des filtres avancés');
    this.advancedCriteria = {
      idDe: '',
      idA: '',
      questionText: '',
      specialityId: undefined,
      questionType: '',
      difficultyLevel: '',
      isDeleted: undefined,
      search_string: ''
    };
    this.searchCriteria = { ...this.advancedCriteria };
    this.currentPage.set(0);
    this.loadQuestions();
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
    this.loadQuestions();
  }

  /**
   * Va à une page spécifique
   */
  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      console.log('📄 Aller à la page:', page);
      this.currentPage.set(page);
      this.loadQuestions();
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
  trackByQuestionId(index: number, question: Question): number {
    return question.id;
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
  createQuestion() {
    console.log('➕ Ouverture modal création question');
    this.isEditing = false;
    this.currentQuestion = {
      id: 0,
      questionText: '',
      specialityId: undefined,
      questionType: '',
      difficultyLevel: '',
      points: 0,
      timeLimit: 0
    };
    this.showModal = true;
  }

  /**
   * Ouvre le modal d'édition
   */
  editQuestion(question: Question) {
    console.log('✏️ Ouverture modal édition question:', question);
    this.isEditing = true;
    this.currentQuestion = { ...question };
    this.showModal = true;
  }

  /**
   * Ferme le modal
   */
  closeModal() {
    console.log('❌ Fermeture modal');
    this.showModal = false;
    this.currentQuestion = {
      id: 0,
      questionText: '',
      specialityId: undefined,
      questionType: '',
      difficultyLevel: '',
      points: 0,
      timeLimit: 0
    };
  }

  /**
   * Sauvegarde la question
   */
  saveQuestion() {
    console.log('💾 Sauvegarde question:', this.currentQuestion);

    if (!this.currentQuestion.questionText?.trim()) {
      console.error('Le texte de la question est requis');
      this.notificationService.error('Erreur de validation', 'Le texte de la question est requis');
      return;
    }

    if (!this.currentQuestion.specialityId) {
      console.error('La spécialité est requise');
      this.notificationService.error('Erreur de validation', 'La spécialité est requise');
      return;
    }

    if (!this.currentQuestion.questionType) {
      console.error('Le type de question est requis');
      this.notificationService.error('Erreur de validation', 'Le type de question est requis');
      return;
    }

    if (!this.currentQuestion.difficultyLevel) {
      console.error('Le niveau de difficulté est requis');
      this.notificationService.error('Erreur de validation', 'Le niveau de difficulté est requis');
      return;
    }

    // Validation avec le service
    const validation = this.questionService.validateQuestion(this.currentQuestion);
    if (!validation.isValid) {
      console.error('Erreurs de validation:', validation.errors);
      this.notificationService.error('Erreur de validation', validation.errors.join(', '));
      return;
    }

    // Désactiver le bouton de sauvegarde pendant le traitement
    this.isLoading.set(true);

    // Nettoyer les données
    const cleanQuestion = this.questionService.sanitizeQuestion(this.currentQuestion);

    const saveObservable = this.isEditing
      ? this.questionService.updateQuestion(cleanQuestion.id, cleanQuestion)
      : this.questionService.createQuestion(cleanQuestion);

    saveObservable.subscribe({
      next: (response) => {
        if (this.isEditing) {
          console.log('✅ Question modifiée avec succès:', response);
          this.notificationService.success('Succès', 'Question modifiée avec succès');
        } else {
          console.log('✅ Question créée avec succès:', response);
          this.notificationService.success('Succès', 'Question créée avec succès');
        }

        this.closeModal();
        this.loadQuestions();
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
   * Supprime la question depuis la popup d'édition
   */
  deleteQuestionFromEdit() {
    const question = this.currentQuestion;
    if (question && question.id > 0) {
      this.closeModal();
      this.deleteQuestion(question);
    }
  }

  /**
   * Ouvre le modal de confirmation de suppression
   */
  deleteQuestion(question: Question) {
    console.log('🗑️ Ouverture modal suppression question:', question);
    this.currentQuestion = question;
    this.showDeleteModal = true;
  }

  /**
   * Ferme le modal de suppression
   */
  closeDeleteModal() {
    console.log('❌ Fermeture modal suppression');
    this.showDeleteModal = false;
    this.currentQuestion = {
      id: 0,
      questionText: '',
      specialityId: undefined,
      questionType: '',
      difficultyLevel: '',
      points: 0,
      timeLimit: 0
    };
  }

  /**
   * Confirme la suppression
   */
  confirmDelete() {
    console.log('✅ Confirmation suppression question:', this.currentQuestion);

    if (!this.currentQuestion || !this.currentQuestion.id) {
      console.error('❌ Aucune question sélectionnée pour la suppression');
      this.notificationService.error('Erreur', 'Aucune question sélectionnée');
      return;
    }

    // Vérifier les réponses associées avant suppression
    this.questionService.checkAssociatedAnswers(this.currentQuestion.id).subscribe({
      next: (checkResult) => {
        if (!checkResult.canDelete && checkResult.associatedCount > 0) {
          console.warn('⚠️ Impossible de supprimer: réponses associées');
          this.notificationService.error(
            'Suppression impossible',
            `Cette question a ${checkResult.associatedCount} réponse(s) associée(s). Supprimez d'abord les réponses.`
          );
          this.closeDeleteModal();
          return;
        }

        // Procéder à la suppression
        this.isLoading.set(true);
        this.questionService.deleteQuestion(this.currentQuestion.id).subscribe({
          next: () => {
            console.log('✅ Question supprimée avec succès:', this.currentQuestion);
            this.notificationService.success('Succès', 'Question supprimée avec succès');
            this.closeDeleteModal();
            this.loadQuestions();
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
    this.currentQuestion = {
      id: 0,
      questionText: '',
      specialityId: undefined,
      questionType: '',
      difficultyLevel: '',
      points: 0,
      timeLimit: 0
    };
  }

  /**
   * Confirme la restauration
   */
  confirmRestore() {
    console.log('✅ Confirmation restauration question:', this.currentQuestion);

    if (!this.currentQuestion || !this.currentQuestion.id) {
      console.error('❌ Aucune question sélectionnée pour la restauration');
      this.notificationService.error('Erreur', 'Aucune question sélectionnée');
      return;
    }

    // Désactiver le bouton pendant la restauration
    this.isLoading.set(true);

    this.questionService.restoreQuestion(this.currentQuestion.id).subscribe({
      next: (response) => {
        console.log('✅ Question restaurée avec succès:', response);
        this.notificationService.success('Succès', 'Question restaurée avec succès');
        this.closeRestoreModal();
        this.loadQuestions();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la restauration:', error);
        this.isLoading.set(false);
        this.notificationService.error('Erreur', 'Erreur lors de la restauration');
      }
    });
  }

  /**
   * Restaure une question supprimée
   */
  restoreQuestion(question: Question) {
    console.log('♻️ Ouverture modal restauration pour:', question);
    this.currentQuestion = { ...question };
    this.showRestoreModal = true;
  }

  /**
   * Obtient le label pour le type de question
   */
  getQuestionTypeLabel(type?: string): string {
    switch (type) {
      case 'SINGLE_CHOICE': return 'Choix unique';
      case 'MULTIPLE_CHOICE': return 'Choix multiple';
      case 'TRUE_FALSE': return 'Vrai/Faux';
      case 'TEXT': return 'Texte libre';
      default: return 'N/A';
    }
  }

  /**
   * Obtient le label pour le niveau de difficulté
   */
  getDifficultyLabel(level?: string): string {
    switch (level) {
      case 'BEGINNER': return 'Débutant';
      case 'INTERMEDIATE': return 'Intermédiaire';
      case 'ADVANCED': return 'Avancé';
      case 'EXPERT': return 'Expert';
      default: return 'N/A';
    }
  }

  /**
   * Obtient le nombre de questions en ligne (simulation)
   */
  getOnlineUsersCount(): number {
    // Simulation - dans un vrai service, cela viendrait du backend
    return Math.floor(this.totalElements() * 0.7); // 70% en ligne
  }

  /**
   * Obtient le nombre de questions hors ligne (simulation)
   */
  getOfflineUsersCount(): number {
    return this.totalElements() - this.getOnlineUsersCount();
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
   * Vérifie si le texte de la question est défini et sa longueur
   */
  getQuestionTextLength(question: Question): number {
    return question.questionText?.length || 0;
  }

  /**
   * Vérifie si le texte de la question courante est défini et sa longueur
   */
  getCurrentQuestionTextLength(): number {
    return this.currentQuestion.questionText?.length || 0;
  }
}