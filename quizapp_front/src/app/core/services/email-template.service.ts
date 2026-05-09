import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface EmailTemplate {
  id: number;
  templateKey?: string;
  subjectTemplate?: string;
  bodyTemplate?: string;
  editableVariablesJson?: string;
  description?: string;
  availableVariables?: string;
  actionType?: string;
  presetId?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
}

export interface EmailTemplatePreset {
  id: number;
  name: string;
  category: string;
  htmlStructure: string;
  previewImage?: string;
  description?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type EmailActionType =
  | 'APPLICATION_VERIFICATION'
  | 'PASSWORD_RESET'
  | 'INVITATION_CODE'
  | 'CANDIDATE_ASK_RESULT'
  | 'PRE_SCREEN_DECISION'
  | 'FINAL_DECISION'
  | 'INTERVIEW_INVITE'
  | 'QUIZ_INVITE'
  | 'WELCOME';

export const EMAIL_ACTION_TYPES: { value: EmailActionType; label: string }[] = [
  { value: 'APPLICATION_VERIFICATION', label: 'Verification email candidature' },
  { value: 'PASSWORD_RESET', label: 'Reinitialisation mot de passe' },
  { value: 'INVITATION_CODE', label: 'Invitation inscription' },
  { value: 'CANDIDATE_ASK_RESULT', label: 'Resultat demande candidat' },
  { value: 'PRE_SCREEN_DECISION', label: 'Decision de preselection' },
  { value: 'FINAL_DECISION', label: 'Decision finale' },
  { value: 'INTERVIEW_INVITE', label: 'Invitation entretien' },
  { value: 'QUIZ_INVITE', label: 'Invitation quiz' },
  { value: 'WELCOME', label: 'Bienvenue' },
];

@Injectable({ providedIn: 'root' })
export class EmailTemplateService {
  private apiUrl = '/emailTemplate';
  private presetApiUrl = '/emailTemplatePreset';

  constructor(private http: HttpClient) {}

  getPresets(): Observable<EmailTemplatePreset[]> {
    return this.http.get<any>(`${this.presetApiUrl}/getAll`).pipe(
      map(resp => {
        const items = (resp.items || []) as EmailTemplatePreset[];
        return items.filter(preset => preset.isDeleted !== true);
      }),
      catchError(err => throwError(() => err))
    );
  }

  createPreset(preset: Partial<EmailTemplatePreset>): Observable<EmailTemplatePreset> {
    const request = { user: this.getCurrentUserId(), datas: [preset] };
    return this.http.post<any>(`${this.presetApiUrl}/create`, request).pipe(
      map(resp => resp.items?.[0]),
      catchError(err => throwError(() => err))
    );
  }

  updatePreset(preset: Partial<EmailTemplatePreset>): Observable<EmailTemplatePreset> {
    const request = { user: this.getCurrentUserId(), datas: [preset] };
    return this.http.post<any>(`${this.presetApiUrl}/update`, request).pipe(
      map(resp => resp.items?.[0]),
      catchError(err => throwError(() => err))
    );
  }

  deletePreset(id: number): Observable<void> {
    const request = { user: this.getCurrentUserId(), datas: [{ id }] };
    return this.http.post<any>(`${this.presetApiUrl}/delete`, request).pipe(
      map(() => void 0),
      catchError(err => throwError(() => err))
    );
  }

  getByActionType(actionType: string): Observable<EmailTemplate | null> {
    const request = { user: this.getCurrentUserId(), data: { actionType } };
    return this.http.post<any>(`${this.apiUrl}/getByActionType`, request).pipe(
      map(resp => resp.items?.[0] || null),
      catchError(err => throwError(() => err))
    );
  }

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
