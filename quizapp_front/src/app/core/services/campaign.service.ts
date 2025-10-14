import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { QuestionService, Question } from './question.service';

/**
 * Interface pour les données d'une campagne
 */
export interface Campaign {
  id: number;
  campaignTitle?: string;
  campaignName?: string;
  campaignDesc?: string;
  campaignStatus?: 'ACTIVE' | 'PENDING' | 'CLOSED';
  campaignStart?: string;
  campaignEnd?: string;
  campaignDuration?: number;
  maxApply?: number;
  allCanEvaluate?: boolean;
  markedOutOf?: number;
  isActive?: boolean;
  departmentsId?: number;
  specialitiesId?: number;
  departmentName?: string;
  specialityName?: string;
  specialityLibelle?: string;
  isDeleted?: boolean;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  creatorName?: string;
  applicationsCount?: number;
  questionsCount?: number;
}

/**
 * Interface pour les données de liaison campagne-questions
 */
export interface CampaignQuestions {
  id: number;
  campaignId: number;
  questionId: number;
  createdAt?: string;
  createdBy?: number;
  isDeleted?: boolean;
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

  private readonly apiUrl = `${environment.apiUrl}/campaigns`;

  constructor(private http: HttpClient, private questionService: QuestionService) {
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

        // Transformer les données en utilisant transformCampaign pour la cohérence
        const campaigns = rawCampaigns.map((c: any) => this.transformCampaign(c));

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

  /**
   * Récupère les questions liées à une campagne
   */
  getCampaignQuestions(campaignId: number): Observable<Question[]> {
    console.log('📥 Récupération des questions de la campagne:', campaignId);

    // D'abord récupérer les CampaignQuestions pour cette campagne
    const requestBody = {
      user: "1",
      data: {
        campaignId: campaignId.toString()
      },
      size: 1000, // Récupérer toutes les questions
      index: 0
    };

    return this.http.post<any>(`${environment.apiUrl}/campaignQuestions/getAllByCriteria`, requestBody).pipe(
      switchMap((response: any) => {
        console.log('🔍 CampaignQuestions reçues:', response);

        if (!response || response.hasError || !response.items || response.items.length === 0) {
          console.log('⚠️ Aucune question trouvée pour cette campagne');
          return of([]);
        }

        // Extraire les questionIds
        const questionIds = response.items.map((cq: any) => cq.questionId);
        console.log('📋 IDs des questions à récupérer:', questionIds);

        if (questionIds.length === 0) {
          return of([]);
        }

        // Maintenant récupérer les détails des questions
        // Pour simplifier, on va récupérer toutes les questions et filtrer côté client
        return this.questionService.getAllQuestionsByCriteria({
          size: 1000,
          page: 0
        }).pipe(
          map(questionResponse => {
            // Filtrer les questions qui appartiennent à cette campagne
            const campaignQuestions = questionResponse.content.filter((q: Question) =>
              questionIds.includes(q.id)
            );
            console.log('✅ Questions de la campagne récupérées:', campaignQuestions);
            return campaignQuestions;
          })
        );
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des questions de la campagne:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les campagnes créées par l'utilisateur connecté
   */
  getMyCampaigns(criteria: CampaignSearchCriteria = {}): Observable<PagedResponse<Campaign>> {
    const currentUserData = localStorage.getItem('user');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id : null;

    if (!currentUserId) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }

    console.log('📥 Récupération des campagnes créées par l\'utilisateur:', currentUserId);

    const requestBody = {
      user: currentUserId.toString(),
      size: criteria.size || 100,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        campaignTitle: criteria.campaignName || "",
        campaignDesc: "",
        campaignStatus: "",
        createdBy: currentUserId,
        searchString: criteria.search_string || ""
      }
    };

    return this.http.post<any>(`${this.apiUrl}/getByCriteria`, requestBody).pipe(
      map(response => {
        console.log('✅ Réponse getMyCampaigns:', response);
        
        if (!response || (!response.items && !response.item)) {
          return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: criteria.size || 100,
            number: criteria.page || 0,
            first: true,
            last: true,
            empty: true
          };
        }

        const rawCampaigns = response.items || (response.item ? [response.item] : []);
        const campaigns = rawCampaigns.map((c: any) => this.transformCampaign(c));

        return {
          content: campaigns,
          totalElements: response.totalCount || response.count || campaigns.length,
          totalPages: Math.ceil((response.totalCount || response.count || campaigns.length) / (criteria.size || 100)),
          size: criteria.size || 100,
          number: criteria.page || 0,
          first: (criteria.page || 0) === 0,
          last: (criteria.page || 0) >= Math.ceil((response.totalCount || response.count || campaigns.length) / (criteria.size || 100)) - 1,
          empty: campaigns.length === 0
        };
      }),
      catchError(error => {
        console.error('❌ Erreur getMyCampaigns:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les campagnes partagées avec l'utilisateur via campaign_crud
   */
  getSharedCampaigns(): Observable<Campaign[]> {
    const currentUserData = localStorage.getItem('user');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id?.toString() || "1" : "1";

    console.log('📥 Récupération des campagnes partagées pour l\'utilisateur:', currentUserId);

    const requestBody = {
      user: currentUserId,
      size: 100,
      index: 0,
      isSimpleLoading: false,
      data: {
        userId: currentUserId,
        canUpdate: "",
        canDelete: "",
        canEvaluate: "",
        follow: "",
        searchString: ""
      }
    };

    return this.http.post<any>(`${environment.apiUrl}/campaignCrud/getByCriteria`, requestBody).pipe(
      map(response => {
        console.log('✅ Réponse getSharedCampaigns:', response);
        
        if (!response || (!response.items && !response.item)) {
          return [];
        }

        const rawCrudItems = response.items || (response.item ? [response.item] : []);
        
        // Extraire les campagnes des items campaign_crud
        const campaigns: Campaign[] = rawCrudItems
          .filter((item: any) => item.campaigns || item.campaign)
          .map((item: any) => {
            const campaign = item.campaigns || item.campaign;
            return this.transformCampaign(campaign);
          });

        console.log('✅ Campagnes partagées transformées:', campaigns);
        return campaigns;
      }),
      catchError(error => {
        console.error('❌ Erreur getSharedCampaigns:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Transforme une campagne brute du backend vers le format frontend
   */
  private transformCampaign(campaign: any): Campaign {
    return {
      id: campaign.id,
      campaignTitle: campaign.campaignTitle || campaign.campaign_title || '',
      campaignName: campaign.campaignTitle || campaign.campaign_title || '',
      campaignDesc: campaign.campaignDesc || campaign.campaign_desc || '',
      campaignStatus: (campaign.campaignStatus || campaign.campaign_status || 'PENDING').toUpperCase(),
      campaignStart: campaign.campaignStart || campaign.campaign_start,
      campaignEnd: campaign.campaignEnd || campaign.campaign_end,
      maxApply: campaign.maxApply || campaign.max_apply,
      allCanEvaluate: campaign.allCanEvaluate || campaign.all_can_evaluate || false,
      markedOutOf: campaign.markedOutOf || campaign.marked_out_of,
      isActive: campaign.campaignStatus === 'ACTIVE' || campaign.campaign_status === 'ACTIVE',
      createdAt: campaign.createdAt || campaign.created_at,
      createdBy: campaign.createdBy || campaign.created_by,
      updatedAt: campaign.updatedAt || campaign.updated_at,
      specialitiesId: campaign.specialityId || campaign.speciality_id,
      specialityLibelle: campaign.specialityLibelle || campaign.speciality_libelle,
      specialityName: campaign.specialityLibelle || campaign.speciality_libelle,
      creatorName: campaign.creatorName || campaign.creator_name,
      applicationsCount: campaign.applicationsCount || campaign.applications_count || 0,
      questionsCount: campaign.questionsCount || campaign.questions_count || 0
    };
  }
}