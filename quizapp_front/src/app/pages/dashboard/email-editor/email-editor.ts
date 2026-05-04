import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, of, catchError } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  EmailTemplateService,
  EmailTemplate,
  EmailTemplatePreset,
  EMAIL_ACTION_TYPES,
  EmailActionType
} from '../../../core/services/email-template.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeService } from '../../../core/services/theme.service';
import { RichTextEditorComponent } from '../../../shared/rich-text-editor/rich-text-editor';

interface EmailActionEditorConfig {
  templateKey: string;
  subjectTemplate: string;
  description: string;
  availableVariables: string[];
  previewVariables: Record<string, string>;
  recommendedPresetCategories: string[];
}

type EmailEditorMode = 'wysiwyg' | 'html';
type EditableVariableKey = 'content' | 'subtitle';

interface EditableVariableDefinition {
  key: EditableVariableKey;
  label: string;
  type: 'text' | 'richtext';
  placeholder: string;
  helpText: string;
}

interface VariablePreviewEntry {
  key: string;
  value: string;
}

const DEFAULT_TEMPLATE_VARIABLES = ['first_name', 'last_name', 'campaign_title', 'app_link', 'companyName', 'currentYear'];
const EMAIL_ACTION_TYPE_VALUES = EMAIL_ACTION_TYPES.map(action => action.value);
const DEFAULT_PREVIEW_VALUES: Record<string, string> = {
  candidatName: 'Jean Dupont',
  candidatEmail: 'jean.dupont@example.com',
  companyName: 'Synelia',
  campaignTitle: 'Developpeur Full Stack',
  currentYear: new Date().getFullYear().toString(),
  primaryColor: 'var(--color-primary, #6366f1)',
  primaryColorDark: 'var(--color-primary-dark, #4f46e5)',
  subtitle: 'Votre candidature',
  content: '<p>Bonjour {{first_name}},</p><p>Merci pour votre candidature.</p>',
  ctaButton: '<a href="#" class="btn">Voir ma candidature</a>',
  signature: '<p>Cordialement,<br>L\'equipe RH</p>',
  companyAddress: '123 Rue Example, Paris',
  unsubscribeUrl: '#',
  emoji: '🎉',
  title: 'Bienvenue !',
  first_name: 'Jean',
  last_name: 'Dupont',
  email: 'jean.dupont@example.com',
  app_link: '#',
  campaign_title: 'Developpeur Full Stack',
  next_steps: 'Notre equipe reviendra vers vous tres prochainement pour la suite du processus.',
  rejection_reason: 'Votre profil ne correspond pas exactement au besoin actuel.',
  interview_date: '05 mai 2026 a 14:00',
  interview_type_text: 'en visioconference',
  location_or_link: 'https://meet.example.com/synelia',
  additional_note: 'Merci de confirmer votre disponibilite.',
  quiz_link: '#',
  quiz_deadline: '30 avril 2026 a 18:00',
  quiz_duration: '20 minutes',
  verification_link: '#',
  role: 'ADMIN',
  code: 'ABC123',
  registration_link: '#',
  expired_at: '05 mai 2026 a 23:59',
  invitation_code: 'ABC123',
  new_password: 'Temporaire123!'
};
const EDITABLE_VARIABLE_DEFINITIONS: Record<EditableVariableKey, EditableVariableDefinition> = {
  content: {
    key: 'content',
    label: 'Contenu principal',
    type: 'richtext',
    placeholder: 'Votre message principal...',
    helpText: 'Le contenu reste stable quand vous changez de preset.'
  },
  subtitle: {
    key: 'subtitle',
    label: 'Sous-titre',
    type: 'text',
    placeholder: 'Ex: Votre candidature',
    helpText: 'Petit texte affiche dans le header quand le layout le supporte.'
  }
};
const EDITABLE_VARIABLE_KEYS = Object.keys(EDITABLE_VARIABLE_DEFINITIONS) as EditableVariableKey[];

function getDefaultEditableVariables(): Record<EditableVariableKey, string> {
  return {
    content: DEFAULT_PREVIEW_VALUES['content'],
    subtitle: DEFAULT_PREVIEW_VALUES['subtitle']
  };
}

const EMAIL_ACTION_EDITOR_CONFIGS: Record<EmailActionType, EmailActionEditorConfig> = {
  APPLICATION_VERIFICATION: {
    templateKey: 'application_verification',
    subjectTemplate: 'Verification de votre adresse email - {{companyName}}',
    description: 'Email de verification envoye apres depot de candidature.',
    availableVariables: ['first_name', 'last_name', 'verification_link', 'tracking_code', 'campaign_title', 'companyName', 'currentYear'],
    previewVariables: {
      tracking_code: 'AB12CD'
    },
    recommendedPresetCategories: ['MODERN', 'MINIMAL']
  },
  PASSWORD_RESET: {
    templateKey: 'password_reset',
    subjectTemplate: 'Reinitialisation de vos acces {{companyName}}',
    description: 'Email contenant les informations de reinitialisation du mot de passe.',
    availableVariables: ['first_name', 'last_name', 'email', 'new_password', 'app_link', 'companyName', 'currentYear'],
    previewVariables: {},
    recommendedPresetCategories: ['CORPORATE', 'MINIMAL']
  },
  INVITATION_CODE: {
    templateKey: 'invitation_code',
    subjectTemplate: 'Invitation a rejoindre {{companyName}}',
    description: 'Invitation a creer un compte via un code ou un lien d\'inscription.',
    availableVariables: ['email', 'role', 'code', 'registration_link', 'expired_at', 'app_link', 'companyName', 'currentYear'],
    previewVariables: {},
    recommendedPresetCategories: ['MODERN', 'COLORFUL']
  },
  CANDIDATE_ASK_RESULT: {
    templateKey: 'candidate_ask_result',
    subjectTemplate: 'Suite a votre demande de correction - {{companyName}}',
    description: 'Notification envoyee apres validation ou refus d\'une demande de correction candidat.',
    availableVariables: ['first_name', 'last_name', 'candidate_ask_type_label', 'ask_status_label', 'ask_summary_block', 'decision_reason_block', 'verification_notice_block', 'app_link', 'companyName', 'currentYear'],
    previewVariables: {
      candidate_ask_type_label: 'l\'adresse email',
      ask_status_label: 'validee',
      ask_summary_block: '<p>Nouvelle adresse email demandee : <strong>jeanne.dupont@example.com</strong>.</p>',
      decision_reason_block: '',
      verification_notice_block: '<p>Un nouvel email de verification vient de vous etre envoye a votre nouvelle adresse afin de confirmer ce changement.</p>'
    },
    recommendedPresetCategories: ['CORPORATE', 'MODERN']
  },
  ACCEPTANCE: {
    templateKey: 'candidate_acceptance',
    subjectTemplate: 'Bonne nouvelle pour votre candidature {{campaign_title}}',
    description: 'Reponse positive envoyee a un candidat apres etude de sa candidature.',
    availableVariables: ['first_name', 'last_name', 'campaign_title', 'next_steps', 'app_link', 'companyName', 'currentYear'],
    previewVariables: {
      next_steps: 'Nous souhaitons poursuivre avec vous et organiser la suite du recrutement.'
    },
    recommendedPresetCategories: ['MODERN', 'CORPORATE']
  },
  REJECTION: {
    templateKey: 'candidate_rejection',
    subjectTemplate: 'Suite a votre candidature {{campaign_title}}',
    description: 'Reponse negative ou cloture de candidature avec message de courtoisie.',
    availableVariables: ['first_name', 'last_name', 'campaign_title', 'rejection_reason', 'companyName', 'currentYear'],
    previewVariables: {
      rejection_reason: 'Nous avons retenu un profil plus proche du besoin immediat.'
    },
    recommendedPresetCategories: ['CORPORATE', 'MINIMAL']
  },
  INTERVIEW_INVITE: {
    templateKey: 'interview_convocation',
    subjectTemplate: 'Convocation a un entretien - {{campaign_title}}',
    description: 'Invitation a un entretien avec date, type, lieu ou lien de connexion.',
    availableVariables: ['first_name', 'last_name', 'campaign_title', 'interview_date', 'interview_type_text', 'location_or_link', 'additional_note', 'companyName', 'currentYear'],
    previewVariables: {},
    recommendedPresetCategories: ['CORPORATE', 'MODERN']
  },
  QUIZ_INVITE: {
    templateKey: 'quiz_invitation',
    subjectTemplate: 'Invitation au quiz - {{campaign_title}}',
    description: 'Invitation a completer un quiz avec delai et lien d\'acces.',
    availableVariables: ['first_name', 'last_name', 'campaign_title', 'quiz_link', 'quiz_deadline', 'quiz_duration', 'companyName', 'currentYear'],
    previewVariables: {},
    recommendedPresetCategories: ['MODERN', 'COLORFUL']
  },
  WELCOME: {
    templateKey: 'welcome_email',
    subjectTemplate: 'Bienvenue chez {{companyName}}',
    description: 'Email de bienvenue ou de premier contact apres validation du dossier.',
    availableVariables: ['first_name', 'last_name', 'companyName', 'app_link', 'currentYear'],
    previewVariables: {},
    recommendedPresetCategories: ['COLORFUL', 'MODERN']
  }
};

@Component({
  selector: 'app-email-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  templateUrl: './email-editor.html',
  styleUrls: ['./email-editor.scss']
})
export class EmailEditorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // State
  isLoading = signal(true);
  isSaving = signal(false);
  templates = signal<EmailTemplate[]>([]);
  presets = signal<EmailTemplatePreset[]>([]);
  selectedTemplate = signal<EmailTemplate | null>(null);
  isNewTemplate = signal(false);
  showPresetGallery = signal(true);
  editorMode = signal<EmailEditorMode>('wysiwyg');
  editableVariables = signal<Record<EditableVariableKey, string>>(getDefaultEditableVariables());

  // Form
  form = signal<Partial<EmailTemplate>>({
    templateKey: '',
    subjectTemplate: '',
    bodyTemplate: '',
    editableVariablesJson: undefined,
    description: '',
    availableVariables: '',
    actionType: '',
    isActive: true
  });

  // Preview
  previewHtml = signal<SafeHtml>('');
  previewSubject = signal('');

  // Action types
  actionTypes = EMAIL_ACTION_TYPES;

  // Computed
  selectedActionConfig = computed(() => {
    const actionType = this.normalizeActionType(this.form().actionType);
    return actionType ? EMAIL_ACTION_EDITOR_CONFIGS[actionType] : null;
  });

  suggestedVariables = computed(() => this.selectedActionConfig()?.availableVariables ?? DEFAULT_TEMPLATE_VARIABLES);

  templateVariables = computed(() => {
    const vars = this.form().availableVariables || this.suggestedVariables().join(',');
    return vars.split(',').map(v => v.trim()).filter(v => v.length > 0);
  });

  layoutVariables = computed(() => Array.from(new Set([...EDITABLE_VARIABLE_KEYS, ...this.templateVariables()])));

  activeEditableVariableDefinitions = computed(() => {
    const placeholders = this.getTemplatePlaceholders(`${this.form().subjectTemplate || ''}\n${this.form().bodyTemplate || ''}`);
    return EDITABLE_VARIABLE_KEYS
      .filter(key => placeholders.has(key))
      .map(key => EDITABLE_VARIABLE_DEFINITIONS[key]);
  });

  systemVariableEntries = computed<VariablePreviewEntry[]>(() => {
    const placeholders = new Set<string>([
      ...this.templateVariables(),
      ...this.getTemplatePlaceholders(`${this.form().subjectTemplate || ''}\n${this.form().bodyTemplate || ''}`)
    ]);
    const editableKeys = new Set(this.activeEditableVariableDefinitions().map(definition => definition.key));
    const previewVariables = this.buildPreviewVariables();

    return Array.from(placeholders)
      .filter(key => !editableKeys.has(key as EditableVariableKey))
      .sort((left, right) => left.localeCompare(right))
      .map(key => ({
        key,
        value: previewVariables[key] || 'Valeur de preview'
      }));
  });

  systemVariableKeys = computed(() => this.systemVariableEntries().map(entry => entry.key));

  sortedPresets = computed(() => {
    const config = this.selectedActionConfig();
    if (!config) {
      return this.presets();
    }

    const recommendedCategories = new Set(config.recommendedPresetCategories);
    return [...this.presets()].sort((left, right) => {
      const leftScore = recommendedCategories.has(left.category) ? 1 : 0;
      const rightScore = recommendedCategories.has(right.category) ? 1 : 0;
      if (leftScore !== rightScore) {
        return rightScore - leftScore;
      }

      return left.name.localeCompare(right.name);
    });
  });

  hasUnsavedChanges = computed(() => {
    const tpl = this.selectedTemplate();
    const f = this.form();
    const editableVariablesJson = this.serializeEditableVariables();
    if (!tpl) {
      return this.isNewTemplate() && !!(f.templateKey || f.subjectTemplate || f.bodyTemplate || editableVariablesJson);
    }
    return tpl.templateKey !== f.templateKey ||
           tpl.subjectTemplate !== f.subjectTemplate ||
           tpl.bodyTemplate !== f.bodyTemplate ||
           (tpl.editableVariablesJson || '') !== (editableVariablesJson || '') ||
           tpl.description !== f.description ||
           tpl.availableVariables !== f.availableVariables ||
           tpl.actionType !== f.actionType ||
           tpl.presetId !== f.presetId ||
           tpl.isActive !== f.isActive;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private emailTemplateService: EmailTemplateService,
    private notificationService: NotificationService,
    private sanitizer: DomSanitizer,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData() {
    this.isLoading.set(true);
    const failedSections: string[] = [];

    forkJoin({
      templates: this.emailTemplateService.getByCriteria({}, 0, 200).pipe(
        catchError(() => {
          failedSections.push('templates');
          return of({ items: [] as EmailTemplate[], count: 0 });
        })
      ),
      presets: this.emailTemplateService.getPresets().pipe(
        catchError(() => {
          failedSections.push('presets');
          return of([] as EmailTemplatePreset[]);
        })
      )
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ templates, presets }) => {
        this.templates.set(templates.items);
        this.presets.set(presets);
        this.isLoading.set(false);
        this.initializeEditorFromRoute(templates.items);

        if (failedSections.length > 0) {
          this.notificationService.error('Chargement partiel', `Certaines donnees n'ont pas pu etre chargees : ${failedSections.join(', ')}`);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.error('Erreur', 'Erreur lors du chargement des données');
      }
    });
  }

  selectTemplate(tpl: EmailTemplate, syncRoute = true) {
    this.selectedTemplate.set(tpl);
    this.isNewTemplate.set(false);
    this.form.set({
      templateKey: tpl.templateKey,
      subjectTemplate: tpl.subjectTemplate,
      bodyTemplate: tpl.bodyTemplate,
      editableVariablesJson: tpl.editableVariablesJson,
      description: tpl.description,
      availableVariables: tpl.availableVariables,
      actionType: tpl.actionType || '',
      presetId: tpl.presetId,
      isActive: tpl.isActive
    });
    this.editableVariables.set(this.resolveEditableVariables(tpl.editableVariablesJson, tpl.bodyTemplate || ''));
    this.updatePreview();

    if (syncRoute) {
      this.router.navigate(['/dashboard/email-editor', tpl.id]);
    }
  }

  newTemplate(initialActionType?: string | null, syncRoute = true) {
    const actionType = this.normalizeActionType(initialActionType);
    const config = actionType ? EMAIL_ACTION_EDITOR_CONFIGS[actionType] : null;
    this.selectedTemplate.set(null);
    this.isNewTemplate.set(true);
    this.form.set({
      templateKey: config?.templateKey ?? '',
      subjectTemplate: config?.subjectTemplate ?? '',
      bodyTemplate: '',
      editableVariablesJson: undefined,
      description: config?.description ?? '',
      availableVariables: (config?.availableVariables ?? DEFAULT_TEMPLATE_VARIABLES).join(','),
      actionType: actionType || '',
      presetId: undefined,
      isActive: true
    });
    this.editableVariables.set(getDefaultEditableVariables());
    this.showPresetGallery.set(true);
    this.updatePreview();

    if (syncRoute) {
      const queryParams = actionType ? { mode: 'new', actionType } : { mode: 'new' };
      this.router.navigate(['/dashboard/email-editor'], { queryParams });
    }
  }

  applyPreset(preset: EmailTemplatePreset) {
    const current = this.form();
    this.editableVariables.set(this.prepareEditableVariablesForPreset(current.bodyTemplate || ''));
    this.form.set({
      ...current,
      presetId: preset.id,
      bodyTemplate: preset.htmlStructure
    });
    this.updatePreview();
    this.showPresetGallery.set(false);
    this.notificationService.success('Preset', `"${preset.name}" appliqué`);
  }

  setEditorMode(mode: EmailEditorMode) {
    this.editorMode.set(mode);
  }

  updateBody(html: string) {
    const current = this.form();
    this.form.set({ ...current, bodyTemplate: html });
    this.updatePreview();
  }

  updateEditableVariable(key: EditableVariableKey, value: string) {
    this.editableVariables.set({
      ...this.editableVariables(),
      [key]: value
    });
    this.updatePreview();
  }

  getEditableVariableValue(key: EditableVariableKey): string {
    return this.editableVariables()[key] || getDefaultEditableVariables()[key] || '';
  }

  updateField(field: keyof EmailTemplate, value: any) {
    if (field === 'actionType') {
      this.onActionTypeChange(value);
      return;
    }

    const current = this.form();
    this.form.set({ ...current, [field]: value });
    if (field === 'bodyTemplate' || field === 'subjectTemplate') {
      this.updatePreview();
    }
  }

  onActionTypeChange(actionType: string) {
    const current = this.form();
    const previousActionType = this.normalizeActionType(current.actionType);
    const nextActionType = this.normalizeActionType(actionType);
    const previousConfig = previousActionType ? EMAIL_ACTION_EDITOR_CONFIGS[previousActionType] : null;
    const nextConfig = nextActionType ? EMAIL_ACTION_EDITOR_CONFIGS[nextActionType] : null;

    const previousSuggestedVariables = (previousConfig?.availableVariables ?? DEFAULT_TEMPLATE_VARIABLES).join(',');
    const nextSuggestedVariables = (nextConfig?.availableVariables ?? DEFAULT_TEMPLATE_VARIABLES).join(',');

    this.form.set({
      ...current,
      actionType: nextActionType || '',
      templateKey: !current.templateKey || current.templateKey === previousConfig?.templateKey
        ? nextConfig?.templateKey ?? ''
        : current.templateKey,
      subjectTemplate: !current.subjectTemplate || current.subjectTemplate === previousConfig?.subjectTemplate
        ? nextConfig?.subjectTemplate ?? ''
        : current.subjectTemplate,
      description: !current.description || current.description === previousConfig?.description
        ? nextConfig?.description ?? ''
        : current.description,
      availableVariables: !current.availableVariables || current.availableVariables === previousSuggestedVariables
        ? nextSuggestedVariables
        : current.availableVariables
    });

    this.updatePreview();

    if (this.isNewTemplate()) {
      const queryParams = nextActionType ? { mode: 'new', actionType: nextActionType } : { mode: 'new' };
      this.router.navigate(['/dashboard/email-editor'], { queryParams, replaceUrl: true });
    }
  }

  resetVariablesForCurrentAction() {
    this.form.set({
      ...this.form(),
      availableVariables: this.suggestedVariables().join(',')
    });
  }

  private updatePreview() {
    const body = this.form().bodyTemplate || '';
    const previewVariables = this.buildPreviewVariables();
    const preview = this.renderPreviewTemplate(body, previewVariables);
    this.previewHtml.set(this.sanitizer.bypassSecurityTrustHtml(preview));
    this.previewSubject.set(this.renderPreviewTemplate(this.form().subjectTemplate || '', previewVariables));
  }

  save() {
    const f = this.form();
    if (!f.templateKey || !f.subjectTemplate || !f.bodyTemplate) {
      this.notificationService.error('Champs requis', 'Veuillez remplir les champs obligatoires (clé, sujet, contenu)');
      return;
    }

    const payload: Partial<EmailTemplate> = {
      ...f,
      editableVariablesJson: this.serializeEditableVariables() ?? ''
    };
    this.isSaving.set(true);

    if (this.isNewTemplate()) {
      this.emailTemplateService.create(payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (created) => {
          this.isSaving.set(false);
          const successMessage = created?.templateKey && created.templateKey !== payload.templateKey
            ? `Template cree avec succes. Cle generee: ${created.templateKey}`
            : 'Template cree avec succes';
          this.notificationService.success('Succes', successMessage);
          this.loadData();
          if (created) this.selectTemplate(created);
        },
        error: (error) => {
          this.isSaving.set(false);
          this.notificationService.error('Erreur', this.extractErrorMessage(error, 'Erreur lors de la creation'));
        }
      });
    } else {
      const tpl = this.selectedTemplate();
      if (!tpl) return;
      this.emailTemplateService.update({ ...payload, id: tpl.id }).pipe(takeUntil(this.destroy$)).subscribe({
        next: (updated) => {
          this.isSaving.set(false);
          this.notificationService.success('Succes', 'Template mis a jour');
          this.loadData();
          if (updated) this.selectTemplate(updated);
        },
        error: (error) => {
          this.isSaving.set(false);
          this.notificationService.error('Erreur', this.extractErrorMessage(error, 'Erreur lors de la mise a jour'));
        }
      });
    }
  }

  deleteTemplate() {
    const tpl = this.selectedTemplate();
    if (!tpl) return;
    if (!confirm(`Supprimer le template "${tpl.templateKey}" ?`)) return;
    this.emailTemplateService.delete(tpl.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.success('Succès', 'Template supprimé');
        this.selectedTemplate.set(null);
        this.isNewTemplate.set(false);
        this.loadData();
      },
      error: () => this.notificationService.error('Erreur', 'Erreur lors de la suppression')
    });
  }

  duplicateTemplate() {
    const tpl = this.selectedTemplate();
    if (!tpl) return;
    this.isNewTemplate.set(true);
    this.selectedTemplate.set(null);
    this.form.set({
      templateKey: tpl.templateKey + '_copy',
      subjectTemplate: tpl.subjectTemplate,
      bodyTemplate: tpl.bodyTemplate,
      editableVariablesJson: tpl.editableVariablesJson,
      description: tpl.description,
      availableVariables: tpl.availableVariables,
      actionType: tpl.actionType || '',
      presetId: tpl.presetId,
      isActive: true
    });
    this.editableVariables.set(this.resolveEditableVariables(tpl.editableVariablesJson, tpl.bodyTemplate || ''));
    const actionType = this.normalizeActionType(tpl.actionType);
    const queryParams = actionType ? { mode: 'new', actionType } : { mode: 'new' };
    this.router.navigate(['/dashboard/email-editor'], { queryParams });
    this.updatePreview();
  }

  isPresetRecommended(category: string): boolean {
    return !!this.selectedActionConfig()?.recommendedPresetCategories.includes(category);
  }

  getPresetIcon(category: string): string {
    switch (category) {
      case 'MINIMAL': return '○';
      case 'MODERN': return '◆';
      case 'CORPORATE': return '■';
      case 'COLORFUL': return '★';
      case 'DARK': return '●';
      default: return '◇';
    }
  }

  getActionTypeLabel(actionType: string): string {
    return this.actionTypes.find(a => a.value === actionType)?.label || actionType;
  }

  private initializeEditorFromRoute(templates: EmailTemplate[]) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const tpl = templates.find(template => template.id === +id);
      if (tpl) {
        this.selectTemplate(tpl, false);
        return;
      }
    }

    const mode = this.route.snapshot.queryParamMap.get('mode');
    const actionType = this.route.snapshot.queryParamMap.get('actionType');
    if (mode === 'new') {
      this.newTemplate(actionType, false);
      return;
    }

    if (templates.length === 0) {
      this.newTemplate(actionType, false);
    }
  }

  private normalizeActionType(actionType?: string | null): EmailActionType | '' {
    if (!actionType || !EMAIL_ACTION_TYPE_VALUES.includes(actionType as EmailActionType)) {
      return '';
    }

    return actionType as EmailActionType;
  }

  private extractErrorMessage(error: any, fallback: string): string {
    return error?.error?.status?.message || error?.status?.message || fallback;
  }

  private buildPreviewVariables(): Record<string, string> {
    return {
      ...DEFAULT_PREVIEW_VALUES,
      companyName: this.themeService.companyName() || DEFAULT_PREVIEW_VALUES['companyName'],
      ...(this.selectedActionConfig()?.previewVariables ?? {}),
      ...this.editableVariables()
    };
  }

  private resolveEditableVariables(editableVariablesJson?: string, currentLayout = ''): Record<EditableVariableKey, string> {
    const defaults = getDefaultEditableVariables();
    const parsedVariables = this.parseEditableVariablesJson(editableVariablesJson);
    const currentPlaceholders = this.getTemplatePlaceholders(currentLayout);

    return {
      ...defaults,
      ...parsedVariables,
      content: parsedVariables.content
        || (!currentPlaceholders.has('content') && currentLayout.trim() ? currentLayout : defaults.content),
      subtitle: parsedVariables.subtitle || defaults.subtitle
    };
  }

  private prepareEditableVariablesForPreset(currentLayout: string): Record<EditableVariableKey, string> {
    const defaults = getDefaultEditableVariables();
    const currentVariables = {
      ...defaults,
      ...this.editableVariables()
    };
    const currentPlaceholders = this.getTemplatePlaceholders(currentLayout);

    if (!currentPlaceholders.has('content') && currentLayout.trim()) {
      currentVariables.content = currentLayout;
    }

    return currentVariables;
  }

  private parseEditableVariablesJson(editableVariablesJson?: string): Partial<Record<EditableVariableKey, string>> {
    if (!editableVariablesJson) {
      return {};
    }

    try {
      const parsed = JSON.parse(editableVariablesJson) as Record<string, unknown>;
      return EDITABLE_VARIABLE_KEYS.reduce((result, key) => {
        const value = parsed[key];
        if (typeof value === 'string') {
          result[key] = value;
        }
        return result;
      }, {} as Partial<Record<EditableVariableKey, string>>);
    } catch {
      return {};
    }
  }

  private serializeEditableVariables(): string | undefined {
    const activeDefinitions = this.activeEditableVariableDefinitions();
    if (activeDefinitions.length === 0) {
      return undefined;
    }

    const payload = activeDefinitions.reduce((result, definition) => {
      result[definition.key] = this.getEditableVariableValue(definition.key);
      return result;
    }, {} as Record<EditableVariableKey, string>);

    return JSON.stringify(payload);
  }

  private getTemplatePlaceholders(template: string): Set<string> {
    const placeholders = new Set<string>();
    const matches = template.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
    for (const match of matches) {
      if (match[1]) {
        placeholders.add(match[1]);
      }
    }
    return placeholders;
  }

  private renderPreviewTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${this.escapeRegExp(key)}\\}\\}`, 'g'), value);
    }

    return result;
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
