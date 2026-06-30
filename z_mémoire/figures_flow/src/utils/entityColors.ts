import type { Node } from '@xyflow/react'
import type { EntityNodeData } from '../types'

const PRIMARY_HUE = 15

export function applyEntityColors(nodes: Node<EntityNodeData>[]): Node<EntityNodeData>[] {
  const count = nodes.length
  return nodes.map((node, i) => ({
    ...node,
    data: {
      ...node.data,
      color: `hsl(${Math.round(PRIMARY_HUE + i * (360 / count))}, 100%, 50%)`,
    },
  }))
}
