import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-track-application',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './track-application.html',
  styleUrls: ['./track-application.scss']
})
export class TrackApplicationComponent {
  trackingCode = '';
  email = '';
  applicationStatus: any = null;

  trackApplication() {
    if (!this.trackingCode || !this.email) return;

    // Simulation d'un appel API
    this.applicationStatus = {
      candidateName: 'Marie Dupont',
      position: 'Développeur Frontend Angular',
      submittedDate: new Date('2024-08-15'),
      status: 'interview',
      steps: [
        {
          title: 'Candidature reçue',
          description: 'Votre candidature a été soumise avec succès',
          date: new Date('2024-08-15T10:30:00'),
          icon: '📝',
          completed: true,
          current: false
        },
        {
          title: 'Examen du dossier',
          description: 'Notre équipe RH examine votre profil',
          date: new Date('2024-08-16T14:00:00'),
          icon: '👀',
          completed: true,
          current: false
        },
        {
          title: 'Test technique',
          description: 'Évaluation de vos compétences techniques',
          date: new Date('2024-08-20T09:00:00'),
          icon: '💻',
          completed: true,
          current: false
        },
        {
          title: 'Entretien RH',
          description: 'Entretien avec notre équipe de recrutement',
          date: new Date('2024-08-25T15:00:00'),
          icon: '👥',
          completed: false,
          current: true
        },
        {
          title: 'Décision finale',
          description: 'Prise de décision et retour sur votre candidature',
          date: null,
          icon: '🎯',
          completed: false,
          current: false
        }
      ],
      nextSteps: {
        title: 'Entretien RH programmé',
        description: 'Rendez-vous fixé avec Mme. Sophie Martin, Responsable RH',
        expectedDate: new Date('2024-08-25T15:00:00')
      }
    };
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'submitted': 'Candidature soumise',
      'reviewing': 'En cours d\'examen',
      'interview': 'Entretien programmé',
      'accepted': 'Candidature acceptée',
      'rejected': 'Candidature non retenue'
    };
    return labels[status] || status;
  }
}
