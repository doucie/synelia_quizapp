import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService, User, UserSearchCriteria, PagedResponse } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-entities-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-users.html',
  styleUrl: './entities-users.scss'
})
export class EntitiesUsersComponent implements OnInit, OnDestroy {
  // Exposer Math pour utilisation dans le template
  Math = Math;
  
  // Variable pour éviter les appels multiples
  private loadingTimeout: any;
  
  // Signaux pour la réactivité
  users = signal<User[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(this.getStoredPageSize()); // Utiliser la taille stockée ou 10 par défaut
  
  // Critères de recherche
  searchCriteria: UserSearchCriteria = {
    idDe: '',
    idA: '',
    nom: '',
    prenom: '',
    pseudo: '',
    email: '',
    telephone: '',
    role: '',
    search_string: ''
  };

  // Recherche rapide
  quickSearch = '';
  
  // État de la recherche avancée
  showAdvancedSearch = false;
  
  // Contrôle d'affichage des utilisateurs supprimés
  showDeletedUsers = true; // Par défaut, afficher tous les utilisateurs
  
  // Options de pagination avec 10 par défaut
  pageSizeOptions = [5, 10, 20, 50, 100];
  private readonly PAGE_SIZE_STORAGE_KEY = 'entities-users-page-size';
  
  // État de la popup de confirmation
  showDeleteConfirmation = false;
  userToDelete: User | null = null;
  
  // État de la popup de restauration
  showRestoreConfirmation = signal<boolean>(false);
  userToRestore = signal<User | null>(null);
  
  // Critères de recherche avancée
  advancedCriteria: UserSearchCriteria = {
    idDe: '',
    idA: '',
    nom: '',
    prenom: '',
    pseudo: '',
    email: '',
    telephone: '',
    role: '',
    isOnline: undefined,
    isDeleted: undefined,
    dateCreationDe: '',
    dateCreationA: '',
    dateModificationDe: '',
    dateModificationA: ''
  };

  // Rôles disponibles
  availableRoles = ['super', 'admin', 'recruiter'];

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('🚀 Initialisation EntitiesUsersComponent');
    console.log('📦 Taille de page au démarrage:', this.pageSize());
    this.loadUsers();
  }

  ngOnDestroy() {
    // Nettoyer le timeout s'il existe
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  /**
   * Récupère la taille de page stockée dans le localStorage
   */
  private getStoredPageSize(): number {
    try {
      const stored = localStorage.getItem(this.PAGE_SIZE_STORAGE_KEY);
      console.log('🔍 Valeur dans le cache:', stored);
      if (stored) {
        const size = parseInt(stored, 10);
        // Vérifier que la valeur est valide
        if (this.pageSizeOptions.includes(size)) {
          console.log('✅ Taille de page récupérée du cache:', size);
          return size;
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération de la taille de page:', error);
    }
    console.log('📋 Utilisation de la valeur par défaut: 10');
    return 10; // Valeur par défaut
  }

  /**
   * Stocke la taille de page dans le localStorage
   */
  private storePageSize(size: number): void {
    try {
      const key = this.PAGE_SIZE_STORAGE_KEY;
      const value = size.toString();
      console.log('💾 AVANT sauvegarde - clé:', key, 'valeur:', value);
      
      localStorage.setItem(key, value);
      
      // Vérification immédiate
      const stored = localStorage.getItem(key);
      console.log('🔍 APRÈS sauvegarde - valeur lue:', stored);
      console.log('📦 Taille de page sauvegardée dans le cache:', size);
    } catch (error) {
      console.warn('❌ Erreur lors de la sauvegarde de la taille de page:', error);
    }
  }

  /**
   * Charge la liste des utilisateurs
   */
  loadUsers() {
    // Annuler le timeout précédent s'il existe
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    
    // Débounce pour éviter les appels multiples rapides
    this.loadingTimeout = setTimeout(() => {
      this.performLoadUsers();
    }, 100);
  }

  /**
   * Exécute réellement le chargement des utilisateurs
   */
  private performLoadUsers() {
    this.isLoading.set(true);
    const serviceMethod = this.showDeletedUsers ? 'incluant supprimés' : 'actifs seulement';
    console.log(`📥 Chargement des utilisateurs (${serviceMethod})...`);
    console.log('🔍 Critères de recherche utilisés:', this.searchCriteria);

    const criteria = {
      ...this.searchCriteria,
      page: this.currentPage(),
      size: this.pageSize()
    };

    console.log('📤 Requête envoyée avec critères:', criteria);

    // Utiliser le bon service selon la checkbox
    const serviceCall = this.showDeletedUsers 
      ? this.userService.getAllUsersByCriteria(criteria)
      : this.userService.getByCriteria(criteria);

    serviceCall.subscribe({
      next: (response: PagedResponse<User>) => {
        console.log(`✅ RÉPONSE COMPLÈTE reçue (${serviceMethod}):`, response);
        console.log('📊 Nombre total d\'utilisateurs (totalElements):', response.totalElements);
        console.log('📊 Nombre d\'utilisateurs dans cette page:', response.content.length);
        console.log('📊 Page courante (number):', response.number || 'non défini');
        console.log('📊 Taille de page (size):', response.size || 'non défini');
        console.log('📊 Nombre total de pages:', response.totalPages || 'non défini');
        
        // Analyser les utilisateurs reçus
        const deletedUsers = response.content.filter(u => u.isDeleted);
        const activeUsers = response.content.filter(u => !u.isDeleted);
        const onlineUsers = response.content.filter(u => u.isOnline);
        
        console.log('📊 Utilisateurs supprimés dans cette page:', deletedUsers.length, deletedUsers);
        console.log('📊 Utilisateurs actifs dans cette page:', activeUsers.length, activeUsers);
        console.log('📊 Utilisateurs en ligne dans cette page:', onlineUsers.length, onlineUsers);
        
        this.users.set(response.content);
        this.totalElements.set(response.totalElements);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
        this.notificationService.error('Erreur', 'Erreur lors du chargement des utilisateurs');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Recherche des utilisateurs selon les critères
   */
  searchUsers() {
    console.log('🔍 Recherche avec critères:', this.searchCriteria);
    this.currentPage.set(0);
    this.loadUsers();
  }

  /**
   * Réinitialise les critères de recherche
   */
  clearSearch() {
    this.searchCriteria = {
      idDe: '',
      idA: '',
      nom: '',
      prenom: '',
      pseudo: '',
      email: '',
      telephone: '',
      role: '',
      search_string: ''
    };
    this.quickSearch = '';
    this.showAdvancedSearch = false;
    this.resetAdvancedSearch();
    this.searchUsers();
  }

  /**
   * Crée un nouvel utilisateur
   */
  createUser() {
    // TODO: Implémenter la création d'utilisateur
    this.notificationService.info('Information', 'Fonctionnalité de création en cours de développement');
  }

  /**
   * Édite un utilisateur
   */
  editUser(user: User) {
    // TODO: Implémenter l'édition d'utilisateur
    this.notificationService.info('Information', `Édition de l'utilisateur ${user.pseudo} en cours de développement`);
  }

  /**
   * Affiche la popup de confirmation pour supprimer un utilisateur
   */
  deleteUser(user: User) {
    this.userToDelete = user;
    this.showDeleteConfirmation = true;
  }

  /**
   * Confirme la suppression d'un utilisateur
   */
  confirmDeleteUser() {
    if (!this.userToDelete) return;
    
    this.userService.delete(this.userToDelete.id).subscribe({
      next: () => {
        this.notificationService.success('Succès', `Utilisateur ${this.userToDelete?.pseudo || this.userToDelete?.nom} supprimé avec succès`);
        
        // Marquer l'utilisateur comme supprimé dans la liste locale
        if (this.userToDelete) {
          this.userToDelete.isDeleted = true;
        }
        
        // Activer automatiquement l'affichage des utilisateurs supprimés
        this.showDeletedUsers = true;
        
        this.cancelDeleteUser();
        // Recharger la liste pour refléter les changements
        this.loadUsers();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la suppression:', error);
        this.notificationService.error('Erreur', 'Erreur lors de la suppression de l\'utilisateur');
        this.cancelDeleteUser();
      }
    });
  }

  /**
   * Annule la suppression d'un utilisateur
   */
  cancelDeleteUser() {
    this.showDeleteConfirmation = false;
    this.userToDelete = null;
  }

  /**
   * Affiche la popup de confirmation pour restaurer un utilisateur supprimé
   */
  restoreUser(user: User) {
    this.userToRestore.set(user);
    this.showRestoreConfirmation.set(true);
  }

  /**
   * Confirme la restauration d'un utilisateur
   */
  confirmRestoreUser() {
    const userToRestore = this.userToRestore();
    if (!userToRestore) return;
    
    this.userService.restore(userToRestore.id).subscribe({
      next: (response) => {
        this.notificationService.success('Succès', `Utilisateur ${userToRestore?.pseudo || userToRestore?.nom} restauré avec succès`);
        
        // Marquer l'utilisateur comme restauré dans la liste locale
        userToRestore.isDeleted = false;
        
        this.cancelRestoreUser();
        // Recharger la liste pour refléter les changements
        this.loadUsers();
      },
      error: (error: any) => {
        this.notificationService.error('Erreur', 'Erreur lors de la restauration de l\'utilisateur');
        this.cancelRestoreUser();
      }
    });
  }

  /**
   * Annule la restauration d'un utilisateur
   */
  cancelRestoreUser() {
    this.showRestoreConfirmation.set(false);
    this.userToRestore.set(null);
  }

  /**
   * Met à jour le statut en ligne d'un utilisateur
   */
  toggleUserOnlineStatus(user: User) {
    const newStatus = !user.isOnline;
    
    this.userService.updateOnlineStatus(user.id, newStatus).subscribe({
      next: () => {
        user.isOnline = newStatus;
        const status = newStatus ? 'en ligne' : 'hors ligne';
        this.notificationService.success('Succès', `Utilisateur ${user.pseudo} marqué comme ${status}`);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour du statut:', error);
        this.notificationService.error('Erreur', 'Erreur lors de la mise à jour du statut');
      }
    });
  }

  /**
   * Retourne le libellé français du rôle
   */
  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'super': 'Super Administrateur',
      'admin': 'Administrateur', 
      'recruiter': 'Recruteur'
    };
    return labels[role] || role;
  }

  /**
   * Gestion de la pagination
   */
  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadUsers();
  }

  /**
   * Gère l'événement de changement de la taille de page depuis le select
   */
  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newSize = parseInt(target.value, 10);
    console.log('🎯 onPageSizeChange - event.target.value:', target.value, '→ parseInt:', newSize);
    this.changePageSize(newSize);
  }

  /**
   * Change la taille de page et revient à la première page
   */
  changePageSize(newSize: number) {
    console.log('� DÉBUT changePageSize - valeur reçue:', newSize, 'type:', typeof newSize);
    console.log('�📝 Changement de taille de page:', this.pageSize(), '→', newSize);
    
    // Vérifier que newSize est un nombre valide
    if (isNaN(newSize) || !this.pageSizeOptions.includes(newSize)) {
      console.error('❌ Taille de page invalide:', newSize);
      return;
    }
    
    this.pageSize.set(newSize);
    this.storePageSize(newSize); // Sauvegarder dans le cache
    this.currentPage.set(0);
    this.loadUsers();
    
    console.log('✅ FIN changePageSize - nouvelle valeur stockée');
  }

  /**
   * Toggle l'affichage des utilisateurs supprimés
   */
  toggleDeletedUsers() {
    this.showDeletedUsers = !this.showDeletedUsers;
    console.log('🔄 Toggle utilisateurs supprimés:', this.showDeletedUsers ? 'ACTIVÉ' : 'DÉSACTIVÉ');
    console.log('📦 Taille de page actuelle avant toggle:', this.pageSize());
    this.currentPage.set(0); // Revenir à la première page
    console.log('📦 Taille de page actuelle après toggle:', this.pageSize());
    this.loadUsers();
  }

  /**
   * Retourne vers la page des entités
   */
  goBackToEntities() {
    this.router.navigate(['/dashboard/entities']);
  }

  /**
   * TrackBy function pour optimiser les performances de rendu de la liste
   */
  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  /**
   * Recherche rapide utilisant search_string
   */
  onQuickSearch() {
    // Réinitialiser les critères de recherche individuels
    this.searchCriteria.idDe = '';
    this.searchCriteria.idA = '';
    this.searchCriteria.nom = '';
    this.searchCriteria.prenom = '';
    this.searchCriteria.email = '';
    this.searchCriteria.pseudo = '';
    this.searchCriteria.telephone = '';
    this.searchCriteria.role = '';
    this.searchCriteria.isOnline = undefined;
    this.searchCriteria.isDeleted = undefined;
    
    // Utiliser search_string pour la recherche globale
    this.searchCriteria.search_string = this.quickSearch.trim();
    
    // Fermer la recherche avancée si elle était ouverte
    this.showAdvancedSearch = false;
    
    // Débounce pour éviter trop de requêtes
    setTimeout(() => {
      this.searchUsers();
    }, 300);
  }

  /**
   * Ouvre/ferme la recherche avancée
   */
  openAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  /**
   * Applique les filtres avancés
   */
  applyAdvancedSearch() {
    // Copier les critères avancés vers les critères principaux
    this.searchCriteria = { ...this.advancedCriteria };
    
    // Vider la recherche rapide car on utilise les critères détaillés
    this.quickSearch = '';
    this.searchCriteria.search_string = '';
    
    // Lancer la recherche
    this.searchUsers();
  }

  /**
   * Réinitialise les filtres avancés
   */
  resetAdvancedSearch() {
    this.advancedCriteria = {
      idDe: '',
      idA: '',
      nom: '',
      prenom: '',
      pseudo: '',
      email: '',
      telephone: '',
      role: '',
      isOnline: undefined,
      isDeleted: undefined,
      dateCreationDe: '',
      dateCreationA: '',
      dateModificationDe: '',
      dateModificationA: ''
    };
    this.applyAdvancedSearch();
  }

  /**
   * Compte les utilisateurs en ligne
   */
  getOnlineUsersCount(): number {
    return this.users().filter(user => user.isOnline).length;
  }

  /**
   * Compte les utilisateurs hors ligne
   */
  getOfflineUsersCount(): number {
    return this.users().filter(user => !user.isOnline).length;
  }

  /**
   * Génère les numéros de pages pour la pagination
   */
  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalElements() / this.pageSize());
    const pages: number[] = [];
    const currentPage = this.currentPage();
    
    // Afficher au maximum 5 pages autour de la page courante
    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages, start + 5);
    
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  /**
   * Vérifie s'il y a une page précédente
   */
  hasPreviousPage(): boolean {
    return this.currentPage() > 0;
  }

  /**
   * Vérifie s'il y a une page suivante
   */
  hasNextPage(): boolean {
    return this.currentPage() < Math.ceil(this.totalElements() / this.pageSize()) - 1;
  }

  /**
   * Va à la page précédente
   */
  previousPage() {
    if (this.hasPreviousPage()) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  /**
   * Va à la page suivante
   */
  nextPage() {
    if (this.hasNextPage()) {
      this.goToPage(this.currentPage() + 1);
    }
  }
}
