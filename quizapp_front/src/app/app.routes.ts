import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { superRoleGuard, recruiterRoleGuard } from './core/guards/role.guard';
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
        path: 'merise', 
        loadComponent: () => import('./pages/dashboard/merise/merise').then(m => m.MeriseComponent),
        canActivate: [superRoleGuard]
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
        path: 'entities/answers/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/answers/entities-answers').then(m => m.EntitiesAnswersComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/answers', 
        loadComponent: () => import('./pages/dashboard/entities/solo/answers/entities-answers').then(m => m.EntitiesAnswersComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/applications/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/applications/entities-applications').then(m => m.EntitiesApplicationsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/applications', 
        loadComponent: () => import('./pages/dashboard/entities/solo/applications/entities-applications').then(m => m.EntitiesApplicationsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/interviews/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/interviews/entities-interviews').then(m => m.EntitiesInterviewsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/interviews', 
        loadComponent: () => import('./pages/dashboard/entities/solo/interviews/entities-interviews').then(m => m.EntitiesInterviewsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/source-tokens/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/source-tokens/entities-source-tokens').then(m => m.EntitiesSourceTokensComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/source-tokens', 
        loadComponent: () => import('./pages/dashboard/entities/solo/source-tokens/entities-source-tokens').then(m => m.EntitiesSourceTokensComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/evaluations/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/evaluations/entities-evaluations').then(m => m.EntitiesEvaluationsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/evaluations', 
        loadComponent: () => import('./pages/dashboard/entities/solo/evaluations/entities-evaluations').then(m => m.EntitiesEvaluationsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/campaign-crud/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/campaign-crud/entities-campaign-crud').then(m => m.EntitiesCampaignCrudComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/campaign-crud', 
        loadComponent: () => import('./pages/dashboard/entities/solo/campaign-crud/entities-campaign-crud').then(m => m.EntitiesCampaignCrudComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/campaign-questions/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/campaign-questions/entities-campaign-questions').then(m => m.EntitiesCampaignQuestionsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/campaign-questions', 
        loadComponent: () => import('./pages/dashboard/entities/solo/campaign-questions/entities-campaign-questions').then(m => m.EntitiesCampaignQuestionsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/candidate-answers/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/candidate-answers/entities-candidate-answers').then(m => m.EntitiesCandidateAnswersComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/candidate-answers', 
        loadComponent: () => import('./pages/dashboard/entities/solo/candidate-answers/entities-candidate-answers').then(m => m.EntitiesCandidateAnswersComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/candidate-ask/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/candidate-ask/entities-candidate-ask').then(m => m.EntitiesCandidateAskComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/candidate-ask', 
        loadComponent: () => import('./pages/dashboard/entities/solo/candidate-ask/entities-candidate-ask').then(m => m.EntitiesCandidateAskComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/candidate-interview/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/candidate-interview/entities-candidate-interview').then(m => m.EntitiesCandidateInterviewComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/candidate-interview', 
        loadComponent: () => import('./pages/dashboard/entities/solo/candidate-interview/entities-candidate-interview').then(m => m.EntitiesCandidateInterviewComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/candidate-token/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/candidate-token/entities-candidate-token').then(m => m.EntitiesCandidateTokenComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/candidate-token', 
        loadComponent: () => import('./pages/dashboard/entities/solo/candidate-token/entities-candidate-token').then(m => m.EntitiesCandidateTokenComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/interview-crud/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/interview-crud/entities-interview-crud').then(m => m.EntitiesInterviewCrudComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/interview-crud', 
        loadComponent: () => import('./pages/dashboard/entities/solo/interview-crud/entities-interview-crud').then(m => m.EntitiesInterviewCrudComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/decisions/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/decisions/entities-decisions').then(m => m.EntitiesDecisionsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/decisions', 
        loadComponent: () => import('./pages/dashboard/entities/solo/decisions/entities-decisions').then(m => m.EntitiesDecisionsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/notifications/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/notifications/entities-notifications').then(m => m.EntitiesNotificationsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/notifications', 
        loadComponent: () => import('./pages/dashboard/entities/solo/notifications/entities-notifications').then(m => m.EntitiesNotificationsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/forms/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/forms/entities-forms').then(m => m.EntitiesFormsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/forms', 
        loadComponent: () => import('./pages/dashboard/entities/solo/forms/entities-forms').then(m => m.EntitiesFormsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/form-versions/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/form-versions/entities-form-versions').then(m => m.EntitiesFormVersionsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/form-versions', 
        loadComponent: () => import('./pages/dashboard/entities/solo/form-versions/entities-form-versions').then(m => m.EntitiesFormVersionsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/form-questions/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/form-questions/entities-form-questions').then(m => m.EntitiesFormQuestionsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'entities/form-questions', 
        loadComponent: () => import('./pages/dashboard/entities/solo/form-questions/entities-form-questions').then(m => m.EntitiesFormQuestionsComponent),
        canActivate: [superRoleGuard]
      },
      { 
        path: 'users', 
        loadComponent: () => import('./pages/dashboard/users/users').then(m => m.UsersComponent),
        canActivate: [recruiterRoleGuard]
      },
      { 
        path: 'campaigns', 
        loadComponent: () => import('./pages/dashboard/campaigns/campaigns').then(m => m.CampaignsComponent),
        canActivate: [recruiterRoleGuard]
      },
      { 
        path: 'campaigns/new', 
        loadComponent: () => import('./pages/dashboard/campaign-form/campaign-form').then(m => m.CampaignFormComponent),
        canActivate: [recruiterRoleGuard]
      },
      { 
        path: 'campaigns/:id/edit', 
        loadComponent: () => import('./pages/dashboard/campaign-form/campaign-form').then(m => m.CampaignFormComponent),
        canActivate: [recruiterRoleGuard]
      },
      { 
        path: 'campaigns/:id', 
        loadComponent: () => import('./pages/dashboard/campaign-detail/campaign-detail').then(m => m.CampaignDetailComponent),
        canActivate: [recruiterRoleGuard]
      },
      { 
        path: 'candidates', 
        loadComponent: () => import('./pages/dashboard/applications/applications').then(m => m.ApplicationsComponent),
        canActivate: [recruiterRoleGuard]
      },
      { 
        path: 'decisions', 
        loadComponent: () => import('./pages/dashboard/decisions/decisions').then(m => m.DecisionsComponent),
        canActivate: [recruiterRoleGuard]
      },
      { 
        path: 'interviews', 
        loadComponent: () => import('./pages/dashboard/interviews/interviews').then(m => m.InterviewsComponent),
        canActivate: [recruiterRoleGuard]
      },
      { 
        path: 'interviews/create', 
        loadComponent: () => import('./pages/dashboard/interview-create/interview-create').then(m => m.InterviewCreateComponent),
        canActivate: [recruiterRoleGuard]
      },
      { 
        path: 'evaluations', 
        loadComponent: () => import('./pages/dashboard/evaluations-list/evaluations-list').then(m => m.EvaluationsListComponent),
        canActivate: [recruiterRoleGuard]
      }
      // Note: L'évaluation en mode plein écran est sur /dashboard/evaluate/:link
    ]
  },
  {
    // Route pour l'évaluation - Plein écran sans header/sidebar
    path: 'dashboard/evaluate',
    loadComponent: () => import('./pages/dashboard/evaluations/evaluations').then(m => m.EvaluationsComponent),
    canActivate: [authGuard, recruiterRoleGuard]
  },
  {
    // Route pour l'évaluation avec lien - Plein écran sans header/sidebar
    path: 'dashboard/evaluate/:link',
    loadComponent: () => import('./pages/dashboard/evaluations/evaluations').then(m => m.EvaluationsComponent),
    canActivate: [authGuard, recruiterRoleGuard]
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
    loadComponent: () => import('./pages/verify-email/verify-email').then(m => m.VerifyEmailComponent)
  },
  {
    // Route pour passer le quiz avec sécurité token
    path: 'quiz/:applicationId/:quizToken',
    loadComponent: () => import('./pages/quiz/quiz').then(m => m.QuizComponent)
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];
