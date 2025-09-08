import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
