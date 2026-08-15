import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../../core/services/application.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss'
})
export class VerifyEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly applicationService = inject(ApplicationService);

  // États
  isVerifying = signal(true);
  verificationSuccess = signal(false);
  verificationError = signal<string | null>(null);
  token = signal<string>('');
  trackingCode = signal<string | null>(null);
  hasQuizStage = signal(false);

  ngOnInit(): void {
    // Récupérer le token depuis l'URL
    const tokenParam = this.route.snapshot.paramMap.get('token');
    
    if (!tokenParam) {
      this.isVerifying.set(false);
      this.verificationError.set('Token de vérification manquant');
      return;
    }

    this.token.set(tokenParam);
    this.verifyEmail(tokenParam);
  }

  private verifyEmail(token: string): void {
    this.applicationService.verifyEmail(token).subscribe({
      next: (response) => {
        this.isVerifying.set(false);
        
        if (response.hasError || !response.items || response.items.length === 0) {
          this.verificationError.set(
            response.status?.message || 'Erreur lors de la vérification de l\'email'
          );
          return;
        }

        // Succès !
        this.verificationSuccess.set(true);
        
        const application = response.items[0];
        this.trackingCode.set(application.trackingCode || null);
        const quizToken = application.quizToken ?? application.searchString; // Contrat explicite, fallback legacy
        const hasQuizStage = application.hasQuizStage ?? !!quizToken;
        this.hasQuizStage.set(hasQuizStage);

        if (hasQuizStage && quizToken) {
          // Rediriger vers le QCM après 3 secondes avec applicationId et quizToken
          setTimeout(() => {
            this.router.navigate(['/quiz', application.id, quizToken]);
          }, 3000);
        } else {
          // Pas d'étape quiz : proposer le suivi de candidature
          setTimeout(() => {
            this.router.navigate(['/suivre-candidature']);
          }, 3000);
        }
      },
      error: (error) => {
        this.isVerifying.set(false);
        console.error('Erreur lors de la vérification:', error);
        
        // Gérer les différents types d'erreurs
        if (error.status === 404) {
          this.verificationError.set('Token de vérification invalide ou expiré');
        } else if (error.status === 400) {
          this.verificationError.set('Ce lien de vérification a déjà été utilisé');
        } else {
          this.verificationError.set('Une erreur est survenue. Veuillez réessayer plus tard.');
        }
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
