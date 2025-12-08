import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.post<InterviewCrudResponse>(`${this.apiUrl}/getByCriteria`, request);
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
   * Supprime un interview_crud
   */
  deleteInterviewCrud(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
