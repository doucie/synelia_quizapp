import type { Node } from '@xyflow/react'
import type { EntityNodeData } from '../types'

const SAFE_HUES = [
  15, 225, 330, 285, 0, 240, 345, 300, 210, 315, 15, 270, 30, 255, 335, 275,
]

export function applyEntityColors(nodes: Node<EntityNodeData>[]): Node<EntityNodeData>[] {
  return nodes.map((node, i) => ({
    ...node,
    data: {
      ...node.data,
      color: `hsl(${SAFE_HUES[i % SAFE_HUES.length]}, 100%, 40%)`,
    },
  }))
}
