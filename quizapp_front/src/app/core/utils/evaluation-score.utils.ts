import { EvaluationItem } from '../services/evaluation.service';

export function isScoreCriterion(item: EvaluationItem): boolean {
  if (item.criterionType === 'TEXT') {
    return false;
  }
  return (item.maxScoreSnapshot !== undefined && item.maxScoreSnapshot !== null) || item.criterionType === 'SCORE';
}

export function hasDerivedCandidateMark(items: EvaluationItem[]): boolean {
  return items.some(item => isScoreCriterion(item)
    && item.maxScoreSnapshot !== undefined
    && item.maxScoreSnapshot !== null
    && item.maxScoreSnapshot > 0);
}

export function deriveCandidateMark(items: EvaluationItem[]): number | null {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  items.forEach(item => {
    if (!isScoreCriterion(item)
      || item.scoreValue === undefined
      || item.scoreValue === null
      || item.maxScoreSnapshot === undefined
      || item.maxScoreSnapshot === null
      || item.maxScoreSnapshot <= 0) {
      return;
    }

    const weight = item.weightSnapshot !== undefined && item.weightSnapshot !== null && item.weightSnapshot > 0
      ? item.weightSnapshot
      : 1;
    const normalizedScore = Math.max(0, Math.min(1, item.scoreValue / item.maxScoreSnapshot));
    totalWeightedScore += normalizedScore * weight;
    totalWeight += weight;
  });

  if (totalWeight <= 0) {
    return null;
  }

  return Math.round((totalWeightedScore / totalWeight) * 100);
}

export function resolveCandidateMark(items: EvaluationItem[], fallbackMark?: number | null): number | null {
  const derivedCandidateMark = deriveCandidateMark(items);
  if (derivedCandidateMark !== null) {
    return derivedCandidateMark;
  }
  return fallbackMark ?? null;
}

export function getEvaluationItemLabel(item: EvaluationItem): string {
  if (item.label?.trim()) {
    return item.label.trim();
  }
  if (item.criterionOrder !== undefined && item.criterionOrder !== null) {
    return `Critere ${item.criterionOrder}`;
  }
  return 'Critere';
}

export function formatEvaluationItemValue(item: EvaluationItem): string {
  if (item.scoreValue !== undefined && item.scoreValue !== null) {
    const maxScore = item.maxScoreSnapshot;
    return maxScore !== undefined && maxScore !== null
      ? `${item.scoreValue}/${maxScore}`
      : `${item.scoreValue}`;
  }
  if (item.textValue?.trim()) {
    return item.textValue.trim();
  }
  return 'Sans valeur';
}

export function getEvaluationItemNote(item: EvaluationItem): string | null {
  if (item.scoreValue === undefined || item.scoreValue === null) {
    return null;
  }
  return item.textValue?.trim() || null;
}