import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { CampaignFormComponent } from './campaign-form';
import { CampaignService } from '../../../core/services/campaign.service';
import { UserService } from '../../../core/services/user.service';
import { SpecialityService } from '../../../core/services/speciality.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { PipelineTemplateService } from '../../../core/services/pipeline-template.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { ApplicationProgressService } from '../../../core/services/application-progress.service';
import { FormService } from '../../../core/services/form.service';
import { CampaignFormService } from '../../../core/services/campaign-form.service';
import { FormVersionService } from '../../../core/services/form-version.service';
import { NotificationService } from '../../../core/services/notification.service';

describe('CampaignFormComponent', () => {
  let fixture: ComponentFixture<CampaignFormComponent>;
  let component: CampaignFormComponent;
  let routeParams$: BehaviorSubject<Record<string, unknown>>;
  let campaignService: jasmine.SpyObj<CampaignService>;
  let userService: jasmine.SpyObj<UserService>;
  let specialityService: jasmine.SpyObj<SpecialityService>;
  let authService: jasmine.SpyObj<AuthService>;
  let pipelineTemplateService: jasmine.SpyObj<PipelineTemplateService>;
  let pipelineStageService: jasmine.SpyObj<PipelineStageService>;
  let applicationProgressService: jasmine.SpyObj<ApplicationProgressService>;
  let formService: jasmine.SpyObj<FormService>;
  let campaignFormService: jasmine.SpyObj<CampaignFormService>;
  let formVersionService: jasmine.SpyObj<FormVersionService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routeParams$ = new BehaviorSubject<Record<string, unknown>>({});
    campaignService = jasmine.createSpyObj<CampaignService>('CampaignService', ['getCampaignById', 'getCampaignAccess', 'updateCampaign', 'createCampaign', 'saveCampaignAccess', 'createNotification']);
    userService = jasmine.createSpyObj<UserService>('UserService', ['getAllUsersByCriteria']);
    specialityService = jasmine.createSpyObj<SpecialityService>('SpecialityService', ['getAll', 'getById']);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser']);
    pipelineTemplateService = jasmine.createSpyObj<PipelineTemplateService>('PipelineTemplateService', ['getAllByCriteria', 'duplicate']);
    pipelineStageService = jasmine.createSpyObj<PipelineStageService>('PipelineStageService', ['getByTemplate']);
    applicationProgressService = jasmine.createSpyObj<ApplicationProgressService>('ApplicationProgressService', ['getMigratableCandidates', 'migrateMultipleCandidates']);
    formService = jasmine.createSpyObj<FormService>('FormService', ['getAllByCriteria', 'syncCampaignLinks', 'duplicateForCampaign']);
    campaignFormService = jasmine.createSpyObj<CampaignFormService>('CampaignFormService', ['getLinks']);
    formVersionService = jasmine.createSpyObj<FormVersionService>('FormVersionService', ['getAllByCriteria']);
    notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'warning', 'error']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    campaignService.getCampaignById.and.returnValue(of({} as any));
    campaignService.getCampaignAccess.and.returnValue(of([]));
    campaignService.updateCampaign.and.returnValue(of({ items: [{ id: 1 }] } as any));
    campaignService.createCampaign.and.returnValue(of({ items: [{ id: 1 }] } as any));
    campaignService.saveCampaignAccess.and.returnValue(of({}));
    campaignService.createNotification.and.returnValue(of({}));
    userService.getAllUsersByCriteria.and.returnValue(of({ content: [] } as any));
    specialityService.getAll.and.returnValue(of({ items: [], totalElements: 0 } as any));
    specialityService.getById.and.returnValue(of({ id: 1 } as any));
    authService.getCurrentUser.and.returnValue({ id: '1', role: 'admin' } as any);
    pipelineTemplateService.getAllByCriteria.and.returnValue(of({ content: [] } as any));
    pipelineTemplateService.duplicate.and.returnValue(of({ item: { id: 9 } } as any));
    pipelineStageService.getByTemplate.and.returnValue(of({ items: [] } as any));
    applicationProgressService.getMigratableCandidates.and.returnValue(of({ count: 0, migratableApplicationIds: [] } as any));
    applicationProgressService.migrateMultipleCandidates.and.returnValue(of({
      hasError: false,
      status: { code: '200', message: 'ok' },
      items: []
    } as any));
    formService.getAllByCriteria.and.returnValue(of({ content: [] } as any));
    formService.syncCampaignLinks.and.returnValue(of({}));
    formService.duplicateForCampaign.and.returnValue(of({ id: 201, formName: 'Copie' } as any));
    campaignFormService.getLinks.and.returnValue(of([]));
    formVersionService.getAllByCriteria.and.returnValue(of({ content: [] } as any));

    await TestBed.configureTestingModule({
      imports: [CampaignFormComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params: routeParams$.asObservable() } },
        { provide: Router, useValue: router },
        { provide: CampaignService, useValue: campaignService },
        { provide: UserService, useValue: userService },
        { provide: SpecialityService, useValue: specialityService },
        { provide: AuthService, useValue: authService },
        { provide: PipelineTemplateService, useValue: pipelineTemplateService },
        { provide: PipelineStageService, useValue: pipelineStageService },
        { provide: ApplicationProgressService, useValue: applicationProgressService },
        { provide: FormService, useValue: formService },
        { provide: CampaignFormService, useValue: campaignFormService },
        { provide: FormVersionService, useValue: formVersionService },
        { provide: NotificationService, useValue: notificationService }
      ]
    });
    TestBed.overrideComponent(CampaignFormComponent, {
      set: {
        template: ''
      }
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(CampaignFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('computes shared publication impacts excluding the current campaign when possible', () => {
    component.campaignId = 10;
    component.selectedForms.set([
      { id: 5, formName: 'Quiz Java', isActive: true }
    ] as any);
    component.campaignFormLinks.set([
      { id: 1, formId: 5, campaignId: 10, campaignName: 'Campagne Courante', key: 'cf-1' },
      { id: 2, formId: 5, campaignId: 20, campaignName: 'Campagne B', key: 'cf-2' },
      { id: 3, formId: 5, campaignId: 30, campaignName: 'Campagne C', key: 'cf-3' }
    ]);
    component.formVersions.set([
      { id: 50, formId: 5, isPublished: true } as any
    ]);

    expect(component.hasSharedPublicationWarning(component.selectedForms()[0])).toBeTrue();
    expect(component.getSharedImpactCampaignNames(component.selectedForms()[0])).toEqual(['Campagne B', 'Campagne C']);
    expect(component.sharedPublicationImpacts()).toEqual([
      {
        formLabel: 'Quiz Java',
        impactedCampaignNames: ['Campagne B', 'Campagne C']
      }
    ]);
  });

  it('falls back to all linked campaign names when the current campaign is unknown', () => {
    const form = { id: 7, formName: 'Quiz Front', isActive: true } as any;
    component.selectedForms.set([form]);
    component.campaignFormLinks.set([
      { id: 4, formId: 7, campaignId: 11, campaignName: 'Campagne X', key: 'cf-4' },
      { id: 5, formId: 7, campaignId: 12, campaignName: 'Campagne Y', key: 'cf-5' }
    ]);
    component.formVersions.set([
      { id: 70, formId: 7, isPublished: true } as any
    ]);

    expect(component.getSharedImpactCampaignNames(form)).toEqual(['Campagne X', 'Campagne Y']);
  });

  it('queues an explicit duplication for the selected campaign form', () => {
    component.campaignId = 44;
    component.selectedForms.set([
      { id: 8, formName: 'Quiz Mutualise', isActive: true, campaignId: 12 } as any
    ]);

    component.duplicateCampaignForm(0, component.selectedForms()[0]);

    expect(component.isPendingFormDuplication(component.selectedForms()[0])).toBeTrue();
    expect(component.selectedForms()[0].duplicateSourceFormId).toBe(8);
    expect(component.selectedForms()[0].campaignId).toBe(44);
    expect(component.selectedForms()[0].formName).toContain('copie');
    expect(notificationService.success).toHaveBeenCalledWith(
      'Duplication planifiée',
      'Une copie indépendante sera créée lors du prochain enregistrement de la campagne.'
    );
  });

  it('does not keep a legacy form campaignId in queued duplication state when the campaign is not yet created', () => {
    component.campaignId = null;
    component.selectedForms.set([
      { id: 9, formName: 'Quiz Brouillon', isActive: true, campaignId: 18 } as any
    ]);

    component.duplicateCampaignForm(0, component.selectedForms()[0]);

    expect(component.selectedForms()[0].duplicateSourceFormId).toBe(9);
    expect(component.selectedForms()[0].campaignId).toBeUndefined();
  });
});