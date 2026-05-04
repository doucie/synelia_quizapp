import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, of, catchError } from 'rxjs';
import { AuthService, User as AuthUser } from '../../../core/services/auth/auth.service';
import { EmailTemplateService, EmailTemplate } from '../../../core/services/email-template.service';
import { SmtpConfigService, SmtpConfig } from '../../../core/services/smtp-config.service';
import { LegalTextService, LegalText } from '../../../core/services/legal-text.service';
import { AppConfigService, AppConfig, COLOR_SCHEMES } from '../../../core/services/app-config.service';
import { InvitationCodeService, InvitationCode } from '../../../core/services/invitation-code.service';
import { LogoHtmlSanitizerService } from '../../../core/services/logo-html-sanitizer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeService } from '../../../core/services/theme.service';
import { RichTextEditorComponent } from '../../../shared/rich-text-editor/rich-text-editor';

type SettingsTab = 'emails' | 'smtp' | 'legal' | 'config' | 'invitations';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasLoadedSettings = false;

  activeTab = signal<SettingsTab>('emails');
  user = signal<AuthUser | null>(null);
  isLoading = signal(false);
  isSuper = computed(() => this.user()?.role === 'super');

  // Email Templates
  emailTemplates = signal<EmailTemplate[]>([]);
  editingTemplate = signal<EmailTemplate | null>(null);
  templateForm = signal<Partial<EmailTemplate>>({});
  showTemplateEditor = signal(false);
  savingTemplate = signal(false);
  templateVariables = computed(() => {
    const vars = this.templateForm().availableVariables || '';
    return vars.split(',').map(v => v.trim()).filter(v => v.length > 0);
  });

  // SMTP Config
  smtpConfigs = signal<SmtpConfig[]>([]);
  smtpForm = signal<Partial<SmtpConfig>>({});
  editingSmtp = signal<SmtpConfig | null>(null);
  showSmtpEditor = signal(false);
  savingSmtp = signal(false);
  testingSmtp = signal(false);
  showSmtpPassword = signal(false);
  activeSmtpConfig = computed(() => this.smtpConfigs().find(cfg => cfg.isActive && !cfg.isDeleted) || null);

  // Legal Texts
  legalTexts = signal<LegalText[]>([]);
  editingLegal = signal<LegalText | null>(null);
  legalForm = signal<Partial<LegalText>>({});
  showLegalEditor = signal(false);
  savingLegal = signal(false);

  // App Config
  appConfigs = signal<AppConfig[]>([]);
  editingConfig = signal<AppConfig | null>(null);
  configForm = signal<Partial<AppConfig>>({});
  showConfigEditor = signal(false);
  savingConfig = signal(false);
  colorSchemes = COLOR_SCHEMES;
  previewingConfig = signal<AppConfig | null>(null);
  logoMode = signal<'code' | 'image'>('code');
  sanitizedLogoPreview = computed(() => this.logoHtmlSanitizer.sanitizeOrEmpty(this.configForm().logoHtml));

  // Invitation Codes
  invitationCodes = signal<InvitationCode[]>([]);
  invitationForm = signal<Partial<InvitationCode>>({});
  showInvitationEditor = signal(false);
  savingInvitation = signal(false);

  constructor(
    private router: Router,
    private authService: AuthService,
    private emailTemplateService: EmailTemplateService,
    private smtpConfigService: SmtpConfigService,
    private legalTextService: LegalTextService,
    private appConfigService: AppConfigService,
    private invitationCodeService: InvitationCodeService,
    private logoHtmlSanitizer: LogoHtmlSanitizerService,
    private notificationService: NotificationService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(u => {
      this.user.set(u);
      if (u && u.role !== 'super') {
        this.activeTab.set('config');
      }

      if (u && !this.hasLoadedSettings) {
        this.hasLoadedSettings = true;
        this.loadAll();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  switchTab(tab: SettingsTab) {
    this.activeTab.set(tab);
    this.closeAllEditors();
  }

  // ─── Form update helpers (spread not supported in templates) ──
  updateTemplateForm(field: string, value: any) {
    this.templateForm.set({ ...this.templateForm(), [field]: value });
  }
  updateSmtpForm(field: string, value: any) {
    this.smtpForm.set({ ...this.smtpForm(), [field]: value });
  }
  updateLegalForm(field: string, value: any) {
    this.legalForm.set({ ...this.legalForm(), [field]: value });
  }
  updateConfigForm(field: string, value: any) {
    this.configForm.set({ ...this.configForm(), [field]: value });
  }

  private closeAllEditors() {
    this.showTemplateEditor.set(false);
    this.showSmtpEditor.set(false);
    this.showLegalEditor.set(false);
    this.showConfigEditor.set(false);
    this.showInvitationEditor.set(false);
  }

  // ─── Load All Data ───────────────────────
  loadAll() {
    const isSuperUser = this.user()?.role === 'super';
    const failedSections: string[] = [];
    this.isLoading.set(true);

    forkJoin({
      templates: isSuperUser
        ? this.emailTemplateService.getByCriteria().pipe(
            catchError(() => {
              failedSections.push('templates email');
              return of({ items: [] as EmailTemplate[], count: 0 });
            })
          )
        : of({ items: [] as EmailTemplate[], count: 0 }),
      smtp: isSuperUser
        ? this.smtpConfigService.getByCriteria().pipe(
            catchError(() => {
              failedSections.push('configuration SMTP');
              return of({ items: [] as SmtpConfig[], count: 0 });
            })
          )
        : of({ items: [] as SmtpConfig[], count: 0 }),
      legal: isSuperUser
        ? this.legalTextService.getByCriteria().pipe(
            catchError(() => {
              failedSections.push('textes juridiques');
              return of({ items: [] as LegalText[], count: 0 });
            })
          )
        : of({ items: [] as LegalText[], count: 0 }),
      configs: this.appConfigService.getByCriteria().pipe(
        catchError(() => {
          failedSections.push('configuration application');
          return of({ items: [] as AppConfig[], count: 0 });
        })
      ),
      invitations: isSuperUser
        ? this.invitationCodeService.getByCriteria().pipe(
            catchError(() => {
              failedSections.push('invitations');
              return of({ items: [] as InvitationCode[], count: 0 });
            })
          )
        : of({ items: [] as InvitationCode[], count: 0 })
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ templates, smtp, legal, configs, invitations }) => {
        this.emailTemplates.set(templates.items);
        this.smtpConfigs.set(smtp.items);
        this.legalTexts.set(legal.items);
        this.appConfigs.set(configs.items);
        this.invitationCodes.set(invitations.items);
        this.isLoading.set(false);

        if (failedSections.length > 0) {
          this.notificationService.error(
            'Chargement partiel',
            `Certaines sections n'ont pas pu être chargées : ${failedSections.join(', ')}`
          );
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.error('Erreur', 'Erreur lors du chargement des paramètres');
      }
    });
  }

  // ─── Email Templates ─────────────────────
  navigateToTemplateEditor(template?: EmailTemplate) {
    if (template?.id) {
      this.router.navigate(['/dashboard/email-editor', template.id]);
      return;
    }

    this.router.navigate(['/dashboard/email-editor'], {
      queryParams: { mode: 'new' }
    });
  }

  closeTemplateEditor() {
    this.showTemplateEditor.set(false);
    this.editingTemplate.set(null);
  }

  saveTemplate() {
    const form = this.templateForm();
    if (!form.templateKey?.trim() || !form.subjectTemplate?.trim() || !form.bodyTemplate?.trim()) {
      this.notificationService.error('Champs requis', 'Les champs clé, sujet et corps sont requis');
      return;
    }
    this.savingTemplate.set(true);
    const op = this.editingTemplate()
      ? this.emailTemplateService.update(form)
      : this.emailTemplateService.create(form);

    op.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.success('Succès', this.editingTemplate() ? 'Template mis à jour' : 'Template créé');
        this.closeTemplateEditor();
        this.savingTemplate.set(false);
        this.reloadTemplates();
      },
      error: () => {
        this.notificationService.error('Erreur', 'Erreur lors de la sauvegarde du template');
        this.savingTemplate.set(false);
      }
    });
  }

  deleteTemplate(template: EmailTemplate) {
    if (!confirm(`Supprimer le template "${template.templateKey}" ?`)) return;
    this.emailTemplateService.delete(template.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.success('Succès', 'Template supprimé');
        this.reloadTemplates();
      },
      error: () => this.notificationService.error('Erreur', 'Erreur lors de la suppression du template')
    });
  }

  private reloadTemplates() {
    this.emailTemplateService.getByCriteria().pipe(takeUntil(this.destroy$)).subscribe({
      next: resp => this.emailTemplates.set(resp.items)
    });
  }

  // ─── SMTP Config ──────────────────────────
  openSmtpEditor(config?: SmtpConfig) {
    if (config) {
      this.editingSmtp.set(config);
      this.smtpForm.set({ ...config, password: '' });
    } else {
      this.editingSmtp.set(null);
      this.smtpForm.set({
        host: '', port: 587, username: '', password: '',
        smtpAuth: true, starttlsEnable: true, starttlsRequired: false,
        connectionTimeout: 5000, timeout: 5000, writeTimeout: 5000,
        senderName: '', senderEmail: '', isActive: false
      });
    }
    this.showSmtpEditor.set(true);
    this.showSmtpPassword.set(false);
  }

  closeSmtpEditor() {
    this.showSmtpEditor.set(false);
    this.editingSmtp.set(null);
  }

  saveSmtp() {
    const form = this.smtpForm();
    if (!form.host?.trim() || !form.port) {
      this.notificationService.error('Champs requis', 'L\'hôte et le port sont requis');
      return;
    }
    this.savingSmtp.set(true);

    // Don't send empty password on update
    const data = { ...form };
    if (this.editingSmtp() && !data.password?.trim()) {
      delete data.password;
    }

    const op = this.editingSmtp()
      ? this.smtpConfigService.update(data)
      : this.smtpConfigService.create(data);

    op.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.success('Succès', this.editingSmtp() ? 'Configuration SMTP mise à jour' : 'Configuration SMTP créée');
        this.closeSmtpEditor();
        this.savingSmtp.set(false);
        this.reloadSmtp();
      },
      error: () => {
        this.notificationService.error('Erreur', 'Erreur lors de la sauvegarde SMTP');
        this.savingSmtp.set(false);
      }
    });
  }

  testActiveSmtp() {
    if (!this.activeSmtpConfig()) {
      this.notificationService.error('Configuration requise', 'Aucune configuration SMTP active a tester');
      return;
    }

    this.testingSmtp.set(true);
    this.smtpConfigService.testActive().pipe(takeUntil(this.destroy$)).subscribe({
      next: message => {
        this.notificationService.success('Test SMTP', message);
        this.testingSmtp.set(false);
      },
      error: (error) => {
        const message = error?.error?.status?.message || 'Erreur lors du test SMTP';
        this.notificationService.error('Erreur', message);
        this.testingSmtp.set(false);
      }
    });
  }

  deleteSmtp(config: SmtpConfig) {
    if (!confirm(`Supprimer la configuration SMTP "${config.host}" ?`)) return;
    this.smtpConfigService.delete(config.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.success('Succès', 'Configuration SMTP supprimée');
        this.reloadSmtp();
      },
      error: () => this.notificationService.error('Erreur', 'Erreur lors de la suppression SMTP')
    });
  }

  private reloadSmtp() {
    this.smtpConfigService.getByCriteria().pipe(takeUntil(this.destroy$)).subscribe({
      next: resp => this.smtpConfigs.set(resp.items)
    });
  }

  // ─── Legal Texts ──────────────────────────
  openLegalEditor(text?: LegalText) {
    if (text) {
      this.editingLegal.set(text);
      this.legalForm.set({ ...text });
    } else {
      this.editingLegal.set(null);
      this.legalForm.set({ textKey: '', title: '', content: '', description: '', isActive: true });
    }
    this.showLegalEditor.set(true);
  }

  closeLegalEditor() {
    this.showLegalEditor.set(false);
    this.editingLegal.set(null);
  }

  saveLegal() {
    const form = this.legalForm();
    if (!form.textKey?.trim() || !form.title?.trim() || !form.content?.trim()) {
      this.notificationService.error('Champs requis', 'Les champs clé, titre et contenu sont requis');
      return;
    }
    this.savingLegal.set(true);
    const op = this.editingLegal()
      ? this.legalTextService.update(form)
      : this.legalTextService.create(form);

    op.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.success('Succès', this.editingLegal() ? 'Texte juridique mis à jour' : 'Texte juridique créé');
        this.closeLegalEditor();
        this.savingLegal.set(false);
        this.reloadLegal();
      },
      error: () => {
        this.notificationService.error('Erreur', 'Erreur lors de la sauvegarde du texte');
        this.savingLegal.set(false);
      }
    });
  }

  deleteLegal(text: LegalText) {
    if (!confirm(`Supprimer le texte "${text.title}" ?`)) return;
    this.legalTextService.delete(text.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.success('Succès', 'Texte juridique supprimé');
        this.reloadLegal();
      },
      error: () => this.notificationService.error('Erreur', 'Erreur lors de la suppression du texte')
    });
  }

  private reloadLegal() {
    this.legalTextService.getByCriteria().pipe(takeUntil(this.destroy$)).subscribe({
      next: resp => this.legalTexts.set(resp.items)
    });
  }

  // ─── App Config ───────────────────────
  openConfigEditor(config?: AppConfig) {
    if (config) {
      this.editingConfig.set(config);
      this.configForm.set({ ...config });
      this.logoMode.set(this.logoHtmlSanitizer.isImageMarkup(config.logoHtml) ? 'image' : 'code');
    } else {
      this.editingConfig.set(null);
      this.configForm.set({ configName: '', companyName: '', logoHtml: '', primaryColor: '#7C3AED', colorScheme: 'violet', candidateAccountsEnabled: false, isActive: false });
      this.logoMode.set('code');
    }
    this.showConfigEditor.set(true);
  }

  closeConfigEditor() {
    this.showConfigEditor.set(false);
    this.editingConfig.set(null);
  }

  onLogoFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.notificationService.error('Erreur', 'Veuillez sélectionner un fichier image');
      return;
    }
    if (file.size > 500_000) {
      this.notificationService.error('Erreur', 'L\'image ne doit pas dépasser 500 Ko');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.updateConfigForm('logoHtml', `<img src="${dataUrl}" alt="Logo" style="max-height:48px;" />`);
    };
    reader.readAsDataURL(file);
  }

  saveConfig() {
    const form = this.configForm();
    if (!form.configName?.trim() || !form.companyName?.trim()) {
      this.notificationService.error('Champs requis', 'Le nom de la configuration et le nom de l\'entreprise sont requis');
      return;
    }

    const payload: Partial<AppConfig> = {
      ...form,
      configName: form.configName.trim(),
      companyName: form.companyName.trim(),
      logoHtml: this.logoHtmlSanitizer.sanitize(form.logoHtml)
    };

    this.savingConfig.set(true);
    const op = this.editingConfig()
      ? this.appConfigService.update(payload)
      : this.appConfigService.create(payload);

    op.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.success('Succès', this.editingConfig() ? 'Configuration mise à jour' : 'Configuration créée');
        this.closeConfigEditor();
        this.savingConfig.set(false);
        this.reloadConfigs();
      },
      error: () => {
        this.notificationService.error('Erreur', 'Erreur lors de la sauvegarde de la configuration');
        this.savingConfig.set(false);
      }
    });
  }

  deleteConfig(config: AppConfig) {
    if (!confirm(`Supprimer la configuration "${config.configName}" ?`)) return;
    this.appConfigService.delete(config.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.success('Succès', 'Configuration supprimée');
        this.reloadConfigs();
      },
      error: () => this.notificationService.error('Erreur', 'Erreur lors de la suppression')
    });
  }

  activateConfig(config: AppConfig) {
    this.appConfigService.activate(config.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.success('Succès', `Configuration "${config.configName}" activée`);
        this.themeService.applyTheme(config);
        this.themeService.companyName.set(config.companyName || 'Synelia');
        this.themeService.logoHtml.set(this.logoHtmlSanitizer.sanitizeOrEmpty(config.logoHtml));
        this.themeService.candidateAccountsEnabled.set(config.candidateAccountsEnabled === true);
        this.themeService.activeConfig.set({
          ...config,
          logoHtml: this.logoHtmlSanitizer.sanitize(config.logoHtml)
        });
        this.reloadConfigs();
      },
      error: () => this.notificationService.error('Erreur', 'Erreur lors de l\'activation')
    });
  }

  getSchemeColor(schemeKey: string): string {
    return this.colorSchemes.find(s => s.key === schemeKey)?.primary || '#7C3AED';
  }

  private reloadConfigs() {
    this.appConfigService.getByCriteria().pipe(takeUntil(this.destroy$)).subscribe({
      next: resp => this.appConfigs.set(resp.items)
    });
  }

  // ─── Invitation Codes ─────────────────
  openInvitationEditor() {
    this.invitationForm.set({ email: '', role: 'recruiter' });
    this.showInvitationEditor.set(true);
  }

  closeInvitationEditor() {
    this.showInvitationEditor.set(false);
  }

  updateInvitationForm(field: string, value: any) {
    this.invitationForm.set({ ...this.invitationForm(), [field]: value });
  }

  saveInvitation() {
    const form = this.invitationForm();
    if (!form.email?.trim()) {
      this.notificationService.error('Champ requis', 'L\'email est requis');
      return;
    }
    this.savingInvitation.set(true);
    this.invitationCodeService.create(form).pipe(takeUntil(this.destroy$)).subscribe({
      next: result => {
        this.savingInvitation.set(false);
        if (result.hasError) {
          this.notificationService.warning(
            'Invitation créée',
            result.message || 'Invitation créée, mais l\'email n\'a pas pu être envoyé.'
          );
        } else {
          this.notificationService.success('Succès', 'Invitation envoyée à ' + form.email);
        }
        this.closeInvitationEditor();
        this.reloadInvitations();
      },
      error: error => {
        this.notificationService.error(
          'Erreur',
          this.extractApiErrorMessage(error, 'Erreur lors de l\'envoi de l\'invitation')
        );
        this.savingInvitation.set(false);
      }
    });
  }

  deleteInvitation(invitation: InvitationCode) {
    if (!confirm(`Supprimer l'invitation pour "${invitation.email}" ?`)) return;
    this.invitationCodeService.delete(invitation.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.success('Succès', 'Invitation supprimée');
        this.reloadInvitations();
      },
      error: () => this.notificationService.error('Erreur', 'Erreur lors de la suppression')
    });
  }

  resendInvitation(invitation: InvitationCode) {
    this.invitationCodeService.resend(invitation.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: result => {
        if (result.hasError) {
          this.notificationService.warning(
            'Email non envoyé',
            result.message || 'L\'invitation a été mise à jour, mais l\'email n\'a pas pu être envoyé.'
          );
        } else {
          this.notificationService.success('Succès', 'Invitation renvoyée à ' + invitation.email);
        }
        this.reloadInvitations();
      },
      error: error => this.notificationService.error(
        'Erreur',
        this.extractApiErrorMessage(error, 'Erreur lors du renvoi')
      )
    });
  }

  isExpired(invitation: InvitationCode): boolean {
    if (!invitation.expiredAt) return false;
    return new Date(invitation.expiredAt) < new Date();
  }

  private reloadInvitations() {
    this.invitationCodeService.getByCriteria().pipe(takeUntil(this.destroy$)).subscribe({
      next: resp => this.invitationCodes.set(resp.items)
    });
  }

  private extractApiErrorMessage(error: any, fallback: string): string {
    return error?.message || error?.error?.status?.message || error?.status?.message || fallback;
  }

  // ─── Preview & Revert ─────────────────
  previewConfig(config: AppConfig) {
    this.previewingConfig.set(config);
    this.themeService.applyTheme(config);
    this.notificationService.success('Aperçu', `Aperçu du thème "${config.configName}" — non sauvegardé`);
  }

  cancelPreview() {
    const active = this.themeService.activeConfig();
    if (active) {
      this.themeService.applyTheme(active);
    }
    this.previewingConfig.set(null);
    this.notificationService.success('Aperçu annulé', 'Thème actif restauré');
  }

  revertToConfig(config: AppConfig) {
    if (!confirm(`Réactiver la configuration "${config.configName}" ?`)) return;
    this.activateConfig(config);
  }
}
