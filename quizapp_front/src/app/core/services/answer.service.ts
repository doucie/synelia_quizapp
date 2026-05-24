import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth/auth.service';

export interface Answer {
  id?: number;
  answerText?: string;
  answerType?: string;
  allowAdditionalComment?: boolean;
  additionalCommentRequired?: boolean;
  additionalCommentPlaceholder?: string;
  answerOrder?: number;
  isCorrect?: boolean;
  questionId?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

export interface AnswerSearchCriteria {
  page?: number;
  size?: number;
  search_string?: string;
  idDe?: string;
  idA?: string;
  answerText?: string;
  answerOrder?: number;
  isCorrect?: boolean;
  questionId?: number;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

export interface PagedAnswerResponse {
  content: Answer[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Keep for backward compatibility
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AnswerService {
  private apiUrl = `${environment.apiUrl}/answer`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAllByCriteria(criteria: AnswerSearchCriteria = {}): Observable<PagedAnswerResponse> {
    return this.withAuthenticatedUser(userId => {
      const request = {
        user: userId,
        size: criteria.size || 10,
        index: criteria.page || 0,
        isSimpleLoading: false,
        data: {
          id: criteria.idDe || '',
          isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : '',
          searchString: criteria.search_string || '',
          ...(criteria.answerText && { answerText: criteria.answerText }),
          ...(criteria.questionId && { questionId: criteria.questionId }),
          ...(criteria.answerOrder && { answerOrder: criteria.answerOrder }),
          ...(criteria.isCorrect !== undefined && { isCorrect: criteria.isCorrect }),
          ...(criteria.dateCreationDe && { dateCreationDe: criteria.dateCreationDe }),
          ...(criteria.dateCreationA && { dateCreationA: criteria.dateCreationA }),
          ...(criteria.dateModificationDe && { dateModificationDe: criteria.dateModificationDe }),
          ...(criteria.dateModificationA && { dateModificationA: criteria.dateModificationA }),
          ...(criteria.idDe && criteria.idDe.trim() && { idStart: criteria.idDe }),
          ...(criteria.idA && criteria.idA.trim() && { idEnd: criteria.idA })
        }
      };

      return this.http.post<any>(`${this.apiUrl}/getAllByCriteria`, request).pipe(
      map(response => {
        if (!response || (!response.items && !response.item)) {
          return { content: [], totalElements: 0, totalPages: 0, size: criteria.size || 10, number: criteria.page || 0 };
        }
        const items = (response.items || (response.item ? [response.item] : [])).map((item: Answer) => this.normalizeAnswer(item));
        const totalElements = response.totalCount || response.count || items.length;
        const pageSize = criteria.size || 10;
        return { content: items, totalElements, totalPages: Math.ceil(totalElements / pageSize), size: pageSize, number: criteria.page || 0 };
      }),
      catchError(error => { console.error('Erreur answer:', error); return throwError(() => error); })
      );
    });
  }

  /** Backward-compatible alias */
  getAllAnswersByCriteria(criteria: AnswerSearchCriteria): Observable<PagedResponse<Answer>> {
    return this.getAllByCriteria(criteria);
  }

  /** Backward-compatible: get answers for a question */
  getQuestionAnswersByCriteria(criteria: any): Observable<PagedResponse<Answer>> {
    return this.getAllByCriteria({
      questionId: criteria.questionId,
      size: criteria.size || 10,
      page: criteria.page || 0,
      isDeleted: criteria.isDeleted,
      search_string: criteria.search_string
    });
  }

  create(item: Partial<Answer>): Observable<any> {
    const payload = this.normalizeAnswerPayload(item);
    return this.withAuthenticatedUser(userId => this.http.post(`${this.apiUrl}/create`, { user: userId, datas: [payload] }));
  }

  /** Backward-compatible alias */
  createAnswer(item: Partial<Answer>): Observable<any> {
    return this.create(item);
  }

  update(item: Partial<Answer>): Observable<any> {
    const payload = this.normalizeAnswerPayload(item);
    return this.withAuthenticatedUser(userId => this.http.post(`${this.apiUrl}/update`, { user: userId, datas: [payload] }));
  }

  /** Backward-compatible alias */
  updateAnswer(id: number, item: Partial<Answer>): Observable<any> {
    return this.update({ ...item, id });
  }

  delete(id: number): Observable<any> {
    return this.withAuthenticatedUser(userId => this.http.post(`${this.apiUrl}/delete`, { user: userId, datas: [{ id }] }));
  }

  /** Backward-compatible alias */
  deleteAnswer(id: number): Observable<any> {
    return this.delete(id);
  }

  restore(id: number): Observable<any> {
    return this.withAuthenticatedUser(userId => this.http.post(`${this.apiUrl}/update`, { user: userId, datas: [{ id, isDeleted: false }] }));
  }

  /** Answers admin endpoints require a resolved authenticated user. */
  private withAuthenticatedUser<T>(requestFactory: (userId: string) => Observable<T>): Observable<T> {
    const userId = this.authService.getCurrentUserId();

    if (!userId || userId === '0') {
      return throwError(() => new Error('Contexte utilisateur manquant. Les appels answer nécessitent une session authentifiée.'));
    }

    return requestFactory(userId);
  }

  private normalizeAnswer(item: Answer): Answer {
    const allowAdditionalComment = item.allowAdditionalComment === true;

    return {
      ...item,
      answerType: this.normalizeAnswerType(item.answerType),
      allowAdditionalComment,
      additionalCommentRequired: allowAdditionalComment && item.additionalCommentRequired === true,
      additionalCommentPlaceholder: allowAdditionalComment ? (item.additionalCommentPlaceholder ?? '') : undefined
    };
  }

  private normalizeAnswerPayload(item: Partial<Answer>): Partial<Answer> {
    const allowAdditionalComment = item.allowAdditionalComment === true;

    return {
      ...item,
      answerType: this.normalizeAnswerType(item.answerType),
      allowAdditionalComment,
      additionalCommentRequired: allowAdditionalComment && item.additionalCommentRequired === true,
      additionalCommentPlaceholder: allowAdditionalComment ? (item.additionalCommentPlaceholder ?? '') : undefined
    };
  }

  private normalizeAnswerType(answerType?: string): string {
    const normalized = (answerType ?? '').trim().toUpperCase();

    if (normalized === 'IMAGE' || normalized === 'CODE') {
      return normalized;
    }

    return 'TEXT';
  }

  /** Backward-compatible alias */
  restoreAnswer(id: number): Observable<any> {
    return this.restore(id);
  }
}