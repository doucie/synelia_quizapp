import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Quiz } from '../../../shared/models/interfaces';

@Component({
  selector: 'app-quiz-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-list.component.html',
  styleUrl: './quiz-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizListComponent implements OnInit {
  quizzes$: Observable<Quiz[]> = new Observable();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.quizzes$ = this.apiService.getQuizzes();
  }
}
