import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService, User, UserSearchCriteria, PagedResponse } from '../../../../core/services/user.service';
import { DepartmentService, Department, DepartmentSearchCriteria } from '../../../../core/services/department.service';
import { NotificationService } from '../../../../core/services/notification.service';

// Interface pour les départements (utilisant temporairement UserService)
// REMOVED: Interface Department moved to service
// REMOVED: Interface DepartmentSearchCriteria moved to service

@Component({
  selector: 'app-entities-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-departments.html',
  styleUrl: './entities-departments.scss'
})
export class EntitiesDepartmentsComponent implements OnInit, OnDestroy {
  // Exposer Math pour utilisation dans le template
  Math = Math;

  // Variable pour éviter les appels multiples
  private loadingTimeout: any;

  // Signaux pour la réactivité
  departments = signal<Department[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(this.getStoredPageSize()); // Utiliser la taille stockée ou 10 par défaut

  // Critères de recherche
  searchCriteria: DepartmentSearchCriteria = {
    idDe: '',
    idA: '',
    nom: '',
    description: '',
    search_string: ''
  };

  // Recherche rapide
  quickSearch = '';

  // État de la recherche avancée
  showAdvancedSearch = false;

  // Contrôle d'affichage des départements supprimés
  showDeletedDepartments = true; // Par défaut, afficher tous les départements

  // Options de pagination avec 10 par défaut
  pageSizeOptions = [5, 10, 20, 50, 100];
  private readonly PAGE_SIZE_STORAGE_KEY = 'entities-departments-page-size';

  // État des modals
  showModal = false;
  showDeleteModal = false;
  showRestoreModal = false;
  isEditing = false;

  // Données du formulaire
  currentDepartment: Department = {
    id: 0,
    nom: '',
    description: ''
  };

  // Critères de recherche avancée
  advancedCriteria: DepartmentSearchCriteria = {
    idDe: '',
    idA: '',
    nom: '',
    description: '',
    isDeleted: undefined,
    dateCreationDe: '',
    dateCreationA: '',
    dateModificationDe: '',
    dateModificationA: ''
  };

  constructor(
    private userService: UserService,
    private departmentService: DepartmentService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('🚀 Initialisation EntitiesDepartmentsComponent');
    console.log('📦 Taille de page au démarrage:', this.pageSize());
    this.loadDepartments();
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
   * Charge la liste des départements
   */
  loadDepartments() {
    // Annuler le timeout précédent s'il existe
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }

    // Débounce pour éviter les appels multiples rapides
    this.loadingTimeout = setTimeout(() => {
      this.performLoadDepartments();
    }, 100);
  }

  /**
   * Exécute réellement le chargement des départements
   */
  private performLoadDepartments() {
    this.isLoading.set(true);
    console.log(`📥 Chargement de tous les départements (incluant supprimés)...`);
    console.log('🔍 Critères de recherche utilisés:', this.searchCriteria);
    console.log('🔍 Valeur de search_string dans searchCriteria:', this.searchCriteria.search_string);
    console.log('🔍 search_string est vide?', !this.searchCriteria.search_string?.trim());

    // Appliquer les critères de recherche
    const criteria: DepartmentSearchCriteria = {
      ...this.searchCriteria,
      page: this.currentPage(),
      size: this.pageSize(),
      // Ne pas envoyer isDeleted pour getAllByCriteria (qui inclut déjà tous les départements)
      // isDeleted: this.showDeletedDepartments ? true : false
    };

    console.log('📤 Requête envoyée avec critères:', criteria);
    console.log('📤 Valeur de search_string dans criteria:', criteria.search_string);

    // Utiliser le vrai service DepartmentService
    this.departmentService.getAllDepartmentsByCriteria(criteria).subscribe({
      next: (response) => {
        console.log(`✅ RÉPONSE COMPLÈTE reçue (incluant supprimés):`, response);
        console.log('📊 Nombre total de départements (totalElements):', response.totalElements);
        console.log('📊 Nombre de départements dans cette page:', response.content.length);

        // Filtrer les départements selon la préférence utilisateur
        let filteredDepartments = response.content;
        if (!this.showDeletedDepartments) {
          // Ne montrer que les départements actifs
          filteredDepartments = response.content.filter(dept => !dept.isDeleted);
          console.log('🔍 Filtrage appliqué - départements actifs seulement:', filteredDepartments.length);
        } else {
          console.log('🔍 Aucun filtrage - tous les départements affichés:', filteredDepartments.length);
        }

        // Analyser les départements reçus
        const deletedDepartments = response.content.filter(dept => dept.isDeleted);
        const activeDepartments = response.content.filter(dept => !dept.isDeleted);

        console.log('📊 Départements supprimés dans cette page:', deletedDepartments.length, deletedDepartments);
        console.log('📊 Départements actifs dans cette page:', activeDepartments.length, activeDepartments);
        console.log('📊 Départements affichés après filtrage:', filteredDepartments.length, filteredDepartments);

        this.departments.set(filteredDepartments);
        this.totalElements.set(response.totalElements);
        this.isLoading.set(false);

        console.log('🎯 État final après chargement:');
        console.log('- Nombre de départements affichés:', this.departments().length);
        console.log('- Total des départements:', this.totalElements());
        console.log('- Page actuelle:', this.currentPage());
        console.log('- Taille de page:', this.pageSize());
        console.log('- Affichage des supprimés:', this.showDeletedDepartments);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des départements:', error);
        this.notificationService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors du chargement des départements'
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Recherche rapide utilisant search_string
   */
  onQuickSearch() {
    console.log('🔍 onQuickSearch appelée');
    console.log('🔍 Valeur de quickSearch AVANT trim:', this.quickSearch);
    console.log('🔍 Valeur de quickSearch APRÈS trim:', this.quickSearch.trim());
    console.log('🔍 Longueur de quickSearch:', this.quickSearch.length);

    // Réinitialiser les critères de recherche individuels
    this.searchCriteria.idDe = '';
    this.searchCriteria.idA = '';
    this.searchCriteria.nom = '';
    this.searchCriteria.description = '';
    this.searchCriteria.isDeleted = undefined;
    this.searchCriteria.dateCreationDe = '';
    this.searchCriteria.dateCreationA = '';
    this.searchCriteria.dateModificationDe = '';
    this.searchCriteria.dateModificationA = '';

    // Utiliser search_string pour la recherche globale
    this.searchCriteria.search_string = this.quickSearch.trim();

    console.log('🔍 Valeur assignée à searchCriteria.search_string:', this.searchCriteria.search_string);
    console.log('🔍 searchCriteria complet:', this.searchCriteria);

    // Fermer la recherche avancée si elle était ouverte
    this.showAdvancedSearch = false;

    // Remettre à la première page
    this.currentPage.set(0);

    // Débounce pour éviter trop de requêtes
    setTimeout(() => {
      this.loadDepartments();
    }, 300);
  }

  /**
   * Bascule l'affichage des départements supprimés
   */
  toggleDeletedDepartments() {
    this.showDeletedDepartments = !this.showDeletedDepartments;
    console.log('🔄 Basculement affichage départements supprimés:', this.showDeletedDepartments);
    this.currentPage.set(0); // Remettre à la première page
    this.loadDepartments();
  }

  /**
   * Ouvre/ferme la recherche avancée
   */
  openAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
    console.log('🔍 Recherche avancée:', this.showAdvancedSearch ? 'ouverte' : 'fermée');
  }

  /**
   * Applique les filtres avancés
   */
  applyAdvancedSearch() {
    console.log('🎯 Application des filtres avancés:', this.advancedCriteria);
    this.searchCriteria = { ...this.advancedCriteria };

    // Vider la recherche rapide quand on applique les filtres avancés
    this.quickSearch = '';

    this.currentPage.set(0); // Remettre à la première page
    this.loadDepartments();
    this.showAdvancedSearch = false;
  }

  /**
   * Réinitialise tous les filtres de recherche
   */
  clearSearch() {
    this.searchCriteria = {
      idDe: '',
      idA: '',
      nom: '',
      description: '',
      search_string: ''
    };
    this.quickSearch = '';
    this.showAdvancedSearch = false;
    this.resetAdvancedSearch();
    this.currentPage.set(0);
    this.loadDepartments();
  }

  /**
   * Réinitialise les filtres avancés
   */
  resetAdvancedSearch() {
    console.log('🔄 Réinitialisation des filtres avancés');
    this.advancedCriteria = {
      idDe: '',
      idA: '',
      nom: '',
      description: '',
      isDeleted: undefined,
      dateCreationDe: '',
      dateCreationA: '',
      dateModificationDe: '',
      dateModificationA: ''
    };
    this.searchCriteria = { ...this.advancedCriteria };
    this.currentPage.set(0);
    this.loadDepartments();
  }

  /**
   * Change la taille de page
   */
  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newSize = parseInt(target.value, 10);
    console.log('📏 Changement de taille de page:', newSize);

    this.pageSize.set(newSize);
    this.storePageSize(newSize); // Sauvegarder dans le localStorage
    this.currentPage.set(0); // Remettre à la première page
    this.loadDepartments();
  }

  /**
   * Va à une page spécifique
   */
  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      console.log('📄 Aller à la page:', page);
      this.currentPage.set(page);
      this.loadDepartments();
    }
  }

  /**
   * Calcule le nombre total de pages
   */
  totalPages(): number {
    return Math.ceil(this.totalElements() / this.pageSize());
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
   * TrackBy function pour optimiser le rendu de la liste
   */
  trackByDepartmentId(index: number, department: Department): number {
    return department.id;
  }

  /**
   * Retourne aux entités
   */
  goBackToEntities() {
    console.log('⬅️ Retour aux entités');
    this.router.navigate(['/dashboard/entities']);
  }

  /**
   * Ouvre le modal de création
   */
  createDepartment() {
    console.log('➕ Ouverture modal création département');
    this.isEditing = false;
    this.currentDepartment = {
      id: 0,
      nom: '',
      description: ''
    };
    this.showModal = true;
  }

  /**
   * Ouvre le modal d'édition
   */
  editDepartment(department: Department) {
    console.log('✏️ Ouverture modal édition département:', department);
    this.isEditing = true;
    this.currentDepartment = { ...department };
    this.showModal = true;
  }

  /**
   * Ferme le modal
   */
  closeModal() {
    console.log('❌ Fermeture modal');
    this.showModal = false;
    this.currentDepartment = {
      id: 0,
      nom: '',
      description: ''
    };
  }

  /**
   * Sauvegarde le département
   */
  saveDepartment() {
    console.log('💾 Sauvegarde département:', this.currentDepartment);

    if (!this.currentDepartment.nom?.trim()) {
      console.error('Le nom du département est requis');
      this.notificationService.error('Erreur de validation', 'Le nom du département est requis');
      return;
    }

    // Désactiver le bouton de sauvegarde pendant le traitement
    this.isLoading.set(true);

    if (this.isEditing) {
      // Mise à jour d'un département existant
      console.log('🔄 Mise à jour du département:', this.currentDepartment.id);
      this.departmentService.update(this.currentDepartment.id!, this.currentDepartment).subscribe({
        next: (updatedDepartment) => {
          console.log('✅ Département mis à jour avec succès:', updatedDepartment);
          this.notificationService.success('Succès', 'Département mis à jour avec succès');
          this.closeModal();
          this.loadDepartments();
        },
        error: (error) => {
          console.error('❌ Erreur lors de la mise à jour du département:', error);
          this.notificationService.error('Erreur', 'Erreur lors de la mise à jour du département');
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
    } else {
      // Création d'un nouveau département
      console.log('➕ Création d\'un nouveau département');
      this.departmentService.create(this.currentDepartment).subscribe({
        next: (createdDepartment) => {
          console.log('✅ Département créé avec succès:', createdDepartment);
          this.notificationService.success('Succès', 'Département créé avec succès');
          this.closeModal();
          this.loadDepartments();
        },
        error: (error) => {
          console.error('❌ Erreur lors de la création du département:', error);
          this.notificationService.error('Erreur', 'Erreur lors de la création du département');
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
    }
  }

  /**
   * Supprime le département depuis la popup d'édition
   */
  deleteDepartmentFromEdit() {
    const department = this.currentDepartment;
    if (department && department.id > 0) {
      this.closeModal();
      this.deleteDepartment(department);
    }
  }

  /**
   * Ouvre le modal de confirmation de suppression
   */
  deleteDepartment(department: Department) {
    console.log('🗑️ Ouverture modal suppression département:', department);
    this.currentDepartment = department;
    this.showDeleteModal = true;
  }

  /**
   * Ferme le modal de suppression
   */
  closeDeleteModal() {
    console.log('❌ Fermeture modal suppression');
    this.showDeleteModal = false;
    this.currentDepartment = {
      id: 0,
      nom: '',
      description: ''
    };
  }

  /**
   * Confirme la suppression
   */
  confirmDelete() {
    console.log('✅ Confirmation suppression département:', this.currentDepartment);

    if (!this.currentDepartment || !this.currentDepartment.id) {
      console.error('❌ Aucun département sélectionné pour la suppression');
      this.notificationService.error('Erreur', 'Aucun département sélectionné');
      return;
    }

    // Désactiver le bouton pendant la suppression
    this.isLoading.set(true);

    this.departmentService.delete(this.currentDepartment.id).subscribe({
      next: (response) => {
        console.log('✅ Département supprimé avec succès:', response);
        this.notificationService.success('Succès', 'Département supprimé avec succès');
        this.closeDeleteModal();
        this.loadDepartments();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la suppression du département:', error);
        this.notificationService.error('Erreur', 'Erreur lors de la suppression du département');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Ferme le modal de restauration
   */
  closeRestoreModal() {
    console.log('❌ Fermeture modal restauration');
    this.showRestoreModal = false;
    this.currentDepartment = {
      id: 0,
      nom: '',
      description: ''
    };
  }

  /**
   * Confirme la restauration
   */
  confirmRestore() {
    console.log('✅ Confirmation restauration département:', this.currentDepartment);

    if (!this.currentDepartment || !this.currentDepartment.id) {
      console.error('❌ Aucun département sélectionné pour la restauration');
      this.notificationService.error('Erreur', 'Aucun département sélectionné');
      return;
    }

    // Désactiver le bouton pendant la restauration
    this.isLoading.set(true);

    this.departmentService.restore(this.currentDepartment.id).subscribe({
      next: (response) => {
        console.log('✅ Département restauré avec succès:', response);
        this.notificationService.success('Succès', 'Département restauré avec succès');
        this.closeRestoreModal();
        this.loadDepartments();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la restauration du département:', error);
        this.notificationService.error('Erreur', 'Erreur lors de la restauration du département');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Restaure un département supprimé
   */
  restoreDepartment(department: Department) {
    console.log('♻️ Ouverture modal restauration pour:', department);
    this.currentDepartment = { ...department };
    this.showRestoreModal = true;
  }

  /**
   * Obtient le nombre de départements en ligne (simulation)
   */
  getOnlineUsersCount(): number {
    // Simulation - dans un vrai service, cela viendrait du backend
    return Math.floor(this.totalElements() * 0.7); // 70% en ligne
  }

  /**
   * Obtient le nombre de départements hors ligne (simulation)
   */
  getOfflineUsersCount(): number {
    return this.totalElements() - this.getOnlineUsersCount();
  }
}