import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SourceToken {
  id?: number;
  tokenString?: string;
  sourceTokenName?: string;
  campaignId?: number;
  campaigns_id?: number; // Version snake_case du backend
  campaignName?: string;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
}

export interface SourceTokenRequest {
  user?: number;
  data?: Partial<SourceToken>;
  datas?: Partial<SourceToken>[];
}

export interface SourceTokenResponse {
  hasError: boolean;
  status: {
    code: string;
    message: string;
  };
  items?: SourceToken[];
}

export interface SourceTokenValidation {
  isValid: boolean;
  campaignId?: number;
  campaignName?: string;
  message?: string;
}

interface BackendResponse {
  hasError: boolean;
  status: {
    code: string;
    message: string;
  };
  items?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SourceTokenService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sourceToken`;

  /**
   * Récupère tous les source tokens par critères
   * @param criteria Critères de recherche
   * @returns Observable avec les source tokens
   */
  getSourceTokensByCriteria(criteria: Partial<SourceToken> = {}): Observable<SourceTokenResponse> {
    const request: SourceTokenRequest = {
      user: 1,
      data: criteria
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<SourceTokenResponse>(`${this.apiUrl}/getByCriteria`, request, { headers }).pipe(
      tap(response => {
        console.log('🎫 Source Tokens bruts du backend:', response);
        if (response.items) {
          response.items.forEach(st => {
            console.log(`  🎫 ST #${st.id}: "${st.sourceTokenName}" → campaignId=${st.campaignId || st.campaigns_id || 'undefined'}`);
          });
        }
      })
    );
  }

  /**
   * Récupère les source tokens d'une campagne spécifique
   * @param campaignId ID de la campagne
   * @returns Observable avec les source tokens de cette campagne
   */
  getSourceTokensByCampaign(campaignId: number): Observable<SourceToken[]> {
    return this.getSourceTokensByCriteria({ campaignId }).pipe(
      map(response => response.items || [])
    );
  }

  /**
   * Vérifie si un source token existe et est valide
   * @param tokenString Le token string à vérifier (6 caractères)
   * @returns Observable avec les informations de validation
   */
  validateToken(tokenString: string): Observable<SourceTokenValidation> {
    // Validation basique du format
    if (!tokenString || tokenString.length !== 6) {
      return of({
        isValid: false,
        message: 'Format de token invalide'
      });
    }

    // Appel API pour vérifier l'existence du token
    return this.http.get<BackendResponse>(`${this.apiUrl}/validate/${tokenString}`).pipe(
      map(response => {
        if (response.hasError) {
          return {
            isValid: false,
            message: response.status?.message || 'Token invalide ou expiré'
          };
        }
        
        const tokenData = response.items && response.items.length > 0 ? response.items[0] : null;
        return {
          isValid: true,
          campaignId: tokenData?.campaignId,
          campaignName: tokenData?.campaignName
        };
      }),
      catchError(error => {
        console.error('Erreur validation token:', error);
        return of({
          isValid: false,
          message: 'Token invalide ou expiré'
        });
      })
    );
  }

  /**
   * Récupère les informations détaillées d'un source token
   * @param tokenString Le token string
   * @returns Observable avec les données du token
   */
  getTokenInfo(tokenString: string): Observable<BackendResponse> {
    return this.http.get<BackendResponse>(`${this.apiUrl}/info/${tokenString}`);
  }

  /**
   * Crée un ou plusieurs nouveaux source tokens
   * @param tokens Array de tokens à créer
   * @returns Observable avec la réponse
   */
  createSourceTokens(tokens: Partial<SourceToken>[]): Observable<SourceTokenResponse> {
    const request: SourceTokenRequest = {
      user: 1,
      datas: tokens
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<SourceTokenResponse>(`${this.apiUrl}/create`, request, { headers });
  }

  /**
   * Supprime un source token
   * @param tokenId ID du token à supprimer
   * @returns Observable avec la réponse
   */
  deleteSourceToken(tokenId: number): Observable<SourceTokenResponse> {
    const request = {
      user: 1,
      data: { id: tokenId }
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<SourceTokenResponse>(`${this.apiUrl}/delete`, request, { headers });
  }
}
