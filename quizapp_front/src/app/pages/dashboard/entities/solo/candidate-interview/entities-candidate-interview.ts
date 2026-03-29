import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { CandidateInterviewEntityService, CandidateInterviewEntity, PagedCandidateInterviewResponse, CandidateInterviewSearchCriteria } from '../../../../../core/services/candidate-interview-entity.service';

@Component({
  selector: 'app-entities-candidate-interview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-candidate-interview.html',
  styleUrls: ['./entities-candidate-interview.scss']
})
export class EntitiesCandidateInterviewComponent extends EntityCrudBase<CandidateInterviewEntity, CandidateInterviewSearchCriteria, PagedCandidateInterviewResponse> {
  private service = inject(CandidateInterviewEntityService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesCandidateInterviewPageSize';
  protected override readonly entityName = 'entretiens candidat';

  advancedCriteria: CandidateInterviewSearchCriteria = {};
  editFormData: CandidateInterviewEntity = {};
  createFormData: Partial<CandidateInterviewEntity> = {};

  protected fetchAll(criteria: CandidateInterviewSearchCriteria): Observable<PagedCandidateInterviewResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<CandidateInterviewEntity>): Observable<any> { return this.service.create(item as CandidateInterviewEntity); }
  protected performUpdate(item: CandidateInterviewEntity): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
