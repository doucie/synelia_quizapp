import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { InterviewService, Interview, PagedInterviewResponse, InterviewSearchCriteria } from '../../../../../core/services/interview.service';
import { InterviewCrudService, InterviewCrud } from '../../../../../core/services/interview-crud.service';
import { CandidateInterviewEntityService, CandidateInterviewEntity } from '../../../../../core/services/candidate-interview-entity.service';
import { CampaignService, Campaign } from '../../../../../core/services/campaign.service';

@Component({
  selector: 'app-entities-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-interviews.html',
  styleUrls: ['./entities-interviews.scss']
})
export class EntitiesInterviewsComponent extends EntityCrudBase<Interview, InterviewSearchCriteria, PagedInterviewResponse> {
  private interviewService = inject(InterviewService);
  private interviewCrudService = inject(InterviewCrudService);
  private candidateInterviewEntityService = inject(CandidateInterviewEntityService);
  private campaignFkService = inject(CampaignService);
  allCampaigns = signal<Campaign[]>([]);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesInterviewsPageSize';
  protected override readonly entityName = 'entretiens';
  protected override readonly entityTypeApi = 'interviews';

  // Expansion
  expandedItems = signal<Set<number>>(new Set());
  childCruds = signal<{[id: number]: InterviewCrud[]}>({});
  childCandidateInterviews = signal<{[id: number]: CandidateInterviewEntity[]}>({});
  loadingChildren = signal<{[id: number]: boolean}>({});
  childTab = signal<{[id: number]: string}>({});

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

  override ngOnInit() {
    super.ngOnInit();
    this.campaignFkService.getAllCampaignsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allCampaigns.set(res.content) });
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
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('fr-FR', {
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

  toggleExpansion(id: number) {
    if (this.expandedItems().has(id)) {
      this.expandedItems.set(new Set());
    } else {
      this.expandedItems.set(new Set([id]));
      this.loadChildren(id);
    }
  }

  isExpanded(id: number): boolean { return this.expandedItems().has(id); }

  getChildTab(id: number): string { return this.childTab()[id] || 'cruds'; }
  setChildTab(id: number, tab: string) { this.childTab.set({ ...this.childTab(), [id]: tab }); }

  loadChildren(id: number) {
    if (this.loadingChildren()[id]) return;
    this.loadingChildren.set({ ...this.loadingChildren(), [id]: true });
    let loaded = 0;
    const done = () => { loaded++; if (loaded >= 2) this.loadingChildren.set({ ...this.loadingChildren(), [id]: false }); };
    this.interviewCrudService.getAllByCriteria({ interviewId: id, size: 100 }).subscribe({
      next: (r) => { this.childCruds.set({ ...this.childCruds(), [id]: r.content }); done(); },
      error: () => { this.childCruds.set({ ...this.childCruds(), [id]: [] }); done(); }
    });
    this.candidateInterviewEntityService.getAllByCriteria({ interviewId: id, size: 100 }).subscribe({
      next: (r) => { this.childCandidateInterviews.set({ ...this.childCandidateInterviews(), [id]: r.content }); done(); },
      error: () => { this.childCandidateInterviews.set({ ...this.childCandidateInterviews(), [id]: [] }); done(); }
    });
  }

  getCruds(id: number): InterviewCrud[] { return this.childCruds()[id] || []; }
  getCandidateInterviews(id: number): CandidateInterviewEntity[] { return this.childCandidateInterviews()[id] || []; }
  isLoadingChildren(id: number): boolean { return this.loadingChildren()[id] || false; }
  trackByChildId(index: number, item: any): number { return item.id; }
}
