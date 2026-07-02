import type { Node } from '@xyflow/react'
import type { EntityNodeData, ProcessVariant } from '../types'

const SAFE_HUES = [
  15, 225, 330, 285, 0, 240, 345, 300, 210, 315, 15, 270, 30, 255, 335, 275,
]

const PROCESS_VARIANTS = new Set<ProcessVariant>([
  'mct-event', 'mct-sync', 'mct-operation', 'mct-result',
  'sat-task', 'sat-phase', 'sat-head', 'sat-lane', 'mpt-layer',
])

export function isProcessVariant(variant: string): boolean {
  return PROCESS_VARIANTS.has(variant as ProcessVariant)
}

export function applyEntityColors(nodes: Node<EntityNodeData>[]): Node<EntityNodeData>[] {
  return nodes.map((node, i) => {
    if (isProcessVariant(node.data.variant)) return node
    return {
      ...node,
      data: {
        ...node.data,
        color: `hsl(${SAFE_HUES[i % SAFE_HUES.length]}, 100%, 40%)`,
      },
    }
  })
}
