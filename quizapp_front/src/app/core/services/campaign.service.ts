import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of, forkJoin } from 'rxjs';
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
  formAssignmentStrategy?: 'RANDOM' | 'RANDOM_NO_REPEAT' | 'SOURCE_TOKEN' | 'SEQUENTIAL';
  formAssignmentExhaustionPolicy?: 'BLOCK' | 'RESET' | 'LOOP';
  campaignStart?: string;
  campaignEnd?: string;
  campaignDuration?: number;
  maxApply?: number;
  allCanEvaluate?: boolean;
  markedOutOf?: number;
  isActive?: boolean;
  departmentsId?: number;
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
  pipelineTemplateId?: number;
  pipelineTemplateName?: string;
}

export interface CampaignAccessRecord {
  campaignId: number;
  userId: number;
  userFirstName?: string;
  userLastName?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  canUpdate: boolean;
  canDelete: boolean;
  canEvaluate: boolean;
  canPlanify: boolean;
  canAcceptPreScreen: boolean;
  canAcceptFinal: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  follow: boolean;
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
  specialityId?: number;
  isActive?: boolean;
  isDeleted?: boolean;

  // Intervalles de dates
  campaignStartDe?: string;
  campaignStartA?: string;
  campaignEndDe?: string;
  campaignEndA?: string;

  // Dates de création/modification
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;

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
  private readonly entityPermissionUrl = `${environment.apiUrl}/entityPermission`;
  private readonly managedCampaignPermissionKeys = ['ADMIN', 'CREATOR', 'UPDATE', 'DELETE', 'EVALUATE', 'CORRECT_TEST', 'PLANIFY', 'ADVANCE_PIPELINE', 'FOLLOW'];

  constructor(private http: HttpClient, private questionService: QuestionService) {
    if (!environment.production) console.log('🚀 Initialisation CampaignService');
    if (!environment.production) console.log('📡 URL de l\'API:', this.apiUrl);
  }

  /**
   * Récupère toutes les campagnes avec critères de recherche
   */
  getAllCampaignsByCriteria(criteria: CampaignSearchCriteria): Observable<PagedResponse<Campaign>> {
    if (!environment.production) console.log('📥 Récupération des campagnes avec critères:', criteria);

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

    if (!environment.production) console.log('🔍 Corps de la requête:', requestBody);

    return this.http.post<any>(`${this.apiUrl}/getAllByCriteria`, requestBody).pipe(
      map((response: any) => {
        if (!environment.production) console.log('🔍 Raw API Response (CAMPAIGNS):', response);
        if (!environment.production) console.log('🔍 Response keys:', Object.keys(response));
        if (!environment.production) console.log('🔍 Response.hasError:', response.hasError);
        if (!environment.production) console.log('🔍 Response.status:', response.status);
        if (!environment.production) console.log('🔍 Response.items exists:', !!response.items);
        if (!environment.production) console.log('🔍 Response.items length:', response.items?.length);
        if (!environment.production) console.log('🔍 Response.content exists:', !!response.content);
        if (!environment.production) console.log('🔍 Response.content length:', response.content?.length);
        if (!environment.production) console.log('✅ Réponse reçue:', response);

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

        if (!environment.production) console.log('🔄 Campagnes transformées:', campaigns);

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
    if (!environment.production) console.log('📥 Récupération de la campagne ID:', id);

    // Préparer le corps de la requête pour récupérer une campagne spécifique
    const requestBody = {
      user: "1",
      size: 1,
      index: 0,
      data: { id: id }
    };

    return this.http.post<any>(`${this.apiUrl}/getAllByCriteria`, requestBody).pipe(
      map(response => {
        if (!environment.production) console.log('✅ Campagne récupérée:', response);
        // L'API retourne {items: [...], count: number, ...}
        if (response.items && response.items.length > 0) {
          return this.transformCampaign(response.items[0]);
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
    if (!environment.production) console.log('📝 Création d\'une campagne:', campaign);

    const currentUserId = this.getCurrentUserId();
    const creatorId = Number(campaign.createdBy) || currentUserId;

    // Transformer les données pour correspondre au format backend
    const backendCampaign: any = {
      campaignTitle: campaign.campaignTitle,
      campaignDesc: campaign.campaignDesc,
      campaignStatus: campaign.campaignStatus,
      formAssignmentStrategy: campaign.formAssignmentStrategy,
      formAssignmentExhaustionPolicy: campaign.formAssignmentExhaustionPolicy,
      campaignStart: campaign.campaignStart,
      campaignEnd: campaign.campaignEnd,
      maxApply: campaign.maxApply,
      allCanEvaluate: campaign.allCanEvaluate,
      markedOutOf: campaign.markedOutOf,
      specialityId: campaign.specialityId, // Backend utilise specialityId
      pipelineTemplateId: campaign.pipelineTemplateId,
      createdBy: creatorId,
      creatorId // Backend requiert aussi creatorId
    };

    // Supprimer les valeurs undefined ou null
    Object.keys(backendCampaign).forEach(key => {
      if (backendCampaign[key] === undefined || backendCampaign[key] === null || backendCampaign[key] === '') {
        delete backendCampaign[key];
      }
    });

    const requestBody = {
      user: currentUserId,
      datas: [backendCampaign]
    };

    if (!environment.production) console.log('📤 Corps de la requête création campagne:', requestBody);

    return this.http.post<any>(`${this.apiUrl}/create`, requestBody).pipe(
      map(response => {
        if (!environment.production) console.log('✅ Réponse création campagne:', response);
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
    if (!environment.production) console.log('📝 Mise à jour de la campagne ID:', id, campaign);

    const backendCampaign = { ...campaign };

    const requestBody = {
      user: this.getCurrentUserId(),
      datas: [{ id, ...backendCampaign }]
    };

    return this.http.post<any>(`${this.apiUrl}/update`, requestBody).pipe(
      map(response => {
        if (!environment.production) console.log('✅ Campagne mise à jour:', response);
        if (response.items && response.items.length > 0) {
          return this.transformCampaign(response.items[0]);
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
    if (!environment.production) console.log('🗑️ Suppression de la campagne ID:', id);

    const requestBody = {
      user: this.getCurrentUserId(),
      datas: [{ id }]
    };

    return this.http.post<any>(`${this.apiUrl}/delete`, requestBody).pipe(
      map(response => {
        if (!environment.production) console.log('✅ Campagne supprimée:', response);
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
    if (!environment.production) console.log('♻️ Restauration de la campagne ID:', id);

    const requestBody = {
      user: this.getCurrentUserId(),
      datas: [{ id }]
    };

    return this.http.post<any>(`${this.apiUrl}/restore`, requestBody).pipe(
      map(response => {
        if (!environment.production) console.log('✅ Campagne restaurée:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la restauration de la campagne:', error);
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

    if (!environment.production) console.log('📥 Récupération des campagnes créées par l\'utilisateur:', currentUserId);

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
				isDeleted: criteria.isDeleted ?? false,
        searchString: criteria.search_string || ""
      }
    };

    return this.http.post<any>(`${this.apiUrl}/getByCriteria`, requestBody).pipe(
      map(response => {
        if (!environment.production) console.log('✅ Réponse getMyCampaigns:', response);
        
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
  getSharedCampaigns(criteria: CampaignSearchCriteria = {}): Observable<Campaign[]> {
    const currentUserData = localStorage.getItem('user');
    const currentUserId = currentUserData ? Number(JSON.parse(currentUserData).id) || 1 : 1;

    if (!environment.production) console.log('📥 Récupération des campagnes partagées pour l\'utilisateur:', currentUserId);

    return this.getCampaignAccessesByUser(currentUserId).pipe(
      switchMap((accesses) => {
        const sharedCampaignIds = new Set(
          accesses
            .filter(access => !access.isCreator)
            .map(access => access.campaignId)
        );

        if (sharedCampaignIds.size === 0) {
          return of([]);
        }

        return this.getAllCampaignsByCriteria({
          ...criteria,
          size: criteria.size || 1000,
          page: criteria.page || 0,
          isDeleted: criteria.isDeleted ?? false
        }).pipe(
          map(response => (response.content || []).filter(campaign => campaign.id && sharedCampaignIds.has(campaign.id)))
        );
      }),
      catchError(error => {
        console.error('❌ Erreur getSharedCampaigns:', error);
        return throwError(() => error);
      })
    );
  }

  private mapEntityPermissionsToCampaignAccess(permissions: any[]): CampaignAccessRecord[] {
    const accessMap = new Map<string, CampaignAccessRecord>();

    for (const permission of permissions || []) {
      if ((permission.entityType || '').toUpperCase() !== 'CAMPAIGN') {
        continue;
      }

      const campaignId = Number(permission.entityId);
      const userId = Number(permission.userId);
      if (!campaignId || !userId) {
        continue;
      }

      const mapKey = `${campaignId}_${userId}`;
      const entry = accessMap.get(mapKey) || {
        campaignId,
        userId,
        userFirstName: permission.userFirstName,
        userLastName: permission.userLastName,
        userName: permission.userName,
        userEmail: permission.userEmail,
        userRole: permission.userRole,
        canUpdate: false,
        canDelete: false,
        canEvaluate: false,
        canPlanify: false,
        canAcceptPreScreen: false,
        canAcceptFinal: false,
        isAdmin: false,
        isCreator: false,
        follow: false
      } as CampaignAccessRecord;

      const permissionKey = (permission.permissionKey || '').toUpperCase();
      switch (permissionKey) {
        case 'ADMIN':
          entry.isAdmin = true;
          entry.canUpdate = true;
          entry.canDelete = true;
          entry.canEvaluate = true;
          entry.canPlanify = true;
          entry.canAcceptPreScreen = true;
          entry.canAcceptFinal = true;
          entry.follow = true;
          break;
        case 'CREATOR':
          entry.isCreator = true;
          entry.canUpdate = true;
          entry.canDelete = true;
          entry.canEvaluate = true;
          entry.canPlanify = true;
          entry.canAcceptPreScreen = true;
          entry.canAcceptFinal = true;
          entry.follow = true;
          break;
        case 'UPDATE':
          entry.canUpdate = true;
          break;
        case 'DELETE':
          entry.canDelete = true;
          break;
        case 'EVALUATE':
          entry.canEvaluate = true;
          break;
        case 'PLANIFY':
          entry.canPlanify = true;
          break;
        case 'ADVANCE_PIPELINE':
          entry.canAcceptPreScreen = true;
          entry.canAcceptFinal = true;
          break;
        case 'FOLLOW':
          entry.follow = true;
          break;
      }

      accessMap.set(mapKey, entry);
    }

    return Array.from(accessMap.values());
  }

  private getEntityPermissionsForCampaign(campaignId: number): Observable<any[]> {
    return this.http.post<any>(`${this.entityPermissionUrl}/getForEntity`, {
      user: this.getCurrentUserId(),
      data: { entityType: 'CAMPAIGN', entityId: campaignId }
    }).pipe(
      map(response => response.items || [])
    );
  }

  private getEntityPermissionsForUser(userId: number): Observable<any[]> {
    return this.http.post<any>(`${this.entityPermissionUrl}/getForUser`, {
      user: this.getCurrentUserId(),
      data: { userId }
    }).pipe(
      map(response => response.items || [])
    );
  }

  private mapAccessToPermissionKeys(access: any): string[] {
    const permissionKeys = new Set<string>();
    const isAdmin = Boolean(access.isAdmin);
    const isCreator = Boolean(access.isCreator);

    if (isAdmin) permissionKeys.add('ADMIN');
    if (isCreator) permissionKeys.add('CREATOR');
    if (isAdmin || isCreator || access.canUpdate) permissionKeys.add('UPDATE');
    if (isAdmin || isCreator || access.canDelete) permissionKeys.add('DELETE');
    if (isAdmin || isCreator || access.canEvaluate) permissionKeys.add('EVALUATE');
    if (isAdmin || isCreator || access.canPlanify) permissionKeys.add('PLANIFY');
    if (isAdmin || isCreator || access.canAcceptPreScreen || access.canAcceptFinal) permissionKeys.add('ADVANCE_PIPELINE');
    if (access.follow !== false || isAdmin || isCreator) permissionKeys.add('FOLLOW');

    return Array.from(permissionKeys);
  }

  private getLegacyCampaignAccess(campaignId: number): Observable<any[]> {
    const requestBody = {
      user: this.getCurrentUserId(),
      size: 100,
      index: 0,
      data: { campaignId }
    };

    return this.http.post<any>(`${environment.apiUrl}/campaignCrud/getAllByCriteria`, requestBody).pipe(
      map(response => response.items || []),
      catchError(error => {
        console.error('❌ Erreur récupération accès recruteurs legacy:', error);
        return of([]);
      })
    );
  }

  private getLegacyCampaignAccessesByUser(userId: number): Observable<any[]> {
    const requestBody = {
      user: this.getCurrentUserId(),
      size: 1000,
      index: 0,
      data: { userId }
    };

    return this.http.post<any>(`${environment.apiUrl}/campaignCrud/getAllByCriteria`, requestBody).pipe(
      map(response => response.items || []),
      catchError(error => {
        console.error('❌ Erreur récupération accès campagnes legacy:', error);
        return of([]);
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
      formAssignmentStrategy: (campaign.formAssignmentStrategy || campaign.form_assignment_strategy || 'RANDOM').toUpperCase(),
      formAssignmentExhaustionPolicy: (campaign.formAssignmentExhaustionPolicy || campaign.form_assignment_exhaustion_policy || 'BLOCK').toUpperCase(),
      campaignStart: campaign.campaignStart || campaign.campaign_start || undefined,
      campaignEnd: campaign.campaignEnd || campaign.campaign_end || undefined,
      campaignDuration: campaign.campaignDuration || campaign.campaign_duration || undefined,
      maxApply: campaign.maxApply ?? campaign.max_apply ?? undefined,
      allCanEvaluate: campaign.allCanEvaluate ?? campaign.all_can_evaluate ?? false,
      isDeleted: campaign.isDeleted ?? campaign.is_deleted ?? false,
      markedOutOf: campaign.markedOutOf || campaign.marked_out_of || undefined,
      isActive: campaign.campaignStatus === 'ACTIVE' || campaign.campaign_status === 'ACTIVE',
      createdAt: campaign.createdAt || campaign.created_at || undefined,
      createdBy: campaign.createdBy || campaign.created_by || undefined,
      updatedAt: campaign.updatedAt || campaign.updated_at || undefined,
      departmentsId: campaign.departmentsId || campaign.departments_id || undefined,
      departmentName: campaign.departmentName || campaign.department_name || undefined,
      specialityId: campaign.specialityId || campaign.speciality_id || undefined,
      specialityLibelle: campaign.specialityLibelle || campaign.speciality_libelle || undefined,
      specialityName: campaign.specialityLibelle || campaign.speciality_libelle || undefined,
      creatorName: campaign.creatorName || campaign.creator_name || 
                    (campaign.userFirstName && campaign.userLastName 
                      ? `${campaign.userFirstName} ${campaign.userLastName}` 
                      : undefined),
      applicationsCount: campaign.applicationsCount || campaign.applications_count || undefined,
      questionsCount: campaign.questionsCount || campaign.questions_count || undefined,
      pipelineTemplateId: campaign.pipelineTemplateId || campaign.pipeline_template_id || undefined,
      pipelineTemplateName: campaign.pipelineTemplateName || campaign.pipeline_template_name || undefined
    };
  }

  /**
   * Synchronise les accès recruteurs d'une campagne via entity_permission.
   */
  saveCampaignAccess(accessDataArray: any[]): Observable<any> {
    if (!environment.production) console.log('💾 Sauvegarde des accès recruteurs:', accessDataArray);

    if (!accessDataArray || accessDataArray.length === 0) {
      return of([]);
    }

    const campaignId = Number(accessDataArray[0].campaignId);
    if (!campaignId) {
      return of([]);
    }

    return this.getEntityPermissionsForCampaign(campaignId).pipe(
      switchMap((currentPermissions) => {
        const currentKeys = new Set(
          (currentPermissions || [])
            .filter(permission => this.managedCampaignPermissionKeys.includes((permission.permissionKey || '').toUpperCase()))
            .map(permission => `${permission.userId}:${(permission.permissionKey || '').toUpperCase()}`)
        );

        const desiredKeys = new Set<string>();
        for (const access of accessDataArray) {
          const userId = Number(access.userId);
          if (!userId) {
            continue;
          }

          for (const permissionKey of this.mapAccessToPermissionKeys(access)) {
            desiredKeys.add(`${userId}:${permissionKey}`);
          }
        }

        const operations: Observable<any>[] = [];
        desiredKeys.forEach((entry) => {
          if (currentKeys.has(entry)) {
            return;
          }

          const [userId, permissionKey] = entry.split(':');
          operations.push(
            this.http.post(`${this.entityPermissionUrl}/grant`, {
              user: this.getCurrentUserId(),
              data: {
                userId: Number(userId),
                entityType: 'CAMPAIGN',
                entityId: campaignId,
                permissionKey
              }
            })
          );
        });

        currentKeys.forEach((entry) => {
          if (desiredKeys.has(entry)) {
            return;
          }

          const [userId, permissionKey] = entry.split(':');
          operations.push(
            this.http.post(`${this.entityPermissionUrl}/revoke`, {
              user: this.getCurrentUserId(),
              data: {
                userId: Number(userId),
                entityType: 'CAMPAIGN',
                entityId: campaignId,
                permissionKey
              }
            })
          );
        });

        return operations.length > 0 ? forkJoin(operations) : of([]);
      }),
      catchError(error => {
        console.error('❌ Erreur sauvegarde accès recruteurs:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les accès recruteurs pour une campagne.
   */
  getCampaignAccess(campaignId: number): Observable<any[]> {
    if (!environment.production) console.log('📥 Récupération des accès recruteurs pour la campagne:', campaignId);

    return this.getEntityPermissionsForCampaign(campaignId).pipe(
      map(permissions => this.mapEntityPermissionsToCampaignAccess(permissions)),
      switchMap(accesses => accesses.length > 0 ? of(accesses) : this.getLegacyCampaignAccess(campaignId)),
      catchError(() => this.getLegacyCampaignAccess(campaignId))
    );
  }

  /**
   * Crée une notification pour un utilisateur
   */
  createNotification(notificationData: any): Observable<any> {
    if (!environment.production) console.log('📬 Création notification:', notificationData);

    const requestBody = {
      user: this.getCurrentUserId(),
      datas: [notificationData]
    };

    if (!environment.production) console.log('📤 Corps de la requête notification:', requestBody);

    return this.http.post<any>(`${environment.apiUrl}/notifications/create`, requestBody).pipe(
      map(response => {
        if (!environment.production) console.log('✅ Notification créée:', response);
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
   * Ajoute des réponses à une question (met à jour le questionId des réponses)
   */
  addAnswersToQuestion(questionId: number, answerIds: number[]): Observable<any> {
    if (!environment.production) console.log('Ajout de réponses à la question:', { questionId, answerIds });

    // Mettre à jour chaque réponse avec le questionId
    const answers = answerIds.map(answerId => ({
      id: answerId,
      questionId: questionId
    }));

    const requestBody = {
      user: this.getCurrentUserId(),
      datas: answers
    };

    return this.http.post<any>(`${environment.apiUrl}/answers/update`, requestBody).pipe(
      map(response => {
        if (!environment.production) console.log('Réponses ajoutées à la question:', response);
        return response;
      }),
      catchError(error => {
        console.error('Erreur ajout réponses à la question:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère tous les accès aux campagnes pour un utilisateur
   */
  getCampaignAccessesByUser(userId: number): Observable<any[]> {
    if (!environment.production) console.log('🔍 Récupération des accès campagnes pour user:', userId);

    return this.getEntityPermissionsForUser(userId).pipe(
      map(permissions => this.mapEntityPermissionsToCampaignAccess(permissions)),
      switchMap(accesses => accesses.length > 0 ? of(accesses) : this.getLegacyCampaignAccessesByUser(userId)),
      catchError(() => this.getLegacyCampaignAccessesByUser(userId))
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
    if (!environment.production) console.log('🔐 Vérification des permissions pour la campagne:', campaignId);

    // Récupérer l'ID de l'utilisateur connecté depuis le localStorage
    const currentUserData = localStorage.getItem('user');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id : 1;
    
    if (!environment.production) console.log('👤 Utilisateur connecté ID:', currentUserId);

    // Ajouter le header user-id avec l'ID de l'utilisateur connecté
    const headers = new HttpHeaders({
      'user-id': currentUserId.toString()
    });

    const requestBody = {
      user: currentUserId,
      data: { id: campaignId }
    };

    return this.http.post<any>(`${this.apiUrl}/checkEditPermission`, requestBody, { headers }).pipe(
      map(response => {
        if (!environment.production) console.log('✅ Réponse permissions:', response);
        
        if (response.items && response.items.length > 0) {
          const item = response.items[0];
          if (!environment.production) console.log('🔍 Item reçu:', item);
          if (!environment.production) console.log('📝 campaignTitle (status):', item.campaignTitle);
          if (!environment.production) console.log('📝 campaignDesc (userRole):', item.campaignDesc);
          
          const status = item.campaignTitle; // Le backend utilise campaignTitle pour retourner le status
          const userRole = item.campaignDesc; // Le backend utilise campaignDesc pour retourner le role
          
          if (!environment.production) console.log('✨ Status final:', status, '| Role:', userRole);
          
          return {
            status: status as 'CAN_EDIT' | 'REQUIRES_ADMIN_MODE' | 'NO_PERMISSION',
            userRole: userRole
          };
        }
        
        if (!environment.production) console.log('⚠️ Pas d\'items dans la réponse');
        return { status: 'NO_PERMISSION' as const };
      }),
      catchError(error => {
        console.error('❌ Erreur vérification permissions:', error);
        return of({ status: 'NO_PERMISSION' as const });
      })
    );
  }

  private getCurrentUserId(): number {
    try {
      const user = localStorage.getItem('user');
      return user ? Number(JSON.parse(user).id) || 0 : 0;
    } catch {
      return 0;
    }
  }
}

