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

export function edgePathOffset(
  edges: EdgeAnchorItem[],
  nodeById: NodeById,
  side: 'from' | 'to',
  nodeId: string,
  handleId: string | undefined,
  edgeId: string,
): number {
  const group = edgeAnchorGroup(edges, nodeById, side, nodeId, handleId)
  if (group.length <= 1) return 0

  const idx = group.indexOf(edgeId)
  if (idx === -1) return 0

  const baseUnit = 28
  const totalSpread = (group.length + 1) * baseUnit
  const gap = totalSpread / (group.length + 1)
  return (idx + 1) * gap - totalSpread / 2
}