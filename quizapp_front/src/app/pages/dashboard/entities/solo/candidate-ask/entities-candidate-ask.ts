import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { FilterCheckboxComponent } from '../../../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { CandidateAskService, CandidateAsk, CandidateAskMutationPayload, CandidateAskReviewAction, PagedCandidateAskResponse, CandidateAskSearchCriteria } from '../../../../../core/services/candidate-ask.service';
import { ApplicationService, Application } from '../../../../../core/services/application.service';

@Component({
  selector: 'app-entities-candidate-ask',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-candidate-ask.html',
  styleUrls: ['./entities-candidate-ask.scss']
})
export class EntitiesCandidateAskComponent extends EntityCrudBase<CandidateAsk, CandidateAskSearchCriteria, PagedCandidateAskResponse, CandidateAskMutationPayload> {
  private service = inject(CandidateAskService);
  private applicationService = inject(ApplicationService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesCandidateAskPageSize';
  protected override readonly entityName = 'demandes candidat';
  protected override readonly entityTypeApi = 'candidate-ask';

  allApplications = signal<Application[]>([]);
  reviewTarget = signal<CandidateAsk | null>(null);
  showApproveConfirmation = signal(false);
  showRejectDialog = signal(false);
  rejectReason = signal('');
  reviewLoading = signal<Record<number, boolean>>({});

  advancedCriteria: CandidateAskSearchCriteria = {};
  editFormData: CandidateAsk = {};
  createFormData: CandidateAskMutationPayload = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'applicationId', label: 'Application ID', priority: 2 },
    { key: 'type', label: 'Type', priority: 2 },
    { key: 'status', label: 'Statut', priority: 2 },
    { key: 'firstName', label: 'Prénom', priority: 1 },
    { key: 'lastName', label: 'Nom', priority: 1 },
    { key: 'email', label: 'Email', priority: 2 },
    { key: 'phone', label: 'Téléphone', priority: 3 },
    { key: 'decisionReason', label: 'Motif', priority: 3 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: CandidateAskSearchCriteria): Observable<PagedCandidateAskResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: CandidateAskMutationPayload): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: CandidateAsk): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  override ngOnInit() {
    super.ngOnInit();
    this.applicationService.getAllApplicationsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allApplications.set(res.content) });
  }

  getResolvedAskStatus(item: CandidateAsk): string {
    return item.askStatus || (item.isVerified ? 'APPROVED' : 'PENDING');
  }

  getAskStatusLabel(item: CandidateAsk): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      APPROVED: 'Validée',
      REJECTED: 'Refusée'
    };
    return labels[this.getResolvedAskStatus(item)] || this.getResolvedAskStatus(item);
  }

  getAskStatusClass(item: CandidateAsk): string {
    const classes: Record<string, string> = {
      PENDING: 'candidate-ask-status candidate-ask-status--pending',
      APPROVED: 'candidate-ask-status candidate-ask-status--approved',
      REJECTED: 'candidate-ask-status candidate-ask-status--rejected'
    };
    return classes[this.getResolvedAskStatus(item)] || classes['PENDING'];
  }

  canReview(item: CandidateAsk): boolean {
    return !item.isDeleted && this.getResolvedAskStatus(item) === 'PENDING';
  }

  isReviewLoading(item: CandidateAsk): boolean {
    return !!item.id && !!this.reviewLoading()[item.id];
  }

  openApproveConfirmation(item: CandidateAsk, event: Event): void {
    event.stopPropagation();
    this.reviewTarget.set(item);
    this.showApproveConfirmation.set(true);
  }

  cancelApproveConfirmation(): void {
    this.showApproveConfirmation.set(false);
    this.reviewTarget.set(null);
  }

  executeApprove(): void {
    this.executeReview('APPROVE');
  }

  openRejectDialog(item: CandidateAsk, event: Event): void {
    event.stopPropagation();
    this.reviewTarget.set(item);
    this.rejectReason.set(item.decisionReason || '');
    this.showRejectDialog.set(true);
  }

  cancelRejectDialog(): void {
    this.showRejectDialog.set(false);
    this.reviewTarget.set(null);
    this.rejectReason.set('');
  }

  confirmReject(): void {
    if (!this.rejectReason().trim()) {
      this.notificationService.error('Erreur', 'Le motif de refus est obligatoire.');
      return;
    }
    this.executeReview('REJECT', this.rejectReason().trim());
  }

  private executeReview(action: CandidateAskReviewAction, decisionReason?: string | null): void {
    const item = this.reviewTarget();
    if (!item?.id) {
      return;
    }

    this.setReviewLoading(item.id, true);
    this.showApproveConfirmation.set(false);
    this.showRejectDialog.set(false);

    this.service.review(item.id, action, decisionReason ?? null).subscribe({
      next: (response) => {
        this.setReviewLoading(item.id!, false);
        this.reviewTarget.set(null);
        this.rejectReason.set('');
        if (response?.hasError) {
          this.notificationService.error('Erreur', response?.status?.message || 'Impossible de traiter la demande.');
          return;
        }
        const successMessage = action === 'APPROVE'
          ? 'Demande candidat validée avec succès.'
          : 'Demande candidat refusée avec succès.';
        this.notificationService.success('Succès', successMessage);
        this.loadItems();
      },
      error: (error) => {
        console.error('Erreur lors du traitement de la demande candidat:', error);
        this.setReviewLoading(item.id!, false);
        this.notificationService.error('Erreur', 'Impossible de traiter la demande candidat.');
      }
    });
  }

  private setReviewLoading(id: number, isLoading: boolean): void {
    this.reviewLoading.set({
      ...this.reviewLoading(),
      [id]: isLoading
    });
  }
}
