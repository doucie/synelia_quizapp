import { useCallback } from 'react'
import type { EntityNode } from '../types'

const STORAGE_KEY = 'figures_flow:positions'

export function loadPositions(diagramId: string, nodes: EntityNode[]): EntityNode[] {
  if (!diagramId) return nodes
  const storageKey = `${STORAGE_KEY}:${diagramId}`
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const positions = JSON.parse(saved) as Record<string, { x: number; y: number }>
      return nodes.map((n) => {
        const pos = positions[n.id]
        return pos ? { ...n, position: pos } : n
      })
    }
  } catch {
    // ignore
  }
  return nodes
}

export function useDiagramPersistence(diagramId: string) {
  const storageKey = `${STORAGE_KEY}:${diagramId}`

  const savePositions = useCallback(
    (currentNodes: EntityNode[]) => {
      const positions: Record<string, { x: number; y: number }> = {}
      for (const n of currentNodes) {
        positions[n.id] = n.position
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(positions))
      } catch {
        // ignore
      }
    },
    [storageKey],
  )

  const resetPositions = useCallback(() => {
    localStorage.removeItem(storageKey)
  }, [storageKey])

  return { savePositions, resetPositions }
}
