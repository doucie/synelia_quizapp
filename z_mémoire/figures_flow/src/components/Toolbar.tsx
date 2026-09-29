import { useReactFlow } from '@xyflow/react'
import ThemeToggle from './ThemeToggle'
import FontSelector from './FontSelector'
import { useEdgeDebugEnabled, setEdgeDebugEnabled } from '../utils/edgeDebug'

interface ToolbarProps {
  diagramTitle: string | null
  showBackground: boolean
  fullscreen: boolean
  onToggleFullscreen: () => void
  onToggleBackground: () => void
  onExportSvg: () => void
  onExportPositions: () => void
  onResetPositions: () => void
}

export default function Toolbar({
  diagramTitle,
  showBackground,
  onToggleFullscreen,
  onToggleBackground,
  onExportSvg,
  onExportPositions,
  onResetPositions,
}: ToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const edgeDebug = useEdgeDebugEnabled()

  return (
    <div className="relative z-20 flex items-center gap-1.5 border-b border-border bg-background/80 px-4 py-2 backdrop-blur">
      {diagramTitle && (
        <span className="text-xs font-medium text-muted-foreground">{diagramTitle}</span>
      )}
      <div className="flex-1" />
      <button
        onClick={onToggleBackground}
        className={`rounded px-2 py-1 text-xs transition-colors ${
          showBackground ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
        }`}
        title="Afficher/masquer les points de fond"
      >
        ▦
      </button>
      <button
        onClick={() => zoomIn()}
        className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
        title="Zoom avant"
      >
        +
      </button>
      <button
        onClick={() => zoomOut()}
        className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
        title="Zoom arrière"
      >
        −
      </button>
      <button
        onClick={() => fitView({ padding: 0.2 })}
        className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
        title="Ajuster à la vue"
      >
        Fit
      </button>
      <div className="mx-1 h-4 w-px bg-border" />
      <button
        onClick={onExportSvg}
        className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
        title="Exporter la figure en SVG"
      >
        SVG
      </button>
      <button
        onClick={onExportPositions}
        className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
        title="Exporter les positions"
      >
        Export
      </button>
      <button
        onClick={onResetPositions}
        className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
        title="Réinitialiser les positions"
      >
        ↺
      </button>
      <button
        onClick={onToggleFullscreen}
        className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
        title="Mode plein écran"
      >
        ⛶
      </button>
      <div className="mx-1 h-4 w-px bg-border" />
      <button
        onClick={() => setEdgeDebugEnabled(!edgeDebug)}
        className={`rounded px-2 py-1 text-xs transition-colors ${
          edgeDebug ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
        }`}
        title="Afficher/masquer l'overlay de debug des arêtes"
      >
        {edgeDebug ? 'DEBUG ON' : 'DEBUG'}
      </button>
      <FontSelector />
      <ThemeToggle />
    </div>
  )
}
