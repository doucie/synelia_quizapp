export type ManualCorrectionStatus = 'NOT_REQUIRED' | 'PENDING' | 'COMPLETED';

const MANUAL_CORRECTION_STATUS_VALUES: ManualCorrectionStatus[] = ['NOT_REQUIRED', 'PENDING', 'COMPLETED'];

export function normalizeManualCorrectionStatus(value?: string | null): ManualCorrectionStatus | null {
  const normalizedValue = (value || '').trim().toUpperCase();

  if (normalizedValue === 'DONE') {
    return 'COMPLETED';
  }

  if ((MANUAL_CORRECTION_STATUS_VALUES as string[]).includes(normalizedValue)) {
    return normalizedValue as ManualCorrectionStatus;
  }

  return null;
}

export function getManualCorrectionStatusLabel(status?: string | null): string {
  switch (normalizeManualCorrectionStatus(status)) {
    case 'NOT_REQUIRED':
      return 'Auto-corrige';
    case 'PENDING':
      return 'Correction requise';
    case 'COMPLETED':
      return 'Correction terminee';
    default:
      return status || '';
  }
}

export function getManualCorrectionStatusClass(status?: string | null): string {
  switch (normalizeManualCorrectionStatus(status)) {
    case 'NOT_REQUIRED':
      return 'manual-status-auto';
    case 'PENDING':
      return 'manual-status-pending';
    case 'COMPLETED':
      return 'manual-status-completed';
    default:
      return '';
  }
}