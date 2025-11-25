import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
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
  specialityId?: number;
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

    return this.http.post<any>(`${this.apiUrl}/getAllByCriteria`, requestBody).pipe(
      map(response => {
        console.log('✅ Campagne récupérée:', response);
        // L'API retourne {items: [...], count: number, ...}
        if (response.items && response.items.length > 0) {
          return response.items[0];
        } else {
          throw new Error('Campaign not found');
        }
      })
    );
  }

  /**
   * Crée une nouvelle campagne
   */
  createCampaign(campaign: Partial<Campaign>): Observable<any> {
    console.log('📝 Création d\'une campagne:', campaign);

    // Transformer les données pour correspondre au format backend
    const backendCampaign: any = {
      campaignTitle: campaign.campaignTitle,
      campaignDesc: campaign.campaignDesc,
      campaignStatus: campaign.campaignStatus,
      campaignStart: campaign.campaignStart,
      campaignEnd: campaign.campaignEnd,
      maxApply: campaign.maxApply,
      allCanEvaluate: campaign.allCanEvaluate,
      markedOutOf: campaign.markedOutOf,
      specialityId: campaign.specialityId, // Backend utilise specialityId
      createdBy: campaign.createdBy,
      creatorId: campaign.createdBy // Backend requiert aussi creatorId
    };

    // Supprimer les valeurs undefined ou null
    Object.keys(backendCampaign).forEach(key => {
      if (backendCampaign[key] === undefined || backendCampaign[key] === null || backendCampaign[key] === '') {
        delete backendCampaign[key];
      }
    });

    const requestBody = {
      user: Number(campaign.createdBy) || 1,
      datas: [backendCampaign]
    };

    console.log('📤 Corps de la requête création campagne:', requestBody);

    return this.http.post<any>(`${this.apiUrl}/create`, requestBody).pipe(
      map(response => {
        console.log('✅ Réponse création campagne:', response);
        return response; // Retourner la réponse complète
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la création de la campagne:', error);
        if (error.error) {
          console.error('📋 Détails erreur backend:', error.error);
          if (error.error.status && error.error.status.message) {
            console.error('💬 Message d\'erreur:', error.error.status.message);
          }
        }
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
        console.log('🔍 Raw campaign_crud items:', rawCrudItems);
        console.log('🔍 Nombre de campaign_crud:', rawCrudItems.length);
        
        // Log chaque item pour voir sa structure
        rawCrudItems.forEach((item: any, index: number) => {
          console.log(`🔍 CampaignCrud #${index}:`, {
            id: item.id,
            userId: item.userId || item.users_id,
            campaignId: item.campaignId || item.campaigns_id,
            hasCampaignsField: !!item.campaigns,
            hasCampaignField: !!item.campaign,
            campaigns: item.campaigns,
            campaign: item.campaign
          });
        });
        
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
      campaignStart: campaign.campaignStart || campaign.campaign_start || undefined,
      campaignEnd: campaign.campaignEnd || campaign.campaign_end || undefined,
      campaignDuration: campaign.campaignDuration || campaign.campaign_duration || undefined,
      maxApply: campaign.maxApply ?? campaign.max_apply ?? undefined,
      allCanEvaluate: campaign.allCanEvaluate ?? campaign.all_can_evaluate ?? false,
      markedOutOf: campaign.markedOutOf || campaign.marked_out_of || undefined,
      isActive: campaign.campaignStatus === 'ACTIVE' || campaign.campaign_status === 'ACTIVE',
      createdAt: campaign.createdAt || campaign.created_at || undefined,
      createdBy: campaign.createdBy || campaign.created_by || undefined,
      updatedAt: campaign.updatedAt || campaign.updated_at || undefined,
      departmentsId: campaign.departmentsId || campaign.departments_id || undefined,
      departmentName: campaign.departmentName || campaign.department_name || undefined,
      specialitiesId: campaign.specialityId || campaign.speciality_id || undefined,
      specialityLibelle: campaign.specialityLibelle || campaign.speciality_libelle || undefined,
      specialityName: campaign.specialityLibelle || campaign.speciality_libelle || undefined,
      creatorName: campaign.creatorName || campaign.creator_name || 
                    (campaign.userFirstName && campaign.userLastName 
                      ? `${campaign.userFirstName} ${campaign.userLastName}` 
                      : undefined),
      applicationsCount: campaign.applicationsCount || campaign.applications_count || undefined,
      questionsCount: campaign.questionsCount || campaign.questions_count || undefined
    };
  }

  /**
   * Sauvegarde les accès recruteurs pour une campagne (campaign_crud)
   */
  saveCampaignAccess(accessDataArray: any[]): Observable<any> {
    console.log('💾 Sauvegarde des accès recruteurs:', accessDataArray);

    const requestBody = {
      user: 1,
      datas: accessDataArray
    };

    console.log('📤 Corps de la requête campaign_crud:', requestBody);

    return this.http.post<any>(`${environment.apiUrl}/campaignCrud/create`, requestBody).pipe(
      map(response => {
        console.log('✅ Accès recruteurs sauvegardés:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur sauvegarde accès recruteurs:', error);
        if (error.error) {
          console.error('📋 Détails erreur backend campaign_crud:', error.error);
          if (error.error.status && error.error.status.message) {
            console.error('💬 Message d\'erreur campaign_crud:', error.error.status.message);
          }
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les accès recruteurs pour une campagne (campaign_crud)
   */
  getCampaignAccess(campaignId: number): Observable<any[]> {
    console.log('📥 Récupération des accès recruteurs pour la campagne:', campaignId);

    const requestBody = {
      user: "1",
      size: 100,
      index: 0,
      data: { campaignId: campaignId }
    };

    return this.http.post<any>(`${environment.apiUrl}/campaignCrud/getAllByCriteria`, requestBody).pipe(
      map(response => {
        console.log('✅ Accès recruteurs récupérés:', response);
        if (response.items && response.items.length > 0) {
          return response.items;
        }
        return [];
      }),
      catchError(error => {
        console.error('❌ Erreur récupération accès recruteurs:', error);
        return of([]);
      })
    );
  }

  /**
   * Crée une notification pour un utilisateur
   */
  createNotification(notificationData: any): Observable<any> {
    console.log('📬 Création notification:', notificationData);

    const requestBody = {
      user: 1,
      datas: [notificationData]
    };

    console.log('📤 Corps de la requête notification:', requestBody);

    return this.http.post<any>(`${environment.apiUrl}/notifications/create`, requestBody).pipe(
      map(response => {
        console.log('✅ Notification créée:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur création notification:', error);
        if (error.error) {
          console.error('📋 Détails erreur backend notification:', error.error);
          if (error.error.status && error.error.status.message) {
            console.error('💬 Message d\'erreur notification:', error.error.status.message);
          }
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Ajoute une ou plusieurs questions à une campagne
   */
  addQuestionsToCampaign(campaignId: number, questionIds: number[]): Observable<any> {
    console.log('➕ Ajout de questions à la campagne:', { campaignId, questionIds });

    // Créer les données pour chaque liaison campagne-question
    const campaignQuestions = questionIds.map(questionId => ({
      campaigns_id: campaignId,
      questions_id: questionId
    }));

    const requestBody = {
      user: 1,
      datas: campaignQuestions
    };

    console.log('📤 Corps de la requête d\'ajout de questions:', requestBody);

    return this.http.post<any>(`${environment.apiUrl}/campaignQuestions/create`, requestBody).pipe(
      map(response => {
        console.log('✅ Questions ajoutées à la campagne:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur ajout questions à la campagne:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Retire une question d'une campagne (soft delete)
   */
  removeQuestionFromCampaign(campaignId: number, questionId: number): Observable<any> {
    console.log('🗑️ Retrait de la question de la campagne:', { campaignId, questionId });

    // D'abord récupérer l'ID de la liaison campaigns_questions
    const requestBody = {
      user: 1,
      size: 1,
      index: 0,
      data: {
        campaigns_id: campaignId,
        questions_id: questionId,
        isDeleted: false
      }
    };

    return this.http.post<any>(`${environment.apiUrl}/campaignQuestions/getAllByCriteria`, requestBody).pipe(
      switchMap(response => {
        if (!response.items || response.items.length === 0) {
          console.warn('⚠️ Liaison campagne-question introuvable');
          return throwError(() => new Error('Liaison introuvable'));
        }

        const campaignQuestionId = response.items[0].id;
        console.log('🔍 ID de la liaison trouvé:', campaignQuestionId);

        // Supprimer la liaison
        const deleteRequestBody = {
          user: 1,
          data: { id: campaignQuestionId }
        };

        return this.http.post<any>(`${environment.apiUrl}/campaignQuestions/delete`, deleteRequestBody);
      }),
      map(response => {
        console.log('✅ Question retirée de la campagne:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur retrait question de la campagne:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Ajoute des réponses à une question (liaison questions_answers)
   */
  addAnswersToQuestion(questionId: number, answerIds: number[]): Observable<any> {
    console.log('➕ Ajout de réponses à la question:', { questionId, answerIds });

    // Créer les données pour chaque liaison question-réponse
    const questionAnswers = answerIds.map(answerId => ({
      questions_id: questionId,
      answers_id: answerId
    }));

    const requestBody = {
      user: 1,
      datas: questionAnswers
    };

    console.log('📤 Corps de la requête d\'ajout de réponses:', requestBody);

    return this.http.post<any>(`${environment.apiUrl}/questionsAnswers/create`, requestBody).pipe(
      map(response => {
        console.log('✅ Réponses ajoutées à la question:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur ajout réponses à la question:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère tous les accès aux campagnes pour un utilisateur
   */
  getCampaignAccessesByUser(userId: number): Observable<any[]> {
    console.log('🔍 Récupération des accès campagnes pour user:', userId);

    const requestBody = {
      user: 1,
      size: 1000,
      index: 0,
      data: { userId: userId }
    };

    return this.http.post<any>(`${environment.apiUrl}/campaignCrud/getAllByCriteria`, requestBody).pipe(
      map(response => {
        console.log('✅ Accès campagnes récupérés:', response);
        return response.items || [];
      }),
      catchError(error => {
        console.error('❌ Erreur récupération accès campagnes:', error);
        return of([]);
      })
    );
  }

  /**
   * Vérifie les permissions d'édition pour une campagne
   * Retourne:
   * - CAN_EDIT si l'utilisateur a les droits directs
   * - REQUIRES_ADMIN_MODE si l'utilisateur est ADMIN/SUPER mais doit activer admin_mode
   * - NO_PERMISSION si l'utilisateur n'a aucun droit
   */
  checkEditPermission(campaignId: number): Observable<{
    status: 'CAN_EDIT' | 'REQUIRES_ADMIN_MODE' | 'NO_PERMISSION';
    userRole?: string;
  }> {
    console.log('🔐 Vérification des permissions pour la campagne:', campaignId);

    // Récupérer l'ID de l'utilisateur connecté depuis le localStorage
    const currentUserData = localStorage.getItem('user');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id : 1;
    
    console.log('👤 Utilisateur connecté ID:', currentUserId);

    // Ajouter le header user-id avec l'ID de l'utilisateur connecté
    const headers = new HttpHeaders({
      'user-id': currentUserId.toString()
    });

    const requestBody = {
      user: 1, // Le backend utilisera le header user-id à la place
      data: { id: campaignId }
    };

    return this.http.post<any>(`${this.apiUrl}/checkEditPermission`, requestBody, { headers }).pipe(
      map(response => {
        console.log('✅ Réponse permissions:', response);
        
        if (response.items && response.items.length > 0) {
          const item = response.items[0];
          console.log('🔍 Item reçu:', item);
          console.log('📝 campaignTitle (status):', item.campaignTitle);
          console.log('📝 campaignDesc (userRole):', item.campaignDesc);
          
          const status = item.campaignTitle; // Le backend utilise campaignTitle pour retourner le status
          const userRole = item.campaignDesc; // Le backend utilise campaignDesc pour retourner le role
          
          console.log('✨ Status final:', status, '| Role:', userRole);
          
          return {
            status: status as 'CAN_EDIT' | 'REQUIRES_ADMIN_MODE' | 'NO_PERMISSION',
            userRole: userRole
          };
        }
        
        console.log('⚠️ Pas d\'items dans la réponse');
        return { status: 'NO_PERMISSION' as const };
      }),
      catchError(error => {
        console.error('❌ Erreur vérification permissions:', error);
        return of({ status: 'NO_PERMISSION' as const });
      })
    );
  }
}

