import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

const MOT_COLOR = 'hsl(15, 100%, 40%)'

interface MotEditToolbarProps {
  mctLabel: string
  isEditing: boolean
  onEdit: () => void
  onDone: () => void
  /** Remplace les positions du traitement affiché par celles de sa figure source. */
  onReset: () => void
}

export default function MotEditToolbar({ mctLabel, isEditing, onEdit, onDone, onReset }: MotEditToolbarProps) {
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 60,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 8,
        background: 'hsl(var(--background))',
        border: `1px solid ${MOT_COLOR}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontSize: 12,
        pointerEvents: 'auto',
      }}
    >
      <span style={{ color: MOT_COLOR, fontWeight: 600, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {mctLabel}
      </span>
      <span style={{ color: 'hsl(var(--border))' }}>|</span>
      {isEditing ? (
        <button
          onClick={onDone}
          style={{
            padding: '3px 10px',
            borderRadius: 6,
            border: `1px solid ${MOT_COLOR}`,
            background: MOT_COLOR,
            color: '#fff',
            fontWeight: 600,
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          Terminé
        </button>
      ) : (
        <button
          onClick={onEdit}
          style={{
            padding: '3px 10px',
            borderRadius: 6,
            border: `1px solid ${MOT_COLOR}`,
            background: 'transparent',
            color: MOT_COLOR,
            fontWeight: 600,
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          Éditer
        </button>
      )}
      <button
        onClick={() => setConfirmReset(true)}
        style={{
          padding: '3px 10px',
          borderRadius: 6,
          border: '1px solid hsl(var(--border))',
          background: 'transparent',
          color: 'hsl(var(--muted-foreground))',
          fontSize: 11,
          cursor: 'pointer',
        }}
      >
        ↺ Réinitialiser
      </button>

      {/* Rendue sous `body` : cette barre est posée dans le pane React Flow, dont le
          viewport porte un `transform` — un `fixed` déclaré ici serait centré sur
          le viewport et mis à l'échelle par le zoom. */}
      <ConfirmDialog
        open={confirmReset}
        title="Réinitialiser le traitement"
        message="Les positions du traitement affiché reviendront à celles de sa figure d'origine."
        confirmLabel="Réinitialiser"
        onConfirm={() => {
          setConfirmReset(false)
          onReset()
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}
