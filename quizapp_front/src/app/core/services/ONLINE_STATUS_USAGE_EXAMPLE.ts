/**
 * EXEMPLE D'UTILISATION DES SERVICES DE GESTION DU STATUT EN LIGNE
 * 
 * Ce fichier montre comment utiliser les services UserService et OnlineStatusService
 * dans vos composants Angular pour gérer le statut en ligne des utilisateurs.
 */

/*
// Dans un composant de connexion (login.component.ts)
import { Component } from '@angular/core';
import { AuthService, OnlineStatusService } from './index';

@Component({
  selector: 'app-login',
  template: `
    <!-- Votre template de connexion -->
  `
})
export class LoginComponent {
  
  constructor(
    private authService: AuthService,
    private onlineStatusService: OnlineStatusService
  ) {}

  // Méthode appelée lors de la connexion d'un utilisateur
  onLoginSuccess(user: any): void {
    // L'AuthService gère automatiquement le démarrage du suivi du statut en ligne
    // via OnlineStatusService.startOnlineTracking()
    console.log('Utilisateur connecté - suivi du statut en ligne démarré automatiquement');
  }

  // Méthode appelée lors de la déconnexion d'un utilisateur
  onLogout(): void {
    // L'AuthService gère automatiquement l'arrêt du suivi du statut en ligne
    // via OnlineStatusService.stopOnlineTracking()
    this.authService.logout();
    console.log('Utilisateur déconnecté - suivi du statut en ligne arrêté automatiquement');
  }
}

// Dans un composant d'administration pour voir les utilisateurs en ligne
import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-admin-users',
  template: `
    <div>
      <h2>Gestion des utilisateurs</h2>
      <button (click)="setUserOnline(123)">Marquer utilisateur 123 comme en ligne</button>
      <button (click)="setUserOffline(123)">Marquer utilisateur 123 comme hors ligne</button>
    </div>
  `
})
export class AdminUsersComponent {
  
  constructor(private userService: UserService) {}

  // Marque manuellement un utilisateur comme en ligne
  setUserOnline(userId: number): void {
    this.userService.setUserOnline(userId).subscribe({
      next: (response: any) => {
        console.log('Utilisateur marqué comme en ligne:', response);
      },
      error: (error: any) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
      }
    });
  }

  // Marque manuellement un utilisateur comme hors ligne
  setUserOffline(userId: number): void {
    this.userService.setUserOffline(userId).subscribe({
      next: (response: any) => {
        console.log('Utilisateur marqué comme hors ligne:', response);
      },
      error: (error: any) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
      }
    });
  }
}
*/

/**
 * FONCTIONNALITÉS AUTOMATIQUES IMPLÉMENTÉES :
 * 
 * 1. Connexion automatique :
 *    - Quand un utilisateur se connecte, il est automatiquement marqué comme "en ligne"
 *    - Un heartbeat est démarré pour maintenir le statut (toutes les 5 minutes)
 * 
 * 2. Déconnexion automatique :
 *    - Quand un utilisateur se déconnecte, il est automatiquement marqué comme "hors ligne"
 *    - Le heartbeat est arrêté
 * 
 * 3. Fermeture du navigateur :
 *    - Si l'utilisateur ferme son navigateur/onglet, il est automatiquement marqué comme "hors ligne"
 *    - Utilise navigator.sendBeacon pour garantir l'envoi de la requête
 * 
 * 4. Restauration de session :
 *    - Si l'utilisateur recharge la page et qu'il a une session active, 
 *      le suivi du statut en ligne redémarre automatiquement
 * 
 * UTILISATION DANS VOS COMPOSANTS :
 * 
 * 1. Importez les services nécessaires
 * 2. Injectez-les dans le constructeur
 * 3. L'AuthService gère automatiquement le cycle de vie du statut en ligne
 * 4. Utilisez UserService uniquement si vous devez gérer manuellement le statut d'autres utilisateurs
 */
