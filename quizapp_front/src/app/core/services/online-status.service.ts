import { Injectable, OnDestroy, HostListener } from '@angular/core';
import { UserService } from './user.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Service pour gérer automatiquement le statut en ligne des utilisateurs
 * Détecte les événements de connexion/déconnexion et met à jour le statut en conséquence
 */
@Injectable({
  providedIn: 'root'
})
export class OnlineStatusService implements OnDestroy {
  private currentUserId: number | null = null;
  private heartbeatInterval: any;
  private subscriptions: Subscription[] = [];

  constructor(private userService: UserService) {
    this.setupEventListeners();
  }

  /**
   * Initialise le suivi du statut en ligne pour un utilisateur
   * @param userId l'identifiant de l'utilisateur connecté
   */
  startOnlineTracking(userId: number): void {
    console.log('Démarrage du suivi du statut en ligne pour l\'utilisateur:', userId);
    
    this.currentUserId = userId;
    
    // Marquer l'utilisateur comme en ligne
    this.userService.setUserOnline(userId).subscribe({
      next: () => console.log('Utilisateur marqué comme en ligne'),
      error: (error) => console.error('Erreur lors de la mise à jour du statut en ligne:', error)
    });

    // Démarrer le heartbeat pour maintenir le statut en ligne
    this.startHeartbeat();
  }

  /**
   * Arrête le suivi du statut en ligne pour l'utilisateur actuel
   */
  stopOnlineTracking(): void {
    if (this.currentUserId) {
      console.log('Arrêt du suivi du statut en ligne pour l\'utilisateur:', this.currentUserId);
      
      // Marquer l'utilisateur comme hors ligne
      this.userService.setUserOffline(this.currentUserId).subscribe({
        next: () => console.log('Utilisateur marqué comme hors ligne'),
        error: (error) => console.error('Erreur lors de la mise à jour du statut hors ligne:', error)
      });

      this.stopHeartbeat();
      this.currentUserId = null;
    }
  }

  /**
   * Force une mise à jour immédiate du statut en ligne
   */
  forceOnlineUpdate(): void {
    if (this.currentUserId) {
      console.log('⚡ Force mise à jour statut en ligne');
      this.userService.setUserOnline(this.currentUserId).subscribe({
        next: () => console.log('✅ Statut en ligne forcé'),
        error: (error) => console.error('❌ Erreur force statut en ligne:', error)
      });
    }
  }

  /**
   * Vérifie si un utilisateur est actuellement suivi
   */
  isTracking(): boolean {
    return this.currentUserId !== null;
  }

  /**
   * Récupère l'ID de l'utilisateur actuellement suivi
   */
  getCurrentUserId(): number | null {
    return this.currentUserId;
  }

  /**
   * Configure les écouteurs d'événements pour détecter la fermeture du navigateur
   */
  private setupEventListeners(): void {
    // Détecter la fermeture du navigateur/onglet
    window.addEventListener('beforeunload', (event) => {
      if (this.currentUserId) {
        console.log('🚪 Détection fermeture navigateur - marquage hors ligne');
        // Envoi synchrone pour s'assurer que la requête est envoyée avant la fermeture
        navigator.sendBeacon(
          `${environment.apiUrl}/user/${this.currentUserId}/online-status?isOnline=false`,
          ''
        );
      }
    });

    // Détecter la fermeture brutale de la page
    window.addEventListener('unload', () => {
      if (this.currentUserId) {
        console.log('🚪 Détection déchargement page - marquage hors ligne');
        navigator.sendBeacon(
          `${environment.apiUrl}/user/${this.currentUserId}/online-status?isOnline=false`,
          ''
        );
      }
    });

    // Détecter la perte de focus de la page (optionnel mais utile)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.currentUserId) {
        console.log('📱 Page cachée - utilisateur potentiellement inactif');
        // Marquer comme hors ligne après un délai si la page reste cachée
        setTimeout(() => {
          if (document.hidden && this.currentUserId) {
            this.userService.setUserOffline(this.currentUserId).subscribe({
              next: () => console.log('Utilisateur marqué hors ligne (page cachée)'),
              error: (error) => console.error('Erreur marquage hors ligne:', error)
            });
          }
        }, 5 * 60 * 1000); // 5 minutes d'inactivité
      } else if (!document.hidden && this.currentUserId) {
        console.log('📱 Page visible - utilisateur actif');
        // Marquer comme en ligne quand l'onglet redevient visible
        this.userService.setUserOnline(this.currentUserId).subscribe({
          next: () => console.log('Utilisateur marqué en ligne (page visible)'),
          error: (error) => console.error('Erreur marquage en ligne:', error)
        });
      }
    });
  }

  /**
   * Démarre un heartbeat pour maintenir le statut en ligne
   * Envoie une requête périodique pour indiquer que l'utilisateur est toujours actif
   */
  private startHeartbeat(): void {
    // Envoyer un heartbeat toutes les 30 secondes (plus réactif)
    this.heartbeatInterval = setInterval(() => {
      if (this.currentUserId) {
        console.log('Envoi du heartbeat pour maintenir le statut en ligne');
        this.userService.setUserOnline(this.currentUserId).subscribe({
          error: (error) => console.error('Erreur lors du heartbeat:', error)
        });
      }
    }, 30 * 1000); // 30 secondes au lieu de 5 minutes
  }

  /**
   * Arrête le heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  ngOnDestroy(): void {
    this.stopOnlineTracking();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
