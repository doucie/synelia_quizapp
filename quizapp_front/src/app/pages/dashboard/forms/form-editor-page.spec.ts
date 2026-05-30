import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { FormEditorPageComponent } from './form-editor-page';
import { AnswerService } from '../../../core/services/answer.service';
import { CampaignFormService } from '../../../core/services/campaign-form.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { FormService } from '../../../core/services/form.service';
import { FormQuestionsService } from '../../../core/services/form-questions.service';
import { FormVersionService } from '../../../core/services/form-version.service';
import { NotificationService } from '../../../core/services/notification.service';
import { QuestionService } from '../../../core/services/question.service';
import { SpecialityService } from '../../../core/services/speciality.service';

interface SetupOptions {
  routeId?: string;
  adminMode?: boolean;
  formsResponse?: any;
  linksResponse?: any[];
  versionsResponse?: any;
  formQuestionsResponse?: any;
  questionResponse?: any;
  answerResponse?: any;
  specialitiesResponse?: any;
  loadError?: Error;
}

describe('FormEditorPageComponent', () => {
  let fixture: ComponentFixture<FormEditorPageComponent>;
  let component: FormEditorPageComponent;
  let formService: jasmine.SpyObj<FormService>;
  let campaignFormService: jasmine.SpyObj<CampaignFormService>;
  let formVersionService: jasmine.SpyObj<FormVersionService>;
  let formQuestionsService: jasmine.SpyObj<FormQuestionsService>;
  let questionService: jasmine.SpyObj<QuestionService>;
  let answerService: jasmine.SpyObj<AnswerService>;
  let specialityService: jasmine.SpyObj<SpecialityService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  async function setup(options: SetupOptions = {}): Promise<void> {
    const routeId = options.routeId || '';
    const adminMode = options.adminMode !== undefined ? options.adminMode : true;
    const formsResponse = options.formsResponse || { content: [] };
    const linksResponse = options.linksResponse || [];
    const versionsResponse = options.versionsResponse || { content: [] };
    const formQuestionsResponse = options.formQuestionsResponse || { content: [] };
    const questionResponse = options.questionResponse || { content: [] };
    const answerResponse = options.answerResponse || { content: [] };
    const specialitiesResponse = options.specialitiesResponse || { items: [] };

    TestBed.resetTestingModule();

    formService = jasmine.createSpyObj<FormService>('FormService', ['getAllByCriteria', 'create', 'update']);
    campaignFormService = jasmine.createSpyObj<CampaignFormService>('CampaignFormService', ['getLinks']);
    formVersionService = jasmine.createSpyObj<FormVersionService>('FormVersionService', ['getAllByCriteria', 'custom']);
    formQuestionsService = jasmine.createSpyObj<FormQuestionsService>('FormQuestionsService', ['getAllByCriteria', 'create', 'update', 'delete']);
    questionService = jasmine.createSpyObj<QuestionService>('QuestionService', ['getAllByCriteria', 'create', 'update']);
    answerService = jasmine.createSpyObj<AnswerService>('AnswerService', ['getAllByCriteria', 'create', 'update', 'delete']);
    specialityService = jasmine.createSpyObj<SpecialityService>('SpecialityService', ['getAll']);
    notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'error', 'warning']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    if (options.loadError) {
      formService.getAllByCriteria.and.returnValue(throwError(() => options.loadError));
    } else {
      formService.getAllByCriteria.and.returnValue(of(formsResponse));
    }

    formService.create.and.returnValue(of({ items: [{ id: 101 }] } as any));
    formService.update.and.returnValue(of({ items: [{ id: 202 }] } as any));
    campaignFormService.getLinks.and.returnValue(of(linksResponse));
    formVersionService.getAllByCriteria.and.returnValue(of(versionsResponse));
    formVersionService.custom.and.returnValue(of({}));
    formQuestionsService.getAllByCriteria.and.returnValue(of(formQuestionsResponse));
    formQuestionsService.create.and.returnValue(of({}));
    formQuestionsService.update.and.returnValue(of({}));
    formQuestionsService.delete.and.returnValue(of({}));
    questionService.getAllByCriteria.and.returnValue(of(questionResponse));
    questionService.create.and.returnValue(of({ items: [{ id: 501 }] } as any));
    questionService.update.and.returnValue(of({ items: [{ id: 501 }] } as any));
    answerService.getAllByCriteria.and.returnValue(of(answerResponse));
    answerService.create.and.returnValue(of({}));
    answerService.update.and.returnValue(of({}));
    answerService.delete.and.returnValue(of({}));
    specialityService.getAll.and.returnValue(of(specialitiesResponse));

    await TestBed.configureTestingModule({
      imports: [FormEditorPageComponent],
      providers: [
        { provide: FormService, useValue: formService },
        { provide: CampaignFormService, useValue: campaignFormService },
        { provide: FormVersionService, useValue: formVersionService },
        { provide: FormQuestionsService, useValue: formQuestionsService },
        { provide: QuestionService, useValue: questionService },
        { provide: AnswerService, useValue: answerService },
        { provide: SpecialityService, useValue: specialityService },
        { provide: AuthService, useValue: { currentUser$: of({ adminMode }) } },
        { provide: NotificationService, useValue: notificationService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(routeId ? { id: routeId } : {})
            }
          }
        }
      ]
    });

    TestBed.overrideComponent(FormEditorPageComponent, {
      set: {
        template: ''
      }
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(FormEditorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    fixture?.destroy();
  });

  it('creates a form from the dedicated create page', async () => {
    await setup({
      questionResponse: { content: [] },
      answerResponse: { content: [] },
      specialitiesResponse: { items: [] }
    });

    component.formState.set({
      formName: 'Nouveau formulaire',
      formDesc: 'Creation depuis la page dediee',
      isActive: true,
      isTimed: true
    });

    component.save();

    expect(formService.create).toHaveBeenCalledWith({
      formName: 'Nouveau formulaire',
      formDesc: 'Creation depuis la page dediee',
      isActive: true,
      isTimed: true
    });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/forms', 101, 'edit']);
  });

  it('loads the question bank and specialities on the dedicated create page', async () => {
    await setup({
      questionResponse: { content: [{ id: 9, questionText: 'Question existante', questionType: 'TEXT' }] },
      answerResponse: { content: [{ id: 4, questionId: 9, answerText: 'Reponse existante' }] },
      specialitiesResponse: { items: [{ id: 2, nom: 'Java' }] }
    });

    expect(component.isEditMode()).toBeFalse();
    expect(questionService.getAllByCriteria).toHaveBeenCalled();
    expect(answerService.getAllByCriteria).toHaveBeenCalled();
    expect(specialityService.getAll).toHaveBeenCalled();
    expect(component.availableQuestions()).toHaveSize(1);
    expect(component.specialities()).toHaveSize(1);
  });

  it('loads a form, its working version, and the linked questions on the dedicated edit page', async () => {
    await setup({
      routeId: '88',
      formsResponse: {
        content: [{ id: 88, formName: 'Formulaire existant', formDesc: 'Description initiale', isActive: true, isTimed: true }]
      },
      linksResponse: [
        { id: 1, key: 'campaign-form-1', campaignId: 5, campaignName: 'Campagne Alpha', formId: 88 }
      ],
      versionsResponse: {
        content: [
          { id: 12, formId: 88, versionNumber: 3, isPublished: false, isLocked: false },
          { id: 10, formId: 88, versionNumber: 2, isPublished: true, isLocked: true }
        ]
      },
      formQuestionsResponse: {
        content: [
          { id: 19, formVersionId: 12, questionId: 7, questionOrder: 1 }
        ]
      },
      questionResponse: {
        content: [
          { id: 7, questionText: 'Quelle est la capitale ?', questionType: 'MULTIPLE_CHOICE', difficultyLevel: 'MEDIUM', specialityId: 2, score: 1, questionChrono: 60 }
        ]
      },
      answerResponse: {
        content: [
          { id: 21, questionId: 7, answerText: 'Paris', answerOrder: 1, isCorrect: true }
        ]
      },
      specialitiesResponse: {
        items: [{ id: 2, nom: 'Culture generale' }]
      }
    });

    expect(component.isEditMode()).toBeTrue();
    expect(component.formState().formName).toBe('Formulaire existant');
    expect(component.formState().isTimed).toBeTrue();
    expect(component.linkedCampaignNames()).toEqual(['Campagne Alpha']);
    expect(component.workingVersion()?.id).toBe(12);
    expect(component.workingVersionIsEditable()).toBeTrue();
    expect(component.linkedQuestions()).toHaveSize(1);
  });

  it('warns instead of saving when admin mode is disabled', async () => {
    await setup({ adminMode: false });

    component.save();

    expect(formService.create).not.toHaveBeenCalled();
    expect(notificationService.warning).toHaveBeenCalledWith('Acces refuse', 'Le mode admin doit etre active pour enregistrer un formulaire');
  });

  it('redirects back when the requested form cannot be loaded', async () => {
    await setup({ routeId: '404' });

    expect(notificationService.error).toHaveBeenCalledWith('Erreur', 'Formulaire introuvable');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/forms']);
  });

  it('adds an existing question to the editable draft version', async () => {
    await setup({
      routeId: '88',
      formsResponse: { content: [{ id: 88, formName: 'Formulaire existant', isActive: true, isTimed: false }] },
      versionsResponse: { content: [{ id: 12, formId: 88, versionNumber: 3, isPublished: false, isLocked: false }] },
      questionResponse: { content: [{ id: 9, questionText: 'Question existante', questionType: 'TEXT' }] }
    });

    component.selectedBankQuestionId.set(9);
    component.addExistingQuestionToVersion();

    expect(formQuestionsService.create).toHaveBeenCalledWith({
      formVersionId: 12,
      questionId: 9,
      questionOrder: 1
    });
  });

  it('adds an existing question locally on the create route before the form exists', async () => {
    await setup({
      questionResponse: { content: [{ id: 9, questionText: 'Question existante', questionType: 'TEXT' }] },
      answerResponse: { content: [] },
      specialitiesResponse: { items: [{ id: 2, nom: 'Java' }] }
    });

    component.selectedBankQuestionId.set(9);
    component.addExistingQuestionToVersion();

    expect(formQuestionsService.create).not.toHaveBeenCalled();
    expect(component.linkedQuestions()).toHaveSize(1);
    expect(component.linkedQuestions()[0].link.questionId).toBe(9);
  });

  it('filters the available question bank by speciality', async () => {
    await setup({
      questionResponse: {
        content: [
          { id: 9, questionText: 'Question Java', questionType: 'TEXT', specialityId: 2 },
          { id: 11, questionText: 'Question Angular', questionType: 'TEXT', specialityId: 3 }
        ]
      },
      answerResponse: { content: [] },
      specialitiesResponse: { items: [{ id: 2, nom: 'Java' }, { id: 3, nom: 'Angular' }] }
    });

    component.onQuestionBankSpecialityChange(3);

    expect(component.availableQuestions().map(question => question.id)).toEqual([11]);
  });

  it('opens the question bank popup and excludes questions already linked to the draft', async () => {
    await setup({
      questionResponse: {
        content: [
          { id: 9, questionText: 'Question deja liee', questionType: 'TEXT' },
          { id: 11, questionText: 'Question disponible', questionType: 'TEXT' }
        ]
      },
      answerResponse: { content: [] },
      specialitiesResponse: { items: [{ id: 2, nom: 'Java' }] }
    });

    component.formQuestions.set([{ id: -1, questionId: 9, questionOrder: 1 } as any]);
    component.openQuestionBankModal();

    expect(component.showQuestionBankModal()).toBeTrue();
    expect(component.availableQuestions().map(question => question.id)).toEqual([11]);
  });

  it('computes the total max response time from linked question chronos', async () => {
    await setup({
      questionResponse: {
        content: [
          { id: 9, questionText: 'Question A', questionType: 'TEXT', questionChrono: 45 },
          { id: 11, questionText: 'Question B', questionType: 'TEXT', questionChrono: 90 }
        ]
      },
      answerResponse: { content: [] },
      specialitiesResponse: { items: [{ id: 2, nom: 'Java' }] }
    });

    component.formQuestions.set([
      { id: -1, questionId: 9, questionOrder: 1 } as any,
      { id: -2, questionId: 11, questionOrder: 2 } as any
    ]);

    expect(component.totalQuestionChrono()).toBe(135);
    expect(component.totalQuestionChronoLabel()).toBe('2 min 15 s');
  });

  it('adds multiple selected questions to the editable draft version in one batch', async () => {
    await setup({
      routeId: '88',
      formsResponse: { content: [{ id: 88, formName: 'Formulaire existant', isActive: true, isTimed: false }] },
      versionsResponse: { content: [{ id: 12, formId: 88, versionNumber: 3, isPublished: false, isLocked: false }] },
      questionResponse: {
        content: [
          { id: 9, questionText: 'Question A', questionType: 'TEXT' },
          { id: 11, questionText: 'Question B', questionType: 'TEXT' }
        ]
      }
    });

    component.selectedBankQuestionIds.set([9, 11]);
    component.addSelectedQuestionsToVersion();

    expect(formQuestionsService.create.calls.count()).toBe(2);
    expect(formQuestionsService.create.calls.argsFor(0)[0]).toEqual({
      formVersionId: 12,
      questionId: 9,
      questionOrder: 1
    });
    expect(formQuestionsService.create.calls.argsFor(1)[0]).toEqual({
      formVersionId: 12,
      questionId: 11,
      questionOrder: 2
    });
  });

  it('creates and links a new question from the form editor page', async () => {
    await setup({
      routeId: '88',
      formsResponse: { content: [{ id: 88, formName: 'Formulaire existant', isActive: true, isTimed: false }] },
      versionsResponse: { content: [{ id: 12, formId: 88, versionNumber: 3, isPublished: false, isLocked: false }] },
      specialitiesResponse: { items: [{ id: 2, nom: 'Java' }] }
    });

    component.openCreateQuestionModal();
    component.updateQuestionField('questionText', 'Nouvelle question');
    component.updateQuestionField('questionType', 'TRUE_FALSE');
    component.updateQuestionField('difficultyLevel', 'EXPERT');
    component.updateQuestionField('specialityId', 2);
    component.updateQuestionField('manualCorrectionRequired', true);
    component.onAllAnswersJustificationRequiredChange(true);

    component.saveQuestion();

    expect(questionService.create).toHaveBeenCalledWith({
      questionText: 'Nouvelle question',
      questionType: 'TRUE_FALSE',
      difficultyLevel: 'EXPERT',
      score: 15,
      questionChrono: 150,
      specialityId: 2,
      allAnswersJustificationRequired: true,
      manualCorrectionRequired: true,
      freeTextResponsePlaceholder: undefined
    });
    expect(formQuestionsService.create).toHaveBeenCalledWith({
      formVersionId: 12,
      questionId: 501,
      questionOrder: 1
    });
    expect(answerService.create.calls.count()).toBe(2);
    expect(answerService.create.calls.allArgs().every(([payload]) => payload.additionalCommentRequired === true)).toBeTrue();
  });

  it('requires a placeholder for free-text questions before saving', async () => {
    await setup({
      routeId: '88',
      formsResponse: { content: [{ id: 88, formName: 'Formulaire existant', isActive: true, isTimed: false }] },
      versionsResponse: { content: [{ id: 12, formId: 88, versionNumber: 3, isPublished: false, isLocked: false }] },
      specialitiesResponse: { items: [{ id: 2, nom: 'Java' }] }
    });

    component.openCreateQuestionModal();
    component.updateQuestionField('questionText', 'Question texte libre');
    component.updateQuestionField('questionType', 'TEXT');
    component.updateQuestionField('specialityId', 2);

    component.saveQuestion();

    expect(notificationService.error).toHaveBeenCalledWith('Erreur', 'Le placeholder de la reponse libre est obligatoire');
    expect(questionService.create).not.toHaveBeenCalled();
  });

  it('creates a local question draft on the create route before the form exists', async () => {
    await setup({
      questionResponse: { content: [] },
      answerResponse: { content: [] },
      specialitiesResponse: { items: [{ id: 2, nom: 'Java' }] }
    });

    component.openCreateQuestionModal();
    component.updateQuestionField('questionText', 'Question locale');
    component.updateQuestionField('questionType', 'TRUE_FALSE');
    component.updateQuestionField('specialityId', 2);

    component.saveQuestion();

    expect(questionService.create).not.toHaveBeenCalled();
    expect(component.linkedQuestions()).toHaveSize(1);
    expect(component.linkedQuestions()[0].question?.questionText).toBe('Question locale');
    expect(component.linkedQuestions()[0].answers).toHaveSize(2);
  });

  it('persists the local create-route composition when the parent form is saved', async () => {
    await setup({
      versionsResponse: { content: [{ id: 12, formId: 101, versionNumber: 1, isPublished: false, isLocked: false }] },
      questionResponse: { content: [] },
      answerResponse: { content: [] },
      specialitiesResponse: { items: [{ id: 2, nom: 'Java' }] }
    });

    component.formState.set({
      formName: 'Formulaire avec brouillon local',
      formDesc: 'Description',
      isActive: true,
      isTimed: false
    });

    component.openCreateQuestionModal();
    component.updateQuestionField('questionText', 'Question locale');
    component.updateQuestionField('questionType', 'TRUE_FALSE');
    component.updateQuestionField('specialityId', 2);
    component.saveQuestion();

    component.save();

    expect(formService.create).toHaveBeenCalled();
    expect(formVersionService.getAllByCriteria).toHaveBeenCalled();
    expect(questionService.create).toHaveBeenCalledWith({
      questionText: 'Question locale',
      questionType: 'TRUE_FALSE',
      difficultyLevel: 'MOYEN',
      score: 5,
      questionChrono: 60,
      specialityId: 2,
      allAnswersJustificationRequired: false,
      manualCorrectionRequired: false,
      freeTextResponsePlaceholder: undefined
    });
    expect(answerService.create.calls.count()).toBe(2);
    expect(formQuestionsService.create).toHaveBeenCalledWith({
      formVersionId: 12,
      questionId: 501,
      questionOrder: 1
    });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/forms', 101, 'edit']);
  });

  it('publishes the current editable version from the editor page', async () => {
    await setup({
      routeId: '88',
      formsResponse: { content: [{ id: 88, formName: 'Formulaire existant', isActive: true, isTimed: false }] },
      versionsResponse: { content: [{ id: 12, formId: 88, versionNumber: 3, isPublished: false, isLocked: false }] }
    });

    const callsBeforeReload = formVersionService.getAllByCriteria.calls.count();

    component.publishWorkingVersion();

    expect(formVersionService.custom).toHaveBeenCalledWith('publish', 12);
    expect(formVersionService.getAllByCriteria.calls.count()).toBeGreaterThan(callsBeforeReload);
  });

  it('reports a loading failure on the dedicated edit page', async () => {
    await setup({ routeId: '42', loadError: new Error('boom') });

    expect(notificationService.error).toHaveBeenCalledWith('Erreur', 'Impossible de charger le formulaire');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/forms']);
  });
});