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
        loadComponent: () => import('./pages/dashboard/entities/users/entities-users').then(m => m.EntitiesUsersComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/departments', 
        loadComponent: () => import('./pages/dashboard/entities/departments/entities-departments').then(m => m.EntitiesDepartmentsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/specialities', 
        loadComponent: () => import('./pages/dashboard/entities/specialities/entities-specialities').then(m => m.EntitiesSpecialitiesComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/questions', 
        loadComponent: () => import('./pages/dashboard/entities/questions/entities-questions').then(m => m.EntitiesQuestionsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/answers', 
        loadComponent: () => import('./pages/dashboard/entities/answers/entities-answers').then(m => m.EntitiesAnswersComponent),
        canActivate: [superRoleGuard]
      },
      {
        path: 'entities/campaigns',
        loadComponent: () => import('./pages/dashboard/entities/campaigns/entities-campaigns/entities-campaigns').then(m => m.EntitiesCampaignsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'users', 
        loadComponent: () => import('./pages/dashboard/users/users').then(m => m.UsersComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'departments', 
        loadComponent: () => import('./pages/dashboard/departments/departments').then(m => m.DepartmentsComponent)
      },
      { 
        path: 'interviews', 
        loadComponent: () => import('./pages/dashboard/interviews/interviews').then(m => m.InterviewsComponent)
      },
      { 
        path: 'applications', 
        loadComponent: () => import('./pages/dashboard/applications/applications').then(m => m.ApplicationsComponent)
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./pages/dashboard/profile/profile').then(m => m.ProfileComponent)
      }
    ]
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];
