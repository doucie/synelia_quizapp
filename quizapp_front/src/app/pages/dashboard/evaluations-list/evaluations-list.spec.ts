import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CampaignService } from '../../../core/services/campaign.service';
import { CandidateInterviewEntityService } from '../../../core/services/candidate-interview-entity.service';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { InterviewParticipantService } from '../../../core/services/interview-participant.service';
import { InterviewService } from '../../../core/services/interview.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserService } from '../../../core/services/user.service';
import { EvaluationsListComponent } from './evaluations-list';

describe('EvaluationsListComponent', () => {
  let fixture: ComponentFixture<EvaluationsListComponent>;
  let component: EvaluationsListComponent;

  beforeEach(async () => {
    const interviewService = jasmine.createSpyObj<InterviewService>('InterviewService', ['getAllInterviews']);
    const applicationService = jasmine.createSpyObj<ApplicationService>('ApplicationService', ['getApplicationsByCriteria']);
    const campaignService = jasmine.createSpyObj<CampaignService>('CampaignService', ['getMyCampaigns']);
    const candidateInterviewEntityService = jasmine.createSpyObj<CandidateInterviewEntityService>('CandidateInterviewEntityService', ['getAllByCriteria']);
    const evaluationService = jasmine.createSpyObj<EvaluationService>('EvaluationService', ['getEvaluationsByCandidateInterviewId']);
    const interviewParticipantService = jasmine.createSpyObj<InterviewParticipantService>('InterviewParticipantService', ['getAllByCriteria']);
    const userService = jasmine.createSpyObj<UserService>('UserService', ['getByCriteria']);
    const authService = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser']);
    const notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['error', 'warning']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    interviewService.getAllInterviews.and.returnValue(of({
      hasError: false,
      items: [{
        id: 17,
        applicationId: 10,
        campaignId: 5,
        interviewRound: 1,
        applicationProgressId: 801,
        pipelineStageId: 301,
        pipelineStageType: 'INTERVIEW',
        pipelineStageLabel: 'Entretien RH',
        pipelineStageOrder: 3,
        interviewDate: '20/05/2026 09:00',
        startedAt: '2026-05-20T09:00:00Z',
        interviewStatus: 'OVER',
        endedAt: '2026-05-31T11:00:00Z'
      }, {
        id: 18,
        applicationId: 10,
        campaignId: 5,
        interviewRound: 2,
        applicationProgressId: 802,
        pipelineStageId: 302,
        pipelineStageType: 'INTERVIEW',
        pipelineStageLabel: 'Entretien technique',
        pipelineStageOrder: 5,
        interviewDate: '28/05/2026 14:00',
        startedAt: '2026-05-28T14:00:00Z',
        interviewStatus: 'STARTED'
      }]
    } as any));
    applicationService.getApplicationsByCriteria.and.returnValue(of({
      hasError: false,
      items: [{
        id: 10,
        candidateFirstName: 'Ada',
        candidateLastName: 'Lovelace',
        candidateEmail: 'ada@example.com',
        quizScorePercent: 92,
        currentPipelineStageLabel: 'Entretien technique'
      }]
    } as any));
    campaignService.getMyCampaigns.and.returnValue(of({
      content: [{ id: 5, campaignTitle: 'Campagne IA' }]
    } as any));
    candidateInterviewEntityService.getAllByCriteria.and.returnValue(of({
      content: [{ id: 55, interviewId: 17, applicationId: 10 }, { id: 56, interviewId: 18, applicationId: 10 }]
    } as any));
    interviewParticipantService.getAllByCriteria.and.returnValue(of({
      content: [{
        id: 301,
        interviewId: 17,
        userId: 91,
        isOnline: true,
        hasFinished: true
      }, {
        id: 302,
        interviewId: 17,
        userId: 92,
        isOnline: false,
        hasFinished: false
      }, {
        id: 303,
        interviewId: 18,
        userId: 91,
        isOnline: true,
        hasFinished: false
      }]
    } as any));
    evaluationService.getEvaluationsByCandidateInterviewId.and.callFake((candidateInterviewId: number) => of({
      hasError: false,
      items: candidateInterviewId === 55 ? [{
        id: 701,
        globalScore: 12,
        interviewParticipantId: 301,
        globalComment: 'Tres bon alignement',
        createdAt: '2026-05-31T10:30:00Z',
        evaluationItems: [{
          pipelineStageEvaluationCriterionId: 501,
          label: 'Communication',
          criterionType: 'SCORE',
          scoreValue: 4.5,
          maxScoreSnapshot: 5,
          weightSnapshot: 2
        }, {
          pipelineStageEvaluationCriterionId: 502,
          label: 'Technique',
          criterionType: 'TEXT_AND_SCORE',
          scoreValue: 8,
          maxScoreSnapshot: 10,
          weightSnapshot: 1,
          textValue: 'Solide'
        }]
      }] : []
    } as any));
    userService.getByCriteria.and.returnValue(of({
      content: [{
        id: 91,
        firstName: 'Alice',
        lastName: 'Martin',
        email: 'alice@example.com',
        role: 'RECRUITER',
        isOnline: true
      }, {
        id: 92,
        firstName: 'Bob',
        lastName: 'Durand',
        email: 'bob@example.com',
        role: 'RECRUITER',
        isOnline: false
      }]
    } as any));
    authService.getCurrentUser.and.returnValue({ id: '44' } as any);

    await TestBed.configureTestingModule({
      imports: [EvaluationsListComponent],
      providers: [
        { provide: InterviewService, useValue: interviewService },
        { provide: ApplicationService, useValue: applicationService },
        { provide: CampaignService, useValue: campaignService },
        { provide: CandidateInterviewEntityService, useValue: candidateInterviewEntityService },
        { provide: EvaluationService, useValue: evaluationService },
        { provide: InterviewParticipantService, useValue: interviewParticipantService },
        { provide: UserService, useValue: userService },
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notificationService },
        { provide: Router, useValue: router }
      ]
    });

    TestBed.overrideComponent(EvaluationsListComponent, {
      set: {
        template: ''
      }
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(EvaluationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('enriches interviews with submitted evaluation snapshots and derived latest mark', () => {
    const interview = component.interviews().find(item => item.id === 17)!;

    expect(interview.candidateInterviewId).toBe(55);
    expect(interview.submittedEvaluationCount).toBe(1);
    expect(interview.submittedEvaluationAverageMark).toBe(87);
    expect(interview.latestEvaluationMark).toBe(87);
    expect(interview.interviewRound).toBe(1);
    expect(interview.interviewStageLabel).toBe('Entretien RH');
    expect(interview.latestEvaluationItems).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({
        pipelineStageEvaluationCriterionId: 501,
        label: 'Communication',
        scoreValue: 4.5
      })
    ]));
    expect(interview.evaluatorStatuses).toEqual([
      jasmine.objectContaining({
        participantId: 301,
        displayName: 'Alice Martin',
        hasSubmitted: true,
        latestMark: 87
      }),
      jasmine.objectContaining({
        participantId: 302,
        displayName: 'Bob Durand',
        hasSubmitted: false,
        hasFinished: false,
        isOnline: false
      })
    ]);
    expect(component.getSubmittedEvaluatorCount(interview)).toBe(1);
  });

  it('maps interview round and stage label from the application progress sequence', () => {
    const firstInterview = component.interviews().find(item => item.id === 17)!;
    const secondInterview = component.interviews().find(item => item.id === 18)!;

    expect(firstInterview.interviewRound).toBe(1);
    expect(firstInterview.interviewStageLabel).toBe('Entretien RH');
    expect(secondInterview.interviewRound).toBe(2);
    expect(secondInterview.interviewStageLabel).toBe('Entretien technique');
  });

  it('returns at most three criterion previews for the latest evaluation', () => {
    const previewItems = component.getLatestEvaluationPreviewItems({
      latestEvaluationItems: [
        { id: 1, label: 'A' },
        { id: 2, label: 'B' },
        { id: 3, label: 'C' },
        { id: 4, label: 'D' }
      ]
    } as any);

    expect(previewItems.map(item => item.label)).toEqual(['A', 'B', 'C']);
  });
});