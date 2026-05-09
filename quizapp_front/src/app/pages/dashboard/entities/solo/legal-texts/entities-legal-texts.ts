import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityCrudBase, BaseSearchCriteria, BasePagedResponse, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { FilterCheckboxComponent } from '../../../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { LegalTextService, LegalText } from '../../../../../core/services/legal-text.service';

interface LegalTextCriteria extends BaseSearchCriteria {
  textKey?: string;
  isActive?: boolean;
}

interface PagedLegalTextResponse extends BasePagedResponse<LegalText> {}

@Component({
  selector: 'app-entities-legal-texts',
  standalone: true,
  imports: [FilterSelectComponent, FilterSelectOptionDirective, CommonModule, FormsModule, FilterCheckboxComponent, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-legal-texts.html',
  styleUrls: ['./entities-legal-texts.scss']
})
export class EntitiesLegalTextsComponent extends EntityCrudBase<LegalText, LegalTextCriteria, PagedLegalTextResponse> {
  private service = inject(LegalTextService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesLegalTextsPageSize';
  protected override readonly entityName = 'textes légaux';
  protected override readonly entityTypeApi = 'legalText';

  advancedCriteria: LegalTextCriteria = {};
  editFormData: LegalText = {} as LegalText;
  createFormData: Partial<LegalText> = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'key', label: 'Clé', priority: 1 },
    { key: 'title', label: 'Titre', priority: 1 },
    { key: 'description', label: 'Description', priority: 3 },
    { key: 'active', label: 'Actif', priority: 2 },
    { key: 'deleted', label: 'Supprimé', priority: 3 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: LegalTextCriteria): Observable<PagedLegalTextResponse> {
    const { page, size, ...data } = criteria;
    return this.service.getByCriteria(data, page, size).pipe(
      map(resp => ({
        content: resp.items,
        totalElements: resp.count,
        totalPages: Math.ceil(resp.count / (size || 10))
      }))
    );
  }
  protected performCreate(item: Partial<LegalText>): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: LegalText): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.update({ id, isDeleted: false }); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
