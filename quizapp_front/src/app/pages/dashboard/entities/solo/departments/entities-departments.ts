import { Component, OnInit, OnDestroy, ElementRef, HostListener, signal, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntityDetailPanelComponent, DetailField } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { EntityColumnVisibilityState, ColumnDef } from '../../../../../shared/entity-column-visibility';
import { DashboardStatsService } from '../../../../../core/services/dashboard-stats.service';
import { DependencyInfo } from '../../../../../shared/models/interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { DepartmentService, Department, DepartmentSearchCriteria, PagedResponse } from '../../../../../core/services/department.service';
import { UserService } from '../../../../../core/services/user.service';
import { SpecialityService, Speciality } from '../../../../../core/services/speciality.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { AuthService } from '../../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-entities-departments',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-departments.html',
  styleUrl: './entities-departments.scss'
})
export class EntitiesDepartmentsComponent implements OnInit, OnDestroy {
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
    this.editDepartment(item);
  }

  saveFromDetail(data: any): void {
    this.departmentService.update(data.id, data).subscribe({
      next: () => { this.selectedItem.set(data); this.loadDepartments(); this.notificationService.success('Succès', 'Département modifié'); },
      error: () => { this.notificationService.error('Erreur', 'Erreur lors de la modification'); }
    });
  }

  deleteFromDetail(item: any): void {
    this.closeDetailPanel();
    this.deleteDepartment(item);
  }

  restoreFromDetail(item: any): void {
    this.closeDetailPanel();
    this.restoreDepartment(item);
  }
  
  // Signaux pour la réactivité
  departments = signal<Department[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10); // Valeur par défaut, sera mise à jour dans ngOnInit
  
  // Signaux pour l'expansion des départements
  expandedDepartments = signal<Set<number>>(new Set());
  departmentSpecialities = signal<{[departmentId: number]: Speciality[]}>({});
  loadingSpecialities = signal<{[departmentId: number]: boolean}>({});
  
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
  
  // Compteurs réels (total dans la BD)
  totalActiveDepartments = signal<number>(0);
  totalDeletedDepartments = signal<number>(0);
  
  // Options de pagination avec 10 par défaut
  pageSizeOptions = [5, 10, 20, 50, 100];
  private readonly PAGE_SIZE_STORAGE_KEY = 'entities-departments-page-size';

  readonly allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'name', label: 'Nom', priority: 1 },
    { key: 'description', label: 'Description', priority: 3 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];
  private readonly columnVisibility = new EntityColumnVisibilityState(this.allColumns, 'column-visibility-departments');
  private readonly hostElement = inject(ElementRef<HTMLElement>);
  readonly visibleColumns = this.columnVisibility.visibleColumns;
  readonly hiddenColumnsCount = this.columnVisibility.hiddenColumnsCount;

  @HostListener('window:resize')
  onWindowResize(): void { this.columnVisibility.applyAutoHideForHost(); }

  @HostListener('mouseover', ['$event.target'])
  onDataTableCellHover(target: EventTarget | null): void { this.columnVisibility.ensureCellTitle(target); }

  isColumnVisible(key: string): boolean { return this.columnVisibility.isColumnVisible(key); }
  toggleColumnVisibility(key: string): void { this.columnVisibility.toggleColumnVisibility(key); }
  showAllColumns(): void { this.columnVisibility.showAllColumns(); }
  resetColumnVisibility(): void { this.columnVisibility.resetColumnVisibility(); }
  
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
  departmentToDelete: Department | null = null;
  
  // État de la popup de restauration
  showRestoreConfirmation = signal<boolean>(false);
  departmentToRestore = signal<Department | null>(null);
  
  // État de la popup d'édition
  showEditDialog = signal<boolean>(false);
  departmentToEdit = signal<Department | null>(null);
  editFormData = {
    id: 0,
    nom: '',
    description: ''
  };

  // État de la popup de création
  showCreateDialog = signal<boolean>(false);
  createFormData = {
    nom: '',
    description: ''
  };
  
  // États pour la gestion des spécialités
  showSpecialityCreateDialog = signal<boolean>(false);
  showSpecialityEditDialog = signal<boolean>(false);
  showSpecialityDeleteConfirmation = signal<boolean>(false);
  showSpecialityRestoreConfirmation = signal<boolean>(false);
  
  specialityToEdit = signal<Speciality | null>(null);
  specialityToDelete = signal<Speciality | null>(null);
  specialityToRestore = signal<Speciality | null>(null);
  currentDepartmentForSpeciality = signal<Department | null>(null);
  
  specialityCreateFormData = {
    nom: '',
    description: ''
  };
  
  specialityEditFormData = {
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
    dateModificationA: '',
    search_string: ''
  };



  constructor(
    private departmentService: DepartmentService,
    private userService: UserService,
    private specialityService: SpecialityService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('🚀 Initialisation EntitiesDepartmentsComponent');
    this.columnVisibility.observeHost(this.hostElement.nativeElement);
    // Initialiser la taille de page avec la valeur stockée
    this.pageSize.set(this.getStoredPageSize());
    console.log('📦 Taille de page au démarrage:', this.pageSize());
    
    // Lire le paramètre page depuis l'URL (1-based) et convertir en 0-based
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const pageParam = params['page'];
      if (pageParam && !isNaN(+pageParam) && +pageParam > 0) {
        this.currentPage.set(+pageParam - 1); // Convertir 1-based en 0-based
      } else {
        this.currentPage.set(0);
      }
    });
    
    this.loadDepartments();
  }

  ngOnDestroy() {
    this.columnVisibility.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
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
      size: this.pageSize(),
      isDeleted: this.showDeletedDepartments ? undefined : false // undefined = tous, false = actifs seulement
    };

    console.log('📤 Requête envoyée avec critères:', criteria);

    // Utiliser toujours la même méthode mais avec le critère isDeleted approprié
    const serviceCall = this.departmentService.getAllDepartmentsByCriteria(criteria);

    serviceCall.subscribe({
      next: (response: PagedResponse<Department>) => {
        console.log(`✅ RÉPONSE COMPLÈTE reçue (${serviceMethod}):`, response);
        console.log('📊 Nombre total de départements (totalElements):', response.totalElements);
        console.log('📊 Nombre de départements dans cette page:', response.items.length);
        console.log('📊 Page courante (currentPage):', response.currentPage || 'non défini');
        console.log('📊 Taille de page (pageSize):', response.pageSize || 'non défini');
        console.log('📊 Nombre total de pages:', response.totalPages || 'non défini');
        
        // Analyser les départements reçus
        const deletedDepartments = response.items.filter((d: Department) => d.isDeleted);
        const activeDepartments = response.items.filter((d: Department) => !d.isDeleted);
        
        console.log('📊 Départements supprimés dans cette page:', deletedDepartments.length, deletedDepartments);
        console.log('📊 Départements actifs dans cette page:', activeDepartments.length, activeDepartments);
        
        this.departments.set(response.items);
        this.totalElements.set(response.totalElements);
        this.isLoading.set(false);
        
        // Mettre à jour les vrais compteurs d'actifs et supprimés
        this.updateRealCounts();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des départements:', error);
        this.notificationService.error('Erreur', 'Erreur lors du chargement des départements');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Recherche des départements selon les critères
   */
  searchDepartments() {
    console.log('🔍 Recherche avec critères:', this.searchCriteria);
    this.currentPage.set(0);
    this.loadDepartments();
  }

  /**
   * Réinitialise les critères de recherche
   */
  clearSearch() {
    // Reset search criteria
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
    this.searchDepartments();
  }

  /**
   * Crée un nouveau département
   */
  createDepartment() {
    // Réinitialiser le formulaire
    this.createFormData = {
      nom: '',
      description: ''
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
      description: ''
    };
  }

  /**
   * Valide et crée un nouveau département
   */
  async validateDepartmentCreation() {
    const formData = this.createFormData;

    console.log('🔧 Début validation création - formData:', formData);

    // Validation des champs requis
    if (!formData.nom.trim()) {
      this.notificationService.warning('Attention', 'Le nom est requis');
      return;
    }

    try {
      // Appel de l'API pour créer un nouveau département
      console.log('🔧 Création d\'un nouveau département');

      const newDepartment: any = await this.departmentService.create({
        nom: formData.nom.trim(),
        description: formData.description.trim()
      }).toPromise();

      console.log('✅ Département créé:', newDepartment);

      // Vérifier si la réponse indique une erreur
      if (newDepartment && newDepartment.hasError) {
        console.error('❌ Erreur détectée dans la réponse:', newDepartment);
        const errorMessage = newDepartment.status?.message || newDepartment.status?.code || 'Erreur lors de la création';
        this.notificationService.error('Erreur', errorMessage);
        return;
      }

      this.notificationService.success('Succès', `Département ${formData.nom} créé avec succès`);
      this.closeCreateDialog();
      this.loadDepartments(); // Recharger la liste
    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error);
      console.error('❌ Détail de l\'erreur:', error?.error);
      this.notificationService.error('Erreur', `Erreur lors de la création: ${error?.error?.message || error?.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Édite un département
   */
  editDepartment(department: Department) {
    this.departmentToEdit.set(department);
    this.editFormData = {
      id: department.id,
      nom: department.nom || '',
      description: department.description || ''
    };
    this.showEditDialog.set(true);
  }

  /**
   * Ferme la popup d'édition
   */
  closeEditDialog() {
    this.showEditDialog.set(false);
    this.departmentToEdit.set(null);
    this.editFormData = {
      id: 0,
      nom: '',
      description: ''
    };
  }

  /**
   * Valide et sauvegarde les modifications
   */
  async validateDepartmentEdit() {
    const formData = this.editFormData;
    const currentDepartment = this.departmentToEdit();
    
    console.log('🔧 Début validation - formData:', formData);
    console.log('🔧 Début validation - currentDepartment:', currentDepartment);
    
    if (!currentDepartment) {
      this.notificationService.error('Erreur', 'Aucun département sélectionné pour modification');
      return;
    }

    // Validation des champs requis
    if (!formData.nom.trim()) {
      this.notificationService.warning('Attention', 'Le nom est requis');
      return;
    }

    try {
      // Appel de l'API pour mettre à jour un département
      console.log('🔧 Mise à jour d\'un département');
      
      const updatedDepartment: any = await this.departmentService.update(currentDepartment.id, {
        nom: formData.nom.trim(),
        description: formData.description.trim()
      }).toPromise();

      console.log('✅ Département mis à jour:', updatedDepartment);

      // Vérifier si la réponse indique une erreur
      if (updatedDepartment && updatedDepartment.hasError) {
        console.error('❌ Erreur détectée dans la réponse:', updatedDepartment);
        const errorMessage = updatedDepartment.status?.message || updatedDepartment.status?.code || 'Erreur lors de la mise à jour';
        this.notificationService.error('Erreur', errorMessage);
        return;
      }

      this.notificationService.success('Succès', `Département ${formData.nom} modifié avec succès`);
      this.closeEditDialog();
      this.loadDepartments(); // Recharger la liste
    } catch (error: any) {
      console.error('❌ Erreur lors de la modification:', error);
      console.error('❌ Détail de l\'erreur:', error?.error);
      this.notificationService.error('Erreur', `Erreur lors de la modification: ${error?.error?.message || error?.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Supprime le département depuis la popup d'édition
   */
  deleteDepartmentFromEdit() {
    const department = this.departmentToEdit();
    if (department) {
      this.closeEditDialog();
      this.deleteDepartment(department);
    }
  }

  /**
   * Affiche la popup de confirmation pour supprimer un département
   */
  deleteDepartment(department: Department) {
    this.departmentToDelete = department;
    this.depService.checkDependencies('departments', department.id).subscribe({
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
   * Confirme la suppression d'un département
   */
  confirmDeleteDepartment() {
    if (!this.departmentToDelete) return;
    
    this.departmentService.delete(this.departmentToDelete.id).subscribe({
      next: () => {
        this.notificationService.success('Succès', `Département ${this.departmentToDelete?.nom} supprimé avec succès`);
        
        // Marquer le département comme supprimé dans la liste locale
        if (this.departmentToDelete) {
          this.departmentToDelete.isDeleted = true;
        }
        
        // Activer automatiquement l'affichage des départements supprimés
        this.showDeletedDepartments = true;
        
        this.cancelDeleteDepartment();
        // Recharger la liste pour refléter les changements
        this.loadDepartments();
      },
      error: (error: any) => {
        console.error('❌ Erreur lors de la suppression:', error);
        this.notificationService.error('Erreur', 'Erreur lors de la suppression du département');
        this.cancelDeleteDepartment();
      }
    });
  }

  /**
   * Annule la suppression d'un département
   */
  cancelDeleteDepartment() {
    this.showDeleteConfirmation = false;
    this.departmentToDelete = null;
  }

  /**
   * Affiche la popup de confirmation pour restaurer un département supprimé
   */
  restoreDepartment(department: Department) {
    this.departmentToRestore.set(department);
    this.depService.checkParent('departments', department.id).subscribe({
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
   * Confirme la restauration d'un département
   */
  confirmRestoreDepartment() {
    const departmentToRestore = this.departmentToRestore();
    if (!departmentToRestore) return;
    
    this.departmentService.restore(departmentToRestore.id).subscribe({
      next: (response: any) => {
        this.notificationService.success('Succès', `Département ${departmentToRestore.nom} restauré avec succès`);
        
        // Marquer le département comme restauré dans la liste locale
        departmentToRestore.isDeleted = false;
        
        this.cancelRestoreDepartment();
        // Recharger la liste pour refléter les changements
        this.loadDepartments();
      },
      error: (error: any) => {
        this.notificationService.error('Erreur', 'Erreur lors de la restauration du département');
        this.cancelRestoreDepartment();
      }
    });
  }

  /**
   * Annule la restauration d'un département
   */
  cancelRestoreDepartment() {
    this.showRestoreConfirmation.set(false);
    this.departmentToRestore.set(null);
  }





  /**
   * Gestion de la pagination
   */
  goToPage(page: number) {
    this.currentPage.set(page);
    // Mettre à jour l'URL avec le numéro de page (convertir 0-based en 1-based)
    this.router.navigate(['/dashboard/entities/departments', page + 1]);
    this.loadDepartments();
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
    this.loadDepartments();
    
    console.log('✅ FIN changePageSize - nouvelle valeur stockée');
  }

  /**
   * Toggle l'affichage des départements supprimés
   */
  toggleDeletedDepartments() {
    this.showDeletedDepartments = !this.showDeletedDepartments;
    console.log('🔄 Toggle départements supprimés:', this.showDeletedDepartments ? 'ACTIVÉ' : 'DÉSACTIVÉ');
    console.log('📦 Taille de page actuelle avant toggle:', this.pageSize());
    this.currentPage.set(0); // Revenir à la première page
    console.log('📦 Taille de page actuelle après toggle:', this.pageSize());
    this.loadDepartments();
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
  trackByDepartmentId(index: number, department: Department): number {
    return department.id;
  }

  /**
   * TrackBy function pour optimiser les performances de rendu des spécialités
   */
  trackBySpecialityId(index: number, speciality: any): number {
    return speciality.id;
  }

  /**
   * Recherche rapide utilisant search_string
   */
  onQuickSearch() {
    // Réinitialiser les critères de recherche individuels
    this.searchCriteria.idDe = '';
    this.searchCriteria.idA = '';
    this.searchCriteria.nom = '';
    this.searchCriteria.description = '';
    
    // Utiliser search_string pour la recherche globale
    this.searchCriteria.search_string = this.quickSearch.trim();
    
    // Fermer la recherche avancée si elle était ouverte
    this.showAdvancedSearch = false;
    
    // Débounce pour éviter trop de requêtes
    setTimeout(() => {
      this.loadDepartments();
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
    this.loadDepartments();
  }

  /**
   * Réinitialise les filtres avancés
   */
  resetAdvancedSearch() {
    this.advancedCriteria = {
      idDe: '',
      idA: '',
      nom: '',
      description: '',
      isDeleted: undefined,
      dateCreationDe: '',
      dateCreationA: '',
      dateModificationDe: '',
      dateModificationA: '',
      search_string: ''
    };
    this.applyAdvancedSearch();
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
  formatCreationDate(department: Department): string {
    if (!department.dateCreation) return '-';

    // Si la date ne contient pas d'heures (format "jj/mm/aaaa"), afficher seulement la date
    if (!department.dateCreation.includes(' ')) {
      const date = this.parseFrenchDate(department.dateCreation);
      if (!date) return department.dateCreation;
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }

    // Si la date contient des heures, les afficher
    const date = this.parseFrenchDate(department.dateCreation);
    if (!date) return department.dateCreation;

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Retourne le nombre de départements actifs (total réel dans la BD)
   */
  getActiveDepartmentsCount(): number {
    return this.totalActiveDepartments();
  }

  /**
   * Retourne le nombre de départements supprimés (total réel dans la BD)
   */
  getDeletedDepartmentsCount(): number {
    return this.totalDeletedDepartments();
  }

  /**
   * Retourne les spécialités d'un département donné
   */
  getDepartmentSpecialities(departmentId: number): Speciality[] {
    return this.departmentSpecialities()[departmentId] || [];
  }

  /**
   * Met à jour les vrais compteurs d'actifs et supprimés
   */
  private updateRealCounts() {
    // Compter les actifs (isDeleted = false) - appel léger avec size=1
    const activeCriteria = { ...this.searchCriteria, isDeleted: false, page: 0, size: 1 };
    this.departmentService.getAllDepartmentsByCriteria(activeCriteria).subscribe({
      next: (response) => {
        this.totalActiveDepartments.set(response.totalElements);
      },
      error: (error) => console.error('Erreur lors du comptage des départements actifs:', error)
    });

    // Compter tous (isDeleted = undefined) pour calculer les supprimés
    const allCriteria = { ...this.searchCriteria, isDeleted: undefined, page: 0, size: 1 };
    this.departmentService.getAllDepartmentsByCriteria(allCriteria).subscribe({
      next: (response) => {
        const totalAll = response.totalElements;
        // Petite attente pour s'assurer que totalActive est mis à jour
        setTimeout(() => {
          const totalActive = this.totalActiveDepartments();
          this.totalDeletedDepartments.set(totalAll - totalActive);
        }, 100);
      },
      error: (error) => console.error('Erreur lors du comptage total des départements:', error)
    });
  }

  /**
   * Bascule l'expansion d'un département
   */
  toggleDepartmentExpansion(departmentId: number) {
    if (this.expandedDepartments().has(departmentId)) {
      this.expandedDepartments.set(new Set());
    } else {
      this.expandedDepartments.set(new Set([departmentId]));
      this.loadDepartmentSpecialities(departmentId);
    }
  }

  /**
   * Vérifie si un département est expandé
   */
  isDepartmentExpanded(departmentId: number): boolean {
    return this.expandedDepartments().has(departmentId);
  }

  /**
   * Charge les spécialités d'un département
   */
  loadDepartmentSpecialities(departmentId: number) {
    // Éviter les appels multiples
    if (this.loadingSpecialities()[departmentId]) {
      return;
    }

    // Activer le loading pour ce département
    this.loadingSpecialities.set({
      ...this.loadingSpecialities(),
      [departmentId]: true
    });

    console.log(`🔍 Chargement des spécialités pour le département ${departmentId}...`);

    // Charger TOUTES les spécialités et filtrer côté frontend par departmentId
    this.specialityService.getAll({
      page: 0,
      size: 10000 // Charger beaucoup pour avoir toutes les spécialités
    }).subscribe({
      next: (response) => {
        console.log(`✅ Toutes les spécialités chargées:`, response.items);
        
        // Filtrer les spécialités qui appartiennent à ce département
        const departmentSpecialities = response.items.filter(speciality => 
          speciality.departmentId === departmentId
        );
        
        console.log(`✅ Spécialités filtrées pour le département ${departmentId}:`, departmentSpecialities);
        
        // Mettre à jour les spécialités du département
        this.departmentSpecialities.set({
          ...this.departmentSpecialities(),
          [departmentId]: departmentSpecialities
        });

        // Désactiver le loading
        this.loadingSpecialities.set({
          ...this.loadingSpecialities(),
          [departmentId]: false
        });
      },
      error: (error) => {
        console.error(`❌ Erreur lors du chargement des spécialités du département ${departmentId}:`, error);
        this.notificationService.error('Erreur', `Erreur lors du chargement des spécialités du département ${departmentId}`);
        
        // Désactiver le loading même en cas d'erreur
        this.loadingSpecialities.set({
          ...this.loadingSpecialities(),
          [departmentId]: false
        });
      }
    });
  }

  /**
   * Vérifie si les spécialités d'un département sont en cours de chargement
   */
  isLoadingSpecialities(departmentId: number): boolean {
    return this.loadingSpecialities()[departmentId] || false;
  }

  /**
   * Crée une nouvelle spécialité dans un département
   */
  createSpecialityInDepartment(department: Department) {
    console.log('🆕 Création d\'une spécialité dans le département:', department.nom);
    this.currentDepartmentForSpeciality.set(department);
    this.specialityCreateFormData = {
      nom: '',
      description: ''
    };
    this.showSpecialityCreateDialog.set(true);
  }

  /**
   * Modifie une spécialité
   */
  editSpecialityInDepartment(speciality: Speciality, department: Department) {
    console.log('✏️ Modification de la spécialité:', speciality.nom, 'dans le département:', department.nom);
    this.currentDepartmentForSpeciality.set(department);
    this.specialityToEdit.set(speciality);
    this.specialityEditFormData = {
      id: speciality.id,
      nom: speciality.nom || '',
      description: speciality.description || ''
    };
    this.showSpecialityEditDialog.set(true);
  }

  /**
   * Supprime une spécialité
   */
  deleteSpecialityInDepartment(speciality: Speciality, department: Department) {
    console.log('🗑️ Suppression de la spécialité:', speciality.nom, 'dans le département:', department.nom);
    this.currentDepartmentForSpeciality.set(department);
    this.specialityToDelete.set(speciality);
    this.showSpecialityDeleteConfirmation.set(true);
  }

  /**
   * Restaure une spécialité supprimée
   */
  restoreSpecialityInDepartment(speciality: Speciality, department: Department) {
    console.log('♻️ Restauration de la spécialité:', speciality.nom, 'dans le département:', department.nom);
    this.currentDepartmentForSpeciality.set(department);
    this.specialityToRestore.set(speciality);
    this.showSpecialityRestoreConfirmation.set(true);
  }

  /**
   * Confirme la création d'une spécialité
   */
  async confirmCreateSpeciality() {
    if (!this.currentDepartmentForSpeciality()) {
      this.notificationService.error('Erreur', 'Département non trouvé');
      return;
    }

    const department = this.currentDepartmentForSpeciality()!;
    const specialityData = {
      nom: this.specialityCreateFormData.nom.trim(),
      description: this.specialityCreateFormData.description.trim(),
      departmentId: department.id
    };

    if (!specialityData.nom) {
      this.notificationService.error('Erreur', 'Le nom de la spécialité est obligatoire');
      return;
    }

    try {
      console.log('🚀 Création de la spécialité:', specialityData);
      const newSpeciality: any = await this.specialityService.create(specialityData);
      console.log('✅ Spécialité créée:', newSpeciality);

      // Recharger les spécialités du département
      this.loadDepartmentSpecialities(department.id);

      this.notificationService.success('Succès', 'Spécialité créée avec succès');
      this.cancelCreateSpeciality();
    } catch (error: any) {
      console.error('❌ Erreur lors de la création de la spécialité:', error);
      this.notificationService.error('Erreur', 'Erreur lors de la création de la spécialité');
    }
  }

  /**
   * Annule la création d'une spécialité
   */
  cancelCreateSpeciality() {
    this.showSpecialityCreateDialog.set(false);
    this.currentDepartmentForSpeciality.set(null);
    this.specialityCreateFormData = {
      nom: '',
      description: ''
    };
  }

  /**
   * Confirme la modification d'une spécialité
   */
  async confirmEditSpeciality() {
    if (!this.specialityToEdit() || !this.currentDepartmentForSpeciality()) {
      this.notificationService.error('Erreur', 'Spécialité ou département non trouvé');
      return;
    }

    const speciality = this.specialityToEdit()!;
    const department = this.currentDepartmentForSpeciality()!;
    const specialityData = {
      nom: this.specialityEditFormData.nom.trim(),
      description: this.specialityEditFormData.description.trim(),
      departmentId: department.id
    };

    if (!specialityData.nom) {
      this.notificationService.error('Erreur', 'Le nom de la spécialité est obligatoire');
      return;
    }

    try {
      console.log('🚀 Modification de la spécialité:', speciality.id, specialityData);
      const updatedSpeciality: any = await this.specialityService.update(speciality.id, specialityData);
      console.log('✅ Spécialité modifiée:', updatedSpeciality);

      // Recharger les spécialités du département
      this.loadDepartmentSpecialities(department.id);

      this.notificationService.success('Succès', 'Spécialité modifiée avec succès');
      this.cancelEditSpeciality();
    } catch (error: any) {
      console.error('❌ Erreur lors de la modification de la spécialité:', error);
      this.notificationService.error('Erreur', 'Erreur lors de la modification de la spécialité');
    }
  }

  /**
   * Annule la modification d'une spécialité
   */
  cancelEditSpeciality() {
    this.showSpecialityEditDialog.set(false);
    this.specialityToEdit.set(null);
    this.currentDepartmentForSpeciality.set(null);
    this.specialityEditFormData = {
      id: 0,
      nom: '',
      description: ''
    };
  }

  /**
   * Confirme la suppression d'une spécialité
   */
  async confirmDeleteSpeciality() {
    if (!this.specialityToDelete() || !this.currentDepartmentForSpeciality()) {
      this.notificationService.error('Erreur', 'Spécialité ou département non trouvé');
      return;
    }

    const speciality = this.specialityToDelete()!;
    const department = this.currentDepartmentForSpeciality()!;

    try {
      console.log('🚀 Suppression de la spécialité:', speciality.id);
      await this.specialityService.delete(speciality.id);
      console.log('✅ Spécialité supprimée');

      // Recharger les spécialités du département
      this.loadDepartmentSpecialities(department.id);

      this.notificationService.success('Succès', 'Spécialité supprimée avec succès');
      this.cancelDeleteSpeciality();
    } catch (error: any) {
      console.error('❌ Erreur lors de la suppression de la spécialité:', error);
      this.notificationService.error('Erreur', 'Erreur lors de la suppression de la spécialité');
    }
  }

  /**
   * Annule la suppression d'une spécialité
   */
  cancelDeleteSpeciality() {
    this.showSpecialityDeleteConfirmation.set(false);
    this.specialityToDelete.set(null);
    this.currentDepartmentForSpeciality.set(null);
  }

  /**
   * Confirme la restauration d'une spécialité
   */
  async confirmRestoreSpeciality() {
    if (!this.specialityToRestore() || !this.currentDepartmentForSpeciality()) {
      this.notificationService.error('Erreur', 'Spécialité ou département non trouvé');
      return;
    }

    const speciality = this.specialityToRestore()!;
    const department = this.currentDepartmentForSpeciality()!;

    try {
      console.log('🚀 Restauration de la spécialité:', speciality.id);
      await this.specialityService.restore(speciality.id);
      console.log('✅ Spécialité restaurée');

      // Recharger les spécialités du département
      this.loadDepartmentSpecialities(department.id);

      this.notificationService.success('Succès', 'Spécialité restaurée avec succès');
      this.cancelRestoreSpeciality();
    } catch (error: any) {
      console.error('❌ Erreur lors de la restauration de la spécialité:', error);
      this.notificationService.error('Erreur', 'Erreur lors de la restauration de la spécialité');
    }
  }

  /**
   * Annule la restauration d'une spécialité
   */
  cancelRestoreSpeciality() {
    this.showSpecialityRestoreConfirmation.set(false);
    this.specialityToRestore.set(null);
    this.currentDepartmentForSpeciality.set(null);
  }
}
