import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { InterviewService, Interview, PagedInterviewResponse, InterviewSearchCriteria } from '../../../../../core/services/interview.service';

@Component({
  selector: 'app-entities-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-interviews.html',
  styleUrls: ['./entities-interviews.scss']
})
export class EntitiesInterviewsComponent extends EntityCrudBase<Interview, InterviewSearchCriteria, PagedInterviewResponse> {
  private interviewService = inject(InterviewService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesInterviewsPageSize';
  protected override readonly entityName = 'entretiens';

  advancedCriteria: InterviewSearchCriteria = {};
  editFormData: Interview = { interviewType: 'ONLINE' };
  createFormData: Partial<Interview> = { interviewType: 'ONLINE', interviewStatus: 'PENDING' };

  protected fetchAll(criteria: InterviewSearchCriteria): Observable<PagedInterviewResponse> {
    return this.interviewService.getAllInterviewsByCriteria(criteria);
  }

  protected performCreate(item: Partial<Interview>): Observable<any> {
    return this.interviewService.createInterview(item as Interview);
  }

  protected performUpdate(item: Interview): Observable<any> {
    return this.interviewService.updateInterview(item);
  }

  protected performDelete(id: number): Observable<any> {
    return this.interviewService.deleteInterview(id);
  }

  protected performRestore(id: number): Observable<any> {
    return this.interviewService.restoreInterview(id);
  }

  protected resetAdvancedCriteriaValues(): void {
    this.advancedCriteria = {};
  }

  protected resetCreateFormData(): void {
    this.createFormData = { interviewType: 'ONLINE', interviewStatus: 'PENDING' };
  }

  override validateCreate(): void {
    if (!this.createFormData.interviewType) {
      alert('Veuillez sélectionner un type d\'entretien');
      return;
    }
    super.validateCreate();
  }

  override formatDate(date: string | undefined): string {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return date;
    }
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return '-';
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'SCHEDULED': 'Planifié',
      'STARTED': 'En cours',
      'OVER': 'Terminé',
      'PASSED': 'Réussi',
      'FAILED': 'Échoué',
      'POSTPONED': 'Reporté',
      'ARCHIVED': 'Archivé'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    const classes: Record<string, string> = {
      'PENDING': 'status-pending',
      'SCHEDULED': 'status-scheduled',
      'STARTED': 'status-started',
      'OVER': 'status-over',
      'PASSED': 'status-passed',
      'FAILED': 'status-failed',
      'POSTPONED': 'status-postponed',
      'ARCHIVED': 'status-archived'
    };
    return classes[status] || '';
  }

  getTypeLabel(type: string | undefined): string {
    if (!type) return '-';
    const labels: Record<string, string> = {
      'ONLINE': 'En ligne',
      'IN_PERSON': 'En personne'
    };
    return labels[type] || type;
  }
}
