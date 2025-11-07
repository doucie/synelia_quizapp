import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InterviewCrud {
  id?: number;
  interviewId: number;
  userId: number;
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
  private apiUrl = `${environment.apiUrl}/interview-crud`;

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
    return this.http.post(`${this.apiUrl}/bulk`, interviewCruds);
  }

  /**
   * Récupère les interview_cruds par interview ID
   */
  getInterviewCrudsByInterviewId(interviewId: number): Observable<InterviewCrudResponse> {
    return this.http.get<InterviewCrudResponse>(`${this.apiUrl}/interview/${interviewId}`);
  }

  /**
   * Récupère les interview_cruds par user ID
   */
  getInterviewCrudsByUserId(userId: number): Observable<InterviewCrudResponse> {
    return this.http.get<InterviewCrudResponse>(`${this.apiUrl}/user/${userId}`);
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
