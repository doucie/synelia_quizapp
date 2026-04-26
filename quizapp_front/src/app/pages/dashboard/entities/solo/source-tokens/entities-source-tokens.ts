import { Component, OnInit, OnDestroy, ElementRef, HostListener, signal, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntityDetailPanelComponent, DetailField } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { EntityColumnVisibilityState, ColumnDef } from '../../../../../shared/entity-column-visibility';
import { DashboardStatsService } from '../../../../../core/services/dashboard-stats.service';
import { DependencyInfo } from '../../../../../shared/models/interfaces';
import { Router, ActivatedRoute } from '@angular/router';

import { SourceTokenService, SourceToken, SourceTokenSearchCriteria, PagedSourceTokenResponse } from '../../../../../services/source-token.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CampaignService, Campaign } from '../../../../../core/services/campaign.service';

@Component({
  selector: 'app-entities-source-tokens',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-source-tokens.html',
  styleUrl: './entities-source-tokens.scss'
})
export class EntitiesSourceTokensComponent implements OnInit, OnDestroy {
  // Exposer Math pour utilisation dans le template
  Math = Math;
  
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
    this.editSourceToken(item);
  }

  saveFromDetail(data: any): void {
    this.sourceTokenService.updateSourceToken(data).subscribe({
      next: () => { this.selectedItem.set(data); this.loadSourceTokens(); this.notificationService.success('Succès', 'Token source modifié'); },
      error: () => { this.notificationService.error('Erreur', 'Erreur lors de la modification'); }
    });
  }

  deleteFromDetail(item: any): void {
    this.closeDetailPanel();
    this.deleteSourceToken(item);
  }

  restoreFromDetail(item: any): void {
    this.closeDetailPanel();
    this.restoreSourceToken(item);
  }
  private loadingTimeout: any;
  
  // Signaux pour la reactivite
  sourceTokens = signal<SourceToken[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  
  // Criteres de recherche
  searchCriteria: SourceTokenSearchCriteria = {
    idDe: '',
    idA: '',
    sourceTokenName: '',
    search_string: ''
  };

  // Recherche rapide
  quickSearch = '';
  
  // Etat de la recherche avancee
  showAdvancedSearch = false;
  
  // Controle d'affichage des tokens supprimes
  showDeletedSourceTokens = true;
  
  // Options de pagination
  pageSizeOptions = [5, 10, 20, 50, 100];
  private readonly PAGE_SIZE_STORAGE_KEY = 'entities-source-tokens-page-size';

  readonly allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'name', label: 'Nom', priority: 1 },
    { key: 'token', label: 'Token', priority: 3 },
    { key: 'campaignId', label: 'ID Campagne', priority: 2 },
    { key: 'expiration', label: 'Expiration', priority: 2 },
    { key: 'createdAt', label: 'Créé le', priority: 3 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];
  private readonly columnVisibility = new EntityColumnVisibilityState(this.allColumns, 'column-visibility-source-tokens');
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
  
  // Etat de la popup de confirmation
  showDeleteConfirmation = false;  // -- FK Dropdowns --
  private campaignFkService = inject(CampaignService);
  allCampaigns = signal<Campaign[]>([]);
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
  sourceTokenToDelete: SourceToken | null = null;
  
  // Etat de la popup de restauration
  showRestoreConfirmation = signal<boolean>(false);
  sourceTokenToRestore = signal<SourceToken | null>(null);
  
  // Etat de la popup d'edition
  showEditDialog = signal<boolean>(false);
  sourceTokenToEdit = signal<SourceToken | null>(null);
  editFormData = {
    id: 0,
    sourceTokenName: '',
    campaignId: null as number | null
  };

  // Etat de la popup de creation
  showCreateDialog = signal<boolean>(false);
  createFormData = {
    sourceTokenName: '',
    campaignId: null as number | null
  };
  
  // Criteres de recherche avancee
  advancedCriteria: SourceTokenSearchCriteria = {
    idDe: '',
    idA: '',
    sourceTokenName: '',
    campaignId: undefined,
    isDeleted: undefined,
    dateCreationDe: '',
    dateCreationA: '',
    dateModificationDe: '',
    dateModificationA: ''
  };

  constructor(
    private sourceTokenService: SourceTokenService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('Initialisation EntitiesSourceTokensComponent');
    this.columnVisibility.observeHost(this.hostElement.nativeElement);
    this.initializePageSizePreference();
    
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const pageParam = params['page'];
      if (pageParam && !isNaN(+pageParam) && +pageParam > 0) {
        this.currentPage.set(+pageParam - 1);
      } else {
        this.currentPage.set(0);
      }
    });
    
    this.loadSourceTokens();
    this.campaignFkService.getAllCampaignsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allCampaigns.set(res.content) });
  }

  ngOnDestroy() {
    this.columnVisibility.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  private initializePageSizePreference(): void {
    const stored = localStorage.getItem(this.PAGE_SIZE_STORAGE_KEY);
    if (stored) {
      const size = parseInt(stored, 10);
      if (this.pageSizeOptions.includes(size)) {
        this.pageSize.set(size);
      }
    }
  }

  private storePageSize(size: number): void {
    localStorage.setItem(this.PAGE_SIZE_STORAGE_KEY, size.toString());
  }

  loadSourceTokens() {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    
    this.loadingTimeout = setTimeout(() => {
      this.performLoadSourceTokens();
    }, 100);
  }

  private performLoadSourceTokens() {
    this.isLoading.set(true);

    const criteria: SourceTokenSearchCriteria = {
      ...this.searchCriteria,
      page: this.currentPage(),
      size: this.pageSize(),
      isDeleted: this.showDeletedSourceTokens ? undefined : false
    };

    this.sourceTokenService.getAllSourceTokensByCriteria(criteria).subscribe({
      next: (response: PagedSourceTokenResponse) => {
        this.sourceTokens.set(response.content);
        this.totalElements.set(response.totalElements);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des source tokens:', error);
        this.notificationService.error('Erreur', 'Erreur lors du chargement des source tokens');
        this.isLoading.set(false);
      }
    });
  }

  searchSourceTokens() {
    this.currentPage.set(0);
    this.loadSourceTokens();
  }

  clearSearch() {
    this.searchCriteria = {
      idDe: '',
      idA: '',
      sourceTokenName: '',
      search_string: ''
    };
    this.quickSearch = '';
    this.showAdvancedSearch = false;
    this.resetAdvancedSearch();
    this.searchSourceTokens();
  }

  createSourceToken() {
    this.createFormData = {
      sourceTokenName: '',
      campaignId: null
    };
    this.showCreateDialog.set(true);
  }

  closeCreateDialog() {
    this.showCreateDialog.set(false);
    this.createFormData = {
      sourceTokenName: '',
      campaignId: null
    };
  }

  async validateSourceTokenCreation() {
    const formData = this.createFormData;

    if (!formData.sourceTokenName.trim()) {
      this.notificationService.warning('Attention', 'Le nom du token est requis');
      return;
    }

    try {
      const newToken = await this.sourceTokenService.createSourceTokens([{
        sourceTokenName: formData.sourceTokenName.trim(),
        campaignId: formData.campaignId || undefined
      }]).toPromise();

      if (newToken && (newToken as any).hasError) {
        const errorMessage = (newToken as any).status?.message || 'Erreur lors de la creation';
        this.notificationService.error('Erreur', errorMessage);
        return;
      }

      this.notificationService.success('Succes', `Token ${formData.sourceTokenName} cree avec succes`);
      this.closeCreateDialog();
      this.loadSourceTokens();
    } catch (error: any) {
      console.error('Erreur lors de la creation:', error);
      this.notificationService.error('Erreur', `Erreur lors de la creation: ${error?.error?.message || error?.message || 'Erreur inconnue'}`);
    }
  }

  editSourceToken(token: SourceToken) {
    this.sourceTokenToEdit.set(token);
    this.editFormData = {
      id: token.id || 0,
      sourceTokenName: token.sourceTokenName || '',
      campaignId: token.campaignId || token.campaigns_id || null
    };
    this.showEditDialog.set(true);
  }

  closeEditDialog() {
    this.showEditDialog.set(false);
    this.sourceTokenToEdit.set(null);
    this.editFormData = {
      id: 0,
      sourceTokenName: '',
      campaignId: null
    };
  }

  async validateSourceTokenEdit() {
    const formData = this.editFormData;
    const currentToken = this.sourceTokenToEdit();
    
    if (!currentToken) {
      this.notificationService.error('Erreur', 'Aucun token selectionne pour modification');
      return;
    }

    if (!formData.sourceTokenName.trim()) {
      this.notificationService.warning('Attention', 'Le nom du token est requis');
      return;
    }

    try {
      const updatedToken = await this.sourceTokenService.updateSourceToken({
        id: currentToken.id!,
        sourceTokenName: formData.sourceTokenName.trim(),
        campaignId: formData.campaignId || undefined
      }).toPromise();

      if (updatedToken && (updatedToken as any).hasError) {
        const errorMessage = (updatedToken as any).status?.message || 'Erreur lors de la mise a jour';
        this.notificationService.error('Erreur', errorMessage);
        return;
      }

      this.notificationService.success('Succes', `Token ${formData.sourceTokenName} modifie avec succes`);
      this.closeEditDialog();
      this.loadSourceTokens();
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error);
      this.notificationService.error('Erreur', `Erreur lors de la modification: ${error?.error?.message || error?.message || 'Erreur inconnue'}`);
    }
  }

  deleteSourceTokenFromEdit() {
    const token = this.sourceTokenToEdit();
    if (token) {
      this.closeEditDialog();
      this.deleteSourceToken(token);
    }
  }

  deleteSourceToken(token: SourceToken) {
    this.sourceTokenToDelete = token;
    this.depService.checkDependencies('source-tokens', token.id!).subscribe({
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

  confirmDeleteSourceToken() {
    if (!this.sourceTokenToDelete) return;
    
    this.sourceTokenService.deleteSourceToken(this.sourceTokenToDelete.id!).subscribe({
      next: () => {
        this.notificationService.success('Succes', `Token ${this.sourceTokenToDelete?.sourceTokenName} supprime avec succes`);
        
        if (this.sourceTokenToDelete) {
          this.sourceTokenToDelete.isDeleted = true;
        }
        
        this.showDeletedSourceTokens = true;
        this.cancelDeleteSourceToken();
        this.loadSourceTokens();
      },
      error: (error: any) => {
        console.error('Erreur lors de la suppression:', error);
        this.notificationService.error('Erreur', 'Erreur lors de la suppression du token');
        this.cancelDeleteSourceToken();
      }
    });
  }

  cancelDeleteSourceToken() {
    this.showDeleteConfirmation = false;
    this.sourceTokenToDelete = null;
  }

  restoreSourceToken(token: SourceToken) {
    this.sourceTokenToRestore.set(token);
    this.depService.checkParent('source-tokens', token.id!).subscribe({
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

  confirmRestoreSourceToken() {
    const tokenToRestore = this.sourceTokenToRestore();
    if (!tokenToRestore) return;
    
    this.sourceTokenService.restoreSourceToken(tokenToRestore.id!).subscribe({
      next: () => {
        this.notificationService.success('Succes', `Token ${tokenToRestore?.sourceTokenName} restaure avec succes`);
        tokenToRestore.isDeleted = false;
        this.cancelRestoreSourceToken();
        this.loadSourceTokens();
      },
      error: (error: any) => {
        this.notificationService.error('Erreur', 'Erreur lors de la restauration du token');
        this.cancelRestoreSourceToken();
      }
    });
  }

  cancelRestoreSourceToken() {
    this.showRestoreConfirmation.set(false);
    this.sourceTokenToRestore.set(null);
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.router.navigate(['/dashboard/entities/source-tokens', page + 1]);
    this.loadSourceTokens();
  }

  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newSize = parseInt(target.value, 10);
    this.changePageSize(newSize);
  }

  changePageSize(newSize: number) {
    if (isNaN(newSize) || !this.pageSizeOptions.includes(newSize)) {
      return;
    }
    
    this.pageSize.set(newSize);
    this.storePageSize(newSize);
    this.currentPage.set(0);
    this.loadSourceTokens();
  }

  toggleDeletedSourceTokens() {
    this.showDeletedSourceTokens = !this.showDeletedSourceTokens;
    this.currentPage.set(0);
    this.loadSourceTokens();
  }

  goBackToEntities() {
    this.router.navigate(['/dashboard/entities']);
  }

  trackBySourceTokenId(index: number, token: SourceToken): number {
    return token.id || index;
  }

  onQuickSearch() {
    this.searchCriteria.idDe = '';
    this.searchCriteria.idA = '';
    this.searchCriteria.sourceTokenName = '';
    this.searchCriteria.isDeleted = undefined;
    
    this.searchCriteria.search_string = this.quickSearch.trim();
    this.showAdvancedSearch = false;
    
    setTimeout(() => {
      this.searchSourceTokens();
    }, 300);
  }

  openAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  applyAdvancedSearch() {
    this.searchCriteria = { ...this.advancedCriteria };
    this.quickSearch = '';
    this.searchCriteria.search_string = '';
    this.searchSourceTokens();
  }

  resetAdvancedSearch() {
    this.advancedCriteria = {
      idDe: '',
      idA: '',
      sourceTokenName: '',
      campaignId: undefined,
      isDeleted: undefined,
      dateCreationDe: '',
      dateCreationA: '',
      dateModificationDe: '',
      dateModificationA: ''
    };
    this.applyAdvancedSearch();
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalElements() / this.pageSize());
    const pages: number[] = [];
    const currentPage = this.currentPage();
    
    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages, start + 5);
    
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  hasPreviousPage(): boolean {
    return this.currentPage() > 0;
  }

  hasNextPage(): boolean {
    return this.currentPage() < Math.ceil(this.totalElements() / this.pageSize()) - 1;
  }

  previousPage() {
    if (this.hasPreviousPage()) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  nextPage() {
    if (this.hasNextPage()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
}
