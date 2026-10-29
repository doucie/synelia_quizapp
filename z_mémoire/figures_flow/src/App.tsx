import { useState, useCallback, useEffect, useMemo } from 'react'
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
import { useDiagramRoute } from './hooks/useDiagramRoute'
import ModelsPage from './editor/ModelsPage'
import ModelEditor from './editor/ModelEditor'
import { MODELS_ROUTE, MODEL_ROUTE_PREFIX } from './editor/model'

/**
 * Les pages d'édition vivent sous deux slugs d'un seul segment — `mes-modeles`
 * et `modele-<id>` — parce que `useDiagramRoute` ne connaît que les URL de cette
 * forme : un `/editeur/<id>` serait rejeté et renvoyé sur la figure par défaut.
 */
type EditorRoute = { page: 'list' } | { page: 'model'; id: string }

function parseEditorRoute(routeId: string | null): EditorRoute | null {
  if (!routeId) return null
  if (routeId === MODELS_ROUTE) return { page: 'list' }
  if (routeId.startsWith(MODEL_ROUTE_PREFIX)) {
    return { page: 'model', id: routeId.slice(MODEL_ROUTE_PREFIX.length) }
  }
  return null
}

export default function App() {
  const { expanded, toggle, activeDiagramId, setActiveDiagramId } = useSidebarState()
  const { routeId, navigate } = useDiagramRoute()
  const editorRoute = useMemo(() => parseEditorRoute(routeId), [routeId])

  /* L'URL est la source de vérité : un onglet = une figure. `localStorage` ne
     sert plus que de repli pour une arrivée sur `/`, sinon deux onglets sur deux
     figures se voleraient l'état actif (dernier monté gagnait). */
  const activeDiagram = useMemo<DiagramDefinition | null>(() => {
    // Sur une page d'édition, aucune figure statique n'est affichée : résoudre
    // un diagramme déclencherait l'effet de normalisation d'URL, qui rabattrait
    // la route d'édition vers lui.
    if (editorRoute) return null
    const routed = routeId ? getDiagram(routeId) : undefined
    if (routed) return routed
    const restored = activeDiagramId ? getDiagram(activeDiagramId) : undefined
    return restored ?? diagrams[0] ?? null
  }, [routeId, activeDiagramId, editorRoute])
  const [showBackground, setShowBackground] = useState(() => {
    try { return localStorage.getItem('figures_flow:background') !== 'false' } catch { return true }
  })
  const [fullscreen, setFullscreen] = useState(false)

  const handleExportSvg = useCallback(() => {
    // Figure 16 : miroir export du `data-edges-above` live — l’écran-hôte
    // opaque recouvrirait les arêtes si elles restaient peintes en premier.
    exportSvg(`${activeDiagram?.id ?? 'diagram'}.svg`, {
      edgesAbove: activeDiagram?.id === 'memoire-deploiement-local',
    })
  }, [activeDiagram])

  const handleExportPositions = useCallback(() => {
    exportPositions()
  }, [])

  const handleResetPositions = useCallback(() => {
    const key = `figures_flow:diagram:${activeDiagram?.id}`
    localStorage.removeItem(key)
    window.location.reload()
  }, [activeDiagram])

  const handleSelectDiagram = useCallback((diagram: DiagramDefinition) => {
    // `pushState` : Précédent/Suivant parcourent les figures visitées.
    navigate(diagram.id)
  }, [navigate])

  useEffect(() => {
    if (activeDiagram) setActiveDiagramId(activeDiagram.id)
  }, [activeDiagram, setActiveDiagramId])

  /* URL normalisée : `/` et les ids inconnus pointent vers la figure réellement
     affichée, sans nouvelle entrée d'historique. Inerte une fois l'URL alignée
     (`replace` → `routeId === activeDiagram.id`), donc aucune boucle. */
  useEffect(() => {
    if (!activeDiagram) return
    if (routeId === activeDiagram.id) return
    navigate(activeDiagram.id, { replace: true })
  }, [activeDiagram, routeId, navigate])

  /* La liste des modèles n'a pas de chrome plein écran (ni sidebar, ni bandeau
     de figure) : y arriver en plein écran laisserait l'écran nu. Seul `Échap`
     en sortirait — on rend la sortie explicite en quittant l'éditeur. */
  useEffect(() => {
    if (fullscreen && editorRoute?.page === 'list') setFullscreen(false)
  }, [editorRoute, fullscreen])

  /* Titre d'onglet : c'est lui qui distingue les onglets ouverts par clic droit. */
  useEffect(() => {
    // La page d'édition d'un modèle pose son propre titre (il suit le document) ;
    // ne pas l'écraser ici.
    if (editorRoute?.page === 'model') return
    if (editorRoute?.page === 'list') {
      document.title = 'Mes modèles — Figures Flow'
      return
    }
    document.title = activeDiagram ? `${activeDiagram.title} — Figures Flow` : 'Figures Flow'
  }, [activeDiagram, editorRoute])

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
          routeId={routeId ?? ''}
          onSelect={handleSelectDiagram}
          onNavigate={navigate}
          expanded={expanded}
          onToggle={toggle}
        />
      )}
      <div className="relative flex flex-1 flex-col">
        <ReactFlowProvider>
          {!fullscreen && !editorRoute && (
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
          {editorRoute?.page === 'list' && (
            <ModelsPage onOpen={(id) => navigate(`${MODEL_ROUTE_PREFIX}${id}`)} />
          )}
          {editorRoute?.page === 'model' && (
            <ModelEditor
              key={editorRoute.id}
              modelId={editorRoute.id}
              onBack={() => navigate(MODELS_ROUTE)}
              onOpenModel={(id) => navigate(`${MODEL_ROUTE_PREFIX}${id}`, { replace: true })}
              fullscreen={fullscreen}
              onToggleFullscreen={() => setFullscreen((v) => !v)}
            />
          )}
          {!editorRoute && (
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
          )}
          {/* Le plein écran de l'éditeur a son propre chrome (bandeau conservé) :
              laisser `FullscreenOverlay` se poser par-dessus empilerait les
              pastilles des figures sur un modèle, route atteignable depuis la
              sidebar révélée. */}
          {fullscreen && !editorRoute && (
            <FullscreenOverlay
              activeId={activeDiagram?.id ?? ''}
              onSelect={handleSelectDiagram}
              onNavigate={navigate}
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
