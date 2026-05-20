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
import { NotificationService, DbNotification, PagedNotificationResponse, NotificationSearchCriteria } from '../../../../../core/services/notification.service';
import { UserService, User } from '../../../../../core/services/user.service';

@Component({
  selector: 'app-entities-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-notifications.html',
  styleUrls: ['./entities-notifications.scss']
})
export class EntitiesNotificationsComponent extends EntityCrudBase<DbNotification, NotificationSearchCriteria, PagedNotificationResponse> {
  private notifService = inject(NotificationService);
  private userService = inject(UserService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesNotificationsPageSize';
  protected override readonly entityName = 'notifications';
  protected override readonly entityTypeApi = 'notifications';

  allUsers = signal<User[]>([]);

  advancedCriteria: NotificationSearchCriteria = {};
  editFormData: DbNotification = { id: 0, notifType: '', notifActor: 0, notifLink: '', isRead: false, userId: 0 };
  createFormData: Partial<DbNotification> = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'userId', label: 'Utilisateur', priority: 2 },
    { key: 'notifType', label: 'Type', priority: 1 },
    { key: 'notifActor', label: 'Acteur ID', priority: 2 },
    { key: 'notifLink', label: 'Lien', priority: 3 },
    { key: 'isRead', label: 'Lu', priority: 2 },
    { key: 'objectTableName', label: 'Table', priority: 3 },
    { key: 'objectTableId', label: 'Table ID', priority: 3 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: NotificationSearchCriteria): Observable<PagedNotificationResponse> {
    return this.notifService.getAllNotificationsByCriteria(criteria);
  }
  protected performCreate(item: Partial<DbNotification>): Observable<any> {
    return this.notifService.createNotification(item);
  }
  protected performUpdate(item: DbNotification): Observable<any> {
    return this.notifService.updateNotification(item);
  }
  protected performDelete(id: number): Observable<any> {
    return this.notifService.deleteNotification(id);
  }
  protected performRestore(id: number): Observable<any> {
    return this.notifService.restoreNotification(id);
  }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  override ngOnInit() {
    super.ngOnInit();
    this.userService.getByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({ next: (res) => this.allUsers.set(res.content) });
  }

  getUserDisplay(item: DbNotification): string {
    const fullName = [item.userFirstName, item.userLastName].filter(Boolean).join(' ').trim();
    if (fullName) {
      return item.userId ? `${fullName} (#${item.userId})` : fullName;
    }
    return item.userId ? `#${item.userId}` : '-';
  }
}
