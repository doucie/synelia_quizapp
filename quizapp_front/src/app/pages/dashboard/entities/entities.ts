import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';
import { AuthService } from '../../../core/services/auth/auth.service';
import { DashboardStatsService } from '../../../core/services/dashboard-stats.service';

interface EntityInfo {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  iconType: 'svg' | 'class'; // Pour différencier les types d'icônes
  route: string;
  count?: number;
  color?: string; // Couleur thématique pour chaque entité
}

@Component({
  selector: 'app-entities',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  templateUrl: './entities.html',
  styleUrls: ['./entities.scss']
})
export class EntitiesComponent implements OnInit {

  // État réactif
  loading = signal(false);
  searchTerm = signal('');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private statsService: DashboardStatsService
  ) {}

  // Liste des entités disponibles dans la base de données
  entities: EntityInfo[] = [
    {
      name: 'users',
      displayName: 'Utilisateurs',
      description: 'Gestion des utilisateurs du système (admins, recruteurs, etc.)',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/users',
      color: '#3B82F6'
    },
    {
      name: 'applications',
      displayName: 'Candidatures',
      description: 'Candidatures soumises par les candidats',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/applications',
      color: '#8B5CF6'
    },
    {
      name: 'interviews',
      displayName: 'Entretiens',
      description: 'Planification et gestion des entretiens',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 7a1 1 0 00-1-1h-8a1 1 0 00-1 1v6a1 1 0 001 1h8a1 1 0 001-1V7zM10 15a1 1 0 00-1 1v2a1 1 0 001 1h8a1 1 0 001-1v-2a1 1 0 00-1-1h-8zM6 7a1 1 0 00-2 0v10a1 1 0 002 0V7z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/interviews',
      color: '#F59E0B'
    },
    {
      name: 'evaluations',
      displayName: 'Évaluations',
      description: 'Résultats et évaluations des candidats',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/evaluations',
      color: '#06B6D4'
    },
    {
      name: 'campaigns',
      displayName: 'Campagnes',
      description: 'Campagnes de recrutement actives',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v2a1 1 0 01-1 1h-1v11a2 2 0 01-2 2H6a2 2 0 01-2-2V8H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 3v1h6V3H9zm2 8v6a1 1 0 102 0v-6a1 1 0 10-2 0z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/campaigns',
      color: '#EF4444'
    },
    {
      name: 'questions',
      displayName: 'Questions',
      description: 'Banque de questions pour les quiz et entretiens',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/questions',
      color: '#84CC16'
    },
    {
      name: 'answers',
      displayName: 'Réponses',
      description: 'Réponses associées aux questions',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/answers',
      color: '#10B981'
    },
    {
      name: 'departments',
      displayName: 'Départements',
      description: 'Départements et divisions de l\'entreprise',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/departments',
      color: '#6366F1'
    },
    {
      name: 'specialities',
      displayName: 'Spécialités',
      description: 'Domaines de spécialisation et compétences',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/specialities',
      color: '#F97316'
    },
    {
      name: 'tokens',
      displayName: 'Tokens Source',
      description: 'Tokens de sécurité et d\'accès',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 16.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1v-5.257c0-.245.097-.48.269-.652l5.515-5.515A6 6 0 0115 7z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/source-tokens',
      color: '#64748B'
    },
    {
      name: 'candidate-answers',
      displayName: 'Réponses Candidat',
      description: 'Réponses sélectionnées par les candidats',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/candidate-answers',
      color: '#059669'
    },
    {
      name: 'candidate-ask',
      displayName: 'Demandes Candidat',
      description: 'Demandes de modification des candidats',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/candidate-ask',
      color: '#7C3AED'
    },
    {
      name: 'candidate-interview',
      displayName: 'Entretiens Candidat',
      description: 'Planification des entretiens candidats',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/candidate-interview',
      color: '#D97706'
    },
    {
      name: 'candidate-token',
      displayName: 'Tokens Candidat',
      description: 'Tokens d\'accès des candidats aux quiz',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/candidate-token',
      color: '#475569'
    },
    {
      name: 'interview-participant',
      displayName: 'Participants Entretien',
      description: 'Participants aux entretiens (présence, statut)',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/interview-participant',
      color: '#0891B2'
    },
    {
      name: 'decisions',
      displayName: 'Décisions',
      description: 'Décisions prises sur les candidatures',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/decisions',
      color: '#BE185D'
    },
    {
      name: 'notifications',
      displayName: 'Notifications',
      description: 'Système de notifications et alertes',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/notifications',
      color: '#EC4899'
    },
    {
      name: 'forms',
      displayName: 'Formulaires',
      description: 'Formulaires associés aux campagnes',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6zm2-6h8v2H8v-2zm0-4h8v2H8v-2z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/forms',
      color: '#0D9488'
    },
    {
      name: 'form-versions',
      displayName: 'Versions Formulaire',
      description: 'Versions et historique des formulaires',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/form-versions',
      color: '#7C3AED'
    },
    {
      name: 'form-questions',
      displayName: 'Questions Formulaire',
      description: 'Association des questions aux versions de formulaire',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/form-questions',
      color: '#2563EB'
    },
    {
      name: 'pipeline-templates',
      displayName: 'Templates Pipeline',
      description: 'Modèles de pipeline de recrutement définissant les étapes',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/pipeline-templates',
      color: '#0EA5E9'
    },
    {
      name: 'pipeline-stages',
      displayName: 'Étapes Pipeline',
      description: 'Étapes composant les templates de pipeline de recrutement',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 14H8v-2h5v2zm3-4H8v-2h8v2zm0-4H8V6h5v4h4v2z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/pipeline-stages',
      color: '#14B8A6'
    },
    {
      name: 'application-progress',
      displayName: 'Progressions',
      description: 'Suivi de la progression des candidatures dans le pipeline',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/application-progress',
      color: '#A855F7'
    },
    {
      name: 'business-groups',
      displayName: 'Groupes Métier',
      description: 'Groupes métier pour l\'organisation des équipes',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/business-groups',
      color: '#0284C7'
    },
    {
      name: 'system-role-permissions',
      displayName: 'Permissions Rôles',
      description: 'Permissions associées aux rôles système',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/system-role-permissions',
      color: '#B91C1C'
    },
    {
      name: 'user-permission-overrides',
      displayName: 'Permissions Utilisateur',
      description: 'Surcharges de permissions spécifiques par utilisateur',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/><path d="M20 10h-2v3h-3v2h3v3h2v-3h3v-2h-3z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/user-permission-overrides',
      color: '#7E22CE'
    },
    {
      name: 'entity-permissions',
      displayName: 'Permissions Entité',
      description: 'Permissions au niveau des entités individuelles',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/entity-permissions',
      color: '#4338CA'
    },
    {
      name: 'email-templates',
      displayName: 'Modèles Email',
      description: 'Templates de mails pour les notifications automatiques',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/email-templates',
      color: '#EA580C'
    },
    {
      name: 'mail-log',
      displayName: 'Journal Emails',
      description: 'Historique des envois, erreurs et statuts des emails sortants',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h6v-2H4V8l8 5 8-5v4h2V6c0-1.1-.9-2-2-2zm0 2-8 5-8-5V6l8 5 8-5v0z"/><path d="M17 14v-2l-4 3 4 3v-2h3v-2h-3z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/mail-log',
      color: '#0F766E'
    },
    {
      name: 'smtp-config',
      displayName: 'Configurations SMTP',
      description: 'Configuration des serveurs d\'envoi d\'emails',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/smtp-config',
      color: '#0369A1'
    },
    {
      name: 'app-config',
      displayName: 'Configurations App',
      description: 'Paramètres de configuration de l\'application',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/app-config',
      color: '#525252'
    },
    {
      name: 'legal-texts',
      displayName: 'Textes Légaux',
      description: 'Textes juridiques et conditions d\'utilisation',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/legal-texts',
      color: '#78716C'
    },
    {
      name: 'invitation-codes',
      displayName: 'Codes d\'Invitation',
      description: 'Codes d\'invitation pour l\'inscription des utilisateurs',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.11-.31.18-.65.18-1a3 3 0 00-3-3c-1.05 0-1.95.56-2.47 1.37L12 4l-.53-.63C10.95 2.56 10.05 2 9 2a3 3 0 00-3 3c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/invitation-codes',
      color: '#D946EF'
    },
    {
      name: 'user-business-groups',
      displayName: 'Utilisateurs-Groupes',
      description: 'Associations entre utilisateurs et groupes métier',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/user-business-groups',
      color: '#0D9488'
    },
    {
      name: 'business-group-permissions',
      displayName: 'Permissions Groupes',
      description: 'Permissions associées aux groupes métier',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/business-group-permissions',
      color: '#065F46'
    },
    {
      name: 'email-verification-tokens',
      displayName: 'Tokens Vérification',
      description: 'Tokens de vérification d\'email des utilisateurs',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/email-verification-tokens',
      color: '#15803D'
    }
  ];

  // Entités filtrées basées sur la recherche
  filteredEntities = computed(() => {
    const search = this.searchTerm().toLowerCase();
    if (!search) return this.entities;
    
    return this.entities.filter(entity => 
      entity.displayName.toLowerCase().includes(search) ||
      entity.description.toLowerCase().includes(search)
    );
  });

  ngOnInit(): void {
    this.loadEntityCounts();
    
    // Navigation par fragments supprimée - utilisation directe des routes
  }

  /**
   * Charge le nombre d'enregistrements pour chaque entité via un seul appel API
   */
  private loadEntityCounts(): void {
    this.loading.set(true);

    this.statsService.getCounts().subscribe({
      next: (counts) => {
        this.entities.forEach(entity => {
          if (counts[entity.name] !== undefined) {
            entity.count = counts[entity.name] || 0;
          }
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  /**
   * Gère la navigation basée sur le fragment de l'URL
   */
  private handleFragmentNavigation(fragment: string): void {
    console.log('🔗 Fragment détecté:', fragment);
    
    const currentUser = this.authService.getCurrentUser();
    const userRole = currentUser?.role || '';
    
    // Vérifier les permissions spécifiques selon le fragment
    switch (fragment) {
      case 'users':
        if (userRole === 'super') {
          console.log('✅ Redirection vers /dashboard/entities/users (rôle super autorisé)');
          this.router.navigate(['/dashboard/entities/users']);
        } else {
          console.log('❌ Accès refusé à /dashboard/entities/users (rôle insuffisant)');
          this.router.navigate(['/dashboard'], {
            queryParams: {
              error: 'access_denied',
              message: 'Accès réservé aux super administrateurs.'
            }
          });
        }
        break;
        
      case 'departments':
      case 'specialities':
      case 'questions':
      case 'answers':
        if (userRole === 'super' || userRole === 'admin') {
          console.log(`✅ Redirection vers /dashboard/${fragment}`);
          this.router.navigate([`/dashboard/${fragment}`]);
        } else {
          console.log(`❌ Accès refusé à /dashboard/${fragment}`);
          this.router.navigate(['/dashboard'], {
            queryParams: {
              error: 'access_denied',
              message: 'Accès réservé aux administrateurs.'
            }
          });
        }
        break;
        
      case 'campaigns':
      case 'candidates':
      case 'interviews':
      case 'evaluations':
        if (userRole === 'super' || userRole === 'admin' || userRole === 'recruiter') {
          console.log(`✅ Redirection vers /dashboard/${fragment}`);
          this.router.navigate([`/dashboard/${fragment}`]);
        } else {
          console.log(`❌ Accès refusé à /dashboard/${fragment}`);
          this.router.navigate(['/dashboard'], {
            queryParams: {
              error: 'access_denied',
              message: 'Accès insuffisant pour cette fonctionnalité.'
            }
          });
        }
        break;

      case 'applications':
        if (userRole === 'super' || userRole === 'admin' || userRole === 'recruiter') {
          console.log('✅ Redirection vers /dashboard/candidates (alias applications)');
          this.router.navigate(['/dashboard/candidates']);
        } else {
          console.log('❌ Accès refusé à /dashboard/candidates');
          this.router.navigate(['/dashboard'], {
            queryParams: {
              error: 'access_denied',
              message: 'Accès insuffisant pour cette fonctionnalité.'
            }
          });
        }
        break;
        
      default:
        console.log('⚠️ Fragment non reconnu:', fragment);
        break;
    }
  }

  /**
   * Met à jour le terme de recherche
   */
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  /**
   * Navigue vers la page de gestion de l'entité
   */
  navigateToEntity(entity: EntityInfo): void {
    console.log('Navigation vers:', entity.name, entity.route);
    
    const currentUser = this.authService.getCurrentUser();
    const userRole = currentUser?.role || '';
    
    // Vérifier les permissions spécifiques selon l'entité
    if (entity.name === 'users') {
      if (userRole === 'super') {
        console.log('✅ Redirection vers', entity.route, '(rôle super autorisé)');
        this.router.navigate([entity.route]);
      } else {
        console.log('❌ Accès refusé à', entity.route, '(rôle insuffisant)');
        this.router.navigate(['/dashboard'], {
          queryParams: {
            error: 'access_denied',
            message: 'Accès réservé aux super administrateurs.'
          }
        });
      }
    } else {
      // Pour les autres entités, navigation directe (on peut ajouter des vérifications plus tard)
      this.router.navigate([entity.route]);
    }
  }

  /**
   * Calcule le nombre total d'enregistrements
   */
  getTotalRecords(): number {
    return this.entities.reduce((total, entity) => total + (entity.count || 0), 0);
  }
}
