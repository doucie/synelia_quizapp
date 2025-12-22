import { Component, OnInit, OnDestroy, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, interval, forkJoin } from 'rxjs';
import { EvaluationService, Evaluation, CandidateInterview } from '../../../core/services/evaluation.service';
import { InterviewCrudService, InterviewCrud } from '../../../core/services/interview-crud.service';
import { ApplicationService, Application } from '../../../core/services/application.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserService } from '../../../core/services/user.service';
import { InterviewService } from '../../../core/services/interview.service';
import { CampaignService } from '../../../core/services/campaign.service';

interface EvaluatorInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  canEvaluate: boolean;
  isOnline: boolean;
  hasEvaluated: boolean;
  hasFinished: boolean; // Nouveau: a terminé son évaluation
  isAdmin: boolean; // Admin de la campagne
  isCreator: boolean; // Créateur de la campagne
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
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluations.html',
  styleUrl: './evaluations.scss'
})
export class EvaluationsComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  
  private destroy$ = new Subject<void>();
  private pollingInterval = 5000; // 5 secondes pour le polling

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
  
  // Mode édition
  editingEvaluationId = signal<number | null>(null);
  editMark = signal<number>(50);
  editComment = signal<string>('');
  
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
  
  // Présence en ligne - stocke l'interviewCrud de l'utilisateur courant
  currentUserInterviewCrudId = signal<number | null>(null);

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
    private interviewCrudService: InterviewCrudService,
    private interviewService: InterviewService,
    private applicationService: ApplicationService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private userService: UserService,
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
    const crudId = this.currentUserInterviewCrudId();
    if (!crudId) return;

    // Utiliser sendPresencePing qui met juste isOnline=true et lastPingAt
    // sans toucher à hasFinished
    this.interviewCrudService.sendPresencePing(crudId)
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
    const crudId = this.currentUserInterviewCrudId();
    if (!crudId) return;

    this.interviewCrudService.markOffline(crudId)
      .subscribe({
        error: (err) => console.error('Erreur mise à jour statut offline:', err)
      });
  }

  /**
   * Envoie un ping de présence pour maintenir le statut en ligne
   * Note: Ne modifie PAS hasFinished pour ne pas écraser la valeur en BD
   */
  private sendPresencePing(): void {
    const crudId = this.currentUserInterviewCrudId();
    if (!crudId) return;

    this.interviewCrudService.sendPresencePing(crudId)
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

    this.interviewCrudService.getEvaluatorsByInterviewId(intId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.hasError && response.items) {
            const cruds = response.items as InterviewCrud[];
            const now = new Date().getTime();
            const onlineThreshold = 20000; // 20 secondes pour considérer quelqu'un comme en ligne

            // Mettre à jour les évaluateurs existants avec les nouveaux statuts
            const currentEvaluators = this.evaluators();
            const updated = currentEvaluators.map(evaluator => {
              const crud = cruds.find(c => c.userId === evaluator.id);
              if (crud) {
                let isOnline = false;
                
                // Utiliser directement isOnline du backend si disponible
                if (crud.isOnline === true) {
                  // Vérifier si le ping est récent (si lastPingAt existe)
                  if (crud.lastPingAt && crud.lastPingAt !== 'undefined' && crud.lastPingAt !== 'null') {
                    const lastPing = this.parseBackendDate(crud.lastPingAt);
                    if (lastPing) {
                      const diff = now - lastPing.getTime();
                      isOnline = diff < onlineThreshold;
                    } else {
                      isOnline = true; // Pas de lastPingAt parsable, on fait confiance à isOnline
                    }
                  } else {
                    isOnline = true; // isOnline est true mais pas de lastPingAt
                  }
                }
                
                // L'utilisateur courant est toujours en ligne
                if (evaluator.id === this.currentUserId()) {
                  isOnline = true;
                }
                
                // Parser hasFinished - peut être boolean, string "true"/"false", ou 1/0
                const rawHasFinished = crud.hasFinished as any;
                const hasFinished = rawHasFinished === true || rawHasFinished === 'true' || rawHasFinished === 1;
                
                return {
                  ...evaluator,
                  isOnline,
                  hasFinished
                };
              }
              return evaluator;
            });
            
            this.evaluators.set(updated);
          }
        },
        error: (err) => console.error('Erreur refresh évaluateurs:', err)
      });
  }

  /**
   * Parse une date du backend (format dd/MM/yyyy HH:mm:ss ou ISO)
   */
  private parseBackendDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    try {
      if (dateStr.includes('/')) {
        const parts = dateStr.split(' ');
        const dateParts = parts[0].split('/');
        const timeParts = parts[1]?.split(':') || ['00', '00', '00'];
        return new Date(
          parseInt(dateParts[2]), 
          parseInt(dateParts[1]) - 1, 
          parseInt(dateParts[0]),
          parseInt(timeParts[0]),
          parseInt(timeParts[1]),
          parseInt(timeParts[2] || '0')
        );
      }
      return new Date(dateStr);
    } catch {
      return null;
    }
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
    
    // Charger les évaluateurs et les accès campagne en parallèle
    forkJoin({
      evaluators: this.interviewCrudService.getEvaluatorsByInterviewId(interviewId),
      campaignAccesses: campaignId 
        ? this.campaignService.getCampaignAccess(campaignId)
        : Promise.resolve([])
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ evaluators, campaignAccesses }) => {
          // Stocker les accès campagne
          this.campaignAccesses.set(campaignAccesses || []);
          
          // Déterminer si l'utilisateur courant est admin/créateur
          const currentUserId = this.currentUserId();
          const currentUserAccess = (campaignAccesses || []).find((a: any) => a.userId === currentUserId);
          this.isCurrentUserAdmin.set(currentUserAccess?.isAdmin || false);
          this.isCurrentUserCreator.set(currentUserAccess?.isCreator || false);
          
          if (!evaluators.hasError && evaluators.items) {
            this.processEvaluators(evaluators.items, interview, campaignAccesses || []);
          } else {
            this.error.set('Aucun évaluateur trouvé');
            this.loading.set(false);
          }
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.error.set('Erreur lors du chargement des évaluateurs');
          this.loading.set(false);
        }
      });
  }

  /**
   * Traite les évaluateurs et vérifie les permissions
   */
  private processEvaluators(cruds: InterviewCrud[], interview: any, campaignAccesses: any[]): void {
    const currentUserId = this.currentUserId();
    
    // Vérifier si l'utilisateur courant peut évaluer
    const userCrud = cruds.find(c => c.userId === currentUserId && c.canEvaluate);
    if (!userCrud) {
      this.error.set('Vous n\'avez pas la permission d\'évaluer cet entretien.');
      this.loading.set(false);
      return;
    }
    
    this.canEvaluate.set(true);
    
    // Stocker l'ID du crud de l'utilisateur courant pour les mises à jour de statut
    this.currentUserInterviewCrudId.set(userCrud.id ?? null);
    
    // Marquer immédiatement l'utilisateur comme en ligne
    this.markUserOnline();

    // Dédupliquer les cruds par userId avant de charger les détails
    const uniqueCruds = new Map<number, InterviewCrud>();
    cruds.filter(c => c.canEvaluate).forEach(crud => {
      if (!uniqueCruds.has(crud.userId)) {
        uniqueCruds.set(crud.userId, crud);
      }
    });

    // Charger les détails des utilisateurs évaluateurs
    const now = new Date().getTime();
    const onlineThreshold = 15000; // 15 secondes
    
    const evaluatorPromises = Array.from(uniqueCruds.values())
      .map(crud => this.loadEvaluatorDetails(crud, campaignAccesses, now, onlineThreshold));

    Promise.all(evaluatorPromises).then(evaluators => {
      this.evaluators.set(evaluators.filter(e => e !== null) as EvaluatorInfo[]);
      
      // Charger le candidat
      this.loadCandidate(interview);
    });
  }

  /**
   * Charge les détails d'un évaluateur
   */
  private async loadEvaluatorDetails(crud: InterviewCrud, campaignAccesses: any[], now: number, onlineThreshold: number): Promise<EvaluatorInfo | null> {
    // Trouver les accès campagne pour cet utilisateur
    const userAccess = campaignAccesses.find(a => a.userId === crud.userId);
    
    console.log('🔍 loadEvaluatorDetails - crud.userId:', crud.userId);
    console.log('🔍 campaignAccesses:', campaignAccesses);
    console.log('🔍 userAccess trouvé:', userAccess);
    
    const isAdmin = userAccess?.isAdmin === true || userAccess?.isAdmin === 1;
    const isCreator = userAccess?.isCreator === true || userAccess?.isCreator === 1;
    
    console.log('🔍 isAdmin:', isAdmin, 'isCreator:', isCreator);
    
    // Déterminer si l'utilisateur est en ligne basé sur lastPingAt
    let isOnline = false;
    if (crud.userId === this.currentUserId()) {
      isOnline = true; // L'utilisateur courant est toujours en ligne
    } else if (crud.lastPingAt) {
      const lastPing = this.parseBackendDate(crud.lastPingAt);
      if (lastPing) {
        isOnline = (now - lastPing.getTime()) < onlineThreshold;
      }
    }
    
    // Parser hasFinished - peut être boolean, string "true"/"false", ou 1/0
    const rawHasFinished = crud.hasFinished as any;
    const hasFinished = rawHasFinished === true || rawHasFinished === 'true' || rawHasFinished === 1;
    console.log(`🔍 [buildEvaluatorFromCrud] userId=${crud.userId}, hasFinished raw:`, crud.hasFinished, 'parsed:', hasFinished);
    
    return new Promise((resolve) => {
      this.userService.getById(crud.userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (user: any) => {
            resolve({
              id: crud.userId,
              firstName: user?.firstName || user?.prenom || '',
              lastName: user?.lastName || user?.nom || '',
              email: user?.email || '',
              canEvaluate: crud.canEvaluate || false,
              isOnline,
              hasEvaluated: false,
              hasFinished,
              isAdmin,
              isCreator
            });
          },
          error: () => {
            resolve({
              id: crud.userId,
              firstName: 'Évaluateur',
              lastName: `#${crud.userId}`,
              email: '',
              canEvaluate: crud.canEvaluate || false,
              isOnline,
              hasEvaluated: false,
              hasFinished,
              isAdmin,
              isCreator
            });
          }
        });
    });
  }

  /**
   * Charge les infos du candidat
   */
  private loadCandidate(interview: any): void {
    const applicationId = interview?.applicationsId || interview?.applicationId;
    
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
              quizScore: app.quizScorePercent
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
            ci.applicationId === applicationId || ci.applicationsId === applicationId
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
                  const cand = this.candidate();
                  if (cand) {
                    cand.candidateInterviewId = createResponse.items[0].id;
                    this.candidate.set({ ...cand });
                  }
                }
                this.loading.set(false);
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
    this.evaluationService.getEvaluationsByCandidateInterviewId(candidateInterviewId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (!response.hasError && response.items) {
            const messages = response.items
              .filter((e: any) => !e.isDeleted)
              .map((e: any) => this.evaluationToMessage(e));
            
            this.evaluationMessages.set(messages);
            
            // Vérifier si l'utilisateur courant a déjà évalué
            const hasEvaluated = messages.some(m => m.evaluatorId === this.currentUserId());
            this.hasAlreadyEvaluated.set(hasEvaluated);
            
            // Mettre à jour le statut des évaluateurs
            this.updateEvaluatorsStatus(messages);
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
    
    return {
      id: evaluation.id,
      evaluatorId: evaluation.createdBy || 0,
      evaluatorName: evaluator 
        ? `${evaluator.firstName} ${evaluator.lastName}`.trim()
        : `Évaluateur #${evaluation.createdBy}`,
      evaluatorInitials: evaluator 
        ? this.getInitials(`${evaluator.firstName} ${evaluator.lastName}`)
        : '??',
      mark: evaluation.candidateMark || 0,
      comment: evaluation.recruiterComment || '',
      createdAt: evaluation.createdAt || '',
      isCurrentUser
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

    const mark = this.newMark();
    const comment = this.newComment().trim();
    console.log('📝 Note:', mark, 'Commentaire:', comment);

    if (!comment) {
      console.warn('⚠️ Pas de commentaire');
      this.notificationService.warning('Attention', 'Veuillez ajouter un commentaire');
      return;
    }

    this.submitting.set(true);

    const evaluation: Evaluation = {
      candidateInterviewId: cand.candidateInterviewId,
      candidateMark: mark,
      recruiterComment: comment
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
              isCurrentUser: true
            };

            this.evaluationMessages.update(msgs => [...msgs, message]);
            this.hasAlreadyEvaluated.set(true);
            this.updateEvaluatorsStatus([...this.evaluationMessages()]);
            
            // Reset form
            this.newMark.set(50);
            this.newComment.set('');
            
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
  }

  /**
   * Annule l'édition
   */
  cancelEditEvaluation(): void {
    this.editingEvaluationId.set(null);
    this.editMark.set(50);
    this.editComment.set('');
  }

  /**
   * Sauvegarde les modifications d'une évaluation
   */
  saveEditEvaluation(): void {
    const evaluationId = this.editingEvaluationId();
    if (!evaluationId) return;

    const mark = this.editMark();
    const comment = this.editComment().trim();

    if (!comment) {
      this.notificationService.warning('Attention', 'Le commentaire ne peut pas être vide');
      return;
    }

    this.submitting.set(true);

    const cand = this.candidate();
    const evaluation: Evaluation = {
      id: evaluationId,
      candidateInterviewId: cand?.candidateInterviewId,
      candidateMark: mark,
      recruiterComment: comment
    };

    this.evaluationService.updateEvaluation(evaluation, this.currentUserId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (!response.hasError) {
            // Mettre à jour le message dans la liste
            this.evaluationMessages.update(msgs => 
              msgs.map(m => m.id === evaluationId 
                ? { ...m, mark, comment, createdAt: new Date().toISOString() } 
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
    const crudId = this.currentUserInterviewCrudId();
    if (!crudId) return;

    // Mettre hasFinished à false avec la méthode dédiée
    this.interviewCrudService.updateHasFinished(crudId, false)
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
            const updatedInterview = response.items[0];
            this.notificationService.success(
              'Entretien terminé',
              `Score moyen: ${updatedInterview.evaluationPercentage?.toFixed(1) || 0}/5 (${updatedInterview.evaluationNumber || 0} évaluations, total: ${updatedInterview.evaluationScore || 0})`
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
    const crudId = this.currentUserInterviewCrudId();
    if (crudId) {
      this.interviewCrudService.updateHasFinished(crudId, newHasFinished)
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
