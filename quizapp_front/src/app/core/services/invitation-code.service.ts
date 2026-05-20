import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface InvitationCode {
  id: number;
  email?: string;
  role?: string;
  code?: string;
  isUsed?: boolean;
  expiredAt?: string;
  isDeleted?: boolean;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
}

export interface InvitationCodeActionResult {
  invitation?: InvitationCode;
  hasError: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class InvitationCodeService {
  private apiUrl = '/invitationCode';

  constructor(private http: HttpClient) {}

  getByCriteria(criteria: Partial<InvitationCode> = {}, page = 0, size = 50): Observable<{ items: InvitationCode[]; count: number }> {
    const request = {
      user: this.getCurrentUserId(),
      size,
      index: page,
      isSimpleLoading: false,
      data: {
        ...criteria,
        ...(criteria.isDeleted !== undefined ? { isDeleted: criteria.isDeleted } : {})
      }
    };
    return this.http.post<any>(`${this.apiUrl}/getByCriteria`, request).pipe(
      map(resp => ({
        items: resp.items || [],
        count: resp.count || resp.totalCount || 0
      })),
      catchError(err => throwError(() => err))
    );
  }

  create(invitation: Partial<InvitationCode>): Observable<InvitationCodeActionResult> {
    const request = { user: this.getCurrentUserId(), datas: [invitation] };
    return this.http.post<any>(`${this.apiUrl}/create`, request).pipe(
      map(resp => ({
        invitation: resp.items?.[0],
        hasError: resp.hasError === true,
        message: resp.status?.message
      })),
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

  resend(id: number): Observable<InvitationCodeActionResult> {
    const request = { user: this.getCurrentUserId(), data: { id } };
    return this.http.post<any>(`${this.apiUrl}/resend`, request).pipe(
      map(resp => ({
        invitation: resp.item || resp.items?.[0],
        hasError: resp.hasError === true,
        message: resp.status?.message
      })),
      catchError(err => throwError(() => err))
    );
  }

  validateCode(code: string): Observable<InvitationCode> {
    return this.http.post<any>(`${this.apiUrl}/validate`, { data: { code } }).pipe(
      map(resp => {
        if (resp.hasError) throw new Error(resp.status?.message || 'Code invalide');
        return resp.item;
      }),
      catchError(err => throwError(() => err))
    );
  }

  registerWithCode(code: string, firstName: string, lastName: string, password: string): Observable<any> {
    return this.http.post<any>('/userManager/registerWithCode', {
      data: { code, firstName, lastName, password }
    }).pipe(
      map(resp => {
        if (resp.hasError) throw new Error(resp.status?.message || 'Erreur lors de l\'inscription');
        return resp;
      }),
      catchError(err => throwError(() => err))
    );
  }

  private getCurrentUserId(): number {
    try {
      const user = localStorage.getItem('user');
      if (user) return JSON.parse(user)?.id || 0;
    } catch {}
    return 0;
  }
}
