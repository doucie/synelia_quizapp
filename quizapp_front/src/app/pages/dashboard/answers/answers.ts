import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AnswerService, Answer } from '../../../core/services/answer.service';
import { QuestionService, Question } from '../../../core/services/question.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

interface AnswerFormData {
  id?: number;
  answerText: string;
  answerType: string;
  answerOrder: number;
  isCorrect: boolean;
  questionId?: number;
}

@Component({
  selector: 'app-answers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './answers.html',
  styleUrls: ['./answers.scss']
})
export class AnswersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  answers = signal<Answer[]>([]);
  questions = signal<Question[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  filterStatus = signal<'all' | 'active' | 'deleted'>('all');
  filterCorrect = signal<boolean | null>(null);
  filterQuestionId = signal<number | null>(null);

  // Modals
  showCreateEditModal = signal(false);
  showDeleteModal = signal(false);

  // Form
  answerForm = signal<AnswerFormData>({ answerText: '', answerType: 'TEXT', answerOrder: 1, isCorrect: false });
  isEditMode = signal(false);
  selectedAnswer = signal<Answer | null>(null);

  // Admin mode
  currentUser = computed(() => this.authService.getCurrentUser());
  isAdminModeEnabled = signal(false);

  answerTypes = ['TEXT', 'CODE', 'IMAGE'];

  constructor(
    private answerService: AnswerService,
    private questionService: QuestionService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    effect(() => {
      const user = this.currentUser();
      this.isAdminModeEnabled.set(user?.adminMode || false);
    });
  }

  ngOnInit(): void {
    this.loadAnswers();
    this.loadQuestions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  filteredAnswers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const status = this.filterStatus();
    const correct = this.filterCorrect();
    const qId = this.filterQuestionId();
    let filtered = this.answers();

    if (query) {
      filtered = filtered.filter(a =>
        (a.answerText || '').toLowerCase().includes(query)
      );
    }

    if (status === 'active') {
      filtered = filtered.filter(a => !a.isDeleted);
    } else if (status === 'deleted') {
      filtered = filtered.filter(a => a.isDeleted);
    }

    if (correct !== null) {
      filtered = filtered.filter(a => a.isCorrect === correct);
    }

    if (qId) {
      filtered = filtered.filter(a => a.questionId === qId);
    }

    return filtered;
  });

  activeCount = computed(() => this.answers().filter(a => !a.isDeleted).length);
  deletedCount = computed(() => this.answers().filter(a => a.isDeleted).length);
  correctCount = computed(() => this.answers().filter(a => a.isCorrect && !a.isDeleted).length);

  loadAnswers(): void {
    this.loading.set(true);
    this.answerService.getAllByCriteria({ size: 100, page: 0 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.answers.set(response.content || []);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Erreur chargement réponses:', error);
          this.notificationService.error('Erreur', 'Impossible de charger les réponses');
          this.loading.set(false);
        }
      });
  }

  loadQuestions(): void {
    this.questionService.getAllByCriteria({ size: 100, page: 0 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.questions.set(response.content || []);
        },
        error: (error) => {
          console.error('Erreur chargement questions:', error);
        }
      });
  }

  getQuestionText(qId?: number): string {
    if (!qId) return 'Non assignée';
    const q = this.questions().find(q => q.id === qId);
    return q?.questionText || `Question #${qId}`;
  }

  getQuestionTextShort(qId?: number): string {
    const text = this.getQuestionText(qId);
    return text.length > 60 ? text.substring(0, 60) + '...' : text;
  }

  openCreateModal(): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.isEditMode.set(false);
    this.answerForm.set({ answerText: '', answerType: 'TEXT', answerOrder: 1, isCorrect: false });
    this.showCreateEditModal.set(true);
  }

  openEditModal(a: Answer): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.isEditMode.set(true);
    this.selectedAnswer.set(a);
    this.answerForm.set({
      id: a.id,
      answerText: a.answerText || '',
      answerType: a.answerType || 'TEXT',
      answerOrder: a.answerOrder || 1,
      isCorrect: a.isCorrect || false,
      questionId: a.questionId
    });
    this.showCreateEditModal.set(true);
  }

  closeCreateEditModal(): void {
    this.showCreateEditModal.set(false);
    this.selectedAnswer.set(null);
  }

  openDeleteModal(a: Answer): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.selectedAnswer.set(a);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.selectedAnswer.set(null);
  }

  saveAnswer(): void {
    const form = this.answerForm();
    if (!form.answerText.trim()) {
      this.notificationService.error('Erreur', 'Le texte de la réponse est obligatoire');
      return;
    }

    this.loading.set(true);
    const payload: Partial<Answer> = {
      answerText: form.answerText.trim(),
      answerType: form.answerType,
      answerOrder: form.answerOrder,
      isCorrect: form.isCorrect,
      questionId: form.questionId
    };

    if (this.isEditMode() && form.id) {
      this.answerService.update({ ...payload, id: form.id })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Succès', 'Réponse modifiée avec succès');
            this.closeCreateEditModal();
            this.loadAnswers();
          },
          error: (error) => {
            console.error('Erreur modification:', error);
            this.notificationService.error('Erreur', 'Impossible de modifier la réponse');
            this.loading.set(false);
          }
        });
    } else {
      this.answerService.create(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Succès', 'Réponse créée avec succès');
            this.closeCreateEditModal();
            this.loadAnswers();
          },
          error: (error) => {
            console.error('Erreur création:', error);
            this.notificationService.error('Erreur', 'Impossible de créer la réponse');
            this.loading.set(false);
          }
        });
    }
  }

  confirmDelete(): void {
    const a = this.selectedAnswer();
    if (!a?.id) return;

    this.loading.set(true);
    this.answerService.delete(a.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succès', 'Réponse supprimée avec succès');
          this.closeDeleteModal();
          this.loadAnswers();
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          this.notificationService.error('Erreur', 'Impossible de supprimer la réponse');
          this.loading.set(false);
        }
      });
  }

  restoreAnswer(a: Answer): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    if (!a.id) return;
    this.answerService.restore(a.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succès', 'Réponse restaurée');
          this.loadAnswers();
        },
        error: (error) => {
          console.error('Erreur restauration:', error);
          this.notificationService.error('Erreur', 'Impossible de restaurer la réponse');
        }
      });
  }

  updateFormField(field: keyof AnswerFormData, value: any): void {
    this.answerForm.update(form => ({ ...form, [field]: value }));
  }
}
