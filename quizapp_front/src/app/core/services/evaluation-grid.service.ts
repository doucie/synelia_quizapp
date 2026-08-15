import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// ── Interfaces catalogue grille d'évaluation ────────
export interface EvaluationGridTemplateVersion {
  id: number;
  evaluationGridTemplateId?: number;
  versionNumber?: number;
  versionLabel?: string;
  isPublished?: boolean;
  lockedAt?: string;
  isDeleted?: boolean;
}

export interface EvaluationGridTemplate {
  id: number;
  templateName?: string;
  templateDesc?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  versions?: EvaluationGridTemplateVersion[];
}

export interface EvaluationGridTemplateResponse {
  hasError: boolean;
  status: { code: string; message: string };
  items?: EvaluationGridTemplate[];
  count?: number;
  httpCode?: number;
}

@Injectable({ providedIn: 'root' })
export class EvaluationGridService {
  private apiUrl = `${environment.apiUrl}/evaluationGrid`;

  constructor(private http: HttpClient) {}

  /**
   * Catalogue des grilles d'évaluation : templates actifs avec leurs versions publiées.
   */
  getTemplates(): Observable<EvaluationGridTemplate[]> {
    return this.http.post<EvaluationGridTemplateResponse>(`${this.apiUrl}/templates`, {
      user: this.getCurrentUserId()
    }).pipe(
      map(response => response?.items || []),
      catchError(() => of([]))
    );
  }

  private getCurrentUserId(): number | undefined {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).id : undefined;
    } catch { return undefined; }
  }
}
