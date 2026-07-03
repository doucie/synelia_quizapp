import { useState, useRef, useEffect } from 'react'
import Sidebar from './Sidebar'
import Toolbar from './Toolbar'
import type { DiagramDefinition } from '../types'

interface FullscreenOverlayProps {
  activeId: string
  onSelect: (diagram: DiagramDefinition) => void
  expanded: Record<string, boolean>
  onToggle: (key: string) => void
  diagramTitle: string | null
  showBackground: boolean
  onToggleBackground: () => void
  onExportSvg: () => void
  onResetPositions: () => void
  onExitFullscreen: () => void
}

export default function FullscreenOverlay({
  activeId,
  onSelect,
  expanded,
  onToggle,
  diagramTitle,
  showBackground,
  onToggleBackground,
  onExportSvg,
  onResetPositions,
  onExitFullscreen,
}: FullscreenOverlayProps) {
  const [sidebarPill, setSidebarPill] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const [toolbarPill, setToolbarPill] = useState(false)
  const [toolbarOpen, setToolbarOpen] = useState(false)
  const toolbarTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  /* ── Edge mousemove trigger ─────────────────────────────── */
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      /* Sidebar */
      if (!sidebarOpen && e.clientX <= 8 && !sidebarTimer.current) {
        sidebarTimer.current = setTimeout(() => {
          sidebarTimer.current = null
          setSidebarPill(true)
        }, 400)
      }
      if (e.clientX > 80) {
        clearTimeout(sidebarTimer.current ?? undefined)
        sidebarTimer.current = null
        setSidebarPill(false)
      }

      /* Toolbar */
      if (!toolbarOpen && e.clientY <= 8 && !toolbarTimer.current) {
        toolbarTimer.current = setTimeout(() => {
          toolbarTimer.current = null
          setToolbarPill(true)
        }, 400)
      }
      if (e.clientY > 80) {
        clearTimeout(toolbarTimer.current ?? undefined)
        toolbarTimer.current = null
        setToolbarPill(false)
      }
    }

    document.addEventListener('mousemove', handleMove)
    return () => {
      document.removeEventListener('mousemove', handleMove)
      clearTimeout(sidebarTimer.current ?? undefined)
      clearTimeout(toolbarTimer.current ?? undefined)
    }
  }, [sidebarOpen, toolbarOpen])

  /* ── Outside-click close ────────────────────────────────── */
  useEffect(() => {
    if (!sidebarOpen && !toolbarOpen) return

    const handleClick = (e: MouseEvent) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false)
      }
      if (toolbarOpen && toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setToolbarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick, true)
    return () => document.removeEventListener('mousedown', handleClick, true)
  }, [sidebarOpen, toolbarOpen])

  return (
    <>
      {/* ── Left edge: sidebar trigger bar ─────────────────────── */}
      {sidebarPill && (
        <button
          onClick={() => { setSidebarOpen(true); setSidebarPill(false) }}
          className="absolute left-0 top-0 z-30 h-full w-[6px] cursor-pointer bg-primary/70 shadow-[0_0_14px_4px_hsl(var(--primary)/0.35)] animate-pulse hover:bg-primary/90"
        />
      )}

      {/* ── Top edge: toolbar trigger bar ──────────────────────── */}
      {toolbarPill && (
        <button
          onClick={() => { setToolbarOpen(true); setToolbarPill(false) }}
          className="absolute left-0 top-0 z-30 h-[6px] w-full cursor-pointer bg-primary/70 shadow-[0_0_14px_4px_hsl(var(--primary)/0.35)] animate-pulse hover:bg-primary/90"
        />
      )}

      {/* ── Sidebar panel ─────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="absolute left-0 top-0 z-50 flex h-full" ref={sidebarRef}>
          <Sidebar
            activeId={activeId}
            onSelect={onSelect}
            expanded={expanded}
            onToggle={onToggle}
          />
        </div>
      )}

      {/* ── Toolbar panel ─────────────────────────────────────── */}
      {toolbarOpen && (
        <div className="absolute left-0 top-0 z-50 w-full" ref={toolbarRef}>
          <Toolbar
            diagramTitle={diagramTitle}
            showBackground={showBackground}
            fullscreen={true}
            onToggleFullscreen={onExitFullscreen}
            onToggleBackground={onToggleBackground}
            onExportSvg={onExportSvg}
            onResetPositions={onResetPositions}
          />
        </div>
      )}
    </>
  )
}
