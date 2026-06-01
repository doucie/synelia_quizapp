import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Interview, InterviewService } from '../../../core/services/interview.service';
import { Application, ApplicationService } from '../../../core/services/application.service';
import { Campaign, CampaignService, CampaignAccessRecord } from '../../../core/services/campaign.service';
import { User, UserService } from '../../../core/services/user.service';
import { InterviewAdminService, InterviewEvaluatorOption } from '../../../core/services/interview-admin.service';
import { EntityPermissionService } from '../../../core/services/entity-permission.service';
import { PermissionService } from '../../../core/services/permission.service';
import { SourceTokenService, SourceToken } from '../../../services/source-token.service';
import { InterviewParticipantService, InterviewParticipant } from '../../../core/services/interview-participant.service';
import { EntityPermission } from '../../../core/models/permission.interfaces';
import { APPLICATION_STATUS } from '../../../core/constants/application-status.constants';
import { FilterCheckboxComponent } from '../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../shared/filter-select/filter-select';

interface InterviewFormData {
  campaignId: number;
  selectedCandidates: number[];
  interviewDate: string;
  interviewTime: string;
  interviewType: 'IN_PERSON' | 'ONLINE';
  interviewLocation: string;
  meetLink: string;
  selectedEvaluators: number[];
  interviewNote: string;
}

@Component({
  selector: 'app-interview-create',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective],
  templateUrl: './interview-create.html',
  styleUrl: './interview-create.scss'
})
export class InterviewCreateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private prefilledCampaignId: number | null = null;
  private prefilledApplicationId: number | null = null;
  private prefilledCandidateApplied = false;
  private interviewAdminService = inject(InterviewAdminService);

  // Signals
  loading = signal(false);
  campaigns = signal<Campaign[]>([]);
  campaignAccessMap = signal<Record<number, CampaignAccessRecord>>({});
  applications = signal<Application[]>([]);
  sourceTokens = signal<SourceToken[]>([]);
  campaignEntityPerms = signal<EntityPermission[]>([]); // Permissions entity_permission pour la campagne
  evaluators = signal<InterviewEvaluatorOption[]>([]); // Évaluateurs désignés pour la campagne
  allUsers = signal<User[]>([]); // Tous les utilisateurs pour la recherche
  searchEvaluatorQuery = signal('');
  showEmailPreview = signal(false);
  
  // Modal states
  showSummaryModal = signal(false);
  showEmailConfirmModal = signal(false);
  showNoEmailWarningModal = signal(false);
  sendEmail = signal(true); // Par défaut, on envoie l'email
  
  // Form data
  formData = signal<InterviewFormData>({
    campaignId: 0,
    selectedCandidates: [],
    interviewDate: '',
    interviewTime: '',
    interviewType: 'IN_PERSON',
    interviewLocation: '',
    meetLink: '',
    selectedEvaluators: [],
    interviewNote: ''
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private interviewService: InterviewService,
    private applicationService: ApplicationService,
    private campaignService: CampaignService,
    private userService: UserService,
    private entityPermissionService: EntityPermissionService,
    private permissionService: PermissionService,
    private sourceTokenService: SourceTokenService,
    private interviewParticipantService: InterviewParticipantService
  ) {}

  ngOnInit(): void {
    this.readRoutePrefill();
    this.loadCampaigns();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Computed - Applications éligibles pour la campagne sélectionnée
   */
  eligibleApplications = computed(() => {
    const campaignId = this.formData().campaignId;
    if (!campaignId) return [];
    
    // Trouver TOUS les sourceTokens correspondant au campaignId sélectionné
    // Convertir en number pour la comparaison
    const campaignIdNum = Number(campaignId);
    const sourceTokenIds = this.sourceTokens()
      .filter(st => {
        const stCampaignId = Number(st.campaignId || st.campaigns_id);
        return stCampaignId === campaignIdNum;
      })
      .map(st => st.id)
      .filter(id => id !== undefined) as number[];
    
    if (sourceTokenIds.length === 0) {
      return [];
    }
    
    // Prefer the runtime current-stage mirror when available; keep a legacy fallback
    // only for applications that still do not expose a current pipeline snapshot.
    const eligible = this.applications().filter(app => 
      app.sourceTokenId && 
      sourceTokenIds.includes(app.sourceTokenId) &&
      this.isInterviewEligibleApplication(app)
    );
    
    return eligible;
  });

  /**
   * Computed - Candidats sélectionnés avec détails
   */
  selectedCandidatesDetails = computed(() => {
    const selectedIds = this.formData().selectedCandidates;
    return this.eligibleApplications().filter(app => 
      selectedIds.includes(app.id!)
    );
  });

  /**
   * Computed - Évaluateurs sélectionnés avec détails
   */
  selectedEvaluatorsDetails = computed(() => {
    const selectedIds = this.formData().selectedEvaluators;
    // Rechercher dans tous les utilisateurs, pas seulement les évaluateurs avec droit
    const allAvailableUsers = [...this.evaluators(), ...this.allUsers()];
    return allAvailableUsers.filter((user, index, self) => 
      selectedIds.includes(user.id!) && 
      self.findIndex(u => u.id === user.id) === index // Éviter les doublons
    );
  });

  /**
   * Computed - Utilisateurs filtrés pour la recherche (excluant ceux déjà évaluateurs)
   */
  filteredSearchUsers = computed(() => {
    const query = this.searchEvaluatorQuery().toLowerCase().trim();
    const evaluatorIds = this.evaluators().map(e => e.id);
    
    let filtered = this.allUsers().filter(user => 
      !evaluatorIds.includes(user.id) // Exclure ceux qui ont déjà le droit d'évaluer
    );
    
    if (query) {
      filtered = filtered.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
    }
    
    return filtered;
  });

  /**
   * Computed - Évaluateurs additionnels sélectionnés (non désignés)
   */
  additionalSelectedEvaluators = computed(() => {
    const evaluatorIds = this.evaluators().map(e => e.id);
    return this.selectedEvaluatorsDetails().filter(user => 
      !evaluatorIds.includes(user.id)
    );
  });

  /**
   * Computed - Informations sur la date de l'interview
   */
  interviewDateInfo = computed(() => {
    const form = this.formData();
    if (!form.interviewDate) {
      return null;
    }

    const interviewDate = new Date(form.interviewDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    interviewDate.setHours(0, 0, 0, 0);

    const diffTime = interviewDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const dayOfWeek = interviewDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayName = dayNames[dayOfWeek];

    return {
      date: interviewDate,
      dayName,
      isWeekend,
      diffDays,
      isPast: diffDays < 0,
      isTooFar: diffDays > 30,
      formattedDate: interviewDate.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };
  });

  /**
   * Computed - Preview de l'email
   */
  emailPreview = computed(() => {
    const form = this.formData();
    const campaign = this.campaigns().find(c => c.id === form.campaignId);
    const dateTime = this.formatDateTime(form.interviewDate, form.interviewTime);
    const evaluatorsNames = this.selectedEvaluatorsDetails()
      .map(e => this.getEvaluatorName(e))
      .join(', ');

    const interviewTypeText = form.interviewType === 'IN_PERSON' 
      ? 'qui se déroulera en présentiel' 
      : 'qui se déroulera en visioconférence';

    const locationOrLink = form.interviewType === 'IN_PERSON'
      ? `Lieu : ${form.interviewLocation || 'À préciser'}`
      : `Lien de connexion : ${form.meetLink || 'Sera communiqué ultérieurement'}`;

    const additionalNote = form.interviewNote 
      ? `\n\nNote supplémentaire :\n${form.interviewNote}` 
      : '';

    return {
      subject: `Convocation à un entretien - ${campaign?.campaignTitle || campaign?.campaignName || ''}`,
      body: `
Madame, Monsieur,

Nous avons le plaisir de vous informer que votre candidature pour le poste de "${campaign?.campaignTitle || campaign?.campaignName || ''}" a retenu notre attention.

Dans le cadre de notre processus de recrutement, nous souhaitons vous rencontrer pour un entretien ${interviewTypeText}.

Détails de l'entretien :

Date et heure : ${dateTime}
${locationOrLink}
${evaluatorsNames ? `Interlocuteur(s) : ${evaluatorsNames}` : ''}${additionalNote}

Nous vous prions de bien vouloir confirmer votre disponibilité en répondant à cet email.

Nous restons à votre disposition pour toute information complémentaire.

Cordialement,
L'équipe de recrutement
      `.trim()
    };
  });

  /**
   * Charge les campagnes
   */
  loadCampaigns(): void {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    forkJoin({
      campaigns: this.campaignService.getAllCampaignsByCriteria({ isDeleted: false }),
      campaignAccesses: this.campaignService.getCampaignAccessesByUser(currentUserId)
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        const accessMap = this.campaignService.buildCampaignAccessMap(response.campaignAccesses || []);
        this.campaignAccessMap.set(accessMap);

        const allCampaigns = response.campaigns.content || [];
        const allowedCampaigns = this.permissionService.hasAnyPermission(['CREATE_INTERVIEWS', 'UPDATE_INTERVIEWS', 'PLANIFY'])
          ? allCampaigns
          : allCampaigns.filter(campaign => campaign.id && this.canPlanifyCampaign(campaign.id, accessMap));

        this.campaigns.set(allowedCampaigns);

        if (this.formData().campaignId && !allowedCampaigns.some(campaign => campaign.id === this.formData().campaignId)) {
          this.formData.set({ ...this.formData(), campaignId: 0, selectedCandidates: [], selectedEvaluators: [] });
        }

        if (this.prefilledCampaignId && allowedCampaigns.some(campaign => campaign.id === this.prefilledCampaignId)) {
          this.formData.set({ ...this.formData(), campaignId: this.prefilledCampaignId });
          this.onCampaignChange();
          return;
        }

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des campagnes:', error);
        this.loading.set(false);
      }
    });
  }

  /**
   * Charge les candidats et évaluateurs d'une campagne
   */
  onCampaignChange(): void {
    const campaignId = this.formData().campaignId;
    if (!campaignId) return;
    if (!this.canPlanifyCampaign(campaignId)) {
      console.warn('Accès refusé à la planification pour la campagne', campaignId);
      return;
    }

    this.loading.set(true);

    forkJoin({
      applications: this.applicationService.getApplicationsByCriteria({}),
      sourceTokens: this.sourceTokenService.getSourceTokensByCriteria({}),
      evaluatorCatalog: this.interviewAdminService.getCampaignEvaluatorCatalog(campaignId),
      allUsers: this.userService.getAllUsersByCriteria({ isDeleted: false })
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        // Traiter les applications
        if (response.applications.items) {
          this.applications.set(response.applications.items);
        }

        // Traiter les sourceTokens
        if (response.sourceTokens.items) {
          this.sourceTokens.set(response.sourceTokens.items);
        }

        // Traiter tous les utilisateurs pour la recherche
        if (response.allUsers.content) {
          this.allUsers.set(response.allUsers.content);
        }

        this.campaignEntityPerms.set(response.evaluatorCatalog.campaignPermissions);
        this.evaluators.set(response.evaluatorCatalog.evaluators);
        this.formData.update(current => ({
          ...current,
          selectedEvaluators: response.evaluatorCatalog.preselectedEvaluatorIds
        }));

        this.applyRouteCandidatePrefill();

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.loading.set(false);
      }
    });
  }

  private readRoutePrefill(): void {
    const campaignId = Number(this.route.snapshot.queryParamMap.get('campaignId') || 0);
    const applicationId = Number(this.route.snapshot.queryParamMap.get('applicationId') || 0);

    this.prefilledCampaignId = campaignId > 0 ? campaignId : null;
    this.prefilledApplicationId = applicationId > 0 ? applicationId : null;
  }

  private applyRouteCandidatePrefill(): void {
    if (!this.prefilledApplicationId || this.prefilledCandidateApplied) {
      return;
    }

    const matchingApplication = this.eligibleApplications().find(app => app.id === this.prefilledApplicationId);
    if (!matchingApplication) {
      return;
    }

    const current = this.formData();
    if (!current.selectedCandidates.includes(this.prefilledApplicationId)) {
      current.selectedCandidates = [this.prefilledApplicationId];
      this.formData.set({ ...current });
    }

    this.prefilledCandidateApplied = true;
  }

  hasInterviewEligibilitySummary(app: Application): boolean {
    return Boolean(this.getInterviewEligibilityStageLabel(app) || this.getInterviewEligibilityProgressLabel(app));
  }

  getInterviewEligibilityStageLabel(app: Application): string {
    if (app.currentPipelineStageLabel?.trim()) {
      return app.currentPipelineStageLabel.trim();
    }

    if (app.currentPipelineStageType) {
      return this.getPipelineStageTypeLabel(app.currentPipelineStageType);
    }

    if (app.applicationStatus === APPLICATION_STATUS.PRE_SCREEN_ACCEPTED) {
      return 'Pré-sélection acceptée';
    }

    return '';
  }

  getInterviewEligibilityProgressLabel(app: Application): string {
    if (this.hasCurrentPipelineStageSummary(app)) {
      return this.getPipelineProgressStatusLabel(app.currentPipelineProgressStatus);
    }

    if (app.applicationStatus === APPLICATION_STATUS.PRE_SCREEN_ACCEPTED) {
      return 'Fallback legacy';
    }

    return '';
  }

  getInterviewEligibilityProgressClass(app: Application): string {
    if (this.hasCurrentPipelineStageSummary(app)) {
      return this.getPipelineProgressStatusClass(app.currentPipelineProgressStatus);
    }

    if (app.applicationStatus === APPLICATION_STATUS.PRE_SCREEN_ACCEPTED) {
      return 'pipeline-progress-legacy';
    }

    return '';
  }

  private isInterviewEligibleApplication(app: Application): boolean {
    const currentStageType = (app.currentPipelineStageType || '').toUpperCase();
    const currentProgressStatus = (app.currentPipelineProgressStatus || '').toUpperCase();
    const hasRuntimeStageSnapshot = this.hasCurrentPipelineStageSummary(app);

    if (hasRuntimeStageSnapshot) {
      const isCurrentInterviewStage = currentStageType === 'INTERVIEW';
      const isSchedulableStatus = currentProgressStatus === 'IN_PROGRESS' || currentProgressStatus === 'PENDING';
      const hasCurrentInterview = Boolean(app.interviewDate);

      return isCurrentInterviewStage && isSchedulableStatus && !hasCurrentInterview;
    }

    return app.applicationStatus === APPLICATION_STATUS.PRE_SCREEN_ACCEPTED;
  }

  private hasCurrentPipelineStageSummary(app: Application): boolean {
    return Boolean(
      app.currentPipelineStageType?.trim()
      || app.currentPipelineStageLabel?.trim()
      || app.currentPipelineProgressStatus?.trim()
    );
  }

  private getPipelineStageTypeLabel(stageType?: string | null): string {
    switch ((stageType || '').trim().toUpperCase()) {
      case 'CANDIDATURE':
        return 'Candidature';
      case 'QUIZ':
        return 'Quiz';
      case 'PRESELECTION':
        return 'Pré-sélection';
      case 'INTERVIEW':
        return 'Entretien';
      case 'EVALUATION':
        return 'Évaluation';
      case 'DECISION':
        return 'Décision';
      case 'TECHNICAL_TEST':
        return 'Quiz';
      default:
        return stageType || '';
    }
  }

  private getPipelineProgressStatusLabel(status?: string | null): string {
    switch ((status || '').trim().toUpperCase()) {
      case 'IN_PROGRESS':
        return 'En cours';
      case 'PENDING':
        return 'En attente';
      case 'PASSED':
        return 'Réussie';
      case 'FAILED':
        return 'Échouée';
      case 'SKIPPED':
        return 'Ignorée';
      default:
        return status || '';
    }
  }

  private getPipelineProgressStatusClass(status?: string | null): string {
    switch ((status || '').trim().toUpperCase()) {
      case 'IN_PROGRESS':
        return 'pipeline-progress-in-progress';
      case 'PENDING':
        return 'pipeline-progress-pending';
      case 'PASSED':
        return 'pipeline-progress-passed';
      case 'FAILED':
        return 'pipeline-progress-failed';
      case 'SKIPPED':
        return 'pipeline-progress-skipped';
      default:
        return '';
    }
  }

  private canPlanifyCampaign(campaignId: number, accessMap = this.campaignAccessMap()): boolean {
  if (this.permissionService.hasAnyPermission(['CREATE_INTERVIEWS', 'UPDATE_INTERVIEWS', 'PLANIFY'])) {
      return true;
    }
    const access = accessMap[campaignId];
    return Boolean(access && (access.isAdmin || access.isCreator || access.canPlanify));
  }

  private getCurrentUserId(): number | null {
    const currentUserData = localStorage.getItem('user');
    if (!currentUserData) {
      return null;
    }

    try {
      const parsedUser = JSON.parse(currentUserData);
      return parsedUser?.id ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Toggle sélection d'un candidat
   */
  toggleCandidate(applicationId: number, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const current = this.formData();
    const index = current.selectedCandidates.indexOf(applicationId);
    
    if (index > -1) {
      // Créer un nouveau tableau sans l'élément
      current.selectedCandidates = current.selectedCandidates.filter(id => id !== applicationId);
    } else {
      // Créer un nouveau tableau avec l'élément
      current.selectedCandidates = [...current.selectedCandidates, applicationId];
    }
    
    // Créer un nouvel objet pour déclencher la détection de changement
    this.formData.set({ ...current });
  }

  /**
   * Toggle sélection d'un évaluateur
   */
  toggleEvaluator(userId: number): void {
    const current = this.formData();
    const index = current.selectedEvaluators.indexOf(userId);
    
    if (index > -1) {
      current.selectedEvaluators.splice(index, 1);
    } else {
      current.selectedEvaluators.push(userId);
    }
    
    this.formData.set({ ...current });
  }

  /**
   * Met à jour le message complémentaire
   */
  updateInterviewNote(value: string): void {
    const current = this.formData();
    current.interviewNote = value;
    this.formData.set({ ...current });
  }

  /**
   * Met à jour le type d'entretien
   */
  updateInterviewType(value: 'IN_PERSON' | 'ONLINE'): void {
    const current = this.formData();
    current.interviewType = value;
    this.formData.set({ ...current });
  }

  /**
   * Met à jour le lieu
   */
  updateInterviewLocation(value: string): void {
    const current = this.formData();
    current.interviewLocation = value;
    this.formData.set({ ...current });
  }

  /**
   * Met à jour le lien de visioconférence
   */
  updateMeetLink(value: string): void {
    const current = this.formData();
    current.meetLink = value;
    this.formData.set({ ...current });
  }

  /**
   * Sélectionner tous les candidats
   */
  selectAllCandidates(): void {
    const current = this.formData();
    current.selectedCandidates = this.eligibleApplications().map(app => app.id!);
    this.formData.set({ ...current });
  }

  /**
   * Désélectionner tous les candidats
   */
  deselectAllCandidates(): void {
    const current = this.formData();
    current.selectedCandidates = [];
    this.formData.set({ ...current });
  }

  /**
   * Vérifie si un candidat est sélectionné
   */
  isCandidateSelected(applicationId: number): boolean {
    return this.formData().selectedCandidates.includes(applicationId);
  }

  /**
   * Vérifie si un évaluateur est sélectionné
   */
  isEvaluatorSelected(userId: number): boolean {
    return this.formData().selectedEvaluators.includes(userId);
  }

  /**
   * Toggle preview email
   */
  toggleEmailPreview(): void {
    this.showEmailPreview.set(!this.showEmailPreview());
  }

  /**
   * Soumet le formulaire
   */
  submitForm(): void {
    const form = this.formData();
    
    // Validation
    if (!form.campaignId) {
      alert('Veuillez sélectionner une campagne');
      return;
    }
    
    if (form.selectedCandidates.length === 0) {
      alert('Veuillez sélectionner au moins un candidat');
      return;
    }
    
    if (!form.interviewDate || !form.interviewTime) {
      alert('Veuillez saisir une date et heure');
      return;
    }

    if (form.interviewType === 'IN_PERSON' && !form.interviewLocation) {
      alert('Veuillez saisir un lieu pour un entretien en personne');
      return;
    }

    if (form.interviewType === 'ONLINE' && !form.meetLink) {
      alert('Veuillez saisir un lien de visioconférence');
      return;
    }

    // Afficher le récapitulatif
    this.showSummaryModal.set(true);
  }

  /**
   * Confirme le récapitulatif et demande si on envoie l'email
   */
  confirmSummary(sendEmail: boolean): void {
    this.sendEmail.set(sendEmail);
    this.showSummaryModal.set(false);

    if (sendEmail) {
      // Afficher la prévisualisation de l'email pour confirmation finale
      this.showEmailConfirmModal.set(true);
    } else {
      // Afficher l'avertissement sur le non-envoi
      this.showNoEmailWarningModal.set(true);
    }
  }

  /**
   * Confirme l'envoi de l'email et crée les entretiens
   */
  confirmEmailSend(): void {
    this.showEmailConfirmModal.set(false);
    this.createInterviews();
  }

  /**
   * Confirme qu'on ne veut pas envoyer l'email et crée les entretiens
   */
  confirmNoEmail(confirmed: boolean): void {
    this.showNoEmailWarningModal.set(false);
    if (confirmed) {
      this.createInterviews();
    }
  }

  /**
   * Annule et ferme tous les modals
   */
  cancelAllModals(): void {
    this.showSummaryModal.set(false);
    this.showEmailConfirmModal.set(false);
    this.showNoEmailWarningModal.set(false);
  }

  /**
   * Crée les entretiens pour tous les candidats sélectionnés
   */
  createInterviews(): void {
    const form = this.formData();
    const dateTime = `${form.interviewDate.split('-').reverse().join('/')} ${form.interviewTime}`;
    const shouldSendEmail = this.sendEmail();

    this.loading.set(true);

    // Créer un entretien pour chaque candidat
    const interviewRequests = form.selectedCandidates.map(candidateId => {
      const application = this.applications().find(app => app.id === candidateId);
      
      if (!application || !application.sourceTokenId) {
        console.error(`Application ${candidateId} introuvable ou sans sourceTokenId`);
        return null;
      }

      // Récupérer le sourceToken pour obtenir le campaignId
      const sourceToken = this.sourceTokens().find(st => st.id === application.sourceTokenId);
      if (!sourceToken || !sourceToken.campaignId) {
        console.error(`SourceToken ${application.sourceTokenId} introuvable ou sans campaignId`);
        return null;
      }

      const interview: Interview = {
        campaignId: sourceToken.campaignId, // Utiliser le campaignId du sourceToken
        applicationId: application.id,
        interviewDate: dateTime,
        interviewType: form.interviewType,
        interviewLocation: form.interviewLocation || undefined,
        meetLink: form.meetLink || undefined,
        interviewNote: form.interviewNote || undefined,
        interviewStatus: 'SCHEDULED',
        interviewMailSent: shouldSendEmail,
        isDeleted: false
      };

      console.log('📋 Interview créé pour application', application.id, ':', interview);
      return this.interviewService.createInterview(interview);
    }).filter(request => request !== null);

    // Exécuter toutes les créations d'entretiens
    forkJoin(interviewRequests).subscribe({
      next: (interviewResponses) => {
        const hasErrors = interviewResponses.some(r => r.hasError);
        
        if (hasErrors) {
          const errorMessages = interviewResponses
            .filter(r => r.hasError)
            .map(r => r.status.message)
            .join('\n');
          alert(`Certains entretiens n'ont pas pu être créés:\n${errorMessages}`);
          this.loading.set(false);
          return;
        }

        // Extraire les IDs des entretiens créés
        const createdInterviewIds = interviewResponses
          .filter(r => !r.hasError && r.items && r.items.length > 0)
          .map(r => r.items[0].id!)
          .filter(id => id !== undefined);
        const failedEmailCount = shouldSendEmail
          ? interviewResponses.filter(r => r.items?.[0]?.interviewMailSent === false).length
          : 0;

        console.log('✅ Entretiens créés:', createdInterviewIds);

        // Créer les participants pour chaque entretien
        this.createInterviewParticipants(createdInterviewIds, failedEmailCount);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création des entretiens:', error);
        alert('Erreur lors de la création des entretiens');
        this.loading.set(false);
      }
    });
  }

  /**
   * Crée les participants d'entretien et copie les permissions d'entité
   */
  createInterviewParticipants(interviewIds: number[], failedEmailCount = 0): void {
    const form = this.formData();
    const allParticipants: InterviewParticipant[] = [];

    // Pour chaque entretien créé, créer un participant pour chaque évaluateur
    interviewIds.forEach(interviewId => {
      form.selectedEvaluators.forEach(userId => {
        allParticipants.push({ interviewId, userId });
      });
    });

    console.log('📋 Participants à créer:', allParticipants);

    if (allParticipants.length > 0) {
      // Créer les participants (session state)
      this.interviewParticipantService.createParticipants(allParticipants).subscribe({
        next: (response) => {
          console.log('✅ Participants créés:', response);

          // Copier les permissions d'entité de la campagne vers chaque interview
          const campaignPerms = this.campaignEntityPerms().filter(p => p.granted);
          let permsDone = 0;
          const totalPerms = interviewIds.length * form.selectedEvaluators.length;

          interviewIds.forEach(interviewId => {
            form.selectedEvaluators.forEach(userId => {
              const isDesignatedEvaluator = this.evaluators().some(e => e.id === userId);

              if (isDesignatedEvaluator) {
                // Copier les permissions de la campagne pour cet utilisateur
                const userPerms = campaignPerms.filter(p => p.userId === userId);
                const permKeys = userPerms.map(p => p.permissionKey!).filter(k => k);

                if (permKeys.length > 0) {
                  this.entityPermissionService.grantBulk([userId], 'INTERVIEW', interviewId, permKeys).subscribe({
                    next: () => { permsDone++; this.checkPermsDone(permsDone, totalPerms, interviewIds.length, failedEmailCount); },
                    error: () => { permsDone++; this.checkPermsDone(permsDone, totalPerms, interviewIds.length, failedEmailCount); }
                  });
                } else {
                  // Pas de permission campaign → accorder VIEW_EVALUATIONS par défaut
                  this.entityPermissionService.grant(userId, 'INTERVIEW', interviewId, 'VIEW_EVALUATIONS').subscribe({
                    next: () => { permsDone++; this.checkPermsDone(permsDone, totalPerms, interviewIds.length, failedEmailCount); },
                    error: () => { permsDone++; this.checkPermsDone(permsDone, totalPerms, interviewIds.length, failedEmailCount); }
                  });
                }
              } else {
                // Évaluateur supplémentaire → seulement VIEW_EVALUATIONS
                this.entityPermissionService.grant(userId, 'INTERVIEW', interviewId, 'VIEW_EVALUATIONS').subscribe({
                  next: () => { permsDone++; this.checkPermsDone(permsDone, totalPerms, interviewIds.length, failedEmailCount); },
                  error: () => { permsDone++; this.checkPermsDone(permsDone, totalPerms, interviewIds.length, failedEmailCount); }
                });
              }
            });
          });

          // Si pas de permissions à copier, terminer directement
          if (totalPerms === 0) {
            this.loading.set(false);
            alert(this.buildInterviewCreationSuccessMessage(interviewIds.length, failedEmailCount));
            this.router.navigate(['/dashboard/interviews']);
          }
        },
        error: (error) => {
          console.error('❌ Erreur lors de la création des participants:', error);
          alert('Entretiens créés mais erreur lors de l\'ajout des participants');
          this.loading.set(false);
          this.router.navigate(['/dashboard/interviews']);
        }
      });
    } else {
      this.loading.set(false);
      alert(this.buildInterviewCreationSuccessMessage(interviewIds.length, failedEmailCount));
      this.router.navigate(['/dashboard/interviews']);
    }
  }

  /**
   * Vérifie si toutes les permissions d'entité ont été copiées
   */
  private checkPermsDone(done: number, total: number, interviewCount: number, failedEmailCount = 0): void {
    if (done >= total) {
      this.loading.set(false);
      alert(this.buildInterviewCreationSuccessMessage(interviewCount, failedEmailCount));
      this.router.navigate(['/dashboard/interviews']);
    }
  }

  private buildInterviewCreationSuccessMessage(interviewCount: number, failedEmailCount: number): string {
    if (!this.sendEmail()) {
      return `${interviewCount} entretien(s) créé(s) avec succès sans envoi d'emails !`;
    }

    if (failedEmailCount > 0) {
      return `${interviewCount} entretien(s) créé(s) avec succès, mais ${failedEmailCount} convocation(s) n'ont pas pu être envoyée(s). Vous pourrez les renvoyer depuis la liste des entretiens.`;
    }

    return `${interviewCount} entretien(s) créé(s) avec succès avec envoi d'emails !`;
  }

  /**
   * Annule et retourne à la liste
   */
  cancel(): void {
    this.router.navigate(['/dashboard/interviews']);
  }

  /**
   * Formate la date et l'heure
   */
  formatDateTime(date: string, time: string): string {
    if (!date || !time) return 'Non défini';
    
    try {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year} à ${time}`;
    } catch (e) {
      return 'Non défini';
    }
  }

  /**
   * Obtient le nom complet d'un candidat
   */
  getCandidateName(app: Application): string {
    return `${app.candidateFirstName || ''} ${app.candidateLastName || ''}`.trim() || 'Candidat';
  }

  /**
   * Obtient le nom complet d'un évaluateur
   */
  getEvaluatorName(user: User): string {
    if (!user) return 'Utilisateur';
    
    // Essayer firstName/lastName en premier, puis prenom/nom
    const firstName = user.firstName || user.prenom || '';
    const lastName = user.lastName || user.nom || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    if (fullName) return fullName;
    if (user.username) return user.username;
    return user.email || 'Utilisateur';
  }

  /**
   * Obtient les initiales d'un nom
   */
  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
}
