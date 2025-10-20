import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, switchMap } from 'rxjs';
import { CampaignService, Campaign } from '../../../core/services/campaign.service';
import { SourceTokenService, SourceToken } from '../../../services/source-token.service';
import { QuestionService, Question } from '../../../core/services/question.service';
import { AnswerService, Answer, QuestionAnswer } from '../../../core/services/answer.service';

interface CampaignAccess {
  id?: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  canUpdate: boolean;
  canDelete: boolean;
  canEvaluate: boolean;
  isAdmin: boolean;
  follow: boolean;
}

interface QuestionWithAnswers extends Question {
  answers?: Answer[];
}

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './campaign-detail.html',
  styleUrls: ['./campaign-detail.scss']
})
export class CampaignDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Référence à window pour le template
  window = window;
  
  campaignId = signal<number | null>(null);
  campaign = signal<Campaign | null>(null);
  recruiters = signal<CampaignAccess[]>([]);
  sourceTokens = signal<SourceToken[]>([]);
  campaignQuestions = signal<QuestionWithAnswers[]>([]);
  availableQuestions = signal<Question[]>([]);
  availableAnswers = signal<Answer[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Token management
  showTokenForm = signal(false);
  newTokenName = signal('');
  tokenLoading = signal(false);
  
  // Question management
  showQuestionForm = signal(false);
  selectedQuestion = signal<number | null>(null);
  selectedAnswers = signal<number[]>([]);
  questionLoading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private campaignService: CampaignService,
    private sourceTokenService: SourceTokenService,
    private questionService: QuestionService,
    private answerService: AnswerService
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
          console.log('  - Marked Out Of:', campaign.markedOutOf);
          console.log('  - All Can Evaluate:', campaign.allCanEvaluate);
          console.log('  - Questions Count:', campaign.questionsCount);
          console.log('  - Applications Count:', campaign.applicationsCount);
          console.log('  - Creator Name:', campaign.creatorName);
          console.log('  - Department Name:', campaign.departmentName);
          console.log('  - Speciality:', campaign.specialityLibelle);
          console.log('  - Created At:', campaign.createdAt);
          
          this.campaign.set(campaign);
          
          // Charger les recruteurs ayant accès à la campagne
          this.loadCampaignRecruiters(id);
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
          
          // Transformer les données pour correspondre à l'interface CampaignAccess
          const recruiters: CampaignAccess[] = accessList.map(access => {
            // Construire le nom complet à partir de userFirstName et userLastName
            const firstName = access.user_first_name || access.userFirstName || '';
            const lastName = access.user_last_name || access.userLastName || '';
            const fullName = `${firstName} ${lastName}`.trim();
            
            return {
              id: access.id,
              userId: access.users_id || access.userId,
              userName: access.user_name || access.userName || fullName || 'Utilisateur inconnu',
              userEmail: access.user_email || access.userEmail,
              userRole: access.user_role || access.userRole,
              canUpdate: access.can_update ?? access.canUpdate ?? false,
              canDelete: access.can_delete ?? access.canDelete ?? false,
              canEvaluate: access.can_evaluate ?? access.canEvaluate ?? false,
              isAdmin: access.is_admin ?? access.isAdmin ?? false,
              follow: access.follow ?? false
            };
          });
          
          console.log('📊 Recruteurs transformés:', recruiters);
          this.recruiters.set(recruiters);
          
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
          
          // Charger les questions de la campagne
          this.loadCampaignQuestions(campaignId);
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des tokens:', error);
          this.sourceTokens.set([]);
          
          // Charger quand même les questions
          this.loadCampaignQuestions(campaignId);
        }
      });
  }

  loadCampaignQuestions(campaignId: number): void {
    console.log('📝 Chargement des questions pour la campagne:', campaignId);
    
    this.campaignService.getCampaignQuestions(campaignId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (questions) => {
          console.log('✅ Questions récupérées:', questions);
          
          // Pour chaque question, charger ses réponses
          if (questions.length === 0) {
            this.campaignQuestions.set([]);
            this.loading.set(false);
            return;
          }

          // Charger les réponses pour toutes les questions en parallèle
          const answerRequests = questions.map(q => 
            this.answerService.getQuestionAnswersByCriteria({ questionId: q.id, size: 100 })
          );

          forkJoin(answerRequests)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (answersResponses) => {
                // Combiner les questions avec leurs réponses
                const questionsWithAnswers: QuestionWithAnswers[] = questions.map((q, index) => ({
                  ...q,
                  answers: answersResponses[index]?.content || []
                }));
                
                console.log('✅ Questions avec réponses:', questionsWithAnswers);
                this.campaignQuestions.set(questionsWithAnswers);
                this.loading.set(false);
              },
              error: (error) => {
                console.error('❌ Erreur lors du chargement des réponses:', error);
                // Même en cas d'erreur, afficher les questions sans réponses
                const questionsWithAnswers: QuestionWithAnswers[] = questions.map(q => ({
                  ...q,
                  answers: []
                }));
                this.campaignQuestions.set(questionsWithAnswers);
                this.loading.set(false);
              }
            });
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des questions:', error);
          this.campaignQuestions.set([]);
          this.loading.set(false);
        }
      });
  }

  loadAvailableQuestions(): void {
    console.log('🔍 Chargement des questions disponibles...');
    
    this.questionService.getAllQuestionsByCriteria({ size: 1000, isDeleted: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Questions disponibles récupérées:', response);
          
          // Filtrer les questions déjà dans la campagne
          const currentQuestionIds = this.campaignQuestions().map(q => q.id);
          const available = response.content.filter(q => !currentQuestionIds.includes(q.id));
          
          this.availableQuestions.set(available);
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des questions disponibles:', error);
          this.availableQuestions.set([]);
        }
      });
  }

  loadAvailableAnswers(questionId: number): void {
    console.log('🔍 Chargement des réponses disponibles pour la question:', questionId);
    
    this.answerService.getQuestionAnswersByCriteria({ questionId, size: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Réponses disponibles récupérées:', response);
          this.availableAnswers.set(response.content);
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des réponses disponibles:', error);
          this.availableAnswers.set([]);
        }
      });
  }

  toggleQuestionForm(): void {
    const newState = !this.showQuestionForm();
    this.showQuestionForm.set(newState);
    
    if (newState) {
      // Charger les questions disponibles
      this.loadAvailableQuestions();
    } else {
      // Réinitialiser le formulaire
      this.selectedQuestion.set(null);
      this.selectedAnswers.set([]);
      this.availableQuestions.set([]);
      this.availableAnswers.set([]);
    }
  }

  onQuestionSelected(): void {
    const questionId = this.selectedQuestion();
    if (questionId) {
      // Charger les réponses disponibles pour cette question
      this.loadAvailableAnswers(questionId);
    } else {
      this.availableAnswers.set([]);
    }
    this.selectedAnswers.set([]);
  }

  toggleAnswerSelection(answerId: number): void {
    const currentSelection = this.selectedAnswers();
    const index = currentSelection.indexOf(answerId);
    
    if (index > -1) {
      // Désélectionner
      this.selectedAnswers.set(currentSelection.filter(id => id !== answerId));
    } else {
      // Sélectionner
      this.selectedAnswers.set([...currentSelection, answerId]);
    }
  }

  isAnswerSelected(answerId: number): boolean {
    return this.selectedAnswers().includes(answerId);
  }

  addQuestionToCampaign(): void {
    const questionId = this.selectedQuestion();
    const answerIds = this.selectedAnswers();
    
    if (!questionId) {
      alert('Veuillez sélectionner une question');
      return;
    }

    if (answerIds.length === 0) {
      alert('Veuillez sélectionner au moins une réponse');
      return;
    }

    if (!this.campaignId()) {
      return;
    }

    this.questionLoading.set(true);

    console.log('➕ Ajout de la question:', questionId, 'avec réponses:', answerIds);
    
    // D'abord ajouter la question à la campagne
    this.campaignService.addQuestionsToCampaign(this.campaignId()!, [questionId])
      .pipe(
        switchMap(() => {
          // Ensuite ajouter les réponses à la question
          return this.campaignService.addAnswersToQuestion(questionId, answerIds);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          console.log('✅ Question et réponses ajoutées avec succès');
          this.questionLoading.set(false);
          this.showQuestionForm.set(false);
          this.selectedQuestion.set(null);
          this.selectedAnswers.set([]);
          
          // Recharger les questions de la campagne
          this.loadCampaignQuestions(this.campaignId()!);
        },
        error: (error) => {
          console.error('❌ Erreur lors de l\'ajout:', error);
          alert('Erreur lors de l\'ajout de la question à la campagne');
          this.questionLoading.set(false);
        }
      });
  }

  removeQuestionFromCampaign(question: QuestionWithAnswers): void {
    if (!question.id) return;

    if (!confirm(`Voulez-vous vraiment retirer la question "${question.questionText}" de cette campagne ?`)) {
      return;
    }

    if (!this.campaignId()) {
      return;
    }

    console.log('🗑️ Suppression de la question:', question.id);
    
    this.campaignService.removeQuestionFromCampaign(this.campaignId()!, question.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('✅ Question retirée avec succès');
          
          // Recharger les questions
          this.loadCampaignQuestions(this.campaignId()!);
        },
        error: (error) => {
          console.error('❌ Erreur lors du retrait:', error);
          alert('Erreur lors du retrait de la question');
        }
      });
  }

  toggleTokenForm(): void {
    this.showTokenForm.set(!this.showTokenForm());
    if (!this.showTokenForm()) {
      this.newTokenName.set('');
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
      sourceTokenName: tokenName
    };

    this.sourceTokenService.createSourceTokens([newToken])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Token créé:', response);
          this.tokenLoading.set(false);
          this.showTokenForm.set(false);
          this.newTokenName.set('');
          
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
    switch((status || 'PENDING').toLowerCase()) {
      case 'active': return 'status-active';
      case 'closed': return 'status-closed';
      case 'pending': 
      default: return 'status-pending';
    }
  }

  getStatusLabel(status?: string): string {
    switch((status || 'PENDING').toLowerCase()) {
      case 'active': return 'En cours';
      case 'closed': return 'Terminée';
      case 'pending': 
      default: return 'En attente';
    }
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
    if (this.campaignId()) {
      this.router.navigate(['/dashboard/campaigns', this.campaignId(), 'edit']);
    }
  }
}
