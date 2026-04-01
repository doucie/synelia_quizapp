import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { AuthService, User as AuthUser } from '../../../core/services/auth/auth.service';
import { EmailTemplateService, EmailTemplate } from '../../../core/services/email-template.service';
import { SmtpConfigService, SmtpConfig } from '../../../core/services/smtp-config.service';
import { LegalTextService, LegalText } from '../../../core/services/legal-text.service';
import { AppConfigService, AppConfig, COLOR_SCHEMES } from '../../../core/services/app-config.service';
import { InvitationCodeService, InvitationCode } from '../../../core/services/invitation-code.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeService } from '../../../core/services/theme.service';

type SettingsTab = 'emails' | 'smtp' | 'legal' | 'config' | 'invitations';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

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

  // SMTP Config
  smtpConfigs = signal<SmtpConfig[]>([]);
  smtpForm = signal<Partial<SmtpConfig>>({});
  editingSmtp = signal<SmtpConfig | null>(null);
  showSmtpEditor = signal(false);
  savingSmtp = signal(false);
  showSmtpPassword = signal(false);

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

  // Invitation Codes
  invitationCodes = signal<InvitationCode[]>([]);
  invitationForm = signal<Partial<InvitationCode>>({});
  showInvitationEditor = signal(false);
  savingInvitation = signal(false);

  constructor(
    private authService: AuthService,
    private emailTemplateService: EmailTemplateService,
    private smtpConfigService: SmtpConfigService,
    private legalTextService: LegalTextService,
    private appConfigService: AppConfigService,
    private invitationCodeService: InvitationCodeService,
    private notificationService: NotificationService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(u => {
      this.user.set(u);
      if (u && u.role !== 'super') {
        this.activeTab.set('config');
      }
    });
    this.loadAll();
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
    this.isLoading.set(true);
    forkJoin({
      templates: this.emailTemplateService.getByCriteria(),
      smtp: this.smtpConfigService.getByCriteria(),
      legal: this.legalTextService.getByCriteria(),
      configs: this.appConfigService.getByCriteria(),
      invitations: this.invitationCodeService.getByCriteria()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ templates, smtp, legal, configs, invitations }) => {
        this.emailTemplates.set(templates.items);
        this.smtpConfigs.set(smtp.items);
        this.legalTexts.set(legal.items);
        this.appConfigs.set(configs.items);
        this.invitationCodes.set(invitations.items);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.error('Erreur', 'Erreur lors du chargement des paramètres');
      }
    });
  }

  // ─── Email Templates ─────────────────────
  openTemplateEditor(template?: EmailTemplate) {
    if (template) {
      this.editingTemplate.set(template);
      this.templateForm.set({ ...template });
    } else {
      this.editingTemplate.set(null);
      this.templateForm.set({ templateKey: '', subjectTemplate: '', bodyTemplate: '', description: '', availableVariables: '', isActive: true });
    }
    this.showTemplateEditor.set(true);
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
      this.smtpForm.set({ ...config, passwordEncrypted: '' });
    } else {
      this.editingSmtp.set(null);
      this.smtpForm.set({
        host: '', port: 587, username: '', passwordEncrypted: '',
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
    if (this.editingSmtp() && !data.passwordEncrypted?.trim()) {
      delete data.passwordEncrypted;
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
    } else {
      this.editingConfig.set(null);
      this.configForm.set({ configName: '', companyName: '', logoHtml: '', primaryColor: '#7C3AED', colorScheme: 'violet', isActive: false });
    }
    this.showConfigEditor.set(true);
  }

  closeConfigEditor() {
    this.showConfigEditor.set(false);
    this.editingConfig.set(null);
  }

  saveConfig() {
    const form = this.configForm();
    if (!form.configName?.trim() || !form.companyName?.trim()) {
      this.notificationService.error('Champs requis', 'Le nom de la configuration et le nom de l\'entreprise sont requis');
      return;
    }
    this.savingConfig.set(true);
    const op = this.editingConfig()
      ? this.appConfigService.update(form)
      : this.appConfigService.create(form);

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
        this.themeService.logoHtml.set(config.logoHtml || '');
        this.themeService.activeConfig.set(config);
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
      next: () => {
        this.notificationService.success('Succès', 'Invitation envoyée à ' + form.email);
        this.closeInvitationEditor();
        this.savingInvitation.set(false);
        this.reloadInvitations();
      },
      error: () => {
        this.notificationService.error('Erreur', 'Erreur lors de l\'envoi de l\'invitation');
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
      next: () => {
        this.notificationService.success('Succès', 'Invitation renvoyée à ' + invitation.email);
        this.reloadInvitations();
      },
      error: () => this.notificationService.error('Erreur', 'Erreur lors du renvoi')
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
