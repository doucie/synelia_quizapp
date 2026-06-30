import { useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react'
import EntityNode from './Nodes/EntityNode'
import RelationshipEdge from './Edges/RelationshipEdge'
import { useDiagramPersistence, loadPositions } from '../hooks/useDiagramPersistence'
import { applyEntityColors } from '../utils/entityColors'
import type { DiagramDefinition } from '../types'

const nodeTypes: NodeTypes = { entity: EntityNode }
const edgeTypes: EdgeTypes = { relationship: RelationshipEdge }

interface DiagramCanvasProps {
  diagram: DiagramDefinition | null
  showBackground: boolean
  onNodesInitialized: (nodes: ReturnType<typeof useNodesState>[0], setter: ReturnType<typeof useNodesState>[1]) => void
}

export default function DiagramCanvas({ diagram, showBackground, onNodesInitialized }: DiagramCanvasProps) {
  const ref = useRef<HTMLDivElement>(null)
  const initialNodes = useMemo(
    () => (diagram ? applyEntityColors(loadPositions(diagram.id, diagram.nodes)) : []),
    [diagram],
  )
  const initialEdges = useMemo(() => diagram?.edges ?? [], [diagram])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [diagram?.id])

  const { savePositions } = useDiagramPersistence(diagram?.id ?? '')

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
        onNodeDragStop={() => savePositions(nodes)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
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
