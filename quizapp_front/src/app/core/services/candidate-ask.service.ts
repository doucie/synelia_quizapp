import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export type CandidateAskReviewAction = 'APPROVE' | 'REJECT';
export type CandidateAskRequestType = 'IDENTITY' | 'EMAIL' | 'PHONE';
export type CandidateAskStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CandidateAsk {
  id?: number;
  requestType?: CandidateAskRequestType | string;
  askStatus?: CandidateAskStatus | string;
  isVerified?: boolean;
  firstName?: string;
  lastName?: string;
  newEmail?: string;
  newPhone?: string;
  decisionReason?: string;
  applicationId?: number;
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

export interface CandidateAskSearchCriteria {
  page?: number;
  size?: number;
  search_string?: string;
  idDe?: string;
  idA?: string;
  applicationId?: number;
  requestType?: string;
  isDeleted?: boolean;
  dateCreationDe?: string;
  dateCreationA?: string;
  dateModificationDe?: string;
  dateModificationA?: string;
}

export interface PagedCandidateAskResponse {
  content: CandidateAsk[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class CandidateAskService {
  private apiUrl = `${environment.apiUrl}/candidateAsk`;

  constructor(private http: HttpClient) {}

  private getCurrentUserId(): string {
    const currentUserData = localStorage.getItem('user');
    return currentUserData ? JSON.parse(currentUserData).id?.toString() || '1' : '1';
  }

  getAllByCriteria(criteria: CandidateAskSearchCriteria = {}): Observable<PagedCandidateAskResponse> {
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
        ...(criteria.applicationId && { applicationId: criteria.applicationId }),
        ...(criteria.requestType && { requestType: criteria.requestType }),
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
        const items = (response.items || (response.item ? [response.item] : [])).map((item: any) => this.normalizeItem(item));
        const totalElements = response.totalCount || response.count || items.length;
        const pageSize = criteria.size || 10;
        return { content: items, totalElements, totalPages: Math.ceil(totalElements / pageSize), size: pageSize, number: criteria.page || 0 };
      }),
      catchError(error => { console.error('Erreur candidate-ask:', error); return throwError(() => error); })
    );
  }

  create(item: CandidateAsk): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, { user: this.getCurrentUserId(), datas: [item] });
  }

  update(item: CandidateAsk): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: this.getCurrentUserId(), datas: [item] });
  }

  delete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { user: this.getCurrentUserId(), datas: [{ id }] });
  }

  restore(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/update`, { user: this.getCurrentUserId(), datas: [{ id, isDeleted: false }] });
  }

  review(id: number, action: CandidateAskReviewAction, decisionReason?: string | null): Observable<any> {
    return this.http.post(`${this.apiUrl}/custom`, {
      user: this.getCurrentUserId(),
      datas: [{
        id,
        action,
        decisionReason: decisionReason ?? null
      }]
    });
  }

  private normalizeItem(item: any): CandidateAsk {
    const askStatus = this.resolveAskStatus(item.askStatus ?? item.ask_status, item.isVerified ?? item.is_verified);

    return {
      id: this.toOptionalNumber(item.id),
      requestType: item.requestType || item.request_type || undefined,
      askStatus,
      isVerified: item.isVerified ?? item.is_verified ?? askStatus === 'APPROVED',
      firstName: item.firstName || item.first_name || undefined,
      lastName: item.lastName || item.last_name || undefined,
      newEmail: item.newEmail || item.new_email || undefined,
      newPhone: item.newPhone || item.new_phone || undefined,
      decisionReason: item.decisionReason || item.decision_reason || undefined,
      applicationId: this.toOptionalNumber(item.applicationId ?? item.application_id),
      createdAt: item.createdAt || item.created_at || undefined,
      createdBy: this.toOptionalNumber(item.createdBy ?? item.created_by),
      updatedAt: item.updatedAt || item.updated_at || undefined,
      updatedBy: this.toOptionalNumber(item.updatedBy ?? item.updated_by),
      isDeleted: item.isDeleted ?? item.is_deleted ?? false,
      dateCreationDe: item.dateCreationDe,
      dateCreationA: item.dateCreationA,
      dateModificationDe: item.dateModificationDe,
      dateModificationA: item.dateModificationA
    };
  }

  private resolveAskStatus(rawStatus: unknown, isVerified: unknown): CandidateAskStatus | string | undefined {
    const normalizedStatus = String(rawStatus || '').trim().toUpperCase();
    if (normalizedStatus === 'PENDING' || normalizedStatus === 'APPROVED' || normalizedStatus === 'REJECTED') {
      return normalizedStatus;
    }

    return isVerified === true ? 'APPROVED' : 'PENDING';
  }

  private toOptionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
}
