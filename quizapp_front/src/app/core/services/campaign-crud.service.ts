import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CampaignCrud {
  id?: number;
  canUpdate?: boolean;
  canDelete?: boolean;
  canEvaluate?: boolean;
  follow?: boolean;
  isAdmin?: boolean;
  canPlanify?: boolean;
  canAcceptPreScreen?: boolean;
  canAcceptFinal?: boolean;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  campaignId?: number;
  userId?: number;
  
  // Données enrichies
  userName?: string;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
}

export interface CampaignCrudResponse {
  status: {
    code: string;
    message: string;
  };
  hasError: boolean;
  count: number;
  httpCode: number;
  items: CampaignCrud[];
}

@Injectable({
  providedIn: 'root'
})
export class CampaignCrudService {
  private baseUrl = `${environment.apiUrl}/campaignCrud`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère les permissions pour une campagne
   */
  getByCampaignId(campaignId: number): Observable<CampaignCrudResponse> {
    return this.http.post<CampaignCrudResponse>(
      `${this.baseUrl}/getByCriteria`,
      { campaignId }
    );
  }

  /**
   * Récupère les utilisateurs pouvant évaluer une campagne
   */
  getEvaluatorsByCampaignId(campaignId: number): Observable<CampaignCrudResponse> {
    const payload = { 
      user: "1",
      isSimpleLoading: false,
      data: {
        campaignId: campaignId.toString(),
        canEvaluate: true
      }
    };
    console.log('🔍 Requête getEvaluatorsByCampaignId:', payload);
    
    return this.http.post<CampaignCrudResponse>(
      `${this.baseUrl}/getByCriteria`,
      payload
    ).pipe(
      tap((response: CampaignCrudResponse) => console.log('📦 Réponse getEvaluatorsByCampaignId:', response))
    );
  }
}
