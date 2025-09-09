import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserService, UserManagement as User, UserSearchCriteria, PagedResponse } from '../../../core/services';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  users: User[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;
  loading = false;
  
  // Critères de recherche
  searchCriteria: UserSearchCriteria = {};
  
  // Modals
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedUser: User | null = null;
  
  // Formulaires
  userForm: FormGroup;
  
  // Rôles disponibles
  availableRoles = ['ADMIN', 'RECRUITER', 'USER'];

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      pseudo: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      role: ['USER', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge la liste des utilisateurs selon les critères
   */
  loadUsers(): void {
    this.loading = true;
    
    const criteria: UserSearchCriteria = {
      ...this.searchCriteria,
      page: this.currentPage,
      size: this.pageSize
    };

    this.userService.getByCriteria(criteria)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PagedResponse<User>) => {
          this.users = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          this.loading = false;
        }
      });
  }

  /**
   * Recherche avec critères
   */
  onSearch(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  /**
   * Réinitialise les critères de recherche
   */
  onClearSearch(): void {
    this.searchCriteria = {};
    this.currentPage = 0;
    this.loadUsers();
  }

  /**
   * Change de page
   */
  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  /**
   * Ouvre le modal de création
   */
  openCreateModal(): void {
    this.selectedUser = null;
    this.userForm.reset();
    this.userForm.patchValue({ role: 'USER' });
    this.showCreateModal = true;
  }

  /**
   * Ouvre le modal d'édition
   */
  openEditModal(user: User): void {
    this.selectedUser = user;
    this.userForm.patchValue({
      nom: user.nom,
      prenom: user.prenom,
      pseudo: user.pseudo,
      email: user.email,
      telephone: user.telephone,
      role: user.role
    });
    this.showEditModal = true;
  }

  /**
   * Ouvre le modal de suppression
   */
  openDeleteModal(user: User): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  /**
   * Ferme tous les modals
   */
  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  /**
   * Sauvegarde un utilisateur (création ou modification)
   */
  saveUser(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      
      if (this.selectedUser) {
        // Modification
        this.userService.update(this.selectedUser.id, userData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadUsers();
              this.closeModals();
            },
            error: (error) => {
              console.error('Erreur lors de la modification:', error);
            }
          });
      } else {
        // Création
        this.userService.create(userData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadUsers();
              this.closeModals();
            },
            error: (error) => {
              console.error('Erreur lors de la création:', error);
            }
          });
      }
    }
  }

  /**
   * Supprime un utilisateur
   */
  deleteUser(): void {
    if (this.selectedUser) {
      this.userService.delete(this.selectedUser.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadUsers();
            this.closeModals();
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
          }
        });
    }
  }

  /**
   * Bascule le statut en ligne d'un utilisateur
   */
  toggleOnlineStatus(user: User): void {
    this.userService.updateOnlineStatus(user.id, !user.isOnline)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          user.isOnline = !user.isOnline;
        },
        error: (error) => {
          console.error('Erreur lors du changement de statut:', error);
        }
      });
  }

  /**
   * Retourne les pages à afficher dans la pagination
   */
  getVisiblePages(): number[] {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(0, this.currentPage - half);
    let end = Math.min(this.totalPages - 1, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  /**
   * Retourne le libellé du rôle
   */
  getRoleLabel(role: string): string {
    switch(role) {
      case 'ADMIN': return 'Administrateur';
      case 'RECRUITER': return 'Recruteur';
      case 'USER': return 'Utilisateur';
      default: return role;
    }
  }

  /**
   * Retourne la classe CSS pour le statut
   */
  getStatusClass(isOnline: boolean): string {
    return isOnline ? 'status-online' : 'status-offline';
  }

  /**
   * Retourne le texte du statut
   */
  getStatusText(isOnline: boolean): string {
    return isOnline ? 'En ligne' : 'Hors ligne';
  }
}
