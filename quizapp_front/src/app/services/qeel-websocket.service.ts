import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { OnlineStats } from '../core/services/online-stats.service';

/**
 * Service WebSocket pour les statistiques QEEL en temps réel
 */
@Injectable({
  providedIn: 'root'
})
export class QeelWebSocketService {
  private socket: WebSocket | null = null;
  private onlineStatsSubject = new BehaviorSubject<OnlineStats | null>(null);

  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 secondes

  constructor(private http: HttpClient) {
    // Démarrer la connexion WebSocket après un court délai
    setTimeout(() => {
      this.connect();
    }, 100);
    
    // Charger les données initiales après un délai plus long
    setTimeout(() => {
      this.loadInitialDataDirectly();
    }, 500);
  }

  /**
   * Observable des statistiques en temps réel
   */
  getOnlineStats(): Observable<OnlineStats | null> {
    return this.onlineStatsSubject.asObservable();
  }

  /**
   * Chargement direct des données initiales
   */
  private loadInitialDataDirectly(): void {
    console.log('🔄 [QEEL] Chargement direct des données...');
    
    fetch('http://localhost:8085/user/online-stats', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then((stats: OnlineStats) => {
      console.log('✅ [QEEL] Données initiales chargées:', stats);
      this.onlineStatsSubject.next(stats);
    })
    .catch(error => {
      console.error('❌ [QEEL] Erreur chargement initial:', error);
    });
  }

  /**
   * Méthode publique pour charger les données initiales
   * À appeler depuis le composant
   */
  public async loadInitialData(): Promise<void> {
    const apiUrl = 'http://localhost:8085/user/online-stats';
    
    console.log('🔄 [QEEL] Début chargement initial via fetch...');
    console.log('🔄 [QEEL] URL:', apiUrl);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const stats: OnlineStats = await response.json();
      console.log('✅ [QEEL] Données chargées via fetch:', stats);
      this.onlineStatsSubject.next(stats);
      
    } catch (error) {
      console.error('❌ [QEEL] Erreur fetch:', error);
      
      // Fallback: essayer avec HttpClient
      console.log('🔄 [QEEL] Tentative avec HttpClient...');
      this.loadWithHttpClient();
    }
  }

  /**
   * Fallback avec HttpClient
   */
  private loadWithHttpClient(): void {
    const apiUrl = 'http://localhost:8085/user/online-stats';
    
    this.http.get<OnlineStats>(apiUrl).subscribe({
      next: (stats) => {
        console.log('✅ [QEEL] Données chargées avec HttpClient:', stats);
        this.onlineStatsSubject.next(stats);
      },
      error: (error) => {
        console.error('❌ [QEEL] Échec total, attente WebSocket...', error);
      }
    });
  }

  /**
   * Établit la connexion WebSocket
   */
  private connect(): void {
    // Essayer d'abord la connexion WebSocket native
    const wsUrl = 'ws://localhost:8085/ws/qeel';
    
    try {
      console.log('🔌 Tentative de connexion WebSocket QEEL à:', wsUrl);
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('🔌 Connexion WebSocket QEEL établie');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const stats: OnlineStats = JSON.parse(event.data);
          console.log('📊 Nouvelles statistiques QEEL reçues via WebSocket:', stats);
          this.onlineStatsSubject.next(stats);
        } catch (error) {
          console.error('❌ Erreur parsing message WebSocket QEEL:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('🔌 Connexion WebSocket QEEL fermée:', event.code, event.reason);
        this.isConnected = false;
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('❌ Erreur WebSocket QEEL:', error);
        this.isConnected = false;
      };

    } catch (error) {
      console.error('❌ Erreur création WebSocket QEEL:', error);
      this.handleReconnect();
    }
  }

  /**
   * Gère la reconnexion automatique
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Tentative de reconnexion QEEL ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${this.reconnectInterval / 1000}s`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('❌ Nombre maximum de tentatives de reconnexion QEEL atteint');
    }
  }

  /**
   * Force une reconnexion manuelle
   */
  reconnect(): void {
    console.log('🔄 [QEEL] Reconnexion manuelle demandée');
    this.disconnect();
    this.reconnectAttempts = 0;
    
    // Attendre un peu avant de se reconnecter
    setTimeout(() => {
      this.connect();
      // Charger les données initiales après reconnexion
      setTimeout(() => {
        this.loadInitialDataDirectly();
      }, 200);
    }, 100);
  }

  /**
   * Ferme la connexion WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Vérifie si la connexion est active
   */
  isWebSocketConnected(): boolean {
    return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Nettoie les ressources lors de la destruction du service
   */
  ngOnDestroy(): void {
    this.disconnect();
  }
}
