import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface EmailTemplate {
  id: number;
  templateKey?: string;
  subjectTemplate?: string;
  bodyTemplate?: string;
  description?: string;
  availableVariables?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
}

@Injectable({ providedIn: 'root' })
export class EmailTemplateService {
  private apiUrl = '/emailTemplate';

  constructor(private http: HttpClient) {}

  getByCriteria(criteria: Partial<EmailTemplate> = {}, page = 0, size = 50): Observable<{ items: EmailTemplate[]; count: number }> {
    const currentUserId = this.getCurrentUserId();
    const request = {
      user: currentUserId,
      size,
      index: page,
      isSimpleLoading: false,
      data: { ...criteria, isDeleted: criteria.isDeleted ?? false }
    };
    return this.http.post<any>(`${this.apiUrl}/getByCriteria`, request).pipe(
      map(resp => ({
        items: resp.items || [],
        count: resp.count || resp.totalCount || 0
      })),
      catchError(err => throwError(() => err))
    );
  }

  create(template: Partial<EmailTemplate>): Observable<EmailTemplate> {
    const request = { user: this.getCurrentUserId(), datas: [template] };
    return this.http.post<any>(`${this.apiUrl}/create`, request).pipe(
      map(resp => resp.items?.[0]),
      catchError(err => throwError(() => err))
    );
  }

  update(template: Partial<EmailTemplate>): Observable<EmailTemplate> {
    const request = { user: this.getCurrentUserId(), datas: [template] };
    return this.http.post<any>(`${this.apiUrl}/update`, request).pipe(
      map(resp => resp.items?.[0]),
      catchError(err => throwError(() => err))
    );
  }

  delete(id: number): Observable<void> {
    const request = { user: this.getCurrentUserId(), datas: [{ id }] };
    return this.http.post<any>(`${this.apiUrl}/delete`, request).pipe(
      map(() => void 0),
      catchError(err => throwError(() => err))
    );
  }

  private getCurrentUserId(): string {
    try {
      const user = localStorage.getItem('user');
      if (user) return JSON.parse(user)?.id?.toString() || '1';
    } catch {}
    return '1';
  }
}
