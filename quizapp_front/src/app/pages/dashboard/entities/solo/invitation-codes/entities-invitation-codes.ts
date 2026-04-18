import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityCrudBase, BaseSearchCriteria, BasePagedResponse } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { InvitationCodeService, InvitationCode } from '../../../../../core/services/invitation-code.service';

interface InvitationCodeCriteria extends BaseSearchCriteria {
  email?: string;
  role?: string;
  isUsed?: boolean;
}

interface PagedInvitationCodeResponse extends BasePagedResponse<InvitationCode> {}

@Component({
  selector: 'app-entities-invitation-codes',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-invitation-codes.html',
  styleUrls: ['./entities-invitation-codes.scss']
})
export class EntitiesInvitationCodesComponent extends EntityCrudBase<InvitationCode, InvitationCodeCriteria, PagedInvitationCodeResponse> {
  private service = inject(InvitationCodeService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesInvitationCodesPageSize';
  protected override readonly entityName = 'codes d\'invitation';
  protected override readonly entityTypeApi = 'invitationCode';

  advancedCriteria: InvitationCodeCriteria = {};
  editFormData: InvitationCode = {} as InvitationCode;
  createFormData: Partial<InvitationCode> = {};

  protected fetchAll(criteria: InvitationCodeCriteria): Observable<PagedInvitationCodeResponse> {
    const { page, size, ...data } = criteria;
    return this.service.getByCriteria(data, page, size).pipe(
      map(resp => ({
        content: resp.items,
        totalElements: resp.count,
        totalPages: Math.ceil(resp.count / (size || 10))
      }))
    );
  }
  protected performCreate(item: Partial<InvitationCode>): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: InvitationCode): Observable<any> { return throwError(() => new Error('Update non supporté pour les codes d\'invitation')); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return throwError(() => new Error('Restore non supporté pour les codes d\'invitation')); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }
}
