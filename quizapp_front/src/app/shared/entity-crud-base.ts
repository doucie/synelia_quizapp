import { signal, computed, inject, OnInit, OnDestroy, AfterViewInit, Directive, ElementRef, NgZone, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DetailField } from './entity-detail-panel/entity-detail-panel';
import { DependencyInfo } from './models/interfaces';
import { DashboardStatsService } from '../core/services/dashboard-stats.service';
import { NotificationService } from '../core/services/notification.service';

/**
 * Définition d'une colonne pour le Column Visibility Manager
 */
export interface ColumnDef {
  key: string;
  label: string;
  /** 1 = essentielle (jamais masquée auto), 2 = importante, 3 = secondaire */
  priority: number;
}

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
  idDe?: string;
  idA?: string;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
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
> implements OnInit, OnDestroy, AfterViewInit {

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
  canRestoreItems = true;

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

  // ── Column visibility ────────────────────────
  /** Toutes les colonnes disponibles — à override dans chaque composant enfant */
  allColumns: ColumnDef[] = [];
  /** Colonnes actuellement visibles (par clé) */
  visibleColumns = signal<Set<string>>(new Set());
  /** Nombre de colonnes masquées */
  hiddenColumnsCount = computed(() => {
    if (this.allColumns.length === 0) return 0;
    return this.allColumns.length - this.visibleColumns().size;
  });
  /** Afficher/masquer le dropdown de gestion des colonnes */
  showColumnManager = signal(false);
  /** Colonnes choisies explicitement par l'utilisateur. Null = mode automatique par priorité. */
  private manualVisibleColumns: Set<string> | null = null;

  /** Clé localStorage pour la visibilité des colonnes */
  protected get columnVisibilityStorageKey(): string {
    return `column-visibility-${this.entityName}`;
  }

  /** Vérifie si une colonne est visible */
  isColumnVisible(key: string): boolean {
    const cols = this.visibleColumns();
    return cols.size === 0 || cols.has(key);
  }

  /** Toggle la visibilité d'une colonne */
  toggleColumnVisibility(key: string): void {
    if (key === 'actions') return;

    const current = new Set(this.manualVisibleColumns ?? this.visibleColumns());
    if (current.has(key)) {
      // Ne pas masquer si c'est la dernière colonne visible
      if (current.size > 1) {
        current.delete(key);
      }
    } else {
      current.add(key);
    }
    current.add('actions');
    this.manualVisibleColumns = current;
    this.visibleColumns.set(current);
    this.saveColumnVisibility(current);
  }

  /** Afficher toutes les colonnes */
  showAllColumns(): void {
    const all = new Set(this.allColumns.map(c => c.key));
    all.add('actions');
    this.manualVisibleColumns = all;
    this.visibleColumns.set(all);
    this.saveColumnVisibility(all);
  }

  /** Réinitialiser aux colonnes par défaut (mode automatique par priorité) */
  resetColumnVisibility(): void {
    this.manualVisibleColumns = null;
    localStorage.removeItem(this.columnVisibilityStorageKey);
    this.applyAutoHide(1400);
  }

  /** Toggle le panneau de gestion des colonnes */
  toggleColumnManager(): void {
    this.showColumnManager.update(v => !v);
  }

  /** Initialiser la visibilité des colonnes depuis localStorage */
  protected initColumnVisibility(): void {
    if (this.allColumns.length === 0) return;
    const saved = localStorage.getItem(this.columnVisibilityStorageKey);
    if (saved) {
      try {
        const keys: string[] = JSON.parse(saved);
        const validKeys = keys.filter(k => this.allColumns.some(c => c.key === k));
        if (validKeys.length > 0) {
          const savedColumns = new Set(validKeys);
          savedColumns.add('actions');
          this.manualVisibleColumns = savedColumns;
          this.visibleColumns.set(savedColumns);
          return;
        }
      } catch {
        localStorage.removeItem(this.columnVisibilityStorageKey);
      }
    }
    this.applyAutoHide(1400);
  }

  /** Persister la visibilité dans localStorage */
  private saveColumnVisibility(cols: Set<string>): void {
    localStorage.setItem(this.columnVisibilityStorageKey, JSON.stringify([...cols]));
  }

  // ── Auto-hide responsive columns ─────────────
  private resizeObserver: ResizeObserver | null = null;
  private el = inject(ElementRef);
  private zone = inject(NgZone);
  private overflowCorrectionFrame: number | null = null;
  /** Colonnes masquées automatiquement (par le responsive) */
  private autoHiddenColumns = new Set<string>();
  /** Seuils de largeur pour masquer par priorité (px) */
  private readonly breakpoints = { priority3: 900, priority2: 600 };

  /** Initialise le ResizeObserver sur le conteneur de table */
  protected initAutoHideColumns(): void {
    if (this.allColumns.length === 0) return;
    const container = this.el.nativeElement.querySelector('.data-table-container');
    if (!container) return;

    this.resizeObserver?.disconnect();

    this.resizeObserver = new ResizeObserver(entries => {
      this.zone.run(() => {
        const width = entries[0].contentRect.width;
        this.applyAutoHide(width);
      });
    });
    this.resizeObserver.observe(container);
    this.applyAutoHide(container.clientWidth);
  }

  /** Masque/affiche les colonnes en fonction de la largeur */
  private applyAutoHide(width: number): void {
    if (this.manualVisibleColumns) {
      this.visibleColumns.set(new Set(this.manualVisibleColumns));
      return;
    }

    const visible = new Set(this.allColumns.map(col => col.key));
    visible.add('actions');
    const removable = [...this.allColumns]
      .filter(col => col.priority > 1 && col.key !== 'actions')
      .sort((left, right) => right.priority - left.priority || this.estimateColumnWidth(right) - this.estimateColumnWidth(left));
    const availableWidth = Math.max(360, Math.min(width, 1400));
    let estimatedWidth = this.estimateVisibleWidth(visible);

    for (const col of removable) {
      if (estimatedWidth <= availableWidth) break;
      visible.delete(col.key);
      estimatedWidth -= this.estimateColumnWidth(col);
    }

    this.autoHiddenColumns = new Set(this.allColumns.map(col => col.key).filter(key => !visible.has(key)));
    this.visibleColumns.set(visible);
    this.scheduleOverflowCorrection();
  }

  private estimateVisibleWidth(visible: Set<string>): number {
    return this.allColumns
      .filter(col => visible.has(col.key))
      .reduce((total, col) => total + this.estimateColumnWidth(col), 0);
  }

  private estimateColumnWidth(col: ColumnDef): number {
    const key = col.key.toLowerCase();
    if (key === 'actions') return 172;
    if (key === 'id' || key.endsWith('id')) return 84;
    if (key.includes('date') || key.includes('created') || key.includes('updated') || key.includes('expiration')) return 180;
    if (key.includes('status') || key.includes('role') || key.includes('type') || key.includes('score') || key.includes('active') || key.includes('correct')) return 140;
    if (key.includes('description') || key.includes('text') || key.includes('token')) return 340;
    if (key.includes('email')) return 240;
    if (col.priority === 1) return 210;
    if (col.priority === 2) return 180;
    return 160;
  }

  private scheduleOverflowCorrection(attempt = 0): void {
    if (this.manualVisibleColumns || attempt > this.allColumns.length) return;

    const container = this.el.nativeElement.querySelector('.data-table-container');
    if (!(container instanceof HTMLElement)) return;

    if (this.overflowCorrectionFrame !== null) {
      cancelAnimationFrame(this.overflowCorrectionFrame);
    }

    this.overflowCorrectionFrame = requestAnimationFrame(() => {
      this.overflowCorrectionFrame = null;
      if (this.manualVisibleColumns || container.scrollWidth <= container.clientWidth + 2) return;

      const visible = new Set(this.visibleColumns());
      const nextColumn = [...this.allColumns]
        .filter(col => visible.has(col.key) && col.priority > 1 && col.key !== 'actions')
        .sort((left, right) => right.priority - left.priority || this.estimateColumnWidth(right) - this.estimateColumnWidth(left))[0];

      if (!nextColumn) return;
      visible.delete(nextColumn.key);
      visible.add('actions');
      this.autoHiddenColumns = new Set(this.allColumns.map(col => col.key).filter(key => !visible.has(key)));
      this.visibleColumns.set(visible);
      this.scheduleOverflowCorrection(attempt + 1);
    });
  }

  @HostListener('mouseover', ['$event.target'])
  protected onDataTableCellHover(target: EventTarget | null): void {
    const element = target instanceof HTMLElement ? target : null;
    const cell = element?.closest('.data-table td');
    if (!(cell instanceof HTMLTableCellElement) || cell.classList.contains('actions-cell')) return;
    if (cell.getAttribute('title')) return;

    const text = (cell.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (text && text !== '-') {
      cell.setAttribute('title', text);
    }
  }

  /** Nettoyage du ResizeObserver */
  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (this.overflowCorrectionFrame !== null) {
      cancelAnimationFrame(this.overflowCorrectionFrame);
      this.overflowCorrectionFrame = null;
    }
  }

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
    this.initColumnVisibility();
    this.loadItems();
  }

  ngAfterViewInit(): void {
    // Retry init after data loads since the table container may not exist yet
    setTimeout(() => this.initAutoHideColumns(), 500);
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
        requestAnimationFrame(() => this.initAutoHideColumns());
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
        this.notificationService.error('Erreur', this.getErrorMessage(error, 'Erreur lors de la création'));
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
        this.notificationService.error('Erreur', this.getErrorMessage(error, 'Erreur lors de la modification'));
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
          this.notificationService.error('Erreur', this.getErrorMessage(error, 'Erreur lors de la suppression'));
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
    if (!this.canRestoreItems) {
      return;
    }

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
    if (!this.canRestoreItems) {
      return;
    }

    const item = this.itemToRestore();
    if (item?.id) {
      this.performRestore(item.id).subscribe({
        next: () => {
          this.cancelRestore();
          this.loadItems();
        },
        error: (error) => {
          console.error(`Erreur lors de la restauration (${this.entityName}):`, error);
          this.notificationService.error('Erreur', this.getErrorMessage(error, 'Erreur lors de la restauration'));
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
        this.notificationService.error('Erreur', this.getErrorMessage(error, 'Erreur lors de la modification'));
      }
    });
  }

  protected getErrorMessage(error: any, fallback: string): string {
    return error?.error?.message || error?.message || fallback;
  }

  deleteFromDetail(item: T): void {
    this.closeDetailPanel();
    this.confirmDelete(item);
  }

  restoreFromDetail(item: T): void {
    if (!this.canRestoreItems) {
      return;
    }

    this.closeDetailPanel();
    this.confirmRestore(item);
  }
}
