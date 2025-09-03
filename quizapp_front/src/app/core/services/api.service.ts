import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Quiz } from '../../shared/models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'api'; // This should come from environment config

  constructor(private http: HttpClient) {}

  // User endpoints
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  // Quiz endpoints
  getQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.baseUrl}/quizzes`);
  }

  getQuiz(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.baseUrl}/quizzes/${id}`);
  }

  createQuiz(quiz: Partial<Quiz>): Observable<Quiz> {
    return this.http.post<Quiz>(`${this.baseUrl}/quizzes`, quiz);
  }

  updateQuiz(id: number, quiz: Partial<Quiz>): Observable<Quiz> {
    return this.http.put<Quiz>(`${this.baseUrl}/quizzes/${id}`, quiz);
  }

  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/quizzes/${id}`);
  }
}
