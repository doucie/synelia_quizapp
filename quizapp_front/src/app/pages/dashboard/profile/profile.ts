import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService, User as AuthUser } from '../../../core/services/auth/auth.service';
import { UserService } from '../../../core/services/user.service';
import { UserBusinessGroupService } from '../../../core/services/user-business-group.service';
import { BusinessGroupCrudService, BusinessGroup } from '../../../core/services/business-group-crud.service';
import { GroupChangeRequestService, GroupChangeRequest } from '../../../core/services/group-change-request.service';

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

  // Business groups
  userGroups = signal<BusinessGroup[]>([]);
  groupsLoading = signal(false);

  // Group change request
  allGroups = signal<BusinessGroup[]>([]);
  pendingRequests = signal<GroupChangeRequest[]>([]);
  showGroupRequestModal = signal(false);
  selectedTargetGroupId = signal<number | null>(null);
  requestReason = signal('');
  requestLoading = signal(false);
  requestMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private http: HttpClient,
    private userBusinessGroupService: UserBusinessGroupService,
    private businessGroupService: BusinessGroupCrudService,
    private groupChangeRequestService: GroupChangeRequestService
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
        this.loadUserGroups(Number(u.id));
        this.loadPendingRequests(Number(u.id));
      }
    });
  }

  private loadUserGroups(userId: number) {
    this.groupsLoading.set(true);
    this.userBusinessGroupService.getAllByCriteria({ userId, isDeleted: false, size: 100 }).subscribe({
      next: (response) => {
        const groupIds = response.content
          .map(ubg => ubg.businessGroupId)
          .filter((id): id is number => id !== undefined);

        if (groupIds.length === 0) {
          this.userGroups.set([]);
          this.groupsLoading.set(false);
          return;
        }

        this.businessGroupService.getAllByCriteria({ isDeleted: false, size: 100 }).subscribe({
          next: (groupsResponse) => {
            const groups = groupsResponse.content.filter(g => g.id !== undefined && groupIds.includes(g.id));
            this.userGroups.set(groups);
            this.groupsLoading.set(false);
          },
          error: () => {
            this.userGroups.set([]);
            this.groupsLoading.set(false);
          }
        });
      },
      error: () => {
        this.userGroups.set([]);
        this.groupsLoading.set(false);
      }
    });
  }

  private loadPendingRequests(userId: number) {
    this.groupChangeRequestService.getAllByCriteria({ userId, status: 'PENDING', isDeleted: false, size: 100 }).subscribe({
      next: (response) => this.pendingRequests.set(response.content),
      error: () => this.pendingRequests.set([])
    });
  }

  private loadAllGroups() {
    this.businessGroupService.getAllByCriteria({ isDeleted: false, size: 100 }).subscribe({
      next: (response) => this.allGroups.set(response.content),
      error: () => this.allGroups.set([])
    });
  }

  getAvailableGroups(): BusinessGroup[] {
    const currentGroupIds = this.userGroups().map(g => g.id);
    const pendingGroupIds = this.pendingRequests().map(r => r.targetGroupId);
    return this.allGroups().filter(g => g.id !== undefined && !currentGroupIds.includes(g.id) && !pendingGroupIds.includes(g.id));
  }

  openGroupRequestModal() {
    this.loadAllGroups();
    this.selectedTargetGroupId.set(null);
    this.requestReason.set('');
    this.requestMessage.set(null);
    this.showGroupRequestModal.set(true);
  }

  closeGroupRequestModal() {
    this.showGroupRequestModal.set(false);
  }

  submitGroupRequest() {
    const u = this.user();
    const targetGroupId = this.selectedTargetGroupId();
    if (!u || !targetGroupId) {
      this.requestMessage.set({ type: 'error', text: 'Veuillez sélectionner un groupe.' });
      return;
    }

    this.requestLoading.set(true);
    this.requestMessage.set(null);

    this.groupChangeRequestService.create({
      userId: Number(u.id),
      targetGroupId,
      reason: this.requestReason().trim() || undefined
    }).subscribe({
      next: (response) => {
        this.requestLoading.set(false);
        if (response?.hasError) {
          this.requestMessage.set({ type: 'error', text: response?.status?.message || 'Erreur lors de l\'envoi de la demande.' });
        } else {
          this.requestMessage.set({ type: 'success', text: 'Demande envoyée avec succès !' });
          this.loadPendingRequests(Number(u.id));
          setTimeout(() => this.closeGroupRequestModal(), 1500);
        }
      },
      error: () => {
        this.requestLoading.set(false);
        this.requestMessage.set({ type: 'error', text: 'Erreur lors de l\'envoi de la demande.' });
      }
    });
  }

  hasPendingRequestForGroup(groupId: number | undefined): boolean {
    if (!groupId) return false;
    return this.pendingRequests().some(r => r.targetGroupId === groupId);
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
