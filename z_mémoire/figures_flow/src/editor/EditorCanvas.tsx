import { useCallback, useEffect, useRef } from 'react'
import {
  Background,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type EdgeTypes,
  type Node,
  type NodeTypes,
} from '@xyflow/react'
import EntityNode from '../components/Nodes/EntityNode'
import RelationshipEdge from '../components/Edges/RelationshipEdge'
import { validHandles } from '../components/Edges/edgeAnchors'
import { loadCardinalitySides } from '../hooks/useDiagramState'
import { addEntity, edgeSidesKey, toEdges, toNodes, uid, type EntityDef, type ModelDoc } from './model'
import type { Selection } from './Inspector'

const nodeTypes: NodeTypes = { entity: EntityNode }
const edgeTypes: EdgeTypes = { relationship: RelationshipEdge }

const SNAP = 10

interface EditorCanvasProps {
  doc: ModelDoc
  onChange: (updater: (doc: ModelDoc) => ModelDoc, scope?: string) => void
  onSelectionChange: (selection: Selection) => void
  showBackground: boolean
}

/**
 * Canevas d'édition.
 *
 * React Flow détient les positions pendant un glissement, le document détient
 * tout le reste. Les deux effets de synchronisation ci-dessous recollent
 * l'ensemble après chaque modification du document, en conservant ce que seul
 * React Flow sait : la position d'une carte en cours de déplacement, et les
 * côtés d'ancrage choisis par le popover des arêtes.
 *
 * Aucune suppression n'est laissée à React Flow (`deleteKeyCode={null}`) :
 * supprimer une entité doit aussi supprimer ses associations, décision que
 * seul le document peut prendre. C'est `ModelEditor` qui reçoit `Suppr`.
 */
export default function EditorCanvas({
  doc,
  onChange,
  onSelectionChange,
  showBackground,
}: EditorCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(toNodes(doc))
  const [edges, setEdges, onEdgesChange] = useEdgesState(toEdges(doc))
  const { screenToFlowPosition } = useReactFlow()
  const wrapper = useRef<HTMLDivElement>(null)

  /* Document -> cartes. La position du document fait foi, sauf pendant un
     glissement (le document n'est mis à jour qu'au relâchement). */
  useEffect(() => {
    setNodes((prev) => {
      const byId = new Map(prev.map((n) => [n.id, n]))
      return toNodes(doc).map((base) => {
        const old = byId.get(base.id)
        if (!old) return base
        return {
          ...old,
          data: base.data,
          position: old.dragging ? old.position : base.position,
        }
      })
    })
  }, [doc, setNodes])

  /* Document -> arêtes. `sourceHandle` / `targetHandle` ne vivent pas dans le
     document (c'est `RelationshipEdge` qui les écrit, par son popover) : on
     garde ceux déjà posés, sinon on relit le réglage persisté. */
  useEffect(() => {
    const nodeMap = new Map<string, Node>(toNodes(doc).map((n) => [n.id, n]))
    const sides = loadCardinalitySides(edgeSidesKey(doc.id))
    setEdges((prev) => {
      const byId = new Map(prev.map((e) => [e.id, e]))
      return toEdges(doc).map((base) => {
        const old = byId.get(base.id)
        const saved = sides[base.id]
        const sourceCandidates = validHandles(nodeMap.get(base.source), 'source')
        const targetCandidates = validHandles(nodeMap.get(base.target), 'target')
        const sourceSide = old?.sourceHandle ?? saved?.from
        const targetSide = old?.targetHandle ?? saved?.to
        return {
          ...base,
          selected: old?.selected,
          sourceHandle:
            sourceSide && sourceSide !== 'source' && sourceCandidates.has(sourceSide)
              ? sourceSide
              : undefined,
          targetHandle:
            targetSide && targetSide !== 'source' && targetCandidates.has(targetSide)
              ? targetSide
              : undefined,
        }
      })
    })
  }, [doc, setEdges])

  const handleConnect = useCallback(
    (connection: Connection) => {
      const { source, target } = connection
      if (!source || !target || source === target) return
      onChange((current) => {
        if (current.links.some((l) => l.from === source && l.to === target)) return current
        return {
          ...current,
          links: [
            ...current.links,
            {
              id: uid('l'),
              name: '',
              from: source,
              to: target,
              cardFrom: '0,n',
              cardTo: '1,1',
            },
          ],
        }
      })
    },
    [onChange],
  )

  const handleDragStop = useCallback(
    (node: Node) => {
      onChange((current) => ({
        ...current,
        entities: current.entities.map((e) =>
          e.id === node.id ? { ...e, position: { x: node.position.x, y: node.position.y } } : e,
        ),
      }))
    },
    [onChange],
  )

  const createEntityAt = useCallback(
    (clientX?: number, clientY?: number) => {
      const position =
        clientX !== undefined && clientY !== undefined
          ? screenToFlowPosition({ x: clientX, y: clientY })
          : undefined
      const box: { entity?: EntityDef } = {}
      onChange((current) => {
        const result = addEntity(current, position)
        box.entity = result.entity
        return result.doc
      })
      if (box.entity) onSelectionChange({ kind: 'entity', id: box.entity.id })
    },
    [onChange, onSelectionChange, screenToFlowPosition],
  )

  const isEmpty = doc.entities.length === 0

  return (
    <div
      ref={wrapper}
      className="relative h-full w-full"
      onDoubleClick={(event) => {
        const target = event.target as HTMLElement
        if (!target.closest('.react-flow__pane')) return
        createEntityAt(event.clientX, event.clientY)
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeDragStop={(_, node) => handleDragStop(node)}
        onNodeClick={(_, node) => onSelectionChange({ kind: 'entity', id: node.id })}
        onEdgeClick={(_, edge) => onSelectionChange({ kind: 'link', id: edge.id })}
        onPaneClick={() => onSelectionChange(null)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid
        snapGrid={[SNAP, SNAP]}
        minZoom={0.1}
        maxZoom={2}
        panOnDrag={[1, 2]}
        selectionOnDrag
        zoomOnDoubleClick={false}
        deleteKeyCode={null}
        defaultEdgeOptions={{ type: 'relationship' }}
        fitView
        fitViewOptions={{ padding: 0.25, maxZoom: 1 }}
      >
        {showBackground && <Background gap={10} size={1} />}
        <Controls showInteractive={false} />
      </ReactFlow>

      {isEmpty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rounded border border-dashed border-border bg-background/80 px-4 py-3 text-xs text-muted-foreground">
            Double-clic sur le fond pour créer la première entité
          </p>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 shadow-sm">
        <button
          type="button"
          className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
          onClick={() => createEntityAt()}
        >
          + entité
        </button>
        <span className="text-[10px] text-muted-foreground">
          double-clic : entité · glisser d’un point : association
        </span>
      </div>
    </div>
  )
}
