import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Quiz } from '../../../shared/models/interfaces';

@Component({
  selector: 'app-quiz-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-detail.component.html',
  styleUrl: './quiz-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizDetailComponent implements OnInit {
  quiz: Quiz | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadQuiz(+id);
    }
  }

  startQuiz(): void {
    console.log('Starting quiz:', this.quiz?.title);
    // Implement quiz start logic
  }

  private loadQuiz(id: number): void {
    this.apiService.getQuiz(id).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
      },
      error: (error) => {
        console.error('Error loading quiz:', error);
      }
    });
  }
}
