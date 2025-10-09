import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../core/services/application.service';

interface Answer {
  id: number;
  answerContent: string;
}

interface Question {
  id: number;
  questionContent: string;
  answers: Answer[];
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
    
    if (!applicationId) {
      this.isLoading.set(false);
      this.hasError.set(true);
      this.errorMessage.set('ID de l\'application manquant');
      return;
    }

    this.loadQuiz(parseInt(applicationId, 10));
  }

  private loadQuiz(applicationId: number): void {
    this.applicationService.getQuiz(applicationId).subscribe({
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
    const answers = new Map(this.selectedAnswers());
    answers.set(questionId, answerId);
    this.selectedAnswers.set(answers);
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

  private submitQuiz(): void {
    // TODO: Implémenter la soumission des réponses au backend
    console.log('Réponses sélectionnées:', this.selectedAnswers());
    
    // Pour l'instant, on marque simplement le quiz comme complété
    this.quizCompleted.set(true);
    
    // Plus tard: appeler l'API pour sauvegarder les réponses
    // this.applicationService.submitQuizAnswers(...)
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
