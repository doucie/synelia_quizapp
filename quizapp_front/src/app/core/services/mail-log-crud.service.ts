import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface MailLogItem {
  id?: number;
  recipientEmail?: string;
  recipientUserId?: number;
  senderUserId?: number;
  emailTemplateId?: number;
  subject?: string;
  bodyPreview?: string;
  status?: string;
  errorMessage?: string;
  sentAt?: string;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  searchString?: string;
}

export interface MailLogItemMutationPayload {
  id?: number;
  recipientEmail?: string;
  recipientUserId?: number;
  senderUserId?: number;
  emailTemplateId?: number;
  subject?: string;
  bodyPreview?: string;
  status?: string;
  errorMessage?: string;
  sentAt?: string;
  isDeleted?: boolean;
}

export interface MailLogCriteria {
  recipientEmail?: string;
  recipientUserId?: number;
  senderUserId?: number;
  emailTemplateId?: number;
  status?: string;
  page?: number;
  size?: number;
  isDeleted?: boolean;
  idDe?: string;
  idA?: string;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
  search_string?: string;
}

export interface PagedMailLogResponse {
  content: MailLogItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class MailLogCrudService {
  private apiUrl = `${environment.apiUrl}/mailLog`;

  constructor(private http: HttpClient) {}

  getAllByCriteria(criteria: MailLogCriteria = {}): Observable<PagedMailLogResponse> {
    const request = {
      user: this.getCurrentUserId()?.toString() || '1',
      size: criteria.size || 10,
      index: criteria.page || 0,
      isSimpleLoading: false,
      data: {
        isDeleted: criteria.isDeleted !== undefined ? criteria.isDeleted.toString() : '',
        searchString: criteria.search_string || '',
        ...(criteria.recipientEmail && { recipientEmail: criteria.recipientEmail }),
        ...(criteria.recipientUserId && { recipientUserId: criteria.recipientUserId }),
        ...(criteria.senderUserId && { senderUserId: criteria.senderUserId }),
        ...(criteria.emailTemplateId && { emailTemplateId: criteria.emailTemplateId }),
        ...(criteria.status && { status: criteria.status }),
        ...(criteria.idDe?.trim() && { idStart: criteria.idDe }),
        ...(criteria.idA?.trim() && { idEnd: criteria.idA }),
        ...(criteria.dateCreationDe && { dateCreationDe: criteria.dateCreationDe }),
        ...(criteria.dateCreationA && { dateCreationA: criteria.dateCreationA }),
        ...(criteria.dateModificationDe && { dateModificationDe: criteria.dateModificationDe }),
        ...(criteria.dateModificationA && { dateModificationA: criteria.dateModificationA })
      }
    };

    return this.http.post<any>(`${this.apiUrl}/getAllByCriteria`, request).pipe(
      map(response => {
        const items = (response?.items || []).map((item: any) => this.normalizeItem(item));
        const total = response?.totalCount || response?.count || items.length;
        const pageSize = criteria.size || 10;
        return {
          content: items,
          totalElements: total,
          totalPages: Math.ceil(total / pageSize),
          size: pageSize,
          number: criteria.page || 0
        };
      }),
      catchError(() => of({ content: [], totalElements: 0, totalPages: 0, size: criteria.size || 10, number: criteria.page || 0 }))
    );
  }

  create(item: MailLogItemMutationPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, {
      user: this.getCurrentUserId(),
      datas: [this.prepareItemPayload(item)]
    });
  }

  update(item: MailLogItemMutationPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, {
      user: this.getCurrentUserId(),
      datas: [this.prepareItemPayload(item)]
    });
  }

  delete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, {
      user: this.getCurrentUserId(),
      datas: [{ id }]
    });
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, {
      user: this.getCurrentUserId(),
      datas: [{ id, isDeleted: false }]
    });
  }

  private getCurrentUserId(): number | undefined {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user).id;
      } catch {
        return undefined;
      }
    }

    return undefined;
  }

  private normalizeItem(item: any): MailLogItem {
    return {
      id: this.toOptionalNumber(item.id),
      recipientEmail: item.recipientEmail || item.recipient_email || undefined,
      recipientUserId: this.toOptionalNumber(item.recipientUserId ?? item.recipient_user_id),
      senderUserId: this.toOptionalNumber(item.senderUserId ?? item.sender_user_id),
      emailTemplateId: this.toOptionalNumber(item.emailTemplateId ?? item.email_template_id),
      subject: item.subject || undefined,
      bodyPreview: item.bodyPreview || item.body_preview || undefined,
      status: item.status || undefined,
      errorMessage: item.errorMessage || item.error_message || undefined,
      sentAt: item.sentAt || item.sent_at || undefined,
      createdAt: item.createdAt || item.created_at || undefined,
      createdBy: this.toOptionalNumber(item.createdBy ?? item.created_by),
      updatedAt: item.updatedAt || item.updated_at || undefined,
      updatedBy: this.toOptionalNumber(item.updatedBy ?? item.updated_by),
      isDeleted: item.isDeleted ?? item.is_deleted ?? false,
      searchString: item.searchString || item.search_string || undefined
    };
  }

  private prepareItemPayload(item: MailLogItemMutationPayload): MailLogItemMutationPayload {
    const payload: MailLogItemMutationPayload = { ...item };

    if (!payload.recipientEmail?.trim()) {
      delete payload.recipientEmail;
    }

    if (!payload.subject?.trim()) {
      delete payload.subject;
    }

    if (!payload.status?.trim()) {
      delete payload.status;
    }

    if (!payload.bodyPreview?.trim()) {
      delete payload.bodyPreview;
    }

    if (!payload.errorMessage?.trim()) {
      delete payload.errorMessage;
    }

    return payload;
  }

  private toOptionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? undefined : numericValue;
  }
}