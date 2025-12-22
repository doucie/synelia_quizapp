import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
      user: 1,
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
      user: 1,
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
      user: 1,
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
      user: 1,
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
      user: 1, // User ID - à remplacer par le vrai user connecté
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
      user: 1, // User ID - à remplacer par le vrai user connecté
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
      user: 1, // User ID - à remplacer par le vrai user connecté
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
}
