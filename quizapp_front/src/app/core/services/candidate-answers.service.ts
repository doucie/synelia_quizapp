import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CandidateAnswer {
  id?: number;
  freeTextResponse?: string;
  isSelected?: boolean;
  manualIsCorrect?: boolean | null;
  manualCorrectionComment?: string | null;
  manualCorrectionScore?: number | null;
  manualCorrectedAt?: string;
  manualCorrectedBy?: number;
  applicationId?: number;
  questionId?: number;
  questionScore?: number;
  manualCorrectionRequired?: boolean;
  answerId?: number;
  answerOrder?: number;
  questionText?: string;
  questionType?: string;
  answerText?: string;
  action?: string;
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

export interface CandidateAnswerMutationPayload {
  id?: number;
  freeTextResponse?: string;
  isSelected?: boolean;
  manualIsCorrect?: boolean | null;
  manualCorrectionComment?: string | null;
  manualCorrectionScore?: number | null;
  applicationId?: number;
  questionId?: number;
  answerId?: number;
  action?: string;
  isDeleted?: boolean;
}

export interface CandidateAnswerSearchCriteria {
  page?: number;
  size?: number;
  search_string?: string;
  idDe?: string;
  idA?: string;
  applicationId?: number;
  questionId?: number;
  answerId?: number;
  isSelected?: boolean;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

export interface PagedCandidateAnswerResponse {
  content: CandidateAnswer[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class CandidateAnswersService {
  private apiUrl = `${environment.apiUrl}/candidateanswer`;

  constructor(private http: HttpClient) {}

  getAllByCriteria(criteria: CandidateAnswerSearchCriteria = {}): Observable<PagedCandidateAnswerResponse> {
    const currentUserData = localStorage.getItem('user');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id?.toString() || '1' : '1';

    const request = {
      user: currentUserId,
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        id: criteria.idDe || '',
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : '',
        searchString: criteria.search_string || '',
        ...(criteria.applicationId && { applicationId: criteria.applicationId }),
        ...(criteria.questionId && { questionId: criteria.questionId }),
        ...(criteria.answerId && { answerId: criteria.answerId }),
        ...(criteria.isSelected !== undefined && { isSelected: criteria.isSelected }),
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
        const items = response.items || (response.item ? [response.item] : []);
        const totalElements = response.totalCount || response.count || items.length;
        const pageSize = criteria.size || 10;
        return { content: items, totalElements, totalPages: Math.ceil(totalElements / pageSize), size: pageSize, number: criteria.page || 0 };
      }),
      catchError(error => { console.error('Erreur candidate-answers:', error); return throwError(() => error); })
    );
  }

  create(item: CandidateAnswerMutationPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { user: 1, datas: [item] });
  }

  update(item: CandidateAnswerMutationPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: 1, datas: [item] });
  }

  manualCorrect(id: number, manualIsCorrect: boolean, manualCorrectionComment?: string | null): Observable<any> {
    const currentUserData = localStorage.getItem('user');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id?.toString() || '1' : '1';

    return this.http.post(`${this.apiUrl}/custom`, {
      user: currentUserId,
      datas: [{
        id,
        action: 'manualCorrection',
        manualIsCorrect,
        manualCorrectionComment: manualCorrectionComment ?? null
      }]
    });
  }

  manualCorrectQuestion(applicationId: number, questionId: number, manualCorrectionScore: number, manualCorrectionComment?: string | null): Observable<any> {
    const currentUserData = localStorage.getItem('user');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id?.toString() || '1' : '1';

    return this.http.post(`${this.apiUrl}/custom`, {
      user: currentUserId,
      datas: [{
        applicationId,
        questionId,
        action: 'manualQuestionCorrection',
        manualCorrectionScore,
        manualCorrectionComment: manualCorrectionComment ?? null
      }]
    });
  }

  delete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { user: 1, datas: [{ id }] });
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: 1, datas: [{ id, isDeleted: false }] });
  }
}
