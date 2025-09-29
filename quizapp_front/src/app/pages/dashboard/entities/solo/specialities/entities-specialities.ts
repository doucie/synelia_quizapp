import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { SpecialityService, Speciality, SpecialitySearchCriteria, PagedResponse } from '../../../../../core/services/speciality.service';
import { DepartmentService, Department, DepartmentSearchCriteria } from '../../../../../core/services/department.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { AuthService } from '../../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-entities-specialities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-specialities.html',
  styleUrl: './entities-specialities.scss'
})
export class EntitiesSpecialitiesComponent implements OnInit, OnDestroy {
  // Exposer Math pour utilisation dans le template
  Math = Math;
  
  // Variable pour éviter les appels multiples
  private loadingTimeout: any;
  
  // Signaux pour la réactivité
  specialities = signal<Speciality[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10); // Valeur par défaut temporaire, sera mise à jour dans ngOnInit
  
  // Critères de recherche
  searchCriteria: SpecialitySearchCriteria = {
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
  
  // Contrôle d'affichage des spécialités supprimées
  showDeletedSpecialities = true; // Par défaut, afficher toutes les spécialités
  
  // Compteurs réels (total dans la BD)
  totalActiveSpecialities = signal<number>(0);
  totalDeletedSpecialities = signal<number>(0);
  
  // Options de pagination avec 10 par défaut
  pageSizeOptions = [5, 10, 20, 50, 100];
  private readonly PAGE_SIZE_STORAGE_KEY = 'entities-specialities-page-size';
  
  // État de la popup de confirmation
  showDeleteConfirmation = false;
  specialityToDelete: Speciality | null = null;
  
  // État de la popup de restauration
  showRestoreConfirmation = signal<boolean>(false);
  specialityToRestore = signal<Speciality | null>(null);
  
  // État de la popup d'édition
  showEditDialog = signal<boolean>(false);
  specialityToEdit = signal<Speciality | null>(null);
  editFormData = {
    id: 0,
    specialityName: '',
    specialityDesc: '',
    departmentId: 0
  };

  // État de la popup de création
  showCreateDialog = signal<boolean>(false);
  createFormData = {
    specialityName: '',
    specialityDesc: '',
    departmentId: 0
  };
  
  // Critères de recherche avancée
  advancedCriteria: SpecialitySearchCriteria = {
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

  // Rôles disponibles
  availableRoles = ['super', 'admin', 'recruiter'];

  // Gestion des départements pour la liste déroulante
  departments = signal<Department[]>([]);
  showDepartmentDropdown = signal<boolean>(false);
  selectedDepartmentName = signal<string>('');

  constructor(
    private specialityService: SpecialityService,
    private departmentService: DepartmentService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    console.log('🚀 Initialisation EntitiesSpecialitiesComponent');
    await this.initializePageSizePreference();
    
    // Charger les départements pour la liste déroulante
    this.loadDepartments();
    
    // Lire le paramètre page depuis l'URL (1-based) et convertir en 0-based
    this.route.params.subscribe(params => {
      const pageParam = params['page'];
      if (pageParam && !isNaN(+pageParam) && +pageParam > 0) {
        this.currentPage.set(+pageParam - 1); // Convertir 1-based en 0-based
      } else {
        this.currentPage.set(0);
      }
    });
  }

  ngOnDestroy() {
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
      // Pour les spécialités, utiliser simplement la valeur stockée ou la valeur par défaut
      this.pageSize.set(this.getStoredPageSize());
      console.log('📦 Taille de page finale:', this.pageSize());
      this.loadSpecialities();
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la préférence de taille de page:', error);
      this.pageSize.set(this.getStoredPageSize());
      this.loadSpecialities();
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
   * Charge la liste des spécialités
   */
  loadSpecialities() {
    // Annuler le timeout précédent s'il existe
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    
    // Débounce pour éviter les appels multiples rapides
    this.loadingTimeout = setTimeout(() => {
      this.performLoadSpecialities();
    }, 100);
  }

  /**
   * Exécute réellement le chargement des spécialités
   */
  private performLoadSpecialities() {
    this.isLoading.set(true);
    const serviceMethod = this.showDeletedSpecialities ? 'incluant supprimés' : 'actifs seulement';
    console.log(`📥 Chargement des spécialités (${serviceMethod})...`);
    console.log('🔍 Critères de recherche utilisés:', JSON.stringify(this.searchCriteria, null, 2));

    const criteria = {
      ...this.searchCriteria,
      page: this.currentPage(),
      size: this.pageSize(),
      isDeleted: this.showDeletedSpecialities ? undefined : false // undefined = tous, false = actifs seulement
    };

    console.log('📤 Requête envoyée avec critères:', JSON.stringify(criteria, null, 2));

    // Utiliser toujours la même méthode mais avec le critère isDeleted approprié
    const serviceCall = this.specialityService.getAll(criteria);

    serviceCall.subscribe({
      next: (response: PagedResponse<Speciality>) => {
        console.log(`✅ RÉPONSE COMPLÈTE reçue (${serviceMethod}):`, response);
        console.log('📊 Nombre total de spécialités (totalElements):', response.totalElements);
        console.log('📊 Nombre de spécialités dans cette page:', response.items.length);
        console.log('📊 Page courante:', response.currentPage || 'non défini');
        console.log('📊 Taille de page:', response.pageSize || 'non défini');
        console.log('📊 Nombre total de pages:', response.totalPages || 'non défini');
        
        // Analyser les spécialités reçus
        const deletedSpecialities = response.items.filter(s => s.isDeleted);
        const activeSpecialities = response.items.filter(s => !s.isDeleted);
        
        console.log('📊 Spécialités supprimées dans cette page:', deletedSpecialities.length, deletedSpecialities);
        console.log('📊 Spécialités actives dans cette page:', activeSpecialities.length, activeSpecialities);
        
        this.specialities.set(response.items);
        this.totalElements.set(response.totalElements);
        this.isLoading.set(false);
        
        // Mettre à jour les vrais compteurs d'actifs et supprimés
        this.updateRealCounts();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des spécialités:', error);
        this.notificationService.error('Erreur', 'Erreur lors du chargement des spécialités');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Recherche des spécialités selon les critères
   */
  searchSpecialities() {
    console.log('🔍 Recherche avec critères:', this.searchCriteria);
    this.currentPage.set(0);
    this.loadSpecialities();
  }

  /**
   * Réinitialise les critères de recherche
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
    this.searchSpecialities();
  }

  /**
   * Crée une nouvelle spécialité
   */
  createSpeciality() {
    // Réinitialiser le formulaire
    this.createFormData = {
      specialityName: '',
      specialityDesc: '',
      departmentId: 0
    };
    this.selectedDepartmentName.set('');
    this.showCreateDialog.set(true);
  }

  /**
   * Ferme la popup de création
   */
  closeCreateDialog() {
    this.showCreateDialog.set(false);
    this.createFormData = {
      specialityName: '',
      specialityDesc: '',
      departmentId: 0
    };
  }

  /**
   * Valide et crée une nouvelle spécialité
   */
  async validateSpecialityCreation() {
    const formData = this.createFormData;

    console.log('🔧 Début validation création - formData:', formData);

    // Validation des champs requis
    if (!formData.specialityName.trim()) {
      this.notificationService.warning('Attention', 'Le nom de la spécialité est requis');
      return;
    }
    if (!formData.specialityDesc.trim()) {
      this.notificationService.warning('Attention', 'La description de la spécialité est requise');
      return;
    }
    if (!formData.departmentId || formData.departmentId <= 0) {
      this.notificationService.warning('Attention', 'Le département est requis');
      return;
    }

    try {
      // Appel de l'API pour créer une nouvelle spécialité
      console.log('🔧 Création d\'une nouvelle spécialité');

      const newSpeciality: any = await this.specialityService.create({
        nom: formData.specialityName.trim(),
        description: formData.specialityDesc.trim(),
        departmentId: formData.departmentId
      }).toPromise();

      console.log('✅ Spécialité créée:', newSpeciality);
      console.log('✅ Response hasError:', newSpeciality?.hasError);
      console.log('✅ Response httpCode:', newSpeciality?.httpCode);
      console.log('✅ Response status:', newSpeciality?.status);

      // Vérifier si la réponse indique une erreur
      if (newSpeciality && newSpeciality.hasError) {
        console.error('❌ Erreur détectée dans la réponse:', newSpeciality);
        console.error('❌ Status object:', newSpeciality.status);
        console.error('❌ Status message:', newSpeciality.status?.message);
        console.error('❌ Status code:', newSpeciality.status?.code);
        console.error('❌ HTTP Code:', newSpeciality.httpCode);

        const errorMessage = newSpeciality.status?.message || newSpeciality.status?.code || 'Erreur lors de la création';
        this.notificationService.error('Erreur', errorMessage);
        return;
      }

      // Vérifier le httpCode seulement s'il existe
      if (newSpeciality && newSpeciality.httpCode && newSpeciality.httpCode !== 201) {
        console.error('❌ Code HTTP d\'erreur:', newSpeciality.httpCode);
        this.notificationService.error('Erreur', `Erreur HTTP: ${newSpeciality.httpCode}`);
        return;
      }

      this.notificationService.success('Succès', `Spécialité ${formData.specialityName} créée avec succès`);
      this.closeCreateDialog();
      this.loadSpecialities(); // Recharger la liste
    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error);
      console.error('❌ Détail de l\'erreur:', error?.error);
      this.notificationService.error('Erreur', `Erreur lors de la création: ${error?.error?.message || error?.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Édite une spécialité
   */
  editSpeciality(speciality: Speciality) {
    this.specialityToEdit.set(speciality);
    this.editFormData = {
      id: speciality.id,
      specialityName: speciality.nom || '',
      specialityDesc: speciality.description || '',
      departmentId: speciality.departmentId || 0
    };
    this.updateSelectedDepartmentName(speciality.departmentId || 0);
    this.showEditDialog.set(true);
  }

  /**
   * Ferme la popup d'édition
   */
  closeEditDialog() {
    this.showEditDialog.set(false);
    this.specialityToEdit.set(null);
    this.editFormData = {
      id: 0,
      specialityName: '',
      specialityDesc: '',
      departmentId: 0
    };
  }

  // ==================== GESTION DES DÉPARTEMENTS ====================

  /**
   * Charge la liste des départements actifs
   */
  private loadDepartments(): void {
    console.log('📥 Chargement des départements...');
    this.departmentService.getAllDepartmentsByCriteria({ isDeleted: false }).subscribe({
      next: (response: any) => {
        console.log('✅ Départements chargés:', response.items);
        this.departments.set(response.items);
      },
      error: (error: any) => {
        console.error('❌ Erreur lors du chargement des départements:', error);
        this.notificationService.error('Erreur', 'Impossible de charger la liste des départements');
      }
    });
  }

  /**
   * Bascule l'affichage de la liste déroulante des départements
   */
  toggleDepartmentDropdown(): void {
    this.showDepartmentDropdown.set(!this.showDepartmentDropdown());
  }

  /**
   * Ferme la liste déroulante des départements
   */
  closeDepartmentDropdown(): void {
    this.showDepartmentDropdown.set(false);
  }

  /**
   * Sélectionne un département depuis la liste déroulante
   */
  selectDepartment(department: Department, formType: 'edit' | 'create'): void {
    if (formType === 'edit') {
      this.editFormData.departmentId = department.id;
      this.selectedDepartmentName.set(department.name || '');
    } else {
      this.createFormData.departmentId = department.id;
      this.selectedDepartmentName.set(department.name || '');
    }
    this.closeDepartmentDropdown();
  }

  /**
   * Met à jour le nom du département affiché selon l'ID sélectionné
   */
  updateSelectedDepartmentName(departmentId: number): void {
    const department = this.departments().find(d => d.id === departmentId);
    if (department) {
      this.selectedDepartmentName.set(department.name || '');
    } else {
      this.selectedDepartmentName.set('');
    }
  }

  /**
   * Valide et sauvegarde les modifications
   */
  async validateSpecialityEdit() {
    const formData = this.editFormData;
    const currentSpeciality = this.specialityToEdit();

    console.log('🔧 Début validation - formData:', formData);
    console.log('🔧 Début validation - currentSpeciality:', currentSpeciality);

    if (!currentSpeciality) {
      this.notificationService.error('Erreur', 'Aucune spécialité sélectionnée pour modification');
      return;
    }

    // Validation des champs requis
    if (!formData.specialityName.trim()) {
      this.notificationService.warning('Attention', 'Le nom de la spécialité est requis');
      return;
    }
    if (!formData.specialityDesc.trim()) {
      this.notificationService.warning('Attention', 'La description de la spécialité est requise');
      return;
    }
    if (!formData.departmentId || formData.departmentId <= 0) {
      this.notificationService.warning('Attention', 'Le département est requis');
      return;
    }

    try {
      // Appel de l'API pour mettre à jour une spécialité
      console.log('🔧 Mise à jour de la spécialité');

      const updatedSpeciality: any = await this.specialityService.update(currentSpeciality.id, {
        nom: formData.specialityName.trim(),
        description: formData.specialityDesc.trim(),
        departmentId: formData.departmentId
      }).toPromise();

      console.log('✅ Spécialité mise à jour:', updatedSpeciality);
      console.log('✅ Response hasError:', updatedSpeciality?.hasError);
      console.log('✅ Response httpCode:', updatedSpeciality?.httpCode);
      console.log('✅ Response status:', updatedSpeciality?.status);

      // Vérifier si la réponse indique une erreur
      if (updatedSpeciality && updatedSpeciality.hasError) {
        console.error('❌ Erreur détectée dans la réponse:', updatedSpeciality);
        console.error('❌ Status object:', updatedSpeciality.status);
        console.error('❌ Status message:', updatedSpeciality.status?.message);
        console.error('❌ Status code:', updatedSpeciality.status?.code);
        console.error('❌ HTTP Code:', updatedSpeciality.httpCode);

        const errorMessage = updatedSpeciality.status?.message || updatedSpeciality.status?.code || 'Erreur lors de la mise à jour';
        this.notificationService.error('Erreur', errorMessage);
        return;
      }

      // Vérifier le httpCode seulement s'il existe
      if (updatedSpeciality && updatedSpeciality.httpCode && updatedSpeciality.httpCode !== 200) {
        console.error('❌ Code HTTP d\'erreur:', updatedSpeciality.httpCode);
        this.notificationService.error('Erreur', `Erreur HTTP: ${updatedSpeciality.httpCode}`);
        return;
      }

      this.notificationService.success('Succès', `Spécialité ${formData.specialityName} modifiée avec succès`);
      this.closeEditDialog();
      this.loadSpecialities(); // Recharger la liste
    } catch (error: any) {
      console.error('❌ Erreur lors de la modification:', error);
      console.error('❌ Détail de l\'erreur:', error?.error);
      this.notificationService.error('Erreur', `Erreur lors de la modification: ${error?.error?.message || error?.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Supprime la spécialité depuis la popup d'édition
   */
  deleteSpecialityFromEdit() {
    const speciality = this.specialityToEdit();
    if (speciality) {
      this.closeEditDialog();
      this.deleteSpeciality(speciality);
    }
  }

  /**
   * Affiche la popup de confirmation pour supprimer une spécialité
   */
  deleteSpeciality(speciality: Speciality) {
    this.specialityToDelete = speciality;
    this.showDeleteConfirmation = true;
  }

  /**
   * Confirme la suppression d'une spécialité
   */
  async confirmDeleteSpeciality() {
    if (!this.specialityToDelete) return;

    try {
      // Marquer la spécialité comme supprimée via update
      await this.specialityService.update(this.specialityToDelete.id, {
        ...this.specialityToDelete,
        isDeleted: true
      }).toPromise();

      this.notificationService.success('Succès', `Spécialité ${this.specialityToDelete?.nom || this.specialityToDelete?.name} supprimée avec succès`);

      // Marquer la spécialité comme supprimée dans la liste locale
      if (this.specialityToDelete) {
        this.specialityToDelete.isDeleted = true;
      }

      // Activer automatiquement l'affichage des spécialités supprimées
      this.showDeletedSpecialities = true;

      this.cancelDeleteSpeciality();
      // Recharger la liste pour refléter les changements
      this.loadSpecialities();
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      this.notificationService.error('Erreur', 'Erreur lors de la suppression de la spécialité');
      this.cancelDeleteSpeciality();
    }
  }

  /**
   * Annule la suppression d'une spécialité
   */
  cancelDeleteSpeciality() {
    this.showDeleteConfirmation = false;
    this.specialityToDelete = null;
  }

  /**
   * Affiche la popup de confirmation pour restaurer une spécialité supprimée
   */
  restoreSpeciality(speciality: Speciality) {
    this.specialityToRestore.set(speciality);
    this.showRestoreConfirmation.set(true);
  }

  /**
   * Confirme la restauration d'une spécialité
   */
  async confirmRestoreSpeciality() {
    const specialityToRestore = this.specialityToRestore();
    if (!specialityToRestore) return;

    try {
      // Restaurer la spécialité via update
      await this.specialityService.update(specialityToRestore.id, {
        ...specialityToRestore,
        isDeleted: false
      }).toPromise();

      this.notificationService.success('Succès', `Spécialité ${specialityToRestore?.nom || specialityToRestore?.name} restaurée avec succès`);

      // Marquer la spécialité comme restaurée dans la liste locale
      specialityToRestore.isDeleted = false;

      this.cancelRestoreSpeciality();
      // Recharger la liste pour refléter les changements
      this.loadSpecialities();
    } catch (error) {
      console.error('❌ Erreur lors de la restauration:', error);
      this.notificationService.error('Erreur', 'Erreur lors de la restauration de la spécialité');
      this.cancelRestoreSpeciality();
    }
  }

  /**
   * Annule la restauration d'une spécialité
   */
  cancelRestoreSpeciality() {
    this.showRestoreConfirmation.set(false);
    this.specialityToRestore.set(null);
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
    this.router.navigate(['/dashboard/entities/specialities', page + 1]);
    this.loadSpecialities();
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
    this.loadSpecialities();

    console.log('✅ FIN changePageSize - nouvelle valeur stockée');
  }

  /**
   * Toggle l'affichage des spécialités supprimées
   */
  toggleDeletedSpecialities() {
    this.showDeletedSpecialities = !this.showDeletedSpecialities;
    console.log('🔄 Toggle spécialités supprimées:', this.showDeletedSpecialities ? 'ACTIVÉ' : 'DÉSACTIVÉ');
    console.log('📦 Taille de page actuelle avant toggle:', this.pageSize());
    this.currentPage.set(0); // Revenir à la première page
    console.log('📦 Taille de page actuelle après toggle:', this.pageSize());
    this.loadSpecialities();
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
  trackBySpecialityId(index: number, speciality: Speciality): number {
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
    this.searchCriteria.isDeleted = undefined;

    // Utiliser search_string pour la recherche globale
    this.searchCriteria.search_string = this.quickSearch.trim();

    // Fermer la recherche avancée si elle était ouverte
    this.showAdvancedSearch = false;

    // Débounce pour éviter trop de requêtes
    setTimeout(() => {
      this.searchSpecialities();
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
    this.searchSpecialities();
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
      dateModificationA: ''
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
  formatCreationDate(speciality: Speciality): string {
    if (!speciality.dateCreation) return '-';

    // Si la date ne contient pas d'heures (format "jj/mm/aaaa"), afficher seulement la date
    if (!speciality.dateCreation.includes(' ')) {
      const date = this.parseFrenchDate(speciality.dateCreation);
      if (!date) return speciality.dateCreation;

      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }

    // Si la date contient des heures, les afficher
    const date = this.parseFrenchDate(speciality.dateCreation);
    if (!date) return speciality.dateCreation;

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Compte les spécialités actives (total réel dans la BD)
   */
  getActiveSpecialitiesCount(): number {
    return this.totalActiveSpecialities();
  }

  /**
   * Compte les spécialités supprimées (total réel dans la BD)
   */
  getDeletedSpecialitiesCount(): number {
    return this.totalDeletedSpecialities();
  }

  /**
   * Met à jour les vrais compteurs d'actifs et supprimés
   */
  private updateRealCounts() {
    // Compter les actifs (isDeleted = false) - appel léger avec size=1
    const activeCriteria = { ...this.searchCriteria, isDeleted: false, page: 0, size: 1 };
    this.specialityService.getAll(activeCriteria).subscribe({
      next: (response) => {
        this.totalActiveSpecialities.set(response.totalElements);
      },
      error: (error) => console.error('Erreur lors du comptage des spécialités actives:', error)
    });

    // Compter tous (isDeleted = undefined) pour calculer les supprimés
    const allCriteria = { ...this.searchCriteria, isDeleted: undefined, page: 0, size: 1 };
    this.specialityService.getAll(allCriteria).subscribe({
      next: (response) => {
        const totalAll = response.totalElements;
        // Petite attente pour s'assurer que totalActive est mis à jour
        setTimeout(() => {
          const totalActive = this.totalActiveSpecialities();
          this.totalDeletedSpecialities.set(totalAll - totalActive);
        }, 100);
      },
      error: (error) => console.error('Erreur lors du comptage total des spécialités:', error)
    });
  }
}
