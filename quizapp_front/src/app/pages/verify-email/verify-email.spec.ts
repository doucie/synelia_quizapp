import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApplicationService } from '../../core/services/application.service';

import { VerifyEmailComponent } from './verify-email';

describe('VerifyEmailComponent', () => {
  let fixture: ComponentFixture<VerifyEmailComponent>;
  let component: VerifyEmailComponent;
  let route: { snapshot: { paramMap: ReturnType<typeof convertToParamMap> } };
  let router: jasmine.SpyObj<Router>;
  let applicationService: jasmine.SpyObj<ApplicationService>;

  const createComponent = () => {
    fixture = TestBed.createComponent(VerifyEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    route = { snapshot: { paramMap: convertToParamMap({ token: 'VERIFY-TOKEN' }) } };
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    applicationService = jasmine.createSpyObj<ApplicationService>('ApplicationService', ['verifyEmail']);

    await TestBed.configureTestingModule({
      imports: [VerifyEmailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: ApplicationService, useValue: applicationService }
      ]
    });

    TestBed.overrideComponent(VerifyEmailComponent, {
      set: {
        template: ''
      }
    });

    await TestBed.compileComponents();
  });

  it('sets a verification error when no token is present in the route', () => {
    route.snapshot.paramMap = convertToParamMap({});

    createComponent();

    expect(component.isVerifying()).toBeFalse();
    expect(component.verificationError()).toBe('Token de vérification manquant');
    expect(applicationService.verifyEmail).not.toHaveBeenCalled();
  });

  it('marks verification as successful without quiz stage and redirects to candidature tracking', fakeAsync(() => {
    applicationService.verifyEmail.and.returnValue(of({
      hasError: false,
      status: { code: '800', message: 'Email vérifié avec succès' },
      items: [{ id: 15, trackingCode: 'TRACK1', quizToken: null, hasQuizStage: false }]
    } as any));

    createComponent();

    expect(applicationService.verifyEmail).toHaveBeenCalledWith('VERIFY-TOKEN');
    expect(component.verificationSuccess()).toBeTrue();
    expect(component.verificationError()).toBeNull();
    expect(component.trackingCode()).toBe('TRACK1');
    expect(component.hasQuizStage()).toBeFalse();

    tick(3000);
    expect(router.navigate).toHaveBeenCalledWith(['/suivre-candidature']);
  }));

  it('redirects to the quiz when a quiz stage exists and a quiz token is returned', fakeAsync(() => {
    applicationService.verifyEmail.and.returnValue(of({
      hasError: false,
      status: { code: '800', message: 'Email vérifié avec succès' },
      items: [{ id: 15, trackingCode: 'TRACK1', quizToken: 'quiz-token-123', hasQuizStage: true }]
    } as any));

    createComponent();

    expect(component.verificationSuccess()).toBeTrue();
    expect(component.hasQuizStage()).toBeTrue();

    tick(3000);
    expect(router.navigate).toHaveBeenCalledWith(['/quiz', 15, 'quiz-token-123']);
  }));

  it('falls back to legacy searchString token when quizToken is absent', fakeAsync(() => {
    applicationService.verifyEmail.and.returnValue(of({
      hasError: false,
      status: { code: '800', message: 'Email vérifié avec succès' },
      items: [{ id: 15, trackingCode: 'TRACK1', quizToken: undefined, hasQuizStage: true, searchString: 'legacy-token' }]
    } as any));

    createComponent();

    expect(component.hasQuizStage()).toBeTrue();

    tick(3000);
    expect(router.navigate).toHaveBeenCalledWith(['/quiz', 15, 'legacy-token']);
  }));

  it('reports the business message when the server returns an error payload', () => {
    applicationService.verifyEmail.and.returnValue(of({
      hasError: true,
      status: { code: '404', message: 'Token de vérification invalide' }
    } as any));

    createComponent();

    expect(component.verificationSuccess()).toBeFalse();
    expect(component.verificationError()).toBe('Token de vérification invalide');
  });

  it('maps a 404 HTTP error to an invalid or expired token message', () => {
    applicationService.verifyEmail.and.returnValue(throwError(() => ({ status: 404 })));

    createComponent();

    expect(component.isVerifying()).toBeFalse();
    expect(component.verificationError()).toBe('Token de vérification invalide ou expiré');
  });
});
