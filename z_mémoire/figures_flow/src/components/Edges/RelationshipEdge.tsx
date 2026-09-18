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

function roleOuterStyle(pos: Position): { writingMode?: 'vertical-rl'; left?: string; right?: string; top?: string; bottom?: string; transform?: string } {
  switch (pos) {
    case Position.Top:
      return { writingMode: 'vertical-rl', left: '50%', bottom: 'calc(100% + 4px)', transform: 'translateX(-50%)' }
    case Position.Bottom:
      return { writingMode: 'vertical-rl', left: '50%', top: 'calc(100% + 4px)', transform: 'translateX(-50%)' }
    case Position.Left:
      return { right: 'calc(100% + 4px)', top: '50%', transform: 'translateY(-50%)' }
    case Position.Right:
      return { left: 'calc(100% + 4px)', top: '50%', transform: 'translateY(-50%)' }
  }
}

const REFLEX_SPREAD = 34
const REFLEX_OFFSET = 90
const REFLEX_RADIUS = 8

const ROLE_LINE_GAP = 6
const ROLE_CHAR_ADVANCE = 6.5

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

function roundedPath(points: [number, number][], radius = REFLEX_RADIUS): string {
  if (points.length < 2) return ''
  let path = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const cur = points[i]
    const next = points[i + 1]
    const dIn = reflexUnit(prev, cur)
    const dOut = reflexUnit(cur, next)
    if (dIn[0] === dOut[0] && dIn[1] === dOut[1]) {
      path += ` L ${cur[0]} ${cur[1]}`
    } else {
      path += ` L ${cur[0] - dIn[0] * radius} ${cur[1] - dIn[1] * radius} Q ${cur[0]} ${cur[1]} ${cur[0] + dOut[0] * radius} ${cur[1] + dOut[1] * radius}`
    }
  }
  const last = points[points.length - 1]
  path += ` L ${last[0]} ${last[1]}`
  return path
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
): { sx: number; sy: number; tx: number; ty: number; path: string; pathReverse: string; labelX: number; labelY: number; poly: [number, number][] } {
  const { x: x0, y: y0, w, h } = rect
  const M = offset
  const S = spread

  if (source.pos === target.pos) {
    let sx: number, sy: number, tx: number, ty: number
    let labelX: number, labelY: number
    if (source.pos === Position.Top || source.pos === Position.Bottom) {
      sy = source.y
      ty = source.y
      sx = source.x - S + fromEdgeOff
      tx = source.x + S + toEdgeOff
      const outer = source.pos === Position.Top ? y0 - M : y0 + h + M
      labelX = (sx + tx) / 2
      labelY = outer
    } else {
      sx = source.x
      tx = source.x
      sy = source.y - S + fromEdgeOff
      ty = source.y + S + toEdgeOff
      const outer = source.pos === Position.Left ? x0 - M : x0 + w + M
      labelX = outer
      labelY = (sy + ty) / 2
    }
    const outerLine =
      source.pos === Position.Top
        ? y0 - M
        : source.pos === Position.Bottom
          ? y0 + h + M
          : source.pos === Position.Left
            ? x0 - M
            : x0 + w + M
    const poly: [number, number][] =
      source.pos === Position.Top || source.pos === Position.Bottom
        ? [[sx, sy], [sx, outerLine], [tx, outerLine], [tx, ty]]
        : [[sx, sy], [outerLine, sy], [outerLine, ty], [tx, ty]]
    return {
      sx, sy, tx, ty,
      path: roundedPath(poly),
      pathReverse: roundedPath([...poly].reverse()),
      labelX, labelY, poly,
    }
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
  const path = roundedPath(points)

  const [labelX, labelY] = reflexMidpoint(points)
  return {
    sx: pA[0], sy: pA[1], tx: pB[0], ty: pB[1],
    path,
    pathReverse: roundedPath([...points].reverse()),
    labelX, labelY, poly: points,
  }
}

type RolePathFit = { total: number; maxFrom: number; maxTo: number; dy: number }

function rolePathFit(poly: [number, number][], rect: ReflexiveRect): RolePathFit {
  const segs: number[] = []
  let total = 0
  for (let i = 1; i < poly.length; i++) {
    const len = Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1])
    segs.push(len)
    total += len
  }
  const lastSeg = segs.length > 0 ? segs[segs.length - 1] : 0
  const firstSeg = segs.length > 0 ? segs[0] : 0
  const cx = rect.x + rect.w / 2
  const cy = rect.y + rect.h / 2
  let dy = ROLE_LINE_GAP
  if (poly.length >= 2) {
    const [ax, ay] = poly[0]
    const [bx, by] = poly[1]
    const dx = bx - ax
    const dyv = by - ay
    const len = Math.hypot(dx, dyv) || 1
    const tx = dx / len
    const ty = dyv / len
    const mx = (ax + bx) / 2 - cx
    const my = (ay + by) / 2 - cy
    const dot = mx * tx + my * ty
    const px = mx - dot * tx
    const py = my - dot * ty
    const gyx = -ty
    const gyy = tx
    const side = Math.sign(px * gyx + py * gyy) || 1
    dy = ROLE_LINE_GAP * side
  }
  return { total, maxFrom: total - lastSeg, maxTo: total - firstSeg, dy }
}

type RoleSense = 'auto' | 'forward' | 'backward'

function upsideDownMeasure(poly: [number, number][], start: number, len: number): number {
  if (len <= 0) return 0
  let cumul = 0
  let measure = 0
  for (let i = 1; i < poly.length; i++) {
    const dx = poly[i][0] - poly[i - 1][0]
    const dy = poly[i][1] - poly[i - 1][1]
    const segLen = Math.hypot(dx, dy)
    if (segLen === 0) continue
    const segEnd = cumul + segLen
    const from = Math.max(start, cumul)
    const to = Math.min(start + len, segEnd)
    cumul = segEnd
    if (to <= from) continue
    if (dx < 0) measure += to - from
  }
  return measure
}

function resolveRoleSense(
  poly: [number, number][],
  start: number,
  len: number,
  sense?: RoleSense,
): 'forward' | 'backward' {
  if (sense === 'forward') return 'forward'
  if (sense === 'backward') return 'backward'
  if (len <= 0) return 'forward'
  const forward = upsideDownMeasure(poly, start, len)
  return forward > len / 2 ? 'backward' : 'forward'
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
  const loopOffset = data?.reflexOffset ?? REFLEX_OFFSET
  const loopSpread = data?.reflexSpread ?? REFLEX_SPREAD
  const loopW = sourceNode?.measured?.width ?? 220
  const loopH = sourceNode?.measured?.height ?? 130
  const loopX = sourceNode?.position.x ?? sourceX
  const loopY = sourceNode?.position.y ?? sourceY
  const rolePathId = `edge-rolepath-${id}`
  const rolePathRevId = `edge-rolepath-${id}-rev`
  let edgePathReverse = ''
  let roleFit: RolePathFit | null = null
  let rolePoly: [number, number][] | null = null

  if (isSelfLoop) {
    const w = loopW
    const h = loopH
    const x0 = loopX
    const y0 = loopY
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
    edgePathReverse = loop.pathReverse
    labelX = loop.labelX
    labelY = loop.labelY
    roleFit = rolePathFit(loop.poly, { x: x0, y: y0, w, h })
    rolePoly = loop.poly
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

  type ReflexiveKey =
    | 'reflexOffset'
    | 'reflexSpread'
    | 'roleFromPos'
    | 'roleToPos'
    | 'roleFromSense'
    | 'roleToSense'

  const updateReflexiveConfig = (key: ReflexiveKey, value: number | string) => {
    const currentEdges = getEdges()
    setEdges(
      currentEdges.map((e) => {
        if (e.id !== id) return e
        return { ...e, data: { ...e.data, [key]: value } }
      }),
    )
    if (diagramId) setReflexiveConfig(diagramId, id, key, value)
  }

  const resetReflexiveConfig = (key: ReflexiveKey) => {
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

  const fromStart = roleFit ? Math.max(0, Math.min(1, data?.roleFromPos ?? 0)) * roleFit.maxFrom : 0
  const toStart = roleFit ? roleFit.total - Math.max(0, Math.min(1, data?.roleToPos ?? 0)) * roleFit.maxTo : 0
  const toDist = roleFit ? Math.max(0, Math.min(1, data?.roleToPos ?? 0)) * roleFit.maxTo : 0
  const roleTotal = roleFit?.total ?? 0
  const roleDy = roleFit?.dy ?? ROLE_LINE_GAP
  const fromLen = data?.roleFrom ? Array.from(data.roleFrom).length * ROLE_CHAR_ADVANCE : 0
  const toLen = data?.roleTo ? Array.from(data.roleTo).length * ROLE_CHAR_ADVANCE : 0
  const fromSense: 'forward' | 'backward' =
    rolePoly && roleFit && data?.roleFrom
      ? resolveRoleSense(rolePoly, fromStart, fromLen, data.roleFromSense)
      : 'forward'
  const toSense: 'forward' | 'backward' =
    rolePoly && roleFit && data?.roleTo
      ? resolveRoleSense(rolePoly, Math.max(0, toStart - toLen), toLen, data.roleToSense)
      : 'forward'
  const roleTextStyle = {
    fontSize: 10,
    fontStyle: 'italic',
    fill: 'var(--color-muted-foreground)',
    paintOrder: 'stroke' as const,
    stroke: 'var(--color-background)',
    strokeWidth: 3,
    pointerEvents: 'none' as const,
  }

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
        {isSelfLoop && roleFit && (data?.roleFrom || data?.roleTo) && (
          <>
            <defs>
              <path id={rolePathId} d={edgePath} fill="none" stroke="none" />
              <path id={rolePathRevId} d={edgePathReverse} fill="none" stroke="none" />
            </defs>
            {data?.roleFrom && (
              <text style={roleTextStyle} textAnchor={fromSense === 'backward' ? 'end' : 'start'}>
                <textPath
                  href={`#${fromSense === 'backward' ? rolePathRevId : rolePathId}`}
                  startOffset={fromSense === 'backward' ? roleTotal - fromStart : fromStart}
                  dy={fromSense === 'backward' ? -roleDy : roleDy}
                >
                  {data.roleFrom}
                </textPath>
              </text>
            )}
            {data?.roleTo && (
              <text style={roleTextStyle} textAnchor={toSense === 'backward' ? 'start' : 'end'}>
                <textPath
                  href={`#${toSense === 'backward' ? rolePathRevId : rolePathId}`}
                  startOffset={toSense === 'backward' ? toDist : toStart}
                  dy={toSense === 'backward' ? -roleDy : roleDy}
                >
                  {data.roleTo}
                </textPath>
              </text>
            )}
          </>
        )}
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
            {!isSelfLoop && data.roleFrom && (
              <span
                className="text-[10px] italic text-muted-foreground whitespace-nowrap bg-background/80 rounded-sm px-0.5"
                style={{
                  position: 'absolute',
                  pointerEvents: 'none',
                  ...roleOuterStyle(sourcePosition),
                }}
              >
                {data.roleFrom}
              </span>
            )}
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
            {!isSelfLoop && data.roleTo && (
              <span
                className="text-[10px] italic text-muted-foreground whitespace-nowrap bg-background/80 rounded-sm px-0.5"
                style={{
                  position: 'absolute',
                  pointerEvents: 'none',
                  ...roleOuterStyle(targetPosition),
                }}
              >
                {data.roleTo}
              </span>
            )}
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
                  className="px-3 py-0.5 text-[10.5px] self-stretch text-left"
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
              {id} | Cf:{data?.cardFrom ?? '–'}→{data?.cardTo ?? '–'} | S:{sourceHandle ?? '∅'}→{resolvedSource} | T:{targetHandle ?? '∅'}→{resolvedTarget} | gF:{srcGroup.length} gT:{tgtGroup.length} | off:{Math.round(fromEdgeOff)}/{Math.round(toEdgeOff)} | pos:{sourcePosition}/{targetPosition} | rF:{data?.roleFromPos ?? 0} rT:{data?.roleToPos ?? 0} | mF:{Math.round(roleFit?.maxFrom ?? 0)} mT:{Math.round(roleFit?.maxTo ?? 0)} | sF:{fromSense} sT:{toSense}
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
                {data?.roleFrom && (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="mr-1 text-[10px] font-semibold text-muted-foreground uppercase w-14 shrink-0">Rôle ⇤</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={Math.round((data?.roleFromPos ?? 0) * 100)}
                        onChange={(e) => updateReflexiveConfig('roleFromPos', Number(e.target.value) / 100)}
                        style={{ flex: 1, height: 3, accentColor: 'hsl(var(--primary))' }}
                      />
                      <span className="text-[10px] text-muted-foreground tabular-nums w-7 text-right">
                        {Math.round((data?.roleFromPos ?? 0) * 100)}
                      </span>
                      {data?.roleFromPos != null && data.roleFromPos !== 0 && (
                        <button
                          onClick={() => resetReflexiveConfig('roleFromPos')}
                          className="rounded px-1 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Réinitialiser (0)"
                        >
                          ↺
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 pl-[3.75rem]">
                      <span className="mr-1 text-[10px] text-muted-foreground">Sens</span>
                      {(['auto', 'forward', 'backward'] as const).map((s) => {
                        const active = (data?.roleFromSense ?? 'auto') === s
                        return (
                          <button
                            key={s}
                            onClick={() =>
                              s === 'auto'
                                ? resetReflexiveConfig('roleFromSense')
                                : updateReflexiveConfig('roleFromSense', s)
                            }
                            className={`rounded px-1.5 py-0.5 text-[10px] transition-colors ${
                              active ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted'
                            }`}
                            title={
                              s === 'auto'
                                ? `Automatique (actuel : ${fromSense === 'backward' ? 'inversé' : 'normal'})`
                                : s === 'forward'
                                  ? 'Sens normal'
                                  : 'Sens inversé'
                            }
                          >
                            {s === 'auto' ? 'Auto' : s === 'forward' ? 'Normal' : 'Inversé'}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
                {data?.roleTo && (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="mr-1 text-[10px] font-semibold text-muted-foreground uppercase w-14 shrink-0">Rôle ⇥</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={Math.round((data?.roleToPos ?? 0) * 100)}
                        onChange={(e) => updateReflexiveConfig('roleToPos', Number(e.target.value) / 100)}
                        style={{ flex: 1, height: 3, accentColor: 'hsl(var(--primary))' }}
                      />
                      <span className="text-[10px] text-muted-foreground tabular-nums w-7 text-right">
                        {Math.round((data?.roleToPos ?? 0) * 100)}
                      </span>
                      {data?.roleToPos != null && data.roleToPos !== 0 && (
                        <button
                          onClick={() => resetReflexiveConfig('roleToPos')}
                          className="rounded px-1 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Réinitialiser (0)"
                        >
                          ↺
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 pl-[3.75rem]">
                      <span className="mr-1 text-[10px] text-muted-foreground">Sens</span>
                      {(['auto', 'forward', 'backward'] as const).map((s) => {
                        const active = (data?.roleToSense ?? 'auto') === s
                        return (
                          <button
                            key={s}
                            onClick={() =>
                              s === 'auto'
                                ? resetReflexiveConfig('roleToSense')
                                : updateReflexiveConfig('roleToSense', s)
                            }
                            className={`rounded px-1.5 py-0.5 text-[10px] transition-colors ${
                              active ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted'
                            }`}
                            title={
                              s === 'auto'
                                ? `Automatique (actuel : ${toSense === 'backward' ? 'inversé' : 'normal'})`
                                : s === 'forward'
                                  ? 'Sens normal'
                                  : 'Sens inversé'
                            }
                          >
                            {s === 'auto' ? 'Auto' : s === 'forward' ? 'Normal' : 'Inversé'}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  )
}
