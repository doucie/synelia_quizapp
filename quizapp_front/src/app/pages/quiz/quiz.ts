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
  freeTextResponsePlaceholder?: string | null;
}

interface QuizData {
  applicationId: number;
  applicationQuizAttemptId?: number;
  applicationProgressId?: number;
  campaignId: number;
  campaignTitle: string;
  isTimed?: boolean;
  totalTimeAllowed?: number;
  timeElapsed?: number;
  remainingTime?: number;
  quizStatus?: string;
  questions: Question[];
  antiCheat?: AntiCheatConfig;
}

interface AntiCheatConfig {
  enabled?: boolean;
  policy?: 'WARN' | 'FLAG' | 'FAIL';
  tabSwitchMaxWarnings?: number;
  tabSwitchMaxActions?: number;
  fullscreenRequired?: boolean;
  blockShortcuts?: boolean;
  blockCopyPaste?: boolean;
  tabSwitchCount?: number;
  fullscreenExitCount?: number;
  cheatFlagCount?: number;
  screeningMode?: string;
  screeningResult?: string;
}

interface QuizAntiCheatEvent {
  eventType: string;
  occurredAt?: string;
  metadata?: string | null;
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

  // Anti-triche (évolution 450, chantier B)
  antiCheatWarningCount = signal(0);
  antiCheatBanner = signal<string | null>(null);

  antiCheatActive = computed(() => !!this.quizData()?.antiCheat?.enabled);
  antiCheatPolicy = computed(() => this.quizData()?.antiCheat?.policy || 'WARN');
  antiCheatWarningsLeft = computed(() => {
    const maxWarnings = this.quizData()?.antiCheat?.tabSwitchMaxWarnings;
    if (!maxWarnings) {
      return null;
    }
    return Math.max(0, maxWarnings - this.antiCheatWarningCount());
  });
  
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
    this.unregisterAntiCheatListeners();
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

        // Les données du quiz sont dans quizData (JSON), fallback legacy searchString
        const item = response.items[0];
        const quizPayload = item.quizData ?? item.searchString;
        if (quizPayload) {
          try {
            const parsedData = JSON.parse(quizPayload) as QuizData;
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

    if (this.antiCheatActive()) {
      this.registerAntiCheatListeners();
      if (this.quizData()?.antiCheat?.fullscreenRequired && !document.fullscreenElement) {
        this.enterFullscreen().catch(() => { /* refus utilisateur : la sortie sera journalisée */ });
      }
    }
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
          this.quizManualCorrectionStatus.set(normalizeManualCorrectionStatus(response.items?.[0]?.quizAttempts?.[0]?.manualCorrectionStatus));
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
    if (!force && now - this.lastActivityPingAt < this.activityPingIntervalMs && this.pendingAntiCheatEvents.length === 0) {
      return;
    }

    const eventsToSend = this.pendingAntiCheatEvents;
    this.pendingAntiCheatEvents = [];

    this.lastActivityPingAt = now;
    this.applicationService.touchQuiz(appId, token, eventsToSend).subscribe({
      next: (response) => {
        if (response.hasError) {
          this.handleBlockingQuizError(response.status?.message || 'Cette session de quiz n’est plus accessible.');
          return;
        }
        this.syncAntiCheatCountersFromResponse(response.items?.[0]?.quizAttempts);
      },
      error: (error) => {
        this.pendingAntiCheatEvents = [...eventsToSend, ...this.pendingAntiCheatEvents];
        console.error('Erreur lors du ping d’activité quiz:', error);
      }
    });
  }

  private syncAntiCheatCountersFromResponse(quizAttempts: Array<{ tabSwitchCount?: number; fullscreenExitCount?: number; cheatFlagCount?: number; screeningResult?: string }> | undefined): void {
    if (!quizAttempts || quizAttempts.length === 0) {
      return;
    }

    const attempt = quizAttempts[0];
    const totalWarnings = (attempt.tabSwitchCount || 0) + (attempt.fullscreenExitCount || 0);
    this.antiCheatWarningCount.set(totalWarnings);

    if (totalWarnings === 0) {
      this.antiCheatBanner.set(null);
      return;
    }

    if (attempt.screeningResult === 'FAILED') {
      this.antiCheatBanner.set('Une infraction aux règles a été détectée. Le quiz a été soumis automatiquement.');
      return;
    }

    const policy = this.antiCheatPolicy();
    const warningsLeft = this.antiCheatWarningsLeft();

    if (policy === 'WARN' && warningsLeft != null && warningsLeft === 0) {
      this.antiCheatBanner.set('Dernier avertissement avant soumission automatique du quiz.');
    } else if (policy === 'WARN' && warningsLeft != null) {
      this.antiCheatBanner.set(`Avertissement : ${warningsLeft} sortie(s) de l'onglet tolérée(s) avant soumission automatique.`);
    } else {
      this.antiCheatBanner.set('Un changement d’onglet ou de fenêtre a été détecté. Veuillez rester sur cette page.');
    }
  }

  private handleBlockingQuizError(message: string): void {
    this.clearCountdown();
    this.unregisterActivityListeners();
    this.unregisterAntiCheatListeners();
    this.timeoutSubmissionInProgress.set(false);
    this.hasError.set(true);
    this.errorMessage.set(message);
  }

  // ─── Anti-triche : détection (chantier B) ───────────────────────────────────

  private readonly antiCheatVisibilityHandler = () => this.handleAntiCheatVisibilityChange();
  private readonly antiCheatFullscreenHandler = () => this.handleAntiCheatFullscreenChange();
  private readonly antiCheatKeydownHandler = (event: KeyboardEvent) => this.handleAntiCheatKeydown(event);
  private readonly antiCheatClipboardHandler = (event: ClipboardEvent | Event) => this.handleAntiCheatClipboard(event);

  private registerAntiCheatListeners(): void {
    if (!this.antiCheatActive() || this.antiCheatListenersRegistered) {
      return;
    }

    document.addEventListener('visibilitychange', this.antiCheatVisibilityHandler);
    document.addEventListener('fullscreenchange', this.antiCheatFullscreenHandler);
    document.addEventListener('keydown', this.antiCheatKeydownHandler);
    document.addEventListener('copy', this.antiCheatClipboardHandler);
    document.addEventListener('cut', this.antiCheatClipboardHandler);
    document.addEventListener('paste', this.antiCheatClipboardHandler);
    this.antiCheatListenersRegistered = true;
  }

  private unregisterAntiCheatListeners(): void {
    if (!this.antiCheatListenersRegistered) {
      return;
    }

    document.removeEventListener('visibilitychange', this.antiCheatVisibilityHandler);
    document.removeEventListener('fullscreenchange', this.antiCheatFullscreenHandler);
    document.removeEventListener('keydown', this.antiCheatKeydownHandler);
    document.removeEventListener('copy', this.antiCheatClipboardHandler);
    document.removeEventListener('cut', this.antiCheatClipboardHandler);
    document.removeEventListener('paste', this.antiCheatClipboardHandler);
    this.antiCheatListenersRegistered = false;
  }

  private handleAntiCheatVisibilityChange(): void {
    if (this.quizCompleted() || this.hasError() || this.timeoutSubmissionInProgress()) {
      return;
    }

    if (document.visibilityState === 'hidden' && this.quizStarted()) {
      this.recordAntiCheatEvent('TAB_SWITCH', 'visibilitychange');
    }
  }

  private handleAntiCheatFullscreenChange(): void {
    if (this.quizCompleted() || this.hasError() || this.timeoutSubmissionInProgress()) {
      return;
    }

    const fullscreenRequired = this.quizData()?.antiCheat?.fullscreenRequired;
    if (fullscreenRequired && this.quizStarted() && !document.fullscreenElement) {
      this.recordAntiCheatEvent('FULLSCREEN_EXIT', 'fullscreenchange');
      this.enterFullscreen().catch(() => {});
    }
  }

  private handleAntiCheatKeydown(event: KeyboardEvent): void {
    if (!this.quizStarted() || this.quizCompleted() || this.hasError()) {
      return;
    }

    const antiCheat = this.quizData()?.antiCheat;
    if (!antiCheat) {
      return;
    }

    const mod = event.ctrlKey || event.metaKey;
    const key = (event.key || '').toLowerCase();

    if (antiCheat.blockCopyPaste && mod && ['c', 'x', 'v'].includes(key)) {
      event.preventDefault();
      this.recordAntiCheatEvent('COPY_PASTE', `keyboard:${key}`);
      return;
    }

    if (antiCheat.blockShortcuts) {
      const navigationShortcut = mod && ['p', 's', 'u', 'f', 'n', 't', 'w'].includes(key);
      const devToolShortcut = mod && event.shiftKey && ['i', 'j', 'c', 'k'].includes(key);
      if (navigationShortcut || devToolShortcut || key === 'f12') {
        event.preventDefault();
      }
    }
  }

  private handleAntiCheatClipboard(event: ClipboardEvent | Event): void {
    if (!this.quizStarted() || this.quizCompleted() || this.hasError()) {
      return;
    }

    if (this.quizData()?.antiCheat?.blockCopyPaste) {
      event.preventDefault();
      this.recordAntiCheatEvent('COPY_PASTE', 'clipboard');
    }
  }

  private recordAntiCheatEvent(eventType: string, metadata?: string): void {
    if (!this.antiCheatActive() || this.quizCompleted() || this.hasError() || !this.quizStarted()) {
      return;
    }

    this.pendingAntiCheatEvents.push({
      eventType,
      occurredAt: this.formatServerDateTime(new Date()),
      metadata: metadata || null
    });

    this.antiCheatWarningCount.update(count => count + 1);
    this.updateAntiCheatBanner();
    this.flushAntiCheatEvents();
  }

  private flushAntiCheatEvents(): void {
    const now = Date.now();
    if (now - this.lastAntiCheatFlushAt < 2000) {
      return;
    }
    this.lastAntiCheatFlushAt = now;
    this.handleUserActivity(true);
  }

  private updateAntiCheatBanner(): void {
    const policy = this.antiCheatPolicy();
    const warningsLeft = this.antiCheatWarningsLeft();

    if (policy === 'WARN' && warningsLeft != null && warningsLeft === 0) {
      this.antiCheatBanner.set('Dernier avertissement avant soumission automatique du quiz.');
      return;
    }
    if (policy === 'WARN' && warningsLeft != null) {
      this.antiCheatBanner.set(`Avertissement : ${warningsLeft} sortie(s) de l'onglet tolérée(s) avant soumission automatique.`);
      return;
    }
    this.antiCheatBanner.set('Un changement d’onglet ou de fenêtre a été détecté. Veuillez rester sur cette page.');
  }

  private enterFullscreen(): Promise<void> {
    const rootElement = document.documentElement;
    if (rootElement.requestFullscreen) {
      return rootElement.requestFullscreen();
    }
    return Promise.resolve();
  }

  private formatServerDateTime(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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
  private antiCheatListenersRegistered = false;
  private lastAntiCheatFlushAt = 0;
  private pendingAntiCheatEvents: QuizAntiCheatEvent[] = [];
}
