import type { EntityNodeData } from '../../types'
import { FeatherIcon } from './icons'

/**
 * Figure 3 — L'éparpillement aspiré par la plateforme (§1.3.3) : le § donne
 * quatre raisons de retenir une plateforme unifiée (centraliser, automatiser,
 * standardiser, transparence). Rendu en entonnoir : un nuage éclaté d'outils
 * et de pratiques (gauche), la plateforme SyneliaQuizApp au centre, 4 sorties
 * fléchées étiquetées des 4 raisons (droite) — la lecture est immédiate,
 * presque plus de texte à lire.
 *
 * Nœud composite unique, zéro arête React Flow, aucune `<Handle>` ; corps en
 * `calc(var(--org-font-scale,1)*Npx)` inline (invariant n°2). Jetons par
 * sortie : centraliser `--fig-secondary`, automatiser `--fig-success`,
 * standardiser `--fig-warning`, tracer `--fig-neutral` ; plateforme en
 * `--fig-navy` ; contours `hsl(var(--border))`, tint `tinted()` = `color-mix`.
 */

const SCATTER_SIZE = 11
const PLATFORM_SIZE = 17
const PLATFORM_SUB_SIZE = 10.5
const OUT_ICON_SIZE = 17
const OUT_TITLE_SIZE = 13.5
const OUT_LINE_SIZE = 10.5

function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

function tinted(color: string, pct: number) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`
}

function ArrowRight({ color = 'var(--fig-frame)' }: { color?: string }) {
  return (
    <svg width={22} height={11} viewBox="0 0 22 11" style={{ display: 'block' }}>
      <polygon points="22,5.5 8,0 8,11" fill={color} />
      <rect x={0} y={4.5} width={9} height={2} fill={color} />
    </svg>
  )
}

export default function BesoinFunnelNode({ data }: { data: EntityNodeData }) {
  const scatter = data.besoinScatter ?? []
  const outputs = data.besoinOutputs ?? []
  return (
    <div data-export-root className="flex w-full items-center" style={{ width: data.exportWidth, gap: 14 }}>
      {/* Nuage éclaté : puces inclinées, laissées à la dérive. */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center" style={{ gap: 9 }}>
        {scatter.map((chip, i) => (
          <span
            key={chip.label}
            className="text-foreground/85 whitespace-nowrap"
            style={{
              ...px(SCATTER_SIZE),
              padding: '5px 11px',
              borderRadius: 12,
              border: '1px dashed hsl(var(--border))',
              backgroundColor: 'hsl(var(--muted))',
              transform: `rotate(${chip.tilt}deg) translateY(${i % 2 === 0 ? -3 : 4}px)`,
            }}
          >
            {chip.label}
          </span>
        ))}
      </div>

      {/* Aspiration : une seule flèche vers la plateforme. */}
      <div className="flex shrink-0 flex-col items-center justify-center" style={{ width: 40 }}>
        <ArrowRight color="var(--fig-navy)" />
      </div>

      {/* La plateforme : bloc d'aspiration et d'émission. */}
      <div
        className="flex shrink-0 flex-col items-center justify-center"
        style={{
          width: 188,
          gap: 3,
          padding: '26px 14px',
          borderRadius: 14,
          border: `2px solid var(--fig-navy)`,
          backgroundColor: tinted('var(--fig-navy)', 8),
        }}
      >
        <span className="font-extrabold text-foreground text-center" style={px(PLATFORM_SIZE)}>
          SyneliaQuizApp
        </span>
        <span className="text-foreground/85 text-center" style={px(PLATFORM_SUB_SIZE)}>
          plateforme unifiée
        </span>
      </div>

      {/* Émission : 4 sorties fléchées, une raison du § par carte. */}
      <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 10 }}>
        {outputs.map((out) => (
          <div key={out.title} className="flex items-center" style={{ gap: 8 }}>
            <div className="flex shrink-0 items-center justify-center" style={{ width: 24 }}>
              <ArrowRight />
            </div>
            <div
              className="flex w-full min-w-0 items-center rounded-lg border border-solid bg-background"
              style={{
                gap: 10,
                padding: '9px 12px',
                alignItems: 'center',
                borderLeftColor: `var(--fig-${out.color})`,
                borderLeftWidth: 5,
                backgroundColor: tinted(`var(--fig-${out.color})`, 6),
              }}
            >
              <span
                className="flex"
                style={{
                  width: 30,
                  height: 30,
                  flexShrink: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  color: `var(--fig-${out.color})`,
                  backgroundColor: tinted(`var(--fig-${out.color})`, 12),
                }}
              >
                <FeatherIcon kind={out.icon} size={OUT_ICON_SIZE} />
              </span>
              <div className="flex min-w-0 flex-col" style={{ gap: 1 }}>
                <span className="font-bold text-foreground" style={px(OUT_TITLE_SIZE)}>
                  {out.title}
                </span>
                <span className="text-foreground/85" style={{ ...px(OUT_LINE_SIZE), lineHeight: 1.35 }}>
                  {out.line}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
