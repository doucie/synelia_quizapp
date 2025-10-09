import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { superRoleGuard } from './core/guards/role.guard';
import { sourceTokenGuard } from './core/guards/source-token.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  { 
    path: 'home', 
    redirectTo: '', 
    pathMatch: 'full' 
  },
  {
    path: 'suivre-candidature',
    loadComponent: () => import('./pages/track-application/track-application').then(m => m.TrackApplicationComponent)
  },
  {
    path: 'connexion',
    loadComponent: () => import('./pages/connexion').then(m => m.ConnexionComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'inscription',
    loadComponent: () => import('./pages/inscription').then(m => m.InscriptionComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'mot-de-passe-oublie',
    loadComponent: () => import('./pages/mot-de-passe-oublie').then(m => m.MotDePasseOublieComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { 
        path: 'overview', 
        loadComponent: () => import('./pages/dashboard/overview/overview').then(m => m.OverviewComponent)
      },
      { 
        path: 'entities', 
        loadComponent: () => import('./pages/dashboard/entities/entities').then(m => m.EntitiesComponent)
      },
      { 
        path: 'entities/campaigns/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/campaigns/entities-campaigns').then(m => m.EntitiesCampaignsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/campaigns', 
        loadComponent: () => import('./pages/dashboard/entities/solo/campaigns/entities-campaigns').then(m => m.EntitiesCampaignsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/users/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/users/entities-users').then(m => m.EntitiesUsersComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/users', 
        loadComponent: () => import('./pages/dashboard/entities/solo/users/entities-users').then(m => m.EntitiesUsersComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/departments/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/departments/entities-departments').then(m => m.EntitiesDepartmentsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/departments', 
        loadComponent: () => import('./pages/dashboard/entities/solo/departments/entities-departments').then(m => m.EntitiesDepartmentsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/specialities/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/specialities/entities-specialities').then(m => m.EntitiesSpecialitiesComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/specialities', 
        loadComponent: () => import('./pages/dashboard/entities/solo/specialities/entities-specialities').then(m => m.EntitiesSpecialitiesComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/questions/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/questions/entities-questions').then(m => m.EntitiesQuestionsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/questions', 
        loadComponent: () => import('./pages/dashboard/entities/solo/questions/entities-questions').then(m => m.EntitiesQuestionsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'users', 
        loadComponent: () => import('./pages/dashboard/users/users').then(m => m.UsersComponent),
        canActivate: [superRoleGuard]
      }
    ]
  },
  {
    // Route pour postuler avec un source token
    path: 'postuler/:sourceToken',
    loadComponent: () => import('./pages/apply-position').then(m => m.ApplyPositionComponent),
    canActivate: [sourceTokenGuard]
  },
  {
    // Route pour vérifier l'email avec un token
    path: 'verify-email/:token',
    loadComponent: () => import('./pages/verify-email').then(m => m.VerifyEmailComponent)
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];
