import { Component, OnInit, OnDestroy, ElementRef, HostListener, signal, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntityDetailPanelComponent, DetailField } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { FilterCheckboxComponent } from '../../../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { EntityColumnVisibilityState, ColumnDef } from '../../../../../shared/entity-column-visibility';
import { DashboardStatsService } from '../../../../../core/services/dashboard-stats.service';
import { DependencyInfo } from '../../../../../shared/models/interfaces';
import { Router, ActivatedRoute } from '@angular/router';

import { CampaignService, Campaign, CampaignSearchCriteria, PagedResponse } from '../../../../../core/services/campaign.service';
import { UserService } from '../../../../../core/services/user.service';
import { FormService, Form } from '../../../../../core/services/form.service';
import { SourceTokenService, SourceToken } from '../../../../../services/source-token.service';
import { EntityPermissionService } from '../../../../../core/services/entity-permission.service';
import { EntityPermission } from '../../../../../core/models/permission.interfaces';
import { NotificationService } from '../../../../../core/services/notification.service';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { SpecialityService, Speciality } from '../../../../../core/services/speciality.service';

@Component({
  selector: 'app-entities-campaigns',
  standalone: true,
  imports: [FilterSelectComponent, FilterSelectOptionDirective, CommonModule, NgIf, NgFor, FormsModule, FilterCheckboxComponent, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-campaigns.html',
  styleUrl: './entities-campaigns.scss'
})
export class EntitiesCampaignsComponent implements OnInit, OnDestroy {
  // Exposer Math pour utilisation dans le template
  Math = Math;
  
  // Variable pour éviter les appels multiples
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
    this.editCampaign(item);
  }

  saveFromDetail(data: any): void {
    this.campaignService.updateCampaign(data.id, data).subscribe({
      next: () => { this.selectedItem.set(data); this.loadCampaigns(); this.notificationService.success('Succès', 'Campagne modifiée'); },
      error: () => { this.notificationService.error('Erreur', 'Erreur lors de la modification'); }
    });
  }

  deleteFromDetail(item: any): void {
    this.closeDetailPanel();
    this.deleteCampaign(item);
  }

  restoreFromDetail(item: any): void {
    this.closeDetailPanel();
    this.restoreCampaign(item);
  }
  private loadingTimeout: any;
  
  // Signaux pour la réactivité
  campaigns = signal<Campaign[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10); // Valeur par défaut, sera mise à jour dans ngOnInit
  
  // Signaux pour l'expansion des campagnes
  expandedCampaigns = signal<Set<number>>(new Set());
  campaignForms = signal<{[campaignId: number]: Form[]}>({});
  campaignSourceTokens = signal<{[campaignId: number]: SourceToken[]}>({});
  campaignPermissions = signal<{[campaignId: number]: any[]}>({});
  loadingChildren = signal<{[campaignId: number]: boolean}>({});
  childTab = signal<{[campaignId: number]: string}>({});
  
  // Critères de recherche
  searchCriteria: CampaignSearchCriteria = {
    idDe: '',
    idA: '',
    campaignName: '',
    campaignDesc: '',
    search_string: ''
  };

  // Recherche rapide
  quickSearch = '';
  
  // État de la recherche avancée
  showAdvancedSearch = false;
  
  // Contrôle d'affichage des campagnes supprimés
  showDeletedCampaigns = false; // Par défaut, masquer les campagnes supprimées dans la liste active
  
  // Compteurs réels (total dans la BD)
  totalActiveCampaigns = signal<number>(0);
  totalDeletedCampaigns = signal<number>(0);
  
  // Options de pagination avec 10 par défaut
  pageSizeOptions = [5, 10, 20, 50, 100];
  private readonly PAGE_SIZE_STORAGE_KEY = 'entities-campaigns-page-size';

  readonly allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'name', label: 'Nom', priority: 1 },
    { key: 'description', label: 'Description', priority: 3 },
    { key: 'status', label: 'Statut', priority: 2 },
    { key: 'speciality', label: 'Spécialité', priority: 2 },
    { key: 'pipelineTemplate', label: 'Template Pipeline', priority: 3 },
    { key: 'startDate', label: 'Date Début', priority: 2 },
    { key: 'endDate', label: 'Date Fin', priority: 2 },
    { key: 'createdAt', label: 'Créé le', priority: 3 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];
  private readonly columnVisibility = new EntityColumnVisibilityState(this.allColumns, 'column-visibility-campaigns');
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
  // -- FK Dropdowns --
  private specialityFkService = inject(SpecialityService);
  allSpecialities = signal<Speciality[]>([]);
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
  campaignToDelete: Campaign | null = null;
  
  // État de la popup de restauration
  showRestoreConfirmation = signal<boolean>(false);
  campaignToRestore = signal<Campaign | null>(null);
  
  // État de la popup d'édition
  showEditDialog = signal<boolean>(false);
  campaignToEdit = signal<Campaign | null>(null);
  editFormData: { id: number; campaignName: string; campaignDesc: string; specialitiesId?: number } = {
    id: 0,
    campaignName: '',
    campaignDesc: '',
    specialitiesId: undefined
  };

  // État de la popup de création
  showCreateDialog = signal<boolean>(false);
  createFormData: { campaignName: string; campaignDesc: string; specialitiesId?: number } = {
    campaignName: '',
    campaignDesc: '',
    specialitiesId: undefined
  };
  

  
  // Critères de recherche avancée
  advancedCriteria: CampaignSearchCriteria = {
    idDe: '',
    idA: '',
    campaignName: '',
    campaignDesc: '',
    specialityId: undefined,
    isActive: undefined,
    isDeleted: undefined,
    campaignStartDe: '',
    campaignStartA: '',
    campaignEndDe: '',
    campaignEndA: '',
    dateCreationDe: '',
    dateCreationA: '',
    dateModificationDe: '',
    dateModificationA: '',
    search_string: ''
  };



  constructor(
    private campaignService: CampaignService,
    private userService: UserService,
    private formService: FormService,
    private sourceTokenService: SourceTokenService,
    private entityPermissionService: EntityPermissionService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('🚀 Initialisation EntitiesCampaignsComponent');
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
    
    this.loadCampaigns();
    this.specialityFkService.getAll({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allSpecialities.set(res.items) });
  }

  ngOnDestroy() {
    this.columnVisibility.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
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
   * Charge la liste des campagnes
   */
  loadCampaigns() {
    // Annuler le timeout précédent s'il existe
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    
    // Débounce pour éviter les appels multiples rapides
    this.loadingTimeout = setTimeout(() => {
      this.performLoadCampaigns();
    }, 100);
  }

  /**
   * Exécute réellement le chargement des campagnes
   */
  private performLoadCampaigns() {
    this.isLoading.set(true);
    const serviceMethod = this.showDeletedCampaigns ? 'incluant supprimés' : 'actifs seulement';
    console.log(`📥 Chargement des campagnes (${serviceMethod})...`);
    console.log('🔍 Critères de recherche utilisés:', this.searchCriteria);

    const criteria = {
      ...this.searchCriteria,
      page: this.currentPage(),
      size: this.pageSize(),
      isDeleted: this.showDeletedCampaigns ? undefined : false // undefined = tous, false = actifs seulement
    };

    console.log('📤 Requête envoyée avec critères:', criteria);

    // Utiliser toujours la même méthode mais avec le critère isDeleted approprié
    const serviceCall = this.campaignService.getAllCampaignsByCriteria(criteria);

    serviceCall.subscribe({
      next: (response: PagedResponse<Campaign>) => {
        console.log(`✅ RÉPONSE COMPLÈTE reçue (${serviceMethod}):`, response);
        console.log('📊 Nombre total de campagnes (totalElements):', response.totalElements);
        console.log('📊 Nombre de campagnes dans cette page:', response.content.length);
        console.log('📊 Page courante (number):', response.number || 'non défini');
        console.log('📊 Taille de page (size):', response.size || 'non défini');
        console.log('📊 Nombre total de pages:', response.totalPages || 'non défini');
        
        // Analyser les campagnes reçues
        const deletedCampaigns = response.content.filter((c: Campaign) => c.isDeleted);
        const activeCampaigns = response.content.filter((c: Campaign) => !c.isDeleted);
        
        console.log('📊 Campagnes supprimées dans cette page:', deletedCampaigns.length, deletedCampaigns);
        console.log('📊 Campagnes actives dans cette page:', activeCampaigns.length, activeCampaigns);
        
        // DEBUG: Afficher la structure des premières campagnes
        if (response.content.length > 0) {
          console.log('🔍 STRUCTURE de la première campagne:', response.content[0]);
          console.log('🔍 Propriétés de la première campagne:', Object.keys(response.content[0]));
          console.log('🔍 Valeurs de campaignName/campaignDesc/createdAt:', {
            campaignName: response.content[0].campaignName,
            campaignDesc: response.content[0].campaignDesc,
            createdAt: response.content[0].createdAt
          });
        }
        
        this.campaigns.set(response.content);
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
  searchCampaigns() {
    console.log('🔍 Recherche avec critères:', this.searchCriteria);
    this.currentPage.set(0);
    this.loadCampaigns();
  }

  /**
   * Réinitialise les critères de recherche
   */
  clearSearch() {
    // Reset search criteria
    this.searchCriteria = {
      idDe: '',
      idA: '',
      campaignName: '',
      campaignDesc: '',
      search_string: ''
    };
    this.quickSearch = '';
    this.showAdvancedSearch = false;
    this.resetAdvancedSearch();
    this.searchCampaigns();
  }

  /**
   * Crée une nouvelle campagne
   */
  createCampaign() {
    // Réinitialiser le formulaire
    this.createFormData = {
      campaignName: '',
      campaignDesc: ''
    };
    this.showCreateDialog.set(true);
  }

  /**
   * Ferme la popup de création
   */
  closeCreateDialog() {
    this.showCreateDialog.set(false);
    this.createFormData = {
      campaignName: '',
      campaignDesc: ''
    };
  }

  /**
   * Valide et crée une nouvelle campagne
   */
  async validateCampaignCreation() {
    const formData = this.createFormData;

    console.log('🔧 Début validation création - formData:', formData);

    // Validation des champs requis
    if (!formData.campaignName.trim()) {
      this.notificationService.warning('Attention', 'Le nom de la campagne est requis');
      return;
    }

    try {
      // Appel de l'API pour créer un nouveau département
      console.log('🔧 Création d\'un nouveau département');

      const newCampaign: any = await this.campaignService.createCampaign({
        campaignName: formData.campaignName.trim(),
        campaignDesc: formData.campaignDesc.trim()
      }).toPromise();

      console.log('✅ Campagne créée:', newCampaign);

      // Vérifier si la réponse indique une erreur
      if (newCampaign && newCampaign.hasError) {
        console.error('❌ Erreur détectée dans la réponse:', newCampaign);
        const errorMessage = newCampaign.status?.message || newCampaign.status?.code || 'Erreur lors de la création';
        this.notificationService.error('Erreur', errorMessage);
        return;
      }

      this.notificationService.success('Succès', `Campagne ${formData.campaignName} créée avec succès`);
      this.closeCreateDialog();
      this.loadCampaigns(); // Recharger la liste
    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error);
      console.error('❌ Détail de l\'erreur:', error?.error);
      this.notificationService.error('Erreur', `Erreur lors de la création: ${error?.error?.message || error?.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Édite une campagne
   */
  editCampaign(campaign: Campaign) {
    this.campaignToEdit.set(campaign);
    this.editFormData = {
      id: campaign.id,
      campaignName: campaign.campaignName || '',
      campaignDesc: campaign.campaignDesc || ''
    };
    this.showEditDialog.set(true);
  }

  /**
   * Ferme la popup d'édition
   */
  closeEditDialog() {
    this.showEditDialog.set(false);
    this.campaignToEdit.set(null);
    this.editFormData = {
      id: 0,
      campaignName: '',
      campaignDesc: ''
    };
  }

  /**
   * Valide et sauvegarde les modifications
   */
  async validateCampaignEdit() {
    const formData = this.editFormData;
    const currentCampaign = this.campaignToEdit();
    
    console.log('🔧 Début validation - formData:', formData);
    console.log('🔧 Début validation - currentCampaign:', currentCampaign);
    
    if (!currentCampaign) {
      this.notificationService.error('Erreur', 'Aucune campagne sélectionnée pour modification');
      return;
    }

    // Validation des champs requis
    if (!formData.campaignName.trim()) {
      this.notificationService.warning('Attention', 'Le nom de la campagne est requis');
      return;
    }

    try {
      // Appel de l'API pour mettre à jour une campagne
      console.log('🔧 Mise à jour d\'une campagne');
      
      const updatedCampaign: any = await this.campaignService.updateCampaign(currentCampaign.id, {
        campaignName: formData.campaignName.trim(),
        campaignDesc: formData.campaignDesc.trim()
      }).toPromise();

      console.log('✅ Campagne mise à jour:', updatedCampaign);

      // Vérifier si la réponse indique une erreur
      if (updatedCampaign && updatedCampaign.hasError) {
        console.error('❌ Erreur détectée dans la réponse:', updatedCampaign);
        const errorMessage = updatedCampaign.status?.message || updatedCampaign.status?.code || 'Erreur lors de la mise à jour';
        this.notificationService.error('Erreur', errorMessage);
        return;
      }

      this.notificationService.success('Succès', `Campagne ${formData.campaignName} modifié avec succès`);
      this.closeEditDialog();
      this.loadCampaigns(); // Recharger la liste
    } catch (error: any) {
      console.error('❌ Erreur lors de la modification:', error);
      console.error('❌ Détail de l\'erreur:', error?.error);
      this.notificationService.error('Erreur', `Erreur lors de la modification: ${error?.error?.message || error?.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Supprime la campagne depuis la popup d'édition
   */
  deleteCampaignFromEdit() {
    const campaign = this.campaignToEdit();
    if (campaign) {
      this.closeEditDialog();
      this.deleteCampaign(campaign);
    }
  }

  /**
   * Affiche la popup de confirmation pour supprimer une campagne
   */
  deleteCampaign(campaign: Campaign) {
    this.campaignToDelete = campaign;
    this.depService.checkDependencies('campaigns', campaign.id).subscribe({
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
   * Confirme la suppression d'une campagne
   */
  confirmDeleteCampaign() {
    if (!this.campaignToDelete) return;
    
    this.campaignService.deleteCampaign(this.campaignToDelete.id).subscribe({
      next: () => {
        this.notificationService.success('Succès', `Campagne ${this.campaignToDelete?.campaignName} supprimée avec succès`);
        
        // Marquer la campagne comme supprimée dans la liste locale
        if (this.campaignToDelete) {
          this.campaignToDelete.isDeleted = true;
        }
        
        // Activer automatiquement l'affichage des campagnes supprimés
        this.showDeletedCampaigns = true;
        
        this.cancelDeleteCampaign();
        // Recharger la liste pour refléter les changements
        this.loadCampaigns();
      },
      error: (error: any) => {
        console.error('❌ Erreur lors de la suppression:', error);
        this.notificationService.error('Erreur', 'Erreur lors de la suppression de la campagne');
        this.cancelDeleteCampaign();
      }
    });
  }

  /**
   * Annule la suppression d'une campagne
   */
  cancelDeleteCampaign() {
    this.showDeleteConfirmation = false;
    this.campaignToDelete = null;
  }

  /**
   * Affiche la popup de confirmation pour restaurer une campagne supprimée
   */
  restoreCampaign(campaign: Campaign) {
    this.campaignToRestore.set(campaign);
    this.depService.checkParent('campaigns', campaign.id).subscribe({
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
   * Confirme la restauration d'une campagne
   */
  confirmRestoreCampaign() {
    const campaignToRestore = this.campaignToRestore();
    if (!campaignToRestore) return;
    
    this.campaignService.restoreCampaign(campaignToRestore.id).subscribe({
      next: (response: any) => {
        this.notificationService.success('Succès', `Campagne ${campaignToRestore.campaignName} restaurée avec succès`);
        
        // Marquer la campagne comme restaurée dans la liste locale
        campaignToRestore.isDeleted = false;
        
        this.cancelRestoreCampaign();
        // Recharger la liste pour refléter les changements
        this.loadCampaigns();
      },
      error: (error: any) => {
        this.notificationService.error('Erreur', 'Erreur lors de la restauration de la campagne');
        this.cancelRestoreCampaign();
      }
    });
  }

  /**
   * Annule la restauration d'une campagne
   */
  cancelRestoreCampaign() {
    this.showRestoreConfirmation.set(false);
    this.campaignToRestore.set(null);
  }





  /**
   * Gestion de la pagination
   */
  goToPage(page: number) {
    this.currentPage.set(page);
    // Mettre à jour l'URL avec le numéro de page (convertir 0-based en 1-based)
    this.router.navigate(['/dashboard/entities/campaigns', page + 1]);
    this.loadCampaigns();
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
    this.loadCampaigns();
    
    console.log('✅ FIN changePageSize - nouvelle valeur stockée');
  }

  /**
   * Toggle l'affichage des campagnes supprimés
   */
  toggleDeletedCampaigns() {
    this.showDeletedCampaigns = !this.showDeletedCampaigns;
    console.log('🔄 Toggle campagnes supprimés:', this.showDeletedCampaigns ? 'ACTIVÉ' : 'DÉSACTIVÉ');
    console.log('📦 Taille de page actuelle avant toggle:', this.pageSize());
    this.currentPage.set(0); // Revenir à la première page
    console.log('📦 Taille de page actuelle après toggle:', this.pageSize());
    this.loadCampaigns();
  }

  /**
   * Retourne vers la page des entités
   */
  goBackToEntities() {
    this.router.navigate(['/dashboard/entities']);
  }


  trackByChildId(index: number, item: any): number {
    return item.id;
  }

  /**
   * Recherche rapide utilisant search_string
   */
  onQuickSearch() {
    // Réinitialiser les critères de recherche individuels
    this.searchCriteria.idDe = '';
    this.searchCriteria.idA = '';
    this.searchCriteria.campaignName = '';
    this.searchCriteria.campaignDesc = '';
    
    // Utiliser search_string pour la recherche globale
    this.searchCriteria.search_string = this.quickSearch.trim();
    
    // Fermer la recherche avancée si elle était ouverte
    this.showAdvancedSearch = false;
    
    // Débounce pour éviter trop de requêtes
    setTimeout(() => {
      this.loadCampaigns();
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
    this.loadCampaigns();
  }

  /**
   * Réinitialise les filtres avancés
   */
  resetAdvancedSearch() {
    this.advancedCriteria = {
      idDe: '',
      idA: '',
      campaignName: '',
      campaignDesc: '',
      specialityId: undefined,
      isActive: undefined,
      isDeleted: undefined,
      campaignStartDe: '',
      campaignStartA: '',
      campaignEndDe: '',
      campaignEndA: '',
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
  formatCreationDate(campaign: Campaign): string {
    console.log('📅 formatCreationDate appelée pour campagne:', campaign.id, 'createdAt:', campaign.createdAt);
    if (!campaign.createdAt) {
      console.log('📅 createdAt est undefined/null pour campagne:', campaign.id);
      return '-';
    }

    // Le backend envoie les dates au format dd/MM/yyyy
    // On doit parser ce format manuellement
    const dateStr = campaign.createdAt.trim();
    console.log('📅 Date string reçue:', dateStr);

    // Vérifier si c'est déjà au format dd/MM/yyyy
    const ddMMyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(ddMMyyyyRegex);

    if (match) {
      const [, day, month, year] = match;
      // Créer la date en format ISO (YYYY-MM-DD) pour que JavaScript puisse la parser
      const isoDateStr = `${year}-${month}-${day}`;
      const date = new Date(isoDateStr);
      console.log('📅 Date parsée depuis dd/MM/yyyy:', date, 'isValid:', !isNaN(date.getTime()));

      if (isNaN(date.getTime())) {
        console.log('📅 Date invalide pour campagne:', campaign.id, 'valeur brute:', campaign.createdAt);
        return 'Invalid Date';
      }

      const formatted = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      console.log('📅 Date formatée:', formatted);
      return formatted;
    }

    // Essayer de parser comme une date ISO standard au cas où
    const date = new Date(campaign.createdAt);
    console.log('📅 Date parsée (fallback):', date, 'isValid:', !isNaN(date.getTime()));
    if (isNaN(date.getTime())) {
      console.log('📅 Date invalide pour campagne:', campaign.id, 'valeur brute:', campaign.createdAt);
      return 'Invalid Date';
    }

    const formatted = date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    console.log('📅 Date formatée (fallback):', formatted);
    return formatted;
  }


  getCampaignForms(campaignId: number): Form[] {
    return this.campaignForms()[campaignId] || [];
  }

  getCampaignSourceTokens(campaignId: number): SourceToken[] {
    return this.campaignSourceTokens()[campaignId] || [];
  }

  getCampaignPermissions(campaignId: number): any[] {
    return this.campaignPermissions()[campaignId] || [];
  }

  getChildTab(campaignId: number): string {
    return this.childTab()[campaignId] || 'forms';
  }

  setChildTab(campaignId: number, tab: string) {
    this.childTab.set({ ...this.childTab(), [campaignId]: tab });
  }

  /**
   * Met à jour les vrais compteurs d'actifs et supprimés
   */
  private updateRealCounts() {
    // Compter les actifs (isDeleted = false) - appel léger avec size=1
    const activeCriteria = { ...this.searchCriteria, isDeleted: false, page: 0, size: 1 };
    this.campaignService.getAllCampaignsByCriteria(activeCriteria).subscribe({
      next: (response: PagedResponse<Campaign>) => {
        this.totalActiveCampaigns.set(response.totalElements);
      },
      error: (error: any) => console.error('Erreur lors du comptage des campagnes actives:', error)
    });

    // Compter tous (isDeleted = undefined) pour calculer les supprimés
    const allCriteria = { ...this.searchCriteria, isDeleted: undefined, page: 0, size: 1 };
    this.campaignService.getAllCampaignsByCriteria(allCriteria).subscribe({
      next: (response: PagedResponse<Campaign>) => {
        const totalAll = response.totalElements;
        // Petite attente pour s'assurer que totalActive est mis à jour
        setTimeout(() => {
          const totalActive = this.totalActiveCampaigns();
          this.totalDeletedCampaigns.set(totalAll - totalActive);
        }, 100);
      },
      error: (error: any) => console.error('Erreur lors du comptage total des campagnes:', error)
    });
  }

  /**
   * Bascule l'expansion d'une campagne
   */
  toggleCampaignExpansion(campaignId: number) {
    if (this.expandedCampaigns().has(campaignId)) {
      this.expandedCampaigns.set(new Set());
    } else {
      this.expandedCampaigns.set(new Set([campaignId]));
      this.loadCampaignChildren(campaignId);
    }
  }

  /**
   * Vérifie si une campagne est expandée
   */
  isCampaignExpanded(campaignId: number): boolean {
    return this.expandedCampaigns().has(campaignId);
  }

  loadCampaignChildren(campaignId: number) {
    if (this.loadingChildren()[campaignId]) return;

    this.loadingChildren.set({ ...this.loadingChildren(), [campaignId]: true });

    this.formService.getAllByCriteria({ campaignId, size: 100 }).subscribe({
      next: (res) => this.campaignForms.set({ ...this.campaignForms(), [campaignId]: res.content }),
      error: () => this.campaignForms.set({ ...this.campaignForms(), [campaignId]: [] })
    });

    this.sourceTokenService.getAllSourceTokensByCriteria({ campaignId, size: 100 }).subscribe({
      next: (res) => this.campaignSourceTokens.set({ ...this.campaignSourceTokens(), [campaignId]: res.content }),
      error: () => this.campaignSourceTokens.set({ ...this.campaignSourceTokens(), [campaignId]: [] })
    });

    this.entityPermissionService.getForEntity('CAMPAIGN', campaignId).subscribe({
      next: (res) => {
        // Agréger les entity_permissions par userId pour compatibilité template
        const permsMap = new Map<number, any>();
        (res.items || []).forEach((p: EntityPermission) => {
          if (!p.userId) return;
          if (!permsMap.has(p.userId)) {
            permsMap.set(p.userId, { id: p.id, userId: p.userId, canUpdate: false, canDelete: false, canEvaluate: false, canPlanify: false, isAdmin: false, isDeleted: false });
          }
          const entry = permsMap.get(p.userId)!;
          if (p.granted) {
            if (p.permissionKey === 'UPDATE') entry.canUpdate = true;
            if (p.permissionKey === 'DELETE') entry.canDelete = true;
            if (p.permissionKey === 'EVALUATE') entry.canEvaluate = true;
            if (p.permissionKey === 'PLANIFY') entry.canPlanify = true;
            if (p.permissionKey === 'ADMIN' || p.permissionKey === 'CREATOR') entry.isAdmin = true;
          }
        });
        this.campaignPermissions.set({ ...this.campaignPermissions(), [campaignId]: Array.from(permsMap.values()) });
        this.loadingChildren.set({ ...this.loadingChildren(), [campaignId]: false });
      },
      error: () => {
        this.campaignPermissions.set({ ...this.campaignPermissions(), [campaignId]: [] });
        this.loadingChildren.set({ ...this.loadingChildren(), [campaignId]: false });
      }
    });
  }

  isLoadingChildren(campaignId: number): boolean {
    return this.loadingChildren()[campaignId] || false;
  }

  /**
   * Fonction de tracking pour les campagnes dans ngFor
   */
  trackByCampaignId(index: number, campaign: Campaign): number {
    return campaign.id;
  }

  /**
   * Retourne le nombre de campagnes actives
   */
  getActiveCampaignsCount(): number {
    return this.totalActiveCampaigns();
  }

  /**
   * Retourne le nombre de campagnes supprimées
   */
  getDeletedCampaignsCount(): number {
    return this.totalDeletedCampaigns();
  }
}
