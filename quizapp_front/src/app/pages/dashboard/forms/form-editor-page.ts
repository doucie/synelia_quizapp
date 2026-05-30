import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, concatMap, forkJoin, from, map, of, switchMap, takeUntil, throwError, toArray } from 'rxjs';

import { Answer, AnswerService } from '../../../core/services/answer.service';
import { CampaignFormLink, CampaignFormService } from '../../../core/services/campaign-form.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Form, FormService } from '../../../core/services/form.service';
import { FormQuestions, FormQuestionsService } from '../../../core/services/form-questions.service';
import { FormVersion, FormVersionService } from '../../../core/services/form-version.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Question, QuestionService } from '../../../core/services/question.service';
import { Speciality, SpecialityService } from '../../../core/services/speciality.service';
import { FilterCheckboxComponent } from '../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../shared/filter-select/filter-select';

interface FormEditorState {
  id?: number;
  formName: string;
  formDesc: string;
  isActive: boolean;
  isTimed: boolean;
}

interface QuestionFormData {
  id?: number;
  questionText: string;
  questionType: string;
  difficultyLevel: string;
  score: number;
  questionChrono: number;
  specialityId?: number;
  allAnswersJustificationRequired: boolean;
  manualCorrectionRequired: boolean;
  freeTextResponsePlaceholder: string;
}

interface QuestionDraftAnswer {
  draftId: string;
  id?: number;
  answerText: string;
  answerType: string;
  allowAdditionalComment: boolean;
  additionalCommentRequired: boolean;
  additionalCommentPlaceholder: string;
  answerOrder: number;
  isCorrect: boolean;
}

interface FormVersionQuestionContext {
  formVersionId: number;
  questionId: number;
}

interface LinkedFormQuestion {
  link: FormQuestions;
  question: Question | null;
  answers: Answer[];
}

@Component({
  selector: 'app-form-editor-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective],
  templateUrl: './form-editor-page.html',
  styleUrls: ['./form-editor-page.scss']
})
export class FormEditorPageComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly QUESTION_TYPE_LABELS: Record<string, string> = {
    SINGLE_CHOICE: 'Choix unique',
    MULTIPLE_CHOICE: 'Choix multiple',
    TRUE_FALSE: 'Vrai/Faux',
    TEXT: 'Texte libre'
  };
  private readonly DEFAULT_JUSTIFICATION_PLACEHOLDER = 'Justifiez votre reponse';
  private readonly DIFFICULTY_PRESETS: Record<string, { label: string; description: string; score: number; questionChrono: number; badgeClass: string }> = {
    FACILE: {
      label: 'Facile',
      description: 'Memoriser: rappeler des faits, des definitions ou des donnees brutes.',
      score: 1,
      questionChrono: 30,
      badgeClass: 'difficulty--facile'
    },
    MOYEN_BAS: {
      label: 'Moyen-Bas',
      description: 'Comprendre: saisir le sens d\'une information ou l\'expliquer avec ses propres mots.',
      score: 3,
      questionChrono: 45,
      badgeClass: 'difficulty--moyen-bas'
    },
    MOYEN: {
      label: 'Moyen',
      description: 'Appliquer: utiliser des regles, des formules ou des concepts dans une situation concrete.',
      score: 5,
      questionChrono: 60,
      badgeClass: 'difficulty--moyen'
    },
    DIFFICILE: {
      label: 'Difficile',
      description: 'Analyser: decomposer une information pour identifier les causes, les motifs ou les liens logiques.',
      score: 7,
      questionChrono: 90,
      badgeClass: 'difficulty--difficile'
    },
    TRES_DIFFICILE: {
      label: 'Tres Difficile',
      description: 'Evaluer: porter un jugement critique, valider une methode ou justifier une decision.',
      score: 10,
      questionChrono: 120,
      badgeClass: 'difficulty--tres-difficile'
    },
    EXPERT: {
      label: 'Expert',
      description: 'Creer: combiner plusieurs elements pour concevoir un projet, un plan ou une solution nouvelle.',
      score: 15,
      questionChrono: 150,
      badgeClass: 'difficulty--expert'
    }
  };
  private nextTemporaryEntityId = -1;
  private originalQuestionFormSnapshot: QuestionFormData | null = null;
  private originalQuestionAnswerSnapshot: QuestionDraftAnswer[] = [];

  loading = signal(true);
  saving = signal(false);
  compositionLoading = signal(false);
  versionActionLoading = signal(false);
  questionSaving = signal(false);
  linkMutationLoading = signal(false);
  isEditMode = signal(false);
  isAdminModeEnabled = signal(false);
  formState = signal<FormEditorState>(this.getEmptyFormState());
  campaignLinks = signal<CampaignFormLink[]>([]);
  formVersions = signal<FormVersion[]>([]);
  formQuestions = signal<FormQuestions[]>([]);
  questions = signal<Question[]>([]);
  answers = signal<Answer[]>([]);
  specialities = signal<Speciality[]>([]);
  questionSearchQuery = signal('');
  questionBankSpecialityId = signal<number | null>(null);
  selectedBankQuestionId = signal<number | null>(null);
  selectedBankQuestionIds = signal<number[]>([]);

  showQuestionBankModal = signal(false);
  showQuestionModal = signal(false);
  showRemoveQuestionModal = signal(false);
  isQuestionEditMode = signal(false);
  questionForm = signal<QuestionFormData>(this.buildDefaultQuestionForm());
  questionDraftAnswers = signal<QuestionDraftAnswer[]>([]);
  deletedQuestionAnswerIds = signal<number[]>([]);
  selectedLinkedQuestion = signal<LinkedFormQuestion | null>(null);
  formVersionQuestionContext = signal<FormVersionQuestionContext | null>(null);
  questionFieldOverrides = signal({ score: false, questionChrono: false });

  difficultyLevels = Object.keys(this.DIFFICULTY_PRESETS);
  questionTypes = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'TEXT'];
  answerTypes = ['TEXT', 'IMAGE', 'CODE'];

  linkedCampaignNames = computed(() => {
    return this.campaignLinks()
      .map(link => link.campaignName || (link.campaignId ? `Campagne #${link.campaignId}` : 'Campagne'))
      .filter((value, index, collection) => Boolean(value) && collection.indexOf(value) === index);
  });

  linkedCampaigns = computed(() => {
    return this.campaignLinks()
      .filter(link => link.isDeleted !== true)
      .sort((left, right) => (left.campaignName || '').localeCompare(right.campaignName || ''));
  });

  orderedFormVersions = computed(() => this.sortFormVersions(this.formVersions()));

  workingVersion = computed(() => this.pickWorkingVersion(this.formVersions()));

  workingVersionIsEditable = computed(() => {
    const version = this.workingVersion();
    return Boolean(version && version.isDeleted !== true && version.isLocked !== true && version.isPublished !== true);
  });

  questionModalSupportsPredefinedAnswers = computed(() => this.normalizeQuestionType(this.questionForm().questionType) !== 'TEXT');

  questionModalUsesExclusiveCorrectAnswer = computed(() => {
    const questionType = this.normalizeQuestionType(this.questionForm().questionType);
    return questionType === 'SINGLE_CHOICE' || questionType === 'TRUE_FALSE';
  });

  questionModalIsTrueFalse = computed(() => this.normalizeQuestionType(this.questionForm().questionType) === 'TRUE_FALSE');
  questionModalSupportsAnswerJustification = computed(() => this.isQuestionTypeWithGlobalJustification(this.questionForm().questionType));
  questionModalRequiresFreeTextPlaceholder = computed(() => this.normalizeQuestionType(this.questionForm().questionType) === 'TEXT');
  questionDifficultyPresetOverridden = computed(() => {
    const overrides = this.questionFieldOverrides();
    return overrides.score || overrides.questionChrono;
  });

  compositionBusy = computed(() => this.compositionLoading() || this.versionActionLoading() || this.questionSaving() || this.linkMutationLoading());

  hasPersistedForm = computed(() => Boolean(this.formState().id && this.formState().id! > 0));

  canManageComposition = computed(() => Boolean(
    this.isAdminModeEnabled()
    && (this.hasPersistedForm() ? this.workingVersion()?.id && this.workingVersionIsEditable() : true)
  ));

  linkedQuestions = computed<LinkedFormQuestion[]>(() => {
    const questionMap = new Map<number, Question>();
    this.questions().forEach(question => {
      if (typeof question.id === 'number') {
        questionMap.set(question.id, question);
      }
    });

    const answerMap = new Map<number, Answer[]>();
    this.answers().forEach(answer => {
      if (typeof answer.questionId !== 'number' || answer.isDeleted === true) {
        return;
      }

      const currentAnswers = answerMap.get(answer.questionId) || [];
      currentAnswers.push(answer);
      answerMap.set(answer.questionId, currentAnswers);
    });

    return [...this.formQuestions()]
      .filter(link => link.isDeleted !== true)
      .sort((left, right) => (left.questionOrder || 0) - (right.questionOrder || 0) || (left.id || 0) - (right.id || 0))
      .map(link => ({
        link,
        question: typeof link.questionId === 'number' ? questionMap.get(link.questionId) || null : null,
        answers: typeof link.questionId === 'number'
          ? [...(answerMap.get(link.questionId) || [])].sort((left, right) => (left.answerOrder || 0) - (right.answerOrder || 0) || (left.id || 0) - (right.id || 0))
          : []
      }));
  });

  sortedSpecialities = computed(() => {
    return [...this.specialities()].sort((left, right) => this.getSpecialityLabel(left).localeCompare(this.getSpecialityLabel(right), 'fr', { sensitivity: 'base' }));
  });

  selectableBankQuestions = computed(() => {
    const linkedQuestionIds = new Set(
      this.linkedQuestions()
        .map(item => item.link.questionId)
        .filter((questionId): questionId is number => typeof questionId === 'number')
    );

    return [...this.questions()]
      .filter(question => typeof question.id === 'number' && question.isDeleted !== true && !linkedQuestionIds.has(question.id))
      .sort((left, right) => (left.questionText || '').localeCompare(right.questionText || ''));
  });

  availableQuestions = computed(() => {
    const query = this.questionSearchQuery().trim().toLowerCase();
    const specialityId = this.questionBankSpecialityId();

    return this.selectableBankQuestions()
      .filter(question => {
        if (specialityId && question.specialityId !== specialityId) {
          return false;
        }

        if (!query) {
          return true;
        }

        return (question.questionText || '').toLowerCase().includes(query)
          || (question.questionRef || '').toLowerCase().includes(query);
    });
  });

  selectedBankQuestionCount = computed(() => this.selectedBankQuestionIds().length);
  totalQuestionChrono = computed(() => this.linkedQuestions().reduce((total, item) => total + Math.max(0, item.question?.questionChrono || item.link.chronoOverride || 0), 0));
  totalQuestionChronoLabel = computed(() => this.formatDuration(this.totalQuestionChrono()));

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly formService: FormService,
    private readonly campaignFormService: CampaignFormService,
    private readonly formVersionService: FormVersionService,
    private readonly formQuestionsService: FormQuestionsService,
    private readonly questionService: QuestionService,
    private readonly answerService: AnswerService,
    private readonly specialityService: SpecialityService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isAdminModeEnabled.set(user?.adminMode || false);
      });

    const id = this.parsePositiveInteger(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.isEditMode.set(true);
      this.loadForm(id);
      return;
    }

    this.loadCreationContext();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/dashboard/forms']);
  }

  updateFormField<K extends keyof FormEditorState>(field: K, value: FormEditorState[K]): void {
    this.formState.update(current => ({
      ...current,
      [field]: value
    }));
  }

  onQuestionSearchQueryChange(value: string): void {
    this.questionSearchQuery.set(value);
  }

  onQuestionBankSpecialityChange(value: string | number | boolean | null): void {
    const numericValue = Number(value);
    this.questionBankSpecialityId.set(Number.isInteger(numericValue) && numericValue > 0 ? numericValue : null);
  }

  onSelectedBankQuestionChange(value: string | number | boolean | null): void {
    const numericValue = Number(value);
    const questionId = Number.isInteger(numericValue) && numericValue > 0 ? numericValue : null;
    this.selectedBankQuestionId.set(questionId);
    this.selectedBankQuestionIds.set(questionId ? [questionId] : []);
  }

  isBankQuestionSelected(questionId?: number): boolean {
    return typeof questionId === 'number' && this.selectedBankQuestionIds().includes(questionId);
  }

  toggleBankQuestionSelection(questionId: number, checked?: boolean): void {
    const shouldSelect = checked !== false;

    this.selectedBankQuestionIds.update(ids => {
      if (shouldSelect) {
        return ids.includes(questionId) ? ids : [...ids, questionId];
      }

      return ids.filter(id => id !== questionId);
    });

    if (shouldSelect) {
      this.selectedBankQuestionId.set(questionId);
      return;
    }

    if (this.selectedBankQuestionId() === questionId) {
      this.selectedBankQuestionId.set(this.selectedBankQuestionIds().at(-1) ?? null);
    }
  }

  selectAllAvailableQuestions(): void {
    this.selectedBankQuestionIds.update(ids => Array.from(new Set([
      ...ids,
      ...this.availableQuestions()
        .map(question => question.id)
        .filter((questionId): questionId is number => typeof questionId === 'number')
    ])));
    this.selectedBankQuestionId.set(null);
  }

  clearSelectedBankQuestions(): void {
    this.resetBankSelection();
  }

  save(): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Acces refuse', 'Le mode admin doit etre active pour enregistrer un formulaire');
      return;
    }

    const state = this.formState();
    if (!state.formName.trim()) {
      this.notificationService.error('Erreur', 'Le nom du formulaire est obligatoire');
      return;
    }

    this.saving.set(true);
    const payload = {
      formName: state.formName.trim(),
      formDesc: state.formDesc.trim(),
      isActive: state.isActive,
      isTimed: state.isTimed
    };

    const isPersistedEdit = this.isEditMode() && state.id;
    const request$ = isPersistedEdit
      ? this.formService.update({ ...payload, id: state.id })
      : this.formService.create(payload);
    let parentFormCreated = false;

    request$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(response => {
          const savedFormId = state.id ?? this.extractFormId(response);

          this.formState.update(current => ({
            ...current,
            id: savedFormId ?? current.id,
            formName: payload.formName,
            formDesc: payload.formDesc,
            isActive: payload.isActive,
            isTimed: payload.isTimed
          }));

          if (isPersistedEdit || !savedFormId) {
            return of({ savedFormId, createdFlow: !isPersistedEdit });
          }

          parentFormCreated = true;
          return this.persistCreationDraft(savedFormId).pipe(map(() => ({ savedFormId, createdFlow: true })));
        })
      )
      .subscribe({
        next: ({ savedFormId, createdFlow }) => {
          this.saving.set(false);

          if (!createdFlow) {
            this.notificationService.success('Succes', 'Formulaire modifie avec succes');
            return;
          }

          this.notificationService.success('Succes', 'Formulaire cree avec succes');

          if (savedFormId) {
            this.router.navigate(['/dashboard/forms', savedFormId, 'edit']);
            return;
          }

          this.router.navigate(['/dashboard/forms']);
        },
        error: error => {
          console.error('Erreur sauvegarde formulaire:', error);
          this.notificationService.error(
            'Erreur',
            parentFormCreated
              ? 'Le formulaire a ete cree, mais la composition n\'a pas pu etre finalisee'
              : 'Impossible de sauvegarder le formulaire'
          );
          this.saving.set(false);
        }
      });
  }

  createEditableDraft(): void {
    const version = this.workingVersion();
    if (!version?.id) {
      return;
    }

    this.versionActionLoading.set(true);
    this.formVersionService.custom('fork', version.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succes', 'Une version modifiable a ete creee pour ce formulaire');
          this.versionActionLoading.set(false);
          this.reloadVersionContext();
        },
        error: error => {
          console.error('Erreur creation brouillon:', error);
          this.notificationService.error('Erreur', 'Impossible de creer une version modifiable');
          this.versionActionLoading.set(false);
        }
      });
  }

  publishWorkingVersion(): void {
    const version = this.workingVersion();
    if (!version?.id) {
      return;
    }

    this.versionActionLoading.set(true);
    this.formVersionService.custom('publish', version.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succes', 'Version publiee avec succes');
          this.versionActionLoading.set(false);
          this.reloadVersionContext();
        },
        error: error => {
          console.error('Erreur publication version:', error);
          this.notificationService.error('Erreur', 'Impossible de publier cette version');
          this.versionActionLoading.set(false);
        }
      });
  }

  addExistingQuestionToVersion(): void {
    const questionId = this.selectedBankQuestionId();

    if (!questionId) {
      this.notificationService.error('Erreur', 'Selectionnez une question a ajouter');
      return;
    }

    this.addQuestionIdsToVersion([questionId]);
  }

  addSelectedQuestionsToVersion(): void {
    if (this.selectedBankQuestionCount() === 0) {
      this.notificationService.error('Erreur', 'Selectionnez au moins une question a ajouter');
      return;
    }

    this.addQuestionIdsToVersion(this.selectedBankQuestionIds());
  }

  openQuestionBankModal(): void {
    if (!this.canManageComposition()) {
      this.notificationService.warning('Acces refuse', 'La composition du formulaire demande un brouillon editable en mode admin');
      return;
    }

    this.resetBankSelection();
    this.questionSearchQuery.set('');
    this.questionBankSpecialityId.set(null);
    this.showQuestionBankModal.set(true);
  }

  closeQuestionBankModal(): void {
    this.showQuestionBankModal.set(false);
    this.resetBankSelection();
  }

  moveLinkedQuestion(item: LinkedFormQuestion, direction: -1 | 1): void {
    if (!this.canManageComposition()) {
      return;
    }

    const linkedQuestions = this.linkedQuestions();
    const currentIndex = linkedQuestions.findIndex(linkedQuestion => linkedQuestion.link.id === item.link.id);
    const targetQuestion = linkedQuestions[currentIndex + direction];
    if (currentIndex < 0 || !targetQuestion) {
      return;
    }

    if (!this.hasPersistedForm()) {
      const reorderedLinks = [...linkedQuestions];
      [reorderedLinks[currentIndex], reorderedLinks[currentIndex + direction]] = [reorderedLinks[currentIndex + direction], reorderedLinks[currentIndex]];
      this.formQuestions.set(this.resequenceDraftLinks(reorderedLinks.map(linkedQuestion => linkedQuestion.link)));
      return;
    }

    if (!item.link.id) {
      return;
    }

    this.linkMutationLoading.set(true);
    this.formQuestionsService.update({
      id: item.link.id,
      formVersionId: item.link.formVersionId,
      questionId: item.link.questionId,
      chronoOverride: item.link.chronoOverride,
      questionOrder: targetQuestion.link.questionOrder || currentIndex + direction + 1
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.linkMutationLoading.set(false);
          this.loadWorkingVersionQuestions();
        },
        error: error => {
          console.error('Erreur reordonnancement question:', error);
          this.notificationService.error('Erreur', 'Impossible de reordonner les questions');
          this.linkMutationLoading.set(false);
        }
      });
  }

  openCreateQuestionModal(): void {
    if (!this.canManageComposition()) {
      this.notificationService.warning('Acces refuse', 'La composition du formulaire demande un brouillon editable en mode admin');
      return;
    }

    this.isQuestionEditMode.set(false);
    this.selectedLinkedQuestion.set(null);
    this.formVersionQuestionContext.set(null);
    this.questionForm.set(this.buildDefaultQuestionForm());
    this.questionFieldOverrides.set({ score: false, questionChrono: false });
    this.deletedQuestionAnswerIds.set([]);
    this.initializeQuestionDraftAnswers('MULTIPLE_CHOICE');
    this.originalQuestionFormSnapshot = null;
    this.originalQuestionAnswerSnapshot = [];
    this.showQuestionModal.set(true);
  }

  openEditQuestionModal(item: LinkedFormQuestion): void {
    const version = this.workingVersion();
    if (!this.canManageComposition()) {
      this.notificationService.warning('Acces refuse', 'La composition du formulaire demande un brouillon editable en mode admin');
      return;
    }

    if (!item.question?.id) {
      this.notificationService.error('Erreur', 'Impossible d\'ouvrir cette question depuis le brouillon courant');
      return;
    }

    if (this.hasPersistedForm() && !version?.id) {
      this.notificationService.error('Erreur', 'Impossible d\'ouvrir cette question depuis le brouillon courant');
      return;
    }

    this.isQuestionEditMode.set(true);
    this.selectedLinkedQuestion.set(item);
    this.questionForm.set({
      id: item.question.id,
      questionText: item.question.questionText || '',
      questionType: this.normalizeQuestionType(item.question.questionType),
      difficultyLevel: this.normalizeDifficultyLevel(item.question.difficultyLevel),
      score: item.question.score || this.getDifficultyPreset(item.question.difficultyLevel).score,
      questionChrono: item.question.questionChrono || 60,
      specialityId: item.question.specialityId,
      allAnswersJustificationRequired: item.question.allAnswersJustificationRequired === true,
      manualCorrectionRequired: item.question.manualCorrectionRequired === true,
      freeTextResponsePlaceholder: item.question.freeTextResponsePlaceholder || ''
    });
    this.questionFieldOverrides.set({ score: true, questionChrono: true });
    this.deletedQuestionAnswerIds.set([]);
    this.initializeQuestionDraftAnswers(item.question.questionType, item.answers);
    this.formVersionQuestionContext.set(version?.id ? { formVersionId: version.id, questionId: item.question.id } : null);
    this.originalQuestionFormSnapshot = { ...this.questionForm() };
    this.originalQuestionAnswerSnapshot = this.questionDraftAnswers().map(draft => ({ ...draft }));
    this.showQuestionModal.set(true);
  }

  closeQuestionModal(): void {
    this.showQuestionModal.set(false);
    this.isQuestionEditMode.set(false);
    this.questionForm.set(this.buildDefaultQuestionForm());
    this.questionDraftAnswers.set([]);
    this.deletedQuestionAnswerIds.set([]);
    this.selectedLinkedQuestion.set(null);
    this.formVersionQuestionContext.set(null);
    this.questionFieldOverrides.set({ score: false, questionChrono: false });
    this.originalQuestionFormSnapshot = null;
    this.originalQuestionAnswerSnapshot = [];
  }

  openRemoveQuestionModal(item: LinkedFormQuestion): void {
    if (!this.canManageComposition()) {
      this.notificationService.warning('Acces refuse', 'La composition du formulaire demande un brouillon editable en mode admin');
      return;
    }

    this.selectedLinkedQuestion.set(item);
    this.showRemoveQuestionModal.set(true);
  }

  closeRemoveQuestionModal(): void {
    this.showRemoveQuestionModal.set(false);
    this.selectedLinkedQuestion.set(null);
  }

  confirmRemoveQuestionFromVersion(): void {
    const selectedItem = this.selectedLinkedQuestion();
    const linkId = selectedItem?.link.id;
    if (!linkId) {
      return;
    }

    if (!this.hasPersistedForm()) {
      const remainingLinks = this.resequenceDraftLinks(this.formQuestions().filter(link => link.id !== linkId));
      const removedQuestionId = selectedItem?.link.questionId;

      this.formQuestions.set(remainingLinks);

      if (this.isLocalDraftId(removedQuestionId) && !remainingLinks.some(link => link.questionId === removedQuestionId)) {
        this.questions.update(questions => questions.filter(question => question.id !== removedQuestionId));
        this.answers.update(answers => answers.filter(answer => answer.questionId !== removedQuestionId));
      }

      this.notificationService.success('Succes', 'Question retiree');
      this.closeRemoveQuestionModal();
      return;
    }

    this.linkMutationLoading.set(true);
    this.formQuestionsService.delete(linkId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succes', 'Question retiree');
          this.linkMutationLoading.set(false);
          this.closeRemoveQuestionModal();
          this.loadWorkingVersionQuestions();
        },
        error: error => {
          console.error('Erreur retrait question brouillon:', error);
          this.notificationService.error('Erreur', 'Impossible de retirer cette question');
          this.linkMutationLoading.set(false);
        }
      });
  }

  updateQuestionField<K extends keyof QuestionFormData>(field: K, value: QuestionFormData[K]): void {
    const normalizedValue = field === 'questionType'
      ? this.normalizeQuestionType(String(value))
      : field === 'difficultyLevel'
        ? this.normalizeDifficultyLevel(String(value))
        : value;

    this.questionForm.update(form => ({
      ...form,
      [field]: normalizedValue
    }));

    if (field === 'questionType') {
      const normalizedQuestionType = this.normalizeQuestionType(String(normalizedValue));
      this.questionForm.update(form => ({
        ...form,
        allAnswersJustificationRequired: this.isQuestionTypeWithGlobalJustification(normalizedQuestionType)
          ? form.allAnswersJustificationRequired
          : false,
        freeTextResponsePlaceholder: normalizedQuestionType === 'TEXT'
          ? form.freeTextResponsePlaceholder
          : ''
      }));
      this.syncQuestionDraftAnswersWithQuestionType(normalizedQuestionType);
      return;
    }

    if (field === 'difficultyLevel') {
      this.applyDifficultyPreset();
      return;
    }

    if (field === 'allAnswersJustificationRequired' && normalizedValue === true) {
      this.questionDraftAnswers.update(drafts => this.enforceQuestionAnswerRules(drafts, this.questionForm().questionType, true));
      return;
    }

    if (field === 'score' || field === 'questionChrono') {
      this.questionFieldOverrides.update(overrides => ({
        ...overrides,
        [field]: true
      }));
    }
  }

  onAllAnswersJustificationRequiredChange(required: boolean): void {
    if (required) {
      this.updateQuestionField('allAnswersJustificationRequired', true);
      return;
    }

    const wasRequired = this.questionForm().allAnswersJustificationRequired === true;
    this.updateQuestionField('allAnswersJustificationRequired', false);

    if (!wasRequired || this.questionDraftAnswers().length === 0) {
      return;
    }

    const shouldDisableAdditionalComments = window.confirm(
      'La justification obligatoire va etre desactivee. Voulez-vous aussi desactiver l\'autorisation des commentaires additionnels sur toutes les reponses ?'
    );

    if (!shouldDisableAdditionalComments) {
      return;
    }

    this.questionDraftAnswers.update(drafts => drafts.map(draft => this.clearDraftAdditionalCommentSettings(draft)));
  }

  applyDifficultyPreset(force = false): void {
    const preset = this.getDifficultyPreset(this.questionForm().difficultyLevel);
    const overrides = this.questionFieldOverrides();

    this.questionForm.update(form => ({
      ...form,
      score: force || !overrides.score ? preset.score : form.score,
      questionChrono: force || !overrides.questionChrono ? preset.questionChrono : form.questionChrono
    }));

    if (force) {
      this.questionFieldOverrides.set({ score: false, questionChrono: false });
    }
  }

  saveQuestion(): void {
    if (!this.canManageComposition()) {
      this.notificationService.warning('Acces refuse', 'La composition du formulaire demande un brouillon editable en mode admin');
      return;
    }

    const form = this.questionForm();
    const normalizedQuestionType = this.normalizeQuestionType(form.questionType);
    const normalizedDifficultyLevel = this.normalizeDifficultyLevel(form.difficultyLevel);
    const requiresGlobalJustification = this.isQuestionTypeWithGlobalJustification(normalizedQuestionType) && form.allAnswersJustificationRequired;
    const freeTextResponsePlaceholder = normalizedQuestionType === 'TEXT'
      ? form.freeTextResponsePlaceholder.trim()
      : undefined;

    if (!form.questionText.trim()) {
      this.notificationService.error('Erreur', 'Le texte de la question est obligatoire');
      return;
    }

    if (!form.specialityId) {
      this.notificationService.error('Erreur', 'La specialite est obligatoire');
      return;
    }

    if (normalizedQuestionType === 'TEXT' && !freeTextResponsePlaceholder) {
      this.notificationService.error('Erreur', 'Le placeholder de la reponse libre est obligatoire');
      return;
    }

    const answerValidationError = this.validateQuestionDraftAnswers(normalizedQuestionType);
    if (answerValidationError) {
      this.notificationService.error('Erreur', answerValidationError);
      return;
    }

    this.questionSaving.set(true);

    if (!this.hasPersistedForm()) {
      this.saveQuestionLocally(normalizedQuestionType);
      return;
    }

    const formVersionId = this.workingVersion()?.id;
    if (!formVersionId) {
      this.notificationService.error('Erreur', 'Aucune version modifiable n\'est disponible');
      this.questionSaving.set(false);
      return;
    }

    const payload: Partial<Question> = {
      questionText: form.questionText.trim(),
      questionType: normalizedQuestionType,
      difficultyLevel: normalizedDifficultyLevel,
      score: form.score,
      questionChrono: form.questionChrono,
      specialityId: form.specialityId,
      allAnswersJustificationRequired: requiresGlobalJustification,
      manualCorrectionRequired: form.manualCorrectionRequired === true,
      freeTextResponsePlaceholder
    };

    let questionPersisted = false;
    let questionWasIsolated = false;

    this.resolveQuestionIdForSave(normalizedQuestionType)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(targetQuestionId => {
          questionWasIsolated = Boolean(this.isQuestionEditMode() && form.id && targetQuestionId && targetQuestionId !== form.id);

          const request$ = this.isQuestionEditMode() && targetQuestionId
            ? this.questionService.update({ ...payload, id: targetQuestionId })
            : this.questionService.create(payload);

          return request$.pipe(
            switchMap(response => {
              questionPersisted = true;
              const questionId = targetQuestionId ?? form.id ?? this.extractQuestionId(response);

              if (!questionId) {
                throw new Error('Impossible de determiner l\'identifiant de la question sauvegardee');
              }

              return this.syncQuestionAnswers(questionId, normalizedQuestionType).pipe(map(() => questionId));
            }),
            switchMap(questionId => {
              if (this.isQuestionEditMode()) {
                return of(questionId);
              }

              return this.formQuestionsService.create({
                formVersionId,
                questionId,
                questionOrder: this.getNextQuestionOrder()
              }).pipe(map(() => questionId));
            })
          );
        })
      )
      .subscribe({
        next: () => {
          this.questionSaving.set(false);
          this.notificationService.success(
            'Succes',
            questionWasIsolated
              ? 'Question isolee puis mise a jour avec succes'
              : this.isQuestionEditMode()
                ? 'Question mise a jour avec succes'
                : 'Question creee et ajoutee au brouillon avec succes'
          );
          this.closeQuestionModal();
          this.reloadQuestionLibraryAndWorkingVersionQuestions();
        },
        error: error => {
          console.error('Erreur sauvegarde question formulaire:', error);
          this.notificationService.error(
            'Erreur',
            questionPersisted
              ? 'La question a ete sauvegardee, mais la synchronisation du brouillon a echoue'
              : 'Impossible de sauvegarder la question'
          );
          this.questionSaving.set(false);
        }
      });
  }

  addQuestionDraftAnswer(): void {
    if (!this.questionModalSupportsPredefinedAnswers() || this.questionModalIsTrueFalse()) {
      return;
    }

    this.questionDraftAnswers.update(drafts => {
      const nextOrder = Math.max(0, ...drafts.map(draft => draft.answerOrder || 0)) + 1;
      return this.resequenceQuestionDraftAnswers([...drafts, this.createQuestionDraftAnswer({ answerOrder: nextOrder })]);
    });
  }

  moveQuestionDraftAnswer(draftId: string, direction: 'up' | 'down'): void {
    if (this.questionModalIsTrueFalse()) {
      return;
    }

    this.questionDraftAnswers.update(drafts => {
      const orderedDrafts = this.resequenceQuestionDraftAnswers(drafts);
      const currentIndex = orderedDrafts.findIndex(draft => draft.draftId === draftId);
      if (currentIndex < 0) {
        return orderedDrafts;
      }

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= orderedDrafts.length) {
        return orderedDrafts;
      }

      const nextDrafts = [...orderedDrafts];
      const [movedDraft] = nextDrafts.splice(currentIndex, 1);
      nextDrafts.splice(targetIndex, 0, movedDraft);

      return this.assignQuestionDraftAnswerOrder(nextDrafts);
    });
  }

  removeQuestionDraftAnswer(draftId: string): void {
    if (this.questionModalIsTrueFalse() && this.questionDraftAnswers().length <= 2) {
      this.notificationService.warning('Suppression bloquee', 'Une question Vrai/Faux doit conserver deux reponses predefinies');
      return;
    }

    const draftToRemove = this.questionDraftAnswers().find(draft => draft.draftId === draftId);
    if (draftToRemove?.id) {
      this.deletedQuestionAnswerIds.update(ids => ids.includes(draftToRemove.id!) ? ids : [...ids, draftToRemove.id!]);
    }

    this.questionDraftAnswers.update(drafts => this.resequenceQuestionDraftAnswers(drafts.filter(draft => draft.draftId !== draftId)));
  }

  updateQuestionDraftAnswer(fieldDraftId: string, field: keyof QuestionDraftAnswer, value: string | number | boolean): void {
    const questionType = this.normalizeQuestionType(this.questionForm().questionType);
    const exclusiveCorrectAnswer = questionType === 'SINGLE_CHOICE' || questionType === 'TRUE_FALSE';
    const justificationLocked = this.questionModalSupportsAnswerJustification() && this.questionForm().allAnswersJustificationRequired;

    if (justificationLocked && (field === 'allowAdditionalComment' || field === 'additionalCommentRequired' || field === 'additionalCommentPlaceholder')) {
      return;
    }

    this.questionDraftAnswers.update(drafts => {
      let nextDrafts = drafts.map(draft => {
        if (draft.draftId !== fieldDraftId) {
          return exclusiveCorrectAnswer && field === 'isCorrect' && value === true
            ? { ...draft, isCorrect: false }
            : draft;
        }

        const nextDraft: QuestionDraftAnswer = {
          ...draft,
          [field]: value
        } as QuestionDraftAnswer;

        if (field === 'allowAdditionalComment' && value !== true) {
          nextDraft.additionalCommentRequired = false;
          nextDraft.additionalCommentPlaceholder = '';
        }

        if (field === 'additionalCommentRequired' && value === true) {
          nextDraft.allowAdditionalComment = true;
        }

        return nextDraft;
      });

      if (questionType === 'TRUE_FALSE') {
        nextDrafts = this.buildTrueFalseDraftAnswers(nextDrafts);
      }

      return this.enforceQuestionAnswerRules(nextDrafts, questionType, this.questionForm().allAnswersJustificationRequired);
    });
  }

  getDifficultyLabel(level?: string): string {
    return this.DIFFICULTY_PRESETS[this.normalizeDifficultyLevel(level)]?.label || 'N/A';
  }

  getDifficultyDescription(level?: string): string {
    return this.DIFFICULTY_PRESETS[this.normalizeDifficultyLevel(level)]?.description || '';
  }

  getDifficultyPresetSummary(level?: string): string {
    const preset = this.DIFFICULTY_PRESETS[this.normalizeDifficultyLevel(level)];
    return preset ? `${preset.score} pts • ${this.formatDuration(preset.questionChrono)}` : '';
  }

  getDifficultyClass(level?: string): string {
    return this.DIFFICULTY_PRESETS[this.normalizeDifficultyLevel(level)]?.badgeClass || 'difficulty--moyen';
  }

  getDifficultyPresetRowClass(level?: string): string {
    return `question-form__preset-row--${this.normalizeDifficultyLevel(level).toLowerCase().replace(/_/g, '-')}`;
  }

  getTypeLabel(type?: string): string {
    const normalizedType = this.normalizeQuestionType(type);
    return this.QUESTION_TYPE_LABELS[normalizedType] || normalizedType;
  }

  getAnswerTypeLabel(type?: string): string {
    const normalizedType = (type || 'TEXT').trim().toUpperCase();

    switch (normalizedType) {
      case 'IMAGE':
        return 'Image';
      case 'CODE':
        return 'Code';
      default:
        return 'Texte';
    }
  }

  getSpecialityName(specId?: number): string {
    if (!specId) {
      return 'Non assignee';
    }

    const speciality = this.specialities().find(item => item.id === specId);
    return this.getSpecialityLabel(speciality);
  }

  getSaveButtonLabel(): string {
    if (this.saving()) {
      return 'Enregistrement...';
    }

    return this.isEditMode() ? 'Enregistrer' : 'Creer le formulaire';
  }

  getVersionLabel(version?: FormVersion | null): string {
    return version?.versionNumber ? `Version ${version.versionNumber}` : 'Version en attente';
  }

  private loadCreationContext(): void {
    this.loading.set(true);

    forkJoin({
      questions: this.questionService.getAllByCriteria({ size: 500, page: 0, isDeleted: false }),
      answers: this.answerService.getAllByCriteria({ size: 1000, page: 0, isDeleted: false }),
      specialities: this.specialityService.getAll({ size: 100, page: 0, isDeleted: false })
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ questions, answers, specialities }) => {
          this.questions.set(this.normalizeLoadedQuestions(questions.content || []));
          this.answers.set(answers.content || []);
          this.specialities.set(specialities.items || []);
          this.sanitizeBankQuestionSelection();
          this.loading.set(false);
        },
        error: error => {
          console.error('Erreur chargement creation formulaire:', error);
          this.notificationService.error('Erreur', 'Impossible de charger le contexte du formulaire');
          this.loading.set(false);
        }
      });
  }

  private loadForm(id: number): void {
    this.loading.set(true);

    forkJoin({
      forms: this.formService.getAllByCriteria({ size: 1, page: 0, isDeleted: false, idDe: String(id), idA: String(id) }),
      links: this.campaignFormService.getLinks({ formId: id, isDeleted: false }),
      versions: this.formVersionService.getAllByCriteria({ size: 100, page: 0, formId: id, isDeleted: false }),
      questions: this.questionService.getAllByCriteria({ size: 500, page: 0, isDeleted: false }),
      answers: this.answerService.getAllByCriteria({ size: 1000, page: 0, isDeleted: false }),
      specialities: this.specialityService.getAll({ size: 100, page: 0, isDeleted: false })
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ forms, links, versions, questions, answers, specialities }) => {
          const form = (forms.content || []).find(item => item.id === id) || (forms.content || [])[0] || null;
          if (!form) {
            this.notificationService.error('Erreur', 'Formulaire introuvable');
            this.router.navigate(['/dashboard/forms']);
            return;
          }

          this.formState.set({
            id: form.id,
            formName: form.formName || '',
            formDesc: form.formDesc || '',
            isActive: form.isActive !== false,
            isTimed: form.isTimed === true
          });
          this.campaignLinks.set(links || []);
          this.formVersions.set(this.sortFormVersions(versions.content || []));
          this.questions.set(this.normalizeLoadedQuestions(questions.content || []));
          this.answers.set(answers.content || []);
          this.specialities.set(specialities.items || []);
          this.loadWorkingVersionQuestions(true);
        },
        error: error => {
          console.error('Erreur chargement formulaire:', error);
          this.notificationService.error('Erreur', 'Impossible de charger le formulaire');
          this.router.navigate(['/dashboard/forms']);
        }
      });
  }

  private reloadVersionContext(): void {
    const formId = this.formState().id;
    if (!formId) {
      return;
    }

    this.compositionLoading.set(true);
    this.formVersionService.getAllByCriteria({ size: 100, page: 0, formId, isDeleted: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: versions => {
          this.formVersions.set(this.sortFormVersions(versions.content || []));
          this.loadWorkingVersionQuestions();
        },
        error: error => {
          console.error('Erreur rechargement versions:', error);
          this.notificationService.error('Erreur', 'Impossible de recharger le contexte de version du formulaire');
          this.compositionLoading.set(false);
        }
      });
  }

  private loadWorkingVersionQuestions(finishInitialLoad = false): void {
    const formVersionId = this.workingVersion()?.id;

    if (!finishInitialLoad) {
      this.compositionLoading.set(true);
    }

    if (!formVersionId) {
      this.formQuestions.set([]);
      this.compositionLoading.set(false);
      if (finishInitialLoad) {
        this.loading.set(false);
      }
      return;
    }

    this.formQuestionsService.getAllByCriteria({ formVersionId, size: 200, isDeleted: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.formQuestions.set(response.content || []);
          this.sanitizeBankQuestionSelection();
          this.compositionLoading.set(false);
          if (finishInitialLoad) {
            this.loading.set(false);
          }
        },
        error: error => {
          console.error('Erreur chargement composition formulaire:', error);
          this.notificationService.error('Erreur', 'Impossible de charger la composition du formulaire');
          this.formQuestions.set([]);
          this.compositionLoading.set(false);
          if (finishInitialLoad) {
            this.loading.set(false);
          }
        }
      });
  }

  private reloadQuestionLibraryAndWorkingVersionQuestions(): void {
    const formVersionId = this.workingVersion()?.id;
    if (!formVersionId) {
      return;
    }

    this.compositionLoading.set(true);
    forkJoin({
      questions: this.questionService.getAllByCriteria({ size: 500, page: 0, isDeleted: false }),
      answers: this.answerService.getAllByCriteria({ size: 1000, page: 0, isDeleted: false }),
      formQuestions: this.formQuestionsService.getAllByCriteria({ formVersionId, size: 200, isDeleted: false })
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ questions, answers, formQuestions }) => {
          this.questions.set(this.normalizeLoadedQuestions(questions.content || []));
          this.answers.set(answers.content || []);
          this.formQuestions.set(formQuestions.content || []);
          this.sanitizeBankQuestionSelection();
          this.compositionLoading.set(false);
        },
        error: error => {
          console.error('Erreur rechargement brouillon formulaire:', error);
          this.notificationService.error('Erreur', 'Impossible de recharger les questions du brouillon');
          this.compositionLoading.set(false);
        }
      });
  }

  private getEmptyQuestionForm(): QuestionFormData {
    return this.buildDefaultQuestionForm();
  }

  private getEmptyFormState(): FormEditorState {
    return {
      formName: '',
      formDesc: '',
      isActive: true,
      isTimed: false
    };
  }

  private extractFormId(response: any): number | undefined {
    const item = response?.item || response?.items?.[0];
    return typeof item?.id === 'number' ? item.id : undefined;
  }

  private extractQuestionId(response: any): number | undefined {
    const item = response?.item || response?.items?.[0];
    return typeof item?.id === 'number' ? item.id : undefined;
  }

  private extractEditableQuestionId(response: any): number | undefined {
    const item = response?.item || response?.items?.[0];
    return typeof item?.questionId === 'number' ? item.questionId : undefined;
  }

  private getSpecialityLabel(speciality?: Speciality | null): string {
    return speciality?.nom || speciality?.name || speciality?.specialityName || 'Inconnue';
  }

  private createTemporaryEntityId(): number {
    return this.nextTemporaryEntityId--;
  }

  private isLocalDraftId(value?: number): value is number {
    return typeof value === 'number' && value < 0;
  }

  private pickWorkingVersion(versions: FormVersion[]): FormVersion | null {
    const sortedVersions = this.sortFormVersions(versions).filter(version => version.isDeleted !== true);
    return sortedVersions.find(version => version.isLocked !== true && version.isPublished !== true)
      || sortedVersions[0]
      || null;
  }

  private sortFormVersions(versions: FormVersion[]): FormVersion[] {
    return [...versions].sort((left, right) => (right.versionNumber || 0) - (left.versionNumber || 0) || (right.id || 0) - (left.id || 0));
  }

  private getNextQuestionOrder(): number {
    return Math.max(0, ...this.linkedQuestions().map(item => item.link.questionOrder || 0)) + 1;
  }

  private resetBankSelection(): void {
    this.selectedBankQuestionId.set(null);
    this.selectedBankQuestionIds.set([]);
  }

  private sanitizeBankQuestionSelection(): void {
    const selectableQuestionIds = new Set(
      this.selectableBankQuestions()
        .map(question => question.id)
        .filter((questionId): questionId is number => typeof questionId === 'number')
    );

    this.selectedBankQuestionIds.update(ids => ids.filter(id => selectableQuestionIds.has(id)));

    const selectedQuestionId = this.selectedBankQuestionId();
    if (selectedQuestionId && !selectableQuestionIds.has(selectedQuestionId)) {
      this.selectedBankQuestionId.set(null);
    }
  }

  private addQuestionIdsToVersion(questionIds: number[]): void {
    if (!this.canManageComposition()) {
      this.notificationService.warning('Acces refuse', 'La composition du formulaire demande un brouillon editable en mode admin');
      return;
    }

    const selectableQuestionIds = new Set(
      this.selectableBankQuestions()
        .map(question => question.id)
        .filter((questionId): questionId is number => typeof questionId === 'number')
    );
    const questionIdsToAdd = Array.from(new Set(questionIds.filter(questionId => selectableQuestionIds.has(questionId))));

    if (questionIdsToAdd.length === 0) {
      this.notificationService.warning('Selection vide', 'Aucune question selectionnee n\'est actuellement ajoutable');
      this.resetBankSelection();
      return;
    }

    if (!this.hasPersistedForm()) {
      const nextQuestionOrder = this.getNextQuestionOrder();
      this.formQuestions.update(links => this.resequenceDraftLinks([
        ...links,
        ...questionIdsToAdd.map((questionId, index) => ({
          id: this.createTemporaryEntityId(),
          questionId,
          questionOrder: nextQuestionOrder + index
        }))
      ]));
      this.notificationService.success('Succes', this.getBatchAddSuccessMessage(questionIdsToAdd.length));
      this.closeQuestionBankModal();
      return;
    }

    const formVersionId = this.workingVersion()?.id;
    if (!formVersionId) {
      this.notificationService.error('Erreur', 'Aucune version modifiable n\'est disponible');
      return;
    }

    const nextQuestionOrder = this.getNextQuestionOrder();
    this.linkMutationLoading.set(true);
    from(questionIdsToAdd)
      .pipe(
        concatMap((questionId, index) => this.formQuestionsService.create({
          formVersionId,
          questionId,
          questionOrder: nextQuestionOrder + index
        })),
        toArray(),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Succes', this.getBatchAddSuccessMessage(questionIdsToAdd.length));
          this.closeQuestionBankModal();
          this.linkMutationLoading.set(false);
          this.loadWorkingVersionQuestions();
        },
        error: error => {
          console.error('Erreur ajout questions existantes:', error);
          this.notificationService.error(
            'Erreur',
            questionIdsToAdd.length > 1
              ? 'Une partie de la selection a peut-etre ete ajoutee. Le brouillon va etre recharge.'
              : 'Impossible d\'ajouter cette question'
          );
          this.linkMutationLoading.set(false);
          this.loadWorkingVersionQuestions();
        }
      });
  }

  private getBatchAddSuccessMessage(questionCount: number): string {
    return questionCount > 1
      ? `${questionCount} questions ajoutees au brouillon`
      : 'Question ajoutee';
  }

  private resequenceDraftLinks(links: FormQuestions[]): FormQuestions[] {
    return [...links]
      .sort((left, right) => (left.questionOrder || 0) - (right.questionOrder || 0) || (left.id || 0) - (right.id || 0))
      .map((link, index) => ({
        ...link,
        questionOrder: index + 1
      }));
  }

  private normalizeQuestionType(questionType?: string): string {
    const normalized = (questionType || '').trim().toUpperCase();

    switch (normalized) {
      case 'QCU':
        return 'SINGLE_CHOICE';
      case 'QCM':
        return 'MULTIPLE_CHOICE';
      case 'OPEN':
        return 'TEXT';
      case 'TRUE_FALSE':
      case 'TEXT':
      case 'SINGLE_CHOICE':
      case 'MULTIPLE_CHOICE':
        return normalized;
      default:
        return 'MULTIPLE_CHOICE';
    }
  }

  private buildDefaultQuestionForm(difficultyLevel = 'MOYEN'): QuestionFormData {
    const normalizedDifficulty = this.normalizeDifficultyLevel(difficultyLevel);
    const preset = this.getDifficultyPreset(normalizedDifficulty);

    return {
      questionText: '',
      questionType: 'MULTIPLE_CHOICE',
      difficultyLevel: normalizedDifficulty,
      score: preset.score,
      questionChrono: preset.questionChrono,
      specialityId: undefined,
      allAnswersJustificationRequired: false,
      manualCorrectionRequired: false,
      freeTextResponsePlaceholder: ''
    };
  }

  private getDifficultyPreset(level?: string): { score: number; questionChrono: number } {
    const preset = this.DIFFICULTY_PRESETS[this.normalizeDifficultyLevel(level)] || this.DIFFICULTY_PRESETS['MOYEN'];
    return {
      score: preset.score,
      questionChrono: preset.questionChrono
    };
  }

  private normalizeDifficultyLevel(level?: string): string {
    const normalized = (level || 'MOYEN')
      .trim()
      .toUpperCase()
      .replace(/-/g, '_')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    switch (normalized) {
      case 'EASY':
        return 'FACILE';
      case 'MEDIUM':
        return 'MOYEN';
      case 'HARD':
        return 'DIFFICILE';
      case 'MOYEN_BAS':
      case 'FACILE':
      case 'MOYEN':
      case 'DIFFICILE':
      case 'TRES_DIFFICILE':
      case 'EXPERT':
        return normalized;
      default:
        return 'MOYEN';
    }
  }

  private createQuestionDraftAnswer(overrides: Partial<QuestionDraftAnswer> = {}): QuestionDraftAnswer {
    const enforceJustification = this.questionModalSupportsAnswerJustification() && this.questionForm().allAnswersJustificationRequired;

    return {
      draftId: overrides.draftId || this.createDraftId(),
      id: overrides.id,
      answerText: overrides.answerText || '',
      answerType: overrides.answerType || 'TEXT',
      allowAdditionalComment: enforceJustification || overrides.allowAdditionalComment === true,
      additionalCommentRequired: enforceJustification || overrides.additionalCommentRequired === true,
      additionalCommentPlaceholder: enforceJustification
        ? this.DEFAULT_JUSTIFICATION_PLACEHOLDER
        : overrides.additionalCommentPlaceholder || '',
      answerOrder: overrides.answerOrder || 1,
      isCorrect: overrides.isCorrect === true
    };
  }

  private createDraftId(): string {
    return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private initializeQuestionDraftAnswers(questionType?: string, existingAnswers: Answer[] = []): void {
    const normalizedQuestionType = this.normalizeQuestionType(questionType);
    const mappedAnswers = existingAnswers.map(answer => this.createQuestionDraftAnswer({
      draftId: `existing-${answer.id || this.createDraftId()}`,
      id: answer.id,
      answerText: answer.answerText || '',
      answerType: answer.answerType || 'TEXT',
      allowAdditionalComment: answer.allowAdditionalComment === true,
      additionalCommentRequired: answer.additionalCommentRequired === true,
      additionalCommentPlaceholder: answer.additionalCommentPlaceholder || '',
      answerOrder: answer.answerOrder || 1,
      isCorrect: answer.isCorrect === true
    }));

    if (normalizedQuestionType === 'TRUE_FALSE') {
      if (mappedAnswers.length === 0) {
        this.questionDraftAnswers.set([
          this.createQuestionDraftAnswer({ answerText: 'Vrai', answerOrder: 1, isCorrect: true }),
          this.createQuestionDraftAnswer({ answerText: 'Faux', answerOrder: 2, isCorrect: false })
        ]);
        return;
      }

      this.questionDraftAnswers.set(this.buildTrueFalseDraftAnswers(mappedAnswers));
      return;
    }

    if (normalizedQuestionType !== 'TEXT' && mappedAnswers.length === 0) {
      this.questionDraftAnswers.set(this.resequenceQuestionDraftAnswers([
        this.createQuestionDraftAnswer({ answerOrder: 1 }),
        this.createQuestionDraftAnswer({ answerOrder: 2 })
      ]));
      return;
    }

    this.questionDraftAnswers.set(this.resequenceQuestionDraftAnswers(mappedAnswers));
  }

  private syncQuestionDraftAnswersWithQuestionType(questionType: string): void {
    if (questionType === 'TEXT') {
      return;
    }

    if (questionType === 'TRUE_FALSE') {
      const sortedDrafts = this.sortQuestionDraftAnswers(this.questionDraftAnswers());
      const extraIds = sortedDrafts.slice(2)
        .map(draft => draft.id)
        .filter((id): id is number => typeof id === 'number');

      if (extraIds.length > 0) {
        this.deletedQuestionAnswerIds.update(ids => Array.from(new Set([...ids, ...extraIds])));
      }

      this.questionDraftAnswers.set(this.enforceQuestionAnswerRules(this.buildTrueFalseDraftAnswers(sortedDrafts.slice(0, 2)), questionType, this.questionForm().allAnswersJustificationRequired));
      return;
    }

    if (this.questionDraftAnswers().length === 0) {
      this.initializeQuestionDraftAnswers(questionType);
      return;
    }

    if (questionType === 'SINGLE_CHOICE') {
      this.questionDraftAnswers.set(this.enforceQuestionAnswerRules(this.normalizeExclusiveCorrectAnswers(this.questionDraftAnswers()), questionType, this.questionForm().allAnswersJustificationRequired));
      return;
    }

    this.questionDraftAnswers.set(this.enforceQuestionAnswerRules(this.resequenceQuestionDraftAnswers(this.questionDraftAnswers()), questionType, this.questionForm().allAnswersJustificationRequired));
  }

  private enforceQuestionAnswerRules(drafts: QuestionDraftAnswer[], questionType?: string, allAnswersJustificationRequired = false): QuestionDraftAnswer[] {
    if (!allAnswersJustificationRequired || !this.isQuestionTypeWithGlobalJustification(questionType)) {
      return drafts;
    }

    return drafts.map(draft => ({
      ...draft,
      allowAdditionalComment: true,
      additionalCommentRequired: true,
      additionalCommentPlaceholder: this.DEFAULT_JUSTIFICATION_PLACEHOLDER
    }));
  }

  private clearDraftAdditionalCommentSettings(draft: QuestionDraftAnswer): QuestionDraftAnswer {
    return {
      ...draft,
      allowAdditionalComment: false,
      additionalCommentRequired: false,
      additionalCommentPlaceholder: ''
    };
  }

  private buildTrueFalseDraftAnswers(existingDrafts: QuestionDraftAnswer[]): QuestionDraftAnswer[] {
    const trueDraft = existingDrafts[0]
      ? { ...existingDrafts[0], answerText: 'Vrai', answerOrder: 1 }
      : this.createQuestionDraftAnswer({ answerText: 'Vrai', answerOrder: 1, isCorrect: true });
    const falseDraft = existingDrafts[1]
      ? { ...existingDrafts[1], answerText: 'Faux', answerOrder: 2 }
      : this.createQuestionDraftAnswer({ answerText: 'Faux', answerOrder: 2, isCorrect: false });

    if (trueDraft.isCorrect !== true && falseDraft.isCorrect !== true) {
      trueDraft.isCorrect = true;
    }

    return this.normalizeExclusiveCorrectAnswers([trueDraft, falseDraft]);
  }

  private normalizeExclusiveCorrectAnswers(drafts: QuestionDraftAnswer[]): QuestionDraftAnswer[] {
    let correctAnswerFound = false;

    return this.sortQuestionDraftAnswers(drafts).map((draft, index) => {
      const nextIsCorrect = draft.isCorrect === true && !correctAnswerFound;
      correctAnswerFound = correctAnswerFound || nextIsCorrect;

      return {
        ...draft,
        answerOrder: index + 1,
        isCorrect: nextIsCorrect
      };
    });
  }

  private resequenceQuestionDraftAnswers(drafts: QuestionDraftAnswer[]): QuestionDraftAnswer[] {
    return this.assignQuestionDraftAnswerOrder(this.sortQuestionDraftAnswers(drafts));
  }

  private assignQuestionDraftAnswerOrder(drafts: QuestionDraftAnswer[]): QuestionDraftAnswer[] {
    return drafts.map((draft, index) => ({
      ...draft,
      answerOrder: index + 1
    }));
  }

  private sortQuestionDraftAnswers(drafts: QuestionDraftAnswer[]): QuestionDraftAnswer[] {
    return [...drafts].sort((left, right) => (left.answerOrder || 0) - (right.answerOrder || 0) || left.draftId.localeCompare(right.draftId));
  }

  private validateQuestionDraftAnswers(questionType: string): string | null {
    if (questionType === 'TEXT') {
      return null;
    }

    const drafts = this.sortQuestionDraftAnswers(this.questionDraftAnswers());
    const correctAnswersCount = drafts.filter(draft => draft.isCorrect).length;

    if (drafts.length < 2) {
      return 'Ajoutez au moins deux reponses predefinies';
    }

    if (drafts.some(draft => !draft.answerText.trim())) {
      return 'Le texte de chaque reponse est obligatoire';
    }

    if (drafts.some(draft => draft.allowAdditionalComment && draft.additionalCommentRequired && !draft.additionalCommentPlaceholder.trim())) {
      return 'Le texte d\'aide du commentaire est obligatoire quand la justification est requise';
    }

    if (questionType === 'TRUE_FALSE') {
      if (drafts.length !== 2) {
        return 'Une question Vrai/Faux doit contenir exactement deux reponses';
      }

      if (correctAnswersCount !== 1) {
        return 'Une question Vrai/Faux doit contenir exactement une reponse correcte';
      }

      return null;
    }

    if (questionType === 'SINGLE_CHOICE' && correctAnswersCount !== 1) {
      return 'Une question a choix unique doit contenir exactement une reponse correcte';
    }

    if (questionType === 'MULTIPLE_CHOICE' && correctAnswersCount < 1) {
      return 'Une question a choix multiple doit contenir au moins une reponse correcte';
    }

    return null;
  }

  private syncQuestionAnswers(questionId: number, questionType: string): Observable<void> {
    const operations: Observable<unknown>[] = [];
    const deletedIds = new Set(this.deletedQuestionAnswerIds());
    const existingAnswerIds = this.answers()
      .filter(answer => answer.questionId === questionId)
      .map(answer => answer.id)
      .filter((id): id is number => typeof id === 'number');
    const requiresGlobalJustification = this.isQuestionTypeWithGlobalJustification(questionType) && this.questionForm().allAnswersJustificationRequired;

    if (questionType === 'TEXT') {
      existingAnswerIds.forEach(id => deletedIds.add(id));
    }

    deletedIds.forEach(id => {
      operations.push(this.answerService.delete(id));
    });

    if (questionType !== 'TEXT') {
      this.sortQuestionDraftAnswers(this.questionDraftAnswers()).forEach(draft => {
        const payload: Partial<Answer> = {
          answerText: draft.answerText.trim(),
          answerType: draft.answerType,
          allowAdditionalComment: requiresGlobalJustification ? true : draft.allowAdditionalComment,
          additionalCommentRequired: requiresGlobalJustification ? true : draft.allowAdditionalComment ? draft.additionalCommentRequired : false,
          additionalCommentPlaceholder: requiresGlobalJustification
            ? this.DEFAULT_JUSTIFICATION_PLACEHOLDER
            : draft.allowAdditionalComment
              ? draft.additionalCommentPlaceholder
              : undefined,
          answerOrder: draft.answerOrder,
          isCorrect: draft.isCorrect,
          questionId
        };

        if (draft.id) {
          operations.push(this.answerService.update({ ...payload, id: draft.id }));
        } else {
          operations.push(this.answerService.create(payload));
        }
      });
    }

    if (operations.length === 0) {
      return of(undefined);
    }

    return forkJoin(operations).pipe(map(() => undefined));
  }

  private saveQuestionLocally(normalizedQuestionType: string): void {
    try {
      const form = this.questionForm();
      const normalizedDifficultyLevel = this.normalizeDifficultyLevel(form.difficultyLevel);
      const requiresGlobalJustification = this.isQuestionTypeWithGlobalJustification(normalizedQuestionType) && form.allAnswersJustificationRequired;
      const selectedItem = this.selectedLinkedQuestion();
      const preserveLocalQuestion = this.isQuestionEditMode() && this.isLocalDraftId(form.id);
      const targetQuestionId = preserveLocalQuestion
        ? form.id!
        : this.createTemporaryEntityId();

      const nextQuestion: Question = {
        ...(selectedItem?.question || {}),
        id: targetQuestionId,
        questionText: form.questionText.trim(),
        questionType: normalizedQuestionType,
        difficultyLevel: normalizedDifficultyLevel,
        score: form.score,
        questionChrono: form.questionChrono,
        specialityId: form.specialityId,
        allAnswersJustificationRequired: requiresGlobalJustification,
        manualCorrectionRequired: form.manualCorrectionRequired === true,
        freeTextResponsePlaceholder: normalizedQuestionType === 'TEXT'
          ? form.freeTextResponsePlaceholder.trim()
          : ''
      };

      const nextAnswers = this.buildLocalQuestionAnswers(targetQuestionId, normalizedQuestionType, preserveLocalQuestion);

      this.questions.update(questions => {
        const withoutTarget = questions.filter(question => question.id !== targetQuestionId);
        return [...withoutTarget, nextQuestion];
      });

      this.answers.update(answers => [
        ...answers.filter(answer => answer.questionId !== targetQuestionId),
        ...nextAnswers
      ]);

      if (this.isQuestionEditMode() && selectedItem?.link.id) {
        this.formQuestions.update(links => this.resequenceDraftLinks(
          links.map(link => link.id === selectedItem.link.id ? { ...link, questionId: targetQuestionId } : link)
        ));
      } else {
        this.formQuestions.update(links => this.resequenceDraftLinks([
          ...links,
          {
            id: this.createTemporaryEntityId(),
            questionId: targetQuestionId,
            questionOrder: this.getNextQuestionOrder()
          }
        ]));
      }

      this.questionSaving.set(false);
      this.notificationService.success(
        'Succes',
        this.isQuestionEditMode() ? 'Question mise a jour avec succes' : 'Question creee'
      );
      this.closeQuestionModal();
    } catch (error) {
      console.error('Erreur sauvegarde question locale:', error);
      this.notificationService.error('Erreur', 'Impossible de preparer cette question');
      this.questionSaving.set(false);
    }
  }

  private buildLocalQuestionAnswers(questionId: number, questionType: string, preserveLocalAnswerIds: boolean): Answer[] {
    if (questionType === 'TEXT') {
      return [];
    }

    const requiresGlobalJustification = this.isQuestionTypeWithGlobalJustification(questionType) && this.questionForm().allAnswersJustificationRequired;

    return this.sortQuestionDraftAnswers(this.questionDraftAnswers()).map((draft, index) => ({
      id: preserveLocalAnswerIds && this.isLocalDraftId(draft.id) ? draft.id : this.createTemporaryEntityId(),
      answerText: draft.answerText.trim(),
      answerType: draft.answerType,
      allowAdditionalComment: requiresGlobalJustification ? true : draft.allowAdditionalComment,
      additionalCommentRequired: requiresGlobalJustification ? true : draft.allowAdditionalComment ? draft.additionalCommentRequired : false,
      additionalCommentPlaceholder: requiresGlobalJustification
        ? this.DEFAULT_JUSTIFICATION_PLACEHOLDER
        : draft.allowAdditionalComment
          ? draft.additionalCommentPlaceholder
          : undefined,
      answerOrder: index + 1,
      isCorrect: draft.isCorrect,
      questionId
    }));
  }

  private persistCreationDraft(formId: number): Observable<void> {
    const draftItems = this.linkedQuestions();
    if (draftItems.length === 0) {
      return of(undefined);
    }

    return this.formVersionService.getAllByCriteria({ size: 100, page: 0, formId, isDeleted: false }).pipe(
      switchMap(versions => {
        const sortedVersions = this.sortFormVersions(versions.content || []);
        const version = this.pickWorkingVersion(sortedVersions);

        this.formVersions.set(sortedVersions);

        if (!version?.id) {
          return throwError(() => new Error('Aucune version de travail disponible apres creation du formulaire'));
        }

        return from(draftItems).pipe(
          concatMap((item, index) => this.persistDraftLinkedQuestion(item, version.id!, index + 1)),
          toArray(),
          map(() => undefined)
        );
      })
    );
  }

  private persistDraftLinkedQuestion(item: LinkedFormQuestion, formVersionId: number, questionOrder: number): Observable<void> {
    if (item.question?.id && this.isLocalDraftId(item.question.id)) {
      const localQuestionId = item.question.id;
      const questionPayload: Partial<Question> = {
        questionText: item.question.questionText?.trim(),
        questionType: this.normalizeQuestionType(item.question.questionType),
        difficultyLevel: this.normalizeDifficultyLevel(item.question.difficultyLevel),
        score: item.question.score,
        questionChrono: item.question.questionChrono,
        specialityId: item.question.specialityId,
        allAnswersJustificationRequired: item.question.allAnswersJustificationRequired === true,
        manualCorrectionRequired: item.question.manualCorrectionRequired === true,
        freeTextResponsePlaceholder: item.question.freeTextResponsePlaceholder?.trim() || undefined
      };

      return this.questionService.create(questionPayload).pipe(
        switchMap(response => {
          const questionId = this.extractQuestionId(response);
          if (!questionId) {
            return throwError(() => new Error('Impossible de determiner l\'identifiant de la question creee'));
          }

          return this.persistLocalQuestionAnswers(localQuestionId, questionId, item.question?.questionType).pipe(
            switchMap(() => this.formQuestionsService.create({
              formVersionId,
              questionId,
              questionOrder
            })),
            map(() => undefined)
          );
        })
      );
    }

    const questionId = item.question?.id ?? item.link.questionId;
    if (!questionId || this.isLocalDraftId(questionId)) {
      return throwError(() => new Error('Question de brouillon invalide'));
    }

    return this.formQuestionsService.create({
      formVersionId,
      questionId,
      questionOrder
    }).pipe(map(() => undefined));
  }

  private persistLocalQuestionAnswers(localQuestionId: number, questionId: number, questionType?: string): Observable<void> {
    const normalizedQuestionType = this.normalizeQuestionType(questionType);
    if (normalizedQuestionType === 'TEXT') {
      return of(undefined);
    }

    const localAnswers = this.answers()
      .filter(answer => answer.questionId === localQuestionId && answer.isDeleted !== true)
      .sort((left, right) => (left.answerOrder || 0) - (right.answerOrder || 0) || (left.id || 0) - (right.id || 0));

    if (localAnswers.length === 0) {
      return of(undefined);
    }

    return from(localAnswers).pipe(
      concatMap(answer => this.answerService.create({
        answerText: answer.answerText,
        answerType: answer.answerType,
        allowAdditionalComment: answer.allowAdditionalComment,
        additionalCommentRequired: answer.additionalCommentRequired,
        additionalCommentPlaceholder: answer.additionalCommentPlaceholder,
        answerOrder: answer.answerOrder,
        isCorrect: answer.isCorrect,
        questionId
      })),
      toArray(),
      map(() => undefined)
    );
  }

  private resolveQuestionIdForSave(normalizedQuestionType: string): Observable<number | undefined> {
    const form = this.questionForm();
    if (!this.isQuestionEditMode() || !form.id) {
      return of(undefined);
    }

    const context = this.formVersionQuestionContext();
    if (!context || context.questionId !== form.id || !this.hasStructuralContextualChanges(normalizedQuestionType)) {
      return of(form.id);
    }

    return this.formVersionService.custom('ensureEditableQuestion', context.formVersionId, form.id).pipe(
      map(response => this.extractEditableQuestionId(response) ?? form.id)
    );
  }

  private hasStructuralContextualChanges(normalizedQuestionType: string): boolean {
    return this.hasStructuralQuestionChanges(normalizedQuestionType) || this.hasStructuralAnswerChanges(normalizedQuestionType);
  }

  private hasStructuralQuestionChanges(normalizedQuestionType: string): boolean {
    const original = this.originalQuestionFormSnapshot;
    const current = this.questionForm();
    if (!original) {
      return false;
    }

    if (current.questionText.trim() !== original.questionText.trim()) {
      return true;
    }

    if (normalizedQuestionType !== this.normalizeQuestionType(original.questionType)) {
      return true;
    }

    if ((current.questionChrono ?? 0) !== (original.questionChrono ?? 0)) {
      return true;
    }

    if ((current.score ?? 0) !== (original.score ?? 0)) {
      return true;
    }

    if ((current.allAnswersJustificationRequired ?? false) !== (original.allAnswersJustificationRequired ?? false)) {
      return true;
    }

    if ((current.manualCorrectionRequired ?? false) !== (original.manualCorrectionRequired ?? false)) {
      return true;
    }

    return (current.freeTextResponsePlaceholder || '').trim() !== (original.freeTextResponsePlaceholder || '').trim();
  }

  private hasStructuralAnswerChanges(normalizedQuestionType: string): boolean {
    const original = this.originalQuestionFormSnapshot;
    if (!original || normalizedQuestionType !== this.normalizeQuestionType(original.questionType) || normalizedQuestionType === 'TEXT') {
      return false;
    }

    const originalAnswers = this.normalizeStructuralDraftAnswers(this.originalQuestionAnswerSnapshot);
    const currentAnswers = this.normalizeStructuralDraftAnswers(this.questionDraftAnswers());
    if (originalAnswers.length !== currentAnswers.length) {
      return true;
    }

    for (let index = 0; index < originalAnswers.length; index++) {
      const originalAnswer = originalAnswers[index];
      const currentAnswer = currentAnswers[index];
      if (!currentAnswer
        || originalAnswer.id !== currentAnswer.id
        || originalAnswer.answerText !== currentAnswer.answerText
        || originalAnswer.answerType !== currentAnswer.answerType
        || originalAnswer.answerOrder !== currentAnswer.answerOrder
        || originalAnswer.isCorrect !== currentAnswer.isCorrect
        || originalAnswer.allowAdditionalComment !== currentAnswer.allowAdditionalComment
        || originalAnswer.additionalCommentRequired !== currentAnswer.additionalCommentRequired
        || originalAnswer.additionalCommentPlaceholder !== currentAnswer.additionalCommentPlaceholder) {
        return true;
      }
    }

    return false;
  }

  private normalizeStructuralDraftAnswers(drafts: QuestionDraftAnswer[]): Array<{
    id: number | null;
    answerText: string;
    answerType: string;
    answerOrder: number;
    isCorrect: boolean;
    allowAdditionalComment: boolean;
    additionalCommentRequired: boolean;
    additionalCommentPlaceholder: string;
  }> {
    return this.sortQuestionDraftAnswers(drafts).map(draft => ({
      id: typeof draft.id === 'number' ? draft.id : null,
      answerText: draft.answerText.trim(),
      answerType: (draft.answerType || 'TEXT').trim().toUpperCase(),
      answerOrder: draft.answerOrder || 0,
      isCorrect: draft.isCorrect === true,
      allowAdditionalComment: draft.allowAdditionalComment === true,
      additionalCommentRequired: draft.additionalCommentRequired === true,
      additionalCommentPlaceholder: (draft.additionalCommentPlaceholder || '').trim()
    }));
  }

  private normalizeLoadedQuestions(items: Question[]): Question[] {
    return items.map(item => ({
      ...item,
      questionType: this.normalizeQuestionType(item.questionType),
      difficultyLevel: this.normalizeDifficultyLevel(item.difficultyLevel),
      allAnswersJustificationRequired: item.allAnswersJustificationRequired === true,
      manualCorrectionRequired: item.manualCorrectionRequired === true,
      freeTextResponsePlaceholder: item.freeTextResponsePlaceholder || ''
    }));
  }

  private isQuestionTypeWithGlobalJustification(questionType?: string): boolean {
    const normalizedQuestionType = this.normalizeQuestionType(questionType);
    return normalizedQuestionType === 'SINGLE_CHOICE'
      || normalizedQuestionType === 'MULTIPLE_CHOICE'
      || normalizedQuestionType === 'TRUE_FALSE';
  }

  private formatDuration(totalSeconds: number): string {
    const safeSeconds = Math.max(0, Math.round(totalSeconds || 0));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    if (minutes === 0) {
      return `${seconds} s`;
    }

    if (seconds === 0) {
      return `${minutes} min`;
    }

    return `${minutes} min ${seconds} s`;
  }

  private parsePositiveInteger(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }
}