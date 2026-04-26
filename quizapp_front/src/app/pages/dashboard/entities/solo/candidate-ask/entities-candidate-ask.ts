import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { CandidateAskService, CandidateAsk, PagedCandidateAskResponse, CandidateAskSearchCriteria } from '../../../../../core/services/candidate-ask.service';
import { ApplicationService, Application } from '../../../../../core/services/application.service';

@Component({
  selector: 'app-entities-candidate-ask',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-candidate-ask.html',
  styleUrls: ['./entities-candidate-ask.scss']
})
export class EntitiesCandidateAskComponent extends EntityCrudBase<CandidateAsk, CandidateAskSearchCriteria, PagedCandidateAskResponse> {
  private service = inject(CandidateAskService);
  private applicationService = inject(ApplicationService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesCandidateAskPageSize';
  protected override readonly entityName = 'demandes candidat';
  protected override readonly entityTypeApi = 'candidate-ask';

  allApplications = signal<Application[]>([]);

  advancedCriteria: CandidateAskSearchCriteria = {};
  editFormData: CandidateAsk = {};
  createFormData: Partial<CandidateAsk> = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'applicationId', label: 'Application ID', priority: 2 },
    { key: 'type', label: 'Type', priority: 2 },
    { key: 'firstName', label: 'Prénom', priority: 1 },
    { key: 'lastName', label: 'Nom', priority: 1 },
    { key: 'email', label: 'Email', priority: 2 },
    { key: 'phone', label: 'Téléphone', priority: 3 },
    { key: 'verified', label: 'Vérifié', priority: 2 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: CandidateAskSearchCriteria): Observable<PagedCandidateAskResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<CandidateAsk>): Observable<any> { return this.service.create(item as CandidateAsk); }
  protected performUpdate(item: CandidateAsk): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  override ngOnInit() {
    super.ngOnInit();
    this.applicationService.getAllApplicationsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allApplications.set(res.content) });
  }
}
