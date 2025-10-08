import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interface pour les données d'une application
 * Basée sur ApplicationsDto du backend
 */
export interface Application {
  id?: number;
  candidateFirstName: string;
  candidateLastName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateCvPath?: string;
  candidateBirthDate: string;
  motivationLetter?: string;
  emailVerified?: boolean;
  quizScore?: number;
  evaluationScore?: number;
  applicationStatus?: string;
  visitToken?: string;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  searchString?: string;
  sourceTokenId?: number;
}

/**
 * Interface pour la structure de requête du backend
 */
export interface ApplicationRequest {
  data: Application[];
  lang: string;
}

/**
 * Interface pour la structure de réponse du backend
 */
export interface ApplicationResponse {
  items: Application[];
  hasError: boolean;
  errors?: any[];
  sessionUser?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private readonly baseUrl = environment.apiUrl || 'http://localhost:8080';
  private readonly applicationsUrl = `${this.baseUrl}/applications`;

  constructor(private http: HttpClient) {}

  /**
   * Crée une nouvelle application
   * @param application Données de l'application à créer
   * @returns Observable<ApplicationResponse>
   */
  createApplication(application: Application): Observable<ApplicationResponse> {
    const request: ApplicationRequest = {
      data: [application],
      lang: 'fr'
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<ApplicationResponse>(`${this.applicationsUrl}/create`, request, { headers });
  }

  /**
   * Récupère les applications selon des critères
   * @param criteria Critères de recherche
   * @returns Observable<ApplicationResponse>
   */
  getApplicationsByCriteria(criteria: Partial<Application>): Observable<ApplicationResponse> {
    const request: ApplicationRequest = {
      data: [criteria as Application],
      lang: 'fr'
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<ApplicationResponse>(`${this.applicationsUrl}/getByCriteria`, request, { headers });
  }

  /**
   * Met à jour une application
   * @param application Données de l'application à mettre à jour
   * @returns Observable<ApplicationResponse>
   */
  updateApplication(application: Application): Observable<ApplicationResponse> {
    const request: ApplicationRequest = {
      data: [application],
      lang: 'fr'
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<ApplicationResponse>(`${this.applicationsUrl}/update`, request, { headers });
  }

  /**
   * Supprime une application
   * @param applicationId ID de l'application à supprimer
   * @returns Observable<ApplicationResponse>
   */
  deleteApplication(applicationId: number): Observable<ApplicationResponse> {
    const request: ApplicationRequest = {
      data: [{ 
        id: applicationId,
        candidateFirstName: '',
        candidateLastName: '',
        candidateEmail: '',
        candidatePhone: '',
        candidateBirthDate: ''
      }],
      lang: 'fr'
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<ApplicationResponse>(`${this.applicationsUrl}/delete`, request, { headers });
  }
}