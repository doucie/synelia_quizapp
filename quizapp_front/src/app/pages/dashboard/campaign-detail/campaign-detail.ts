import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { CampaignService, Campaign, CampaignAccessRecord } from '../../../core/services/campaign.service';
import { SourceTokenService, SourceToken } from '../../../services/source-token.service';
import { FormService, Form } from '../../../core/services/form.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { ApplicationProgressService } from '../../../core/services/application-progress.service';
import { EntityPermissionService } from '../../../core/services/entity-permission.service';
import { PipelineStage } from '../../../core/models/pipeline.interfaces';
import { getCampaignStatusClass, getCampaignStatusLabel } from '../../../core/constants/campaign-status.constants';
import { FilterCheckboxComponent } from '../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../shared/filter-select/filter-select';
import { environment } from '../../../../environments/environment';

interface EntityPerm {
  id?: number;
  userId?: number;
  entityType?: string;
  entityId?: number;
  permissionKey?: string;
  granted?: boolean;
  userName?: string;
  userEmail?: string;
}

interface FormAssignmentOption {
  value: 'RANDOM' | 'RANDOM_NO_REPEAT' | 'SOURCE_TOKEN' | 'SEQUENTIAL';
  label: string;
  description: string;
}

interface FormExhaustionOption {
  value: 'BLOCK' | 'RESET' | 'LOOP';
  label: string;
  description: string;
}

const CAMPAIGN_PERMISSION_KEYS = [
  { key: 'UPDATE', label: 'Modifier' },
  { key: 'DELETE', label: 'Supprimer' },
  { key: 'EVALUATE', label: 'Évaluer' },
  { key: 'CORRECT_TEST', label: 'Corriger tests' },
  { key: 'PLANIFY', label: 'Planifier' },
  { key: 'ADVANCE_PIPELINE', label: 'Avancer pipeline' },
  { key: 'FOLLOW', label: 'Suivre' }
];

const FORM_ASSIGNMENT_STRATEGIES: FormAssignmentOption[] = [
  {
    value: 'RANDOM',
    label: 'Aléatoire simple',
    description: 'Chaque candidature reçoit un formulaire publié choisi au hasard parmi ceux de la campagne.'
  },
  {
    value: 'RANDOM_NO_REPEAT',
    label: 'Aléatoire sans répétition',
    description: 'Le même candidat ne reçoit pas deux fois le même formulaire tant que le pool n’est pas épuisé.'
  },
  {
    value: 'SOURCE_TOKEN',
    label: 'Selon le source token',
    description: 'Le formulaire servi dépend du lien d’entrée utilisé pour candidater.'
  },
  {
    value: 'SEQUENTIAL',
    label: 'Rotation séquentielle',
    description: 'Les formulaires sont distribués dans l’ordre à chaque nouvelle candidature.'
  }
];

const FORM_EXHAUSTION_POLICIES: FormExhaustionOption[] = [
  {
    value: 'BLOCK',
    label: 'Bloquer',
    description: 'Refuse la participation quand tous les formulaires exploitables ont déjà été consommés.'
  },
  {
    value: 'RESET',
    label: 'Réinitialiser',
    description: 'Redémarre le tirage ou le cycle depuis zéro quand le pool est épuisé.'
  },
  {
    value: 'LOOP',
    label: 'Boucler',
    description: 'Continue la distribution en boucle, surtout utile pour la rotation séquentielle.'
  }
];

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective],
  templateUrl: './campaign-detail.html',
  styleUrls: ['./campaign-detail.scss']
})
export class CampaignDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Référence à window pour le template
  window = window;
  
  campaignId = signal<number | null>(null);
  campaign = signal<Campaign | null>(null);
  recruiters = signal<CampaignAccessRecord[]>([]);
  sourceTokens = signal<SourceToken[]>([]);
  campaignForms = signal<Form[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Pipeline
  pipelineStages = signal<PipelineStage[]>([]);
  stageCandidateCounts = signal<Record<number, number>>({});
  
  // Token management
  showTokenForm = signal(false);
  newTokenName = signal('');
  newTokenFormId = signal<number | null>(null);
  tokenLoading = signal(false);
  tokenFormSelections = signal<Record<number, number | null>>({});
  tokenFormSaving = signal<Set<number>>(new Set());

  // Form assignment configuration
  campaignConfigSaving = signal(false);
  selectedFormAssignmentStrategy = signal<'RANDOM' | 'RANDOM_NO_REPEAT' | 'SOURCE_TOKEN' | 'SEQUENTIAL'>('RANDOM');
  selectedFormExhaustionPolicy = signal<'BLOCK' | 'RESET' | 'LOOP'>('BLOCK');
  formAssignmentStrategies = FORM_ASSIGNMENT_STRATEGIES;
  formExhaustionPolicies = FORM_EXHAUSTION_POLICIES;
  
  // Admin mode confirmation modal
  showAdminModeModal = signal(false);
  checkingPermission = signal(false);

  // Entity permissions
  entityPermissions = signal<EntityPerm[]>([]);
  entityPermLoading = signal(false);
  entityPermSaving = signal<Set<string>>(new Set());
  campaignPermKeys = CAMPAIGN_PERMISSION_KEYS;
  private apiUrl = environment.apiUrl;

  // Tabs
  activeDetailTab = signal<'general' | 'pipeline' | 'forms' | 'applications' | 'recruiters'>('general');

  // Action modals
  showActionModal = signal(false);
  actionModalType = signal<string>('');
  actionLoading = signal(false);
  pauseResumeDate = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private campaignService: CampaignService,
    private sourceTokenService: SourceTokenService,
    private formService: FormService,
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService,
    private pipelineStageService: PipelineStageService,
    private applicationProgressService: ApplicationProgressService,
    private entityPermissionService: EntityPermissionService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = Number(params['id']);
        if (id) {
          this.campaignId.set(id);
          this.loadCampaignDetails(id);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCampaignDetails(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    // Charger la campagne
    this.campaignService.getCampaignById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (campaign) => {
          console.log('✅ Campagne chargée:', campaign);
          console.log('📊 Détails de la campagne:');
          console.log('  - Title:', campaign.campaignTitle);
          console.log('  - Description:', campaign.campaignDesc);
          console.log('  - Status:', campaign.campaignStatus);
          console.log('  - Start:', campaign.campaignStart);
          console.log('  - End:', campaign.campaignEnd);
          console.log('  - Duration:', campaign.campaignDuration);
          console.log('  - Max Apply:', campaign.maxApply);
          console.log('  - All Can Evaluate:', campaign.allCanEvaluate);
          console.log('  - Questions Count:', campaign.questionsCount);
          console.log('  - Applications Count:', campaign.applicationsCount);
          console.log('  - Creator Name:', campaign.creatorName);
          console.log('  - Department Name:', campaign.departmentName);
          console.log('  - Speciality:', campaign.specialityLibelle);
          console.log('  - Created At:', campaign.createdAt);
          console.log('  - Form Assignment Strategy:', campaign.formAssignmentStrategy);
          console.log('  - Form Exhaustion Policy:', campaign.formAssignmentExhaustionPolicy);
          
          this.campaign.set(campaign);
          this.initializeFormAssignmentDraft(campaign);
          
          // Charger le pipeline si un template est assigné
          if (campaign.pipelineTemplateId) {
            this.loadPipelineStages(campaign.pipelineTemplateId);
          }
          
          // Charger les recruteurs ayant accès à la campagne
          this.loadCampaignRecruiters(id);
          
          // Charger les permissions par entité
          this.loadEntityPermissions();
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement de la campagne:', error);
          this.error.set('Impossible de charger les détails de la campagne');
          this.loading.set(false);
        }
      });
  }

  loadCampaignRecruiters(campaignId: number): void {
    console.log('📋 Chargement des recruteurs pour la campagne:', campaignId);
    
    this.campaignService.getCampaignAccess(campaignId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accessList) => {
          console.log('✅ Liste des accès récupérée:', accessList);

          this.recruiters.set(accessList);
          
          // Charger les tokens de la campagne
          this.loadCampaignTokens(campaignId);
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des recruteurs:', error);
          this.recruiters.set([]);
          this.loadCampaignTokens(campaignId);
        }
      });
  }

  loadCampaignTokens(campaignId: number): void {
    console.log('🔑 Chargement des tokens pour la campagne:', campaignId);
    
    this.sourceTokenService.getSourceTokensByCampaign(campaignId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tokens) => {
          console.log('✅ Tokens récupérés:', tokens);
          this.sourceTokens.set(tokens);
          this.syncTokenFormSelections(tokens);
          
          // Charger les questions de la campagne
          this.loadCampaignForms(campaignId);
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des tokens:', error);
          this.sourceTokens.set([]);
          this.tokenFormSelections.set({});
          
          // Charger quand même les formulaires
          this.loadCampaignForms(campaignId);
        }
      });
  }

  loadCampaignForms(campaignId: number): void {
    console.log('📝 Chargement des formulaires pour la campagne:', campaignId);
    
    this.formService.getAllByCriteria({ filterCampaignId: campaignId, size: 100, isDeleted: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Formulaires récupérés:', response.content);
          this.campaignForms.set(response.content);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des formulaires:', error);
          this.campaignForms.set([]);
          this.loading.set(false);
        }
      });
  }

  // ── Pipeline ──────────────────────────────────────

  loadPipelineStages(templateId: number): void {
    this.pipelineStageService.getByTemplate(templateId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const stages = (response.items || []).sort((a, b) => (a.stageOrder || 0) - (b.stageOrder || 0));
          this.pipelineStages.set(stages);
          // Charger le compteur de candidats par étape
          this.loadStageCandidateCounts(stages);
        },
        error: () => this.pipelineStages.set([])
      });
  }

  loadStageCandidateCounts(stages: PipelineStage[]): void {
    const counts: Record<number, number> = {};
    stages.forEach(stage => {
      if (stage.id) {
        this.applicationProgressService.getAllByCriteria({
          pipelineStageId: stage.id,
          progressStatus: 'IN_PROGRESS',
          isDeleted: false,
          size: 1
        }).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            counts[stage.id!] = response.totalElements;
            this.stageCandidateCounts.set({ ...counts });
          }
        });
      }
    });
  }

  filterByStage(stage: PipelineStage): void {
    if (this.campaignId() && stage.id) {
      this.router.navigate(['/dashboard/candidates'], { 
        fragment: `campaign${this.campaignId()}`,
        queryParams: { stageId: stage.id }
      });
    }
  }

  toggleTokenForm(): void {
    this.showTokenForm.set(!this.showTokenForm());
    if (!this.showTokenForm()) {
      this.newTokenName.set('');
      this.newTokenFormId.set(null);
    }
  }

  createToken(): void {
    const tokenName = this.newTokenName().trim();
    
    if (!tokenName) {
      alert('Veuillez saisir un nom pour le token');
      return;
    }

    if (!this.campaignId()) {
      return;
    }

    this.tokenLoading.set(true);

    const newToken: Partial<SourceToken> = {
      campaignId: this.campaignId()!,
      sourceTokenName: tokenName,
      formId: this.newTokenFormId() ?? undefined
    };

    this.sourceTokenService.createSourceTokens([newToken])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Token créé:', response);
          this.tokenLoading.set(false);
          this.showTokenForm.set(false);
          this.newTokenName.set('');
          this.newTokenFormId.set(null);
          
          // Recharger les tokens
          this.loadCampaignTokens(this.campaignId()!);
        },
        error: (error) => {
          console.error('❌ Erreur lors de la création du token:', error);
          alert('Erreur lors de la création du token');
          this.tokenLoading.set(false);
        }
      });
  }

  saveCampaignFormConfiguration(): void {
    const currentCampaign = this.campaign();
    if (!currentCampaign?.id || this.campaignConfigSaving()) {
      return;
    }

    this.campaignConfigSaving.set(true);

    this.campaignService.updateCampaign(currentCampaign.id, {
      formAssignmentStrategy: this.selectedFormAssignmentStrategy(),
      formAssignmentExhaustionPolicy: this.selectedFormExhaustionPolicy()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedCampaign) => {
          this.campaign.set({
            ...currentCampaign,
            ...updatedCampaign,
            formAssignmentStrategy: this.selectedFormAssignmentStrategy(),
            formAssignmentExhaustionPolicy: this.selectedFormExhaustionPolicy()
          });
          this.campaignConfigSaving.set(false);
          this.notificationService.success('Succès', 'La stratégie d’attribution des formulaires a été enregistrée.');
        },
        error: (error) => {
          console.error('❌ Erreur lors de la sauvegarde de la stratégie de formulaires:', error);
          this.campaignConfigSaving.set(false);
          this.notificationService.error('Erreur', this.extractErrorMessage(error, 'Impossible d’enregistrer la configuration des formulaires.'));
        }
      });
  }

  isCampaignFormConfigDirty(): boolean {
    const currentCampaign = this.campaign();
    if (!currentCampaign) {
      return false;
    }

    const currentStrategy = currentCampaign.formAssignmentStrategy || 'RANDOM';
    const currentPolicy = currentCampaign.formAssignmentExhaustionPolicy || 'BLOCK';
    return currentStrategy !== this.selectedFormAssignmentStrategy()
      || currentPolicy !== this.selectedFormExhaustionPolicy();
  }

  updateTokenFormSelection(tokenId: number | undefined, formId: number | null): void {
    if (!tokenId) {
      return;
    }

    this.tokenFormSelections.set({
      ...this.tokenFormSelections(),
      [tokenId]: formId
    });
  }

  getTokenFormSelection(token: SourceToken): number | null {
    if (!token.id) {
      return token.formId ?? null;
    }
    return this.tokenFormSelections()[token.id] ?? token.formId ?? null;
  }

  isTokenFormDirty(token: SourceToken): boolean {
    return this.getTokenFormSelection(token) !== (token.formId ?? null);
  }

  saveTokenFormAssignment(token: SourceToken): void {
    if (!token.id || this.isTokenFormSaving(token.id)) {
      return;
    }

    const selectedFormId = this.getTokenFormSelection(token);
    this.setTokenFormSaving(token.id, true);

    this.sourceTokenService.updateSourceToken({
      id: token.id,
      formId: selectedFormId ?? 0
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.setTokenFormSaving(token.id!, false);
          this.notificationService.success('Succès', 'Le formulaire du token a été mis à jour.');
          if (this.campaignId()) {
            this.loadCampaignTokens(this.campaignId()!);
          }
        },
        error: (error) => {
          console.error('❌ Erreur lors de la mise à jour du formulaire du token:', error);
          this.setTokenFormSaving(token.id!, false);
          this.notificationService.error('Erreur', this.extractErrorMessage(error, 'Impossible de mettre à jour le formulaire du token.'));
        }
      });
  }

  isTokenFormSaving(tokenId?: number): boolean {
    return tokenId ? this.tokenFormSaving().has(tokenId) : false;
  }

  getFormAssignmentStrategyLabel(value?: string): string {
    return this.formAssignmentStrategies.find(option => option.value === value)?.label || 'Aléatoire simple';
  }

  getFormAssignmentStrategyDescription(value?: string): string {
    return this.formAssignmentStrategies.find(option => option.value === value)?.description
      || this.formAssignmentStrategies[0].description;
  }

  getExhaustionPolicyLabel(value?: string): string {
    return this.formExhaustionPolicies.find(option => option.value === value)?.label || 'Bloquer';
  }

  getExhaustionPolicyDescription(value?: string): string {
    return this.formExhaustionPolicies.find(option => option.value === value)?.description
      || this.formExhaustionPolicies[0].description;
  }

  isSourceTokenStrategySelected(): boolean {
    return this.selectedFormAssignmentStrategy() === 'SOURCE_TOKEN';
  }

  deleteToken(token: SourceToken): void {
    if (!token.id) return;

    if (!confirm(`Voulez-vous vraiment supprimer le token "${token.sourceTokenName}" ?`)) {
      return;
    }

    this.sourceTokenService.deleteSourceToken(token.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('✅ Token supprimé');
          // Recharger les tokens
          if (this.campaignId()) {
            this.loadCampaignTokens(this.campaignId()!);
          }
        },
        error: (error) => {
          console.error('❌ Erreur lors de la suppression du token:', error);
          alert('Erreur lors de la suppression du token');
        }
      });
  }

  copyTokenToClipboard(token: SourceToken): void {
    if (!token.tokenString) return;

    const url = `${window.location.origin}/postuler/${token.tokenString}`;
    
    navigator.clipboard.writeText(url).then(() => {
      alert('Lien copié dans le presse-papiers !');
    }).catch(err => {
      console.error('❌ Erreur lors de la copie:', err);
      alert('Erreur lors de la copie du lien');
    });
  }

  getStatusClass(status?: string): string {
    return getCampaignStatusClass(status);
  }

  getStatusLabel(status?: string): string {
    return getCampaignStatusLabel(status);
  }

  getRoleClass(role?: string): string {
    switch((role || '').toLowerCase()) {
      case 'super': return 'role-super';
      case 'admin': return 'role-admin';
      case 'recruiter': return 'role-recruiter';
      default: return 'role-default';
    }
  }

  getRoleLabel(role?: string): string {
    switch((role || '').toLowerCase()) {
      case 'super': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'recruiter': return 'Recruteur';
      default: return 'Utilisateur';
    }
  }

  formatDate(date?: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getInitials(name?: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  goBack(): void {
    this.router.navigate(['/dashboard/campaigns']);
  }

  editCampaign(): void {
    const campaignId = this.campaignId();
    if (!campaignId) return;

    this.checkingPermission.set(true);

    // Vérifier les permissions
    this.campaignService.checkEditPermission(campaignId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          console.log('🔐 Résultat vérification permissions:', result);
          this.checkingPermission.set(false);

          if (result.status === 'CAN_EDIT') {
            // L'utilisateur a les droits, rediriger directement
            console.log('✅ Utilisateur autorisé, redirection vers edit');
            this.router.navigate(['/dashboard/campaigns', campaignId, 'edit']);
          } else if (result.status === 'REQUIRES_ADMIN_MODE') {
            // L'utilisateur est admin/super mais doit activer le mode admin
            console.log('⚠️ Requiert le mode administrateur');
            this.showAdminModeModal.set(true);
          } else {
            // NO_PERMISSION - vérifier si l'utilisateur est admin/super localement
            console.log('❌ Pas de droits directs, vérification du rôle local...');
            const currentUser = this.authService.getCurrentUser();
            
            if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super')) {
              // L'utilisateur est admin/super, proposer d'activer le mode admin
              console.log('⚠️ Utilisateur admin/super détecté, affichage modal');
              this.showAdminModeModal.set(true);
            } else {
              // L'utilisateur n'est ni admin ni super
              console.log('❌ Utilisateur non autorisé');
              this.notificationService.error(
                'Accès refusé',
                'Vous n\'avez pas les droits nécessaires pour modifier cette campagne.',
                6000
              );
            }
          }
        },
        error: (error) => {
          console.error('❌ Erreur vérification permissions:', error);
          this.checkingPermission.set(false);
          
          // En cas d'erreur (ex: 404, backend non démarré), vérifier localement
          const currentUser = this.authService.getCurrentUser();
          console.log('🔍 Vérification locale du rôle utilisateur:', currentUser?.role);
          
          if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super')) {
            // L'utilisateur est admin/super, proposer d'activer le mode admin
            console.log('⚠️ Backend inaccessible mais utilisateur admin/super détecté');
            this.showAdminModeModal.set(true);
          } else {
            // L'utilisateur n'est pas admin/super ou erreur inconnue
            console.log('❌ Erreur backend et utilisateur non admin');
            this.notificationService.error(
              'Erreur de vérification',
              'Impossible de vérifier vos permissions. Veuillez réessayer ou contacter un administrateur.',
              6000
            );
          }
        }
      });
  }

  confirmAdminMode(): void {
    console.log('✅ Confirmation activation mode admin');
    const campaignId = this.campaignId();
    if (!campaignId) return;

    // Récupérer l'utilisateur actuel
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Erreur: utilisateur non connecté');
      return;
    }

    // Vérifier si admin_mode est déjà activé
    if (currentUser.adminMode) {
      // Déjà activé, rediriger directement
      console.log('✅ Mode admin déjà activé, redirection');
      this.showAdminModeModal.set(false);
      this.router.navigate(['/dashboard/campaigns', campaignId, 'edit']);
      return;
    }

    // Activer admin_mode (convertir l'ID string en number)
    console.log('🔄 Activation du mode admin...');
    const userId = parseInt(currentUser.id, 10);
    this.userService.updateAdminMode(userId, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('✅ Mode admin activé avec succès');
          
          // Mettre à jour l'utilisateur dans le localStorage et le service
          const updatedUser = { ...currentUser, adminMode: true };
          this.authService.updateCurrentUser(updatedUser);
          
          // Fermer la modal
          this.showAdminModeModal.set(false);
          
          // Rediriger vers la page d'édition
          // Le dashboard va se mettre à jour automatiquement grâce au computed
          console.log('🔄 Redirection vers la page d\'édition...');
          this.router.navigate(['/dashboard/campaigns', campaignId, 'edit']);
        },
        error: (error) => {
          console.error('❌ Erreur activation mode admin:', error);
          alert('Erreur lors de l\'activation du mode administrateur');
        }
      });
  }

  cancelAdminMode(): void {
    console.log('❌ Annulation activation mode admin');
    this.showAdminModeModal.set(false);
  }

  viewApplications(): void {
    if (this.campaignId()) {
      this.router.navigate(['/dashboard/candidates'], { fragment: `campaign${this.campaignId()}` });
    }
  }

  // ── Entity Permissions ──────────────────────────

  loadEntityPermissions(): void {
    const campaignId = this.campaignId();
    if (!campaignId) return;

    this.entityPermLoading.set(true);
    this.entityPermissionService.getForEntity('CAMPAIGN', campaignId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.entityPermissions.set(res.items || []);
          this.entityPermLoading.set(false);
        },
        error: () => {
          this.entityPermissions.set([]);
          this.entityPermLoading.set(false);
        }
      });
  }

  hasEntityPerm(userId: number, permKey: string): boolean {
    return this.entityPermissions().some(
      p => p.userId === userId && (p.permissionKey || '').toUpperCase() === permKey && p.granted
    );
  }

  toggleEntityPerm(userId: number, permKey: string): void {
    const campaignId = this.campaignId();
    if (!campaignId) return;

    const savingKey = `${userId}_${permKey}`;
    const saving = new Set(this.entityPermSaving());
    saving.add(savingKey);
    this.entityPermSaving.set(saving);

    const has = this.hasEntityPerm(userId, permKey);
    const request$ = has
      ? this.entityPermissionService.revoke(userId, 'CAMPAIGN', campaignId, permKey)
      : this.entityPermissionService.grant(userId, 'CAMPAIGN', campaignId, permKey);

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadEntityPermissions();
          this.removeEntitySaving(savingKey);
        },
        error: () => this.removeEntitySaving(savingKey)
      });
  }

  isEntityPermSaving(userId: number, permKey: string): boolean {
    return this.entityPermSaving().has(`${userId}_${permKey}`);
  }

  private removeEntitySaving(key: string): void {
    const saving = new Set(this.entityPermSaving());
    saving.delete(key);
    this.entityPermSaving.set(saving);
  }

  getUniquePermUsers(): { userId: number; userName: string; userEmail: string }[] {
    const usersMap = new Map<number, { userId: number; userName: string; userEmail: string }>();

    // Use recruiters as base list
    for (const r of this.recruiters()) {
      usersMap.set(r.userId, {
        userId: r.userId,
        userName: r.userName || 'Utilisateur',
        userEmail: r.userEmail || ''
      });
    }

    // Add any additional users from entity permissions
    for (const p of this.entityPermissions()) {
      if (p.userId && !usersMap.has(p.userId)) {
        usersMap.set(p.userId, {
          userId: p.userId,
          userName: p.userName || `User #${p.userId}`,
          userEmail: p.userEmail || ''
        });
      }
    }

    return Array.from(usersMap.values());
  }

  private initializeFormAssignmentDraft(campaign: Campaign): void {
    this.selectedFormAssignmentStrategy.set(campaign.formAssignmentStrategy || 'RANDOM');
    this.selectedFormExhaustionPolicy.set(campaign.formAssignmentExhaustionPolicy || 'BLOCK');
  }

  private syncTokenFormSelections(tokens: SourceToken[]): void {
    const nextSelections: Record<number, number | null> = {};
    for (const token of tokens) {
      if (token.id) {
        nextSelections[token.id] = token.formId ?? null;
      }
    }
    this.tokenFormSelections.set(nextSelections);
  }

  private setTokenFormSaving(tokenId: number, isSaving: boolean): void {
    const next = new Set(this.tokenFormSaving());
    if (isSaving) {
      next.add(tokenId);
    } else {
      next.delete(tokenId);
    }
    this.tokenFormSaving.set(next);
  }

  private extractErrorMessage(error: any, fallbackMessage: string): string {
    return error?.error?.status?.message
      || error?.error?.message
      || error?.message
      || fallbackMessage;
  }

  // ========== TABS ==========

  setTab(tab: 'general' | 'pipeline' | 'forms' | 'applications' | 'recruiters'): void {
    this.activeDetailTab.set(tab);
  }

  // ========== ACTIONS DE CYCLE DE VIE ==========

  openActionModal(type: string): void {
    this.actionModalType.set(type);
    this.pauseResumeDate.set('');
    this.showActionModal.set(true);
  }

  closeActionModal(): void {
    this.showActionModal.set(false);
    this.actionModalType.set('');
    this.actionLoading.set(false);
    this.pauseResumeDate.set('');
  }

  confirmAction(): void {
    const id = this.campaignId();
    if (!id || this.actionLoading()) return;

    this.actionLoading.set(true);
    const type = this.actionModalType();
    let action$;

    switch (type) {
      case 'publish':
        action$ = this.campaignService.publishCampaign(id);
        break;
      case 'publish-with-dates':
        action$ = this.campaignService.publishCampaign(id, {
          campaignStart: this.campaign()?.campaignStart,
          campaignEnd: this.campaign()?.campaignEnd
        });
        break;
      case 'open':
        action$ = this.campaignService.openCampaign(id);
        break;
      case 'close':
        action$ = this.campaignService.closeCampaign(id);
        break;
      case 'pause':
        action$ = this.campaignService.pauseCampaign(id, this.pauseResumeDate() || undefined);
        break;
      case 'resume':
        action$ = this.campaignService.resumeCampaign(id);
        break;
      case 'unpublish':
        action$ = this.campaignService.unpublishCampaign(id);
        break;
      case 'archive':
        action$ = this.campaignService.archiveCampaign(id);
        break;
      case 'unarchive':
        action$ = this.campaignService.unarchiveCampaign(id);
        break;
      default:
        this.actionLoading.set(false);
        return;
    }

    action$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (updatedCampaign) => {
        this.campaign.set(updatedCampaign);
        this.actionLoading.set(false);
        this.closeActionModal();
        this.notificationService.success('Succès', 'La campagne a été mise à jour.');
        if (updatedCampaign.pipelineTemplateId) {
          this.loadPipelineStages(updatedCampaign.pipelineTemplateId);
        }
      },
      error: (error) => {
        this.actionLoading.set(false);
        this.notificationService.error('Erreur', this.extractErrorMessage(error, 'Impossible d\'effectuer cette action.'));
      }
    });
  }

  getActionModalTitle(): string {
    switch (this.actionModalType()) {
      case 'publish': return 'Publier la campagne';
      case 'publish-with-dates': return 'Publier la campagne';
      case 'open': return 'Ouvrir la campagne';
      case 'close': return 'Fermer la campagne';
      case 'pause': return 'Mettre en pause';
      case 'resume': return 'Reprendre la campagne';
      case 'unpublish': return 'Remettre en brouillon';
      case 'archive': return 'Archiver la campagne';
      case 'unarchive': return 'Désarchiver la campagne';
      default: return 'Confirmation';
    }
  }

  getActionModalMessage(): string {
    switch (this.actionModalType()) {
      case 'publish': return 'Mettre la campagne en ligne ? Les candidats pourront y accéder.';
      case 'publish-with-dates': return 'Mettre la campagne en ligne ? Vérifiez les dates de début et de fin.';
      case 'open': return 'Ouvrir la campagne maintenant ? La date de début sera définie à aujourd\'hui.';
      case 'close': return 'Fermer la campagne maintenant ? La date de fin sera définie à aujourd\'hui.';
      case 'pause': return 'Mettre la campagne en pause ? Les candidats ne pourront plus y accéder temporairement.';
      case 'resume': return 'Reprendre la campagne ? Elle redeviendra active.';
      case 'unpublish': return 'Remettre en brouillon ? La campagne ne sera plus visible publiquement.';
      case 'archive': return 'Archiver cette campagne ? Elle sera déplacée dans l\'onglet Archivées et ne sera plus modifiable.';
      case 'unarchive': return 'Désarchiver cette campagne ? Elle redeviendra accessible depuis l\'onglet principal.';
      default: return 'Êtes-vous sûr de vouloir continuer ?';
    }
  }

  getActionModalConfirmLabel(): string {
    switch (this.actionModalType()) {
      case 'publish': case 'publish-with-dates': return 'Publier';
      case 'open': return 'Ouvrir';
      case 'close': return 'Fermer';
      case 'pause': return 'Mettre en pause';
      case 'resume': return 'Reprendre';
      case 'unpublish': return 'Remettre en brouillon';
      case 'archive': return 'Archiver';
      case 'unarchive': return 'Désarchiver';
      default: return 'Confirmer';
    }
  }

  getActionModalIconClass(): string {
    switch (this.actionModalType()) {
      case 'publish': case 'open': case 'resume': case 'unarchive': return 'success';
      case 'close': case 'unpublish': return 'warning';
      case 'pause': return 'info';
      case 'archive': return 'danger';
      default: return 'warning';
    }
  }
}
