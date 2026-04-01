import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvitationCodeService, InvitationCode } from '../../core/services/invitation-code.service';

@Component({
  selector: 'app-inscription',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './inscription.html',
  styleUrls: ['./inscription.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InscriptionComponent implements OnInit {
  step = signal<'code' | 'register' | 'success' | 'error'>('code');
  codeInput = signal('');
  invitation = signal<InvitationCode | null>(null);
  validatingCode = signal(false);
  registering = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  form = signal({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invitationCodeService: InvitationCodeService
  ) {}

  ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      this.codeInput.set(code);
      this.validateCode();
    }
  }

  updateForm(field: string, value: string) {
    this.form.set({ ...this.form(), [field]: value });
  }

  validateCode() {
    const code = this.codeInput().trim();
    if (!code) {
      this.errorMessage.set('Veuillez saisir un code d\'invitation');
      return;
    }
    this.validatingCode.set(true);
    this.errorMessage.set('');

    this.invitationCodeService.validateCode(code).subscribe({
      next: (invitation) => {
        this.invitation.set(invitation);
        this.step.set('register');
        this.validatingCode.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.message || 'Code d\'invitation invalide ou expiré');
        this.validatingCode.set(false);
      }
    });
  }

  register() {
    const f = this.form();
    if (!f.firstName.trim() || !f.lastName.trim() || !f.password.trim()) {
      this.errorMessage.set('Tous les champs sont requis');
      return;
    }
    if (f.password !== f.confirmPassword) {
      this.errorMessage.set('Les mots de passe ne correspondent pas');
      return;
    }
    if (f.password.length < 8) {
      this.errorMessage.set('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    this.registering.set(true);
    this.errorMessage.set('');

    this.invitationCodeService.registerWithCode(
      this.codeInput().trim(),
      f.firstName.trim(),
      f.lastName.trim(),
      f.password
    ).subscribe({
      next: () => {
        this.step.set('success');
        this.registering.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.message || 'Erreur lors de la création du compte');
        this.registering.set(false);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/connexion']);
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }
}
