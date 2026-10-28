import { Fragment } from 'react'
import type { EntityNodeData } from '../../types'
import { FeatherIcon } from './icons'
import { Logo, LOGO_BRAND } from './logos'
import { accentInk } from '../../utils/figInk'

/**
 * Figure 2 — Scène as-is illustrée (§1.3.1), conception v4 (retours au rendu :
 * « Offre » ne semblait liée qu'à LinkedIn ⇒ placée EN HAUT reliée aux 3
 * canaux ; canaux = 3 vraies plateformes (LinkedIn/Indeed/Glassdoor — on ne
 * partage pas les offres par email) ; bandeau de statistiques et conclusion du
 * bas supprimés ⇒ scène seule, le texte dit déjà le reste). Trois bandes :
 *
 *   1. Diffusion : tuile « Offre » (`briefcase`, centrée) → tige → ligne
 *      horizontale → 3 descentes fléchées (arbre en T) → 3 logos en marque ;
 *   2. Réception : sous chaque plateforme, une feuille-CV (`file-text`,
 *      inclinée) plonge en trait dashed vers SON récepteur (folder / inbox /
 *      grid) — rangement propre, pas de pile en vrac ;
 *   3. Évaluation → décision : notes papier + appel → décision finale
 *      (dossier incomplet, justification absente).
 *
 * Deux ruptures `!` entre bandes (symptômes verbatim). Nœud composite unique,
 * zéro arête React Flow, aucune `<Handle>`, corps
 * `calc(var(--org-font-scale,1)*Npx)` inline, jetons `--fig-*` (navy pour la
 * structure, danger pour les ruptures, marques LOGO_BRAND pour les logos).
 * Addenda 20261020 : semantics gelées verbatim (les deux modes) — badges et
 * icônes posés EN TEXTE sur le fond de page passent par les encres
 * `accentInk()`, texte sur fond de rupture en `--fig-on-fill` (constant).
 */

const CHANNEL_LABEL_SIZE = 12.5
const SHEET_SIZE = 20
const RECEIVER_LABEL_SIZE = 11.5
const RECEIVER_NOTE_SIZE = 9.5
const EVAL_TITLE_SIZE = 12
const EVAL_HINT_SIZE = 10
const OFFER_SIZE = 12.5
const OFFER_ICON_SIZE = 22
const BREAK_MARKER_SIZE = 11
const BREAK_LABEL_SIZE = 10

const OFFER_W = 176
const CHANNEL_GAP = 14

function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

function tinted(color: string, pct: number) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`
}

const EVAL_TILTS = [4, -5, 3]

/** Descente fléchée de l'arbre en T : trait + pointe vers la tuile. */
function Drop() {
  return (
    <svg width={12} height={20} viewBox="0 0 12 20" style={{ display: 'block' }}>
      <line x1={6} y1={0} x2={6} y2={13} stroke="var(--fig-navy)" strokeWidth={1.6} />
      <polygon points="6,20 2,13 10,13" fill="var(--fig-navy)" />
    </svg>
  )
}

/** Feuille-CV qui plonge dashed du canal vers son récepteur. */
function SheetFall() {
  return (
    <svg width={12} height={34} viewBox="0 0 12 34" style={{ display: 'block' }}>
      <line x1={6} y1={0} x2={6} y2={26} stroke="var(--fig-danger)" strokeWidth={1.6} strokeDasharray="4 3" />
      <polygon points="6,34 2,26 10,26" fill="var(--fig-danger)" />
    </svg>
  )
}

function Rupture({ label }: { label: string }) {
  return (
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
          color: 'var(--fig-on-fill)',
          backgroundColor: 'var(--fig-danger)',
        }}
      >
        !
      </span>
      <span className="font-semibold" style={{ ...px(BREAK_LABEL_SIZE), color: accentInk('var(--fig-danger)') }}>
        {label}
      </span>
    </div>
  )
}

export default function ProcessusAsIsNode({ data }: { data: EntityNodeData }) {
  const channels = data.asisChannels ?? []
  const evals = data.asisEvals ?? []
  const lastIdx = evals.length - 1
  return (
    <div data-export-root className="flex w-full flex-col items-center" style={{ width: data.exportWidth }}>
      {/* ── Bande 1 : diffusion de l'offre (arbre en T) ────────────── */}
      <div
        className="flex flex-col items-center justify-center"
        style={{
          width: OFFER_W,
          gap: 4,
          padding: '12px 10px',
          borderRadius: 10,
          border: '2px solid var(--fig-navy)',
          backgroundColor: tinted('var(--fig-navy)', 8),
        }}
      >
        <span className="flex" style={{ color: accentInk('var(--fig-navy)') }}>
          <FeatherIcon kind="briefcase" size={OFFER_ICON_SIZE} />
        </span>
        <span className="font-bold text-foreground text-center" style={px(OFFER_SIZE)}>
          Offre
        </span>
      </div>
      <div style={{ width: 1.5, height: 10, backgroundColor: 'var(--fig-navy)' }} />
      {/* Ligne horizontale : des centres de la 1re à la 3e colonne
          (marge = mi-colonne exacte, gaps de 14 px compris). */}
      <div
        style={{
          height: 1.5,
          width: `calc(2 * (100% - ${2 * CHANNEL_GAP}px) / 3)`,
          backgroundColor: 'var(--fig-navy)',
          marginLeft: `calc((100% - ${2 * CHANNEL_GAP}px) / 6)`,
        }}
      />
      <div className="flex items-start" style={{ gap: CHANNEL_GAP, width: '100%' }}>
        {channels.map((ch) => (
          <div
            key={ch.label}
            className="flex flex-1 flex-col items-center"
            style={{ minWidth: 0, gap: 2 }}
          >
            <Drop />
            <div
              className="flex flex-1 flex-col items-center justify-center"
              style={{
                width: '100%',
                gap: 5,
                padding: '12px 8px',
                borderRadius: 10,
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--background))',
              }}
            >
              <Logo name={ch.ref} size={22} fill={LOGO_BRAND[ch.ref]} />
              <span className="font-semibold text-foreground text-center" style={px(CHANNEL_LABEL_SIZE)}>
                {ch.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {data.asisBreaks?.[0] && <Rupture label={data.asisBreaks[0].label} />}

      {/* ── Bande 2 : les CV tombent des canaux vers leur récepteur ── */}
      <div className="flex items-start" style={{ gap: CHANNEL_GAP, width: '100%' }}>
        {channels.map((ch, i) => (
          <div key={ch.label} className="flex flex-1 flex-col items-center" style={{ minWidth: 0, gap: 4 }}>
            <span style={{ transform: `rotate(${EVAL_TILTS[i % 3]}deg)`, color: 'var(--fig-navy)', display: 'block' }}>
              <FeatherIcon kind="filetext" size={SHEET_SIZE} />
            </span>
            <span style={{ ...px(9), color: 'var(--fig-navy)', opacity: 0.8 }}>CV</span>
            <SheetFall />
            <div
              className="flex w-full flex-col items-center"
              style={{
                gap: 2,
                padding: '9px 8px',
                borderRadius: 10,
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--muted))',
              }}
            >
              <span className="flex" style={{ color: accentInk('var(--fig-warning)') }}>
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

      {data.asisBreaks?.[1] && <Rupture label={data.asisBreaks[1].label} />}

      {/* ── Bande 3 : évaluation → décision ─────────────────────────── */}
      <div className="flex w-full items-stretch" style={{ gap: 10 }}>
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
                backgroundColor: i === lastIdx ? tinted('var(--fig-danger)', 6) : 'hsl(var(--background))',
                borderColor: i === lastIdx ? tinted('var(--fig-danger)', 30) : 'hsl(var(--border))',
              }}
            >
              <span
                className="flex"
                style={{ color: accentInk(i === lastIdx ? 'var(--fig-danger)' : 'var(--fig-navy)') }}
              >
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
    </div>
  )
}
