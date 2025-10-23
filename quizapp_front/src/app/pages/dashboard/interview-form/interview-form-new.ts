import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Application {
  id: number;
  candidateFirstName: string;
  candidateLastName: string;
  candidateEmail: string;
  candidatePhone?: string;
  campaignId: number;
  campaignTitle: string;
  sourceTokenId?: number;
  quizScore?: number;
  applicationStatus: string;
}

interface Campaign {
  id: number;
  title: string;
}

interface SourceToken {
  id: number;
  name: string;
}

interface Recruiter {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isCreator?: boolean;
  canEvaluate?: boolean;
  isDefault?: boolean;
}

interface InterviewFormData {
  applicationId?: number;
  interviewDate: string;
  interviewTime: string;
  interviewType: 'IN_PERSON' | 'ONLINE';
  interviewLocation?: string;
  meetLink?: string;
  interviewNote?: string;
  interviewStatus: string;
}

@Component({
  selector: 'app-interview-form-new',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interview-form-new.html',
  styleUrls: ['./interview-form-new.scss']
})
export class InterviewFormNewComponent implements OnInit {
  // Signals
  currentStep = signal(1);
  loading = signal(false);
  loadingCandidates = signal(false);
  loadingRecruiters = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  candidates = signal<Application[]>([]);
  campaigns = signal<Campaign[]>([]);
  sources = signal<SourceToken[]>([]);
  availableRecruiters = signal<Recruiter[]>([]);
  
  selectedCandidate = signal<Application | null>(null);
  selectedRecruiters = signal<Recruiter[]>([]);

  // Filtres
  filters = {
    campaignId: null as number | null,
    sourceTokenId: null as number | null,
    searchTerm: ''
  };

  // Formulaire
  interviewForm: InterviewFormData = {
    interviewDate: '',
    interviewTime: '',
    interviewType: 'ONLINE',
    interviewLocation: '',
    meetLink: '',
    interviewNote: '',
    interviewStatus: 'PENDING'
  };

  minDate: string = '';
  currentUserId: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Définir la date minimale à aujourd'hui
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.interviewForm.interviewDate = this.minDate;

    // Récupérer l'utilisateur courant
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.currentUserId = user.id;
    }

    // Charger les données initiales
    this.loadCampaigns();
    this.loadSources();
    this.loadCandidates();

    // Vérifier si un candidat est pré-sélectionné
    this.route.queryParams.subscribe(params => {
      const applicationId = params['applicationId'];
      if (applicationId) {
        this.preselectCandidate(+applicationId);
      }
    });
  }

  /**
   * Charger les campagnes disponibles pour filtrage
   */
  loadCampaigns(): void {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    
    const request = {
      user: userId,
      data: {},
      index: 0,
      size: 1000
    };

    console.log('🔵 Calling POST /campaigns/getByCriteria with:', request);
    this.http.post<any>(`${environment.apiUrl}/campaigns/getByCriteria`, request).subscribe({
      next: (response) => {
        console.log('✅ Campaigns loaded:', response);
        this.campaigns.set(response.items || []);
      },
      error: (err) => {
        console.error('❌ Erreur chargement campagnes:', err);
        console.error('Error details:', err.status, err.error);
      }
    });
  }

  /**
   * Charger les sources
   */
  loadSources(): void {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    
    const request = {
      user: userId,
      data: {},
      index: 0,
      size: 1000
    };

    console.log('🔵 Calling POST /sourceToken/getByCriteria with:', request);
    this.http.post<any>(`${environment.apiUrl}/sourceToken/getByCriteria`, request).subscribe({
      next: (response) => {
        console.log('✅ Sources loaded:', response);
        this.sources.set(response.items || []);
      },
      error: (err) => {
        console.error('❌ Erreur chargement sources:', err);
        console.error('Error details:', err.status, err.error);
      }
    });
  }

  /**
   * Charger les candidats avec applicationStatus = SUBMITTED
   */
  loadCandidates(): void {
    this.loadingCandidates.set(true);
    
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    
    const request: any = {
      user: userId,
      data: {
        applicationStatus: 'SUBMITTED'
      },
      index: 0,
      size: 1000
    };
    
    if (this.filters.campaignId) {
      request.data.campaignId = this.filters.campaignId;
    }
    if (this.filters.sourceTokenId) {
      request.data.sourceTokenId = this.filters.sourceTokenId;
    }
    if (this.filters.searchTerm) {
      request.data.searchTerm = this.filters.searchTerm;
    }

    console.log('🔵 Calling POST /applications/getByCriteria with:', request);
    this.http.post<any>(`${environment.apiUrl}/applications/getByCriteria`, request).subscribe({
      next: (response) => {
        console.log('✅ Candidates loaded:', response);
        this.candidates.set(response.items || []);
        this.loadingCandidates.set(false);
      },
      error: (err) => {
        console.error('❌ Erreur chargement candidats:', err);
        console.error('Error details:', err.status, err.error);
        this.error.set('Impossible de charger les candidats');
        this.loadingCandidates.set(false);
      }
    });
  }

  /**
   * Pré-sélectionner un candidat
   */
  preselectCandidate(applicationId: number): void {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    
    const request = {
      user: userId,
      data: { id: applicationId },
      index: 0,
      size: 1
    };

    this.http.post<any>(`${environment.apiUrl}/applications/getByCriteria`, request).subscribe({
      next: (response) => {
        if (response.items && response.items.length > 0) {
          const candidate = response.items[0];
          if (candidate.applicationStatus === 'SUBMITTED') {
            this.selectedCandidate.set(candidate);
            this.currentStep.set(2);
            this.loadRecruiters(candidate.campaignId);
          }
        }
      },
      error: (err) => console.error('Erreur pré-sélection candidat:', err)
    });
  }

  /**
   * Recherche avec délai
   */
  private searchTimeout: any;
  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadCandidates();
    }, 300);
  }

  /**
   * Sélectionner un candidat
   */
  selectCandidate(candidate: Application): void {
    this.selectedCandidate.set(candidate);
    this.interviewForm.applicationId = candidate.id;
  }

  /**
   * Obtenir les initiales
   */
  getInitials(candidate: Application): string {
    const first = candidate.candidateFirstName?.charAt(0) || '';
    const last = candidate.candidateLastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  /**
   * Passer à l'étape suivante
   */
  nextStep(): void {
    if (this.currentStep() === 1 && this.selectedCandidate()) {
      this.loadRecruiters(this.selectedCandidate()!.campaignId);
      this.currentStep.set(2);
    } else if (this.currentStep() === 2 && this.isStep2Valid()) {
      this.currentStep.set(3);
    }
  }

  /**
   * Revenir à l'étape précédente
   */
  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }

  /**
   * Valider l'étape 2
   */
  isStep2Valid(): boolean {
    if (!this.interviewForm.interviewDate || !this.interviewForm.interviewTime) {
      return false;
    }
    if (this.interviewForm.interviewType === 'IN_PERSON' && !this.interviewForm.interviewLocation) {
      return false;
    }
    if (this.interviewForm.interviewType === 'ONLINE' && !this.interviewForm.meetLink) {
      return false;
    }
    return true;
  }

  /**
   * Charger les recruteurs de la campagne
   */
  loadRecruiters(campaignId: number): void {
    this.loadingRecruiters.set(true);
    
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    
    const request = {
      user: userId,
      data: { campaignId: campaignId },
      index: 0,
      size: 1000
    };

    this.http.post<any>(`${environment.apiUrl}/campaignCrud/getByCriteria`, request).subscribe({
      next: (response) => {
        const recruiters: Recruiter[] = (response.items || []).map((crud: any) => {
          const isCreator = crud.userId === this.currentUserId;
          const canEvaluate = crud.canEvaluate === true;
          const isDefault = isCreator || canEvaluate;

          return {
            id: crud.userId,
            firstName: crud.userFirstName || crud.user?.firstName,
            lastName: crud.userLastName || crud.user?.lastName,
            email: crud.userEmail || crud.user?.email,
            isCreator,
            canEvaluate,
            isDefault
          };
        });

        this.availableRecruiters.set(recruiters);
        
        // Pré-sélectionner les recruteurs par défaut
        const defaultRecruiters = recruiters.filter(r => r.isDefault);
        this.selectedRecruiters.set(defaultRecruiters);
        
        this.loadingRecruiters.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement recruteurs:', err);
        this.loadingRecruiters.set(false);
      }
    });
  }

  /**
   * Vérifier si un recruteur est sélectionné
   */
  isRecruiterSelected(recruiter: Recruiter): boolean {
    return this.selectedRecruiters().some(r => r.id === recruiter.id);
  }

  /**
   * Basculer la sélection d'un recruteur
   */
  toggleRecruiter(recruiter: Recruiter): void {
    // Ne pas pouvoir désélectionner les recruteurs par défaut
    if (recruiter.isDefault) {
      return;
    }

    if (this.isRecruiterSelected(recruiter)) {
      this.selectedRecruiters.update(recruiters => 
        recruiters.filter(r => r.id !== recruiter.id)
      );
    } else {
      this.selectedRecruiters.update(recruiters => [...recruiters, recruiter]);
    }
  }

  /**
   * Soumettre l'entretien
   */
  submitInterview(): void {
    if (!this.selectedCandidate()) {
      this.error.set('Aucun candidat sélectionné');
      return;
    }

    if (this.selectedRecruiters().length === 0) {
      this.error.set('Sélectionnez au moins un intervieweur');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    // Combiner date et heure
    const interviewDateTime = `${this.interviewForm.interviewDate}T${this.interviewForm.interviewTime}:00`;

    const payload = {
      applicationId: this.selectedCandidate()!.id,
      campaignId: this.selectedCandidate()!.campaignId,
      interviewDate: interviewDateTime,
      interviewType: this.interviewForm.interviewType,
      interviewLocation: this.interviewForm.interviewLocation || null,
      meetLink: this.interviewForm.meetLink || null,
      interviewNote: this.interviewForm.interviewNote || null,
      interviewStatus: 'PENDING',
      interviewMailSent: false,
      interviewers: this.selectedRecruiters().map(r => ({
        userId: r.id,
        canUpdate: true,
        canDelete: false,
        canEvaluate: r.canEvaluate || r.isCreator,
        isAdmin: r.isCreator || false,
        follow: true
      }))
    };

    this.http.post(`${environment.apiUrl}/interviews`, payload).subscribe({
      next: (response) => {
        console.log('Entretien créé:', response);
        this.success.set(true);
        this.saving.set(false);
        
        setTimeout(() => {
          this.router.navigate(['/dashboard/candidates']);
        }, 2000);
      },
      error: (err) => {
        console.error('Erreur création entretien:', err);
        this.error.set(err.error?.message || 'Erreur lors de la création de l\'entretien');
        this.saving.set(false);
      }
    });
  }

  /**
   * Retour
   */
  goBack(): void {
    this.router.navigate(['/dashboard/candidates']);
  }
}
