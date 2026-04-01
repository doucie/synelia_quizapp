import { signal, computed, inject, OnInit, Directive } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DetailField } from './entity-detail-panel/entity-detail-panel';
import { DependencyInfo } from './models/interfaces';
import { DashboardStatsService } from '../core/services/dashboard-stats.service';
import { NotificationService } from '../core/services/notification.service';

/**
 * Interface minimale pour les entités gérées par le CRUD
 */
export interface BaseEntity {
  id?: number;
  isDeleted?: boolean;
}

/**
 * Interface minimale pour les critères de recherche
 */
export interface BaseSearchCriteria {
  page?: number;
  size?: number;
  search_string?: string;
  isDeleted?: boolean;
}

/**
 * Interface minimale pour les réponses paginées
 */
export interface BasePagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

/**
 * Classe abstraite pour les composants CRUD d'entités.
 *
 * Factorise la logique commune : pagination, recherche, dialogues CRUD,
 * formatage de dates, navigation, gestion du localStorage pour la taille de page.
 *
 * Chaque composant concret doit :
 * 1. Étendre cette classe avec les bons types génériques
 * 2. Implémenter les méthodes abstraites (appels service, config)
 * 3. Garder ses propriétés/méthodes spécifiques (status labels, form validation, etc.)
 */
@Directive()
export abstract class EntityCrudBase<
  T extends BaseEntity,
  C extends BaseSearchCriteria,
  R extends BasePagedResponse<T>
> implements OnInit {

  // ── Signaux communs ──────────────────────────
  items = signal<T[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);

  // ── Dialogues ────────────────────────────────
  showEditDialog = signal<boolean>(false);
  showCreateDialog = signal<boolean>(false);
  showRestoreConfirmation = signal<boolean>(false);
  itemToRestore = signal<T | null>(null);

  // ── Recherche ────────────────────────────────
  quickSearch = '';
  showAdvancedSearch = false;
  showDeletedItems = true;

  // ── Suppression ──────────────────────────────
  showDeleteConfirmation = false;
  itemToDelete: T | null = null;

  // ── Panneau de détail ────────────────────────
  selectedItem = signal<T | null>(null);
  showDetailPanel = signal<boolean>(false);
  detailFields: DetailField[] = [];

  // ── Dépendances FK ───────────────────────────
  dependencyInfo = signal<DependencyInfo | null>(null);
  showDependencyPopup = signal<boolean>(false);
  dependencyMode = signal<'delete' | 'restore'>('delete');
  private depService = inject(DashboardStatsService);
  protected notificationService = inject(NotificationService);

  // ── Computed ─────────────────────────────────
  hasPreviousPage = computed(() => this.currentPage() > 0);
  hasNextPage = computed(() => this.currentPage() < this.totalPages() - 1);
  Math = Math;

  // ── Config abstraite ─────────────────────────
  /** Clé localStorage pour persister la taille de page */
  protected abstract readonly pageSizeStorageKey: string;
  /** Nom de l'entité (pour les logs d'erreur) */
  protected abstract readonly entityName: string;
  /** Type d'entité pour l'API dependency-check (ex: 'departments', 'questions') */
  protected abstract readonly entityTypeApi: string;
  /** Router injecté par le composant enfant */
  protected abstract readonly router: Router;

  // ── Méthodes abstraites (appels service) ─────
  /** Critères de recherche avancée — exposés en tant que propriété dans le composant enfant */
  abstract advancedCriteria: C;
  /** Données du formulaire de création */
  abstract createFormData: Partial<T>;
  /** Données du formulaire d'édition */
  abstract editFormData: T;

  /** Appel service : récupérer les items paginés */
  protected abstract fetchAll(criteria: C): Observable<R>;
  /** Appel service : créer un item */
  protected abstract performCreate(item: Partial<T>): Observable<any>;
  /** Appel service : mettre à jour un item */
  protected abstract performUpdate(item: T): Observable<any>;
  /** Appel service : supprimer un item */
  protected abstract performDelete(id: number): Observable<any>;
  /** Appel service : restaurer un item */
  protected abstract performRestore(id: number): Observable<any>;

  /** Réinitialiser les critères de recherche avancée */
  protected abstract resetAdvancedCriteriaValues(): void;
  /** Réinitialiser le formulaire de création avec les valeurs par défaut */
  protected abstract resetCreateFormData(): void;

  // ── Lifecycle ────────────────────────────────
  ngOnInit(): void {
    const saved = localStorage.getItem(this.pageSizeStorageKey);
    if (saved) {
      const size = parseInt(saved, 10);
      if (!isNaN(size) && size > 0) {
        this.pageSize.set(size);
      }
    }
    this.loadItems();
  }

  // ── Chargement des données ───────────────────
  loadItems(): void {
    this.isLoading.set(true);

    const criteria = {
      ...this.advancedCriteria,
      page: this.currentPage(),
      size: this.pageSize(),
      isDeleted: this.showDeletedItems ? undefined : false,
    } as C;

    if (this.quickSearch && this.quickSearch.trim()) {
      (criteria as BaseSearchCriteria).search_string = this.quickSearch.trim();
    }

    this.fetchAll(criteria).subscribe({
      next: (response: R) => {
        this.items.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(`Erreur lors du chargement des ${this.entityName}:`, error);
        this.isLoading.set(false);
      }
    });
  }

  // ── Recherche ────────────────────────────────
  onQuickSearch(): void {
    this.currentPage.set(0);
    this.loadItems();
  }

  openAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  applyAdvancedSearch(): void {
    this.currentPage.set(0);
    this.loadItems();
    this.showAdvancedSearch = false;
  }

  resetAdvancedSearch(): void {
    this.resetAdvancedCriteriaValues();
    this.quickSearch = '';
    this.currentPage.set(0);
    this.loadItems();
  }

  toggleDeletedItems(): void {
    this.showDeletedItems = !this.showDeletedItems;
    this.currentPage.set(0);
    this.loadItems();
  }

  // ── Pagination ───────────────────────────────
  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.currentPage.update(p => p - 1);
      this.loadItems();
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update(p => p + 1);
      this.loadItems();
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadItems();
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newSize = parseInt(select.value, 10);
    this.pageSize.set(newSize);
    localStorage.setItem(this.pageSizeStorageKey, newSize.toString());
    this.currentPage.set(0);
    this.loadItems();
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // ── Formatage ────────────────────────────────
  formatDate(date: string | undefined): string {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  }

  trackById(index: number, item: T): number {
    return item.id || index;
  }

  // ── Navigation ───────────────────────────────
  goBackToEntities(): void {
    this.router.navigate(['/dashboard']);
  }

  // ── Création ─────────────────────────────────
  openCreateDialog(): void {
    this.resetCreateFormData();
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  validateCreate(): void {
    this.performCreate(this.createFormData).subscribe({
      next: () => {
        this.closeCreateDialog();
        this.loadItems();
      },
      error: (error) => {
        console.error(`Erreur lors de la création (${this.entityName}):`, error);
        this.notificationService.error('Erreur', `Erreur lors de la création`);
      }
    });
  }

  // ── Édition ──────────────────────────────────
  openEditDialog(item: T): void {
    this.editFormData = { ...item };
    this.showEditDialog.set(true);
  }

  closeEditDialog(): void {
    this.showEditDialog.set(false);
  }

  validateEdit(): void {
    this.performUpdate(this.editFormData).subscribe({
      next: () => {
        this.closeEditDialog();
        this.loadItems();
      },
      error: (error) => {
        console.error(`Erreur lors de la modification (${this.entityName}):`, error);
        this.notificationService.error('Erreur', `Erreur lors de la modification`);
      }
    });
  }

  // ── Suppression ──────────────────────────────
  confirmDelete(item: T): void {
    this.itemToDelete = item;
    if (!item.id) { this.showDeleteConfirmation = true; return; }

    this.depService.checkDependencies(this.entityTypeApi, item.id).subscribe({
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

  cancelDelete(): void {
    this.itemToDelete = null;
    this.showDeleteConfirmation = false;
  }

  executeDelete(): void {
    if (this.itemToDelete?.id) {
      this.performDelete(this.itemToDelete.id).subscribe({
        next: () => {
          this.cancelDelete();
          this.loadItems();
        },
        error: (error) => {
          console.error(`Erreur lors de la suppression (${this.entityName}):`, error);
          this.notificationService.error('Erreur', `Erreur lors de la suppression`);
        }
      });
    }
  }

  deleteFromEdit(): void {
    if (this.editFormData.id) {
      this.closeEditDialog();
      this.confirmDelete(this.editFormData);
    }
  }

  // ── Restauration ─────────────────────────────
  confirmRestore(item: T): void {
    this.itemToRestore.set(item);
    if (!item.id) { this.showRestoreConfirmation.set(true); return; }

    this.depService.checkParent(this.entityTypeApi, item.id).subscribe({
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

  cancelRestore(): void {
    this.itemToRestore.set(null);
    this.showRestoreConfirmation.set(false);
  }

  executeRestore(): void {
    const item = this.itemToRestore();
    if (item?.id) {
      this.performRestore(item.id).subscribe({
        next: () => {
          this.cancelRestore();
          this.loadItems();
        },
        error: (error) => {
          console.error(`Erreur lors de la restauration (${this.entityName}):`, error);
          this.notificationService.error('Erreur', `Erreur lors de la restauration`);
        }
      });
    }
  }

  // ── Popup dépendances ────────────────────────
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

  // ── Panneau de détail ────────────────────────
  selectItem(item: T): void {
    this.selectedItem.set(item);
    this.showDetailPanel.set(true);
  }

  closeDetailPanel(): void {
    this.showDetailPanel.set(false);
  }

  editFromDetail(item: T): void {
    this.closeDetailPanel();
    this.openEditDialog(item);
  }

  saveFromDetail(data: any): void {
    this.performUpdate(data).subscribe({
      next: () => {
        this.selectedItem.set(data);
        this.loadItems();
        this.notificationService.success('Succès', `${this.entityName} modifié avec succès`);
      },
      error: (error) => {
        console.error(`Erreur lors de la modification rapide (${this.entityName}):`, error);
        this.notificationService.error('Erreur', `Erreur lors de la modification`);
      }
    });
  }

  deleteFromDetail(item: T): void {
    this.closeDetailPanel();
    this.confirmDelete(item);
  }

  restoreFromDetail(item: T): void {
    this.closeDetailPanel();
    this.confirmRestore(item);
  }
}
