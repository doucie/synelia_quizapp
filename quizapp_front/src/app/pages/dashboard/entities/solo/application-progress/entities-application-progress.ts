import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ApplicationProgressService, ApplicationProgressCriteria, PagedApplicationProgressResponse } from '../../../../../core/services/application-progress.service';
import { ApplicationProgress, ProgressStatus } from '../../../../../core/models/pipeline.interfaces';

@Component({
  selector: 'app-entities-application-progress',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
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

  progressStatuses: ProgressStatus[] = ['PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'SKIPPED'];

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

  protected fetchAll(criteria: ApplicationProgressCriteria): Observable<PagedApplicationProgressResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<ApplicationProgress>): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: ApplicationProgress): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
