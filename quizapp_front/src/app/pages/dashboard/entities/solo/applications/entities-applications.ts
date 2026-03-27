import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { ApplicationService, Application, PagedApplicationResponse, ApplicationSearchCriteria } from '../../../../../core/services/application.service';

@Component({
  selector: 'app-entities-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-applications.html',
  styleUrl: './entities-applications.scss'
})
export class EntitiesApplicationsComponent extends EntityCrudBase<Application, ApplicationSearchCriteria, PagedApplicationResponse> {
  private applicationService = inject(ApplicationService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesApplicationsPageSize';
  protected override readonly entityName = 'candidatures';

  advancedCriteria: ApplicationSearchCriteria = {};
  editFormData: Application = {
    candidateFirstName: '',
    candidateLastName: '',
    candidateEmail: '',
    candidatePhone: '',
    candidateBirthDate: ''
  };
  createFormData: Partial<Application> = {
    candidateFirstName: '',
    candidateLastName: '',
    candidateEmail: '',
    candidatePhone: '',
    candidateBirthDate: ''
  };

  protected fetchAll(criteria: ApplicationSearchCriteria): Observable<PagedApplicationResponse> {
    return this.applicationService.getAllApplicationsByCriteria(criteria);
  }

  protected performCreate(item: Partial<Application>): Observable<any> {
    return this.applicationService.createApplication(item as Application);
  }

  protected performUpdate(item: Application): Observable<any> {
    return this.applicationService.updateApplication(item);
  }

  protected performDelete(id: number): Observable<any> {
    return this.applicationService.deleteApplication(id);
  }

  protected performRestore(id: number): Observable<any> {
    return this.applicationService.restoreApplication(id);
  }

  protected resetAdvancedCriteriaValues(): void {
    this.advancedCriteria = {};
  }

  protected resetCreateFormData(): void {
    this.createFormData = {
      candidateFirstName: '',
      candidateLastName: '',
      candidateEmail: '',
      candidatePhone: '',
      candidateBirthDate: ''
    };
  }

  override validateCreate(): void {
    if (!this.createFormData.candidateFirstName || !this.createFormData.candidateLastName ||
        !this.createFormData.candidateEmail || !this.createFormData.candidatePhone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    super.validateCreate();
  }

  truncateText(text: string | undefined, maxLength: number): string {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return '-';
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'PENDING_ARCHIVED': 'En attente (archivé)',
      'SUBMITTED': 'Soumis',
      'PRE_SCREEN_ACCEPTED': 'Pré-sélectionné',
      'PRE_SCREEN_REJECTED': 'Pré-rejeté',
      'PRE_SCREEN_REJECTED_ARCHIVED': 'Pré-rejeté (archivé)',
      'INTERVIEWING': 'En entretien',
      'FINAL_ACCEPTED': 'Accepté',
      'FINAL_ACCEPTED_ARCHIVED': 'Accepté (archivé)',
      'FINAL_REJECTED': 'Rejeté',
      'FINAL_REJECTED_ARCHIVED': 'Rejeté (archivé)'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    const classes: Record<string, string> = {
      'PENDING': 'status-pending',
      'PENDING_ARCHIVED': 'status-pending-archived',
      'SUBMITTED': 'status-submitted',
      'PRE_SCREEN_ACCEPTED': 'status-prescreen-accepted',
      'PRE_SCREEN_REJECTED': 'status-prescreen-rejected',
      'PRE_SCREEN_REJECTED_ARCHIVED': 'status-prescreen-rejected-archived',
      'INTERVIEWING': 'status-interviewing',
      'FINAL_ACCEPTED': 'status-final-accepted',
      'FINAL_ACCEPTED_ARCHIVED': 'status-final-accepted-archived',
      'FINAL_REJECTED': 'status-final-rejected',
      'FINAL_REJECTED_ARCHIVED': 'status-final-rejected-archived'
    };
    return classes[status] || '';
  }
}
