import { useState } from 'react'
import type { MotTableConfig } from '../types'
import { DEFAULT_MOT_TABLE_CONFIG } from '../types'

const MOT_COLOR = 'hsl(15, 100%, 40%)'

interface MotTableToolbarProps {
  config: MotTableConfig
  onChange: (config: MotTableConfig) => void
}

export default function MotTableToolbar({ config, onChange }: MotTableToolbarProps) {
  const [mode, setMode] = useState<'group' | 'detail'>('group')
  const [expanded, setExpanded] = useState(false)

  const c = config.colWidths
  const r = config.rowHeights

  const updateCol = (key: keyof MotTableConfig['colWidths'], value: number) => {
    onChange({ ...config, colWidths: { ...config.colWidths, [key]: Math.max(80, value) } })
  }

  const updateRow = (index: number, value: number) => {
    const newRowHeights = [...r]
    newRowHeights[index] = Math.max(100, value)
    onChange({ ...config, rowHeights: newRowHeights })
  }

  const updateFontScale = (value: number) => {
    onChange({ ...config, fontScale: Math.round(value * 100) / 100 })
  }

  const setAllCols = (value: number) => {
    onChange({
      ...config,
      colWidths: { temps: c.temps, recruteur: value, candidat: value, systeme: value, type: c.type },
    })
  }

  const setAllRows = (value: number) => {
    onChange({ ...config, rowHeights: r.map(() => value) })
  }

  const reset = () => onChange(DEFAULT_MOT_TABLE_CONFIG)

  const totalWidth = c.temps + c.recruteur + c.candidat + c.systeme + c.type
  const totalHeight = 35 + r.reduce((a, b) => a + b, 0)

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 130,
        left: 12,
        zIndex: 1000,
        background: 'hsl(var(--background))',
        border: `1px solid ${MOT_COLOR}`,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontSize: 11,
        pointerEvents: 'auto',
        minWidth: expanded ? 220 : undefined,
      }}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          cursor: 'pointer',
          fontWeight: 600,
          color: MOT_COLOR,
          userSelect: 'none',
        }}
      >
        <span>{expanded ? '▼' : '▶'}</span>
        <span>📐 Table MOT</span>
        <span style={{ marginLeft: 'auto', color: 'hsl(var(--muted-foreground))', fontWeight: 400, fontSize: 10 }}>
          {totalWidth}×{totalHeight}
        </span>
      </div>

      {expanded && (
        <div style={{ padding: '0 12px 10px', borderTop: `1px solid hsl(var(--border))` }}>
          <div style={{ display: 'flex', gap: 4, margin: '8px 0' }}>
            <button
              onClick={() => setMode('group')}
              style={{
                flex: 1,
                padding: '3px 0',
                borderRadius: 4,
                border: `1px solid ${mode === 'group' ? MOT_COLOR : 'hsl(var(--border))'}`,
                background: mode === 'group' ? MOT_COLOR : 'transparent',
                color: mode === 'group' ? '#fff' : 'hsl(var(--muted-foreground))',
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Grouper
            </button>
            <button
              onClick={() => setMode('detail')}
              style={{
                flex: 1,
                padding: '3px 0',
                borderRadius: 4,
                border: `1px solid ${mode === 'detail' ? MOT_COLOR : 'hsl(var(--border))'}`,
                background: mode === 'detail' ? MOT_COLOR : 'transparent',
                color: mode === 'detail' ? '#fff' : 'hsl(var(--muted-foreground))',
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Détail
            </button>
          </div>

          {mode === 'group' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SliderRow
                label="Largeur colonnes"
                value={c.recruteur}
                min={200}
                max={1200}
                onChange={setAllCols}
              />
              <SliderRow
                label="Hauteur lignes"
                value={r[0]}
                min={150}
                max={800}
                onChange={setAllRows}
              />
              <SliderRow
                label="Police"
                value={config.fontScale}
                min={0.5}
                max={2.0}
                step={0.05}
                decimals={2}
                onChange={updateFontScale}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontWeight: 600, fontSize: 10, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>Police</div>
              <SliderRow
                label="Échelle"
                value={config.fontScale}
                min={0.5}
                max={2.0}
                step={0.05}
                decimals={2}
                onChange={updateFontScale}
              />
              <div style={{ fontWeight: 600, fontSize: 10, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>Colonnes</div>
              <SliderRow label="Temps" value={c.temps} min={80} max={400} onChange={(v) => updateCol('temps', v)} />
              <SliderRow label="Recruteur" value={c.recruteur} min={200} max={1200} onChange={(v) => updateCol('recruteur', v)} />
              <SliderRow label="Candidat" value={c.candidat} min={200} max={1200} onChange={(v) => updateCol('candidat', v)} />
              <SliderRow label="Système" value={c.systeme} min={200} max={1200} onChange={(v) => updateCol('systeme', v)} />
              <SliderRow label="Type" value={c.type} min={80} max={400} onChange={(v) => updateCol('type', v)} />
              <div style={{ fontWeight: 600, fontSize: 10, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>Lignes</div>
              {TREATMENTS.map((t, i) => (
                <SliderRow key={t.id} label={t.id} value={r[i] ?? 400} min={150} max={800} onChange={(v) => updateRow(i, v)} />
              ))}
            </div>
          )}

          <button
            onClick={reset}
            style={{
              width: '100%',
              marginTop: 8,
              padding: '4px 0',
              borderRadius: 4,
              border: '1px solid hsl(var(--border))',
              background: 'transparent',
              color: 'hsl(var(--muted-foreground))',
              fontSize: 10,
              cursor: 'pointer',
            }}
          >
            ↺ Réinitialiser
          </button>
        </div>
      )}
    </div>
  )
}

const TREATMENTS = [
  { id: 'T1', label: 'Soumettre la candidature' },
  { id: 'T2', label: 'Répondre au quiz' },
  { id: 'T3', label: 'Conduire et évaluer l\'entretien' },
  { id: 'T4', label: 'Valider la décision du recruteur' },
  { id: 'T5', label: 'Gérer la demande d\'annulation' },
  { id: 'T6', label: 'Journaliser audit_event' },
]

function SliderRow({ label, value, min, max, step = 1, decimals = 0, onChange }: { label: string; value: number; min: number; max: number; step?: number; decimals?: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState(String(value))

  const commit = () => {
    const parsed = Number(inputValue)
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed))
      onChange(decimals > 0 ? Math.round(clamped * 100) / 100 : Math.round(clamped))
    }
    setEditing(false)
  }

  const displayValue = decimals > 0 ? Number(value ?? 0).toFixed(decimals) : String(value ?? '')

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 56, fontSize: 10, color: 'hsl(var(--muted-foreground))', textAlign: 'right' }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, height: 3, accentColor: MOT_COLOR }}
      />
      {editing ? (
        <input
          autoFocus
          type="number"
          min={min}
          max={max}
          step={step}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') setEditing(false)
          }}
          style={{ width: 38, fontSize: 10, color: MOT_COLOR, background: 'hsl(var(--background))', border: `1px solid ${MOT_COLOR}`, borderRadius: 3, padding: '1px 3px', textAlign: 'right', outline: 'none' }}
        />
      ) : (
        <span
          onDoubleClick={() => { setInputValue(String(value)); setEditing(true) }}
          style={{ width: 32, fontSize: 10, color: MOT_COLOR, textAlign: 'right', cursor: 'pointer' }}
        >
          {displayValue}
        </span>
      )}
    </div>
  )
}
