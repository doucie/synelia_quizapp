import { useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import ThemeToggle from './ThemeToggle'
import FontSelector from './FontSelector'
import ConfirmDialog from './ConfirmDialog'
import { useEdgeDebugEnabled, setEdgeDebugEnabled } from '../utils/edgeDebug'

interface ToolbarProps {
  diagramTitle: string | null
  showBackground: boolean
  fullscreen: boolean
  onToggleFullscreen: () => void
  onToggleBackground: () => void
  onExportSvg: () => void
  onExportPositions: () => void
  /**
   * Relance la page après avoir effacé l'entrée `figures_flow:diagram:<id>` — c'est
   * la seule action destructrice de l'application, d'où la confirmation. Le
   * rechargement rend toute confirmation « c'est fait » impossible : le dialogue
   * n'a pas d'état de sortie, seulement une décision.
   */
  onResetPositions: () => void
  /**
   * Figure au placement imposé (`rigidLayout`) : « Export » et « ↺ » portent sur
   * les positions, qui n'existent pas pour elle — les boutons sont masqués.
   */
  fixedLayout?: boolean
}

export default function Toolbar({
  diagramTitle,
  showBackground,
  onToggleFullscreen,
  onToggleBackground,
  onExportSvg,
  onExportPositions,
  onResetPositions,
  fixedLayout,
}: ToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const edgeDebug = useEdgeDebugEnabled()
  const [confirmReset, setConfirmReset] = useState(false)

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
      {!fixedLayout && (
        <>
          <button
            onClick={onExportPositions}
            className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
            title="Exporter les positions"
          >
            Export
          </button>
          <button
            onClick={() => setConfirmReset(true)}
            className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
            title="Réinitialiser les positions"
          >
            ↺
          </button>
        </>
      )}
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

      {/* Rendue dans la barre, mais portée sous `body` : sa position dans l'arbre
          n'a aucun effet sur l'affichage. La déclarer ici plutôt qu'après le
          `div` évite de fragmenter la barre en deux. */}
      <ConfirmDialog
        open={confirmReset}
        title="Réinitialiser les positions"
        message="Les positions enregistrées pour cette figure seront perdues et la figure retrouvera son agencement d'origine."
        confirmLabel="Réinitialiser"
        onConfirm={() => {
          setConfirmReset(false)
          onResetPositions()
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}
