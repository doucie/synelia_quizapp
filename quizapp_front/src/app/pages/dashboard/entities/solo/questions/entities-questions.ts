import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntityDetailPanelComponent, DetailField } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { DashboardStatsService } from '../../../../../core/services/dashboard-stats.service';
import { DependencyInfo } from '../../../../../shared/models/interfaces';
import { Router, ActivatedRoute } from '@angular/router';

import { QuestionService, Question, QuestionSearchCriteria, PagedResponse } from '../../../../../core/services/question.service';
import { UserService } from '../../../../../core/services/user.service';
import { AnswerService, Answer } from '../../../../../core/services/answer.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { SpecialityService, Speciality } from '../../../../../core/services/speciality.service';

@Component({
  selector: 'app-entities-questions',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-questions.html',
  styleUrl: './entities-questions.scss'
})
export class EntitiesQuestionsComponent implements OnInit, OnDestroy {
  // Exposer Math pour utilisation dans le template
  Math = Math;
  
  private destroy$ = new Subject<void>();

  // Detail panel
  selectedItem = signal<any>(null);
  showDetailPanel = signal<boolean>(false);
  detailFields: DetailField[] = [];

  selectItem(item: any): void {
    this.selectedItem.set(item);
    this.showDetailPanel.set(true);
  }

  closeDetailPanel(): void {
    this.showDetailPanel.set(false);
    this.selectedItem.set(null);
  }

  editFromDetail(item: any): void {
    this.closeDetailPanel();
    this.editQuestion(item);
  }

  saveFromDetail(data: any): void {
    this.questionService.updateQuestion(data.id, data).subscribe({
      next: () => { this.selectedItem.set(data); this.loadQuestions(); this.notificationService.success('Succès', 'Question modifiée'); },
      error: () => { this.notificationService.error('Erreur', 'Erreur lors de la modification'); }
    });
  }

  deleteFromDetail(item: any): void {
    this.closeDetailPanel();
    this.deleteQuestion(item);
  }

  restoreFromDetail(item: any): void {
    this.closeDetailPanel();
    this.restoreQuestion(item);
  }
  private loadingTimeout: any;
  
  // Signaux pour la réactivité
  questions = signal<Question[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10); // Valeur par défaut, sera mise à jour dans ngOnInit
  
  // Signaux pour l'expansion des questions
  expandedQuestions = signal<Set<number>>(new Set());
  questionAnswers = signal<{[questionId: number]: Answer[]}>({});
  loadingAnswers = signal<{[questionId: number]: boolean}>({});
  
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
  
  // Contrôle d'affichage des départements supprimés
  showDeletedQuestions = true; // Par défaut, afficher tous les départements
  
  // Compteurs réels (total dans la BD)
  totalActiveQuestions = signal<number>(0);
  totalDeletedQuestions = signal<number>(0);
  
  // Options de pagination avec 10 par défaut
  pageSizeOptions = [5, 10, 20, 50, 100];
  private readonly PAGE_SIZE_STORAGE_KEY = 'entities-questions-page-size';
  
  // État de la popup de confirmation
  showDeleteConfirmation = false;
  // FK dropdowns
  private specialityService = inject(SpecialityService);
  allSpecialities = signal<Speciality[]>([]);
  // -- D�pendances FK ---------------------------
  private depService = inject(DashboardStatsService);
  dependencyInfo = signal<DependencyInfo | null>(null);
  showDependencyPopup = signal<boolean>(false);
  dependencyMode = signal<'delete' | 'restore'>('delete');

  closeDependencyPopup(): void {
    this.showDependencyPopup.set(false);
    this.dependencyInfo.set(null);
  }

  confirmDependencyAction(): void {
    const mode = this.dependencyMode();
    this.closeDependencyPopup();
    if (mode === 'delete') {
      this.showDeleteConfirmation = true;
    } else {
      this.showRestoreConfirmation.set(true);
    }
  }
  questionToDelete: Question | null = null;
  
  // État de la popup de restauration
  showRestoreConfirmation = signal<boolean>(false);
  questionToRestore = signal<Question | null>(null);
  
  // État de la popup d'édition
  showEditDialog = signal<boolean>(false);
  questionToEdit = signal<Question | null>(null);
  editFormData = {
    id: 0,
    questionText: '',
    specialityId: undefined as number | undefined,
    questionType: '',
    difficultyLevel: '',
    score: undefined as number | undefined,
    questionChrono: undefined as number | undefined
  };

  // État de la popup de création
  showCreateDialog = signal<boolean>(false);
  createFormData = {
    questionText: '',
    specialityId: undefined as number | undefined,
    questionType: '',
    difficultyLevel: '',
    score: undefined as number | undefined,
    questionChrono: undefined as number | undefined
  };
  
  // États pour la gestion des réponses
  showAnswerCreateDialog = signal<boolean>(false);
  showAnswerEditDialog = signal<boolean>(false);
  showAnswerDeleteConfirmation = signal<boolean>(false);
  showAnswerRestoreConfirmation = signal<boolean>(false);
  
  answerToEdit = signal<Answer | null>(null);
  answerToDelete = signal<Answer | null>(null);
  answerToRestore = signal<Answer | null>(null);
  currentQuestionForAnswer = signal<Question | null>(null);
  
  answerCreateFormData = {
    answerText: '',
    answerOrder: undefined as number | undefined
  };
  
  answerEditFormData = {
    id: 0,
    answerText: '',
    answerOrder: undefined as number | undefined
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
    private questionService: QuestionService,
    private userService: UserService,
    private answerService: AnswerService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('🚀 Initialisation EntitiesDepartmentsComponent');
    // Initialiser la taille de page avec la valeur stockée
    this.pageSize.set(this.getStoredPageSize());
    console.log('📦 Taille de page au démarrage:', this.pageSize());
    
    // Lire le paramètre page depuis l'URL (1-based) et convertir en 0-based
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const pageParam = params['page'];
      if (pageParam && !isNaN(+pageParam) && +pageParam > 0) {
        this.currentPage.set(+pageParam - 1); // Convertir 1-based en 0-based
      } else {
        this.currentPage.set(0);
      }
    });
    
    this.loadQuestions();
    this.specialityService.getAll({ page: 0, size: 9999, isDeleted: false }).subscribe({
      next: (res) => this.allSpecialities.set(res.items)
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
   * Exécute réellement le chargement des départements
   */
  private performLoadQuestions() {
    this.isLoading.set(true);
    const serviceMethod = this.showDeletedQuestions ? 'incluant supprimés' : 'actifs seulement';
    console.log(`📥 Chargement des départements (${serviceMethod})...`);
    console.log('🔍 Critères de recherche utilisés:', this.searchCriteria);

    const criteria = {
      ...this.searchCriteria,
      page: this.currentPage(),
      size: this.pageSize(),
      isDeleted: this.showDeletedQuestions ? undefined : false // undefined = tous, false = actifs seulement
    };

    console.log('📤 Requête envoyée avec critères:', criteria);

    // Utiliser toujours la même méthode mais avec le critère isDeleted approprié
    const serviceCall = this.questionService.getAllQuestionsByCriteria(criteria);

    serviceCall.subscribe({
      next: (response: PagedResponse<Question>) => {
        console.log(`✅ RÉPONSE COMPLÈTE reçue (${serviceMethod}):`, response);
        console.log('📊.questionTextbre total de questions (totalElements):', response.totalElements);
        console.log('📊.questionTextbre de questions dans cette page:', response.content.length);
        console.log('📊 Page courante (number):', response.number || 'non défini');
        console.log('📊 Taille de page (size):', response.size || 'non défini');
        console.log('📊.questionTextbre total de pages:', response.totalPages || 'non défini');
        
        // Analyser les questions reçues
        const deletedQuestions = response.content.filter((q: Question) => q.isDeleted);
        const activeQuestions = response.content.filter((q: Question) => !q.isDeleted);
        
        console.log('📊 Questions supprimés dans cette page:', deletedQuestions.length, deletedQuestions);
        console.log('📊 Questions actifs dans cette page:', activeQuestions.length, activeQuestions);
        
        this.questions.set(response.content);
        this.totalElements.set(response.totalElements);
        this.isLoading.set(false);
        
        // Mettre à jour les vrais compteurs d'actifs et supprimés
        this.updateRealCounts();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des questions:', error);
        this.notificationService.error('Erreur', 'Erreur lors du chargement des questions');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Recherche des départements selon les critères
   */
  searchQuestions() {
    console.log('🔍 Recherche avec critères:', this.searchCriteria);
    this.currentPage.set(0);
    this.loadQuestions();
  }

  /**
   * Réinitialise les critères de recherche
   */
  clearSearch() {
    // Reset search criteria
    this.searchCriteria = {
      idDe: '',
      idA: '',
      questionText: '',
      questionType: '',
      difficultyLevel: '',
      search_string: ''
    };
    this.quickSearch = '';
    this.showAdvancedSearch = false;
    this.resetAdvancedSearch();
    this.searchQuestions();
  }

  /**
   * Crée un nouveau département
   */
  createDepartment() {
    // Réinitialiser le formulaire
    this.createFormData = {
      questionText: '',
      specialityId: undefined,
      questionType: '',
      difficultyLevel: '',
      score: undefined,
      questionChrono: undefined
    };
    this.showCreateDialog.set(true);
  }

  /**
   * Ferme la popup de création
   */
  closeCreateDialog() {
    this.showCreateDialog.set(false);
    this.createFormData = {
      questionText: '',
      specialityId: undefined,
      questionType: '',
      difficultyLevel: '',
      score: undefined,
      questionChrono: undefined
    };
  }

  /**
   * Valide et crée un nouveau département
   */
  async validateQuestionCreation() {
    const formData = this.createFormData;

    console.log('🔧 Début validation création - formData:', formData);

    // Validation des champs requis
    if (!formData.questionText.trim()) {
      this.notificationService.warning('Attention', 'Le texte de la question est requis');
      return;
    }

    try {
      // Appel de l'API pour créer une nouvelle question
      console.log('🔧 Création d\'une nouvelle question');

      const newQuestion: any = await this.questionService.createQuestion({
        questionText: formData.questionText.trim(),
        specialityId: formData.specialityId,
        questionType: formData.questionType,
        difficultyLevel: formData.difficultyLevel,
        score: formData.score,
        questionChrono: formData.questionChrono
      } as any).toPromise();

      console.log('✅ Question créée:', newQuestion);

      // Vérifier si la réponse indique une erreur
      if (newQuestion && newQuestion.hasError) {
        console.error('❌ Erreur détectée dans la réponse:', newQuestion);
        const errorMessage = newQuestion.status?.message || newQuestion.status?.code || 'Erreur lors de la création';
        this.notificationService.error('Erreur', errorMessage);
        return;
      }

      this.notificationService.success('Succès', `Question ${formData.questionText} créée avec succès`);
      this.closeCreateDialog();
      this.loadQuestions(); // Recharger la liste
    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error);
      console.error('❌ Détail de l\'erreur:', error?.error);
      this.notificationService.error('Erreur', `Erreur lors de la création: ${error?.error?.message || error?.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Édite un département
   */
  editQuestion(department: Question) {
    this.questionToEdit.set(department);
    this.editFormData = {
      id: department.id!,
      questionText: department.questionText || '',
      specialityId: department.specialityId,
      questionType: department.questionType || '',
      difficultyLevel: department.difficultyLevel || '',
      score: department.score,
      questionChrono: department.questionChrono
    };
    this.showEditDialog.set(true);
  }

  /**
   * Ferme la popup d'édition
   */
  closeEditDialog() {
    this.showEditDialog.set(false);
    this.questionToEdit.set(null);
    this.editFormData = {
      id: 0,
      questionText: '',
      specialityId: undefined,
      questionType: '',
      difficultyLevel: '',
      score: undefined,
      questionChrono: undefined
    };
  }

  /**
   * Valide et sauvegarde les modifications
   */
  async validateQuestionEdit() {
    const formData = this.editFormData;
    const currentQuestion = this.questionToEdit();
    
    console.log('🔧 Début validation - formData:', formData);
    console.log('🔧 Début validation - currentQuestion:', currentQuestion);
    
    if (!currentQuestion) {
      this.notificationService.error('Erreur', 'Aucune question sélectionnée pour modification');
      return;
    }

    // Validation des champs requis
    if (!formData.questionText.trim()) {
      this.notificationService.warning('Attention', 'Le texte de la question est requis');
      return;
    }

    try {
      // Appel de l'API pour mettre à jour une question
      console.log('🔧 Mise à jour d\'une question');
      
      const updatedQuestion: any = await this.questionService.updateQuestion(currentQuestion.id!, {
        id: currentQuestion.id,
        questionText: formData.questionText.trim(),
        specialityId: formData.specialityId,
        questionType: formData.questionType,
        difficultyLevel: formData.difficultyLevel,
        score: formData.score,
        questionChrono: formData.questionChrono
      }).toPromise();

      console.log('✅ Question mise à jour:', updatedQuestion);

      // Vérifier si la réponse indique une erreur
      if (updatedQuestion && updatedQuestion.hasError) {
        console.error('❌ Erreur détectée dans la réponse:', updatedQuestion);
        const errorMessage = updatedQuestion.status?.message || updatedQuestion.status?.code || 'Erreur lors de la mise à jour';
        this.notificationService.error('Erreur', errorMessage);
        return;
      }

      this.notificationService.success('Succès', `Question ${formData.questionText} modifié avec succès`);
      this.closeEditDialog();
      this.loadQuestions(); // Recharger la liste
    } catch (error: any) {
      console.error('❌ Erreur lors de la modification:', error);
      console.error('❌ Détail de l\'erreur:', error?.error);
      this.notificationService.error('Erreur', `Erreur lors de la modification: ${error?.error?.message || error?.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Supprime le département depuis la popup d'édition
   */
  deleteQuestionFromEdit() {
    const department = this.questionToEdit();
    if (department) {
      this.closeEditDialog();
      this.deleteQuestion(department);
    }
  }

  /**
   * Affiche la popup de confirmation pour supprimer un département
   */
  deleteQuestion(department: Question) {
    this.questionToDelete = department;
    this.depService.checkDependencies('questions', department.id!).subscribe({
      next: (info) => {
        if (info.totalDependencies > 0) {
          this.dependencyInfo.set(info);
          this.dependencyMode.set('delete');
          this.showDependencyPopup.set(true);
        } else {
          this.showDeleteConfirmation = true;
        }
      },
      error: () => this.showDeleteConfirmation = true
    });
  }

  /**
   * Confirme la suppression d'un département
   */
  confirmdeleteQuestion() {
    if (!this.questionToDelete) return;
    
    this.questionService.deleteQuestion(this.questionToDelete.id!).subscribe({
      next: () => {
        this.notificationService.success('Succès', `Question ${this.questionToDelete?.questionText} supprimé avec succès`);
        
        // Marquer la question comme supprimée dans la liste locale
        if (this.questionToDelete) {
          this.questionToDelete.isDeleted = true;
        }
        
        // Activer automatiquement l'affichage des questions supprimés
        this.showDeletedQuestions = true;
        
        this.canceldeleteQuestion();
        // Recharger la liste pour refléter les changements
        this.loadQuestions();
      },
      error: (error: any) => {
        console.error('❌ Erreur lors de la suppression:', error);
        this.notificationService.error('Erreur', 'Erreur lors de la suppression du département');
        this.canceldeleteQuestion();
      }
    });
  }

  /**
   * Annule la suppression d'un département
   */
  canceldeleteQuestion() {
    this.showDeleteConfirmation = false;
    this.questionToDelete = null;
  }

  /**
   * Affiche la popup de confirmation pour restaurer un département supprimé
   */
  restoreQuestion(department: Question) {
    this.questionToRestore.set(department);
    this.depService.checkParent('questions', department.id!).subscribe({
      next: (info) => {
        if (info.deletedParents && info.deletedParents.length > 0) {
          this.dependencyInfo.set(info);
          this.dependencyMode.set('restore');
          this.showDependencyPopup.set(true);
        } else {
          this.showRestoreConfirmation.set(true);
        }
      },
      error: () => this.showRestoreConfirmation.set(true)
    });
  }

  /**
   * Confirme la restauration d'un département
   */
  confirmrestoreQuestion() {
    const questionToRestore = this.questionToRestore();
    if (!questionToRestore) return;
    
    this.questionService.restoreQuestion(questionToRestore.id!).subscribe({
      next: (response: any) => {
        this.notificationService.success('Succès', `Département ${questionToRestore.questionText} restauré avec succès`);
        
        // Marquer le département comme restauré dans la liste locale
        questionToRestore.isDeleted = false;
        
        this.cancelrestoreQuestion();
        // Recharger la liste pour refléter les changements
        this.loadQuestions();
      },
      error: (error: any) => {
        this.notificationService.error('Erreur', 'Erreur lors de la restauration du département');
        this.cancelrestoreQuestion();
      }
    });
  }

  /**
   * Annule la restauration d'un département
   */
  cancelrestoreQuestion() {
    this.showRestoreConfirmation.set(false);
    this.questionToRestore.set(null);
  }





  /**
   * Gestion de la pagination
   */
  goToPage(page: number) {
    this.currentPage.set(page);
    // Mettre à jour l'URL avec le numéro de page (convertir 0-based en 1-based)
    this.router.navigate(['/dashboard/entities/questions', page + 1]);
    this.loadQuestions();
  }

  /**
   * Gère l'événement de changement de la taille de page depuis le select
   */
  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newSize = parseInt(target.value, 10);
    console.log('🎯 onPageSizeChange - event.target.value:', target.value, '→ parseInt:', newSize);
    this.changePageSize(newSize);
  }

  /**
   * Change la taille de page et revient à la première page
   */
  changePageSize(newSize: number) {
    console.log('� DÉBUT changePageSize - valeur reçue:', newSize, 'type:', typeof newSize);
    console.log('�📝 Changement de taille de page:', this.pageSize(), '→', newSize);
    
    // Vérifier que newSize est un.questionTextbre valide
    if (isNaN(newSize) || !this.pageSizeOptions.includes(newSize)) {
      console.error('❌ Taille de page invalide:', newSize);
      return;
    }
    
    this.pageSize.set(newSize);
    this.storePageSize(newSize); // Sauvegarder dans le cache
    
    // Sauvegarder la préférence dans la base de données
    this.userService.updatePageSizePreference(newSize).subscribe({
      next: (response) => {
        console.log('💾 Préférence de taille de page sauvegardée en BD:', response);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la sauvegarde de la préférence de taille de page:', error);
        // Ne pas bloquer l'interface si la sauvegarde échoue
      }
    });
    
    this.currentPage.set(0);
    this.loadQuestions();
    
    console.log('✅ FIN changePageSize - nouvelle valeur stockée');
  }

  /**
   * Toggle l'affichage des départements supprimés
   */
  toggleDeletedDepartments() {
    this.showDeletedQuestions = !this.showDeletedQuestions;
    console.log('🔄 Toggle départements supprimés:', this.showDeletedQuestions ? 'ACTIVÉ' : 'DÉSACTIVÉ');
    console.log('📦 Taille de page actuelle avant toggle:', this.pageSize());
    this.currentPage.set(0); // Revenir à la première page
    console.log('📦 Taille de page actuelle après toggle:', this.pageSize());
    this.loadQuestions();
  }

  /**
   * Retourne vers la page des entités
   */
  goBackToEntities() {
    this.router.navigate(['/dashboard/entities']);
  }

  /**
   * TrackBy function pour optimiser les performances de rendu de la liste
   */
  trackByQuestionId(index: number, department: Question): number {
    return department.id!;
  }

  /**
   * TrackBy function pour optimiser les performances de rendu des spécialités
   */
  trackByAnswerId(index: number, answer: any): number {
    return answer.id;
  }

  /**
   * Recherche rapide utilisant search_string
   */
  onQuickSearch() {
    // Réinitialiser les critères de recherche individuels
    this.searchCriteria.idDe = '';
    this.searchCriteria.idA = '';
    this.searchCriteria.questionText = '';
    
    // Utiliser search_string pour la recherche globale
    this.searchCriteria.search_string = this.quickSearch.trim();
    
    // Fermer la recherche avancée si elle était ouverte
    this.showAdvancedSearch = false;
    
    // Débounce pour éviter trop de requêtes
    setTimeout(() => {
      this.loadQuestions();
    }, 300);
  }

  /**
   * Ouvre/ferme la recherche avancée
   */
  openAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  /**
   * Applique les filtres avancés
   */
  applyAdvancedSearch() {
    // Copier les critères avancés vers les critères principaux
    this.searchCriteria = { ...this.advancedCriteria };
    
    // Vider la recherche rapide car on utilise les critères détaillés
    this.quickSearch = '';
    this.searchCriteria.search_string = '';
    
    // Lancer la recherche
    this.loadQuestions();
  }

  /**
   * Réinitialise les filtres avancés
   */
  resetAdvancedSearch() {
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
    this.applyAdvancedSearch();
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
   * Convertit une date française (jj/mm/aaaa) en objet Date
   */
  parseFrenchDate(dateString: string): Date | null {
    if (!dateString) return null;

    // Format attendu: "16/09/2025" ou "16/09/2025 14:30"
    const parts = dateString.split(' ');
    const datePart = parts[0]; // "16/09/2025"
    const timePart = parts[1] || '00:00'; // "14:30" ou "00:00" par défaut

    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    // Validation basique
    if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hours) || isNaN(minutes)) {
      return null;
    }

    // Créer la date (les mois commencent à 0 en JavaScript)
    return new Date(year, month - 1, day, hours, minutes);
  }

  /**
   * Formate la date de création pour l'affichage
   */
  formatCreationDate(question: Question): string {
    if (!question.createdAt) return '-';

    // Si la date ne contient pas d'heures (format "jj/mm/aaaa"), afficher seulement la date
    if (!question.createdAt.includes(' ')) {
      const date = this.parseFrenchDate(question.createdAt);
      if (!date) return question.createdAt;
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }

    // Si la date contient des heures, les afficher
    const date = this.parseFrenchDate(question.createdAt);
    if (!date) return question.createdAt;

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Retourne le.questionTextbre de départements actifs (total réel dans la BD)
   */
  getActiveDepartmentsCount(): number {
    return this.totalActiveQuestions();
  }

  /**
   * Retourne le.questionTextbre de départements supprimés (total réel dans la BD)
   */
  getDeletedDepartmentsCount(): number {
    return this.totalDeletedQuestions();
  }

  /**
   * Met à jour les vrais compteurs d'actifs et supprimés
   */
  private updateRealCounts() {
    // Compter les actifs (isDeleted = false) - appel léger avec size=1
    const activeCriteria = { ...this.searchCriteria, isDeleted: false, page: 0, size: 1 };
    this.questionService.getAllQuestionsByCriteria(activeCriteria).subscribe({
      next: (response) => {
        this.totalActiveQuestions.set(response.totalElements);
      },
      error: (error) => console.error('Erreur lors du comptage des départements actifs:', error)
    });

    // Compter tous (isDeleted = undefined) pour calculer les supprimés
    const allCriteria = { ...this.searchCriteria, isDeleted: undefined, page: 0, size: 1 };
    this.questionService.getAllQuestionsByCriteria(allCriteria).subscribe({
      next: (response) => {
        const totalAll = response.totalElements;
        // Petite attente pour s'assurer que totalActive est mis à jour
        setTimeout(() => {
          const totalActive = this.totalActiveQuestions();
          this.totalDeletedQuestions.set(totalAll - totalActive);
        }, 100);
      },
      error: (error) => console.error('Erreur lors du comptage total des départements:', error)
    });
  }

  /**
   * Bascule l'expansion d'une question
   */
  toggleQuestionExpansion(questionId: number) {
    const currentExpanded = this.expandedQuestions();
    const newExpanded = new Set(currentExpanded);
    
    if (newExpanded.has(questionId)) {
      // Réduire
      newExpanded.delete(questionId);
      this.expandedQuestions.set(newExpanded);
    } else {
      // Étendre et charger les réponses
      newExpanded.add(questionId);
      this.expandedQuestions.set(newExpanded);
      this.loadQuestionAnswers(questionId);
    }
  }

  /**
   * Vérifie si une question est expandée
   */
  isQuestionExpanded(questionId: number): boolean {
    return this.expandedQuestions().has(questionId);
  }

  /**
   * Charge les réponses d'une question
   */
  loadQuestionAnswers(questionId: number) {
    // Éviter les appels multiples
    if (this.loadingAnswers()[questionId]) {
      return;
    }

    // Activer le loading pour cette question
    this.loadingAnswers.set({
      ...this.loadingAnswers(),
      [questionId]: true
    });

    console.log(`Chargement des réponses pour la question ${questionId}...`);

    // Les réponses sont maintenant directement liées à la question avec isCorrect, displayOrder, etc.
    this.answerService.getQuestionAnswersByCriteria({
      page: 0,
      size: 10000,
      questionId: questionId
    }).subscribe({
      next: (response) => {
        console.log(`Réponses chargées pour la question ${questionId}:`, response.content);

        this.questionAnswers.set({
          ...this.questionAnswers(),
          [questionId]: response.content
        });
        this.loadingAnswers.set({
          ...this.loadingAnswers(),
          [questionId]: false
        });
      },
      error: (error) => {
        console.error(`Erreur lors du chargement des réponses de la question ${questionId}:`, error);
        this.notificationService.error('Erreur', `Erreur lors du chargement des réponses de la question ${questionId}`);
        
        this.loadingAnswers.set({
          ...this.loadingAnswers(),
          [questionId]: false
        });
      }
    });
  }

  /**
   * Crée une nouvelle spécialité dans un département
   */
  createAnswerInQuestion(question: Question) {
    console.log('🆕 Création d\'une spécialité dans le département:', question.questionText);
    this.currentQuestionForAnswer.set(question);
    this.answerCreateFormData = {
      answerText: '',
      answerOrder: undefined as number | undefined
    };
    this.showAnswerCreateDialog.set(true);
  }

  /**
   * Modifie une spécialité
   */
  editAnswerInQuestion(answer: Answer, question: Question) {
    console.log('✏️ Modification de la spécialité:', answer.answerText, 'dans le département:', question.questionText);
    this.currentQuestionForAnswer.set(question);
    this.answerToEdit.set(answer);
    this.answerEditFormData = {
      id: answer.id!,
      answerText: answer.answerText || '',
      answerOrder: answer.answerOrder || undefined
    };
    this.showAnswerEditDialog.set(true);
  }

  /**
   * Supprime une spécialité
   */
  deleteAnswerInQuestion(answer: Answer, question: Question) {
    console.log('🗑️ Suppression de la spécialité:', answer.answerText, 'dans le département:', question.questionText);
    this.currentQuestionForAnswer.set(question);
    this.answerToDelete.set(answer);
    this.showAnswerDeleteConfirmation.set(true);
  }

  /**
   * Restaure une spécialité supprimée
   */
  restoreAnswerInQuestion(answer: Answer, question: Question) {
    console.log('♻️ Restauration de la spécialité:', answer.answerText, 'dans le département:', question.questionText);
    this.currentQuestionForAnswer.set(question);
    this.answerToRestore.set(answer);
    this.showAnswerRestoreConfirmation.set(true);
  }

  /**
   * Confirme la création d'une spécialité
   */
  async confirmCreateAnswer() {
    if (!this.currentQuestionForAnswer()) {
      this.notificationService.error('Erreur', 'Département non trouvé');
      return;
    }

    const department = this.currentQuestionForAnswer()!;
    const answerData = {
      answerText: this.answerCreateFormData.answerText.trim(),
      questionId: department.id,
      answerOrder: this.answerCreateFormData.answerOrder
    };

    if (!answerData.answerText) {
      this.notificationService.error('Erreur', 'Le texte de la réponse est obligatoire');
      return;
    }

    try {
      console.log('🚀 Création de la réponse:', answerData);
      const newanswer: any = await this.answerService.createAnswer(answerData as any).toPromise();
      console.log('✅ Spécialité créée:', newanswer);

      // Recharger les spécialités du département
      this.loadQuestionAnswers(department.id!);

      this.notificationService.success('Succès', 'Spécialité créée avec succès');
      this.cancelCreateAnswer();
    } catch (error: any) {
      console.error('❌ Erreur lors de la création de la spécialité:', error);
      this.notificationService.error('Erreur', 'Erreur lors de la création de la spécialité');
    }
  }

  /**
   * Annule la création d'une spécialité
   */
  cancelCreateAnswer() {
    this.showAnswerCreateDialog.set(false);
    this.currentQuestionForAnswer.set(null);
    this.answerCreateFormData = {
      answerText: '',
      answerOrder: undefined as number | undefined
    };
  }

  /**
   * Confirme la modification d'une spécialité
   */
  async confirmEditAnswer() {
    if (!this.answerToEdit() || !this.currentQuestionForAnswer()) {
      this.notificationService.error('Erreur', 'Spécialité ou département non trouvé');
      return;
    }

    const answer = this.answerToEdit()!;
    const department = this.currentQuestionForAnswer()!;
    const answerData = {
      id: answer.id,
      answerText: this.answerEditFormData.answerText.trim(),
      questionId: department.id,
      answerOrder: this.answerEditFormData.answerOrder
    };

    if (!answerData.answerText) {
      this.notificationService.error('Erreur', 'Le texte de la réponse est obligatoire');
      return;
    }

    try {
      console.log('🚀 Modification de la réponse:', answer.id, answerData);
      const updatedanswer: any = await this.answerService.updateAnswer(answer.id!, answerData as any).toPromise();
      console.log('✅ Spécialité modifiée:', updatedanswer);

      // Recharger les spécialités du département
      this.loadQuestionAnswers(department.id!);

      this.notificationService.success('Succès', 'Spécialité modifiée avec succès');
      this.cancelEditAnswer();
    } catch (error: any) {
      console.error('❌ Erreur lors de la modification de la spécialité:', error);
      this.notificationService.error('Erreur', 'Erreur lors de la modification de la spécialité');
    }
  }

  /**
   * Annule la modification d'une spécialité
   */
  cancelEditAnswer() {
    this.showAnswerEditDialog.set(false);
    this.answerToEdit.set(null);
    this.currentQuestionForAnswer.set(null);
    this.answerEditFormData = {
      id: 0,
      answerText: '',
      answerOrder: undefined as number | undefined
    };
  }

  /**
   * Confirme la suppression d'une spécialité
   */
  async confirmDeleteAnswer() {
    if (!this.answerToDelete() || !this.currentQuestionForAnswer()) {
      this.notificationService.error('Erreur', 'Spécialité ou département non trouvé');
      return;
    }

    const answer = this.answerToDelete()!;
    const department = this.currentQuestionForAnswer()!;

    try {
      console.log('🚀 Suppression de la réponse:', answer.id);
      await this.answerService.deleteAnswer(answer.id!).toPromise();
      console.log('✅ Réponse supprimée');

      // Recharger les spécialités du département
      this.loadQuestionAnswers(department.id!);

      this.notificationService.success('Succès', 'Spécialité supprimée avec succès');
      this.cancelDeleteAnswer();
    } catch (error: any) {
      console.error('❌ Erreur lors de la suppression de la spécialité:', error);
      this.notificationService.error('Erreur', 'Erreur lors de la suppression de la spécialité');
    }
  }

  /**
   * Annule la suppression d'une spécialité
   */
  cancelDeleteAnswer() {
    this.showAnswerDeleteConfirmation.set(false);
    this.answerToDelete.set(null);
    this.currentQuestionForAnswer.set(null);
  }

  /**
   * Confirme la restauration d'une spécialité
   */
  async confirmRestoreAnswer() {
    if (!this.answerToRestore() || !this.currentQuestionForAnswer()) {
      this.notificationService.error('Erreur', 'Spécialité ou département non trouvé');
      return;
    }

    const answer = this.answerToRestore()!;
    const department = this.currentQuestionForAnswer()!;

    try {
      console.log('🚀 Restauration de la réponse:', answer.id);
      await this.answerService.restoreAnswer(answer.id!).toPromise();
      console.log('✅ Réponse restaurée');

      // Recharger les spécialités du département
      this.loadQuestionAnswers(department.id!);

      this.notificationService.success('Succès', 'Spécialité restaurée avec succès');
      this.cancelRestoreAnswer();
    } catch (error: any) {
      console.error('❌ Erreur lors de la restauration de la spécialité:', error);
      this.notificationService.error('Erreur', 'Erreur lors de la restauration de la spécialité');
    }
  }

  /**
   * Annule la restauration d'une spécialité
   */
  cancelRestoreAnswer() {
    this.showAnswerRestoreConfirmation.set(false);
    this.answerToRestore.set(null);
    this.currentQuestionForAnswer.set(null);
  }

  /**
   * Bascule l'affichage des questions supprimées
   */
  toggleDeletedQuestions() {
    this.showDeletedQuestions = !this.showDeletedQuestions;
    this.loadQuestions();
  }

  /**
   * Retourne le nombre de questions actives
   */
  getActiveQuestionsCount(): number {
    return this.totalActiveQuestions();
  }

  /**
   * Retourne le nombre de questions supprimées
   */
  getDeletedQuestionsCount(): number {
    return this.totalDeletedQuestions();
  }

  /**
   * Retourne les réponses d'une question (avec majuscule)
   */
  getQuestionAnswers(questionId: number): Answer[] {
    return this.questionAnswers()[questionId] || [];
  }

  /**
   * Vérifie si les réponses d'une question sont en cours de chargement (avec majuscule)
   */
  isLoadingAnswers(questionId: number): boolean {
    return this.loadingAnswers()[questionId] || false;
  }
}
