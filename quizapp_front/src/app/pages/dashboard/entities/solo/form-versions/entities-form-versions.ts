import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { FormVersionService, FormVersion, PagedFormVersionResponse, FormVersionSearchCriteria } from '../../../../../core/services/form-version.service';
import { FormQuestionsService, FormQuestions } from '../../../../../core/services/form-questions.service';
import { FormService, Form } from '../../../../../core/services/form.service';

@Component({
  selector: 'app-entities-form-versions',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-form-versions.html',
  styleUrls: ['./entities-form-versions.scss']
})
export class EntitiesFormVersionsComponent extends EntityCrudBase<FormVersion, FormVersionSearchCriteria, PagedFormVersionResponse> {
  private service = inject(FormVersionService);
  private formQuestionsService = inject(FormQuestionsService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesFormVersionsPageSize';
  protected override readonly entityName = 'versions formulaire';
  protected override readonly entityTypeApi = 'form-versions';
  editingLockedVersion = signal(false);

  // FK dropdowns
  private formService = inject(FormService);
  allForms = signal<Form[]>([]);

  override ngOnInit(): void {
    super.ngOnInit();
    this.formService.getAllByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({
      next: (res) => this.allForms.set(res.content)
    });
  }

  // Expansion
  expandedItems = signal<Set<number>>(new Set());
  childData = signal<{[id: number]: FormQuestions[]}>({});
  loadingChildren = signal<{[id: number]: boolean}>({});

  advancedCriteria: FormVersionSearchCriteria = {};
  editFormData: FormVersion = {};
  createFormData: Partial<FormVersion> = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'version', label: 'Version', priority: 1 },
    { key: 'formId', label: 'Formulaire ID', priority: 2 },
    { key: 'published', label: 'Publié', priority: 2 },
    { key: 'locked', label: 'Verrouillé', priority: 2 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: FormVersionSearchCriteria): Observable<PagedFormVersionResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<FormVersion>): Observable<any> { return this.service.create(item as FormVersion); }
  protected performUpdate(item: FormVersion): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  override openEditDialog(item: FormVersion): void {
    this.editingLockedVersion.set(Boolean(item.isLocked));
    super.openEditDialog(this.editingLockedVersion()
      ? {
          ...item,
          versionNumber: (item.versionNumber ?? 0) + 1,
          isPublished: false,
          isLocked: false,
        }
      : item);
  }

  override closeEditDialog(): void {
    this.editingLockedVersion.set(false);
    super.closeEditDialog();
  }

  forkVersion(item: FormVersion): void {
    if (!item.id) return;
    this.service.custom('fork', item.id).subscribe({
      next: () => this.loadItems(),
      error: (err: any) => console.error('Erreur fork:', err)
    });
  }

  toggleExpansion(id: number) {
    if (this.expandedItems().has(id)) {
      this.expandedItems.set(new Set());
    } else {
      this.expandedItems.set(new Set([id]));
      this.loadChildren(id);
    }
  }

  isExpanded(id: number): boolean { return this.expandedItems().has(id); }

  loadChildren(id: number) {
    if (this.loadingChildren()[id]) return;
    this.loadingChildren.set({ ...this.loadingChildren(), [id]: true });
    this.formQuestionsService.getAllByCriteria({ formVersionId: id, size: 100 }).subscribe({
      next: (res) => { this.childData.set({ ...this.childData(), [id]: res.content }); this.loadingChildren.set({ ...this.loadingChildren(), [id]: false }); },
      error: () => { this.childData.set({ ...this.childData(), [id]: [] }); this.loadingChildren.set({ ...this.loadingChildren(), [id]: false }); }
    });
  }

  getChildren(id: number): FormQuestions[] { return this.childData()[id] || []; }
  isLoadingChildren(id: number): boolean { return this.loadingChildren()[id] || false; }
  trackByChildId(index: number, item: any): number { return item.id; }
}
