import { ActivatedRoute, Router } from '@angular/router';

import { PipelineTemplateEditComponent } from './pipeline-template-edit';
import { NotificationService } from '../../../core/services/notification.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { PipelineTemplateService } from '../../../core/services/pipeline-template.service';

describe('PipelineTemplateEditComponent', () => {
  let component: PipelineTemplateEditComponent;

  beforeEach(() => {
    const route = {
      snapshot: {
        paramMap: {
          get: () => '1'
        }
      }
    } as unknown as ActivatedRoute;

    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const templateService = jasmine.createSpyObj<PipelineTemplateService>('PipelineTemplateService', ['getAllByCriteria', 'update']);
    const stageService = jasmine.createSpyObj<PipelineStageService>('PipelineStageService', ['getByTemplate', 'delete', 'update', 'create', 'reorder']);
    const notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['warning', 'error', 'success']);

    component = new PipelineTemplateEditComponent(
      route,
      router,
      templateService,
      stageService,
      notificationService
    );
  });

  it('does not offer EVALUATION when creating a new top-level intermediate stage', () => {
    component.stages.set([
      buildStage('CANDIDATURE', 'Candidature'),
      buildStage('DECISION', 'Decision')
    ] as any);

    component.addStage();

    expect(component.stages().map(stage => stage.stageType)).toEqual(['CANDIDATURE', 'QUIZ', 'DECISION']);
    expect(component.editableStageTypes as string[]).not.toContain('EVALUATION');
  });

  it('does not offer EVALUATION for an existing legacy evaluation stage', () => {
    const legacyEvaluationStage = buildStage('EVALUATION', 'Evaluation legacy');
    component.stages.set([
      buildStage('CANDIDATURE', 'Candidature'),
      legacyEvaluationStage,
      buildStage('DECISION', 'Decision')
    ] as any);

    const options = component.getEditableStageTypeOptions(legacyEvaluationStage as any);

    expect(options.map(option => option.value as string)).not.toContain('EVALUATION');
  });

  it('allows adding a second QUIZ round (multi-rounds)', () => {
    component.stages.set([
      buildStage('CANDIDATURE', 'Candidature'),
      buildStage('QUIZ', 'Quiz round 1'),
      buildStage('DECISION', 'Decision')
    ] as any);

    component.addStage();

    expect(component.stages().map(stage => stage.stageType)).toEqual(['CANDIDATURE', 'QUIZ', 'QUIZ', 'DECISION']);
  });

  it('still offers an already used intermediate type in editable options', () => {
    const quizRound1 = buildStage('QUIZ', 'Quiz round 1');
    component.stages.set([
      buildStage('CANDIDATURE', 'Candidature'),
      quizRound1,
      buildStage('DECISION', 'Decision')
    ] as any);

    const options = component.getEditableStageTypeOptions(quizRound1 as any);

    expect(options.map(option => option.value as string)).toContain('QUIZ');
    expect(options.map(option => option.value as string)).toContain('INTERVIEW');
    expect(options.map(option => option.value as string)).not.toContain('CANDIDATURE');
    expect(options.map(option => option.value as string)).not.toContain('DECISION');
  });

  it('reports no duplicated-singleton readiness issue for two QUIZ stages', () => {
    component.stages.set([
      { ...buildStage('CANDIDATURE', 'Candidature'), stageOrder: 1 },
      { ...buildStage('QUIZ', 'Quiz round 1'), stageOrder: 2 },
      { ...buildStage('QUIZ', 'Quiz round 2'), stageOrder: 3 },
      { ...buildStage('DECISION', 'Decision'), stageOrder: 4 }
    ] as any);

    const issues = component.readinessIssues();

    expect(issues.length).toBe(0);
  });
});

function buildStage(stageType: string, stageLabel: string) {
  return {
    stageType,
    stageLabel,
    stageOrder: 1,
    isRequired: true,
    allowSkip: false,
    isEliminatory: false,
    isNew: false
  };
}