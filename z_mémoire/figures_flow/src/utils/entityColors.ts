import type { Node } from '@xyflow/react'
import type { EntityNodeData, ProcessVariant } from '../types'

const SAFE_HUES = [
  15, 225, 330, 285, 0, 240, 345, 300, 210, 315, 15, 270, 30, 255, 335, 275,
]

const PROCESS_HUES: Record<string, (data: EntityNodeData) => number> = {
  'mct-event': () => 195,
  'mct-sync': () => 30,
  'mct-operation': () => 225,
  'mct-result': (d) => (d.fail ? 0 : 145),
  'sat-task': (d) => {
    const map: Record<string, number> = { manual: 270, interactive: 30, auto: 195, eval: 30, adm: 145 }
    return map[d.meta || ''] ?? 270
  },
  'sat-head': (d) => {
    const map: Record<string, number> = { auto: 195, alt: 270, eval: 30, adm: 145 }
    return map[d.badge || ''] ?? 15
  },
  'sat-phase': () => 15,
  'sat-lane': (d) => {
    const map: Record<string, number> = { auto: 195, alt: 270, eval: 30, adm: 145 }
    return map[d.badge || ''] ?? 225
  },
  'mpt-layer': (d) => {
    const map: Record<string, number> = { trigger: 15, fe: 195, controller: 30, service: 270, repo: 145, db: 0, ext: 210, result: 145 }
    return map[d.layer || ''] ?? 225
  },
}

const PROCESS_VARIANTS = new Set<ProcessVariant>([
  'mct-event', 'mct-sync', 'mct-operation', 'mct-result',
  'sat-task', 'sat-phase', 'sat-head', 'sat-lane', 'mpt-layer',
])

export function isProcessVariant(variant: string): boolean {
  return PROCESS_VARIANTS.has(variant as ProcessVariant)
}

export function applyEntityColors(nodes: Node<EntityNodeData>[]): Node<EntityNodeData>[] {
  return nodes.map((node, i) => {
    if (isProcessVariant(node.data.variant)) {
      const fn = PROCESS_HUES[node.data.variant]
      const hue = fn?.(node.data) ?? 15
      return {
        ...node,
        data: { ...node.data, color: `hsl(${hue}, 100%, 40%)` },
      }
    }
    return {
      ...node,
      data: {
        ...node.data,
        color: `hsl(${SAFE_HUES[i % SAFE_HUES.length]}, 100%, 40%)`,
      },
    }
  })
}
