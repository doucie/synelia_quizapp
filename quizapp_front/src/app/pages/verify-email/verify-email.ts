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
        
        // Rediriger vers le QCM après 3 secondes
        setTimeout(() => {
          const application = response.items[0];
          // TODO: Rediriger vers la page du QCM avec l'ID de l'application
          this.router.navigate(['/quiz', application.id]);
        }, 3000);
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
