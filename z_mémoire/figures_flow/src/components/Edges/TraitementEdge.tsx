import { useState, useEffect, useRef, useMemo } from 'react'
import {
  BaseEdge,
  getSmoothStepPath,
  getStraightPath,
  EdgeLabelRenderer,
  useReactFlow,
  useEdges,
  useNodes,
  type EdgeProps,
  type Node,
} from '@xyflow/react'
import type { RelationshipEdgeData } from '../../types'
import { setCardinalitySide } from '../../hooks/useDiagramState'
import {
  resolveHandleId,
  edgeAnchorGroup,
  edgePathOffset,
  validHandles,
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

export default function TraitementEdge({
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
  // `noAnchorOffset` : descente droite sur l’axe (arbre de décision) — l’offset
  // d’ancrage partagé est ignoré des deux côtés, le `smoothstep` à x1 == x2
  // dégénère en droite verticale pure et la pastille tombe pile dessus.
  const noOff = data?.noAnchorOffset === true
  const sx = srcOnHorizontalSide ? sourceX : sourceX + (noOff ? 0 : fromEdgeOff)
  const sy = srcOnHorizontalSide ? sourceY + (noOff ? 0 : fromEdgeOff) : sourceY
  const tx = tgtOnHorizontalSide ? targetX : targetX + (noOff ? 0 : toEdgeOff)
  const ty = tgtOnHorizontalSide ? targetY + (noOff ? 0 : toEdgeOff) : targetY

  // Sur les figures MCT, un segment droit : l'éventail des règles d'émission est
  // déjà réparti le long du bord inférieur du nœud d'opération, donc les diagonales
  // partent de points distincts et n'ont plus besoin du coude orthogonal pour se
  // distinguer. `sx`/`sy`/`tx`/`ty` portent déjà l'offset d'ancrage : il produit
  // des diagonales parallèles là où il produisait des marches parallèles, sans
  // qu'aucun réglage de `edgeAnchors.ts` ne change.
  // Les deux fonctions renvoient `[path, labelX, labelY, …]` : label et overlay
  // de debug restent donc alignés sur le milieu de l'arête dans les deux cas.
  const [edgePath, labelX, labelY] = data.straight
    ? getStraightPath({
        sourceX: sx,
        sourceY: sy,
        targetX: tx,
        targetY: ty,
      })
    : getSmoothStepPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition,
        targetX: tx,
        targetY: ty,
        targetPosition,
        borderRadius: 8,
      })

  const isDashed = data?.isDashed ?? false
  const isStrong = data?.isStrong ?? false
  const strokeClass = selected ? 'stroke-primary' : 'stroke-[var(--xy-edge-stroke-default)]'
  // Couleur posée par la figure (`data.stroke`), comme `OrgBusEdge` : le
  // `className` fige une couleur unique, impossible par arête autrement.
  // Sélection prioritaire, défaut inchangé quand `stroke` est absent.
  const stroke = selected ? undefined : data?.stroke

  const handleSideChange = (which: 'from' | 'to', side: string) => {
    const handle = HANDLE_ID[side]
    const nodeId = which === 'from' ? source : target
    const node = getNode(nodeId)
    const valid = validHandles(node, which === 'from' ? 'source' : 'target')
    if (handle && !valid.has(handle)) return

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

  const validFrom = useMemo(() => validHandles(sourceNode, 'source'), [sourceNode])
  const validTo = useMemo(() => validHandles(targetNode, 'target'), [targetNode])

  return (
    <>
      <g onClick={openPopover} style={{ cursor: 'pointer' }}>
        <BaseEdge
          id={id}
          path={edgePath}
          className={strokeClass}
          style={{
            stroke,
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
              left: labelX,
              top: labelY,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-3 py-1 leading-none text-foreground shadow-sm"
              style={{
                fontSize: data.labelPx ?? 10,
                padding: (data.labelPx ?? 10) >= 20 ? '8px 16px' : undefined,
              }}
            >
              {data.label}
            </span>
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
                left: labelX - 320,
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
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  )
}
