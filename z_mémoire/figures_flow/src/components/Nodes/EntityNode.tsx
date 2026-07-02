import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { EntityNodeData } from '../../types'
import { clsx } from 'clsx'

function hsla(color: string | undefined, alpha: number): string | undefined {
  if (!color) return
  const m = color.match(/^hsl\((\d+)/)
  if (!m) return
  return `hsla(${m[1]}, 100%, 40%, ${alpha})`
}

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
        className="border-border rounded-t-2xl border-b border-solid px-3 py-2 text-xs font-semibold flex items-center justify-between"
        style={color ? { backgroundColor: hsla(color, 0.094), color } : undefined}
      >
        <span>{label}</span>
        {(variant === 'mld' || variant === 'mpd') && (
          <span
            className="rounded px-1.5 text-[10px] font-bold"
            style={color ? { backgroundColor: hsla(color, 0.2), color } : undefined}
          >
            TABLE
          </span>
        )}
      </div>

      <div className="bg-background relative flex flex-col gap-1 rounded-b-2xl p-3">
        {attributes.map((attr, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {attr.isPK && (
              <span
                className="rounded px-1 text-[10px] font-bold"
                style={color ? { backgroundColor: hsla(color, 0.2), color } : undefined}
              >
                PK
              </span>
            )}
            {attr.isFK && (
              <span
                className="rounded px-1 text-[10px] font-bold"
                style={color ? { backgroundColor: hsla(color, 0.2), color } : undefined}
              >
                FK
              </span>
            )}
            <span
              className={clsx((attr.isPK || attr.isFK) && 'font-bold', 'text-foreground')}
              style={color && (attr.isPK || attr.isFK) ? { color } : undefined}
            >
              {attr.name}
            </span>
            {attr.type && variant === 'mpd' && (
              <span className="text-muted-foreground">{attr.type}</span>
            )}
          </div>
        ))}
      </div>

      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="nodrag nopan h-[10px] w-[10px] border-none bg-gray-400"
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className="nodrag nopan h-[10px] w-[10px] border-none opacity-0"
      />
      <Handle
        id="top"
        type="source"
        position={Position.Top}
        className="nodrag nopan h-[10px] w-[10px] border-none opacity-0"
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="nodrag nopan h-[10px] w-[10px] border-none opacity-0"
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        className="nodrag nopan h-[10px] w-[10px] border-none bg-gray-400"
      />
      <Handle
        id="right"
        type="target"
        position={Position.Right}
        className="nodrag nopan h-[10px] w-[10px] border-none opacity-0"
      />
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="nodrag nopan h-[10px] w-[10px] border-none opacity-0"
      />
      <Handle
        id="bottom"
        type="target"
        position={Position.Bottom}
        className="nodrag nopan h-[10px] w-[10px] border-none opacity-0"
      />
    </div>
  )
}
