import type { Node } from '@xyflow/react'
import type { EntityNodeData } from '../../types'

export type HandleKind = 'source' | 'target'

export type NodeById = Map<string, Node> | ((id: string) => Node | undefined)

export interface EdgeAnchorItem {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
}

const SOURCE_HANDLES = ['right', 'left', 'top', 'bottom']
const TARGET_HANDLES = ['left', 'right', 'top', 'bottom']

export function handleIdsOf(node: Node | undefined, kind: HandleKind): string[] {
  if (!node) return kind === 'source' ? SOURCE_HANDLES : TARGET_HANDLES
  const data = node.data as unknown as EntityNodeData
  const isRuleNode = data.variant === 'mct-operation' || data.variant === 'mct-syncop'
  if (isRuleNode && data.emissionRules?.length) {
    if (kind === 'source') return [...data.emissionRules]
    return ['top']
  }
  return kind === 'source' ? SOURCE_HANDLES : TARGET_HANDLES
}

export function firstHandleId(node: Node | undefined, kind: HandleKind): string | undefined {
  return handleIdsOf(node, kind)[0]
}

export function resolveHandleId(
  node: Node | undefined,
  kind: HandleKind,
  declared: string | null | undefined,
): string | undefined {
  return declared || firstHandleId(node, kind)
}

function lookupNode(nodeById: NodeById, id: string): Node | undefined {
  return nodeById instanceof Map ? nodeById.get(id) : nodeById(id)
}

export function edgeAnchorGroup(
  edges: EdgeAnchorItem[],
  nodeById: NodeById,
  side: 'from' | 'to',
  nodeId: string,
  handleId: string | undefined,
): string[] {
  const nodeKey = side === 'from' ? 'source' : 'target'
  const handleKey = side === 'from' ? 'sourceHandle' : 'targetHandle'
  const kind: HandleKind = side === 'from' ? 'source' : 'target'

  const group: string[] = []
  for (const e of edges) {
    if (e[nodeKey] !== nodeId) continue
    const resolved = resolveHandleId(lookupNode(nodeById, e[nodeKey]), kind, e[handleKey])
    if (resolved !== handleId) continue
    group.push(e.id)
  }
  return group
}

const NODE_W_FALLBACK = 220
const NODE_H_FALLBACK = 130

export function farAnchorPoint(
  nodeById: NodeById,
  side: 'from' | 'to',
  edge: EdgeAnchorItem,
): { x: number; y: number } {
  const nodeKey = side === 'from' ? 'target' : 'source'
  const handleKey = side === 'from' ? 'targetHandle' : 'sourceHandle'
  const kind: HandleKind = side === 'from' ? 'target' : 'source'

  const node = lookupNode(nodeById, edge[nodeKey])
  if (!node) return { x: 0, y: 0 }
  const pos = node.position ?? { x: 0, y: 0 }
  const w = node.measured?.width ?? NODE_W_FALLBACK
  const h = node.measured?.height ?? NODE_H_FALLBACK
  const cx = pos.x + w / 2
  const cy = pos.y + h / 2
  const anchor = resolveHandleId(node, kind, edge[handleKey])
  switch (anchor) {
    case 'top':
      return { x: cx, y: pos.y }
    case 'bottom':
      return { x: cx, y: pos.y + h }
    case 'left':
      return { x: pos.x, y: cy }
    case 'right':
      return { x: pos.x + w, y: cy }
    default:
      return { x: cx, y: cy }
  }
}

export function edgeGroupSorted(
  edges: EdgeAnchorItem[],
  nodeById: NodeById,
  side: 'from' | 'to',
  nodeId: string,
  handleId: string | undefined,
): string[] {
  const group = edgeAnchorGroup(edges, nodeById, side, nodeId, handleId)
  const sortByY = handleId === 'left' || handleId === 'right'
  const coord = (edgeId: string) => {
    const edge = edges.find((e) => e.id === edgeId)
    const point = edge ? farAnchorPoint(nodeById, side, edge) : { x: 0, y: 0 }
    return sortByY ? point.y : point.x
  }
  const reflexive = new Set(edges.filter((e) => e.source === e.target).map((e) => e.id))
  const sorted = [...group].sort((a, b) => {
    const aRefl = reflexive.has(a) ? 1 : 0
    const bRefl = reflexive.has(b) ? 1 : 0
    if (aRefl !== bRefl) return aRefl - bRefl
    return coord(a) - coord(b)
  })
  return sorted
}

export function edgePathOffset(
  edges: EdgeAnchorItem[],
  nodeById: NodeById,
  side: 'from' | 'to',
  nodeId: string,
  handleId: string | undefined,
  edgeId: string,
): number {
  const group = edgeGroupSorted(edges, nodeById, side, nodeId, handleId)
  if (group.length <= 1) return 0

  const idx = group.indexOf(edgeId)
  if (idx === -1) return 0

  const baseUnit = 28
  const totalSpread = (group.length + 1) * baseUnit
  const gap = totalSpread / (group.length + 1)
  return (idx + 1) * gap - totalSpread / 2
}