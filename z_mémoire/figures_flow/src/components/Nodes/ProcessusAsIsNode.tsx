import { Fragment } from 'react'
import type { EntityNodeData } from '../../types'
import { FeatherIcon } from './icons'
import { Logo, LOGO_BRAND } from './logos'
import { richParts } from '../../utils/richText'

/**
 * Figure 2 — Scène as-is illustrée (§1.3.1), conception v3 (décision
 * utilisateur : représentation littérale — logos de réseaux pour la diffusion,
 * CV qui arrivent des canaux, rangement propre). Trois bandes verticales :
 *
 *   1. Diffusion : tuile « Offre » → flèche → 3 canaux (LinkedIn en marque,
 *      boîte email, plateformes d'emploi — icônes `mail`/`briefcase`) ;
 *   2. Réception : sous chaque canal, une feuille-CV (`file-text`, inclinée)
 *      plonge en trait dashed vers SON récepteur (folder / inbox / grid) ;
 *   3. Évaluation → décision : notes papier + appel → décision finale
 *      (dossier incomplet, justification absente).
 *
 * Deux ruptures `!` centrent les bandes (symptômes verbatim du HTML
 * `processus_recrutement_as_is`) et la justification décisionnelle absente
 * porte le hint de la carte finale. Bandeau de stats et conclusion RGPD
 * inchangés. Nœud composite unique, zéro arête React Flow, aucune `<Handle>`,
 * corps `calc(var(--org-font-scale,1)*Npx)` inline, jetons `--fig-*` (navy
 * pour la structure, danger pour les ruptures).
 */

const STAT_NUM_SIZE = 26
const STAT_LABEL_SIZE = 10.5
const PROBLEM_SIZE = 11.5
const CHANNEL_LABEL_SIZE = 12.5
const SHEET_SIZE = 20
const RECEIVER_LABEL_SIZE = 11.5
const RECEIVER_NOTE_SIZE = 9.5
const EVAL_TITLE_SIZE = 12
const EVAL_HINT_SIZE = 10
const OFFER_SIZE = 12.5
const BREAK_MARKER_SIZE = 11
const BREAK_LABEL_SIZE = 10
const CONCLUSION_SIZE = 11.5

const OFFER_W = 168

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

const EVAL_TILTS = [4, -5, 3]

export default function ProcessusAsIsNode({ data }: { data: EntityNodeData }) {
  const channels = data.asisChannels ?? []
  const evals = data.asisEvals ?? []
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

      {/* ── Bande 1 : diffusion de l'offre ─────────────────────────── */}
      <div className="flex items-stretch" style={{ marginTop: 14 }}>
        <div className="flex flex-col items-center justify-center" style={{ width: OFFER_W, flexShrink: 0 }}>
          <div
            className="flex flex-col items-center justify-center"
            style={{
              width: '100%',
              gap: 4,
              padding: '12px 10px',
              borderRadius: 10,
              border: '2px solid var(--fig-navy)',
              backgroundColor: tinted('var(--fig-navy)', 8),
            }}
          >
            <span className="flex" style={{ color: 'var(--fig-navy)' }}>
              <FeatherIcon kind="briefcase" size={24} />
            </span>
            <span className="font-bold text-foreground text-center" style={px(OFFER_SIZE)}>
              Offre
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-center" style={{ width: 44 }}>
          <svg width={26} height={11} viewBox="0 0 26 11">
            <polygon points="26,5.5 10,0 10,11" fill="var(--fig-navy)" />
            <rect x={0} y={4.5} width={11} height={2} fill="var(--fig-navy)" />
          </svg>
        </div>
        <div className="flex min-w-0 flex-1" style={{ gap: 14 }}>
          {channels.map((ch) => (
            <div
              key={ch.label}
              className="flex flex-1 flex-col items-center justify-center"
              style={{
                minWidth: 0,
                gap: 5,
                padding: '12px 8px',
                borderRadius: 10,
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--background))',
              }}
            >
              {ch.kind === 'logo' ? (
                <Logo name="linkedin" size={22} fill={LOGO_BRAND.linkedin} />
              ) : (
                <FeatherIcon kind={ch.ref as 'mail' | 'briefcase'} size={22} color="var(--fig-navy)" />
              )}
              <span className="font-semibold text-foreground text-center" style={px(CHANNEL_LABEL_SIZE)}>
                {ch.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rupture : diffusion non tracée. */}
      {data.asisBreaks?.[0] && (
        <div className="flex items-center justify-center" style={{ gap: 8, margin: '8px 0' }}>
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
            }}
          >
            !
          </span>
          <span className="font-semibold" style={{ ...px(BREAK_LABEL_SIZE), color: 'var(--fig-danger)' }}>
            {data.asisBreaks[0].label}
          </span>
        </div>
      )}

      {/* ── Bande 2 : les CV tombent des canaux vers leur récepteur ── */}
      <div className="flex min-w-0 flex-1" style={{ gap: 14 }}>
        {channels.map((ch, i) => (
          <div key={ch.label} className="flex flex-1 flex-col items-center" style={{ minWidth: 0, gap: 4 }}>
            <span style={{ transform: `rotate(${EVAL_TILTS[i % 3]}deg)`, color: 'var(--fig-navy)', display: 'block' }}>
              <FeatherIcon kind="filetext" size={SHEET_SIZE} />
            </span>
            <span style={{ ...px(9), color: 'var(--fig-navy)', opacity: 0.8 }}>CV</span>
            <svg width={12} height={34} viewBox="0 0 12 34" style={{ display: 'block' }}>
              <line x1={6} y1={0} x2={6} y2={26} stroke="var(--fig-danger)" strokeWidth={1.6} strokeDasharray="4 3" />
              <polygon points="6,34 2,26 10,26" fill="var(--fig-danger)" />
            </svg>
            <div
              className="flex flex-col items-center"
              style={{
                width: '100%',
                gap: 2,
                padding: '9px 8px',
                borderRadius: 10,
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--muted))',
              }}
            >
              <span className="flex" style={{ color: 'var(--fig-warning)' }}>
                <FeatherIcon kind={ch.receiver.icon} size={20} />
              </span>
              <span className="font-semibold text-foreground text-center" style={px(RECEIVER_LABEL_SIZE)}>
                {ch.receiver.label}
              </span>
              <span className="text-foreground/85 text-center" style={px(RECEIVER_NOTE_SIZE)}>
                {ch.receiver.note}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Rupture : ressaisie manuelle, fichiers dispersés. */}
      {data.asisBreaks?.[1] && (
        <div className="flex items-center justify-center" style={{ gap: 8, margin: '8px 0' }}>
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
            }}
          >
            !
          </span>
          <span className="font-semibold" style={{ ...px(BREAK_LABEL_SIZE), color: 'var(--fig-danger)' }}>
            {data.asisBreaks[1].label}
          </span>
        </div>
      )}

      {/* ── Bande 3 : évaluation → décision ─────────────────────────── */}
      <div className="flex items-stretch" style={{ gap: 10 }}>
        {evals.map((ev, i) => (
          <Fragment key={ev.title}>
            {i > 0 && (
              <div className="flex flex-col items-center justify-center" style={{ width: 30, flexShrink: 0 }}>
                <div style={{ flex: 1, width: 1.4, backgroundColor: 'hsl(var(--border))' }} />
                <svg width={9} height={8} viewBox="0 0 9 8">
                  <polygon points="9,4 0,0 0,8" fill="hsl(var(--border))" />
                </svg>
              </div>
            )}
            <div
              className="flex flex-1 flex-col items-center"
              style={{
                minWidth: 0,
                gap: 4,
                padding: '11px 10px',
                borderRadius: 10,
                border: '1px solid hsl(var(--border))',
                backgroundColor: i === evals.length - 1 ? tinted('var(--fig-danger)', 6) : 'hsl(var(--background))',
                borderColor:
                  i === evals.length - 1 ? tinted('var(--fig-danger)', 30) : 'hsl(var(--border))',
              }}
            >
              <span className="flex" style={{ color: i === evals.length - 1 ? 'var(--fig-danger)' : 'var(--fig-navy)' }}>
                <FeatherIcon kind={ev.icon} size={20} />
              </span>
              <span className="font-semibold text-foreground text-center" style={px(EVAL_TITLE_SIZE)}>
                {ev.title}
              </span>
              <span className="text-foreground/85 text-center" style={px(EVAL_HINT_SIZE)}>
                {ev.hint}
              </span>
            </div>
          </Fragment>
        ))}
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
