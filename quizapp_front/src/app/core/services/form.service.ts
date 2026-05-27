import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Form {
  id?: number;
  formName?: string;
  formDesc?: string;
  isActive?: boolean;
  isTimed?: boolean;
  campaignId?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

export interface FormMutationPayload {
  id?: number;
  formName?: string;
  formDesc?: string;
  isActive?: boolean;
  campaignId?: number;
  isDeleted?: boolean;
}

export interface FormSearchCriteria {
  page?: number;
  size?: number;
  search_string?: string;
  idDe?: string;
  idA?: string;
  formName?: string;
  campaignId?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

export interface PagedFormResponse {
  content: Form[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class FormService {
  private apiUrl = `${environment.apiUrl}/form`;

  constructor(private http: HttpClient) {}

  private getCurrentUserId(): string {
    try {
      const currentUserData = localStorage.getItem('user');
      if (!currentUserData) {
        return '1';
      }

      const currentUser = JSON.parse(currentUserData);
      return currentUser?.id?.toString() || '1';
    } catch {
      return '1';
    }
  }

  getAllByCriteria(criteria: FormSearchCriteria = {}): Observable<PagedFormResponse> {
    const currentUserId = this.getCurrentUserId();

    const request = {
      user: currentUserId,
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        id: criteria.idDe || '',
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : '',
        searchString: criteria.search_string || '',
        ...(criteria.formName && { formName: criteria.formName }),
        ...(criteria.campaignId && { campaignId: criteria.campaignId }),
        ...(criteria.isActive !== undefined && { isActive: criteria.isActive }),
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
        const items = (response.items || (response.item ? [response.item] : [])).map((item: any) => this.normalizeForm(item));
        const totalElements = response.totalCount || response.count || items.length;
        const pageSize = criteria.size || 10;
        return { content: items, totalElements, totalPages: Math.ceil(totalElements / pageSize), size: pageSize, number: criteria.page || 0 };
      }),
      catchError(error => { console.error('Erreur form:', error); return throwError(() => error); })
    );
  }

  create(item: FormMutationPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { user: this.getCurrentUserId(), datas: [item] });
  }

  update(item: FormMutationPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: this.getCurrentUserId(), datas: [item] });
  }

  syncCampaignLinks(campaignId: number, formIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/custom`, {
      user: this.getCurrentUserId(),
      datas: [{ action: 'syncCampaignLinks', campaignId, formIds }]
    });
  }

  duplicateForCampaign(sourceFormId: number, campaignId: number, duplicateName?: string): Observable<Form> {
    return this.http.post<any>(`${this.apiUrl}/custom`, {
      user: this.getCurrentUserId(),
      datas: [{ action: 'duplicateForCampaign', id: sourceFormId, campaignId, ...(duplicateName ? { formName: duplicateName } : {}) }]
    }).pipe(
      map(response => this.extractFirstForm(response)),
      catchError(error => { console.error('Erreur duplication form:', error); return throwError(() => error); })
    );
  }

  delete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { user: this.getCurrentUserId(), datas: [{ id }] });
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: this.getCurrentUserId(), datas: [{ id, isDeleted: false }] });
  }

  private extractFirstForm(response: any): Form {
    const item = response?.items?.[0] ?? response?.item;
    return this.normalizeForm(item || {});
  }

  private normalizeForm(item: any): Form {
    return {
      id: this.toOptionalNumber(item.id),
      formName: item.formName || item.form_name || undefined,
      formDesc: item.formDesc || item.form_desc || undefined,
      isActive: item.isActive ?? item.is_active ?? false,
      isTimed: item.isTimed ?? item.is_timed ?? false,
      campaignId: this.toOptionalNumber(item.campaignId ?? item.campaign_id),
      createdAt: item.createdAt || item.created_at || undefined,
      createdBy: this.toOptionalNumber(item.createdBy ?? item.created_by),
      updatedAt: item.updatedAt || item.updated_at || undefined,
      updatedBy: this.toOptionalNumber(item.updatedBy ?? item.updated_by),
      isDeleted: item.isDeleted ?? item.is_deleted ?? false,
      dateCreationDe: item.dateCreationDe || item.date_creation_de || undefined,
      dateCreationA: item.dateCreationA || item.date_creation_a || undefined,
      dateModificationDe: item.dateModificationDe || item.date_modification_de || undefined,
      dateModificationA: item.dateModificationA || item.date_modification_a || undefined
    };
  }

  private toOptionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
}
