import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { FormService, Form, PagedFormResponse, FormSearchCriteria } from '../../../../../core/services/form.service';

@Component({
  selector: 'app-entities-forms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-forms.html',
  styleUrls: ['./entities-forms.scss']
})
export class EntitiesFormsComponent extends EntityCrudBase<Form, FormSearchCriteria, PagedFormResponse> {
  private service = inject(FormService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesFormsPageSize';
  protected override readonly entityName = 'formulaires';

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
}
