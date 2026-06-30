import type { DiagramDefinition } from '../types'

import { identitePermissions as mcdIdentitePermissions } from './mcd/identite_permissions'
import { identitePermissionsModerne as mcdIdentitePermissionsModerne } from './mcd/identite_permissions_moderne'
import { campagnesPipeline as mcdCampagnesPipeline } from './mcd/campagnes_pipeline'
import { candidatureQuiz as mcdCandidatureQuiz } from './mcd/candidature_quiz'
import { entretienEvaluation as mcdEntretienEvaluation } from './mcd/entretien_evaluation'
import { auditNotifications as mcdAuditNotifications } from './mcd/audit_notifications'

import { identitePermissions as mldIdentitePermissions } from './mld/identite_permissions'
import { campagnesPipeline as mldCampagnesPipeline } from './mld/campagnes_pipeline'
import { candidatureQuiz as mldCandidatureQuiz } from './mld/candidature_quiz'
import { entretienEvaluation as mldEntretienEvaluation } from './mld/entretien_evaluation'
import { auditNotifications as mldAuditNotifications } from './mld/audit_notifications'

import { identitePermissions as mpdIdentitePermissions } from './mpd/identite_permissions'
import { campagnesPipeline as mpdCampagnesPipeline } from './mpd/campagnes_pipeline'
import { candidatureQuiz as mpdCandidatureQuiz } from './mpd/candidature_quiz'
import { entretienEvaluation as mpdEntretienEvaluation } from './mpd/entretien_evaluation'
import { auditNotifications as mpdAuditNotifications } from './mpd/audit_notifications'

export const diagrams: DiagramDefinition[] = [
  mcdIdentitePermissions,
  mcdIdentitePermissionsModerne,
  mcdCampagnesPipeline,
  mcdCandidatureQuiz,
  mcdEntretienEvaluation,
  mcdAuditNotifications,
  mldIdentitePermissions,
  mldCampagnesPipeline,
  mldCandidatureQuiz,
  mldEntretienEvaluation,
  mldAuditNotifications,
  mpdIdentitePermissions,
  mpdCampagnesPipeline,
  mpdCandidatureQuiz,
  mpdEntretienEvaluation,
  mpdAuditNotifications,
]

export type DiagramId = (typeof diagrams)[number]['id']

export function getDiagram(id: string): DiagramDefinition | undefined {
  return diagrams.find((d) => d.id === id)
}

export function getDiagramsByCategory(category: string): DiagramDefinition[] {
  return diagrams.filter((d) => d.category === category)
}
