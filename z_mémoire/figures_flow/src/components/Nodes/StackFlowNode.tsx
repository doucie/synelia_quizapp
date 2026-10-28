import type { EntityNodeData } from '../../types'
import { Logo, type LogoKey } from './logos'
import { accentInk } from '../../utils/figInk'

/**
 * Pile 3-tiers avec flux (figure du mémoire, Fig. 8) : verbatim de
 * `figures_html/stack_technique.html` — 3 couches (Interface / Serveur /
 * Stockage) et 2 connecteurs bidirectionnels internes.
 *
 * Nœud composite unique, zéro arête React Flow (précédent `LevelsNode`) :
 * les flux sont des divs internes, pas des arêtes — l'export reste un seul
 * raster `[data-export-root]`. Aucune `<Handle>`, seule la largeur est posée
 * (`exportWidth`), jamais `height` (invariant n°1).
 *
 * Style Gouvernance (niveau `dir`) : carte `border-left 5px` + tint
 * `color-mix`, accents de la palette documentaire — interface =
 * `var(--fig-danger)` (Angular), serveur = `var(--fig-success)` (Spring Boot),
 * stockage = `var(--fig-secondary)` (MySQL). Nom de couche, pills, logos et
 * code literal « sql » du logo MySQL (overlay `sqlFill`) sont posés EN TEXTE
 * sur le fond de page : encres `accentInk()` (pastels en sombre, addenda
 * 20261020 — liseré/carte/tint restent sur les jetons gelés), corps
 * `calc(var(--org-font-scale,1)*Npx)` inline.
 * Flux : trait + pastille, repris du HTML source — jetons
 * `--fig-flow-*` avec version sombre (`index.css`).
 */

const NAME_SIZE = 26
const ROLE_SIZE = 18
const PILL_SIZE = 17
const FLOW_SIZE = 17

const LOGO_SIZE = 52
const ARROW = 'var(--fig-flow)'
const SOFT = 'var(--fig-flow-soft)'
const OUTLINE = 'var(--fig-flow-line)'
const INK = 'var(--fig-flow-ink)'

/** Teinte derrière contenu : `color-mix` accepte un jeton CSS var(...) en
 * couleur de base (résolu par computed styles, contrairement à `hsla`). */
function tinted(color: string, pct: number) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`
}

function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

const LAYER_LOGO: Record<number, LogoKey> = { 0: 'angular', 1: 'springboot', 2: 'mysql' }

function Flow({ down, up }: { down: string; up: string }) {
  const lane = (label: string, dir: 'down' | 'up') => (
    <span className="flex h-full flex-col items-center" style={{ width: 170 }}>
      {dir === 'up' && <span style={arrowUp} />}
      <span style={vline} />
      <span
        className="font-semibold whitespace-nowrap"
        style={{
          ...px(FLOW_SIZE),
          backgroundColor: SOFT,
          border: `2px solid ${OUTLINE}`,
          borderRadius: 18,
          padding: '5px 12px',
          color: INK,
        }}
      >
        {label}
      </span>
      <span style={vline} />
      {dir === 'down' && <span style={arrowDown} />}
    </span>
  )
  return (
    <div className="flex w-full items-stretch justify-center" style={{ height: 96, gap: 28 }}>
      {lane(down, 'down')}
      {lane(up, 'up')}
    </div>
  )
}

const vline: React.CSSProperties = { width: 3, flex: '1 1 auto', backgroundColor: ARROW, borderRadius: 2 }
const arrowDown: React.CSSProperties = {
  width: 0,
  height: 0,
  flexShrink: 0,
  borderLeft: '8px solid transparent',
  borderRight: '8px solid transparent',
  borderTop: `13px solid ${ARROW}`,
}
const arrowUp: React.CSSProperties = {
  width: 0,
  height: 0,
  flexShrink: 0,
  borderLeft: '8px solid transparent',
  borderRight: '8px solid transparent',
  borderBottom: `13px solid ${ARROW}`,
}

export default function StackFlowNode({ data }: { data: EntityNodeData }) {
  const layers = data.stackflowLayers ?? []
  const flows = data.stackflowFlows ?? []
  return (
    <div data-export-root className="flex w-full flex-col" style={{ width: data.exportWidth, gap: 0 }}>
      {layers.map((layer, i) => (
        <div key={layer.name}>
          <div
            className="flex w-full items-center rounded-xl border border-solid bg-background"
            style={{
              gap: 18,
              padding: '14px 20px',
              minHeight: 110,
              borderColor: 'hsl(var(--border))',
              borderLeftWidth: 5,
              borderLeftColor: layer.color,
              backgroundColor: tinted(layer.color, 7),
            }}
          >
            <span
              className="inline-flex shrink-0 items-center justify-center rounded-[9px]"
              style={{ width: 64, height: 64, backgroundColor: tinted(accentInk(layer.color), 14) }}
            >
              <Logo
                name={LAYER_LOGO[i] ?? 'mysql'}
                size={LOGO_SIZE}
                fill={accentInk(layer.color)}
                sqlFill={i === 2 ? accentInk('var(--fig-warning)') : undefined}
              />
            </span>
            <span className="flex shrink-0 flex-col" style={{ minWidth: 240 }}>
              <span className="font-bold leading-tight text-foreground" style={{ ...px(NAME_SIZE), color: accentInk(layer.color) }}>
                {layer.name}
              </span>
              <span className="text-foreground/85" style={px(ROLE_SIZE)}>
                {layer.role}
              </span>
            </span>
            <span className="flex flex-1 flex-wrap justify-end" style={{ gap: 8 }}>
              {layer.pills.map((p) => (
                <span
                  key={p.name}
                  className="font-semibold whitespace-nowrap"
                  style={{
                    ...px(PILL_SIZE),
                    padding: '5px 11px',
                    borderRadius: 20,
                    border: `1px solid ${tinted(accentInk(layer.color), 30)}`,
                    backgroundColor: tinted(accentInk(layer.color), 10),
                    color: accentInk(layer.color),
                  }}
                >
                  {p.name}
                  {p.ver && <span style={{ fontWeight: 400, opacity: 0.75 }}> {p.ver}</span>}
                </span>
              ))}
            </span>
          </div>
          {i < flows.length && <Flow down={flows[i].down} up={flows[i].up} />}
        </div>
      ))}
    </div>
  )
}
