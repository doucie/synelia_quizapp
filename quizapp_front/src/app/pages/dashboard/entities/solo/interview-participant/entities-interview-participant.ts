import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { InterviewParticipantService, InterviewParticipant, PagedInterviewParticipantResponse, InterviewParticipantSearchCriteria } from '../../../../../core/services/interview-participant.service';
import { InterviewService, Interview } from '../../../../../core/services/interview.service';
import { UserService, User } from '../../../../../core/services/user.service';

@Component({
  selector: 'app-entities-interview-participant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-interview-participant.html',
  styleUrls: ['./entities-interview-participant.scss']
})
export class EntitiesInterviewParticipantComponent extends EntityCrudBase<InterviewParticipant, InterviewParticipantSearchCriteria, PagedInterviewParticipantResponse> {
  private service = inject(InterviewParticipantService);
  private interviewService = inject(InterviewService);
  private userService = inject(UserService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesInterviewParticipantPageSize';
  protected override readonly entityName = 'participants entretien';
  protected override readonly entityTypeApi = 'interview-participant';

  allInterviews = signal<Interview[]>([]);
  allUsers = signal<User[]>([]);

  advancedCriteria: InterviewParticipantSearchCriteria = {};
  editFormData: InterviewParticipant = { interviewId: 0, userId: 0 };
  createFormData: Partial<InterviewParticipant> = {};

  protected fetchAll(criteria: InterviewParticipantSearchCriteria): Observable<PagedInterviewParticipantResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<InterviewParticipant>): Observable<any> { return this.service.entityCreate(item as InterviewParticipant); }
  protected performUpdate(item: InterviewParticipant): Observable<any> { return this.service.entityUpdate(item); }
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
