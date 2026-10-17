import type { EntityNodeData, BenchmarkValue } from '../../types'

/**
 * Matrice de benchmark (figure du mémoire, Fig. 7) : comparaison des solutions
 * du marché et positionnement de SyneliaQuizApp — verbatim de
 * `figures_html/matrice_benchmark.html` (6 catégories, 14 fonctionnalités).
 *
 * Style « Encre » (éditorial) : une seule carte `rounded-xl` + filet
 * `--input`, `overflow-hidden` (plus de rangée de pied bricolée). En-tête navy
 * plein, bandeaux de section fins `#f7fafc` en small caps, cellules sans
 * pastille (mot coloré centré), filets **horizontaux seulement** — plus aucun
 * vertical sauf le séparateur avant Synelia, dont la colonne reste teintée
 * success 0,06. Nœud composite unique, zéro arête React Flow, aucune `<Handle>`.
 *
 * Corps en `calc(var(--org-font-scale,1)*Npx)` inline ; seule la largeur est
 * posée (`exportWidth`), jamais `height` (invariant n°1). Teintes : success /
 * warning / gris neutre pour Oui / `~` / Non (jetons de la Fig. 22, Chakra
 * `green.600` / `orange.600` / `gray.600`), coûts en monospace navy.
 *
 * Filets en **couleurs réelles** (pas `var(--input)`, L 91,4 % — invisible sur
 * blanc, cf. `#e2e8f0` d'origine) : `#cbd5e0` (jeton `line` de la Fig. 22) pour
 * les filets internes, `#a0aec0` (Chakra gray.400) pour le contour de carte et
 * le soulignement 2 px de l'en-tête.
 *
 * Chaque jeton porte une version sombre (`--fig-*`, `index.css`) : mêmes rôles,
 * nuances claires de la même échelle Chakra — sauf `--fig-navy` ( la bande
 * d'en-tête reste navy dans les deux thèmes, texte blanc partout).
 */

const HEADER_SIZE = 16
const BAND_SIZE = 14
const FEATURE_SIZE = 18
const VALUE_SIZE = 18
const NOTE_SIZE = 15

/** Jetons figures (valeurs claires documentées dans `index.css`). */
const NAVY = 'var(--fig-navy)'
const COST = 'var(--fig-cost)'
const GREEN = 'var(--fig-success)'
const AMBER = 'var(--fig-warning)'
const NEUTRAL = 'var(--fig-neutral)'
const SOFT = 'var(--fig-soft)'
const LINE = 'var(--fig-line)'
const FRAME = 'var(--fig-frame)'
const TINT = 'var(--fig-tint)'
const COLS = '1.9fr 1fr 1fr 1fr 1.35fr'

/** Monospace système, comme le nom de l'arbre du dépôt (`TreeNode`). */
const MONO = "ui-monospace, 'Cascadia Mono', Menlo, Consolas, monospace"

/** Même convention que les autres figures d'impression : `--org-font-scale`
 * est déjà recopiée pendant l'export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

function valueColor(tone: BenchmarkValue['tone']): string {
  if (tone === 'yes') return GREEN
  if (tone === 'partial') return AMBER
  if (tone === 'no') return NEUTRAL
  return COST
}

export default function BenchmarkNode({ data }: { data: EntityNodeData }) {
  const cols = data.benchmarkCols ?? []
  const sections = data.benchmarkSections ?? []
  const lastSection = sections.length - 1
  const BORDER = `1px solid ${LINE}`
  return (
    <div
      data-export-root
      className="flex w-full flex-col overflow-hidden rounded-xl border border-solid bg-background"
      style={{ width: data.exportWidth, borderColor: FRAME }}
    >
      {/* En-tête navy plein : Synelia détachée par un filet translucide. */}
      <div
        className="grid w-full"
        style={{ gridTemplateColumns: COLS, backgroundColor: NAVY, borderBottom: `2px solid ${FRAME}` }}
      >
        {cols.map((c, i) => {
          const last = i === cols.length - 1
          return (
            <span
              key={c}
              className="text-center font-bold uppercase"
              style={{
                ...px(HEADER_SIZE),
                padding: '14px 16px',
                letterSpacing: '0.05em',
                color: '#ffffff',
                borderLeft: last ? '1px solid rgba(255, 255, 255, 0.28)' : undefined,
              }}
            >
              {c}
            </span>
          )
        })}
      </div>

      {sections.map((sec, si) => (
        <div key={sec.title} className="flex w-full flex-col">
          {/* Bandeau de section : bande fine accent_soft, small caps muted, filet bas. */}
          <div className="w-full" style={{ backgroundColor: SOFT, padding: '8px 16px', borderBottom: BORDER }}>
            <span
              className="font-bold uppercase"
              style={{ ...px(BAND_SIZE), letterSpacing: '0.08em', color: NEUTRAL }}
            >
              {sec.title}
            </span>
          </div>
          {sec.rows.map((row, ri) => {
            const lastRow = si === lastSection && ri === sec.rows.length - 1
            return (
              <div
                key={row.feature}
                className="grid w-full items-center"
                style={{
                  gridTemplateColumns: COLS,
                  borderBottom: lastRow ? 'none' : BORDER,
                }}
              >
                <span className="text-foreground" style={{ ...px(FEATURE_SIZE), padding: '10px 16px' }}>
                  {row.feature}
                </span>
                {row.values.map((v, vi) => {
                  const last = vi === row.values.length - 1
                  return (
                    <span
                      key={vi}
                      className="flex flex-col items-center justify-center text-center"
                      style={{
                        padding: '10px 12px',
                        borderLeft: last ? BORDER : undefined,
                        backgroundColor: last ? TINT : undefined,
                      }}
                    >
                      <span
                        className="font-semibold"
                        style={{
                          ...px(VALUE_SIZE),
                          color: valueColor(v.tone),
                          fontFamily: v.tone === 'cost' ? MONO : undefined,
                        }}
                      >
                        {v.text}
                      </span>
                      {v.note && (
                        <span className="text-foreground/85 italic" style={{ ...px(NOTE_SIZE), marginTop: 2 }}>
                          {v.note}
                        </span>
                      )}
                    </span>
                  )
                })}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
