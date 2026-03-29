import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { CandidateTokenService, CandidateToken, PagedCandidateTokenResponse, CandidateTokenSearchCriteria } from '../../../../../core/services/candidate-token.service';

@Component({
  selector: 'app-entities-candidate-token',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-candidate-token.html',
  styleUrls: ['./entities-candidate-token.scss']
})
export class EntitiesCandidateTokenComponent extends EntityCrudBase<CandidateToken, CandidateTokenSearchCriteria, PagedCandidateTokenResponse> {
  private service = inject(CandidateTokenService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesCandidateTokenPageSize';
  protected override readonly entityName = 'tokens candidat';

  advancedCriteria: CandidateTokenSearchCriteria = {};
  editFormData: CandidateToken = {};
  createFormData: Partial<CandidateToken> = {};

  protected fetchAll(criteria: CandidateTokenSearchCriteria): Observable<PagedCandidateTokenResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<CandidateToken>): Observable<any> { return this.service.create(item as CandidateToken); }
  protected performUpdate(item: CandidateToken): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
