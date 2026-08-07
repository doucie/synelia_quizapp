import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { DetailField } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { FilterCheckboxComponent } from '../../../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { DecisionService, Decision, DecisionMutationPayload, PagedDecisionResponse, DecisionCriteria } from '../../../../../core/services/decision.service';
import { ApplicationService, Application } from '../../../../../core/services/application.service';
import { UserService, User } from '../../../../../core/services/user.service';

@Component({
  selector: 'app-entities-decisions',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-decisions.html',
  styleUrls: ['./entities-decisions.scss']
})
export class EntitiesDecisionsComponent extends EntityCrudBase<Decision, DecisionCriteria, PagedDecisionResponse, DecisionMutationPayload> {
  private service = inject(DecisionService);
  private applicationService = inject(ApplicationService);
  private userService = inject(UserService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesDecisionsPageSize';
  protected override readonly entityName = 'décisions';
  protected override readonly entityTypeApi = 'decisions';

  allApplications = signal<Application[]>([]);
  allUsers = signal<User[]>([]);

  advancedCriteria: DecisionCriteria = {};
  editFormData: Decision = { decisionType: '', decisionMode: 'STANDARD', applicationId: 0, userId: 0 };
  createFormData: DecisionMutationPayload = { decisionMode: 'STANDARD' };

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'applicationId', label: 'Candidature', priority: 1 },
    { key: 'userId', label: 'Utilisateur', priority: 2 },
    { key: 'decisionType', label: 'Type Décision', priority: 1 },
    { key: 'decisionMode', label: 'Mode', priority: 2 },
    { key: 'applicationProgressId', label: 'Occurrence', priority: 2 },
    { key: 'cancelsDecisionId', label: 'Annule', priority: 3 },
    { key: 'justification', label: 'Justification', priority: 3 },
    { key: 'cancelled', label: 'Annulée', priority: 2 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  override detailFields: DetailField[] = [
    { key: 'id', label: 'ID', type: 'id', editable: false },
    { key: 'applicationId', label: 'Candidature', type: 'id', displayValue: (entity) => this.getApplicationDisplay(entity?.applicationId) },
    { key: 'userId', label: 'Utilisateur', type: 'id', displayValue: (entity) => this.getUserDisplay(entity?.userId) },
    { key: 'decisionType', label: 'Type décision', type: 'text' },
    { key: 'decisionMode', label: 'Mode', type: 'text', editable: false, displayValue: (entity) => this.getDecisionModeDisplay(entity?.decisionMode) },
    { key: 'applicationProgressId', label: 'Occurrence pipeline', type: 'id', editable: false, displayValue: (entity) => this.getApplicationProgressDisplay(entity?.applicationProgressId) },
    { key: 'cancelsDecisionId', label: 'Décision annulée ciblée', type: 'id', editable: false, displayValue: (entity) => this.getCancelsDecisionDisplay(entity?.cancelsDecisionId) },
    { key: 'justification', label: 'Justification', type: 'text' },
    { key: 'createdAt', label: 'Créé le', type: 'date', editable: false },
    { key: 'updatedAt', label: 'Modifié le', type: 'date', editable: false },
  ];

  protected fetchAll(criteria: DecisionCriteria): Observable<PagedDecisionResponse> { return this.service.getAllDecisionsByCriteria(criteria); }
  protected performCreate(item: DecisionMutationPayload): Observable<any> { return this.service.createDecision({ decisionMode: 'STANDARD', ...item }); }
  protected performUpdate(item: Decision): Observable<any> { return this.service.updateDecision(this.buildUpdatePayload(item)); }
  protected performDelete(id: number): Observable<any> { return this.service.deleteDecision(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restoreDecision(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = { decisionMode: 'STANDARD' }; }

  override ngOnInit() {
    super.ngOnInit();
    this.applicationService.getAllApplicationsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allApplications.set(res.content) });
    this.userService.getByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allUsers.set(res.content) });
  }

  getApplicationDisplay(applicationId?: number): string {
    if (!applicationId) {
      return '-';
    }

    const application = this.allApplications().find((item) => item.id === applicationId);
    if (!application) {
      return `#${applicationId}`;
    }

    const fullName = [application.candidateFirstName, application.candidateLastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (fullName) {
      return `#${applicationId} - ${fullName}`;
    }

    if (application.candidateEmail) {
      return `#${applicationId} - ${application.candidateEmail}`;
    }

    return `#${applicationId}`;
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

  getDecisionModeDisplay(decisionMode?: string): string {
    switch ((decisionMode || '').trim().toUpperCase()) {
      case 'STANDARD':
        return 'Décision standard';
      case 'CANCEL':
        return 'Annulation historisée';
      case 'OVERRIDE':
        return 'Override';
      case 'ROLLBACK':
        return 'Rollback';
      default:
        return decisionMode || '-';
    }
  }

  getApplicationProgressDisplay(applicationProgressId?: number): string {
    return applicationProgressId ? `Occurrence #${applicationProgressId}` : '-';
  }

  getCancelsDecisionDisplay(cancelsDecisionId?: number): string {
    return cancelsDecisionId ? `Décision #${cancelsDecisionId}` : '-';
  }

  getJustificationPreview(justification?: string): string {
    if (!justification?.trim()) {
      return '-';
    }

    const normalized = justification.trim();
    return normalized.length > 72 ? `${normalized.slice(0, 69)}...` : normalized;
  }

  isCancellation(decisionMode?: string): boolean {
    return (decisionMode || '').trim().toUpperCase() === 'CANCEL';
  }

  private buildUpdatePayload(item: Decision): DecisionMutationPayload {
    if (this.isCancellation(item.decisionMode)) {
      return {
        id: item.id,
        justification: item.justification ?? ''
      };
    }

    return item;
  }
}
