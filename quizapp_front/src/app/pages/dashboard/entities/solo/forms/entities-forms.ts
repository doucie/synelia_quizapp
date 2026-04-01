import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { FormService, Form, PagedFormResponse, FormSearchCriteria } from '../../../../../core/services/form.service';
import { FormVersionService, FormVersion } from '../../../../../core/services/form-version.service';
import { CampaignService, Campaign } from '../../../../../core/services/campaign.service';

@Component({
  selector: 'app-entities-forms',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-forms.html',
  styleUrls: ['./entities-forms.scss']
})
export class EntitiesFormsComponent extends EntityCrudBase<Form, FormSearchCriteria, PagedFormResponse> {
  private service = inject(FormService);
  private formVersionService = inject(FormVersionService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesFormsPageSize';
  protected override readonly entityName = 'formulaires';
  protected override readonly entityTypeApi = 'forms';

  // FK dropdowns
  private campaignService = inject(CampaignService);
  allCampaigns = signal<Campaign[]>([]);

  override ngOnInit(): void {
    super.ngOnInit();
    this.campaignService.getAllCampaignsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({
      next: (res) => this.allCampaigns.set(res.content)
    });
  }

  // Expansion
  expandedItems = signal<Set<number>>(new Set());
  childData = signal<{[id: number]: FormVersion[]}>({});
  loadingChildren = signal<{[id: number]: boolean}>({});

  advancedCriteria: FormSearchCriteria = {};
  editFormData: Form = {};
  createFormData: Partial<Form> = {};

  protected fetchAll(criteria: FormSearchCriteria): Observable<PagedFormResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<Form>): Observable<any> { return this.service.create(item as Form); }
  protected performUpdate(item: Form): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

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
    this.formVersionService.getAllByCriteria({ formId: id, size: 100 }).subscribe({
      next: (res) => { this.childData.set({ ...this.childData(), [id]: res.content }); this.loadingChildren.set({ ...this.loadingChildren(), [id]: false }); },
      error: () => { this.childData.set({ ...this.childData(), [id]: [] }); this.loadingChildren.set({ ...this.loadingChildren(), [id]: false }); }
    });
  }

  getChildren(id: number): FormVersion[] { return this.childData()[id] || []; }
  isLoadingChildren(id: number): boolean { return this.loadingChildren()[id] || false; }
  trackByChildId(index: number, item: any): number { return item.id; }
}
