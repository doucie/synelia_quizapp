import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LogoHtmlSanitizerService } from './logo-html-sanitizer.service';

export interface AppConfig {
  id: number;
  configName?: string;
  companyName?: string;
  appLink?: string | null;
  logoHtml?: string | null;
  primaryColor?: string;
  colorScheme?: string;
  candidateAccountsEnabled?: boolean;
  antiCheatEnabled?: boolean;
  screeningPolicy?: string;
  tabSwitchMaxWarnings?: number;
  tabSwitchMaxActions?: number;
  fullscreenRequired?: boolean;
  blockShortcuts?: boolean;
  blockCopyPaste?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
}

export const COLOR_SCHEMES: { key: string; label: string; primary: string }[] = [
  { key: 'violet', label: 'Violet', primary: '#7C3AED' },
  { key: 'blue', label: 'Bleu', primary: '#2563EB' },
  { key: 'green', label: 'Vert', primary: '#059669' },
  { key: 'red', label: 'Rouge', primary: '#DC2626' },
  { key: 'orange', label: 'Orange', primary: '#EA580C' },
  { key: 'teal', label: 'Teal', primary: '#0D9488' },
  { key: 'indigo', label: 'Indigo', primary: '#4F46E5' },
  { key: 'rose', label: 'Rose', primary: '#E11D48' },
];

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private apiUrl = '/appConfig';

  constructor(
    private http: HttpClient,
    private logoHtmlSanitizer: LogoHtmlSanitizerService
  ) {}

  getByCriteria(criteria: Partial<AppConfig> = {}, page = 0, size = 50): Observable<{ items: AppConfig[]; count: number }> {
    const request = {
      user: this.getCurrentUserId(),
      size,
      index: page,
      isSimpleLoading: false,
      data: { ...criteria, isDeleted: criteria.isDeleted ?? false }
    };
    return this.http.post<any>(`${this.apiUrl}/getByCriteria`, request).pipe(
      map(resp => ({
        items: (resp.items || []).map((item: AppConfig) => this.normalizeConfigFromApi(item)),
        count: resp.count || resp.totalCount || 0
      })),
      catchError(err => throwError(() => err))
    );
  }

  create(config: Partial<AppConfig>): Observable<AppConfig> {
    const request = { user: this.getCurrentUserId(), datas: [this.normalizeConfigPayload(config)] };
    return this.http.post<any>(`${this.apiUrl}/create`, request).pipe(
      map(resp => this.normalizeConfigFromApi(resp.items?.[0])),
      catchError(err => throwError(() => err))
    );
  }

  update(config: Partial<AppConfig>): Observable<AppConfig> {
    const request = { user: this.getCurrentUserId(), datas: [this.normalizeConfigPayload(config)] };
    return this.http.post<any>(`${this.apiUrl}/update`, request).pipe(
      map(resp => this.normalizeConfigFromApi(resp.items?.[0])),
      catchError(err => throwError(() => err))
    );
  }

  delete(id: number): Observable<any> {
    const request = { user: this.getCurrentUserId(), datas: [{ id }] };
    return this.http.post<any>(`${this.apiUrl}/delete`, request).pipe(
      catchError(err => throwError(() => err))
    );
  }

  activate(id: number): Observable<AppConfig> {
    const request = { user: this.getCurrentUserId(), datas: [{ id }] };
    return this.http.post<any>(`${this.apiUrl}/activate`, request).pipe(
      map(resp => resp.items?.[0]),
      catchError(err => throwError(() => err))
    );
  }

  private getCurrentUserId(): number {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).id : 0;
    } catch {
      return 0;
    }
  }

  private normalizeConfigPayload(config: Partial<AppConfig>): Partial<AppConfig> {
    const normalized = { ...config };

    if (Object.prototype.hasOwnProperty.call(normalized, 'logoHtml')) {
      normalized.logoHtml = this.logoHtmlSanitizer.sanitize(normalized.logoHtml);
    }

    return normalized;
  }

  private normalizeConfigFromApi(config: AppConfig | undefined): AppConfig {
    if (!config) {
      return {} as AppConfig;
    }

    return {
      ...config,
      logoHtml: this.logoHtmlSanitizer.sanitize(config.logoHtml)
    };
  }
}
