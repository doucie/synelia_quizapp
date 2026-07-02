import { useState, useEffect, useRef } from 'react'
import {
  BaseEdge,
  getSmoothStepPath,
  EdgeLabelRenderer,
  useReactFlow,
  Position,
  type EdgeProps,
} from '@xyflow/react'
import type { RelationshipEdgeData } from '../../types'
import { setCardinalitySide } from '../../hooks/useDiagramState'

const CARD_SIDES = ['source', 'left', 'right', 'top', 'bottom'] as const

const HANDLE_ID: Record<string, string> = {
  source: '',
  left: 'left',
  right: 'right',
  top: 'top',
  bottom: 'bottom',
}

const SIDE_LABELS: Record<string, string> = {
  source: '◎',
  left: '⬅',
  right: '➡',
  top: '⬆',
  bottom: '⬇',
}

function badgeOffset(pos: Position): { x: number; y: number } {
  switch (pos) {
    case Position.Left:
      return { x: -38, y: -18 }
    case Position.Right:
      return { x: 2, y: -18 }
    case Position.Top:
      return { x: -18, y: -24 }
    case Position.Bottom:
      return { x: -18, y: 2 }
  }
}

export default function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<RelationshipEdgeData>) {
  const { getEdges, setEdges } = useReactFlow()
  const [popover, setPopover] = useState<'from' | 'to' | null>(null)
  const [popoverFromEdge, setPopoverFromEdge] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const diagramId = data?.diagramId

  useEffect(() => {
    if (!popover) return
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopover(null)
      }
    }
    document.addEventListener('mousedown', handleClick, true)
    return () => document.removeEventListener('mousedown', handleClick, true)
  }, [popover])

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  })

  const isDashed = data?.isDashed ?? false
  const isStrong = data?.isStrong ?? true
  const strokeClass = selected ? 'stroke-primary' : 'stroke-[var(--xy-edge-stroke-default)]'

  const badgeClass =
    'inline-flex items-center justify-center rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-bold leading-none text-foreground shadow-sm cursor-pointer hover:ring-1 hover:ring-primary'

  const handleSideChange = (which: 'from' | 'to', side: string) => {
    const dataKey = which === 'from' ? 'cardFromSide' : 'cardToSide'
    const handle = HANDLE_ID[side]
    const handleKey = which === 'from' ? 'sourceHandle' : 'targetHandle'

    const currentEdges = getEdges()
    setEdges(
      currentEdges.map((e) => {
        if (e.id !== id) return e
        return {
          ...e,
          [handleKey]: handle || undefined,
          data: {
            ...e.data,
            [dataKey]: side === 'source' ? undefined : side,
          },
        }
      }),
    )

    if (diagramId) setCardinalitySide(diagramId, id, which, side)
    setPopover(null)
  }

  const edgeClick = () => {
    setPopover('from')
    setPopoverFromEdge(true)
  }

  const fromOff = badgeOffset(sourcePosition)
  const toOff = badgeOffset(targetPosition)

  return (
    <>
      <g onClick={edgeClick} style={{ cursor: 'pointer' }}>
        <BaseEdge
          id={id}
          path={edgePath}
          className={strokeClass}
          style={{
            strokeWidth: isStrong ? 2 : 1.5,
            strokeDasharray: isDashed ? '6 4' : undefined,
          }}
        />
      </g>
      <EdgeLabelRenderer>
        {data?.cardFrom && (
          <div
            style={{
              position: 'absolute',
              left: sourceX + fromOff.x,
              top: sourceY + fromOff.y,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
            }}
            onClick={() => { setPopover(popover === 'from' ? null : 'from'); setPopoverFromEdge(false) }}
          >
            <span className={badgeClass}>{data.cardFrom}</span>
          </div>
        )}
        {data?.cardTo && (
          <div
            style={{
              position: 'absolute',
              left: targetX + toOff.x,
              top: targetY + toOff.y,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
            }}
            onClick={() => { setPopover(popover === 'to' ? null : 'to'); setPopoverFromEdge(false) }}
          >
            <span className={badgeClass}>{data.cardTo}</span>
          </div>
        )}
        {data?.label && (
          <div
            style={{
              position: 'absolute',
              left: labelX - 50,
              top: labelY - 14,
              width: 100,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="inline-flex items-center justify-center rounded-full border border-border bg-background px-3 py-1 text-[10px] leading-none text-foreground shadow-sm">
              {data.label}
            </span>
          </div>
        )}
        {popover && (
          <div
            ref={popoverRef}
            style={{
              position: 'absolute',
              left: popoverFromEdge
                ? labelX - 2
                : (popover === 'from' ? sourceX + fromOff.x : targetX + toOff.x) - 2,
              top: popoverFromEdge
                ? labelY - 52
                : (popover === 'from' ? sourceY + fromOff.y : targetY + toOff.y) - 52,
              zIndex: 1000,
              pointerEvents: 'auto',
            }}
            className="flex gap-0.5 rounded-lg border border-border bg-background p-1 shadow-lg"
          >
            {CARD_SIDES.map((side) => (
              <button
                key={side}
                onClick={() => handleSideChange(popover, side)}
                className={`rounded px-1.5 py-1 text-xs transition-colors hover:bg-muted ${
                  (popover === 'from' ? data?.cardFromSide ?? 'source' : data?.cardToSide ?? 'source') ===
                  side
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground'
                }`}
                title={side}
              >
                {SIDE_LABELS[side]}
              </button>
            ))}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  )
}
