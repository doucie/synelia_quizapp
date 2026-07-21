import type { Node, Edge } from '@xyflow/react'

export type Category = 'mcd' | 'mld' | 'mpd' | 'traitements' | 'reference' | 'palette' | 'mot'

export type ProcessVariant = 'mct-event' | 'mct-sync' | 'mct-operation' | 'mct-result' | 'sat-task' | 'sat-phase' | 'sat-head' | 'sat-lane' | 'mpt-layer' | 'mot-matrix'

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

export interface DiagramDefinition {
  id: string
  title: string
  category: Category
  domain: string
  nodes: EntityNode[]
  edges: RelationshipEdge[]
}
