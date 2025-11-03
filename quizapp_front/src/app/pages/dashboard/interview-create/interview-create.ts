import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Interview, InterviewService } from '../../../core/services/interview.service';
import { Application, ApplicationService } from '../../../core/services/application.service';
import { Campaign, CampaignService } from '../../../core/services/campaign.service';
import { User, UserService } from '../../../core/services/user.service';
import { CampaignCrudService } from '../../../core/services/campaign-crud.service';
import { SourceTokenService, SourceToken } from '../../../services/source-token.service';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './interview-create.html',
  styleUrl: './interview-create.scss'
})
export class InterviewCreateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Signals
  loading = signal(false);
  campaigns = signal<Campaign[]>([]);
  applications = signal<Application[]>([]);
  sourceTokens = signal<SourceToken[]>([]);
  campaignCrudItems = signal<any[]>([]); // Pour stocker les campaign_crud
  evaluators = signal<User[]>([]);
  showEmailPreview = signal(false);
  
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
    private campaignCrudService: CampaignCrudService,
    private sourceTokenService: SourceTokenService
  ) {}

  ngOnInit(): void {
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
    
    // Filtrer les applications ayant un de ces sourceTokenIds et le bon statut
    const eligible = this.applications().filter(app => 
      app.sourceTokenId && 
      sourceTokenIds.includes(app.sourceTokenId) &&
      app.applicationStatus === 'PRE_SCREEN_ACCEPTED'
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
    return this.evaluators().filter(user => 
      selectedIds.includes(user.id!)
    );
  });

  /**
   * Computed - Preview de l'email
   */
  emailPreview = computed(() => {
    const form = this.formData();
    const campaign = this.campaigns().find(c => c.id === form.campaignId);
    const dateTime = this.formatDateTime(form.interviewDate, form.interviewTime);
    const evaluatorsNames = this.selectedEvaluatorsDetails()
      .map(e => `${e.firstName} ${e.lastName}`)
      .join(', ');

    return {
      subject: `Convocation à un entretien - ${campaign?.campaignTitle || campaign?.campaignName || ''}`,
      body: `
Bonjour [Nom du candidat],

Nous avons le plaisir de vous informer que votre candidature pour le poste "${campaign?.campaignTitle || campaign?.campaignName || ''}" a été retenue.

Nous souhaitons vous rencontrer pour un entretien ${form.interviewType === 'IN_PERSON' ? 'en personne' : 'en ligne'}.

📅 Date et heure : ${dateTime}
${form.interviewType === 'IN_PERSON' ? `📍 Lieu : ${form.interviewLocation || 'À préciser'}` : `💻 Lien de connexion : ${form.meetLink || 'À envoyer ultérieurement'}`}

👥 Vous serez évalué(e) par : ${evaluatorsNames || 'À confirmer'}

${form.interviewNote ? `\n📝 Informations complémentaires :\n${form.interviewNote}\n` : ''}
Nous vous remercions de confirmer votre présence en répondant à cet email.

Cordialement,
L'équipe de recrutement
      `.trim()
    };
  });

  /**
   * Charge les campagnes
   */
  loadCampaigns(): void {
    this.loading.set(true);
    this.campaignService.getAllCampaignsByCriteria({}).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.content) {
          this.campaigns.set(response.content);
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

    this.loading.set(true);

    forkJoin({
      applications: this.applicationService.getApplicationsByCriteria({}),
      sourceTokens: this.sourceTokenService.getSourceTokensByCriteria({}),
      evaluators: this.campaignCrudService.getEvaluatorsByCampaignId(campaignId)
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

        // Traiter les évaluateurs
        if (response.evaluators.items) {
          console.log('📋 Campaign CRUD items reçus:', response.evaluators.items);
          this.campaignCrudItems.set(response.evaluators.items);
          
          const userIds = response.evaluators.items.map(crud => crud.userId!).filter(id => id);
          const canEvaluateUserIds = response.evaluators.items
            .filter(crud => crud.canEvaluate === true)
            .map(crud => crud.userId!)
            .filter(id => id);
          
          console.log('👥 UserIds extraits:', userIds);
          console.log('✅ UserIds avec canEvaluate=true:', canEvaluateUserIds);
          
          this.loadEvaluatorDetails(userIds, canEvaluateUserIds);
        } else {
          console.warn('⚠️ Aucun évaluateur reçu de l\'API');
        }

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.loading.set(false);
      }
    });
  }

  /**
   * Charge les détails des évaluateurs
   */
  loadEvaluatorDetails(userIds: number[], canEvaluateUserIds: number[] = []): void {
    console.log('🔧 loadEvaluatorDetails appelé avec userIds:', userIds);
    
    if (userIds.length === 0) {
      console.warn('⚠️ Aucun userId à charger');
      return;
    }
    
    const requests = userIds.map(id => this.userService.getById(id));
    
    forkJoin(requests).pipe(takeUntil(this.destroy$)).subscribe({
      next: (users) => {
        const validUsers = users.filter(u => u !== null);
        console.log('👥 Évaluateurs chargés:', validUsers);
        this.evaluators.set(validUsers);
        
        // Pré-sélectionner les évaluateurs avec canEvaluate=true
        if (canEvaluateUserIds.length > 0) {
          const current = this.formData();
          current.selectedEvaluators = canEvaluateUserIds;
          this.formData.set({ ...current });
          console.log('✅ Évaluateurs pré-sélectionnés:', canEvaluateUserIds);
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des évaluateurs:', error);
      }
    });
  }

  /**
   * Toggle sélection d'un candidat
   */
  toggleCandidate(applicationId: number): void {
    const current = this.formData();
    const index = current.selectedCandidates.indexOf(applicationId);
    
    if (index > -1) {
      current.selectedCandidates.splice(index, 1);
    } else {
      current.selectedCandidates.push(applicationId);
    }
    
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

    // Créer les entretiens
    this.createInterviews();
  }

  /**
   * Crée les entretiens pour tous les candidats sélectionnés
   */
  createInterviews(): void {
    const form = this.formData();
    const dateTime = `${form.interviewDate.split('-').reverse().join('/')} ${form.interviewTime}`;

    const interviewPromises = form.selectedCandidates.map(candidateId => {
      // Trouver l'application pour obtenir son sourceTokenId
      const application = this.applications().find(app => app.id === candidateId);
      
      if (!application || !application.sourceTokenId) {
        console.error(`Application ${candidateId} introuvable ou sans sourceTokenId`);
        return null;
      }

      const interview: Interview = {
        campaignId: application.sourceTokenId, // Utiliser le sourceTokenId de l'application
        interviewDate: dateTime,
        interviewType: form.interviewType,
        interviewLocation: form.interviewLocation,
        meetLink: form.meetLink,
        interviewNote: form.interviewNote,
        interviewStatus: 'SCHEDULED',
        interviewMailSent: false,
        isDeleted: false
      };

      return this.interviewService.createInterview(interview);
    }).filter(promise => promise !== null);

    this.loading.set(true);

    forkJoin(interviewPromises).subscribe({
      next: (responses) => {
        const hasErrors = responses.some(r => r.hasError);
        
        if (hasErrors) {
          const errorMessages = responses
            .filter(r => r.hasError)
            .map(r => r.status.message)
            .join('\n');
          alert(`Certains entretiens n'ont pas pu être créés:\n${errorMessages}`);
        } else {
          alert(`${responses.length} entretien(s) créé(s) avec succès!`);
          this.router.navigate(['/dashboard/interviews']);
        }
        
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors de la création des entretiens:', error);
        alert('Erreur lors de la création des entretiens');
        this.loading.set(false);
      }
    });
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
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur';
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
