import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../core/services/application.service';

interface Answer {
  id: number;
  answerContent: string;
  answerId?: number; // ID de la réponse
}

interface Question {
  id: number;
  questionContent: string;
  answers: Answer[];
  order?: number; // Ordre de la question dans la campagne
}

interface QuizData {
  applicationId: number;
  campaignId: number;
  campaignTitle: string;
  questions: Question[];
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss'
})
export class QuizComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly applicationService = inject(ApplicationService);

  // États
  isLoading = signal(true);
  hasError = signal(false);
  errorMessage = signal<string | null>(null);
  
  // Données du quiz
  quizData = signal<QuizData | null>(null);
  currentQuestionIndex = signal(0);
  selectedAnswers = signal<Map<number, number>>(new Map()); // questionId -> answerId
  
  // Données de l'application
  applicationId = signal<number | null>(null);
  quizToken = signal<string | null>(null);
  
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
    return this.selectedAnswers().has(currentQ.id);
  });

  isLastQuestion = computed(() => {
    return this.currentQuestionIndex() >= this.totalQuestions() - 1;
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
    this.quizStarted.set(true);
  }

  selectAnswer(questionId: number, answerId: number): void {
    const currentQ = this.currentQuestion();
    if (!currentQ) return;

    // Trouver l'objet Answer complet
    const selectedAnswerObj = currentQ.answers.find(a => a.id === answerId);
    if (!selectedAnswerObj) {
      console.error('Answer object not found');
      return;
    }

    // Utiliser answerId directement (ou fallback sur id)
    const answerIdToSave = selectedAnswerObj.answerId || selectedAnswerObj.id;

    // Mettre à jour l'état local immédiatement pour une meilleure UX
    const answers = new Map(this.selectedAnswers());
    answers.set(questionId, answerId);
    this.selectedAnswers.set(answers);

    // Sauvegarder la sélection en base de données
    const appId = this.applicationId();
    const token = this.quizToken();
    
    if (appId && token) {
      this.applicationService.saveQuizAnswer(
        appId, 
        token, 
        questionId, 
        answerIdToSave
      ).subscribe({
        next: (response) => {
          if (response.hasError) {
            console.error('Erreur lors de la sauvegarde:', response.status?.message);
            // On garde quand même la sélection locale pour ne pas perturber l'utilisateur
          } else {
            console.log('Réponse sauvegardée avec succès');
          }
        },
        error: (error) => {
          console.error('Erreur réseau lors de la sauvegarde:', error);
          // On garde quand même la sélection locale
        }
      });
    }
  }

  isAnswerSelected(questionId: number, answerId: number): boolean {
    return this.selectedAnswers().get(questionId) === answerId;
  }

  goToNextQuestion(): void {
    if (!this.canGoNext()) return;
    
    if (this.isLastQuestion()) {
      // Dernière question - on soumet le quiz
      this.submitQuiz();
    } else {
      // Passer à la question suivante
      this.currentQuestionIndex.set(this.currentQuestionIndex() + 1);
    }
  }

  goToPreviousQuestion(): void {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.set(this.currentQuestionIndex() - 1);
    }
  }

  submitQuiz(): void {
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
        
        if (response.hasError) {
          console.error('Erreur lors de la soumission:', response.status?.message);
          this.hasError.set(true);
          this.errorMessage.set(response.status?.message || 'Erreur lors de la soumission du quiz');
        } else {
          console.log('✅ Quiz soumis avec succès');
          this.quizCompleted.set(true);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('❌ Erreur réseau lors de la soumission:', error);
        this.hasError.set(true);
        this.errorMessage.set('Une erreur est survenue lors de la soumission du quiz');
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
