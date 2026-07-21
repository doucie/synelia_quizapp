import { useEffect, useMemo, useRef, useCallback } from 'react'
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
} from '@xyflow/react'
import EntityNode from './Nodes/EntityNode'
import ProcessNode from './Nodes/ProcessNode'
import RelationshipEdge from './Edges/RelationshipEdge'
import TraitementEdge from './Edges/TraitementEdge'
import { loadDiagramState, useDiagramState, loadPositions, loadCardinalitySides } from '../hooks/useDiagramState'
import { applyEntityColors } from '../utils/entityColors'
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
  const reactFlowInstance = useReactFlow()
  const initialNodes = useMemo(() => {
    if (!diagram) return []
    return loadPositions(diagram.id, applyEntityColors(diagram.nodes))
  }, [diagram])
  const initialEdges = useMemo(() => {
    if (!diagram) return []
    const sides = loadCardinalitySides(diagram.id)
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

  const { saveState } = useDiagramState(diagram?.id ?? '')

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
    if (!diagram) return
    const saved = loadDiagramState(diagram.id)
    if (saved?.viewport) {
      reactFlowInstance.setViewport(saved.viewport)
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

  const onNodeDragStop = useCallback(
    () => persist(reactFlowInstance.getViewport()),
    [persist, reactFlowInstance],
  )

  if (!diagram) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        Sélectionnez un diagramme dans la sidebar
      </div>
    )
  }

  const isTraitement = diagram.category === 'traitements'

  return (
    <div ref={ref} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
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
    </div>
  )
}
