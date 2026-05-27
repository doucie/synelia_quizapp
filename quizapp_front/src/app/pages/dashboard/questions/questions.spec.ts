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