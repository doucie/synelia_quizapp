import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ManualCorrectionStatus } from '../constants/manual-correction-status.constants';

/**
 * Interface pour les critères de recherche paginée des applications
 */
export interface ApplicationSearchCriteria {
  page?: number;
  size?: number;
  search_string?: string;
  idDe?: string;
  idA?: string;
  candidateFirstName?: string;
  candidateLastName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  sourceTokenId?: number;
  formVersionId?: number;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

/**
 * Interface pour la réponse paginée des applications
 */
export interface PagedApplicationResponse {
  content: Application[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApplicationQuizAttemptSummary {
  id?: number;
  quizToken?: string;
  quizStatus?: string;
  manualCorrectionStatus?: ManualCorrectionStatus | string;
  score?: number;
  scorePercent?: number;
  totalQuestions?: number;
  timeElapsed?: number;
  timedSnapshot?: boolean;
  totalTimeAllowedSnapshot?: number;
  lastActivityAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

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
  trackingCode?: string;
  candidateCvPath?: string;
  candidateBirthDate: string;
  motivationLetter?: string;
  emailVerified?: boolean;
  aggregatedQuizScore?: number;
  aggregatedQuizScorePercent?: number;
  evaluationScore?: number;
  interviewDate?: string; // Date de l'entretien
  interviewStatus?: string; // Status de l'entretien
  currentInterviewEvaluationScore?: number;
  currentInterviewEvaluationNumber?: number;
  currentInterviewEvaluationPercentage?: number;
  currentPreselectionDecisionType?: string;
  currentPreselectionDecisionDate?: string;
  currentFinalDecisionType?: string;
  currentFinalDecisionDate?: string;
  currentPipelineStageType?: string;
  currentPipelineStageLabel?: string;
  currentPipelineProgressStatus?: string;
  applicationAbandoned?: boolean;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  searchString?: string;
  sourceTokenId?: number;
  campaignId?: number;
  action?: string;
  quizAttempts?: ApplicationQuizAttemptSummary[];
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

export interface SaveQuizAnswerPayload {
  questionId: number;
  answerId?: number;
  selectedAnswerIds?: number[];
  selectedAnswerComments?: Record<number, string | null>;
  freeTextResponse?: string | null;
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
        candidateFirstName: null,
        candidateLastName: null,
        candidateEmail: null,
        candidatePhone: null,
        candidateBirthDate: null
      }
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<ApplicationResponse>(`${this.applicationsUrl}/get-quiz`, request, { headers });
  }

  /**
   * Sauvegarde l'état complet d'une question de quiz.
   */
  saveQuizAnswer(applicationId: number, quizToken: string, payload: SaveQuizAnswerPayload): Observable<ApplicationResponse> {
    const selectedAnswerIds = (payload.selectedAnswerIds || []).filter((id): id is number => Number.isFinite(id));
    const request = {
      user: 1,
      data: {
        id: applicationId,
        searchString: quizToken,
        questionId: payload.questionId,
        answerId: payload.answerId,
        selectedAnswerIds,
        selectedAnswerComments: payload.selectedAnswerComments || {},
        freeTextResponse: payload.freeTextResponse ?? null,
        candidateFirstName: null,
        candidateLastName: null,
        candidateEmail: null,
        candidateBirthDate: null,
        candidatePhone: payload.questionId.toString(),
        candidateCvPath: payload.answerId ? payload.answerId.toString() : null
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
        candidateFirstName: null,
        candidateLastName: null,
        candidateEmail: null,
        candidatePhone: null,
        candidateBirthDate: null
      }
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<ApplicationResponse>(`${this.applicationsUrl}/complete-quiz`, request, { headers });
  }

  touchQuiz(applicationId: number, quizToken: string): Observable<ApplicationResponse> {
    const request = {
      user: 1,
      data: {
        id: applicationId,
        searchString: quizToken,
        candidateFirstName: null,
        candidateLastName: null,
        candidateEmail: null,
        candidatePhone: null,
        candidateBirthDate: null
      }
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<ApplicationResponse>(`${this.applicationsUrl}/touch-quiz`, request, { headers });
  }

  createQuizAttempt(applicationId: number): Observable<ApplicationResponse> {
    const currentUserData = localStorage.getItem('user');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id?.toString() || '1' : '1';

    const request = {
      user: currentUserId,
      data: {
        id: applicationId,
        action: 'CREATE_QUIZ_ATTEMPT',
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

    return this.http.post<ApplicationResponse>(`${this.applicationsUrl}/custom`, request, { headers });
  }

  getApplicationDetail(applicationId: number): Observable<Application | null> {
    return this.getAllApplicationsByCriteria({ idDe: String(applicationId), size: 1, page: 0 }).pipe(
      map(response => response.content?.[0] || null)
    );
  }

  /**
   * Génère l'URL de téléchargement d'un CV
   * @param cvPath Chemin du CV stocké en BDD (format: "uploads/cv/filename.pdf")
   * @returns URL complète de téléchargement
   */
  getCvDownloadUrl(cvPath: string): string {
    if (!cvPath) {
      return '';
    }
    
    // Extraire le nom du fichier du chemin complet
    const filename = cvPath.split('/').pop();
    
    // Retourner l'URL complète de téléchargement
    return `${this.baseUrl}/files/download/${filename}`;
  }

  /**
   * Vérifie si un CV existe sur le serveur
   * @param cvPath Chemin du CV stocké en BDD
   * @returns Observable<boolean> true si le fichier existe
   */
  checkCvExists(cvPath: string): Observable<boolean> {
    if (!cvPath) {
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    const filename = cvPath.split('/').pop();
    
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/files/exists/${filename}`)
      .pipe(
        map(response => response.exists),
        catchError(() => of(false))
      );
  }

  /**
   * Récupère TOUTES les applications selon des critères (y compris les supprimées)
   * @param criteria critères de recherche optionnels
   * @returns Observable de la liste paginée d'applications incluant les supprimées
   */
  getAllApplicationsByCriteria(criteria: ApplicationSearchCriteria = {}): Observable<PagedApplicationResponse> {
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
        candidateFirstName: criteria.candidateFirstName || "",
        candidateLastName: criteria.candidateLastName || "",
        candidateEmail: criteria.candidateEmail || "",
        candidatePhone: criteria.candidatePhone || "",
        candidateBirthDate: "",
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : "",
        searchString: criteria.search_string || "",
        ...(criteria.sourceTokenId && { sourceTokenId: criteria.sourceTokenId }),
        ...(criteria.formVersionId && { formVersionId: criteria.formVersionId }),
        
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

    return this.http.post<any>(`${this.applicationsUrl}/getAllByCriteria`, request).pipe(
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
        const rawApplications = response.items || (response.item ? [response.item] : []);
        
        // Calculer le nombre total de pages
        const totalElements = response.totalCount || response.count || rawApplications.length;
        const pageSize = criteria.size || 10;
        const totalPages = Math.ceil(totalElements / pageSize);
        
        return {
          content: rawApplications,
          totalElements: totalElements,
          totalPages: totalPages,
          size: pageSize,
          number: criteria.page || 0
        };
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des applications:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Restaure une application supprimée
   * @param applicationId ID de l'application à restaurer
   * @returns Observable<ApplicationResponse>
   */
  restoreApplication(applicationId: number): Observable<ApplicationResponse> {
    const request: ApplicationRequest = {
      user: 1,
      datas: [{ 
        id: applicationId,
        isDeleted: false,
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

    return this.http.post<ApplicationResponse>(`${this.applicationsUrl}/update`, request, { headers });
  }
}