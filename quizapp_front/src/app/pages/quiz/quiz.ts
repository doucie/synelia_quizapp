import { Component, OnDestroy, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService, SaveQuizAnswerPayload } from '../../core/services/application.service';
import { ManualCorrectionStatus, normalizeManualCorrectionStatus } from '../../core/constants/manual-correction-status.constants';

interface Answer {
  id: number;
  answerContent: string;
  answerId?: number; // ID de la réponse
  allowAdditionalComment?: boolean;
  additionalCommentRequired?: boolean;
  additionalCommentPlaceholder?: string | null;
  freeTextResponse?: string | null;
}

interface Question {
  id: number;
  questionContent: string;
  questionType?: string;
  answers: Answer[];
  order?: number; // Ordre de la question dans la campagne
  selectedAnswerIds?: number[];
  freeTextResponse?: string | null;
}

interface QuizData {
  applicationId: number;
  campaignId: number;
  campaignTitle: string;
  isTimed?: boolean;
  totalTimeAllowed?: number;
  timeElapsed?: number;
  remainingTime?: number;
  quizStatus?: string;
  questions: Question[];
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss'
})
export class QuizComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly applicationService = inject(ApplicationService);
  private readonly activityEvents = ['pointerdown', 'keydown', 'mousemove', 'scroll', 'touchstart'] as const;
  private readonly activityPingIntervalMs = 30000;
  private readonly activityEventHandler = () => this.handleUserActivity();
  private readonly visibilityChangeHandler = () => {
    if (document.visibilityState === 'visible') {
      this.handleUserActivity();
    }
  };

  // États
  isLoading = signal(true);
  hasError = signal(false);
  errorMessage = signal<string | null>(null);
  
  // Données du quiz
  quizData = signal<QuizData | null>(null);
  currentQuestionIndex = signal(0);
  selectedAnswers = signal<Map<number, number[]>>(new Map()); // questionId -> answerIds
  freeTextResponses = signal<Map<number, string | null>>(new Map());
  answerComments = signal<Map<number, string | null>>(new Map());
  
  // Données de l'application
  applicationId = signal<number | null>(null);
  quizToken = signal<string | null>(null);
  quizManualCorrectionStatus = signal<ManualCorrectionStatus | null>(null);
  remainingTime = signal<number | null>(null);
  timeoutSubmissionInProgress = signal(false);
  
  // État du quiz
  quizStarted = signal(false);
  quizCompleted = signal(false);
  
  // Computed
  currentQuestion = computed(() => {
    const quiz = this.quizData();
    const index = this.currentQuestionIndex();
    if (!quiz || !quiz.questions || index >= quiz.questions.length) {
      return null;
    }
    return quiz.questions[index];
  });

  totalQuestions = computed(() => this.quizData()?.questions.length || 0);
  progress = computed(() => {
    const total = this.totalQuestions();
    if (total === 0) return 0;
    return Math.round((this.currentQuestionIndex() / total) * 100);
  });

  canGoNext = computed(() => {
    const currentQ = this.currentQuestion();
    if (!currentQ) return false;
    if (this.isTextQuestion(currentQ)) {
      return !!this.normalizeTextResponse(this.freeTextResponses().get(currentQ.id) ?? null);
    }
    const selectedIds = this.selectedAnswers().get(currentQ.id) || [];
    if (selectedIds.length === 0) {
      return false;
    }
    return this.hasRequiredAdditionalComments(currentQ);
  });

  isLastQuestion = computed(() => {
    return this.currentQuestionIndex() >= this.totalQuestions() - 1;
  });

  hasTimeLimit = computed(() => {
    const quiz = this.quizData();
    return !!quiz?.isTimed && !!quiz?.totalTimeAllowed;
  });

  timerLabel = computed(() => this.formatDuration(this.remainingTime()));

  timerTone = computed<'normal' | 'warning' | 'danger'>(() => {
    const quiz = this.quizData();
    const remaining = this.remainingTime();
    if (!quiz?.totalTimeAllowed || remaining == null) {
      return 'normal';
    }

    if (remaining <= 60) {
      return 'danger';
    }
    if (remaining <= Math.max(120, Math.floor(quiz.totalTimeAllowed * 0.25))) {
      return 'warning';
    }
    return 'normal';
  });

  ngOnInit(): void {
    const applicationId = this.route.snapshot.paramMap.get('applicationId');
    const quizToken = this.route.snapshot.paramMap.get('quizToken');
    
    if (!applicationId || !quizToken) {
      this.isLoading.set(false);
      this.hasError.set(true);
      this.errorMessage.set('Lien de quiz invalide. Veuillez utiliser le lien reçu par email.');
      return;
    }

    // Stocker les informations de l'application
    this.applicationId.set(parseInt(applicationId, 10));
    this.quizToken.set(quizToken);

    this.loadQuiz(parseInt(applicationId, 10), quizToken);
  }

  ngOnDestroy(): void {
    this.clearCountdown();
    this.unregisterActivityListeners();
  }

  private loadQuiz(applicationId: number, quizToken: string): void {
    this.applicationService.getQuiz(applicationId, quizToken).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        
        if (response.hasError || !response.items || response.items.length === 0) {
          this.hasError.set(true);
          this.errorMessage.set(
            response.status?.message || 'Impossible de charger le quiz'
          );
          return;
        }

        // Les données du quiz sont dans searchString en JSON
        const item = response.items[0];
        if (item.searchString) {
          try {
            const parsedData = JSON.parse(item.searchString) as QuizData;
            this.quizData.set(parsedData);
            this.initializeLocalState(parsedData);
            this.initializeCountdown(parsedData);
            this.lastActivityPingAt = Date.now();
            this.registerActivityListeners();
          } catch (e) {
            console.error('Erreur parsing quiz data:', e);
            this.hasError.set(true);
            this.errorMessage.set('Erreur lors du chargement du quiz');
          }
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.hasError.set(true);
        console.error('Erreur lors du chargement du quiz:', error);
        this.errorMessage.set('Une erreur est survenue. Veuillez réessayer plus tard.');
      }
    });
  }

  startQuiz(): void {
    if (this.timeoutSubmissionInProgress()) {
      return;
    }
    this.handleUserActivity(true);
    this.quizStarted.set(true);
  }

  selectAnswer(questionId: number, answerId: number): void {
    this.handleUserActivity();
    const currentQ = this.currentQuestion();
    if (!currentQ) return;

    const currentSelectedIds = this.selectedAnswers().get(questionId) || [];
    const nextSelectedIds = this.computeNextSelectedIds(currentQ, questionId, answerId);
    const removedAnswerIds = currentSelectedIds.filter(id => !nextSelectedIds.includes(id));

    if (removedAnswerIds.length > 0) {
      this.clearAnswerComments(removedAnswerIds);
    }

    this.updateSelectedAnswers(questionId, nextSelectedIds);

    this.persistQuestionAnswer(this.buildChoiceQuestionPayload(currentQ));
  }

  isAnswerSelected(questionId: number, answerId: number): boolean {
    return (this.selectedAnswers().get(questionId) || []).includes(answerId);
  }

  goToNextQuestion(): void {
    if (!this.canGoNext()) return;

    this.persistCurrentQuestionIfNeeded(() => {
      if (this.isLastQuestion()) {
        this.submitQuiz();
      } else {
        this.currentQuestionIndex.set(this.currentQuestionIndex() + 1);
      }
    });
  }

  goToPreviousQuestion(): void {
    if (this.currentQuestionIndex() > 0) {
      this.persistCurrentQuestionIfNeeded(() => {
        this.currentQuestionIndex.set(this.currentQuestionIndex() - 1);
      });
    }
  }

  submitQuiz(): void {
    this.handleUserActivity(true);
    this.persistCurrentQuestionIfNeeded(() => this.completeQuizRequest());
  }

  getFreeTextResponse(questionId: number): string {
    return this.freeTextResponses().get(questionId) ?? '';
  }

  updateFreeTextResponse(questionId: number, value: string): void {
    const nextResponses = new Map(this.freeTextResponses());
    nextResponses.set(questionId, value);
    this.freeTextResponses.set(nextResponses);
  }

  getAnswerComment(answerId: number): string {
    return this.answerComments().get(answerId) ?? '';
  }

  updateAnswerComment(answerId: number, value: string): void {
    this.handleUserActivity();
    const nextComments = new Map(this.answerComments());
    nextComments.set(answerId, value);
    this.answerComments.set(nextComments);
  }

  saveAnswerComment(questionId: number): void {
    this.handleUserActivity();
    const question = this.findQuestionById(questionId);
    if (!question) {
      return;
    }

    this.persistQuestionAnswer(this.buildChoiceQuestionPayload(question));
  }

  hasAdditionalCommentValue(answerId: number): boolean {
    return !!this.normalizeTextResponse(this.answerComments().get(answerId) ?? null);
  }

  saveFreeTextAnswer(questionId: number): void {
    this.handleUserActivity();
    this.persistQuestionAnswer({
      questionId,
      selectedAnswerIds: [],
      freeTextResponse: this.normalizeTextResponse(this.getFreeTextResponse(questionId))
    });
  }

  isTextQuestion(question: Question | null): boolean {
    return (question?.questionType || '').toUpperCase() === 'TEXT';
  }

  isMultipleChoiceQuestion(question: Question | null): boolean {
    return (question?.questionType || '').toUpperCase() === 'MULTIPLE_CHOICE';
  }

  getQuestionInstruction(question: Question | null): string {
    if (!question) return '';
    if (this.isTextQuestion(question)) {
      return 'Rédigez votre réponse. Elle sera corrigée manuellement.';
    }
    if (this.hasAdditionalCommentOption(question)) {
      return this.isMultipleChoiceQuestion(question)
        ? 'Sélectionnez une ou plusieurs réponses. Certaines options demandent une précision.'
        : 'Sélectionnez une seule réponse. Certaines options demandent une précision.';
    }
    if (this.isMultipleChoiceQuestion(question)) {
      return 'Sélectionnez une ou plusieurs réponses.';
    }
    return 'Sélectionnez une seule réponse.';
  }

  private completeQuizRequest(timeoutTriggered = false): void {
    const appId = this.applicationId();
    const token = this.quizToken();
    
    if (!appId || !token) {
      console.error('Application ID ou quiz token manquant');
      return;
    }

    // Appeler l'API pour marquer le quiz comme COMPLETED
    this.isLoading.set(true);
    
    this.applicationService.completeQuiz(appId, token).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.timeoutSubmissionInProgress.set(false);
        
        if (response.hasError) {
          console.error('Erreur lors de la soumission:', response.status?.message);
          this.hasError.set(true);
          this.errorMessage.set(
            response.status?.message || (timeoutTriggered
              ? 'Le temps est écoulé. Le quiz n’a pas pu être soumis automatiquement.'
              : 'Erreur lors de la soumission du quiz')
          );
        } else {
          console.log('✅ Quiz soumis avec succès');
          this.clearCountdown();
          this.unregisterActivityListeners();
          this.quizManualCorrectionStatus.set(normalizeManualCorrectionStatus(response.items?.[0]?.quizManualCorrectionStatus));
          this.quizCompleted.set(true);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.timeoutSubmissionInProgress.set(false);
        console.error('❌ Erreur réseau lors de la soumission:', error);
        this.hasError.set(true);
        this.errorMessage.set(
          timeoutTriggered
            ? 'Le temps est écoulé et la soumission automatique a échoué.'
            : 'Une erreur est survenue lors de la soumission du quiz'
        );
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  private initializeLocalState(quizData: QuizData): void {
    const nextSelectedAnswers = new Map<number, number[]>();
    const nextFreeTextResponses = new Map<number, string | null>();
    const nextAnswerComments = new Map<number, string | null>();

    for (const question of quizData.questions || []) {
      nextSelectedAnswers.set(question.id, [...(question.selectedAnswerIds || [])]);
      nextFreeTextResponses.set(question.id, question.freeTextResponse ?? null);

      for (const answer of question.answers || []) {
        nextAnswerComments.set(answer.id, answer.freeTextResponse ?? null);
      }
    }

    this.selectedAnswers.set(nextSelectedAnswers);
    this.freeTextResponses.set(nextFreeTextResponses);
    this.answerComments.set(nextAnswerComments);
  }

  private initializeCountdown(quizData: QuizData): void {
    this.clearCountdown();

    if (!quizData.isTimed || !quizData.totalTimeAllowed) {
      this.remainingTime.set(null);
      return;
    }

    const remainingTime = quizData.remainingTime ?? Math.max(0, quizData.totalTimeAllowed - (quizData.timeElapsed ?? 0));
    this.remainingTime.set(remainingTime);

    if (remainingTime <= 0) {
      this.handleTimeExpired();
      return;
    }

    this.countdownId = window.setInterval(() => {
      const currentRemaining = this.remainingTime();
      if (currentRemaining == null) {
        return;
      }

      if (currentRemaining <= 1) {
        this.remainingTime.set(0);
        this.clearCountdown();
        this.handleTimeExpired();
        return;
      }

      this.remainingTime.set(currentRemaining - 1);
    }, 1000);
  }

  private handleTimeExpired(): void {
    if (this.quizCompleted() || this.timeoutSubmissionInProgress()) {
      return;
    }

    this.timeoutSubmissionInProgress.set(true);
    if (!this.quizStarted()) {
      this.quizStarted.set(true);
    }
    this.completeQuizRequest(true);
  }

  private clearCountdown(): void {
    if (this.countdownId != null) {
      window.clearInterval(this.countdownId);
      this.countdownId = null;
    }
  }

  private registerActivityListeners(): void {
    if (this.activityListenersRegistered) {
      return;
    }

    for (const eventName of this.activityEvents) {
      window.addEventListener(eventName, this.activityEventHandler);
    }
    window.addEventListener('focus', this.activityEventHandler);
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    this.activityListenersRegistered = true;
  }

  private unregisterActivityListeners(): void {
    if (!this.activityListenersRegistered) {
      return;
    }

    for (const eventName of this.activityEvents) {
      window.removeEventListener(eventName, this.activityEventHandler);
    }
    window.removeEventListener('focus', this.activityEventHandler);
    document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    this.activityListenersRegistered = false;
  }

  private handleUserActivity(force = false): void {
    if (!this.quizData() || this.quizCompleted() || this.hasError() || this.timeoutSubmissionInProgress()) {
      return;
    }

    const appId = this.applicationId();
    const token = this.quizToken();
    if (!appId || !token) {
      return;
    }

    const now = Date.now();
    if (!force && now - this.lastActivityPingAt < this.activityPingIntervalMs) {
      return;
    }

    this.lastActivityPingAt = now;
    this.applicationService.touchQuiz(appId, token).subscribe({
      next: (response) => {
        if (response.hasError) {
          this.handleBlockingQuizError(response.status?.message || 'Cette session de quiz n’est plus accessible.');
        }
      },
      error: (error) => {
        console.error('Erreur lors du ping d’activité quiz:', error);
      }
    });
  }

  private handleBlockingQuizError(message: string): void {
    this.clearCountdown();
    this.unregisterActivityListeners();
    this.timeoutSubmissionInProgress.set(false);
    this.hasError.set(true);
    this.errorMessage.set(message);
  }

  private isQuizSessionBlocked(message: string | undefined): boolean {
    const normalizedMessage = (message || '').toLowerCase();
    return normalizedMessage.includes('abandonn')
      || normalizedMessage.includes('temps limite')
      || normalizedMessage.includes('déjà été complété')
      || normalizedMessage.includes('token de quiz invalide');
  }

  private computeNextSelectedIds(question: Question, questionId: number, answerId: number): number[] {
    const currentSelectedIds = [...(this.selectedAnswers().get(questionId) || [])];
    if (this.isMultipleChoiceQuestion(question)) {
      return currentSelectedIds.includes(answerId)
        ? currentSelectedIds.filter(id => id !== answerId)
        : [...currentSelectedIds, answerId];
    }
    return [answerId];
  }

  private updateSelectedAnswers(questionId: number, selectedIds: number[]): void {
    const nextSelectedAnswers = new Map(this.selectedAnswers());
    nextSelectedAnswers.set(questionId, selectedIds);
    this.selectedAnswers.set(nextSelectedAnswers);
  }

  private persistCurrentQuestionIfNeeded(onSuccess: () => void): void {
    const currentQ = this.currentQuestion();
    if (!currentQ) {
      onSuccess();
      return;
    }

    if (!this.isTextQuestion(currentQ) && !this.hasSelectedAdditionalCommentAnswer(currentQ)) {
      onSuccess();
      return;
    }

    if (!this.isTextQuestion(currentQ)) {
      this.persistQuestionAnswer(this.buildChoiceQuestionPayload(currentQ), onSuccess, true);
      return;
    }

    this.persistQuestionAnswer({
      questionId: currentQ.id,
      selectedAnswerIds: [],
      freeTextResponse: this.normalizeTextResponse(this.getFreeTextResponse(currentQ.id))
    }, onSuccess, true);
  }

  private persistQuestionAnswer(payload: SaveQuizAnswerPayload, onSuccess?: () => void, blockOnError = false): void {
    const appId = this.applicationId();
    const token = this.quizToken();

    if (!appId || !token) {
      return;
    }

    this.applicationService.saveQuizAnswer(appId, token, payload).subscribe({
      next: (response) => {
        if (response.hasError) {
          console.error('Erreur lors de la sauvegarde:', response.status?.message);
          if (this.isQuizSessionBlocked(response.status?.message)) {
            this.handleBlockingQuizError(response.status?.message || 'Cette session de quiz n’est plus accessible.');
            return;
          }
          if (blockOnError) {
            alert(response.status?.message || 'Impossible de sauvegarder votre réponse pour le moment.');
          }
          return;
        }
        onSuccess?.();
      },
      error: (error) => {
        console.error('Erreur réseau lors de la sauvegarde:', error);
        if (blockOnError) {
          alert('Une erreur est survenue lors de la sauvegarde de votre réponse.');
        }
      }
    });
  }

  private normalizeTextResponse(value: string | null | undefined): string | null {
    const normalized = (value || '').trim();
    return normalized ? normalized : null;
  }

  private hasAdditionalCommentOption(question: Question | null): boolean {
    return (question?.answers || []).some(answer => answer.allowAdditionalComment === true);
  }

  private hasSelectedAdditionalCommentAnswer(question: Question | null): boolean {
    if (!question) {
      return false;
    }

    const selectedIds = new Set(this.selectedAnswers().get(question.id) || []);
    return (question.answers || []).some(answer => selectedIds.has(answer.id) && answer.allowAdditionalComment === true);
  }

  private hasRequiredAdditionalComments(question: Question): boolean {
    const selectedIds = new Set(this.selectedAnswers().get(question.id) || []);

    return (question.answers || [])
      .filter(answer => selectedIds.has(answer.id) && answer.allowAdditionalComment === true && answer.additionalCommentRequired === true)
      .every(answer => this.hasAdditionalCommentValue(answer.id));
  }

  private clearAnswerComments(answerIds: number[]): void {
    if (answerIds.length === 0) {
      return;
    }

    const nextComments = new Map(this.answerComments());
    for (const answerId of answerIds) {
      nextComments.delete(answerId);
    }
    this.answerComments.set(nextComments);
  }

  private buildChoiceQuestionPayload(question: Question): SaveQuizAnswerPayload {
    const selectedAnswerIds = this.resolvePersistedAnswerIds(question);

    return {
      questionId: question.id,
      answerId: selectedAnswerIds.length === 1 ? selectedAnswerIds[0] : undefined,
      selectedAnswerIds,
      selectedAnswerComments: this.buildSelectedAnswerComments(question, selectedAnswerIds),
      freeTextResponse: null
    };
  }

  private resolvePersistedAnswerIds(question: Question): number[] {
    return (this.selectedAnswers().get(question.id) || [])
      .map(answerId => question.answers.find(answer => answer.id === answerId)?.answerId || answerId)
      .filter((answerId): answerId is number => Number.isFinite(answerId));
  }

  private buildSelectedAnswerComments(question: Question, selectedAnswerIds: number[]): Record<number, string | null> {
    const selectedAnswerIdSet = new Set(selectedAnswerIds);
    const selectedAnswerComments: Record<number, string | null> = {};

    for (const answer of question.answers || []) {
      const persistedAnswerId = answer.answerId || answer.id;
      if (!selectedAnswerIdSet.has(persistedAnswerId) || answer.allowAdditionalComment !== true) {
        continue;
      }

      selectedAnswerComments[persistedAnswerId] = this.normalizeTextResponse(this.getAnswerComment(answer.id));
    }

    return selectedAnswerComments;
  }

  private findQuestionById(questionId: number): Question | null {
    return this.quizData()?.questions.find(question => question.id === questionId) || null;
  }

  private formatDuration(totalSeconds: number | null): string {
    if (totalSeconds == null) {
      return 'Illimité';
    }

    const safeSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private countdownId: number | null = null;
  private lastActivityPingAt = 0;
  private activityListenersRegistered = false;
}
