import { Component, ChangeDetectionStrategy, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SourceTokenService } from '../../services/source-token.service';
import { ApplicationService, Application } from '../../core/services/application.service';
import { FileService } from '../../core/services/file.service';

interface ApplicationForm {
  // Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  
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
  private readonly applicationService = inject(ApplicationService);
  private readonly fileService = inject(FileService);

  // Token source et informations de campagne
  sourceToken = signal<string>('');
  sourceTokenId = signal<number | null>(null);
  campaignName = signal<string>('');
  isLoadingToken = signal(true);

  // Formulaire
  formData = signal<ApplicationForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    cvFile: null,
    motivationLetter: '',
    remoteWork: false,
    relocate: false,
    consent: false
  });

  // États
  isSubmitting = signal(false);
  isUploadingCv = signal(false);
  submitSuccess = signal(false);
  submitError = signal<string | null>(null);
  fileName = signal<string>('');
  cvFilePath = signal<string>('');

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
            this.sourceTokenId.set(tokenData.id || null);
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
      
      // Validation du fichier
      const validation = this.fileService.validateCvFile(file);
      if (!validation.isValid) {
        this.submitError.set(validation.errorMessage || 'Fichier invalide');
        input.value = ''; // Reset input
        return;
      }

      // Clear previous errors
      this.submitError.set(null);
      
      // Update form data and file name
      this.formData.update(data => ({ ...data, cvFile: file }));
      this.fileName.set(file.name);
    }
  }

  async onSubmit(): Promise<void> {
    // Validation basique
    const data = this.formData();
    
    if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.birthDate) {
      this.submitError.set('Veuillez remplir tous les champs obligatoires');
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

    this.isSubmitting.set(true);
    this.submitError.set(null);

    try {
      // Étape 1 : Upload du CV
      this.isUploadingCv.set(true);
      
      // Utilisation de la simulation d'upload pour l'instant
      // TODO: Remplacer par this.fileService.uploadCvFile quand l'endpoint sera prêt
      const uploadResult = await this.fileService.simulateUpload(data.cvFile, data.email);
      
      this.isUploadingCv.set(false);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Erreur lors de l\'upload du CV');
      }

      this.cvFilePath.set(uploadResult.filePath || '');

      // Étape 2 : Créer l'application
      const application: Application = {
        candidateFirstName: data.firstName,
        candidateLastName: data.lastName,
        candidateEmail: data.email,
        candidatePhone: data.phone,
        candidateBirthDate: data.birthDate,
        candidateCvPath: uploadResult.filePath || undefined,
        motivationLetter: data.motivationLetter || '',
        emailVerified: false,
        applicationStatus: 'PENDING',
        sourceTokenId: this.sourceTokenId() || undefined,
        isDeleted: false,
        // createdAt: new Date().toISOString() // Let backend set this
      };

      // Appel à l'API backend
      this.applicationService.createApplication(application).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          
          if (response.hasError || !response.items || response.items.length === 0) {
            throw new Error('Erreur lors de la création de la candidature');
          }

          this.submitSuccess.set(true);
          console.log('Candidature créée avec succès:', response.items[0]);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          console.error('Erreur lors de la soumission:', error);
          this.submitError.set(
            'Une erreur est survenue lors de l\'envoi de votre candidature. Veuillez réessayer plus tard.'
          );
        }
      });

    } catch (error) {
      this.isSubmitting.set(false);
      this.isUploadingCv.set(false);
      console.error('Erreur:', error);
      
      if (error instanceof Error) {
        this.submitError.set(error.message);
      } else {
        this.submitError.set('Une erreur inattendue s\'est produite. Veuillez réessayer.');
      }
    }
  }

  resetForm(): void {
    this.formData.set({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: '',
      cvFile: null,
      motivationLetter: '',
      remoteWork: false,
      relocate: false,
      consent: false
    });
    this.fileName.set('');
    this.cvFilePath.set('');
    this.submitSuccess.set(false);
    this.submitError.set(null);
    this.isUploadingCv.set(false);
  }
}
