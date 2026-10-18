import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { EntityNodeData } from '../../types'
import { clsx } from 'clsx'
import { hsla } from '../../utils/color'
import SqlScriptBlock from './SqlScriptBlock'
import OrgNode from './OrgNode'
import ActorNode from './ActorNode'
import ScopeNode from './ScopeNode'
import QuadrantNode from './QuadrantNode'
import DecisionNode from './DecisionNode'
import StackNode from './StackNode'
import PersonaNode from './PersonaNode'
import StateNode from './StateNode'
import AuthNode from './AuthNode'
import NotifNode from './NotifNode'
import BfNode from './BfNode'
import RingsNode from './RingsNode'
import HubNode from './HubNode'
import RgNode from './RgNode'
import VersusNode from './VersusNode'
import TreeNode from './TreeNode'
import DeployNode from './DeployNode'
import LevelsNode from './LevelsNode'
import GaugeNode from './GaugeNode'
import BenchmarkNode from './BenchmarkNode'
import StackFlowNode from './StackFlowNode'
import MoscowNode from './MoscowNode'
import TestsPyramidNode from './TestsPyramidNode'
import PaletteNode from './PaletteNode'
import ProcessusAsIsNode from './ProcessusAsIsNode'
import BesoinFunnelNode from './BesoinFunnelNode'
import ObjectifsPyramidNode from './ObjectifsPyramidNode'
import ClaudeSvgNode from './ClaudeSvgNode'

export default function EntityNode({ data, id }: NodeProps<EntityNodeData>) {
  const { label, variant, attributes, color } = data
  const isTable = variant === 'mld' || variant === 'mpd'

  // Organigramme : le rendu est une boîte à trois lignes (rôle / intitulé /
  // titulaire), sans rapport avec la table ou la carte MCD — il est délégué à
  // OrgNode, comme `mpd-sql` l'est à SqlScriptBlock.
  if (variant === 'org-box') {
    return <OrgNode data={data as EntityNodeData} />
  }

  // Figure du mémoire : la neutralité impose un rendu dédié, sans carte
  // individuelle ni poignée. Comme `org-box` et `mpd-sql`, il est délégué.
  if (variant === 'actor') {
    return <ActorNode data={data as EntityNodeData} />
  }

  // Périmètre de projet : cadre composite, lignes et légende. Même délégation.
  if (variant === 'scope') {
    return <ScopeNode data={data as EntityNodeData} />
  }

  // Quadrant de positionnement : points, axes et libellés. Même délégation.
  if (variant === 'quadrant') {
    return <QuadrantNode data={data as EntityNodeData} />
  }

  // Arbre de décision : questions, feuilles écartées et feuille retenue.
  // Même délégation.
  if (variant === 'decision') {
    return <DecisionNode data={data as EntityNodeData} />
  }

  // Tour de la pile : couches, bandeau transversal et légende.
  // Même délégation.
  if (variant === 'stack') {
    return <StackNode data={data as EntityNodeData} />
  }

  // Fiches persona : avatar, rôle, trois blocs. Même délégation.
  if (variant === 'persona') {
    return <PersonaNode data={data as EntityNodeData} />
  }

  // Machine à états : départ, états actifs, états terminaux. Même délégation.
  if (variant === 'state') {
    return <StateNode data={data as EntityNodeData} />
  }

  // Fourche d'authentification : départ, bandeaux, étapes, convergence.
  // Même délégation.
  if (variant === 'auth') {
    return <AuthNode data={data as EntityNodeData} />
  }

  // Correspondance notifications : événements et canaux.
  // Même délégation.
  if (variant === 'notif') {
    return <NotifNode data={data as EntityNodeData} />
  }

  // Besoins fonctionnels : cartes à pictogrammes en grille. Même délégation.
  if (variant === 'bf') {
    return <BfNode data={data as EntityNodeData} />
  }

  // Acteurs concentriques : disques, callouts, lignes de fuite.
  // Même délégation.
  if (variant === 'rings') {
    return <RingsNode data={data as EntityNodeData} />
  }

  // Hub qualité : hub central, médaillons, traits d’appartenance.
  // Même délégation.
  if (variant === 'hub') {
    return <HubNode data={data as EntityNodeData} />
  }

  // Kanban des règles de gestion : colonnes, cartes règle→effet.
  // Même délégation.
  if (variant === 'rg') {
    return <RgNode data={data as EntityNodeData} />
  }

  // Face-à-face Merise/UML : critères, camps, verdict. Même délégation.
  if (variant === 'versus') {
    return <VersusNode data={data as EntityNodeData} />
  }

  // Arborescence de dépôt : racine, branches, tronc et coudes.
  // Même délégation.
  if (variant === 'tree') {
    return <TreeNode data={data as EntityNodeData} />
  }

  // Topologie de déploiement : cadres hôte/Compose, services, ports.
  // Même délégation.
  if (variant === 'deploy') {
    return <DeployNode data={data as EntityNodeData} />
  }

  // Niveaux de tests : objectif, outils, exemples. Même délégation.
  if (variant === 'levels') {
    return <LevelsNode data={data as EntityNodeData} />
  }

  // Jauges de couverture : module, jauge, synthèse. Même délégation.
  if (variant === 'gauge') {
    return <GaugeNode data={data as EntityNodeData} />
  }

  // Matrice de benchmark : sections catégorisées, pastilles Oui/~ /Non. Même délégation.
  if (variant === 'benchmark') {
    return <BenchmarkNode data={data as EntityNodeData} />
  }

  // Pile 3-tiers avec flux bidirectionnels : couches + connecteurs internes. Même délégation.
  if (variant === 'stackflow') {
    return <StackFlowNode data={data as EntityNodeData} />
  }

  // Pyramide MoSCoW : pyramide SVG + cartes de tags. Même délégation.
  if (variant === 'moscow') {
    return <MoscowNode data={data as EntityNodeData} />
  }

  // Pyramide des tests : 3 bandes clip-path + callouts. Même délégation.
  if (variant === 'tpyramid') {
    return <TestsPyramidNode data={data as EntityNodeData} />
  }

  // Palette documentaire : rangée de pastilles (hex du thème Typst). Même délégation.
  if (variant === 'palette') {
    return <PaletteNode data={data as EntityNodeData} />
  }

  // Processus as-is du mémoire : bandeau de stats, 3 chaînes d'outils, ruptures.
  // Même délégation.
  if (variant === 'asis') {
    return <ProcessusAsIsNode data={data as EntityNodeData} />
  }

  // Entonnoir besoin → plateforme : nuage éclaté, sorties fléchées. Même délégation.
  if (variant === 'pairs') {
    return <BesoinFunnelNode data={data as EntityNodeData} />
  }

  // Pyramide des objectifs : 4 bandes empilées numérotées. Même délégation.
  if (variant === 'objpyr') {
    return <ObjectifsPyramidNode data={data as EntityNodeData} />
  }

  // SVG de Claude (collab) : rendu tel quel après recolor. Même délégation.
  if (variant === 'claude') {
    return <ClaudeSvgNode data={data as EntityNodeData} />
  }

  // Vue « script » du MPD : le MPD est aussi un script SQL. Le rendu n'a rien à
  // voir avec un tableau de colonnes, il est délégué à SqlScriptBlock.
  // (`data`/`id` sont `unknown` ici à cause de l'erreur typage React Flow v12
  // préexistante ; on caste à la frontière pour ne pas l'empirer.)
  if (variant === 'mpd-sql') {
    return <SqlScriptBlock data={data as EntityNodeData} id={id as string} />
  }

  return (
    <div
      className={clsx(
        'flex h-full flex-col rounded-2xl border border-solid shadow-[0_7px_9px_0_rgba(0,0,0,0.02)]',
        'border-border bg-background/70 min-w-[200px]',
      )}
      style={color ? { borderColor: color } : undefined}
    >
      <div
        className="border-border rounded-t-2xl border-b border-solid px-3 py-2 text-xs font-semibold flex items-center justify-between"
        style={color ? { backgroundColor: hsla(color, 0.094), color } : undefined}
      >
        <span>{label}</span>
        {isTable && (
          <span
            className="rounded px-1.5 text-[10px] font-bold"
            style={color ? { backgroundColor: hsla(color, 0.2), color } : undefined}
          >
            TABLE
          </span>
        )}
      </div>

      <div className="bg-background relative flex flex-col gap-1 rounded-b-2xl p-3">
        {attributes.map((attr, i) => (
          <div
            key={i}
            className={clsx(
              'text-xs',
              isTable
                ? 'grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-2'
                : 'flex items-center gap-2',
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              {attr.isPK && isTable && (
                <span
                  className="rounded px-1 text-[10px] font-bold"
                  style={color ? { backgroundColor: hsla(color, 0.2), color } : undefined}
                >
                  PK
                </span>
              )}
              {attr.isFK && isTable && (
                <span
                  className="rounded px-1 text-[10px] font-bold"
                  style={color ? { backgroundColor: hsla(color, 0.2), color } : undefined}
                >
                  FK
                </span>
              )}
              <span
                className={clsx((attr.isPK || attr.isFK) && 'font-bold', 'text-foreground')}
                style={
                  color && attr.isPK
                    ? { color, boxShadow: `inset 0px -3px 0px ${hsla(color, 0.2)}` }
                    : color && attr.isFK
                      ? { color }
                      : undefined
                }
              >
                {attr.name}
              </span>
            </span>
            {attr.type && isTable && (
              <span className="text-muted-foreground">{attr.type}</span>
            )}
            {isTable && (
              <span className="text-muted-foreground whitespace-nowrap">
                {attr.nullable ? 'NULL' : 'NOT NULL'}
              </span>
            )}
          </div>
        ))}
      </div>

      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="nodrag nopan h-[10px] w-[10px] border-none bg-gray-400"
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className="nodrag nopan h-[10px] w-[10px] border-none opacity-0"
      />
      <Handle
        id="top"
        type="source"
        position={Position.Top}
        className="nodrag nopan h-[10px] w-[10px] border-none opacity-0"
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="nodrag nopan h-[10px] w-[10px] border-none opacity-0"
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        className="nodrag nopan h-[10px] w-[10px] border-none bg-gray-400"
      />
      <Handle
        id="right"
        type="target"
        position={Position.Right}
        className="nodrag nopan h-[10px] w-[10px] border-none opacity-0"
      />
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="nodrag nopan h-[10px] w-[10px] border-none opacity-0"
      />
      <Handle
        id="bottom"
        type="target"
        position={Position.Bottom}
        className="nodrag nopan h-[10px] w-[10px] border-none opacity-0"
      />
    </div>
  )
}
