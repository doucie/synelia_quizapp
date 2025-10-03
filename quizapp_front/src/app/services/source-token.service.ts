import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
}
