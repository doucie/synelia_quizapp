import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { InterviewCrudService, InterviewCrud, PagedInterviewCrudResponse, InterviewCrudSearchCriteria } from '../../../../../core/services/interview-crud.service';

@Component({
  selector: 'app-entities-interview-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-interview-crud.html',
  styleUrls: ['./entities-interview-crud.scss']
})
export class EntitiesInterviewCrudComponent extends EntityCrudBase<InterviewCrud, InterviewCrudSearchCriteria, PagedInterviewCrudResponse> {
  private service = inject(InterviewCrudService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesInterviewCrudPageSize';
  protected override readonly entityName = 'permissions entretien';

  advancedCriteria: InterviewCrudSearchCriteria = {};
  editFormData: InterviewCrud = { interviewId: 0, userId: 0, isAdmin: false };
  createFormData: Partial<InterviewCrud> = {};

  protected fetchAll(criteria: InterviewCrudSearchCriteria): Observable<PagedInterviewCrudResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<InterviewCrud>): Observable<any> { return this.service.entityCreate(item as InterviewCrud); }
  protected performUpdate(item: InterviewCrud): Observable<any> { return this.service.entityUpdate(item); }
  protected performDelete(id: number): Observable<any> { return this.service.entityDelete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.entityRestore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
