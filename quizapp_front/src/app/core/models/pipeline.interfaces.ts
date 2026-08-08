// ── Types pipeline ──────────────────────────────────
export type SupportedStageType = 'CANDIDATURE' | 'QUIZ' | 'PRESELECTION' | 'INTERVIEW' | 'EVALUATION' | 'DECISION';
export type LegacyStageType = 'TECHNICAL_TEST' | 'CUSTOM';
export type StageType = SupportedStageType | LegacyStageType;
export type ProgressStatus = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'SKIPPED';

export const STAGE_TYPES: SupportedStageType[] = ['CANDIDATURE', 'QUIZ', 'PRESELECTION', 'INTERVIEW', 'EVALUATION', 'DECISION'];
export const SINGLETON_INTERMEDIATE_STAGE_TYPES: SupportedStageType[] = ['QUIZ', 'PRESELECTION', 'INTERVIEW', 'EVALUATION'];
export const STAGE_TYPE_LABELS: Record<StageType, string> = {
  CANDIDATURE: 'Candidature',
  QUIZ: 'Quiz',
  PRESELECTION: 'Présélection',
  INTERVIEW: 'Entretien',
  EVALUATION: 'Évaluation',
  DECISION: 'Décision',
  TECHNICAL_TEST: 'Quiz (legacy TECHNICAL_TEST)',
  CUSTOM: 'Legacy CUSTOM'
};
export const PROGRESS_STATUSES: ProgressStatus[] = ['PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'SKIPPED'];

export interface PipelineStageReadinessInput {
  stageType?: StageType;
  stageLabel?: string;
  stageOrder?: number;
}

export function normalizePipelineStageType(stageType?: StageType): StageType | undefined {
  return stageType === 'TECHNICAL_TEST' ? 'QUIZ' : stageType;
}

export function getPipelineReadinessIssues(stages: PipelineStageReadinessInput[]): string[] {
  if (stages.length === 0) {
    return ['Ajoutez au minimum Candidature, une étape intermédiaire et Décision.'];
  }

  const issues: string[] = [];
  const normalizedTypes = stages.map(stage => normalizePipelineStageType(stage.stageType));
  const candidatureCount = normalizedTypes.filter(type => type === 'CANDIDATURE').length;
  const decisionCount = normalizedTypes.filter(type => type === 'DECISION').length;
  const intermediateCount = normalizedTypes.filter(type => type !== 'CANDIDATURE' && type !== 'DECISION').length;
  const hasBlankLabel = stages.some(stage => !(stage.stageLabel || '').trim());
  const hasInvalidOrder = stages.some((stage, index) => stage.stageOrder !== index + 1);
  const hasCustomStage = stages.some(stage => stage.stageType === 'CUSTOM');
  const duplicatedSingletonTypes = SINGLETON_INTERMEDIATE_STAGE_TYPES.filter(type => normalizedTypes.filter(normalizedType => normalizedType === type).length > 1);

  if (candidatureCount !== 1) {
    issues.push('Candidature doit être présente une seule fois.');
  }
  if (decisionCount !== 1) {
    issues.push('Décision doit être présente une seule fois.');
  }
  if (intermediateCount < 1) {
    issues.push('Ajoutez au moins une étape intermédiaire entre Candidature et Décision.');
  }
  if (normalizedTypes[0] !== 'CANDIDATURE') {
    issues.push('Candidature doit rester en première position.');
  }
  if (normalizedTypes[normalizedTypes.length - 1] !== 'DECISION') {
    issues.push('Décision doit rester en dernière position.');
  }
  if (hasBlankLabel) {
    issues.push('Chaque étape doit avoir un libellé.');
  }
  if (hasInvalidOrder) {
    issues.push('Les ordres d’étapes doivent rester continus.');
  }
  if (hasCustomStage) {
    issues.push('Le type CUSTOM n’est plus supporté.');
  }
  if (duplicatedSingletonTypes.length > 0) {
    issues.push(`Les types ${duplicatedSingletonTypes.map(type => STAGE_TYPE_LABELS[type]).join(', ')} ne peuvent être présents qu’une seule fois dans le pipeline actuel.`);
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
  stageType?: StageType;
  stageLabel?: string;
  stageOrder?: number;
  isRequired?: boolean;
  isEliminatory?: boolean;
  configJson?: string | null;
  pipelineTemplateId?: number;
  pipelineTemplateName?: string;
  orderedStageIds?: number[];
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
