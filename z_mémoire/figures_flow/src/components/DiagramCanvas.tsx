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
import RelationshipEdge from './Edges/RelationshipEdge'
import { loadDiagramState, useDiagramState, loadPositions } from '../hooks/useDiagramState'
import { applyEntityColors } from '../utils/entityColors'
import type { DiagramDefinition } from '../types'

const nodeTypes: NodeTypes = { entity: EntityNode }
const edgeTypes: EdgeTypes = { relationship: RelationshipEdge }

interface DiagramCanvasProps {
  diagram: DiagramDefinition | null
  showBackground: boolean
  fullscreen: boolean
  onNodesInitialized: (nodes: ReturnType<typeof useNodesState>[0], setter: ReturnType<typeof useNodesState>[1]) => void
}

export default function DiagramCanvas({ diagram, showBackground, fullscreen: _fullscreen, onNodesInitialized }: DiagramCanvasProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useReactFlow()
  const initialNodes = useMemo(
    () => (diagram ? applyEntityColors(loadPositions(diagram.id, diagram.nodes)) : []),
    [diagram],
  )
  const initialEdges = useMemo(() => diagram?.edges ?? [], [diagram])

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
        defaultEdgeOptions={{ type: 'relationship' }}
        panOnDrag={1}
        selectionOnDrag={false}
      >
        {showBackground && <Background gap={10} size={1} />}
        <Controls />
      </ReactFlow>
    </div>
  )
}
