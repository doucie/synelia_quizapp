import type { EntityNodeData, RgCard } from '../../types'
import { hsla } from '../../utils/color'
import { FeatherIcon } from './icons'

/**
 * Kanban des règles de gestion (figure du mémoire, 3.6) : 4 colonnes
 * familiales (bandeau teinté + cartes), chaque carte reliant sa règle à sa
 * conséquence par une flèche — une relation cause→conséquence, pas une liste.
 *
 * Composant générique : le modèle fournit les colonnes (`rgCols` : titre,
 * icône, teinte, cartes). La flèche RÈGLE→EFFET est l’élément essentiel de la
 * figure (sans elle, simple tableau redécoupé) : SVG inline intra-carte
 * (trait + chevron, comme les icônes Feather), pas une arête React Flow —
 * aucune `<Handle>`.
 *
 * Cartes teintées `0.06` + bordure teinte `0.30` : une carte blanche serait
 * invisible sans contour, et `border` (95 %) est invisible à l’impression —
 * même langage que les étapes fig. 8. Kanban : hauteurs libres, plancher
 * commun, tops alignés.
 */

const COL_W = 380
const COL_GAP = 40
// Échelle ×11/8 (retour demandeur) : à 1720 px de canevas, les corps
// sortaient à ~5-6 pt imprimés, illisibles. Tout grossit uniformément —
// hiérarchie inchangée, corps à ~7,5-10,5 pt.
const BAND_TITLE_SIZE = 30
const BADGE_SIZE = 20
const CARD_NAME_SIZE = 24
const MICRO_SIZE = 18
const RULE_SIZE = 22
const EFFECT_SIZE = 20
const MEDALLION = 60
const ICON = 30

/** Même convention que les autres figures d’impression : `--org-font-scale`
 * est déjà recopiée pendant l’export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

function Arrow() {
  // Flèche VERTICALE (amendement au brief) : à 22 px, les deux zones
  // côte à côte tombaient à ~10 caractères/ligne (escalier mot-à-mot).
  // RÈGLE en haut, ↓, EFFET en bas : pleine largeur (~25 car./ligne),
  // relation cause→conséquence intacte, juste pivotée.
  return (
    <svg
      width={32}
      height={44}
      viewBox="0 0 32 44"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="entraîne"
      className="text-muted-foreground"
      style={{ flexShrink: 0, alignSelf: 'center' }}
    >
      <line x1="16" y1="3" x2="16" y2="32" />
      <polyline points="8,25 16,33 24,25" />
    </svg>
  )
}

function RgCardView({ card, color }: { card: RgCard; color: string }) {
  // Pas de `data-export-root` ici : la racine d’export est la rangée des
  // colonnes (une racine par nœud, contrat §8).
  return (
    <div
      className="flex w-full flex-col rounded-xl border border-solid"
      style={{
        padding: '20px',
        gap: 12,
        width: '100%',
        borderColor: hsla(color, 0.3),
        backgroundColor: hsla(color, 0.06),
      }}
    >
      <div className="flex items-baseline" style={{ gap: 10 }}>
        <span className="font-bold tracking-wide" style={{ ...px(BADGE_SIZE), color }}>
          {card.id}
        </span>
        <span className="font-bold text-foreground" style={px(CARD_NAME_SIZE)}>
          {card.name}
        </span>
      </div>
      <div className="flex flex-col" style={{ gap: 10 }}>
        <div className="flex min-w-0 flex-col" style={{ gap: 4 }}>
          <span className="font-bold tracking-wide text-muted-foreground uppercase" style={px(MICRO_SIZE)}>
            Règle
          </span>
          <span className="leading-snug text-foreground" style={px(RULE_SIZE)}>
            {card.rule}
          </span>
        </div>
        <Arrow />
        <div className="flex min-w-0 flex-col" style={{ gap: 4 }}>
          <span className="font-bold tracking-wide text-muted-foreground uppercase" style={px(MICRO_SIZE)}>
            Effet système
          </span>
          <span className="leading-snug text-foreground/85 italic" style={px(EFFECT_SIZE)}>
            {card.effect}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function RgNode({ data }: { data: EntityNodeData }) {
  const cols = data.rgCols ?? []
  return (
    <div data-export-root className="flex w-full" style={{ width: data.exportWidth, gap: COL_GAP }}>
      {cols.map((col) => (
        <div key={col.title} className="flex flex-col" style={{ width: COL_W, gap: 24 }}>
          <div
            className="flex w-full items-center rounded-xl"
            style={{ padding: '16px 20px', gap: 16, backgroundColor: hsla(col.color, 0.14) }}
          >
            <span
              className="inline-flex items-center justify-center rounded-full"
              style={{
                width: MEDALLION,
                height: MEDALLION,
                flexShrink: 0,
                backgroundColor: 'hsl(var(--background))',
                color: col.color,
              }}
            >
              <FeatherIcon kind={col.icon} size={ICON} />
            </span>
            <span className="font-bold" style={{ ...px(BAND_TITLE_SIZE), color: col.color }}>
              {col.title}
            </span>
          </div>
          {col.cards.map((card) => (
            <RgCardView key={card.id} card={card} color={col.color} />
          ))}
        </div>
      ))}
    </div>
  )
}
