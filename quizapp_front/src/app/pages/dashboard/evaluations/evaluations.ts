import { Component, OnInit, OnDestroy, signal, computed, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, interval, forkJoin } from 'rxjs';
import { EvaluationService, Evaluation, EvaluationItem, CandidateInterview } from '../../../core/services/evaluation.service';
import { EntityPermissionService } from '../../../core/services/entity-permission.service';
import { InterviewAdminService, InterviewEvaluationEvaluator } from '../../../core/services/interview-admin.service';
import { InterviewParticipantService, InterviewParticipant } from '../../../core/services/interview-participant.service';
import { EntityPermission } from '../../../core/models/permission.interfaces';
import { ApplicationService, Application } from '../../../core/services/application.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { InterviewService } from '../../../core/services/interview.service';
import { CampaignService } from '../../../core/services/campaign.service';
import {
  deriveCandidateMark as deriveEvaluationCandidateMark,
  formatEvaluationItemValue as formatEvaluationItemDisplayValue,
  getEvaluationItemLabel as getEvaluationItemDisplayLabel,
  getEvaluationItemNote as getEvaluationItemDisplayNote,
  hasDerivedCandidateMark as hasDerivedEvaluationCandidateMark,
  isScoreCriterion as isScoreEvaluationCriterion,
  resolveCandidateMark as resolveEvaluationCandidateMark
} from '../../../core/utils/evaluation-score.utils';
import { FilterCheckboxComponent } from '../../../shared/filter-checkbox/filter-checkbox';

interface EvaluatorInfo extends InterviewEvaluationEvaluator {
  evaluation?: EvaluationMessage;
}

interface EvaluationMessage {
  id?: number;
  evaluatorId: number;
  evaluatorName: string;
  evaluatorInitials: string;
  mark: number; // Sur 100
  comment: string;
  createdAt: string;
  isCurrentUser: boolean;
  evaluationItems: EvaluationItem[];
}

interface CandidateInfo {
  applicationId: number;
  candidateInterviewId?: number;
  name: string;
  email: string;
  quizScore?: number;
}

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent],
  templateUrl: './evaluations.html',
  styleUrl: './evaluations.scss'
})
export class EvaluationsComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  
  private destroy$ = new Subject<void>();
  private pollingInterval = 5000; // 5 secondes pour le polling
  private interviewAdminService = inject(InterviewAdminService);

  // Route params
  evaluationsLink = signal<string | null>(null);
  interviewId = signal<number | null>(null);

  // Data
  interview = signal<any>(null);
  candidate = signal<CandidateInfo | null>(null);
  evaluators = signal<EvaluatorInfo[]>([]);
  evaluationMessages = signal<EvaluationMessage[]>([]);
  
  // UI State
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);
  
  // Form - Note sur 100
  newMark = signal<number>(50);
  newComment = signal<string>('');
  availableEvaluationCriteria = signal<EvaluationItem[]>([]);
  newEvaluationItems = signal<EvaluationItem[]>([]);
  
  // Mode édition
  editingEvaluationId = signal<number | null>(null);
  editMark = signal<number>(50);
  editComment = signal<string>('');
  editEvaluationItems = signal<EvaluationItem[]>([]);
  
  // Modal de confirmation pour terminer l'entretien
  showFinishModal = signal(false);
  finishModalTitle = signal('');
  finishModalMessage = signal('');
  finishModalWarning = signal(false);
  pendingEvaluators = signal<string[]>([]);
  
  // Permission
  canEvaluate = signal(false);
  hasAlreadyEvaluated = signal(false);
  currentUserId = signal<number>(0);
  currentUserName = signal<string>('');
  isCurrentUserAdmin = signal(false); // L'utilisateur courant est admin de la campagne
  isCurrentUserCreator = signal(false); // L'utilisateur courant est créateur de la campagne
  campaignAccesses = signal<any[]>([]); // Accès de la campagne
  
  // Présence en ligne - stocke l'ID du participant pour l'utilisateur courant
  currentUserParticipantId = signal<number | null>(null);

  // Computed
  averageScore = computed(() => {
    const messages = this.evaluationMessages();
    if (messages.length === 0) return 0;
    const total = messages.reduce((sum, m) => sum + m.mark, 0);
    return Math.round(total / messages.length);
  });

  totalScore = computed(() => {
    const messages = this.evaluationMessages();
    return messages.reduce((sum, m) => sum + m.mark, 0);
  });

  evaluationCount = computed(() => this.evaluationMessages().length);

  // Nombre d'évaluateurs qui ont terminé
  finishedEvaluatorsCount = computed(() => 
    this.evaluators().filter(e => e.hasFinished).length
  );

  totalEvaluatorsCount = computed(() => this.evaluators().length);

  // L'utilisateur peut terminer l'évaluation (admin ou créateur)
  canFinishEvaluation = computed(() => 
    this.isCurrentUserAdmin() || this.isCurrentUserCreator()
  );

  onlineEvaluators = computed(() => 
    this.evaluators().filter(e => e.isOnline)
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluationService: EvaluationService,
    private entityPermissionService: EntityPermissionService,
    private interviewParticipantService: InterviewParticipantService,
    private interviewService: InterviewService,
    private applicationService: ApplicationService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private campaignService: CampaignService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      this.currentUserId.set(parseInt(currentUser.id));
      this.currentUserName.set(`${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim());
    }

    // Récupérer les paramètres de route
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const link = params.get('link');
      if (link) {
        this.evaluationsLink.set(link);
        this.loadInterviewByLink(link);
      }
    });

    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const interviewIdStr = params.get('interviewId');
      if (interviewIdStr) {
        const id = parseInt(interviewIdStr);
        this.interviewId.set(id);
        this.loadInterviewById(id);
      }
    });

    // Démarrer le polling pour les mises à jour en temps réel
    this.startPolling();
  }

  ngOnDestroy(): void {
    // Marquer l'utilisateur comme offline avant de quitter
    this.markUserOffline();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Marque l'utilisateur courant comme en ligne
   * Note: Utilise sendPresencePing pour ne pas toucher à hasFinished
   */
  private markUserOnline(): void {
    const crudId = this.currentUserParticipantId();
    if (!crudId) return;

    // Utiliser sendPresencePing qui met juste isOnline=true et lastPingAt
    // sans toucher à hasFinished
    this.interviewParticipantService.sendPresencePing(crudId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => console.error('Erreur mise à jour statut online:', err)
      });
  }

  /**
   * Marque l'utilisateur courant comme hors ligne
   * Note: Ne modifie PAS hasFinished pour ne pas écraser la valeur en BD
   */
  private markUserOffline(): void {
    const crudId = this.currentUserParticipantId();
    if (!crudId) return;

    this.interviewParticipantService.markOffline(crudId)
      .subscribe({
        error: (err) => console.error('Erreur mise à jour statut offline:', err)
      });
  }

  /**
   * Envoie un ping de présence pour maintenir le statut en ligne
   * Note: Ne modifie PAS hasFinished pour ne pas écraser la valeur en BD
   */
  private sendPresencePing(): void {
    const crudId = this.currentUserParticipantId();
    if (!crudId) return;

    this.interviewParticipantService.sendPresencePing(crudId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => console.error('Erreur ping présence:', err)
      });
  }

  /**
   * Démarre le polling pour récupérer les nouvelles évaluations et maintenir la présence
   */
  private startPolling(): void {
    interval(this.pollingInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const intId = this.interviewId();
        if (intId && !this.loading()) {
          // Envoyer un ping de présence
          this.sendPresencePing();
          
          // Rafraîchir les évaluations et les statuts des évaluateurs
          this.refreshEvaluations();
          this.refreshEvaluatorsStatus();
        }
      });
  }

  /**
   * Rafraîchit les statuts isOnline et hasFinished des évaluateurs depuis le backend
   */
  private refreshEvaluatorsStatus(): void {
    const intId = this.interviewId();
    if (!intId) return;

    this.interviewParticipantService.getByInterviewId(intId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.hasError && response.items) {
            const participants = response.items as InterviewParticipant[];
            this.evaluators.set(
              this.interviewAdminService.refreshEvaluationRosterStatuses(
                this.evaluators(),
                participants,
                this.currentUserId()
              ) as EvaluatorInfo[]
            );
          }
        },
        error: (err) => console.error('Erreur refresh évaluateurs:', err)
      });
  }

  /**
   * Charge l'entretien par son lien d'évaluation
   */
  loadInterviewByLink(link: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.evaluationService.getInterviewByEvaluationsLink(link)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.hasError && response.items && response.items.length > 0) {
            const interview = response.items[0];
            this.interview.set(interview);
            this.interviewId.set(interview.id);
            this.loadFullData(interview.id, interview);
          } else {
            this.error.set('Entretien non trouvé');
            this.loading.set(false);
          }
        },
        error: (err) => {
          console.error('Erreur lors du chargement de l\'entretien:', err);
          this.error.set('Erreur lors du chargement de l\'entretien');
          this.loading.set(false);
        }
      });
  }

  /**
   * Charge l'entretien par son ID
   */
  loadInterviewById(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.interviewService.getInterviewById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (!response.hasError && response.items && response.items.length > 0) {
            const interview = response.items[0];
            this.interview.set(interview);
            this.loadFullData(id, interview);
          } else {
            this.error.set('Entretien non trouvé');
            this.loading.set(false);
          }
        },
        error: (err: any) => {
          console.error('Erreur:', err);
          this.error.set('Erreur lors du chargement');
          this.loading.set(false);
        }
      });
  }

  /**
   * Charge toutes les données nécessaires
   */
  private loadFullData(interviewId: number, interview: any): void {
    const campaignId = interview?.campaignId;
    
    // Charger permissions, participants et accès campagne en parallèle
    forkJoin({
      permissions: this.entityPermissionService.getForEntity('INTERVIEW', interviewId),
      participants: this.interviewParticipantService.getByInterviewId(interviewId),
      campaignAccesses: campaignId 
        ? this.campaignService.getCampaignAccess(campaignId)
        : Promise.resolve([])
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ permissions, participants, campaignAccesses }) => {
          // Stocker les accès campagne
          this.campaignAccesses.set(campaignAccesses || []);
          
          // Déterminer si l'utilisateur courant est admin/créateur
          const currentUserId = this.currentUserId();
          const currentUserAccess = (campaignAccesses || []).find((a: any) => a.userId === currentUserId);
          this.isCurrentUserAdmin.set(currentUserAccess?.isAdmin || false);
          this.isCurrentUserCreator.set(currentUserAccess?.isCreator || false);
          
          const perms = permissions.items || [];
          const parts = participants.items || [];

          this.interviewAdminService.buildEvaluationRoster(
            perms,
            parts,
            campaignAccesses || [],
            currentUserId
          ).pipe(takeUntil(this.destroy$)).subscribe({
            next: (roster) => {
              if (!roster.canCurrentUserEvaluate) {
                this.error.set('Vous n\'avez pas la permission d\'évaluer cet entretien.');
                this.loading.set(false);
                return;
              }

              this.canEvaluate.set(true);
              this.currentUserParticipantId.set(roster.currentUserParticipantId);
              this.evaluators.set(roster.evaluators as EvaluatorInfo[]);
              this.markUserOnline();
              this.loadCandidate(interview);
            },
            error: (err) => {
              console.error('Erreur lors de la préparation des évaluateurs:', err);
              this.error.set('Erreur lors du chargement des évaluateurs');
              this.loading.set(false);
            }
          });
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.error.set('Erreur lors du chargement des évaluateurs');
          this.loading.set(false);
        }
      });
  }

  /**
   * Charge les infos du candidat
   */
  private loadCandidate(interview: any): void {
    const applicationId = interview?.applicationId;
    
    if (!applicationId) {
      this.loading.set(false);
      return;
    }

    this.applicationService.getApplicationsByCriteria({ id: applicationId } as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.hasError && response.items?.length > 0) {
            const app = response.items[0];
            this.candidate.set({
              applicationId: applicationId,
              name: `${app.candidateFirstName || ''} ${app.candidateLastName || ''}`.trim() || 'Candidat',
              email: app.candidateEmail || '',
              quizScore: app.aggregatedQuizScorePercent
            });
          }
          
          // Charger ou créer le candidate_interview puis les évaluations
          this.loadOrCreateCandidateInterview(interview.id, applicationId);
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading.set(false);
        }
      });
  }

  /**
   * Charge ou crée un candidate_interview
   */
  private loadOrCreateCandidateInterview(interviewId: number, applicationId: number): void {
    this.evaluationService.getCandidateInterviewsByInterviewId(interviewId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          let candidateInterview = response.items?.find((ci: any) => 
            ci.applicationId === applicationId
          );
          
          if (candidateInterview?.id) {
            const cand = this.candidate();
            if (cand) {
              cand.candidateInterviewId = candidateInterview.id;
              this.candidate.set({ ...cand });
            }
            this.loadEvaluations(candidateInterview.id);
          } else {
            // Créer le candidate_interview
            this.evaluationService.createCandidateInterview({
              interviewId,
              applicationId
            }).pipe(takeUntil(this.destroy$)).subscribe({
              next: (createResponse) => {
                if (!createResponse.hasError && createResponse.items?.[0]) {
                  const createdCandidateInterviewId = createResponse.items[0].id;
                  const cand = this.candidate();
                  if (cand) {
                    cand.candidateInterviewId = createdCandidateInterviewId;
                    this.candidate.set({ ...cand });
                  }
                  if (createdCandidateInterviewId) {
                    this.loadEvaluations(createdCandidateInterviewId);
                  } else {
                    this.loading.set(false);
                  }
                } else {
                  this.loading.set(false);
                }
              },
              error: () => this.loading.set(false)
            });
          }
        },
        error: () => this.loading.set(false)
      });
  }

  /**
   * Charge les évaluations existantes
   */
  private loadEvaluations(candidateInterviewId: number): void {
    forkJoin({
      evaluationsResponse: this.evaluationService.getEvaluationsByCandidateInterviewId(candidateInterviewId),
      criteria: this.evaluationService.getEvaluationCriteria(candidateInterviewId, this.currentUserId())
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ evaluationsResponse, criteria }) => {
          const criteriaDrafts = this.buildEvaluationItemDrafts(criteria);
          this.availableEvaluationCriteria.set(criteriaDrafts);
          this.newEvaluationItems.set(criteriaDrafts);

          if (!evaluationsResponse.hasError && evaluationsResponse.items) {
            const messages = evaluationsResponse.items
              .filter((e: any) => !e.isDeleted)
              .map((e: any) => this.evaluationToMessage(e));
            
            this.evaluationMessages.set(messages);
            
            // Vérifier si l'utilisateur courant a déjà évalué
            const hasEvaluated = messages.some(m => m.evaluatorId === this.currentUserId());
            this.hasAlreadyEvaluated.set(hasEvaluated);
            
            // Mettre à jour le statut des évaluateurs
            this.updateEvaluatorsStatus(messages);
          } else {
            this.evaluationMessages.set([]);
            this.hasAlreadyEvaluated.set(false);
            this.updateEvaluatorsStatus([]);
          }
          this.loading.set(false);
          this.scrollToBottom();
        },
        error: () => this.loading.set(false)
      });
  }

  /**
   * Rafraîchit les évaluations (pour le polling)
   */
  private refreshEvaluations(): void {
    const cand = this.candidate();
    if (!cand?.candidateInterviewId) return;

    this.evaluationService.getEvaluationsByCandidateInterviewId(cand.candidateInterviewId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.hasError && response.items) {
            const currentCount = this.evaluationMessages().length;
            const messages = response.items
              .filter((e: any) => !e.isDeleted)
              .map((e: any) => this.evaluationToMessage(e));
            
            if (messages.length > currentCount) {
              this.evaluationMessages.set(messages);
              this.updateEvaluatorsStatus(messages);
              this.scrollToBottom();
              
              // Notification pour nouvelle évaluation
              const newMessages = messages.slice(currentCount);
              newMessages.forEach(m => {
                if (!m.isCurrentUser) {
                  this.notificationService.info(
                    'Nouvelle évaluation',
                    `${m.evaluatorName} a donné une note de ${m.mark}/100`
                  );
                }
              });
            }
          }
        }
      });
  }

  /**
   * Convertit une évaluation en message de chat
   */
  private evaluationToMessage(evaluation: Evaluation): EvaluationMessage {
    const evaluator = this.evaluators().find(e => e.id === evaluation.createdBy);
    const isCurrentUser = evaluation.createdBy === this.currentUserId();
    const mark = this.resolveCandidateMark(evaluation.evaluationItems ?? [], evaluation.globalScore);
    
    return {
      id: evaluation.id,
      evaluatorId: evaluation.createdBy || 0,
      evaluatorName: evaluator 
        ? `${evaluator.firstName} ${evaluator.lastName}`.trim()
        : `Évaluateur #${evaluation.createdBy}`,
      evaluatorInitials: evaluator 
        ? this.getInitials(`${evaluator.firstName} ${evaluator.lastName}`)
        : '??',
      mark: mark ?? 0,
      comment: evaluation.globalComment || '',
      createdAt: evaluation.createdAt || '',
      isCurrentUser,
      evaluationItems: evaluation.evaluationItems ?? []
    };
  }

  /**
   * Met à jour le statut des évaluateurs (a évalué ou non)
   */
  private updateEvaluatorsStatus(messages: EvaluationMessage[]): void {
    const evaluatedIds = new Set(messages.map(m => m.evaluatorId));
    const updated = this.evaluators().map(e => ({
      ...e,
      hasEvaluated: evaluatedIds.has(e.id),
      evaluation: messages.find(m => m.evaluatorId === e.id)
    }));
    this.evaluators.set(updated);
  }

  /**
   * Soumet une nouvelle évaluation
   */
  submitEvaluation(): void {
    console.log('🚀 submitEvaluation() appelée');
    
    const cand = this.candidate();
    console.log('📋 Candidat:', cand);
    console.log('📋 candidateInterviewId:', cand?.candidateInterviewId);
    
    if (!cand?.candidateInterviewId) {
      console.error('❌ Pas de candidateInterviewId');
      this.notificationService.error('Erreur', 'Impossible de soumettre l\'évaluation - Pas de candidateInterviewId');
      return;
    }

    if (this.hasAlreadyEvaluated()) {
      console.warn('⚠️ Déjà évalué');
      this.notificationService.warning('Attention', 'Vous avez déjà soumis une évaluation');
      return;
    }

    const mark = this.resolveCandidateMark(this.newEvaluationItems(), this.newMark());
    const comment = this.newComment().trim();
    console.log('📝 Note:', mark, 'Commentaire:', comment);

    if (mark === null) {
      this.notificationService.warning('Attention', 'Veuillez renseigner au moins un score pour calculer la note globale');
      return;
    }

    if (!comment) {
      console.warn('⚠️ Pas de commentaire');
      this.notificationService.warning('Attention', 'Veuillez ajouter un commentaire');
      return;
    }

    this.submitting.set(true);

    const evaluation: Evaluation = {
      candidateInterviewId: cand.candidateInterviewId,
      interviewParticipantId: this.currentUserParticipantId() ?? undefined,
      globalScore: mark,
      globalComment: comment,
      evaluationItems: this.serializeEvaluationItems(this.newEvaluationItems())
    };
    console.log('📤 Envoi évaluation:', evaluation, 'par utilisateur:', this.currentUserId());

    this.evaluationService.createEvaluation(evaluation, this.currentUserId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (!response.hasError && response.items?.[0]) {
            const newEval = response.items[0];
            
            // Ajouter le message au chat
            const message: EvaluationMessage = {
              id: newEval.id,
              evaluatorId: this.currentUserId(),
              evaluatorName: this.currentUserName(),
              evaluatorInitials: this.getInitials(this.currentUserName()),
              mark: mark,
              comment: comment,
              createdAt: new Date().toISOString(),
              isCurrentUser: true,
              evaluationItems: evaluation.evaluationItems ?? []
            };

            this.evaluationMessages.update(msgs => [...msgs, message]);
            this.hasAlreadyEvaluated.set(true);
            this.updateEvaluatorsStatus([...this.evaluationMessages()]);
            
            // Reset form
            this.newMark.set(50);
            this.newComment.set('');
            this.newEvaluationItems.set(this.buildEvaluationItemDrafts(this.availableEvaluationCriteria()));
            
            this.notificationService.success('Succès', 'Votre évaluation a été enregistrée');
            this.scrollToBottom();
          } else {
            this.notificationService.error('Erreur', response.status?.message || 'Erreur inconnue');
          }
          this.submitting.set(false);
        },
        error: (err: any) => {
          console.error('Erreur:', err);
          this.notificationService.error('Erreur', 'Impossible d\'enregistrer l\'évaluation');
          this.submitting.set(false);
        }
      });
  }

  /**
   * Démarre l'édition d'une évaluation
   */
  startEditEvaluation(message: EvaluationMessage): void {
    if (!message.isCurrentUser || !message.id) return;
    
    this.editingEvaluationId.set(message.id);
    this.editMark.set(message.mark);
    this.editComment.set(message.comment);
    this.editEvaluationItems.set(this.buildEvaluationItemDrafts(this.availableEvaluationCriteria(), message.evaluationItems));
  }

  /**
   * Annule l'édition
   */
  cancelEditEvaluation(): void {
    this.editingEvaluationId.set(null);
    this.editMark.set(50);
    this.editComment.set('');
    this.editEvaluationItems.set([]);
  }

  /**
   * Sauvegarde les modifications d'une évaluation
   */
  saveEditEvaluation(): void {
    const evaluationId = this.editingEvaluationId();
    if (!evaluationId) return;

    const mark = this.resolveCandidateMark(this.editEvaluationItems(), this.editMark());
    const comment = this.editComment().trim();

    if (mark === null) {
      this.notificationService.warning('Attention', 'Veuillez renseigner au moins un score pour calculer la note globale');
      return;
    }

    if (!comment) {
      this.notificationService.warning('Attention', 'Le commentaire ne peut pas être vide');
      return;
    }

    this.submitting.set(true);

    const cand = this.candidate();
    const evaluation: Evaluation = {
      id: evaluationId,
      candidateInterviewId: cand?.candidateInterviewId,
      interviewParticipantId: this.currentUserParticipantId() ?? undefined,
      globalScore: mark,
      globalComment: comment,
      evaluationItems: this.serializeEvaluationItems(this.editEvaluationItems())
    };

    this.evaluationService.updateEvaluation(evaluation, this.currentUserId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (!response.hasError) {
            // Mettre à jour le message dans la liste
            this.evaluationMessages.update(msgs => 
              msgs.map(m => m.id === evaluationId 
                ? {
                    ...m,
                    mark,
                    comment,
                    createdAt: new Date().toISOString(),
                    evaluationItems: evaluation.evaluationItems ?? []
                  }
                : m
              )
            );
            
            // Réinitialiser hasFinished à false
            this.resetHasFinished();
            
            this.cancelEditEvaluation();
            this.notificationService.success('Succès', 'Évaluation modifiée');
          } else {
            this.notificationService.error('Erreur', response.status?.message || 'Erreur inconnue');
          }
          this.submitting.set(false);
        },
        error: () => {
          this.notificationService.error('Erreur', 'Impossible de modifier l\'évaluation');
          this.submitting.set(false);
        }
      });
  }

  /**
   * Supprime une évaluation
   */
  deleteEvaluation(message: EvaluationMessage): void {
    if (!message.isCurrentUser || !message.id) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer votre évaluation ?')) {
      return;
    }

    this.submitting.set(true);

    this.evaluationService.deleteEvaluation(message.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (!response.hasError) {
            // Retirer le message de la liste
            this.evaluationMessages.update(msgs => msgs.filter(m => m.id !== message.id));
            this.hasAlreadyEvaluated.set(false);
            this.updateEvaluatorsStatus(this.evaluationMessages());
            
            // Réinitialiser hasFinished à false
            this.resetHasFinished();
            
            this.notificationService.success('Succès', 'Évaluation supprimée');
          } else {
            this.notificationService.error('Erreur', response.status?.message || 'Erreur inconnue');
          }
          this.submitting.set(false);
        },
        error: () => {
          this.notificationService.error('Erreur', 'Impossible de supprimer l\'évaluation');
          this.submitting.set(false);
        }
      });
  }

  /**
   * Réinitialise hasFinished à false pour l'utilisateur courant
   */
  private resetHasFinished(): void {
    const crudId = this.currentUserParticipantId();
    if (!crudId) return;

    // Mettre hasFinished à false avec la méthode dédiée
    this.interviewParticipantService.updateHasFinished(crudId, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Mettre à jour l'état local
          this.evaluators.update(evals => 
            evals.map(e => e.id === this.currentUserId() 
              ? { ...e, hasFinished: false } 
              : e
            )
          );
        },
        error: (err) => console.error('Erreur réinitialisation hasFinished:', err)
      });
  }

  /**
   * Termine l'évaluation et met à jour l'entretien
   */
  finishEvaluation(): void {
    const interv = this.interview();
    if (!interv?.id) return;

    // Vérifier si tous les évaluateurs ont terminé
    const evaluatorsNotFinished = this.evaluators().filter(e => !e.hasFinished);
    const allFinished = evaluatorsNotFinished.length === 0;

    if (!allFinished) {
      // Il y a des évaluateurs qui n'ont pas terminé
      const names = evaluatorsNotFinished.map(e => `${e.firstName} ${e.lastName}`);
      this.pendingEvaluators.set(names);
      this.finishModalTitle.set('Évaluateurs en attente');
      this.finishModalMessage.set('Les évaluateurs suivants n\'ont pas encore terminé leur évaluation :');
      this.finishModalWarning.set(true);
    } else {
      // Tous ont terminé
      this.pendingEvaluators.set([]);
      this.finishModalTitle.set('Clôturer l\'entretien');
      this.finishModalMessage.set('Tous les évaluateurs ont terminé leur évaluation. Voulez-vous clôturer l\'entretien ?');
      this.finishModalWarning.set(false);
    }

    this.showFinishModal.set(true);
  }

  /**
   * Ferme la modal de confirmation
   */
  closeFinishModal(): void {
    this.showFinishModal.set(false);
  }

  /**
   * Confirme la finalisation depuis la modal
   */
  confirmFinishEvaluation(): void {
    console.log('🔴 confirmFinishEvaluation called');
    this.showFinishModal.set(false);
    this.doFinishEvaluation();
  }

  /**
   * Exécute la finalisation de l'entretien
   * Appelle le nouvel endpoint /finish qui calcule automatiquement les scores
   */
  private doFinishEvaluation(): void {
    const interv = this.interview();
    console.log('🔴 doFinishEvaluation called - interview:', interv, 'userId:', this.currentUserId());
    if (!interv?.id) {
      console.log('🔴 No interview id, returning');
      return;
    }

    this.loading.set(true);
    console.log('🔴 Calling finishInterview API...');
    
    // Appeler le nouvel endpoint qui calcule tout côté backend
    this.interviewService.finishInterview(interv.id, this.currentUserId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('📤 finishInterview response:', response);
          if (!response.hasError && response.items?.[0]) {
            this.notificationService.success(
              'Entretien terminé',
              'L\'entretien est terminé et les scores ont été mis à jour'
            );
            this.router.navigate(['/dashboard/evaluations']);
          } else {
            this.notificationService.error('Erreur', response.status?.message || 'Erreur inconnue');
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.notificationService.error('Erreur', 'Impossible de terminer l\'entretien');
          this.loading.set(false);
        }
      });
  }

  /**
   * Formate une date pour le backend
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
   * Scroll vers le bas du chat
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer?.nativeElement) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  /**
   * Retourne à la liste des entretiens
   */
  goBack(): void {
    this.router.navigate(['/dashboard/interviews']);
  }

  /**
   * Marque un évaluateur comme ayant terminé son évaluation
   * Seul l'utilisateur courant peut changer son propre statut
   */
  toggleEvaluatorFinished(evaluatorId: number): void {
    // Sécurité: seul l'utilisateur courant peut changer son propre statut
    if (evaluatorId !== this.currentUserId()) {
      return;
    }

    const evaluators = this.evaluators();
    const evaluator = evaluators.find(e => e.id === evaluatorId);
    if (!evaluator) return;

    const newHasFinished = !evaluator.hasFinished;
    
    // Mettre à jour localement d'abord pour une réponse immédiate
    const updated = evaluators.map(e => {
      if (e.id === evaluatorId) {
        return { ...e, hasFinished: newHasFinished };
      }
      return e;
    });
    this.evaluators.set(updated);

    // Persister au backend avec la méthode dédiée
    const crudId = this.currentUserParticipantId();
    if (crudId) {
      this.interviewParticipantService.updateHasFinished(crudId, newHasFinished)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success(
              'Statut mis à jour',
              newHasFinished ? 'Vous avez marqué votre évaluation comme terminée' : 'Statut remis à en cours'
            );
          },
          error: (err) => {
            console.error('Erreur mise à jour statut:', err);
            // Annuler le changement local en cas d'erreur
            const revert = this.evaluators().map(e => {
              if (e.id === evaluatorId) {
                return { ...e, hasFinished: !newHasFinished };
              }
              return e;
            });
            this.evaluators.set(revert);
            this.notificationService.error('Erreur', 'Impossible de mettre à jour le statut');
          }
        });
    }
  }

  /**
   * Marque l'évaluateur courant comme ayant terminé
   */
  markCurrentUserFinished(): void {
    this.toggleEvaluatorFinished(this.currentUserId());
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
   * Obtient la classe CSS pour un score
   */
  getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  }

  getCandidateMarkLabel(items: EvaluationItem[]): string {
    return this.hasDerivedCandidateMark(items) ? 'Score derive /100' : 'Note /100';
  }

  getDisplayedNewMark(): number | null {
    return this.resolveCandidateMark(this.newEvaluationItems(), this.hasDerivedCandidateMark(this.newEvaluationItems()) ? null : this.newMark());
  }

  getDisplayedEditMark(): number | null {
    return this.resolveCandidateMark(this.editEvaluationItems(), this.hasDerivedCandidateMark(this.editEvaluationItems()) ? null : this.editMark());
  }

  isCandidateMarkDerived(items: EvaluationItem[]): boolean {
    return this.hasDerivedCandidateMark(items);
  }

  isCandidateMarkPending(items: EvaluationItem[]): boolean {
    return this.hasDerivedCandidateMark(items) && this.deriveCandidateMark(items) === null;
  }

  isScoreCriterion(item: EvaluationItem): boolean {
    return isScoreEvaluationCriterion(item);
  }

  trackEvaluationItem(index: number, item: EvaluationItem): number | string {
    return item.id ?? item.pipelineStageEvaluationCriterionId ?? index;
  }

  getEvaluationItemLabel(item: EvaluationItem): string {
    return getEvaluationItemDisplayLabel(item);
  }

  formatEvaluationItemValue(item: EvaluationItem): string {
    return formatEvaluationItemDisplayValue(item);
  }

  getEvaluationItemNote(item: EvaluationItem): string | null {
    return getEvaluationItemDisplayNote(item);
  }

  updateNewEvaluationItemScore(index: number, rawValue: string): void {
    this.newEvaluationItems.update(items => this.patchEvaluationItems(items, index, {
      scoreValue: this.parseScoreValue(rawValue)
    }));
  }

  updateNewEvaluationItemText(index: number, rawValue: string): void {
    this.newEvaluationItems.update(items => this.patchEvaluationItems(items, index, {
      textValue: rawValue
    }));
  }

  updateEditEvaluationItemScore(index: number, rawValue: string): void {
    this.editEvaluationItems.update(items => this.patchEvaluationItems(items, index, {
      scoreValue: this.parseScoreValue(rawValue)
    }));
  }

  updateEditEvaluationItemText(index: number, rawValue: string): void {
    this.editEvaluationItems.update(items => this.patchEvaluationItems(items, index, {
      textValue: rawValue
    }));
  }

  private buildEvaluationItemDrafts(criteria: EvaluationItem[], existingItems: EvaluationItem[] = []): EvaluationItem[] {
    const sourceItems = criteria.length > 0 ? criteria : existingItems;
    const existingByCriterionId = new Map<number, EvaluationItem>();
    existingItems.forEach(item => {
      if (item.pipelineStageEvaluationCriterionId !== undefined && item.pipelineStageEvaluationCriterionId !== null) {
        existingByCriterionId.set(item.pipelineStageEvaluationCriterionId, item);
      }
    });

    return sourceItems.map(item => {
      const existing = item.pipelineStageEvaluationCriterionId !== undefined && item.pipelineStageEvaluationCriterionId !== null
        ? existingByCriterionId.get(item.pipelineStageEvaluationCriterionId)
        : undefined;
      return {
        ...item,
        id: existing?.id ?? item.id,
        criterionOrder: existing?.criterionOrder ?? item.criterionOrder,
        label: existing?.label ?? item.label,
        criterionType: existing?.criterionType ?? item.criterionType,
        weightSnapshot: existing?.weightSnapshot ?? item.weightSnapshot,
        maxScoreSnapshot: existing?.maxScoreSnapshot ?? item.maxScoreSnapshot,
        scoreValue: existing?.scoreValue ?? item.scoreValue,
        textValue: existing?.textValue ?? item.textValue ?? ''
      };
    });
  }

  private serializeEvaluationItems(items: EvaluationItem[]): EvaluationItem[] {
    const serializedItems: EvaluationItem[] = [];
    items.forEach(item => {
      const trimmedText = item.textValue?.trim() || '';
      const hasScore = item.scoreValue !== undefined && item.scoreValue !== null;
      const hasText = trimmedText.length > 0;
      if (!item.pipelineStageEvaluationCriterionId || (!hasScore && !hasText)) {
        return;
      }
      serializedItems.push({
        ...item,
        textValue: hasText ? trimmedText : undefined
      });
    });
    return serializedItems;
  }

  private hasDerivedCandidateMark(items: EvaluationItem[]): boolean {
    return hasDerivedEvaluationCandidateMark(items);
  }

  private resolveCandidateMark(items: EvaluationItem[], fallbackMark?: number | null): number | null {
    return resolveEvaluationCandidateMark(items, fallbackMark);
  }

  private deriveCandidateMark(items: EvaluationItem[]): number | null {
    return deriveEvaluationCandidateMark(items);
  }

  private patchEvaluationItems(items: EvaluationItem[], index: number, patch: Partial<EvaluationItem>): EvaluationItem[] {
    return items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);
  }

  private parseScoreValue(rawValue: string): number | undefined {
    const trimmed = rawValue.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsedValue = Number(trimmed);
    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  /**
   * Formate la date pour l'affichage
   */
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      if (dateStr.includes('/')) {
        const parts = dateStr.split(' ');
        const dateParts = parts[0].split('/');
        const timeParts = parts[1]?.split(':') || ['00', '00'];
        return `${dateParts[0]}/${dateParts[1]} à ${timeParts[0]}:${timeParts[1]}`;
      }
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }
}
