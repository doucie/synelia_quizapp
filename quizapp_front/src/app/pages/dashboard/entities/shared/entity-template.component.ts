import { Component, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  SearchField, 
  SearchCriteria, 
  TableColumn, 
  TableAction, 
  TableConfig, 
  PaginationInfo, 
  StatsInfo, 
  ModalConfig 
} from './models/search.model';

@Component({
    selector: 'app-entity-template',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './entity-template.component.html',
    styleUrls: ['./entity-template.component.scss']
})
export class EntityTemplateComponent {

    @Input() pageClass: string = 'entity-page'; // Valeur par défaut

    /* =================
     Header
    ================= */
    @Input() headerTitle: string = 'Titre de la page';
    @Input() headerDescription: string = 'Description de la page';
    @Input() breadcrumbCurrent: string = 'Page actuelle';
    @Input() showBreadcrumb: boolean = true; // Afficher ou non le fil d'Ariane

    // Méthode pour gérer la navigation retour
    goBack() {
        // TODO: Implement navigation
        console.log('Go back clicked');
    }

    /* =================
     Toolbar
    ================= */
    @Input() showToolbar: boolean = true;
    @Input() showQuickSearch: boolean = true;
    @Input() quickSearchPlaceholder: string = 'Rechercher...';
    @Input() showDeletedToggle: boolean = false;
    @Input() deletedToggleLabel: string = 'Afficher les éléments supprimés';
    @Input() showAdvancedSearchButton: boolean = true;
    @Input() advancedSearchButtonLabel: string = 'Filtres avancés';
    @Input() showCreateButton: boolean = true;
    @Input() createButtonLabel: string = 'Nouvel élément';

    // Toolbar state inputs (liés depuis le parent)
    @Input() quickSearch: string = '';
    @Input() showDeletedUsers: boolean = false;

    // Toolbar output events
    @Output() quickSearchChange = new EventEmitter<string>();
    @Output() deletedToggleChange = new EventEmitter<boolean>();
    @Output() openAdvancedSearch = new EventEmitter<void>();
    @Output() createItem = new EventEmitter<void>();

    // Méthodes pour émettre les événements
    onQuickSearch(value: string) {
        this.quickSearchChange.emit(value);
    }

    onToggleDeleted() {
        this.showDeletedUsers = !this.showDeletedUsers;
        this.deletedToggleChange.emit(this.showDeletedUsers);
    }

    onOpenAdvancedSearch() {
        this.openAdvancedSearch.emit();
    }

    onCreateItem() {
        this.createItem.emit();
    }

    /* =================
     Advanced Search Panel
    ================= */
    @Input() showAdvancedSearch: boolean = false;
    @Input() advancedSearchFields: SearchField[] = [];
    @Input() advancedSearchCriteria: SearchCriteria = {};

    // advanced search events
    @Output() advancedSearchToggle = new EventEmitter<void>();
    @Output() advancedSearchApply = new EventEmitter<SearchCriteria>();
    @Output() advancedSearchReset = new EventEmitter<void>();

    // Gestion du panneau de recherche avancée
    onAdvancedSearchToggle() {
        this.advancedSearchToggle.emit();
        this.showAdvancedSearch = !this.showAdvancedSearch;
        this.advancedSearchToggle.emit();  // Émettre l'événement vers le parent
    }

    onAdvancedSearchApply() {
        this.advancedSearchApply.emit(this.advancedSearchCriteria);
    }

    onAdvancedSearchReset() {
        this.advancedSearchCriteria = {};
        this.advancedSearchReset.emit();
    }




    /* =================
    Table Configuration
    ================== */
    @Input() showTable: boolean = true;
    @Input() tableConfig: TableConfig = { columns: [], actions: [], trackBy: 'id', emptyState: { title: '', message: '', icon: '' } };
    @Input() tableData: any[] = [];
    @Input() isLoading: boolean = false;

    /* =================
    Stats Configuration
    ================== */
    @Input() showStats: boolean = true;
    @Input() statsInfo: StatsInfo = { total: 0 };

    /* =================
    Pagination Configuration
    ================== */
    @Input() showPagination: boolean = true;
    @Input() paginationInfo: PaginationInfo = { currentPage: 0, totalElements: 0, pageSize: 10, totalPages: 0 };
    @Input() pageSizeOptions: number[] = [5, 10, 20, 50, 100];

    /* =================
    Table Events
    ================== */
    @Output() tableAction = new EventEmitter<{ action: string; item: any }>();
    @Output() pageChange = new EventEmitter<number>();
    @Output() pageSizeChange = new EventEmitter<number>();

    // ...existing code...

    // Méthodes pour le tableau
    onTableAction(action: string, item: any) {
        this.tableAction.emit({ action, item });
    }

    onPageChange(page: number) {
        this.pageChange.emit(page);
    }

    onPageSizeChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        const size = +target.value || 10;
        this.pageSizeChange.emit(size);
    }

    // Méthodes utilitaires pour le template
    trackByFn(index: number, item: any): any {
        return item[this.tableConfig.trackBy];
    }

    getPageNumbers(): number[] {
        const totalPages = this.paginationInfo.totalPages;
        const currentPage = this.paginationInfo.currentPage;
        const pages: number[] = [];
        
        if (totalPages <= 7) {
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
        }
        } else {
            pages.push(0);
            if (currentPage > 3) pages.push(-1); // ...
            const start = Math.max(1, currentPage - 2);
            const end = Math.min(totalPages - 2, currentPage + 2);
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 4) pages.push(-1);
            pages.push(totalPages - 1);
        }
        
        return pages;
    }

    hasPreviousPage(): boolean {
        return this.paginationInfo.currentPage > 0;
    }

    hasNextPage(): boolean {
        return this.paginationInfo.currentPage < this.paginationInfo.totalPages - 1;
    }

    /* =================
    Modal Configuration
    ================= */
    @Input() showModal: boolean = false;
    @Input() modalConfig: ModalConfig = { title: '', fields: [], submitLabel: '', cancelLabel: '' };
    @Input() modalFormData: any = {};
    @Output() modalClose = new EventEmitter<void>();
    @Output() modalSubmit = new EventEmitter<any>();
    @Output() modalDelete = new EventEmitter<void>();


    // Méthodes utilitaires

    min(a: number, b: number): number {
        return Math.min(a, b);
    }

    onModalClose() {
        this.modalClose.emit();
    }

    onModalSubmit() {
        this.modalSubmit.emit(this.modalFormData);
    }

    onModalDelete() {
        this.modalDelete.emit();
    }
}