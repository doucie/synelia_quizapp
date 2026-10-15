import { useMemo } from 'react'
import type { EntityNodeData } from '../../types'
import { recolorClaudeSvg } from '../../utils/umlRecolor'

/**
 * Figure dessinée par Claude (collab : Claude dessine, le projet intègre).
 *
 * Le SVG livré (`data.claudeSvg`, import `?raw`) est rendu TEL QUEL après
 * `recolorClaudeSvg` : palette remappée, fonte du mémoire, manifeste C2PA
 * purgé. Aucun réagencement ici — voir `umlRecolor.ts` pour le contrat.
 *
 * Nœud composite unique, zéro arête React Flow : la racine `[data-export-root]`
 * porte la largeur (`exportWidth`), la hauteur suit le `viewBox` (jamais de
 * `height` posée, invariant n°1). Couleur source non mappée → pastille rouge
 * HORS racine (jamais dans l’export) + `console.error`.
 */

export default function ClaudeSvgNode({ data }: { data: EntityNodeData }) {
  const { svg, unmapped } = useMemo(
    () => recolorClaudeSvg(data.claudeSvg ?? '', data.claudeColors ?? {}),
    [data.claudeSvg, data.claudeColors],
  )

  if (unmapped.length > 0) {
    console.error(`[ClaudeSvgNode] couleurs non mappées (${data.label}) :`, unmapped)
  }

  return (
    <div className="relative w-full" style={{ width: data.exportWidth }}>
      <div data-export-root className="w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      {unmapped.length > 0 && (
        // Rouge en dur assumé (debug seul, hors export — précédent l’overlay
        // `#e11d48` de `TraitementEdge`) : une couleur non mappée doit sauter
        // aux yeux à l’écran et rester invisible sur le papier.
        <div
          className="absolute rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white"
          style={{ left: 8, top: 8 }}
          title={`Couleurs non mappées : ${unmapped.join(', ')}`}
        >
          {unmapped.length} couleur(s) ?
        </div>
      )}
    </div>
  )
}
