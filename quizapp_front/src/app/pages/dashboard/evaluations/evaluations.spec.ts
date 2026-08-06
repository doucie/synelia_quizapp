import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { EvaluationsComponent } from './evaluations';
import { ApplicationService } from '../../../core/services/application.service';
import { CampaignService } from '../../../core/services/campaign.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { EntityPermissionService } from '../../../core/services/entity-permission.service';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { InterviewAdminService } from '../../../core/services/interview-admin.service';
import { InterviewParticipantService } from '../../../core/services/interview-participant.service';
import { InterviewService } from '../../../core/services/interview.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EvaluationItem } from '../../../core/services/evaluation.service';

describe('EvaluationsComponent', () => {
  let component: EvaluationsComponent;
  let evaluationService: jasmine.SpyObj<EvaluationService>;

  beforeEach(() => {
    const route = {
      paramMap: of(convertToParamMap({})),
      queryParamMap: of(convertToParamMap({}))
    } as unknown as ActivatedRoute;
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    evaluationService = jasmine.createSpyObj<EvaluationService>('EvaluationService', [
      'createEvaluation',
      'updateEvaluation',
      'getInterviewByEvaluationsLink',
      'getEvaluationsByCandidateInterviewId',
      'getEvaluationCriteria'
    ]);
    const entityPermissionService = jasmine.createSpyObj<EntityPermissionService>('EntityPermissionService', ['getForEntity']);
    const interviewParticipantService = jasmine.createSpyObj<InterviewParticipantService>('InterviewParticipantService', [
      'updateHasFinished',
      'getByInterviewId',
      'sendPresencePing',
      'markOffline'
    ]);
    const interviewService = jasmine.createSpyObj<InterviewService>('InterviewService', ['getInterviewById', 'finishInterview']);
    const applicationService = jasmine.createSpyObj<ApplicationService>('ApplicationService', ['getApplicationsByCriteria']);
    const notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'error', 'warning']);
    const authService = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser']);
    const campaignService = jasmine.createSpyObj<CampaignService>('CampaignService', ['getCampaignAccess']);
    const interviewAdminService = jasmine.createSpyObj<InterviewAdminService>('InterviewAdminService', ['refreshEvaluationRosterStatuses']);

    evaluationService.createEvaluation.and.returnValue(of({ hasError: false, items: [{ id: 701 }] } as any));
    evaluationService.updateEvaluation.and.returnValue(of({ hasError: false } as any));
    evaluationService.getEvaluationsByCandidateInterviewId.and.returnValue(of({ hasError: false, items: [] } as any));
    evaluationService.getEvaluationCriteria.and.returnValue(of([]));
    interviewParticipantService.updateHasFinished.and.returnValue(of({} as any));
    authService.getCurrentUser.and.returnValue({ id: '44', firstName: 'Ada', lastName: 'Lovelace' } as any);
    interviewAdminService.refreshEvaluationRosterStatuses.and.callFake((evaluators: any) => evaluators);

    TestBed.configureTestingModule({
      providers: [
        { provide: InterviewAdminService, useValue: interviewAdminService }
      ]
    });

    component = TestBed.runInInjectionContext(() => new EvaluationsComponent(
      route,
      router,
      evaluationService,
      entityPermissionService,
      interviewParticipantService,
      interviewService,
      applicationService,
      notificationService,
      authService,
      campaignService
    ));

    component.currentUserId.set(44);
    component.currentUserName.set('Ada Lovelace');
    component.currentUserParticipantId.set(88);
    component.candidate.set({
      applicationId: 10,
      candidateInterviewId: 55,
      name: 'Candidate',
      email: 'candidate@example.com'
    });

    spyOn<any>(component, 'scrollToBottom');
    spyOn<any>(component, 'updateEvaluatorsStatus');
    spyOn<any>(component, 'resetHasFinished').and.stub();
  });

  it('submits the current interviewParticipantId with a new evaluation payload', () => {
    component.newMark.set(74);
    component.newComment.set('  Evaluation explicite  ');
    component.newEvaluationItems.set([{
      pipelineStageEvaluationCriterionId: 501,
      criterionOrder: 1,
      label: 'Communication',
      criterionType: 'SCORE',
      scoreValue: 4.5,
      textValue: '  Bonne communication  ',
      maxScoreSnapshot: 5
    }]);

    component.submitEvaluation();

    const [payload, userId] = evaluationService.createEvaluation.calls.mostRecent().args;
    expect(userId).toBe(44);
    expect(payload).toEqual(jasmine.objectContaining({
      candidateInterviewId: 55,
      interviewParticipantId: 88,
      globalScore: 90,
      globalComment: 'Evaluation explicite',
      evaluationItems: [jasmine.objectContaining({
        pipelineStageEvaluationCriterionId: 501,
        criterionOrder: 1,
        label: 'Communication',
        scoreValue: 4.5,
        textValue: 'Bonne communication'
      })]
    }));
  });

  it('submits the current interviewParticipantId when editing an evaluation', () => {
    component.editingEvaluationId.set(701);
    component.editMark.set(81);
    component.editComment.set('  Commentaire mis a jour  ');
    component.editEvaluationItems.set([{
      pipelineStageEvaluationCriterionId: 502,
      criterionOrder: 2,
      label: 'Technique',
      criterionType: 'TEXT',
      textValue: '  Solide sur le coeur métier  '
    }]);

    component.saveEditEvaluation();

    const [payload, userId] = evaluationService.updateEvaluation.calls.mostRecent().args;
    expect(userId).toBe(44);
    expect(payload).toEqual(jasmine.objectContaining({
      id: 701,
      candidateInterviewId: 55,
      interviewParticipantId: 88,
      globalScore: 81,
      globalComment: 'Commentaire mis a jour',
      evaluationItems: [jasmine.objectContaining({
        pipelineStageEvaluationCriterionId: 502,
        criterionOrder: 2,
        label: 'Technique',
        textValue: 'Solide sur le coeur métier'
      })]
    }));
  });

   it('derives globalScore from score criteria when editing an evaluation', () => {
     component.editingEvaluationId.set(702);
     component.editMark.set(33);
     component.editComment.set('  Ajustement derive  ');
     component.editEvaluationItems.set([
       {
         pipelineStageEvaluationCriterionId: 501,
         criterionOrder: 1,
         label: 'Communication',
         criterionType: 'SCORE',
         scoreValue: 4,
         maxScoreSnapshot: 5,
         weightSnapshot: 2
       },
       {
         pipelineStageEvaluationCriterionId: 502,
         criterionOrder: 2,
         label: 'Technique',
         criterionType: 'TEXT_AND_SCORE',
         scoreValue: 5,
         maxScoreSnapshot: 10,
         weightSnapshot: 1,
         textValue: '  Solide  '
       }
     ]);

     component.saveEditEvaluation();

     const [payload, userId] = evaluationService.updateEvaluation.calls.mostRecent().args;
     expect(userId).toBe(44);
     expect(payload).toEqual(jasmine.objectContaining({
       id: 702,
       candidateInterviewId: 55,
       interviewParticipantId: 88,
       globalScore: 70,
       globalComment: 'Ajustement derive'
     }));
   });

  it('loads evaluationItems into chat messages when evaluations are fetched', () => {
    const evaluationItems: EvaluationItem[] = [{
      id: 801,
      pipelineStageEvaluationCriterionId: 501,
      criterionOrder: 1,
      label: 'Communication',
      criterionType: 'SCORE',
      scoreValue: 4.5,
      textValue: 'Bonne communication',
      maxScoreSnapshot: 5
    }];
    evaluationService.getEvaluationsByCandidateInterviewId.and.returnValue(of({
      hasError: false,
      items: [{
        id: 701,
        createdBy: 44,
        globalScore: 74,
        globalComment: 'Evaluation detaillee',
        createdAt: '2026-05-31T10:00:00Z',
        evaluationItems
      }]
    } as any));
    evaluationService.getEvaluationCriteria.and.returnValue(of([{
      pipelineStageEvaluationCriterionId: 501,
      criterionOrder: 1,
      label: 'Communication',
      criterionType: 'SCORE',
      maxScoreSnapshot: 5
    }]));

    (component as any).loadEvaluations(55);

    expect(component.evaluationMessages()).toHaveSize(1);
    expect(component.newEvaluationItems()).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({
        pipelineStageEvaluationCriterionId: 501,
        criterionOrder: 1,
        label: 'Communication'
      })
    ]));
    expect(component.evaluationMessages()[0]).toEqual(jasmine.objectContaining({
      id: 701,
      comment: 'Evaluation detaillee',
      evaluationItems: jasmine.arrayContaining([
        jasmine.objectContaining({
          pipelineStageEvaluationCriterionId: 501,
          criterionOrder: 1,
          label: 'Communication',
          scoreValue: 4.5,
          textValue: 'Bonne communication'
        })
      ])
    }));
  });
});