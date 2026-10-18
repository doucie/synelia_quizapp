import type { EntityNodeData } from '../../types'

/**
 * Figure 4 — Pyramide des objectifs du projet (§1.4.1) : verbatim de
 * `figures_html/pyramide_objectifs.html`. Décision utilisateur : bandes
 * empilées fidèles au source (PAS un clip-path triangle — apex étriqué,
 * leçon fig. 23). La largeur décroît du socle (100 %) au sommet (64 %), le
 * connecteur entre niveaux devient un trait court `--fig-frame` ; la légende
 * du source est supprimée (redondante des bandes), le footer abandonné.
 *
 * Nœud composite unique, zéro arête React Flow, aucune `<Handle>` ; corps en
 * `calc(var(--org-font-scale,1)*Npx)` inline (invariant n°2). Jetons : socle
 * `--fig-secondary` (Digitaliser), `--fig-warning` (Automatiser),
 * `--fig-success` (Collaborer), sommet `--fig-navy` (Piloter). Pastilles =
 * motif fig. 23 (tint `color-mix`, bordure 30 %).
 */

/** Jeton du niveau *i* (sommet → socle). */
function levelToken(i: number) {
  return `var(--fig-${i === 0 ? 'navy' : i === 1 ? 'success' : i === 2 ? 'warning' : 'secondary'})`
}

const NUM_SIZE = 13
const TITLE_SIZE = 16
const ITEM_SIZE = 11

/** Largeur relative des bandes, sommet → socle (déduite du source
 * 58/72/86/100 %). */
const WIDTHS = [64, 76, 88, 100]

function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

function tinted(color: string, pct: number) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`
}

export default function ObjectifsPyramidNode({ data }: { data: EntityNodeData }) {
  const levels = data.objPyrLevels ?? []
  return (
    <div data-export-root className="flex w-full flex-col items-center" style={{ width: data.exportWidth }}>
      {levels.map((lv, i) => (
        <div key={lv.num} className="flex w-full flex-col items-center">
          {i > 0 && <div style={{ width: 1.6, height: 22, backgroundColor: 'var(--fig-frame)', margin: '4px 0' }} />}
          <div
            className="flex items-center"
            style={{
              width: `${WIDTHS[i]}%`,
              gap: 12,
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--background))',
            }}
          >
            <span
              className="flex font-bold"
              style={{
                ...px(NUM_SIZE),
                flexShrink: 0,
                width: 30,
                height: 30,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                color: levelToken(i),
                backgroundColor: tinted(levelToken(i), 12),
              }}
            >
              {lv.num}
            </span>
            <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 5 }}>
              <span className="font-bold text-foreground" style={px(TITLE_SIZE)}>
                {lv.title}
              </span>
              <div className="flex flex-wrap" style={{ gap: 5 }}>
                {lv.items.map((item) => (
                  <span
                    key={item}
                    className="font-semibold whitespace-nowrap text-foreground"
                    style={{
                      ...px(ITEM_SIZE),
                      padding: '3px 10px',
                      borderRadius: 12,
                      backgroundColor: tinted(levelToken(i), 10),
                      border: `1px solid ${tinted(levelToken(i), 30)}`,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
