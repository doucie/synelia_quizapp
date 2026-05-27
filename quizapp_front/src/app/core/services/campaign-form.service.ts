import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CampaignFormLink {
  id?: number;
  key: string;
  assignmentOrder?: number;
  campaignId?: number;
  campaignName?: string;
  campaignStatus?: string;
  formId?: number;
  formName?: string;
  formDesc?: string;
  formActive?: boolean;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
}

export interface CampaignFormMutationPayload {
  id?: number;
  assignmentOrder?: number;
  campaignId?: number;
  formId?: number;
  isDeleted?: boolean;
}

export interface CampaignFormSearchCriteria {
  page?: number;
  size?: number;
  search_string?: string;
  idDe?: string;
  idA?: string;
  campaignId?: number;
  formId?: number;
  assignmentOrder?: number;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

export interface PagedCampaignFormResponse {
  content: CampaignFormLink[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class CampaignFormService {
  private readonly apiUrl = `${environment.apiUrl}/campaignform`;

  constructor(private readonly http: HttpClient) {}

  getAllByCriteria(criteria: CampaignFormSearchCriteria = {}): Observable<PagedCampaignFormResponse> {
    const request = {
      user: this.getCurrentUserId(),
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        id: criteria.idDe || '',
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : '',
        searchString: criteria.search_string || '',
        ...(criteria.campaignId && { campaignId: criteria.campaignId }),
        ...(criteria.formId && { formId: criteria.formId }),
        ...(criteria.assignmentOrder && { assignmentOrder: criteria.assignmentOrder }),
        ...(criteria.dateCreationDe && { dateCreationDe: criteria.dateCreationDe }),
        ...(criteria.dateCreationA && { dateCreationA: criteria.dateCreationA }),
        ...(criteria.dateModificationDe && { dateModificationDe: criteria.dateModificationDe }),
        ...(criteria.dateModificationA && { dateModificationA: criteria.dateModificationA }),
        ...(criteria.idDe && criteria.idDe.trim() && { idStart: criteria.idDe }),
        ...(criteria.idA && criteria.idA.trim() && { idEnd: criteria.idA })
      }
    };

    return this.http.post<any>(`${this.apiUrl}/getAllByCriteria`, request).pipe(
      map(response => {
        if (!response || (!response.items && !response.item)) {
          return { content: [], totalElements: 0, totalPages: 0, size: criteria.size || 10, number: criteria.page || 0 };
        }

        const items = (response.items || (response.item ? [response.item] : []))
          .map((item: any) => this.normalizeCampaignFormLink(item));
        const totalElements = response.totalCount || response.count || items.length;
        const pageSize = criteria.size || 10;
        return { content: items, totalElements, totalPages: Math.ceil(totalElements / pageSize), size: pageSize, number: criteria.page || 0 };
      }),
      catchError(error => {
        console.error('Erreur campaignForm:', error);
        return throwError(() => error);
      })
    );
  }

  getLinks(criteria: CampaignFormSearchCriteria = {}): Observable<CampaignFormLink[]> {
    return this.getAllByCriteria({ size: 9999, page: 0, isDeleted: false, ...criteria }).pipe(
      map(response => response.content || [])
    );
  }

  create(item: CampaignFormMutationPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { user: this.getCurrentUserId(), datas: [this.preparePayload(item)] });
  }

  update(item: CampaignFormMutationPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: this.getCurrentUserId(), datas: [this.preparePayload(item)] });
  }

  delete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { user: this.getCurrentUserId(), datas: [{ id }] });
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/updateDeleted`, { user: this.getCurrentUserId(), datas: [{ id, isDeleted: false }] });
  }

  private normalizeCampaignFormLink(item: any): CampaignFormLink {
    const id = this.toOptionalNumber(item.id);
    const campaignId = this.toOptionalNumber(item.campaignId ?? item.campaign_id);
    const formId = this.toOptionalNumber(item.formId ?? item.form_id);

    return {
      id,
      key: id ? `campaign-form-${id}` : `${campaignId ?? 'campaign'}-${formId ?? 'form'}`,
      assignmentOrder: this.toOptionalNumber(item.assignmentOrder ?? item.assignment_order),
      campaignId,
      campaignName: item.campaignName || item.campaign_name || undefined,
      campaignStatus: item.campaignStatus || item.campaign_status || undefined,
      formId,
      formName: item.formName || item.form_name || undefined,
      formDesc: item.formDesc || item.form_desc || undefined,
      formActive: item.formActive ?? item.form_active ?? false,
      createdAt: item.createdAt || item.created_at || undefined,
      createdBy: this.toOptionalNumber(item.createdBy ?? item.created_by),
      updatedAt: item.updatedAt || item.updated_at || undefined,
      updatedBy: this.toOptionalNumber(item.updatedBy ?? item.updated_by),
      isDeleted: item.isDeleted ?? item.is_deleted ?? false
    };
  }

  private preparePayload(item: CampaignFormMutationPayload): CampaignFormMutationPayload {
    return {
      ...item,
      assignmentOrder: item.assignmentOrder ?? undefined,
      campaignId: item.campaignId ?? undefined,
      formId: item.formId ?? undefined
    };
  }

  private getCurrentUserId(): number {
    try {
      const user = localStorage.getItem('user');
      return user ? Number(JSON.parse(user).id) || 0 : 0;
    } catch {
      return 0;
    }
  }

  private toOptionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
}