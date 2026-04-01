import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { NotificationService, DbNotification, PagedNotificationResponse, NotificationSearchCriteria } from '../../../../../core/services/notification.service';
import { environment } from '../../../../../../environments/environment';
import { UserService, User } from '../../../../../core/services/user.service';

@Component({
  selector: 'app-entities-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-notifications.html',
  styleUrls: ['./entities-notifications.scss']
})
export class EntitiesNotificationsComponent extends EntityCrudBase<DbNotification, NotificationSearchCriteria, PagedNotificationResponse> {
  private notifService = inject(NotificationService);
  private http = inject(HttpClient);
  private userService = inject(UserService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesNotificationsPageSize';
  protected override readonly entityName = 'notifications';
  protected override readonly entityTypeApi = 'notifications';

  allUsers = signal<User[]>([]);

  advancedCriteria: NotificationSearchCriteria = {};
  editFormData: DbNotification = { id: 0, notifType: '', notifActor: 0, notifLink: '', isRead: false, userId: 0 };
  createFormData: Partial<DbNotification> = {};

  protected fetchAll(criteria: NotificationSearchCriteria): Observable<PagedNotificationResponse> {
    return this.notifService.getAllNotificationsByCriteria(criteria);
  }
  protected performCreate(item: Partial<DbNotification>): Observable<any> {
    return this.http.post(`${environment.apiUrl}/notifications/create`, { user: 1, datas: [item] });
  }
  protected performUpdate(item: DbNotification): Observable<any> {
    return this.http.post(`${environment.apiUrl}/notifications/update`, { user: 1, datas: [item] });
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
}
