import type { EntityNodeData, VersusPanel } from '../../types'

/**
 * Merise/UML — inventaires équilibrés (figure du mémoire, 4.2.1) : deux
 * panneaux Atouts/Limites (4+4 chacun), SANS gagnant, sans chevron. Le verdict
 * est une ligne de choix contextuel, pas un camp proclamé.
 *
 * Refonte (retour demandeur) : la grille à surlignages plaidait pour Merise
 * (4-1 + « colonne vertébrale »). `VersusRow`, les chevrons et les intensités
 * net/léger ont été supprimés avec elle — pas de code mort.
 *
 * Nœud composite unique, zéro arête React Flow : 2 colonnes (bandeau plein
 * teinte du camp + groupes micro-labellisés + items 18 px + marqueurs SVG
 * `+`/`−` teinte du camp), verdict pleine largeur. Aucune `<Handle>`.
 *
 * Navy/bleu imposés par le brief (exception hors SAFE_HUES) : les teintes
 * identifient les camps, sans les classer.
 */

const HEAD_SIZE = 24
const MICRO_SIZE = 14
const ITEM_SIZE = 18
const VERDICT_SIZE = 20

/** Même convention que les autres figures d’impression : `--org-font-scale`
 * est déjà recopiée pendant l’export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

function Mark({ plus, color }: { plus: boolean; color: string }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      role="img"
      aria-label={plus ? 'atout' : 'limite'}
      style={{ flexShrink: 0, marginTop: 3 }}
    >
      <line x1="10" y1="4" x2="10" y2="16" />
      {plus && <line x1="4" y1="10" x2="16" y2="10" />}
    </svg>
  )
}

function Item({ text, plus, color }: { text: string; plus: boolean; color: string }) {
  return (
    <div data-item={plus ? 'plus' : 'moins'} className="flex" style={{ gap: 10 }}>
      <Mark plus={plus} color={color} />
      <span className="leading-snug text-foreground" style={px(ITEM_SIZE)}>
        {text}
      </span>
    </div>
  )
}

function Panel({ panel }: { panel: VersusPanel }) {
  return (
    <div data-panel={panel.title} className="flex min-w-0 flex-1 flex-col" style={{ gap: 20 }}>
      <div
        className="w-full rounded-xl"
        style={{
          padding: '16px 24px',
          textAlign: 'center',
          backgroundColor: panel.solid ? panel.color : undefined,
        }}
      >
        <span
          className="font-bold"
          style={{ ...px(HEAD_SIZE), color: panel.solid ? '#ffffff' : panel.color }}
        >
          {panel.title}
        </span>
      </div>
      <div className="flex flex-col" style={{ gap: 8 }}>
        <span className="font-bold tracking-wide text-muted-foreground uppercase" style={px(MICRO_SIZE)}>
          Atouts
        </span>
        <div className="flex flex-col" style={{ gap: 10 }}>
          {panel.strengths.map((s) => (
            <Item key={s} text={s} plus color={panel.color} />
          ))}
        </div>
      </div>
      <div className="flex flex-col" style={{ gap: 8 }}>
        <span className="font-bold tracking-wide text-muted-foreground uppercase" style={px(MICRO_SIZE)}>
          Limites
        </span>
        <div className="flex flex-col" style={{ gap: 10 }}>
          {panel.weaknesses.map((s) => (
            <Item key={s} text={s} plus={false} color={panel.color} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function VersusNode({ data }: { data: EntityNodeData }) {
  const panels = data.versusPanels ?? []
  const [verdictM, verdictU] = data.versusVerdict ?? ['', '']
  const merise = panels[0]?.color ?? '#000'
  const uml = panels[1]?.color ?? '#000'
  return (
    <div data-export-root className="flex w-full flex-col" style={{ width: data.exportWidth, gap: 24 }}>
      <div className="flex w-full" style={{ gap: 48 }}>
        {panels.map((panel) => (
          <Panel key={panel.title} panel={panel} />
        ))}
      </div>
      <div
        data-verdict
        className="w-full rounded-xl border-solid bg-background"
        style={{ padding: '20px 28px', borderWidth: 2, borderColor: merise, textAlign: 'center' }}
      >
        <span className="leading-snug text-foreground" style={px(VERDICT_SIZE)}>
          <span style={{ color: merise, fontWeight: 700 }}>{verdictM}</span>
          {' — '}
          <span style={{ color: uml, fontWeight: 700 }}>{verdictU}</span>
        </span>
      </div>
    </div>
  )
}
