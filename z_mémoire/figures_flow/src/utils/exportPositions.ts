interface DiagramExport {
  positions: Record<string, { x: number; y: number }>
  viewport: { x: number; y: number; zoom: number }
}

interface PositionsExport {
  version: number
  exportedAt: string
  diagrams: Record<string, DiagramExport>
}

export function exportPositions(): void {
  const diagrams: Record<string, DiagramExport> = {}

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith('figures_flow:diagram:')) continue
    const diagramId = key.slice('figures_flow:diagram:'.length)
    try {
      diagrams[diagramId] = JSON.parse(localStorage.getItem(key)!) as DiagramExport
    } catch { /* skip corrupted entry */ }
  }

  const payload: PositionsExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    diagrams,
  }

  console.log('[exportPositions] keys found:', Object.keys(diagrams).length, diagrams)

  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  setTimeout(() => {
    const a = document.createElement('a')
    a.href = url
    a.download = `figures_flow_positions_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 0)
}
