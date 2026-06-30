import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { EntityNodeData } from '../../types'
import { clsx } from 'clsx'

export default function EntityNode({ data }: NodeProps<EntityNodeData>) {
  const { label, variant, attributes, color } = data

  return (
    <div
      className={clsx(
        'flex h-full flex-col rounded-2xl border border-solid shadow-[0_7px_9px_0_rgba(0,0,0,0.02)]',
        'border-border bg-background/70 min-w-[200px]',
      )}
      style={color ? { borderColor: color } : undefined}
    >
      <div
        className={clsx(
          'border-border rounded-t-2xl border-b border-solid px-3 py-2 text-xs font-semibold flex items-center justify-between',
          variant === 'mcd' && 'bg-muted text-foreground',
          variant === 'mld' && 'bg-primary/10 text-primary',
          variant === 'mpd' && 'bg-primary/10 text-primary',
        )}
        style={color ? { backgroundColor: `${color}18`, color } : undefined}
      >
        <span>{label}</span>
        {(variant === 'mld' || variant === 'mpd') && (
          <span className="rounded bg-primary/20 px-1.5 text-[10px] font-bold text-primary">
            TABLE
          </span>
        )}
      </div>

      <div className="bg-background relative flex flex-col gap-1 rounded-b-2xl p-3">
        {attributes.map((attr, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {attr.isPK && (
              <span className="rounded bg-primary/20 px-1 text-[10px] font-bold text-primary">
                PK
              </span>
            )}
            {attr.isFK && (
              <span className="rounded bg-blue-200/60 px-1 text-[10px] font-bold text-blue-800 dark:bg-blue-800/40 dark:text-blue-300">
                FK
              </span>
            )}
            <span className={clsx(attr.isPK && 'font-bold text-primary', 'text-foreground')}>
              {attr.name}
            </span>
            {attr.type && variant === 'mpd' && (
              <span className="text-muted-foreground">{attr.type}</span>
            )}
          </div>
        ))}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="nodrag nopan h-[10px] w-[10px] border-none bg-gray-400"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="nodrag nopan h-[10px] w-[10px] border-none bg-gray-400"
      />
    </div>
  )
}
