import { of } from 'rxjs';
import { Router } from '@angular/router';

import { PipelineTemplatesComponent } from './pipeline-templates';
import { PipelineTemplateService } from '../../../core/services/pipeline-template.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SupportedStageType } from '../../../core/models/pipeline.interfaces';

describe('PipelineTemplatesComponent', () => {
  let component: PipelineTemplatesComponent;
  let router: jasmine.SpyObj<Router>;
  let templateService: jasmine.SpyObj<PipelineTemplateService>;
  let stageService: jasmine.SpyObj<PipelineStageService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    templateService = jasmine.createSpyObj<PipelineTemplateService>('PipelineTemplateService', ['getAllByCriteria', 'create', 'duplicate', 'setDefault', 'delete']);
    stageService = jasmine.createSpyObj<PipelineStageService>('PipelineStageService', ['getByTemplate']);
    notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['warning', 'error', 'success']);

    component = new PipelineTemplatesComponent(templateService, stageService, notificationService, router);
  });

  it('loads templates and their active stages on init', () => {
    const tpl = buildTemplate(1, 'Flux standard', false);
    (templateService.getAllByCriteria as jasmine.Spy).and.returnValue(of({ content: [tpl], totalElements: 1, totalPages: 1, size: 100, number: 0 }));
    (stageService.getByTemplate as jasmine.Spy).and.returnValue(of({ items: [
      buildStage('CANDIDATURE', 'Candidature', 1),
      buildStage('QUIZ', 'Quiz', 2),
      buildStage('DECISION', 'Decision', 3)
    ] }));

    component.loadTemplates();

    expect(templateService.getAllByCriteria).toHaveBeenCalledWith({ size: 100, isDeleted: false });
    expect(stageService.getByTemplate).toHaveBeenCalledWith(1);
    expect(component.templates().length).toBe(1);
    expect(component.getStagesCount(1)).toBe(3);
    expect(component.hasLoadedStages(1)).toBeTrue();
  });

  it('computes the preview from the active stages returned by getByTemplate (backend = actifs uniquement)', () => {
    const tpl = buildTemplate(1, 'Flux standard', false);
    (templateService.getAllByCriteria as jasmine.Spy).and.returnValue(of({ content: [tpl] }));
    (stageService.getByTemplate as jasmine.Spy).and.returnValue(of({ items: [
      buildStage('CANDIDATURE', 'Candidature', 1),
      buildStage('QUIZ', 'Quiz round 1', 2),
      buildStage('INTERVIEW', 'Entretien', 3),
      buildStage('DECISION', 'Decision', 4)
    ] }));

    component.loadTemplates();

    expect(component.getStages(1).map(stage => stage.stageType)).toEqual(['CANDIDATURE', 'QUIZ', 'INTERVIEW', 'DECISION']);
    expect(component.getTemplateReadinessIssues(tpl)).toEqual([]);
    expect(component.getTemplateReadinessState(tpl)).toEqual({ label: 'Prêt à activer', kind: 'ready' });
  });

  it('shows the loading readiness state before the stages are loaded', () => {
    const tpl = buildTemplate(1, 'Flux standard', false);
    component.templates.set([tpl]);

    expect(component.hasLoadedStages(1)).toBeFalse();
    expect(component.getTemplateReadinessState(tpl)).toEqual({ label: 'Analyse', kind: 'loading' });
    expect(component.getSetDefaultBlockedReason(tpl)).toBe('Analyse structurelle du pipeline en cours...');
  });

  it('flags an active template with issues as incomplet', () => {
    const tpl = buildTemplate(1, 'Flux incomplet', true);
    component.templates.set([tpl]);
    component.stagesMap.update(map => ({ ...map, [1]: [buildStage('CANDIDATURE', 'Candidature', 1)] }));

    expect(component.getTemplateReadinessState(tpl)).toEqual({ label: 'Incomplet', kind: 'warning' });
    expect(component.getSetDefaultBlockedReason(tpl)).toContain('Configuration incomplète');
  });

  it('flags a locked template with issues as a warning', () => {
    const tpl = { ...buildTemplate(1, 'Flux utilisé', false), isLocked: true };
    component.templates.set([tpl]);
    component.stagesMap.update(map => ({ ...map, [1]: [buildStage('CANDIDATURE', 'Candidature', 1)] }));

    expect(component.getTemplateReadinessState(tpl)).toEqual({ label: 'Écarts à corriger', kind: 'warning' });
  });

  it('returns no readiness badge for a complete active template', () => {
    const tpl = buildTemplate(1, 'Flux actif complet', true);
    component.templates.set([tpl]);
    component.stagesMap.update(map => ({ ...map, [1]: [
      buildStage('CANDIDATURE', 'Candidature', 1),
      buildStage('QUIZ', 'Quiz', 2),
      buildStage('DECISION', 'Decision', 3)
    ] }));

    expect(component.getTemplateReadinessState(tpl)).toBeNull();
  });

  it('flags an incomplete inactive template as à compléter', () => {
    const tpl = buildTemplate(1, 'Flux à compléter', false);
    component.templates.set([tpl]);
    component.stagesMap.update(map => ({ ...map, [1]: [
      buildStage('CANDIDATURE', 'Candidature', 1),
      buildStage('QUIZ', 'Quiz', 2)
    ] }));

    expect(component.getTemplateReadinessState(tpl)).toEqual({ label: 'À compléter', kind: 'incomplete' });
  });

  it('navigates to the guarded edit route when opening a template', () => {
    const tpl = buildTemplate(7, 'Flux', false);

    component.editTemplate(tpl);

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/pipeline-templates', 7, 'edit']);
  });

  it('filters templates by search query', () => {
    component.templates.set([
      buildTemplate(1, 'Flux technique', false),
      buildTemplate(2, 'Recrutement cadre', false)
    ]);

    component.searchQuery.set('technique');

    expect(component.filteredTemplates().length).toBe(1);
    expect(component.filteredTemplates()[0].templateName).toBe('Flux technique');
  });

  it('creates a template as an inactive draft and navigates to its editor', () => {
    (templateService.create as jasmine.Spy).and.returnValue(of({ hasError: false, item: { id: 9 } }));

    component.openCreateModal();
    component.createName.set('Nouveau flux');
    component.confirmCreate();

    expect(templateService.create).toHaveBeenCalledWith({ templateName: 'Nouveau flux', templateDesc: undefined, isActive: false });
    expect(notificationService.success).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/pipeline-templates', 9, 'edit']);
  });

  it('duplicates a template as an inactive draft and navigates to its editor', () => {
    const tpl = buildTemplate(1, 'Flux', false);
    (templateService.duplicate as jasmine.Spy).and.returnValue(of({ hasError: false, item: { id: 11 } }));

    component.openDuplicateModal(new Event('click'), tpl);
    component.confirmDuplicate();

    expect(templateService.duplicate).toHaveBeenCalledWith(1, 'Flux (copie)');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/pipeline-templates', 11, 'edit']);
  });

  it('sets the default template once it is ready', () => {
    const tpl = buildTemplate(1, 'Flux', true);
    component.templates.set([tpl]);
    component.stagesMap.update(map => ({ ...map, [1]: [
      buildStage('CANDIDATURE', 'Candidature', 1),
      buildStage('QUIZ', 'Quiz', 2),
      buildStage('DECISION', 'Decision', 3)
    ] }));
    (templateService.setDefault as jasmine.Spy).and.returnValue(of({ hasError: false }));
    (templateService.getAllByCriteria as jasmine.Spy).and.returnValue(of({ content: [] }));

    component.openSetDefaultConfirm(new Event('click'), tpl);
    component.confirmSetDefault();

    expect(templateService.setDefault).toHaveBeenCalledWith(1);
    expect(notificationService.success).toHaveBeenCalled();
    expect(component.showDefaultConfirm()).toBeFalse();
  });

  it('warns when trying to set an inactive template as default', () => {
    const tpl = buildTemplate(1, 'Flux brouillon', false);
    component.templates.set([tpl]);
    component.stagesMap.update(map => ({ ...map, [1]: [
      buildStage('CANDIDATURE', 'Candidature', 1),
      buildStage('QUIZ', 'Quiz', 2),
      buildStage('DECISION', 'Decision', 3)
    ] }));

    component.openSetDefaultConfirm(new Event('click'), tpl);

    expect(notificationService.warning).toHaveBeenCalled();
    expect(component.showDefaultConfirm()).toBeFalse();
  });

  it('deletes a template', () => {
    const tpl = buildTemplate(1, 'Flux', false);
    (templateService.delete as jasmine.Spy).and.returnValue(of({ hasError: false }));
    (templateService.getAllByCriteria as jasmine.Spy).and.returnValue(of({ content: [] }));

    component.openDeleteConfirm(new Event('click'), tpl);
    component.confirmDelete();

    expect(templateService.delete).toHaveBeenCalledWith(1);
    expect(notificationService.success).toHaveBeenCalled();
    expect(component.showDeleteConfirm()).toBeFalse();
  });
});

function buildTemplate(id: number, templateName: string, isActive: boolean) {
  return {
    id,
    templateName,
    templateDesc: 'Description',
    isDefault: false,
    isActive,
    isLocked: false,
    createdAt: '2026-01-01T00:00:00Z'
  };
}

function buildStage(stageType: SupportedStageType, stageLabel: string, stageOrder: number) {
  return {
    id: stageOrder * 10,
    stageType,
    stageLabel,
    stageOrder,
    isRequired: true,
    isEliminatory: false,
    isActive: true
  };
}
