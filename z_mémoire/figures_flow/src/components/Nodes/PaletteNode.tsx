import type { EntityNodeData, PaletteSwatch } from '../../types'

/**
 * Palette documentaire (figure du mémoire) : les jetons de couleur de
 * `template_memoire/typst/theme.typ` (`palette = (ink, muted, primary,
 * secondary, accent, accent_soft, line)`), du navy des titres aux filets,
 * puis une rangée de **propositions** de démonstration (échelle Chakra, celle
 * du thème) qui ne vivent pas encore dans `theme.typ`.
 *
 * Ici la couleur **est** la donnée : les hex sont chargés tels quels, cet
 * hex-là s'affiche — ce n'est pas un coloriage de style (la règle « pas de
 * couleurs en dur » protège le stylisme, pas le contenu).
 *
 * Nœud composite unique, zéro arête React Flow (précédent `LevelsNode`,
 * fig. 17) : les pastilles se rangent par `group` (ordre des données = source
 * de vérité), seule la largeur est posée (`exportWidth`), jamais `height`
 * (invariant n°1). Aucune `<Handle>`.
 *
 * Style Gouvernance (`OrgNode`) : cartes arrondies, filet `hsl(var(--input))`
 * (le token `--border` à L 95 % disparaît à l'impression, même correctif que
 * la Fig. 7), corps en `calc(var(--org-font-scale,1)*Npx)` inline, hex en
 * monospace (convention `TreeNode`), usage en `foreground/85`.
 */

const GROUP_SIZE = 15
const NAME_SIZE = 19
const USE_SIZE = 14
const HEX_SIZE = 17
const BAND_H = 84

/** Même convention que les autres figures d'impression : `--org-font-scale`
 * est déjà recopiée pendant l'export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

/** Monospace système, comme le nom de l'arbre du dépôt (`TreeNode`). */
const MONO = "ui-monospace, 'Cascadia Mono', Menlo, Consolas, monospace"

/** Découpe les pastilles en rangées : chaque changement de `group` ouvre une rangée. */
function toGroups(swatches: PaletteSwatch[]): { title?: string; items: PaletteSwatch[] }[] {
  const groups: { title?: string; items: PaletteSwatch[] }[] = []
  for (const s of swatches) {
    const last = groups[groups.length - 1]
    if (last && last.title === s.group) last.items.push(s)
    else groups.push({ title: s.group, items: [s] })
  }
  return groups
}

export default function PaletteNode({ data }: { data: EntityNodeData }) {
  const groups = toGroups(data.paletteSwatches ?? [])
  return (
    <div data-export-root className="flex w-full flex-col" style={{ width: data.exportWidth, gap: 20 }}>
      {groups.map((g, gi) => (
        <div key={g.title ?? gi} className="flex w-full flex-col" style={{ gap: 10 }}>
          {g.title && (
            <span
              className="font-bold uppercase text-foreground/85"
              style={{ ...px(GROUP_SIZE), letterSpacing: '0.06em' }}
            >
              {g.title}
            </span>
          )}
          <div className="flex w-full items-stretch" style={{ gap: 16 }}>
            {g.items.map((s) => (
              <div
                key={s.name}
                className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-solid bg-background"
                style={{ borderColor: 'hsl(var(--input))' }}
              >
                {/* Bande pleine : le hex repose dessus, blanc sauf jeton clair. */}
                <div className="flex items-center justify-center" style={{ height: BAND_H, backgroundColor: s.hex }}>
                  <span
                    className="font-bold"
                    style={{ ...px(HEX_SIZE), fontFamily: MONO, color: s.inkOnSwatch ? '#1a202c' : '#ffffff' }}
                  >
                    {s.hex}
                  </span>
                </div>
                <div className="flex flex-col" style={{ padding: '12px 14px', gap: 5 }}>
                  <span className="font-bold text-foreground" style={px(NAME_SIZE)}>
                    {s.name}
                  </span>
                  <span className="leading-snug text-foreground/85" style={px(USE_SIZE)}>
                    {s.use}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
