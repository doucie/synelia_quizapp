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
const EMAIL_ACTION_EDITOR_CONFIGS: Record<EmailActionType, EmailActionEditorConfig> = {
  APPLICATION_VERIFICATION: {
    templateKey: 'application_verification',
    subjectTemplate: 'Verification de votre adresse email - {{companyName}}',
    description: 'Email de verification envoye apres depot de candidature.',
    availableVariables: ['first_name', 'last_name', 'verification_link', 'campaign_title', 'companyName', 'currentYear'],
    previewVariables: {},
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

  // Form
  form = signal<Partial<EmailTemplate>>({
    templateKey: '',
    subjectTemplate: '',
    bodyTemplate: '',
    description: '',
    availableVariables: '',
    actionType: '',
    isActive: true
  });

  // Preview
  previewHtml = signal<SafeHtml>('');

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
    if (!tpl) return this.isNewTemplate() && (f.templateKey || f.subjectTemplate || f.bodyTemplate);
    return tpl.subjectTemplate !== f.subjectTemplate ||
           tpl.bodyTemplate !== f.bodyTemplate ||
           tpl.description !== f.description ||
           tpl.availableVariables !== f.availableVariables ||
           tpl.actionType !== f.actionType;
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
      description: tpl.description,
      availableVariables: tpl.availableVariables,
      actionType: tpl.actionType || '',
      presetId: tpl.presetId,
      isActive: tpl.isActive
    });
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
      description: config?.description ?? '',
      availableVariables: (config?.availableVariables ?? DEFAULT_TEMPLATE_VARIABLES).join(','),
      actionType: actionType || '',
      presetId: undefined,
      isActive: true
    });
    this.showPresetGallery.set(true);
    this.updatePreview();

    if (syncRoute) {
      const queryParams = actionType ? { mode: 'new', actionType } : { mode: 'new' };
      this.router.navigate(['/dashboard/email-editor'], { queryParams });
    }
  }

  applyPreset(preset: EmailTemplatePreset) {
    const current = this.form();
    this.form.set({
      ...current,
      presetId: preset.id,
      bodyTemplate: preset.htmlStructure
    });
    this.updatePreview();
    this.showPresetGallery.set(false);
    this.notificationService.success('Preset', `"${preset.name}" appliqué`);
  }

  updateBody(html: string) {
    const current = this.form();
    this.form.set({ ...current, bodyTemplate: html });
    this.updatePreview();
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
    const previewVariables = {
      ...DEFAULT_PREVIEW_VALUES,
      companyName: this.themeService.companyName() || DEFAULT_PREVIEW_VALUES['companyName'],
      ...(this.selectedActionConfig()?.previewVariables ?? {})
    };
    const preview = this.renderPreviewTemplate(body, previewVariables);
    this.previewHtml.set(this.sanitizer.bypassSecurityTrustHtml(preview));
  }

  save() {
    const f = this.form();
    if (!f.templateKey || !f.subjectTemplate || !f.bodyTemplate) {
      this.notificationService.error('Champs requis', 'Veuillez remplir les champs obligatoires (clé, sujet, contenu)');
      return;
    }
    this.isSaving.set(true);

    if (this.isNewTemplate()) {
      this.emailTemplateService.create(f).pipe(takeUntil(this.destroy$)).subscribe({
        next: (created) => {
          this.isSaving.set(false);
          this.notificationService.success('Succès', 'Template créé avec succès');
          this.loadData();
          if (created) this.selectTemplate(created);
        },
        error: () => {
          this.isSaving.set(false);
          this.notificationService.error('Erreur', 'Erreur lors de la création');
        }
      });
    } else {
      const tpl = this.selectedTemplate();
      if (!tpl) return;
      this.emailTemplateService.update({ ...f, id: tpl.id }).pipe(takeUntil(this.destroy$)).subscribe({
        next: (updated) => {
          this.isSaving.set(false);
          this.notificationService.success('Succès', 'Template mis à jour');
          this.loadData();
          if (updated) this.selectTemplate(updated);
        },
        error: () => {
          this.isSaving.set(false);
          this.notificationService.error('Erreur', 'Erreur lors de la mise à jour');
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
      description: tpl.description,
      availableVariables: tpl.availableVariables,
      actionType: tpl.actionType || '',
      presetId: tpl.presetId,
      isActive: true
    });
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
