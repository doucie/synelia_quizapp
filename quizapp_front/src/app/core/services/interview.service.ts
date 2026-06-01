import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Interface pour les critères de recherche paginée des interviews
 */
export interface InterviewSearchCriteria {
  page?: number;
  size?: number;
  search_string?: string;
  idDe?: string;
  idA?: string;
  interviewStatus?: string;
  interviewType?: string;
  campaignId?: number;
  applicationId?: number;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

/**
 * Interface pour la réponse paginée des interviews
 */
export interface PagedInterviewResponse {
  content: Interview[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Interview {
  id?: number;
  interviewLocation?: string;
  interviewDate?: string; // Format: dd/MM/yyyy HH:mm
  interviewStatus?: 'PENDING' | 'SCHEDULED' | 'STARTED' | 'OVER' | 'PASSED' | 'FAILED' | 'POSTPONED' | 'ARCHIVED';
  meetLink?: string;
  interviewEvaluationsLink?: string; // Lien unique pour accéder à l'évaluation
  interviewNote?: string;
  interviewMailSent?: boolean;
  interviewType: 'IN_PERSON' | 'ONLINE';
  startedAt?: string; // Date/heure de début effectif de l'entretien
  endedAt?: string; // Date/heure de fin effectif de l'entretien
  evaluationScore?: number; // Nombre de points total des évaluations
  evaluationNumber?: number; // Nombre d'évaluations total
  evaluationPercentage?: number; // Moyenne (evaluationScore / evaluationNumber)
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  campaignId?: number;
  applicationProgressId?: number;
  pipelineStageId?: number;
  pipelineStageType?: string;
  pipelineStageLabel?: string;
  pipelineStageOrder?: number;
  interviewRound?: number;
  
  // Données enrichies (pas dans la base)
  candidateName?: string;
  candidateEmail?: string;
  campaignTitle?: string;
  applicationId?: number;
}

export interface InterviewResponse {
  status: {
    code: string;
    message: string;
  };
  hasError: boolean;
  count: number;
  httpCode: number;
  items: Interview[];
}

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private baseUrl = `${environment.apiUrl}/interviews`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les interviews
   */
  getAllInterviews(): Observable<InterviewResponse> {
    const request = {
      user: this.getCurrentUserId(),
      data: {}
    };
    return this.http.post<InterviewResponse>(
      `${this.baseUrl}/getByCriteria`,
      request
    );
  }

  /**
   * Récupère une interview par ID
   */
  getInterviewById(id: number): Observable<InterviewResponse> {
    const request = {
      user: this.getCurrentUserId(),
      data: { id }
    };
    return this.http.post<InterviewResponse>(
      `${this.baseUrl}/getByCriteria`,
      request
    );
  }

  /**
   * Récupère les interviews par campagne
   */
  getInterviewsByCampaignId(campaignId: number): Observable<InterviewResponse> {
    const request = {
      user: this.getCurrentUserId(),
      data: { campaignId }
    };
    return this.http.post<InterviewResponse>(
      `${this.baseUrl}/getByCriteria`,
      request
    );
  }

  /**
   * Récupère les interviews par statut
   */
  getInterviewsByStatus(status: string): Observable<InterviewResponse> {
    const request = {
      user: this.getCurrentUserId(),
      data: { interviewStatus: status }
    };
    return this.http.post<InterviewResponse>(
      `${this.baseUrl}/getByCriteria`,
      request
    );
  }

  /**
   * Crée une nouvelle interview
   */
  createInterview(interview: Interview): Observable<InterviewResponse> {
    const request = {
      user: this.getCurrentUserId(),
      datas: [interview]
    };
    const url = `${this.baseUrl}/create`;
    console.log('🔗 URL de création:', url);
    console.log('📤 Requête:', request);
    return this.http.post<InterviewResponse>(url, request);
  }

  /**
   * Met à jour une interview
   */
  updateInterview(interview: Interview): Observable<InterviewResponse> {
    const request = {
      user: this.getCurrentUserId(),
      datas: [interview]
    };
    return this.http.post<InterviewResponse>(
      `${this.baseUrl}/update`,
      request
    );
  }

  /**
   * Supprime une interview
   */
  deleteInterview(id: number): Observable<InterviewResponse> {
    const request = {
      user: this.getCurrentUserId(),
      datas: [{ id }]
    };
    return this.http.post<InterviewResponse>(
      `${this.baseUrl}/delete`,
      request
    );
  }

  /**
   * Formate une date pour l'affichage
   */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  }

  /**
   * Obtient le label pour un statut d'interview
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'SCHEDULED': 'Planifié',
      'STARTED': 'En cours',
      'OVER': 'Terminé',
      'PASSED': 'Réussi',
      'FAILED': 'Échoué',
      'POSTPONED': 'Reporté',
      'ARCHIVED': 'Archivé'
    };
    return labels[status] || status;
  }

  /**
   * Obtient la classe CSS pour un statut
   */
  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'warning',
      'SCHEDULED': 'info',
      'STARTED': 'started',
      'OVER': 'success',
      'PASSED': 'success',
      'FAILED': 'error',
      'POSTPONED': 'warning',
      'ARCHIVED': 'muted'
    };
    return classes[status] || 'muted';
  }

  /**
   * Termine un entretien et calcule les scores d'évaluation
   * Met à jour interview.interviewStatus à "OVER", ended_at, evaluationScore, evaluationNumber, evaluationPercentage
   * Met à jour application.totalEvaluationScore, totalEvaluationNumber, totalEvaluationPercentage
   */
  finishInterview(interviewId: number, userId: number): Observable<InterviewResponse> {
    const request = {
      user: userId,
      datas: [{ id: interviewId }]
    };
    return this.http.post<InterviewResponse>(
      `${this.baseUrl}/finish`,
      request
    );
  }

  /**
   * Récupère TOUTES les interviews selon des critères (y compris les supprimées)
   * @param criteria critères de recherche optionnels
   * @returns Observable de la liste paginée d'interviews incluant les supprimées
   */
  getAllInterviewsByCriteria(criteria: InterviewSearchCriteria = {}): Observable<PagedInterviewResponse> {
    // Construction de la requête selon le format backend attendu
    const request = {
      user: this.getCurrentUserId(),
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        id: criteria.idDe || "",
        interviewStatus: criteria.interviewStatus || "",
        interviewType: criteria.interviewType || "",
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : "",
        searchString: criteria.search_string || "",
        ...(criteria.campaignId && { campaignId: criteria.campaignId }),
        ...(criteria.applicationId && { applicationId: criteria.applicationId }),
        
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

    return this.http.post<any>(`${this.baseUrl}/getAllByCriteria`, request).pipe(
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
        const rawInterviews = response.items || (response.item ? [response.item] : []);
        
        // Calculer le nombre total de pages
        const totalElements = response.totalCount || response.count || rawInterviews.length;
        const pageSize = criteria.size || 10;
        const totalPages = Math.ceil(totalElements / pageSize);
        
        return {
          content: rawInterviews,
          totalElements: totalElements,
          totalPages: totalPages,
          size: pageSize,
          number: criteria.page || 0
        };
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des interviews:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Restaure une interview supprimée
   * @param interviewId ID de l'interview à restaurer
   * @returns Observable<InterviewResponse>
   */
  restoreInterview(interviewId: number): Observable<InterviewResponse> {
    const request = {
      user: this.getCurrentUserId(),
      datas: [{ 
        id: interviewId,
        isDeleted: false
      }]
    };

    return this.http.post<InterviewResponse>(`${this.baseUrl}/update`, request);
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
