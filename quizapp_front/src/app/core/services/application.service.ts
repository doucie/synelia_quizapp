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
  quizToken?: string;
  quizStatus?: string;
  quizLevel?: number;
  // createdAt?: string; // Let backend set this
  createdBy?: number;
  // updatedAt?: string; // Let backend set this
  updatedBy?: number;
  isDeleted?: boolean;
  searchString?: string;
  sourceTokenId?: number;
}

/**
 * Interface pour la structure de requête du backend (basée sur le pattern existant)
 */
export interface ApplicationRequest {
  user?: number;
  datas?: Application[];
  data?: Application;
}

/**
 * Interface pour la structure de réponse du backend
 */
export interface ApplicationResponse {
  items: Application[];
  hasError: boolean;
  status?: {
    code?: string;
    message?: string;
  };
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
      user: 1,
      datas: [application]
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
      user: 1,
      data: criteria as Application
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
      user: 1,
      datas: [application]
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
      user: 1,
      datas: [{ 
        id: applicationId,
        candidateFirstName: '',
        candidateLastName: '',
        candidateEmail: '',
        candidatePhone: '',
        candidateBirthDate: ''
      }]
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<ApplicationResponse>(`${this.applicationsUrl}/delete`, request, { headers });
  }

  /**
   * Vérifie l'email d'un candidat avec le token reçu par email
   * @param token Token de vérification
   * @returns Observable<ApplicationResponse>
   */
  verifyEmail(token: string): Observable<ApplicationResponse> {
    const request = {
      user: 1,
      data: {
        searchString: token,  // Le token est passé dans searchString
        candidateFirstName: '',
        candidateLastName: '',
        candidateEmail: '',
        candidatePhone: '',
        candidateBirthDate: ''
      }
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<ApplicationResponse>(`${this.applicationsUrl}/verify-email`, request, { headers });
  }

  /**
   * Récupère le quiz (questions + réponses) pour une application donnée
   * @param applicationId ID de l'application
   * @param quizToken Token sécurisé pour accéder au quiz
   * @returns Observable<ApplicationResponse>
   */
  getQuiz(applicationId: number, quizToken: string): Observable<ApplicationResponse> {
    const request = {
      user: 1,
      data: {
        id: applicationId,
        searchString: quizToken, // Le quiz_token est passé dans searchString pour validation
        candidateFirstName: '',
        candidateLastName: '',
        candidateEmail: '',
        candidatePhone: '',
        candidateBirthDate: ''
      }
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<ApplicationResponse>(`${this.applicationsUrl}/get-quiz`, request, { headers });
  }

  /**
   * Sauvegarde la réponse sélectionnée par le candidat en temps réel
   * @param applicationId ID de l'application
   * @param quizToken Token sécurisé pour accéder au quiz
   * @param questionId ID de la question
   * @param questionsAnswersId ID de la réponse sélectionnée (questions_answers.id)
   * @returns Observable<ApplicationResponse>
   */
  saveQuizAnswer(applicationId: number, quizToken: string, questionId: number, questionsAnswersId: number): Observable<ApplicationResponse> {
    const request = {
      user: 1,
      data: {
        id: applicationId,
        searchString: quizToken, // Le quiz_token pour validation
        candidatePhone: questionId.toString(), // questionId (utilisation temporaire)
        candidateCvPath: questionsAnswersId.toString(), // questionsAnswersId (utilisation temporaire)
        candidateFirstName: '',
        candidateLastName: '',
        candidateEmail: '',
        candidateBirthDate: ''
      }
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<ApplicationResponse>(`${this.applicationsUrl}/save-quiz-answer`, request, { headers });
  }

  /**
   * Marque le quiz comme complété (quiz_status = COMPLETED)
   * @param applicationId ID de l'application
   * @param quizToken Token sécurisé pour accéder au quiz
   * @returns Observable<ApplicationResponse>
   */
  completeQuiz(applicationId: number, quizToken: string): Observable<ApplicationResponse> {
    const request = {
      user: 1,
      data: {
        id: applicationId,
        searchString: quizToken,
        candidateFirstName: '',
        candidateLastName: '',
        candidateEmail: '',
        candidatePhone: '',
        candidateBirthDate: ''
      }
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<ApplicationResponse>(`${this.applicationsUrl}/complete-quiz`, request, { headers });
  }
}