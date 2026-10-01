import { useCallback } from 'react'
import type { EntityNode, MotTableConfig } from '../types'
import { DEFAULT_MOT_TABLE_CONFIG } from '../types'

const STORAGE_KEY = 'figures_flow:diagram'
const EDGE_SIDES_KEY = 'figures_flow:edge_sides'

export interface DiagramState {
  positions: Record<string, { x: number; y: number }>
  viewport: { x: number; y: number; zoom: number }
  /**
   * Identifiants des sections verrouillées (déplacement par bloc).
   *
   * Optionnel : les états enregistrés avant l'introduction du verrou se chargent
   * sans ce champ, et sont interprétés comme « rien de verrouillé ».
   */
  lockedSections?: string[]
}

export function loadDiagramState(diagramId: string): DiagramState | null {
  if (!diagramId) return null
  const key = `${STORAGE_KEY}:${diagramId}`
  try {
    const saved = localStorage.getItem(key)
    if (saved) return JSON.parse(saved) as DiagramState
  } catch {
    // ignore
  }
  // migration from old format (figures_flow:positions:<id>)
  try {
    const oldKey = `figures_flow:positions:${diagramId}`
    const old = localStorage.getItem(oldKey)
    if (old) {
      const positions = JSON.parse(old) as Record<string, { x: number; y: number }>
      const state: DiagramState = { positions, viewport: { x: 0, y: 0, zoom: 1 } }
      localStorage.setItem(key, JSON.stringify(state))
      localStorage.removeItem(oldKey)
      return state
    }
  } catch {
    // ignore
  }
  return null
}

export function loadPositions(diagramId: string, nodes: EntityNode[]): EntityNode[] {
  const state = loadDiagramState(diagramId)
  if (!state) return nodes
  return nodes.map((n) => {
    const pos = state.positions[n.id]
    return pos ? { ...n, position: pos } : n
  })
}

function extractPositions(nodes: EntityNode[]): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {}
  for (const n of nodes) {
    positions[n.id] = n.position
  }
  return positions
}

export interface CardinalitySides {
  [edgeId: string]: {
    from?: string
    to?: string
    reflexOffset?: number
    reflexSpread?: number
    roleFromPos?: number
    roleToPos?: number
    roleFromSense?: 'auto' | 'forward' | 'backward'
    roleToSense?: 'auto' | 'forward' | 'backward'
  }
}

export function loadCardinalitySides(diagramId: string): CardinalitySides {
  if (!diagramId) return {}
  try {
    const saved = localStorage.getItem(`${EDGE_SIDES_KEY}:${diagramId}`)
    return saved ? (JSON.parse(saved) as CardinalitySides) : {}
  } catch {
    return {}
  }
}

export function setCardinalitySide(
  diagramId: string,
  edgeId: string,
  which: 'from' | 'to',
  side: string,
) {
  try {
    const key = `${EDGE_SIDES_KEY}:${diagramId}`
    const all = loadCardinalitySides(diagramId)
    all[edgeId] = { ...all[edgeId], [which]: side }
    localStorage.setItem(key, JSON.stringify(all))
  } catch {
    // ignore
  }
}

export function setReflexiveConfig(
  diagramId: string,
  edgeId: string,
  key:
    | 'reflexOffset'
    | 'reflexSpread'
    | 'roleFromPos'
    | 'roleToPos'
    | 'roleFromSense'
    | 'roleToSense',
  value: number | string | undefined,
) {
  try {
    const storageKey = `${EDGE_SIDES_KEY}:${diagramId}`
    const all = loadCardinalitySides(diagramId)
    if (value === undefined) {
      const current = all[edgeId]
      if (current) {
        const { [key]: _removed, ...rest } = current
        all[edgeId] = rest
      }
    } else {
      all[edgeId] = { ...all[edgeId], [key]: value }
    }
    localStorage.setItem(storageKey, JSON.stringify(all))
  } catch {
    // ignore
  }
}

export function useDiagramState(diagramId: string) {
  const storageKey = `${STORAGE_KEY}:${diagramId}`

  const saveState = useCallback(
    (state: DiagramState) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state))
      } catch {
        // ignore
      }
    },
    [storageKey],
  )

  const resetState = useCallback(() => {
    localStorage.removeItem(storageKey)
  }, [storageKey])

  return { saveState, resetState }
}

interface MotMctMapEntry {
  prefix: string
  originalDiagramId: string
  offsetX: number
  offsetY: number
}

export function loadMotPositions(nodes: EntityNode[], motMap: MotMctMapEntry[]): EntityNode[] {
  const cached = new Map<string, DiagramState | null>()
  return nodes.map((n) => {
    const entry = motMap.find((e) => n.id.startsWith(e.prefix))
    if (!entry) return n
    if (!cached.has(entry.originalDiagramId)) {
      cached.set(entry.originalDiagramId, loadDiagramState(entry.originalDiagramId))
    }
    const state = cached.get(entry.originalDiagramId)
    if (!state) return n
    const originalId = n.id.slice(entry.prefix.length)
    const pos = state.positions[originalId]
    return pos ? { ...n, position: { x: pos.x + entry.offsetX, y: pos.y + entry.offsetY } } : n
  })
}

export function loadMotCardinalitySides(motMap: MotMctMapEntry[]): CardinalitySides {
  const result: CardinalitySides = {}
  for (const entry of motMap) {
    const sides = loadCardinalitySides(entry.originalDiagramId)
    for (const [edgeId, sides2] of Object.entries(sides)) {
      result[`${entry.prefix}${edgeId}`] = sides2
    }
  }
  const motSides = loadCardinalitySides('mot-organisationnel-v2')
  Object.assign(result, motSides)
  return result
}

const MOT_TABLE_CONFIG_KEY = 'figures_flow:mot-table-config'

export function loadMotTableConfig(): MotTableConfig {
  try {
    const saved = localStorage.getItem(MOT_TABLE_CONFIG_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_MOT_TABLE_CONFIG, ...parsed }
    }
  } catch {
    // ignore
  }
  return DEFAULT_MOT_TABLE_CONFIG
}

export function saveMotTableConfig(config: MotTableConfig): void {
  try {
    localStorage.setItem(MOT_TABLE_CONFIG_KEY, JSON.stringify(config))
  } catch {
    // ignore
  }
}
