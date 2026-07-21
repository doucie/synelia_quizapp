import { Handle, Position, type NodeProps } from '@xyflow/react'
import { clsx } from 'clsx'
import type { EntityNodeData, MotTreatmentData } from '../../types'

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
  const { label, color } = data
  return (
    <div className={clsx('flex flex-col items-center justify-center rounded-2xl border border-solid shadow-[0_7px_9px_0_rgba(0,0,0,0.02)]', 'border-border bg-background/70 min-w-[180px] px-4 py-3')} style={color ? { borderColor: color } : undefined}>
      <span className="text-xs font-semibold text-foreground text-center leading-snug" style={color ? { color } : undefined}>{label}</span>
      <Handles />
    </div>
  )
}

/* ── MCT Sync ──────────────────────────────────────────────── */

function MctSync({ data }: { data: EntityNodeData }) {
  const { color, label } = data
  return (
    <div
      className={clsx('flex flex-col items-center justify-center px-4 py-3 text-center shadow-[0_7px_9px_0_rgba(0,0,0,0.02)]', 'bg-background/70 min-w-[80px]')}
      style={{
        border: color ? `2px solid ${color}` : '2px solid hsl(330, 100%, 40%)',
        clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
        background: color ? hsla(color, 0.15) : undefined,
        color: color || undefined,
      }}
    >
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      <Handles />
    </div>
  )
}

/* ── MCT Operation ─────────────────────────────────────────── */

function MctOperation({ data }: { data: EntityNodeData }) {
  const { label, color, items, emissionRules } = data
  const rules = emissionRules ?? []
  return (
    <div className={clsx('flex flex-col rounded-2xl border-2 border-solid shadow-[0_7px_9px_0_rgba(0,0,0,0.02)]', 'border-border bg-background/70 min-w-[280px]')} style={color ? { borderColor: color } : undefined}>
      <div className="border-border rounded-t-2xl border-b-2 border-solid px-3 py-2 text-xs font-semibold text-foreground" style={color ? { backgroundColor: hsla(color, 0.094), color, borderColor: color } : { borderColor: 'hsl(var(--border))' }}>
        {label}
      </div>
      <div className="bg-background relative flex flex-col gap-1 p-3 text-xs leading-relaxed">
        {items?.map((item, i) => (
          <div key={i} className="flex items-start gap-1.5 py-0.5">
            <span className="text-foreground font-medium">{i + 1}.</span>
            <span className="text-foreground">{item}</span>
          </div>
        ))}
      </div>
      {rules.length > 0 && (
        <div className="border-t-2 border-border px-3 text-[10.5px] leading-relaxed" style={color ? { backgroundColor: hsla(color, 0.06), borderColor: color } : { backgroundColor: 'hsl(var(--muted))' }}>
          <div className="flex items-stretch">
            {rules.map((branch, i) => (
              <div key={i} className="flex-1 flex items-center justify-center px-2 py-2 text-center" style={i > 0 ? { borderLeft: `2px solid ${color || 'hsl(var(--border))'}` } : undefined}>
                <span className="font-medium text-foreground" dangerouslySetInnerHTML={{ __html: branch }} />
              </div>
            ))}
          </div>
        </div>
      )}
      <Handle id="top" type="target" position={Position.Top} className="nodrag nopan h-[10px] w-[10px] border-none opacity-0" />
      {rules.length > 0
        ? rules.map((branch, i) => (
          <Handle
            key={branch}
            id={branch}
            type="source"
            position={Position.Bottom}
            className="nodrag nopan h-[10px] w-[10px] border-none bg-gray-400"
            style={{ left: `${((i + 0.5) / rules.length) * 100}%` }}
          />
        ))
        : <Handles />
      }
    </div>
  )
}

/* ── MCT Result ────────────────────────────────────────────── */

function MctResult({ data }: { data: EntityNodeData }) {
  const { label, color } = data
  return (
    <div
      className="flex items-center justify-center rounded-2xl border border-solid min-w-[160px] px-3 py-2 shadow-[0_7px_9px_0_rgba(0,0,0,0.02)]"
      style={color ? { borderColor: color, background: hsla(color, 0.094), color } : undefined}
    >
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-center">{label}</span>
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
      className={clsx('flex flex-col rounded-2xl shadow-[0_7px_9px_0_rgba(0,0,0,0.02)] min-w-[180px] max-w-[225px] break-words', 'bg-background/70')}
      style={color ? { border: `1.5px solid ${color}` } : { border: '1.5px solid hsl(270, 100%, 40%)' }}
    >
      <div className="font-bold text-xs mb-1 px-3 pt-2 leading-tight break-words" style={color ? { color } : undefined}>
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
          <div className="text-[10.5px] leading-snug text-muted-foreground break-words">{detail}</div>
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

/* ── MOT MCT Cell (mini-MCT inside a matrix cell) ────────── */

const MOT_COLORS = {
  event: 'hsl(270, 100%, 40%)',
  sync: 'hsl(330, 100%, 40%)',
  operation: 'hsl(166, 100%, 40%)',
  resultOk: 'hsl(128, 100%, 40%)',
  resultKo: 'hsl(0, 100%, 40%)',
}

function MotEvent({ label, isTrigger }: { label: string; isTrigger: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-solid px-2 py-1.5 text-center"
      style={{
        borderColor: MOT_COLORS.event,
        opacity: isTrigger ? 1 : 0.5,
        backgroundColor: isTrigger ? hsla(MOT_COLORS.event, 0.12) : 'transparent',
      }}
    >
      <span className="text-[8px] font-semibold leading-snug" style={{ color: MOT_COLORS.event }}>{label}</span>
    </div>
  )
}

function MotSync({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-3 py-1 text-center"
      style={{
        border: `2px solid ${MOT_COLORS.sync}`,
        clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
        backgroundColor: hsla(MOT_COLORS.sync, 0.15),
        color: MOT_COLORS.sync,
      }}
    >
      <span className="text-[8px] font-bold uppercase tracking-wider">{label}</span>
    </div>
  )
}

function MotOperation({ mctOp }: { mctOp: MotTreatmentData['mctOperation'] }) {
  const { label, items, rules } = mctOp
  return (
    <div className="flex flex-col rounded-2xl border-2 border-solid" style={{ borderColor: MOT_COLORS.operation }}>
      <div
        className="rounded-t-2xl border-b-2 border-solid px-2 py-1 text-[8px] font-semibold"
        style={{ backgroundColor: hsla(MOT_COLORS.operation, 0.094), color: MOT_COLORS.operation, borderColor: MOT_COLORS.operation }}
      >
        {label}
      </div>
      <div className="flex flex-col gap-0.5 px-2 py-1 text-[7px] leading-relaxed">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-1">
            <span className="text-foreground font-medium">{i + 1}.</span>
            <span className="text-foreground">{item}</span>
          </div>
        ))}
      </div>
      {rules.length > 0 && (
        <div className="border-t-2 px-2 text-[7px] leading-relaxed" style={{ borderColor: MOT_COLORS.operation, backgroundColor: hsla(MOT_COLORS.operation, 0.06) }}>
          <div className="flex items-stretch">
            {rules.map((r, i) => (
              <div key={i} className="flex-1 flex items-center justify-center px-1 py-1 text-center" style={i > 0 ? { borderLeft: `2px solid ${MOT_COLORS.operation}` } : undefined}>
                <span className="font-medium text-foreground">{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MotResult({ label, fail }: { label: string; fail?: boolean }) {
  const c = fail ? MOT_COLORS.resultKo : MOT_COLORS.resultOk
  return (
    <div
      className="flex items-center justify-center rounded-2xl border border-solid px-2 py-1"
      style={{ borderColor: c, background: hsla(c, 0.094), color: c }}
    >
      <span className="text-[7.5px] font-semibold uppercase tracking-wider text-center">{label}</span>
    </div>
  )
}

function MotMctCell({ treatment }: { treatment: MotTreatmentData }) {
  const { triggeringEvent, mctEvents, mctSync, mctOperation, mctResults } = treatment
  return (
    <div className="relative flex flex-col items-center gap-0 py-1">
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 pointer-events-none w-px bg-border" />
      <div className="relative z-10 w-full flex flex-col items-center gap-[6px]">
        {mctEvents.map((evt) => (
          <MotEvent key={evt} label={evt} isTrigger={evt === triggeringEvent} />
        ))}
        {mctSync && <MotSync label={mctSync} />}
        <MotOperation mctOp={mctOperation} />
        {mctResults.map((res) => (
          <MotResult key={res.label} label={res.label} fail={res.fail} />
        ))}
      </div>
    </div>
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

/* ── MOT Matrix (acteurs × traitements grid) ─────────────── */

function MotMatrix({ data }: { data: EntityNodeData }) {
  const { color, motMatrix } = data
  const columns = motMatrix?.columns ?? []
  const treatments = motMatrix?.treatments ?? []
  return (
    <div
      className={clsx('flex flex-col rounded-2xl border-2 border-solid shadow-[0_7px_9px_0_rgba(0,0,0,0.02)]', 'border-border bg-background/70')}
      style={color ? { borderColor: color } : undefined}
    >
      <div
        className="rounded-t-2xl border-b-2 border-solid px-4 py-2.5 text-xs font-bold text-foreground"
        style={color ? { backgroundColor: hsla(color, 0.094), color, borderColor: color } : { borderColor: 'hsl(var(--border))' }}
      >
        MOT — Modèle Organisationnel de Traitement
      </div>
      <div className="overflow-x-auto">
        <table className="border-collapse text-[9px] leading-relaxed">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left font-bold text-foreground border-b-2 border-border" style={color ? { color } : undefined}>Traitement</th>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 text-center font-bold text-foreground border-b-2 border-l-2 border-border min-w-[200px]" style={color ? { color } : undefined}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {treatments.map((t, i) => (
              <tr key={t.id} style={i < treatments.length - 1 ? { borderBottom: `1px solid ${color ? hsla(color, 0.15) : 'hsl(var(--border))'}` } : undefined}>
                <td className="px-3 py-2 align-top border-r-2 border-border" style={{ borderColor: color ? hsla(color, 0.15) : undefined }}>
                  <div className="font-bold text-foreground">{t.id}</div>
                  <div className="text-muted-foreground mt-0.5">{t.label}</div>
                  <div className="text-muted-foreground italic mt-0.5">{t.nature}</div>
                </td>
                {columns.map((col) => (
                  <td key={col} className="px-2 py-1 align-top border-l-2 border-border" style={{ borderColor: color ? hsla(color, 0.15) : undefined }}>
                    {t.actor === col ? <MotMctCell treatment={t} /> : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
    case 'mot-matrix': return <MotMatrix data={data} />
    default: return null
  }
}
