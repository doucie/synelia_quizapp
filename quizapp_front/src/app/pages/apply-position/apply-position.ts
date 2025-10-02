import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
export class ApplyPositionComponent {
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
        cvFileName: data.cvFile?.name
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
