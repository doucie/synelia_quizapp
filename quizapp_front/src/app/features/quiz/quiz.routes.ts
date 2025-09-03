import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./quiz-list/quiz-list.component').then(m => m.QuizListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./quiz-detail/quiz-detail.component').then(m => m.QuizDetailComponent)
  }
];
