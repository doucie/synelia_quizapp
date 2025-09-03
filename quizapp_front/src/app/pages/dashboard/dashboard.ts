import { Component, OnInit, signal, computed, effect, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  roles: string[];
  children?: MenuItem[];
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
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3v18h18v-2H5V3z"/><path d="M7 12h2v7H7zm4-7h2v14h-2zm4 3h2v11h-2z"/></svg>',
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
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-4m4 0a2 2 0 11-4 0 2 2 0 014 0zM17 8h4"/></svg>',
      route: '/dashboard/users',
      roles: ['super', 'admin']
    },
    {
      id: 'candidates',
      label: 'Candidats',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
      route: '/dashboard/candidates',
      roles: ['super', 'admin', 'recruiter']
    },
    {
      id: 'interviews',
      label: 'Entretiens',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 7a1 1 0 00-1-1h-8a1 1 0 00-1 1v6a1 1 0 001 1h8a1 1 0 001-1V7zM10 15a1 1 0 00-1 1v2a1 1 0 001 1h8a1 1 0 001-1v-2a1 1 0 00-1-1h-8zM6 7a1 1 0 00-2 0v10a1 1 0 002 0V7z"/></svg>',
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
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 17l4-4 4 4m0 0V9m0 8h-8"/><path d="M3 3v18h18"/></svg>',
      route: '/dashboard/reports',
      roles: ['super', 'admin']
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
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
    @Inject(DOCUMENT) private document: Document
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
