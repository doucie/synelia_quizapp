import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface TrackingStage {
  id: number;
  stageLabel: string;
  stageType: string;
  stageOrder: number;
  isRequired: boolean;
  isEliminatory: boolean;
  progress?: TrackingProgress;
}

interface TrackingProgress {
  id: number;
  pipelineStageId: number;
  progressStatus: string;
  startedAt: string | null;
  completedAt: string | null;
  score: number | null;
}

interface TrackingApplication {
  id: number;
  candidateFirstName: string;
  candidateLastName: string;
  candidateEmail: string;
  applicationStatus: string;
  quizStatus: string;
  createdAt: string;
  emailVerified: boolean;
  campaignTitle: string;
}

interface TrackingResponse {
  hasError: boolean;
  message?: string;
  application?: TrackingApplication;
  stages?: any[];
  progress?: any[];
}

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
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  application = signal<TrackingApplication | null>(null);
  stages = signal<TrackingStage[]>([]);

  constructor(private http: HttpClient) {}

  trackApplication() {
    if (!this.trackingCode || !this.email) return;

    this.loading.set(true);
    this.errorMessage.set(null);
    this.application.set(null);
    this.stages.set([]);

    this.http.post<TrackingResponse>(`${environment.apiUrl}/applications/track`, {
      trackingCode: this.trackingCode.trim(),
      email: this.email.trim()
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.hasError) {
          this.errorMessage.set(res.message || 'Une erreur est survenue.');
          return;
        }
        this.application.set(res.application || null);
        // Fusionner stages + progress
        const stageList: TrackingStage[] = (res.stages || []).map((s: any) => {
          const progress = (res.progress || []).find((p: any) => p.pipelineStageId === s.id);
          return { ...s, progress: progress || undefined };
        });
        this.stages.set(stageList);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Impossible de contacter le serveur. Veuillez réessayer.');
      }
    });
  }

  getStatusIcon(stage: TrackingStage): string {
    if (!stage.progress) return '⏳';
    switch (stage.progress.progressStatus) {
      case 'IN_PROGRESS': return '🔄';
      case 'PASSED': return '✅';
      case 'FAILED': return '❌';
      case 'SKIPPED': return '⏭️';
      default: return '⏳';
    }
  }

  getStatusClass(stage: TrackingStage): string {
    if (!stage.progress) return 'pending';
    switch (stage.progress.progressStatus) {
      case 'IN_PROGRESS': return 'in-progress';
      case 'PASSED': return 'passed';
      case 'FAILED': return 'failed';
      case 'SKIPPED': return 'skipped';
      default: return 'pending';
    }
  }

  getStatusLabel(stage: TrackingStage): string {
    if (!stage.progress) return 'En attente';
    switch (stage.progress.progressStatus) {
      case 'IN_PROGRESS': return 'En cours';
      case 'PASSED': return 'Réussi';
      case 'FAILED': return 'Échoué';
      case 'SKIPPED': return 'Ignoré';
      default: return 'En attente';
    }
  }

  getApplicationStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'NEW': 'Nouvelle',
      'IN_PROGRESS': 'En cours',
      'ACCEPTED': 'Acceptée',
      'REJECTED': 'Refusée',
      'WITHDRAWN': 'Retirée'
    };
    return labels[status] || status;
  }

  getApplicationStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'NEW': 'status-new',
      'IN_PROGRESS': 'status-in-progress',
      'ACCEPTED': 'status-accepted',
      'REJECTED': 'status-rejected',
      'WITHDRAWN': 'status-withdrawn'
    };
    return classes[status] || 'status-new';
  }

  getCurrentStage(): TrackingStage | null {
    const list = this.stages();
    return list.find(s => s.progress?.progressStatus === 'IN_PROGRESS') || null;
  }
}
