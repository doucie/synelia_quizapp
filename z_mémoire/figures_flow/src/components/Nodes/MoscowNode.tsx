import type { EntityNodeData } from '../../types'

/**
 * Priorisation MoSCoW (figure du mémoire, Fig. 23) : pyramide des besoins du
 * MVP — verbatim de `figures_html/pyramide_moscow.html` (4 niveaux
 * MUST/SHOULD/COULD/WON'T, 18/12/8/5 besoins).
 *
 * Nœud composite unique, zéro arête React Flow : pyramide + cartes de niveaux
 * en flux, seule la largeur est posée (`exportWidth`), jamais `height`
 * (invariant n°1). Aucune `<Handle>`.
 *
 * La pyramide est un empilement de 4 `<div>` en `flex: 1` découpés par
 * `clip-path` en pourcentages : la hauteur des bandes suit l'étirement de la
 * colonne (racine en `items-stretch`) et le triangle a donc exactement la
 * hauteur de la colonne de cartes à sa droite, à l'écran comme à l'export
 * (le font-scale 4/3 n'influence que la hauteur des cartes, sans jamais
 * désaligner les deux blocs). Le sommet est en x=50 % / y=0.
 *
 * Palette documentaire : jetons `--fig-*` posés dans `moscow_pyramide.ts`
 * (danger/warning/secondary/neutral, comme fig. 8 ; axe en `--fig-frame`),
 * tint `tinted()` = `color-mix` (les jetons `var()` traversent `hsla`),
 * corps en `calc(var(--org-font-scale,1)*Npx)` inline, texte petit en
 * `foreground/85`. Les gradients du source deviennent des aplats unis ; le
 * texte des bandes se lit en `--fig-soft` (presque-blanc sur les teintes
 * saturées du thème clair, ardoise sur les teintes claires du thème sombre).
 * Le liseré `border-left` porte la sémantique, le fond de la carte WON'T
 * reste neutre en `hsl(var(--muted))`.
 */

const LEVEL_SIZE = 21
const COUNT_SIZE = 15
const CARD_LABEL_SIZE = 18
const TAG_SIZE = 15
const AXIS_SIZE = 15

const PYRAMID_W = 640
/** Gris contour de la palette documentaire (l'axe est une déco, jamais sémantique —
 * cf. `--fig-frame`, version sombre dans `index.css`). */
const AXIS = 'var(--fig-frame)'

/** Même convention que les autres figures d'impression : `--org-font-scale`
 * est déjà recopiée pendant l'export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

/**
 * Bande *i* (0 = sommet) du triangle : les 4 bandes sont égales en hauteur,
 * la demi-largeur croît linéairement de 0 % (apex, x = 50 %) à 50 % (base
 * pleine). En pourcentages, le clip suit toute hauteur de colonne.
 */
function bandClip(i: number): string {
  const topHalf = 12.5 * i
  const bottomHalf = 12.5 * (i + 1)
  const leftTop = 50 - topHalf
  const rightTop = 50 + topHalf
  const leftBottom = 50 - bottomHalf
  const rightBottom = 50 + bottomHalf
  return `polygon(${leftTop}% 0%, ${rightTop}% 0%, ${rightBottom}% 100%, ${leftBottom}% 100%)`
}

function cardTint(color: string, i: number): string | undefined {
  return i === 3 ? 'hsl(var(--muted))' : tinted(color, 7)
}

/** Teinte derrière contenu : `color-mix` accepte un jeton CSS var(...) en
 * couleur de base (résolu par computed styles, contrairement à `hsla`). */
function tinted(color: string, pct: number) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`
}

export default function MoscowNode({ data }: { data: EntityNodeData }) {
  const levels = data.moscowLevels ?? []
  return (
    <div data-export-root className="flex w-full" style={{ width: data.exportWidth, gap: 30 }}>
      {/* Axe de priorité : flèche en haut, trait, libellé vertical bas → haut. */}
      <div className="flex shrink-0 flex-col items-center" style={{ width: 28, padding: '2px 0' }}>
        <svg width={12} height={9} viewBox="0 0 12 9" style={{ display: 'block' }}>
          <polygon points="6,0 0,9 12,9" fill={AXIS} />
        </svg>
        <div className="flex-1" style={{ width: 1.8, backgroundColor: AXIS, margin: '3px 0' }} />
        <span
          className="font-semibold"
          style={{
            ...px(AXIS_SIZE),
            color: AXIS,
            letterSpacing: 2,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            margin: '4px 0',
          }}
        >
          PRIORITÉ
        </span>
      </div>

      {/* Pyramide : 4 aires égales en `flex: 1`, découpées en pourcentages. */}
      <div className="flex shrink-0 flex-col" style={{ width: PYRAMID_W }}>
        {levels.map((lv, i) => (
          <div
            key={lv.name}
            className="relative flex min-w-0 justify-center"
            style={{ flex: 1, clipPath: bandClip(i), backgroundColor: lv.color }}
          >
            {/* Libellé ancré sous le centre de la bande (verbatim : ~60/70 %
            de la bande) — la zone du triangle y est plus large, le texte ne
            sort jamais du polygone. */}
            <div
              className="absolute flex flex-col items-center"
              style={{ left: '50%', top: '58%', transform: 'translate(-50%, -35%)', gap: 1 }}
            >
              <span className="font-bold" style={{ ...px(LEVEL_SIZE), color: 'var(--fig-soft)' }}>
                {lv.name.split(' ')[0]}
              </span>
              <span style={{ ...px(COUNT_SIZE), color: 'var(--fig-soft)', opacity: 0.8 }}>{lv.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Cartes de niveaux : `border-left` coloré + fond teinté. */}
      <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 10 }}>
        {levels.map((lv, i) => {
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
                      color: lv.color,
                      backgroundColor: tinted(lv.color, 10),
                      border: `1px solid ${tinted(lv.color, 30)}`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
