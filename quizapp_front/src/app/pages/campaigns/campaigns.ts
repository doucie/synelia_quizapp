import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { Campaign, CampaignService } from '../../core/services/campaign.service';
import { SourceTokenService } from '../../services/source-token.service';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './campaigns.html',
  styleUrl: './campaigns.scss'
})
export class CampaignsComponent {
  private readonly router = inject(Router);
  private readonly campaignService = inject(CampaignService);
  private readonly sourceTokenService = inject(SourceTokenService);

  readonly sourceToken = signal('');
  readonly isCheckingToken = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly campaigns = signal<Campaign[]>([]);
  readonly isLoadingCampaigns = signal(true);
  readonly campaignsErrorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPublicCampaigns();
  }

  private loadPublicCampaigns(): void {
    this.isLoadingCampaigns.set(true);
    this.campaignsErrorMessage.set(null);

    this.campaignService.getPublicCampaigns()
      .pipe(finalize(() => this.isLoadingCampaigns.set(false)))
      .subscribe({
        next: (campaigns) => {
          const sortedCampaigns = [...campaigns].sort((left, right) => {
            const leftPriority = left.publicApplyEnabled ? 0 : 1;
            const rightPriority = right.publicApplyEnabled ? 0 : 1;
            if (leftPriority !== rightPriority) {
              return leftPriority - rightPriority;
            }

            return (left.campaignTitle || left.campaignName || '').localeCompare(right.campaignTitle || right.campaignName || '');
          });

          this.campaigns.set(sortedCampaigns);
        },
        error: (error) => {
          console.error('Erreur chargement campagnes publiques:', error);
          this.campaignsErrorMessage.set('Impossible de charger les campagnes pour le moment.');
          this.campaigns.set([]);
        }
      });
  }

  onSourceTokenChange(value: string): void {
    this.sourceToken.set(this.normalizeToken(value));
    if (this.errorMessage()) {
      this.errorMessage.set(null);
    }
  }

  submitSourceToken(): void {
    const normalizedToken = this.normalizeToken(this.sourceToken());
    this.sourceToken.set(normalizedToken);
    this.errorMessage.set(null);

    if (!/^[A-Z0-9]{6}$/.test(normalizedToken)) {
      this.errorMessage.set('Saisissez le code source a 6 caracteres transmis par le recruteur.');
      return;
    }

    this.isCheckingToken.set(true);

    this.sourceTokenService.validateToken(normalizedToken)
      .pipe(finalize(() => this.isCheckingToken.set(false)))
      .subscribe(validation => {
        if (!validation.isValid) {
          this.errorMessage.set(validation.message || 'Ce code source est invalide ou n est plus disponible.');
          return;
        }

        void this.router.navigate(['/postuler', normalizedToken]);
      });
  }

  private normalizeToken(value: string): string {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  }
}
