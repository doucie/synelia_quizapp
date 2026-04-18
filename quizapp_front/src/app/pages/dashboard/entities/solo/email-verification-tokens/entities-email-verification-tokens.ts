import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { EmailVerificationTokenService, EmailVerificationToken, PagedEmailVerificationTokenResponse, EmailVerificationTokenCriteria } from '../../../../../core/services/email-verification-token.service';

@Component({
  selector: 'app-entities-email-verification-tokens',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityDetailPanelComponent, DependencyPopupComponent],
  templateUrl: './entities-email-verification-tokens.html',
  styleUrls: ['./entities-email-verification-tokens.scss']
})
export class EntitiesEmailVerificationTokensComponent extends EntityCrudBase<EmailVerificationToken, EmailVerificationTokenCriteria, PagedEmailVerificationTokenResponse> {
  private service = inject(EmailVerificationTokenService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesEmailVerificationTokensPageSize';
  protected override readonly entityName = 'tokens de vérification';
  protected override readonly entityTypeApi = 'emailVerificationToken';

  advancedCriteria: EmailVerificationTokenCriteria = {};
  editFormData: EmailVerificationToken = {};
  createFormData: Partial<EmailVerificationToken> = {};

  protected fetchAll(criteria: EmailVerificationTokenCriteria): Observable<PagedEmailVerificationTokenResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<EmailVerificationToken>): Observable<any> { return this.service.create(item as EmailVerificationToken); }
  protected performUpdate(item: EmailVerificationToken): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  isExpired(item: EmailVerificationToken): boolean {
    return item.expiresAt ? new Date(item.expiresAt) < new Date() : false;
  }
}
