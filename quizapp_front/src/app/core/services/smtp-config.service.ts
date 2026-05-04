import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface SmtpConfig {
  id: number;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  smtpAuth?: boolean;
  starttlsEnable?: boolean;
  starttlsRequired?: boolean;
  connectionTimeout?: number;
  timeout?: number;
  writeTimeout?: number;
  senderName?: string;
  senderEmail?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class SmtpConfigService {
  private apiUrl = '/smtpConfig';

  constructor(private http: HttpClient) {}

  getByCriteria(criteria: Partial<SmtpConfig> = {}, page = 0, size = 50): Observable<{ items: SmtpConfig[]; count: number }> {
    const request = {
      user: this.getCurrentUserId(),
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

  create(config: Partial<SmtpConfig>): Observable<SmtpConfig> {
    const request = { user: this.getCurrentUserId(), datas: [config] };
    return this.http.post<any>(`${this.apiUrl}/create`, request).pipe(
      map(resp => resp.items?.[0]),
      catchError(err => throwError(() => err))
    );
  }

  update(config: Partial<SmtpConfig>): Observable<SmtpConfig> {
    const request = { user: this.getCurrentUserId(), datas: [config] };
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

  testActive(): Observable<string> {
    const request = { user: this.getCurrentUserId() };
    return this.http.post<any>(`${this.apiUrl}/test`, request).pipe(
      map(resp => resp.status?.message || 'Email de test SMTP envoye'),
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
