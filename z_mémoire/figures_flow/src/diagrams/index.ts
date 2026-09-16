import type { DiagramDefinition } from '../types'

// === Nouveaux MCD ===
import { utilisateursDroits as mcdUtilDroits } from './nouveau/mcd/utilisateurs_droits'
import { campagnesPipeline as mcdCampPipeline } from './nouveau/mcd/campagnes_pipeline'
import { candidaturesSuivi as mcdCandSuivi } from './nouveau/mcd/candidatures_suivi'
import { entretiensEvaluation as mcdEntretEval } from './nouveau/mcd/entretiens_evaluation'

// === Nouveaux MLD ===
import { utilisateursDroits as mldUtilDroits } from './nouveau/mld/utilisateurs_droits'
import { campagnesPipeline as mldCampPipeline } from './nouveau/mld/campagnes_pipeline'
import { candidaturesSuivi as mldCandSuivi } from './nouveau/mld/candidatures_suivi'
import { entretiensEvaluation as mldEntretEval } from './nouveau/mld/entretiens_evaluation'

// === Nouveaux MPD ===
import { utilisateursDroits as mpdUtilDroits } from './nouveau/mpd/utilisateurs_droits'
import { campagnesPipeline as mpdCampPipeline } from './nouveau/mpd/campagnes_pipeline'
import { candidaturesSuivi as mpdCandSuivi } from './nouveau/mpd/candidatures_suivi'
import { entretiensEvaluation as mpdEntretEval } from './nouveau/mpd/entretiens_evaluation'

// === Traitements v2 ===
import { mct0CreationCampagne } from './traitements/v2/mct_0_creation_campagne'
import { mct1Candidature } from './traitements/v2/mct_1_candidature'
import { mct2Quiz } from './traitements/v2/mct_2_quiz'
import { mct3Entretien } from './traitements/v2/mct_3_entretien'
import { mct4Decision } from './traitements/v2/mct_4_decision'
import { mct5Annulation } from './traitements/v2/mct_5_annulation'
import { mct6Audit } from './traitements/v2/mct_6_audit'

// === MOT ===
import { motOrganisationnelV2 } from './mot/mot_organisationnel_v2'

// === Palette ===
import { colorPalette } from './palette/color_palette'

// === Archive (anciens diagrammes) ===
import { identitePermissions as archMcdIdentite } from './archive/mcd_identite_permissions'
import { campagnesPipeline as archMcdCamp } from './archive/mcd_campagnes_pipeline'
import { candidatureQuiz as archMcdCand } from './archive/mcd_candidature_quiz'
import { entretienEvaluation as archMcdEntret } from './archive/mcd_entretien_evaluation'
import { auditNotifications as archMcdAudit } from './archive/mcd_audit_notifications'
import { communication as archMcdComm } from './archive/mcd_communication'
import { configSysteme as archMcdConfSys } from './archive/mcd_config_systeme'

import { identitePermissions as archMldIdentite } from './archive/mld_identite_permissions'
import { campagnesPipeline as archMldCamp } from './archive/mld_campagnes_pipeline'
import { candidatureQuiz as archMldCand } from './archive/mld_candidature_quiz'
import { entretienEvaluation as archMldEntret } from './archive/mld_entretien_evaluation'
import { auditNotifications as archMldAudit } from './archive/mld_audit_notifications'
import { communication as archMldComm } from './archive/mld_communication'
import { configSysteme as archMldConfSys } from './archive/mld_config_systeme'

import { identitePermissions as archMpdIdentite } from './archive/mpd_identite_permissions'
import { campagnesPipeline as archMpdCamp } from './archive/mpd_campagnes_pipeline'
import { candidatureQuiz as archMpdCand } from './archive/mpd_candidature_quiz'
import { entretienEvaluation as archMpdEntret } from './archive/mpd_entretien_evaluation'
import { auditNotifications as archMpdAudit } from './archive/mpd_audit_notifications'
import { communication as archMpdComm } from './archive/mpd_communication'
import { configSysteme as archMpdConfSys } from './archive/mpd_config_systeme'

import { mct0bCreationCampagne as archMct0b } from './archive/mct_0b_creation_campagne'
import { mct1CandidatureQuiz as archMct1 } from './archive/mct_1_candidature_quiz'
import { mct1aCandidature as archMct1a } from './archive/mct_1a_candidature'
import { mct1bQuiz as archMct1b } from './archive/mct_1b_quiz'
import { mct2EntretienEvaluation as archMct2 } from './archive/mct_2_entretien_evaluation'
import { mct3DecisionAudit as archMct3 } from './archive/mct_3_decision_audit'
import { mct3aDecision as archMct3a } from './archive/mct_3a_decision'
import { mct3bRollback as archMct3b } from './archive/mct_3b_rollback'
import { mct3cAudit as archMct3c } from './archive/mct_3c_audit'
import { sat1SetupPreselection as archSat1 } from './archive/sat_1_setup_preselection'
import { sat2EntretienAudit as archSat2 } from './archive/sat_2_entretien_audit'
import { mpt1CandidatureQuiz as archMpt1 } from './archive/mpt_1_candidature_quiz'
import { mpt2EntretienDecision as archMpt2 } from './archive/mpt_2_entretien_decision'

export const diagrams: DiagramDefinition[] = [
  // --- Nouveaux MCD (4) ---
  mcdUtilDroits,
  mcdCampPipeline,
  mcdCandSuivi,
  mcdEntretEval,

  // --- Nouveaux MLD (4) ---
  mldUtilDroits,
  mldCampPipeline,
  mldCandSuivi,
  mldEntretEval,

  // --- Nouveaux MPD (4) ---
  mpdUtilDroits,
  mpdCampPipeline,
  mpdCandSuivi,
  mpdEntretEval,

  // --- Traitements v2 (7) ---
  mct0CreationCampagne,
  mct1Candidature,
  mct2Quiz,
  mct3Entretien,
  mct4Decision,
  mct5Annulation,
  mct6Audit,

  // --- MOT (1) ---
  motOrganisationnelV2,

  // --- Palette (1) ---
  colorPalette,

  // --- Archive (34) ---
  archMcdIdentite,
  archMcdCamp,
  archMcdCand,
  archMcdEntret,
  archMcdAudit,
  archMcdComm,
  archMcdConfSys,
  archMldIdentite,
  archMldCamp,
  archMldCand,
  archMldEntret,
  archMldAudit,
  archMldComm,
  archMldConfSys,
  archMpdIdentite,
  archMpdCamp,
  archMpdCand,
  archMpdEntret,
  archMpdAudit,
  archMpdComm,
  archMpdConfSys,
  archMct0b,
  archMct1,
  archMct1a,
  archMct1b,
  archMct2,
  archMct3,
  archMct3a,
  archMct3b,
  archMct3c,
  archSat1,
  archSat2,
  archMpt1,
  archMpt2,
]

export type DiagramId = (typeof diagrams)[number]['id']

export function getDiagram(id: string): DiagramDefinition | undefined {
  return diagrams.find((d) => d.id === id)
}

export function getDiagramsByCategory(category: string): DiagramDefinition[] {
  return diagrams.filter((d) => d.category === category)
}
