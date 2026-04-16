import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
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
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
  campaignId?: number;
  userId?: number;
  
  // DonnÃ©es enrichies
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

export interface CampaignCrudSearchCriteria {
  page?: number;
  size?: number;
  search_string?: string;
  idDe?: string;
  idA?: string;
  userId?: number;
  campaignId?: number;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

export interface PagedCampaignCrudResponse {
  content: CampaignCrud[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class CampaignCrudService {
  private baseUrl = `${environment.apiUrl}/campaignCrud`;

  constructor(private http: HttpClient) {}

  /**
   * RÃ©cupÃ¨re les permissions pour une campagne
   */
  getByCampaignId(campaignId: number): Observable<CampaignCrudResponse> {
    return this.http.post<CampaignCrudResponse>(
      `${this.baseUrl}/getByCriteria`,
      { campaignId }
    );
  }

  /**
   * RÃ©cupÃ¨re les utilisateurs pouvant Ã©valuer une campagne
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
    console.log('ðŸ” RequÃªte getEvaluatorsByCampaignId:', payload);
    
    return this.http.post<CampaignCrudResponse>(
      `${this.baseUrl}/getByCriteria`,
      payload
    ).pipe(
      tap((response: CampaignCrudResponse) => console.log('ðŸ“¦ RÃ©ponse getEvaluatorsByCampaignId:', response))
    );
  }

  getAllByCriteria(criteria: CampaignCrudSearchCriteria = {}): Observable<PagedCampaignCrudResponse> {
    const currentUserData = localStorage.getItem('user');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id?.toString() || '1' : '1';
    const request = {
      user: currentUserId,
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        id: criteria.idDe || '',
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : '',
        searchString: criteria.search_string || '',
        ...(criteria.userId && { userId: criteria.userId }),
        ...(criteria.campaignId && { campaignId: criteria.campaignId }),
                ...(criteria.dateCreationDe && { dateCreationDe: criteria.dateCreationDe }),
        ...(criteria.dateCreationA && { dateCreationA: criteria.dateCreationA }),
        ...(criteria.dateModificationDe && { dateModificationDe: criteria.dateModificationDe }),
        ...(criteria.dateModificationA && { dateModificationA: criteria.dateModificationA }),
        ...(criteria.idDe && criteria.idDe.trim() && { idStart: criteria.idDe }),
        ...(criteria.idA && criteria.idA.trim() && { idEnd: criteria.idA })
      }
    };
    return this.http.post<any>(`${this.baseUrl}/getAllByCriteria`, request).pipe(
      map(response => {
        if (!response || (!response.items && !response.item)) {
          return { content: [], totalElements: 0, totalPages: 0, size: criteria.size || 10, number: criteria.page || 0 };
        }
        const items = response.items || (response.item ? [response.item] : []);
        const totalElements = response.totalCount || response.count || items.length;
        const pageSize = criteria.size || 10;
        return { content: items, totalElements, totalPages: Math.ceil(totalElements / pageSize), size: pageSize, number: criteria.page || 0 };
      }),
      catchError(error => { console.error('Erreur campaign-crud:', error); return throwError(() => error); })
    );
  }

  create(item: CampaignCrud): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, { user: 1, datas: [item] });
  }

  update(item: CampaignCrud): Observable<any> {
    return this.http.post(`${this.baseUrl}/update`, { user: 1, datas: [item] });
  }

  delete(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/delete`, { user: 1, datas: [{ id }] });
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/update`, { user: 1, datas: [{ id, isDeleted: false }] });
  }
}
