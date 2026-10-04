import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { EntityNodeData } from '../../types'
import { hsla } from '../../utils/color'

/**
 * Boîte d'organigramme (variante `org-box`).
 *
 * Trois lignes au plus : `eyebrow` (le rôle, en capitales et coloré), `label`
 * (l'intitulé, en gras) et `person` (le titulaire, atténué). Toutes les tailles
 * passent par `--org-font-scale` : le canevas est dimensionné pour l'impression,
 * pas pour l'écran, donc la police se règle en points une fois la figure réduite
 * à la largeur d'une page A4.
 *
 * La bordure gauche épaisse et le fond teinté reprennent la convention de
 * l'organigramme d'origine ; `color` est fourni par la figure.
 *
 * La boîte ne force **aucune hauteur** : elle prend celle de son contenu, comme
 * les autres nœuds de l'application. C'est un invariant d'export —
 * `captureNodePadded` repositionne sa cible avec `clone.style.height = 'auto'`
 * avant de la rasteriser, donc une hauteur fixe posée ici serait silencieusement
 * abandonnée dans le SVG et l'écran ne refléterait plus la figure imprimée.
 * Seule la largeur est imposée par la figure, pour aligner les colonnes.
 *
 * `data.minHeight` est le seul plancher admis, parce que `min-height` est un
 * longhand distinct de `height` : il survit au `clone.style.height = 'auto'`. Les
 * boîtes d'une même rangée font donc la même hauteur à l'écran comme à
 * l'impression, et la figure cesse de bouger au chargement de la police.
 *
 * Les corps sont calibrés pour ~12 pt une fois la figure réduite à une page A4
 * portrait pleine (canevas de 1300 px de large), d'où 30 px pour l'intitulé. Le
 * titulaire passe en `text-foreground/70` : `text-muted-foreground` est un gris
 * pâle qui devient illisible à l'impression sur le fond teinté des cartes.
 */
export default function OrgNode(props: NodeProps) {
  // `NodeProps<EntityNodeData>` n'est pas satisfait par la v12 de `@xyflow/react`
  // (mêmes erreurs que `EntityNode` et `ProcessNode`, même cause) : `data` y est
  // typé `unknown`. Le contournement est donc identique — on ne pose pas un
  // `as` local pour éviter une seule occurrence d'un motif déjà établi deux fois.
  const data = props.data as unknown as EntityNodeData
  const { label, eyebrow, person, color, minHeight } = data

  return (
    <div
      className="flex w-full flex-col items-center justify-center rounded-lg border border-solid border-border bg-card px-4 py-4 text-center"
      style={{
        // Bordure gauche colorée : l'organigramme distingue les niveaux par la
        // couleur de la barre, pas par une teinte de fond. `backgroundColor` et
        // non `background` : sans couleur, `bg-card` doit rester visible.
        borderLeftWidth: 8,
        borderLeftColor: color,
        backgroundColor: hsla(color, 0.07),
        minHeight,
      }}
    >
      {eyebrow && (
        <div
          className="pb-1 font-bold uppercase leading-tight tracking-[0.06em]"
          // Corps en `style` inline, et non en classe utilitaire arbitraire :
          // Tailwind ne génère pas une valeur `calc()` contenant une virgule de
          // `var()`, la classe serait ignorée sans un mot. Même convention que
          // `ProcessNode` pour `--mct-sync-scale`.
          style={{ fontSize: 'calc(var(--org-font-scale, 1) * 20px)', color }}
        >
          {eyebrow}
        </div>
      )}

      <div
        className="py-1 font-bold leading-[1.15] text-foreground"
        style={{ fontSize: 'calc(var(--org-font-scale, 1) * 30px)' }}
      >
        {label}
      </div>

      {person && (
        <div
          className="pt-1 leading-tight text-foreground/70"
          style={{ fontSize: 'calc(var(--org-font-scale, 1) * 24px)' }}
        >
          {person}
        </div>
      )}

      {/* Organigramme : on sort par le bas, on entre par le haut. L'ordre des
          `<Handle>` est aligné sur `handleIdsOf` (famille verticale) — sinon
          React Flow (premier handle du type dans le DOM) et le calcul d'offset
          divergeraient. */}
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="nodrag nopan h-[10px] w-[10px] border-none bg-gray-400"
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="nodrag nopan h-[10px] w-[10px] border-none opacity-0"
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
        id="top"
        type="target"
        position={Position.Top}
        className="nodrag nopan h-[10px] w-[10px] border-none bg-gray-400"
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        className="nodrag nopan h-[10px] w-[10px] border-none opacity-0"
      />
      <Handle
        id="right"
        type="target"
        position={Position.Right}
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
