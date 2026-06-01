import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ApplicationService } from '../../../../../core/services/application.service';
import { DecisionService } from '../../../../../core/services/decision.service';
import { DashboardStatsService } from '../../../../../core/services/dashboard-stats.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { PipelineStageService } from '../../../../../core/services/pipeline-stage.service';
import { UserService } from '../../../../../core/services/user.service';
import { EntitiesDecisionsComponent } from './entities-decisions';

describe('EntitiesDecisionsComponent', () => {
  let fixture: ComponentFixture<EntitiesDecisionsComponent>;
  let component: EntitiesDecisionsComponent;
  let decisionService: jasmine.SpyObj<DecisionService>;

  beforeEach(async () => {
    decisionService = jasmine.createSpyObj<DecisionService>('DecisionService', [
      'getAllDecisionsByCriteria',
      'createDecision',
      'updateDecision',
      'deleteDecision',
      'restoreDecision'
    ]);

    const applicationService = jasmine.createSpyObj<ApplicationService>('ApplicationService', ['getAllApplicationsByCriteria']);
    const pipelineStageService = jasmine.createSpyObj<PipelineStageService>('PipelineStageService', ['getAllByCriteria']);
    const userService = jasmine.createSpyObj<UserService>('UserService', ['getByCriteria']);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const dashboardStatsService = jasmine.createSpyObj<DashboardStatsService>('DashboardStatsService', ['checkDependencies', 'checkParent']);
    const notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['error', 'success', 'warning']);

    decisionService.getAllDecisionsByCriteria.and.returnValue(of({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0
    }));
    decisionService.createDecision.and.returnValue(of({} as any));
    decisionService.updateDecision.and.returnValue(of({} as any));
    decisionService.deleteDecision.and.returnValue(of({} as any));
    decisionService.restoreDecision.and.returnValue(of({} as any));
    applicationService.getAllApplicationsByCriteria.and.returnValue(of({ content: [] } as any));
    pipelineStageService.getAllByCriteria.and.returnValue(of({ content: [] } as any));
    userService.getByCriteria.and.returnValue(of({ content: [] } as any));
    dashboardStatsService.checkDependencies.and.returnValue(of({ totalDependencies: 0 } as any));
    dashboardStatsService.checkParent.and.returnValue(of({ deletedParents: [] } as any));

    await TestBed.configureTestingModule({
      imports: [EntitiesDecisionsComponent],
      providers: [
        { provide: DecisionService, useValue: decisionService },
        { provide: ApplicationService, useValue: applicationService },
        { provide: PipelineStageService, useValue: pipelineStageService },
        { provide: UserService, useValue: userService },
        { provide: Router, useValue: router },
        { provide: DashboardStatsService, useValue: dashboardStatsService },
        { provide: NotificationService, useValue: notificationService }
      ]
    });

    TestBed.overrideComponent(EntitiesDecisionsComponent, {
      set: {
        template: ''
      }
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(EntitiesDecisionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('sends only id and justification when editing a historized cancellation', () => {
    component.editFormData = {
      id: 91,
      isCancel: true,
      applicationId: 1,
      userId: 12,
      decisionType: 'FINAL_ACCEPTED',
      decisionMode: 'CANCEL',
      pipelineStageId: 100,
      applicationProgressId: 10,
      cancelsDecisionId: 90,
      justification: 'Justification corrigée'
    } as any;

    component.validateEdit();

    expect(decisionService.updateDecision).toHaveBeenCalledWith({
      id: 91,
      justification: 'Justification corrigée'
    });
  });

  it('keeps the full payload when editing a standard decision', () => {
    component.editFormData = {
      id: 50,
      isCancel: false,
      applicationId: 1,
      userId: 12,
      decisionType: 'PRE_SCREEN_ACCEPTED',
      decisionMode: 'STANDARD',
      applicationProgressId: 10,
      justification: 'Mise à jour standard'
    } as any;

    component.validateEdit();

    expect(decisionService.updateDecision).toHaveBeenCalledWith({
      id: 50,
      isCancel: false,
      applicationId: 1,
      userId: 12,
      decisionType: 'PRE_SCREEN_ACCEPTED',
      decisionMode: 'STANDARD',
      applicationProgressId: 10,
      justification: 'Mise à jour standard'
    });
  });
});