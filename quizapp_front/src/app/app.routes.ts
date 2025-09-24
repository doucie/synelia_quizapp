import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { superRoleGuard } from './core/guards/role.guard';

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
        path: 'entities/users', 
        loadComponent: () => import('./pages/dashboard/entities/solo/users/entities-users').then(m => m.EntitiesUsersComponent),
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
    path: '**', 
    redirectTo: '' 
  }
];
