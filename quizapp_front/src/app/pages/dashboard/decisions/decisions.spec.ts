import { Router } from '@angular/router';
import { of } from 'rxjs';

import { DecisionsComponent } from './decisions';
import { APPLICATION_STATUS } from '../../../core/constants/application-status.constants';
import { ApplicationProgressService } from '../../../core/services/application-progress.service';
import { ApplicationService } from '../../../core/services/application.service';
import { CampaignService } from '../../../core/services/campaign.service';
import { CandidateInterviewEntityService } from '../../../core/services/candidate-interview-entity.service';
import { DecisionService } from '../../../core/services/decision.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { UserService } from '../../../core/services/user.service';
import { SourceTokenService } from '../../../services/source-token.service';

describe('DecisionsComponent', () => {
  let component: DecisionsComponent;
  let decisionService: jasmine.SpyObj<DecisionService>;

  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ id: 44 }));

    spyOn(window, 'alert');
    spyOn(window, 'setTimeout').and.returnValue(0 as any);

    const applicationService = jasmine.createSpyObj<ApplicationService>('ApplicationService', [
      'getApplicationsByCriteria',
      'getApplicationDetail',
      'getCvDownloadUrl'
    ]);
    const campaignService = jasmine.createSpyObj<CampaignService>('CampaignService', [
      'getAllCampaignsByCriteria',
      'getCampaignAccessesByUser',
      'buildCampaignAccessMap'
    ]);
    const sourceTokenService = jasmine.createSpyObj<SourceTokenService>('SourceTokenService', [
      'getSourceTokensByCriteria'
    ]);
    decisionService = jasmine.createSpyObj<DecisionService>('DecisionService', [
      'getDecisionsByApplicationId',
      'createDecision'
    ]);
    const userService = jasmine.createSpyObj<UserService>('UserService', ['getById']);
    const candidateInterviewEntityService = jasmine.createSpyObj<CandidateInterviewEntityService>('CandidateInterviewEntityService', ['getAllByCriteria']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const pipelineStageService = jasmine.createSpyObj<PipelineStageService>('PipelineStageService', ['getByTemplate']);
    const applicationProgressService = jasmine.createSpyObj<ApplicationProgressService>('ApplicationProgressService', [
      'getAllByCriteria'
    ]);
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasAnyPermission']);

    applicationService.getApplicationsByCriteria.and.returnValue(of({ items: [] } as any));
    applicationService.getApplicationDetail.and.returnValue(of(null));
    applicationService.getCvDownloadUrl.and.returnValue('/cv.pdf');
    campaignService.getAllCampaignsByCriteria.and.returnValue(of({ content: [] } as any));
    campaignService.getCampaignAccessesByUser.and.returnValue(of([] as any));
    campaignService.buildCampaignAccessMap.and.returnValue({});
    sourceTokenService.getSourceTokensByCriteria.and.returnValue(of({ items: [] } as any));
    decisionService.getDecisionsByApplicationId.and.returnValue(of({
      hasError: false,
      status: { code: 'OK', message: 'ok' },
      items: []
    } as any));
    decisionService.createDecision.and.returnValue(of({
      hasError: false,
      status: { code: 'OK', message: 'ok' }
    } as any));
    userService.getById.and.returnValue(of({} as any));
    candidateInterviewEntityService.getAllByCriteria.and.returnValue(of({ content: [] } as any));
    pipelineStageService.getByTemplate.and.returnValue(of({ items: [] } as any));
    applicationProgressService.getAllByCriteria.and.returnValue(of({ content: [] } as any));
    permissionService.hasAnyPermission.and.returnValue(true);

    component = new DecisionsComponent(
      applicationService,
      campaignService,
      sourceTokenService,
      decisionService,
      userService,
      candidateInterviewEntityService,
      router,
      pipelineStageService,
      applicationProgressService,
      permissionService
    );
  });

  afterEach(() => {
    localStorage.removeItem('user');
  });

  it('submits a standard decision payload anchored to the current occurrence', () => {
    const app = { id: 10, campaignId: 7 } as any;
    const stage = { id: 21, stageType: 'DECISION', stageLabel: 'Decision finale' } as any;
    const progress = { id: 99, pipelineStageId: 21, progressStatus: 'IN_PROGRESS' } as any;

    component.selectedApplication.set(app);
    component.campaignStagesMap.set({ [app.campaignId]: [stage] });
    component.applicationProgressMap.set({ [app.id]: [progress] });
    component.decisionModalStep.set(stage.id);
    component.decisionModalAction.set('APPROVE');
    component.decisionModalMode.set('DECIDE');
    component.decisionModalJustification.set('  Ready for hire  ');

    component.submitDecisionModal();

    const payload = decisionService.createDecision.calls.mostRecent().args[0];
    expect(payload).toEqual(jasmine.objectContaining({
      decisionType: APPLICATION_STATUS.FINAL_ACCEPTED,
      applicationId: 10,
      userId: 44,
      applicationProgressId: 99,
      decisionMode: 'STANDARD',
      justification: 'Ready for hire',
      createdBy: 44
    }));
    expect(payload.cancelsDecisionId).toBeUndefined();
  });

  it('submits a historized cancellation payload tied to the target decision occurrence', () => {
    const app = { id: 10, campaignId: 7 } as any;
    const stage = { id: 21, stageType: 'PRESELECTION', stageLabel: 'Preselection' } as any;
    const progress = { id: 99, pipelineStageId: 21, progressStatus: 'IN_PROGRESS' } as any;
    const targetDecision = {
      id: 501,
      decisionType: APPLICATION_STATUS.PRE_SCREEN_ACCEPTED,
      applicationId: 10,
      userId: 12,
      applicationProgressId: 99
    } as any;

    component.selectedApplication.set(app);
    component.campaignStagesMap.set({ [app.campaignId]: [stage] });
    component.applicationProgressMap.set({ [app.id]: [progress] });
    component.decisions.set([targetDecision]);
    component.decisionModalStep.set(stage.id);
    component.decisionModalAction.set('CANCEL');
    component.decisionModalMode.set('UNDO');
    component.decisionModalTargetDecisionId.set(targetDecision.id);
    component.decisionModalJustification.set('  Audit trail mismatch  ');

    component.submitDecisionModal();

    const payload = decisionService.createDecision.calls.mostRecent().args[0];
    expect(payload).toEqual(jasmine.objectContaining({
      decisionType: APPLICATION_STATUS.PRE_SCREEN_ACCEPTED,
      applicationId: 10,
      userId: 44,
      applicationProgressId: 99,
      decisionMode: 'CANCEL',
      cancelsDecisionId: 501,
      justification: 'Audit trail mismatch',
      createdBy: 44
    }));
  });

  it('does not submit a cancellation when the undo justification is blank', () => {
    const app = { id: 10, campaignId: 7 } as any;
    const stage = { id: 21, stageType: 'PRESELECTION', stageLabel: 'Preselection' } as any;
    const progress = { id: 99, pipelineStageId: 21, progressStatus: 'IN_PROGRESS' } as any;
    const targetDecision = {
      id: 501,
      decisionType: APPLICATION_STATUS.PRE_SCREEN_ACCEPTED,
      applicationId: 10,
      userId: 12,
      applicationProgressId: 99
    } as any;

    component.selectedApplication.set(app);
    component.campaignStagesMap.set({ [app.campaignId]: [stage] });
    component.applicationProgressMap.set({ [app.id]: [progress] });
    component.decisions.set([targetDecision]);
    component.decisionModalStep.set(stage.id);
    component.decisionModalAction.set('CANCEL');
    component.decisionModalMode.set('UNDO');
    component.decisionModalTargetDecisionId.set(targetDecision.id);
    component.decisionModalJustification.set('   ');

    component.submitDecisionModal();

    expect(decisionService.createDecision).not.toHaveBeenCalled();
  });

  it('prefers loaded runtime quiz and interview details over application mirrors in the selected application panel', () => {
    const app = {
      id: 10,
      quizScorePercent: 25,
      interviewDate: '01/01/2026 09:00',
      interviewStatus: 'SCHEDULED',
      currentInterviewEvaluationPercentage: 35
    } as any;

    component.selectedApplication.set(app);
    component.selectedApplicationQuizAttemptsLoaded.set(true);
    component.selectedApplicationQuizAttempts.set([
      { id: 501, scorePercent: 82, completedAt: '2026-05-31T11:00:00Z' } as any
    ]);
    component.selectedApplicationInterviewsLoaded.set(true);
    component.selectedApplicationInterviews.set([
      {
        id: 701,
        interviewDate: '31/05/2026 14:00',
        interviewStatus: 'CLOSED'
      } as any
    ]);

    expect(component.getSelectedApplicationQuizScorePercent(app)).toBe(82);
    expect(component.getSelectedApplicationInterviewDate(app)).toBe('31/05/2026 14:00');
    expect(component.getSelectedApplicationInterviewStatus(app)).toBe('CLOSED');
    expect(component.getSelectedApplicationEvaluationScore(app)).toBe(35);
  });

  it('stops resurfacing legacy mirrors once runtime quiz and interview data are loaded but empty', () => {
    const app = {
      id: 10,
      quizScorePercent: 25,
      interviewDate: '01/01/2026 09:00',
      interviewStatus: 'SCHEDULED'
    } as any;

    component.selectedApplication.set(app);
    component.selectedApplicationQuizAttemptsLoaded.set(true);
    component.selectedApplicationQuizAttempts.set([]);
    component.selectedApplicationInterviewsLoaded.set(true);
    component.selectedApplicationInterviews.set([]);

    expect(component.getSelectedApplicationQuizScorePercent(app)).toBeNull();
    expect(component.getSelectedApplicationInterviewDate(app)).toBe('');
    expect(component.getSelectedApplicationInterviewStatus(app)).toBe('');
    expect(component.getSelectedApplicationEvaluationScore(app)).toBeNull();
  });

  it('prefers runtime pipeline and current decision mirrors for decision dashboard status buckets', () => {
    const apps = [
      {
        id: 10,
        currentPipelineStageType: 'QUIZ',
        currentPipelineProgressStatus: 'PENDING'
      },
      {
        id: 11,
        currentFinalDecisionType: APPLICATION_STATUS.FINAL_REJECTED
      },
      {
        id: 12,
        currentPreselectionDecisionType: APPLICATION_STATUS.PRE_SCREEN_ACCEPTED,
        currentPipelineStageType: 'DECISION',
        currentPipelineProgressStatus: 'IN_PROGRESS'
      },
      {
        id: 13,
        currentPreselectionDecisionType: APPLICATION_STATUS.PRE_SCREEN_REJECTED
      }
    ] as any;

    component.applications.set(apps);
    component.applicationProgressMap.set({
      10: [{ id: 201, stageType: 'PRESELECTION', progressStatus: 'IN_PROGRESS' }] as any
    });

    expect(component.getApplicationDisplayStatus(apps[0])).toBe(APPLICATION_STATUS.SUBMITTED);
    expect(component.getApplicationDisplayStatus(apps[1])).toBe(APPLICATION_STATUS.FINAL_REJECTED);
    expect(component.getApplicationDisplayStatus(apps[2])).toBe(APPLICATION_STATUS.PRE_SCREEN_ACCEPTED);
    expect(component.getApplicationDisplayStatus(apps[3])).toBe(APPLICATION_STATUS.PRE_SCREEN_REJECTED);

    expect(component.getFilterCount('SUBMITTED')).toBe(1);
    expect(component.getFilterCount('PRE_SCREEN')).toBe(1);
    expect(component.getPreScreenDecisionsCount()).toBe(2);
    expect(component.getFinalDecisionsCount()).toBe(1);
  });
});