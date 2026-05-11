import { Component, signal, computed, effect, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, takeUntil, forkJoin, of, catchError } from 'rxjs';
import {
  EmailTemplateService,
  EmailTemplate,
  EmailTemplatePreset,
  EMAIL_ACTION_TYPES,
  EmailActionType
} from '../../../core/services/email-template.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeService as BrandingThemeService } from '../../../core/services/theme.service';
import { ThemeService as UiThemeService } from '../../../core/services/theme';
import { FilterCheckboxComponent } from '../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../shared/filter-select/filter-select';
import { RichTextEditorComponent } from '../../../shared/rich-text-editor/rich-text-editor';
import { VariableTokenInputComponent } from '../../../shared/variable-token-input/variable-token-input';

interface EmailActionEditorConfig {
  templateKey: string;
  subjectTemplate: string;
  description: string;
  availableVariables: string[];
  previewVariables: Record<string, string>;
  recommendedPresetCategories: string[];
}

type EmailEditorMode = 'wysiwyg' | 'html';
type EmailEditorTarget = 'template' | 'preset';
type EditableVariableKey = 'content' | 'subtitle' | 'title' | 'buttonText' | 'buttonLink';
type EmailPresetCategory =
  | 'APPLICATION_VERIFICATION'
  | 'PASSWORD_RESET'
  | 'INVITATION_CODE'
  | 'CANDIDATE_ASK_RESULT'
  | 'PRE_SCREEN_DECISION'
  | 'FINAL_DECISION'
  | 'INTERVIEW_INVITE'
  | 'QUIZ_INVITE'
  | 'WELCOME'
  | 'GENERIC';

interface EditableVariableDescriptor {
  key: string;
  label: string;
  type: 'text' | 'richtext';
  placeholder: string;
  helpText: string;
  group: 'known' | 'dynamic';
  sortOrder: number;
}

interface VariablePreviewEntry {
  key: string;
  value: string;
}

interface VarExplorerEntry {
  key: string;
  group: 'editable' | 'business' | 'global';
  groupLabel: string;
  exampleValue: string;
  label: string;
}

interface VariablePreviewGroup {
  key: 'business' | 'global';
  title: string;
  description: string;
  entries: VariablePreviewEntry[];
}

const DEFAULT_TEMPLATE_VARIABLES = ['first_name', 'last_name', 'campaign_title', 'app_link', 'companyName', 'currentYear'];
const EMAIL_ACTION_TYPE_VALUES = EMAIL_ACTION_TYPES.map(action => action.value);
const LEGACY_CTA_PLACEHOLDER = 'ctaButton';
const HIDDEN_SYSTEM_VARIABLE_KEYS = new Set<string>([LEGACY_CTA_PLACEHOLDER]);
const GLOBAL_SYSTEM_VARIABLE_KEYS = new Set<string>([
  'app_link',
  'companyAddress',
  'companyName',
  'currentYear',
  'emoji',
  'primaryColor',
  'primaryColorDark',
  'signature',
  'unsubscribeUrl'
]);
const DEFAULT_APP_LINK = typeof window !== 'undefined' && window.location?.origin
  ? window.location.origin
  : 'http://localhost:4200';
const DEFAULT_PREVIEW_VALUES: Record<string, string> = {
  candidatName: 'Jean Dupont',
  candidatEmail: 'jean.dupont@example.com',
  companyName: 'Synelia',
  campaignTitle: 'Developpeur Full Stack',
  currentYear: new Date().getFullYear().toString(),
  primaryColor: 'var(--color-primary, #6366f1)',
  primaryColorDark: 'var(--color-primary-dark, #4f46e5)',
  title: 'Bienvenue !',
  subtitle: 'Votre candidature',
  content: '<p>Bonjour {{first_name}},</p><p>Merci pour votre candidature.</p>',
  buttonText: 'Voir ma candidature',
  buttonLink: DEFAULT_APP_LINK,
  ctaButton: '<a href="http://localhost:4200" class="btn">Voir ma candidature</a>',
  signature: '<p>Cordialement,<br>L\'equipe RH</p>',
  companyAddress: '123 Rue Example, Paris',
  unsubscribeUrl: '#',
  emoji: '🎉',
  first_name: 'Jean',
  last_name: 'Dupont',
  email: 'jean.dupont@example.com',
  app_link: DEFAULT_APP_LINK,
  campaign_title: 'Developpeur Full Stack',
  next_steps: 'Notre equipe reviendra vers vous tres prochainement pour la suite du processus.',
  decision_type: 'PRE_SCREEN_ACCEPTED',
  decision_stage: 'preselection',
  decision_label: 'acceptee',
  candidate_full_name: 'Jean Dupont',
  candidate_email: 'jean.dupont@example.com',
  application_status: 'PRE_SCREEN_ACCEPTED',
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
const EDITABLE_VARIABLE_DEFINITIONS: Record<EditableVariableKey, EditableVariableDescriptor> = {
  title: {
    key: 'title',
    label: 'Titre',
    type: 'text',
    placeholder: 'Ex: Bienvenue chez Synelia',
    helpText: 'Titre principal affiche dans les layouts qui le supportent.',
    group: 'known',
    sortOrder: 0
  },
  subtitle: {
    key: 'subtitle',
    label: 'Sous-titre',
    type: 'text',
    placeholder: 'Ex: Votre candidature',
    helpText: 'Petit texte affiche dans le header quand le layout le supporte.',
    group: 'known',
    sortOrder: 1
  },
  content: {
    key: 'content',
    label: 'Contenu principal',
    type: 'richtext',
    placeholder: 'Votre message principal...',
    helpText: 'Le contenu reste stable quand vous changez de preset.',
    group: 'known',
    sortOrder: 2
  },
  buttonText: {
    key: 'buttonText',
    label: 'Texte du bouton',
    type: 'text',
    placeholder: 'Ex: Voir ma candidature',
    helpText: 'Texte affiche a l\'interieur du bouton d\'appel a l\'action.',
    group: 'known',
    sortOrder: 3
  },
  buttonLink: {
    key: 'buttonLink',
    label: 'Lien du bouton',
    type: 'text',
    placeholder: 'https://app.example.com/mon-lien',
    helpText: 'Lien ouvert par le bouton d\'appel a l\'action.',
    group: 'known',
    sortOrder: 4
  }
};
const EDITABLE_VARIABLE_KEYS = Object.keys(EDITABLE_VARIABLE_DEFINITIONS) as EditableVariableKey[];

function getDefaultEditableVariables(): Record<string, string> {
  return {
    title: DEFAULT_PREVIEW_VALUES['title'],
    content: DEFAULT_PREVIEW_VALUES['content'],
    subtitle: DEFAULT_PREVIEW_VALUES['subtitle'],
    buttonText: DEFAULT_PREVIEW_VALUES['buttonText'],
    buttonLink: DEFAULT_PREVIEW_VALUES['buttonLink']
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
    recommendedPresetCategories: ['APPLICATION_VERIFICATION', 'GENERIC']
  },
  PASSWORD_RESET: {
    templateKey: 'password_reset',
    subjectTemplate: 'Reinitialisation de vos acces {{companyName}}',
    description: 'Email contenant les informations de reinitialisation du mot de passe.',
    availableVariables: ['first_name', 'last_name', 'email', 'new_password', 'app_link', 'companyName', 'currentYear'],
    previewVariables: {},
    recommendedPresetCategories: ['PASSWORD_RESET', 'GENERIC']
  },
  INVITATION_CODE: {
    templateKey: 'invitation_code',
    subjectTemplate: 'Invitation a rejoindre {{companyName}}',
    description: 'Invitation a creer un compte via un code ou un lien d\'inscription.',
    availableVariables: ['email', 'role', 'code', 'registration_link', 'expired_at', 'app_link', 'companyName', 'currentYear'],
    previewVariables: {},
    recommendedPresetCategories: ['INVITATION_CODE', 'GENERIC']
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
    recommendedPresetCategories: ['CANDIDATE_ASK_RESULT', 'GENERIC']
  },
  PRE_SCREEN_DECISION: {
    templateKey: 'pre_screen_decision',
    subjectTemplate: 'Resultat de votre preselection - {{campaign_title}}',
    description: 'Email envoye suite a une decision de preselection (acceptation ou refus). Utilise les variables decision_label et decision_stage pour personnaliser le message selon le resultat.',
    availableVariables: ['first_name', 'last_name', 'candidate_full_name', 'candidate_email', 'campaign_title', 'decision_type', 'decision_stage', 'decision_label', 'application_status', 'app_link', 'companyName', 'currentYear'],
    previewVariables: {
      decision_type: 'PRE_SCREEN_ACCEPTED',
      decision_stage: 'preselection',
      decision_label: 'acceptee',
      candidate_full_name: 'Jean Dupont',
      candidate_email: 'jean.dupont@example.com',
      application_status: 'PRE_SCREEN_ACCEPTED'
    },
    recommendedPresetCategories: ['PRE_SCREEN_DECISION', 'GENERIC']
  },
  FINAL_DECISION: {
    templateKey: 'final_decision',
    subjectTemplate: 'Resultat final de votre candidature - {{campaign_title}}',
    description: 'Email envoye suite a une decision finale (acceptation ou refus definitif). Partage les memes variables que PRE_SCREEN_DECISION, avec decision_stage = decision_finale.',
    availableVariables: ['first_name', 'last_name', 'candidate_full_name', 'candidate_email', 'campaign_title', 'decision_type', 'decision_stage', 'decision_label', 'application_status', 'app_link', 'companyName', 'currentYear'],
    previewVariables: {
      decision_type: 'FINAL_ACCEPTED',
      decision_stage: 'decision_finale',
      decision_label: 'acceptee',
      candidate_full_name: 'Jean Dupont',
      candidate_email: 'jean.dupont@example.com',
      application_status: 'FINAL_ACCEPTED'
    },
    recommendedPresetCategories: ['FINAL_DECISION', 'GENERIC']
  },
  INTERVIEW_INVITE: {
    templateKey: 'interview_convocation',
    subjectTemplate: 'Convocation a un entretien - {{campaign_title}}',
    description: 'Invitation a un entretien avec date, type, lieu ou lien de connexion.',
    availableVariables: ['first_name', 'last_name', 'campaign_title', 'interview_date', 'interview_type_text', 'location_or_link', 'additional_note', 'companyName', 'currentYear'],
    previewVariables: {},
    recommendedPresetCategories: ['INTERVIEW_INVITE', 'GENERIC']
  },
  QUIZ_INVITE: {
    templateKey: 'quiz_invitation',
    subjectTemplate: 'Invitation au quiz - {{campaign_title}}',
    description: 'Invitation a completer un quiz avec delai et lien d\'acces.',
    availableVariables: ['first_name', 'last_name', 'campaign_title', 'quiz_link', 'quiz_deadline', 'quiz_duration', 'companyName', 'currentYear'],
    previewVariables: {},
    recommendedPresetCategories: ['QUIZ_INVITE', 'GENERIC']
  },
  WELCOME: {
    templateKey: 'welcome_email',
    subjectTemplate: 'Bienvenue chez {{companyName}}',
    description: 'Email de bienvenue ou de premier contact apres validation du dossier.',
    availableVariables: ['first_name', 'last_name', 'companyName', 'app_link', 'currentYear'],
    previewVariables: {},
    recommendedPresetCategories: ['WELCOME', 'GENERIC']
  }
};

// P20: union of all business/available variables across every action type — used to avoid
// mis-classifying known business vars as "user-created" when no actionType is selected yet.
const ALL_BUSINESS_VARIABLE_KEYS = new Set<string>([
  ...DEFAULT_TEMPLATE_VARIABLES,
  ...Object.values(EMAIL_ACTION_EDITOR_CONFIGS).flatMap(c => c.availableVariables)
]);

@Component({
  selector: 'app-email-editor',
  standalone: true,
  imports: [CommonModule, FilterCheckboxComponent, FormsModule, RichTextEditorComponent, VariableTokenInputComponent, FilterSelectComponent, FilterSelectOptionDirective],
  templateUrl: './email-editor.html',
  styleUrls: ['./email-editor.scss']
})
export class EmailEditorComponent implements OnInit, OnDestroy {
  @ViewChild('bodyRte') bodyRteRef?: RichTextEditorComponent;
  @ViewChild('sourceTextarea') sourceTextareaRef?: ElementRef<HTMLTextAreaElement>;

  private destroy$ = new Subject<void>();

  // State
  isLoading = signal(true);
  isSaving = signal(false);
  editorTarget = signal<EmailEditorTarget>('template');
  templates = signal<EmailTemplate[]>([]);
  presets = signal<EmailTemplatePreset[]>([]);
  selectedTemplate = signal<EmailTemplate | null>(null);
  isNewTemplate = signal(false);
  selectedPreset = signal<EmailTemplatePreset | null>(null);
  isNewPreset = signal(false);
  showPresetGallery = signal(false); // kept for backward-compat, unused after P3
  editorMode = signal<EmailEditorMode>('wysiwyg');
  editableVariables = signal<Record<string, string>>(getDefaultEditableVariables());
  listSearchTerm = signal('');
  presetCategories: EmailPresetCategory[] = [
    'APPLICATION_VERIFICATION',
    'PASSWORD_RESET',
    'INVITATION_CODE',
    'CANDIDATE_ASK_RESULT',
    'PRE_SCREEN_DECISION',
    'FINAL_DECISION',
    'INTERVIEW_INVITE',
    'QUIZ_INVITE',
    'WELCOME',
    'GENERIC'
  ];

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
  presetForm = signal<Partial<EmailTemplatePreset>>({
    name: '',
    category: 'MODERN',
    htmlStructure: '',
    previewImage: '',
    description: ''
  });

  // Preview
  htmlEditorValue = signal('');
  highlightedHtmlEditorValue = computed(() => this.highlightSourceCode(this.htmlEditorValue()));
  previewDocument = signal<SafeHtml | null>(null);
  previewSubject = signal('');
  isPreviewExpanded = signal(false);
  editableVarsCollapsed = signal(false);
  previewPanelCollapsed = signal(false);
  varExplorerOpen = signal(false);
  varExplorerSearch = signal('');
  varExplorerCopied = signal<string | null>(null);

  // P14: user-defined variable management
  userDefinedVariableKeys = signal<string[]>([]);
  // P20: auto-detected unknown {{key}} patterns found in editable variable values
  p20AutoDetectedKeys = signal<string[]>([]);
  // P20: keys the user has explicitly dismissed (so they don't re-appear after edits)
  ignoredP20Keys = signal<string[]>([]);
  // P20: auto-detected keys still visible (not ignored by user)
  visibleP20Keys = computed(() => {
    const ignored = new Set(this.ignoredP20Keys());
    return this.p20AutoDetectedKeys().filter(k => !ignored.has(k));
  });
  // All 'dynamic' (custom/unknown) editable keys — single source of truth for the sidebar panel
  dynamicEditableKeys = computed(() =>
    this.activeEditableVariableDefinitions()
      .filter(d => d.group === 'dynamic')
      .map(d => d.key)
  );
  showCreateVarForm = signal(false);
  newVarKey = signal('');
  newVarKeyError = signal<string | null>(null);

  uiThemeMode = signal<'dark' | 'light'>('light');
  sourceEditorScrollTop = signal(0);
  sourceEditorScrollLeft = signal(0);

  // Action types
  actionTypes = EMAIL_ACTION_TYPES;
  isPresetMode = computed(() => this.editorTarget() === 'preset');
  hasOpenDocument = computed(() => this.isPresetMode()
    ? !!(this.selectedPreset() || this.isNewPreset())
    : !!(this.selectedTemplate() || this.isNewTemplate()));
  editorTitle = computed(() => this.isPresetMode() ? 'Éditeur de presets email' : 'Éditeur de templates email');
  listTitle = computed(() => this.isPresetMode() ? `Presets (${this.presets().length})` : `Templates (${this.templates().length})`);
  listSearchPlaceholder = computed(() => this.isPresetMode()
    ? 'Rechercher un preset par nom, categorie ou description'
    : 'Rechercher un template par cle, action, description ou statut');
  listSelectAriaLabel = computed(() => this.isPresetMode()
    ? 'Selectionner un preset existant'
    : 'Selectionner un template existant');
  selectedListItemId = computed<number | undefined>(() => this.isPresetMode()
    ? this.selectedPreset()?.id
    : this.selectedTemplate()?.id);
  emptySelectionMessage = computed(() => this.isPresetMode()
    ? 'Sélectionnez un preset ou créez-en un nouveau'
    : 'Sélectionnez un template ou créez-en un nouveau');
  currentBodyTemplate = computed(() => this.isPresetMode() ? (this.presetForm().htmlStructure || '') : (this.form().bodyTemplate || ''));
  currentSubjectTemplate = computed(() => this.isPresetMode() ? '' : (this.form().subjectTemplate || ''));
  currentTemplatePreset = computed(() => this.isPresetMode() ? this.selectedPreset() : this.findPresetById(this.form().presetId));

  // Computed
  selectedActionConfig = computed(() => {
    if (this.isPresetMode()) {
      return null;
    }

    const actionType = this.normalizeActionType(this.form().actionType);
    return actionType ? EMAIL_ACTION_EDITOR_CONFIGS[actionType] : null;
  });

  suggestedVariables = computed(() => this.selectedActionConfig()?.availableVariables ?? DEFAULT_TEMPLATE_VARIABLES);

  templateVariables = computed(() => {
    if (this.isPresetMode()) {
      return DEFAULT_TEMPLATE_VARIABLES;
    }
    // Always derived from actionType config — the DB value is ignored for variable classification
    return this.suggestedVariables();
  });

  layoutVariables = computed(() => {
    const editableKeys = this.activeEditableVariableDefinitions().map(d => d.key);
    return Array.from(new Set([...editableKeys, ...this.templateVariables()]));
  });

  activeEditableVariableDefinitions = computed<EditableVariableDescriptor[]>(() => {
    const placeholders = this.getTemplatePlaceholders(
      `${this.currentSubjectTemplate()}\n${this.currentBodyTemplate()}`
    );
    const businessKeys = new Set(this.templateVariables());
    const htmlEditableKeys = this.getEditableKeys(placeholders, businessKeys);
    const htmlEditableSet = new Set(htmlEditableKeys);
    // P14: include user-defined keys not yet present in the HTML
    const extraUserKeys = Array.from(new Set([
      ...this.userDefinedVariableKeys(),
      ...this.p20AutoDetectedKeys()
    ])).filter(
      k => !htmlEditableSet.has(k)
        && !businessKeys.has(k)
        && !HIDDEN_SYSTEM_VARIABLE_KEYS.has(k)
        && !GLOBAL_SYSTEM_VARIABLE_KEYS.has(k)
    );
    return [...htmlEditableKeys, ...extraUserKeys]
      .map(key => this.getEditableVariableDescriptor(key))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.key.localeCompare(b.key));
  });

  systemVariableEntries = computed<VariablePreviewEntry[]>(() => {
    const htmlPlaceholders = this.getTemplatePlaceholders(
      `${this.currentSubjectTemplate()}\n${this.currentBodyTemplate()}`
    );
    const businessKeys = new Set(this.templateVariables());
    const allPlaceholders = new Set<string>([...businessKeys, ...htmlPlaceholders]);
    const editableKeys = new Set(this.getEditableKeys(htmlPlaceholders, businessKeys));
    const previewVariables = this.buildPreviewVariables();

    return Array.from(allPlaceholders)
      .filter(key => !editableKeys.has(key) && !HIDDEN_SYSTEM_VARIABLE_KEYS.has(key))
      .sort((left, right) => left.localeCompare(right))
      .map(key => ({
        key,
        value: previewVariables[key] || 'Valeur de preview'
      }));
  });

  systemVariableKeys = computed(() => this.systemVariableEntries().map(entry => entry.key));

  readonlyVariableGroups = computed<VariablePreviewGroup[]>(() => {
    const groups: Record<VariablePreviewGroup['key'], VariablePreviewGroup> = {
      business: {
        key: 'business',
        title: 'Variables metier / BDD',
        description: 'Elles viennent du contexte candidat, campagne, workflow ou base de donnees.',
        entries: []
      },
      global: {
        key: 'global',
        title: 'Variables globales / theme',
        description: 'Elles viennent du branding, de la configuration globale ou du theme actif.',
        entries: []
      }
    };

    for (const entry of this.systemVariableEntries()) {
      const groupKey: VariablePreviewGroup['key'] = GLOBAL_SYSTEM_VARIABLE_KEYS.has(entry.key) ? 'global' : 'business';
      groups[groupKey].entries.push(entry);
    }

    return Object.values(groups).filter(group => group.entries.length > 0);
  });

  varExplorerEntries = computed<VarExplorerEntry[]>(() => {
    const entries: VarExplorerEntry[] = [];
    for (const def of this.activeEditableVariableDefinitions()) {
      entries.push({
        key: def.key,
        group: 'editable',
        groupLabel: 'Champs éditables',
        exampleValue: this.editableVariables()[def.key] ?? DEFAULT_PREVIEW_VALUES[def.key] ?? '',
        label: def.label
      });
    }
    for (const group of this.readonlyVariableGroups()) {
      for (const entry of group.entries) {
        entries.push({
          key: entry.key,
          group: group.key,
          groupLabel: group.title,
          exampleValue: entry.value,
          label: this.generateEditableVariableLabel(entry.key)
        });
      }
    }
    return entries;
  });

  filteredVarExplorerEntries = computed<VarExplorerEntry[]>(() => {
    const q = this.varExplorerSearch().toLowerCase().trim();
    if (!q) return this.varExplorerEntries();
    return this.varExplorerEntries().filter(e =>
      e.key.toLowerCase().includes(q) ||
      e.label.toLowerCase().includes(q) ||
      e.groupLabel.toLowerCase().includes(q) ||
      e.exampleValue.toLowerCase().includes(q)
    );
  });

  rteVariableGroups = computed<{ label: string; keys: string[]; colorClass?: string; colorVar?: string }[]>(() => {
    const definitions = this.activeEditableVariableDefinitions();
    const knownKeys = definitions.filter(d => d.group === 'known').map(d => d.key);
    const dynamicKeys = definitions.filter(d => d.group === 'dynamic').map(d => d.key);
    const groups: { label: string; keys: string[]; colorClass?: string; colorVar?: string }[] = [];

    if (knownKeys.length > 0) {
      groups.push({ label: 'Variables de mail', keys: knownKeys, colorClass: 'rte-var-btn--mail', colorVar: '--primary' });
    }
    if (dynamicKeys.length > 0) {
      groups.push({ label: 'Variables créées', keys: dynamicKeys, colorClass: 'rte-var-btn--created', colorVar: '--secondary' });
    }

    for (const group of this.readonlyVariableGroups()) {
      if (group.key === 'business') {
        groups.push({ label: 'Variables metier / BDD', keys: group.entries.map(e => e.key), colorClass: 'rte-var-btn--business', colorVar: '--info' });
      } else if (group.key === 'global') {
        groups.push({ label: 'Variables globales / theme', keys: group.entries.map(e => e.key), colorClass: 'rte-var-btn--global', colorVar: '--success' });
      }
    }

    return groups;
  });

  // Same as rteVariableGroups but without the 'Variables de mail' group.
  // Used in the 'content' (richtext) editable field : mail variables (title, subtitle…)
  // are the parent fields and should not be inserted inside their own content.
  rteContentVariableGroups = computed<{ label: string; keys: string[]; colorClass?: string; colorVar?: string }[]>(() =>
    this.rteVariableGroups().filter(g => g.label !== 'Variables de mail')
  );

  // P16: Map from variable key → CSS color variable.
  // Used by highlightInlinePlaceholders (HTML source) and by the RTE to colorize
  // inserted/existing {{...}} tokens per variable type.
  placeholderColorMap = computed<Map<string, string>>(() => {
    const map = new Map<string, string>();
    for (const def of this.activeEditableVariableDefinitions()) {
      map.set(def.key, def.group === 'known' ? '--primary' : '--secondary');
    }
    for (const group of this.readonlyVariableGroups()) {
      const colorVar = group.key === 'global' ? '--success' : '--info';
      for (const entry of group.entries) {
        map.set(entry.key, colorVar);
      }
    }
    return map;
  });

  sortedPresets = computed(() => {
    const config = this.selectedActionConfig();
    if (!config) {
      return [...this.presets()].sort((left, right) => left.name.localeCompare(right.name));
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

  matchingTemplates = computed(() => {
    const search = this.normalizeSearchText(this.listSearchTerm());

    if (!search) {
      return this.templates();
    }

    return this.templates().filter(template => this.matchesTemplateSearch(template, search));
  });

  filteredTemplates = computed(() => this.ensureSelectedTemplateVisible(this.matchingTemplates()));

  matchingPresets = computed(() => {
    const search = this.normalizeSearchText(this.listSearchTerm());

    if (!search) {
      return this.presets();
    }

    return this.presets().filter(preset => this.matchesPresetSearch(preset, search));
  });

  filteredPresets = computed(() => this.ensureSelectedPresetVisible(this.matchingPresets()));

  visibleListCount = computed(() => this.isPresetMode()
    ? this.matchingPresets().length
    : this.matchingTemplates().length);

  hasUnsavedChanges = computed(() => {
    if (this.isPresetMode()) {
      const preset = this.selectedPreset();
      const form = this.presetForm();

      if (!preset) {
        return this.isNewPreset() && !!(form.name || form.description || form.htmlStructure);
      }

      return preset.name !== form.name
        || preset.category !== form.category
        || preset.htmlStructure !== form.htmlStructure
        || (preset.previewImage || '') !== (form.previewImage || '')
        || (preset.description || '') !== (form.description || '');
    }

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
    public themeService: BrandingThemeService,
    private uiThemeService: UiThemeService,
    private sanitizer: DomSanitizer
  ) {
    // P20: auto-detect unknown {{key}} patterns typed inside editable variable values
    effect(() => {
      const vars = this.editableVariables();
      // Exclude ALL known business vars across every action type (not just the currently selected one)
      // so that variables like {{first_name}} or {{role}} are never mis-classified before an
      // actionType is selected, and the list fully recomputes when actionType changes.
      const excludedKeys = new Set<string>([
        ...EDITABLE_VARIABLE_KEYS,
        ...Array.from(GLOBAL_SYSTEM_VARIABLE_KEYS),
        ...Array.from(HIDDEN_SYSTEM_VARIABLE_KEYS),
        ...Array.from(ALL_BUSINESS_VARIABLE_KEYS),
        ...this.templateVariables(),
        ...this.userDefinedVariableKeys(),
        ...this.ignoredP20Keys()
      ]);

      const detected = new Set<string>();
      for (const value of Object.values(vars)) {
        if (!value) continue;
        const plain = value.replace(/<[^>]+>/g, ' ');
        for (const match of plain.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)) {
          if (match[1] && !excludedKeys.has(match[1])) {
            detected.add(match[1]);
          }
        }
      }

      // Use set() — full recompute — so that selecting/changing actionType immediately
      // removes keys that are now recognized as business variables.
      this.p20AutoDetectedKeys.set(Array.from(detected));
    });
  }

  ngOnInit() {
    this.initializeEditorTarget();
    this.uiThemeMode.set(this.uiThemeService.getCurrentTheme() ? 'dark' : 'light');
    this.uiThemeService.isDarkMode$.pipe(takeUntil(this.destroy$)).subscribe((isDarkMode) => {
      this.uiThemeMode.set(isDarkMode ? 'dark' : 'light');
      this.updatePreview();
    });
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
      templates: this.emailTemplateService.getByCriteria().pipe(
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
        this.initializeEditorFromRoute(templates.items, presets);

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
    this.selectedPreset.set(null);
    this.isNewPreset.set(false);
    this.selectedTemplate.set(tpl);
    this.isNewTemplate.set(false);
    this.form.set({
      templateKey: tpl.templateKey,
      subjectTemplate: tpl.subjectTemplate,
      bodyTemplate: tpl.bodyTemplate,
      editableVariablesJson: tpl.editableVariablesJson,
      description: tpl.description,
      // Recompute from actionType config — ignore the stored DB value
      availableVariables: (() => {
        const at = this.normalizeActionType(tpl.actionType);
        const cfg = at ? EMAIL_ACTION_EDITOR_CONFIGS[at] : null;
        return (cfg?.availableVariables ?? DEFAULT_TEMPLATE_VARIABLES).join(',');
      })(),
      actionType: tpl.actionType || '',
      presetId: tpl.presetId,
      isActive: tpl.isActive
    });
    this.editableVariables.set(this.resolveEditableVariables(tpl.editableVariablesJson, tpl.bodyTemplate || ''));
    this.userDefinedVariableKeys.set(this.extractUserDefinedKeysFromJson(tpl.editableVariablesJson));
    this.ignoredP20Keys.set([]);
    this.resetCreateVarForm();
    this.syncHtmlEditorValue(tpl.bodyTemplate || '');
    this.updatePreview();

    if (syncRoute) {
      this.router.navigate(['/dashboard/email-editor', tpl.id]);
    }
  }

  selectPreset(preset: EmailTemplatePreset, syncRoute = true) {
    this.selectedTemplate.set(null);
    this.isNewTemplate.set(false);
    this.selectedPreset.set(preset);
    this.isNewPreset.set(false);
    this.presetForm.set({
      name: preset.name,
      category: preset.category,
      htmlStructure: preset.htmlStructure,
      previewImage: preset.previewImage,
      description: preset.description
    });
    this.editableVariables.set(this.prepareEditableVariablesForPreset(preset.htmlStructure || ''));
    this.userDefinedVariableKeys.set([]);
    this.ignoredP20Keys.set([]);
    this.resetCreateVarForm();
    this.syncHtmlEditorValue(preset.htmlStructure || '');
    this.updatePreview();

    if (syncRoute) {
      this.router.navigate(['/dashboard/email-presets', preset.id]);
    }
  }

  newTemplate(initialActionType?: string | null, syncRoute = true) {
    const actionType = this.normalizeActionType(initialActionType);
    const config = actionType ? EMAIL_ACTION_EDITOR_CONFIGS[actionType] : null;
    this.selectedPreset.set(null);
    this.isNewPreset.set(false);
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
    this.userDefinedVariableKeys.set([]);
    this.ignoredP20Keys.set([]);
    this.resetCreateVarForm();
    this.syncHtmlEditorValue('');
    this.updatePreview();
    this.syncDefaultPresetForActionType(actionType, true);

    if (syncRoute) {
      const queryParams = actionType ? { mode: 'new', actionType } : { mode: 'new' };
      this.router.navigate(['/dashboard/email-editor'], { queryParams });
    }
  }

  newPreset(syncRoute = true) {
    this.selectedTemplate.set(null);
    this.isNewTemplate.set(false);
    this.selectedPreset.set(null);
    this.isNewPreset.set(true);
    this.presetForm.set({
      name: '',
      category: 'MODERN',
      htmlStructure: '',
      previewImage: '',
      description: ''
    });
    this.editableVariables.set(getDefaultEditableVariables());
    this.userDefinedVariableKeys.set([]);
    this.ignoredP20Keys.set([]);
    this.resetCreateVarForm();
    this.syncHtmlEditorValue('');
    this.updatePreview();

    if (syncRoute) {
      this.router.navigate(['/dashboard/email-presets'], { queryParams: { mode: 'new' } });
    }
  }

  openNewDocument() {
    if (this.isPresetMode()) {
      this.newPreset();
      return;
    }

    this.newTemplate();
  }

  saveCurrentDocument() {
    if (this.isPresetMode()) {
      this.savePreset();
      return;
    }

    this.save();
  }

  deleteCurrentDocument() {
    if (this.isPresetMode()) {
      this.deletePreset();
      return;
    }

    this.deleteTemplate();
  }

  duplicateCurrentDocument() {
    if (this.isPresetMode()) {
      this.duplicatePreset();
      return;
    }

    this.duplicateTemplate();
  }

  navigateToPresetManager() {
    this.router.navigate(['/dashboard/email-presets']);
  }

  navigateToTemplateManager() {
    this.router.navigate(['/dashboard/email-editor']);
  }

  onPresetSelectChange(presetId: string | number) {
    const id = typeof presetId === 'string' ? parseInt(presetId, 10) : presetId;
    if (!id) return;
    const preset = this.presets().find(p => p.id === id);
    if (preset) {
      this.applyPreset(preset);
    }
  }

  applyPreset(preset: EmailTemplatePreset) {
    if (this.isPresetMode()) {
      this.selectPreset(preset);
      return;
    }

    this.applyPresetToTemplate(preset, true);
  }

  setEditorMode(mode: EmailEditorMode) {
    this.editorMode.set(mode);
    if (mode === 'html') {
      this.syncHtmlEditorValue(this.currentBodyTemplate());
    }
  }

  updateBody(html: string) {
    if (this.isPresetMode()) {
      const current = this.presetForm();
      this.presetForm.set({ ...current, htmlStructure: html });
      this.syncHtmlEditorValue(html);
      this.updatePreview();
      return;
    }

    const current = this.form();
    this.form.set({ ...current, bodyTemplate: html });
    this.syncHtmlEditorValue(html);
    this.updatePreview();
  }

  updateHtmlSource(value: string) {
    this.htmlEditorValue.set(value);
    if (this.isPresetMode()) {
      this.presetForm.set({ ...this.presetForm(), htmlStructure: value });
    } else {
      this.form.set({ ...this.form(), bodyTemplate: value });
    }
    this.updatePreview();
  }

  syncSourceEditorScroll(event: Event) {
    const target = event.target as HTMLTextAreaElement | null;
    this.sourceEditorScrollTop.set(target?.scrollTop ?? 0);
    this.sourceEditorScrollLeft.set(target?.scrollLeft ?? 0);
  }

  beautifyHtmlSource() {
    const formattedHtml = this.formatHtmlForEditor(this.currentBodyTemplate());
    this.htmlEditorValue.set(formattedHtml);
    if (this.isPresetMode()) {
      this.presetForm.set({ ...this.presetForm(), htmlStructure: formattedHtml });
    } else {
      this.form.set({ ...this.form(), bodyTemplate: formattedHtml });
    }
    this.updatePreview();
  }

  togglePreviewExpanded() {
    this.isPreviewExpanded.set(!this.isPreviewExpanded());
  }

  closePreviewExpanded() {
    this.isPreviewExpanded.set(false);
  }

  updateEditableVariable(key: string, value: string) {
    this.editableVariables.set({
      ...this.editableVariables(),
      [key]: value
    });
    this.updatePreview();
  }

  getEditableVariableValue(key: string): string {
    return this.editableVariables()[key] ?? getDefaultEditableVariables()[key] ?? '';
  }

  updateListSearch(value: string) {
    this.listSearchTerm.set(value ?? '');
  }

  onListSelectionChange(value: string | number | boolean | null | undefined) {
    if (value == null || value === '') {
      return;
    }

    const numericId = typeof value === 'number' ? value : Number(value);

    if (Number.isNaN(numericId)) {
      return;
    }

    if (this.isPresetMode()) {
      const preset = this.presets().find(item => item.id === numericId);
      if (preset) {
        this.selectPreset(preset);
      }
      return;
    }

    const template = this.templates().find(item => item.id === numericId);
    if (template) {
      this.selectTemplate(template);
    }
  }

  buildTemplateSelectLabel(tpl: EmailTemplate): string {
    const actionLabel = tpl.actionType ? this.getActionTypeLabel(tpl.actionType) : 'Sans action';
    const statusLabel = tpl.isActive ? 'Actif' : 'Inactif';
    return `${tpl.isActive ? '●' : '○'} ${tpl.templateKey || 'Sans cle'} - ${actionLabel} - ${statusLabel}`;
  }

  buildPresetSelectLabel(preset: EmailTemplatePreset): string {
    const label = this.getPresetCategoryLabel(preset.category);
    return `${preset.name} — ${label}`;
  }

  getPresetCategoryLabel(category: string): string {
    switch (category) {
      case 'APPLICATION_VERIFICATION': return 'Vérification email';
      case 'PASSWORD_RESET':           return 'Réinitialisation';
      case 'INVITATION_CODE':          return 'Invitation';
      case 'CANDIDATE_ASK_RESULT':     return 'Demande candidat';
      case 'PRE_SCREEN_DECISION':      return 'Présélection';
      case 'FINAL_DECISION':           return 'Décision finale';
      case 'INTERVIEW_INVITE':         return 'Convocation entretien';
      case 'QUIZ_INVITE':              return 'Invitation quiz';
      case 'WELCOME':                  return 'Bienvenue';
      case 'GENERIC':                  return 'Générique';
      default:                         return category;
    }
  }

  updateField(field: keyof EmailTemplate, value: any) {
    if (field === 'actionType') {
      this.onActionTypeChange(value);
      return;
    }

    const current = this.form();
    this.form.set({ ...current, [field]: value });
    if (field === 'bodyTemplate') {
      this.syncHtmlEditorValue(String(value ?? ''));
      this.updatePreview();
    } else if (field === 'subjectTemplate') {
      this.updatePreview();
    }
  }

  updatePresetField(field: keyof EmailTemplatePreset, value: any) {
    const current = this.presetForm();
    this.presetForm.set({ ...current, [field]: value });

    if (field === 'htmlStructure') {
      this.syncHtmlEditorValue(String(value ?? ''));
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

    this.ignoredP20Keys.set([]);
    this.updatePreview();
    // For new templates, always apply the preset for the new actionType (even if body was manually typed)
    this.syncDefaultPresetForActionType(nextActionType, this.isNewTemplate() || this.canReplaceTemplateBodyFromPreset());

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
    const body = this.currentBodyTemplate();
    const previewVariables = this.buildPreviewVariables();
    const preview = this.renderPreviewTemplate(body, previewVariables);
    this.previewDocument.set(this.buildPreviewDocument(preview));
    this.previewSubject.set(this.renderPreviewTemplate(this.currentSubjectTemplate(), previewVariables));
  }

  private applyPresetToTemplate(preset: EmailTemplatePreset, showNotification = false) {
    const current = this.form();
    this.editableVariables.set(this.prepareEditableVariablesForPreset(current.bodyTemplate || ''));
    this.form.set({
      ...current,
      presetId: preset.id,
      bodyTemplate: preset.htmlStructure
    });
    this.syncHtmlEditorValue(preset.htmlStructure);
    this.updatePreview();

    if (showNotification) {
      this.notificationService.success('Preset', `"${preset.name}" appliqué`);
    }
  }

  private syncDefaultPresetForActionType(actionType: string | null | undefined, canReplaceBody: boolean) {
    const normalizedActionType = this.normalizeActionType(actionType);
    if (!normalizedActionType || this.isPresetMode() || !this.isNewTemplate()) {
      return;
    }

    this.emailTemplateService.getByActionType(normalizedActionType).pipe(takeUntil(this.destroy$)).subscribe({
      next: (template) => {
        if (!template?.presetId || !this.isNewTemplate()) {
          return;
        }

        if (this.normalizeActionType(this.form().actionType) !== normalizedActionType) {
          return;
        }

        if (!canReplaceBody && !this.canReplaceTemplateBodyFromPreset()) {
          return;
        }

        const preset = this.findPresetById(template.presetId);
        if (!preset) {
          return;
        }

        this.applyPresetToTemplate(preset, false);
      },
      error: () => undefined
    });
  }

  private canReplaceTemplateBodyFromPreset(): boolean {
    const bodyTemplate = String(this.form().bodyTemplate || '').trim();
    if (!bodyTemplate) {
      return true;
    }

    const currentPreset = this.findPresetById(this.form().presetId);
    return !!currentPreset && currentPreset.htmlStructure === this.form().bodyTemplate;
  }

  private findPresetById(presetId: number | null | undefined): EmailTemplatePreset | null {
    if (presetId == null) {
      return null;
    }

    return this.presets().find(preset => preset.id === presetId) ?? null;
  }

  private matchesTemplateSearch(template: EmailTemplate, search: string): boolean {
    const haystack = this.normalizeSearchText([
      template.templateKey,
      template.description,
      template.actionType,
      template.actionType ? this.getActionTypeLabel(template.actionType) : '',
      template.isActive ? 'actif active' : 'inactif inactive'
    ].filter(Boolean).join(' '));

    return haystack.includes(search);
  }

  private matchesPresetSearch(preset: EmailTemplatePreset, search: string): boolean {
    const haystack = this.normalizeSearchText([
      preset.name,
      preset.category,
      preset.description
    ].filter(Boolean).join(' '));

    return haystack.includes(search);
  }

  private ensureSelectedTemplateVisible(templates: EmailTemplate[]): EmailTemplate[] {
    const selected = this.selectedTemplate();

    if (!selected || templates.some(template => template.id === selected.id)) {
      return templates;
    }

    const fullMatch = this.templates().find(template => template.id === selected.id);
    return fullMatch ? [fullMatch, ...templates] : templates;
  }

  private ensureSelectedPresetVisible(presets: EmailTemplatePreset[]): EmailTemplatePreset[] {
    const selected = this.selectedPreset();

    if (!selected || presets.some(preset => preset.id === selected.id)) {
      return presets;
    }

    const fullMatch = this.presets().find(preset => preset.id === selected.id);
    return fullMatch ? [fullMatch, ...presets] : presets;
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

  savePreset() {
    const form = this.presetForm();
    if (!form.name?.trim() || !form.category?.trim() || !form.htmlStructure?.trim()) {
      this.notificationService.error('Champs requis', 'Veuillez remplir les champs obligatoires (nom, catégorie, contenu)');
      return;
    }

    const payload: Partial<EmailTemplatePreset> = {
      ...form,
      previewImage: form.previewImage?.trim() || undefined,
      description: form.description?.trim() || undefined
    };

    this.isSaving.set(true);

    if (this.isNewPreset()) {
      this.emailTemplateService.createPreset(payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (created) => {
          this.isSaving.set(false);
          this.notificationService.success('Succes', 'Preset cree avec succes');
          this.loadData();
          if (created) {
            this.selectPreset(created);
          }
        },
        error: (error) => {
          this.isSaving.set(false);
          this.notificationService.error('Erreur', this.extractErrorMessage(error, 'Erreur lors de la creation du preset'));
        }
      });
      return;
    }

    const preset = this.selectedPreset();
    if (!preset) {
      this.isSaving.set(false);
      return;
    }

    this.emailTemplateService.updatePreset({ ...payload, id: preset.id }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (updated) => {
        this.isSaving.set(false);
        this.notificationService.success('Succes', 'Preset mis a jour');
        this.loadData();
        if (updated) {
          this.selectPreset(updated);
        }
      },
      error: (error) => {
        this.isSaving.set(false);
        this.notificationService.error('Erreur', this.extractErrorMessage(error, 'Erreur lors de la mise a jour du preset'));
      }
    });
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

  deletePreset() {
    const preset = this.selectedPreset();
    if (!preset) return;
    if (!confirm(`Supprimer le preset "${preset.name}" ?`)) return;

    this.emailTemplateService.deletePreset(preset.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.success('Succès', 'Preset supprimé');
        this.selectedPreset.set(null);
        this.isNewPreset.set(false);
        this.loadData();
      },
      error: () => this.notificationService.error('Erreur', 'Erreur lors de la suppression du preset')
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
    this.userDefinedVariableKeys.set(this.extractUserDefinedKeysFromJson(tpl.editableVariablesJson));
    this.resetCreateVarForm();
    const actionType = this.normalizeActionType(tpl.actionType);
    const queryParams = actionType ? { mode: 'new', actionType } : { mode: 'new' };
    this.router.navigate(['/dashboard/email-editor'], { queryParams });
    this.updatePreview();
  }

  duplicatePreset() {
    const preset = this.selectedPreset();
    if (!preset) return;

    this.selectedPreset.set(null);
    this.isNewPreset.set(true);
    this.presetForm.set({
      name: `${preset.name} copie`,
      category: preset.category,
      htmlStructure: preset.htmlStructure,
      previewImage: preset.previewImage,
      description: preset.description
    });
    this.editableVariables.set(this.prepareEditableVariablesForPreset(preset.htmlStructure || ''));
    this.syncHtmlEditorValue(preset.htmlStructure || '');
    this.updatePreview();
    this.router.navigate(['/dashboard/email-presets'], { queryParams: { mode: 'new' } });
  }

  isPresetRecommended(category: string): boolean {
    return !!this.selectedActionConfig()?.recommendedPresetCategories.includes(category);
  }

  getPresetIcon(category: string): string {
    switch (category) {
      case 'APPLICATION_VERIFICATION': return 'VER';
      case 'PASSWORD_RESET':           return 'PWD';
      case 'INVITATION_CODE':          return 'INV';
      case 'CANDIDATE_ASK_RESULT':     return 'ASK';
      case 'PRE_SCREEN_DECISION':      return 'PRE';
      case 'FINAL_DECISION':           return 'FIN';
      case 'INTERVIEW_INVITE':         return 'INT';
      case 'QUIZ_INVITE':              return 'QUI';
      case 'WELCOME':                  return 'WEL';
      case 'GENERIC':                  return 'GEN';
      default:                         return '—';
    }
  }

  getActionTypeLabel(actionType: string): string {
    return this.actionTypes.find(a => a.value === actionType)?.label || actionType;
  }

  openVarExplorer() {
    this.varExplorerSearch.set('');
    this.varExplorerOpen.set(true);
  }

  insertVarFromExplorer(key: string) {
    this.varExplorerOpen.set(false);
    setTimeout(() => {
      if (this.editorMode() === 'wysiwyg') {
        this.bodyRteRef?.insertVariable(key);
      } else {
        this.insertIntoSourceTextarea(key);
      }
    }, 50);
  }

  async copyVarToClipboard(key: string) {
    try {
      await navigator.clipboard.writeText(`{{${key}}}`);
      this.varExplorerCopied.set(key);
      setTimeout(() => this.varExplorerCopied.set(null), 1500);
    } catch {
      // clipboard API unavailable
    }
  }

  onNewVarKeyChange(val: string) {
    this.newVarKey.set(val);
    this.newVarKeyError.set(null);
  }

  addUserDefinedVariable() {
    const key = this.newVarKey().trim();
    const validation = this.validateUserVariableKey(key);
    if (!validation.valid) {
      this.newVarKeyError.set(validation.error || 'Clé invalide');
      return;
    }
    this.userDefinedVariableKeys.update(keys => [...keys, key]);
    this.newVarKey.set('');
    this.newVarKeyError.set(null);
    this.showCreateVarForm.set(false);
    this.updatePreview();
  }

  removeUserDefinedVariable(key: string) {
    this.userDefinedVariableKeys.update(keys => keys.filter(k => k !== key));
    this.updatePreview();
  }

  dismissAutoDetectedKey(key: string) {
    this.ignoredP20Keys.update(keys => [...keys, key]);
    this.updatePreview();
  }

  private insertIntoSourceTextarea(key: string) {
    const placeholder = `{{${key}}}`;
    const textarea = this.sourceTextareaRef?.nativeElement;
    if (textarea) {
      const pos = textarea.selectionStart ?? textarea.value.length;
      const newValue = textarea.value.slice(0, pos) + placeholder + textarea.value.slice(pos);
      this.updateHtmlSource(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(pos + placeholder.length, pos + placeholder.length);
      }, 0);
    } else {
      this.updateHtmlSource(this.htmlEditorValue() + placeholder);
    }
  }

  private resetCreateVarForm() {
    this.showCreateVarForm.set(false);
    this.newVarKey.set('');
    this.newVarKeyError.set(null);
  }

  private validateUserVariableKey(key: string): { valid: boolean; error?: string } {
    if (!key || key.length < 2) {
      return { valid: false, error: 'La clé doit contenir au moins 2 caractères' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(key)) {
      return { valid: false, error: 'Caractères autorisés : lettres, chiffres, _ uniquement' };
    }
    const allReservedKeys = new Set<string>([
      ...Object.keys(EDITABLE_VARIABLE_DEFINITIONS),
      ...this.templateVariables(),
      ...Array.from(GLOBAL_SYSTEM_VARIABLE_KEYS),
      ...Array.from(HIDDEN_SYSTEM_VARIABLE_KEYS),
      ...this.userDefinedVariableKeys()
    ]);
    if (allReservedKeys.has(key)) {
      return { valid: false, error: 'Cette clé est déjà utilisée' };
    }
    return { valid: true };
  }

  private extractUserDefinedKeysFromJson(editableVariablesJson?: string): string[] {
    if (!editableVariablesJson) return [];
    try {
      const parsed = JSON.parse(editableVariablesJson) as Record<string, unknown>;
      const userKeys = parsed['__userKeys__'];
      if (Array.isArray(userKeys)) {
        return userKeys.filter((k): k is string => typeof k === 'string' && /^[a-zA-Z0-9_]{2,}$/.test(k));
      }
    } catch { /* ignore */ }
    return [];
  }

  private initializeEditorFromRoute(templates: EmailTemplate[], presets: EmailTemplatePreset[]) {
    if (this.isPresetMode()) {
      const presetId = this.route.snapshot.paramMap.get('id');
      if (presetId) {
        const preset = presets.find(item => item.id === +presetId);
        if (preset) {
          this.selectPreset(preset, false);
          return;
        }
      }

      const presetMode = this.route.snapshot.queryParamMap.get('mode');
      if (presetMode === 'new') {
        this.newPreset(false);
      }
      return;
    }

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

  private initializeEditorTarget() {
    const routePath = this.route.snapshot.routeConfig?.path || '';
    this.editorTarget.set(routePath.startsWith('email-presets') ? 'preset' : 'template');
  }

  private normalizeActionType(actionType?: string | null): EmailActionType | '' {
    if (!actionType || !EMAIL_ACTION_TYPE_VALUES.includes(actionType as EmailActionType)) {
      return '';
    }

    return actionType as EmailActionType;
  }

  private normalizeSearchText(value?: string | null): string {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private extractErrorMessage(error: any, fallback: string): string {
    return error?.error?.status?.message || error?.status?.message || fallback;
  }

  private buildPreviewVariables(): Record<string, string> {
    const previewVariables: Record<string, string> = {
      ...DEFAULT_PREVIEW_VALUES,
      companyName: this.themeService.companyName() || DEFAULT_PREVIEW_VALUES['companyName'],
      app_link: this.themeService.appLink() || DEFAULT_PREVIEW_VALUES['app_link'],
      ...(this.selectedActionConfig()?.previewVariables ?? {}),
      ...this.editableVariables()
    };

    previewVariables[LEGACY_CTA_PLACEHOLDER] = this.buildLegacyCtaButton(previewVariables);
    return previewVariables;
  }

  private getEditableKeys(placeholders: Set<string>, businessKeys: Set<string>): string[] {
    const result = new Set<string>();

    for (const key of placeholders) {
      if (!businessKeys.has(key) && !HIDDEN_SYSTEM_VARIABLE_KEYS.has(key) && !GLOBAL_SYSTEM_VARIABLE_KEYS.has(key)) {
        result.add(key);
      }
    }

    // Legacy: ctaButton placeholder implicitly makes buttonText and buttonLink editable
    if (placeholders.has(LEGACY_CTA_PLACEHOLDER)) {
      result.add('buttonText');
      result.add('buttonLink');
    }

    return Array.from(result);
  }

  private getEditableVariableDescriptor(key: string): EditableVariableDescriptor {
    const known = EDITABLE_VARIABLE_DEFINITIONS[key as EditableVariableKey];
    if (known) {
      return known;
    }

    return {
      key,
      label: this.generateEditableVariableLabel(key),
      type: this.inferEditableVariableType(key),
      placeholder: '',
      helpText: 'Variable détectée automatiquement depuis le layout.',
      group: 'dynamic',
      sortOrder: 100
    };
  }

  private generateEditableVariableLabel(key: string): string {
    const buttonNumberTextMatch = key.match(/^button(\d+)Text$/i);
    if (buttonNumberTextMatch) {
      return `Texte du bouton ${buttonNumberTextMatch[1]}`;
    }

    const buttonNumberLinkMatch = key.match(/^button(\d+)Link$/i);
    if (buttonNumberLinkMatch) {
      return `Lien du bouton ${buttonNumberLinkMatch[1]}`;
    }

    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .trim();
  }

  private inferEditableVariableType(key: string): 'text' | 'richtext' {
    const lowerKey = key.toLowerCase();
    return (lowerKey === 'content' || lowerKey.endsWith('content') || lowerKey === 'body')
      ? 'richtext'
      : 'text';
  }

  private buildLegacyCtaButton(variables: Record<string, string>): string {
    const buttonText = this.escapeHtml(variables['buttonText'] || '');
    const buttonLink = this.escapeHtmlAttribute(variables['buttonLink'] || '');

    if (!buttonText) {
      return '';
    }

    if (!buttonLink) {
      return `<span class="btn">${buttonText}</span>`;
    }

    return `<a href="${buttonLink}" class="btn">${buttonText}</a>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escapeHtmlAttribute(value: string): string {
    return this.escapeHtml(value);
  }

  private escapeSourceCode(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private syncHtmlEditorValue(template: string) {
    this.htmlEditorValue.set(this.formatHtmlForEditor(template));
  }

  private formatHtmlForEditor(html: string): string {
    const normalizedHtml = this.formatEmbeddedCssBlocks(html.replace(/>\s+</g, '><').trim());
    if (!normalizedHtml) {
      return '';
    }

    const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
    const lines = normalizedHtml
      .replace(/(>)(<)(\/*)/g, '$1\n$2$3')
      .split('\n')
      .map(line => line.trimEnd())
      .map(line => /^\s*</.test(line) ? line.trim() : line)
      .filter(line => line.trim().length > 0);

    let indentLevel = 0;

    return lines.map(line => {
      const trimmedLine = line.trim();
      const isClosingTag = /^<\//.test(trimmedLine);
      const isComment = /^<!--/.test(trimmedLine);
      const isDeclaration = /^<!/.test(trimmedLine);
      const isTagLine = /^</.test(trimmedLine);
      const tagMatch = trimmedLine.match(/^<\/?\s*([a-zA-Z0-9-]+)/);
      const tagName = tagMatch?.[1]?.toLowerCase() || '';
      const isSelfClosing = /\/\s*>$/.test(trimmedLine) || voidTags.has(tagName);
      const hasInlineContent = /^<[^>]+>.+<\/[^>]+>$/.test(trimmedLine) && !trimmedLine.includes('\n');

      if (isClosingTag) {
        indentLevel = Math.max(indentLevel - 1, 0);
      }

      const formattedLine = `${'  '.repeat(indentLevel)}${isTagLine ? trimmedLine : line}`;

      if (!isClosingTag && !isSelfClosing && !isComment && !isDeclaration && !hasInlineContent) {
        indentLevel += 1;
      }

      return formattedLine;
    }).join('\n');
  }

  private formatEmbeddedCssBlocks(html: string): string {
    if (!html) {
      return '';
    }

    return html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (_match, attributes: string, css: string) => {
      const formattedCss = this.formatCssForEditor(css);
      return formattedCss
        ? `<style${attributes}>\n${formattedCss}\n</style>`
        : `<style${attributes}></style>`;
    });
  }

  private formatCssForEditor(css: string): string {
    const source = css.trim();
    if (!source) {
      return '';
    }

    // P15: Extract {{...}} placeholders before char-by-char parsing to prevent
    // their { and } from being misinterpreted as CSS block delimiters.
    // Example: `border: 1px solid {{primaryColor}};` would otherwise be exploded
    // into multiple indented lines as if {{ opened two CSS blocks.
    const placeholderMap: string[] = [];
    const tokenized = source.replace(/\{\{[^}]*\}\}/g, (match) => {
      const token = `__PH_${placeholderMap.length}__`;
      placeholderMap.push(match);
      return token;
    });

    const lines: string[] = [];
    let current = '';
    let indentLevel = 0;
    let activeQuote: string | null = null;
    let isEscaped = false;
    let parenthesesDepth = 0;

    const pushLine = (value: string, indentOffset = 0) => {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        return;
      }

      lines.push(`${'  '.repeat(Math.max(indentLevel + indentOffset, 0))}${trimmedValue}`);
    };

    for (let index = 0; index < tokenized.length; index += 1) {
      const character = tokenized[index];
      const nextCharacter = tokenized[index + 1];

      if (activeQuote) {
        current += character;
        if (isEscaped) {
          isEscaped = false;
        } else if (character === '\\') {
          isEscaped = true;
        } else if (character === activeQuote) {
          activeQuote = null;
        }
        continue;
      }

      if (character === '/' && nextCharacter === '*') {
        const commentEndIndex = tokenized.indexOf('*/', index + 2);
        const comment = commentEndIndex >= 0
          ? tokenized.slice(index, commentEndIndex + 2)
          : tokenized.slice(index);

        pushLine(current);
        current = '';
        pushLine(comment);

        index = commentEndIndex >= 0 ? commentEndIndex + 1 : tokenized.length;
        continue;
      }

      if (character === '"' || character === '\'') {
        activeQuote = character;
        current += character;
        continue;
      }

      if (character === '(') {
        parenthesesDepth += 1;
        current += character;
        continue;
      }

      if (character === ')') {
        parenthesesDepth = Math.max(parenthesesDepth - 1, 0);
        current += character;
        continue;
      }

      if (character === '{') {
        const selector = current.trim();
        if (selector) {
          lines.push(`${'  '.repeat(indentLevel)}${selector} {`);
        }
        current = '';
        indentLevel += 1;
        continue;
      }

      if (character === '}' && parenthesesDepth === 0) {
        pushLine(current);
        current = '';
        indentLevel = Math.max(indentLevel - 1, 0);
        lines.push(`${'  '.repeat(indentLevel)}}`);
        continue;
      }

      if (character === ';' && parenthesesDepth === 0) {
        current += character;
        pushLine(current);
        current = '';
        continue;
      }

      if (/\s/.test(character)) {
        if (current && !/\s$/.test(current)) {
          current += ' ';
        }
        continue;
      }

      current += character;
    }

    pushLine(current);

    // P15: Restore {{...}} placeholders after formatting.
    // Done before join so highlightCssLine() receives intact {{key}} tokens.
    let result = lines.join('\n');
    placeholderMap.forEach((placeholder, index) => {
      result = result.replaceAll(`__PH_${index}__`, placeholder);
    });
    return result;
  }

  private highlightSourceCode(source: string): string {
    if (!source) {
      return this.wrapHighlightedToken('token-empty', 'Commencez a saisir votre HTML ou CSS...');
    }

    return source
      .replace(/\r\n/g, '\n')
      .split(/(<style\b[^>]*>[\s\S]*?<\/style>|<!--[^]*?-->|<!DOCTYPE[^>]*>|<[^>]+>)/gi)
      .filter(part => part.length > 0)
      .map(part => this.highlightSourcePart(part))
      .join('');
  }

  private highlightSourcePart(part: string): string {
    if (/^<!--[^]*?-->$/i.test(part)) {
      return this.wrapHighlightedToken('token-comment', this.escapeSourceCode(part));
    }

    if (/^<!DOCTYPE[^>]*>$/i.test(part)) {
      return this.wrapHighlightedToken('token-doctype', this.escapeSourceCode(part));
    }

    if (/^<style\b[^>]*>[\s\S]*<\/style>$/i.test(part)) {
      return this.highlightStyleBlock(part);
    }

    if (/^<[^>]+>$/.test(part)) {
      return this.highlightHtmlTag(part);
    }

    return this.highlightInlinePlaceholders(this.escapeSourceCode(part));
  }

  private highlightStyleBlock(block: string): string {
    const match = block.match(/^(<style\b[^>]*>)([\s\S]*)(<\/style>)$/i);
    if (!match) {
      return this.escapeSourceCode(block);
    }

    const [, openingTag, cssBody, closingTag] = match;
    return `${this.highlightHtmlTag(openingTag)}${this.highlightCssBody(cssBody)}${this.highlightHtmlTag(closingTag)}`;
  }

  private highlightHtmlTag(tag: string): string {
    const match = tag.match(/^<(\/)?([a-zA-Z][\w:-]*)([^>]*?)(\/?)>$/);
    if (!match) {
      return this.escapeSourceCode(tag);
    }

    const [, closingSlash, tagName, rawAttributes, selfClosingSlash] = match;
    const prefix = closingSlash ? '&lt;/' : '&lt;';
    const suffix = selfClosingSlash ? '/&gt;' : '&gt;';

    return [
      this.wrapHighlightedToken('token-punctuation', prefix),
      this.wrapHighlightedToken('token-tag', tagName),
      this.highlightHtmlAttributes(rawAttributes),
      this.wrapHighlightedToken('token-punctuation', suffix)
    ].join('');
  }

  private highlightHtmlAttributes(rawAttributes: string): string {
    if (!rawAttributes) {
      return '';
    }

    const attributePattern = /([^\s=/>]+)(\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;
    let result = '';
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = attributePattern.exec(rawAttributes)) !== null) {
      result += this.escapeSourceCode(rawAttributes.slice(lastIndex, match.index));
      result += this.wrapHighlightedToken('token-attr-name', this.escapeSourceCode(match[1]));

      const assignment = match[2];
      if (assignment) {
        const equalIndex = assignment.indexOf('=');
        result += this.escapeSourceCode(assignment.slice(0, equalIndex));
        result += this.wrapHighlightedToken('token-operator', '=');
        result += this.highlightHtmlAttributeValue(assignment.slice(equalIndex + 1));
      }

      lastIndex = attributePattern.lastIndex;
    }

    result += this.escapeSourceCode(rawAttributes.slice(lastIndex));
    return result;
  }

  private highlightHtmlAttributeValue(rawValue: string): string {
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) {
      return this.escapeSourceCode(rawValue);
    }

    const startIndex = rawValue.indexOf(trimmedValue);
    const leadingWhitespace = startIndex >= 0 ? rawValue.slice(0, startIndex) : '';
    const trailingWhitespace = startIndex >= 0 ? rawValue.slice(startIndex + trimmedValue.length) : '';
    const quote = trimmedValue.startsWith('"') || trimmedValue.startsWith('\'') ? trimmedValue[0] : '';
    const innerValue = quote ? trimmedValue.slice(1, -1) : trimmedValue;

    return [
      this.escapeSourceCode(leadingWhitespace),
      this.openHighlightedToken('token-attr-value'),
      quote ? this.escapeSourceCode(quote) : '',
      this.highlightInlinePlaceholders(this.escapeSourceCode(innerValue)),
      quote ? this.escapeSourceCode(quote) : '',
      '</span>',
      this.escapeSourceCode(trailingWhitespace)
    ].join('');
  }

  private highlightCssBody(cssBody: string): string {
    return cssBody
      .split('\n')
      .map(line => this.highlightCssLine(line))
      .join('\n');
  }

  private highlightCssLine(line: string): string {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      return '';
    }

    const indentation = line.slice(0, line.length - line.trimStart().length);
    if (/^\/\*/.test(trimmedLine)) {
      return `${this.escapeSourceCode(indentation)}${this.wrapHighlightedToken('token-comment', this.escapeSourceCode(trimmedLine))}`;
    }

    if (trimmedLine === '}') {
      return `${this.escapeSourceCode(indentation)}${this.wrapHighlightedToken('token-punctuation', '}')}`;
    }

    if (trimmedLine.endsWith('{')) {
      const selector = trimmedLine.slice(0, -1).trimEnd();
      return `${this.escapeSourceCode(indentation)}${this.openHighlightedToken('token-selector')}${this.highlightInlinePlaceholders(this.escapeSourceCode(selector))}</span>${this.wrapHighlightedToken('token-punctuation', ' {')}`;
    }

    const propertyMatch = trimmedLine.match(/^([\w-]+)(\s*:\s*)(.+?)(;?)$/);
    if (!propertyMatch) {
      return `${this.escapeSourceCode(indentation)}${this.highlightInlinePlaceholders(this.escapeSourceCode(trimmedLine))}`;
    }

    const [, property, separator, value, semicolon] = propertyMatch;
    return [
      this.escapeSourceCode(indentation),
      this.wrapHighlightedToken('token-property', this.escapeSourceCode(property)),
      this.wrapHighlightedToken('token-punctuation', this.escapeSourceCode(separator)),
      `${this.openHighlightedToken('token-value')}${this.highlightInlinePlaceholders(this.escapeSourceCode(value))}</span>`,
      semicolon ? this.wrapHighlightedToken('token-punctuation', ';') : ''
    ].join('');
  }

  // P16: Maps a CSS color variable name to the matching token-placeholder CSS class modifier.
  // CSS classes are used instead of inline color-mix() styles to avoid Angular's [innerHTML]
  // sanitizer stripping color-mix() values from inline style attributes.
  private colorVarToPlaceholderClass(colorVar: string): string {
    const classMap: Record<string, string> = {
      '--primary':      'primary',
      '--secondary':    'secondary',
      '--info':         'info',
      '--success':      'success',
      '--text-tertiary': 'tertiary',
    };
    return classMap[colorVar] ?? 'tertiary';
  }

  private highlightInlinePlaceholders(value: string): string {
    const colorMap = this.placeholderColorMap();
    return value.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, rawKey) => {
      const key = rawKey.trim();
      const colorVar = colorMap.get(key) ?? '--text-tertiary';
      const modifier = this.colorVarToPlaceholderClass(colorVar);
      return `<span class="token-placeholder token-placeholder--${modifier}">${match}</span>`;
    });
  }

  private wrapHighlightedToken(tokenClass: string, content: string): string {
    return `${this.openHighlightedToken(tokenClass)}${content}</span>`;
  }

  private openHighlightedToken(tokenClass: string): string {
    const colorVariable = this.getHighlightColorVariable(tokenClass);
    const styleAttribute = colorVariable ? ` style="color: var(${colorVariable});"` : '';
    return `<span class="${tokenClass}"${styleAttribute}>`;
  }

  private getHighlightColorVariable(tokenClass: string): string | null {
    switch (tokenClass) {
      case 'token-empty':
      case 'token-comment':
        return '--text-tertiary';
      case 'token-doctype':
      case 'token-selector':
      case 'token-placeholder':
        return '--primary';
      case 'token-tag':
      case 'token-property':
        return '--info';
      case 'token-attr-name':
      case 'token-value':
        return '--accent';
      case 'token-attr-value':
        return '--warning';
      case 'token-punctuation':
      case 'token-operator':
        return '--text-secondary';
      default:
        return null;
    }
  }

  private buildPreviewDocument(previewHtml: string): SafeHtml | null {
    const trimmedHtml = previewHtml.trim();
    if (!trimmedHtml) {
      return null;
    }

    let previewDocument = /^<!doctype html/i.test(trimmedHtml) || /<html[\s>]/i.test(trimmedHtml)
      ? trimmedHtml
      : `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${trimmedHtml}</body></html>`;

    previewDocument = this.applyPreviewThemeMode(
      previewDocument,
      this.uiThemeMode()
    );

    // `iframe[srcdoc]` is sanitized by Angular; trust this locally generated preview so email CSS remains visible.
    return this.sanitizer.bypassSecurityTrustHtml(previewDocument);
  }

  private applyPreviewThemeMode(documentHtml: string, mode: 'dark' | 'light'): string {
    let nextDocument = this.ensurePreviewThemeMetadata(documentHtml, mode);
    const themedStyles = this.rewritePreferredColorSchemeStyles(nextDocument, mode);
    nextDocument = themedStyles.documentHtml;
    const forcedCss = themedStyles.forcedCss;

    if (!forcedCss.trim()) {
      return nextDocument;
    }

    const overrideStyle = `<style id="preview-theme-override">:root{color-scheme:${mode};}html[data-preview-theme="${mode}"],html[data-preview-theme="${mode}"] body{color-scheme:${mode};}${forcedCss}</style>`;
    return this.injectIntoHead(nextDocument, overrideStyle);
  }

  private ensurePreviewThemeMetadata(documentHtml: string, mode: 'dark' | 'light'): string {
    let nextDocument = documentHtml.replace(/<html([^>]*)>/i, (_match, attributes) => {
      const sanitizedAttributes = String(attributes || '').replace(/\sdata-preview-theme=("|')[^"']*("|')/i, '');
      return `<html${sanitizedAttributes} data-preview-theme="${mode}">`;
    });

    if (!/name=("|')color-scheme("|')/i.test(nextDocument)) {
      nextDocument = this.injectIntoHead(nextDocument, '<meta name="color-scheme" content="light dark">');
    }

    if (!/name=("|')supported-color-schemes("|')/i.test(nextDocument)) {
      nextDocument = this.injectIntoHead(nextDocument, '<meta name="supported-color-schemes" content="light dark">');
    }

    return nextDocument;
  }

  private injectIntoHead(documentHtml: string, snippet: string): string {
    if (/<\/head>/i.test(documentHtml)) {
      return documentHtml.replace(/<\/head>/i, `${snippet}</head>`);
    }

    return documentHtml.replace(/<html([^>]*)>/i, `<html$1><head>${snippet}</head>`);
  }

  private rewritePreferredColorSchemeStyles(documentHtml: string, mode: 'dark' | 'light'): { documentHtml: string; forcedCss: string } {
    const styleTagRegex = /<style\b([^>]*)>([\s\S]*?)<\/style>/gi;
    const forcedCssBlocks: string[] = [];

    const rewrittenDocument = documentHtml.replace(styleTagRegex, (_match, attributes, css) => {
      const stylesheet = String(css || '');
      forcedCssBlocks.push(...this.extractColorSchemeMediaBlocks(stylesheet, mode));
      const strippedCss = this.removeColorSchemeMediaBlocks(stylesheet);
      return `<style${attributes || ''}>${strippedCss}</style>`;
    });

    return {
      documentHtml: rewrittenDocument,
      forcedCss: forcedCssBlocks.join('\n')
    };
  }

  private extractPreferredColorSchemeCss(documentHtml: string, mode: 'dark' | 'light'): string {
    const styleTagRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
    const cssBlocks: string[] = [];

    for (const match of documentHtml.matchAll(styleTagRegex)) {
      cssBlocks.push(...this.extractColorSchemeMediaBlocks(match[1] || '', mode));
    }

    return cssBlocks.join('\n');
  }

  private removeColorSchemeMediaBlocks(css: string): string {
    const ranges: Array<{ start: number; end: number }> = [];

    for (const mode of ['dark', 'light'] as const) {
      const mediaRegex = new RegExp(`@media\\s*\\(\\s*prefers-color-scheme\\s*:\\s*${mode}\\s*\\)\\s*\\{`, 'gi');
      let match: RegExpExecArray | null;

      while ((match = mediaRegex.exec(css)) !== null) {
        const startIndex = match.index;
        const openingBraceIndex = mediaRegex.lastIndex - 1;
        const closingBraceIndex = this.findMatchingCssBrace(css, openingBraceIndex);
        if (closingBraceIndex === -1) {
          break;
        }

        ranges.push({ start: startIndex, end: closingBraceIndex + 1 });
        mediaRegex.lastIndex = closingBraceIndex + 1;
      }
    }

    if (ranges.length === 0) {
      return css;
    }

    ranges.sort((left, right) => left.start - right.start);
    let cursor = 0;
    let result = '';

    for (const range of ranges) {
      if (range.start < cursor) {
        continue;
      }

      result += css.slice(cursor, range.start);
      cursor = range.end;
    }

    result += css.slice(cursor);
    return result;
  }

  private extractColorSchemeMediaBlocks(css: string, mode: 'dark' | 'light'): string[] {
    const blocks: string[] = [];
    const mediaRegex = new RegExp(`@media\\s*\\(\\s*prefers-color-scheme\\s*:\\s*${mode}\\s*\\)\\s*\\{`, 'gi');

    let match: RegExpExecArray | null;
    while ((match = mediaRegex.exec(css)) !== null) {
      const openingBraceIndex = mediaRegex.lastIndex - 1;
      const closingBraceIndex = this.findMatchingCssBrace(css, openingBraceIndex);
      if (closingBraceIndex === -1) {
        break;
      }

      const blockContent = css.slice(openingBraceIndex + 1, closingBraceIndex).trim();
      if (blockContent) {
        blocks.push(blockContent);
      }

      mediaRegex.lastIndex = closingBraceIndex + 1;
    }

    return blocks;
  }

  private findMatchingCssBrace(source: string, openingBraceIndex: number): number {
    let depth = 0;
    let quote: '"' | '\'' | null = null;
    let isEscaped = false;

    for (let index = openingBraceIndex; index < source.length; index += 1) {
      const character = source[index];

      if (quote) {
        if (!isEscaped && character === quote) {
          quote = null;
        }
        isEscaped = !isEscaped && character === '\\';
        continue;
      }

      if (character === '"' || character === '\'') {
        quote = character as '"' | '\'';
        isEscaped = false;
        continue;
      }

      if (character === '{') {
        depth += 1;
        continue;
      }

      if (character === '}') {
        depth -= 1;
        if (depth === 0) {
          return index;
        }
      }
    }

    return -1;
  }

  private resolveEditableVariables(editableVariablesJson?: string, currentLayout = ''): Record<string, string> {
    const defaults = getDefaultEditableVariables();
    const parsedVariables = this.parseEditableVariablesJson(editableVariablesJson);
    const currentPlaceholders = this.getTemplatePlaceholders(currentLayout);

    return {
      ...defaults,
      ...parsedVariables,
      content: parsedVariables['content']
        || (!currentPlaceholders.has('content') && currentLayout.trim() ? currentLayout : defaults['content']),
      subtitle: parsedVariables['subtitle'] || defaults['subtitle']
    };
  }

  private prepareEditableVariablesForPreset(currentLayout: string): Record<string, string> {
    const defaults = getDefaultEditableVariables();
    const currentVariables: Record<string, string> = {
      ...defaults,
      ...this.editableVariables()
    };
    const currentPlaceholders = this.getTemplatePlaceholders(currentLayout);

    if (!currentPlaceholders.has('content') && currentLayout.trim()) {
      currentVariables['content'] = currentLayout;
    }

    return currentVariables;
  }

  private parseEditableVariablesJson(editableVariablesJson?: string): Record<string, string> {
    if (!editableVariablesJson) {
      return {};
    }

    try {
      const parsed = JSON.parse(editableVariablesJson) as Record<string, unknown>;
      return Object.entries(parsed).reduce((result, [key, value]) => {
        if (typeof value === 'string') {
          result[key] = value;
        }
        return result;
      }, {} as Record<string, string>);
    } catch {
      return {};
    }
  }

  private serializeEditableVariables(): string | undefined {
    const activeDefinitions = this.activeEditableVariableDefinitions();
    const userKeys = this.userDefinedVariableKeys();

    if (activeDefinitions.length === 0 && userKeys.length === 0) {
      return undefined;
    }

    const payload: Record<string, unknown> = activeDefinitions.reduce((result, definition) => {
      result[definition.key] = this.getEditableVariableValue(definition.key);
      return result;
    }, {} as Record<string, unknown>);

    if (userKeys.length > 0) {
      payload['__userKeys__'] = userKeys;
    }

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
    // Two passes: the first expands editable var placeholders (title, subtitle, content…)
    // The second resolves any system/business vars that appear inside those expanded values
    // (e.g. {{companyName}} inside the "title" editable field value).
    for (let pass = 0; pass < 2; pass++) {
      for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`\\{\\{${this.escapeRegExp(key)}\\}\\}`, 'g'), value);
      }
    }

    return result;
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
