import { useState, useCallback, useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import DiagramCanvas from './components/DiagramCanvas'
import Sidebar from './components/Sidebar'
import Toolbar from './components/Toolbar'
import FullscreenOverlay from './components/FullscreenOverlay'
import type { DiagramDefinition } from './types'
import { diagrams, getDiagram } from './diagrams'
import { exportSvg } from './utils/exportSvg'
import { exportPositions } from './utils/exportPositions'
import { useSidebarState } from './hooks/useSidebarState'

export default function App() {
  const { expanded, toggle, activeDiagramId, setActiveDiagramId } = useSidebarState()
  const [activeDiagram, setActiveDiagram] = useState<DiagramDefinition | null>(() => {
    if (activeDiagramId) {
      const restored = getDiagram(activeDiagramId)
      if (restored) return restored
    }
    return diagrams[0] ?? null
  })
  const [showBackground, setShowBackground] = useState(() => {
    try { return localStorage.getItem('figures_flow:background') !== 'false' } catch { return true }
  })
  const [fullscreen, setFullscreen] = useState(false)

  const handleExportSvg = useCallback(() => {
    exportSvg(`${activeDiagram?.id ?? 'diagram'}.svg`)
  }, [activeDiagram])

  const handleExportPositions = useCallback(() => {
    exportPositions()
  }, [])

  const handleResetPositions = useCallback(() => {
    const key = `figures_flow:diagram:${activeDiagram?.id}`
    localStorage.removeItem(key)
    window.location.reload()
  }, [activeDiagram])

  useEffect(() => {
    if (activeDiagram) setActiveDiagramId(activeDiagram.id)
  }, [activeDiagram, setActiveDiagramId])

  useEffect(() => {
    if (!fullscreen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [fullscreen])

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {!fullscreen && (
        <Sidebar
          activeId={activeDiagram?.id ?? ''}
          onSelect={setActiveDiagram}
          expanded={expanded}
          onToggle={toggle}
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
              onExportPositions={handleExportPositions}
              onResetPositions={handleResetPositions}
            />
          )}
          <DiagramCanvas
            /* La clé force le remontage au changement de figure : sans elle, l'effet
               de réinitialisation dépendant de `diagram?.id` ne se rejoue pas quand
               deux figures partagent le même id, et l'état précédent reste affiché. */
            key={activeDiagram?.id ?? 'none'}
            diagram={activeDiagram}
            showBackground={showBackground}
            fullscreen={fullscreen}
            onNodesInitialized={() => {}}
          />
          {fullscreen && (
            <FullscreenOverlay
              activeId={activeDiagram?.id ?? ''}
              onSelect={setActiveDiagram}
              expanded={expanded}
              onToggle={toggle}
              diagramTitle={activeDiagram?.title ?? null}
              showBackground={showBackground}
              onToggleBackground={() => setShowBackground((v) => {
                localStorage.setItem('figures_flow:background', String(!v))
                return !v
              })}
              onExportSvg={handleExportSvg}
              onExportPositions={handleExportPositions}
              onResetPositions={handleResetPositions}
              onExitFullscreen={() => setFullscreen(false)}
              fixedLayout={activeDiagram?.rigidLayout === true}
            />
          )}
        </ReactFlowProvider>
      </div>
    </div>
  )
}
