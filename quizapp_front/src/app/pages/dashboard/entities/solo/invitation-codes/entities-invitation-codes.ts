import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityCrudBase, BaseSearchCriteria, BasePagedResponse, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { FilterCheckboxComponent } from '../../../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
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
  imports: [FilterSelectComponent, FilterSelectOptionDirective, CommonModule, FormsModule, FilterCheckboxComponent, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-invitation-codes.html',
  styleUrls: ['./entities-invitation-codes.scss']
})
export class EntitiesInvitationCodesComponent extends EntityCrudBase<InvitationCode, InvitationCodeCriteria, PagedInvitationCodeResponse> {
  private service = inject(InvitationCodeService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesInvitationCodesPageSize';
  protected override readonly entityName = 'codes d\'invitation';
  protected override readonly entityTypeApi = 'invitationCode';
  override canRestoreItems = false;

  advancedCriteria: InvitationCodeCriteria = {};
  editFormData: InvitationCode = {} as InvitationCode;
  createFormData: Partial<InvitationCode> = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'email', label: 'Email', priority: 1 },
    { key: 'role', label: 'Rôle', priority: 2 },
    { key: 'code', label: 'Code', priority: 1 },
    { key: 'used', label: 'Utilisé?', priority: 2 },
    { key: 'expiredAt', label: 'Expire le', priority: 2 },
    { key: 'deleted', label: 'Supprimé', priority: 3 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  override detailFields = [
    { key: 'id', label: 'ID', type: 'id' as const, editable: false },
    { key: 'email', label: 'Email', editable: false },
    { key: 'role', label: 'Rôle', editable: false },
    { key: 'code', label: 'Code', editable: false },
    { key: 'isUsed', label: 'Utilisé', type: 'boolean' as const, editable: false },
    { key: 'expiredAt', label: 'Expire le', type: 'date' as const, editable: false },
    { key: 'isDeleted', label: 'Supprimé', type: 'boolean' as const, editable: false },
    { key: 'createdAt', label: 'Créé le', type: 'date' as const, editable: false },
    { key: 'updatedAt', label: 'Modifié le', type: 'date' as const, editable: false },
  ];

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

  canResend(item: InvitationCode): boolean {
    return !!item.id && !!item.email && !item.isDeleted && !item.isUsed;
  }

  resendInvitation(item: InvitationCode): void {
    if (!this.canResend(item)) {
      this.notificationService.warning('Attention', 'Seuls les codes actifs non utilisés peuvent être renvoyés.');
      return;
    }

    this.service.resend(item.id).subscribe({
      next: (response) => {
        if (response.hasError) {
          this.notificationService.error('Erreur', response.message || 'Erreur lors du renvoi du code d\'invitation');
          return;
        }

        this.notificationService.success('Succès', response.message || 'Code d\'invitation renvoyé avec succès');
        this.loadItems();
      },
      error: (error) => {
        this.notificationService.error('Erreur', this.getErrorMessage(error, 'Erreur lors du renvoi du code d\'invitation'));
      }
    });
  }
}
