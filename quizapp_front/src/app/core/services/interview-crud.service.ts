import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InterviewCrud {
  id?: number;
  interviewId: number;
  userId: number;
  isAdmin: boolean;
  canEvaluate?: boolean;
  canViewCandidateProfile?: boolean;
  canViewCandidateResults?: boolean;
  canScheduleInterview?: boolean;
  canMarkAttendance?: boolean;
  canProvideScore?: boolean;
  canAddComments?: boolean;
  isOnline?: boolean;
  hasFinished?: boolean;
  lastPingAt?: string;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
}

export interface InterviewCrudResponse {
  status: {
    code: string;
    message: string;
  };
  hasError: boolean;
  count: number;
  httpCode: number;
  items: InterviewCrud[];
}

@Injectable({
  providedIn: 'root'
})
export class InterviewCrudService {
  private apiUrl = `${environment.apiUrl}/interviewCrud`;

  constructor(private http: HttpClient) {}

  /**
   * Crée un enregistrement interview_crud
   */
  createInterviewCrud(interviewCrud: InterviewCrud): Observable<any> {
    return this.http.post(`${this.apiUrl}`, interviewCrud);
  }

  /**
   * Crée plusieurs enregistrements interview_crud
   */
  createMultipleInterviewCruds(interviewCruds: InterviewCrud[]): Observable<any> {
    const request = {
      user: 1, // User ID - à remplacer par le vrai user connecté
      datas: interviewCruds
    };
    return this.http.post(`${this.apiUrl}/create`, request);
  }

  /**
   * Récupère les interview_cruds par interview ID via getByCriteria
   */
  getInterviewCrudsByInterviewId(interviewId: number): Observable<InterviewCrudResponse> {
    const request = {
      user: 1,
      data: {
        interviewsId: interviewId
      }
    };
    return this.http.post<InterviewCrudResponse>(`${this.apiUrl}/getByCriteria`, request);
  }

  /**
   * Récupère les évaluateurs (canEvaluate = true) pour un interview
   */
  getEvaluatorsByInterviewId(interviewId: number): Observable<InterviewCrudResponse> {
    const request = {
      user: 1,
      data: {
        interviewsId: interviewId,
        canEvaluate: true
      }
    };
    return this.http.post<InterviewCrudResponse>(`${this.apiUrl}/getByCriteria`, request).pipe(
      tap(response => {
        console.log('🔍 [InterviewCrud] getByCriteria response:', JSON.stringify(response.items?.[0], null, 2));
      })
    );
  }

  /**
   * Récupère les interview_cruds par user ID via getByCriteria
   */
  getInterviewCrudsByUserId(userId: number): Observable<InterviewCrudResponse> {
    const request = {
      user: 1,
      data: {
        userId: userId
      }
    };
    return this.http.post<InterviewCrudResponse>(`${this.apiUrl}/getByCriteria`, request);
  }

  /**
   * Met à jour un interview_crud
   */
  updateInterviewCrud(id: number, interviewCrud: Partial<InterviewCrud>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, interviewCrud);
  }

  /**
   * Met à jour le statut de présence (ping)
   */
  updatePresence(interviewId: number, userId: number, isOnline: boolean): Observable<any> {
    const request = {
      user: userId,
      datas: [{
        interviewsId: interviewId,
        userId: userId,
        isOnline: isOnline,
        lastPingAt: new Date().toISOString()
      }]
    };
    return this.http.post(`${this.apiUrl}/update`, request);
  }

  /**
   * Met à jour le statut "a terminé"
   */
  updateHasFinished(interviewId: number, userId: number, hasFinished: boolean): Observable<any> {
    const request = {
      user: userId,
      datas: [{
        interviewsId: interviewId,
        userId: userId,
        hasFinished: hasFinished
      }]
    };
    return this.http.post(`${this.apiUrl}/update`, request);
  }

  /**
   * Met à jour le statut de présence et "terminé" par ID de l'interview_crud
   */
  updateInterviewCrudStatus(interviewCrudId: number, isOnline: boolean, hasFinished: boolean): Observable<any> {
    // Formater la date au format dd/MM/yyyy HH:mm:ss attendu par le backend
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

    const request = {
      user: 1,
      datas: [{
        id: interviewCrudId,
        isOnline: isOnline,
        hasFinished: hasFinished,
        lastPingAt: formattedDate
      }]
    };
    return this.http.post(`${this.apiUrl}/update`, request);
  }

  /**
   * Supprime un interview_crud
   */
  deleteInterviewCrud(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
