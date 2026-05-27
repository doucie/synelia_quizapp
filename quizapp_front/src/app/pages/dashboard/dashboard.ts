import { Component, OnInit, OnDestroy, signal, computed, effect, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService, DbNotification } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import { ThemeService as UiThemeService } from '../../core/services/theme';
import { PermissionService } from '../../core/services/permission.service';
import { NotificationsComponent } from '../../components/notifications/notifications.component';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  roles: string[];
  permissions?: string[];  // Permissions requises (PermissionService)
  children?: MenuItem[];
  hasDropdown?: boolean;
  category: 'accueil' | 'recrutement' | 'donnees' | 'administration' | 'systeme';
  isUtility?: boolean;
}

interface EntityItem {
  id: string;
  label: string;
  icon: string;
  group: 'coeur-metier' | 'quiz' | 'pipeline' | 'formulaires' | 'communication' | 'permissions' | 'configuration';
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
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NotificationsComponent, SafeHtmlPipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  // Session timer
  private sessionTimerId: any = null;
  sessionWarningVisible = signal(false);
  sessionRemainingMinutes = signal(0);
  
  // État réactif
  sidebarCollapsed = signal(false);
  notifications = signal<DashboardNotification[]>([]);
  showNotifications = signal(false);
  showUserMenu = signal(false);
  isDarkMode = signal(false);
  // Restaurer l'état du dropdown depuis localStorage
  showEntitiesDropdown = signal(localStorage.getItem('entitiesDropdownOpen') === 'true');
  adminModeEnabled = signal(false);
  activeEntityId = signal<string | null>(null);
  
  currentUser = signal<any>(null);
  
  userRole = computed(() => {
    const role = this.currentUser()?.role || '';
    console.log('🔍 Dashboard userRole computed:', role);
    return role;
  });
  
  // Check if current user is admin
  isAdmin = computed(() => {
    const role = this.userRole();
    return role === 'admin' || role === 'super';
  });

  // Menu items basés sur les rôles
  menuItems: MenuItem[] = [
    // === ACCUEIL ===
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/></svg>',
      route: '/dashboard/overview',
      roles: ['super', 'admin', 'recruiter'],
      permissions: ['VIEW_CAMPAIGNS'],
      category: 'accueil',
      isUtility: true
    },
    // === RECRUTEMENT ===
    {
      id: 'campaigns',
      label: 'Campagnes',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 5h-2V3h2v2zm-2 2h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm-2 0h-2v2h2v-2zm-4 0H7v2h2v-2zm0-4H7v2h2V9zm0-4H7v2h2V7zm0-2H7V3h2v2zm10-1v18H3V2h2v2h2V2h2v2h6V2h2v2h2z"/></svg>',
      route: '/dashboard/campaigns',
      roles: ['super', 'admin', 'recruiter'],
      permissions: ['VIEW_CAMPAIGNS'],
      category: 'recrutement'
    },
    {
      id: 'candidates',
      label: 'Candidatures',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
      route: '/dashboard/candidates',
      roles: ['super', 'admin', 'recruiter'],
      permissions: ['VIEW_APPLICATIONS'],
      category: 'recrutement'
    },
    {
      id: 'interviews',
      label: 'Entretiens',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/></svg>',
      route: '/dashboard/interviews',
      roles: ['super', 'admin', 'recruiter'],
      permissions: ['VIEW_INTERVIEWS'],
      category: 'recrutement'
    },
    {
      id: 'evaluations',
      label: 'Évaluations',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>',
      route: '/dashboard/evaluations',
      roles: ['super', 'admin', 'recruiter'],
      permissions: ['VIEW_EVALUATIONS'],
      category: 'recrutement'
    },
    {
      id: 'decisions',
      label: 'Décisions',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
      route: '/dashboard/decisions',
      roles: ['super', 'admin', 'recruiter'],
      permissions: ['VIEW_DECISIONS'],
      category: 'recrutement'
    },
    // === DONNÉES ===
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
      route: '/dashboard/users',
      roles: ['super', 'admin', 'recruiter'],
      permissions: ['VIEW_USER'],
      category: 'donnees'
    },
    {
      id: 'departments',
      label: 'Départements',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3v18h8v-8h2v8h8V3H3zm6 16H5v-2h4v2zm0-4H5v-2h4v2zm0-4H5V9h4v2zm0-4H5V5h4v2zm6 12h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V9h4v2zm0-4h-4V5h4v2zm6 12h-4v-2h4v2zm0-4h-4v-2h4v2z"/></svg>',
      route: '/dashboard/departments',
      roles: ['super', 'admin'],
      permissions: ['VIEW_DEPARTMENTS'],
      category: 'donnees'
    },
    {
      id: 'specialities',
      label: 'Spécialités',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
      route: '/dashboard/specialities',
      roles: ['super', 'admin'],
      permissions: ['VIEW_SPECIALITIES'],
      category: 'donnees'
    },
    {
      id: 'questions',
      label: 'Questions',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>',
      route: '/dashboard/questions',
      roles: ['super', 'admin'],
      permissions: ['VIEW_QUESTION'],
      category: 'donnees'
    },
    {
      id: 'answers',
      label: 'Réponses',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>',
      route: '/dashboard/answers',
      roles: ['super', 'admin'],
      permissions: ['VIEW_ANSWER'],
      category: 'donnees'
    },
    {
      id: 'forms',
      label: 'Formulaires',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-3 4h6v2H9v-2zm0 4h4v2H9v-2z"/></svg>',
      route: '/dashboard/forms',
      roles: ['super', 'admin'],
      permissions: ['VIEW_FORM'],
      category: 'donnees'
    },
    {
      id: 'pipeline-templates',
      label: 'Modèles Pipeline',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3h7zM7 9H4V5h3v4zm10 6h3v4h-3v-4zm0-10h3v4h-3V5z"/></svg>',
      route: '/dashboard/pipeline-templates',
      roles: ['super', 'admin', 'recruiter'],
      permissions: ['MANAGE_PIPELINE_TEMPLATE'],
      category: 'donnees'
    },
    // === ADMINISTRATION ===
    {
      id: 'system-role-permissions',
      label: 'Rôles système',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',
      route: '/dashboard/system-role-permissions',
      roles: ['super'],
      permissions: ['MANAGE_SYSTEM_ROLES'],
      category: 'administration'
    },
    {
      id: 'business-groups',
      label: 'Groupes métiers',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>',
      route: '/dashboard/business-groups',
      roles: ['super'],
      permissions: ['MANAGE_SYSTEM_ROLES'],
      category: 'administration'
    },
    {
      id: 'user-permissions',
      label: 'Permissions utilisateurs',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
      route: '/dashboard/user-permissions',
      roles: ['super'],
      permissions: ['MANAGE_SYSTEM_ROLES'],
      category: 'administration'
    },
    // === SYSTÈME ===
    {
      id: 'entities',
      label: 'Entités',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4zm0 0V5a2 2 0 012-2h1m1 0h8a2 2 0 012 2v2M9 7h6m-6 4h6m-3 4h3"/></svg>',
      route: '/dashboard/entities',
      roles: ['super'],
      permissions: ['VIEW_APP_CONFIG'],
      hasDropdown: true,
      category: 'systeme'
    },
    {
      id: 'merise',
      label: 'Modèle Merise',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm14 3a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M10 6.5h4M6.5 10v4M17.5 10v4" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>',
      route: '/dashboard/merise',
      roles: ['super'],
      permissions: ['VIEW_APP_CONFIG'],
      category: 'systeme',
      isUtility: true
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>',
      route: '/dashboard/settings',
      roles: ['super', 'admin', 'recruiter'],
      permissions: ['VIEW_APP_CONFIG', 'VIEW_EMAIL_TEMPLATE'],
      category: 'systeme'
    }
  ];

  // Liste des entités pour l'accès rapide
  entitiesList: EntityItem[] = [
    // === CŒUR MÉTIER ===
    { id: 'users', label: 'Utilisateurs', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>', group: 'coeur-metier' },
    { id: 'departments', label: 'Départements', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3v18h8v-8h2v8h8V3H3zm6 16H5v-2h4v2zm0-4H5v-2h4v2zm0-4H5V9h4v2zm0-4H5V5h4v2zm6 12h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V9h4v2zm0-4h-4V5h4v2zm6 12h-4v-2h4v2zm0-4h-4v-2h4v2z"/></svg>', group: 'coeur-metier' },
    { id: 'specialities', label: 'Spécialités', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>', group: 'coeur-metier' },
    { id: 'campaigns', label: 'Campagnes', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 5h-2V3h2v2zm-2 2h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm-2 0h-2v2h2v-2zm-4 0H7v2h2v-2zm0-4H7v2h2V9zm0-4H7v2h2V7zm0-2H7V3h2v2zm10-1v18H3V2h2v2h2V2h2v2h6V2h2v2h2z"/></svg>', group: 'coeur-metier' },
    { id: 'applications', label: 'Candidatures', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>', group: 'coeur-metier' },
    { id: 'interviews', label: 'Entretiens', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/></svg>', group: 'coeur-metier' },
    { id: 'evaluations', label: 'Évaluations', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>', group: 'coeur-metier' },
    { id: 'decisions', label: 'Décisions', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>', group: 'coeur-metier' },
    // === QUIZ ===
    { id: 'questions', label: 'Questions', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>', group: 'quiz' },
    { id: 'answers', label: 'Réponses', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>', group: 'quiz' },
    { id: 'candidate-answers', label: 'Réponses Candidat', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>', group: 'quiz' },
    { id: 'candidate-ask', label: 'Demandes Candidat', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>', group: 'quiz' },
    { id: 'candidate-token', label: 'Tokens Candidat', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>', group: 'quiz' },
    // === PIPELINE ===
    { id: 'pipeline-templates', label: 'Modèles Pipeline', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3h7zM7 9H4V5h3v4zm10 6h3v4h-3v-4zm0-10h3v4h-3V5z"/></svg>', group: 'pipeline' },
    { id: 'pipeline-stages', label: 'Étapes Pipeline', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>', group: 'pipeline' },
    { id: 'application-progress', label: 'Progression Candidature', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>', group: 'pipeline' },
    // === FORMULAIRES ===
    { id: 'forms', label: 'Formulaires', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-3 4h6v2H9v-2zm0 4h4v2H9v-2z"/></svg>', group: 'formulaires' },
    { id: 'campaign-form', label: 'Campagne-Formulaire', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h5v2H7zm10 10h-5v-2h5z"/><path d="M12 5l4 4-4 4V10H5V8h7V5zm0 14l-4-4 4-4v3h7v2h-7v3z"/></svg>', group: 'formulaires' },
    { id: 'form-versions', label: 'Versions Formulaire', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>', group: 'formulaires' },
    { id: 'form-questions', label: 'Questions Formulaire', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/></svg>', group: 'formulaires' },
    // === COMMUNICATION ===
    { id: 'notifications', label: 'Notifications', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>', group: 'communication' },
    { id: 'email-templates', label: 'Modèles Email', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>', group: 'communication' },
    { id: 'smtp-config', label: 'Configuration SMTP', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>', group: 'communication' },
    { id: 'invitation-codes', label: 'Codes d\'Invitation', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></svg>', group: 'communication' },
    { id: 'email-verification-tokens', label: 'Tokens Vérification', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>', group: 'communication' },
    { id: 'source-tokens', label: 'Tokens Source', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>', group: 'communication' },
    // === PERMISSIONS ===
    { id: 'system-role-permissions', label: 'Permissions Rôles Système', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>', group: 'permissions' },
    { id: 'entity-permissions', label: 'Permissions Entité', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>', group: 'permissions' },
    { id: 'business-groups', label: 'Groupes Métier', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>', group: 'permissions' },
    { id: 'business-group-permissions', label: 'Permissions Groupe Métier', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>', group: 'permissions' },
    { id: 'user-business-groups', label: 'Utilisateurs Groupes Métier', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>', group: 'permissions' },
    { id: 'user-permission-overrides', label: 'Surcharges Permissions Utilisateur', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/><path d="M19 8l-4 4h3c0 2.76-2.24 5-5 5-.52 0-1.02-.08-1.49-.23l-1.45 1.45C11.33 18.72 12.15 19 13 19c3.87 0 7-3.13 7-7h3l-4-4z" opacity="0.6"/></svg>', group: 'permissions' },
    // === CONFIGURATION ===
    { id: 'candidate-interview', label: 'Entretiens Candidat', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>', group: 'configuration' },
    { id: 'app-config', label: 'Configuration App', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 11c.34 0 .67.04 1 .09V6.27L10.5 3 3 6.27v4.91c0 4.54 3.2 8.79 7.5 9.82.55-.13 1.08-.32 1.6-.55-.69-.98-1.1-2.17-1.1-3.45 0-3.31 2.69-6 6-6z"/><path d="M19 13c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 1.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm0 5.5c-1.03 0-1.94-.52-2.48-1.32.03-.65 1.65-.99 2.48-.99s2.45.34 2.48.99c-.54.8-1.45 1.32-2.48 1.32z"/></svg>', group: 'configuration' },
    { id: 'legal-texts', label: 'Textes Légaux', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>', group: 'configuration' }
  ];
  filteredMenuItems = computed(() => {
    const role = this.userRole();
    const permLoaded = this.permissionService.loaded();

    return this.menuItems.filter(item => {
      // Si permissions chargées ET item a des permissions définies → utiliser permissions
      if (permLoaded && item.permissions && item.permissions.length > 0) {
        return this.permissionService.hasAnyPermission(item.permissions);
      }
      // Sinon fallback sur les rôles
      return item.roles.includes(role);
    });
  });

  // Labels des catégories pour la sidebar
  categoryLabels: Record<string, string> = {
    'accueil': 'Accueil',
    'recrutement': 'Recrutement',
    'donnees': 'Données',
    'administration': 'Administration',
    'systeme': 'Système'
  };

  // Labels des groupes pour le dropdown entités
  groupLabels: Record<string, string> = {
    'coeur-metier': 'Cœur métier',
    'quiz': 'Quiz',
    'pipeline': 'Pipeline',
    'formulaires': 'Formulaires',
    'communication': 'Communication',
    'permissions': 'Permissions',
    'configuration': 'Configuration'
  };

  // Menu items groupés par catégorie (pour l'affichage avec séparateurs)
  // Exclut 'settings' qui est affiché dans le footer
  groupedMenuItems = computed(() => {
    const items = this.filteredMenuItems().filter(item => item.id !== 'settings');
    const categories = ['accueil', 'recrutement', 'donnees', 'administration', 'systeme'];
    return categories
      .map(cat => ({
        category: cat,
        label: this.categoryLabels[cat],
        items: items.filter(item => item.category === cat)
      }))
      .filter(group => group.items.length > 0);
  });

  // Item "Paramètres" séparé pour le footer
  settingsMenuItem = computed(() => {
    return this.filteredMenuItems().find(item => item.id === 'settings') || null;
  });

  // Entités groupées par domaine fonctionnel
  groupedEntities = computed(() => {
    const groups = ['coeur-metier', 'quiz', 'pipeline', 'formulaires', 'communication', 'permissions', 'configuration'];
    return groups
      .map(g => ({
        group: g,
        label: this.groupLabels[g],
        items: this.entitiesList.filter(e => e.group === g)
      }))
      .filter(group => group.items.length > 0);
  });

  // Compteur de notifications non lues
  unreadNotificationsCount = computed(() => {
    return this.notifications().filter(n => !n.read).length;
  });

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    public themeService: ThemeService,
    private uiThemeService: UiThemeService,
    public permissionService: PermissionService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
  ) {
    // S'abonner aux changements de l'utilisateur courant
    this.authService.currentUser$.subscribe(user => {
      console.log('🔄 Dashboard: currentUser$ emitted:', user);
      this.currentUser.set(user);
    });
    
    // Effet pour appliquer le thème
    effect(() => {
      if (this.isDarkMode()) {
        this.renderer.addClass(this.document.body, 'dark-mode');
      } else {
        this.renderer.removeClass(this.document.body, 'dark-mode');
      }
    });
    
    // Effet pour synchroniser adminModeEnabled avec currentUser().adminMode
    effect(() => {
      const user = this.currentUser();
      if (user && this.isAdmin()) {
        const newAdminMode = user.adminMode || false;
        if (this.adminModeEnabled() !== newAdminMode) {
          console.log('🔄 Dashboard: Syncing admin mode from user data:', newAdminMode);
          this.adminModeEnabled.set(newAdminMode);
        }
      }
    });
  }

  ngOnInit(): void {
    if (!this.currentUser()) {
      this.router.navigate(['/connexion']);
      return;
    }

    if (this.ensurePasswordChangeRoute(this.router.url)) {
      return;
    }

    this.loadNotifications();
    this.initializeTheme();
    
    // Détecter l'entity active depuis l'URL
    this.updateActiveEntityFromUrl(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (this.ensurePasswordChangeRoute(event.urlAfterRedirects)) {
        return;
      }

      this.updateActiveEntityFromUrl(event.urlAfterRedirects);
    });
    
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
    

    
    // Initialiser l'état du mode admin depuis les données utilisateur
    this.initializeAdminMode();
    
    // Démarrer le timer de session
    this.startSessionTimer();
  }

  /**
   * Initialise le mode admin depuis les données utilisateur
   */
  private initializeAdminMode(): void {
    const user = this.currentUser();
    if (user && this.isAdmin()) {
      this.adminModeEnabled.set(user.adminMode || false);
      console.log('🔧 Admin mode initialized:', user.adminMode);
    }
  }

  /**
   * Initialise le thème depuis localStorage
   */
  private initializeTheme(): void {
    this.isDarkMode.set(this.uiThemeService.getCurrentTheme());
  }

  /**
   * Extrait l'entity-id depuis l'URL et met à jour activeEntityId
   */
  private updateActiveEntityFromUrl(url: string): void {
    const match = url.match(/\/dashboard\/entities\/([^/?]+)/);
    this.activeEntityId.set(match ? match[1] : null);
  }

  private ensurePasswordChangeRoute(url: string): boolean {
    if (this.currentUser()?.isDefaultPassword !== true) {
      return false;
    }

    if (url.startsWith('/dashboard/profile')) {
      return false;
    }

    this.router.navigate(['/dashboard/profile'], { replaceUrl: true });
    return true;
  }

  /**
   * Toggle dark/light mode
   */
  toggleTheme(): void {
    const newTheme = !this.isDarkMode();
    this.isDarkMode.set(newTheme);
    this.uiThemeService.setDarkMode(newTheme);
  }

  /**
   * Toggle admin mode
   */
  toggleAdminMode(): void {
    const user = this.currentUser();
    if (!user || !this.isAdmin()) {
      console.warn('⚠️ Utilisateur non admin ou non connecté');
      return;
    }

    const newAdminMode = !this.adminModeEnabled();
    const userId = parseInt(user.id);

    console.log('🔧 Toggle admin mode:', { userId, newAdminMode });

    this.userService.updateAdminMode(userId, newAdminMode).subscribe({
      next: (updatedUser) => {
        this.adminModeEnabled.set(newAdminMode);
        
        // Mettre à jour l'utilisateur dans localStorage et le subject via la méthode publique
        const currentUser = this.currentUser();
        if (currentUser) {
          const updatedUserData = { ...currentUser, adminMode: newAdminMode };
          this.authService.updateCurrentUser(updatedUserData);
        }
        
        console.log('✅ Mode admin mis à jour:', updatedUser);
        this.notificationService.success(
          'Mode admin',
          `Mode admin ${newAdminMode ? 'activé' : 'désactivé'}`,
          3000
        );
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour du mode admin:', error);
        this.notificationService.error(
          'Erreur',
          'Impossible de mettre à jour le mode admin',
          5000
        );
      }
    });
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
    this.showEntitiesDropdown.update(show => {
      const newState = !show;
      // Persister l'état dans localStorage
      localStorage.setItem('entitiesDropdownOpen', String(newState));
      return newState;
    });
  }

  /**
   * Navigate to specific entity
   */
  navigateToEntity(entityId: string): void {
    this.router.navigate([`/dashboard/entities/${entityId}`]);
    // Ne pas fermer le dropdown - l'utilisateur le fermera manuellement s'il le souhaite
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
      'EMAIL_SMTP_CONFIG_MISSING': 'warning',
      'EMAIL_DELIVERY_FAILED': 'warning',
      'EMAIL_TEMPLATE_VARIABLE_MISSING': 'error',
      'INTERVIEW_SCHEDULED': 'warning',
      'INTERVIEW_DECLINED': 'warning',
      'INTERVIEW_RESCHEDULE_REQUESTED': 'warning',
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
      case 'EMAIL_SMTP_CONFIG_MISSING':
        title = 'SMTP indisponible';
        message = 'Un envoi email est bloque tant qu\'aucune configuration SMTP active n\'est disponible';
        break;
      case 'EMAIL_DELIVERY_FAILED':
        title = 'Echec d\'envoi email';
        message = 'Un envoi email a echoue. Verifiez la configuration SMTP puis relancez l\'action concernee';
        break;
      case 'EMAIL_TEMPLATE_VARIABLE_MISSING':
        title = 'Template email invalide';
        message = 'Un template email contient des variables manquantes ou non resolues';
        break;
      case 'INTERVIEW_DECLINED':
        title = 'Entretien refuse';
        message = 'Un candidat a refuse un entretien';
        break;
      case 'INTERVIEW_RESCHEDULE_REQUESTED':
        title = 'Replanification demandee';
        message = 'Un candidat a demande une replanification d\'entretien';
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
      timestamp: this.parseNotificationTimestamp(dbNotif.createdAt),
      read: dbNotif.isRead,
      link: dbNotif.notifLink
    };
  }

  private parseNotificationTimestamp(value?: string): Date {
    if (!value) {
      return new Date();
    }

    const directDate = new Date(value);
    if (!Number.isNaN(directDate.getTime())) {
      return directDate;
    }

    const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!match) {
      return new Date();
    }

    const [, day, month, year, hours = '0', minutes = '0', seconds = '0'] = match;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds)
    );
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
   * Fermer tous les panneaux (sauf le dropdown des entités qui est persistant)
   */
  closeAllPanels(): void {
    this.showNotifications.set(false);
    this.showUserMenu.set(false);
    // Ne pas fermer le dropdown des entités - il est persistant et géré manuellement
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

  // --- Session expiration timer ---

  private startSessionTimer(): void {
    this.checkSessionExpiration();
    this.sessionTimerId = setInterval(() => this.checkSessionExpiration(), 30_000);
  }

  private checkSessionExpiration(): void {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return;
      const remainingMs = (payload.exp * 1000) - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60_000);
      this.sessionRemainingMinutes.set(remainingMin);
      this.sessionWarningVisible.set(remainingMin > 0 && remainingMin <= 5);
    } catch {
      // Token invalide, l'intercepteur gère la redirection
    }
  }

  dismissSessionWarning(): void {
    this.sessionWarningVisible.set(false);
  }

  ngOnDestroy(): void {
    if (this.sessionTimerId) {
      clearInterval(this.sessionTimerId);
    }
  }
}
