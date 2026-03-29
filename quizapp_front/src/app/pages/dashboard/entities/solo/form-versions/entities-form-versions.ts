import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { FormVersionService, FormVersion, PagedFormVersionResponse, FormVersionSearchCriteria } from '../../../../../core/services/form-version.service';

@Component({
  selector: 'app-entities-form-versions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-form-versions.html',
  styleUrls: ['./entities-form-versions.scss']
})
export class EntitiesFormVersionsComponent extends EntityCrudBase<FormVersion, FormVersionSearchCriteria, PagedFormVersionResponse> {
  private service = inject(FormVersionService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesFormVersionsPageSize';
  protected override readonly entityName = 'versions formulaire';

  advancedCriteria: FormVersionSearchCriteria = {};
  editFormData: FormVersion = {};
  createFormData: Partial<FormVersion> = {};

  protected fetchAll(criteria: FormVersionSearchCriteria): Observable<PagedFormVersionResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<FormVersion>): Observable<any> { return this.service.create(item as FormVersion); }
  protected performUpdate(item: FormVersion): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  forkVersion(item: FormVersion): void {
    if (!item.id) return;
    this.service.custom('fork', item.id).subscribe({
      next: () => this.loadItems(),
      error: (err: any) => console.error('Erreur fork:', err)
    });
  }
}
