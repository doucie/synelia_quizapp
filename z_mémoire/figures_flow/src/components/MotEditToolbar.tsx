const MOT_COLOR = 'hsl(15, 100%, 40%)'

interface MotEditToolbarProps {
  mctLabel: string
  isEditing: boolean
  onEdit: () => void
  onDone: () => void
  onReset: () => void
}

export default function MotEditToolbar({ mctLabel, isEditing, onEdit, onDone, onReset }: MotEditToolbarProps) {
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
        onClick={onReset}
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
        ↺ Reset
      </button>
    </div>
  )
}
