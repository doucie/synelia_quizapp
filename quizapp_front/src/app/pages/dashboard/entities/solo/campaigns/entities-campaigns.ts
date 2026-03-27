import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { CampaignService, Campaign, CampaignSearchCriteria, PagedResponse } from '../../../../../core/services/campaign.service';
import { UserService } from '../../../../../core/services/user.service';
import { SpecialityService, Speciality } from '../../../../../core/services/speciality.service';
import { QuestionService, Question } from '../../../../../core/services/question.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { AuthService } from '../../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-entities-campaigns',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  templateUrl: './entities-campaigns.html',
  styleUrl: './entities-campaigns.scss'
})
export class EntitiesCampaignsComponent implements OnInit, OnDestroy {
  // Exposer Math pour utilisation dans le template
  Math = Math;
  
  // Variable pour éviter les appels multiples
  private destroy$ = new Subject<void>();
  private loadingTimeout: any;
  
  // Signaux pour la réactivité
  campaigns = signal<Campaign[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10); // Valeur par défaut, sera mise à jour dans ngOnInit
  
  // Signaux pour l'expansion des campagnes
  expandedCampaigns = signal<Set<number>>(new Set());
  campaignQuestions = signal<{[campaignId: number]: Question[]}>({});
  loadingQuestions = signal<{[campaignId: number]: boolean}>({});
  
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
  showDeletedCampaigns = true; // Par défaut, afficher toutes les campagnes
  
  // Compteurs réels (total dans la BD)
  totalActiveCampaigns = signal<number>(0);
  totalDeletedCampaigns = signal<number>(0);
  
  // Options de pagination avec 10 par défaut
  pageSizeOptions = [5, 10, 20, 50, 100];
  private readonly PAGE_SIZE_STORAGE_KEY = 'entities-campaigns-page-size';
  
  // État de la popup de confirmation
  showDeleteConfirmation = false;
  campaignToDelete: Campaign | null = null;
  
  // État de la popup de restauration
  showRestoreConfirmation = signal<boolean>(false);
  campaignToRestore = signal<Campaign | null>(null);
  
  // État de la popup d'édition
  showEditDialog = signal<boolean>(false);
  campaignToEdit = signal<Campaign | null>(null);
  editFormData = {
    id: 0,
    campaignName: '',
    campaignDesc: ''
  };

  // État de la popup de création
  showCreateDialog = signal<boolean>(false);
  createFormData = {
    campaignName: '',
    campaignDesc: ''
  };
  
  // États pour la gestion des spécialités
  showSpecialityCreateDialog = signal<boolean>(false);
  showSpecialityEditDialog = signal<boolean>(false);
  showSpecialityDeleteConfirmation = signal<boolean>(false);
  showSpecialityRestoreConfirmation = signal<boolean>(false);
  
  specialityToEdit = signal<Speciality | null>(null);
  specialityToDelete = signal<Speciality | null>(null);
  specialityToRestore = signal<Speciality | null>(null);
  currentCampaignForSpeciality = signal<Campaign | null>(null);
  
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
  advancedCriteria: CampaignSearchCriteria = {
    idDe: '',
    idA: '',
    campaignName: '',
    campaignDesc: '',
    isDeleted: undefined,
    campaignStartDe: '',
    campaignStartA: '',
    campaignEndDe: '',
    campaignEndA: '',
    search_string: ''
  };



  constructor(
    private campaignService: CampaignService,
    private userService: UserService,
    private specialityService: SpecialityService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('🚀 Initialisation EntitiesCampaignsComponent');
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
  }

  ngOnDestroy() {
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
    this.showDeleteConfirmation = true;
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
    this.showRestoreConfirmation.set(true);
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


  /**
   * TrackBy function pour optimiser les performances de rendu des spécialités
   */
  trackBySpecialityId(index: number, speciality: any): number {
    return speciality.id;
  }

  /**
   * TrackBy function pour optimiser les performances de rendu des questions
   */
  trackByQuestionId(index: number, question: any): number {
    return question.id;
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
      isDeleted: undefined,
      campaignStartDe: '',
      campaignStartA: '',
      campaignEndDe: '',
      campaignEndA: '',
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


  /**
   * Retourne les questions d'une campagne donnée
   */
  getCampaignQuestions(campaignId: number): Question[] {
    return this.campaignQuestions()[campaignId] || [];
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
    const currentExpanded = this.expandedCampaigns();
    const newExpanded = new Set(currentExpanded);
    
    if (newExpanded.has(campaignId)) {
      // Réduire
      newExpanded.delete(campaignId);
      this.expandedCampaigns.set(newExpanded);
    } else {
      // Étendre et charger les spécialités
      newExpanded.add(campaignId);
      this.expandedCampaigns.set(newExpanded);
      this.loadCampaignQuestions(campaignId);
    }
  }

  /**
   * Vérifie si une campagne est expandée
   */
  isCampaignExpanded(campaignId: number): boolean {
    return this.expandedCampaigns().has(campaignId);
  }

  /**
   * Charge les questions d'une campagne
   */
  loadCampaignQuestions(campaignId: number) {
    // Éviter les appels multiples
    if (this.loadingQuestions()[campaignId]) {
      return;
    }

    // Activer le loading pour cette campagne
    this.loadingQuestions.set({
      ...this.loadingQuestions(),
      [campaignId]: true
    });

    console.log(`🔍 Chargement des questions pour la campagne ${campaignId}...`);

    // Charger les questions de la campagne
    this.campaignService.getCampaignQuestions(campaignId).subscribe({
      next: (questions: Question[]) => {
        console.log(`✅ Questions chargées pour la campagne ${campaignId}:`, questions);
        
        // Mettre à jour les questions de la campagne
        this.campaignQuestions.set({
          ...this.campaignQuestions(),
          [campaignId]: questions
        });

        // Désactiver le loading
        this.loadingQuestions.set({
          ...this.loadingQuestions(),
          [campaignId]: false
        });
      },
      error: (error) => {
        console.error(`❌ Erreur lors du chargement des questions de la campagne ${campaignId}:`, error);
        this.notificationService.error('Erreur', `Erreur lors du chargement des questions de la campagne ${campaignId}`);
        
        // Désactiver le loading même en cas d'erreur
        this.loadingQuestions.set({
          ...this.loadingQuestions(),
          [campaignId]: false
        });
      }
    });
  }

  /**
   * Vérifie si les spécialités d'une campagne sont en cours de chargement
   */
  isLoadingSpecialities(campaignId: number): boolean {
    return this.loadingQuestions()[campaignId] || false;
  }

  /**
   * Crée une nouvelle spécialité dans une campagne
   */
  createSpecialityInCampaign(campaign: Campaign) {
    console.log('🆕 Création d\'une spécialité dans la campagne:', campaign.campaignName);
    this.currentCampaignForSpeciality.set(campaign);
    this.specialityCreateFormData = {
      nom: '',
      description: ''
    };
    this.showSpecialityCreateDialog.set(true);
  }

  /**
   * Modifie une spécialité
   */
  editSpecialityInCampaign(speciality: Speciality, campaign: Campaign) {
    console.log('✏️ Modification de la spécialité:', speciality.nom, 'dans la campagne:', campaign.campaignName);
    this.currentCampaignForSpeciality.set(campaign);
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
  deleteSpecialityInCampaign(speciality: Speciality, campaign: Campaign) {
    console.log('🗑️ Suppression de la spécialité:', speciality.nom, 'dans la campagne:', campaign.campaignName);
    this.currentCampaignForSpeciality.set(campaign);
    this.specialityToDelete.set(speciality);
    this.showSpecialityDeleteConfirmation.set(true);
  }

  /**
   * Restaure une spécialité supprimée
   */
  restoreSpecialityInCampaign(speciality: Speciality, campaign: Campaign) {
    console.log('♻️ Restauration de la spécialité:', speciality.nom, 'dans la campagne:', campaign.campaignName);
    this.currentCampaignForSpeciality.set(campaign);
    this.specialityToRestore.set(speciality);
    this.showSpecialityRestoreConfirmation.set(true);
  }

  /**
   * Confirme la création d'une spécialité
   */
  async confirmCreateSpeciality() {
    if (!this.currentCampaignForSpeciality()) {
      this.notificationService.error('Erreur', 'Campagne non trouvée');
      return;
    }

    const campaign = this.currentCampaignForSpeciality()!;
    const specialityData = {
      nom: this.specialityCreateFormData.nom.trim(),
      description: this.specialityCreateFormData.description.trim(),
      campaignId: campaign.id
    };

    if (!specialityData.nom) {
      this.notificationService.error('Erreur', 'Le nom de la spécialité est obligatoire');
      return;
    }

    try {
      console.log('🚀 Création de la spécialité:', specialityData);
      const newSpeciality: any = await this.specialityService.create(specialityData);
      console.log('✅ Spécialité créée:', newSpeciality);

      // Recharger les spécialités de la campagne
      this.loadCampaignQuestions(campaign.id);

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
    this.currentCampaignForSpeciality.set(null);
    this.specialityCreateFormData = {
      nom: '',
      description: ''
    };
  }

  /**
   * Confirme la modification d'une spécialité
   */
  async confirmEditSpeciality() {
    if (!this.specialityToEdit() || !this.currentCampaignForSpeciality()) {
      this.notificationService.error('Erreur', 'Spécialité ou campagne non trouvée');
      return;
    }

    const speciality = this.specialityToEdit()!;
    const campaign = this.currentCampaignForSpeciality()!;
    const specialityData = {
      nom: this.specialityEditFormData.nom.trim(),
      description: this.specialityEditFormData.description.trim(),
      campaignId: campaign.id
    };

    if (!specialityData.nom) {
      this.notificationService.error('Erreur', 'Le nom de la spécialité est obligatoire');
      return;
    }

    try {
      console.log('🚀 Modification de la spécialité:', speciality.id, specialityData);
      const updatedSpeciality: any = await this.specialityService.update(speciality.id, specialityData);
      console.log('✅ Spécialité modifiée:', updatedSpeciality);

      // Recharger les spécialités de la campagne
      this.loadCampaignQuestions(campaign.id);

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
    this.currentCampaignForSpeciality.set(null);
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
    if (!this.specialityToDelete() || !this.currentCampaignForSpeciality()) {
      this.notificationService.error('Erreur', 'Spécialité ou campagne non trouvée');
      return;
    }

    const speciality = this.specialityToDelete()!;
    const campaign = this.currentCampaignForSpeciality()!;

    try {
      console.log('🚀 Suppression de la spécialité:', speciality.id);
      await this.specialityService.delete(speciality.id);
      console.log('✅ Spécialité supprimée');

      // Recharger les spécialités de la campagne
      this.loadCampaignQuestions(campaign.id);

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
    this.currentCampaignForSpeciality.set(null);
  }

  /**
   * Confirme la restauration d'une spécialité
   */
  async confirmRestoreSpeciality() {
    if (!this.specialityToRestore() || !this.currentCampaignForSpeciality()) {
      this.notificationService.error('Erreur', 'Spécialité ou campagne non trouvée');
      return;
    }

    const speciality = this.specialityToRestore()!;
    const campaign = this.currentCampaignForSpeciality()!;

    try {
      console.log('🚀 Restauration de la spécialité:', speciality.id);
      await this.specialityService.restore(speciality.id);
      console.log('✅ Spécialité restaurée');

      // Recharger les spécialités de la campagne
      this.loadCampaignQuestions(campaign.id);

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
    this.currentCampaignForSpeciality.set(null);
  }

  /**
   * Édite une question dans une campagne
   */
  editQuestionInCampaign(question: Question, campaign: Campaign) {
    console.log('✏️ Modification de la question:', question.questionText, 'dans la campagne:', campaign.campaignName);
    // TODO: Implémenter l'édition d'une question dans une campagne
  }

  /**
   * Crée une nouvelle question dans une campagne
   */
  createQuestionInCampaign(campaign: Campaign) {
    console.log('🆕 Création d\'une question dans la campagne:', campaign.campaignName);
    // TODO: Implémenter la création d'une question dans une campagne
  }

  /**
   * Supprime une question d'une campagne
   */
  deleteQuestionInCampaign(question: Question, campaign: Campaign) {
    console.log('🗑️ Suppression de la question:', question.questionText, 'dans la campagne:', campaign.campaignName);
    // TODO: Implémenter la suppression d'une question d'une campagne
  }

  /**
   * Restaure une question supprimée dans une campagne
   */
  restoreQuestionInCampaign(question: Question, campaign: Campaign) {
    console.log('♻️ Restauration de la question:', question.questionText, 'dans la campagne:', campaign.campaignName);
    // TODO: Implémenter la restauration d'une question dans une campagne
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
