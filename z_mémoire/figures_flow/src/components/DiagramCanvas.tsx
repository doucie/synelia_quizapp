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
import RelationshipEdge from './Edges/RelationshipEdge'
import TraitementEdge from './Edges/TraitementEdge'
import { loadDiagramState, useDiagramState, loadPositions, loadCardinalitySides, loadMotPositions, loadMotCardinalitySides } from '../hooks/useDiagramState'
import { applyEntityColors } from '../utils/entityColors'
import { MOT_MCT_MAP, getMotOriginalPositions } from '../diagrams/mot/mot_organisationnel_v2'
import type { DiagramDefinition, RelationshipEdgeData, EntityNodeData } from '../types'

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
  const initialNodes = useMemo(() => {
    if (!diagram) return []
    let nodes = applyEntityColors(diagram.nodes)
    if (diagram.id === 'mot-organisationnel-v2') {
      const motState = loadDiagramState('mot-organisationnel-v2')
      if (motState?.positions) {
        nodes = loadPositions('mot-organisationnel-v2', nodes)
      } else {
        nodes = loadMotPositions(nodes, MOT_MCT_MAP)
      }
    } else {
      nodes = loadPositions(diagram.id, nodes)
    }
    return nodes
  }, [diagram])
  const initialEdges = useMemo(() => {
    if (!diagram) return []
    const sides = diagram.id === 'mot-organisationnel-v2'
      ? loadMotCardinalitySides(MOT_MCT_MAP)
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
  }, [diagram])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [editingMctPrefix, setEditingMctPrefix] = useState<string | null>(null)
  const [selectedMctPrefix, setSelectedMctPrefix] = useState<string | null>(null)

  const { saveState } = useDiagramState(diagram?.id ?? '')

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
      const entry = MOT_MCT_MAP.find((e) => node.id.startsWith(e.prefix))
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
    [diagram, nodes, editingMctPrefix],
  )

  const onNodeDrag: OnNodeDrag = useCallback(
    (_event, node) => {
      if (diagram?.id !== 'mot-organisationnel-v2') return
      if (!dragStartPositions.current) return
      const entry = MOT_MCT_MAP.find((e) => node.id.startsWith(e.prefix))
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
    [diagram, setNodes, editingMctPrefix],
  )

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (diagram?.id !== 'mot-organisationnel-v2') return
      const entry = MOT_MCT_MAP.find((e) => node.id.startsWith(e.prefix))
      if (entry) {
        setSelectedMctPrefix(entry.prefix)
      } else {
        setSelectedMctPrefix(null)
        setEditingMctPrefix(null)
      }
    },
    [diagram],
  )

  const onPaneClick = useCallback(() => {
    setSelectedMctPrefix(null)
    setEditingMctPrefix(null)
  }, [])

  const resetMotPositions = useCallback(() => {
    if (!selectedMctPrefix) return
    const entry = MOT_MCT_MAP.find((e) => e.prefix === selectedMctPrefix)
    if (!entry) return
    const mctState = loadDiagramState(entry.originalDiagramId)
    const originalPositions = getMotOriginalPositions()
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
  }, [selectedMctPrefix, setNodes, reactFlowInstance, persist])

  if (!diagram) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        Sélectionnez un diagramme dans la sidebar
      </div>
    )
  }

  const isTraitement = diagram.category === 'traitements'

  return (
    <div ref={ref} className="h-full w-full relative">
      {diagram.id === 'mot-organisationnel-v2' && (
        <div
          ref={tableRef}
          className="absolute top-0 left-0 origin-top-left pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <MotTableBg />
        </div>
      )}
      <ReactFlow
        nodes={nodes}
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
      {selectedMctPrefix && diagram.id === 'mot-organisationnel-v2' && (
        <MotEditToolbar
          mctLabel={MOT_MCT_MAP.find((e) => e.prefix === selectedMctPrefix)?.label ?? selectedMctPrefix}
          isEditing={editingMctPrefix === selectedMctPrefix}
          onEdit={() => setEditingMctPrefix(selectedMctPrefix)}
          onDone={() => setEditingMctPrefix(null)}
          onReset={resetMotPositions}
        />
      )}
    </div>
  )
}
