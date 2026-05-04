import { Component, ChangeDetectionStrategy, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../core/services/auth/auth.service';
import { ConnexionService } from '../../core/services/connexion/connexion.service';
import { LoginCredentials } from '../../shared/models/interfaces';

@Component({
  selector: 'app-connexion',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './connexion.html',
  styleUrl: './connexion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnexionComponent implements OnInit {
  loginForm: FormGroup;
  showPassword: boolean = false;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private infoSubject = new BehaviorSubject<string | null>(null);
  private destroyRef = inject(DestroyRef);
  
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly info$ = this.infoSubject.asObservable();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private connexionService: ConnexionService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
    this.showPassword = false;
  }

  ngOnInit(): void {
    // Détecter si la session a expiré (redirection depuis l'interceptor)
    this.route.queryParams.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      if (params['expired'] === 'true') {
        this.infoSubject.next('Votre session a expiré. Veuillez vous reconnecter.');
        // Nettoyer le paramètre de l'URL
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      
      const credentials: LoginCredentials = this.loginForm.value;
      
      // Validation côté client
      const validationError = this.connexionService.validateCredentials(credentials);
      if (validationError) {
        this.loadingSubject.next(false);
        this.errorSubject.next(validationError);
        return;
      }

      // Étape 1: Appel API via ConnexionService
      this.connexionService.login(credentials)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          // Étape 2: Authentification via AuthService
          switchMap(apiResponse => this.authService.authenticate(apiResponse))
        )
        .subscribe({
          next: (loginResponse) => {
            this.loadingSubject.next(false);
            console.log('✅ Connexion réussie:', loginResponse.user.email);
            
            // Étape 3: Navigation vers le dashboard après authentification réussie
            this.router.navigate([this.authService.getAuthenticatedHomeRoute()]);
          },
          error: (error) => {
            this.loadingSubject.next(false);
            this.errorSubject.next(error.message || 'Email ou mot de passe incorrect');
            console.error('❌ Erreur de connexion:', error);
          }
        });
    } else {
      // Marque tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.loginForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) {
        return `Le champ ${fieldName === 'email' ? 'identifiant' : fieldName} est requis`;
      }
    }
    return null;
  }
}
