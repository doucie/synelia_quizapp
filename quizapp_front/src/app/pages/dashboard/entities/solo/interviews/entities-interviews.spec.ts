import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ApplicationService } from '../../../../../core/services/application.service';
import { CampaignService } from '../../../../../core/services/campaign.service';
import { CandidateInterviewEntityService } from '../../../../../core/services/candidate-interview-entity.service';
import { DashboardStatsService } from '../../../../../core/services/dashboard-stats.service';
import { EntityPermissionService } from '../../../../../core/services/entity-permission.service';
import { InterviewService } from '../../../../../core/services/interview.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { EntitiesInterviewsComponent } from './entities-interviews';

describe('EntitiesInterviewsComponent', () => {
  let fixture: ComponentFixture<EntitiesInterviewsComponent>;
  let component: EntitiesInterviewsComponent;

  beforeEach(async () => {
    const interviewService = jasmine.createSpyObj<InterviewService>('InterviewService', [
      'getAllInterviewsByCriteria',
      'createInterview',
      'updateInterview',
      'deleteInterview',
      'restoreInterview'
    ]);
    const entityPermissionService = jasmine.createSpyObj<EntityPermissionService>('EntityPermissionService', ['getForEntity']);
    const candidateInterviewEntityService = jasmine.createSpyObj<CandidateInterviewEntityService>('CandidateInterviewEntityService', ['getAllByCriteria']);
    const campaignService = jasmine.createSpyObj<CampaignService>('CampaignService', ['getAllCampaignsByCriteria']);
    const applicationService = jasmine.createSpyObj<ApplicationService>('ApplicationService', ['getAllApplicationsByCriteria']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const dashboardStatsService = jasmine.createSpyObj<DashboardStatsService>('DashboardStatsService', ['checkDependencies', 'checkParent']);
    const notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['error', 'success', 'warning']);

    interviewService.getAllInterviewsByCriteria.and.returnValue(of({
      content: [{
        id: 18,
        interviewDate: '2026-05-31T14:00:00Z',
        interviewType: 'ONLINE',
        interviewStatus: 'SCHEDULED',
        meetLink: 'https://meet.example.com/room',
        campaignId: 5,
        campaignTitle: 'Campagne IA',
        applicationId: 10,
        candidateName: 'Ada Lovelace',
        applicationProgressId: 802,
        pipelineStageId: 302,
        pipelineStageType: 'INTERVIEW',
        pipelineStageLabel: 'Entretien technique',
        pipelineStageOrder: 5,
        interviewRound: 2
      }],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0
    } as any));
    interviewService.createInterview.and.returnValue(of({} as any));
    interviewService.updateInterview.and.returnValue(of({} as any));
    interviewService.deleteInterview.and.returnValue(of({} as any));
    interviewService.restoreInterview.and.returnValue(of({} as any));
    entityPermissionService.getForEntity.and.returnValue(of({ items: [] } as any));
    candidateInterviewEntityService.getAllByCriteria.and.returnValue(of({
      content: [{
        id: 91,
        interviewId: 18,
        applicationId: 10,
        interviewDate: '31/05/2026 14:00',
        interviewStatus: 'CANCELLED',
        interviewDuration: 45,
        alternativeDateRequested: '03/06/2026 10:30',
        declineReason: null
      }]
    } as any));
    campaignService.getAllCampaignsByCriteria.and.returnValue(of({ content: [{ id: 5, campaignTitle: 'Campagne IA' }] } as any));
    applicationService.getAllApplicationsByCriteria.and.returnValue(of({ content: [{ id: 10, candidateFirstName: 'Ada', candidateLastName: 'Lovelace' }] } as any));
    dashboardStatsService.checkDependencies.and.returnValue(of({ totalDependencies: 0 } as any));
    dashboardStatsService.checkParent.and.returnValue(of({ deletedParents: [] } as any));

    await TestBed.configureTestingModule({
      imports: [EntitiesInterviewsComponent],
      providers: [
        { provide: InterviewService, useValue: interviewService },
        { provide: EntityPermissionService, useValue: entityPermissionService },
        { provide: CandidateInterviewEntityService, useValue: candidateInterviewEntityService },
        { provide: CampaignService, useValue: campaignService },
        { provide: ApplicationService, useValue: applicationService },
        { provide: Router, useValue: router },
        { provide: DashboardStatsService, useValue: dashboardStatsService },
        { provide: NotificationService, useValue: notificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EntitiesInterviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('surfaces pipeline context and occurrence in the admin table', () => {
    const headersText = fixture.nativeElement.querySelector('thead')?.textContent || '';
    const rowText = fixture.nativeElement.querySelector('tbody')?.textContent || '';

    expect(component.allColumns.some((column) => column.key === 'pipelineContext')).toBeTrue();
    expect(component.allColumns.some((column) => column.key === 'applicationProgressId')).toBeTrue();
    expect(headersText).toContain('Contexte pipeline');
    expect(headersText).toContain('Occurrence');
    expect(rowText).toContain('Round 2');
    expect(rowText).toContain('Entretien technique');
    expect(rowText).toContain('Occurrence #802');
  });

  it('exposes occurrence-aware detail fields from the interview contract', () => {
    const interview = component.items()[0]!;
    const applicationProgressField = component.detailFields.find((field) => field.key === 'applicationProgressId');
    const pipelineStageField = component.detailFields.find((field) => field.key === 'pipelineStageLabel');
    const roundField = component.detailFields.find((field) => field.key === 'interviewRound');

    expect(component.getInterviewContextDisplay(interview)).toBe('Round 2 - Entretien technique');
    expect(applicationProgressField?.displayValue?.(interview, interview.applicationProgressId)).toBe('Occurrence #802');
    expect(pipelineStageField?.displayValue?.(interview, interview.pipelineStageLabel)).toBe('Entretien technique (INTERVIEW, ordre 5)');
    expect(roundField?.displayValue?.(interview, interview.interviewRound)).toBe('Round 2');
  });

  it('renders candidate response details in the expanded candidates tab', () => {
    component.toggleExpansion(18);
    component.setChildTab(18, 'candidates');
    fixture.detectChanges();

    const expandedText = fixture.nativeElement.querySelector('.expansion-content')?.textContent || '';

    expect(expandedText).toContain('Ada Lovelace');
    expect(expandedText).toContain('Entretien: 31/05/2026 14:00');
    expect(expandedText).toContain('Annulé');
    expect(expandedText).toContain('45 min');
    expect(expandedText).toContain('Demande de replanification');
    expect(expandedText).toContain('Date demandée: 03/06/2026 10:30');
  });
});