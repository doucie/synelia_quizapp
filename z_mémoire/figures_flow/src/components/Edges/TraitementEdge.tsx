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

export default function TraitementEdge({
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
  const [popover, setPopover] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const diagramId = data?.diagramId

  useEffect(() => {
    if (!popover) return
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopover(false)
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
  const isStrong = data?.isStrong ?? false
  const strokeClass = selected ? 'stroke-primary' : 'stroke-[var(--xy-edge-stroke-default)]'

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
  }

  const activeFrom = data?.cardFromSide ?? 'source'
  const activeTo = data?.cardToSide ?? 'source'

  return (
    <>
      <g onClick={() => setPopover(true)} style={{ cursor: 'pointer' }}>
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
        {data?.label && (
          <div
            style={{
              position: 'absolute',
              left: labelX - 60,
              top: labelY - 14,
              width: 120,
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
              left: labelX - 80,
              top: labelY - 72,
              zIndex: 1000,
              pointerEvents: 'auto',
            }}
            className="flex flex-col gap-1 rounded-lg border border-border bg-background p-1.5 shadow-lg"
          >
            <div className="flex items-center gap-1">
              <span className="mr-1 text-[10px] font-semibold text-muted-foreground uppercase">Source</span>
              {CARD_SIDES.map((side) => (
                <button
                  key={side}
                  onClick={() => handleSideChange('from', side)}
                  className={`rounded px-1.5 py-1 text-xs transition-colors hover:bg-muted ${
                    activeFrom === side
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground'
                  }`}
                  title={side}
                >
                  {SIDE_LABELS[side]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="mr-1 text-[10px] font-semibold text-muted-foreground uppercase">Target</span>
              {CARD_SIDES.map((side) => (
                <button
                  key={side}
                  onClick={() => handleSideChange('to', side)}
                  className={`rounded px-1.5 py-1 text-xs transition-colors hover:bg-muted ${
                    activeTo === side
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground'
                  }`}
                  title={side}
                >
                  {SIDE_LABELS[side]}
                </button>
              ))}
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  )
}
