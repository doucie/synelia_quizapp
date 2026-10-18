import { Fragment } from 'react'
import type { EntityNodeData } from '../../types'
import { FeatherIcon } from './icons'
import { richParts } from '../../utils/richText'

/**
 * Figure 2 — Chaîne à maillons rompus (§1.3.1) : le § parle de « maillons » —
 * chacun paraît simple, mais la chaîne est rompue entre outils et personnes.
 * Rendu : 4 maillons (icône Feather + nom + précision du texte) séparés par
 * des jonctions ouvertes (maillon coupé + pastille `!`), chaque rupture
 * étiquetée du symptôme qu'elle cause ; bandeau de stats en tête, conclusion
 * en pied (verbatim du HTML d'origine, source `processus_recrutement_as_is`).
 *
 * Nœud composite unique, zéro arête React Flow, aucune `<Handle>` ; corps en
 * `calc(var(--org-font-scale,1)*Npx)` inline (invariant n°2). Jetons : maillons
 * en `--fig-navy` (structure du processus), ruptures en `--fig-danger`,
 * contours `hsl(var(--border))` ; tint `tinted()` = `color-mix` (jamais
 * `hsla` sur `var()`).
 */

const STAT_NUM_SIZE = 26
const STAT_LABEL_SIZE = 10.5
const PROBLEM_SIZE = 11.5
const ICON_SIZE = 23
const LINK_TITLE_SIZE = 14.5
const LINK_HINT_SIZE = 10
const BREAK_MARKER_SIZE = 11
const BREAK_LABEL_SIZE = 10
const CONCLUSION_SIZE = 11.5

const BREAK_W = 110

function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

function tinted(color: string, pct: number) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`
}

/** Segments `**gras**` d'une phrase verbatim (problem/conclusion). */
function Rich({ text }: { text: string }) {
  return (
    <>
      {richParts(text).map((part, i) =>
        part.bold ? <strong key={i}>{part.text}</strong> : <span key={i}>{part.text}</span>,
      )}
    </>
  )
}

export default function ProcessusAsIsNode({ data }: { data: EntityNodeData }) {
  const links = data.asisLinks ?? []
  const breaks = data.asisBreaks ?? []
  const stats = data.asisStats ?? []
  return (
    <div data-export-root className="flex w-full flex-col" style={{ width: data.exportWidth }}>
      {/* Bandeau des chiffres : 3 médaillons + phrase courte. */}
      <div
        className="flex items-center"
        style={{
          gap: 22,
          padding: '10px 18px',
          borderRadius: 10,
          border: `1px solid ${tinted('var(--fig-danger)', 30)}`,
          backgroundColor: tinted('var(--fig-danger)', 6),
        }}
      >
        {stats.map((st, i) => (
          <Fragment key={st.num}>
            {i > 0 && <div style={{ width: 1, alignSelf: 'stretch', backgroundColor: tinted('var(--fig-danger)', 30) }} />}
            <div className="flex flex-col items-center" style={{ flexShrink: 0, gap: 1, minWidth: 74 }}>
              <span className="font-extrabold" style={{ ...px(STAT_NUM_SIZE), color: 'var(--fig-danger)' }}>
                {st.num}
              </span>
              <span className="text-foreground/85 text-center" style={px(STAT_LABEL_SIZE)}>
                {st.label}
              </span>
            </div>
          </Fragment>
        ))}
        {data.asisProblem && (
          <p className="text-foreground" style={{ ...px(PROBLEM_SIZE), lineHeight: 1.5, margin: 0 }}>
            <Rich text={data.asisProblem} />
          </p>
        )}
      </div>

      {/* La chaîne : maillons simples reliés par des jonctions rompues. */}
      <div className="flex w-full items-stretch" style={{ marginTop: 14, gap: 0 }}>
        {links.map((link, i) => {
          const br = i < links.length - 1 ? breaks[i] : undefined
          return (
            <Fragment key={link.title}>
              {i > 0 && br && (
                <div className="flex flex-col items-center justify-center" style={{ width: BREAK_W, flexShrink: 0 }}>
                  {/* Jonction ouverte : deux demi-maillons qui ne se touchent pas. */}
                  <svg width={BREAK_W} height={20} viewBox={`0 0 ${BREAK_W} 20`} style={{ display: 'block' }}>
                    {/* Demi-maillon gauche, ouvert vers le centre */}
                    <path
                      d={`M 0 10 H ${(BREAK_W / 2 - 30).toFixed(1)} a 5 5 0 0 0 0 -10`}
                      fill="none"
                      stroke="var(--fig-danger)"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                    />
                    {/* Demi-maillon droit, ouvert vers le centre */}
                    <path
                      d={`M ${(BREAK_W / 2 + 30).toFixed(1)} 10 H ${BREAK_W} a 5 5 0 0 1 0 -10`}
                      fill="none"
                      stroke="var(--fig-danger)"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    className="flex font-bold"
                    style={{
                      ...px(BREAK_MARKER_SIZE),
                      width: 18,
                      height: 18,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      color: 'var(--fig-soft)',
                      backgroundColor: 'var(--fig-danger)',
                      margin: '2px 0',
                    }}
                  >
                    !
                  </span>
                  <span
                    className="text-foreground/85 text-center"
                    style={{ ...px(BREAK_LABEL_SIZE), lineHeight: 1.35, margin: '3px 4px 0' }}
                  >
                    {br.label}
                  </span>
                </div>
              )}
              <div
                className="flex flex-col items-center justify-center"
                style={{
                  flex: 1,
                  minWidth: 0,
                  gap: 5,
                  padding: '14px 12px',
                  borderRadius: 10,
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--background))',
                }}
              >
                <span
                  className="flex"
                  style={{
                    width: 46,
                    height: 46,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    color: 'var(--fig-navy)',
                    backgroundColor: tinted('var(--fig-navy)', 10),
                  }}
                >
                  <FeatherIcon kind={link.icon} size={ICON_SIZE} />
                </span>
                <span className="font-bold text-foreground text-center" style={px(LINK_TITLE_SIZE)}>
                  {link.title}
                </span>
                <span className="text-foreground/85 text-center" style={{ ...px(LINK_HINT_SIZE), lineHeight: 1.35 }}>
                  {link.hint}
                </span>
              </div>
            </Fragment>
          )
        })}
      </div>

      {/* Conclusion : carte Gouvernance, liseré danger, verbatim. */}
      {data.asisConclusion && (
        <div
          className="rounded-lg border border-solid bg-background"
          style={{
            marginTop: 12,
            padding: '11px 14px',
            borderColor: 'hsl(var(--border))',
            borderLeftWidth: 5,
            borderLeftColor: 'var(--fig-danger)',
          }}
        >
          <p className="text-foreground" style={{ ...px(CONCLUSION_SIZE), lineHeight: 1.5, margin: 0 }}>
            <Rich text={data.asisConclusion} />
          </p>
        </div>
      )}
    </div>
  )
}
