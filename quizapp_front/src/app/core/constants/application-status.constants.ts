/**
 * Constantes rétrocompatibles pour le statut candidat.
 * Le champ application_status a été retiré du DTO : le statut est désormais
 * dérivé des miroirs de progression (current_pipeline_*, current_preselection_*, current_final_decision_*).
 */

export const APPLICATION_STATUS = {
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  PRE_SCREEN_ACCEPTED: 'PRE_SCREEN_ACCEPTED',
  PRE_SCREEN_REJECTED: 'PRE_SCREEN_REJECTED',
  INTERVIEWING: 'INTERVIEWING',
  FINAL_ACCEPTED: 'FINAL_ACCEPTED',
  FINAL_REJECTED: 'FINAL_REJECTED',
  PENDING_ARCHIVED: 'PENDING_ARCHIVED',
  PRE_SCREEN_REJECTED_ARCHIVED: 'PRE_SCREEN_REJECTED_ARCHIVED',
  FINAL_ACCEPTED_ARCHIVED: 'FINAL_ACCEPTED_ARCHIVED',
  FINAL_REJECTED_ARCHIVED: 'FINAL_REJECTED_ARCHIVED',
  WITHDRAWN: 'WITHDRAWN',
} as const;

export type ApplicationStatusType = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  [APPLICATION_STATUS.PENDING]: 'En attente',
  [APPLICATION_STATUS.SUBMITTED]: 'Soumise',
  [APPLICATION_STATUS.PRE_SCREEN_ACCEPTED]: 'Pré-sélection acceptée',
  [APPLICATION_STATUS.PRE_SCREEN_REJECTED]: 'Pré-sélection refusée',
  [APPLICATION_STATUS.PRE_SCREEN_REJECTED_ARCHIVED]: 'Pré-sélection refusée (archivé)',
  [APPLICATION_STATUS.INTERVIEWING]: 'En entretien',
  [APPLICATION_STATUS.FINAL_ACCEPTED]: 'Acceptée',
  [APPLICATION_STATUS.FINAL_REJECTED]: 'Refusée',
  [APPLICATION_STATUS.FINAL_ACCEPTED_ARCHIVED]: 'Acceptée (archivé)',
  [APPLICATION_STATUS.FINAL_REJECTED_ARCHIVED]: 'Refusée (archivé)',
  [APPLICATION_STATUS.PENDING_ARCHIVED]: 'En attente (archivé)',
  [APPLICATION_STATUS.WITHDRAWN]: 'Retirée',
};

export function getApplicationStatusLabel(status: string): string {
  return APPLICATION_STATUS_LABELS[status] || status;
}

export function isRejectedStatus(status: string): boolean {
  return status?.startsWith('PRE_SCREEN_REJECTED') || status?.startsWith('FINAL_REJECTED');
}

export function isAcceptedStatus(status: string): boolean {
  return status?.startsWith('FINAL_ACCEPTED');
}

export interface ApplicationStatusMirrorSource {
  applicationAbandoned?: boolean;
  currentFinalDecisionType?: string;
  currentPreselectionDecisionType?: string;
  currentPipelineStageType?: string;
  currentPipelineProgressStatus?: string;
}

/**
 * Dérive le statut candidat (vocabulaire hérité) depuis les miroirs de progression.
 */
export function resolveApplicationStatusFromMirrors(app: ApplicationStatusMirrorSource | null | undefined): string {
  if (!app) {
    return APPLICATION_STATUS.PENDING;
  }

  if (app.applicationAbandoned) {
    return APPLICATION_STATUS.WITHDRAWN;
  }

  const finalType = (app.currentFinalDecisionType || '').toUpperCase();
  if (finalType.startsWith('FINAL_ACCEPTED')) {
    return APPLICATION_STATUS.FINAL_ACCEPTED;
  }
  if (finalType.startsWith('FINAL_REJECTED')) {
    return APPLICATION_STATUS.FINAL_REJECTED;
  }

  const preselectionType = (app.currentPreselectionDecisionType || '').toUpperCase();
  if (preselectionType.startsWith('PRE_SCREEN_REJECTED')) {
    return APPLICATION_STATUS.PRE_SCREEN_REJECTED;
  }
  if (preselectionType.startsWith('PRE_SCREEN_ACCEPTED')) {
    return APPLICATION_STATUS.PRE_SCREEN_ACCEPTED;
  }

  if ((app.currentPipelineStageType || '').toUpperCase() === 'INTERVIEW') {
    return APPLICATION_STATUS.INTERVIEWING;
  }

  const progress = (app.currentPipelineProgressStatus || '').trim().toUpperCase();
  if (!progress || progress === 'PENDING') {
    return APPLICATION_STATUS.PENDING;
  }
  return APPLICATION_STATUS.SUBMITTED;
}
