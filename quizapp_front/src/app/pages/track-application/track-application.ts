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
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
          completed: true,
          current: false
        },
        {
          title: 'Examen du dossier',
          description: 'Notre équipe RH examine votre profil',
          date: new Date('2024-08-16T14:00:00'),
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
          completed: true,
          current: false
        },
        {
          title: 'Test technique',
          description: 'Évaluation de vos compétences techniques',
          date: new Date('2024-08-20T09:00:00'),
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
          completed: true,
          current: false
        },
        {
          title: 'Entretien RH',
          description: 'Entretien avec notre équipe de recrutement',
          date: new Date('2024-08-25T15:00:00'),
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
          completed: false,
          current: true
        },
        {
          title: 'Décision finale',
          description: 'Prise de décision et retour sur votre candidature',
          date: null,
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
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
