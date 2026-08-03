import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { ApplicationService } from '../../../core/services/application.service';
import { CampaignService } from '../../../core/services/campaign.service';
import { EntityPermissionService } from '../../../core/services/entity-permission.service';
import { InterviewAdminService } from '../../../core/services/interview-admin.service';
import { InterviewParticipantService } from '../../../core/services/interview-participant.service';
import { InterviewService } from '../../../core/services/interview.service';
import { PermissionService } from '../../../core/services/permission.service';
import { UserService } from '../../../core/services/user.service';
import { SourceTokenService } from '../../../services/source-token.service';
import { InterviewCreateComponent } from './interview-create';

describe('InterviewCreateComponent', () => {
  let fixture: ComponentFixture<InterviewCreateComponent>;
  let component: InterviewCreateComponent;

  beforeEach(async () => {
    localStorage.setItem('user', JSON.stringify({ id: 7 }));

    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const activatedRoute = {
      snapshot: {
        queryParamMap: convertToParamMap({
          campaignId: '5',
          applicationId: '12'
        })
      }
    };
    const interviewService = jasmine.createSpyObj<InterviewService>('InterviewService', ['createInterview']);
    const applicationService = jasmine.createSpyObj<ApplicationService>('ApplicationService', ['getApplicationsByCriteria']);
    const campaignService = jasmine.createSpyObj<CampaignService>('CampaignService', [
      'getAllCampaignsByCriteria',
      'getCampaignAccessesByUser',
      'buildCampaignAccessMap'
    ]);
    const userService = jasmine.createSpyObj<UserService>('UserService', ['getAllUsersByCriteria']);
    const entityPermissionService = jasmine.createSpyObj<EntityPermissionService>('EntityPermissionService', ['getForEntity']);
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasAnyPermission']);
    const sourceTokenService = jasmine.createSpyObj<SourceTokenService>('SourceTokenService', ['getSourceTokensByCriteria']);
    const interviewAdminService = jasmine.createSpyObj<InterviewAdminService>('InterviewAdminService', ['getCampaignEvaluatorCatalog']);
    const interviewParticipantService = jasmine.createSpyObj<InterviewParticipantService>('InterviewParticipantService', ['createParticipants']);

    campaignService.getAllCampaignsByCriteria.and.returnValue(of({
      content: [{ id: 5, campaignTitle: 'Campagne IA' }]
    } as any));
    campaignService.getCampaignAccessesByUser.and.returnValue(of([] as any));
    campaignService.buildCampaignAccessMap.and.returnValue({ 5: { canPlanify: true } } as any);
    permissionService.hasAnyPermission.and.returnValue(false);

    applicationService.getApplicationsByCriteria.and.returnValue(of({
      items: [
        {
          id: 12,
          sourceTokenId: 91,
          candidateFirstName: 'Ada',
          candidateLastName: 'Lovelace',
          candidateEmail: 'ada@example.com',
          candidatePhone: '0102030405',
          candidateBirthDate: '1815-12-10',
          currentPipelineStageType: 'INTERVIEW',
          currentPipelineProgressStatus: 'PENDING',
          interviewDate: ''
        },
        {
          id: 13,
          sourceTokenId: 91,
          candidateFirstName: 'Grace',
          candidateLastName: 'Hopper',
          candidateEmail: 'grace@example.com',
          candidatePhone: '0607080910',
          candidateBirthDate: '1906-12-09',
          currentPipelineStageType: 'PRESELECTION',
          currentPipelineProgressStatus: 'IN_PROGRESS',
          interviewDate: ''
        },
        {
          id: 14,
          sourceTokenId: 91,
          candidateFirstName: 'Katherine',
          candidateLastName: 'Johnson',
          candidateEmail: 'katherine@example.com',
          candidatePhone: '1112131415',
          candidateBirthDate: '1918-08-26',
          currentPreselectionDecisionType: 'PRE_SCREEN_ACCEPTED',
          interviewDate: ''
        }
      ]
    } as any));
    sourceTokenService.getSourceTokensByCriteria.and.returnValue(of({
      items: [{ id: 91, campaignId: 5 }]
    } as any));
    interviewAdminService.getCampaignEvaluatorCatalog.and.returnValue(of({
      campaignPermissions: [],
      evaluators: [],
      preselectedEvaluatorIds: []
    } as any));
    userService.getAllUsersByCriteria.and.returnValue(of({ content: [] } as any));
    entityPermissionService.getForEntity.and.returnValue(of({ items: [] } as any));

    await TestBed.configureTestingModule({
      imports: [InterviewCreateComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: InterviewService, useValue: interviewService },
        { provide: ApplicationService, useValue: applicationService },
        { provide: CampaignService, useValue: campaignService },
        { provide: UserService, useValue: userService },
        { provide: EntityPermissionService, useValue: entityPermissionService },
        { provide: PermissionService, useValue: permissionService },
        { provide: SourceTokenService, useValue: sourceTokenService },
        { provide: InterviewAdminService, useValue: interviewAdminService },
        { provide: InterviewParticipantService, useValue: interviewParticipantService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('user');
    fixture.destroy();
  });

  it('prefers the current interview runtime stage over the legacy status for eligibility and route prefill', () => {
    expect(component.eligibleApplications().map(app => app.id)).toEqual([12, 14]);
    expect(component.formData().selectedCandidates).toEqual([12]);

    const cards = Array.from<Element>(fixture.nativeElement.querySelectorAll('.candidate-card'));
    const runtimeCardText = cards.find(card => card.textContent?.includes('Ada Lovelace'))?.textContent || '';
    const legacyCardText = cards.find(card => card.textContent?.includes('Katherine Johnson'))?.textContent || '';

    expect(runtimeCardText).toContain('Entretien');
    expect(runtimeCardText).toContain('En attente');
    expect(legacyCardText).toContain('Pré-sélection acceptée');
    expect(legacyCardText).toContain('Fallback legacy');
  });

  it('excludes applications that already expose a non interview runtime current stage even if legacy status is accepted', () => {
    expect(component.eligibleApplications().some(app => app.id === 13)).toBeFalse();
  });
});