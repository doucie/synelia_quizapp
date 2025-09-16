import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService, User, UserSearchCriteria, PagedResponse } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';

// Interface pour les départements (utilisant temporairement UserService)
interface Department {
  id: number;
  nom: string;
  description: string;
  isDeleted?: boolean;
  dateCreation?: string;
  dateModification?: string;
}

interface DepartmentSearchCriteria {
  idDe?: string;
  idA?: string;
  nom?: string;
  description?: string;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
  search_string?: string;
}

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
    const serviceMethod = this.showDeletedDepartments ? 'incluant supprimés' : 'actifs seulement';
    console.log(`📥 Chargement des départements (${serviceMethod})...`);
    console.log('🔍 Critères de recherche utilisés:', this.searchCriteria);

    const criteria = {
      ...this.searchCriteria,
      page: this.currentPage(),
      size: this.pageSize()
    };

    console.log('📤 Requête envoyée avec critères:', criteria);

    // Simulation de chargement des départements (à remplacer par un vrai service)
    // Pour l'instant, on utilise des données fictives
    setTimeout(() => {
      const mockDepartments: Department[] = [
        { id: 1, nom: 'Ressources Humaines', description: 'Gestion du personnel et recrutement', isDeleted: false },
        { id: 2, nom: 'Informatique', description: 'Développement et maintenance des systèmes', isDeleted: false },
        { id: 3, nom: 'Comptabilité', description: 'Gestion financière et comptable', isDeleted: false },
        { id: 4, nom: 'Marketing', description: 'Promotion et communication', isDeleted: false },
        { id: 5, nom: 'Commercial', description: 'Ventes et relations clients', isDeleted: false },
        { id: 6, nom: 'Qualité', description: 'Contrôle qualité et assurance', isDeleted: false },
        { id: 7, nom: 'Logistique', description: 'Gestion des stocks et livraisons', isDeleted: false },
        { id: 8, nom: 'Juridique', description: 'Conseil juridique et conformité', isDeleted: false },
        { id: 9, nom: 'Communication', description: 'Relations publiques et médias', isDeleted: false },
        { id: 10, nom: 'Recherche & Développement', description: 'Innovation et développement produits', isDeleted: false },
        { id: 11, nom: 'Sécurité', description: 'Sécurité informatique et physique', isDeleted: false },
        { id: 12, nom: 'Formation', description: 'Formation et développement des compétences', isDeleted: false },
        { id: 13, nom: 'Achats', description: 'Gestion des achats et fournisseurs', isDeleted: false },
        { id: 14, nom: 'Maintenance', description: 'Maintenance technique et équipements', isDeleted: false },
        { id: 15, nom: 'Direction Générale', description: 'Direction stratégique et management', isDeleted: false },
        { id: 16, nom: 'Support Client', description: 'Service client et assistance', isDeleted: false },
        { id: 17, nom: 'Production', description: 'Production et fabrication', isDeleted: false },
        { id: 18, nom: 'Contrôle de Gestion', description: 'Analyse financière et budgétaire', isDeleted: false },
        { id: 19, nom: 'Systèmes d\'Information', description: 'Architecture et gestion SI', isDeleted: false },
        { id: 20, nom: 'Ressources Techniques', description: 'Gestion des ressources techniques', isDeleted: false },
        { id: 21, nom: 'Innovation', description: 'Veille technologique et innovation', isDeleted: false },
        { id: 22, nom: 'Audit Interne', description: 'Contrôle interne et audit', isDeleted: true }
      ];

      const filteredDepartments = mockDepartments.filter(dept =>
        !this.searchCriteria.nom || dept.nom.toLowerCase().includes(this.searchCriteria.nom!.toLowerCase())
      );

      const startIndex = this.currentPage() * this.pageSize();
      const endIndex = startIndex + this.pageSize();
      const pageContent = filteredDepartments.slice(startIndex, endIndex);

      const response: PagedResponse<Department> = {
        content: pageContent,
        totalElements: filteredDepartments.length,
        totalPages: Math.ceil(filteredDepartments.length / this.pageSize()),
        size: this.pageSize(),
        number: this.currentPage()
      };

      console.log(`✅ RÉPONSE COMPLÈTE reçue (${serviceMethod}):`, response);
      console.log('📊 Nombre total de départements (totalElements):', response.totalElements);
      console.log('📊 Nombre de départements dans cette page:', response.content.length);

      this.departments.set(response.content);
      this.totalElements.set(response.totalElements);
      this.isLoading.set(false);

      console.log('🎯 État final après chargement:');
      console.log('- Nombre de départements affichés:', this.departments().length);
      console.log('- Total des départements:', this.totalElements());
      console.log('- Page actuelle:', this.currentPage());
      console.log('- Taille de page:', this.pageSize());
    }, 500); // Simulation d'un délai réseau
  }

  /**
   * Recherche rapide
   */
  onQuickSearch() {
    console.log('🔍 Recherche rapide:', this.quickSearch);
    this.searchCriteria.search_string = this.quickSearch;
    this.currentPage.set(0); // Remettre à la première page
    this.loadDepartments();
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
    this.currentPage.set(0); // Remettre à la première page
    this.loadDepartments();
    this.showAdvancedSearch = false;
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

    if (!this.currentDepartment.nom.trim()) {
      console.error('Le nom du département est requis');
      return;
    }

    // Simulation de sauvegarde
    if (this.isEditing) {
      // Mise à jour
      console.log('Département modifié avec succès');
    } else {
      // Création
      console.log('Département créé avec succès');
    }

    this.closeModal();
    this.loadDepartments();
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

    // Simulation de suppression
    console.log('Département supprimé avec succès');

    this.closeDeleteModal();
    this.loadDepartments();
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

    // Simulation de restauration
    console.log('Département restauré avec succès');

    this.closeRestoreModal();
    this.loadDepartments();
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