import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase } from '../../../../../shared/entity-crud-base';
import { CampaignQuestionsService, CampaignQuestion, PagedCampaignQuestionResponse, CampaignQuestionSearchCriteria } from '../../../../../core/services/campaign-questions.service';

@Component({
  selector: 'app-entities-campaign-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entities-campaign-questions.html',
  styleUrls: ['./entities-campaign-questions.scss']
})
export class EntitiesCampaignQuestionsComponent extends EntityCrudBase<CampaignQuestion, CampaignQuestionSearchCriteria, PagedCampaignQuestionResponse> {
  private service = inject(CampaignQuestionsService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesCampaignQuestionsPageSize';
  protected override readonly entityName = 'questions campagne';

  advancedCriteria: CampaignQuestionSearchCriteria = {};
  editFormData: CampaignQuestion = {};
  createFormData: Partial<CampaignQuestion> = {};

  protected fetchAll(criteria: CampaignQuestionSearchCriteria): Observable<PagedCampaignQuestionResponse> {
    return this.service.getAllByCriteria(criteria);
  }
  protected performCreate(item: Partial<CampaignQuestion>): Observable<any> {
    return this.service.create(item as CampaignQuestion);
  }
  protected performUpdate(item: CampaignQuestion): Observable<any> {
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
}
