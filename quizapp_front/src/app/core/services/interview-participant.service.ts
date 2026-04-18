import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Session-state model for interview participants.
 * Replaces InterviewCrud — permissions are now in entity_permission.
 */
export interface InterviewParticipant {
  id?: number;
  interviewId: number;
  userId: number;
  isOnline?: boolean;
  hasFinished?: boolean;
  lastPingAt?: string;
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

export interface InterviewParticipantResponse {
  status: { code: string; message: string };
  hasError: boolean;
  count: number;
  httpCode: number;
  items: InterviewParticipant[];
}

export interface InterviewParticipantSearchCriteria {
  page?: number;
  size?: number;
  search_string?: string;
  idDe?: string;
  idA?: string;
  userId?: number;
  interviewId?: number;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

export interface PagedInterviewParticipantResponse {
  content: InterviewParticipant[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * Service for interview participant session state (online/finished/ping).
 * Uses interviewParticipant backend endpoints.
 * Permission-related queries (canEvaluate, isAdmin) should use EntityPermissionService.
 */
@Injectable({
  providedIn: 'root'
})
export class InterviewParticipantService {
  private apiUrl = `${environment.apiUrl}/interviewParticipant`;

  constructor(private http: HttpClient) {}

  /** Get all participants for an interview */
  getByInterviewId(interviewId: number): Observable<InterviewParticipantResponse> {
    return this.http.post<InterviewParticipantResponse>(
      `${this.apiUrl}/getByCriteria`,
      { user: 1, data: { interviewId } }
    );
  }

  /** Create participants for an interview (bulk) */
  createParticipants(participants: InterviewParticipant[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, {
      user: 1,
      datas: participants
    });
  }

  /** Send presence ping (mark online + update lastPingAt) */
  sendPresencePing(participantId: number): Observable<any> {
    const formattedDate = this.formatDate(new Date());
    return this.http.post(`${this.apiUrl}/update`, {
      user: 1,
      datas: [{ id: participantId, isOnline: true, lastPingAt: formattedDate }]
    });
  }

  /** Mark participant offline */
  markOffline(participantId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, {
      user: 1,
      datas: [{ id: participantId, isOnline: false }]
    });
  }

  /** Update hasFinished flag */
  updateHasFinished(participantId: number, hasFinished: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, {
      user: 1,
      datas: [{ id: participantId, hasFinished }]
    });
  }

  /** Update full status (online + finished + ping) */
  updateStatus(participantId: number, isOnline: boolean, hasFinished: boolean): Observable<any> {
    const formattedDate = this.formatDate(new Date());
    return this.http.post(`${this.apiUrl}/update`, {
      user: 1,
      datas: [{ id: participantId, isOnline, hasFinished, lastPingAt: formattedDate }]
    });
  }

  /** Entity CRUD: get all by criteria (paginated) */
  getAllByCriteria(criteria: InterviewParticipantSearchCriteria = {}): Observable<PagedInterviewParticipantResponse> {
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
        ...(criteria.userId && { userId: criteria.userId }),
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
      catchError(error => { console.error('Erreur interview-participant:', error); return throwError(() => error); })
    );
  }

  entityCreate(item: InterviewParticipant): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { user: 1, datas: [item] });
  }

  entityUpdate(item: InterviewParticipant): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: 1, datas: [item] });
  }

  entityDelete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { user: 1, datas: [{ id }] });
  }

  entityRestore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: 1, datas: [{ id, isDeleted: false }] });
  }

  private formatDate(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0');
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    const h = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${d}/${mo}/${y} ${h}:${mi}:${s}`;
  }
}
