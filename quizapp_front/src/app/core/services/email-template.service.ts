import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface EmailTemplate {
  id: number;
  templateKey?: string;
  subjectTemplate?: string;
  bodyTemplate?: string;
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
}

const DEFAULT_EMAIL_TEMPLATE_PRESETS: EmailTemplatePreset[] = [
  {
    id: -1,
    name: 'Minimal',
    category: 'MINIMAL',
    description: 'Template epure avec header simple, contenu central et footer discret.',
    htmlStructure: '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:0;padding:24px;background:#f8f9fa}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden}.header{padding:28px;text-align:center;background:{{primaryColor}};color:#fff}.body{padding:30px;color:#334155;line-height:1.65;font-size:15px}.footer{padding:18px 30px;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0}</style></head><body><div class="container"><div class="header"><h1>{{companyName}}</h1></div><div class="body">{{content}}</div><div class="footer">{{companyName}} - {{currentYear}}</div></div></body></html>'
  },
  {
    id: -2,
    name: 'Modern',
    category: 'MODERN',
    description: 'Template moderne avec gradient, CTA et footer structure.',
    htmlStructure: '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Segoe UI,Roboto,sans-serif;margin:0;padding:24px;background:#eef2ff}.container{max-width:640px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 35px rgba(15,23,42,0.08)}.header{padding:40px 32px;background:linear-gradient(135deg,{{primaryColor}},{{primaryColorDark}});color:#fff;text-align:center}.body{padding:34px 32px;color:#1e293b;line-height:1.7}.cta{text-align:center;padding:0 32px 32px}.footer{padding:24px 32px;background:#f8fafc;color:#64748b;font-size:12px;text-align:center}.btn{display:inline-block;padding:14px 30px;background:{{primaryColor}};color:#fff;text-decoration:none;border-radius:999px;font-weight:700}</style></head><body><div class="container"><div class="header"><h1>{{companyName}}</h1><p>{{subtitle}}</p></div><div class="body">{{content}}</div><div class="cta">{{ctaButton}}</div><div class="footer">{{companyName}} - {{currentYear}}</div></div></body></html>'
  },
  {
    id: -3,
    name: 'Corporate',
    category: 'CORPORATE',
    description: 'Template professionnel, sobre et adapte aux messages officiels.',
    htmlStructure: '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Georgia,Times New Roman,serif;margin:0;padding:24px;background:#f5f5f0}.container{max-width:640px;margin:0 auto;background:#fff;border:1px solid #d6d3d1}.header{padding:26px 30px;border-bottom:4px solid {{primaryColor}}}.body{padding:32px 30px;color:#44403c;line-height:1.8}.signature{padding:18px 30px;border-top:1px solid #e7e5e4;color:#57534e;font-size:13px}.footer{padding:18px 30px;background:#fafaf9;color:#78716c;font-size:12px;text-align:center}.btn{display:inline-block;padding:12px 24px;background:{{primaryColor}};color:#fff;text-decoration:none;font-weight:700}</style></head><body><div class="container"><div class="header"><h1>{{companyName}}</h1></div><div class="body">{{content}}</div><div class="signature">{{signature}}</div><div class="footer">{{companyName}} - {{companyAddress}} - {{currentYear}}</div></div></body></html>'
  },
  {
    id: -4,
    name: 'Colorful',
    category: 'COLORFUL',
    description: 'Template dynamique avec header colore pour messages chaleureux.',
    htmlStructure: '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Poppins,Nunito,sans-serif;margin:0;padding:24px;background:linear-gradient(180deg,#f8f0ff,#fff7ed)}.container{max-width:620px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 14px 40px rgba(107,70,193,0.12)}.header{padding:38px 30px;background:linear-gradient(135deg,{{primaryColor}},#ec4899,#f59e0b);color:#fff;text-align:center}.emoji{font-size:34px;margin-bottom:10px}.body{padding:32px 30px;color:#334155;line-height:1.7}.footer{padding:22px 30px;text-align:center;color:#94a3b8;font-size:12px}.btn{display:inline-block;padding:14px 28px;background:linear-gradient(135deg,{{primaryColor}},#ec4899);color:#fff;text-decoration:none;border-radius:999px;font-weight:700}</style></head><body><div class="container"><div class="header"><div class="emoji">{{emoji}}</div><h1>{{title}}</h1></div><div class="body">{{content}}</div><div class="footer">{{companyName}} - {{currentYear}}</div></div></body></html>'
  },
  {
    id: -5,
    name: 'Dark',
    category: 'DARK',
    description: 'Template sombre elegant avec contraste fort et CTA lumineux.',
    htmlStructure: '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Segoe UI,sans-serif;margin:0;padding:24px;background:#020617}.container{max-width:620px;margin:0 auto;background:#0f172a;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)}.header{padding:34px 30px;background:linear-gradient(135deg,#0f172a,#1e293b);text-align:center;color:#fff}.body{padding:32px 30px;color:rgba(255,255,255,0.88);line-height:1.7}.cta{text-align:center;padding:0 30px 30px}.footer{padding:20px 30px;color:rgba(255,255,255,0.45);font-size:12px;text-align:center;border-top:1px solid rgba(255,255,255,0.08)}.btn{display:inline-block;padding:14px 30px;background:{{primaryColor}};color:#fff;text-decoration:none;border-radius:10px;font-weight:700}</style></head><body><div class="container"><div class="header"><h1>{{companyName}}</h1><p>{{subtitle}}</p></div><div class="body">{{content}}</div><div class="cta">{{ctaButton}}</div><div class="footer">{{companyName}} - {{currentYear}}</div></div></body></html>'
  }
];

export type EmailActionType =
  | 'APPLICATION_VERIFICATION'
  | 'PASSWORD_RESET'
  | 'INVITATION_CODE'
  | 'ACCEPTANCE'
  | 'REJECTION'
  | 'INTERVIEW_INVITE'
  | 'QUIZ_INVITE'
  | 'WELCOME';

export const EMAIL_ACTION_TYPES: { value: EmailActionType; label: string }[] = [
  { value: 'APPLICATION_VERIFICATION', label: 'Verification email candidature' },
  { value: 'PASSWORD_RESET', label: 'Reinitialisation mot de passe' },
  { value: 'INVITATION_CODE', label: 'Invitation inscription' },
  { value: 'ACCEPTANCE', label: 'Acceptation' },
  { value: 'REJECTION', label: 'Refus' },
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
        const items = resp.items || [];
        return items.length > 0 ? items : DEFAULT_EMAIL_TEMPLATE_PRESETS;
      }),
      catchError(() => of(DEFAULT_EMAIL_TEMPLATE_PRESETS))
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
