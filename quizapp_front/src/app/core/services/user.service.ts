import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Interface pour les données d'un utilisateur
 */
export interface User {
  id: number;
  nom?: string;           // Backend utilise lastName
  prenom?: string;        // Backend utilise firstName  
  pseudo?: string;        // Backend utilise username
  email: string;
  telephone?: string;     // Backend utilise phone
  role: string;           // Backend utilise userRole
  isOnline: boolean;
  isDeleted?: boolean;    // Indicateur si l'utilisateur est supprimé
  dateCreation?: string;  // Backend utilise createdAt
  derniereConnexion?: string;
  
  // Champs du backend pour mapping
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  userRole?: string;
  createdAt?: string;
}

/**
 * Interface pour les critères de recherche
 */
export interface UserSearchCriteria {
  // Frontend field names
  idDe?: string;
  idA?: string;
  nom?: string;
  prenom?: string;
  pseudo?: string;
  email?: string;
  telephone?: string;
  role?: string;
  isOnline?: boolean;
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
  firstName?: string;
  lastName?: string;
  username?: string;
  userRole?: string;
  phone?: string;
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
 * Service pour gérer les utilisateurs et leur statut en ligne
 * Permet de suivre et mettre à jour le statut de connexion des utilisateurs
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(
    private http: HttpClient
  ) {}

  /**
   * Récupère tous les utilisateurs selon des critères
   * @param criteria critères de recherche optionnels
   * @returns Observable de la liste paginée d'utilisateurs
   */
  getByCriteria(criteria: UserSearchCriteria = {}): Observable<PagedResponse<User>> {
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
      // Données de critères avec tous les champs UserDto
      data: {
        id: criteria.idDe || "",  // On utilise idDe comme critère principal pour l'ID
        firstName: criteria.prenom || "",
        lastName: criteria.nom || "",
        username: criteria.pseudo || "",
        email: criteria.email || "",
        phone: criteria.telephone || "",
        password: "",
        isDefaultPassword: "",
        userRole: criteria.role || "",
        isOnline: criteria.isOnline !== undefined ? criteria.isOnline.toString() : "",
        isLocked: "",
        lastConnectionDate: "",
        createdAt: "",
        createdBy: "",
        updatedAt: "",
        updatedBy: "",
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : "",
        searchString: criteria.search_string || "",
        
        // Critères de dates et intervalles
        createdAtStart: criteria.dateCreationDe || "",
        createdAtEnd: criteria.dateCreationA || "",
        updatedAtStart: criteria.dateModificationDe || "",
        updatedAtEnd: criteria.dateModificationA || "",
        
        // Intervalles d'ID (champs supplémentaires pour le backend)
        idStart: criteria.idDe || "",
        idEnd: criteria.idA || ""
      }
    };

    console.log('🚀 Envoi de la requête getUsersByCriteria:', request);
    console.log('🔍 DÉTAIL de la requête (getByCriteria):');
    console.log('  - user (ID connecté):', currentUserId);
    console.log('  - size (taille page):', criteria.size);
    console.log('  - index (page):', criteria.page);
    console.log('  - data complet:', request.data);

    return this.http.post<any>(`${this.apiUrl}/getByCriteria`, request).pipe(
      map(response => {
        console.log('🔍 Raw API Response:', response);
        console.log('🔍 Response keys (getByCriteria):', Object.keys(response));
        console.log('🔍 Response.count (getByCriteria):', response.count);
        console.log('🔍 Response.totalCount (getByCriteria):', response.totalCount); // ← Nouveau champ !
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
        const rawUsers = response.items || (response.item ? [response.item] : []);
        
        // Transformer la réponse du backend vers le format frontend
        const transformedUsers: User[] = rawUsers.map((user: any) => ({
          id: user.id,
          nom: user.nom || user.lastName || '',
          prenom: user.prenom || user.firstName || '',
          pseudo: user.pseudo || user.username || '',
          email: user.email || '',
          telephone: user.telephone || user.phone || '',
          role: user.role || user.userRole || 'recruiter',
          isOnline: user.isOnline || false,
          dateCreation: user.dateCreation || user.createdAt,
          derniereConnexion: user.derniereConnexion || user.updatedAt
        }));
        
        return {
          content: transformedUsers,
          totalElements: response.totalCount || response.count || rawUsers.length, // Utiliser totalCount en priorité
          totalPages: Math.ceil((response.totalCount || response.count || rawUsers.length) / (criteria.size || 10)),
          size: criteria.size || 10,
          number: criteria.page || 0
        };
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
        console.error('❌ Détails de l\'erreur:', error.error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère TOUS les utilisateurs selon des critères (y compris les supprimés)
   * @param criteria critères de recherche optionnels
   * @returns Observable de la liste paginée d'utilisateurs incluant les supprimés
   */
  getAllUsersByCriteria(criteria: UserSearchCriteria = {}): Observable<PagedResponse<User>> {
    // Récupérer l'ID de l'utilisateur connecté depuis localStorage pour éviter la dépendance circulaire
    const currentUserData = localStorage.getItem('currentUser');
    const currentUserId = currentUserData ? JSON.parse(currentUserData).id?.toString() || "1" : "1";
    
    // Construction de la requête selon le format backend attendu
    const request = {
      // ID de l'utilisateur connecté (requis)
      user: currentUserId,
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      // Données de critères avec tous les champs UserDto
      data: {
        id: criteria.idDe || "",  // On utilise idDe comme critère principal pour l'ID
        firstName: criteria.prenom || "",
        lastName: criteria.nom || "",
        username: criteria.pseudo || "",
        email: criteria.email || "",
        phone: criteria.telephone || "",
        password: "",
        isDefaultPassword: "",
        userRole: criteria.role || "",
        isOnline: criteria.isOnline !== undefined ? criteria.isOnline.toString() : "",
        isLocked: "",
        lastConnectionDate: "",
        createdAt: "",
        createdBy: "",
        updatedAt: "",
        updatedBy: "",
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : "",
        searchString: criteria.search_string || "",
        
        // Critères de dates et intervalles
        createdAtStart: criteria.dateCreationDe || "",
        createdAtEnd: criteria.dateCreationA || "",
        updatedAtStart: criteria.dateModificationDe || "",
        updatedAtEnd: criteria.dateModificationA || "",
        
        // Intervalles d'ID (champs supplémentaires pour le backend)
        idStart: criteria.idDe || "",
        idEnd: criteria.idA || ""
      }
    };

    console.log('🚀 Envoi de la requête getAllUsersByCriteria (including deleted):', request);
    console.log('🔍 DÉTAIL de la requête:');
    console.log('  - user (ID connecté):', request.user);
    console.log('  - size (taille page):', request.size);
    console.log('  - index (page):', request.index);
    console.log('  - data.isDeleted:', request.data.isDeleted);
    console.log('  - data complet:', request.data);

    return this.http.post<any>(`${this.apiUrl}/getAllByCriteria`, request).pipe(
      map(response => {
        console.log('🔍 Raw API Response (ALL USERS):', response);
        console.log('🔍 Response keys:', Object.keys(response));
        console.log('🔍 Response.count:', response.count);
        console.log('🔍 Response.totalCount:', response.totalCount); // ← Nouveau champ !
        console.log('🔍 Response.totalElements:', response.totalElements);
        console.log('🔍 Response.total:', response.total);
        console.log('🔍 Response.items.length:', response.items?.length);
        
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
        const rawUsers = response.items || (response.item ? [response.item] : []);
        
        // Transformer la réponse du backend vers le format frontend
        const transformedUsers: User[] = rawUsers.map((user: any) => ({
          id: user.id,
          nom: user.nom || user.lastName || '',
          prenom: user.prenom || user.firstName || '',
          pseudo: user.pseudo || user.username || '',
          email: user.email || '',
          telephone: user.telephone || user.phone || '',
          role: user.role || user.userRole || 'recruiter',
          isOnline: user.isOnline || false,
          isDeleted: user.isDeleted || false, // ← Important : inclure le statut de suppression
          dateCreation: user.dateCreation || user.createdAt,
          derniereConnexion: user.derniereConnexion || user.updatedAt
        }));
        
        console.log('📊 Utilisateurs transformés (including deleted):', transformedUsers);
        
        return {
          content: transformedUsers,
          totalElements: response.totalCount || response.count || rawUsers.length, // Utiliser totalCount en priorité
          totalPages: Math.ceil((response.totalCount || response.count || rawUsers.length) / (criteria.size || 10)),
          size: criteria.size || 10,
          number: criteria.page || 0
        };
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération de TOUS les utilisateurs:', error);
        console.error('❌ Détails de l\'erreur:', error.error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère un utilisateur par son ID
   * @param id l'identifiant de l'utilisateur
   * @returns Observable de l'utilisateur
   */
  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un nouvel utilisateur
   * @param user les données de l'utilisateur à créer
   * @param currentUserId l'ID de l'utilisateur connecté qui crée le nouvel utilisateur
   * @returns Observable de l'utilisateur créé
   */
  create(user: Partial<User>, currentUserId?: number): Observable<User> {
    // Mapper les champs frontend vers backend
    const backendUser = {
      firstName: user.prenom,
      lastName: user.nom,
      username: user.pseudo,
      email: user.email,
      phone: user.telephone,
      userRole: user.role,
      password: 'temp123!' // Mot de passe temporaire
    };

    const request = {
      data: null,
      datas: [backendUser], // Le backend attend 'datas' (pluriel) avec un tableau
      size: null,
      index: null,
      lang: 'fr',
      sessionUser: null,
      businessLineCode: null,
      caseEngine: null,
      isAnd: true,
      user: currentUserId || null, // ID de l'utilisateur connecté
      isSimpleLoading: false
    };

    return this.http.post<any>(`${this.apiUrl}/create`, request).pipe(
      map(response => response.items?.[0] || response)
    );
  }

  /**
   * Met à jour un utilisateur existant
   * @param id l'identifiant de l'utilisateur
   * @param user les nouvelles données de l'utilisateur
   * @returns Observable de l'utilisateur mis à jour
   */
  update(id: number, user: Partial<User>): Observable<User> {
    // Récupération de l'ID utilisateur depuis localStorage ou valeur par défaut
    const currentUserId = localStorage.getItem('user')?.includes('id') ? 
      JSON.parse(localStorage.getItem('user')!)?.id?.toString() : '1';
      
    // Mapper les champs frontend vers backend
    const backendUser = {
      id: id,
      firstName: user.prenom,
      lastName: user.nom,
      username: user.pseudo,
      email: user.email,
      phone: user.telephone,
      userRole: user.role,
      isDeleted: user.isDeleted !== undefined ? user.isDeleted : undefined
    };

    // Retirer les champs undefined pour éviter d'envoyer null
    Object.keys(backendUser).forEach(key => {
      if (backendUser[key as keyof typeof backendUser] === undefined) {
        delete backendUser[key as keyof typeof backendUser];
      }
    });

    const request = {
      datas: [backendUser],  // Array avec l'objet utilisateur à mettre à jour
      user: currentUserId    // ID utilisateur connecté
    };

    console.log('🔧 Update request payload:', request);
    console.log('🔧 Update request datas:', request.datas);
    console.log('🔧 Update request user:', request.user);

    return this.http.post<any>(`${this.apiUrl}/update`, request).pipe(
      map(response => response.items?.[0] || response)
    );
  }

  /**
   * Supprime un utilisateur
   * @param id l'identifiant de l'utilisateur à supprimer
   * @returns Observable de la confirmation de suppression
   */
  delete(id: number): Observable<any> {
    // Récupération de l'ID utilisateur depuis localStorage ou valeur par défaut
    const currentUserId = localStorage.getItem('user')?.includes('id') ? 
      JSON.parse(localStorage.getItem('user')!)?.id?.toString() : '1';
      
    const request = {
      datas: [{ id: id }],  // Array avec l'objet contenant l'ID
      user: currentUserId   // ID utilisateur connecté
    };

    return this.http.post<any>(`${this.apiUrl}/delete`, request);
  }

  /**
   * Met à jour le statut en ligne d'un utilisateur
   * Utilise l'API backend pour marquer un utilisateur comme connecté ou déconnecté
   * 
   * @param userId l'identifiant de l'utilisateur
   * @param isOnline true si l'utilisateur est en ligne, false sinon
   * @returns Observable de la réponse de l'API
   */
  updateOnlineStatus(userId: number, isOnline: boolean): Observable<any> {
    console.log(`Mise à jour du statut utilisateur ${userId}: ${isOnline ? 'en ligne' : 'hors ligne'}`);
    return this.http.put(`${this.apiUrl}/${userId}/online-status?isOnline=${isOnline}`, {});
  }

  /**
   * Marque un utilisateur comme connecté
   * @param userId l'identifiant de l'utilisateur
   */
  setUserOnline(userId: number): Observable<any> {
    return this.updateOnlineStatus(userId, true);
  }

  /**
   * Marque un utilisateur comme déconnecté
   * @param userId l'identifiant de l'utilisateur
   */
  setUserOffline(userId: number): Observable<any> {
    return this.updateOnlineStatus(userId, false);
  }

  /**
   * Restaure un utilisateur supprimé (remet isDeleted à false)
   * @param userId l'identifiant de l'utilisateur à restaurer
   * @returns Observable de l'utilisateur restauré
   */
  restore(userId: number): Observable<User> {
    // Construction des données au format attendu par updateAll (plus simple)
    const userData = {
      id: userId,
      isDeleted: false
    };
    
    return this.updateAll([userData]).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Met à jour tous les utilisateurs (y compris supprimés) - utilise l'API updateAll
   * @param usersData - Tableau des données utilisateurs à mettre à jour
   * @returns Observable de la réponse
   */
  updateAll(usersData: any[]): Observable<any> {
    // Récupération de l'ID utilisateur depuis localStorage ou valeur par défaut
    const currentUserId = localStorage.getItem('user')?.includes('id') ? 
      JSON.parse(localStorage.getItem('user')!)?.id?.toString() : '1';
      
    const payload = {
      data: null, // Pas de data unique pour updateAll
      datas: usersData, // Tableau des utilisateurs à mettre à jour
      size: null,
      index: null,
      lang: 'fr',
      sessionUser: null,
      businessLineCode: null,
      caseEngine: null,
      isAnd: true,
      user: currentUserId,
      isSimpleLoading: false
    };
    
    console.log('🔧 UpdateAll payload:', payload);
    
    return this.http.post(`${this.apiUrl}/updateAll`, payload).pipe(
      map(response => {
        console.log('✅ UpdateAll response:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ UpdateAll error:', error);
        return throwError(() => error);
      })
    );
  }
}
