import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ApplicationInfo {
  id: number;
  candidateFirstName: string;
  candidateLastName: string;
  candidateEmail: string;
  campaignId: number;
  campaignTitle: string;
  quizScore?: number;
}

interface InterviewFormData {
  applicationId: number;
  interviewDate: string;
  interviewTime: string;
  interviewType: 'PHONE' | 'VIDEO' | 'IN_PERSON';
  location?: string;
  meetingLink?: string;
  notes?: string;
  interviewers?: string;
}

@Component({
  selector: 'app-interview-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interview-form.html',
  styleUrls: ['./interview-form.scss']
})
export class InterviewFormComponent implements OnInit {
  // Signals
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  applicationInfo = signal<ApplicationInfo | null>(null);

  // Form data
  formData: InterviewFormData = {
    applicationId: 0,
    interviewDate: '',
    interviewTime: '',
    interviewType: 'VIDEO',
    location: '',
    meetingLink: '',
    notes: '',
    interviewers: ''
  };

  // Options
  interviewTypes: Array<{ value: 'PHONE' | 'VIDEO' | 'IN_PERSON', label: string }> = [
    { value: 'PHONE', label: 'Téléphone' },
    { value: 'VIDEO', label: 'Visioconférence' },
    { value: 'IN_PERSON', label: 'Présentiel' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    console.log('🎯 InterviewFormComponent constructor called');
  }

  ngOnInit(): void {
    console.log('🎯 InterviewFormComponent ngOnInit called');
    // Récupérer les paramètres de la route
    this.route.queryParams.subscribe(params => {
      const applicationId = params['applicationId'];
      
      if (applicationId) {
        this.formData.applicationId = +applicationId;
        this.loadApplicationInfo(+applicationId);
      } else {
        this.error.set('Aucune candidature spécifiée');
      }
    });

    // Définir la date minimale à aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    this.formData.interviewDate = today;
  }

  /**
   * Charger les informations de la candidature
   */
  loadApplicationInfo(applicationId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<any>(`${environment.apiUrl}/applications/${applicationId}`)
      .subscribe({
        next: (response) => {
          this.applicationInfo.set({
            id: response.id,
            candidateFirstName: response.candidateFirstName,
            candidateLastName: response.candidateLastName,
            candidateEmail: response.candidateEmail,
            campaignId: response.campaignId,
            campaignTitle: response.campaignTitle,
            quizScore: response.quizScore
          });
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur chargement candidature:', err);
          this.error.set('Impossible de charger les informations de la candidature');
          this.loading.set(false);
        }
      });
  }

  /**
   * Gérer le changement de type d'interview
   */
  onInterviewTypeChange(type: 'PHONE' | 'VIDEO' | 'IN_PERSON'): void {
    this.formData.interviewType = type;
    
    // Réinitialiser les champs conditionnels
    if (type !== 'IN_PERSON') {
      this.formData.location = '';
    }
    if (type !== 'VIDEO') {
      this.formData.meetingLink = '';
    }
  }

  /**
   * Valider le formulaire
   */
  isFormValid(): boolean {
    if (!this.formData.interviewDate || !this.formData.interviewTime) {
      return false;
    }

    // Validation conditionnelle selon le type
    if (this.formData.interviewType === 'IN_PERSON' && !this.formData.location) {
      return false;
    }
    if (this.formData.interviewType === 'VIDEO' && !this.formData.meetingLink) {
      return false;
    }

    return true;
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (!this.isFormValid()) {
      this.error.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    // Combiner date et heure pour créer un timestamp ISO
    const interviewDateTime = `${this.formData.interviewDate}T${this.formData.interviewTime}:00`;

    const payload = {
      applicationId: this.formData.applicationId,
      interviewDate: interviewDateTime,
      interviewType: this.formData.interviewType,
      location: this.formData.location || null,
      meetingLink: this.formData.meetingLink || null,
      notes: this.formData.notes || null,
      interviewers: this.formData.interviewers || null,
      interviewStatus: 'SCHEDULED'
    };

    this.http.post(`${environment.apiUrl}/interviews`, payload)
      .subscribe({
        next: (response) => {
          console.log('Interview créée:', response);
          this.success.set(true);
          this.saving.set(false);
          
          // Rediriger vers la liste des candidatures après 1.5s
          setTimeout(() => {
            this.router.navigate(['/dashboard/candidates']);
          }, 1500);
        },
        error: (err) => {
          console.error('Erreur création interview:', err);
          this.error.set(err.error?.message || 'Erreur lors de la création de l\'interview');
          this.saving.set(false);
        }
      });
  }

  /**
   * Annuler et retourner
   */
  onCancel(): void {
    this.router.navigate(['/dashboard/candidates']);
  }

  /**
   * Obtenir le nom complet du candidat
   */
  getCandidateName(): string {
    const info = this.applicationInfo();
    if (!info) return '';
    return `${info.candidateFirstName} ${info.candidateLastName}`;
  }
}
