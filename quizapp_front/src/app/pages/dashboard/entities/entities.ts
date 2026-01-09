import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../../core/services/auth/auth.service';

interface EntityInfo {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  iconType: 'svg' | 'class'; // Pour différencier les types d'icônes
  route: string;
  count?: number;
  color?: string; // Couleur thématique pour chaque entité
  safeIcon?: SafeHtml; // HTML sécurisé pour l'affichage
}

@Component({
  selector: 'app-entities',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './entities.html',
  styleUrls: ['./entities.scss']
})
export class EntitiesComponent implements OnInit {

  // État réactif
  loading = signal(false);
  searchTerm = signal('');

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
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
      name: 'candidates',
      displayName: 'Candidats',
      description: 'Profils des candidats et leurs informations',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6L9 17l-5-5"/></svg>',
      iconType: 'svg',
      route: '/dashboard/candidates',
      color: '#10B981'
    },
    {
      name: 'applications',
      displayName: 'Candidatures',
      description: 'Candidatures soumises par les candidats',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/applications',
      color: '#8B5CF6'
    },
    {
      name: 'interviews',
      displayName: 'Entretiens',
      description: 'Planification et gestion des entretiens',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 7a1 1 0 00-1-1h-8a1 1 0 00-1 1v6a1 1 0 001 1h8a1 1 0 001-1V7zM10 15a1 1 0 00-1 1v2a1 1 0 001 1h8a1 1 0 001-1v-2a1 1 0 00-1-1h-8zM6 7a1 1 0 00-2 0v10a1 1 0 002 0V7z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/interviews',
      color: '#F59E0B'
    },
    {
      name: 'evaluations',
      displayName: 'Evaluations',
      description: 'Resultats et evaluations des candidats',
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
      route: '/dashboard/campaigns',
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
      name: 'notifications',
      displayName: 'Notifications',
      description: 'Système de notifications et alertes',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>',
      iconType: 'svg',
      route: '/dashboard/notifications',
      color: '#EC4899'
    },
    {
      name: 'tokens',
      displayName: 'Jetons',
      description: 'Tokens de securite et d\'acces',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 16.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1v-5.257c0-.245.097-.48.269-.652l5.515-5.515A6 6 0 0115 7z"/></svg>',
      iconType: 'svg',
      route: '/dashboard/entities/source-tokens',
      color: '#64748B'
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
    // Convertir les icônes SVG en HTML sécurisé
    this.entities = this.entities.map(entity => ({
      ...entity,
      safeIcon: this.sanitizer.bypassSecurityTrustHtml(entity.icon)
    }));
    
    this.loadEntityCounts();
    
    // Navigation par fragments supprimée - utilisation directe des routes
  }

  /**
   * Charge le nombre d'enregistrements pour chaque entité
   */
  private async loadEntityCounts(): Promise<void> {
    this.loading.set(true);
    
    try {
      // TODO: Implémenter l'appel API pour récupérer les compteurs
      // Pour l'instant, on simule des données
      setTimeout(() => {
        this.entities.forEach(entity => {
          entity.count = Math.floor(Math.random() * 100) + 1;
        });
        this.loading.set(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors du chargement des compteurs:', error);
      this.loading.set(false);
    }
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
      case 'applications':
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
