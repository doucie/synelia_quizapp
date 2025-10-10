import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserService, UserManagement as User } from '../../../core/services';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  users = signal<User[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  filterStatus = signal<'all' | 'online' | 'offline'>('all');
  
  constructor(private userService: UserService) {}

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
}
