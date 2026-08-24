import { useState, useEffect, useRef, useMemo } from 'react'
import {
  BaseEdge,
  getSmoothStepPath,
  EdgeLabelRenderer,
  useReactFlow,
  useEdges,
  Position,
  type EdgeProps,
  type Node,
} from '@xyflow/react'
import type { RelationshipEdgeData, EntityNodeData } from '../../types'
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

function getValidHandles(node: Node | undefined, handleType: 'source' | 'target'): Set<string> {
  if (!node) return new Set(['left', 'right', 'top', 'bottom'])
  const data = node.data as EntityNodeData
  if (data.variant === 'mct-operation' && data.emissionRules?.length) {
    if (handleType === 'source') return new Set(data.emissionRules)
    return new Set(['top'])
  }
  return new Set(['left', 'right', 'top', 'bottom'])
}

function badgeOffset(pos: Position, extra = 0): { x: number; y: number } {
  switch (pos) {
    case Position.Left:
      return { x: -38, y: -18 + extra }
    case Position.Right:
      return { x: 2, y: -18 + extra }
    case Position.Top:
      return { x: -18 + extra, y: -24 }
    case Position.Bottom:
      return { x: -18 + extra, y: 2 }
  }
}

function cardinalityOffset(
  edges: { source: string; sourceHandle: string | null | undefined; target: string; targetHandle: string | null | undefined; data?: { cardFrom?: string; cardTo?: string } }[],
  side: 'from' | 'to',
  nodeId: string,
  handleId: string | null | undefined,
  currentValue: string | undefined,
): number {
  const key = side === 'from' ? 'cardFrom' : 'cardTo'
  const nodeKey = side === 'from' ? 'source' : 'target'
  const handleKey = side === 'from' ? 'sourceHandle' : 'targetHandle'

  const values: string[] = []
  for (const e of edges) {
    if (e[nodeKey] !== nodeId) continue
    if (e[handleKey] !== handleId) continue
    const v = e.data?.[key]
    if (v) values.push(v)
  }

  const unique = [...new Set(values)].sort()
  if (unique.length <= 1) return 0

  const idx = unique.indexOf(currentValue || '')
  if (idx === -1) return 0

  const spacing = 28
  return idx * spacing - (unique.length - 1) * spacing / 2
}

export default function RelationshipEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  sourceHandle,
  targetHandle,
  data,
  selected,
}: EdgeProps<RelationshipEdgeData>) {
  const { getEdges, setEdges, getNode } = useReactFlow()
  const allEdges = useEdges()
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
  const isStrong = data?.isStrong ?? true
  const strokeClass = selected ? 'stroke-primary' : 'stroke-[var(--xy-edge-stroke-default)]'

  const badgeClass =
    'inline-flex items-center justify-center rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-bold leading-none text-foreground shadow-sm cursor-pointer hover:ring-1 hover:ring-primary'

  const handleSideChange = (which: 'from' | 'to', side: string) => {
    const handle = HANDLE_ID[side]
    const nodeId = which === 'from' ? source : target
    const node = getNode(nodeId)
    const validHandles = getValidHandles(node, which === 'from' ? 'source' : 'target')
    if (handle && !validHandles.has(handle)) return

    const dataKey = which === 'from' ? 'cardFromSide' : 'cardToSide'
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

  const sourceNode = getNode(source)
  const targetNode = getNode(target)
  const validFrom = useMemo(() => getValidHandles(sourceNode, 'source'), [sourceNode])
  const validTo = useMemo(() => getValidHandles(targetNode, 'target'), [targetNode])

  const fromCardOffset = useMemo(
    () => cardinalityOffset(allEdges, 'from', source, sourceHandle, data?.cardFrom),
    [allEdges, source, sourceHandle, data?.cardFrom],
  )
  const toCardOffset = useMemo(
    () => cardinalityOffset(allEdges, 'to', target, targetHandle, data?.cardTo),
    [allEdges, target, targetHandle, data?.cardTo],
  )

  const fromOff = badgeOffset(sourcePosition, fromCardOffset)
  const toOff = badgeOffset(targetPosition, toCardOffset)

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
            onClick={() => setPopover(true)}
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
            onClick={() => setPopover(true)}
          >
            <span className={badgeClass}>{data.cardTo}</span>
          </div>
        )}
        {data?.label && !(data?.attributes && data.attributes.length > 0) && (
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
            <span className="inline-flex items-center justify-center rounded-full bg-background px-3 py-1 text-[10px] leading-none text-foreground" style={{ border: '1px solid var(--xy-edge-stroke-default)' }}>
              {data.label}
            </span>
          </div>
        )}
        {data?.label && (data?.attributes && data.attributes.length > 0) && (
          <div
            style={{
              position: 'absolute',
              left: labelX,
              top: labelY - 14,
              transform: 'translateX(-50%)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px solid var(--xy-edge-stroke-default)',
                borderRadius: 11,
                background: 'var(--color-background)',
                overflow: 'hidden',
              }}
            >
              <span className="inline-flex items-center justify-center px-3 py-0.5 text-[10px] text-foreground">
                {data.label}
              </span>
              <div style={{ width: '100%', borderTop: '1px solid var(--xy-edge-stroke-default)' }} />
              {data.attributes!.map((attr) => (
                <span
                  key={attr}
                  className="px-3 py-0.5 text-[9px] text-muted-foreground self-stretch text-left"
                  style={{ lineHeight: 0.9 }}
                >
                  {attr}
                </span>
              ))}
            </div>
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
              {CARD_SIDES.map((side) => {
                const handle = HANDLE_ID[side]
                const disabled = handle && !validFrom.has(handle)
                return (
                  <button
                    key={side}
                    onClick={() => handleSideChange('from', side)}
                    disabled={disabled}
                    className={`rounded px-1.5 py-1 text-xs transition-colors hover:bg-muted ${
                      activeFrom === side
                        ? 'bg-primary/20 text-primary'
                        : disabled
                          ? 'text-muted-foreground/40 cursor-not-allowed'
                          : 'text-muted-foreground'
                    }`}
                    title={side}
                  >
                    {SIDE_LABELS[side]}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-1">
              <span className="mr-1 text-[10px] font-semibold text-muted-foreground uppercase">Target</span>
              {CARD_SIDES.map((side) => {
                const handle = HANDLE_ID[side]
                const disabled = handle && !validTo.has(handle)
                return (
                  <button
                    key={side}
                    onClick={() => handleSideChange('to', side)}
                    disabled={disabled}
                    className={`rounded px-1.5 py-1 text-xs transition-colors hover:bg-muted ${
                      activeTo === side
                        ? 'bg-primary/20 text-primary'
                        : disabled
                          ? 'text-muted-foreground/40 cursor-not-allowed'
                          : 'text-muted-foreground'
                    }`}
                    title={side}
                  >
                    {SIDE_LABELS[side]}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  )
}
