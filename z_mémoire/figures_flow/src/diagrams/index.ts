import type { DiagramDefinition } from '../types'

// === Nouveaux MCD ===
import { utilisateursDroits as mcdUtilDroits } from './nouveau/mcd/utilisateurs_droits'
import { campagnesPipeline as mcdCampPipeline } from './nouveau/mcd/campagnes_pipeline'
import { candidaturesSuivi as mcdCandSuivi } from './nouveau/mcd/candidatures_suivi'
import { entretiensEvaluation as mcdEntretEval } from './nouveau/mcd/entretiens_evaluation'
import { structureConfiguration as mcdStructConfig } from './nouveau/mcd/structure_configuration'

// === Nouveaux MLD ===
import { utilisateursDroits as mldUtilDroits } from './nouveau/mld/utilisateurs_droits'
import { campagnesPipeline as mldCampPipeline } from './nouveau/mld/campagnes_pipeline'
import { candidaturesSuivi as mldCandSuivi } from './nouveau/mld/candidatures_suivi'
import { entretiensEvaluation as mldEntretEval } from './nouveau/mld/entretiens_evaluation'
import { structureConfiguration as mldStructConfig } from './nouveau/mld/structure_configuration'

// === Nouveaux MPD ===
import { campagnesCandidatures as mpdCampCand } from './nouveau/mpd/campagnes_candidatures'
import { entretiensUtilisateurs as mpdEntretUtil } from './nouveau/mpd/entretiens_utilisateurs'

// === Nouveaux MPD — vue script SQL ===
import { scriptCampagnes as mpdSqlCamp } from './nouveau/mpd_sql/script_campagnes'
import { scriptEntretiens as mpdSqlEntret } from './nouveau/mpd_sql/script_entretiens'

// === Traitements v2 (figures de parcours) ===
import { mctParcours1, mctParcours2, mctParcours3, mctParcours4 } from './traitements/v2/mct_combine'

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

// MCT v2 individuels : plus lus isolément, mais ils restent la définition du
// modèle que les quatre figures de parcours assemblent (cf. `mct_combine.ts`).
import { mct0CreationCampagne as archV2T0 } from './archive/mct_0_creation_campagne'
import { mct1Candidature as archV2T1 } from './archive/mct_1_candidature'
import { mct2Quiz as archV2T2 } from './archive/mct_2_quiz'
import { mct3Planification as archV2T3 } from './archive/mct_3_planification'
import { mct4ConduiteEntretien as archV2T4 } from './archive/mct_4_conduite_entretien'
import { mct5Evaluation as archV2T5 } from './archive/mct_5_evaluation'
import { mct6Decision as archV2T6 } from './archive/mct_6_decision'
import { mct7Annulation as archV2T7 } from './archive/mct_7_annulation'
import { mct8Audit as archV2T8 } from './archive/mct_8_audit'
import { sat1SetupPreselection as archSat1 } from './archive/sat_1_setup_preselection'
import { sat2EntretienAudit as archSat2 } from './archive/sat_2_entretien_audit'
import { mpt1CandidatureQuiz as archMpt1 } from './archive/mpt_1_candidature_quiz'
import { mpt2EntretienDecision as archMpt2 } from './archive/mpt_2_entretien_decision'

export const diagrams: DiagramDefinition[] = [
  // --- Nouveaux MCD (5) ---
  mcdUtilDroits,
  mcdCampPipeline,
  mcdCandSuivi,
  mcdEntretEval,
  mcdStructConfig,

  // --- Nouveaux MLD (5) ---
  mldUtilDroits,
  mldCampPipeline,
  mldCandSuivi,
  mldEntretEval,
  mldStructConfig,

  // --- Nouveaux MPD (2) ---
  mpdCampCand,
  mpdEntretUtil,

  // --- Nouveaux MPD — script SQL (2) ---
  mpdSqlCamp,
  mpdSqlEntret,

  // --- Traitements v2 — figures de parcours (4) ---
  mctParcours1,
  mctParcours2,
  mctParcours3,
  mctParcours4,

  // --- MOT (1) ---
  motOrganisationnelV2,

  // --- Palette (1) ---
  colorPalette,

  // --- Archive (43) ---
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
  archV2T0,
  archV2T1,
  archV2T2,
  archV2T3,
  archV2T4,
  archV2T5,
  archV2T6,
  archV2T7,
  archV2T8,
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
