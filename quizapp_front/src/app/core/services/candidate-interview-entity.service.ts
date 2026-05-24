import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CandidateInterviewEntity {
  id?: number;
  interviewStart?: string;
  interviewDuration?: number;
  declineReason?: string | null;
  alternativeDateRequested?: string | null;
  applicationId?: number;
  interviewId?: number;
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

export interface CandidateInterviewEntityMutationPayload {
  id?: number;
  interviewStart?: string;
  interviewDuration?: number;
  declineReason?: string | null;
  alternativeDateRequested?: string | null;
  applicationId?: number;
  interviewId?: number;
  isDeleted?: boolean;
}

export interface CandidateInterviewSearchCriteria {
  page?: number;
  size?: number;
  search_string?: string;
  idDe?: string;
  idA?: string;
  applicationId?: number;
  interviewId?: number;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

export interface PagedCandidateInterviewResponse {
  content: CandidateInterviewEntity[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class CandidateInterviewEntityService {
  private apiUrl = `${environment.apiUrl}/candidateInterview`;

  constructor(private http: HttpClient) {}

  getAllByCriteria(criteria: CandidateInterviewSearchCriteria = {}): Observable<PagedCandidateInterviewResponse> {
    const request = {
      user: this.getCurrentUserId(),
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        id: criteria.idDe || '',
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : '',
        searchString: criteria.search_string || '',
        ...(criteria.applicationId && { applicationId: criteria.applicationId }),
        ...(criteria.interviewId && { interviewId: criteria.interviewId }),
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
      catchError(error => { console.error('Erreur candidate-interview:', error); return throwError(() => error); })
    );
  }

  create(item: CandidateInterviewEntityMutationPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { user: this.getCurrentUserId(), datas: [item] });
  }

  update(item: CandidateInterviewEntityMutationPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: this.getCurrentUserId(), datas: [item] });
  }

  delete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { user: this.getCurrentUserId(), datas: [{ id }] });
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: this.getCurrentUserId(), datas: [{ id, isDeleted: false }] });
  }

  private getCurrentUserId(): number {
    try {
      const user = localStorage.getItem('user');
      return user ? Number(JSON.parse(user).id) || 0 : 0;
    } catch {
      return 0;
    }
  }
}
