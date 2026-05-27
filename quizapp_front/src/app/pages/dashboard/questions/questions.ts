import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin, Observable, of, map, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormVersionService } from '../../../core/services/form-version.service';
import { QuestionService, Question } from '../../../core/services/question.service';
import { AnswerService, Answer } from '../../../core/services/answer.service';
import { SpecialityService, Speciality } from '../../../core/services/speciality.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FilterCheckboxComponent } from '../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../shared/filter-select/filter-select';

interface QuestionFormData {
  id?: number;
  questionText: string;
  questionType: string;
  difficultyLevel: string;
  score: number;
  questionChrono: number;
  specialityId?: number;
}

interface AnswerFormData {
  id?: number;
  answerText: string;
  answerType: string;
  allowAdditionalComment: boolean;
  additionalCommentRequired: boolean;
  additionalCommentPlaceholder: string;
  answerOrder: number;
  isCorrect: boolean;
  questionId?: number;
}

interface QuestionDraftAnswer {
  draftId: string;
  id?: number;
  answerText: string;
  answerType: string;
  allowAdditionalComment: boolean;
  additionalCommentRequired: boolean;
  additionalCommentPlaceholder: string;
  answerOrder: number;
  isCorrect: boolean;
}

interface FormVersionQuestionContext {
  formVersionId: number;
  questionId: number;
}

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective],
  templateUrl: './questions.html',
  styleUrls: ['./questions.scss']
})
export class QuestionsComponent implements OnInit, OnDestroy {
  private readonly QUESTION_TYPE_LABELS: Record<string, string> = {
    SINGLE_CHOICE: 'Choix unique',
    MULTIPLE_CHOICE: 'Choix multiple',
    TRUE_FALSE: 'Vrai/Faux',
    TEXT: 'Texte libre'
  };

  private destroy$ = new Subject<void>();
  private pendingFormVersionQuestionContext: FormVersionQuestionContext | null = null;
  private originalQuestionFormSnapshot: QuestionFormData | null = null;
  private originalQuestionAnswerSnapshot: QuestionDraftAnswer[] = [];

  questions = signal<Question[]>([]);
  specialities = signal<Speciality[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  filterDifficulty = signal<string | null>(null);
  filterType = signal<string | null>(null);

  // Modals
  showCreateEditModal = signal(false);
  showDeleteModal = signal(false);

  // Form
  questionForm = signal<QuestionFormData>({
    questionText: '', questionType: 'MULTIPLE_CHOICE', difficultyLevel: 'MEDIUM', score: 1, questionChrono: 60
  });
  questionDraftAnswers = signal<QuestionDraftAnswer[]>([]);
  deletedQuestionAnswerIds = signal<number[]>([]);
  isEditMode = signal(false);
  selectedQuestion = signal<Question | null>(null);
  formVersionQuestionContext = signal<FormVersionQuestionContext | null>(null);

  // Answers inline
  answers = signal<Answer[]>([]);
  collapsedQuestions = signal<Set<number>>(new Set());

  // Pagination
  private readonly PAGE_SIZE = 10;
  currentPage = signal(0);

  // Answer modals
  showAnswerModal = signal(false);
  showAnswerDeleteModal = signal(false);
  answerForm = signal<AnswerFormData>({
    answerText: '',
    answerType: 'TEXT',
    allowAdditionalComment: false,
    additionalCommentRequired: false,
    additionalCommentPlaceholder: '',
    answerOrder: 1,
    isCorrect: false
  });
  isAnswerEditMode = signal(false);
  selectedAnswer = signal<Answer | null>(null);

  // Admin mode
  isAdminModeEnabled = signal(false);
  selectedQuestionActiveAnswerCount = computed(() => {
    const questionId = this.selectedQuestion()?.id;
    return questionId ? this.answersForQuestion(questionId).length : 0;
  });
  selectedQuestionHasActiveAnswers = computed(() => this.selectedQuestionActiveAnswerCount() > 0);

  difficultyLevels = ['EASY', 'MEDIUM', 'HARD'];
  questionTypes = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'TEXT'];
  answerTypes = ['TEXT', 'IMAGE', 'CODE'];
  questionModalSupportsPredefinedAnswers = computed(() => this.normalizeQuestionType(this.questionForm().questionType) !== 'TEXT');
  questionModalUsesExclusiveCorrectAnswer = computed(() => {
    const questionType = this.normalizeQuestionType(this.questionForm().questionType);
    return questionType === 'SINGLE_CHOICE' || questionType === 'TRUE_FALSE';
  });
  questionModalIsTrueFalse = computed(() => this.normalizeQuestionType(this.questionForm().questionType) === 'TRUE_FALSE');

  constructor(
    private route: ActivatedRoute,
    private formVersionService: FormVersionService,
    private questionService: QuestionService,
    private answerService: AnswerService,
    private specialityService: SpecialityService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isAdminModeEnabled.set(user?.adminMode || false);
        this.tryOpenContextualQuestionEdit();
      });
    effect(() => {
      this.searchQuery();
      this.filterDifficulty();
      this.filterType();
      this.currentPage.set(0);
    });
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const questionId = this.parsePositiveInteger(params['questionId']);
        const formVersionId = this.parsePositiveInteger(params['formVersionId']);

        this.pendingFormVersionQuestionContext = questionId && formVersionId
          ? { questionId, formVersionId }
          : null;
        this.tryOpenContextualQuestionEdit();
      });

    this.loadAll();
    this.loadSpecialities();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDifficultyFilterChange(value: string | number | boolean | null): void {
    this.filterDifficulty.set(typeof value === 'string' ? value : null);
  }

  onTypeFilterChange(value: string | number | boolean | null): void {
    this.filterType.set(typeof value === 'string' ? value : null);
  }

  filteredQuestions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const difficulty = this.filterDifficulty();
    const type = this.filterType();
    let filtered = this.questions();

    if (query) {
      filtered = filtered.filter(q =>
        (q.questionText || '').toLowerCase().includes(query) ||
        (q.questionRef || '').toLowerCase().includes(query)
      );
    }

    if (difficulty) {
      filtered = filtered.filter(q => q.difficultyLevel === difficulty);
    }

    if (type) {
      filtered = filtered.filter(q => q.questionType === type);
    }

    return filtered;
  });

  activeCount = computed(() => this.questions().length);

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredQuestions().length / this.PAGE_SIZE)));

  paginatedQuestions = computed(() => {
    const page = this.currentPage();
    const size = this.PAGE_SIZE;
    return this.filteredQuestions().slice(page * size, (page + 1) * size);
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const delta = 2;
    for (let i = 0; i < total; i++) {
      if (i === 0 || i === total - 1 || (i >= current - delta && i <= current + delta)) {
        pages.push(i);
      }
    }
    return pages;
  });

  answersForQuestion(questionId: number): Answer[] {
    return this.answers()
      .filter(a => a.questionId === questionId)
      .sort((left, right) => (left.answerOrder || 0) - (right.answerOrder || 0) || (left.id || 0) - (right.id || 0));
  }

  isExpanded(questionId: number): boolean {
    return !this.collapsedQuestions().has(questionId);
  }

  toggleAnswers(questionId: number): void {
    const set = new Set(this.collapsedQuestions());
    if (set.has(questionId)) {
      set.delete(questionId);
    } else {
      set.add(questionId);
    }
    this.collapsedQuestions.set(set);
  }

  goToPage(page: number): void {
    this.currentPage.set(Math.max(0, Math.min(page, this.totalPages() - 1)));
  }

  prevPage(): void { this.goToPage(this.currentPage() - 1); }
  nextPage(): void { this.goToPage(this.currentPage() + 1); }

  loadAll(): void {
    this.loading.set(true);
    forkJoin({
      questions: this.questionService.getAllByCriteria({ size: 500, page: 0, isDeleted: false }),
      answers: this.answerService.getAllByCriteria({ size: 1000, page: 0, isDeleted: false })
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ questions, answers }) => {
          this.questions.set(questions.content || []);
          this.answers.set(answers.content || []);
          this.loading.set(false);
          this.tryOpenContextualQuestionEdit();
        },
        error: (error) => {
          console.error('Erreur chargement:', error);
          this.notificationService.error('Erreur', 'Impossible de charger les données');
          this.loading.set(false);
        }
      });
  }

  loadQuestions(): void {
    this.loading.set(true);
    forkJoin({
      questions: this.questionService.getAllByCriteria({ size: 500, page: 0, isDeleted: false }),
      answers: this.answerService.getAllByCriteria({ size: 1000, page: 0, isDeleted: false })
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ questions, answers }) => {
          this.questions.set(questions.content || []);
          this.answers.set(answers.content || []);
          this.loading.set(false);
          this.tryOpenContextualQuestionEdit();
        },
        error: (error) => {
          console.error('Erreur chargement:', error);
          this.notificationService.error('Erreur', 'Impossible de charger les données');
          this.loading.set(false);
        }
      });
  }

  loadSpecialities(): void {
    this.specialityService.getAll({ size: 100, page: 0, isDeleted: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.specialities.set(response.items || []);
        },
        error: (error) => {
          console.error('Erreur chargement spécialités:', error);
        }
      });
  }

  getSpecialityName(specId?: number): string {
    if (!specId) return 'Non assignée';
    const spec = this.specialities().find(s => s.id === specId);
    return spec?.nom || spec?.name || spec?.specialityName || 'Inconnue';
  }

  getDifficultyLabel(level?: string): string {
    const labels: Record<string, string> = { EASY: 'Facile', MEDIUM: 'Moyen', HARD: 'Difficile' };
    return labels[level || ''] || level || 'N/A';
  }

  getDifficultyClass(level?: string): string {
    return 'difficulty--' + (level || 'medium').toLowerCase();
  }

  getTypeLabel(type?: string): string {
    const normalizedType = this.normalizeQuestionType(type);
    return this.QUESTION_TYPE_LABELS[normalizedType] || normalizedType;
  }

  getAnswerTypeLabel(type?: string): string {
    const normalizedType = (type || 'TEXT').trim().toUpperCase();

    switch (normalizedType) {
      case 'IMAGE':
        return 'Image';
      case 'CODE':
        return 'Code';
      default:
        return 'Texte';
    }
  }

  private normalizeQuestionType(questionType?: string): string {
    const normalized = (questionType || '').trim().toUpperCase();

    switch (normalized) {
      case 'QCU':
        return 'SINGLE_CHOICE';
      case 'QCM':
        return 'MULTIPLE_CHOICE';
      case 'OPEN':
        return 'TEXT';
      case 'TRUE_FALSE':
      case 'TEXT':
      case 'SINGLE_CHOICE':
      case 'MULTIPLE_CHOICE':
        return normalized;
      default:
        return 'MULTIPLE_CHOICE';
    }
  }

  openCreateModal(): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.isEditMode.set(false);
    this.formVersionQuestionContext.set(null);
    this.questionForm.set({
      questionText: '', questionType: 'MULTIPLE_CHOICE', difficultyLevel: 'MEDIUM', score: 1, questionChrono: 60
    });
    this.deletedQuestionAnswerIds.set([]);
    this.initializeQuestionDraftAnswers('MULTIPLE_CHOICE');
    this.originalQuestionFormSnapshot = null;
    this.originalQuestionAnswerSnapshot = [];
    this.showCreateEditModal.set(true);
  }

  openEditModal(q: Question, formVersionId?: number): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.isEditMode.set(true);
    this.selectedQuestion.set(q);
    this.questionForm.set({
      id: q.id,
      questionText: q.questionText || '',
      questionType: this.normalizeQuestionType(q.questionType),
      difficultyLevel: q.difficultyLevel || 'MEDIUM',
      score: q.score || 1,
      questionChrono: q.questionChrono || 60,
      specialityId: q.specialityId
    });
    this.deletedQuestionAnswerIds.set([]);
    this.initializeQuestionDraftAnswers(q.questionType, this.answersForQuestion(q.id ?? 0));
    this.formVersionQuestionContext.set(formVersionId && q.id ? { formVersionId, questionId: q.id } : null);
    this.originalQuestionFormSnapshot = { ...this.questionForm() };
    this.originalQuestionAnswerSnapshot = this.questionDraftAnswers().map(draft => ({ ...draft }));
    this.showCreateEditModal.set(true);
  }

  closeCreateEditModal(): void {
    this.showCreateEditModal.set(false);
    this.questionDraftAnswers.set([]);
    this.deletedQuestionAnswerIds.set([]);
    this.selectedQuestion.set(null);
    this.formVersionQuestionContext.set(null);
    this.originalQuestionFormSnapshot = null;
    this.originalQuestionAnswerSnapshot = [];
  }

  openDeleteModal(q: Question): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.selectedQuestion.set(q);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.selectedQuestion.set(null);
  }

  saveQuestion(): void {
    const form = this.questionForm();
    const normalizedQuestionType = this.normalizeQuestionType(form.questionType);

    if (!form.questionText.trim()) {
      this.notificationService.error('Erreur', 'Le texte de la question est obligatoire');
      return;
    }

    if (!form.specialityId) {
      this.notificationService.error('Erreur', 'La spécialité est obligatoire');
      return;
    }

    const answerValidationError = this.validateQuestionDraftAnswers(normalizedQuestionType);
    if (answerValidationError) {
      this.notificationService.error('Erreur', answerValidationError);
      return;
    }

    this.loading.set(true);
    const payload: Partial<Question> = {
      questionText: form.questionText.trim(),
      questionType: normalizedQuestionType,
      difficultyLevel: form.difficultyLevel,
      score: form.score,
      questionChrono: form.questionChrono,
      specialityId: form.specialityId
    };

    let questionPersisted = false;
    let questionWasIsolated = false;

    this.resolveQuestionIdForSave(normalizedQuestionType)
      .pipe(
        takeUntil(this.destroy$),
        switchMap((targetQuestionId) => {
          questionWasIsolated = Boolean(this.isEditMode() && form.id && targetQuestionId && targetQuestionId !== form.id);

          const request$ = this.isEditMode() && targetQuestionId
            ? this.questionService.update({ ...payload, id: targetQuestionId })
            : this.questionService.create(payload);

          return request$.pipe(
            switchMap((response) => {
              questionPersisted = true;
              const questionId = targetQuestionId ?? form.id ?? this.extractQuestionId(response);

              if (!questionId) {
                throw new Error('Impossible de déterminer l\'identifiant de la question sauvegardée');
              }

              return this.syncQuestionAnswers(questionId, normalizedQuestionType).pipe(map(() => questionId));
            })
          );
        })
      )
      .subscribe({
        next: () => {
          this.notificationService.success(
            'Succès',
            questionWasIsolated
              ? 'Question isolée puis mise à jour avec succès'
              : this.isEditMode()
                ? 'Question mise à jour avec succès'
                : 'Question créée avec succès'
          );
          this.closeCreateEditModal();
          this.loadQuestions();
        },
        error: (error) => {
          console.error('Erreur sauvegarde question:', error);
          this.notificationService.error(
            'Erreur',
            questionPersisted
              ? 'La question a été sauvegardée, mais la synchronisation des réponses a échoué'
              : 'Impossible de sauvegarder la question'
          );
          this.loading.set(false);
        }
      });
  }

  confirmDelete(): void {
    const q = this.selectedQuestion();
    if (!q?.id) return;

    if (this.selectedQuestionHasActiveAnswers()) {
      const answerCount = this.selectedQuestionActiveAnswerCount();
      const answerLabel = answerCount > 1 ? 'reponses actives' : 'reponse active';
      this.notificationService.warning(
        'Suppression bloquee',
        `Cette question possède encore ${answerCount} ${answerLabel}. Supprimez-les d'abord ou convertissez la question en texte libre pour les purger.`
      );
      return;
    }

    this.loading.set(true);
    this.questionService.delete(q.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succès', 'Question supprimée avec succès');
          this.closeDeleteModal();
          this.loadQuestions();
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          this.notificationService.error('Erreur', 'Impossible de supprimer la question');
          this.loading.set(false);
        }
      });
  }

  updateFormField(field: keyof QuestionFormData, value: any): void {
    this.questionForm.update(form => ({
      ...form,
      [field]: field === 'questionType' ? this.normalizeQuestionType(value) : value
    }));

    if (field === 'questionType') {
      this.syncQuestionDraftAnswersWithQuestionType(this.normalizeQuestionType(value));
    }
  }

  addQuestionDraftAnswer(): void {
    if (!this.questionModalSupportsPredefinedAnswers() || this.questionModalIsTrueFalse()) {
      return;
    }

    this.questionDraftAnswers.update(drafts => {
      const nextOrder = Math.max(0, ...drafts.map(draft => draft.answerOrder || 0)) + 1;
      return this.sortQuestionDraftAnswers([...drafts, this.createQuestionDraftAnswer({ answerOrder: nextOrder })]);
    });
  }

  removeQuestionDraftAnswer(draftId: string): void {
    if (this.questionModalIsTrueFalse() && this.questionDraftAnswers().length <= 2) {
      this.notificationService.warning('Suppression bloquée', 'Une question Vrai/Faux doit conserver deux réponses prédéfinies');
      return;
    }

    const draftToRemove = this.questionDraftAnswers().find(draft => draft.draftId === draftId);
    if (draftToRemove?.id) {
      this.deletedQuestionAnswerIds.update(ids => ids.includes(draftToRemove.id!) ? ids : [...ids, draftToRemove.id!]);
    }

    this.questionDraftAnswers.update(drafts => this.sortQuestionDraftAnswers(drafts.filter(draft => draft.draftId !== draftId)));
  }

  updateQuestionDraftAnswer(fieldDraftId: string, field: keyof QuestionDraftAnswer, value: string | number | boolean): void {
    const questionType = this.normalizeQuestionType(this.questionForm().questionType);
    const exclusiveCorrectAnswer = questionType === 'SINGLE_CHOICE' || questionType === 'TRUE_FALSE';

    this.questionDraftAnswers.update(drafts => {
      let nextDrafts = drafts.map(draft => {
        if (draft.draftId !== fieldDraftId) {
          return exclusiveCorrectAnswer && field === 'isCorrect' && value === true
            ? { ...draft, isCorrect: false }
            : draft;
        }

        const nextDraft: QuestionDraftAnswer = {
          ...draft,
          [field]: value
        } as QuestionDraftAnswer;

        if (field === 'allowAdditionalComment' && value !== true) {
          nextDraft.additionalCommentRequired = false;
          nextDraft.additionalCommentPlaceholder = '';
        }

        if (field === 'additionalCommentRequired' && value === true) {
          nextDraft.allowAdditionalComment = true;
        }

        return nextDraft;
      });

      if (field === 'answerOrder') {
        nextDrafts = this.sortQuestionDraftAnswers(nextDrafts);
      }

      if (questionType === 'TRUE_FALSE') {
        nextDrafts = this.buildTrueFalseDraftAnswers(nextDrafts);
      }

      return nextDrafts;
    });
  }

  private createQuestionDraftAnswer(overrides: Partial<QuestionDraftAnswer> = {}): QuestionDraftAnswer {
    return {
      draftId: overrides.draftId || this.createDraftId(),
      id: overrides.id,
      answerText: overrides.answerText || '',
      answerType: overrides.answerType || 'TEXT',
      allowAdditionalComment: overrides.allowAdditionalComment === true,
      additionalCommentRequired: overrides.additionalCommentRequired === true,
      additionalCommentPlaceholder: overrides.additionalCommentPlaceholder || '',
      answerOrder: overrides.answerOrder || 1,
      isCorrect: overrides.isCorrect === true
    };
  }

  private createDraftId(): string {
    return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private initializeQuestionDraftAnswers(questionType?: string, existingAnswers: Answer[] = []): void {
    const normalizedQuestionType = this.normalizeQuestionType(questionType);
    const mappedAnswers = existingAnswers.map(answer => this.createQuestionDraftAnswer({
      draftId: `existing-${answer.id || this.createDraftId()}`,
      id: answer.id,
      answerText: answer.answerText || '',
      answerType: answer.answerType || 'TEXT',
      allowAdditionalComment: answer.allowAdditionalComment === true,
      additionalCommentRequired: answer.additionalCommentRequired === true,
      additionalCommentPlaceholder: answer.additionalCommentPlaceholder || '',
      answerOrder: answer.answerOrder || 1,
      isCorrect: answer.isCorrect === true
    }));

    if (normalizedQuestionType === 'TRUE_FALSE') {
      if (mappedAnswers.length === 0) {
        this.questionDraftAnswers.set([
          this.createQuestionDraftAnswer({ answerText: 'Vrai', answerOrder: 1, isCorrect: true }),
          this.createQuestionDraftAnswer({ answerText: 'Faux', answerOrder: 2, isCorrect: false })
        ]);
        return;
      }

      this.questionDraftAnswers.set(this.buildTrueFalseDraftAnswers(mappedAnswers));
      return;
    }

    if (normalizedQuestionType !== 'TEXT' && mappedAnswers.length === 0) {
      this.questionDraftAnswers.set(this.sortQuestionDraftAnswers([
        this.createQuestionDraftAnswer({ answerOrder: 1 }),
        this.createQuestionDraftAnswer({ answerOrder: 2 })
      ]));
      return;
    }

    this.questionDraftAnswers.set(this.sortQuestionDraftAnswers(mappedAnswers));
  }

  private syncQuestionDraftAnswersWithQuestionType(questionType: string): void {
    if (questionType === 'TEXT') {
      return;
    }

    if (questionType === 'TRUE_FALSE') {
      const sortedDrafts = this.sortQuestionDraftAnswers(this.questionDraftAnswers());
      const extraIds = sortedDrafts.slice(2)
        .map(draft => draft.id)
        .filter((id): id is number => typeof id === 'number');

      if (extraIds.length > 0) {
        this.deletedQuestionAnswerIds.update(ids => Array.from(new Set([...ids, ...extraIds])));
      }

      this.questionDraftAnswers.set(this.buildTrueFalseDraftAnswers(sortedDrafts.slice(0, 2)));
      return;
    }

    if (this.questionDraftAnswers().length === 0) {
      this.initializeQuestionDraftAnswers(questionType);
      return;
    }

    if (questionType === 'SINGLE_CHOICE') {
      this.questionDraftAnswers.set(this.normalizeExclusiveCorrectAnswers(this.questionDraftAnswers()));
    }
  }

  private buildTrueFalseDraftAnswers(existingDrafts: QuestionDraftAnswer[]): QuestionDraftAnswer[] {
    const trueDraft = existingDrafts[0]
      ? { ...existingDrafts[0], answerText: 'Vrai', answerOrder: 1 }
      : this.createQuestionDraftAnswer({ answerText: 'Vrai', answerOrder: 1, isCorrect: true });
    const falseDraft = existingDrafts[1]
      ? { ...existingDrafts[1], answerText: 'Faux', answerOrder: 2 }
      : this.createQuestionDraftAnswer({ answerText: 'Faux', answerOrder: 2, isCorrect: false });

    return this.normalizeExclusiveCorrectAnswers([trueDraft, falseDraft]);
  }

  private normalizeExclusiveCorrectAnswers(drafts: QuestionDraftAnswer[]): QuestionDraftAnswer[] {
    let correctAnswerFound = false;

    return this.sortQuestionDraftAnswers(drafts).map((draft, index) => {
      const nextIsCorrect = draft.isCorrect === true && !correctAnswerFound;
      correctAnswerFound = correctAnswerFound || nextIsCorrect;

      return {
        ...draft,
        answerOrder: index + 1,
        isCorrect: nextIsCorrect
      };
    });
  }

  private sortQuestionDraftAnswers(drafts: QuestionDraftAnswer[]): QuestionDraftAnswer[] {
    return [...drafts].sort((left, right) => (left.answerOrder || 0) - (right.answerOrder || 0) || left.draftId.localeCompare(right.draftId));
  }

  private validateQuestionDraftAnswers(questionType: string): string | null {
    if (questionType === 'TEXT') {
      return null;
    }

    const drafts = this.sortQuestionDraftAnswers(this.questionDraftAnswers());
    const correctAnswersCount = drafts.filter(draft => draft.isCorrect).length;

    if (drafts.length < 2) {
      return 'Ajoutez au moins deux réponses prédéfinies';
    }

    if (drafts.some(draft => !draft.answerText.trim())) {
      return 'Le texte de chaque réponse est obligatoire';
    }

    if (questionType === 'TRUE_FALSE') {
      if (drafts.length !== 2) {
        return 'Une question Vrai/Faux doit contenir exactement deux réponses';
      }

      if (correctAnswersCount !== 1) {
        return 'Une question Vrai/Faux doit contenir exactement une réponse correcte';
      }

      return null;
    }

    if (questionType === 'SINGLE_CHOICE' && correctAnswersCount !== 1) {
      return 'Une question à choix unique doit contenir exactement une réponse correcte';
    }

    if (questionType === 'MULTIPLE_CHOICE' && correctAnswersCount < 1) {
      return 'Une question à choix multiple doit contenir au moins une réponse correcte';
    }

    return null;
  }

  private syncQuestionAnswers(questionId: number, questionType: string): Observable<void> {
    const operations: Observable<unknown>[] = [];
    const deletedIds = new Set(this.deletedQuestionAnswerIds());
    const existingAnswerIds = this.answersForQuestion(questionId)
      .map(answer => answer.id)
      .filter((id): id is number => typeof id === 'number');

    if (questionType === 'TEXT') {
      existingAnswerIds.forEach(id => deletedIds.add(id));
    }

    deletedIds.forEach(id => {
      operations.push(this.answerService.delete(id));
    });

    if (questionType !== 'TEXT') {
      this.sortQuestionDraftAnswers(this.questionDraftAnswers()).forEach(draft => {
        const payload: Partial<Answer> = {
          answerText: draft.answerText.trim(),
          answerType: draft.answerType,
          allowAdditionalComment: draft.allowAdditionalComment,
          additionalCommentRequired: draft.allowAdditionalComment ? draft.additionalCommentRequired : false,
          additionalCommentPlaceholder: draft.allowAdditionalComment ? draft.additionalCommentPlaceholder : undefined,
          answerOrder: draft.answerOrder,
          isCorrect: draft.isCorrect,
          questionId
        };

        if (draft.id) {
          operations.push(this.answerService.update({ ...payload, id: draft.id }));
        } else {
          operations.push(this.answerService.create(payload));
        }
      });
    }

    if (operations.length === 0) {
      return of(undefined);
    }

    return forkJoin(operations).pipe(map(() => undefined));
  }

  private extractQuestionId(response: any): number | undefined {
    const item = response?.item || response?.items?.[0];
    return typeof item?.id === 'number' ? item.id : undefined;
  }

  private extractEditableQuestionId(response: any): number | undefined {
    const item = response?.item || response?.items?.[0];
    return typeof item?.questionId === 'number' ? item.questionId : undefined;
  }

  private resolveQuestionIdForSave(normalizedQuestionType: string): Observable<number | undefined> {
    const form = this.questionForm();
    if (!this.isEditMode() || !form.id) {
      return of(undefined);
    }

    const context = this.formVersionQuestionContext();
    if (!context || context.questionId !== form.id || !this.hasStructuralContextualChanges(normalizedQuestionType)) {
      return of(form.id);
    }

    return this.formVersionService.custom('ensureEditableQuestion', context.formVersionId, form.id).pipe(
      map(response => this.extractEditableQuestionId(response) ?? form.id)
    );
  }

  private hasStructuralContextualChanges(normalizedQuestionType: string): boolean {
    return this.hasStructuralQuestionChanges(normalizedQuestionType) || this.hasStructuralAnswerChanges(normalizedQuestionType);
  }

  private hasStructuralQuestionChanges(normalizedQuestionType: string): boolean {
    const original = this.originalQuestionFormSnapshot;
    const current = this.questionForm();
    if (!original) {
      return false;
    }

    if (current.questionText.trim() !== original.questionText.trim()) {
      return true;
    }

    if (normalizedQuestionType !== this.normalizeQuestionType(original.questionType)) {
      return true;
    }

    if ((current.questionChrono ?? 0) !== (original.questionChrono ?? 0)) {
      return true;
    }

    return (current.score ?? 0) !== (original.score ?? 0);
  }

  private hasStructuralAnswerChanges(normalizedQuestionType: string): boolean {
    const original = this.originalQuestionFormSnapshot;
    if (!original || normalizedQuestionType !== this.normalizeQuestionType(original.questionType) || normalizedQuestionType === 'TEXT') {
      return false;
    }

    const originalAnswers = this.normalizeStructuralDraftAnswers(this.originalQuestionAnswerSnapshot);
    const currentAnswers = this.normalizeStructuralDraftAnswers(this.questionDraftAnswers());
    if (originalAnswers.length !== currentAnswers.length) {
      return true;
    }

    for (let index = 0; index < originalAnswers.length; index++) {
      const originalAnswer = originalAnswers[index];
      const currentAnswer = currentAnswers[index];
      if (!currentAnswer
        || originalAnswer.id !== currentAnswer.id
        || originalAnswer.answerText !== currentAnswer.answerText
        || originalAnswer.answerType !== currentAnswer.answerType
        || originalAnswer.answerOrder !== currentAnswer.answerOrder
        || originalAnswer.isCorrect !== currentAnswer.isCorrect) {
        return true;
      }
    }

    return false;
  }

  private normalizeStructuralDraftAnswers(drafts: QuestionDraftAnswer[]): Array<{
    id: number | null;
    answerText: string;
    answerType: string;
    answerOrder: number;
    isCorrect: boolean;
  }> {
    return this.sortQuestionDraftAnswers(drafts).map(draft => ({
      id: typeof draft.id === 'number' ? draft.id : null,
      answerText: draft.answerText.trim(),
      answerType: (draft.answerType || 'TEXT').trim().toUpperCase(),
      answerOrder: draft.answerOrder || 0,
      isCorrect: draft.isCorrect === true
    }));
  }

  private tryOpenContextualQuestionEdit(): void {
    if (!this.pendingFormVersionQuestionContext || !this.isAdminModeEnabled()) {
      return;
    }

    const question = this.questions().find(item => item.id === this.pendingFormVersionQuestionContext?.questionId);
    if (!question) {
      return;
    }

    const context = this.pendingFormVersionQuestionContext;
    this.pendingFormVersionQuestionContext = null;
    this.openEditModal(question, context.formVersionId);
  }

  private parsePositiveInteger(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  // ─── Answer modals ──────────────────────────────────────────────────────────

  openAddAnswerModal(questionId: number): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.isAnswerEditMode.set(false);
    const existing = this.answersForQuestion(questionId);
    this.answerForm.set({
      answerText: '',
      answerType: 'TEXT',
      allowAdditionalComment: false,
      additionalCommentRequired: false,
      additionalCommentPlaceholder: '',
      answerOrder: existing.length + 1,
      isCorrect: false,
      questionId
    });
    this.showAnswerModal.set(true);
  }

  openEditAnswerModal(a: Answer): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.isAnswerEditMode.set(true);
    this.selectedAnswer.set(a);
    this.answerForm.set({
      id: a.id,
      answerText: a.answerText || '',
      answerType: a.answerType || 'TEXT',
      allowAdditionalComment: a.allowAdditionalComment ?? false,
      additionalCommentRequired: a.additionalCommentRequired ?? false,
      additionalCommentPlaceholder: a.additionalCommentPlaceholder || '',
      answerOrder: a.answerOrder || 1,
      isCorrect: a.isCorrect || false,
      questionId: a.questionId
    });
    this.showAnswerModal.set(true);
  }

  closeAnswerModal(): void {
    this.showAnswerModal.set(false);
    this.selectedAnswer.set(null);
  }

  openDeleteAnswerModal(a: Answer): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.selectedAnswer.set(a);
    this.showAnswerDeleteModal.set(true);
  }

  closeDeleteAnswerModal(): void {
    this.showAnswerDeleteModal.set(false);
    this.selectedAnswer.set(null);
  }

  saveAnswer(): void {
    const form = this.answerForm();
    if (!form.answerText.trim()) {
      this.notificationService.error('Erreur', 'Le texte de la réponse est obligatoire');
      return;
    }
    const payload: Partial<Answer> = {
      answerText: form.answerText.trim(),
      answerType: form.answerType,
      allowAdditionalComment: form.allowAdditionalComment,
      additionalCommentRequired: form.allowAdditionalComment ? form.additionalCommentRequired : false,
      additionalCommentPlaceholder: form.allowAdditionalComment ? form.additionalCommentPlaceholder : undefined,
      answerOrder: form.answerOrder,
      isCorrect: form.isCorrect,
      questionId: form.questionId
    };
    if (this.isAnswerEditMode() && form.id) {
      this.answerService.update({ ...payload, id: form.id })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Succès', 'Réponse modifiée');
            this.closeAnswerModal();
            this.reloadAnswers();
          },
          error: (error) => {
            console.error('Erreur modification réponse:', error);
            this.notificationService.error('Erreur', 'Impossible de modifier la réponse');
          }
        });
    } else {
      this.answerService.create(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Succès', 'Réponse ajoutée');
            this.closeAnswerModal();
            this.reloadAnswers();
          },
          error: (error) => {
            console.error('Erreur création réponse:', error);
            this.notificationService.error('Erreur', 'Impossible de créer la réponse');
          }
        });
    }
  }

  confirmDeleteAnswer(): void {
    const a = this.selectedAnswer();
    if (!a?.id) return;
    this.answerService.delete(a.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succès', 'Réponse supprimée');
          this.closeDeleteAnswerModal();
          this.reloadAnswers();
        },
        error: (error) => {
          console.error('Erreur suppression réponse:', error);
          this.notificationService.error('Erreur', 'Impossible de supprimer la réponse');
        }
      });
  }

  updateAnswerFormField(field: keyof AnswerFormData, value: any): void {
    this.answerForm.update(form => {
      const nextForm = { ...form, [field]: value };

      if (field === 'allowAdditionalComment' && value !== true) {
        nextForm.additionalCommentRequired = false;
        nextForm.additionalCommentPlaceholder = '';
      }

      if (field === 'additionalCommentRequired' && value === true) {
        nextForm.allowAdditionalComment = true;
      }

      return nextForm;
    });
  }

  private reloadAnswers(): void {
    this.answerService.getAllByCriteria({ size: 1000, page: 0, isDeleted: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.answers.set(response.content || []);
        },
        error: (error) => {
          console.error('Erreur rechargement réponses:', error);
        }
      });
  }
}
