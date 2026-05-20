import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { permissionGuard, campaignEditGuard, campaignViewGuard, interviewCreateGuard } from './core/guards/role.guard';
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
    path: 'campagnes',
    loadComponent: () => import('./pages/campaigns/campaigns').then(m => m.CampaignsComponent)
  },
  {
    path: 'campaigns',
    redirectTo: 'campagnes',
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
        path: 'departments',
        loadComponent: () => import('./pages/dashboard/departments/departments').then(m => m.DepartmentsComponent)
      },
      {
        path: 'specialities',
        loadComponent: () => import('./pages/dashboard/specialities/specialities').then(m => m.SpecialitiesComponent)
      },
      {
        path: 'questions',
        loadComponent: () => import('./pages/dashboard/questions/questions').then(m => m.QuestionsComponent)
      },
      {
        path: 'answers',
        loadComponent: () => import('./pages/dashboard/answers/answers').then(m => m.AnswersComponent)
      },
      { 
        path: 'overview', 
        loadComponent: () => import('./pages/dashboard/overview/overview').then(m => m.OverviewComponent)
      },
      { 
        path: 'entities', 
          loadComponent: () => import('./pages/dashboard/entities/entities').then(m => m.EntitiesComponent),
          canActivate: [permissionGuard(['VIEW_APP_CONFIG'])]
      },
      { 
        path: 'merise', 
        loadComponent: () => import('./pages/dashboard/merise/merise').then(m => m.MeriseComponent),
          canActivate: [permissionGuard(['VIEW_APP_CONFIG'])]
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./pages/dashboard/profile/profile').then(m => m.ProfileComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/dashboard/settings/settings').then(m => m.SettingsComponent)
      },
      { 
        path: 'entities/campaigns/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/campaigns/entities-campaigns').then(m => m.EntitiesCampaignsComponent),
        canActivate: [permissionGuard(['VIEW_CAMPAIGNS'])]
      },
      { 
        path: 'entities/campaigns', 
        loadComponent: () => import('./pages/dashboard/entities/solo/campaigns/entities-campaigns').then(m => m.EntitiesCampaignsComponent),
        canActivate: [permissionGuard(['VIEW_CAMPAIGNS'])]
      },
      { 
        path: 'entities/users/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/users/entities-users').then(m => m.EntitiesUsersComponent),
        canActivate: [permissionGuard(['VIEW_USER'])]
      },
      { 
        path: 'entities/users', 
        loadComponent: () => import('./pages/dashboard/entities/solo/users/entities-users').then(m => m.EntitiesUsersComponent),
        canActivate: [permissionGuard(['VIEW_USER'])]
      },
      { 
        path: 'entities/departments/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/departments/entities-departments').then(m => m.EntitiesDepartmentsComponent),
        canActivate: [permissionGuard(['VIEW_DEPARTMENTS'])]
      },
      { 
        path: 'entities/departments', 
        loadComponent: () => import('./pages/dashboard/entities/solo/departments/entities-departments').then(m => m.EntitiesDepartmentsComponent),
        canActivate: [permissionGuard(['VIEW_DEPARTMENTS'])]
      },
      { 
        path: 'entities/specialities/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/specialities/entities-specialities').then(m => m.EntitiesSpecialitiesComponent),
        canActivate: [permissionGuard(['VIEW_SPECIALITIES'])]
      },
      { 
        path: 'entities/specialities', 
        loadComponent: () => import('./pages/dashboard/entities/solo/specialities/entities-specialities').then(m => m.EntitiesSpecialitiesComponent),
        canActivate: [permissionGuard(['VIEW_SPECIALITIES'])]
      },
      { 
        path: 'entities/questions/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/questions/entities-questions').then(m => m.EntitiesQuestionsComponent),
        canActivate: [permissionGuard(['VIEW_QUESTION'])]
      },
      { 
        path: 'entities/questions', 
        loadComponent: () => import('./pages/dashboard/entities/solo/questions/entities-questions').then(m => m.EntitiesQuestionsComponent),
        canActivate: [permissionGuard(['VIEW_QUESTION'])]
      },
      { 
        path: 'entities/answers/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/answers/entities-answers').then(m => m.EntitiesAnswersComponent),
        canActivate: [permissionGuard(['VIEW_ANSWER'])]
      },
      { 
        path: 'entities/answers', 
        loadComponent: () => import('./pages/dashboard/entities/solo/answers/entities-answers').then(m => m.EntitiesAnswersComponent),
        canActivate: [permissionGuard(['VIEW_ANSWER'])]
      },
      { 
        path: 'entities/applications/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/applications/entities-applications').then(m => m.EntitiesApplicationsComponent),
        canActivate: [permissionGuard(['VIEW_APPLICATIONS'])]
      },
      { 
        path: 'entities/applications', 
        loadComponent: () => import('./pages/dashboard/entities/solo/applications/entities-applications').then(m => m.EntitiesApplicationsComponent),
        canActivate: [permissionGuard(['VIEW_APPLICATIONS'])]
      },
      { 
        path: 'entities/interviews/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/interviews/entities-interviews').then(m => m.EntitiesInterviewsComponent),
        canActivate: [permissionGuard(['VIEW_INTERVIEWS'])]
      },
      { 
        path: 'entities/interviews', 
        loadComponent: () => import('./pages/dashboard/entities/solo/interviews/entities-interviews').then(m => m.EntitiesInterviewsComponent),
        canActivate: [permissionGuard(['VIEW_INTERVIEWS'])]
      },
      { 
        path: 'entities/source-tokens/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/source-tokens/entities-source-tokens').then(m => m.EntitiesSourceTokensComponent),
        canActivate: [permissionGuard(['VIEW_SOURCE_TOKEN'])]
      },
      { 
        path: 'entities/source-tokens', 
        loadComponent: () => import('./pages/dashboard/entities/solo/source-tokens/entities-source-tokens').then(m => m.EntitiesSourceTokensComponent),
        canActivate: [permissionGuard(['VIEW_SOURCE_TOKEN'])]
      },
      { 
        path: 'entities/evaluations/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/evaluations/entities-evaluations').then(m => m.EntitiesEvaluationsComponent),
        canActivate: [permissionGuard(['VIEW_EVALUATIONS'])]
      },
      { 
        path: 'entities/evaluations', 
        loadComponent: () => import('./pages/dashboard/entities/solo/evaluations/entities-evaluations').then(m => m.EntitiesEvaluationsComponent),
        canActivate: [permissionGuard(['VIEW_EVALUATIONS'])]
      },
      { 
        path: 'entities/candidate-answers/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/candidate-answers/entities-candidate-answers').then(m => m.EntitiesCandidateAnswersComponent),
        canActivate: [permissionGuard(['VIEW_CANDIDATE_ANSWER'])]
      },
      { 
        path: 'entities/candidate-answers', 
        loadComponent: () => import('./pages/dashboard/entities/solo/candidate-answers/entities-candidate-answers').then(m => m.EntitiesCandidateAnswersComponent),
        canActivate: [permissionGuard(['VIEW_CANDIDATE_ANSWER'])]
      },
      { 
        path: 'entities/candidate-ask/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/candidate-ask/entities-candidate-ask').then(m => m.EntitiesCandidateAskComponent),
        canActivate: [permissionGuard(['VIEW_CANDIDATE_ASK'])]
      },
      { 
        path: 'entities/candidate-ask', 
        loadComponent: () => import('./pages/dashboard/entities/solo/candidate-ask/entities-candidate-ask').then(m => m.EntitiesCandidateAskComponent),
        canActivate: [permissionGuard(['VIEW_CANDIDATE_ASK'])]
      },
      { 
        path: 'entities/candidate-interview/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/candidate-interview/entities-candidate-interview').then(m => m.EntitiesCandidateInterviewComponent),
        canActivate: [permissionGuard(['VIEW_CANDIDATE_INTERVIEW'])]
      },
      { 
        path: 'entities/candidate-interview', 
        loadComponent: () => import('./pages/dashboard/entities/solo/candidate-interview/entities-candidate-interview').then(m => m.EntitiesCandidateInterviewComponent),
        canActivate: [permissionGuard(['VIEW_CANDIDATE_INTERVIEW'])]
      },
      { 
        path: 'entities/candidate-token/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/candidate-token/entities-candidate-token').then(m => m.EntitiesCandidateTokenComponent),
        canActivate: [permissionGuard(['VIEW_CANDIDATE_TOKEN'])]
      },
      { 
        path: 'entities/candidate-token', 
        loadComponent: () => import('./pages/dashboard/entities/solo/candidate-token/entities-candidate-token').then(m => m.EntitiesCandidateTokenComponent),
        canActivate: [permissionGuard(['VIEW_CANDIDATE_TOKEN'])]
      },
      // interview_participant (anciennement interview_crud)
      { 
        path: 'entities/interview-participant/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/interview-participant/entities-interview-participant').then(m => m.EntitiesInterviewParticipantComponent),
        canActivate: [permissionGuard(['VIEW_INTERVIEW_PARTICIPANT'])]
      },
      { 
        path: 'entities/interview-participant', 
        loadComponent: () => import('./pages/dashboard/entities/solo/interview-participant/entities-interview-participant').then(m => m.EntitiesInterviewParticipantComponent),
        canActivate: [permissionGuard(['VIEW_INTERVIEW_PARTICIPANT'])]
      },
      { 
        path: 'entities/decisions/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/decisions/entities-decisions').then(m => m.EntitiesDecisionsComponent),
        canActivate: [permissionGuard(['VIEW_DECISIONS'])]
      },
      { 
        path: 'entities/decisions', 
        loadComponent: () => import('./pages/dashboard/entities/solo/decisions/entities-decisions').then(m => m.EntitiesDecisionsComponent),
        canActivate: [permissionGuard(['VIEW_DECISIONS'])]
      },
      { 
        path: 'entities/notifications/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/notifications/entities-notifications').then(m => m.EntitiesNotificationsComponent),
        canActivate: [permissionGuard(['VIEW_NOTIFICATIONS'])]
      },
      { 
        path: 'entities/notifications', 
        loadComponent: () => import('./pages/dashboard/entities/solo/notifications/entities-notifications').then(m => m.EntitiesNotificationsComponent),
        canActivate: [permissionGuard(['VIEW_NOTIFICATIONS'])]
      },
      { 
        path: 'entities/forms/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/forms/entities-forms').then(m => m.EntitiesFormsComponent),
        canActivate: [permissionGuard(['VIEW_FORM'])]
      },
      { 
        path: 'entities/forms', 
        loadComponent: () => import('./pages/dashboard/entities/solo/forms/entities-forms').then(m => m.EntitiesFormsComponent),
        canActivate: [permissionGuard(['VIEW_FORM'])]
      },
      { 
        path: 'entities/form-versions/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/form-versions/entities-form-versions').then(m => m.EntitiesFormVersionsComponent),
        canActivate: [permissionGuard(['VIEW_FORM_VERSION'])]
      },
      { 
        path: 'entities/form-versions', 
        loadComponent: () => import('./pages/dashboard/entities/solo/form-versions/entities-form-versions').then(m => m.EntitiesFormVersionsComponent),
        canActivate: [permissionGuard(['VIEW_FORM_VERSION'])]
      },
      { 
        path: 'entities/form-questions/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/form-questions/entities-form-questions').then(m => m.EntitiesFormQuestionsComponent),
        canActivate: [permissionGuard(['VIEW_FORM_QUESTIONS'])]
      },
      { 
        path: 'entities/form-questions', 
        loadComponent: () => import('./pages/dashboard/entities/solo/form-questions/entities-form-questions').then(m => m.EntitiesFormQuestionsComponent),
        canActivate: [permissionGuard(['VIEW_FORM_QUESTIONS'])]
      },
      { 
        path: 'entities/pipeline-templates/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/pipeline-templates/entities-pipeline-templates').then(m => m.EntitiesPipelineTemplatesComponent),
        canActivate: [permissionGuard(['VIEW_PIPELINE_TEMPLATE'])]
      },
      { 
        path: 'entities/pipeline-templates', 
        loadComponent: () => import('./pages/dashboard/entities/solo/pipeline-templates/entities-pipeline-templates').then(m => m.EntitiesPipelineTemplatesComponent),
        canActivate: [permissionGuard(['VIEW_PIPELINE_TEMPLATE'])]
      },
      { 
        path: 'entities/pipeline-stages/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/pipeline-stages/entities-pipeline-stages').then(m => m.EntitiesPipelineStagesComponent),
        canActivate: [permissionGuard(['VIEW_PIPELINE_STAGE'])]
      },
      { 
        path: 'entities/pipeline-stages', 
        loadComponent: () => import('./pages/dashboard/entities/solo/pipeline-stages/entities-pipeline-stages').then(m => m.EntitiesPipelineStagesComponent),
        canActivate: [permissionGuard(['VIEW_PIPELINE_STAGE'])]
      },
      { 
        path: 'entities/application-progress/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/application-progress/entities-application-progress').then(m => m.EntitiesApplicationProgressComponent),
        canActivate: [permissionGuard(['VIEW_APPLICATION_PROGRESS'])]
      },
      { 
        path: 'entities/application-progress', 
        loadComponent: () => import('./pages/dashboard/entities/solo/application-progress/entities-application-progress').then(m => m.EntitiesApplicationProgressComponent),
        canActivate: [permissionGuard(['VIEW_APPLICATION_PROGRESS'])]
      },
      { 
        path: 'entities/email-verification-tokens/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/email-verification-tokens/entities-email-verification-tokens').then(m => m.EntitiesEmailVerificationTokensComponent),
        canActivate: [permissionGuard(['VIEW_EMAIL_VERIFICATION_TOKEN'])]
      },
      { 
        path: 'entities/email-verification-tokens', 
        loadComponent: () => import('./pages/dashboard/entities/solo/email-verification-tokens/entities-email-verification-tokens').then(m => m.EntitiesEmailVerificationTokensComponent),
        canActivate: [permissionGuard(['VIEW_EMAIL_VERIFICATION_TOKEN'])]
      },
      { 
        path: 'entities/business-group-permissions/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/business-group-permissions/entities-business-group-permissions').then(m => m.EntitiesBusinessGroupPermissionsComponent),
        canActivate: [permissionGuard(['VIEW_BUSINESS_GROUP_PERMISSION'])]
      },
      { 
        path: 'entities/business-group-permissions', 
        loadComponent: () => import('./pages/dashboard/entities/solo/business-group-permissions/entities-business-group-permissions').then(m => m.EntitiesBusinessGroupPermissionsComponent),
        canActivate: [permissionGuard(['VIEW_BUSINESS_GROUP_PERMISSION'])]
      },
      { 
        path: 'entities/user-business-groups/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/user-business-groups/entities-user-business-groups').then(m => m.EntitiesUserBusinessGroupsComponent),
        canActivate: [permissionGuard(['VIEW_USER_BUSINESS_GROUP'])]
      },
      { 
        path: 'entities/user-business-groups', 
        loadComponent: () => import('./pages/dashboard/entities/solo/user-business-groups/entities-user-business-groups').then(m => m.EntitiesUserBusinessGroupsComponent),
        canActivate: [permissionGuard(['VIEW_USER_BUSINESS_GROUP'])]
      },
      { 
        path: 'entities/email-templates/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/email-templates/entities-email-templates').then(m => m.EntitiesEmailTemplatesComponent),
        canActivate: [permissionGuard(['VIEW_EMAIL_TEMPLATE'])]
      },
      { 
        path: 'entities/email-templates', 
        loadComponent: () => import('./pages/dashboard/entities/solo/email-templates/entities-email-templates').then(m => m.EntitiesEmailTemplatesComponent),
        canActivate: [permissionGuard(['VIEW_EMAIL_TEMPLATE'])]
      },
      {
        path: 'entities/mail-log/:page',
        loadComponent: () => import('./pages/dashboard/entities/solo/mail-log/entities-mail-log').then(m => m.EntitiesMailLogComponent),
        canActivate: [permissionGuard(['VIEW_MAIL_LOG'])]
      },
      {
        path: 'entities/mail-log',
        loadComponent: () => import('./pages/dashboard/entities/solo/mail-log/entities-mail-log').then(m => m.EntitiesMailLogComponent),
        canActivate: [permissionGuard(['VIEW_MAIL_LOG'])]
      },
      { 
        path: 'entities/smtp-config/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/smtp-config/entities-smtp-config').then(m => m.EntitiesSmtpConfigComponent),
        canActivate: [permissionGuard(['VIEW_SMTP_CONFIG'])]
      },
      { 
        path: 'entities/smtp-config', 
        loadComponent: () => import('./pages/dashboard/entities/solo/smtp-config/entities-smtp-config').then(m => m.EntitiesSmtpConfigComponent),
        canActivate: [permissionGuard(['VIEW_SMTP_CONFIG'])]
      },
      { 
        path: 'entities/legal-texts/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/legal-texts/entities-legal-texts').then(m => m.EntitiesLegalTextsComponent),
        canActivate: [permissionGuard(['VIEW_LEGAL_TEXT'])]
      },
      { 
        path: 'entities/legal-texts', 
        loadComponent: () => import('./pages/dashboard/entities/solo/legal-texts/entities-legal-texts').then(m => m.EntitiesLegalTextsComponent),
        canActivate: [permissionGuard(['VIEW_LEGAL_TEXT'])]
      },
      { 
        path: 'entities/app-config/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/app-config/entities-app-config').then(m => m.EntitiesAppConfigComponent),
        canActivate: [permissionGuard(['VIEW_APP_CONFIG'])]
      },
      { 
        path: 'entities/app-config', 
        loadComponent: () => import('./pages/dashboard/entities/solo/app-config/entities-app-config').then(m => m.EntitiesAppConfigComponent),
        canActivate: [permissionGuard(['VIEW_APP_CONFIG'])]
      },
      { 
        path: 'entities/invitation-codes/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/invitation-codes/entities-invitation-codes').then(m => m.EntitiesInvitationCodesComponent),
        canActivate: [permissionGuard(['VIEW_INVITATION_CODE'])]
      },
      { 
        path: 'entities/invitation-codes', 
        loadComponent: () => import('./pages/dashboard/entities/solo/invitation-codes/entities-invitation-codes').then(m => m.EntitiesInvitationCodesComponent),
        canActivate: [permissionGuard(['VIEW_INVITATION_CODE'])]
      },
      { 
        path: 'entities/business-groups/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/business-groups/entities-business-groups').then(m => m.EntitiesBusinessGroupsComponent),
        canActivate: [permissionGuard(['VIEW_BUSINESS_GROUP'])]
      },
      { 
        path: 'entities/business-groups', 
        loadComponent: () => import('./pages/dashboard/entities/solo/business-groups/entities-business-groups').then(m => m.EntitiesBusinessGroupsComponent),
        canActivate: [permissionGuard(['VIEW_BUSINESS_GROUP'])]
      },
      { 
        path: 'entities/system-role-permissions/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/system-role-permissions/entities-system-role-permissions').then(m => m.EntitiesSystemRolePermissionsComponent),
          canActivate: [permissionGuard(['MANAGE_SYSTEM_ROLES'])]
      },
      { 
        path: 'entities/system-role-permissions', 
        loadComponent: () => import('./pages/dashboard/entities/solo/system-role-permissions/entities-system-role-permissions').then(m => m.EntitiesSystemRolePermissionsComponent),
          canActivate: [permissionGuard(['MANAGE_SYSTEM_ROLES'])]
      },
      { 
        path: 'entities/user-permission-overrides/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/user-permission-overrides/entities-user-permission-overrides').then(m => m.EntitiesUserPermissionOverridesComponent),
          canActivate: [permissionGuard(['MANAGE_SYSTEM_ROLES'])]
      },
      { 
        path: 'entities/user-permission-overrides', 
        loadComponent: () => import('./pages/dashboard/entities/solo/user-permission-overrides/entities-user-permission-overrides').then(m => m.EntitiesUserPermissionOverridesComponent),
          canActivate: [permissionGuard(['MANAGE_SYSTEM_ROLES'])]
      },
      { 
        path: 'entities/entity-permissions/:page', 
        loadComponent: () => import('./pages/dashboard/entities/solo/entity-permissions/entities-entity-permissions').then(m => m.EntitiesEntityPermissionsComponent),
        canActivate: [permissionGuard(['VIEW_ENTITY_PERMISSION'])]
      },
      { 
        path: 'entities/entity-permissions', 
        loadComponent: () => import('./pages/dashboard/entities/solo/entity-permissions/entities-entity-permissions').then(m => m.EntitiesEntityPermissionsComponent),
        canActivate: [permissionGuard(['VIEW_ENTITY_PERMISSION'])]
      },
      {
        path: 'system-role-permissions',
        loadComponent: () => import('./pages/dashboard/system-role-permissions/system-role-permissions').then(m => m.SystemRolePermissionsComponent),
        canActivate: [permissionGuard(['MANAGE_SYSTEM_ROLES'])]
      },
      {
        path: 'business-groups',
        loadComponent: () => import('./pages/dashboard/business-groups/business-groups').then(m => m.BusinessGroupsComponent),
        canActivate: [permissionGuard(['MANAGE_SYSTEM_ROLES'])]
      },
      {
        path: 'user-permissions',
        loadComponent: () => import('./pages/dashboard/user-permissions/user-permissions').then(m => m.UserPermissionsComponent),
        canActivate: [permissionGuard(['MANAGE_SYSTEM_ROLES'])]
      },
      { 
        path: 'users', 
        loadComponent: () => import('./pages/dashboard/users/users').then(m => m.UsersComponent),
        canActivate: [permissionGuard(['VIEW_USER'])]
      },
      { 
        path: 'campaigns', 
        loadComponent: () => import('./pages/dashboard/campaigns/campaigns').then(m => m.CampaignsComponent),
        canActivate: [permissionGuard(['VIEW_CAMPAIGNS'])]
      },
      { 
        path: 'campaigns/new', 
        loadComponent: () => import('./pages/dashboard/campaign-form/campaign-form').then(m => m.CampaignFormComponent),
        canActivate: [permissionGuard(['CREATE_CAMPAIGNS'])]
      },
      { 
        path: 'campaigns/:id/edit', 
        loadComponent: () => import('./pages/dashboard/campaign-form/campaign-form').then(m => m.CampaignFormComponent),
        canActivate: [campaignEditGuard]
      },
      { 
        path: 'campaigns/:id', 
        loadComponent: () => import('./pages/dashboard/campaign-detail/campaign-detail').then(m => m.CampaignDetailComponent),
        canActivate: [campaignViewGuard]
      },
      { 
        path: 'candidates', 
        loadComponent: () => import('./pages/dashboard/applications/applications').then(m => m.ApplicationsComponent),
        canActivate: [permissionGuard(['VIEW_APPLICATIONS'])]
      },
      { 
        path: 'decisions', 
        loadComponent: () => import('./pages/dashboard/decisions/decisions').then(m => m.DecisionsComponent),
        canActivate: [permissionGuard(['VIEW_DECISIONS'])]
      },
      { 
        path: 'interviews', 
        loadComponent: () => import('./pages/dashboard/interviews/interviews').then(m => m.InterviewsComponent),
        canActivate: [permissionGuard(['VIEW_INTERVIEWS'])]
      },
      { 
        path: 'interviews/create', 
        loadComponent: () => import('./pages/dashboard/interview-create/interview-create').then(m => m.InterviewCreateComponent),
        canActivate: [interviewCreateGuard]
      },
      { 
        path: 'evaluations', 
        loadComponent: () => import('./pages/dashboard/evaluations-list/evaluations-list').then(m => m.EvaluationsListComponent),
        canActivate: [permissionGuard(['VIEW_EVALUATIONS'])]
      },
      { 
        path: 'pipeline-templates', 
        loadComponent: () => import('./pages/dashboard/pipeline-templates/pipeline-templates').then(m => m.PipelineTemplatesComponent),
        canActivate: [permissionGuard(['VIEW_PIPELINE_TEMPLATE'])]
      },
      { 
        path: 'pipeline-templates/:id/edit', 
        loadComponent: () => import('./pages/dashboard/pipeline-template-edit/pipeline-template-edit').then(m => m.PipelineTemplateEditComponent),
        canActivate: [permissionGuard(['UPDATE_PIPELINE_TEMPLATE'])]
      },
      {
        path: 'email-editor',
        loadComponent: () => import('./pages/dashboard/email-editor/email-editor').then(m => m.EmailEditorComponent),
        canActivate: [permissionGuard(['VIEW_EMAIL_TEMPLATE'])]
      },
      {
        path: 'email-editor/:id',
        loadComponent: () => import('./pages/dashboard/email-editor/email-editor').then(m => m.EmailEditorComponent),
        canActivate: [permissionGuard(['VIEW_EMAIL_TEMPLATE'])]
      },
      {
        path: 'email-presets',
        loadComponent: () => import('./pages/dashboard/email-editor/email-editor').then(m => m.EmailEditorComponent),
        canActivate: [permissionGuard(['VIEW_EMAIL_TEMPLATE'])]
      },
      {
        path: 'email-presets/:id',
        loadComponent: () => import('./pages/dashboard/email-editor/email-editor').then(m => m.EmailEditorComponent),
        canActivate: [permissionGuard(['VIEW_EMAIL_TEMPLATE'])]
      }
      // Note: L'évaluation en mode plein écran est sur /dashboard/evaluate/:link
    ]
  },
  {
    // Route pour l'évaluation - Plein écran sans header/sidebar
    path: 'dashboard/evaluate',
    loadComponent: () => import('./pages/dashboard/evaluations/evaluations').then(m => m.EvaluationsComponent),
    canActivate: [authGuard]
  },
  {
    // Route pour l'évaluation avec lien - Plein écran sans header/sidebar
    path: 'dashboard/evaluate/:link',
    loadComponent: () => import('./pages/dashboard/evaluations/evaluations').then(m => m.EvaluationsComponent),
    canActivate: [authGuard]
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
