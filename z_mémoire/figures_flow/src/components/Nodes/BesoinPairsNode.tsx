import { Fragment } from 'react'
import type { EntityNodeData } from '../../types'

/**
 * Figure 3 — Du besoin à la solution (§1.3.3) : verbatim de
 * `figures_html/du_besoin_a_la_solution.html`, refondu en **3 paires
 * verticales problème → réponse** ((1→4), (2→5), (3→6), lecture du source),
 * une flèche horizontale par paire — la colonne centrale « VERS » du source
 * est abandonnée, idem le footer.
 *
 * Nœud composite unique, zéro arête React Flow, aucune `<Handle>` ; corps en
 * `calc(var(--org-font-scale,1)*Npx)` inline (invariant n°2). Jetons côté
 * gauche danger/warning/neutral, côté droit success/secondary/navy, pastilles
 * de numéro à fond plein, lignes à tirets (`foreground/85`) — la puce `›` du
 * source n'est pas reprise. Le nombre de migrations Flyway du source (69)
 * est omis : le dépôt en compte 84 et le texte dit « plus de cent ».
 */

const NUM_SIZE = 14
const TITLE_SIZE = 15
const LINE_SIZE = 11.5
const ARROW_W = 56

/** Jetons par rangée (gauche, droite) : la sémantique tranche, jamais la
 * déco — mêmes conventions que figs 8/14. */
const TOKENS: [string, string][] = [
  ['var(--fig-danger)', 'var(--fig-success)'],
  ['var(--fig-warning)', 'var(--fig-secondary)'],
  ['var(--fig-neutral)', 'var(--fig-navy)'],
]

function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

function tinted(color: string, pct: number) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`
}

function Side({
  num,
  title,
  lines,
  color,
}: {
  num: number
  title: string
  lines: string[]
  color: string
}) {
  return (
    <div
      className="flex w-full min-w-0 rounded-lg border border-solid bg-background"
      style={{
        padding: '10px 14px',
        gap: 10,
        alignItems: 'flex-start',
        borderColor: 'hsl(var(--border))',
        borderLeftWidth: 5,
        borderLeftColor: color,
        backgroundColor: tinted(color, 6),
      }}
    >
      <span
        className="flex font-bold"
        style={{
          ...px(NUM_SIZE),
          flexShrink: 0,
          width: 26,
          height: 26,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          color: 'var(--fig-soft)',
          backgroundColor: color,
        }}
      >
        {num}
      </span>
      <div className="flex min-w-0 flex-col" style={{ gap: 3 }}>
        <span className="font-bold text-foreground" style={px(TITLE_SIZE)}>
          {title}
        </span>
        {lines.map((line) => (
          <span key={line} className="text-foreground/85" style={{ ...px(LINE_SIZE), lineHeight: 1.45 }}>
            — {line}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function BesoinPairsNode({ data }: { data: EntityNodeData }) {
  const pairs = data.besoinPairs ?? []
  return (
    <div data-export-root className="flex w-full flex-col" style={{ width: data.exportWidth, gap: 10 }}>
      {pairs.map((pair, i) => (
        <Fragment key={pair.left.title}>
          {i > 0 && <div style={{ height: 1, backgroundColor: 'hsl(var(--border))' }} />}
          <div className="flex w-full items-stretch" style={{ gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
              <Side num={pair.left.num} title={pair.left.title} lines={pair.left.lines} color={TOKENS[i][0]} />
            </div>
            <div className="flex flex-col items-center justify-center" style={{ width: ARROW_W, flexShrink: 0, gap: 4 }}>
              <div style={{ flex: 1, width: 1.6, backgroundColor: 'var(--fig-frame)' }} />
              <svg width={18} height={11} viewBox="0 0 18 11" style={{ display: 'block' }}>
                <polygon points="9,11 0,0 18,0" fill="var(--fig-frame)" />
              </svg>
              <div style={{ flex: 1, width: 1.6, backgroundColor: 'var(--fig-frame)' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
              <Side num={pair.right.num} title={pair.right.title} lines={pair.right.lines} color={TOKENS[i][1]} />
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  )
}
