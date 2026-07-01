import { useState, useCallback } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import DiagramCanvas from './components/DiagramCanvas'
import Sidebar from './components/Sidebar'
import Toolbar from './components/Toolbar'
import type { DiagramDefinition } from './types'
import { diagrams } from './diagrams'
import { exportSvg } from './utils/exportSvg'

export default function App() {
  const [activeDiagram, setActiveDiagram] = useState<DiagramDefinition | null>(diagrams[0] ?? null)
  const [showBackground, setShowBackground] = useState(() => {
    try { return localStorage.getItem('figures_flow:background') !== 'false' } catch { return true }
  })
  const [fullscreen, setFullscreen] = useState(false)

  const handleExportSvg = useCallback(() => {
    const container = document.querySelector('.react-flow')
    exportSvg(container as HTMLElement, `${activeDiagram?.id ?? 'diagram'}.svg`)
  }, [activeDiagram])

  const handleResetPositions = useCallback(() => {
    const key = `figures_flow:diagram:${activeDiagram?.id}`
    localStorage.removeItem(key)
    window.location.reload()
  }, [activeDiagram])

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {!fullscreen && (
        <Sidebar
          activeId={activeDiagram?.id ?? ''}
          onSelect={setActiveDiagram}
        />
      )}
      <div className="relative flex flex-1 flex-col">
        <ReactFlowProvider>
          {!fullscreen && (
            <Toolbar
              diagramTitle={activeDiagram?.title ?? null}
              showBackground={showBackground}
              fullscreen={fullscreen}
              onToggleFullscreen={() => setFullscreen((v) => !v)}
              onToggleBackground={() => setShowBackground((v) => {
                localStorage.setItem('figures_flow:background', String(!v))
                return !v
              })}
              onExportSvg={handleExportSvg}
              onResetPositions={handleResetPositions}
            />
          )}
          <DiagramCanvas
            diagram={activeDiagram}
            showBackground={showBackground}
            fullscreen={fullscreen}
            onNodesInitialized={() => {}}
          />
        </ReactFlowProvider>
        {fullscreen && (
          <button
            onClick={() => setFullscreen(false)}
            className="absolute right-3 top-3 z-50 rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur hover:bg-muted"
            title="Quitter le mode plein écran"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
