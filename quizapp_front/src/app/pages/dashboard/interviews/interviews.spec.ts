import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CampaignService } from '../../../core/services/campaign.service';
import { CandidateInterviewEntityService } from '../../../core/services/candidate-interview-entity.service';
import { EntityPermissionService } from '../../../core/services/entity-permission.service';
import { InterviewAdminService } from '../../../core/services/interview-admin.service';
import { InterviewParticipantService } from '../../../core/services/interview-participant.service';
import { InterviewService } from '../../../core/services/interview.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserService } from '../../../core/services/user.service';
import { InterviewsComponent } from './interviews';

describe('InterviewsComponent', () => {
  let fixture: ComponentFixture<InterviewsComponent>;
  let component: InterviewsComponent;

  beforeEach(async () => {
    const interviewService = jasmine.createSpyObj<InterviewService>('InterviewService', [
      'getAllInterviews',
      'getStatusLabel',
      'getStatusClass'
    ]);
    const applicationService = jasmine.createSpyObj<ApplicationService>('ApplicationService', ['getApplicationsByCriteria']);
    const campaignService = jasmine.createSpyObj<CampaignService>('CampaignService', ['getAllCampaignsByCriteria']);
    const candidateInterviewEntityService = jasmine.createSpyObj<CandidateInterviewEntityService>('CandidateInterviewEntityService', ['getAllByCriteria']);
    const entityPermissionService = jasmine.createSpyObj<EntityPermissionService>('EntityPermissionService', ['getForEntity']);
    const notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['error', 'success', 'warning']);
    const authService = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser']);
    const interviewParticipantService = jasmine.createSpyObj<InterviewParticipantService>('InterviewParticipantService', ['getByInterviewId', 'getAllByCriteria']);
    const userService = jasmine.createSpyObj<UserService>('UserService', ['getByCriteria']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    interviewService.getAllInterviews.and.returnValue(of({
      hasError: false,
      items: [{
        id: 18,
        applicationId: 10,
        campaignId: 5,
        applicationProgressId: 802,
        interviewRound: 2,
        pipelineStageId: 302,
        pipelineStageType: 'INTERVIEW',
        pipelineStageLabel: 'Entretien technique',
        pipelineStageOrder: 5,
        interviewDate: '31/05/2026 14:00',
        interviewStatus: 'SCHEDULED',
        interviewType: 'ONLINE',
        meetLink: 'https://meet.example.com/room'
      }]
    } as any));
    interviewService.getStatusLabel.and.callFake((status?: string) => status || 'N/A');
    interviewService.getStatusClass.and.callFake((status?: string) => (status || 'muted').toLowerCase());

    applicationService.getApplicationsByCriteria.and.returnValue(of({
      hasError: false,
      items: [{
        id: 10,
        candidateFirstName: 'Ada',
        candidateLastName: 'Lovelace',
        candidateEmail: 'ada@example.com',
        quizScorePercent: 92
      }]
    } as any));
    campaignService.getAllCampaignsByCriteria.and.returnValue(of({
      items: [{ id: 5, campaignTitle: 'Campagne IA' }]
    } as any));
    candidateInterviewEntityService.getAllByCriteria.and.returnValue(of({
      content: [{ id: 99, interviewId: 18, applicationId: 10 }]
    } as any));
    authService.getCurrentUser.and.returnValue({ id: '1' } as any);
    entityPermissionService.getForEntity.and.returnValue(of({ items: [] } as any));
    interviewParticipantService.getByInterviewId.and.returnValue(of({ items: [] } as any));
    interviewParticipantService.getAllByCriteria.and.returnValue(of({ content: [] } as any));
    userService.getByCriteria.and.returnValue(of({ content: [] } as any));

    await TestBed.configureTestingModule({
      imports: [InterviewsComponent],
      providers: [
        InterviewAdminService,
        { provide: InterviewService, useValue: interviewService },
        { provide: ApplicationService, useValue: applicationService },
        { provide: CampaignService, useValue: campaignService },
        { provide: CandidateInterviewEntityService, useValue: candidateInterviewEntityService },
        { provide: EntityPermissionService, useValue: entityPermissionService },
        { provide: NotificationService, useValue: notificationService },
        { provide: AuthService, useValue: authService },
        { provide: InterviewParticipantService, useValue: interviewParticipantService },
        { provide: UserService, useValue: userService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('renders round and stage context from the interview contract in list and detail views', () => {
    const interview = component.interviews()[0]!;
    const cardPills = Array.from<Element>(
      fixture.nativeElement.querySelectorAll('.interview-card .stage-summary__pill')
    ).map(element => element.textContent?.trim());

    expect(interview.interviewRound).toBe(2);
    expect(interview.pipelineStageLabel).toBe('Entretien technique');
    expect(component.hasInterviewOccurrenceContext(interview)).toBeTrue();
    expect(component.getInterviewProgressLabel(interview)).toBe('Occurrence #802');
    expect(cardPills).toContain('Round 2');
    expect(cardPills).toContain('Entretien technique');

    component.selectInterview(interview);
    fixture.detectChanges();

    const detailsText = fixture.nativeElement.querySelector('.interview-details')?.textContent || '';
    expect(detailsText).toContain('Round 2');
    expect(detailsText).toContain('Entretien technique');
    expect(detailsText).toContain('Occurrence #802');
  });

  it('renders round and stage context in calendar day timeline when available', () => {
    component.viewMode.set('calendar');
    component.selectedDay.set(new Date(2026, 4, 31));
    component.setCalendarView('day');
    fixture.detectChanges();

    const timelinePills = Array.from<Element>(
      fixture.nativeElement.querySelectorAll('.timeline-stage-summary .stage-summary__pill')
    ).map(element => element.textContent?.trim());

    expect(timelinePills).toContain('Round 2');
    expect(timelinePills).toContain('Entretien technique');
  });
});