import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PipelineStageNotificationRule } from '../models/pipeline.interfaces';

// ── Interfaces requête / réponse ────────────────────
export interface PipelineStageNotificationRuleRequest {
  user?: number;
  data?: Partial<PipelineStageNotificationRule>;
  datas?: PipelineStageNotificationRule[];
}

export interface PipelineStageNotificationRuleResponse {
  hasError: boolean;
  status: { code: string; message: string };
  items?: PipelineStageNotificationRule[];
  item?: PipelineStageNotificationRule;
  count?: number;
  httpCode?: number;
}

@Injectable({ providedIn: 'root' })
export class PipelineStageNotificationRuleService {
  private apiUrl = `${environment.apiUrl}/pipelineStageNotificationRule`;

  constructor(private http: HttpClient) {}

  /**
   * Règles actives d'une étape de pipeline.
   */
  getByStage(pipelineStageId: number): Observable<PipelineStageNotificationRuleResponse> {
    return this.http.post<PipelineStageNotificationRuleResponse>(`${this.apiUrl}/byStage`, {
      user: this.getCurrentUserId(),
      data: { pipelineStageId }
    }).pipe(
      map(response => ({
        ...response,
        items: (response.items || []).map(rule => this.transformRule(rule)),
        item: response.item ? this.transformRule(response.item) : response.item
      })),
      catchError(this.handleError('récupération des règles de notification'))
    );
  }

  /**
   * Remplacement global des règles d'une étape : les règles absentes de la liste
   * sont supprimées (soft delete).
   */
  saveStageRules(pipelineStageId: number, rules: PipelineStageNotificationRule[]): Observable<PipelineStageNotificationRuleResponse> {
    return this.http.post<PipelineStageNotificationRuleResponse>(`${this.apiUrl}/saveStageRules`, {
      user: this.getCurrentUserId(),
      data: { pipelineStageId },
      datas: rules
    }).pipe(catchError(this.handleError('enregistrement des règles de notification')));
  }

  // ── Utilitaires ────────────────────────────────────

  private transformRule(rule: any): PipelineStageNotificationRule {
    return {
      id: rule.id,
      triggerCode: rule.triggerCode || rule.trigger_code || undefined,
      outcomeCode: rule.outcomeCode || rule.outcome_code || undefined,
      emailTemplateId: rule.emailTemplateId ?? rule.email_template_id ?? undefined,
      isRequired: rule.isRequired ?? rule.is_required ?? false,
      isAutomatic: rule.isAutomatic ?? rule.is_automatic ?? false,
      requiresManualConfirmation: rule.requiresManualConfirmation ?? rule.requires_manual_confirmation ?? false,
      pipelineStageId: rule.pipelineStageId ?? rule.pipeline_stage_id ?? undefined,
      pipelineStageLabel: rule.pipelineStageLabel || rule.pipeline_stage_label || undefined,
      emailTemplateName: rule.emailTemplateName || rule.email_template_name || undefined,
      createdAt: rule.createdAt || rule.created_at || undefined,
      createdBy: rule.createdBy || rule.created_by || undefined,
      updatedAt: rule.updatedAt || rule.updated_at || undefined,
      updatedBy: rule.updatedBy || rule.updated_by || undefined,
      isDeleted: rule.isDeleted ?? rule.is_deleted ?? false
    };
  }

  private getCurrentUserId(): number | undefined {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).id : undefined;
    } catch { return undefined; }
  }

  private handleError(action: string) {
    return (error: any) => of({
      hasError: true,
      status: { code: 'ERROR', message: this.extractErrorMessage(error, `Erreur lors de la ${action}`) },
      httpCode: error?.status || 500
    } as PipelineStageNotificationRuleResponse);
  }

  private extractErrorMessage(error: any, fallback: string): string {
    return error?.error?.status?.message || error?.error?.message || error?.message || fallback;
  }
}
