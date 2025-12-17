import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Evaluation {
  id?: number;
  candidateMark?: number;
  recruiterComment?: string;
  candidateInterviewId?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  
  // Données enrichies
  candidateName?: string;
  candidateEmail?: string;
  interviewDate?: string;
  interviewLocation?: string;
}

export interface CandidateInterview {
  id?: number;
  interviewStart?: string;
  interviewDuration?: number;
  applicationId?: number;
  interviewId?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  
  // Données enrichies
  candidateName?: string;
  candidateEmail?: string;
  campaignTitle?: string;
  quizScore?: number;
}

export interface EvaluationResponse {
  status: {
    code: string;
    message: string;
  };
  hasError: boolean;
  count: number;
  httpCode: number;
  items: Evaluation[];
}

export interface CandidateInterviewResponse {
  status: {
    code: string;
    message: string;
  };
  hasError: boolean;
  count: number;
  httpCode: number;
  items: CandidateInterview[];
}

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private evaluationsApiUrl = `${environment.apiUrl}/evaluations`;
  private candidateInterviewApiUrl = `${environment.apiUrl}/candidateInterview`;
  private interviewsApiUrl = `${environment.apiUrl}/interviews`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère un entretien par son interviewEvaluationsLink
   */
  getInterviewByEvaluationsLink(link: string): Observable<any> {
    const request = {
      user: 1,
      data: {
        interviewEvaluationsLink: link
      }
    };
    return this.http.post(`${this.interviewsApiUrl}/getByCriteria`, request);
  }

  /**
   * Récupère les candidate_interviews pour un entretien
   */
  getCandidateInterviewsByInterviewId(interviewId: number): Observable<CandidateInterviewResponse> {
    const request = {
      user: 1,
      data: {
        interviewId: interviewId
      }
    };
    return this.http.post<CandidateInterviewResponse>(`${this.candidateInterviewApiUrl}/getByCriteria`, request);
  }

  /**
   * Récupère les évaluations pour un candidate_interview
   */
  getEvaluationsByCandidateInterviewId(candidateInterviewId: number): Observable<EvaluationResponse> {
    const request = {
      user: 1,
      data: {
        candidateInterviewId: candidateInterviewId
      }
    };
    return this.http.post<EvaluationResponse>(`${this.evaluationsApiUrl}/getByCriteria`, request);
  }

  /**
   * Crée un candidate_interview
   */
  createCandidateInterview(data: { interviewId: number; applicationId: number }): Observable<CandidateInterviewResponse> {
    const request = {
      user: 1,
      datas: [{
        interviewId: data.interviewId,
        applicationId: data.applicationId
      }]
    };
    return this.http.post<CandidateInterviewResponse>(`${this.candidateInterviewApiUrl}/create`, request);
  }

  /**
   * Crée une évaluation
   */
  createEvaluation(evaluation: Evaluation, evaluatorId: number): Observable<any> {
    const request = {
      user: evaluatorId,
      datas: [evaluation]
    };
    return this.http.post(`${this.evaluationsApiUrl}/create`, request);
  }

  /**
   * Met à jour une évaluation
   */
  updateEvaluation(evaluation: Evaluation, userId: number = 1): Observable<any> {
    const request = {
      user: userId,
      datas: [evaluation]
    };
    return this.http.post(`${this.evaluationsApiUrl}/update`, request);
  }

  /**
   * Supprime une évaluation (soft delete)
   */
  deleteEvaluation(id: number): Observable<any> {
    const request = {
      user: 1,
      datas: [{ id }]
    };
    return this.http.post(`${this.evaluationsApiUrl}/delete`, request);
  }
}
