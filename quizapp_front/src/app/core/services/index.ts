export { AuthService } from './auth/auth.service';
export { ConnexionService } from './connexion/connexion.service';
export { UserService } from './user.service';
export type { User as UserManagement, UserSearchCriteria, PagedResponse } from './user.service';
export { SpecialityService } from './speciality.service';
export type { Speciality, SpecialitySearchCriteria } from './speciality.service';
export { CampaignService } from './campaign.service';
export type { Campaign, CampaignSearchCriteria } from './campaign.service';
export * from './online-status.service';
export * from './online-stats.service';
export { PipelineTemplateService } from './pipeline-template.service';
export type { PipelineTemplateCriteria, PagedPipelineTemplateResponse } from './pipeline-template.service';
export { PipelineStageService } from './pipeline-stage.service';
export type { PipelineStageCriteria, PagedPipelineStageResponse } from './pipeline-stage.service';
export { ApplicationProgressService } from './application-progress.service';
export type { ApplicationProgressCriteria, PagedApplicationProgressResponse } from './application-progress.service';

// Export des composants QEEL
export * from '../../components/qeel/qeel-modern.component';
