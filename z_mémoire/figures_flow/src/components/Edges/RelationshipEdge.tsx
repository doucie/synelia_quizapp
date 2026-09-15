import { useState, useEffect, useRef, useMemo } from 'react'
import {
  BaseEdge,
  getSmoothStepPath,
  EdgeLabelRenderer,
  useReactFlow,
  useEdges,
  useNodes,
  Position,
  type EdgeProps,
  type Node,
} from '@xyflow/react'
import type { RelationshipEdgeData, EntityNodeData } from '../../types'
import { setCardinalitySide, setReflexiveConfig } from '../../hooks/useDiagramState'
import {
  resolveHandleId,
  edgeAnchorGroup,
  edgePathOffset,
} from './edgeAnchors'
import { useEdgeDebugEnabled } from '../../utils/edgeDebug'

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
  const data = node.data as unknown as EntityNodeData
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

const REFLEX_SPREAD = 34
const REFLEX_OFFSET = 90
const REFLEX_RADIUS = 8

type ReflexiveRect = { x: number; y: number; w: number; h: number }
type ReflexiveAnchor = { x: number; y: number; pos: Position }

const REFLEX_SIDE_INDEX: Record<Position, number> = {
  [Position.Top]: 0,
  [Position.Right]: 1,
  [Position.Bottom]: 2,
  [Position.Left]: 3,
}

function reflexProject(rect: ReflexiveRect, pos: Position, p: [number, number], m: number): [number, number] {
  switch (pos) {
    case Position.Top:
      return [p[0], rect.y - m]
    case Position.Bottom:
      return [p[0], rect.y + rect.h + m]
    case Position.Left:
      return [rect.x - m, p[1]]
    default:
      return [rect.x + rect.w + m, p[1]]
  }
}

function reflexUnit(a: [number, number], b: [number, number]): [number, number] {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  if (dy === 0) return [Math.sign(dx) || 1, 0]
  if (dx === 0) return [0, Math.sign(dy) || 1]
  const len = Math.hypot(dx, dy)
  return [dx / len, dy / len]
}

function reflexMidpoint(points: [number, number][]): [number, number] {
  const segs: number[] = []
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const len = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1])
    segs.push(len)
    total += len
  }
  let target = total / 2
  for (let i = 0; i < segs.length; i++) {
    const len = segs[i]
    if (target <= len) {
      const t = len === 0 ? 0 : target / len
      return [
        points[i][0] + (points[i + 1][0] - points[i][0]) * t,
        points[i][1] + (points[i + 1][1] - points[i][1]) * t,
      ]
    }
    target -= len
  }
  return points[points.length - 1]
}

function buildReflexiveEdge(
  rect: ReflexiveRect,
  source: ReflexiveAnchor,
  target: ReflexiveAnchor,
  fromEdgeOff: number,
  toEdgeOff: number,
  offset = REFLEX_OFFSET,
  spread = REFLEX_SPREAD,
): { sx: number; sy: number; tx: number; ty: number; path: string; labelX: number; labelY: number } {
  const { x: x0, y: y0, w, h } = rect
  const R = REFLEX_RADIUS
  const M = offset
  const S = spread

  if (source.pos === target.pos) {
    let sx: number, sy: number, tx: number, ty: number, path: string
    let labelX: number, labelY: number
    if (source.pos === Position.Top || source.pos === Position.Bottom) {
      sy = source.y
      ty = source.y
      sx = source.x - S + fromEdgeOff
      tx = source.x + S + toEdgeOff
      const outer = source.pos === Position.Top ? y0 - M : y0 + h + M
      labelX = (sx + tx) / 2
      labelY = outer
      path =
        source.pos === Position.Top
          ? `M ${sx} ${sy} L ${sx} ${outer + R} Q ${sx} ${outer} ${sx + R} ${outer} L ${tx - R} ${outer} Q ${tx} ${outer} ${tx} ${outer + R} L ${tx} ${ty}`
          : `M ${sx} ${sy} L ${sx} ${outer - R} Q ${sx} ${outer} ${sx + R} ${outer} L ${tx - R} ${outer} Q ${tx} ${outer} ${tx} ${outer - R} L ${tx} ${ty}`
    } else {
      sx = source.x
      tx = source.x
      sy = source.y - S + fromEdgeOff
      ty = source.y + S + toEdgeOff
      const outer = source.pos === Position.Left ? x0 - M : x0 + w + M
      labelX = outer
      labelY = (sy + ty) / 2
      path =
        source.pos === Position.Left
          ? `M ${sx} ${sy} L ${outer + R} ${sy} Q ${outer} ${sy} ${outer} ${sy + R} L ${outer} ${ty - R} Q ${outer} ${ty} ${outer + R} ${ty} L ${tx} ${ty}`
          : `M ${sx} ${sy} L ${outer - R} ${sy} Q ${outer} ${sy} ${outer} ${sy + R} L ${outer} ${ty - R} Q ${outer} ${ty} ${outer - R} ${ty} L ${tx} ${ty}`
    }
    return { sx, sy, tx, ty, path, labelX, labelY }
  }

  const pA: [number, number] = [source.x, source.y]
  const pB: [number, number] = [target.x, target.y]
  if (source.pos === Position.Top || source.pos === Position.Bottom) {
    pA[0] += fromEdgeOff
    pA[0] -= S
  } else {
    pA[1] += fromEdgeOff
    pA[1] -= S
  }
  if (target.pos === Position.Top || target.pos === Position.Bottom) {
    pB[0] += toEdgeOff
    pB[0] += S
  } else {
    pB[1] += toEdgeOff
    pB[1] += S
  }
  const oA = reflexProject(rect, source.pos, pA, M)
  const oB = reflexProject(rect, target.pos, pB, M)

  const idxA = REFLEX_SIDE_INDEX[source.pos]
  const idxB = REFLEX_SIDE_INDEX[target.pos]
  const cwSteps = (idxB - idxA + 4) % 4
  const ccwSteps = (idxA - idxB + 4) % 4
  const clockwise = cwSteps < ccwSteps

  const cornerCW: [number, number][] = [
    [x0 - M, y0 - M],
    [x0 + w + M, y0 - M],
    [x0 + w + M, y0 + h + M],
    [x0 - M, y0 + h + M],
  ]
  const cornerCCW: [number, number][] = [
    [x0 + w + M, y0 - M],
    [x0 + w + M, y0 + h + M],
    [x0 - M, y0 + h + M],
    [x0 - M, y0 - M],
  ]

  const route: [number, number][] = [oA]
  let cur = idxA
  const steps = clockwise ? cwSteps : ccwSteps
  for (let i = 0; i < steps; i++) {
    cur = (cur + (clockwise ? 1 : -1) + 4) % 4
    route.push(clockwise ? cornerCW[cur] : cornerCCW[cur])
  }
  route.push(oB)

  const points: [number, number][] = [pA, ...route, pB]
  let path = `M ${pA[0]} ${pA[1]}`
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const cur = points[i]
    const next = points[i + 1]
    const dIn = reflexUnit(prev, cur)
    const dOut = reflexUnit(cur, next)
    if (dIn[0] === dOut[0] && dIn[1] === dOut[1]) {
      path += ` L ${cur[0]} ${cur[1]}`
    } else {
      path += ` L ${cur[0] - dIn[0] * R} ${cur[1] - dIn[1] * R} Q ${cur[0]} ${cur[1]} ${cur[0] + dOut[0] * R} ${cur[1] + dOut[1] * R}`
    }
  }
  path += ` L ${pB[0]} ${pB[1]}`

  const [labelX, labelY] = reflexMidpoint(points)
  return { sx: pA[0], sy: pA[1], tx: pB[0], ty: pB[1], path, labelX, labelY }
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
  sourceHandleId: sourceHandle,
  targetHandleId: targetHandle,
  data: edgePropsData,
  selected,
}: EdgeProps) {
  const data = (edgePropsData ?? {}) as RelationshipEdgeData
  const { getEdges, setEdges, getNode } = useReactFlow()
  const allEdges = useEdges()
  const allNodes = useNodes()
  const [popover, setPopover] = useState(false)
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const openPopover = () => {
    setPopoverPos({ x: labelX - 80, y: labelY - 72 })
    setPopover(true)
  }

  const diagramId = data?.diagramId
  const debug = useEdgeDebugEnabled()

  const nodeById = useMemo(() => {
    const map = new Map<string, Node>()
    for (const n of allNodes) map.set(n.id, n)
    return map
  }, [allNodes])

  const sourceNode = getNode(source)
  const targetNode = getNode(target)

  const resolvedSource = useMemo(
    () => resolveHandleId(sourceNode, 'source', sourceHandle),
    [sourceNode, sourceHandle],
  )
  const resolvedTarget = useMemo(
    () => resolveHandleId(targetNode, 'target', targetHandle),
    [targetNode, targetHandle],
  )

  useEffect(() => {
    if (!popover) return
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as unknown as HTMLElement)) {
        setPopover(false)
      }
    }
    document.addEventListener('mousedown', handleClick, true)
    return () => document.removeEventListener('mousedown', handleClick, true)
  }, [popover])

  const isSelfLoop = source === target

  const fromOff = badgeOffset(sourcePosition)
  const toOff = badgeOffset(targetPosition)
  const fromEdgeOff = useMemo(
    () => edgePathOffset(allEdges, nodeById, 'from', source, resolvedSource, id),
    [allEdges, nodeById, source, resolvedSource, id, data?.cardFromSide],
  )
  const toEdgeOff = useMemo(
    () => edgePathOffset(allEdges, nodeById, 'to', target, resolvedTarget, id),
    [allEdges, nodeById, target, resolvedTarget, id, data?.cardToSide],
  )

  const srcGroup = useMemo(
    () => edgeAnchorGroup(allEdges, nodeById, 'from', source, resolvedSource),
    [allEdges, nodeById, source, resolvedSource],
  )
  const tgtGroup = useMemo(
    () => edgeAnchorGroup(allEdges, nodeById, 'to', target, resolvedTarget),
    [allEdges, nodeById, target, resolvedTarget],
  )

  const srcOnHorizontalSide = resolvedSource === 'left' || resolvedSource === 'right'
  const tgtOnHorizontalSide = resolvedTarget === 'left' || resolvedTarget === 'right'
  let sx = srcOnHorizontalSide ? sourceX : sourceX + fromEdgeOff
  let sy = srcOnHorizontalSide ? sourceY + fromEdgeOff : sourceY
  let tx = tgtOnHorizontalSide ? targetX : targetX + toEdgeOff
  let ty = tgtOnHorizontalSide ? targetY + toEdgeOff : targetY

  let edgePath: string
  let labelX: number
  let labelY: number

  if (isSelfLoop) {
    const n = sourceNode
    const loopOffset = data?.reflexOffset ?? REFLEX_OFFSET
    const loopSpread = data?.reflexSpread ?? REFLEX_SPREAD
    const w = n?.measured?.width ?? 220
    const h = n?.measured?.height ?? 130
    const x0 = n?.position.x ?? sourceX
    const y0 = n?.position.y ?? sourceY
    const loop = buildReflexiveEdge(
      { x: x0, y: y0, w, h },
      { x: sourceX, y: sourceY, pos: sourcePosition },
      { x: targetX, y: targetY, pos: targetPosition },
      fromEdgeOff,
      toEdgeOff,
      loopOffset,
      loopSpread,
    )
    sx = loop.sx
    sy = loop.sy
    tx = loop.tx
    ty = loop.ty
    edgePath = loop.path
    labelX = loop.labelX
    labelY = loop.labelY
  } else {
    const [ep, lx, ly] = getSmoothStepPath({
      sourceX: sx,
      sourceY: sy,
      sourcePosition,
      targetX: tx,
      targetY: ty,
      targetPosition,
      borderRadius: 8,
    })
    edgePath = ep
    labelX = lx
    labelY = ly
  }

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

  const updateReflexiveConfig = (key: 'reflexOffset' | 'reflexSpread', value: number) => {
    const currentEdges = getEdges()
    setEdges(
      currentEdges.map((e) => {
        if (e.id !== id) return e
        return { ...e, data: { ...e.data, [key]: value } }
      }),
    )
    if (diagramId) setReflexiveConfig(diagramId, id, key, value)
  }

  const resetReflexiveConfig = (key: 'reflexOffset' | 'reflexSpread') => {
    const currentEdges = getEdges()
    setEdges(
      currentEdges.map((e) => {
        if (e.id !== id) return e
        const nextData = { ...(e.data ?? {}) }
        delete nextData[key]
        return { ...e, data: nextData }
      }),
    )
    if (diagramId) setReflexiveConfig(diagramId, id, key, undefined)
  }

  const activeFrom = data?.cardFromSide ?? 'source'
  const activeTo = data?.cardToSide ?? 'source'

  const validFrom = useMemo(() => getValidHandles(sourceNode, 'source'), [sourceNode])
  const validTo = useMemo(() => getValidHandles(targetNode, 'target'), [targetNode])

  return (
    <>
      <g onClick={openPopover} style={{ cursor: 'pointer' }}>
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
              left: sx + fromOff.x,
              top: sy + fromOff.y,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
            }}
            onClick={openPopover}
          >
            <span className={badgeClass}>{data.cardFrom}</span>
          </div>
        )}
        {data?.cardTo && (
          <div
            style={{
              position: 'absolute',
              left: tx + toOff.x,
              top: ty + toOff.y,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
            }}
            onClick={openPopover}
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
        {debug && (
          <>
            <div
              style={{
                position: 'absolute',
                left: sourceX - 3,
                top: sourceY - 3,
                width: 6,
                height: 6,
                borderRadius: 9999,
                background: '#e11d48',
                zIndex: 900,
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: targetX - 3,
                top: targetY - 3,
                width: 6,
                height: 6,
                borderRadius: 9999,
                background: '#e11d48',
                zIndex: 900,
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: labelX - 300,
                top: labelY - 52,
                zIndex: 900,
                pointerEvents: 'none',
                fontSize: 9,
                lineHeight: 1.4,
                fontFamily: 'monospace',
                color: '#e11d48',
                background: 'rgba(255, 255, 255, 0.88)',
                border: '1px solid #e11d48',
                borderRadius: 4,
                padding: '1px 4px',
                whiteSpace: 'nowrap',
              }}
            >
              {id} | Cf:{data?.cardFrom ?? '–'}→{data?.cardTo ?? '–'} | S:{sourceHandle ?? '∅'}→{resolvedSource} | T:{targetHandle ?? '∅'}→{resolvedTarget} | gF:{srcGroup.length} gT:{tgtGroup.length} | off:{Math.round(fromEdgeOff)}/{Math.round(toEdgeOff)}
            </div>
          </>
        )}
        {popover && (
          <div
            ref={popoverRef}
            style={{
              position: 'absolute',
              left: popoverPos?.x ?? labelX - 80,
              top: popoverPos?.y ?? labelY - 72,
              zIndex: 1000,
              pointerEvents: 'auto',
            }}
            className="nopan flex flex-col gap-1 rounded-lg border border-border bg-background p-1.5 shadow-lg"
          >
            <div className="flex items-center gap-1">
              <span className="mr-1 text-[10px] font-semibold text-muted-foreground uppercase">Source</span>
              {CARD_SIDES.map((side) => {
                const handle = HANDLE_ID[side]
                const disabled = handle !== '' && !validFrom.has(handle)
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
                const disabled = handle !== '' && !validTo.has(handle)
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
            {isSelfLoop && (
              <div className="flex flex-col gap-1 border-t border-border pt-1 mt-1">
                <div className="flex items-center gap-1">
                  <span className="mr-1 text-[10px] font-semibold text-muted-foreground uppercase w-14 shrink-0">Dist</span>
                  <input
                    type="range"
                    min={40}
                    max={200}
                    step={5}
                    value={data?.reflexOffset ?? REFLEX_OFFSET}
                    onChange={(e) => updateReflexiveConfig('reflexOffset', Number(e.target.value))}
                    style={{ flex: 1, height: 3, accentColor: 'hsl(var(--primary))' }}
                  />
                  <span className="text-[10px] text-muted-foreground tabular-nums w-7 text-right">
                    {data?.reflexOffset ?? REFLEX_OFFSET}
                  </span>
                  {data?.reflexOffset != null && data.reflexOffset !== REFLEX_OFFSET && (
                    <button
                      onClick={() => resetReflexiveConfig('reflexOffset')}
                      className="rounded px-1 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="Réinitialiser (90)"
                    >
                      ↺
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="mr-1 text-[10px] font-semibold text-muted-foreground uppercase w-14 shrink-0">Écart</span>
                  <input
                    type="range"
                    min={10}
                    max={80}
                    step={2}
                    value={data?.reflexSpread ?? REFLEX_SPREAD}
                    onChange={(e) => updateReflexiveConfig('reflexSpread', Number(e.target.value))}
                    style={{ flex: 1, height: 3, accentColor: 'hsl(var(--primary))' }}
                  />
                  <span className="text-[10px] text-muted-foreground tabular-nums w-7 text-right">
                    {data?.reflexSpread ?? REFLEX_SPREAD}
                  </span>
                  {data?.reflexSpread != null && data.reflexSpread !== REFLEX_SPREAD && (
                    <button
                      onClick={() => resetReflexiveConfig('reflexSpread')}
                      className="rounded px-1 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="Réinitialiser (34)"
                    >
                      ↺
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  )
}
