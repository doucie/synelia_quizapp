import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { FilterCheckboxComponent } from '../../../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { CandidateTokenService, CandidateToken, CandidateTokenMutationPayload, PagedCandidateTokenResponse, CandidateTokenSearchCriteria } from '../../../../../core/services/candidate-token.service';
import { ApplicationService, Application } from '../../../../../core/services/application.service';

@Component({
  selector: 'app-entities-candidate-token',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-candidate-token.html',
  styleUrls: ['./entities-candidate-token.scss']
})
export class EntitiesCandidateTokenComponent extends EntityCrudBase<CandidateToken, CandidateTokenSearchCriteria, PagedCandidateTokenResponse, CandidateTokenMutationPayload> {
  private service = inject(CandidateTokenService);
  private applicationService = inject(ApplicationService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesCandidateTokenPageSize';
  protected override readonly entityName = 'tokens candidat';
  protected override readonly entityTypeApi = 'candidate-token';

  allApplications = signal<Application[]>([]);

  advancedCriteria: CandidateTokenSearchCriteria = {};
  editFormData: CandidateToken = {};
  createFormData: CandidateTokenMutationPayload = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'applicationId', label: 'Application ID', priority: 1 },
    { key: 'token', label: 'Token', priority: 2 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: CandidateTokenSearchCriteria): Observable<PagedCandidateTokenResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: CandidateTokenMutationPayload): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: CandidateToken): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  override ngOnInit() {
    super.ngOnInit();
    this.applicationService.getAllApplicationsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allApplications.set(res.content) });
  }
}
