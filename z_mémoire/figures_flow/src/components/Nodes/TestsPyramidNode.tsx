import type { EntityNodeData } from '../../types'
import { accentInk } from '../../utils/figInk'

/**
 * Pyramide des tests (§7.1) : verbatim de `figures_html/pyramide_tests.html` —
 * 3 niveaux (E2E / Intégration / Unitaires, ~15/45/120 specs, ordres de grandeur
 * assumés) et leurs callouts d'outillage. Remplace la fig. 63 « niveaux-tests »
 * (bandes égales, `niveaux_tests.ts` reste au catalogue).
 *
 * Nœud composite unique, zéro arête React Flow (précédent `LevelsNode` /
 * `MoscowNode`) : 3 bandes découpées par `clip-path` en pourcentages. Contraire-
 * ment à fig. 23 (bandes égales), les ratios **147/110/150** sont ceux du
 * source (y 28→175→285→435) ; `tpyramidClip` généralise par fractions
 * cumulées. La racine est en `items-stretch` : le triangle a exactement la
 * hauteur de la colonne de callouts, à l'écran comme à l'export (l'apex est
 * en x=50 % / y=0, marge haute et pied mort du SVG source jetés).
 *
 * Palette documentaire (jetons `--fig-*`) : danger (E2E) / warning (Intégra-
 * tion) / success (Unitaires), texte de bande = `--fig-on-fill` (blanc quasi-pur,
 * constant dans les deux modes — les bandes sont des fond de couleur gelés, cf.
 * addenda 20261020 de `20261017_dark_tokens_figures.md`) + effectif 80 %
 * (même motif qu'`MoscowNode`). Axe CRITICITÉ en `--fig-frame`, pointant vers
 * le haut : la criticité (coût, lenteur) croît vers le sommet — le marqueur du
 * HTML source descendait, divergence corrigée. Conformément au source, les
 * liaisons pointillées rejoignent chaque callout depuis le flanc du triangle
 * (dot sur la pente, pointé sur le centre de bande — callouts aux mêmes
 * ratios, l'alignement suit l'étirement), et les annotations « Coût ↑ » /
 * « Volume ↑ » accompagnent l'axe (encres `accentInk()`, lisibles sur le fond
 * de page sombre). Le panneau légende
 * (~180 specs, JaCoCo, CI/CD) du source est retiré : redondant ou non sourcé
 * (le texte §7.1 porte le sourcing réel du dépôt).
 *
 * Callouts : cartes Gouvernance (`border-left 5px` coloré + tint
 * `tinted()` = `color-mix`, le jeton `var()` ne traverse pas `hsla`), corps en
 * `calc(var(--org-font-scale,1)*Npx)` inline, lignes en `foreground/85`,
 * caractéristiques en pied italiques. `Items-stretch` assure l'égalité.
 */

const BAND_NAME_SIZE = 18
const BAND_COUNT_SIZE = 14
const CALLOUT_TITLE_SIZE = 16
const CALLOUT_SIZE = 13.5
const CALLOUT_TAIL_SIZE = 12.5
const AXIS_SIZE = 15
const ANN_SIZE = 11

const GAP = 30
const AXIS_W = 76
const PYRAMID_W = 520
/** Bord gauche de la colonne de callouts (axe + 2 gaps + pyramide) ; les
 * liaisons arrivent à ce bord, une par niveau. */
const CALLOUT_LEFT = AXIS_W + 2 * GAP + PYRAMID_W
/** Hauteurs du source (pyramide_tests.html) : y 28→175→285→435 (sommets). */
const BAND_WEIGHTS = [147, 110, 150]
/** Fractions cumulées (0 → 1) ; bord des bandes traitées par `bandClip`. */
const BAND_FRACS = BAND_WEIGHTS.map((_, i) => BAND_WEIGHTS.slice(0, i + 1).reduce((a, b) => a + b, 0) / BAND_WEIGHTS.reduce((a, b) => a + b, 0))

/** Centre vertical de la bande i, en fractions de la colonne (les callouts
 * partagent les mêmes ratios : une liaison peut viser leur centre). */
function bandCenter(i: number) {
  const top = BAND_FRACS[i - 1] ?? 0
  return (top + BAND_FRACS[i]) / 2
}

function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

/** Bande i : demi-largeur croît linéairement de 0 % (apex) à 50 % (base)… par
 * fraction cumulée de hauteur — les ratios 147/110/150 du torso décalent le
 * bord des bandes. En pourcentages, le clip suit toute hauteur de colonne. */
function bandClip(i: number): string {
  const topFrac = BAND_FRACS[i - 1] ?? 0
  const bottomFrac = BAND_FRACS[i]
  const leftTop = 50 - 50 * topFrac
  const rightTop = 50 + 50 * topFrac
  const leftBottom = 50 - 50 * bottomFrac
  const rightBottom = 50 + 50 * bottomFrac
  return `polygon(${leftTop}% 0%, ${rightTop}% 0%, ${rightBottom}% 100%, ${leftBottom}% 100%)`
}

/** Teinte derrière contenu : `color-mix` accepte un jeton CSS var(...) en
 * couleur de base (résolu par computed styles, contrairement à `hsla`). */
function tinted(color: string, pct: number) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`
}

export default function TestsPyramidNode({ data }: { data: EntityNodeData }) {
  const levels = data.tpyramidLevels ?? []
  return (
    <div data-export-root className="relative flex w-full" style={{ width: data.exportWidth, gap: GAP }}>
      {/* Liaisons : pointillé du flanc du triangle au callout, posées sur le
      centre de chaque bande (les callouts partagent les ratios des bandes :
      un seul `top` en % suffit, l'étirement l'aligne). Remises au navigateur
      par niveau — les couleurs du source sont celles des jetons. */}
      {levels.map((lv, i) => {
        const depth = bandCenter(i)
        const start = AXIS_W + GAP + PYRAMID_W * (0.5 + 0.5 * depth)
        return (
          <div
            key={`link-${lv.name}`}
            className="absolute"
            style={{
              top: `${bandCenter(i) * 100}%`,
              left: start,
              width: CALLOUT_LEFT - start,
              borderTop: `1px dashed ${lv.color}`,
            }}
          >
            <span
              className="absolute rounded-full"
              style={{ left: -2, top: -3, width: 5, height: 5, backgroundColor: lv.color }}
            />
          </div>
        )
      })}

      {/* Axe de criticité : flèche en haut (le coût croît vers le sommet),
      trait, libellé vertical bas → haut, annotations « Coût / Volume » du
      source à droite du trait. */}
      <div className="flex shrink-0" style={{ width: AXIS_W, padding: '2px 0' }}>
        <div className="flex flex-col items-center" style={{ width: 28 }}>
          <svg width={12} height={9} viewBox="0 0 12 9" style={{ display: 'block' }}>
            <polygon points="6,0 0,9 12,9" fill="var(--fig-frame)" />
          </svg>
          {/* Trait découpé en deux segments égaux : le libellé tombe au
          centre vertical de la colonne, sans jamais toucher la flèche. */}
          <div className="flex-1" style={{ width: 1.8, backgroundColor: 'var(--fig-frame)', margin: '3px 0' }} />
          <span
            className="font-semibold"
            style={{
              ...px(AXIS_SIZE),
              color: 'var(--fig-frame)',
              letterSpacing: 2,
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              margin: '4px 0',
            }}
          >
            CRITICITÉ
          </span>
          <div className="flex-1" style={{ width: 1.8, backgroundColor: 'var(--fig-frame)', margin: '3px 0' }} />
        </div>
        <div className="flex flex-1 flex-col items-start justify-between" style={{ padding: '36px 0 48px' }}>
          <span className="font-semibold" style={{ ...px(ANN_SIZE), color: accentInk('var(--fig-danger)') }}>
            Coût ↑
          </span>
          <span className="font-semibold" style={{ ...px(ANN_SIZE), color: accentInk('var(--fig-success)') }}>
            Volume ↑
          </span>
        </div>
      </div>

      {/* Pyramide : 3 aires en ratios du source, découpées en pourcentages. */}
      <div className="flex shrink-0 flex-col" style={{ width: PYRAMID_W }}>
        {levels.map((lv, i) => (
          <div
            key={lv.name}
            className="relative flex min-w-0 justify-center"
            style={{ flex: BAND_WEIGHTS[i], clipPath: bandClip(i), backgroundColor: lv.color }}
          >
            {/* Libellé ancré sous le centre de la bande — la largeur
            disponible y est plus grande (motif `MoscowNode`). */}
            <div
              className="absolute flex flex-col items-center"
              style={{ left: '50%', top: '56%', transform: 'translate(-50%, -32%)', gap: 1 }}
            >
              <span className="font-bold" style={{ ...px(BAND_NAME_SIZE), color: 'var(--fig-on-fill)' }}>
                {lv.name}
              </span>
              <span style={{ ...px(BAND_COUNT_SIZE), color: 'var(--fig-on-fill)', opacity: 0.8 }}>{lv.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Callouts : `border-left` coloré + fond teinté, un par niveau. */}
      <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 10 }}>
        {levels.map((lv, i) => (
          <div
            key={lv.callout.title}
            className="w-full rounded-lg border border-solid bg-background"
            style={{
              flex: BAND_WEIGHTS[i],
              padding: '12px 16px',
              borderColor: 'hsl(var(--border))',
              borderLeftWidth: 5,
              borderLeftColor: lv.color,
              backgroundColor: tinted(lv.color, 7),
            }}
          >
            <div className="flex flex-col" style={{ marginBottom: 7 }}>
              <span className="font-bold text-foreground" style={px(CALLOUT_TITLE_SIZE)}>
                {lv.callout.title}
              </span>
              {lv.callout.lines.map((line) => (
                <span key={line} className="text-foreground/85" style={px(CALLOUT_SIZE)}>
                  {line}
                </span>
              ))}
            </div>
            <span className="text-foreground/85 italic" style={px(CALLOUT_TAIL_SIZE)}>
              {lv.callout.tail}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
