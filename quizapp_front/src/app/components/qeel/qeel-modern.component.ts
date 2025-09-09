import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlineStats } from '../../core/services/online-stats.service';
import { QeelWebSocketService } from '../../services/qeel-websocket.service';
import { Subscription } from 'rxjs';

/**
 * Version moderne du QEEL qui respecte le design system de l'application
 * Design professionnel avec système de couleurs cohérent
 */
@Component({
  selector: 'app-qeel-modern',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qeel-container">
      <!-- Header -->
      <div class="qeel-header">
        <div class="qeel-title">
          <div class="title-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="title-content">
            <h3>Utilisateurs en ligne</h3>
            <p>Statistiques en temps réel</p>
          </div>
        </div>
        <div class="live-badge">
          <div class="live-dot"></div>
          <span>LIVE</span>
        </div>
      </div>

      <!-- Message de chargement ou erreur -->
      <div *ngIf="isConnecting || error" class="loading-container">
        <div *ngIf="isConnecting" class="loading-spinner"></div>
        <p *ngIf="isConnecting && !error">Connexion en cours...</p>
        <p *ngIf="error" class="error-message">{{ error }}</p>
        <button *ngIf="error" class="retry-button" (click)="retryConnection()">Réessayer</button>
      </div>

      <!-- Stats Grid -->
      <div *ngIf="stats" class="qeel-stats">
        <!-- Statistiques générales -->
        <div class="stat-card users">
          <div class="stat-header">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="stat-label">Tous les utilisateurs</div>
          </div>
          <div class="stat-content">
            <div class="stat-numbers">
              <span class="online-count">{{ stats.onlineUsers }}</span>
              <span class="divider">/</span>
              <span class="total-count">{{ stats.totalUsers }}</span>
            </div>
            <div class="stat-percentage" 
                 [class.high]="stats.onlinePercentage >= 70" 
                 [class.medium]="stats.onlinePercentage >= 30 && stats.onlinePercentage < 70"
                 [class.low]="stats.onlinePercentage < 30">
              {{ stats.onlinePercentage }}% connectés
            </div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" 
                 [style.width.%]="stats.onlinePercentage"
                 [class.high]="stats.onlinePercentage >= 70" 
                 [class.medium]="stats.onlinePercentage >= 30 && stats.onlinePercentage < 70"
                 [class.low]="stats.onlinePercentage < 30">
            </div>
          </div>
        </div>

        <!-- Statistiques Administrateurs -->
        <div class="stat-card admins">
          <div class="stat-header">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 15a3 3 0 0 0 3-3V9a3 3 0 0 0-6 0v3a3 3 0 0 0 3 3Z"/>
                <path d="M5 19a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Z"/>
                <path d="M9 9V6a3 3 0 0 1 6 0v3"/>
              </svg>
            </div>
            <div class="stat-label">Administrateurs</div>
          </div>
          <div class="stat-content">
            <div class="stat-numbers">
              <span class="online-count">{{ stats.onlineAdmins }}</span>
              <span class="divider">/</span>
              <span class="total-count">{{ stats.totalAdmins }}</span>
            </div>
            <div class="stat-percentage" 
                 [class.high]="stats.adminOnlinePercentage >= 70" 
                 [class.medium]="stats.adminOnlinePercentage >= 30 && stats.adminOnlinePercentage < 70"
                 [class.low]="stats.adminOnlinePercentage < 30">
              {{ stats.adminOnlinePercentage }}% connectés
            </div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" 
                 [style.width.%]="stats.adminOnlinePercentage"
                 [class.high]="stats.adminOnlinePercentage >= 70" 
                 [class.medium]="stats.adminOnlinePercentage >= 30 && stats.adminOnlinePercentage < 70"
                 [class.low]="stats.adminOnlinePercentage < 30">
            </div>
          </div>
        </div>

        <!-- Statistiques Recruteurs -->
        <div class="stat-card recruiters">
          <div class="stat-header">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                <line x1="22" y1="5" x2="12" y2="13"/>
                <line x1="22" y1="13" x2="12" y2="5"/>
              </svg>
            </div>
            <div class="stat-label">Recruteurs</div>
          </div>
          <div class="stat-content">
            <div class="stat-numbers">
              <span class="online-count">{{ stats.onlineRecruiters }}</span>
              <span class="divider">/</span>
              <span class="total-count">{{ stats.totalRecruiters }}</span>
            </div>
            <div class="stat-percentage" 
                 [class.high]="stats.recruiterOnlinePercentage >= 70" 
                 [class.medium]="stats.recruiterOnlinePercentage >= 30 && stats.recruiterOnlinePercentage < 70"
                 [class.low]="stats.recruiterOnlinePercentage < 30">
              {{ stats.recruiterOnlinePercentage }}% connectés
            </div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" 
                 [style.width.%]="stats.recruiterOnlinePercentage"
                 [class.high]="stats.recruiterOnlinePercentage >= 70" 
                 [class.medium]="stats.recruiterOnlinePercentage >= 30 && stats.recruiterOnlinePercentage < 70"
                 [class.low]="stats.recruiterOnlinePercentage < 30">
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="qeel-footer">
        <div class="last-update">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          <span>Dernière mise à jour : {{ currentTime | date:'HH:mm:ss' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .qeel-container {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px var(--shadow-light);
      margin-bottom: 2rem;
      transition: all 0.3s ease;
    }

    .qeel-container:hover {
      box-shadow: 0 8px 30px var(--shadow-medium);
      transform: translateY(-2px);
    }

    /* Loading State */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: var(--text-secondary);
    }

    .error-message {
      color: var(--error);
      margin: 1rem 0;
      text-align: center;
    }

    .retry-button {
      padding: 0.5rem 1rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .retry-button:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border);
      border-top: 3px solid var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Header */
    .qeel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }

    .qeel-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .title-icon {
      width: 3rem;
      height: 3rem;
      background: var(--primary);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .title-icon svg {
      width: 1.5rem;
      height: 1.5rem;
    }

    .title-content h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .title-content p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .live-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--qeel-online-bg);
      color: var(--qeel-online);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid var(--qeel-online);
    }

    .live-dot {
      width: 0.5rem;
      height: 0.5rem;
      background: var(--qeel-online);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }

    /* Stats Grid */
    .qeel-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: var(--surface-variant);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, var(--primary), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px var(--shadow-medium);
    }

    .stat-card:hover::before {
      opacity: 1;
    }

    /* Specific card colors */
    .stat-card.users {
      border-left: 4px solid var(--qeel-users);
    }

    .stat-card.admins {
      border-left: 4px solid var(--qeel-admins);
    }

    .stat-card.recruiters {
      border-left: 4px solid var(--qeel-recruiters);
    }

    .stat-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .stat-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .users .stat-icon {
      background: var(--qeel-users-bg);
      color: var(--qeel-users);
    }

    .admins .stat-icon {
      background: var(--qeel-admins-bg);
      color: var(--qeel-admins);
    }

    .recruiters .stat-icon {
      background: var(--qeel-recruiters-bg);
      color: var(--qeel-recruiters);
    }

    .stat-icon svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .stat-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-content {
      margin-bottom: 1rem;
    }

    .stat-numbers {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .online-count {
      font-size: 2rem;
      font-weight: 800;
      color: var(--qeel-online);
      line-height: 1;
    }

    .divider {
      font-size: 1.5rem;
      color: var(--text-disabled);
      font-weight: 300;
    }

    .total-count {
      font-size: 1.5rem;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .stat-percentage {
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
      display: inline-block;
    }

    .stat-percentage.high {
      background: var(--qeel-percentage-high-bg);
      color: var(--qeel-percentage-high);
    }

    .stat-percentage.medium {
      background: var(--qeel-percentage-medium-bg);
      color: var(--qeel-percentage-medium);
    }

    .stat-percentage.low {
      background: var(--qeel-percentage-low-bg);
      color: var(--qeel-percentage-low);
    }

    /* Progress Bar */
    .stat-progress {
      width: 100%;
      height: 4px;
      background: var(--border);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      border-radius: 2px;
      transition: width 0.6s ease;
    }

    .progress-bar.high {
      background: var(--qeel-percentage-high);
    }

    .progress-bar.medium {
      background: var(--qeel-percentage-medium);
    }

    .progress-bar.low {
      background: var(--qeel-percentage-low);
    }

    /* Footer */
    .qeel-footer {
      border-top: 1px solid var(--border);
      padding-top: 1rem;
    }

    .last-update {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
      justify-content: center;
    }

    .last-update svg {
      width: 1rem;
      height: 1rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .qeel-container {
        padding: 1rem;
      }

      .qeel-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .qeel-stats {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .stat-numbers {
        justify-content: center;
      }

      .title-content h3 {
        font-size: 1.125rem;
      }

      .online-count {
        font-size: 1.75rem;
      }

      .total-count {
        font-size: 1.25rem;
      }
    }

    /* Animation d'apparition */
    .qeel-container {
      animation: slideInUp 0.6s ease-out;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .stat-card {
      animation: fadeInScale 0.6s ease-out;
      animation-delay: calc(var(--index, 0) * 0.1s);
    }

    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `]
})
export class QeelModernComponent implements OnInit, OnDestroy {
  // Statistiques des utilisateurs en ligne (via WebSocket)
  stats: OnlineStats | null = null;
  error: string | null = null;
  isConnecting = true;

  currentTime = new Date();
  private subscription: Subscription = new Subscription();
  private timeInterval: any;

  constructor(
    private qeelWebSocketService: QeelWebSocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Attendre un moment pour que le service WebSocket s'initialise
    setTimeout(() => {
      this.loadStats();
    }, 500);
    
    // Mettre à jour l'heure en temps réel
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    console.log('🎨 QEEL Modern initialisé');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    // Le service WebSocket se déconnecte automatiquement
  }

  /**
   * Réessaye la connexion WebSocket
   */
  retryConnection(): void {
    this.error = null;
    this.isConnecting = true;
    this.cdr.detectChanges();
    this.qeelWebSocketService.reconnect();
    this.loadStats();
  }

  /**
   * S'abonne aux statistiques en temps réel via WebSocket
   */
  private loadStats(): void {
    console.log('🔄 Connexion WebSocket QEEL...');
    this.isConnecting = true;
    this.error = null;
    
    // S'abonner au flux WebSocket pour recevoir les mises à jour automatiques en temps réel
    const statsSubscription = this.qeelWebSocketService.getOnlineStats().subscribe({
      next: (stats: OnlineStats | null) => {
        if (stats) {
          console.log('✅ Statistiques QEEL mises à jour via WebSocket:', stats);
          this.stats = stats;
          this.isConnecting = false;
          this.error = null;
          // Déclencher manuellement la détection de changements
          this.cdr.detectChanges();
        }
      },
      error: (error: any) => {
        console.error('❌ Erreur WebSocket QEEL:', error);
        this.error = "Une erreur est survenue lors de la connexion";
        this.isConnecting = false;
        this.cdr.detectChanges();
      }
    });

    this.subscription.add(statsSubscription);
    
    // Vérifier après un délai si nous avons reçu des données
    setTimeout(() => {
      if (!this.stats && this.isConnecting) {
        console.log('⚠️ Aucune donnée reçue après 3 secondes, vérification de l\'état...');
        // Ne pas marquer comme erreur immédiatement, laisser plus de temps
        if (!this.qeelWebSocketService.isWebSocketConnected()) {
          console.log('⚠️ WebSocket non connecté, tentative de reconnexion...');
          this.qeelWebSocketService.reconnect();
        }
      }
    }, 3000);
    
    // Timeout final après 10 secondes
    setTimeout(() => {
      if (!this.stats && this.isConnecting) {
        this.error = "Impossible de se connecter au serveur WebSocket";
        this.isConnecting = false;
        this.cdr.detectChanges();
      }
    }, 10000);
  }
}
