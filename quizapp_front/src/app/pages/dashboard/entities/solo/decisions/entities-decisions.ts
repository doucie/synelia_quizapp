import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { DecisionService, Decision, PagedDecisionResponse, DecisionCriteria } from '../../../../../core/services/decision.service';

@Component({
  selector: 'app-entities-decisions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-decisions.html',
  styleUrls: ['./entities-decisions.scss']
})
export class EntitiesDecisionsComponent extends EntityCrudBase<Decision, DecisionCriteria, PagedDecisionResponse> {
  private service = inject(DecisionService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesDecisionsPageSize';
  protected override readonly entityName = 'décisions';

  advancedCriteria: DecisionCriteria = {};
  editFormData: Decision = { decisionType: '', isCancel: false, applicationId: 0, userId: 0 };
  createFormData: Partial<Decision> = {};

  protected fetchAll(criteria: DecisionCriteria): Observable<PagedDecisionResponse> { return this.service.getAllDecisionsByCriteria(criteria); }
  protected performCreate(item: Partial<Decision>): Observable<any> { return this.service.createDecision(item as Decision); }
  protected performUpdate(item: Decision): Observable<any> { return this.service.updateDecision(item as Decision); }
  protected performDelete(id: number): Observable<any> { return this.service.deleteDecision(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restoreDecision(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
