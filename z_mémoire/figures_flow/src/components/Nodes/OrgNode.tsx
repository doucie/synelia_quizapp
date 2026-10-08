import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { EntityNodeData } from '../../types'
import { hsla } from '../../utils/color'

/**
 * Boîte d'organigramme (variante `org-box`), en trois niveaux de style.
 *
 * Trois lignes au plus : `eyebrow` (le rôle, en capitales et coloré), `label`
 * (l'intitulé, en gras) et `person` (le titulaire, atténué). Toutes les tailles
 * passent par `--org-font-scale` : le canevas est dimensionné pour l'impression,
 * pas pour l'écran, donc la police se règle en points une fois la figure réduite
 * à la largeur d'une page A4.
 *
 * Les trois styles viennent de l'organigramme d'origine, qui distingue les
 * niveaux par la boîte et non par le trait. C'est devenu le signal principal
 * depuis la suppression des liens sous les directions : il ne reste que la
 * couleur et l'alignement, et des services sans style propre se confondraient
 * avec leur direction.
 *
*   gov  bordure gauche 5, rayon 8, padding 8/12, sur-titre, corps de base
 *   dir  bordure gauche 5, rayon 10, padding 10/13, sur-titre, corps de base
 *   svc  bordure gauche 3, rayon 6, padding 5/10, **contour plein**, corps réduit
 *
 * Un service n'a pas de teinte : il porte le **fond de la page**, comme le veut
 * l'original, mais en prenant `--background` et non un blanc en dur — l'encre suit
 * `text-foreground`, donc un fond figé donnait du blanc sur blanc en dark mode. Le
 * discriminant de niveau est donc le **contour**, qui prend la couleur de la
 * direction sur les quatre côtés : `border-border` vaut 95 % de clarté et disparaît
 * à l'impression. Leur corps passe à 0.875 de la base, l'original faisant de même
 * (11/12,5 et 8,8/9,5).
 *
 * `color` est fourni par la figure et **partagé** entre une direction et ses
 * services : c'est ce qui tient le regroupement quand les liens ont disparu.
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
 * Les corps sont calibrés pour ~11 pt une fois la figure réduite à une page A4
 * paysage pleine (zone de 25,3 cm sur un canevas de 2644 px, soit une densité de
 * 66 px par corps), d'où 30 px pour l'intitulé. Le titulaire passe en
 * `text-foreground/70` : `text-muted-foreground` est un gris pâle qui devient
 * illisible à l'impression sur le fond teinté des cartes.
 */

/** Corps de base, avant `--org-font-scale` : sur-titre, intitulé, titulaire. */
const BASE = { eyebrow: 20, label: 30, person: 24 } as const

/**
 * Facteur de corps des services, appliqué à l'intitulé et au titulaire. Une
 * hiérarchie par service : l'original distingue ses services par la taille ET par
 * le fond blanc, et réduire le corps économise de la hauteur, la ressource rare
 * de la page paysage.
 */
const SERVICE_FONT = 0.875

/**
 * Style de boîte par niveau : ce qui reste une fois la couleur abstraite.
 *
 * `tint` vaut 0 pour un service, qui ne porte **pas** de teinte mais le fond de la
 * page — donc il suit le thème, et l'export sort dans le mode choisi au moment de
 * l'export. `edge` bascule les quatre côtés sur la couleur de la direction.
 */
const LEVEL_STYLE = {
  gov: { radius: 'rounded-lg', px: 12, py: 8, left: 5, tint: 0.07, edge: false },
  dir: { radius: 'rounded-[10px]', px: 13, py: 10, left: 5, tint: 0.07, edge: false },
  svc: { radius: 'rounded-md', px: 10, py: 5, left: 3, tint: 0, edge: true },
} as const

/**
 * Style commun aux huit `<Handle>` : boîte nulle, pour que l'ancre — le centre
 * de cette boîte — tombe exactement sur le bord de la carte.
 *
 * Un style inline est la seule parade : xyflow écrit `.react-flow__handle {
 * height: 6px }` dans une feuille **non mise en couche**, qui l'emporte sur
 * toute utilitaire Tailwind (celles-ci vivent dans `@layer utilities`), donc
 * `h-[10px]` n'a jamais rien mesuré. Voir le commentaire au pied des handles
 * pour les 3 px que cela décalait, et pourquoi ils cassaient le contrat `dY = 0`.
 */
const HANDLE_STYLE = {
  width: 0,
  height: 0,
  minWidth: 0,
  minHeight: 0,
  border: 'none',
  background: 'transparent',
} as const

export default function OrgNode(props: NodeProps) {
  // `NodeProps<EntityNodeData>` n'est pas satisfait par la v12 de `@xyflow/react`
  // (mêmes erreurs que `EntityNode` et `ProcessNode`, même cause) : `data` y est
  // typé `unknown`. Le contournement est donc identique — on ne pose pas un
  // `as` local pour éviter une seule occurrence d'un motif déjà établi deux fois.
  const data = props.data as unknown as EntityNodeData
  const { label, eyebrow, person, color, minHeight } = data

  const level = data.orgLevel ?? 'dir'
  const style = LEVEL_STYLE[level]
  const font = level === 'svc' ? SERVICE_FONT : 1
  const px = (value: number) => ({
    // Corps en `style` inline, et non en classe utilitaire arbitraire :
    // Tailwind ne génère pas une valeur `calc()` contenant une virgule de
    // `var()`, la classe serait ignorée sans un mot. Même convention que
    // `ProcessNode` pour `--mct-sync-scale`.
    fontSize: `calc(var(--org-font-scale, 1) * ${value}px)`,
  })

  return (
    <div
      className={`flex w-full flex-col items-center justify-center border border-solid border-border text-center ${style.radius}`}
      style={{
        // Bordure gauche colorée, épaisseur par niveau.
        borderLeftWidth: style.left,
        borderLeftColor: color,
        // Fond : les niveaux supérieurs portent une teinte de leur couleur, un
        // service porte le fond de la page. `--background` et non un blanc en dur :
        // l'encre suit `text-foreground`, donc un fond figé rendait l'intitulé
        // **blanc sur blanc** en dark mode, et l'export cessait de correspondre à
        // l'écran. Les deux suivent le thème, l'export suit le mode choisi.
        backgroundColor:
          style.tint === 0 ? 'hsl(var(--background))' : hsla(color, style.tint),
        // `border-border` vaut 95 % de clarté : invisible à l'impression sur une
        // page blanche. Un service n'a pas de teinte pour se détacher du fond, sa
        // seule délimitation est donc ce contour — on lui donne la couleur de sa
        // direction sur les quatre côtés, ce qui renforce le regroupement.
        borderColor: style.edge ? color : undefined,
        paddingLeft: style.px,
        paddingRight: style.px,
        paddingTop: style.py,
        paddingBottom: style.py,
        minHeight,
      }}
    >
      {eyebrow && (
        <div
          className="pb-1 font-bold uppercase leading-tight tracking-[0.06em]"
          style={{ ...px(BASE.eyebrow * font), color }}
        >
          {eyebrow}
        </div>
      )}

      <div
        className="py-1 font-bold leading-[1.15] text-foreground"
        style={px(BASE.label * font)}
      >
        {label}
      </div>

      {person && (
        <div
          className="pt-1 leading-tight text-foreground/70"
          style={px(BASE.person * font)}
        >
          {person}
        </div>
      )}

      {/* Organigramme : on sort par le bas, on entre par le haut. L'ordre des
          `<Handle>` est aligné sur `handleIdsOf` (famille verticale) — sinon
          React Flow (premier handle du type dans le DOM) et le calcul d'offset
          divergeraient.

          `HANDLE_STYLE` n'est pas cosmétique. `.react-flow__handle-bottom`
          positionne le handle avec `bottom: 0` **puis** `translate(…, 50%)` :
          l'ancre est le *centre* de la boîte du handle, donc à `H / 2` du bord
          de la carte. Or xyflow impose `height: 6px` dans une feuille **non
          mise en couche**, ce qui bat toute utilitaire Tailwind (`@layer
          utilities`) quelle que soit la source — `h-[10px]` n'était donc
          jamais appliqué. Résultat mesuré : les 22 arêtes partaient 3 px sous
          la carte, et celle du PMO s'arrivait 3 px au-dessus de son centre, ce
          qui contredisait le contrat `dY = 0` du ConnectingEdge et laissait un
          bec de 3 px à l'arrivée. La seule parade est un style inline, seul
          niveau de cascade qui l'emporte.

          Taille nulle : rien à perdre pour l'interaction (la figure est
          `rigidLayout`, donc `edgesReconnectable` est coupé) et aucune pastille
          de 6 px à capturer dans le SVG exporté. */}
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="nodrag nopan"
        style={HANDLE_STYLE}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="nodrag nopan"
        style={HANDLE_STYLE}
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className="nodrag nopan"
        style={HANDLE_STYLE}
      />
      <Handle
        id="top"
        type="source"
        position={Position.Top}
        className="nodrag nopan"
        style={HANDLE_STYLE}
      />

      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="nodrag nopan"
        style={HANDLE_STYLE}
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        className="nodrag nopan"
        style={HANDLE_STYLE}
      />
      <Handle
        id="right"
        type="target"
        position={Position.Right}
        className="nodrag nopan"
        style={HANDLE_STYLE}
      />
      <Handle
        id="bottom"
        type="target"
        position={Position.Bottom}
        className="nodrag nopan"
        style={HANDLE_STYLE}
      />
    </div>
  )
}