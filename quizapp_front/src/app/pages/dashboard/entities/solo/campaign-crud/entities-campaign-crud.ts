import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { FilterCheckboxComponent } from '../../../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { CampaignCrudService, CampaignCrud, PagedCampaignCrudResponse, CampaignCrudSearchCriteria } from '../../../../../core/services/campaign-crud.service';
import { CampaignService, Campaign } from '../../../../../core/services/campaign.service';
import { UserService, User } from '../../../../../core/services/user.service';

@Component({
  selector: 'app-entities-campaign-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-campaign-crud.html',
  styleUrls: ['./entities-campaign-crud.scss']
})
export class EntitiesCampaignCrudComponent extends EntityCrudBase<CampaignCrud, CampaignCrudSearchCriteria, PagedCampaignCrudResponse> {
  private service = inject(CampaignCrudService);
  private campaignService = inject(CampaignService);
  private userService = inject(UserService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesCampaignCrudPageSize';
  protected override readonly entityName = 'permissions campagne';
  protected override readonly entityTypeApi = 'campaign-crud';

  allCampaigns = signal<Campaign[]>([]);
  allUsers = signal<User[]>([]);

  advancedCriteria: CampaignCrudSearchCriteria = {};
  editFormData: CampaignCrud = {};
  createFormData: Partial<CampaignCrud> = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'userId', label: 'User ID', priority: 1 },
    { key: 'campaignId', label: 'Campaign ID', priority: 1 },
    { key: 'admin', label: 'Admin', priority: 2 },
    { key: 'update', label: 'Update', priority: 2 },
    { key: 'delete', label: 'Delete', priority: 2 },
    { key: 'evaluate', label: 'Evaluate', priority: 3 },
    { key: 'planify', label: 'Planify', priority: 3 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: CampaignCrudSearchCriteria): Observable<PagedCampaignCrudResponse> {
    return this.service.getAllByCriteria(criteria);
  }
  protected performCreate(item: Partial<CampaignCrud>): Observable<any> {
    return this.service.create(item as CampaignCrud);
  }
  protected performUpdate(item: CampaignCrud): Observable<any> {
    return this.service.update(item);
  }
  protected performDelete(id: number): Observable<any> {
    return this.service.delete(id);
  }
  protected performRestore(id: number): Observable<any> {
    return this.service.restore(id);
  }
  protected resetAdvancedCriteriaValues(): void {
    this.advancedCriteria = {};
  }
  protected resetCreateFormData(): void {
    this.createFormData = {};
  }

  override ngOnInit() {
    super.ngOnInit();
    this.campaignService.getAllCampaignsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allCampaigns.set(res.content) });
    this.userService.getByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allUsers.set(res.content) });
  }
}
