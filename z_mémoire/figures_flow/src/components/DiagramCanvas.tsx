import { useEffect, useLayoutEffect, useMemo, useRef, useCallback, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
  type Viewport,
  type OnNodeDrag,
  type NodeMouseHandler,
} from '@xyflow/react'
import EntityNode from './Nodes/EntityNode'
import ProcessNode from './Nodes/ProcessNode'
import MotTableBg from './MotTableBg'
import MotEditToolbar from './MotEditToolbar'
import MotTableToolbar from './MotTableToolbar'
import TreatmentFrames, { TreatmentFrameControls, FRAME_PAD, type FrameBox } from './TreatmentFrames'
import RelationshipEdge from './Edges/RelationshipEdge'
import TraitementEdge from './Edges/TraitementEdge'
import OrgBusEdge from './Edges/OrgBusEdge'
import { validHandles } from './Edges/edgeAnchors'
import { loadDiagramState, useDiagramState, loadPositions, loadCardinalitySides, loadMotPositions, loadMotCardinalitySides, loadMotTableConfig, saveMotTableConfig } from '../hooks/useDiagramState'
import { useGroupMove } from '../hooks/useGroupMove'
import { useStickyHover } from '../hooks/useStickyHover'
import { applyEntityColors } from '../utils/entityColors'
import { getMotMctMap, getMotOriginalPositions } from '../diagrams/mot/mot_organisationnel_v2'
import type { DiagramDefinition, DiagramSection, RelationshipEdgeData, MotTableConfig } from '../types'

const nodeTypes: NodeTypes = { entity: EntityNode, process: ProcessNode }
const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge,
  traitement: TraitementEdge,
  orgBus: OrgBusEdge,
}

/** Taille d'un nœud avant sa première mesure (défaut de `node.measured`). */
const FALLBACK_SIZE = { w: 220, h: 80 }

/** Doit rester synchronisé avec `snapGrid={[10, 10]}` plus bas. */
const SNAP = 10

/**
 * Jour (px écran) entre la ligne haute d'un cadre et le bas de ses icônes.
 *
 * Doit rester cohérent avec la position donnée à la couche des commandes :
 * `applyControlsLayout` la soustrait à `v.y + f.y * v.zoom`.
 */
const CTRL_GAP = 6

/**
 * Sous-arbre contre-échellé : une longueur CSS y vaut déjà une longueur écran.
 *
 * Le repère s'applique au trait du cadre (`.treatment-frame`) et à toute tentative
 * d'y replacer de l'UI en `calc(… * var(--treatment-inv-zoom))` — multiplier la
 * taille d'un élément par l'inverse du zoom la compense deux fois et le fait
 * dériver dans la boîte. C'est pourquoi les icônes vivent dans une couche à part,
 * en coordonnées écran (cf. `applyControlsLayout`).
 */

/** Adaptateur : les nœuds du diagramme courant plutôt qu'un `Node` déjà résolu. */
function handlesOf(nodeId: string, nodes: ReturnType<typeof useNodesState>[0], handleType: 'source' | 'target'): Set<string> {
  return validHandles(nodes.find((n) => n.id === nodeId), handleType)
}

/** Teinte d'une couleur `hsl(<h>, …)` posée par `applyEntityColors`. */
function hueOf(color: unknown): number {
  const m = typeof color === 'string' ? color.match(/^hsl\((\d+)/) : null
  return m ? Number(m[1]) : 15
}

interface DiagramCanvasProps {
  diagram: DiagramDefinition | null
  showBackground: boolean
  fullscreen: boolean
  onNodesInitialized: (nodes: ReturnType<typeof useNodesState>[0], setter: ReturnType<typeof useNodesState>[1]) => void
}

export default function DiagramCanvas({ diagram, showBackground, fullscreen: _fullscreen, onNodesInitialized }: DiagramCanvasProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useReactFlow()
  /** Couche des cadres : coordonnées monde, cf. `applyFramesTransform`. */
  const framesLayer = useRef<HTMLDivElement | null>(null)
  /** Couche du badge et des icônes : coordonnées écran, cf. `applyControlsLayout`. */
  const controlsLayer = useRef<HTMLDivElement | null>(null)
  /** Overlays montés de la couche 2, indexés par `section.id`. */
  const overlayEls = useRef(new Map<string, HTMLDivElement>())
  const dragStartPositions = useRef<Record<string, { x: number; y: number }> | null>(null)
  /** Un glissement sur un cadre a déplacé la vue : le clic suivant ne focalise pas. */
  const panMoved = useRef(false)
  const [motTableConfig, setMotTableConfig] = useState<MotTableConfig>(() => loadMotTableConfig())
  const [nodeSizes, setNodeSizes] = useState<Record<string, { w: number; h: number }>>({})
  const [focusedSectionId, setFocusedSectionId] = useState<string | null>(null)
  const [lockedSectionIds, setLockedSectionIds] = useState<Set<string>>(() => new Set())
  const [editingMctPrefix, setEditingMctPrefix] = useState<string | null>(null)
  const [selectedMctPrefix, setSelectedMctPrefix] = useState<string | null>(null)

  const { hovered: hoveredSectionId, enter: hoverEnter, leave: hoverLeave, clear: hoverClear } = useStickyHover()

  const motMap = useMemo(() => getMotMctMap(motTableConfig), [motTableConfig])

  const initialNodes = useMemo(() => {
    if (!diagram) return []
    let nodes = applyEntityColors(diagram.nodes)
    if (diagram.id === 'mot-organisationnel-v2') {
      const motState = loadDiagramState('mot-organisationnel-v2')
      if (motState?.positions) {
        nodes = loadPositions('mot-organisationnel-v2', nodes)
      } else {
        nodes = loadMotPositions(nodes, motMap)
      }
    } else if (diagram.rigidLayout) {
      // Une figure au placement imposé ne doit pas restaurer des déplacements
      // effectués précédemment. Ses nœuds restent à la géométrie définie dans le
      // diagramme.
      nodes = nodes
    } else {
      nodes = loadPositions(diagram.id, nodes)
    }
    return nodes
  }, [diagram, motMap])
  const initialEdges = useMemo(() => {
    if (!diagram) return []
    const sides = diagram.id === 'mot-organisationnel-v2'
      ? loadMotCardinalitySides(motMap)
      : loadCardinalitySides(diagram.id)
    return diagram.edges.map((e) => {
      const saved = sides[e.id]
      const cardFromSide = saved?.from as RelationshipEdgeData['cardFromSide'] | undefined
      const cardToSide = saved?.to as RelationshipEdgeData['cardToSide'] | undefined
      const validSourceHandles = handlesOf(e.source, diagram.nodes, 'source')
      const validTargetHandles = handlesOf(e.target, diagram.nodes, 'target')
      return {
        ...e,
        sourceHandle: e.sourceHandle ?? (cardFromSide && cardFromSide !== 'source' && validSourceHandles.has(cardFromSide) ? cardFromSide : undefined),
        targetHandle: e.targetHandle ?? (cardToSide && cardToSide !== 'source' && validTargetHandles.has(cardToSide) ? cardToSide : undefined),
        data: {
          ...e.data,
          diagramId: diagram.id,
          // Les figures MCT (v2 comme archive) sont tracées en segments droits ;
          // SAT, MPT et le reste gardent le tracé en escalier. Le critère est
          // l'id — `mct-*` / `mct-v2-*` d'un côté, `sat-*` / `mpt-*` de l'autre —
          // ce qui évite de faire sniffler l'id par le composant d'arête.
          straight: diagram.id.startsWith('mct'),
          ...(cardFromSide && validSourceHandles.has(cardFromSide) ? { cardFromSide } : {}),
          ...(cardToSide && validTargetHandles.has(cardToSide) ? { cardToSide } : {}),
          ...(saved?.reflexOffset != null ? { reflexOffset: saved.reflexOffset } : {}),
          ...(saved?.reflexSpread != null ? { reflexSpread: saved.reflexSpread } : {}),
          ...(saved?.roleFromPos != null ? { roleFromPos: saved.roleFromPos } : {}),
          ...(saved?.roleToPos != null ? { roleToPos: saved.roleToPos } : {}),
          ...(saved?.roleFromSense != null ? { roleFromSense: saved.roleFromSense } : {}),
          ...(saved?.roleToSense != null ? { roleToSense: saved.roleToSense } : {}),
        },
      }
    })
  }, [diagram, motMap])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  /**
   * Miroir à jour de `nodes`.
   *
   * Le déplacement d'un traitement (`useGroupMove`) capture `persist` au
   * `pointerdown`, avant les `setNodes` du geste : sans ce miroir, le relâchement
   * sauvegarderait les positions de départ au lieu de celles obtenues.
   */
  const nodesRef = useRef(nodes)
  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  const { saveState, clearPositions } = useDiagramState(diagram?.id ?? '')

  /**
   * Une figure au placement imposé ne doit pas hériter d'un déplacement
   * effectué lors d'une session précédente : ses positions sauvegardées sont
   * effacées au montage, le viewport est conservé (cf. `clearPositions`).
   *
   * Le hook est appelé plus haut, au corps du composant : l'appeler ici ferait
   * échouer `Invalid hook call`, React n'installant son dispatcher que pendant
   * le rendu. `clearPositions` est stable, l'effet ne se reboucle pas.
   */
  const rigid = diagram?.rigidLayout === true
  useEffect(() => {
    if (rigid) clearPositions()
  }, [rigid, clearPositions])

  const isMot = diagram?.id === 'mot-organisationnel-v2'
  const sections = diagram?.sections

  const displayNodes = useMemo(() => {
    if (!selectedMctPrefix) return nodes
    return nodes.map((n) => {
      const isSelected = n.id.startsWith(selectedMctPrefix)
      const hasClass = n.className?.includes('mot-mct-selected')
      if (isSelected && !hasClass) {
        return { ...n, className: `${n.className ?? ''} mot-mct-selected`.trim() }
      }
      if (!isSelected && hasClass) {
        return { ...n, className: (n.className?.replace('mot-mct-selected', '') ?? '').trim() }
      }
      return n
    })
  }, [nodes, selectedMctPrefix])

  // --- Encadrements des traitements (MCT combinée) ---

  /**
   * Boîte englobante des cartes de chaque traitement, élargie de `FRAME_PAD`.
   *
   * Calculée avant les fonctions de placement des overlays : celles-ci en dépendent,
   * et les référencer avant leur déclaration les ferait lire une liaison non
   * initialisée.
   */
  const sectionFrames = useMemo<FrameBox[]>(() => {
    if (!sections?.length) return []
    const out: FrameBox[] = []
    for (const section of sections) {
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      let hue = 15
      let hueFound = false
      for (const n of nodes) {
        if (!n.id.startsWith(section.prefix)) continue
        const size =
          nodeSizes[n.id] ??
          (n.measured ? { w: n.measured.width, h: n.measured.height } : FALLBACK_SIZE)
        minX = Math.min(minX, n.position.x)
        minY = Math.min(minY, n.position.y)
        maxX = Math.max(maxX, n.position.x + size.w)
        maxY = Math.max(maxY, n.position.y + size.h)
        if (!hueFound) {
          hue = hueOf(n.data?.color)
          hueFound = true
        }
      }
      if (!isFinite(minX)) continue
      out.push({
        section,
        x: minX - FRAME_PAD,
        y: minY - FRAME_PAD,
        w: maxX - minX + FRAME_PAD * 2,
        h: maxY - minY + FRAME_PAD * 2,
        hue,
        locked: lockedSectionIds.has(section.prefix),
        hovered: hoveredSectionId === section.prefix,
        // Le focus est masqué tant qu'un autre traitement est survolé : un seul
        // traitement est encadré à la fois, et c'est toujours celui qu'on utilise.
        focused: focusedSectionId === section.prefix && hoveredSectionId === null,
      })
    }
    return out
  }, [sections, nodes, nodeSizes, hoveredSectionId, focusedSectionId, lockedSectionIds])

  // --- Persistance & overlays ---

  const persist = useCallback(
    (viewport: Viewport, lockedOverride?: Iterable<string>) => {
      if (!diagram) return
      const positions: Record<string, { x: number; y: number }> = {}
      for (const n of nodesRef.current) {
        positions[n.id] = n.position
      }
      saveState({
        positions,
        viewport,
        lockedSections: [...(lockedOverride ?? lockedSectionIds)],
      })
    },
    [diagram, lockedSectionIds, saveState],
  )

  /**
   * Recale la couche des cadres sur le viewport React Flow.
   *
   * Elle vit en coordonnées *monde* : la transformation porte donc l'ensemble du
   * placement. Seule l'épaisseur du trait est compensée par `--treatment-inv-zoom`
   * pour rester à 1 px écran quelle que soit la vue.
   */
  const applyFramesTransform = useCallback((v: Viewport) => {
    const el = framesLayer.current
    if (!el) return
    el.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.zoom})`
    el.style.setProperty('--treatment-inv-zoom', String(v.zoom > 0 ? 1 / v.zoom : 1))
  }, [])

  /**
   * Recale la couche du badge et des icônes, en coordonnées *écran*.
   *
   * Aucun `transform` n'est posé sur la couche elle-même : chaque overlay est une
   * rangée de la largeur écran du cadre, dont on ancre le coin bas-droit sur le coin
   * haut-droit du cadre. `v.x + x * v.zoom` est la formule dont React Flow se sert
   * pour placer les nœuds, donc les icônes sont glutées au cadre par construction —
   * et non par un décalage en px monde qui, lui, dépendrait du zoom.
   *
    * Rien n'y est mis à l'échelle : badge et boutons font 24 px écran à n'importe
    * quelle valeur de zoom. Au zoom par défaut des figures de parcours du MCT
    * (≈ 0.3, 3 rangées de 640 px), des icônes exprimées en px monde tomberaient à
    * ~7 px — trop petites et imprécises à cliquer. D'où la décision de ne jamais
    * les masquer : le recouvrement du traitement du dessus, au dézoom, est le
    * compromis retenu.
   */
  const applyControlsLayout = useCallback(
    (v: Viewport) => {
      if (!controlsLayer.current) return
      for (const f of sectionFrames) {
        const el = overlayEls.current.get(f.section.id)
        if (!el) continue
        const right = v.x + (f.x + f.w) * v.zoom
        const top = v.y + f.y * v.zoom
        el.style.width = `${f.w * v.zoom}px`
        el.style.transform = `translate(${right}px, ${top - CTRL_GAP}px) translate(-100%, -100%)`
      }
    },
    [sectionFrames],
  )

  /**
   * Les deux couches n'ont ni la même unité ni la même formule : les recaler est
   * donc deux opérations distinctes, mais un seul point d'appel pour ne pas
   * oublier l'une des deux.
   */
  const syncOverlays = useCallback(
    (v: Viewport) => {
      applyFramesTransform(v)
      applyControlsLayout(v)
    },
    [applyFramesTransform, applyControlsLayout],
  )

  /**
   * Survol, focus et verrouillage montent et démontent des overlays sans déplacer la
   * vue : ils doivent donc être recalés après chaque rendu, pas seulement sur `onMove`.
   */
  useLayoutEffect(() => {
    syncOverlays(reactFlowInstance.getViewport())
  })

  const setFramesLayer = useCallback((el: HTMLDivElement | null) => {
    framesLayer.current = el
  }, [])

  const setControlsLayer = useCallback((el: HTMLDivElement | null) => {
    controlsLayer.current = el
  }, [])

  /** Enregistre un overlay monté pour que `applyControlsLayout` puisse le positionner. */
  const registerOverlay = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) overlayEls.current.set(id, el)
    else overlayEls.current.delete(id)
  }, [])

  const onMove = useCallback(
    (_event: any, viewport: Viewport) => syncOverlays(viewport),
    [syncOverlays],
  )

  const onMoveEnd = useCallback(
    (_event: any, viewport: Viewport) => persist(viewport),
    [persist],
  )

  /**
   * Le cadre d'un traitement capte le pointeur pour le survol : il masque donc le
   * canvas sur toute son étendue, et `panOnDrag` ne peut plus y démarrer. On
   * relaie le geste à la vue React Flow pour ne pas perdre le déplacement à la
   * souris sur la figure.
   */
  const onPanStart = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return
      const startX = e.clientX
      const startY = e.clientY
      const startVp = reactFlowInstance.getViewport()
      const target = e.currentTarget
      panMoved.current = false
      target.setPointerCapture(e.pointerId)
      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) panMoved.current = true
        const viewport = { ...startVp, x: startVp.x + dx, y: startVp.y + dy }
        applyControlsLayout(viewport)
        reactFlowInstance.setViewport(viewport)
      }
      const up = () => {
        target.removeEventListener('pointermove', move)
        target.removeEventListener('pointerup', up)
        target.removeEventListener('pointercancel', up)
        persist(reactFlowInstance.getViewport())
      }
      target.addEventListener('pointermove', move)
      target.addEventListener('pointerup', up)
      target.addEventListener('pointercancel', up)
    },
    [reactFlowInstance, syncOverlays, persist],
  )

  /** Focalise un traitement, sauf si le clic fait suite à un déplacement de vue. */
  const focusSection = useCallback((prefix: string) => {
    if (panMoved.current) return
    setFocusedSectionId(prefix)
  }, [])

  const onNodeDragStop = useCallback(() => {
    dragStartPositions.current = null
    persist(reactFlowInstance.getViewport())
  }, [persist, reactFlowInstance])

  // --- Déplacement : MOT (bloc par défaut) & sections (bloc si verrouillé) ---

  /**
   * Groupe de déplacement d'un nœud, ou `null` s'il se déplace seul.
   *
   * Deux mécanismes cohabitent :
   * - **MOT** — la section se déplace par bloc sauf en mode édition (bouton
   *   ÉDITER du `MotEditToolbar`) ;
   * - **sections** (MCT combinée) — la section ne se déplace par bloc que si elle
   *   est verrouillée ; sinon React Flow déplace le nœud seul.
   */
  const resolveDragGroup = useCallback(
    (nodeId: string): { prefix: string; group: boolean } | null => {
      if (isMot) {
        const entry = motMap.find((e) => nodeId.startsWith(e.prefix))
        if (!entry) return null
        return { prefix: entry.prefix, group: editingMctPrefix !== entry.prefix }
      }
      const section = sections?.find((s) => nodeId.startsWith(s.prefix))
      if (!section) return null
      return { prefix: section.prefix, group: lockedSectionIds.has(section.prefix) }
    },
    [isMot, motMap, editingMctPrefix, sections, lockedSectionIds],
  )

  const onNodeDragStart: OnNodeDrag = useCallback(
    (_event, node) => {
      const group = resolveDragGroup(node.id)
      if (!group?.group) {
        // Un glissement isolé ne propage rien : on invalide d'éventuelles
        // positions de départ laissées par un glissement de bloc précédent.
        dragStartPositions.current = null
        // Non verrouillé : déplacer un élément rend son traitement focalisé.
        const section = sections?.find((s) => node.id.startsWith(s.prefix))
        if (section) setFocusedSectionId(section.prefix)
        return
      }
      const positions: Record<string, { x: number; y: number }> = {}
      for (const n of nodes) {
        if (n.id.startsWith(group.prefix)) positions[n.id] = { x: n.position.x, y: n.position.y }
      }
      dragStartPositions.current = positions
      if (!isMot) setFocusedSectionId(group.prefix)
    },
    [resolveDragGroup, nodes, isMot, sections],
  )

  const onNodeDrag: OnNodeDrag = useCallback(
    (_event, node) => {
      const starts = dragStartPositions.current
      if (!starts) return
      const group = resolveDragGroup(node.id)
      if (!group?.group) return
      const startPos = starts[node.id]
      if (!startPos) return
      const dx = node.position.x - startPos.x
      const dy = node.position.y - startPos.y
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === node.id) return n
          const startNPos = starts[n.id]
          if (!startNPos) return n
          return {
            ...n,
            position: {
              x: Math.round((startNPos.x + dx) / SNAP) * SNAP,
              y: Math.round((startNPos.y + dy) / SNAP) * SNAP,
            },
          }
        }),
      )
    },
    [resolveDragGroup, setNodes],
  )

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (isMot) {
        const entry = motMap.find((e) => node.id.startsWith(e.prefix))
        if (entry) {
          setSelectedMctPrefix(entry.prefix)
        } else {
          setSelectedMctPrefix(null)
          setEditingMctPrefix(null)
        }
        return
      }
      const section = sections?.find((s) => node.id.startsWith(s.prefix))
      setFocusedSectionId(section ? section.prefix : null)
    },
    [isMot, motMap, sections],
  )

  // Le cadre est sous les nœuds : le survol d'une carte ne l'atteint pas, il faut
  // le marquer ici pour que l'encadrement suive le pointeur sur toute la section.
  const onNodeMouseEnter: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (isMot) return
      const section = sections?.find((s) => node.id.startsWith(s.prefix))
      if (section) hoverEnter(section.prefix)
    },
    [isMot, sections, hoverEnter],
  )

  const onNodeMouseLeave: NodeMouseHandler = useCallback(() => {
    if (isMot) return
    hoverLeave()
  }, [isMot, hoverLeave])

  const onPaneClick = useCallback(() => {
    setSelectedMctPrefix(null)
    setEditingMctPrefix(null)
    setFocusedSectionId(null)
  }, [])

  const resetMotPositions = useCallback(() => {
    if (!selectedMctPrefix) return
    const entry = motMap.find((e) => e.prefix === selectedMctPrefix)
    if (!entry) return
    const mctState = loadDiagramState(entry.originalDiagramId)
    const originalPositions = getMotOriginalPositions(motTableConfig)
    setNodes((prev) =>
      prev.map((n) => {
        if (!n.id.startsWith(selectedMctPrefix)) return n
        if (mctState) {
          const originalId = n.id.slice(selectedMctPrefix.length)
          const pos = mctState.positions[originalId]
          if (pos) return { ...n, position: { x: pos.x + entry.offsetX, y: pos.y + entry.offsetY } }
        }
        const fallbackPos = originalPositions[n.id]
        return fallbackPos ? { ...n, position: fallbackPos } : n
      }),
    )
    setTimeout(() => {
      if (reactFlowInstance) persist(reactFlowInstance.getViewport())
    }, 0)
  }, [selectedMctPrefix, setNodes, reactFlowInstance, persist, motMap, motTableConfig])

  const handleMotTableConfigChange = useCallback((newConfig: MotTableConfig) => {
    setMotTableConfig(newConfig)
    saveMotTableConfig(newConfig)

    const layoutChanged =
      JSON.stringify(motTableConfig.colWidths) !== JSON.stringify(newConfig.colWidths) ||
      JSON.stringify(motTableConfig.rowHeights) !== JSON.stringify(newConfig.rowHeights)

    if (layoutChanged) {
      const newMap = getMotMctMap(newConfig)
      const oldOriginalPositions = getMotOriginalPositions(motTableConfig)
      const newOriginalPositions = getMotOriginalPositions(newConfig)
      setNodes((prev) =>
        prev.map((n) => {
          const entry = newMap.find((e) => n.id.startsWith(e.prefix))
          if (!entry) return n
          const oldOriginal = oldOriginalPositions[n.id]
          const newOriginal = newOriginalPositions[n.id]
          if (!newOriginal) return n
          if (!oldOriginal) return { ...n, position: newOriginal }
          const dx = n.position.x - oldOriginal.x
          const dy = n.position.y - oldOriginal.y
          return { ...n, position: { x: newOriginal.x + dx, y: newOriginal.y + dy } }
        }),
      )
    }

    setTimeout(() => {
      if (reactFlowInstance) persist(reactFlowInstance.getViewport())
    }, 0)
  }, [motTableConfig, setNodes, reactFlowInstance, persist])

  // --- Sections (MCT combinée) : mesures, verrou, déplacement ---

  const onNodesInit = useCallback(
    (initialized: ReturnType<typeof useNodesState>[0], setter: ReturnType<typeof useNodesState>[1]) => {
      onNodesInitialized(initialized, setter)
      setNodeSizes((prev) => {
        const next = { ...prev }
        let changed = false
        for (const n of initialized) {
          const w = n.measured?.width
          const h = n.measured?.height
          if (w == null || h == null) continue
          const cur = next[n.id]
          if (!cur || cur.w !== w || cur.h !== h) {
            next[n.id] = { w, h }
            changed = true
          }
        }
        return changed ? next : prev
      })
      // Les cadres ne se recalent correctement qu'une fois les nœuds mesurés : le
      // viewport seul ne suffit pas à connaître leur étendue.
      syncOverlays(reactFlowInstance.getViewport())
    },
    [onNodesInitialized, syncOverlays, reactFlowInstance],
  )

  const startGroupMove = useGroupMove({
    nodes,
    setNodes,
    persist: () => persist(reactFlowInstance.getViewport()),
    onMoved: setFocusedSectionId,
  })

  const onMoveSection = useCallback(
    (e: React.PointerEvent<HTMLElement>, prefix: string) => startGroupMove(e, prefix),
    [startGroupMove],
  )

  const toggleLock = useCallback(
    (section: DiagramSection) => {
      setFocusedSectionId(section.prefix)
      const next = new Set(lockedSectionIds)
      if (next.has(section.prefix)) next.delete(section.prefix)
      else next.add(section.prefix)
      setLockedSectionIds(next)
      persist(reactFlowInstance.getViewport(), next)
    },
    [lockedSectionIds, persist, reactFlowInstance],
  )

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
    setNodeSizes({})
    setFocusedSectionId(null)
    setSelectedMctPrefix(null)
    setEditingMctPrefix(null)
    hoverClear()
    setLockedSectionIds(new Set(loadDiagramState(diagram?.id ?? '')?.lockedSections ?? []))
    if (!diagram) return
    const saved = loadDiagramState(diagram.id)
    if (saved?.viewport) {
      reactFlowInstance.setViewport(saved.viewport)
      syncOverlays(saved.viewport)
    } else {
      reactFlowInstance.fitView({ padding: 0.2 })
      // `fitView` ne déclenche pas toujours `onMove` : sans cet appel les
      // commandes resteraient à leur position de repli tant que l'utilisateur
      // n'aurait pas bougé la vue. `onNodesInit` resynchronise de toute façon ensuite.
      syncOverlays(reactFlowInstance.getViewport())
    }
  }, [diagram?.id])

  if (!diagram) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        Sélectionnez un diagramme dans la sidebar
      </div>
    )
  }

  const isTraitement = diagram.category === 'traitements'
  const hasSections = sectionFrames.length > 0

  return (
    <div
      ref={ref}
      className="h-full w-full relative"
      style={{
        '--mct-event-scale': motTableConfig.mctFontScales.event,
        '--mct-operation-scale': motTableConfig.mctFontScales.operation,
        '--mct-result-scale': motTableConfig.mctFontScales.result,
        '--mct-sync-scale': motTableConfig.mctFontScales.sync,
        // Organigramme : la police se règle sur la largeur du canevas, pas sur le
        // zoom de l'écran — voir `fontScale` dans `types/index.ts`. La variable est
        // aussi déclarée dans `CAPTURE_CSS_VARS` (`utils/exportSvg.ts`), sans quoi
        // l'export SVG la perdrait et retomberait sur 1.
        '--org-font-scale': diagram.fontScale ?? 1,
      } as React.CSSProperties}
    >
      {/* Couche 1 — sous les nœuds : fond de tableau du MOT + encadrements.
          Les cadres doivent être dessous pour capter le survol des gouttières
          entre deux cartes sans avaler les clics destinés aux cartes.
          Cette couche est en coordonnées monde et reçoit `--treatment-inv-zoom`
          pour l'épaisseur du trait (cf. `applyFramesTransform`). */}
      <div
        ref={setFramesLayer}
        className="treatment-layer absolute top-0 left-0 origin-top-left pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {isMot && <MotTableBg config={motTableConfig} />}
        {hasSections && (
          <TreatmentFrames
            frames={sectionFrames}
            onHoverEnter={hoverEnter}
            onHoverLeave={hoverLeave}
            onFocus={focusSection}
            onPanStart={onPanStart}
          />
        )}
      </div>

      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesInitialized={onNodesInit}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onPaneClick={onPaneClick}
        onMove={onMove}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid
        snapGrid={[10, 10]}
        defaultEdgeOptions={{ type: isTraitement ? 'traitement' : 'relationship' }}
        minZoom={0.1}
        panOnDrag={1}
        selectionOnDrag={false}
        nodesDraggable={!rigid}
        edgesReconnectable={!rigid}
        elementsSelectable={!rigid}
        deleteKeyCode={rigid ? null : undefined}
      >
        {showBackground && <Background gap={10} size={1} />}
        <Controls />
      </ReactFlow>

      {/* Couche 2 — au-dessus des nœuds : badge et les deux icônes de l'encadrement,
          qui resteraient masqués par les cartes s'ils étaient dans la couche 1.
          Elle n'est pas transformée : chaque overlay est positionné en px écran
          par `applyControlsLayout`, donc lisible et cliquable à n'importe quel zoom. */}
      {hasSections && (
        <div
          ref={setControlsLayer}
          className="treatment-layer absolute top-0 left-0 pointer-events-none"
          style={{ zIndex: 1000 }}
        >
          <TreatmentFrameControls
            frames={sectionFrames}
            registerOverlay={registerOverlay}
            onHoverEnter={hoverEnter}
            onHoverLeave={hoverLeave}
            onToggleLock={toggleLock}
            onMoveStart={onMoveSection}
          />
        </div>
      )}

      {selectedMctPrefix && isMot && (
        <MotEditToolbar
          mctLabel={motMap.find((e) => e.prefix === selectedMctPrefix)?.label ?? selectedMctPrefix}
          isEditing={editingMctPrefix === selectedMctPrefix}
          onEdit={() => setEditingMctPrefix(selectedMctPrefix)}
          onDone={() => setEditingMctPrefix(null)}
          onReset={resetMotPositions}
        />
      )}
      {isMot && (
        <MotTableToolbar config={motTableConfig} onChange={handleMotTableConfigChange} />
      )}
    </div>
  )
}
