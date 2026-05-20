import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
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
  private readonly sourceTokenService = inject(SourceTokenService);

  readonly sourceToken = signal('');
  readonly isCheckingToken = signal(false);
  readonly errorMessage = signal<string | null>(null);

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
