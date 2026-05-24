import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { InterviewParticipantService, InterviewParticipant, InterviewParticipantMutationPayload, PagedInterviewParticipantResponse, InterviewParticipantSearchCriteria } from '../../../../../core/services/interview-participant.service';
import { InterviewService, Interview } from '../../../../../core/services/interview.service';
import { UserService, User } from '../../../../../core/services/user.service';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { FilterCheckboxComponent } from '../../../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';

@Component({
  selector: 'app-entities-interview-participant',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective, ColumnVisibilityManagerComponent],
  templateUrl: './entities-interview-participant.html',
  styleUrls: ['./entities-interview-participant.scss']
})
export class EntitiesInterviewParticipantComponent extends EntityCrudBase<InterviewParticipant, InterviewParticipantSearchCriteria, PagedInterviewParticipantResponse, InterviewParticipantMutationPayload> {
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
  createFormData: InterviewParticipantMutationPayload = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'userId', label: 'Utilisateur', priority: 1 },
    { key: 'interviewId', label: 'Entretien', priority: 1 },
    { key: 'online', label: 'Online', priority: 2 },
    { key: 'finished', label: 'Finished', priority: 2 },
    { key: 'lastPing', label: 'Dernier Ping', priority: 3 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: InterviewParticipantSearchCriteria): Observable<PagedInterviewParticipantResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: InterviewParticipantMutationPayload): Observable<any> { return this.service.entityCreate(item); }
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

  getUserDisplay(userId?: number): string {
    if (!userId) {
      return '-';
    }

    const user = this.allUsers().find((item) => item.id === userId);
    if (!user) {
      return `#${userId}`;
    }

    const fullName = [user.prenom || user.firstName, user.nom || user.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (fullName && user.email) {
      return `${fullName} (${user.email})`;
    }

    return fullName || user.email || `#${userId}`;
  }

  getInterviewDisplay(interviewId?: number): string {
    if (!interviewId) {
      return '-';
    }

    const interview = this.allInterviews().find((item) => item.id === interviewId);
    if (!interview) {
      return `#${interviewId}`;
    }

    const candidateLabel = interview.candidateName || interview.candidateEmail;
    const typeLabel = interview.interviewType || 'INTERVIEW';

    if (candidateLabel) {
      return `#${interviewId} - ${candidateLabel} (${typeLabel})`;
    }

    return `#${interviewId} - ${typeLabel}`;
  }
}
