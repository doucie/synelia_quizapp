import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Interface pour les critères de recherche paginée des évaluations
 */
export interface EvaluationSearchCriteria {
  page?: number;
  size?: number;
  search_string?: string;
  idDe?: string;
  idA?: string;
  candidateInterviewId?: number;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

/**
 * Interface pour la réponse paginée des évaluations
 */
export interface PagedEvaluationResponse {
  content: Evaluation[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

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

  /**
   * Récupère TOUTES les évaluations selon des critères (y compris les supprimées)
   * @param criteria critères de recherche optionnels
   * @returns Observable de la liste paginée d'évaluations incluant les supprimées
   */
  getAllEvaluationsByCriteria(criteria: EvaluationSearchCriteria = {}): Observable<PagedEvaluationResponse> {
    // Récupérer l'ID de l'utilisateur connecté depuis localStorage
    const currentUserData = localStorage.getItem('user');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id?.toString() || "1" : "1";
    
    // Construction de la requête selon le format backend attendu
    const request = {
      user: currentUserId,
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        id: criteria.idDe || "",
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : "",
        searchString: criteria.search_string || "",
        
        // Critères de dates
        ...(criteria.dateCreationDe && criteria.dateCreationDe.trim() && { dateCreationDe: criteria.dateCreationDe }),
        ...(criteria.dateCreationA && criteria.dateCreationA.trim() && { dateCreationA: criteria.dateCreationA }),
        ...(criteria.dateModificationDe && criteria.dateModificationDe.trim() && { dateModificationDe: criteria.dateModificationDe }),
        ...(criteria.dateModificationA && criteria.dateModificationA.trim() && { dateModificationA: criteria.dateModificationA }),
        
        // Intervalles d'ID
        ...(criteria.idDe && criteria.idDe.trim() && { idStart: criteria.idDe }),
        ...(criteria.idA && criteria.idA.trim() && { idEnd: criteria.idA })
      }
    };

    return this.http.post<any>(`${this.evaluationsApiUrl}/getAllByCriteria`, request).pipe(
      map(response => {
        // Vérifier si la réponse contient des données
        if (!response || (!response.items && !response.item)) {
          return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: criteria.size || 10,
            number: criteria.page || 0
          };
        }
        
        // Traiter les éléments
        const rawEvaluations = response.items || (response.item ? [response.item] : []);
        
        // Calculer le nombre total de pages
        const totalElements = response.totalCount || response.count || rawEvaluations.length;
        const pageSize = criteria.size || 10;
        const totalPages = Math.ceil(totalElements / pageSize);
        
        return {
          content: rawEvaluations,
          totalElements: totalElements,
          totalPages: totalPages,
          size: pageSize,
          number: criteria.page || 0
        };
      }),
      catchError((error: any) => {
        console.error('❌ Erreur lors de la récupération des évaluations:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Restaure une évaluation supprimée
   * @param evaluationId ID de l'évaluation à restaurer
   * @returns Observable
   */
  restoreEvaluation(evaluationId: number): Observable<any> {
    const request = {
      user: 1,
      datas: [{ 
        id: evaluationId,
        isDeleted: false
      }]
    };

    return this.http.post(`${this.evaluationsApiUrl}/update`, request);
  }
}
