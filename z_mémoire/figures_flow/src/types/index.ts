import type { Node, Edge } from '@xyflow/react'

export type Variant = 'mcd' | 'mld' | 'mpd'

export interface Attribute {
  name: string
  type?: string
  isPK?: boolean
  isFK?: boolean
  isNew?: boolean
  isDeleted?: boolean
  description?: string
}

export interface EntityNodeData {
  label: string
  variant: Variant
  attributes: Attribute[]
  color?: string
  badge?: string
}

export type EntityNode = Node<EntityNodeData, 'entity'>

export interface RelationshipEdgeData {
  label?: string
  cardFrom?: string
  cardTo?: string
  isStrong?: boolean
  isDashed?: boolean
}

export type RelationshipEdge = Edge<RelationshipEdgeData>

export interface DiagramDefinition {
  id: string
  title: string
  category: Variant
  domain: string
  nodes: EntityNode[]
  edges: RelationshipEdge[]
}
