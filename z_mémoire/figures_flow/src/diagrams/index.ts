import type { DiagramDefinition } from '../types'

import { identitePermissions as mcdIdentitePermissions } from './mcd/identite_permissions'
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

import { mct0bCreationCampagne } from './traitements/mct_0b_creation_campagne'
import { mct1CandidatureQuiz } from './traitements/mct_1_candidature_quiz'
import { mct1aCandidature } from './traitements/mct_1a_candidature'
import { mct1bQuiz } from './traitements/mct_1b_quiz'
import { mct2EntretienEvaluation } from './traitements/mct_2_entretien_evaluation'
import { mct3DecisionAudit } from './traitements/mct_3_decision_audit'
import { mct3aDecision } from './traitements/mct_3a_decision'
import { mct3bRollback } from './traitements/mct_3b_rollback'
import { mct3cAudit } from './traitements/mct_3c_audit'
import { sat1SetupPreselection } from './traitements/sat_1_setup_preselection'
import { sat2EntretienAudit } from './traitements/sat_2_entretien_audit'
import { mpt1CandidatureQuiz } from './traitements/mpt_1_candidature_quiz'
import { mpt2EntretienDecision } from './traitements/mpt_2_entretien_decision'

import { motOrganisationnel } from './mot/mot_organisationnel'
import { motOrganisationnelV2 } from './mot/mot_organisationnel_v2'

import { colorPalette } from './palette/color_palette'

export const diagrams: DiagramDefinition[] = [
  mcdIdentitePermissions,
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
  mct0bCreationCampagne,
  mct1CandidatureQuiz,
  mct1aCandidature,
  mct1bQuiz,
  mct2EntretienEvaluation,
  mct3DecisionAudit,
  mct3aDecision,
  mct3bRollback,
  mct3cAudit,
  sat1SetupPreselection,
  sat2EntretienAudit,
  mpt1CandidatureQuiz,
  mpt2EntretienDecision,
  motOrganisationnel,
  motOrganisationnelV2,
  colorPalette,
]

export type DiagramId = (typeof diagrams)[number]['id']

export function getDiagram(id: string): DiagramDefinition | undefined {
  return diagrams.find((d) => d.id === id)
}

export function getDiagramsByCategory(category: string): DiagramDefinition[] {
  return diagrams.filter((d) => d.category === category)
}
