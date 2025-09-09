import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interface pour les données d'un utilisateur
 */
export interface User {
  id: number;
  nom: string;
  prenom: string;
  pseudo: string;
  email: string;
  telephone?: string;
  role: string;
  isOnline: boolean;
  dateCreation?: string;
  derniereConnexion?: string;
}

/**
 * Interface pour les critères de recherche
 */
export interface UserSearchCriteria {
  nom?: string;
  prenom?: string;
  pseudo?: string;
  email?: string;
  role?: string;
  isOnline?: boolean;
  page?: number;
  size?: number;
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

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les utilisateurs selon des critères
   * @param criteria critères de recherche optionnels
   * @returns Observable de la liste paginée d'utilisateurs
   */
  getByCriteria(criteria: UserSearchCriteria = {}): Observable<PagedResponse<User>> {
    const request = {
      data: {
        ...criteria
      },
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: true
    };

    return this.http.post<PagedResponse<User>>(`${this.apiUrl}/getByCriteria`, request);
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
   * @returns Observable de l'utilisateur créé
   */
  create(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}`, user);
  }

  /**
   * Met à jour un utilisateur existant
   * @param id l'identifiant de l'utilisateur
   * @param user les nouvelles données de l'utilisateur
   * @returns Observable de l'utilisateur mis à jour
   */
  update(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  /**
   * Supprime un utilisateur
   * @param id l'identifiant de l'utilisateur à supprimer
   * @returns Observable de la confirmation de suppression
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
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
}
