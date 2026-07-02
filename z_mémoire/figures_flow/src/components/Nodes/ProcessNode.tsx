import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { EntityNodeData } from '../../types'

/* ── Color maps ────────────────────────────────────────────── */

const SAT_HEAD: Record<string, { bg: string; fg: string }> = {
  auto: { bg: '#0ea5e9', fg: '#fff' },
  alt: { bg: '#7c3aed', fg: '#fff' },
  eval: { bg: '#f59e0b', fg: '#422006' },
  adm: { bg: '#16a34a', fg: '#fff' },
}

const SAT_META: Record<string, { border: string; bg: string; fg: string }> = {
  manual: { border: '#7c3aed', bg: '#ede9fe', fg: '#7c3aed' },
  interactive: { border: '#f59e0b', bg: '#f59e0b', fg: '#fff' },
  auto: { border: '#0ea5e9', bg: '#0ea5e9', fg: '#fff' },
  eval: { border: '#f59e0b', bg: '#fef3c7', fg: '#92400e' },
  adm: { border: '#16a34a', bg: '#dcfce7', fg: '#166534' },
}

const META_LABEL: Record<string, string> = {
  manual: 'manuel',
  interactive: 'interactif',
  auto: 'auto',
  eval: 'manuel',
  adm: 'manuel',
}

const MPT_LAYER: Record<string, { border: string; headBg: string; headFg: string }> = {
  trigger: { border: '#4f46e5', headBg: '#312e81', headFg: '#fff' },
  fe: { border: '#0ea5e9', headBg: '#0ea5e9', headFg: '#fff' },
  controller: { border: '#f59e0b', headBg: '#f59e0b', headFg: '#fff' },
  service: { border: '#7c3aed', headBg: '#7c3aed', headFg: '#fff' },
  repo: { border: '#16a34a', headBg: '#16a34a', headFg: '#fff' },
  db: { border: '#dc2626', headBg: '#dc2626', headFg: '#fff' },
  ext: { border: '#64748b', headBg: '#64748b', headFg: '#fff' },
  result: { border: '#059669', headBg: '#059669', headFg: '#fff' },
}

const LANE_STYLES: Record<string, { bg: string; border: string }> = {
  auto: { bg: 'rgba(14,165,233,0.05)', border: '#bae6fd' },
  alt: { bg: 'rgba(124,58,237,0.05)', border: '#d8b4fe' },
  eval: { bg: 'rgba(245,158,11,0.05)', border: '#fde68a' },
  adm: { bg: 'rgba(22,163,74,0.05)', border: '#bbf7d0' },
}

/* ── Helpers ───────────────────────────────────────────────── */

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
  return (
    <div className="flex flex-col rounded-xl border border-solid bg-white shadow-[0_2px_6px_rgba(15,23,42,0.06)] min-w-[180px]" style={{ borderColor: '#0ea5e9' }}>
      <div className="rounded-t-[10.5px] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white" style={{ background: '#0ea5e9' }}>
        {data.label}
      </div>
      <div className="px-2.5 py-1.5 text-[11px] text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: data.detail || '' }} />
      <Handles />
    </div>
  )
}

/* ── MCT Sync ──────────────────────────────────────────────── */

function MctSync({ data }: { data: EntityNodeData }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-3.5 py-2.5 text-center"
      style={{
        border: '2px solid #f59e0b',
        background: '#fef3c7',
        color: '#92400e',
        clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
        borderRadius: 0,
        minWidth: 240,
      }}
    >
      <span className="text-[9.5px] font-bold uppercase tracking-wider opacity-75 block mb-1">Synchronisation</span>
      <span className="text-[12px] font-bold font-mono leading-tight">{data.expression || data.label}</span>
      <Handles />
    </div>
  )
}

/* ── MCT Operation ─────────────────────────────────────────── */

function MctOperation({ data }: { data: EntityNodeData }) {
  return (
    <div className="flex flex-col rounded-xl border-2 border-solid bg-white shadow-[0_4px_14px_rgba(79,70,229,0.12)]" style={{ borderColor: '#4f46e5' }}>
      <div className="px-3 py-2 text-[12.5px] font-semibold uppercase tracking-wide text-white" style={{ background: '#312e81', borderRadius: '10.5px 10.5px 0 0' }}>
        {data.label}
      </div>
      <div className="px-3 py-2 text-[11.5px]">
        {data.items?.map((item, i) => (
          <div key={i} className="flex items-baseline gap-1.5 py-0.5 leading-snug">
            <span style={{ color: '#4f46e5', fontSize: 10 }}>▸</span>
            <span dangerouslySetInnerHTML={{ __html: item }} />
          </div>
        ))}
      </div>
      <Handles />
    </div>
  )
}

/* ── MCT Result ────────────────────────────────────────────── */

function MctResult({ data }: { data: EntityNodeData }) {
  const isFail = data.fail
  const borderColor = isFail ? '#dc2626' : '#16a34a'
  const headBg = isFail ? '#dc2626' : '#16a34a'
  const bodyColor = isFail ? '#7f1d1d' : '#166534'
  const bodyBg = isFail ? '#fee2e2' : '#dcfce7'
  return (
    <div className="flex flex-col bg-white shadow-[0_2px_6px_rgba(15,23,42,0.06)] min-w-[200px]" style={{ border: `1.5px solid ${borderColor}`, background: bodyBg, borderRadius: '4px 4px 14px 14px' }}>
      <div className="px-2.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-white" style={{ background: headBg, borderRadius: '2px 2px 0 0' }}>
        {data.label}
      </div>
      <div className="px-2.5 py-1.5 pb-2.5 text-[11px] leading-relaxed" style={{ color: bodyColor }} dangerouslySetInnerHTML={{ __html: data.detail || '' }} />
      <Handles />
    </div>
  )
}

/* ── SAT Head ──────────────────────────────────────────────── */

function SatHead({ data }: { data: EntityNodeData }) {
  const style = SAT_HEAD[data.badge || ''] || { bg: '#4f46e5', fg: '#fff' }
  return (
    <div
      className="flex items-center justify-center rounded-lg px-2.5 py-2 text-[12px] font-bold uppercase tracking-wider shadow-[0_2px_8px_rgba(15,23,42,0.12)]"
      style={{ background: style.bg, color: style.fg, border: 0 }}
    >
      {data.label}
      <Handles />
    </div>
  )
}

/* ── SAT Phase ─────────────────────────────────────────────── */

function SatPhase({ data }: { data: EntityNodeData }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg px-2 py-1.5 text-center text-[11px] font-bold uppercase tracking-wider"
      style={{ border: '1px dashed #4f46e5', background: '#eef2ff', color: '#312e81' }}
    >
      {data.label}
      <Handles />
    </div>
  )
}

/* ── SAT Task ──────────────────────────────────────────────── */

function SatTask({ data }: { data: EntityNodeData }) {
  const mode = data.meta || 'manual'
  const colors = SAT_META[mode] || SAT_META.manual
  return (
    <div
      className="flex flex-col rounded-lg bg-white px-2.5 py-2 pb-2.5 text-[11.5px] min-w-[180px]"
      style={{ border: `1.5px solid ${colors.border}` }}
    >
      <div className="font-bold text-[11.5px] mb-1 leading-tight" style={{ color: '#312e81' }}>
        {data.label}
      </div>
      <span
        className="inline-block text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold mr-1 w-fit"
        style={{ background: colors.bg, color: colors.fg }}
      >
        {META_LABEL[mode] || mode}
      </span>
      <div className="text-[10.5px] mt-1 leading-snug" style={{ color: '#64748b' }}>
        {data.detail}
      </div>
      <Handles />
    </div>
  )
}

/* ── SAT Lane (decorative background) ─────────────────────── */

function SatLane({ data }: { data: EntityNodeData }) {
  const style = LANE_STYLES[data.badge || ''] || { bg: 'rgba(79,70,229,0.035)', border: '#c7d2fe' }
  const dims = data.dimensions || { width: 240, height: 400 }
  return (
    <div
      className="pointer-events-none rounded-xl border border-dashed"
      style={{
        width: dims.width,
        height: dims.height,
        background: style.bg,
        borderColor: style.border,
      }}
    />
  )
}

/* ── MPT Layer ─────────────────────────────────────────────── */

function MptLayer({ data }: { data: EntityNodeData }) {
  const layer = data.layer || 'service'
  const colors = MPT_LAYER[layer] || MPT_LAYER.service
  return (
    <div className="flex flex-col border border-solid bg-white min-w-[180px]"
      style={{ border: `1.5px solid ${colors.border}`, borderRadius: 8 }}>
      <div className="px-2.5 py-1.5 text-[11.5px] font-semibold text-white"
        style={{ background: colors.headBg, color: colors.headFg, borderRadius: '6.5px 6.5px 0 0' }}>
        {data.label}
      </div>
      <div className="px-2.5 py-1.5 pb-2 text-[11px]">
        {data.items?.map((item, i) => (
          <div key={i} className="flex items-baseline gap-1.5 py-0.5 leading-snug">
            <span className="font-bold text-[9.5px] px-1 py-0.5 rounded min-w-[22px] text-center"
              style={{ color: '#312e81', background: '#eef2ff' }}>
              {i === 0 ? (layer === 'trigger' ? 'E' : layer === 'fe' ? 'Pg' : layer === 'controller' ? 'CT' : layer === 'service' ? 'SV' : layer === 'repo' ? 'RP' : layer === 'db' ? 'DB' : layer === 'ext' ? 'EXT' : 'R') : ''}
            </span>
            <span className="flex-1" dangerouslySetInnerHTML={{ __html: item }} />
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
