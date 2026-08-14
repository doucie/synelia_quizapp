import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { PipelineTemplateEditComponent } from './pipeline-template-edit';
import { NotificationService } from '../../../core/services/notification.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { PipelineTemplateService } from '../../../core/services/pipeline-template.service';

describe('PipelineTemplateEditComponent', () => {
  let component: PipelineTemplateEditComponent;
  let router: jasmine.SpyObj<Router>;
  let templateService: jasmine.SpyObj<PipelineTemplateService>;
  let stageService: jasmine.SpyObj<PipelineStageService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    const route = {
      snapshot: {
        paramMap: {
          get: () => '1'
        }
      }
    } as unknown as ActivatedRoute;

    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    templateService = jasmine.createSpyObj<PipelineTemplateService>('PipelineTemplateService', ['getAllByCriteria', 'update']);
    stageService = jasmine.createSpyObj<PipelineStageService>('PipelineStageService', ['getByTemplate', 'delete', 'update', 'create', 'reorder', 'saveTemplateStages']);
    notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['warning', 'error', 'success']);

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

  it('saves a locked template through the bulk saveTemplateStages endpoint', () => {
    (component as any).templateId = 1;
    component.template.set({ id: 1, templateName: 'Pipeline utilisé', isLocked: true, isActive: false } as any);
    component.templateName.set('Pipeline utilisé');
    component.templateActive.set(false);
    component.stages.set([
      { ...buildStage('CANDIDATURE', 'Candidature'), stageOrder: 1, uid: 'c' },
      { ...buildStage('QUIZ', 'Quiz round 1'), stageOrder: 2, uid: 'q', id: 21 },
      { ...buildStage('DECISION', 'Decision'), stageOrder: 3, uid: 'd' }
    ] as any);

    (stageService.saveTemplateStages as jasmine.Spy).and.returnValue(of({ hasError: false }));
    (templateService.update as jasmine.Spy).and.returnValue(of({ hasError: false }));
    (templateService.getAllByCriteria as jasmine.Spy).and.returnValue(of({ content: [] }));
    (stageService.getByTemplate as jasmine.Spy).and.returnValue(of({ items: [] }));

    component.save();

    expect(stageService.saveTemplateStages).toHaveBeenCalledWith(1, jasmine.any(Array));
    expect(notificationService.warning).not.toHaveBeenCalled();
  });

  it('blocks editing the fields of a stage already reached by candidates', () => {
    const lockedStage = { ...buildStage('QUIZ', 'Quiz round 1'), uid: 'locked', isLocked: true };
    component.stages.set([lockedStage] as any);

    component.updateStageField(0, 'stageLabel', 'Changed');

    expect(component.stages()[0].stageLabel).toBe('Quiz round 1');
    expect(component.isStageLocked(component.stages()[0])).toBeTrue();
    expect(component.getStageLockHint(component.stages()[0])).toBeTruthy();
  });

  it('allows reordering a locked stage but keeps fixed boundary stages fixed', () => {
    const lockedQuiz = { ...buildStage('QUIZ', 'Quiz round 1'), uid: 'locked', isLocked: true };
    const fixedStage = { ...buildStage('CANDIDATURE', 'Candidature'), uid: 'c' };
    component.stages.set([lockedQuiz, fixedStage] as any);

    expect(component.isStageReorderable(lockedQuiz as any)).toBeTrue();
    expect(component.isStageReorderable(fixedStage as any)).toBeFalse();
  });

  it('removes a stage locally without calling the delete API (bulk diff applies the removal)', () => {
    component.stages.set([
      { ...buildStage('CANDIDATURE', 'Candidature'), stageOrder: 1, uid: 'c' },
      { ...buildStage('QUIZ', 'Quiz round 1'), stageOrder: 2, uid: 'q', id: 21 },
      { ...buildStage('DECISION', 'Decision'), stageOrder: 3, uid: 'd' }
    ] as any);
    component.stageToDeleteIndex.set(1);
    component.showDeleteStageConfirm.set(true);

    component.confirmDeleteStage();

    expect(component.stages().map(stage => stage.uid)).toEqual(['c', 'd']);
    expect(stageService.delete).not.toHaveBeenCalled();
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