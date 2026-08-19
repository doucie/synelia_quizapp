import type { DiagramDefinition, MotTableConfig } from '../../types'
import { DEFAULT_MOT_TABLE_CONFIG } from '../../types'
import { mct0bCreationCampagne } from '../archive/mct_0b_creation_campagne'
import { mct1aCandidature } from '../archive/mct_1a_candidature'
import { mct1bQuiz } from '../archive/mct_1b_quiz'
import { mct2EntretienEvaluation } from '../archive/mct_2_entretien_evaluation'
import { mct3aDecision } from '../archive/mct_3a_decision'
import { mct3bRollback } from '../archive/mct_3b_rollback'
import { mct3cAudit } from '../archive/mct_3c_audit'

export interface MotPositions {
  colCandidat: number
  colRecruteur: number
  colSysteme: number
  rowT0: number
  rowT1: number
  rowT2: number
  rowT3: number
  rowT4: number
  rowT5: number
  rowT6: number
}

export function getMotPositionsFromConfig(config: MotTableConfig = DEFAULT_MOT_TABLE_CONFIG): MotPositions {
  const c = config.colWidths
  const r = config.rowHeights
  return {
    colCandidat: c.temps + c.recruteur,
    colRecruteur: c.temps,
    colSysteme: c.temps + c.recruteur + c.candidat,
    rowT0: 0,
    rowT1: r[0] ?? 400,
    rowT2: (r[0] ?? 400) + (r[1] ?? 400),
    rowT3: (r[0] ?? 400) + (r[1] ?? 400) + (r[2] ?? 400),
    rowT4: (r[0] ?? 400) + (r[1] ?? 400) + (r[2] ?? 400) + (r[3] ?? 400),
    rowT5: (r[0] ?? 400) + (r[1] ?? 400) + (r[2] ?? 400) + (r[3] ?? 400) + (r[4] ?? 400),
    rowT6: (r[0] ?? 400) + (r[1] ?? 400) + (r[2] ?? 400) + (r[3] ?? 400) + (r[4] ?? 400) + (r[5] ?? 400),
  }
}

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

export function getMotMctMap(config: MotTableConfig = DEFAULT_MOT_TABLE_CONFIG) {
  const pos = getMotPositionsFromConfig(config)
  return [
    { prefix: 'mot-t0-', originalDiagramId: 'mct-0b-creation-campagne', offsetX: pos.colRecruteur, offsetY: pos.rowT0, label: 'T0 — Créer la campagne' },
    { prefix: 'mot-t1-', originalDiagramId: 'mct-1a-candidature', offsetX: pos.colCandidat, offsetY: pos.rowT1, label: 'T1 — Soumettre la candidature' },
    { prefix: 'mot-t2-', originalDiagramId: 'mct-1b-quiz', offsetX: pos.colCandidat, offsetY: pos.rowT2, label: 'T2 — Répondre au quiz' },
    { prefix: 'mot-t3-', originalDiagramId: 'mct-2-entretien-evaluation', offsetX: pos.colRecruteur, offsetY: pos.rowT3, label: 'T3 — Conduire et évaluer l\'entretien' },
    { prefix: 'mot-t4-', originalDiagramId: 'mct-3a-decision', offsetX: pos.colRecruteur, offsetY: pos.rowT4, label: 'T4 — Valider la décision du recruteur' },
    { prefix: 'mot-t5-', originalDiagramId: 'mct-3b-rollback', offsetX: pos.colRecruteur, offsetY: pos.rowT5, label: 'T5 — Gérer la demande d\'annulation' },
    { prefix: 'mot-t6-', originalDiagramId: 'mct-3c-audit', offsetX: pos.colSysteme, offsetY: pos.rowT6, label: 'T6 — Journaliser audit_event' },
  ]
}

export function getMotAllNodes(config: MotTableConfig = DEFAULT_MOT_TABLE_CONFIG) {
  const pos = getMotPositionsFromConfig(config)
  const t0Nodes = prefixNodes(mct0bCreationCampagne.nodes, 'mot-t0-', pos.colRecruteur, pos.rowT0)
  const t1Nodes = prefixNodes(mct1aCandidature.nodes, 'mot-t1-', pos.colCandidat, pos.rowT1)
  const t2Nodes = prefixNodes(mct1bQuiz.nodes, 'mot-t2-', pos.colCandidat, pos.rowT2)
  const t3Nodes = prefixNodes(mct2EntretienEvaluation.nodes, 'mot-t3-', pos.colRecruteur, pos.rowT3)
  const t4Nodes = prefixNodes(mct3aDecision.nodes, 'mot-t4-', pos.colRecruteur, pos.rowT4)
  const t5Nodes = prefixNodes(mct3bRollback.nodes, 'mot-t5-', pos.colRecruteur, pos.rowT5)
  const t6Nodes = prefixNodes(mct3cAudit.nodes, 'mot-t6-', pos.colSysteme, pos.rowT6)
  return [...t0Nodes, ...t1Nodes, ...t2Nodes, ...t3Nodes, ...t4Nodes, ...t5Nodes, ...t6Nodes]
}

export function getMotOriginalPositions(config: MotTableConfig = DEFAULT_MOT_TABLE_CONFIG): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {}
  for (const n of getMotAllNodes(config)) {
    positions[n.id] = { x: n.position.x, y: n.position.y }
  }
  return positions
}

const defaultPos = getMotPositionsFromConfig()
const t0Nodes = prefixNodes(mct0bCreationCampagne.nodes, 'mot-t0-', defaultPos.colRecruteur, defaultPos.rowT0)
const t0Edges = prefixEdges(mct0bCreationCampagne.edges, 'mot-t0-')
const t1Nodes = prefixNodes(mct1aCandidature.nodes, 'mot-t1-', defaultPos.colCandidat, defaultPos.rowT1)
const t1Edges = prefixEdges(mct1aCandidature.edges, 'mot-t1-')
const t2Nodes = prefixNodes(mct1bQuiz.nodes, 'mot-t2-', defaultPos.colCandidat, defaultPos.rowT2)
const t2Edges = prefixEdges(mct1bQuiz.edges, 'mot-t2-')
const t3Nodes = prefixNodes(mct2EntretienEvaluation.nodes, 'mot-t3-', defaultPos.colRecruteur, defaultPos.rowT3)
const t3Edges = prefixEdges(mct2EntretienEvaluation.edges, 'mot-t3-')
const t4Nodes = prefixNodes(mct3aDecision.nodes, 'mot-t4-', defaultPos.colRecruteur, defaultPos.rowT4)
const t4Edges = prefixEdges(mct3aDecision.edges, 'mot-t4-')
const t5Nodes = prefixNodes(mct3bRollback.nodes, 'mot-t5-', defaultPos.colRecruteur, defaultPos.rowT5)
const t5Edges = prefixEdges(mct3bRollback.edges, 'mot-t5-')
const t6Nodes = prefixNodes(mct3cAudit.nodes, 'mot-t6-', defaultPos.colSysteme, defaultPos.rowT6)
const t6Edges = prefixEdges(mct3cAudit.edges, 'mot-t6-')

export const MOT_MCT_MAP = getMotMctMap()

export const motOrganisationnelV2: DiagramDefinition = {
  id: 'mot-organisationnel-v2',
  title: 'MOT — Modèle Organisationnel de Traitement',
  category: 'mot',
  domain: 'MOT — Matrice acteurs × traitements',
  nodes: [
    ...t0Nodes,
    ...t1Nodes, ...t2Nodes,
    ...t3Nodes, ...t4Nodes, ...t5Nodes,
    ...t6Nodes,
  ],
  edges: [
    ...t0Edges,
    ...t1Edges, ...t2Edges,
    ...t3Edges, ...t4Edges, ...t5Edges,
    ...t6Edges,
  ],
}
