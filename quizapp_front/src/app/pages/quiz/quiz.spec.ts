import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';

import { ApplicationService, QuizAntiCheatEvent } from '../../core/services/application.service';

import { QuizComponent } from './quiz';

const baseQuizData = {
  applicationId: 15,
  applicationQuizAttemptId: 1,
  applicationProgressId: 2,
  campaignId: 1,
  campaignTitle: 'Quiz Backend',
  isTimed: false,
  quizStatus: 'IN_PROGRESS',
  questions: [
    {
      id: 1,
      questionType: 'SINGLE_CHOICE',
      questionContent: 'Quelle est la capitale de la France ?',
      order: 1,
      answers: [
        { id: 1, answerContent: 'Paris' },
        { id: 2, answerContent: 'Lyon' }
      ]
    }
  ]
};

describe('QuizComponent', () => {
  let fixture: ComponentFixture<QuizComponent>;
  let component: QuizComponent;
  let route: { snapshot: { paramMap: ReturnType<typeof convertToParamMap> } };
  let router: jasmine.SpyObj<Router>;
  let applicationService: jasmine.SpyObj<ApplicationService>;
  let receivedEvents: QuizAntiCheatEvent[];

  const createQuizData = (antiCheat: unknown) => JSON.stringify({ ...baseQuizData, antiCheat });

  const configureWith = (antiCheat: unknown, touchResponse: (events: QuizAntiCheatEvent[]) => unknown): void => {
    applicationService.getQuiz.and.returnValue(
      of({
        hasError: false,
        status: { code: '800', message: 'ok' },
        items: [{ quizData: createQuizData(antiCheat) }]
      } as any)
    );
    applicationService.touchQuiz.and.callFake((_appId: number, _token: string, events: QuizAntiCheatEvent[]) => {
      receivedEvents = [...receivedEvents, ...events];
      return of(touchResponse(events) as any);
    });
    fixture = TestBed.createComponent(QuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const switchTab = (): void => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden' as DocumentVisibilityState
    });
    document.dispatchEvent(new Event('visibilitychange'));
  };

  beforeEach(async () => {
    route = {
      snapshot: { paramMap: convertToParamMap({ applicationId: '15', quizToken: 'quiz-token-123' }) }
    };
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    applicationService = jasmine.createSpyObj<ApplicationService>('ApplicationService', [
      'getQuiz',
      'touchQuiz',
      'saveQuizAnswer',
      'completeQuiz'
    ]);
    receivedEvents = [];

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible' as DocumentVisibilityState
    });

    await TestBed.configureTestingModule({
      imports: [QuizComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: ApplicationService, useValue: applicationService }
      ]
    });

    TestBed.overrideComponent(QuizComponent, {
      set: { template: '' }
    });

    await TestBed.compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('ne journalise rien quand l’anti-triche est désactivé', () => {
    configureWith(undefined, () => ({ hasError: false, items: [{ quizAttempts: [] }] }));

    component.startQuiz();
    switchTab();

    expect(component.antiCheatWarningCount()).toBe(0);
    expect(receivedEvents).toEqual([]);
  });

  it('enregistre une infraction TAB_SWITCH et l’envoie au serveur', () => {
    configureWith(
      { enabled: true, policy: 'WARN', tabSwitchMaxWarnings: 3, blockCopyPaste: true },
      (events) => ({
        hasError: false,
        items: [
          {
            quizAttempts: [
              {
                tabSwitchCount: events.length,
                fullscreenExitCount: 0,
                cheatFlagCount: 0,
                screeningResult: 'WATCHED'
              }
            ]
          }
        ]
      })
    );

    component.startQuiz();
    switchTab();

    expect(component.antiCheatWarningCount()).toBe(1);
    expect(receivedEvents).toEqual([
      { eventType: 'TAB_SWITCH', occurredAt: jasmine.any(String), metadata: 'visibilitychange' }
    ]);
  });

  it('décrémente les avertissements jusqu’à 0 puis affiche le dernier avertissement', () => {
    let serverTabSwitchCount = 0;
    configureWith(
      { enabled: true, policy: 'WARN', tabSwitchMaxWarnings: 3, blockCopyPaste: true },
      (events) => {
        serverTabSwitchCount += events.length;
        return {
          hasError: false,
          items: [
            {
              quizAttempts: [
                {
                  tabSwitchCount: serverTabSwitchCount,
                  fullscreenExitCount: 0,
                  cheatFlagCount: 0,
                  screeningResult: serverTabSwitchCount >= 3 ? 'FLAGGED' : 'WATCHED'
                }
              ]
            }
          ]
        };
      }
    );

    component.startQuiz();
    expect(component.antiCheatWarningsLeft()).toBe(3);

    switchTab();
    switchTab();
    switchTab();

    expect(component.antiCheatWarningCount()).toBe(3);
    expect(component.antiCheatWarningsLeft()).toBe(0);
    expect(component.antiCheatBanner()).toBe(
      'Dernier avertissement avant soumission automatique du quiz.'
    );
  });

  it('affiche le nombre d’avertissements restants en politique WARN', () => {
    configureWith(
      { enabled: true, policy: 'WARN', tabSwitchMaxWarnings: 3, blockCopyPaste: true },
      (events) => ({
        hasError: false,
        items: [
          {
            quizAttempts: [
              {
                tabSwitchCount: events.length,
                fullscreenExitCount: 0,
                cheatFlagCount: 0,
                screeningResult: 'WATCHED'
              }
            ]
          }
        ]
      })
    );

    component.startQuiz();
    switchTab();

    expect(component.antiCheatBanner()).toBe(
      'Avertissement : 2 sortie(s) de l\'onglet tolérée(s) avant soumission automatique.'
    );
  });

  it('affiche un bandeau générique en politique FLAG', () => {
    configureWith(
      { enabled: true, policy: 'FLAG', blockCopyPaste: true },
      () => ({
        hasError: false,
        items: [
          {
            quizAttempts: [
              {
                tabSwitchCount: 1,
                fullscreenExitCount: 0,
                cheatFlagCount: 0,
                screeningResult: 'WATCHED'
              }
            ]
          }
        ]
      })
    );

    component.startQuiz();
    switchTab();

    expect(component.antiCheatWarningsLeft()).toBeNull();
    expect(component.antiCheatBanner()).toBe(
      'Un changement d’onglet ou de fenêtre a été détecté. Veuillez rester sur cette page.'
    );
  });

  it('affiche le bandeau d’infraction quand le serveur force la soumission (FAIL)', () => {
    configureWith(
      { enabled: true, policy: 'FAIL', blockCopyPaste: true },
      () => ({
        hasError: false,
        items: [
          {
            quizAttempts: [
              {
                tabSwitchCount: 1,
                fullscreenExitCount: 0,
                cheatFlagCount: 0,
                screeningResult: 'FAILED'
              }
            ]
          }
        ]
      })
    );

    component.startQuiz();
    switchTab();

    expect(component.antiCheatBanner()).toBe(
      'Une infraction aux règles a été détectée. Le quiz a été soumis automatiquement.'
    );
  });

  it('bloque la session quand touchQuiz retourne une erreur', () => {
    configureWith(
      { enabled: true, policy: 'WARN', tabSwitchMaxWarnings: 3, blockCopyPaste: true },
      () => ({ hasError: true, status: { code: '403', message: 'Limite de tentatives atteinte' } })
    );

    component.startQuiz();
    switchTab();

    expect(component.hasError()).toBeTrue();
    expect(component.errorMessage()).toBe('Limite de tentatives atteinte');
  });

  it('bloque le copier-coller et journalise COPY_PASTE', () => {
    configureWith(
      { enabled: true, policy: 'WARN', tabSwitchMaxWarnings: 3, blockCopyPaste: true },
      (events) => ({
        hasError: false,
        items: [
          {
            quizAttempts: [
              {
                tabSwitchCount: events.length,
                fullscreenExitCount: 0,
                cheatFlagCount: 0,
                screeningResult: 'WATCHED'
              }
            ]
          }
        ]
      })
    );

    component.startQuiz();
    const pasteEvent = new Event('paste', { cancelable: true });
    const preventSpy = spyOn(pasteEvent, 'preventDefault');
    document.dispatchEvent(pasteEvent);

    expect(preventSpy).toHaveBeenCalled();
    expect(receivedEvents).toContain(
      jasmine.objectContaining({ eventType: 'COPY_PASTE', metadata: 'clipboard' })
    );
  });

  it('bloque les raccourcis clavier copier/coller et journalise COPY_PASTE', () => {
    configureWith(
      { enabled: true, policy: 'WARN', tabSwitchMaxWarnings: 3, blockCopyPaste: true },
      (events) => ({
        hasError: false,
        items: [
          {
            quizAttempts: [
              {
                tabSwitchCount: events.length,
                fullscreenExitCount: 0,
                cheatFlagCount: 0,
                screeningResult: 'WATCHED'
              }
            ]
          }
        ]
      })
    );

    component.startQuiz();
    const keyEvent = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, cancelable: true });
    const preventSpy = spyOn(keyEvent, 'preventDefault');
    document.dispatchEvent(keyEvent);

    expect(preventSpy).toHaveBeenCalled();
    expect(receivedEvents).toContain(
      jasmine.objectContaining({ eventType: 'COPY_PASTE', metadata: 'keyboard:c' })
    );
  });
});
