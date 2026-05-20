export type CampaignStatus = 'DRAFT' | 'PENDING' | 'OPEN' | 'PAUSED' | 'CLOSED';

export type CampaignStatusFilter = 'all' | 'active' | 'pending' | 'closed';

export const DEFAULT_CAMPAIGN_STATUS: CampaignStatus = 'DRAFT';

export const CAMPAIGN_STATUSES: CampaignStatus[] = ['DRAFT', 'PENDING', 'OPEN', 'PAUSED', 'CLOSED'];

export const CAMPAIGN_STATUS_OPTIONS: Array<{ value: CampaignStatus; label: string }> = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'OPEN', label: 'Ouverte' },
  { value: 'PAUSED', label: 'En pause' },
  { value: 'CLOSED', label: 'Fermée' }
];

export function normalizeCampaignStatus(value?: string | null): CampaignStatus {
  const normalizedValue = (value || '').trim().toUpperCase();

  if (normalizedValue === 'ACTIVE') {
    return 'OPEN';
  }

  if (normalizedValue === 'ARCHIVED') {
    return 'CLOSED';
  }

  if ((CAMPAIGN_STATUSES as string[]).includes(normalizedValue)) {
    return normalizedValue as CampaignStatus;
  }

  return DEFAULT_CAMPAIGN_STATUS;
}

export function matchesCampaignStatusFilter(status: string | undefined | null, filter: CampaignStatusFilter): boolean {
  if (filter === 'all') {
    return true;
  }

  const normalizedStatus = normalizeCampaignStatus(status);

  switch (filter) {
    case 'active':
      return normalizedStatus === 'OPEN';
    case 'closed':
      return normalizedStatus === 'CLOSED';
    case 'pending':
      return normalizedStatus === 'DRAFT' || normalizedStatus === 'PENDING' || normalizedStatus === 'PAUSED';
    default:
      return true;
  }
}

export function getCampaignStatusClass(status?: string | null): string {
  const normalizedStatus = normalizeCampaignStatus(status);

  if (normalizedStatus === 'OPEN') {
    return 'status-active';
  }

  if (normalizedStatus === 'CLOSED') {
    return 'status-closed';
  }

  return 'status-pending';
}

export function getCampaignStatusLabel(status?: string | null): string {
  switch (normalizeCampaignStatus(status)) {
    case 'DRAFT':
      return 'Brouillon';
    case 'OPEN':
      return 'Ouverte';
    case 'PAUSED':
      return 'En pause';
    case 'CLOSED':
      return 'Fermée';
    case 'PENDING':
    default:
      return 'En attente';
  }
}

export function isOperationalCampaignStatus(status?: string | null): boolean {
  const normalizedStatus = normalizeCampaignStatus(status);
  return normalizedStatus === 'OPEN';
}