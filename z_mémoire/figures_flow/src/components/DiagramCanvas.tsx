import { useEffect, useMemo, useRef, useCallback, useState } from 'react'
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
import RelationshipEdge from './Edges/RelationshipEdge'
import TraitementEdge from './Edges/TraitementEdge'
import { loadDiagramState, useDiagramState, loadPositions, loadCardinalitySides, loadMotPositions, loadMotCardinalitySides, loadMotTableConfig, saveMotTableConfig } from '../hooks/useDiagramState'
import { applyEntityColors } from '../utils/entityColors'
import { getMotMctMap, getMotOriginalPositions } from '../diagrams/mot/mot_organisationnel_v2'
import { useEdgeDebugEnabled, setEdgeDebugEnabled } from '../utils/edgeDebug'
import type { DiagramDefinition, RelationshipEdgeData, EntityNodeData, MotTableConfig } from '../types'

const nodeTypes: NodeTypes = { entity: EntityNode, process: ProcessNode }
const edgeTypes: EdgeTypes = { relationship: RelationshipEdge, traitement: TraitementEdge }

function getValidHandles(nodeId: string, nodes: ReturnType<typeof useNodesState>[0], handleType: 'source' | 'target'): Set<string> {
  const node = nodes.find((n) => n.id === nodeId)
  if (!node) return new Set(['left', 'right', 'top', 'bottom'])
  const data = node.data as EntityNodeData
  if (data.variant === 'mct-operation' && data.emissionRules?.length) {
    if (handleType === 'source') return new Set(data.emissionRules)
    return new Set(['top'])
  }
  return new Set(['left', 'right', 'top', 'bottom'])
}

interface DiagramCanvasProps {
  diagram: DiagramDefinition | null
  showBackground: boolean
  fullscreen: boolean
  onNodesInitialized: (nodes: ReturnType<typeof useNodesState>[0], setter: ReturnType<typeof useNodesState>[1]) => void
}

export default function DiagramCanvas({ diagram, showBackground, fullscreen: _fullscreen, onNodesInitialized }: DiagramCanvasProps) {
  const ref = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useReactFlow()
  const dragStartPositions = useRef<Record<string, { x: number; y: number }> | null>(null)
  const [motTableConfig, setMotTableConfig] = useState<MotTableConfig>(() => loadMotTableConfig())
  const edgeDebug = useEdgeDebugEnabled()

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
      const validSourceHandles = getValidHandles(e.source, diagram.nodes, 'source')
      const validTargetHandles = getValidHandles(e.target, diagram.nodes, 'target')
      return {
        ...e,
        sourceHandle: e.sourceHandle ?? (cardFromSide && cardFromSide !== 'source' && validSourceHandles.has(cardFromSide) ? cardFromSide : undefined),
        targetHandle: e.targetHandle ?? (cardToSide && cardToSide !== 'source' && validTargetHandles.has(cardToSide) ? cardToSide : undefined),
        data: {
          ...e.data,
          diagramId: diagram.id,
          ...(cardFromSide && validSourceHandles.has(cardFromSide) ? { cardFromSide } : {}),
          ...(cardToSide && validTargetHandles.has(cardToSide) ? { cardToSide } : {}),
        },
      }
    })
  }, [diagram, motMap])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [editingMctPrefix, setEditingMctPrefix] = useState<string | null>(null)
  const [selectedMctPrefix, setSelectedMctPrefix] = useState<string | null>(null)

  const { saveState } = useDiagramState(diagram?.id ?? '')

  const displayNodes = useMemo(() => {
    if (!selectedMctPrefix) return nodes
    return nodes.map((n) => {
      const isSelected = n.id.startsWith(selectedMctPrefix)
      const hasClass = n.className?.includes('mot-mct-selected')
      if (isSelected && !hasClass) {
        return { ...n, className: `${n.className ?? ''} mot-mct-selected`.trim() }
      }
      if (!isSelected && hasClass) {
        return { ...n, className: (n.className ?? '').replace('mot-mct-selected', '').trim() }
      }
      return n
    })
  }, [nodes, selectedMctPrefix])

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
    if (!diagram) return
    const saved = loadDiagramState(diagram.id)
    if (saved?.viewport) {
      reactFlowInstance.setViewport(saved.viewport)
      applyTableTransform(saved.viewport)
    } else {
      reactFlowInstance.fitView({ padding: 0.2 })
    }
  }, [diagram?.id])

  const persist = useCallback(
    (viewport: Viewport) => {
      if (!diagram) return
      const positions: Record<string, { x: number; y: number }> = {}
      for (const n of nodes) {
        positions[n.id] = n.position
      }
      saveState({ positions, viewport })
    },
    [diagram, nodes, saveState],
  )

  const onMoveEnd = useCallback(
    (_event: any, viewport: Viewport) => persist(viewport),
    [persist],
  )

  const applyTableTransform = useCallback((v: Viewport) => {
    if (tableRef.current) {
      tableRef.current.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.zoom})`
    }
  }, [])

  const onMove = useCallback(
    (_event: any, viewport: Viewport) => applyTableTransform(viewport),
    [applyTableTransform],
  )

  const onNodeDragStop = useCallback(
    () => {
      dragStartPositions.current = null
      persist(reactFlowInstance.getViewport())
    },
    [persist, reactFlowInstance],
  )

  const onNodeDragStart: OnNodeDrag = useCallback(
    (_event, node) => {
      if (diagram?.id !== 'mot-organisationnel-v2') return
      const entry = motMap.find((e) => node.id.startsWith(e.prefix))
      if (!entry) return
      if (editingMctPrefix === entry.prefix) return
      const positions: Record<string, { x: number; y: number }> = {}
      for (const n of nodes) {
        if (n.id.startsWith(entry.prefix)) {
          positions[n.id] = { x: n.position.x, y: n.position.y }
        }
      }
      dragStartPositions.current = positions
    },
    [diagram, nodes, editingMctPrefix, motMap],
  )

  const onNodeDrag: OnNodeDrag = useCallback(
    (_event, node) => {
      if (diagram?.id !== 'mot-organisationnel-v2') return
      if (!dragStartPositions.current) return
      const entry = motMap.find((e) => node.id.startsWith(e.prefix))
      if (!entry) return
      if (editingMctPrefix === entry.prefix) return
      const startPos = dragStartPositions.current[node.id]
      if (!startPos) return
      const dx = node.position.x - startPos.x
      const dy = node.position.y - startPos.y
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === node.id) return n
          if (!n.id.startsWith(entry.prefix)) return n
          const startNPos = dragStartPositions.current?.[n.id]
          if (!startNPos) return n
          return { ...n, position: { x: startNPos.x + dx, y: startNPos.y + dy } }
        })
      )
    },
    [diagram, setNodes, editingMctPrefix, motMap],
  )

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (diagram?.id !== 'mot-organisationnel-v2') return
      const entry = motMap.find((e) => node.id.startsWith(e.prefix))
      if (entry) {
        setSelectedMctPrefix(entry.prefix)
      } else {
        setSelectedMctPrefix(null)
        setEditingMctPrefix(null)
      }
    },
    [diagram, motMap],
  )

  const onPaneClick = useCallback(() => {
    setSelectedMctPrefix(null)
    setEditingMctPrefix(null)
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
      })
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
        })
      )
    }

    setTimeout(() => {
      if (reactFlowInstance) persist(reactFlowInstance.getViewport())
    }, 0)
  }, [motTableConfig, setNodes, reactFlowInstance, persist])

  if (!diagram) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        Sélectionnez un diagramme dans la sidebar
      </div>
    )
  }

  const isTraitement = diagram.category === 'traitements'

  return (
    <div
      ref={ref}
      className="h-full w-full relative"
      style={{
        '--mct-event-scale': motTableConfig.mctFontScales.event,
        '--mct-operation-scale': motTableConfig.mctFontScales.operation,
        '--mct-result-scale': motTableConfig.mctFontScales.result,
        '--mct-sync-scale': motTableConfig.mctFontScales.sync,
      } as React.CSSProperties}
    >
      {diagram.id === 'mot-organisationnel-v2' && (
        <div
          ref={tableRef}
          className="absolute top-0 left-0 origin-top-left pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <MotTableBg config={motTableConfig} />
        </div>
      )}
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onMove={onMove}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid
        snapGrid={[10, 10]}
        defaultEdgeOptions={{ type: isTraitement ? 'traitement' : 'relationship' }}
        panOnDrag={1}
        selectionOnDrag={false}
      >
        {showBackground && <Background gap={10} size={1} />}
        <Controls />
      </ReactFlow>
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1000,
          pointerEvents: 'auto',
        }}
      >
        <button
          onClick={() => setEdgeDebugEnabled(!edgeDebug)}
          className={edgeDebug
            ? 'rounded border border-primary bg-primary/15 px-2 py-1 text-[10px] font-semibold text-primary'
            : 'rounded border border-border bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground'}
        >
          {edgeDebug ? 'DEBUG ON' : 'DEBUG'}
        </button>
      </div>
      {selectedMctPrefix && diagram.id === 'mot-organisationnel-v2' && (
        <MotEditToolbar
          mctLabel={motMap.find((e) => e.prefix === selectedMctPrefix)?.label ?? selectedMctPrefix}
          isEditing={editingMctPrefix === selectedMctPrefix}
          onEdit={() => setEditingMctPrefix(selectedMctPrefix)}
          onDone={() => setEditingMctPrefix(null)}
          onReset={resetMotPositions}
        />
      )}
      {diagram.id === 'mot-organisationnel-v2' && (
        <MotTableToolbar config={motTableConfig} onChange={handleMotTableConfigChange} />
      )}
    </div>
  )
}
