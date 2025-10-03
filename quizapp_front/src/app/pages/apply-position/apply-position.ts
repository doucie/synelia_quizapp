import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SourceTokenService } from '../../services/source-token.service';

interface ApplicationForm {
  // Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Informations professionnelles
  position: string;
  department: string;
  experience: string;
  availability: string;
  
  // Documents et motivation
  cvFile: File | null;
  motivationLetter: string;
  
  // Préférences
  remoteWork: boolean;
  relocate: boolean;
  
  // Consentement
  consent: boolean;
}

@Component({
  selector: 'app-apply-position',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './apply-position.html',
  styleUrl: './apply-position.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplyPositionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sourceTokenService = inject(SourceTokenService);

  // Token source et informations de campagne
  sourceToken = signal<string>('');
  campaignName = signal<string>('');
  isLoadingToken = signal(true);

  // Formulaire
  formData = signal<ApplicationForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    experience: '',
    availability: '',
    cvFile: null,
    motivationLetter: '',
    remoteWork: false,
    relocate: false,
    consent: false
  });

  // États
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal<string | null>(null);
  fileName = signal<string>('');

  // Positions disponibles (à remplacer par un appel API)
  availablePositions = signal([
    'Développeur Frontend',
    'Développeur Backend',
    'Développeur Full Stack',
    'Data Scientist',
    'DevOps Engineer',
    'Product Manager',
    'UI/UX Designer',
    'QA Engineer'
  ]);

  // Départements disponibles (à remplacer par un appel API)
  availableDepartments = signal([
    'Développement',
    'Data & IA',
    'Infrastructure',
    'Product',
    'Design',
    'Quality Assurance'
  ]);

  ngOnInit(): void {
    // Récupérer le token depuis les paramètres de route
    const tokenString = this.route.snapshot.paramMap.get('sourceToken');
    
    if (tokenString) {
      this.sourceToken.set(tokenString);
      
      // Charger les informations du token
      this.sourceTokenService.getTokenInfo(tokenString).subscribe({
        next: (response) => {
          if (response.items && response.items.length > 0) {
            const tokenData = response.items[0];
            this.campaignName.set(tokenData.campaignName || 'Campagne de recrutement');
          }
          this.isLoadingToken.set(false);
        },
        error: (error) => {
          console.error('Erreur chargement token:', error);
          this.campaignName.set('Campagne de recrutement Synelia');
          this.isLoadingToken.set(false);
        }
      });
    } else {
      // Pas de token, rediriger
      this.router.navigate(['/']);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.formData.update(data => ({ ...data, cvFile: file }));
      this.fileName.set(file.name);
    }
  }

  onSubmit(): void {
    // Validation basique
    const data = this.formData();
    
    if (!data.firstName || !data.lastName || !data.email || !data.phone) {
      this.submitError.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!data.position || !data.department) {
      this.submitError.set('Veuillez sélectionner un poste et un département');
      return;
    }

    if (!data.cvFile) {
      this.submitError.set('Veuillez joindre votre CV');
      return;
    }

    if (!data.consent) {
      this.submitError.set('Veuillez accepter les conditions');
      return;
    }

    // Simulation de soumission (à remplacer par un appel API)
    this.isSubmitting.set(true);
    this.submitError.set(null);

    // Simuler un délai réseau
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitSuccess.set(true);
      
      console.log('Candidature soumise:', {
        ...data,
        cvFileName: data.cvFile?.name,
        sourceToken: this.sourceToken(), // Inclure le token dans la soumission
        campaignName: this.campaignName()
      });
    }, 2000);
  }

  resetForm(): void {
    this.formData.set({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      experience: '',
      availability: '',
      cvFile: null,
      motivationLetter: '',
      remoteWork: false,
      relocate: false,
      consent: false
    });
    this.fileName.set('');
    this.submitSuccess.set(false);
    this.submitError.set(null);
  }
}
