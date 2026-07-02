import {
  BaseEdge,
  getSmoothStepPath,
  EdgeLabelRenderer,
  type EdgeProps,
} from '@xyflow/react'
import type { RelationshipEdgeData } from '../../types'

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

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        className={strokeClass}
        style={{
          strokeWidth: isStrong ? 2 : 1.5,
          strokeDasharray: isDashed ? '6 4' : undefined,
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
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
        </EdgeLabelRenderer>
      )}
    </>
  )
}
