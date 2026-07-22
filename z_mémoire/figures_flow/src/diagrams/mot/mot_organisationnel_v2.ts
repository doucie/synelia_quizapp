import type { DiagramDefinition } from '../../types'
import { mct1aCandidature } from '../traitements/mct_1a_candidature'
import { mct1bQuiz } from '../traitements/mct_1b_quiz'
import { mct2EntretienEvaluation } from '../traitements/mct_2_entretien_evaluation'
import { mct3aDecision } from '../traitements/mct_3a_decision'
import { mct3bRollback } from '../traitements/mct_3b_rollback'
import { mct3cAudit } from '../traitements/mct_3c_audit'

const COL_CANDIDAT = 0
const COL_RECRUTEUR = 900
const COL_SYSTEME = 1800

const ROW_T1 = 0
const ROW_T2 = 700
const ROW_T3 = 1400
const ROW_T4 = 2100
const ROW_T5 = 2800
const ROW_T6 = 3500

function prefixNodes(nodes: ReturnType<typeof mct1aCandidature>['nodes'], prefix: string, offsetX: number, offsetY: number) {
  return nodes.map((n) => ({
    ...n,
    id: `${prefix}${n.id}`,
    position: { x: n.position.x + offsetX, y: n.position.y + offsetY },
  }))
}

function prefixEdges(edges: ReturnType<typeof mct1aCandidature>['edges'], prefix: string) {
  return edges.map((e) => ({
    ...e,
    id: `${prefix}${e.id}`,
    source: `${prefix}${e.source}`,
    target: `${prefix}${e.target}`,
  }))
}

const t1Nodes = prefixNodes(mct1aCandidature.nodes, 'mot-t1-', COL_CANDIDAT, ROW_T1)
const t1Edges = prefixEdges(mct1aCandidature.edges, 'mot-t1-')

const t2Nodes = prefixNodes(mct1bQuiz.nodes, 'mot-t2-', COL_CANDIDAT, ROW_T2)
const t2Edges = prefixEdges(mct1bQuiz.edges, 'mot-t2-')

const t3Nodes = prefixNodes(mct2EntretienEvaluation.nodes, 'mot-t3-', COL_RECRUTEUR, ROW_T3)
const t3Edges = prefixEdges(mct2EntretienEvaluation.edges, 'mot-t3-')

const t4Nodes = prefixNodes(mct3aDecision.nodes, 'mot-t4-', COL_RECRUTEUR, ROW_T4)
const t4Edges = prefixEdges(mct3aDecision.edges, 'mot-t4-')

const t5Nodes = prefixNodes(mct3bRollback.nodes, 'mot-t5-', COL_RECRUTEUR, ROW_T5)
const t5Edges = prefixEdges(mct3bRollback.edges, 'mot-t5-')

const t6Nodes = prefixNodes(mct3cAudit.nodes, 'mot-t6-', COL_SYSTEME, ROW_T6)
const t6Edges = prefixEdges(mct3cAudit.edges, 'mot-t6-')

const headerNodes = [
  { id: 'mot-h-candidat', type: 'process' as const, position: { x: COL_CANDIDAT + 300, y: -80 }, data: { variant: 'sat-head' as const, label: 'Candidat' } },
  { id: 'mot-h-recruteur', type: 'process' as const, position: { x: COL_RECRUTEUR + 300, y: -80 }, data: { variant: 'sat-head' as const, label: 'Recruteur' } },
  { id: 'mot-h-systeme', type: 'process' as const, position: { x: COL_SYSTEME + 300, y: -80 }, data: { variant: 'sat-head' as const, label: 'Système' } },
]

export const MOT_MCT_MAP = [
  { prefix: 'mot-t1-', originalDiagramId: 'mct-1a-candidature', offsetX: COL_CANDIDAT, offsetY: ROW_T1, label: 'T1 — Soumettre la candidature' },
  { prefix: 'mot-t2-', originalDiagramId: 'mct-1b-quiz', offsetX: COL_CANDIDAT, offsetY: ROW_T2, label: 'T2 — Répondre au quiz' },
  { prefix: 'mot-t3-', originalDiagramId: 'mct-2-entretien-evaluation', offsetX: COL_RECRUTEUR, offsetY: ROW_T3, label: 'T3 — Conduire et évaluer l\'entretien' },
  { prefix: 'mot-t4-', originalDiagramId: 'mct-3a-decision', offsetX: COL_RECRUTEUR, offsetY: ROW_T4, label: 'T4 — Valider la décision du recruteur' },
  { prefix: 'mot-t5-', originalDiagramId: 'mct-3b-rollback', offsetX: COL_RECRUTEUR, offsetY: ROW_T5, label: 'T5 — Gérer la demande d\'annulation' },
  { prefix: 'mot-t6-', originalDiagramId: 'mct-3c-audit', offsetX: COL_SYSTEME, offsetY: ROW_T6, label: 'T6 — Journaliser audit_event' },
]

const allMotNodes = [...headerNodes, ...t1Nodes, ...t2Nodes, ...t3Nodes, ...t4Nodes, ...t5Nodes, ...t6Nodes]

export function getMotOriginalPositions(): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {}
  for (const n of allMotNodes) {
    positions[n.id] = { x: n.position.x, y: n.position.y }
  }
  return positions
}

export const motOrganisationnelV2: DiagramDefinition = {
  id: 'mot-organisationnel-v2',
  title: 'MOT — Modèle Organisationnel de Traitement',
  category: 'mot',
  domain: 'MOT — Matrice acteurs × traitements',
  nodes: [
    ...headerNodes,
    ...t1Nodes, ...t2Nodes,
    ...t3Nodes, ...t4Nodes, ...t5Nodes,
    ...t6Nodes,
  ],
  edges: [
    ...t1Edges, ...t2Edges,
    ...t3Edges, ...t4Edges, ...t5Edges,
    ...t6Edges,
  ],
}
