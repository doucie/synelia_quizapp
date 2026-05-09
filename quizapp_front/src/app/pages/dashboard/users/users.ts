import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserService, UserManagement as User } from '../../../core/services';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../shared/filter-select/filter-select';

interface UserFormData {
  id?: number;
  prenom: string;
  nom: string;
  pseudo: string;
  email: string;
  telephone: string;
  role: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterSelectComponent, FilterSelectOptionDirective],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  users = signal<User[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  filterStatus = signal<'all' | 'online' | 'offline'>('all');
  
  // Modals
  showCreateEditModal = signal(false);
  showDeleteModal = signal(false);
  
  // Form data
  userForm = signal<UserFormData>({
    prenom: '',
    nom: '',
    pseudo: '',
    email: '',
    telephone: '',
    role: 'recruiter'
  });
  
  isEditMode = signal(false);
  selectedUser = signal<User | null>(null);
  
  // Delete confirmation
  deleteEmailConfirmation = signal('');
  
  // Check admin mode
  currentUser = computed(() => this.authService.getCurrentUser());
  isAdminModeEnabled = signal(false);
  
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    // Effect pour mettre à jour isAdminModeEnabled quand currentUser change
    effect(() => {
      const user = this.currentUser();
      this.isAdminModeEnabled.set(user?.adminMode || false);
      console.log('🔄 Admin mode updated in UsersComponent:', user?.adminMode);
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Computed
  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const status = this.filterStatus();
    let filtered = this.users();
    
    // Filtrer par recherche
    if (query) {
      filtered = filtered.filter(user => 
        (user.nom || '').toLowerCase().includes(query) ||
        (user.prenom || '').toLowerCase().includes(query) ||
        (user.pseudo || '').toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }
    
    // Filtrer par statut
    if (status !== 'all') {
      filtered = filtered.filter(user => 
        status === 'online' ? user.isOnline : !user.isOnline
      );
    }
    
    return filtered;
  });

  /**
   * Charge tous les utilisateurs
   */
  loadUsers(): void {
    this.loading.set(true);
    
    // Charger TOUS les utilisateurs (pagination désactivée avec size = 100)
    this.userService.getByCriteria({ size: 100, page: 0 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('📊 [UsersComponent] Réponse reçue:', response);
          console.log('📊 [UsersComponent] Nombre d\'utilisateurs:', response.content?.length);
          console.log('📊 [UsersComponent] Utilisateurs par rôle:', 
            response.content?.reduce((acc: any, user: User) => {
              acc[user.role] = (acc[user.role] || 0) + 1;
              return acc;
            }, {})
          );
          this.users.set(response.content || []);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          this.loading.set(false);
        }
      });
  }

  /**
   * Obtient les initiales d'un utilisateur pour l'avatar
   */
  getUserInitials(user: User): string {
    const firstInitial = user.prenom?.charAt(0) || '';
    const lastInitial = user.nom?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  /**
   * Retourne le libellé du rôle
   */
  getRoleLabel(role: string): string {
    switch(role) {
      case 'super': return 'Super Admin';
      case 'admin': return 'Administrateur';
      case 'recruiter': return 'Recruteur';
      default: return role;
    }
  }

  /**
   * Obtient la couleur de l'avatar selon le rôle
   */
  getAvatarColor(role: string): string {
    const colors: Record<string, string> = {
      'super': 'avatar-super',
      'admin': 'avatar-admin',
      'recruiter': 'avatar-recruiter'
    };
    return colors[role] || 'avatar-recruiter';
  }

  /**
   * Compte les utilisateurs en ligne
   */
  getOnlineCount(): number {
    return this.users().filter(u => u.isOnline).length;
  }

  /**
   * Compte les utilisateurs hors ligne
   */
  getOfflineCount(): number {
    return this.users().filter(u => !u.isOnline).length;
  }

  /**
   * Met à jour un champ du formulaire
   */
  updateFormField(field: keyof UserFormData, value: any): void {
    this.userForm.update(form => ({ ...form, [field]: value }));
  }

  /**
   * Ouvre le modal de création
   */
  openCreateModal(): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    
    this.isEditMode.set(false);
    this.userForm.set({
      prenom: '',
      nom: '',
      pseudo: '',
      email: '',
      telephone: '',
      role: 'recruiter'
    });
    this.showCreateEditModal.set(true);
  }

  /**
   * Ouvre le modal d'édition
   */
  openEditModal(user: User): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    
    this.isEditMode.set(true);
    this.selectedUser.set(user);
    this.userForm.set({
      id: user.id,
      prenom: user.prenom || '',
      nom: user.nom || '',
      pseudo: user.pseudo || '',
      email: user.email,
      telephone: user.telephone || '',
      role: user.role
    });
    this.showCreateEditModal.set(true);
  }

  /**
   * Ferme le modal de création/édition
   */
  closeCreateEditModal(): void {
    this.showCreateEditModal.set(false);
    this.selectedUser.set(null);
  }

  /**
   * Sauvegarde l'utilisateur (création ou modification)
   */
  saveUser(): void {
    const form = this.userForm();
    
    // Validation basique
    if (!form.email || !form.prenom || !form.nom || !form.pseudo) {
      this.notificationService.error('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.loading.set(true);
    
    if (this.isEditMode()) {
      // Mise à jour
      this.userService.update(form.id!, {
        id: form.id!,
        prenom: form.prenom,
        nom: form.nom,
        pseudo: form.pseudo,
        email: form.email,
        telephone: form.telephone,
        role: form.role,
        isOnline: false
      }).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Succès', 'Utilisateur modifié avec succès');
            this.closeCreateEditModal();
            this.loadUsers();
          },
          error: (error) => {
            console.error('Erreur lors de la modification:', error);
            this.notificationService.error('Erreur', 'Impossible de modifier l\'utilisateur');
            this.loading.set(false);
          }
        });
    } else {
      // Création
      const currentUserId = parseInt(this.currentUser()?.id || '1');
      
      this.userService.create({
        prenom: form.prenom,
        nom: form.nom,
        pseudo: form.pseudo,
        email: form.email,
        telephone: form.telephone,
        role: form.role,
        isOnline: false
      }, currentUserId).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Succès', 'Utilisateur créé avec succès');
            this.closeCreateEditModal();
            this.loadUsers();
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.notificationService.error('Erreur', 'Impossible de créer l\'utilisateur');
            this.loading.set(false);
          }
        });
    }
  }

  /**
   * Ouvre le modal de suppression
   */
  openDeleteModal(user: User): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    
    this.selectedUser.set(user);
    this.deleteEmailConfirmation.set('');
    this.showDeleteModal.set(true);
  }

  /**
   * Ferme le modal de suppression
   */
  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.selectedUser.set(null);
    this.deleteEmailConfirmation.set('');
  }

  /**
   * Vérifie si l'email de confirmation correspond
   */
  canConfirmDelete(): boolean {
    const user = this.selectedUser();
    if (!user) return false;
    return this.deleteEmailConfirmation().toLowerCase() === user.email.toLowerCase();
  }

  /**
   * Supprime l'utilisateur
   */
  confirmDelete(): void {
    const user = this.selectedUser();
    if (!user || !this.canConfirmDelete()) {
      return;
    }

    this.loading.set(true);
    
    this.userService.delete(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succès', 'Utilisateur supprimé avec succès');
          this.closeDeleteModal();
          this.loadUsers();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.notificationService.error('Erreur', 'Impossible de supprimer l\'utilisateur');
          this.loading.set(false);
        }
      });
  }
}
