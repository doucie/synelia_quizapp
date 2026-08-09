import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ApplicationProgressService } from '../../../../../core/services/application-progress.service';
import { ApplicationService } from '../../../../../core/services/application.service';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { CandidateAnswersService } from '../../../../../core/services/candidate-answers.service';
import { CandidateAskService } from '../../../../../core/services/candidate-ask.service';
import { CandidateInterviewEntityService } from '../../../../../core/services/candidate-interview-entity.service';
import { CandidateTokenService } from '../../../../../core/services/candidate-token.service';
import { DashboardStatsService } from '../../../../../core/services/dashboard-stats.service';
import { DecisionService } from '../../../../../core/services/decision.service';
import { EntityPermissionService } from '../../../../../core/services/entity-permission.service';
import { EvaluationService } from '../../../../../core/services/evaluation.service';
import { FormVersionService } from '../../../../../core/services/form-version.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { PermissionService } from '../../../../../core/services/permission.service';
import { SourceTokenService } from '../../../../../services/source-token.service';
import { EntitiesApplicationsComponent } from './entities-applications';

describe('EntitiesApplicationsComponent', () => {
  let fixture: ComponentFixture<EntitiesApplicationsComponent>;
  let component: EntitiesApplicationsComponent;

  beforeEach(async () => {
    const applicationService = jasmine.createSpyObj<ApplicationService>('ApplicationService', [
      'getAllApplicationsByCriteria',
      'createApplication',
      'updateApplication',
      'deleteApplication',
      'restoreApplication'
    ]);
    const sourceTokenService = jasmine.createSpyObj<SourceTokenService>('SourceTokenService', ['getSourceTokensByCriteria']);
    const formVersionService = jasmine.createSpyObj<FormVersionService>('FormVersionService', ['getAllByCriteria']);
    const dashboardStatsService = jasmine.createSpyObj<DashboardStatsService>('DashboardStatsService', ['checkDependencies', 'checkParent']);
    const notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['error', 'success', 'warning']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    applicationService.getAllApplicationsByCriteria.and.returnValue(of({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0
    } as any));
    applicationService.createApplication.and.returnValue(of({} as any));
    applicationService.updateApplication.and.returnValue(of({} as any));
    applicationService.deleteApplication.and.returnValue(of({} as any));
    applicationService.restoreApplication.and.returnValue(of({} as any));
    sourceTokenService.getSourceTokensByCriteria.and.returnValue(of({ items: [] } as any));
    formVersionService.getAllByCriteria.and.returnValue(of({ content: [] } as any));
    dashboardStatsService.checkDependencies.and.returnValue(of({ totalDependencies: 0 } as any));
    dashboardStatsService.checkParent.and.returnValue(of({ deletedParents: [] } as any));

    await TestBed.configureTestingModule({
      imports: [EntitiesApplicationsComponent],
      providers: [
        { provide: ApplicationService, useValue: applicationService },
        { provide: CandidateAnswersService, useValue: {} },
        { provide: CandidateAskService, useValue: {} },
        { provide: CandidateTokenService, useValue: {} },
        { provide: CandidateInterviewEntityService, useValue: {} },
        { provide: ApplicationProgressService, useValue: {} },
        { provide: DecisionService, useValue: {} },
        { provide: EvaluationService, useValue: {} },
        { provide: AuthService, useValue: {} },
        { provide: EntityPermissionService, useValue: {} },
        { provide: PermissionService, useValue: {} },
        { provide: SourceTokenService, useValue: sourceTokenService },
        { provide: FormVersionService, useValue: formVersionService },
        { provide: Router, useValue: router },
        { provide: DashboardStatsService, useValue: dashboardStatsService },
        { provide: NotificationService, useValue: notificationService }
      ]
    });

    TestBed.overrideComponent(EntitiesApplicationsComponent, {
      set: {
        template: ''
      }
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(EntitiesApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('derives the displayed interview evaluation mark from criterion items', () => {
    const displayMark = component.getInterviewEvaluationDisplayMark({
      interviewLabel: 'Entretien #17',
      globalScore: 22,
      evaluationItems: [
        {
          pipelineStageEvaluationCriterionId: 501,
          criterionType: 'SCORE',
          scoreValue: 4.5,
          maxScoreSnapshot: 5,
          weightSnapshot: 2,
          label: 'Communication'
        },
        {
          pipelineStageEvaluationCriterionId: 502,
          criterionType: 'TEXT_AND_SCORE',
          scoreValue: 6,
          maxScoreSnapshot: 10,
          weightSnapshot: 1,
          label: 'Technique',
          textValue: 'Base solide'
        }
      ]
    });

    expect(displayMark).toBe(80);
  });

  it('keeps evaluation item details when mapping interview evaluations for display', () => {
    const entries = (component as any).mapInterviewEvaluationsForDisplay({
      id: 55,
      interviewId: 17,
      interviewDate: '2026-05-31T10:00:00Z',
      interviewStatus: 'CLOSED'
    }, [{
      id: 701,
      globalScore: 10,
      globalComment: 'Synthese globale',
      createdBy: 44,
      evaluationItems: [{
        pipelineStageEvaluationCriterionId: 501,
        criterionOrder: 1,
        label: 'Communication',
        criterionType: 'SCORE',
        scoreValue: 4,
        maxScoreSnapshot: 5,
        textValue: 'Claire'
      }]
    }]);

    expect(entries).toHaveSize(1);
    expect(entries[0].evaluationItems).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({
        pipelineStageEvaluationCriterionId: 501,
        label: 'Communication',
        scoreValue: 4,
        textValue: 'Claire'
      })
    ]));
    expect(component.getInterviewEvaluationDisplayMark(entries[0])).toBe(80);
  });

  it('prefers loaded runtime interview and pipeline summaries over application mirrors', () => {
    component.childInterviews.set({
      10: [{
        id: 55,
        interviewId: 17,
        interviewDate: '31/05/2026 10:00',
        interviewStatus: 'CLOSED'
      } as any]
    });
    component.childProgresses.set({
      10: [{
        id: 801,
        stageName: 'Entretien technique',
        stageType: 'INTERVIEW',
        progressStatus: 'IN_PROGRESS'
      } as any]
    });

    const application = {
      id: 10,
      interviewStatus: 'SCHEDULED',
      interviewDate: '01/01/2026 08:00',
      currentPipelineStageLabel: 'Pré-sélection',
      currentPipelineProgressStatus: 'PENDING',
      currentInterviewEvaluationScore: 18,
      currentInterviewEvaluationNumber: 2,
      currentInterviewEvaluationPercentage: 9
    } as any;

    expect(component.getCurrentInterviewStatus(application)).toBe('CLOSED');
    expect(component.getCurrentInterviewDate(application)).toBe('31/05/2026 10:00');
    expect(component.getCurrentInterviewEvaluationAverageLabel(application)).toBe('Moyenne 9');
    expect(component.getCurrentInterviewEvaluationSummary(application)).toBe('18 pts - 2 évaluations');
    expect(component.getCurrentPipelineStageLabel(application)).toBe('Entretien technique');
    expect(component.getCurrentPipelineProgressStatus(application)).toBe('IN_PROGRESS');
  });

  it('prefers active runtime decisions and ignores canceled decision mirrors', () => {
    component.childDecisions.set({
      10: [
        {
          id: 902,
          decisionType: 'PRE_SCREEN_ACCEPTED',
          decisionMode: 'STANDARD',
          createdAt: '2026-05-31T11:00:00Z'
        } as any,
        {
          id: 901,
          decisionType: 'FINAL_ACCEPTED',
          decisionMode: 'CANCEL',
          cancelsDecisionId: 900,
          updatedAt: '2026-05-31T12:00:00Z'
        } as any,
        {
          id: 900,
          decisionType: 'FINAL_ACCEPTED',
          decisionMode: 'STANDARD',
          createdAt: '2026-05-31T10:00:00Z'
        } as any
      ]
    });

    const application = {
      id: 10,
      currentPreselectionDecisionType: 'PRE_SCREEN_REJECTED',
      currentPreselectionDecisionDate: '01/01/2026 08:00',
      currentFinalDecisionType: 'FINAL_REJECTED',
      currentFinalDecisionDate: '01/01/2026 09:00'
    } as any;

    expect(component.getCurrentPreselectionDecisionType(application)).toBe('PRE_SCREEN_ACCEPTED');
    expect(component.getCurrentPreselectionDecisionDate(application)).toBe('2026-05-31T11:00:00Z');
    expect(component.hasCurrentPreselectionSummary(application)).toBeTrue();
    expect(component.getCurrentFinalDecisionType(application)).toBe('');
    expect(component.getCurrentFinalDecisionDate(application)).toBe('');
    expect(component.hasCurrentFinalDecisionSummary(application)).toBeFalse();
  });

  it('prefers loaded runtime quiz summaries and link token over application mirrors', () => {
    component.childAnswerGroups.set({
      10: [{
        key: 'attempt-1',
        applicationQuizAttemptId: 501,
        label: 'Tentative #1',
        isLegacy: false,
        quizToken: 'runtime-token',
        quizStatus: 'COMPLETED',
        manualCorrectionStatus: 'PENDING',
        score: 17,
        scorePercent: 85,
        createdAt: '2026-05-31T09:00:00Z',
        startedAt: '2026-05-31T09:00:00Z',
        completedAt: '2026-05-31T09:30:00Z',
        lastActivityAt: '2026-05-31T09:30:00Z',
        answers: []
      } as any]
    });

    const application = {
      id: 10,
      quizStatus: 'PENDING',
      quizScorePercent: 20,
      quizManualCorrectionStatus: 'IN_PROGRESS',
      quizToken: 'legacy-token'
    } as any;

    expect(component.getCurrentQuizStatus(application)).toBe('COMPLETED');
    expect(component.getCurrentQuizScorePercent(application)).toBe(85);
    expect(component.getCurrentQuizManualCorrectionStatus(application)).toBe('PENDING');
    expect(component.getCurrentQuizToken(application)).toBe('runtime-token');
    expect(component.hasCurrentQuizSummary(application)).toBeTrue();
  });

  it('derives the display status from the active runtime stage instead of the legacy application status', () => {
    component.childProgresses.set({
      10: [{
        id: 801,
        stageName: 'Entretien technique',
        stageType: 'INTERVIEW',
        progressStatus: 'IN_PROGRESS'
      } as any]
    });
    component.childDecisions.set({
      10: [{
        id: 902,
        decisionType: 'PRE_SCREEN_ACCEPTED',
        decisionMode: 'STANDARD',
        createdAt: '2026-05-31T11:00:00Z'
      } as any]
    });

    const application = {
      id: 10
    } as any;

    expect(component.getDisplayStatusLabel(application)).toBe('Entretien technique');
    expect(component.getDisplayStatusClass(application)).toBe('status-interviewing');
  });

  it('derives the display status from the runtime final decision before the legacy status', () => {
    component.childDecisions.set({
      10: [{
        id: 903,
        decisionType: 'FINAL_ACCEPTED',
        decisionMode: 'STANDARD',
        createdAt: '2026-05-31T12:00:00Z'
      } as any]
    });

    const application = {
      id: 10
    } as any;

    expect(component.getDisplayStatusLabel(application)).toBe('Acceptée');
    expect(component.getDisplayStatusClass(application)).toBe('status-final-accepted');
  });
});