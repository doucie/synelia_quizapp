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
    expect(component.editableStageTypes).not.toContain('EVALUATION');
  });

  it('keeps legacy EVALUATION selectable only for an existing legacy evaluation stage', () => {
    const legacyEvaluationStage = buildStage('EVALUATION', 'Evaluation legacy');
    component.stages.set([
      buildStage('CANDIDATURE', 'Candidature'),
      legacyEvaluationStage,
      buildStage('DECISION', 'Decision')
    ] as any);

    const options = component.getEditableStageTypeOptions(legacyEvaluationStage as any);

    expect(options.map(option => option.value)).toContain('EVALUATION');
    expect(options.filter(option => option.value === 'EVALUATION')).toHaveSize(1);
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
    emailRequired: false,
    emailAutomatic: false,
    isNew: false
  };
}