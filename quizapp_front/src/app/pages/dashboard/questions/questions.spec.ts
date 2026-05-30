import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { QuestionsComponent } from './questions';
import { FormVersionService } from '../../../core/services/form-version.service';
import { QuestionService } from '../../../core/services/question.service';
import { AnswerService } from '../../../core/services/answer.service';
import { SpecialityService } from '../../../core/services/speciality.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

class AuthServiceStub {
  private readonly currentUserSubject = new BehaviorSubject<any>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  emitUser(user: any): void {
    this.currentUserSubject.next(user);
  }
}

describe('QuestionsComponent', () => {
  let fixture: ComponentFixture<QuestionsComponent>;
  let component: QuestionsComponent;
  let authService: AuthServiceStub;
  let questionService: jasmine.SpyObj<QuestionService>;
  let answerService: jasmine.SpyObj<AnswerService>;
  let formVersionService: jasmine.SpyObj<FormVersionService>;
  let specialityService: jasmine.SpyObj<SpecialityService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let queryParams$: BehaviorSubject<Record<string, unknown>>;

  beforeEach(async () => {
    authService = new AuthServiceStub();
    queryParams$ = new BehaviorSubject<Record<string, unknown>>({});
    questionService = jasmine.createSpyObj<QuestionService>('QuestionService', ['getAllByCriteria', 'create', 'update', 'delete']);
    answerService = jasmine.createSpyObj<AnswerService>('AnswerService', ['getAllByCriteria', 'create', 'update', 'delete']);
    formVersionService = jasmine.createSpyObj<FormVersionService>('FormVersionService', ['custom']);
    specialityService = jasmine.createSpyObj<SpecialityService>('SpecialityService', ['getAll']);
    notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'warning', 'error']);

    questionService.getAllByCriteria.and.returnValue(of({ content: [] } as any));
    answerService.getAllByCriteria.and.returnValue(of({ content: [] } as any));
    formVersionService.custom.and.returnValue(of({ items: [{ questionId: 101 }] } as any));
    specialityService.getAll.and.returnValue(of({ items: [] } as any));

    TestBed.configureTestingModule({
      imports: [QuestionsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: queryParams$.asObservable() } },
        { provide: FormVersionService, useValue: formVersionService },
        { provide: QuestionService, useValue: questionService },
        { provide: AnswerService, useValue: answerService },
        { provide: SpecialityService, useValue: specialityService },
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notificationService }
      ]
    });
    TestBed.overrideComponent(QuestionsComponent, {
      set: {
        template: ''
      }
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(QuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('tracks admin mode from AuthService currentUser$', () => {
    expect(component.isAdminModeEnabled()).toBeFalse();

    authService.emitUser({ id: 1, role: 'admin', adminMode: true });
    expect(component.isAdminModeEnabled()).toBeTrue();

    authService.emitUser({ id: 1, role: 'admin', adminMode: false });
    expect(component.isAdminModeEnabled()).toBeFalse();
  });

  it('blocks question creation when admin mode is disabled', () => {
    authService.emitUser({ id: 1, role: 'admin', adminMode: false });

    component.openCreateModal();

    expect(notificationService.warning).toHaveBeenCalledWith('Accès refusé', 'Le mode admin doit être activé');
    expect(component.showCreateEditModal()).toBeFalse();
  });

  it('reshapes draft answers when switching to TRUE_FALSE', () => {
    authService.emitUser({ id: 1, role: 'admin', adminMode: true });

    component.openCreateModal();
    component.addQuestionDraftAnswer();

    const firstDraftId = component.questionDraftAnswers()[0].draftId;
    component.updateQuestionDraftAnswer(firstDraftId, 'isCorrect', true);
    component.updateFormField('questionType', 'TRUE_FALSE');

    const drafts = component.questionDraftAnswers();

    expect(component.questionForm().questionType).toBe('TRUE_FALSE');
    expect(drafts.length).toBe(2);
    expect(drafts.map(draft => draft.answerText)).toEqual(['Vrai', 'Faux']);
    expect(drafts.filter(draft => draft.isCorrect)).toHaveSize(1);
  });

  it('reorders and resequences draft answers without manual order entry', () => {
    authService.emitUser({ id: 1, role: 'admin', adminMode: true });

    component.openCreateModal();
    component.addQuestionDraftAnswer();

    const initialDraftIds = component.questionDraftAnswers().map(draft => draft.draftId);

    component.moveQuestionDraftAnswer(initialDraftIds[2], 'up');

    const movedDrafts = component.questionDraftAnswers();
    expect(movedDrafts.map(draft => draft.answerOrder)).toEqual([1, 2, 3]);
    expect(movedDrafts[1].draftId).toBe(initialDraftIds[2]);

    component.removeQuestionDraftAnswer(movedDrafts[1].draftId);

    const remainingDrafts = component.questionDraftAnswers();
    expect(remainingDrafts.map(draft => draft.answerOrder)).toEqual([1, 2]);
  });

  it('applies difficulty suggestions without overwriting manual score changes', () => {
    authService.emitUser({ id: 1, role: 'admin', adminMode: true });

    component.openCreateModal();
    component.updateFormField('difficultyLevel', 'EXPERT');

    expect(component.questionForm().score).toBe(15);
    expect(component.questionForm().questionChrono).toBe(150);

    component.updateFormField('score', 5);
    component.updateFormField('difficultyLevel', 'FACILE');

    expect(component.questionForm().score).toBe(5);
    expect(component.questionForm().questionChrono).toBe(30);

    component.applyDifficultyPreset(true);

    expect(component.questionForm().score).toBe(1);
    expect(component.questionForm().questionChrono).toBe(30);
  });

  it('propagates justification settings to every draft answer when enabled at question level', () => {
    authService.emitUser({ id: 1, role: 'admin', adminMode: true });

    component.openCreateModal();
    component.updateFormField('allAnswersJustificationRequired', true);

    const draftId = component.questionDraftAnswers()[0].draftId;
    component.updateQuestionDraftAnswer(draftId, 'allowAdditionalComment', false);

    expect(component.questionForm().allAnswersJustificationRequired).toBeTrue();
    expect(component.questionDraftAnswers().every(draft => draft.allowAdditionalComment)).toBeTrue();
    expect(component.questionDraftAnswers().every(draft => draft.additionalCommentRequired)).toBeTrue();
    expect(component.questionDraftAnswers().every(draft => draft.additionalCommentPlaceholder === 'Justifiez votre réponse')).toBeTrue();
  });

  it('can disable global justification and clear additional comments for every draft answer', () => {
    authService.emitUser({ id: 1, role: 'admin', adminMode: true });
    spyOn(window, 'confirm').and.returnValue(true);

    component.openCreateModal();
    component.updateFormField('allAnswersJustificationRequired', true);

    component.onAllAnswersJustificationRequiredChange(false);

    expect(component.questionForm().allAnswersJustificationRequired).toBeFalse();
    expect(component.questionDraftAnswers().every(draft => draft.allowAdditionalComment === false)).toBeTrue();
    expect(component.questionDraftAnswers().every(draft => draft.additionalCommentRequired === false)).toBeTrue();
    expect(component.questionDraftAnswers().every(draft => draft.additionalCommentPlaceholder === '')).toBeTrue();
  });

  it('can disable global justification and keep per-answer comments when the popup answer is no', () => {
    authService.emitUser({ id: 1, role: 'admin', adminMode: true });
    spyOn(window, 'confirm').and.returnValue(false);

    component.openCreateModal();
    component.updateFormField('allAnswersJustificationRequired', true);

    component.onAllAnswersJustificationRequiredChange(false);

    expect(component.questionForm().allAnswersJustificationRequired).toBeFalse();
    expect(component.questionDraftAnswers().every(draft => draft.allowAdditionalComment)).toBeTrue();
    expect(component.questionDraftAnswers().every(draft => draft.additionalCommentRequired)).toBeTrue();
    expect(component.questionDraftAnswers().every(draft => draft.additionalCommentPlaceholder === 'Justifiez votre réponse')).toBeTrue();
  });

  it('requires a free-text placeholder for TEXT questions', () => {
    authService.emitUser({ id: 1, role: 'admin', adminMode: true });
    component.specialities.set([{ id: 9, nom: 'Backend' } as any]);

    component.openCreateModal();
    component.updateFormField('questionText', 'Décrivez votre approche');
    component.updateFormField('questionType', 'TEXT');
    component.updateFormField('specialityId', 9);

    component.saveQuestion();

    expect(notificationService.error).toHaveBeenCalledWith('Erreur', 'Le placeholder de la réponse libre est obligatoire');
    expect(questionService.create).not.toHaveBeenCalled();
  });

  it('sends manualCorrectionRequired when saving a question', () => {
    authService.emitUser({ id: 1, role: 'admin', adminMode: true });
    component.specialities.set([{ id: 9, nom: 'Backend' } as any]);
    questionService.create.and.returnValue(of({ items: [{ id: 44 }] } as any));
    answerService.create.and.returnValue(of({} as any));

    component.openCreateModal();
    component.updateFormField('questionText', 'Attribuez une note argumentée');
    component.updateFormField('specialityId', 9);
    component.updateFormField('manualCorrectionRequired', true);

    const drafts = component.questionDraftAnswers();
    component.updateQuestionDraftAnswer(drafts[0].draftId, 'answerText', 'Réponse A');
    component.updateQuestionDraftAnswer(drafts[0].draftId, 'isCorrect', true);
    component.updateQuestionDraftAnswer(drafts[1].draftId, 'answerText', 'Réponse B');

    component.saveQuestion();

    expect(questionService.create).toHaveBeenCalledWith(jasmine.objectContaining({
      manualCorrectionRequired: true
    }));
  });

  it('isolates the question automatically when a structural change is saved from a form version context', () => {
    const question = {
      id: 7,
      questionText: 'Texte initial',
      questionType: 'MULTIPLE_CHOICE',
      difficultyLevel: 'MEDIUM',
      score: 1,
      questionChrono: 60,
      specialityId: 3
    };
    const firstAnswer = {
      id: 11,
      questionId: 7,
      answerText: 'Réponse A',
      answerType: 'TEXT',
      answerOrder: 1,
      isCorrect: true
    };
    const secondAnswer = {
      id: 12,
      questionId: 7,
      answerText: 'Réponse B',
      answerType: 'TEXT',
      answerOrder: 2,
      isCorrect: false
    };

    authService.emitUser({ id: 1, role: 'admin', adminMode: true });
    questionService.getAllByCriteria.and.returnValue(of({ content: [question] } as any));
    answerService.getAllByCriteria.and.returnValue(of({ content: [firstAnswer, secondAnswer] } as any));
    questionService.update.and.returnValue(of({ items: [{ id: 101 }] } as any));
    answerService.update.and.returnValue(of({} as any));

    queryParams$.next({ questionId: 7, formVersionId: 10 });
    component.loadAll();

    expect(component.isEditMode()).toBeTrue();

    component.updateFormField('questionText', 'Texte modifié');
    component.saveQuestion();

    expect(formVersionService.custom).toHaveBeenCalledWith('ensureEditableQuestion', 10, 7);
    expect(questionService.update).toHaveBeenCalledWith(jasmine.objectContaining({
      id: 101,
      questionText: 'Texte modifié'
    }));
    expect(answerService.update).toHaveBeenCalledWith(jasmine.objectContaining({
      id: 11,
      questionId: 101
    }));
    expect(notificationService.success).toHaveBeenCalledWith('Succès', 'Question isolée puis mise à jour avec succès');
  });
});