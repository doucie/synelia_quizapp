import type { EntityNodeData } from '../../types'
import { hsla } from '../../utils/color'

/**
 * Priorisation MoSCoW (figure du mémoire, Fig. 23) : pyramide des besoins du
 * MVP — verbatim de `figures_html/pyramide_moscow.html` (4 niveaux
 * MUST/SHOULD/COULD/WON'T, 18/12/8/5 besoins).
 *
 * Nœud composite unique, zéro arête React Flow (précédent `LevelsNode`,
 * fig. 17) : pyramide SVG + cartes de niveaux en flux, seule la largeur est
 * posée (`exportWidth`), jamais `height` (invariant n°1). Aucune `<Handle>`.
 *
 * Style Gouvernance (`OrgNode`) : cartes `border-left 5px` + tint `hsla 0.07`,
 * corps en `calc(var(--org-font-scale,1)*Npx)` inline, texte petit en
 * `foreground/85`. Les gradients du source deviennent des aplats unis, les
 * teintes restent sémantiques (rouge/orange/bleu/gris) : rouge 0, orange 30,
 * bleu 200 conservés, gris hors accent traité en `var(--muted)` (le liseré
 * `border-left` porte la sémantique, le fond reste neutre).
 */

const LEVEL_SIZE = 21
const COUNT_SIZE = 15
const CARD_LABEL_SIZE = 18
const CARD_SUB_SIZE = 15
const TAG_SIZE = 15
const NOTE_SIZE = 14
const AXIS_SIZE = 15

const SVG_W = 420
const SVG_H = 440
const PYRAMID_W = 420
const AXIS = 'hsl(215, 16%, 65%)'

/** Points des 4 aires, du sommet vers la base (source `pyramide_moscow.html`). */
const POLYGONS: string[] = [
  '210,20 259,105 161,105',
  '161,105 259,105 308,190 112,190',
  '112,190 308,190 357,275 63,275',
  '63,275 357,275 405,360 15,360',
]
/** Ordre haut→bas : nom court, y du nom, y de l'effectif. */
const LABELS: { short: string; yName: number; yCount: number }[] = [
  { short: 'MUST', yName: 70, yCount: 88 },
  { short: 'SHOULD', yName: 153, yCount: 170 },
  { short: 'COULD', yName: 240, yCount: 257 },
  { short: "WON'T", yName: 325, yCount: 342 },
]

/** Même convention que les autres figures d'impression : `--org-font-scale`
 * est déjà recopiée pendant l'export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

function cardTint(color: string, i: number): string | undefined {
  return i === LABELS.length - 1 ? 'hsl(var(--muted))' : hsla(color, 0.07)
}

export default function MoscowNode({ data }: { data: EntityNodeData }) {
  const levels = data.moscowLevels ?? []
  return (
    <div data-export-root className="flex w-full items-start" style={{ width: data.exportWidth, gap: 30 }}>
      {/* Pyramide : 4 aires en aplats, axe de priorité à gauche. */}
      <svg
        width={PYRAMID_W}
        height={(SVG_H / SVG_W) * PYRAMID_W}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="shrink-0"
        style={{ display: 'block' }}
      >
        {POLYGONS.map((points, i) => (
          <polygon key={points} points={points} fill={levels[i]?.color ?? AXIS} />
        ))}
        {LABELS.map((l, i) => (
          <g key={l.short}>
            <text
              x={210}
              y={l.yName}
              textAnchor="middle"
              fill="#fff"
              fontWeight={800}
              style={px(LEVEL_SIZE)}
            >
              {l.short}
            </text>
            <text x={210} y={l.yCount} textAnchor="middle" fill="rgba(255,255,255,0.8)" style={px(COUNT_SIZE)}>
              {levels[i]?.count ?? ''}
            </text>
          </g>
        ))}
        <line x1={14} y1={360} x2={14} y2={30} stroke={AXIS} strokeWidth={1.8} />
        <polygon points="14,24 10,34 18,34" fill={AXIS} />
        <text
          x={12}
          y={195}
          textAnchor="middle"
          fill={AXIS}
          fontWeight={600}
          transform="rotate(-90 12 195)"
          style={px(AXIS_SIZE)}
        >
          PRIORITÉ
        </text>
      </svg>

      {/* Cartes de niveaux : `border-left` coloré + fond teinté. */}
      <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 10 }}>
        {levels.map((lv, i) => {
          const last = i === LABELS.length - 1
          return (
            <div
              key={lv.name}
              className="w-full rounded-lg border border-solid bg-background"
              style={{
                padding: '12px 16px',
                borderColor: 'hsl(var(--border))',
                borderLeftWidth: 5,
                borderLeftColor: lv.color,
                backgroundColor: cardTint(lv.color, i),
              }}
            >
              <div className="flex flex-col" style={{ marginBottom: 7 }}>
                <span className="font-bold text-foreground" style={px(CARD_LABEL_SIZE)}>
                  {lv.name} — {lv.count}
                </span>
                <span className="text-foreground/85" style={px(CARD_SUB_SIZE)}>
                  {lv.sub}
                </span>
              </div>
              <div className="flex flex-wrap" style={{ gap: 6 }}>
                {lv.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-semibold whitespace-nowrap"
                    style={{
                      ...px(TAG_SIZE),
                      padding: '4px 11px',
                      borderRadius: 12,
                      color: last ? 'hsl(var(--muted-foreground))' : lv.color,
                      backgroundColor: last ? 'hsl(var(--background))' : hsla(lv.color, 0.14),
                      border: `1px solid ${last ? 'hsl(var(--border))' : hsla(lv.color, 0.3)}`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {lv.note && (
                <span className="block text-foreground/85 italic" style={{ ...px(NOTE_SIZE), marginTop: 6 }}>
                  {lv.note}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
