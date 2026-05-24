import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';

import { QuestionsComponent } from './questions';
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
  let specialityService: jasmine.SpyObj<SpecialityService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    authService = new AuthServiceStub();
    questionService = jasmine.createSpyObj<QuestionService>('QuestionService', ['getAllByCriteria', 'create', 'update', 'delete']);
    answerService = jasmine.createSpyObj<AnswerService>('AnswerService', ['getAllByCriteria', 'create', 'update', 'delete']);
    specialityService = jasmine.createSpyObj<SpecialityService>('SpecialityService', ['getAll']);
    notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'warning', 'error']);

    questionService.getAllByCriteria.and.returnValue(of({ content: [] } as any));
    answerService.getAllByCriteria.and.returnValue(of({ content: [] } as any));
    specialityService.getAll.and.returnValue(of({ items: [] } as any));

    TestBed.configureTestingModule({
      imports: [QuestionsComponent],
      providers: [
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
});