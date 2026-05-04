// ── Types pipeline ──────────────────────────────────
export type StageType = 'CANDIDATURE' | 'QUIZ' | 'PRESELECTION' | 'INTERVIEW' | 'TECHNICAL_TEST' | 'EVALUATION' | 'DECISION' | 'CUSTOM';
export type ProgressStatus = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'SKIPPED';

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
  decidedById?: number;
  // Flattened
  stageName?: string;
  stageType?: string;
  stageOrder?: number;
  candidateFirstName?: string;
  candidateLastName?: string;
  decidedByFirstName?: string;
  decidedByLastName?: string;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
  searchString?: string;
}
