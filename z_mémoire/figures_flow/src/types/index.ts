import type { Node, Edge } from '@xyflow/react'

export type Category = 'mcd' | 'mld' | 'mpd' | 'traitements' | 'archive' | 'palette' | 'mot'

export type ProcessVariant = 'mct-event' | 'mct-sync' | 'mct-syncop' | 'mct-operation' | 'mct-result' | 'sat-task' | 'sat-phase' | 'sat-head' | 'sat-lane' | 'mpt-layer' | 'mot-matrix'

export type Variant = 'mcd' | 'mld' | 'mpd' | ProcessVariant

export interface Attribute {
  name: string
  type?: string
  isPK?: boolean
  isFK?: boolean
  isNew?: boolean
  isDeleted?: boolean
  description?: string
}

export interface MotTreatmentData {
  id: string
  label: string
  nature: string
  actor: string
  triggeringEvent: string
  mctEvents: string[]
  mctSync: string
  mctOperation: { label: string, items: string[], rules: string[] }
  mctResults: Array<{ label: string, rule: string, fail?: boolean }>
}

export interface EntityNodeData {
  label: string
  variant: Variant
  attributes?: Attribute[]
  color?: string
  badge?: string
  syncLabel?: string
  items?: string[]
  emissionRules?: string[]
  rule?: string
  meta?: string
  detail?: string
  expression?: string
  fail?: boolean
  layer?: string
  dimensions?: { width: number; height: number }
  motMatrix?: { columns: string[], treatments: MotTreatmentData[] }
}

export type EntityNode = Node<EntityNodeData, 'entity'>

export interface RelationshipEdgeData {
  label?: string
  cardFrom?: string
  cardTo?: string
  cardFromSide?: 'source' | 'left' | 'right' | 'top' | 'bottom'
  cardToSide?: 'source' | 'left' | 'right' | 'top' | 'bottom'
  isStrong?: boolean
  isDashed?: boolean
  diagramId?: string
}

export type RelationshipEdge = Edge<RelationshipEdgeData>

export type ProcessEdgeData = RelationshipEdgeData

export type ProcessEdge = Edge<ProcessEdgeData>

export interface MotTableConfig {
  colWidths: { temps: number; recruteur: number; candidat: number; systeme: number; type: number }
  rowHeights: number[]
  fontScale: number
  mctFontScales: { event: number; operation: number; result: number; sync: number }
}

export const DEFAULT_MOT_TABLE_CONFIG: MotTableConfig = {
  colWidths: { temps: 150, recruteur: 600, candidat: 600, systeme: 600, type: 150 },
  rowHeights: [400, 400, 400, 400, 400, 400, 400],
  fontScale: 1.0,
  mctFontScales: { event: 1.0, operation: 1.0, result: 1.0, sync: 1.0 },
}

export interface DiagramDefinition {
  id: string
  title: string
  category: Category
  domain: string
  nodes: EntityNode[]
  edges: RelationshipEdge[]
}
