import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';
import { Interview, InterviewService } from '../../../core/services/interview.service';
import { Application, ApplicationService } from '../../../core/services/application.service';
import { Campaign, CampaignService } from '../../../core/services/campaign.service';
import { EntityPermissionService } from '../../../core/services/entity-permission.service';
import { EntityPermission } from '../../../core/models/permission.interfaces';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserService } from '../../../core/services/user.service';
import { APPLICATION_STATUS } from '../../../core/constants/application-status.constants';
import { CandidateInterviewEntity, CandidateInterviewEntityService } from '../../../core/services/candidate-interview-entity.service';
import { InterviewParticipant, InterviewParticipantService } from '../../../core/services/interview-participant.service';

interface InterviewWithDetails extends Interview {
  candidateName?: string;
  candidateEmail?: string;
  campaignTitle?: string;
  applicationId?: number;
  candidateFirstName?: string;
  candidateLastName?: string;
  quizScorePercent?: number;
  candidateInterviewId?: number;
  declineReason?: string | null;
  alternativeDateRequested?: string | null;
  candidateResponseState?: 'RESCHEDULE_REQUESTED' | 'DECLINED' | null;
}

interface InterviewEditFormData {
  interviewDate: string;
  interviewTime: string;
  interviewLocation: string;
  meetLink: string;
  interviewNote: string;
  sendEmail: boolean;
  selectedEvaluatorIds: number[];
}

interface EvaluatorInfo {
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  canEvaluate: boolean;
}

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interviews.html',
  styleUrl: './interviews.scss'
})
export class InterviewsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Signals
  interviews = signal<InterviewWithDetails[]>([]);
  applications = signal<Application[]>([]);
  campaigns = signal<Map<number, Campaign>>(new Map());
  candidateInterviews = signal<CandidateInterviewEntity[]>([]);
  loading = signal(false);
  searchTerm = signal('');
  selectedFilter = signal<'ALL' | 'SCHEDULED' | 'STARTED' | 'OVER' | 'PENDING' | 'POSTPONED'>('ALL');
  selectedInterview = signal<InterviewWithDetails | null>(null);
  
  // Modal de création/édition - Désactivé, on utilise une page dédiée maintenant
  showInterviewModal = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  editingInterview = signal<InterviewWithDetails | null>(null);

  // Modal de confirmation démarrage entretien (2 étapes)
  showStartConfirmModal = signal(false);
  startConfirmStep = signal<1 | 2>(1);
  interviewToStart = signal<InterviewWithDetails | null>(null);
  evaluatorsForInterview = signal<EvaluatorInfo[]>([]);
  loadingEvaluators = signal(false);
  showInterviewEditModal = signal(false);
  interviewToEdit = signal<InterviewWithDetails | null>(null);
  savingInterview = signal(false);
  editAvailableEvaluators = signal<EvaluatorInfo[]>([]);
  loadingEditEvaluators = signal(false);
  editCampaignPermissions = signal<EntityPermission[]>([]);
  editFormData = signal<InterviewEditFormData>({
    interviewDate: '',
    interviewTime: '',
    interviewLocation: '',
    meetLink: '',
    interviewNote: '',
    sendEmail: false,
    selectedEvaluatorIds: []
  });

  // Calendar view
  viewMode = signal<'list' | 'calendar'>('list');
  calendarView = signal<'year' | 'month' | 'day'>('month');
  selectedYear = signal(new Date().getFullYear());
  selectedMonth = signal(new Date().getMonth());
  selectedDay = signal<Date | null>(null);
  currentDate = new Date();

  constructor(
    private interviewService: InterviewService,
    private applicationService: ApplicationService,
    private campaignService: CampaignService,
    private entityPermissionService: EntityPermissionService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private userService: UserService,
    private candidateInterviewEntityService: CandidateInterviewEntityService,
    private interviewParticipantService: InterviewParticipantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Computed - Interviews filtrées
   */
  filteredInterviews = computed(() => {
    const query = this.searchTerm().toLowerCase();
    const filter = this.selectedFilter();
    let items = this.interviews();

    // Filtre par statut
    if (filter !== 'ALL') {
      items = items.filter(interview => interview.interviewStatus === filter);
    }

    // Recherche textuelle
    if (query) {
      items = items.filter(interview =>
        (interview.candidateName || '').toLowerCase().includes(query) ||
        (interview.candidateEmail || '').toLowerCase().includes(query) ||
        (interview.campaignTitle || '').toLowerCase().includes(query) ||
        (interview.interviewLocation || '').toLowerCase().includes(query) ||
        (interview.meetLink || '').toLowerCase().includes(query) ||
        (interview.alternativeDateRequested || '').toLowerCase().includes(query) ||
        (interview.declineReason || '').toLowerCase().includes(query)
      );
    }

    return items.sort((a, b) => {
      const priorityA = a.interviewStatus === 'POSTPONED' ? 1 : 0;
      const priorityB = b.interviewStatus === 'POSTPONED' ? 1 : 0;
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }

      const dateA = a.interviewDate ? new Date(a.interviewDate).getTime() : 0;
      const dateB = b.interviewDate ? new Date(b.interviewDate).getTime() : 0;
      return dateB - dateA;
    });
  });

  /**
   * Computed - Applications éligibles pour un entretien
   */
  eligibleApplications = computed(() => {
    return this.applications().filter(app => 
      app.applicationStatus === APPLICATION_STATUS.PRE_SCREEN_ACCEPTED || 
      app.applicationStatus === APPLICATION_STATUS.INTERVIEWING
    );
  });

  /**
   * Charge toutes les données
   */
  loadData(): void {
    this.loading.set(true);

    forkJoin({
      interviews: this.interviewService.getAllInterviews(),
      applications: this.applicationService.getApplicationsByCriteria({}),
      campaigns: this.campaignService.getAllCampaignsByCriteria({ isDeleted: false }),
      candidateInterviews: this.candidateInterviewEntityService.getAllByCriteria({ size: 9999, isDeleted: false })
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        const candidateInterviewItems = response.candidateInterviews.content || [];
        this.candidateInterviews.set(candidateInterviewItems);

        // Traiter les campaigns
        const campaignsData = (response.campaigns as any).items || response.campaigns.content;
        if (campaignsData) {
          const campaignsMap = new Map<number, Campaign>();
          campaignsData.forEach((campaign: Campaign) => {
            if (campaign.id) {
              campaignsMap.set(campaign.id, campaign);
            }
          });
          this.campaigns.set(campaignsMap);
        }

        // Traiter les applications
        if (response.applications.items) {
          this.applications.set(response.applications.items);
        }

        // Enrichir et traiter les interviews
        if (response.interviews.items) {
          this.enrichInterviews(response.interviews.items, candidateInterviewItems);
        }

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données:', error);
        this.loading.set(false);
      }
    });
  }

  /**
   * Enrichit les interviews avec les données des candidats et campagnes
   */
  enrichInterviews(interviews: Interview[], candidateInterviews: CandidateInterviewEntity[] = this.candidateInterviews()): void {
    const enriched: InterviewWithDetails[] = interviews.map(interview => {
      // Trouver l'application correspondante via applicationId
      const application = this.applications().find(app => app.id === interview.applicationId);
      const campaign = interview.campaignId ? this.campaigns().get(interview.campaignId) : undefined;
      const candidateInterview = this.findCandidateInterview(interview, candidateInterviews);

      return {
        ...interview,
        candidateName: application ? 
          `${application.candidateFirstName || ''} ${application.candidateLastName || ''}`.trim() : 
          'Candidat inconnu',
        candidateEmail: application?.candidateEmail,
        campaignTitle: campaign?.campaignTitle || campaign?.campaignName,
        applicationId: application?.id,
        candidateFirstName: application?.candidateFirstName,
        candidateLastName: application?.candidateLastName,
        quizScorePercent: application?.quizScorePercent,
        candidateInterviewId: candidateInterview?.id,
        declineReason: candidateInterview?.declineReason || null,
        alternativeDateRequested: candidateInterview?.alternativeDateRequested || null,
        candidateResponseState: this.resolveCandidateResponseState(candidateInterview)
      };
    });

    this.interviews.set(enriched);
  }

  private findCandidateInterview(interview: Interview, candidateInterviews: CandidateInterviewEntity[]): CandidateInterviewEntity | undefined {
    const matches = candidateInterviews.filter(candidateInterview => candidateInterview.interviewId === interview.id);
    if (!matches.length) {
      return undefined;
    }
    if (interview.applicationId) {
      return matches.find(candidateInterview => candidateInterview.applicationId === interview.applicationId) || matches[0];
    }
    return matches[0];
  }

  private resolveCandidateResponseState(candidateInterview?: CandidateInterviewEntity): 'RESCHEDULE_REQUESTED' | 'DECLINED' | null {
    if (!candidateInterview) {
      return null;
    }
    if (candidateInterview.alternativeDateRequested) {
      return 'RESCHEDULE_REQUESTED';
    }
    if (candidateInterview.declineReason) {
      return 'DECLINED';
    }
    return null;
  }

  /**
   * Sélectionne une interview
   */
  selectInterview(interview: InterviewWithDetails): void {
    this.selectedInterview.set(interview);
  }

  /**
   * Définit le filtre actif
   */
  setFilter(filter: 'ALL' | 'SCHEDULED' | 'STARTED' | 'OVER' | 'PENDING' | 'POSTPONED'): void {
    this.selectedFilter.set(filter);
  }

  /**
   * Ouvre la page de création
   */
  openCreateModal(): void {
    this.router.navigate(['/dashboard/interviews/create']);
  }

  /**
   * Ouvre la page d'édition
   */
  openEditModal(interview: InterviewWithDetails): void {
    const { date, time } = this.splitDateTime(interview.interviewDate || '');
    this.interviewToEdit.set(interview);
    this.editAvailableEvaluators.set([]);
    this.editCampaignPermissions.set([]);
    this.editFormData.set({
      interviewDate: date,
      interviewTime: time,
      interviewLocation: interview.interviewLocation || '',
      meetLink: interview.meetLink || '',
      interviewNote: interview.interviewNote || '',
      sendEmail: interview.interviewStatus === 'POSTPONED'
        || Boolean(interview.alternativeDateRequested)
        || interview.interviewMailSent === false,
      selectedEvaluatorIds: []
    });
    this.showInterviewEditModal.set(true);
    this.loadEditEvaluators(interview);
  }

  closeInterviewEditModal(): void {
    if (this.savingInterview()) {
      return;
    }
    this.showInterviewEditModal.set(false);
    this.interviewToEdit.set(null);
    this.editAvailableEvaluators.set([]);
    this.editCampaignPermissions.set([]);
    this.loadingEditEvaluators.set(false);
  }

  updateEditForm(patch: Partial<InterviewEditFormData>): void {
    this.editFormData.update(current => ({ ...current, ...patch }));
  }

  submitInterviewUpdate(): void {
    const interview = this.interviewToEdit();
    const form = this.editFormData();

    if (!interview?.id) {
      return;
    }
    if (!form.interviewDate || !form.interviewTime) {
      this.notificationService.error('Replanification', 'Veuillez renseigner une date et une heure.');
      return;
    }
    if (interview.interviewType === 'IN_PERSON' && !form.interviewLocation.trim()) {
      this.notificationService.error('Replanification', 'Veuillez renseigner le lieu de l\'entretien.');
      return;
    }
    if (interview.interviewType === 'ONLINE' && !form.meetLink.trim()) {
      this.notificationService.error('Replanification', 'Veuillez renseigner le lien de visioconférence.');
      return;
    }

    const updatedInterview: Interview = {
      id: interview.id,
      applicationId: interview.applicationId,
      campaignId: interview.campaignId,
      interviewType: interview.interviewType,
      interviewDate: `${form.interviewDate.split('-').reverse().join('/')} ${form.interviewTime}`,
      interviewStatus: interview.interviewStatus === 'POSTPONED' ? 'SCHEDULED' : interview.interviewStatus,
      interviewNote: form.interviewNote.trim() || interview.interviewNote
    };

    if (interview.interviewType === 'IN_PERSON') {
      updatedInterview.interviewLocation = form.interviewLocation.trim();
    }
    if (interview.interviewType === 'ONLINE') {
      updatedInterview.meetLink = form.meetLink.trim();
    }
    if (form.sendEmail) {
      updatedInterview.interviewMailSent = true;
    }

    this.savingInterview.set(true);
    this.loading.set(true);
    this.interviewService.updateInterview(updatedInterview).subscribe({
      next: (response) => {
        if (!response.hasError) {
          const invitationRequested = Boolean(form.sendEmail);
          const invitationDeliveryFailed = invitationRequested && (
            response.items?.[0]?.interviewMailSent === false
            || Boolean(response.status?.message && response.status.message !== 'Opération effectuée avec succès')
          );

          this.syncInterviewEvaluators(interview, form.selectedEvaluatorIds, (syncFailed) => {
            this.finishInterviewEdit(invitationRequested, invitationDeliveryFailed, syncFailed);
          });
        } else {
          this.notificationService.error('Replanification', response.status.message || 'La mise à jour a échoué.');
          this.loading.set(false);
          this.savingInterview.set(false);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de l\'entretien:', error);
        this.notificationService.error('Replanification', 'Impossible de mettre à jour l\'entretien.');
        this.loading.set(false);
        this.savingInterview.set(false);
      }
    });
  }

  toggleEditEvaluator(userId: number): void {
    this.editFormData.update(current => {
      const selectedEvaluatorIds = current.selectedEvaluatorIds.includes(userId)
        ? current.selectedEvaluatorIds.filter(id => id !== userId)
        : [...current.selectedEvaluatorIds, userId];

      return { ...current, selectedEvaluatorIds };
    });
  }

  isEditEvaluatorSelected(userId: number): boolean {
    return this.editFormData().selectedEvaluatorIds.includes(userId);
  }

  private loadEditEvaluators(interview: InterviewWithDetails): void {
    if (!interview.id) {
      return;
    }

    this.loadingEditEvaluators.set(true);

    const campaignPermissions$ = interview.campaignId
      ? this.entityPermissionService.getForEntity('CAMPAIGN', interview.campaignId)
      : of({ items: [] } as { items: EntityPermission[] });

    forkJoin({
      interviewPermissions: this.entityPermissionService.getForEntity('INTERVIEW', interview.id),
      campaignPermissions: campaignPermissions$
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ interviewPermissions, campaignPermissions }) => {
        const grantedCampaignPermissions = (campaignPermissions.items || []).filter(permission => permission.granted);
        this.editCampaignPermissions.set(grantedCampaignPermissions);

        const selectedEvaluatorIds = this.extractGrantedPermissionUserIds(interviewPermissions.items || [], 'VIEW_EVALUATIONS');
        const campaignEvaluatorIds = this.extractGrantedPermissionUserIds(grantedCampaignPermissions, 'EVALUATE');
        const userIds = [...new Set([...campaignEvaluatorIds, ...selectedEvaluatorIds])];

        this.updateEditForm({ selectedEvaluatorIds });

        if (userIds.length === 0) {
          this.loadingEditEvaluators.set(false);
          return;
        }

        const userRequests = userIds.map(userId => this.userService.getById(userId));
        forkJoin(userRequests).pipe(takeUntil(this.destroy$)).subscribe({
          next: (users) => {
            const selectedSet = new Set(selectedEvaluatorIds);
            const campaignSet = new Set(campaignEvaluatorIds);
            const evaluators = userIds.map((userId, index) => {
              const user = users[index];
              return {
                userId,
                firstName: user?.firstName || user?.prenom || '',
                lastName: user?.lastName || user?.nom || '',
                email: user?.email || '',
                canEvaluate: campaignSet.has(userId)
              };
            }).sort((left, right) => {
              const leftSelected = selectedSet.has(left.userId) ? 1 : 0;
              const rightSelected = selectedSet.has(right.userId) ? 1 : 0;
              if (leftSelected !== rightSelected) {
                return rightSelected - leftSelected;
              }

              const leftCampaign = campaignSet.has(left.userId) ? 1 : 0;
              const rightCampaign = campaignSet.has(right.userId) ? 1 : 0;
              if (leftCampaign !== rightCampaign) {
                return rightCampaign - leftCampaign;
              }

              return this.getEvaluatorFullName(left).localeCompare(this.getEvaluatorFullName(right));
            });

            this.editAvailableEvaluators.set(evaluators);
            this.loadingEditEvaluators.set(false);
          },
          error: (error) => {
            console.error('Erreur lors du chargement des évaluateurs éditables:', error);
            this.editAvailableEvaluators.set(userIds.map(userId => ({
              userId,
              canEvaluate: campaignEvaluatorIds.includes(userId)
            })));
            this.loadingEditEvaluators.set(false);
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des évaluateurs de l\'entretien:', error);
        this.loadingEditEvaluators.set(false);
      }
    });
  }

  private extractGrantedPermissionUserIds(permissions: EntityPermission[], permissionKey: string): number[] {
    const normalizedPermissionKey = permissionKey.toUpperCase();
    return [...new Set(
      permissions
        .filter(permission => permission.granted && (permission.permissionKey || '').toUpperCase() === normalizedPermissionKey)
        .map(permission => permission.userId)
        .filter((userId): userId is number => Boolean(userId))
    )];
  }

  private getCampaignPermissionKeysForUser(userId: number): string[] {
    return [...new Set(
      this.editCampaignPermissions()
        .filter(permission => permission.userId === userId && permission.granted && permission.permissionKey)
        .map(permission => permission.permissionKey!)
    )];
  }

  private syncInterviewEvaluators(
    interview: InterviewWithDetails,
    selectedEvaluatorIds: number[],
    onComplete: (syncFailed: boolean) => void
  ): void {
    if (!interview.id) {
      onComplete(false);
      return;
    }

    const normalizedSelectedEvaluatorIds = [...new Set(selectedEvaluatorIds)];

    forkJoin({
      participants: this.interviewParticipantService.getAllByCriteria({ interviewId: interview.id, size: 100 }),
      interviewPermissions: this.entityPermissionService.getForEntity('INTERVIEW', interview.id)
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ participants, interviewPermissions }) => {
        const participantItems = participants.content || [];
        const grantedInterviewPermissions = (interviewPermissions.items || []).filter(permission => permission.granted);
        const selectedSet = new Set(normalizedSelectedEvaluatorIds);
        const existingParticipantUserIds = new Set(participantItems.map(participant => participant.userId));
        const currentEvaluatorIds = this.extractGrantedPermissionUserIds(grantedInterviewPermissions, 'VIEW_EVALUATIONS');
        const currentEvaluatorSet = new Set(currentEvaluatorIds);

        const participantCreates: InterviewParticipant[] = normalizedSelectedEvaluatorIds
          .filter(userId => !existingParticipantUserIds.has(userId))
          .map(userId => ({ interviewId: interview.id!, userId }));

        const participantsToDelete = participantItems
          .filter(participant => !selectedSet.has(participant.userId) && participant.id)
          .map(participant => participant.id!)
          .filter((participantId, index, self) => self.indexOf(participantId) === index);

        const usersToRemove = currentEvaluatorIds.filter(userId => !selectedSet.has(userId));
        const requests: Array<ReturnType<EntityPermissionService['grant']> | ReturnType<InterviewParticipantService['entityDelete']> | ReturnType<InterviewParticipantService['createParticipants']>> = [];

        if (participantCreates.length > 0) {
          requests.push(this.interviewParticipantService.createParticipants(participantCreates));
        }

        participantsToDelete.forEach(participantId => {
          requests.push(this.interviewParticipantService.entityDelete(participantId));
        });

        usersToRemove.forEach(userId => {
          const permissionKeys = [...new Set(
            grantedInterviewPermissions
              .filter(permission => permission.userId === userId && permission.permissionKey)
              .map(permission => permission.permissionKey!)
          )];

          permissionKeys.forEach(permissionKey => {
            requests.push(this.entityPermissionService.revoke(userId, 'INTERVIEW', interview.id!, permissionKey));
          });
        });

        normalizedSelectedEvaluatorIds.forEach(userId => {
          const targetPermissionKeys = this.getCampaignPermissionKeysForUser(userId);
          if (targetPermissionKeys.length === 0) {
            targetPermissionKeys.push('VIEW_EVALUATIONS');
          }

          const currentPermissionKeys = new Set(
            grantedInterviewPermissions
              .filter(permission => permission.userId === userId && permission.permissionKey)
              .map(permission => permission.permissionKey!)
          );

          targetPermissionKeys
            .filter(permissionKey => !currentPermissionKeys.has(permissionKey))
            .forEach(permissionKey => {
              requests.push(this.entityPermissionService.grant(userId, 'INTERVIEW', interview.id!, permissionKey));
            });

          if (!existingParticipantUserIds.has(userId) && !currentEvaluatorSet.has(userId) && participantCreates.every(participant => participant.userId !== userId)) {
            requests.push(this.interviewParticipantService.createParticipants([{ interviewId: interview.id!, userId }]));
          }
        });

        if (requests.length === 0) {
          onComplete(false);
          return;
        }

        forkJoin(requests).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => onComplete(false),
          error: (error) => {
            console.error('Erreur lors de la synchronisation des évaluateurs:', error);
            onComplete(true);
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de la préparation de la synchronisation des évaluateurs:', error);
        onComplete(true);
      }
    });
  }

  private finishInterviewEdit(invitationRequested: boolean, invitationDeliveryFailed: boolean, syncFailed: boolean): void {
    if (syncFailed) {
      this.notificationService.warning(
        'Entretien mis à jour',
        invitationDeliveryFailed
          ? 'Le créneau a été enregistré, mais la convocation n\'a pas pu être envoyée et la synchronisation des évaluateurs a échoué. Vérifiez les affectations avant de réessayer.'
          : 'Le créneau a été mis à jour, mais la synchronisation des évaluateurs a échoué. Vérifiez les affectations avant de démarrer l\'entretien.'
      );
    } else if (invitationDeliveryFailed) {
      this.notificationService.warning(
        'Entretien mis à jour',
        'Le créneau a été enregistré, mais la convocation n\'a pas pu être envoyée. Vous pouvez réessayer depuis la liste des entretiens.'
      );
    } else {
      this.notificationService.success(
        'Entretien mis à jour',
        invitationRequested
          ? 'Le créneau a été mis à jour, la convocation a été renvoyée et les évaluateurs ont été resynchronisés.'
          : 'Le créneau et les évaluateurs ont été mis à jour.'
      );
    }

    this.savingInterview.set(false);
    this.closeInterviewEditModal();
    this.selectedInterview.set(null);
    this.loadData();
  }

  rejectRescheduleRequest(interview: InterviewWithDetails): void {
    if (!interview.id || interview.candidateResponseState !== 'RESCHEDULE_REQUESTED') {
      return;
    }

    const confirmed = confirm(
      'Refuser cette demande de replanification va annuler ce créneau et clôturer la demande candidat. Continuer ?'
    );
    if (!confirmed) {
      return;
    }

    const updatedInterview: Interview = {
      id: interview.id,
      interviewType: interview.interviewType,
      interviewStatus: 'ARCHIVED',
      interviewNote: interview.interviewNote
    };

    this.loading.set(true);
    this.interviewService.updateInterview(updatedInterview).subscribe({
      next: (response) => {
        if (!response.hasError) {
          this.notificationService.success(
            'Demande refusée',
            'La demande de replanification a été refusée et l\'entretien a été archivé.'
          );
          this.selectedInterview.set(null);
          this.loadData();
        } else {
          this.notificationService.error(
            'Refus de replanification',
            response.status.message || 'Le refus de la demande a échoué.'
          );
          this.loading.set(false);
        }
      },
      error: (error) => {
        console.error('Erreur lors du refus de la replanification:', error);
        this.notificationService.error(
          'Refus de replanification',
          'Impossible de refuser la demande de replanification.'
        );
        this.loading.set(false);
      }
    });
  }

  /**
   * Change le statut d'une interview
   * Pour STARTED, ouvre la modale de confirmation en 2 étapes
   */
  changeStatus(interview: InterviewWithDetails, newStatus: string): void {
    if (!interview.id) return;

    // Si on veut démarrer l'entretien, on ouvre la modale de confirmation
    if (newStatus === 'STARTED') {
      this.openStartConfirmation(interview);
      return;
    }

    // Pour les autres statuts, on procède directement
    this.updateInterviewStatus(interview, newStatus);
  }

  /**
   * Ouvre la modale de confirmation pour démarrer un entretien
   */
  openStartConfirmation(interview: InterviewWithDetails): void {
    this.interviewToStart.set(interview);
    this.startConfirmStep.set(1);
    this.showStartConfirmModal.set(true);
    this.evaluatorsForInterview.set([]);
  }

  /**
   * Ferme la modale de confirmation
   */
  closeStartConfirmModal(): void {
    this.showStartConfirmModal.set(false);
    this.interviewToStart.set(null);
    this.startConfirmStep.set(1);
    this.evaluatorsForInterview.set([]);
  }

  /**
   * Retourne à l'étape 1 de la confirmation
   */
  goBackToStep1(): void {
    this.startConfirmStep.set(1);
  }

  /**
   * Confirme la première étape (vérification de la date)
   * Charge ensuite les évaluateurs pour la deuxième étape
   */
  confirmStep1(): void {
    const interview = this.interviewToStart();
    if (!interview?.id) return;

    // Éviter les appels multiples
    if (this.loadingEvaluators()) return;

    this.loadingEvaluators.set(true);
    
    // Charger les évaluateurs de cet entretien
    this.entityPermissionService.getForEntity('INTERVIEW', interview.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.hasError && response.items && response.items.length > 0) {
            const evaluatorPerms = response.items.filter((p: EntityPermission) => p.permissionKey === 'VIEW_EVALUATIONS' && p.granted);
            
            // Dédupliquer par userId
            const uniquePerms = evaluatorPerms.filter((p: EntityPermission, index: number, self: EntityPermission[]) =>
              index === self.findIndex(c => c.userId === p.userId)
            );
            
            if (uniquePerms.length === 0) {
              this.evaluatorsForInterview.set([]);
              this.startConfirmStep.set(2);
              this.loadingEvaluators.set(false);
              return;
            }

            // Charger les détails de chaque utilisateur
            const userRequests = uniquePerms.map((p: EntityPermission) => 
              this.userService.getById(p.userId!)
            );

            forkJoin(userRequests).pipe(takeUntil(this.destroy$)).subscribe({
              next: (users) => {
                const evaluators: EvaluatorInfo[] = uniquePerms.map((p: EntityPermission, index: number) => {
                  const user = users[index];
                  return {
                    userId: p.userId!,
                    firstName: user?.firstName || user?.prenom || '',
                    lastName: user?.lastName || user?.nom || '',
                    email: user?.email || '',
                    canEvaluate: true
                  };
                });
                this.evaluatorsForInterview.set(evaluators);
                this.startConfirmStep.set(2);
                this.loadingEvaluators.set(false);
              },
              error: (error) => {
                console.error('Erreur lors du chargement des détails utilisateurs:', error);
                const evaluators: EvaluatorInfo[] = uniquePerms.map((p: EntityPermission) => ({
                  userId: p.userId!,
                  canEvaluate: true
                }));
                this.evaluatorsForInterview.set(evaluators);
                this.startConfirmStep.set(2);
                this.loadingEvaluators.set(false);
              }
            });
          } else {
            // Aucun évaluateur
            this.evaluatorsForInterview.set([]);
            this.startConfirmStep.set(2);
            this.loadingEvaluators.set(false);
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement des évaluateurs:', error);
          // On passe quand même à l'étape 2 même sans évaluateurs
          this.startConfirmStep.set(2);
          this.loadingEvaluators.set(false);
        }
      });
  }

  /**
   * Confirme la deuxième étape et démarre l'entretien
   * Crée les notifications pour les évaluateurs et change le statut
   */
  confirmStep2AndStart(): void {
    const interview = this.interviewToStart();
    if (!interview?.id) return;

    // Éviter les appels multiples
    if (this.loading()) return;

    this.loading.set(true);
    
    // Fermer le modal immédiatement pour éviter les doubles clics
    this.closeStartConfirmModal();
    
    const evaluators = this.evaluatorsForInterview();
    const currentUser = this.authService.getCurrentUser();
    const currentUserId = currentUser ? parseInt(currentUser.id) : 1;

    // Créer les notifications pour les évaluateurs (dédupliquées)
    if (evaluators.length > 0) {
      // Dédupliquer par userId au cas où
      const uniqueEvaluators = evaluators.filter((eval_, index, self) =>
        index === self.findIndex(e => e.userId === eval_.userId)
      );
      
      // Construire le lien d'évaluation
      const evaluationLink = interview.interviewEvaluationsLink 
        ? `/dashboard/evaluate/${interview.interviewEvaluationsLink}`
        : `/dashboard/evaluate?interviewId=${interview.id}`;

      const notifications = uniqueEvaluators.map(evaluator => ({
        notifType: 'INTERVIEW_STARTED',
        notifActor: currentUserId,
        notifLink: evaluationLink,
        userId: evaluator.userId,
        objectTableName: 'interviews',
        objectTableId: interview.id!
      }));

      this.notificationService.createMultipleDbNotifications(notifications)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('✅ Notifications envoyées aux évaluateurs');
            // Maintenant changer le statut de l'entretien
            this.updateInterviewStatus(interview, 'STARTED');
          },
          error: (error) => {
            console.error('❌ Erreur lors de l\'envoi des notifications:', error);
            // On change quand même le statut même si les notifications échouent
            this.updateInterviewStatus(interview, 'STARTED');
          }
        });
    } else {
      // Pas d'évaluateurs, on change directement le statut
      this.updateInterviewStatus(interview, 'STARTED');
    }
  }

  /**
   * Met à jour le statut d'une interview (méthode interne)
   * Ajoute startedAt si le statut passe à STARTED, endedAt si le statut passe à OVER
   */
  private updateInterviewStatus(interview: InterviewWithDetails, newStatus: string): void {
    const now = new Date();
    // Format dd/MM/yyyy HH:mm:ss pour le backend
    const formattedNow = this.formatDateForBackend(now);
    
    const updated: Interview = {
      ...interview,
      interviewStatus: newStatus as any
    };

    // Ajouter startedAt si on démarre l'entretien
    if (newStatus === 'STARTED') {
      updated.startedAt = formattedNow;
    }
    
    // Ajouter endedAt si on termine l'entretien
    if (newStatus === 'OVER') {
      updated.endedAt = formattedNow;
    }

    this.loading.set(true);
    this.interviewService.updateInterview(updated).subscribe({
      next: (response) => {
        if (!response.hasError) {
          if (newStatus === 'STARTED') {
            this.notificationService.success(
              'Entretien démarré',
              'L\'entretien a été démarré avec succès. Les évaluateurs ont été notifiés.'
            );
          }
          this.loadData();
        } else {
          alert('Erreur: ' + response.status.message);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert('Erreur lors du changement de statut');
        this.loading.set(false);
      }
    });
  }

  /**
   * Formate une date pour le backend (dd/MM/yyyy HH:mm:ss)
   */
  private formatDateForBackend(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Supprime une interview
   */
  deleteInterview(interview: InterviewWithDetails): void {
    if (!interview.id) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet entretien ?')) {
      return;
    }

    this.loading.set(true);
    this.interviewService.deleteInterview(interview.id).subscribe({
      next: (response) => {
        if (!response.hasError) {
          alert('Entretien supprimé avec succès');
          this.selectedInterview.set(null);
          this.loadData();
        } else {
          alert('Erreur: ' + response.status.message);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
        this.loading.set(false);
      }
    });
  }

  /**
   * Évalue un entretien
   * Vérifie d'abord si l'utilisateur courant a le droit d'évaluer (via entity_permission / interview_participant)
   */
  evaluateInterview(interview: InterviewWithDetails): void {
    if (!interview.id) {
      this.notificationService.error('Erreur', 'ID de l\'entretien invalide');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.notificationService.error('Erreur', 'Utilisateur non connecté');
      return;
    }

    const currentUserId = parseInt(currentUser.id);

    // Vérifier si l'utilisateur a le droit d'évaluer cet entretien
    this.loading.set(true);
    this.entityPermissionService.getForEntity('INTERVIEW', interview.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          
          if (!response.hasError && response.items) {
            // Chercher VIEW_EVALUATIONS pour l'utilisateur courant
            const userPerm = response.items.find(
              (p: EntityPermission) => p.userId === currentUserId && p.permissionKey === 'VIEW_EVALUATIONS' && p.granted
            );

            if (userPerm) {
              // L'utilisateur a le droit d'évaluer, ouvrir dans un nouvel onglet
              let url: string;
              if (interview.interviewEvaluationsLink) {
                url = `/dashboard/evaluate/${interview.interviewEvaluationsLink}`;
              } else {
                // Fallback: utiliser l'ID de l'entretien
                url = `/dashboard/evaluate?interviewId=${interview.id}`;
              }
              // Ouvrir dans un nouvel onglet
              window.open(url, '_blank');
            } else {
              // L'utilisateur n'a pas le droit d'évaluer
              this.notificationService.error(
                'Accès refusé', 
                'Vous n\'avez pas la permission d\'évaluer cet entretien.'
              );
            }
          } else {
            this.notificationService.error('Erreur', 'Impossible de vérifier les permissions');
          }
        },
        error: (error) => {
          console.error('Erreur lors de la vérification des permissions:', error);
          this.loading.set(false);
          this.notificationService.error('Erreur', 'Impossible de vérifier les permissions');
        }
      });
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

  /**
   * Obtient le nom complet d'un évaluateur
   */
  getEvaluatorFullName(evaluator: EvaluatorInfo): string {
    const firstName = evaluator.firstName || '';
    const lastName = evaluator.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || `Évaluateur #${evaluator.userId}`;
  }

  /**
   * Obtient les initiales d'un évaluateur
   */
  getEvaluatorInitials(evaluator: EvaluatorInfo): string {
    const firstName = evaluator.firstName || '';
    const lastName = evaluator.lastName || '';
    
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    } else if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    } else if (lastName) {
      return lastName.substring(0, 2).toUpperCase();
    }
    return '??';
  }

  /**
   * Formate une date pour l'affichage
   * Gère le format dd/MM/yyyy HH:mm du backend
   */
  formatDateTime(date: string | undefined): string {
    if (!date) return 'N/A';
    
    // Si la date est déjà au format dd/MM/yyyy HH:mm, on la retourne directement
    if (date.includes('/')) {
      return date;
    }
    
    // Sinon, essayer de parser comme une date ISO
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return date; // Retourner la chaîne originale si invalide
      }
      return parsedDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return date;
    }
  }

  /**
   * Divise une date en date et heure
   */
  splitDateTime(dateTime: string): { date: string; time: string } {
    if (!dateTime) return { date: '', time: '' };
    
    try {
      // Format attendu: dd/MM/yyyy HH:mm
      const [datePart, timePart] = dateTime.split(' ');
      const [day, month, year] = datePart.split('/');
      return {
        date: `${year}-${month}-${day}`,
        time: (timePart || '').slice(0, 5)
      };
    } catch (e) {
      return { date: '', time: '' };
    }
  }

  /**
   * Obtient le label d'un statut
   */
  getStatusLabel(status: string | undefined): string {
    if (!status) return 'N/A';
    return this.interviewService.getStatusLabel(status);
  }

  /**
   * Obtient la classe CSS d'un statut
   */
  getStatusClass(status: string | undefined): string {
    if (!status) return 'muted';
    return this.interviewService.getStatusClass(status);
  }

  /**
   * Compte les interviews par statut
   */
  getInterviewsByStatus(status: string): number {
    return this.interviews().filter(i => i.interviewStatus === status).length;
  }

  /**
   * Obtient l'icône pour un type d'entretien
   */
  getInterviewTypeIcon(type: string | undefined): string {
    const icons: Record<string, string> = {
      'IN_PERSON': 'bi-building',
      'ONLINE': 'bi-camera-video'
    };
    return icons[type || 'IN_PERSON'] || 'bi-calendar-check';
  }

  /**
   * Obtient le libellé pour un type d'entretien
   */
  getInterviewTypeLabel(type: string | undefined): string {
    const labels: Record<string, string> = {
      'IN_PERSON': 'En présentiel',
      'ONLINE': 'En ligne'
    };
    return labels[type || 'IN_PERSON'] || 'Non spécifié';
  }

  /**
   * Obtient la classe CSS pour le statut d'envoi d'email
   */
  getEmailStatusClass(sent: boolean | undefined): string {
    return sent ? 'email-sent' : 'email-pending';
  }

  /**
   * Obtient le libellé pour le statut d'envoi d'email
   */
  getEmailStatusLabel(sent: boolean | undefined): string {
    return sent ? 'Email envoyé' : 'Email non envoyé';
  }

  hasCandidateResponse(interview: InterviewWithDetails): boolean {
    return Boolean(interview.candidateResponseState);
  }

  getCandidateResponseLabel(interview: InterviewWithDetails): string {
    if (interview.candidateResponseState === 'RESCHEDULE_REQUESTED') {
      return 'Le candidat demande une autre date';
    }
    if (interview.candidateResponseState === 'DECLINED') {
      return 'Le candidat a refusé ce créneau';
    }
    return 'Aucune réponse';
  }

  getCandidateResponseClass(interview: InterviewWithDetails): string {
    if (interview.candidateResponseState === 'RESCHEDULE_REQUESTED') {
      return 'candidate-response-card--warning';
    }
    if (interview.candidateResponseState === 'DECLINED') {
      return 'candidate-response-card--error';
    }
    return '';
  }

  getCandidateResponseIcon(interview: InterviewWithDetails): string {
    if (interview.candidateResponseState === 'RESCHEDULE_REQUESTED') {
      return 'bi-arrow-repeat';
    }
    if (interview.candidateResponseState === 'DECLINED') {
      return 'bi-x-octagon';
    }
    return 'bi-chat-left-text';
  }

  getEditActionLabel(interview: InterviewWithDetails): string {
    return interview.candidateResponseState === 'RESCHEDULE_REQUESTED'
      ? 'Replanifier et renvoyer la convocation'
      : 'Modifier le créneau';
  }

  /**
   * Obtient le nom du candidat d'une application
   */
  getCandidateName(app: Application): string {
    return `${app.candidateFirstName || ''} ${app.candidateLastName || ''}`.trim() || 'Candidat';
  }

  // ===========================
  // CALENDAR METHODS
  // ===========================

  /**
   * Bascule entre vue liste et calendrier
   */
  toggleView(): void {
    this.viewMode.set(this.viewMode() === 'list' ? 'calendar' : 'list');
  }

  /**
   * Change la vue du calendrier
   */
  setCalendarView(view: 'year' | 'month' | 'day'): void {
    this.calendarView.set(view);
  }

  /**
   * Navigation dans le calendrier
   */
  previousYear(): void {
    this.selectedYear.set(this.selectedYear() - 1);
  }

  nextYear(): void {
    this.selectedYear.set(this.selectedYear() + 1);
  }

  previousMonth(): void {
    let month = this.selectedMonth() - 1;
    let year = this.selectedYear();
    if (month < 0) {
      month = 11;
      year--;
      this.selectedYear.set(year);
    }
    this.selectedMonth.set(month);
  }

  nextMonth(): void {
    let month = this.selectedMonth() + 1;
    let year = this.selectedYear();
    if (month > 11) {
      month = 0;
      year++;
      this.selectedYear.set(year);
    }
    this.selectedMonth.set(month);
  }

  /**
   * Sélectionne un jour
   */
  selectDay(date: Date): void {
    this.selectedDay.set(date);
    this.setCalendarView('day');
  }

  /**
   * Retourne au mois en cours
   */
  goToToday(): void {
    const today = new Date();
    this.selectedYear.set(today.getFullYear());
    this.selectedMonth.set(today.getMonth());
    this.selectedDay.set(null);
    this.setCalendarView('month');
  }

  /**
   * Obtient le nom du mois
   */
  getMonthName(monthIndex: number): string {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[monthIndex];
  }

  /**
   * Obtient les jours du mois pour le calendrier
   */
  getCalendarDays(): Date[] {
    const year = this.selectedYear();
    const month = this.selectedMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Jour de la semaine du premier jour (0 = dimanche)
    let startDay = firstDay.getDay();
    // Convertir pour que lundi soit 0
    startDay = startDay === 0 ? 6 : startDay - 1;
    
    const days: Date[] = [];
    
    // Jours du mois précédent
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push(date);
    }
    
    // Jours du mois en cours
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  }

  /**
   * Obtient les interviews d'une date spécifique
   */
  getInterviewsForDate(date: Date): InterviewWithDetails[] {
    return this.interviews().filter(interview => {
      if (!interview.interviewDate) return false;
      const interviewDate = this.parseInterviewDate(interview.interviewDate);
      return interviewDate &&
        interviewDate.getFullYear() === date.getFullYear() &&
        interviewDate.getMonth() === date.getMonth() &&
        interviewDate.getDate() === date.getDate();
    });
  }

  /**
   * Parse une date d'interview (format: dd/MM/yyyy HH:mm)
   */
  parseInterviewDate(dateStr: string): Date | null {
    try {
      const [datePart, timePart] = dateStr.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes] = (timePart || '00:00').split(':');
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );
    } catch (e) {
      return null;
    }
  }

  /**
   * Vérifie si une date est aujourd'hui
   */
  isToday(date: Date): boolean {
    const today = this.currentDate;
    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
  }

  /**
   * Vérifie si une date est dans le mois sélectionné
   */
  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.selectedMonth();
  }

  /**
   * Obtient les interviews groupées par heure pour un jour
   */
  getInterviewsByHour(date: Date): Map<string, InterviewWithDetails[]> {
    const interviews = this.getInterviewsForDate(date);
    const byHour = new Map<string, InterviewWithDetails[]>();
    
    interviews.forEach(interview => {
      if (!interview.interviewDate) return;
      const interviewDate = this.parseInterviewDate(interview.interviewDate);
      if (interviewDate) {
        const hour = interviewDate.getHours();
        const hourKey = `${hour.toString().padStart(2, '0')}:00`;
        if (!byHour.has(hourKey)) {
          byHour.set(hourKey, []);
        }
        byHour.get(hourKey)!.push(interview);
      }
    });
    
    return byHour;
  }

  /**
   * Obtient les mois de l'année
   */
  getMonthsOfYear(): { index: number; name: string; interviewCount: number }[] {
    return Array.from({ length: 12 }, (_, i) => ({
      index: i,
      name: this.getMonthName(i),
      interviewCount: this.getInterviewsForMonth(i).length
    }));
  }

  /**
   * Obtient les interviews d'un mois
   */
  getInterviewsForMonth(monthIndex: number): InterviewWithDetails[] {
    return this.interviews().filter(interview => {
      if (!interview.interviewDate) return false;
      const interviewDate = this.parseInterviewDate(interview.interviewDate);
      return interviewDate &&
        interviewDate.getFullYear() === this.selectedYear() &&
        interviewDate.getMonth() === monthIndex;
    });
  }

  /**
   * Sélectionne un mois depuis la vue année
   */
  selectMonth(monthIndex: number): void {
    this.selectedMonth.set(monthIndex);
    this.setCalendarView('month');
  }
}
