import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { QuestionService, Question } from '../../../core/services/question.service';
import { AnswerService, Answer } from '../../../core/services/answer.service';
import { SpecialityService, Speciality } from '../../../core/services/speciality.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

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
  answerOrder: number;
  isCorrect: boolean;
  questionId?: number;
}

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './questions.html',
  styleUrls: ['./questions.scss']
})
export class QuestionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  questions = signal<Question[]>([]);
  specialities = signal<Speciality[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  filterStatus = signal<'all' | 'active' | 'deleted'>('all');
  filterDifficulty = signal<string | null>(null);
  filterType = signal<string | null>(null);

  // Modals
  showCreateEditModal = signal(false);
  showDeleteModal = signal(false);

  // Form
  questionForm = signal<QuestionFormData>({
    questionText: '', questionType: 'QCM', difficultyLevel: 'MEDIUM', score: 1, questionChrono: 60
  });
  isEditMode = signal(false);
  selectedQuestion = signal<Question | null>(null);

  // Answers inline
  answers = signal<Answer[]>([]);
  collapsedQuestions = signal<Set<number>>(new Set());

  // Pagination
  private readonly PAGE_SIZE = 10;
  currentPage = signal(0);

  // Answer modals
  showAnswerModal = signal(false);
  showAnswerDeleteModal = signal(false);
  answerForm = signal<AnswerFormData>({ answerText: '', answerType: 'TEXT', answerOrder: 1, isCorrect: false });
  isAnswerEditMode = signal(false);
  selectedAnswer = signal<Answer | null>(null);

  // Admin mode
  currentUser = computed(() => this.authService.getCurrentUser());
  isAdminModeEnabled = signal(false);

  difficultyLevels = ['EASY', 'MEDIUM', 'HARD'];
  questionTypes = ['QCM', 'QCU', 'TRUE_FALSE', 'OPEN'];
  answerTypes = ['TEXT', 'CODE', 'IMAGE'];

  constructor(
    private questionService: QuestionService,
    private answerService: AnswerService,
    private specialityService: SpecialityService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    effect(() => {
      const user = this.currentUser();
      this.isAdminModeEnabled.set(user?.adminMode || false);
    });
    effect(() => {
      this.searchQuery();
      this.filterStatus();
      this.filterDifficulty();
      this.filterType();
      this.currentPage.set(0);
    });
  }

  ngOnInit(): void {
    this.loadAll();
    this.loadSpecialities();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  filteredQuestions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const status = this.filterStatus();
    const difficulty = this.filterDifficulty();
    const type = this.filterType();
    let filtered = this.questions();

    if (query) {
      filtered = filtered.filter(q =>
        (q.questionText || '').toLowerCase().includes(query) ||
        (q.questionRef || '').toLowerCase().includes(query)
      );
    }

    if (status === 'active') {
      filtered = filtered.filter(q => !q.isDeleted);
    } else if (status === 'deleted') {
      filtered = filtered.filter(q => q.isDeleted);
    }

    if (difficulty) {
      filtered = filtered.filter(q => q.difficultyLevel === difficulty);
    }

    if (type) {
      filtered = filtered.filter(q => q.questionType === type);
    }

    return filtered;
  });

  activeCount = computed(() => this.questions().filter(q => !q.isDeleted).length);
  deletedCount = computed(() => this.questions().filter(q => q.isDeleted).length);

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
    return this.answers().filter(a => a.questionId === questionId);
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
      questions: this.questionService.getAllByCriteria({ size: 500, page: 0 }),
      answers: this.answerService.getAllByCriteria({ size: 1000, page: 0 })
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ questions, answers }) => {
          this.questions.set(questions.content || []);
          this.answers.set(answers.content || []);
          this.loading.set(false);
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
      questions: this.questionService.getAllByCriteria({ size: 500, page: 0 }),
      answers: this.answerService.getAllByCriteria({ size: 1000, page: 0 })
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ questions, answers }) => {
          this.questions.set(questions.content || []);
          this.answers.set(answers.content || []);
          this.loading.set(false);
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
    const labels: Record<string, string> = { QCM: 'QCM', QCU: 'QCU', TRUE_FALSE: 'Vrai/Faux', OPEN: 'Ouverte' };
    return labels[type || ''] || type || 'N/A';
  }

  openCreateModal(): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.isEditMode.set(false);
    this.questionForm.set({
      questionText: '', questionType: 'QCM', difficultyLevel: 'MEDIUM', score: 1, questionChrono: 60
    });
    this.showCreateEditModal.set(true);
  }

  openEditModal(q: Question): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.isEditMode.set(true);
    this.selectedQuestion.set(q);
    this.questionForm.set({
      id: q.id,
      questionText: q.questionText || '',
      questionType: q.questionType || 'QCM',
      difficultyLevel: q.difficultyLevel || 'MEDIUM',
      score: q.score || 1,
      questionChrono: q.questionChrono || 60,
      specialityId: q.specialityId
    });
    this.showCreateEditModal.set(true);
  }

  closeCreateEditModal(): void {
    this.showCreateEditModal.set(false);
    this.selectedQuestion.set(null);
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
    if (!form.questionText.trim()) {
      this.notificationService.error('Erreur', 'Le texte de la question est obligatoire');
      return;
    }

    this.loading.set(true);
    const payload: Partial<Question> = {
      questionText: form.questionText.trim(),
      questionType: form.questionType,
      difficultyLevel: form.difficultyLevel,
      score: form.score,
      questionChrono: form.questionChrono,
      specialityId: form.specialityId
    };

    if (this.isEditMode() && form.id) {
      this.questionService.update({ ...payload, id: form.id })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Succès', 'Question modifiée avec succès');
            this.closeCreateEditModal();
            this.loadQuestions();
          },
          error: (error) => {
            console.error('Erreur modification:', error);
            this.notificationService.error('Erreur', 'Impossible de modifier la question');
            this.loading.set(false);
          }
        });
    } else {
      this.questionService.create(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Succès', 'Question créée avec succès');
            this.closeCreateEditModal();
            this.loadQuestions();
          },
          error: (error) => {
            console.error('Erreur création:', error);
            this.notificationService.error('Erreur', 'Impossible de créer la question');
            this.loading.set(false);
          }
        });
    }
  }

  confirmDelete(): void {
    const q = this.selectedQuestion();
    if (!q?.id) return;

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

  restoreQuestion(q: Question): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    if (!q.id) return;
    this.questionService.restore(q.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succès', 'Question restaurée');
          this.loadQuestions();
        },
        error: (error) => {
          console.error('Erreur restauration:', error);
          this.notificationService.error('Erreur', 'Impossible de restaurer la question');
        }
      });
  }

  updateFormField(field: keyof QuestionFormData, value: any): void {
    this.questionForm.update(form => ({ ...form, [field]: value }));
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

  restoreAnswer(a: Answer): void {
    if (!a.id) return;
    this.answerService.restore(a.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succès', 'Réponse restaurée');
          this.reloadAnswers();
        },
        error: (error) => {
          console.error('Erreur restauration réponse:', error);
          this.notificationService.error('Erreur', 'Impossible de restaurer la réponse');
        }
      });
  }

  updateAnswerFormField(field: keyof AnswerFormData, value: any): void {
    this.answerForm.update(form => ({ ...form, [field]: value }));
  }

  private reloadAnswers(): void {
    this.answerService.getAllByCriteria({ size: 1000, page: 0 })
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
