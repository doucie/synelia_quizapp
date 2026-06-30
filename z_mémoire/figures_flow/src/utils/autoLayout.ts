import type { EntityNode } from '../types'

const COLUMN_GAP = 350
const ROW_GAP = 150

export function autoLayout(
  nodes: EntityNode[],
  startX = 50,
  startY = 50,
  cols = 3,
): EntityNode[] {
  return nodes.map((node, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    return {
      ...node,
      position: {
        x: startX + col * COLUMN_GAP,
        y: startY + row * ROW_GAP,
      },
    }
  })
}
