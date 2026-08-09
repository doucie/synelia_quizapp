import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';

import { ApplicationsComponent } from './applications';
import { ApplicationProgressService } from '../../../core/services/application-progress.service';
import { ApplicationService } from '../../../core/services/application.service';
import { CampaignService } from '../../../core/services/campaign.service';
import { CandidateInterviewEntityService } from '../../../core/services/candidate-interview-entity.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { SourceTokenService } from '../../../services/source-token.service';

describe('ApplicationsComponent', () => {
  let component: ApplicationsComponent;
  let applicationService: jasmine.SpyObj<ApplicationService>;
  let candidateInterviewEntityService: jasmine.SpyObj<CandidateInterviewEntityService>;

  beforeEach(() => {
    applicationService = jasmine.createSpyObj<ApplicationService>('ApplicationService', [
      'getApplicationDetail'
    ]);
    candidateInterviewEntityService = jasmine.createSpyObj<CandidateInterviewEntityService>('CandidateInterviewEntityService', [
      'getAllByCriteria'
    ]);
    const pipelineStageService = jasmine.createSpyObj<PipelineStageService>('PipelineStageService', ['getByTemplate']);
    const applicationProgressService = jasmine.createSpyObj<ApplicationProgressService>('ApplicationProgressService', ['getAllByCriteria']);
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasAnyPermission']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    pipelineStageService.getByTemplate.and.returnValue(of({ items: [] } as any));
    applicationProgressService.getAllByCriteria.and.returnValue(of({ content: [] } as any));
    permissionService.hasAnyPermission.and.returnValue(true);
    applicationService.getApplicationDetail.and.returnValue(of(null));
    candidateInterviewEntityService.getAllByCriteria.and.returnValue(of({ content: [] } as any));

    component = new ApplicationsComponent(
      applicationService,
      {} as CampaignService,
      {} as SourceTokenService,
      router,
      { fragment: of(null) } as ActivatedRoute,
      { bypassSecurityTrustResourceUrl: (value: string) => value } as unknown as DomSanitizer,
      pipelineStageService,
      applicationProgressService,
      candidateInterviewEntityService,
      permissionService
    );
  });

  it('loads runtime quiz and interview details for cards and prefers them over application mirrors', () => {
    applicationService.getApplicationDetail.and.returnValue(of({
      id: 10,
      quizAttempts: [
        { id: 501, quizStatus: 'COMPLETED', scorePercent: 82, completedAt: '2026-05-31T11:00:00Z' }
      ]
    } as any));
    candidateInterviewEntityService.getAllByCriteria.and.returnValue(of({
      content: [
        { id: 701, interviewDate: '31/05/2026 14:00', interviewStatus: 'CLOSED' }
      ]
    } as any));

    component.enrichApplications([
      {
        id: 10,
        candidateFirstName: 'Ada',
        candidateLastName: 'Lovelace',
        candidateEmail: 'ada@example.com',
        candidatePhone: '0102030405',
        candidateBirthDate: '1990-01-01',
        quizStatus: 'PENDING',
        quizScorePercent: 25,
        interviewDate: '01/01/2026 09:00',
        interviewStatus: 'SCHEDULED',
        currentInterviewEvaluationPercentage: 90
      } as any
    ], [], []);

    const app = component.applications()[0];
    expect(component.getCurrentQuizStatus(app)).toBe('COMPLETED');
    expect(component.getCurrentQuizScorePercent(app)).toBe(82);
    expect(component.getCurrentInterviewDate(app)).toBe('31/05/2026 14:00');
    expect(component.getCurrentInterviewStatus(app)).toBe('CLOSED');
    expect(component.getCurrentEvaluationScore(app)).toBe(90);
    expect(component.completedQuizApplications()).toBe(1);
  });

  it('stops resurfacing legacy quiz and interview mirrors once runtime data are loaded but empty', () => {
    applicationService.getApplicationDetail.and.returnValue(of({
      id: 10,
      quizAttempts: []
    } as any));
    candidateInterviewEntityService.getAllByCriteria.and.returnValue(of({ content: [] } as any));

    component.enrichApplications([
      {
        id: 10,
        candidateFirstName: 'Ada',
        candidateLastName: 'Lovelace',
        candidateEmail: 'ada@example.com',
        candidatePhone: '0102030405',
        candidateBirthDate: '1990-01-01',
        quizStatus: 'COMPLETED',
        quizScorePercent: 91,
        interviewDate: '01/01/2026 09:00',
        interviewStatus: 'CLOSED'
      } as any
    ], [], []);

    const app = component.applications()[0];
    expect(component.getCurrentQuizStatus(app)).toBe('');
    expect(component.getCurrentQuizScorePercent(app)).toBeNull();
    expect(component.getCurrentInterviewDate(app)).toBe('');
    expect(component.getCurrentInterviewStatus(app)).toBe('');
    expect(component.getCurrentEvaluationScore(app)).toBeNull();
    expect(component.completedQuizApplications()).toBe(0);
  });

  it('uses the current interview stage and runtime interview state to decide if planning is allowed', () => {
    const app = {
      id: 10,
      campaignId: 7,
      candidateFirstName: 'Ada',
      candidateLastName: 'Lovelace',
      candidateEmail: 'ada@example.com',
      candidatePhone: '0102030405',
      candidateBirthDate: '1990-01-01',
      interviewDate: ''
    } as any;

    component.campaignStagesMap.set({
      7: [{ id: 21, stageType: 'INTERVIEW', stageLabel: 'Entretien technique' } as any]
    });
    component.applicationProgressMap.set({
      10: [{ id: 901, pipelineStageId: 21, progressStatus: 'IN_PROGRESS' } as any]
    });
    component.applicationInterviewsLoadedMap.set({ 10: true });
    component.applicationInterviewsMap.set({ 10: [] });

    expect(component.canScheduleInterview(app)).toBeTrue();

    component.applicationInterviewsMap.set({
      10: [{ id: 701, interviewDate: '31/05/2026 14:00', interviewStatus: 'SCHEDULED' } as any]
    });

    expect(component.canScheduleInterview(app)).toBeFalse();
  });

  it('does not use the display fallback to allow planning', () => {
    const app = {
      id: 10,
      campaignId: 7,
      candidateFirstName: 'Ada',
      candidateLastName: 'Lovelace',
      candidateEmail: 'ada@example.com',
      candidatePhone: '0102030405',
      candidateBirthDate: '1990-01-01',
      interviewDate: ''
    } as any;

    component.campaignStagesMap.set({
      7: [
        { id: 11, stageType: 'PRE_SCREEN', stageLabel: 'Pré-sélection' } as any,
        { id: 21, stageType: 'INTERVIEW', stageLabel: 'Entretien technique' } as any
      ]
    });
    component.applicationProgressMap.set({
      10: [
        { id: 900, pipelineStageId: 11, progressStatus: 'COMPLETED' } as any,
        { id: 901, pipelineStageId: 21, progressStatus: 'COMPLETED' } as any
      ]
    });
    component.applicationInterviewsLoadedMap.set({ 10: true });
    component.applicationInterviewsMap.set({ 10: [] });

    expect(component.canScheduleInterview(app)).toBeFalse();
  });

  it('derives the pending stat from the current runtime stage instead of only the legacy status', () => {
    component.campaignStagesMap.set({
      7: [{ id: 21, stageType: 'INTERVIEW', stageLabel: 'Entretien technique' } as any]
    });
    component.applicationProgressMap.set({
      10: [{ id: 901, pipelineStageId: 21, progressStatus: 'PENDING' } as any],
      11: [{ id: 902, pipelineStageId: 21, progressStatus: 'IN_PROGRESS' } as any]
    });

    component.applications.set([
      {
        id: 10,
        campaignId: 7,
        candidateFirstName: 'Ada',
        candidateLastName: 'Lovelace',
        candidateEmail: 'ada@example.com',
        candidatePhone: '0102030405',
        candidateBirthDate: '1990-01-01'
      } as any,
      {
        id: 11,
        campaignId: 7,
        candidateFirstName: 'Grace',
        candidateLastName: 'Hopper',
        candidateEmail: 'grace@example.com',
        candidatePhone: '0102030405',
        candidateBirthDate: '1990-01-01'
      } as any
    ]);

    expect(component.isApplicationPendingInCurrentRound(component.applications()[0])).toBeTrue();
    expect(component.isApplicationPendingInCurrentRound(component.applications()[1])).toBeFalse();
    expect(component.pendingApplications()).toBe(1);
  });

  it('uses runtime application progress for the compact pipeline fallback when stage metadata is missing', () => {
    const app = {
      id: 10,
      campaignId: 7,
      candidateFirstName: 'Ada',
      candidateLastName: 'Lovelace',
      candidateEmail: 'ada@example.com',
      candidatePhone: '0102030405',
      candidateBirthDate: '1990-01-01'
    } as any;

    component.applicationProgressMap.set({
      10: [
        { id: 901, stageOrder: 1, stageType: 'CANDIDATURE', progressStatus: 'COMPLETED', stageName: 'Candidature' } as any,
        { id: 902, stageOrder: 2, stageType: 'INTERVIEW', progressStatus: 'IN_PROGRESS', stageName: 'Entretien technique' } as any,
        { id: 903, stageOrder: 3, stageType: 'DECISION', progressStatus: 'PENDING', stageName: 'Décision finale' } as any
      ]
    });

    expect(component.getFallbackPipelineStepStatus(app, 1)).toBe('completed');
    expect(component.getFallbackPipelineStepStatus(app, 2)).toBe('active');
    expect(component.getFallbackPipelineStepStatus(app, 3)).toBe('pending');
    expect(component.getFallbackPipelineLabel(app)).toBe('Entretien technique');
  });
});