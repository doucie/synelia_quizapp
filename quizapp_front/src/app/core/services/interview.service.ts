import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Interview {
  id?: number;
  interviewLocation?: string;
  interviewDate?: string; // Format: dd/MM/yyyy HH:mm
  interviewStatus?: 'PENDING' | 'SCHEDULED' | 'STARTED' | 'OVER' | 'PASSED' | 'FAILED' | 'POSTPONED' | 'ARCHIVED';
  meetLink?: string;
  interviewNote?: string;
  interviewMailSent?: boolean;
  interviewType: 'IN_PERSON' | 'ONLINE';
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

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Récupère toutes les interviews
   */
  getAllInterviews(): Observable<InterviewResponse> {
    return this.http.post<InterviewResponse>(
      `${this.baseUrl}/getByCriteria`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Récupère une interview par ID
   */
  getInterviewById(id: number): Observable<InterviewResponse> {
    return this.http.post<InterviewResponse>(
      `${this.baseUrl}/getByCriteria`,
      { id },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Récupère les interviews par campagne
   */
  getInterviewsByCampaignId(campaignId: number): Observable<InterviewResponse> {
    return this.http.post<InterviewResponse>(
      `${this.baseUrl}/getByCriteria`,
      { campaignId },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Récupère les interviews par statut
   */
  getInterviewsByStatus(status: string): Observable<InterviewResponse> {
    return this.http.post<InterviewResponse>(
      `${this.baseUrl}/getByCriteria`,
      { interviewStatus: status },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Crée une nouvelle interview
   */
  createInterview(interview: Interview): Observable<InterviewResponse> {
    return this.http.post<InterviewResponse>(
      `${this.baseUrl}/create`,
      interview,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Met à jour une interview
   */
  updateInterview(interview: Interview): Observable<InterviewResponse> {
    return this.http.post<InterviewResponse>(
      `${this.baseUrl}/update`,
      interview,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Supprime une interview
   */
  deleteInterview(id: number): Observable<InterviewResponse> {
    return this.http.post<InterviewResponse>(
      `${this.baseUrl}/delete`,
      { id },
      { headers: this.getHeaders() }
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
      'STARTED': 'info',
      'OVER': 'success',
      'PASSED': 'success',
      'FAILED': 'error',
      'POSTPONED': 'warning',
      'ARCHIVED': 'muted'
    };
    return classes[status] || 'muted';
  }
}
