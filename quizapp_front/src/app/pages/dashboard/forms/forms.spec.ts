import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { FormsComponent } from './forms';
import { FormService } from '../../../core/services/form.service';
import { CampaignService } from '../../../core/services/campaign.service';
import { FormVersionService } from '../../../core/services/form-version.service';
import { CampaignFormService } from '../../../core/services/campaign-form.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

describe('FormsComponent', () => {
  let fixture: ComponentFixture<FormsComponent>;
  let component: FormsComponent;
  let formService: jasmine.SpyObj<FormService>;
  let campaignService: jasmine.SpyObj<CampaignService>;
  let formVersionService: jasmine.SpyObj<FormVersionService>;
  let campaignFormService: jasmine.SpyObj<CampaignFormService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    formService = jasmine.createSpyObj<FormService>('FormService', ['getAllByCriteria', 'create', 'update', 'delete']);
    campaignService = jasmine.createSpyObj<CampaignService>('CampaignService', ['getAllCampaignsByCriteria']);
    formVersionService = jasmine.createSpyObj<FormVersionService>('FormVersionService', ['getAllByCriteria']);
    campaignFormService = jasmine.createSpyObj<CampaignFormService>('CampaignFormService', ['getAllByCriteria']);
    notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'error', 'warning']);

    formService.getAllByCriteria.and.returnValue(of({ content: [] } as any));
    campaignService.getAllCampaignsByCriteria.and.returnValue(of({ content: [] } as any));
    formVersionService.getAllByCriteria.and.returnValue(of({ content: [] } as any));
    campaignFormService.getAllByCriteria.and.returnValue(of({ content: [] } as any));

    await TestBed.configureTestingModule({
      imports: [FormsComponent],
      providers: [
        { provide: FormService, useValue: formService },
        { provide: CampaignService, useValue: campaignService },
        { provide: FormVersionService, useValue: formVersionService },
        { provide: CampaignFormService, useValue: campaignFormService },
        { provide: AuthService, useValue: { currentUser$: of({ adminMode: true }) } },
        { provide: NotificationService, useValue: notificationService }
      ]
    });
    TestBed.overrideComponent(FormsComponent, {
      set: {
        template: ''
      }
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(FormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('flags a shared timing warning when a timed form is linked to multiple campaigns', () => {
    const form = { id: 10, formName: 'Quiz Java', isTimed: true, isActive: true } as any;
    component.campaignFormLinks.set([
      { id: 1, formId: 10, campaignId: 101, campaignName: 'Campagne A', key: 'cf-1' },
      { id: 2, formId: 10, campaignId: 102, campaignName: 'Campagne B', key: 'cf-2' }
    ]);

    expect(component.hasSharedTimingWarning(form)).toBeTrue();
  });

  it('does not flag a shared timing warning for an untimed or unshared form', () => {
    const untimedSharedForm = { id: 11, formName: 'Quiz Front', isTimed: false, isActive: true } as any;
    const timedSingleCampaignForm = { id: 12, formName: 'Quiz Back', isTimed: true, isActive: true } as any;

    component.campaignFormLinks.set([
      { id: 3, formId: 11, campaignId: 201, campaignName: 'Campagne X', key: 'cf-3' },
      { id: 4, formId: 11, campaignId: 202, campaignName: 'Campagne Y', key: 'cf-4' },
      { id: 5, formId: 12, campaignId: 203, campaignName: 'Campagne Z', key: 'cf-5' }
    ]);

    expect(component.hasSharedTimingWarning(untimedSharedForm)).toBeFalse();
    expect(component.hasSharedTimingWarning(timedSingleCampaignForm)).toBeFalse();
  });

  it('does not infer linked campaigns from legacy form campaignId when no campaign_form link exists', () => {
    const legacyOnlyForm = {
      id: 15,
      formName: 'Quiz Legacy',
      campaignId: 301,
      isTimed: false,
      isActive: true,
      isDeleted: false
    } as any;

    component.forms.set([legacyOnlyForm]);
    component.campaigns.set([{ id: 301, campaignTitle: 'Campagne Legacy' } as any]);
    component.campaignFormLinks.set([]);

    expect(component.getLinkedCampaignCount(legacyOnlyForm)).toBe(0);
    expect(component.getLinkedCampaignNames(legacyOnlyForm)).toEqual([]);
  });

  it('filters by campaign only from campaign_form links, not from legacy form campaignId', () => {
    const legacyOnlyForm = {
      id: 16,
      formName: 'Quiz Migration',
      campaignId: 302,
      isTimed: false,
      isActive: true,
      isDeleted: false
    } as any;

    component.forms.set([legacyOnlyForm]);
    component.campaigns.set([{ id: 302, campaignTitle: 'Campagne Legacy' } as any]);
    component.campaignFormLinks.set([]);

    component.filterCampaignId.set(302);
    component.searchQuery.set('legacy');

    expect(component.filteredForms()).toEqual([]);
  });

  it('creates a form without requiring a legacy campaignId', () => {
    formService.create.and.returnValue(of({ items: [{ id: 77 }] } as any));

    component.formState.set({
      formName: 'Nouveau formulaire',
      formDesc: 'Sans campagne initiale',
      isActive: true
    });

    component.saveForm();

    expect(notificationService.error).not.toHaveBeenCalled();
    expect(formService.create).toHaveBeenCalledWith({
      formName: 'Nouveau formulaire',
      formDesc: 'Sans campagne initiale',
      isActive: true
    });
  });

  it('updates a form without forwarding the legacy campaignId', () => {
    formService.update.and.returnValue(of({ items: [{ id: 88 }] } as any));

    component.isEditMode.set(true);
    component.formState.set({
      id: 88,
      formName: 'Formulaire modifie',
      formDesc: 'Edition sans reassociation legacy',
      isActive: false
    });

    component.saveForm();

    expect(notificationService.error).not.toHaveBeenCalled();
    expect(formService.update).toHaveBeenCalledWith({
      id: 88,
      formName: 'Formulaire modifie',
      formDesc: 'Edition sans reassociation legacy',
      isActive: false
    });
  });
});