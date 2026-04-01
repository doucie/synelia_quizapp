import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { CandidateAskService, CandidateAsk, PagedCandidateAskResponse, CandidateAskSearchCriteria } from '../../../../../core/services/candidate-ask.service';
import { ApplicationService, Application } from '../../../../../core/services/application.service';

@Component({
  selector: 'app-entities-candidate-ask',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
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
