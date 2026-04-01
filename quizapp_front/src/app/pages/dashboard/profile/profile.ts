import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService, User as AuthUser } from '../../../core/services/auth/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {

  user = signal<AuthUser | null>(null);
  initials = signal('?');

  // Profile edit
  editMode = signal(false);
  profileForm = signal({ firstName: '', lastName: '' });
  profileLoading = signal(false);
  profileMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change
  passwordForm = signal({ currentPassword: '', newPassword: '', confirmPassword: '' });
  passwordLoading = signal(false);
  passwordMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(u => {
      this.user.set(u);
      if (u) {
        const first = (u.firstName || '').charAt(0).toUpperCase();
        const last = (u.lastName || '').charAt(0).toUpperCase();
        this.initials.set((first + last) || '?');
        if (!this.editMode()) {
          this.profileForm.set({ firstName: u.firstName || '', lastName: u.lastName || '' });
        }
      }
    });
  }

  toggleEditMode() {
    if (this.editMode()) {
      const u = this.user();
      if (u) {
        this.profileForm.set({ firstName: u.firstName || '', lastName: u.lastName || '' });
      }
    }
    this.editMode.set(!this.editMode());
    this.profileMessage.set(null);
  }

  saveProfile() {
    const u = this.user();
    if (!u) return;

    const form = this.profileForm();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      this.profileMessage.set({ type: 'error', text: 'Le prénom et le nom sont requis.' });
      return;
    }

    this.profileLoading.set(true);
    this.profileMessage.set(null);

    this.userService.update(Number(u.id), {
      prenom: form.firstName.trim(),
      nom: form.lastName.trim()
    }).subscribe({
      next: () => {
        this.profileLoading.set(false);
        this.editMode.set(false);
        this.profileMessage.set({ type: 'success', text: 'Profil mis à jour avec succès.' });
        this.authService.updateCurrentUser({
          ...u,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim()
        });
      },
      error: () => {
        this.profileLoading.set(false);
        this.profileMessage.set({ type: 'error', text: 'Erreur lors de la mise à jour du profil.' });
      }
    });
  }

  changePassword() {
    const form = this.passwordForm();
    const u = this.user();
    if (!u) return;

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      this.passwordMessage.set({ type: 'error', text: 'Tous les champs sont requis.' });
      return;
    }

    if (form.newPassword.length < 6) {
      this.passwordMessage.set({ type: 'error', text: 'Le nouveau mot de passe doit faire au moins 6 caractères.' });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      this.passwordMessage.set({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    this.passwordLoading.set(true);
    this.passwordMessage.set(null);

    // Use the dedicated backend endpoint for password change
    this.http.post<any>('/userManager/changerMotDePasse', {
      data: {
        email: u.email,
        oldPassword: form.currentPassword,
        password: form.newPassword
      },
      user: u.id
    }).subscribe({
      next: (response) => {
        this.passwordLoading.set(false);
        if (response?.hasError) {
          this.passwordMessage.set({ type: 'error', text: response?.status?.message || 'Le mot de passe actuel est incorrect.' });
        } else {
          this.passwordMessage.set({ type: 'success', text: 'Mot de passe modifié avec succès.' });
          this.passwordForm.set({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
      },
      error: () => {
        this.passwordLoading.set(false);
        this.passwordMessage.set({ type: 'error', text: 'Erreur lors de la modification du mot de passe.' });
      }
    });
  }

  getRoleBadgeClass(): string {
    const role = this.user()?.role || '';
    switch (role) {
      case 'super': return 'role-badge--super';
      case 'admin': return 'role-badge--admin';
      case 'recruiter': return 'role-badge--recruiter';
      default: return '';
    }
  }

  getRoleLabel(): string {
    const role = this.user()?.role || '';
    switch (role) {
      case 'super': return 'Super Administrateur';
      case 'admin': return 'Administrateur';
      case 'recruiter': return 'Recruteur';
      default: return role;
    }
  }
}
