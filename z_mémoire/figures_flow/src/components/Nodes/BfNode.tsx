import type { EntityNodeData } from '../../types'
import { hsla } from '../../utils/color'
import { FeatherIcon } from './icons'

/**
 * Grille des besoins fonctionnels (figure du mémoire, 3.2.8) : 8 cartes
 * strictement identiques en 4×2 — seule la teinte de fond code les 3 familles
 * (socle / parcours / transverse). Ni bandeau, ni titre de section, ni
 * bordure : la grille reste d’un seul tenant.
 *
 * Composant monolithe : les 8 cartes partagent tout (médaillon, badge, nom,
 * phrase) et le même `minHeight` — seuls `bfId`, `bfIcon` et `bfColor`
 * changent. Le socle (`bfColor` absent) tombe sur `muted`, les deux autres
 * familles sur leur teinte (`210` parcours, `30` transverse).
 *
 * Aucune `<Handle>` : la figure ne contient aucune arête (précédent fig. 6).
 */

const BADGE_SIZE = 16
const NAME_SIZE = 22
const PHRASE_SIZE = 18
const MEDALLION = 48
const ICON = 24

/** Même convention que les autres figures d’impression : `--org-font-scale`
 * est déjà recopiée pendant l’export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

export default function BfNode({ data }: { data: EntityNodeData }) {
  const accent = data.bfColor ?? 'hsl(var(--muted-foreground))'
  return (
    <div
      data-export-root
      className="flex w-full flex-col rounded-xl"
      style={{
        padding: '24px',
        gap: 16,
        width: data.exportWidth,
        minHeight: data.minHeight,
        backgroundColor: data.bfColor ? hsla(data.bfColor, 0.07) : 'hsl(var(--muted))',
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center justify-center rounded-full"
          style={{
            width: MEDALLION,
            height: MEDALLION,
            flexShrink: 0,
            backgroundColor: 'hsl(var(--background))',
            color: accent,
          }}
        >
          {data.bfIcon && <FeatherIcon kind={data.bfIcon} size={ICON} />}
        </span>
        <span className="font-bold tracking-wide" style={{ ...px(BADGE_SIZE), color: accent }}>
          {data.bfId}
        </span>
      </div>
      <span className="leading-snug font-bold text-foreground" style={px(NAME_SIZE)}>
        {data.label}
      </span>
      {data.bfDesc && (
        <span className="leading-snug text-foreground/85" style={px(PHRASE_SIZE)}>
          {data.bfDesc}
        </span>
      )}
    </div>
  )
}
