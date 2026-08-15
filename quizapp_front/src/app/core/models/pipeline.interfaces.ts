// ── Types pipeline ──────────────────────────────────
export type SupportedStageType = 'CANDIDATURE' | 'QUIZ' | 'PRESELECTION' | 'INTERVIEW' | 'DECISION';
export type StageType = SupportedStageType;
export type ProgressStatus = 'PENDING' | 'IN_PROGRESS' | 'AWAITING_VALIDATION' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

export const STAGE_TYPES: SupportedStageType[] = ['CANDIDATURE', 'QUIZ', 'PRESELECTION', 'INTERVIEW', 'DECISION'];
export const STAGE_TYPE_LABELS: Record<StageType, string> = {
  CANDIDATURE: 'Candidature',
  QUIZ: 'Quiz',
  PRESELECTION: 'Présélection',
  INTERVIEW: 'Entretien',
  DECISION: 'Décision'
};
export const PROGRESS_STATUSES: ProgressStatus[] = ['PENDING', 'IN_PROGRESS', 'AWAITING_VALIDATION', 'COMPLETED', 'FAILED', 'SKIPPED'];

export interface PipelineStageReadinessInput {
  stageType?: StageType;
  stageLabel?: string;
  stageOrder?: number;
}

export function getPipelineReadinessIssues(stages: PipelineStageReadinessInput[]): string[] {
  if (stages.length === 0) {
    return ['Ajoutez au minimum Candidature, une étape intermédiaire et Décision.'];
  }

  const issues: string[] = [];
  const candidatureCount = stages.filter(stage => stage.stageType === 'CANDIDATURE').length;
  const decisionCount = stages.filter(stage => stage.stageType === 'DECISION').length;
  const intermediateCount = stages.filter(stage => stage.stageType !== 'CANDIDATURE' && stage.stageType !== 'DECISION').length;
  const hasBlankLabel = stages.some(stage => !(stage.stageLabel || '').trim());
  const hasInvalidOrder = stages.some((stage, index) => stage.stageOrder !== index + 1);

  if (candidatureCount !== 1) {
    issues.push('Candidature doit être présente une seule fois.');
  }
  if (decisionCount < 1) {
    issues.push('Ajoutez au moins une étape Décision.');
  }
  if (intermediateCount < 1) {
    issues.push('Ajoutez au moins une étape intermédiaire entre Candidature et Décision.');
  }
  if (stages[0]?.stageType !== 'CANDIDATURE') {
    issues.push('Candidature doit rester en première position.');
  }
  if (stages[stages.length - 1]?.stageType !== 'DECISION') {
    issues.push('Décision doit rester en dernière position.');
  }
  if (hasBlankLabel) {
    issues.push('Chaque étape doit avoir un libellé.');
  }
  if (hasInvalidOrder) {
    issues.push('Les ordres d’étapes doivent rester continus.');
  }

  return issues;
}

// ── Pipeline Template ──────────────────────────────
export interface PipelineTemplate {
  id?: number;
  templateName?: string;
  templateDesc?: string;
  isDefault?: boolean;
  isActive?: boolean;
  isLocked?: boolean;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  searchString?: string;
  stages?: PipelineStage[];
}

// ── Pipeline Stage ─────────────────────────────────
export interface PipelineStage {
  id?: number;
  uid?: string;
  stageType?: StageType;
  stageLabel?: string;
  stageOrder?: number;
  isRequired?: boolean;
  isEliminatory?: boolean;
  configJson?: string | null;
  pipelineTemplateId?: number;
  pipelineTemplateName?: string;
  orderedStageIds?: number[];
  evaluationGridTemplateVersionId?: number;
  isActive?: boolean;
  isLocked?: boolean;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  searchString?: string;
}

// ── Rule de notification d'étape ───────────────────
export type NotificationTrigger = 'STAGE_EMAIL';
export type NotificationOutcome = StageType;

export const NOTIFICATION_TRIGGERS: { value: NotificationTrigger; label: string }[] = [
  { value: 'STAGE_EMAIL', label: 'Envoi de courriel' }
];

export interface PipelineStageNotificationRule {
  id?: number;
  triggerCode?: NotificationTrigger;
  outcomeCode?: NotificationOutcome;
  emailTemplateId?: number;
  isRequired?: boolean;
  isAutomatic?: boolean;
  requiresManualConfirmation?: boolean;
  pipelineStageId?: number;
  pipelineStageLabel?: string;
  emailTemplateName?: string;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  searchString?: string;
}

// ── Application Progress ───────────────────────────
export interface ApplicationProgress {
  id?: number;
  progressStatus?: ProgressStatus;
  startedAt?: string;
  completedAt?: string;
  score?: number;
  notes?: string;
  applicationId?: number;
  pipelineStageId?: number;
  validatedById?: number;
  // Flattened
  stageName?: string;
  stageType?: string;
  stageOrder?: number;
  candidateFirstName?: string;
  candidateLastName?: string;
  validatedByFirstName?: string;
  validatedByLastName?: string;
  skippedById?: number;
  skippedByFirstName?: string;
  skippedByLastName?: string;
  reopenedById?: number;
  reopenedByFirstName?: string;
  reopenedByLastName?: string;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  searchString?: string;
}
