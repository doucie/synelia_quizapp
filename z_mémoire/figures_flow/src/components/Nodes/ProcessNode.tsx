import { Handle, Position, type NodeProps } from '@xyflow/react'
import { clsx } from 'clsx'
import type { EntityNodeData } from '../../types'

/* ── Helpers ───────────────────────────────────────────────── */

function hsla(color: string | undefined, alpha: number): string | undefined {
  if (!color) return
  const m = color.match(/^hsl\((\d+)/)
  if (!m) return
  return `hsla(${m[1]}, 100%, 40%, ${alpha})`
}

const META_LABEL: Record<string, string> = {
  manual: 'manuel',
  interactive: 'interactif',
  auto: 'auto',
  eval: 'manuel',
  adm: 'manuel',
}

/* ── Shared handles ────────────────────────────────────────── */

function Handles() {
  return (
    <>
      <Handle id="right" type="source" position={Position.Right} className="nodrag nopan h-[10px] w-[10px] border-none bg-gray-400" />
      <Handle id="left" type="source" position={Position.Left} className="nodrag nopan h-[10px] w-[10px] border-none opacity-0" />
      <Handle id="top" type="source" position={Position.Top} className="nodrag nopan h-[10px] w-[10px] border-none opacity-0" />
      <Handle id="bottom" type="source" position={Position.Bottom} className="nodrag nopan h-[10px] w-[10px] border-none opacity-0" />
      <Handle id="left" type="target" position={Position.Left} className="nodrag nopan h-[10px] w-[10px] border-none bg-gray-400" />
      <Handle id="right" type="target" position={Position.Right} className="nodrag nopan h-[10px] w-[10px] border-none opacity-0" />
      <Handle id="top" type="target" position={Position.Top} className="nodrag nopan h-[10px] w-[10px] border-none opacity-0" />
      <Handle id="bottom" type="target" position={Position.Bottom} className="nodrag nopan h-[10px] w-[10px] border-none opacity-0" />
    </>
  )
}

/* ── MCT Event ─────────────────────────────────────────────── */

function MctEvent({ data }: { data: EntityNodeData }) {
  const { label, color, detail } = data
  return (
    <div className={clsx('flex flex-col rounded-2xl border border-solid shadow-[0_7px_9px_0_rgba(0,0,0,0.02)]', 'border-border bg-background/70 min-w-[200px]')} style={color ? { borderColor: color } : undefined}>
      <div className="border-border rounded-t-2xl border-b border-solid px-3 py-2 text-xs font-semibold text-foreground" style={color ? { backgroundColor: hsla(color, 0.094), color } : undefined}>
        {label}
      </div>
      <div className="bg-background relative flex flex-col gap-1 rounded-b-2xl p-3 text-xs text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: detail || '' }} />
      <Handles />
    </div>
  )
}

/* ── MCT Sync ──────────────────────────────────────────────── */

function MctSync({ data }: { data: EntityNodeData }) {
  const { label, color, expression } = data
  return (
    <div
      className={clsx('flex flex-col items-center justify-center px-3.5 py-2.5 text-center shadow-[0_7px_9px_0_rgba(0,0,0,0.02)]', 'bg-background/70 min-w-[240px]')}
      style={{
        border: color ? `2px solid ${color}` : '2px solid hsl(30, 100%, 40%)',
        clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
        background: color ? hsla(color, 0.15) : undefined,
        color: color || undefined,
      }}
    >
      <span className="text-[9.5px] font-bold uppercase tracking-wider opacity-70 block mb-1">Synchronisation</span>
      <span className="text-xs font-bold font-mono leading-tight">{expression || label}</span>
      <Handles />
    </div>
  )
}

/* ── MCT Operation ─────────────────────────────────────────── */

function MctOperation({ data }: { data: EntityNodeData }) {
  const { label, color, items } = data
  return (
    <div className={clsx('flex flex-col rounded-2xl border-2 border-solid shadow-[0_7px_9px_0_rgba(0,0,0,0.02)]', 'border-border bg-background/70')} style={color ? { borderColor: color } : undefined}>
      <div className="border-border rounded-t-2xl border-b border-solid px-3 py-2 text-xs font-semibold text-foreground" style={color ? { backgroundColor: hsla(color, 0.094), color } : undefined}>
        {label}
      </div>
      <div className="bg-background relative flex flex-col gap-1 rounded-b-2xl p-3 text-xs leading-relaxed">
        {items?.map((item, i) => (
          <div key={i} className="flex items-baseline gap-1.5 py-0.5">
            <span style={color ? { color } : undefined}>▸</span>
            <span className="text-foreground" dangerouslySetInnerHTML={{ __html: item }} />
          </div>
        ))}
      </div>
      <Handles />
    </div>
  )
}

/* ── MCT Result ────────────────────────────────────────────── */

function MctResult({ data }: { data: EntityNodeData }) {
  const { label, color, detail } = data
  const bodyBg = color ? hsla(color, 0.15) : undefined
  return (
    <div
      className={clsx('flex flex-col border border-solid shadow-[0_7px_9px_0_rgba(0,0,0,0.02)] min-w-[200px]', 'bg-background/70')}
      style={{
        borderColor: color || undefined,
        background: bodyBg,
        borderRadius: '4px 4px 14px 14px',
      }}
    >
      <div className="px-2.5 py-1.5 text-[10.5px] font-semibold text-white uppercase tracking-wider" style={color ? { background: color, borderRadius: '2px 2px 0 0' } : undefined}>
        {label}
      </div>
      <div className="px-2.5 py-1.5 pb-2.5 text-[11px] leading-relaxed text-foreground" dangerouslySetInnerHTML={{ __html: detail || '' }} />
      <Handles />
    </div>
  )
}

/* ── SAT Head ──────────────────────────────────────────────── */

function SatHead({ data }: { data: EntityNodeData }) {
  const { label, color } = data
  return (
    <div
      className={clsx('flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-bold uppercase tracking-wider shadow-[0_7px_9px_0_rgba(0,0,0,0.02)]', 'border-border bg-background/70')}
      style={color ? { backgroundColor: hsla(color, 0.094), color, border: `1px solid ${color}` } : { borderWidth: 1 }}
    >
      {label}
      <Handles />
    </div>
  )
}

/* ── SAT Phase ─────────────────────────────────────────────── */

function SatPhase({ data }: { data: EntityNodeData }) {
  const { label, color } = data
  return (
    <div
      className={clsx('flex flex-col items-center justify-center rounded-2xl px-3 py-2 text-center text-xs font-bold uppercase tracking-wider shadow-[0_7px_9px_0_rgba(0,0,0,0.02)]', 'bg-background/70')}
      style={{
        border: color ? `1px dashed ${color}` : '1px dashed hsl(15, 100%, 50%)',
        background: color ? hsla(color, 0.094) : undefined,
        color: color || undefined,
      }}
    >
      {label}
      <Handles />
    </div>
  )
}

/* ── SAT Task ──────────────────────────────────────────────── */

function SatTask({ data }: { data: EntityNodeData }) {
  const { label, color, meta, detail } = data
  const mode = meta || 'manual'
  return (
    <div
      className={clsx('flex flex-col rounded-2xl shadow-[0_7px_9px_0_rgba(0,0,0,0.02)] min-w-[200px]', 'bg-background/70')}
      style={color ? { border: `1.5px solid ${color}` } : { border: '1.5px solid hsl(270, 100%, 40%)' }}
    >
      <div className="font-bold text-xs mb-1 px-3 pt-2 leading-tight" style={color ? { color } : undefined}>
        {label}
      </div>
      <div className="px-3 pb-2 flex flex-col gap-1">
        <span
          className="inline-block text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold mr-1 w-fit"
          style={color ? { backgroundColor: hsla(color, 0.2), color } : undefined}
        >
          {META_LABEL[mode] || mode}
        </span>
        {detail && (
          <div className="text-[10.5px] leading-snug text-muted-foreground">{detail}</div>
        )}
      </div>
      <Handles />
    </div>
  )
}

/* ── SAT Lane (decorative background) ─────────────────────── */

function SatLane({ data }: { data: EntityNodeData }) {
  const { color, dimensions } = data
  const dims = dimensions || { width: 240, height: 400 }
  return (
    <div
      className="pointer-events-none rounded-2xl border border-dashed"
      style={{
        width: dims.width,
        height: dims.height,
        background: color ? hsla(color, 0.035) : 'rgba(0,0,0,0.015)',
        borderColor: color ? hsla(color, 0.2) : undefined,
      }}
    />
  )
}

/* ── MPT Layer ─────────────────────────────────────────────── */

function MptLayer({ data }: { data: EntityNodeData }) {
  const { label, color, items, layer } = data
  const firstKey =
    layer === 'trigger' ? 'E' :
    layer === 'fe' ? 'Pg' :
    layer === 'controller' ? 'CT' :
    layer === 'service' ? 'SV' :
    layer === 'repo' ? 'RP' :
    layer === 'db' ? 'DB' :
    layer === 'ext' ? 'EXT' : 'R'

  return (
    <div
      className={clsx('flex flex-col rounded-2xl border border-solid shadow-[0_7px_9px_0_rgba(0,0,0,0.02)] min-w-[180px]', 'border-border bg-background/70')}
      style={color ? { borderColor: color } : undefined}
    >
      <div className="border-border rounded-t-2xl border-b border-solid px-2.5 py-1.5 text-xs font-semibold" style={color ? { backgroundColor: hsla(color, 0.094), color } : undefined}>
        {label}
      </div>
      <div className="bg-background relative flex flex-col gap-1 rounded-b-2xl p-2.5 text-[11px]">
        {items?.map((item, i) => (
          <div key={i} className="flex items-baseline gap-1.5 py-0.5 leading-snug">
            {i === 0 && (
              <span
                className="font-bold text-[9.5px] px-1 py-0.5 rounded min-w-[22px] text-center"
                style={color ? { backgroundColor: hsla(color, 0.2), color } : undefined}
              >
                {firstKey}
              </span>
            )}
            {i === 0 ? (
              <span className="font-bold" style={color ? { color } : undefined}>{item}</span>
            ) : (
              <span className="text-foreground ml-[30px]">{item}</span>
            )}
          </div>
        ))}
      </div>
      <Handles />
    </div>
  )
}

/* ── Router ────────────────────────────────────────────────── */

export default function ProcessNode({ data }: NodeProps<EntityNodeData>) {
  switch (data.variant) {
    case 'mct-event': return <MctEvent data={data} />
    case 'mct-sync': return <MctSync data={data} />
    case 'mct-operation': return <MctOperation data={data} />
    case 'mct-result': return <MctResult data={data} />
    case 'sat-head': return <SatHead data={data} />
    case 'sat-phase': return <SatPhase data={data} />
    case 'sat-task': return <SatTask data={data} />
    case 'sat-lane': return <SatLane data={data} />
    case 'mpt-layer': return <MptLayer data={data} />
    default: return null
  }
}
