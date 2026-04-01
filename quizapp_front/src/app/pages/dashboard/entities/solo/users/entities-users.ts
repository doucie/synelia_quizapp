import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntityDetailPanelComponent, DetailField } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { DashboardStatsService } from '../../../../../core/services/dashboard-stats.service';
import { DependencyInfo } from '../../../../../shared/models/interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { UserService, User, UserSearchCriteria, PagedResponse } from '../../../../../core/services/user.service';
import { DepartmentService } from '../../../../../core/services/department.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { AuthService } from '../../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-entities-users',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-users.html',
  styleUrl: './entities-users.scss'
})
export class EntitiesUsersComponent implements OnInit, OnDestroy {
  // Exposer Math pour utilisation dans le template
  Math = Math;
  
  // Variable pour éviter les appels multiples
  private loadingTimeout: any;
  private destroy$ = new Subject<void>();

  // Detail panel
  selectedItem = signal<any>(null);
  showDetailPanel = signal<boolean>(false);
  detailFields: DetailField[] = [];

  selectItem(item: any): void {
    this.selectedItem.set(item);
    this.showDetailPanel.set(true);
  }

  closeDetailPanel(): void {
    this.showDetailPanel.set(false);
    this.selectedItem.set(null);
  }

  editFromDetail(item: any): void {
    this.closeDetailPanel();
    this.editUser(item);
  }

  deleteFromDetail(item: any): void {
    this.closeDetailPanel();
    this.deleteUser(item);
  }

  restoreFromDetail(item: any): void {
    this.closeDetailPanel();
    this.restoreUser(item);
  }
  
  // Signaux pour la réactivité
  users = signal<User[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10); // Valeur par défaut temporaire, sera mise à jour dans ngOnInit
  
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
  
  // Compteurs réels (total dans la BD)
  totalOnlineUsers = signal<number>(0);
  totalOfflineUsers = signal<number>(0);
  
  // Options de pagination avec 10 par défaut
  pageSizeOptions = [5, 10, 20, 50, 100];
  private readonly PAGE_SIZE_STORAGE_KEY = 'entities-users-page-size';
  
  // État de la popup de confirmation
  showDeleteConfirmation = false;
  // -- D�pendances FK ---------------------------
  private depService = inject(DashboardStatsService);
  dependencyInfo = signal<DependencyInfo | null>(null);
  showDependencyPopup = signal<boolean>(false);
  dependencyMode = signal<'delete' | 'restore'>('delete');

  closeDependencyPopup(): void {
    this.showDependencyPopup.set(false);
    this.dependencyInfo.set(null);
  }

  confirmDependencyAction(): void {
    const mode = this.dependencyMode();
    this.closeDependencyPopup();
    if (mode === 'delete') {
      this.showDeleteConfirmation = true;
    } else {
      this.showRestoreConfirmation.set(true);
    }
  }
  userToDelete: User | null = null;
  
  // État de la popup de restauration
  showRestoreConfirmation = signal<boolean>(false);
  userToRestore = signal<User | null>(null);
  
  // État de la popup d'édition
  showEditDialog = signal<boolean>(false);
  userToEdit = signal<User | null>(null);
  editFormData = {
    id: 0,
    nom: '',
    prenom: '',
    pseudo: '',
    email: '',
    telephone: '',
    role: ''
  };

  // État de la popup de création
  showCreateDialog = signal<boolean>(false);
  createFormData = {
    nom: '',
    prenom: '',
    pseudo: '',
    email: '',
    telephone: '',
    role: ''
  };
  
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
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    console.log('🚀 Initialisation EntitiesUsersComponent');
    await this.initializePageSizePreference();
    
    // Lire le paramètre page depuis l'URL (1-based) et convertir en 0-based
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const pageParam = params['page'];
      if (pageParam && !isNaN(+pageParam) && +pageParam > 0) {
        this.currentPage.set(+pageParam - 1); // Convertir 1-based en 0-based
      } else {
        this.currentPage.set(0);
      }
    });
    
    console.log('📦 Taille de page finale:', this.pageSize());
    this.loadUsers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    // Nettoyer le timeout s'il existe
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  /**
   * Initialise la préférence de taille de page de l'utilisateur
   */
  private async initializePageSizePreference(): Promise<void> {
    try {
      // Récupérer l'utilisateur connecté depuis AuthService
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && currentUser.id) {
        console.log('👤 Utilisateur connecté trouvé:', currentUser.id);
        
        // Récupérer les détails complets de l'utilisateur depuis l'API
        const userDetails = await this.userService.getById(parseInt(currentUser.id)).toPromise();
        if (userDetails && userDetails.pageSizePreference) {
          console.log('📏 Préférence de taille de page récupérée:', userDetails.pageSizePreference);
          this.pageSize.set(userDetails.pageSizePreference);
        } else {
          console.log('📋 Aucune préférence trouvée, utilisation de la valeur par défaut');
          this.pageSize.set(this.getStoredPageSize());
        }
      } else {
        console.log('⚠️ Aucun utilisateur connecté trouvé, utilisation de la valeur par défaut');
        this.pageSize.set(this.getStoredPageSize());
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la préférence de taille de page:', error);
      this.pageSize.set(this.getStoredPageSize());
    }

    console.log('📦 Taille de page finale:', this.pageSize());
    this.loadUsers();
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
    console.log('🔍 Critères de recherche utilisés:', JSON.stringify(this.searchCriteria, null, 2));

    const criteria = {
      ...this.searchCriteria,
      page: this.currentPage(),
      size: this.pageSize()
    };

    console.log('📤 Requête envoyée avec critères:', JSON.stringify(criteria, null, 2));

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
        
        // Mettre à jour les vrais compteurs d'utilisateurs en ligne/hors ligne
        this.updateRealCounts();
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
    // Réinitialiser le formulaire
    this.createFormData = {
      nom: '',
      prenom: '',
      pseudo: '',
      email: '',
      telephone: '',
      role: ''
    };
    this.showCreateDialog.set(true);
  }

  /**
   * Ferme la popup de création
   */
  closeCreateDialog() {
    this.showCreateDialog.set(false);
    this.createFormData = {
      nom: '',
      prenom: '',
      pseudo: '',
      email: '',
      telephone: '',
      role: ''
    };
  }

  /**
   * Valide et crée un nouvel utilisateur
   */
  async validateUserCreation() {
    const formData = this.createFormData;

    console.log('🔧 Début validation création - formData:', formData);

    // Validation des champs requis
    if (!formData.nom.trim()) {
      this.notificationService.warning('Attention', 'Le nom est requis');
      return;
    }
    if (!formData.prenom.trim()) {
      this.notificationService.warning('Attention', 'Le prénom est requis');
      return;
    }
    if (!formData.pseudo.trim()) {
      this.notificationService.warning('Attention', 'Le pseudo est requis');
      return;
    }
    if (!formData.email.trim()) {
      this.notificationService.warning('Attention', 'L\'email est requis');
      return;
    }
    if (!formData.role.trim()) {
      this.notificationService.warning('Attention', 'Le rôle est requis');
      return;
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      this.notificationService.warning('Attention', 'Format d\'email invalide');
      return;
    }

    try {
      // Appel de l'API pour créer un nouvel utilisateur
      console.log('🔧 Création d\'un nouvel utilisateur');

      // Récupérer l'utilisateur connecté
      const currentUser = this.authService.getCurrentUser();
      console.log('👤 Utilisateur connecté:', currentUser);

      const newUser: any = await this.userService.create({
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        pseudo: formData.pseudo.trim(),
        email: formData.email.trim(),
        telephone: formData.telephone.trim(),
        role: formData.role
      }, currentUser?.id ? parseInt(currentUser.id.toString()) : undefined).toPromise();

      console.log('✅ Utilisateur créé:', newUser);
      console.log('✅ Response hasError:', newUser?.hasError);
      console.log('✅ Response httpCode:', newUser?.httpCode);
      console.log('✅ Response status:', newUser?.status);

      // Vérifier si la réponse indique une erreur
      if (newUser && newUser.hasError) {
        console.error('❌ Erreur détectée dans la réponse:', newUser);
        console.error('❌ Status object:', newUser.status);
        console.error('❌ Status message:', newUser.status?.message);
        console.error('❌ Status code:', newUser.status?.code);
        console.error('❌ HTTP Code:', newUser.httpCode);

        const errorMessage = newUser.status?.message || newUser.status?.code || 'Erreur lors de la création';
        this.notificationService.error('Erreur', errorMessage);
        return;
      }

      // Vérifier le httpCode seulement s'il existe
      if (newUser && newUser.httpCode && newUser.httpCode !== 201) {
        console.error('❌ Code HTTP d\'erreur:', newUser.httpCode);
        this.notificationService.error('Erreur', `Erreur HTTP: ${newUser.httpCode}`);
        return;
      }

      this.notificationService.success('Succès', `Utilisateur ${formData.pseudo} créé avec succès`);
      this.closeCreateDialog();
      this.loadUsers(); // Recharger la liste
    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error);
      console.error('❌ Détail de l\'erreur:', error?.error);
      this.notificationService.error('Erreur', `Erreur lors de la création: ${error?.error?.message || error?.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Édite un utilisateur
   */
  editUser(user: User) {
    this.userToEdit.set(user);
    this.editFormData = {
      id: user.id,
      nom: user.nom || '',
      prenom: user.prenom || '',
      pseudo: user.pseudo || '',
      email: user.email || '',
      telephone: user.telephone || '',
      role: user.role || ''
    };
    this.showEditDialog.set(true);
  }

  /**
   * Ferme la popup d'édition
   */
  closeEditDialog() {
    this.showEditDialog.set(false);
    this.userToEdit.set(null);
    this.editFormData = {
      id: 0,
      nom: '',
      prenom: '',
      pseudo: '',
      email: '',
      telephone: '',
      role: ''
    };
  }

  /**
   * Valide et sauvegarde les modifications
   */
  async validateUserEdit() {
    const formData = this.editFormData;
    const currentUser = this.userToEdit();
    
    console.log('🔧 Début validation - formData:', formData);
    console.log('🔧 Début validation - currentUser:', currentUser);
    
    if (!currentUser) {
      this.notificationService.error('Erreur', 'Aucun utilisateur sélectionné pour modification');
      return;
    }

    // Validation des champs requis
    if (!formData.nom.trim()) {
      this.notificationService.warning('Attention', 'Le nom est requis');
      return;
    }
    if (!formData.prenom.trim()) {
      this.notificationService.warning('Attention', 'Le prénom est requis');
      return;
    }
    if (!formData.pseudo.trim()) {
      this.notificationService.warning('Attention', 'Le pseudo est requis');
      return;
    }
    if (!formData.email.trim()) {
      this.notificationService.warning('Attention', 'L\'email est requis');
      return;
    }
    if (!formData.role.trim()) {
      this.notificationService.warning('Attention', 'Le rôle est requis');
      return;
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      this.notificationService.warning('Attention', 'Format d\'email invalide');
      return;
    }

    try {
      // Appel de l'API pour mettre à jour un utilisateur unique avec update
      console.log('🔧 Utilisation de update pour un utilisateur unique');
      
      const updatedUser: any = await this.userService.update(currentUser.id, {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        pseudo: formData.pseudo.trim(),
        email: formData.email.trim(),
        telephone: formData.telephone.trim(),
        role: formData.role
      }).toPromise();

      console.log('✅ Utilisateur mis à jour:', updatedUser);
      console.log('✅ Response hasError:', updatedUser?.hasError);
      console.log('✅ Response httpCode:', updatedUser?.httpCode);
      console.log('✅ Response status:', updatedUser?.status);

      // Vérifier si la réponse indique une erreur
      if (updatedUser && updatedUser.hasError) {
        console.error('❌ Erreur détectée dans la réponse:', updatedUser);
        console.error('❌ Status object:', updatedUser.status);
        console.error('❌ Status message:', updatedUser.status?.message);
        console.error('❌ Status code:', updatedUser.status?.code);
        console.error('❌ HTTP Code:', updatedUser.httpCode);
        
        const errorMessage = updatedUser.status?.message || updatedUser.status?.code || 'Erreur lors de la mise à jour';
        this.notificationService.error('Erreur', errorMessage);
        return;
      }

      // Vérifier le httpCode seulement s'il existe
      if (updatedUser && updatedUser.httpCode && updatedUser.httpCode !== 200) {
        console.error('❌ Code HTTP d\'erreur:', updatedUser.httpCode);
        this.notificationService.error('Erreur', `Erreur HTTP: ${updatedUser.httpCode}`);
        return;
      }

      this.notificationService.success('Succès', `Utilisateur ${formData.pseudo} modifié avec succès`);
      this.closeEditDialog();
      this.loadUsers(); // Recharger la liste
    } catch (error: any) {
      console.error('❌ Erreur lors de la modification:', error);
      console.error('❌ Détail de l\'erreur:', error?.error);
      this.notificationService.error('Erreur', `Erreur lors de la modification: ${error?.error?.message || error?.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Supprime l'utilisateur depuis la popup d'édition
   */
  deleteUserFromEdit() {
    const user = this.userToEdit();
    if (user) {
      this.closeEditDialog();
      this.deleteUser(user);
    }
  }

  /**
   * Affiche la popup de confirmation pour supprimer un utilisateur
   */
  deleteUser(user: User) {
    this.userToDelete = user;
    this.depService.checkDependencies('users', user.id).subscribe({
      next: (info) => {
        if (info.totalDependencies > 0) {
          this.dependencyInfo.set(info);
          this.dependencyMode.set('delete');
          this.showDependencyPopup.set(true);
        } else {
          this.showDeleteConfirmation = true;
        }
      },
      error: () => this.showDeleteConfirmation = true
    });
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
    this.depService.checkParent('users', user.id).subscribe({
      next: (info) => {
        if (info.deletedParents && info.deletedParents.length > 0) {
          this.dependencyInfo.set(info);
          this.dependencyMode.set('restore');
          this.showDependencyPopup.set(true);
        } else {
          this.showRestoreConfirmation.set(true);
        }
      },
      error: () => this.showRestoreConfirmation.set(true)
    });
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
    // Mettre à jour l'URL avec le numéro de page (convertir 0-based en 1-based)
    this.router.navigate(['/dashboard/entities/users', page + 1]);
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
    
    // Sauvegarder la préférence dans la base de données
    this.userService.updatePageSizePreference(newSize).subscribe({
      next: (response) => {
        console.log('💾 Préférence de taille de page sauvegardée en BD:', response);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la sauvegarde de la préférence de taille de page:', error);
        // Ne pas bloquer l'interface si la sauvegarde échoue
      }
    });
    
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
   * Compte les utilisateurs en ligne (total réel dans la BD)
   */
  getOnlineUsersCount(): number {
    return this.totalOnlineUsers();
  }

  /**
   * Compte les utilisateurs hors ligne (total réel dans la BD)
   */
  getOfflineUsersCount(): number {
    return this.totalOfflineUsers();
  }

  /**
   * Met à jour les vrais compteurs d'utilisateurs en ligne/hors ligne
   */
  private updateRealCounts() {
    // Compter les utilisateurs en ligne (isOnline = true) - appel léger avec size=1
    const onlineCriteria = { ...this.searchCriteria, isOnline: true, page: 0, size: 1 };
    this.userService.getByCriteria(onlineCriteria).subscribe({
      next: (response) => {
        this.totalOnlineUsers.set(response.totalElements);
      },
      error: (error) => console.error('Erreur lors du comptage des utilisateurs en ligne:', error)
    });

    // Compter tous les utilisateurs actifs (isDeleted = false) pour calculer hors ligne
    const allActiveCriteria = { ...this.searchCriteria, isDeleted: false, page: 0, size: 1 };
    this.userService.getByCriteria(allActiveCriteria).subscribe({
      next: (response) => {
        const totalActive = response.totalElements;
        // Petite attente pour s'assurer que totalOnline est mis à jour
        setTimeout(() => {
          const totalOnline = this.totalOnlineUsers();
          this.totalOfflineUsers.set(totalActive - totalOnline);
        }, 100);
      },
      error: (error) => console.error('Erreur lors du comptage total des utilisateurs actifs:', error)
    });
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

  /**
   * Convertit une date française (jj/mm/aaaa) en objet Date
   */
  parseFrenchDate(dateString: string): Date | null {
    if (!dateString) return null;

    // Format attendu: "16/09/2025" ou "16/09/2025 14:30"
    const parts = dateString.split(' ');
    const datePart = parts[0]; // "16/09/2025"
    const timePart = parts[1] || '00:00'; // "14:30" ou "00:00" par défaut

    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    // Validation basique
    if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hours) || isNaN(minutes)) {
      return null;
    }

    // Créer la date (les mois commencent à 0 en JavaScript)
    return new Date(year, month - 1, day, hours, minutes);
  }

  /**
   * Formate la date de création pour l'affichage
   */
  formatCreationDate(user: User): string {
    if (!user.dateCreation) return '-';

    // Si la date ne contient pas d'heures (format "jj/mm/aaaa"), afficher seulement la date
    if (!user.dateCreation.includes(' ')) {
      const date = this.parseFrenchDate(user.dateCreation);
      if (!date) return user.dateCreation;
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }

    // Si la date contient des heures, les afficher
    const date = this.parseFrenchDate(user.dateCreation);
    if (!date) return user.dateCreation;

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
