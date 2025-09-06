import { Component, OnInit, signal, computed, effect, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  roles: string[];
  children?: MenuItem[];
  safeIcon?: SafeHtml; // HTML sécurisé pour l'affichage
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  
  // État réactif
  sidebarCollapsed = signal(false);
  notifications = signal<Notification[]>([]);
  showNotifications = signal(false);
  showUserMenu = signal(false);
  isDarkMode = signal(false);
  
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
      roles: ['super']
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1V3H9V1L3 7V9H21ZM15 21C15 19.9 14.1 19 13 19H11C9.9 19 9 19.9 9 21H15Z"/></svg>',
      route: '/dashboard/users',
      roles: ['super', 'admin']
    },
    {
      id: 'candidates',
      label: 'Candidats',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
      route: '/dashboard/candidates',
      roles: ['super', 'admin', 'recruiter']
    },
    {
      id: 'interviews',
      label: 'Entretiens',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/></svg>',
      route: '/dashboard/interviews',
      roles: ['super', 'admin', 'recruiter']
    },
    {
      id: 'evaluations',
      label: 'Évaluations',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>',
      route: '/dashboard/evaluations',
      roles: ['super', 'admin', 'recruiter']
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3v18h18v-2H5V3H3zm4 12h2v4h-2v-4zm4-4h2v8h-2v-8zm4-4h2v12h-2V7z"/></svg>',
      route: '/dashboard/reports',
      roles: ['super', 'admin']
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>',
      route: '/dashboard/settings',
      roles: ['super']
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
    
    // Sanitiser les icônes SVG
    this.menuItems = this.menuItems.map(item => ({
      ...item,
      safeIcon: this.domSanitizer.bypassSecurityTrustHtml(item.icon)
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
   * Charger les notifications (mock pour l'instant)
   */
  private loadNotifications(): void {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Nouveau candidat',
        message: 'Un nouveau candidat a postulé pour le poste de développeur',
        type: 'info',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false
      },
      {
        id: '2',
        title: 'Entretien prévu',
        message: 'Entretien avec Jean Dupont prévu à 14h00',
        type: 'warning',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: false
      },
      {
        id: '3',
        title: 'Évaluation terminée',
        message: 'L\'évaluation de Marie Martin a été complétée',
        type: 'success',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true
      }
    ];
    
    this.notifications.set(mockNotifications);
  }

  /**
   * Marquer une notification comme lue
   */
  markNotificationAsRead(notificationId: string): void {
    this.notifications.update(notifications =>
      notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllNotificationsAsRead(): void {
    this.notifications.update(notifications =>
      notifications.map(n => ({ ...n, read: true }))
    );
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
