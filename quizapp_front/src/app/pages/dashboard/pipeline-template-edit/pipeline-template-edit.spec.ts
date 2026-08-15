import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { PipelineTemplateEditComponent } from './pipeline-template-edit';
import { NotificationService } from '../../../core/services/notification.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { PipelineTemplateService } from '../../../core/services/pipeline-template.service';
import { PipelineStageNotificationRuleService } from '../../../core/services/pipeline-stage-notification-rule.service';
import { EmailTemplateService } from '../../../core/services/email-template.service';
import { EvaluationGridService } from '../../../core/services/evaluation-grid.service';

describe('PipelineTemplateEditComponent', () => {
  let component: PipelineTemplateEditComponent;
  let router: jasmine.SpyObj<Router>;
  let templateService: jasmine.SpyObj<PipelineTemplateService>;
  let stageService: jasmine.SpyObj<PipelineStageService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let ruleService: jasmine.SpyObj<PipelineStageNotificationRuleService>;
  let emailTemplateService: jasmine.SpyObj<EmailTemplateService>;
  let gridService: jasmine.SpyObj<EvaluationGridService>;

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
    ruleService = jasmine.createSpyObj<PipelineStageNotificationRuleService>('PipelineStageNotificationRuleService', ['getByStage', 'saveStageRules']);
    emailTemplateService = jasmine.createSpyObj<EmailTemplateService>('EmailTemplateService', ['getByCriteria']);
    gridService = jasmine.createSpyObj<EvaluationGridService>('EvaluationGridService', ['getTemplates']);

    component = new PipelineTemplateEditComponent(
      route,
      router,
      templateService,
      stageService,
      notificationService,
      ruleService,
      emailTemplateService,
      gridService
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

  it('warns and does not load rules for a not-yet-saved stage', () => {
    component.stages.set([
      { ...buildStage('QUIZ', 'Quiz round 1'), uid: 'q' }
    ] as any);

    component.openRuleEditor(0);

    expect(ruleService.getByStage).not.toHaveBeenCalled();
    expect(notificationService.warning).toHaveBeenCalled();
  });

  it('loads rules when opening the rule editor of a saved stage', () => {
    (ruleService.getByStage as jasmine.Spy).and.returnValue(of({ hasError: false, items: [{ id: 1, emailTemplateId: 3 }] }));
    component.stages.set([
      { ...buildStage('QUIZ', 'Quiz round 1'), uid: 'q', id: 21 }
    ] as any);

    component.openRuleEditor(0);

    expect(ruleService.getByStage).toHaveBeenCalledWith(21);
    expect(component.ruleDraft()).toHaveSize(1);
  });

  it('adds a rule to the draft through the rule form', () => {
    component.ruleDraft.set([]);
    component.ruleForm.set(null);
    component.ruleFormOpen.set(false);

    component.startAddRule();
    component.updateRuleForm('emailTemplateId', 3);
    component.updateRuleForm('outcomeCode', 'DECISION');
    component.updateRuleForm('isRequired', true);
    component.applyRuleForm();

    expect(component.ruleDraft()).toHaveSize(1);
    expect(component.ruleDraft()[0].emailTemplateId).toBe(3);
    expect(component.ruleDraft()[0].isRequired).toBeTrue();
    expect(component.ruleFormOpen()).toBeFalse();
  });

  it('rejects a rule form without an email template', () => {
    component.startAddRule();
    component.applyRuleForm();

    expect(component.ruleDraft()).toHaveSize(0);
    expect(notificationService.warning).toHaveBeenCalled();
  });

  it('removes a rule from the draft', () => {
    component.ruleDraft.set([{ id: 1, triggerCode: 'STAGE_EMAIL', emailTemplateId: 3 }]);
    component.removeRule(0);

    expect(component.ruleDraft()).toHaveSize(0);
  });

  it('saves the draft rules as a bulk replacement for the stage', () => {
    (ruleService.saveStageRules as jasmine.Spy).and.returnValue(of({ hasError: false }));
    component.stages.set([
      { ...buildStage('QUIZ', 'Quiz round 1'), uid: 'q', id: 21 }
    ] as any);
    component.ruleEditorStageIndex.set(0);
    component.ruleDraft.set([
      { id: 1, triggerCode: 'STAGE_EMAIL', emailTemplateId: 3, isRequired: true },
      { triggerCode: 'STAGE_EMAIL', emailTemplateId: 4 }
    ]);

    component.saveRules();

    expect(ruleService.saveStageRules).toHaveBeenCalledWith(21, jasmine.any(Array));
    expect(component.ruleEditorStageIndex()).toBeNull();
  });

  it('includes the evaluation grid version in the stage payload and clears it when the type leaves INTERVIEW', () => {
    const stage: any = {
      ...buildStage('INTERVIEW', 'Entretien'),
      uid: 'i',
      id: 25,
      evaluationGridTemplateVersionId: 500
    };
    component.stages.set([stage]);

    component.updateStageField(0, 'stageType', 'QUIZ');

    expect(component.stages()[0].evaluationGridTemplateVersionId).toBeUndefined();
    expect(component.stages()[0].stageType).toBe('QUIZ');

    const payload = (component as any).toStagePayload(component.stages()[0]);
    expect(payload.evaluationGridTemplateVersionId).toBeUndefined();
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