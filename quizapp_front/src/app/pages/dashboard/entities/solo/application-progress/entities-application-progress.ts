import { Component, inject, signal, OnInit } from '@angular/core';
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
import { ApplicationProgressService, ApplicationProgressCriteria, PagedApplicationProgressResponse } from '../../../../../core/services/application-progress.service';
import { ApplicationProgress, ProgressStatus, PROGRESS_STATUSES } from '../../../../../core/models/pipeline.interfaces';

@Component({
  selector: 'app-entities-application-progress',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-application-progress.html',
  styleUrls: ['./entities-application-progress.scss']
})
export class EntitiesApplicationProgressComponent extends EntityCrudBase<ApplicationProgress, ApplicationProgressCriteria, PagedApplicationProgressResponse> implements OnInit {
  private service = inject(ApplicationProgressService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesApplicationProgressPageSize';
  protected override readonly entityName = 'progressions des candidatures';
  protected override readonly entityTypeApi = 'application-progress';

  advancedCriteria: ApplicationProgressCriteria = {};
  editFormData: ApplicationProgress = {};
  createFormData: Partial<ApplicationProgress> = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'application', label: 'Candidature', priority: 1 },
    { key: 'stage', label: 'Étape', priority: 2 },
    { key: 'type', label: 'Type', priority: 2 },
    { key: 'status', label: 'Statut', priority: 2 },
    { key: 'score', label: 'Score', priority: 2 },
    { key: 'startedAt', label: 'Démarré le', priority: 2 },
    { key: 'completedAt', label: 'Terminé le', priority: 3 },
    { key: 'notes', label: 'Notes', priority: 3 },
    { key: 'decidedBy', label: 'Décidé par', priority: 3 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  progressStatuses: ProgressStatus[] = [...PROGRESS_STATUSES];
  applicationScopedView = signal<{ id: number; label: string } | null>(null);

  getApplicationLabel(item: Partial<ApplicationProgress> | null | undefined): string {
    if (!item) {
      return '-';
    }

    const fullName = `${item.candidateFirstName || ''} ${item.candidateLastName || ''}`.trim();
    if (fullName) {
      return fullName;
    }

    return item.applicationId ? `#${item.applicationId}` : '-';
  }

  getStatusLabel(status?: ProgressStatus | string): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente', IN_PROGRESS: 'En cours', PASSED: 'Réussi', FAILED: 'Échoué', SKIPPED: 'Ignoré'
    };
    return status ? labels[status] || status : '-';
  }

  getStatusClass(status?: ProgressStatus | string): string {
    const classes: Record<string, string> = {
      PENDING: 'status-pending', IN_PROGRESS: 'status-in-progress', PASSED: 'status-passed', FAILED: 'status-failed', SKIPPED: 'status-skipped'
    };
    return status ? classes[status] || '' : '';
  }

  viewApplicationProgress(item: ApplicationProgress): void {
    if (!item.applicationId) {
      this.notificationService.warning('Attention', 'Aucune candidature parent trouvée pour cette progression.');
      return;
    }

    const applicationId = item.applicationId;
    const applicationLabel = this.getApplicationLabel(item);

    this.isLoading.set(true);
    this.quickSearch = '';
    this.service.getByApplication(applicationId).subscribe({
      next: (response) => {
        if (response?.hasError) {
          this.notificationService.error('Erreur', response.status?.message || 'Erreur lors du chargement des progressions de la candidature');
          this.isLoading.set(false);
          return;
        }

        const progressions = response.items || (response.item ? [response.item] : []);
        this.applicationScopedView.set({ id: applicationId, label: applicationLabel });
        this.currentPage.set(0);
        this.items.set(progressions);
        this.totalElements.set(progressions.length);
        this.totalPages.set(progressions.length > 0 ? 1 : 0);
        this.isLoading.set(false);
        requestAnimationFrame(() => this.initAutoHideColumns());
      },
      error: (error) => {
        this.notificationService.error('Erreur', this.getErrorMessage(error, 'Erreur lors du chargement des progressions de la candidature'));
        this.isLoading.set(false);
      }
    });
  }

  clearApplicationScopedView(): void {
    if (!this.applicationScopedView()) {
      return;
    }

    this.applicationScopedView.set(null);
    this.currentPage.set(0);
    this.loadItems();
  }

  override onQuickSearch(): void {
    this.applicationScopedView.set(null);
    super.onQuickSearch();
  }

  override applyAdvancedSearch(): void {
    this.applicationScopedView.set(null);
    super.applyAdvancedSearch();
  }

  override resetAdvancedSearch(): void {
    this.applicationScopedView.set(null);
    super.resetAdvancedSearch();
  }

  override toggleDeletedItems(): void {
    this.applicationScopedView.set(null);
    super.toggleDeletedItems();
  }

  override onPageSizeChange(event: Event): void {
    this.applicationScopedView.set(null);
    super.onPageSizeChange(event);
  }

  protected fetchAll(criteria: ApplicationProgressCriteria): Observable<PagedApplicationProgressResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<ApplicationProgress>): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: ApplicationProgress): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
