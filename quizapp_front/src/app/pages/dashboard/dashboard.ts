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
      icon: '📊',
      route: '/dashboard/overview',
      roles: ['super', 'admin', 'recruiter']
    },
    {
      id: 'entities',
      label: 'Entités',
      icon: '🗃️',
      route: '/dashboard/entities',
      roles: ['super']
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: '👥',
      route: '/dashboard/users',
      roles: ['super', 'admin']
    },
    {
      id: 'candidates',
      label: 'Candidats',
      icon: '🎯',
      route: '/dashboard/candidates',
      roles: ['super', 'admin', 'recruiter']
    },
    {
      id: 'interviews',
      label: 'Entretiens',
      icon: '🎤',
      route: '/dashboard/interviews',
      roles: ['super', 'admin', 'recruiter']
    },
    {
      id: 'evaluations',
      label: 'Évaluations',
      icon: '📝',
      route: '/dashboard/evaluations',
      roles: ['super', 'admin', 'recruiter']
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: '📈',
      route: '/dashboard/reports',
      roles: ['super', 'admin']
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: '⚙️',
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
