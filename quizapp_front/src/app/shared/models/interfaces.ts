export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  RECRUITER = 'RECRUITER',
  CANDIDATE = 'CANDIDATE'
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  duration: number; // in minutes
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id?: number;
  questionRef?: string;
  questionText?: string;
  questionChrono?: number;
  questionType?: string;
  score?: number;
  difficultyLevel?: string;
  specialityId?: number;
  isDeleted?: boolean;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  TEXT = 'TEXT'
}

export interface Answer {
  id?: number;
  answerText?: string;
  answerType?: string;
  allowAdditionalComment?: boolean;
  additionalCommentRequired?: boolean;
  additionalCommentPlaceholder?: string;
  answerOrder?: number;
  isCorrect?: boolean;
  questionId?: number;
  isDeleted?: boolean;
}

export interface Form {
  id?: number;
  formName?: string;
  formDesc?: string;
  isActive?: boolean;
  campaignId?: number;
  isDeleted?: boolean;
}

export interface FormVersion {
  id?: number;
  versionNumber?: number;
  isPublished?: boolean;
  isLocked?: boolean;
  formId?: number;
  isDeleted?: boolean;
}

export interface FormQuestions {
  id?: number;
  questionOrder?: number;
  chronoOverride?: number;
  formVersionId?: number;
  questionId?: number;
  isDeleted?: boolean;
}

export interface LoginCredentials {
  email: string; // email ou username
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    userRole: string;
    adminMode?: boolean;
    isDefaultPassword?: boolean;
  };
}

// ── Dependency check (FK management) ─────────
export interface DependencyGroup {
  entityType: string;
  label: string;
  count: number;
  critical: boolean;
}

export interface DeletedParent {
  entityType: string;
  label: string;
  parentId: number;
  parentName: string;
}

export interface DependencyInfo {
  entityType: string;
  entityId: number;
  level: 'NORMAL' | 'WARNING' | 'CRITICAL';
  totalDependencies: number;
  dependencies: DependencyGroup[];
  deletedParents: DeletedParent[];
}
