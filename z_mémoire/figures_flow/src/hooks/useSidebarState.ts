import { useState, useCallback } from 'react'

const STORAGE_KEY = 'figures_flow:sidebar'

interface SidebarState {
  expanded: Record<string, boolean>
  activeDiagramId: string | null
}

function load(): SidebarState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved) as SidebarState
  } catch {
    // ignore
  }
  return { expanded: { mcd: true, mld: false, mpd: false, traitements: true }, activeDiagramId: null }
}

function save(state: SidebarState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

export function useSidebarState() {
  const [state, setState] = useState<SidebarState>(load)

  const setExpanded = useCallback((key: string, value: boolean) => {
    setState((prev) => {
      const next = { ...prev, expanded: { ...prev.expanded, [key]: value } }
      save(next)
      return next
    })
  }, [])

  const toggle = useCallback((key: string) => {
    setState((prev) => {
      const next = { ...prev, expanded: { ...prev.expanded, [key]: !prev.expanded[key] } }
      save(next)
      return next
    })
  }, [])

  const setActiveDiagramId = useCallback((id: string | null) => {
    setState((prev) => {
      const next = { ...prev, activeDiagramId: id }
      save(next)
      return next
    })
  }, [])

  return { expanded: state.expanded, activeDiagramId: state.activeDiagramId, toggle, setExpanded, setActiveDiagramId }
}
