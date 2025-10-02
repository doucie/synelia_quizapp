import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Interface pour les données d'une campagne
 */
export interface Campaign {
  id: number;
  campaignName?: string;
  campaignDesc?: string;
  campaignStart?: string;
  campaignEnd?: string;
  campaignDuration?: number;
  isActive?: boolean;
  departmentsId?: number;
  specialitiesId?: number;
  departmentName?: string;
  specialityName?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface pour les critères de recherche des campagnes
 */
export interface CampaignSearchCriteria {
  // Frontend field names
  idDe?: string;
  idA?: string;
  campaignName?: string;
  campaignDesc?: string;
  departmentsId?: number;
  specialitiesId?: number;
  isActive?: boolean;
  isDeleted?: boolean;

  // Intervalles de dates
  campaignStartDe?: string;
  campaignStartA?: string;
  campaignEndDe?: string;
  campaignEndA?: string;

  // Recherche générale
  search_string?: string;

  // Pagination
  size?: number;
  page?: number;
}

/**
 * Interface pour la réponse paginée
 */
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  private readonly apiUrl = '/campaigns';

  constructor(private http: HttpClient) {
    console.log('🚀 Initialisation CampaignService');
    console.log('📡 URL de l\'API:', this.apiUrl);
  }

  /**
   * Récupère toutes les campagnes avec critères de recherche
   */
  getAllCampaignsByCriteria(criteria: CampaignSearchCriteria): Observable<PagedResponse<Campaign>> {
    console.log('📥 Récupération des campagnes avec critères:', criteria);

    // Transformer les critères pour correspondre au format backend
    const backendCriteria = {
      ...criteria,
      campaignTitle: criteria.campaignName,
      campaignName: undefined // Supprimer campaignName pour éviter la confusion
    };

    // Préparer le corps de la requête selon le format API backend
    const requestBody = {
      user: "1", // ID utilisateur par défaut
      size: criteria.size || 10,
      index: criteria.page || 0,
      data: backendCriteria // Les critères de recherche dans data
    };

    console.log('🔍 Corps de la requête:', requestBody);

    return this.http.post<any>(`${this.apiUrl}/getAllByCriteria`, requestBody).pipe(
      map((response: any) => {
        console.log('🔍 Raw API Response (CAMPAIGNS):', response);
        console.log('🔍 Response keys:', Object.keys(response));
        console.log('🔍 Response.hasError:', response.hasError);
        console.log('🔍 Response.status:', response.status);
        console.log('🔍 Response.items exists:', !!response.items);
        console.log('🔍 Response.items length:', response.items?.length);
        console.log('🔍 Response.content exists:', !!response.content);
        console.log('🔍 Response.content length:', response.content?.length);
        console.log('✅ Réponse reçue:', response);

        // Transformer la réponse backend vers le format frontend attendu
        if (!response || response.hasError) {
          console.warn('⚠️ Erreur dans la réponse API ou aucune donnée');
          return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: criteria.size || 10,
            number: criteria.page || 0,
            first: true,
            last: true,
            empty: true
          };
        }

        // L'API retourne 'items', mais le frontend attend 'content'
        const rawCampaigns = response.items || response.content || [];

        // Transformer les données pour correspondre au format attendu par le frontend
        const campaigns = rawCampaigns.map((c: any) => ({
          id: c.id,
          campaignName: c.campaignTitle,
          campaignDesc: c.campaignDesc,
          campaignStart: c.campaignStart,
          campaignEnd: c.campaignEnd,
          campaignDuration: c.campaignDuration,
          isActive: c.isActive,
          departmentsId: c.departmentsId,
          specialitiesId: c.specialitiesId,
          departmentName: c.departmentName,
          specialityName: c.specialityName,
          isDeleted: c.isDeleted,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt
        }));

        console.log('🔄 Campagnes transformées:', campaigns);

        return {
          content: campaigns,
          totalElements: response.totalElements || response.total || response.count || campaigns.length,
          totalPages: response.totalPages || Math.ceil((response.totalElements || response.total || response.count || campaigns.length) / (criteria.size || 10)),
          size: criteria.size || 10,
          number: criteria.page || 0,
          first: (criteria.page || 0) === 0,
          last: (criteria.page || 0) >= (response.totalPages || Math.ceil((response.totalElements || response.total || response.count || campaigns.length) / (criteria.size || 10))) - 1,
          empty: campaigns.length === 0
        };
      }),
      catchError((error) => {
        console.error('❌ Erreur lors de la récupération des campagnes:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère une campagne par son ID
   */
  getCampaignById(id: number): Observable<Campaign> {
    console.log('📥 Récupération de la campagne ID:', id);

    // Préparer le corps de la requête pour récupérer une campagne spécifique
    const requestBody = {
      user: "1",
      size: 1,
      index: 0,
      data: { id: id }
    };

    return this.http.post<PagedResponse<Campaign>>(`${this.apiUrl}/getAllByCriteria`, requestBody).pipe(
      map(response => {
        console.log('✅ Campagne récupérée:', response);
        if (response.content && response.content.length > 0) {
          return response.content[0];
        } else {
          throw new Error('Campaign not found');
        }
      })
    );
  }

  /**
   * Crée une nouvelle campagne
   */
  createCampaign(campaign: Partial<Campaign>): Observable<Campaign> {
    console.log('📝 Création d\'une campagne:', campaign);

    // Transformer les données pour correspondre au format backend
    const backendCampaign = {
      ...campaign,
      campaignTitle: campaign.campaignName,
      campaignName: undefined // Supprimer campaignName pour éviter la confusion
    };

    const requestBody = {
      user: "1",
      datas: [backendCampaign]
    };

    return this.http.post<any>(`${this.apiUrl}/create`, requestBody).pipe(
      map(response => {
        console.log('✅ Campagne créée:', response);
        if (response.items && response.items.length > 0) {
          const backendItem = response.items[0];
          // Transformer la réponse backend vers le format frontend
          return {
            ...backendItem,
            campaignName: backendItem.campaignTitle,
            campaignTitle: undefined
          };
        } else {
          throw new Error('Failed to create campaign');
        }
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la création de la campagne:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Met à jour une campagne
   */
  updateCampaign(id: number, campaign: Partial<Campaign>): Observable<Campaign> {
    console.log('📝 Mise à jour de la campagne ID:', id, campaign);

    // Transformer les données pour correspondre au format backend
    const backendCampaign = {
      ...campaign,
      campaignTitle: campaign.campaignName,
      campaignName: undefined // Supprimer campaignName pour éviter la confusion
    };

    const requestBody = {
      user: "1",
      datas: [{ id, ...backendCampaign }]
    };

    return this.http.post<any>(`${this.apiUrl}/update`, requestBody).pipe(
      map(response => {
        console.log('✅ Campagne mise à jour:', response);
        if (response.items && response.items.length > 0) {
          const backendItem = response.items[0];
          // Transformer la réponse backend vers le format frontend
          return {
            ...backendItem,
            campaignName: backendItem.campaignTitle,
            campaignTitle: undefined
          };
        } else {
          throw new Error('Failed to update campaign');
        }
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la mise à jour de la campagne:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprime une campagne
   */
  deleteCampaign(id: number): Observable<any> {
    console.log('🗑️ Suppression de la campagne ID:', id);

    const requestBody = {
      user: "1",
      datas: [{ id }]
    };

    return this.http.post<any>(`${this.apiUrl}/delete`, requestBody).pipe(
      map(response => {
        console.log('✅ Campagne supprimée:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la suppression de la campagne:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Restaure une campagne supprimée
   */
  restoreCampaign(id: number): Observable<any> {
    console.log('♻️ Restauration de la campagne ID:', id);

    const requestBody = {
      user: "1",
      datas: [{ id }]
    };

    return this.http.post<any>(`${this.apiUrl}/restore`, requestBody).pipe(
      map(response => {
        console.log('✅ Campagne restaurée:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la restauration de la campagne:', error);
        return throwError(() => error);
      })
    );
  }
}