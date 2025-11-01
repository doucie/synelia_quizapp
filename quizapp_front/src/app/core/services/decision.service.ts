import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Interface pour les données d'une décision
 */
export interface Decision {
  id?: number;
  decisionType: string;
  decisionAction: 'APPROVE' | 'CANCEL';
  applicationId: number;
  userId: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  searchString?: string;
  // Propriétés jointes
  userName?: string;
}

/**
 * Interface pour les données partielles de décision (pour les requêtes)
 */
export interface PartialDecision {
  id?: number;
  decisionType?: string;
  decisionAction?: string;
  applicationId?: number;
  userId?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  searchString?: string;
  // Propriétés jointes
  userName?: string;
}

/**
 * Interface pour la structure de requête du backend
 */
export interface DecisionRequest {
  user?: number;
  datas?: Decision[];
  data?: PartialDecision;
}

/**
 * Interface pour la structure de réponse du backend
 */
export interface DecisionResponse {
  hasError: boolean;
  status: {
    code: string;
    message: string;
  };
  items?: Decision[];
  item?: Decision;
  count?: number;
  httpCode?: number;
}

/**
 * Critères de recherche pour les décisions
 */
export interface DecisionCriteria {
  applicationId?: number;
  userId?: number;
  decisionType?: string;
  decisionAction?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

@Injectable({
  providedIn: 'root'
})
export class DecisionService {
  private apiUrl = `${environment.apiUrl}/decisions`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère les décisions par critères
   */
  getDecisionsByCriteria(criteria: DecisionCriteria = {}): Observable<DecisionResponse> {
    const headers = this.getHeaders();
    const request: DecisionRequest = {
      user: 1, // Utiliser l'ID système 1 pour les opérations de lecture
      data: {
        applicationId: criteria.applicationId,
        userId: criteria.userId,
        decisionType: criteria.decisionType,
        decisionAction: criteria.decisionAction
      } as PartialDecision
    };

    console.log('🔍 Service: Envoi de la requête getByCriteria:', JSON.stringify(request, null, 2));

    return this.http.post<DecisionResponse>(`${this.apiUrl}/getByCriteria`, request, { headers })
      .pipe(
        map(response => {
          console.log('🔍 Service: Réponse reçue:', response);
          return response;
        }),
        catchError(error => {
          console.error('Erreur lors de la récupération des décisions:', error);
          return of({
            hasError: true,
            status: {
              code: 'ERROR',
              message: 'Erreur lors de la récupération des décisions'
            },
            items: [],
            httpCode: 500
          });
        })
      );
  }

  /**
   * Récupère une décision par ID
   */
  getDecisionById(id: number): Observable<DecisionResponse> {
    const headers = this.getHeaders();
    const request: DecisionRequest = {
      user: this.getCurrentUserId(),
      data: { id } as PartialDecision
    };

    return this.http.post<DecisionResponse>(`${this.apiUrl}/getByCriteria`, request, { headers })
      .pipe(
        map(response => response),
        catchError(error => {
          console.error('Erreur lors de la récupération de la décision:', error);
          return of({
            hasError: true,
            status: {
              code: 'ERROR',
              message: 'Erreur lors de la récupération de la décision'
            },
            httpCode: 500
          });
        })
      );
  }

  /**
   * Récupère les décisions pour une application spécifique
   */
  getDecisionsByApplicationId(applicationId: number): Observable<DecisionResponse> {
    console.log(`\n🔍 Service: Récupération des décisions pour l'application ${applicationId}`);
    const criteria: DecisionCriteria = { applicationId };
    console.log('🔍 Critères:', criteria);
    return this.getDecisionsByCriteria(criteria);
  }

  /**
   * Crée une nouvelle décision
   */
  createDecision(decision: Decision): Observable<DecisionResponse> {
    const headers = this.getHeaders();
    const request: DecisionRequest = {
      user: this.getCurrentUserId(),
      datas: [decision]  // Le backend attend 'datas' (pluriel) avec un tableau
    };

    return this.http.post<DecisionResponse>(`${this.apiUrl}/create`, request, { headers })
      .pipe(
        map(response => response),
        catchError(error => {
          console.error('Erreur lors de la création de la décision:', error);
          return of({
            hasError: true,
            status: {
              code: 'ERROR',
              message: 'Erreur lors de la création de la décision'
            },
            httpCode: 500
          });
        })
      );
  }

  /**
   * Met à jour une décision
   */
  updateDecision(decision: Decision): Observable<DecisionResponse> {
    const headers = this.getHeaders();
    const request: DecisionRequest = {
      user: this.getCurrentUserId(),
      datas: [decision]  // Array avec l'objet décision à mettre à jour
    };

    return this.http.post<DecisionResponse>(`${this.apiUrl}/update`, request, { headers })
      .pipe(
        map(response => response),
        catchError(error => {
          console.error('Erreur lors de la mise à jour de la décision:', error);
          return of({
            hasError: true,
            status: {
              code: 'ERROR',
              message: 'Erreur lors de la mise à jour de la décision'
            },
            httpCode: 500
          });
        })
      );
  }

  /**
   * Supprime une décision
   */
  deleteDecision(id: number): Observable<DecisionResponse> {
    const headers = this.getHeaders();
    const request: DecisionRequest = {
      user: this.getCurrentUserId(),
      datas: [{ id } as Decision]  // Array avec l'objet contenant l'ID
    };

    return this.http.post<DecisionResponse>(`${this.apiUrl}/delete`, request, { headers })
      .pipe(
        map(response => response),
        catchError(error => {
          console.error('Erreur lors de la suppression de la décision:', error);
          return of({
            hasError: true,
            status: {
              code: 'ERROR',
              message: 'Erreur lors de la suppression de la décision'
            },
            httpCode: 500
          });
        })
      );
  }

  /**
   * Construit les paramètres de requête
   */
  private buildParams(criteria: DecisionCriteria): { [key: string]: string } {
    const params: { [key: string]: string } = {};

    if (criteria.applicationId) {
      params['applicationId'] = criteria.applicationId.toString();
    }
    if (criteria.userId) {
      params['userId'] = criteria.userId.toString();
    }
    if (criteria.decisionType) {
      params['decisionType'] = criteria.decisionType;
    }
    if (criteria.decisionAction) {
      params['decisionAction'] = criteria.decisionAction;
    }
    if (criteria.page !== undefined) {
      params['page'] = criteria.page.toString();
    }
    if (criteria.size !== undefined) {
      params['size'] = criteria.size.toString();
    }
    if (criteria.sort) {
      params['sort'] = criteria.sort;
    }
    if (criteria.direction) {
      params['direction'] = criteria.direction;
    }

    return params;
  }

  /**
   * Récupère les headers avec le token d'authentification
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Récupère l'ID de l'utilisateur connecté
   */
  private getCurrentUserId(): number | undefined {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.id;
      } catch (e) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', e);
      }
    }
    return undefined;
  }
}