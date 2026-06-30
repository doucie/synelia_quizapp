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
  const [showBackground, setShowBackground] = useState(true)

  const handleExportSvg = useCallback(() => {
    const container = document.querySelector('.react-flow')
    exportSvg(container as HTMLElement, `${activeDiagram?.id ?? 'diagram'}.svg`)
  }, [activeDiagram])

  const handleResetPositions = useCallback(() => {
    const key = `figures_flow:positions:${activeDiagram?.id}`
    localStorage.removeItem(key)
    window.location.reload()
  }, [activeDiagram])

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        activeId={activeDiagram?.id ?? ''}
        onSelect={setActiveDiagram}
      />
      <div className="relative flex flex-1 flex-col">
        <ReactFlowProvider>
          <Toolbar
            diagramTitle={activeDiagram?.title ?? null}
            showBackground={showBackground}
            onToggleBackground={() => setShowBackground((v) => !v)}
            onExportSvg={handleExportSvg}
            onResetPositions={handleResetPositions}
          />
          <DiagramCanvas
            diagram={activeDiagram}
            showBackground={showBackground}
            onNodesInitialized={() => {}}
          />
        </ReactFlowProvider>
      </div>
    </div>
  )
}
