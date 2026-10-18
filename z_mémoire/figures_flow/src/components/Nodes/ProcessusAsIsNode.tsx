import { Fragment } from 'react'
import type { EntityNodeData } from '../../types'
import { richParts } from '../../utils/richText'

/**
 * Figure 2 — Procédé de recrutement as-is (§1.3.1) : verbatim de
 * `figures_html/processus_recrutement_as_is.html`. Nœud composite unique,
 * zéro arête React Flow, aucune `<Handle>` : bandeau de stats, 3 phases de
 * chaînes d'outils reliées par des ruptures, conclusion en pied.
 *
 * Le SVG décoratif du source (arcs fléchés gradient) est abandonné (hors
 * en garde Gouvernance) ; la typographie suit le corps en
 * `calc(var(--org-font-scale,1)*Npx)` inline (invariant n°2). Palette
 * documentaire : ruptures et stats en `--fig-danger`, numéros de phase en
 * `--fig-navy`, contours en `hsl(var(--border))`.
 */

const STAT_NUM_SIZE = 26
const STAT_LABEL_SIZE = 10.5
const PROBLEM_SIZE = 11.5
const PHASE_NUM_SIZE = 13
const PHASE_TITLE_SIZE = 14.5
const TOOL_NAME_SIZE = 12.5
const TOOL_KIND_SIZE = 10.5
const BREAK_MARKER_SIZE = 11
const BREAK_LABEL_SIZE = 9.5
const CONCLUSION_SIZE = 11.5

const BREAK_W = 76

function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

function tinted(color: string, pct: number) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`
}

/** Segments `**gras**` d'une phrase verbatim (stats/conclusion). */
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
  const phases = data.asisPhases ?? []
  const stats = data.asisStats ?? []
  return (
    <div data-export-root className="flex w-full flex-col" style={{ width: data.exportWidth }}>
      {/* Bandeau du problème : stats en médaillons + phrase à droite. */}
      <div
        className="flex items-center"
        style={{
          gap: stats.length === 0 ? 0 : 22,
          padding: '12px 18px',
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

      {/* Phases : titre numéroté puis chaîne d'outils avec ruptures. */}
      {phases.map((phase, pi) => (
        <div key={phase.title} style={{ marginTop: pi === 0 ? 14 : 6 }}>
          <div className="flex items-center" style={{ gap: 8, marginBottom: 7 }}>
            <span
              className="flex font-bold"
              style={{
                ...px(PHASE_NUM_SIZE),
                width: 22,
                height: 22,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                color: 'var(--fig-soft)',
                backgroundColor: 'var(--fig-navy)',
              }}
            >
              {pi + 1}
            </span>
            <span className="font-bold text-foreground" style={px(PHASE_TITLE_SIZE)}>
              {phase.title}
            </span>
          </div>

          <div className="flex items-stretch">
            {phase.tools.map((tool, ti) => {
              const br = phase.breaks[ti - 1]
              return (
                <Fragment key={tool.name}>
                  {ti > 0 && br && (
                    <div
                      className="flex flex-col items-center justify-start"
                      style={{ width: BREAK_W, flexShrink: 0 }}
                    >
                      {/* Jonction rompue : trait coupé + pastille `!`. */}
                      <div className="flex flex-1 items-center" style={{ width: '100%' }}>
                        <div className="flex-1" style={{ height: 1.2, backgroundColor: tinted('var(--fig-danger)', 35) }} />
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
                            margin: '0 3px',
                          }}
                        >
                          !
                        </span>
                        <div className="flex-1" style={{ height: 1.2, backgroundColor: tinted('var(--fig-danger)', 35) }} />
                      </div>
                      <span
                        className="text-foreground/85 text-center"
                        style={{ ...px(BREAK_LABEL_SIZE), lineHeight: 1.35, margin: '4px 2px 0' }}
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
                      gap: 2,
                      padding: '9px 10px',
                      borderRadius: 8,
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--muted))',
                    }}
                  >
                    <span className="font-semibold text-foreground text-center" style={px(TOOL_NAME_SIZE)}>
                      {tool.name}
                    </span>
                    <span className="text-foreground/85 text-center" style={px(TOOL_KIND_SIZE)}>
                      {tool.kind}
                    </span>
                  </div>
                </Fragment>
              )
            })}
          </div>

          {pi < phases.length - 1 && <div style={{ height: 1, backgroundColor: 'hsl(var(--border))', margin: '10px 0 8px' }} />}
        </div>
      ))}

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
