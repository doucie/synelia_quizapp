import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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
}

export interface InterviewParticipantResponse {
  status: { code: string; message: string };
  hasError: boolean;
  count: number;
  httpCode: number;
  items: InterviewParticipant[];
}

/**
 * Service for interview participant session state (online/finished/ping).
 * Uses interviewCrud backend endpoints (table renamed to interview_participant by V1_014).
 * Permission-related queries (canEvaluate, isAdmin) should use EntityPermissionService.
 */
@Injectable({
  providedIn: 'root'
})
export class InterviewParticipantService {
  private apiUrl = `${environment.apiUrl}/interviewCrud`;

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
