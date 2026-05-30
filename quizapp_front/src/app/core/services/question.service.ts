import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Question {
  id?: number;
  questionRef?: string;
  questionText?: string;
  questionChrono?: number;
  questionType?: string;
  score?: number;
  difficultyLevel?: string;
  specialityId?: number;
  allAnswersJustificationRequired?: boolean;
  manualCorrectionRequired?: boolean;
  freeTextResponsePlaceholder?: string;
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

export interface QuestionSearchCriteria {
  idDe?: string;
  idA?: string;
  questionText?: string;
  specialityId?: number;
  questionType?: string;
  difficultyLevel?: string;
  score?: number;
  questionChrono?: number;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
  search_string?: string;
  size?: number;
  page?: number;
}

export interface PagedQuestionResponse {
  content: Question[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Keep for backward compatibility
export type PagedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
};

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private apiUrl = `${environment.apiUrl}/question`;

  constructor(private http: HttpClient) {}

  private getUserId(): string {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data).id?.toString() || '1' : '1';
  }

  getAllByCriteria(criteria: QuestionSearchCriteria = {}): Observable<PagedQuestionResponse> {
    const request = {
      user: this.getUserId(),
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        id: criteria.idDe || '',
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : '',
        searchString: criteria.search_string || '',
        ...(criteria.questionText && { questionText: criteria.questionText }),
        ...(criteria.specialityId && { specialityId: criteria.specialityId }),
        ...(criteria.questionType && { questionType: criteria.questionType }),
        ...(criteria.difficultyLevel && { difficultyLevel: criteria.difficultyLevel }),
        ...(criteria.score && { score: criteria.score }),
        ...(criteria.questionChrono && { questionChrono: criteria.questionChrono }),
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
        const items = (response.items || (response.item ? [response.item] : [])).map((item: Question) => this.normalizeQuestion(item));
        const totalElements = response.totalCount || response.count || items.length;
        const pageSize = criteria.size || 10;
        return { content: items, totalElements, totalPages: Math.ceil(totalElements / pageSize), size: pageSize, number: criteria.page || 0 };
      }),
      catchError(error => { console.error('Erreur question:', error); return throwError(() => error); })
    );
  }

  /** Backward-compatible alias */
  getAllQuestionsByCriteria(criteria: QuestionSearchCriteria): Observable<PagedResponse<Question>> {
    return this.getAllByCriteria(criteria);
  }

  /** Backward-compatible alias */
  getAllQuestionsIncludingDeleted(criteria: QuestionSearchCriteria = {}): Observable<PagedResponse<Question>> {
    return this.getAllByCriteria(criteria);
  }

  create(item: Partial<Question>): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { user: this.getUserId(), datas: [this.normalizeQuestionPayload(item)] });
  }

  /** Backward-compatible alias */
  createQuestion(item: Partial<Question>): Observable<any> {
    return this.create(item);
  }

  update(item: Partial<Question>): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: this.getUserId(), datas: [this.normalizeQuestionPayload(item)] });
  }

  /** Backward-compatible alias */
  updateQuestion(id: number, item: Partial<Question>): Observable<any> {
    return this.update({ ...item, id });
  }

  delete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { user: this.getUserId(), datas: [{ id }] });
  }

  /** Backward-compatible alias */
  deleteQuestion(id: number): Observable<any> {
    return this.delete(id);
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: this.getUserId(), datas: [{ id, isDeleted: false }] });
  }

  /** Backward-compatible alias */
  restoreQuestion(id: number): Observable<any> {
    return this.restore(id);
  }

  private normalizeQuestion(item: Question): Question {
    return {
      ...item,
      questionType: this.normalizeQuestionType(item.questionType)
    };
  }

  private normalizeQuestionPayload(item: Partial<Question>): Partial<Question> {
    return {
      ...item,
      questionType: this.normalizeQuestionType(item.questionType)
    };
  }

  private normalizeQuestionType(questionType?: string): string {
    const normalized = (questionType ?? '').trim().toUpperCase();

    switch (normalized) {
      case 'QCU':
        return 'SINGLE_CHOICE';
      case 'QCM':
        return 'MULTIPLE_CHOICE';
      case 'OPEN':
        return 'TEXT';
      case 'TRUE_FALSE':
      case 'TEXT':
      case 'SINGLE_CHOICE':
      case 'MULTIPLE_CHOICE':
        return normalized;
      default:
        return 'MULTIPLE_CHOICE';
    }
  }
}