import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { CandidateAskService, CandidateAsk, PagedCandidateAskResponse, CandidateAskSearchCriteria } from '../../../../../core/services/candidate-ask.service';

@Component({
  selector: 'app-entities-candidate-ask',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-candidate-ask.html',
  styleUrls: ['./entities-candidate-ask.scss']
})
export class EntitiesCandidateAskComponent extends EntityCrudBase<CandidateAsk, CandidateAskSearchCriteria, PagedCandidateAskResponse> {
  private service = inject(CandidateAskService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesCandidateAskPageSize';
  protected override readonly entityName = 'demandes candidat';

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
}
