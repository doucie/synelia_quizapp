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
  campaignTitle: string;
  campaignDesc?: string;
  campaignStatus: string;
  campaignStart?: string;
  campaignEnd?: string;
  maxApply?: number;
  allCanUpdate?: boolean;
  markedOutOf?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  specialityId?: number;
  creatorId?: number;

  // Champs liés aux utilisateurs
  userFirstName?: string;
  userLastName?: string;
}

/**
 * Interface pour les critères de recherche des campagnes
 */
export interface CampaignSearchCriteria {
  // Frontend field names
  idDe?: string;
  idA?: string;
  campaignTitle?: string;
  campaignDesc?: string;
  campaignStatus?: string;
  campaignStartDe?: string;
  campaignStartA?: string;
  campaignEndDe?: string;
  campaignEndA?: string;
  maxApply?: number;
  isDeleted?: boolean;

  // Intervalles de dates
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;

  // Pagination
  page?: number;
  size?: number;
  search_string?: string;  // Champ de recherche globale

  // Backend field names for mapping
  campaignStartStart?: string;
  campaignStartEnd?: string;
  campaignEndStart?: string;
  campaignEndEnd?: string;
  createdAtStart?: string;
  createdAtEnd?: string;
  updatedAtStart?: string;
  updatedAtEnd?: string;
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
}

/**
 * Service pour gérer les campagnes
 */
@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiUrl = '/campaigns';

  constructor(
    private http: HttpClient
  ) {}

  /**
   * Récupère toutes les campagnes selon des critères
   * @param criteria critères de recherche optionnels
   * @returns Observable de la liste paginée des campagnes
   */
  getByCriteria(criteria: CampaignSearchCriteria = {}): Observable<PagedResponse<Campaign>> {
    // Récupérer l'ID de l'utilisateur connecté depuis localStorage pour éviter la dépendance circulaire
    const currentUserData = localStorage.getItem('currentUser');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id?.toString() || "1" : "1";

    // Construction de la requête selon le format backend attendu
    const request = {
      // ID de l'utilisateur connecté (requis)
      user: currentUserId,
      // Paramètres de pagination
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      // Données de critères avec tous les champs CampaignDto
      data: {
        id: criteria.idDe || "",  // On utilise idDe comme critère principal pour l'ID
        campaignTitle: criteria.campaignTitle || "",
        campaignDesc: criteria.campaignDesc || "",
        campaignStatus: criteria.campaignStatus || "",
        campaignStart: "",
        campaignEnd: "",
        maxApply: criteria.maxApply?.toString() || "",
        allCanUpdate: "",
        markedOutOf: "",
        createdAt: "",
        createdBy: "",
        updatedAt: "",
        updatedBy: "",
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted : "",
        searchString: criteria.search_string || "",

        // Critères de dates et intervalles
        campaignStartStart: criteria.campaignStartDe || "",
        campaignStartEnd: criteria.campaignStartA || "",
        campaignEndStart: criteria.campaignEndDe || "",
        campaignEndEnd: criteria.campaignEndA || "",
        createdAtStart: criteria.dateCreationDe || "",
        createdAtEnd: criteria.dateCreationA || "",
        updatedAtStart: criteria.dateModificationDe || "",
        updatedAtEnd: criteria.dateModificationA || "",

        // Intervalles d'ID (champs supplémentaires pour le backend)
        idStart: criteria.idDe || "",
        idEnd: criteria.idA || ""
      }
    };

    console.log('🚀 Envoi de la requête getCampaignsByCriteria:', request);
    console.log('🔍 DÉTAIL de la requête (getByCriteria):');
    console.log('  - user (ID connecté):', currentUserId);
    console.log('  - size (taille page):', criteria.size);
    console.log('  - index (page):', criteria.page);
    console.log('  - data complet:', request.data);

    return this.http.post<any>(`${this.apiUrl}/getAllByCriteria`, request).pipe(
      map(response => {
        console.log('🔍 Raw API Response:', response);
        console.log('🔍 Response keys (getByCriteria):', Object.keys(response));
        console.log('🔍 Response.count (getByCriteria):', response.count);
        console.log('🔍 Response.totalCount (getByCriteria):', response.totalCount);
        console.log('🔍 Response.totalElements (getByCriteria):', response.totalElements);
        console.log('🔍 Response.total (getByCriteria):', response.total);
        console.log('🔍 Response.items.length (getByCriteria):', response.items?.length);

        // Vérifier si la réponse contient des données
        if (!response || (!response.items && !response.item)) {
          console.warn('⚠️ Aucune donnée dans la réponse');
          return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: criteria.size || 10,
            number: criteria.page || 0
          };
        }

        // Traiter les éléments (items ou item unique)
        const rawCampaigns = response.items || (response.item ? [response.item] : []);
        console.log('🔍 Raw campaigns count:', rawCampaigns.length);
        console.log('🔍 Raw campaigns:', rawCampaigns);

        // Transformer la réponse du backend vers le format frontend
        const transformedCampaigns: Campaign[] = rawCampaigns.map((campaign: any) => ({
          id: campaign.id,
          campaignTitle: campaign.campaignTitle || '',
          campaignDesc: campaign.campaignDesc || '',
          campaignStatus: campaign.campaignStatus || 'draft',
          campaignStart: campaign.campaignStart,
          campaignEnd: campaign.campaignEnd,
          maxApply: campaign.maxApply,
          allCanUpdate: campaign.allCanUpdate,
          markedOutOf: campaign.markedOutOf,
          createdAt: campaign.createdAt,
          createdBy: campaign.createdBy,
          updatedAt: campaign.updatedAt,
          updatedBy: campaign.updatedBy,
          isDeleted: campaign.isDeleted || false,
          specialityId: campaign.specialityId,
          creatorId: campaign.creatorId,
          userFirstName: campaign.userFirstName,
          userLastName: campaign.userLastName
        }));

        console.log('🔍 Transformed campaigns count:', transformedCampaigns.length);
        console.log('🔍 Transformed campaigns:', transformedCampaigns);

        return {
          content: transformedCampaigns,
          totalElements: response.totalCount || response.count || rawCampaigns.length,
          totalPages: Math.ceil((response.totalCount || response.count || rawCampaigns.length) / (criteria.size || 10)),
          size: criteria.size || 10,
          number: criteria.page || 0
        };
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des campagnes:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère une campagne par son ID
   * @param id ID de la campagne
   * @returns Observable de la campagne
   */
  getById(id: number): Observable<Campaign> {
    const currentUserData = localStorage.getItem('currentUser');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id?.toString() || "1" : "1";

    const request = {
      user: currentUserId,
      size: 1,
      index: 0,
      isSimpleLoading: false,
      data: {
        id: id.toString(),
        isDeleted: "false"
      }
    };

    return this.http.post<any>(`${this.apiUrl}/getAllByCriteria`, request).pipe(
      map(response => {
        const campaigns = response.items || (response.item ? [response.item] : []);
        if (campaigns.length === 0) {
          throw new Error('Campagne non trouvée');
        }

        const campaign = campaigns[0];
        return {
          id: campaign.id,
          campaignTitle: campaign.campaignTitle || '',
          campaignDesc: campaign.campaignDesc || '',
          campaignStatus: campaign.campaignStatus || 'draft',
          campaignStart: campaign.campaignStart,
          campaignEnd: campaign.campaignEnd,
          maxApply: campaign.maxApply,
          allCanUpdate: campaign.allCanUpdate,
          markedOutOf: campaign.markedOutOf,
          createdAt: campaign.createdAt,
          createdBy: campaign.createdBy,
          updatedAt: campaign.updatedAt,
          updatedBy: campaign.updatedBy,
          isDeleted: campaign.isDeleted || false,
          specialityId: campaign.specialityId,
          creatorId: campaign.creatorId,
          userFirstName: campaign.userFirstName,
          userLastName: campaign.userLastName
        };
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération de la campagne:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crée une nouvelle campagne
   * @param campaign Données de la campagne à créer
   * @returns Observable de la campagne créée
   */
  create(campaign: Partial<Campaign>): Observable<Campaign> {
    const currentUserData = localStorage.getItem('currentUser');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id?.toString() || "1" : "1";

    const request = {
      user: currentUserId,
      data: {
        campaignTitle: campaign.campaignTitle || '',
        campaignDesc: campaign.campaignDesc || '',
        campaignStatus: campaign.campaignStatus || 'draft',
        campaignStart: campaign.campaignStart || '',
        campaignEnd: campaign.campaignEnd || '',
        maxApply: campaign.maxApply?.toString() || '',
        specialityId: campaign.specialityId?.toString() || '',
        isDeleted: "false"
      }
    };

    return this.http.post<any>(`${this.apiUrl}/create`, request).pipe(
      map(response => {
        console.log('✅ Campagne créée:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la création de la campagne:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Met à jour une campagne
   * @param id ID de la campagne
   * @param campaign Données à mettre à jour
   * @returns Observable de la campagne mise à jour
   */
  update(id: number, campaign: Partial<Campaign>): Observable<Campaign> {
    const currentUserData = localStorage.getItem('currentUser');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id?.toString() || "1" : "1";

    const request = {
      user: currentUserId,
      data: {
        id: id.toString(),
        campaignTitle: campaign.campaignTitle || '',
        campaignDesc: campaign.campaignDesc || '',
        campaignStatus: campaign.campaignStatus || 'draft',
        campaignStart: campaign.campaignStart || '',
        campaignEnd: campaign.campaignEnd || '',
        maxApply: campaign.maxApply?.toString() || '',
        specialityId: campaign.specialityId?.toString() || '',
        isDeleted: campaign.isDeleted?.toString() || "false"
      }
    };

    return this.http.put<any>(`${this.apiUrl}/update`, request).pipe(
      map(response => {
        console.log('✅ Campagne mise à jour:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la mise à jour de la campagne:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprime une campagne (soft delete)
   * @param id ID de la campagne
   * @returns Observable du résultat
   */
  delete(id: number): Observable<any> {
    const currentUserData = localStorage.getItem('currentUser');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id?.toString() || "1" : "1";

    const request = {
      user: currentUserId,
      data: {
        id: id.toString(),
        isDeleted: "true"
      }
    };

    return this.http.put<any>(`${this.apiUrl}/update`, request).pipe(
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
}