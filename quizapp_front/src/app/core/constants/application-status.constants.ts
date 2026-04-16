/**
 * Constantes rétrocompatibles pour applicationStatus.
 * À terme, ces statuts seront dépréciés au profit de application_progress uniquement.
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
