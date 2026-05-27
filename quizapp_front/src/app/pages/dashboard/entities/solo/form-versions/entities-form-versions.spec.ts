import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { DashboardStatsService } from '../../../../../core/services/dashboard-stats.service';
import { FormQuestionsService } from '../../../../../core/services/form-questions.service';
import { FormService } from '../../../../../core/services/form.service';
import { FormVersionService } from '../../../../../core/services/form-version.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { EntitiesFormVersionsComponent } from './entities-form-versions';

describe('EntitiesFormVersionsComponent', () => {
  let fixture: ComponentFixture<EntitiesFormVersionsComponent>;
  let component: EntitiesFormVersionsComponent;
  let formVersionService: jasmine.SpyObj<FormVersionService>;
  let formQuestionsService: jasmine.SpyObj<FormQuestionsService>;
  let formService: jasmine.SpyObj<FormService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    formVersionService = jasmine.createSpyObj<FormVersionService>('FormVersionService', [
      'getAllByCriteria',
      'create',
      'update',
      'delete',
      'restore',
      'custom'
    ]);
    formQuestionsService = jasmine.createSpyObj<FormQuestionsService>('FormQuestionsService', ['getAllByCriteria']);
    formService = jasmine.createSpyObj<FormService>('FormService', ['getAllByCriteria']);
    notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['success', 'error', 'warning']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    formVersionService.getAllByCriteria.and.returnValue(of({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0
    }));
    formVersionService.update.and.returnValue(of({}));
    formVersionService.custom.and.returnValue(of({}));
    formQuestionsService.getAllByCriteria.and.returnValue(of({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0
    }));
    formService.getAllByCriteria.and.returnValue(of({ content: [] } as any));

    await TestBed.configureTestingModule({
      imports: [EntitiesFormVersionsComponent],
      providers: [
        { provide: FormVersionService, useValue: formVersionService },
        { provide: FormQuestionsService, useValue: formQuestionsService },
        { provide: FormService, useValue: formService },
        { provide: NotificationService, useValue: notificationService },
        { provide: DashboardStatsService, useValue: {} },
        { provide: Router, useValue: router }
      ]
    });
    TestBed.overrideComponent(EntitiesFormVersionsComponent, {
      set: {
        template: ''
      }
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(EntitiesFormVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('enables duplicate action only for active unlocked draft children', () => {
    expect(component.canDuplicateChildQuestion(
      { id: 5, isLocked: false, isDeleted: false },
      { questionId: 9, isDeleted: false }
    )).toBeTrue();

    expect(component.canDuplicateChildQuestion(
      { id: 5, isLocked: true, isDeleted: false },
      { questionId: 9, isDeleted: false }
    )).toBeFalse();

    expect(component.canDuplicateChildQuestion(
      { id: 5, isLocked: false, isDeleted: true },
      { questionId: 9, isDeleted: false }
    )).toBeFalse();
  });

  it('duplicates a child question and reloads the version data', () => {
    const loadChildrenSpy = spyOn(component, 'loadChildren');
    const loadItemsSpy = spyOn(component, 'loadItems');

    component.duplicateChildQuestion(
      { id: 5, isLocked: false, isDeleted: false },
      { questionId: 9, isDeleted: false }
    );

    expect(formVersionService.custom).toHaveBeenCalledWith('duplicateQuestion', 5, 9);
    expect(loadChildrenSpy).toHaveBeenCalledWith(5);
    expect(loadItemsSpy).toHaveBeenCalled();
    expect(notificationService.success).toHaveBeenCalledWith('Succès', 'Question isolée sur cette version brouillon');
  });

  it('navigates to the question editor with the form version context', () => {
    component.editChildQuestion(
      { id: 5, isLocked: false, isDeleted: false },
      { questionId: 9, isDeleted: false }
    );

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/questions'], {
      queryParams: {
        formVersionId: 5,
        questionId: 9
      }
    });
  });

  it('publishes an unpublished version through the dedicated action', () => {
    const loadItemsSpy = spyOn(component, 'loadItems');

    component.publishVersion({ id: 5, isPublished: false, isLocked: false, isDeleted: false });

    expect(formVersionService.custom).toHaveBeenCalledWith('publish', 5);
    expect(loadItemsSpy).toHaveBeenCalled();
    expect(notificationService.success).toHaveBeenCalledWith('Succès', 'Version publiée');
  });

  it('shows an error notification when publish fails', () => {
    formVersionService.custom.and.returnValue(throwError(() => ({ error: { status: { message: 'boom' } } })));
    const loadItemsSpy = spyOn(component, 'loadItems');

    component.publishVersion({ id: 5, isPublished: false, isLocked: false, isDeleted: false });

    expect(loadItemsSpy).toHaveBeenCalled();
    expect(notificationService.error).toHaveBeenCalledWith('Erreur', jasmine.any(String));
  });

  it('reloads authoritative server state after publish failure before allowing further actions', () => {
    const reload$ = new Subject<any>();
    formVersionService.custom.and.returnValue(throwError(() => ({ error: { status: { message: 'timeout' } } })));
    formVersionService.getAllByCriteria.and.returnValue(reload$.asObservable());
    component.items.set([{ id: 5, isPublished: false, isLocked: false, isDeleted: false } as any]);

    component.publishVersion({ id: 5, isPublished: false, isLocked: false, isDeleted: false });

    expect(component.isLoading()).toBeTrue();
    expect(notificationService.error).toHaveBeenCalledWith('Erreur', jasmine.any(String));

    reload$.next({
      content: [{ id: 5, isPublished: true, isLocked: true, isDeleted: false }],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0
    });
    reload$.complete();

    expect(component.isLoading()).toBeFalse();
    expect(component.items()).toEqual([
      jasmine.objectContaining({ id: 5, isPublished: true, isLocked: true, isDeleted: false })
    ]);
  });

  it('shows an error notification when duplicateQuestion fails', () => {
    formVersionService.custom.and.returnValue(throwError(() => ({ error: { status: { message: 'boom' } } })));
    const loadChildrenSpy = spyOn(component, 'loadChildren');
    const loadItemsSpy = spyOn(component, 'loadItems');

    component.duplicateChildQuestion(
      { id: 5, isLocked: false, isDeleted: false },
      { questionId: 9, isDeleted: false }
    );

    expect(loadChildrenSpy).not.toHaveBeenCalled();
    expect(loadItemsSpy).not.toHaveBeenCalled();
    expect(notificationService.error).toHaveBeenCalledWith('Erreur', jasmine.any(String));
  });

  it('keeps locked version fields unchanged when opening the edit dialog', () => {
    const lockedVersion = {
      id: 5,
      versionNumber: 3,
      formId: 12,
      isPublished: true,
      isLocked: true,
      randomQuestions: false,
      isDeleted: false
    };

    component.openEditDialog(lockedVersion);

    expect(component.editingLockedVersion()).toBeTrue();
    expect(component.editFormData).toEqual(lockedVersion);
    expect(component.editFormData).not.toBe(lockedVersion);
  });

  it('sends only mutable version fields during update', () => {
    component.editFormData = {
      id: 5,
      versionNumber: 99,
      formId: 42,
      isPublished: true,
      isLocked: false,
      randomQuestions: true,
      isDeleted: false
    };

    component.validateEdit();

    expect(formVersionService.update).toHaveBeenCalledWith({
      id: 5,
      isLocked: false,
      randomQuestions: true
    });
  });

  it('blocks manual create dialog and shows a warning', () => {
    component.openCreateDialog();

    expect(component.showCreateDialog()).toBeFalse();
    expect(notificationService.warning).toHaveBeenCalledWith(
      'Action indisponible',
      jasmine.stringContaining("La creation manuelle d'une version n'est pas autorisee")
    );
  });

  it('does not call create when validateCreate is invoked programmatically', () => {
    component.createFormData = { versionNumber: 2, formId: 5, randomQuestions: false };

    component.validateCreate();

    expect(formVersionService.create).not.toHaveBeenCalled();
    expect(notificationService.warning).toHaveBeenCalledWith(
      'Action indisponible',
      jasmine.stringContaining("La creation manuelle d'une version n'est pas autorisee")
    );
  });
});