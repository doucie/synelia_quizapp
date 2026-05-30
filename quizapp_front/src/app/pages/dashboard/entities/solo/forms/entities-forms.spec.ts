import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';

import { EntitiesFormsComponent } from './entities-forms';
import { FormService } from '../../../../../core/services/form.service';
import { FormVersionService } from '../../../../../core/services/form-version.service';
import { CampaignService } from '../../../../../core/services/campaign.service';
import { DashboardStatsService } from '../../../../../core/services/dashboard-stats.service';
import { NotificationService } from '../../../../../core/services/notification.service';

describe('EntitiesFormsComponent', () => {
  let fixture: ComponentFixture<EntitiesFormsComponent>;
  let component: EntitiesFormsComponent;
  let formService: jasmine.SpyObj<FormService>;

  beforeEach(async () => {
    formService = jasmine.createSpyObj<FormService>('FormService', ['getAllByCriteria', 'create', 'update', 'delete', 'restore']);
    const formVersionService = jasmine.createSpyObj<FormVersionService>('FormVersionService', ['getAllByCriteria']);
    const campaignService = jasmine.createSpyObj<CampaignService>('CampaignService', ['getAllCampaignsByCriteria']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const dashboardStatsService = jasmine.createSpyObj<DashboardStatsService>('DashboardStatsService', ['checkDependencies']);
    const notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['error', 'success', 'warning']);

    formService.getAllByCriteria.and.returnValue(of({ content: [], totalElements: 0, totalPages: 0 } as any));
    formService.create.and.returnValue(of({} as any));
    formService.update.and.returnValue(of({} as any));
    formVersionService.getAllByCriteria.and.returnValue(of({ content: [] } as any));
    campaignService.getAllCampaignsByCriteria.and.returnValue(of({ content: [] } as any));
    dashboardStatsService.checkDependencies.and.returnValue(of({ totalDependencies: 0 } as any));

    await TestBed.configureTestingModule({
      imports: [EntitiesFormsComponent],
      providers: [
        { provide: FormService, useValue: formService },
        { provide: FormVersionService, useValue: formVersionService },
        { provide: CampaignService, useValue: campaignService },
        { provide: Router, useValue: router },
        { provide: DashboardStatsService, useValue: dashboardStatsService },
        { provide: NotificationService, useValue: notificationService }
      ]
    });

    TestBed.overrideComponent(EntitiesFormsComponent, {
      set: {
        template: ''
      }
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(EntitiesFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('strips legacy campaignId from create payloads', () => {
    component.createFormData = {
      formName: 'Formulaire technique',
      formDesc: 'Creation sans liaison legacy',
      campaignId: 14,
      isActive: true
    } as any;

    component.validateCreate();

    expect(formService.create).toHaveBeenCalledWith({
      formName: 'Formulaire technique',
      formDesc: 'Creation sans liaison legacy',
      isActive: true
    });
  });

  it('strips legacy campaignId from update payloads', () => {
    component.editFormData = {
      id: 22,
      formName: 'Formulaire existant',
      formDesc: 'Edition sans reassociation directe',
      campaignId: 18,
      isActive: false
    } as any;

    component.validateEdit();

    expect(formService.update).toHaveBeenCalledWith({
      id: 22,
      formName: 'Formulaire existant',
      formDesc: 'Edition sans reassociation directe',
      isActive: false
    });
  });
});