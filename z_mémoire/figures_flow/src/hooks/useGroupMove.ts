import { useCallback, useRef } from 'react'
import { useReactFlow } from '@xyflow/react'
import type { Node } from '@xyflow/react'

const SNAP = 10

interface UseGroupMoveArgs {
  /** État courant des nœuds — source des positions de départ. */
  nodes: Node[]
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
  /** Sauvegarde positions + viewport. Appelé au relâchement du pointeur. */
  persist: () => void
  /** Signale qu'un traitement vient d'être déplacé (il devient le focalisé). */
  onMoved: (prefix: string) => void
}

/**
 * Déplacement d'un traitement entier via l'icône « déplacer » de l'encadrement.
 *
 * L'icône vit dans un overlay DOM, hors du graphe de nœuds : React Flow ne peut
 * donc pas la traîner. On gère le geste à la main — `pointerdown` /
 * `setPointerCapture` / `pointermove` / `pointerup` — ce qui donne aussi le
 * contrôle du snap sur la grille, identique à `snapToGrid={[10, 10]}`.
 *
 * Les positions sont recalculées **en absolu** depuis la position de départ du
 * pointeur (et non incrémentées) : le groupe ne dérive pas si un `pointermove`
 * est coalescé ou perdu.
 */
export function useGroupMove({ nodes, setNodes, persist, onMoved }: UseGroupMoveArgs) {
  const { getZoom } = useReactFlow()
  const start = useRef<{ x: number; y: number; origins: Map<string, { x: number; y: number }> } | null>(null)

  return useCallback(
    (e: React.PointerEvent<HTMLElement>, prefix: string) => {
      e.preventDefault()
      e.stopPropagation()

      const origins = new Map<string, { x: number; y: number }>()
      for (const n of nodes) {
        if (n.id.startsWith(prefix)) origins.set(n.id, { x: n.position.x, y: n.position.y })
      }
      if (origins.size === 0) return

      const target = e.currentTarget
      target.setPointerCapture(e.pointerId)

      start.current = { x: e.clientX, y: e.clientY, origins }
      onMoved(prefix)

      const move = (ev: PointerEvent) => {
        const s = start.current
        if (!s) return
        const zoom = getZoom() || 1
        const dx = (ev.clientX - s.x) / zoom
        const dy = (ev.clientY - s.y) / zoom
        setNodes((prev) =>
          prev.map((n) => {
            const origin = s.origins.get(n.id)
            if (!origin) return n
            return {
              ...n,
              position: {
                x: Math.round((origin.x + dx) / SNAP) * SNAP,
                y: Math.round((origin.y + dy) / SNAP) * SNAP,
              },
            }
          }),
        )
      }

      const up = () => {
        start.current = null
        target.removeEventListener('pointermove', move)
        target.removeEventListener('pointerup', up)
        target.removeEventListener('pointercancel', up)
        persist()
      }

      target.addEventListener('pointermove', move)
      target.addEventListener('pointerup', up)
      target.addEventListener('pointercancel', up)
    },
    [nodes, getZoom, setNodes, persist, onMoved],
  )
}
