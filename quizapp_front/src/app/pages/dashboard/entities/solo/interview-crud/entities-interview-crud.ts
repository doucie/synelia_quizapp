import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { InterviewCrudService, InterviewCrud, PagedInterviewCrudResponse, InterviewCrudSearchCriteria } from '../../../../../core/services/interview-crud.service';
import { InterviewService, Interview } from '../../../../../core/services/interview.service';
import { UserService, User } from '../../../../../core/services/user.service';

@Component({
  selector: 'app-entities-interview-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-interview-crud.html',
  styleUrls: ['./entities-interview-crud.scss']
})
export class EntitiesInterviewCrudComponent extends EntityCrudBase<InterviewCrud, InterviewCrudSearchCriteria, PagedInterviewCrudResponse> {
  private service = inject(InterviewCrudService);
  private interviewService = inject(InterviewService);
  private userService = inject(UserService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesInterviewCrudPageSize';
  protected override readonly entityName = 'permissions entretien';
  protected override readonly entityTypeApi = 'interview-crud';

  allInterviews = signal<Interview[]>([]);
  allUsers = signal<User[]>([]);

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

  override ngOnInit() {
    super.ngOnInit();
    this.interviewService.getAllInterviewsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allInterviews.set(res.content) });
    this.userService.getByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allUsers.set(res.content) });
  }
}
