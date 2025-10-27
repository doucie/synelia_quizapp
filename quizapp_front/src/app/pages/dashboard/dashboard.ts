import { Component, OnInit, signal, computed, effect, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { NotificationService, DbNotification } from '../../core/services/notification.service';
import { NotificationsComponent } from '../../components/notifications/notifications.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  roles: string[];
  children?: MenuItem[];
  safeIcon?: SafeHtml; // HTML sécurisé pour l'affichage
  hasDropdown?: boolean; // Indique si l'item a un dropdown
}

interface EntityItem {
  id: string;
  label: string;
  icon: string;
  safeIcon?: SafeHtml; // HTML sécurisé pour l'affichage
}

/**
 * Interface pour afficher les notifications dans le dashboard
 */
interface DashboardNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  link?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NotificationsComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  
  // État réactif
  sidebarCollapsed = signal(false);
  notifications = signal<DashboardNotification[]>([]);
  showNotifications = signal(false);
  showUserMenu = signal(false);
  isDarkMode = signal(false);
  showEntitiesDropdown = signal(false);
  
  currentUser = computed(() => {
    const user = this.authService.getCurrentUser();
    console.log('🔍 Dashboard currentUser computed:', user);
    return user;
  });
  userRole = computed(() => {
    const role = this.currentUser()?.role || '';
    console.log('🔍 Dashboard userRole computed:', role);
    return role;
  });

  // Menu items basés sur les rôles
  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/></svg>',
      route: '/dashboard/overview',
      roles: ['super', 'admin', 'recruiter']
    },
    {
      id: 'entities',
      label: 'Entités',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4zm0 0V5a2 2 0 012-2h1m1 0h8a2 2 0 012 2v2M9 7h6m-6 4h6m-3 4h3"/></svg>',
      route: '/dashboard/entities',
      roles: ['super'],
      hasDropdown: true
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
      route: '/dashboard/users',
      roles: ['admin', 'recruiter']
    },
    {
      id: 'departments',
      label: 'Départements',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3v18h8v-8h2v8h8V3H3zm6 16H5v-2h4v2zm0-4H5v-2h4v2zm0-4H5V9h4v2zm0-4H5V5h4v2zm6 12h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V9h4v2zm0-4h-4V5h4v2zm6 12h-4v-2h4v2zm0-4h-4v-2h4v2z"/></svg>',
      route: '/dashboard/departments',
      roles: ['admin']
    },
    {
      id: 'specialities',
      label: 'Spécialités',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
      route: '/dashboard/specialities',
      roles: ['admin']
    },
    {
      id: 'questions',
      label: 'Questions',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>',
      route: '/dashboard/questions',
      roles: ['admin']
    },
    {
      id: 'answers',
      label: 'Réponses',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>',
      route: '/dashboard/answers',
      roles: ['admin']
    },
    {
      id: 'campaigns',
      label: 'Campagnes',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 5h-2V3h2v2zm-2 2h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm-2 0h-2v2h2v-2zm-4 0H7v2h2v-2zm0-4H7v2h2V9zm0-4H7v2h2V7zm0-2H7V3h2v2zm10-1v18H3V2h2v2h2V2h2v2h6V2h2v2h2z"/></svg>',
      route: '/dashboard/campaigns',
      roles: ['admin', 'recruiter']
    },
    {
      id: 'candidates',
      label: 'Candidatures',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
      route: '/dashboard/candidates',
      roles: ['admin', 'recruiter']
    },
    {
      id: 'decisions',
      label: 'Décisions',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
      route: '/dashboard/decisions',
      roles: ['admin', 'recruiter']
    },
    {
      id: 'interviews',
      label: 'Entretiens',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/></svg>',
      route: '/dashboard/interviews',
      roles: ['admin', 'recruiter']
    },
    {
      id: 'evaluations',
      label: 'Évaluations',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>',
      route: '/dashboard/evaluations',
      roles: ['admin', 'recruiter']
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>',
      route: '/dashboard/settings',
      roles: ['super', 'admin', 'recruiter']
    }
  ];

  // Liste des entités pour l'accès rapide
  entitiesList: EntityItem[] = [
    { 
      id: 'users', 
      label: 'Utilisateurs', 
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>' 
    },
    { 
      id: 'departments', 
      label: 'Départements', 
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3v18h8v-8h2v8h8V3H3zm6 16H5v-2h4v2zm0-4H5v-2h4v2zm0-4H5V9h4v2zm0-4H5V5h4v2zm6 12h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V9h4v2zm0-4h-4V5h4v2zm6 12h-4v-2h4v2zm0-4h-4v-2h4v2z"/></svg>' 
    },
    { 
      id: 'specialities', 
      label: 'Spécialités', 
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' 
    },
    { 
      id: 'questions', 
      label: 'Questions', 
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>' 
    },
    { 
      id: 'answers', 
      label: 'Réponses', 
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>' 
    },
    { 
      id: 'campaigns', 
      label: 'Campagnes', 
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 5h-2V3h2v2zm-2 2h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm-2 0h-2v2h2v-2zm-4 0H7v2h2v-2zm0-4H7v2h2V9zm0-4H7v2h2V7zm0-2H7V3h2v2zm10-1v18H3V2h2v2h2V2h2v2h6V2h2v2h2z"/></svg>' 
    },
    { 
      id: 'applications', 
      label: 'Candidatures', 
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>' 
    },
    { 
      id: 'interviews', 
      label: 'Entretiens', 
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/></svg>' 
    },
    { 
      id: 'evaluations', 
      label: 'Évaluations', 
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>' 
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>' 
    },
    { 
      id: 'source-tokens', 
      label: 'Tokens Source', 
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>' 
    },
    { 
      id: 'roles', 
      label: 'Rôles', 
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2V9h-2V7h8v12z"/></svg>' 
    }
  ];

  // Menu filtré basé sur le rôle
  filteredMenuItems = computed(() => {
    const role = this.userRole();
    return this.menuItems.filter(item => item.roles.includes(role));
  });

  // Compteur de notifications non lues
  unreadNotificationsCount = computed(() => {
    return this.notifications().filter(n => !n.read).length;
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private domSanitizer: DomSanitizer
  ) {
    // Effet pour appliquer le thème
    effect(() => {
      if (this.isDarkMode()) {
        this.renderer.addClass(this.document.body, 'dark-mode');
      } else {
        this.renderer.removeClass(this.document.body, 'dark-mode');
      }
    });
  }

  ngOnInit(): void {
    this.loadNotifications();
    this.initializeTheme();
    
    // Écouter les paramètres d'erreur d'accès
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'access_denied' && params['message']) {
        this.notificationService.error(
          'Accès refusé',
          params['message'],
          8000
        );
        // Nettoyer les paramètres de l'URL
        this.router.navigate(['/dashboard'], { queryParams: {} });
      }
    });
    
    // Sanitiser les icônes SVG des menus
    this.menuItems = this.menuItems.map(item => ({
      ...item,
      safeIcon: this.domSanitizer.bypassSecurityTrustHtml(item.icon)
    }));
    
    // Sanitiser les icônes SVG des entités
    this.entitiesList = this.entitiesList.map(entity => ({
      ...entity,
      safeIcon: this.domSanitizer.bypassSecurityTrustHtml(entity.icon)
    }));
    
    // Vérifier si l'utilisateur est connecté
    if (!this.currentUser()) {
      this.router.navigate(['/connexion']);
      return;
    }
  }

  /**
   * Initialise le thème depuis localStorage
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      this.isDarkMode.set(true);
    }
  }

  /**
   * Toggle dark/light mode
   */
  toggleTheme(): void {
    const newTheme = !this.isDarkMode();
    this.isDarkMode.set(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  }

  /**
   * Toggle sidebar collapsed state
   */
  toggleSidebar(): void {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  /**
   * Toggle notifications panel
   */
  toggleNotifications(): void {
    this.showNotifications.update(show => !show);
    if (this.showNotifications()) {
      this.showUserMenu.set(false);
    }
  }

  /**
   * Toggle user menu
   */
  toggleUserMenu(): void {
    this.showUserMenu.update(show => !show);
    if (this.showUserMenu()) {
      this.showNotifications.set(false);
    }
  }

  /**
   * Toggle entities dropdown
   */
  toggleEntitiesDropdown(): void {
    this.showEntitiesDropdown.update(show => !show);
  }

  /**
   * Navigate to specific entity
   */
  navigateToEntity(entityId: string): void {
    this.router.navigate([`/dashboard/entities/${entityId}`]);
    this.showEntitiesDropdown.set(false);
  }

  /**
   * Charger les notifications depuis la base de données
   */
  private loadNotifications(): void {
    const userIdString = this.currentUser()?.id;
    
    if (!userIdString) {
      console.warn('⚠️ Impossible de charger les notifications: userId non défini');
      return;
    }

    const userId = parseInt(userIdString, 10);
    console.log('📬 Chargement des notifications pour userId:', userId);

    this.notificationService.getUserNotifications(userId).subscribe({
      next: (dbNotifications: DbNotification[]) => {
        console.log('✅ Notifications BD récupérées:', dbNotifications);
        
        // Convertir les notifications BD en format dashboard
        const dashboardNotifications: DashboardNotification[] = dbNotifications.map(notif => 
          this.convertToDashboardNotification(notif)
        );
        
        this.notifications.set(dashboardNotifications);
        console.log('📊 Notifications converties:', dashboardNotifications);
      },
      error: (error) => {
        console.error('❌ Erreur chargement notifications:', error);
        this.notifications.set([]); // Afficher une liste vide en cas d'erreur
      }
    });
  }

  /**
   * Convertit une notification BD en notification dashboard
   */
  private convertToDashboardNotification(dbNotif: DbNotification): DashboardNotification {
    // Mapper le type de notification
    const typeMap: { [key: string]: 'info' | 'success' | 'warning' | 'error' } = {
      'ADDED_TO_CAMPAIGN': 'info',
      'CAMPAIGN_UPDATE': 'warning',
      'APPLICATION_RECEIVED': 'info',
      'INTERVIEW_SCHEDULED': 'warning',
      'EVALUATION_COMPLETED': 'success',
      'DEFAULT': 'info'
    };

    // Générer le titre et message selon le type
    let title = '';
    let message = '';

    switch (dbNotif.notifType) {
      case 'ADDED_TO_CAMPAIGN':
        title = 'Nouvelle campagne';
        message = dbNotif.actorName 
          ? `${dbNotif.actorName} vous a ajouté à une campagne`
          : 'Vous avez été ajouté à une campagne';
        break;
      case 'CAMPAIGN_UPDATE':
        title = 'Campagne mise à jour';
        message = 'Une campagne a été modifiée';
        break;
      case 'APPLICATION_RECEIVED':
        title = 'Nouvelle candidature';
        message = 'Une nouvelle candidature a été reçue';
        break;
      default:
        title = dbNotif.notifType;
        message = 'Notification';
    }

    return {
      id: dbNotif.id,
      title,
      message,
      type: typeMap[dbNotif.notifType] || typeMap['DEFAULT'],
      timestamp: dbNotif.createdAt ? new Date(dbNotif.createdAt) : new Date(),
      read: dbNotif.isRead,
      link: dbNotif.notifLink
    };
  }

  /**
   * Marquer une notification comme lue
   */
  markNotificationAsRead(notificationId: number): void {
    console.log('📖 Marquage notification comme lue:', notificationId);
    
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        // Mettre à jour localement
        this.notifications.update(notifications =>
          notifications.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        console.log('✅ Notification marquée comme lue');
      },
      error: (error) => {
        console.error('❌ Erreur marquage notification:', error);
      }
    });
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllNotificationsAsRead(): void {
    const unreadNotifications = this.notifications().filter(n => !n.read);
    const userIdString = this.currentUser()?.id;
    
    if (!userIdString || unreadNotifications.length === 0) {
      return;
    }

    const userId = parseInt(userIdString, 10);
    const notificationIds = unreadNotifications.map(n => n.id);
    console.log('📖 Marquage de toutes les notifications:', notificationIds);

    this.notificationService.markAllAsRead(userId, notificationIds).subscribe({
      next: () => {
        // Mettre à jour localement
        this.notifications.update(notifications =>
          notifications.map(n => ({ ...n, read: true }))
        );
        console.log('✅ Toutes les notifications marquées comme lues');
      },
      error: (error) => {
        console.error('❌ Erreur marquage notifications:', error);
      }
    });
  }

  /**
   * Gérer le clic sur une notification
   */
  handleNotificationClick(notification: DashboardNotification): void {
    // Marquer comme lue
    if (!notification.read) {
      this.markNotificationAsRead(notification.id);
    }

    // Naviguer vers le lien si disponible
    if (notification.link) {
      this.router.navigate([notification.link]);
      this.showNotifications.set(false); // Fermer le panneau
    }
  }

  /**
   * Navigation vers une route
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  /**
   * Déconnexion
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/connexion']);
  }

  /**
   * Fermer tous les panneaux
   */
  closeAllPanels(): void {
    this.showNotifications.set(false);
    this.showUserMenu.set(false);
    this.showEntitiesDropdown.set(false);
  }

  /**
   * Formater le timestamp des notifications
   */
  formatNotificationTime(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
  }
}
