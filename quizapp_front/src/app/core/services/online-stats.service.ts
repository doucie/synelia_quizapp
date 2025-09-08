import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { timeout, catchError, tap, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Interface pour les statistiques d'utilisateurs en ligne (QEEL)
 */
export interface OnlineStats {
  totalUsers: number;
  onlineUsers: number;
  totalAdmins: number;
  onlineAdmins: number;
  totalRecruiters: number;
  onlineRecruiters: number;
  onlinePercentage: number;
  adminOnlinePercentage: number;
  recruiterOnlinePercentage: number;
}

/**
 * Service pour récupérer les statistiques des utilisateurs en ligne
 * Utilisé pour afficher le QEEL (Qui Est En Ligne) dans le tableau de bord
 * Optimisé avec cache et timeouts rapides pour éviter les lenteurs
 */
@Injectable({
  providedIn: 'root'
})
export class OnlineStatsService {
  private apiUrl = `${environment.apiUrl}/user`;
  private readonly TIMEOUT_MS = 2000; // 2 secondes max
  private readonly CACHE_DURATION = 30000; // Cache de 30 secondes
  
  // Cache des statistiques avec timestamp
  private statsCache: { data: OnlineStats; timestamp: number } | null = null;
  private statsSubject = new BehaviorSubject<OnlineStats>(this.getFallbackStats());
  private initialLoadComplete = false;

  constructor(private http: HttpClient) {
    // Charger les statistiques au démarrage
    this.loadStatsInBackground();
  }

  /**
   * Récupère les statistiques complètes des utilisateurs en ligne
   * Force toujours un appel API pour récupérer les données fraîches
   * @returns Observable contenant toutes les statistiques QEEL
   */
  getOnlineStats(): Observable<OnlineStats> {
    console.log('🔄 Force refresh des statistiques QEEL...');
    
    // Forcer un appel API à chaque fois pour avoir les données fraîches
    return this.http.get<OnlineStats>(`${this.apiUrl}/online-stats`)
      .pipe(
        timeout(this.TIMEOUT_MS),
        catchError((error: HttpErrorResponse) => {
          console.log('⚡ API non disponible, utilisation des données de fallback');
          console.error('Erreur API:', error);
          return of(this.getFallbackStats());
        }),
        tap(stats => {
          console.log('📦 Réponse brute de l\'API:', stats);
          console.log('📦 Type de totalUsers:', typeof stats.totalUsers);
          console.log('📦 Type de onlineUsers:', typeof stats.onlineUsers);
          
          // Calculer les pourcentages si pas déjà fait
          stats.onlinePercentage = this.calculatePercentage(stats.onlineUsers, stats.totalUsers);
          stats.adminOnlinePercentage = this.calculatePercentage(stats.onlineAdmins, stats.totalAdmins);
          stats.recruiterOnlinePercentage = this.calculatePercentage(stats.onlineRecruiters, stats.totalRecruiters);
          
          console.log('✅ Statistiques QEEL traitées:', stats);
          
          // Mettre à jour le cache et le subject
          this.updateCache(stats);
          this.statsSubject.next(stats);
        })
      );
  }

  /**
   * Observable des statistiques en temps réel
   * S'abonne au BehaviorSubject pour recevoir les mises à jour automatiques
   * Filtre les données initiales de fallback pour n'envoyer que les vraies données
   */
  getOnlineStatsStream(): Observable<OnlineStats> {
    return this.statsSubject.asObservable().pipe(
      // Filtrer les données de fallback initiales, attendre les vraies données
      filter(() => this.initialLoadComplete)
    );
  }

  /**
   * Charge les statistiques en arrière-plan avec fallback rapide
   */
  private loadStatsInBackground(): void {
    console.log('🔄 Chargement des statistiques QEEL...');
    
    this.http.get<OnlineStats>(`${this.apiUrl}/online-stats`)
      .pipe(
        timeout(this.TIMEOUT_MS), // Timeout rapide de 2 secondes
        catchError((error: HttpErrorResponse) => {
          console.log('⚡ API non disponible, utilisation des données de fallback');
          return of(this.getFallbackStats());
        }),
        tap(stats => {
          // Calculer les pourcentages si pas déjà fait
          stats.onlinePercentage = this.calculatePercentage(stats.onlineUsers, stats.totalUsers);
          stats.adminOnlinePercentage = this.calculatePercentage(stats.onlineAdmins, stats.totalAdmins);
          stats.recruiterOnlinePercentage = this.calculatePercentage(stats.onlineRecruiters, stats.totalRecruiters);
        })
      )
      .subscribe({
        next: (stats) => {
          this.updateCache(stats);
          this.statsSubject.next(stats);
          this.initialLoadComplete = true;
          console.log('✅ Statistiques QEEL mises à jour');
        },
        error: (error) => {
          console.log('⚠️ Erreur lors du chargement, utilisation du fallback');
          const fallbackStats = this.getFallbackStats();
          this.statsSubject.next(fallbackStats);
          this.initialLoadComplete = true;
        }
      });
  }

  /**
   * Données de fallback pour le développement (chargement instantané)
   * Mise à jour avec des valeurs réalistes par défaut
   */
  private getFallbackStats(): OnlineStats {
    console.log('⚠️ Utilisation des données de fallback (0/0)');
    return {
      totalUsers: 0,
      onlineUsers: 0,
      totalAdmins: 0,
      onlineAdmins: 0,
      totalRecruiters: 0,
      onlineRecruiters: 0,
      onlinePercentage: 0,
      adminOnlinePercentage: 0,
      recruiterOnlinePercentage: 0
    };
  }

  /**
   * Met à jour le cache avec timestamp
   */
  private updateCache(stats: OnlineStats): void {
    this.statsCache = {
      data: stats,
      timestamp: Date.now()
    };
  }

  /**
   * Vérifie si le cache est encore valide
   */
  private isCacheValid(): boolean {
    if (!this.statsCache) return false;
    return (Date.now() - this.statsCache.timestamp) < this.CACHE_DURATION;
  }

  /**
   * Récupère uniquement le nombre d'utilisateurs en ligne (version simplifiée)
   * @returns Observable du nombre d'utilisateurs connectés
   */
  getOnlineUsersCount(): Observable<number> {
    // Utiliser directement les stats en cache ou fallback
    const stats = this.statsSubject.getValue();
    return of(stats.onlineUsers);
  }

  /**
   * Récupère les statistiques par rôle (version simplifiée)
   * @param role le rôle à filtrer ('admin', 'recruiter', etc.)
   * @returns Observable des statistiques pour ce rôle
   */
  getOnlineStatsByRole(role: string): Observable<{total: number, online: number}> {
    const stats = this.statsSubject.getValue();
    let result: {total: number, online: number};
    
    switch(role.toLowerCase()) {
      case 'admin':
        result = { total: stats.totalAdmins, online: stats.onlineAdmins };
        break;
      case 'recruiter':
        result = { total: stats.totalRecruiters, online: stats.onlineRecruiters };
        break;
      default:
        result = { total: stats.totalUsers, online: stats.onlineUsers };
        break;
    }
    
    return of(result);
  }

  /**
   * Calcule le pourcentage d'utilisateurs en ligne
   * @param online nombre d'utilisateurs en ligne
   * @param total nombre total d'utilisateurs
   * @returns pourcentage formaté
   */
  calculatePercentage(online: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((online / total) * 100);
  }
}