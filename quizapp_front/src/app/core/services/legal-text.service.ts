import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface LegalText {
  id: number;
  textKey?: string;
  title?: string;
  content?: string;
  description?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
}

@Injectable({ providedIn: 'root' })
export class LegalTextService {
  private apiUrl = '/legalText';

  constructor(private http: HttpClient) {}

  getByCriteria(criteria: Partial<LegalText> = {}, page = 0, size = 50): Observable<{ items: LegalText[]; count: number }> {
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

  create(text: Partial<LegalText>): Observable<LegalText> {
    const request = { user: this.getCurrentUserId(), datas: [text] };
    return this.http.post<any>(`${this.apiUrl}/create`, request).pipe(
      map(resp => resp.items?.[0]),
      catchError(err => throwError(() => err))
    );
  }

  update(text: Partial<LegalText>): Observable<LegalText> {
    const request = { user: this.getCurrentUserId(), datas: [text] };
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
