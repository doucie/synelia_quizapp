import type { EntityNodeData, VersusRow } from '../../types'

/**
 * Balance Merise/UML par ligne (figure du mémoire, 4.2.1) : 6 points
 * projet-spécifiques, 3-3 — le vrai visage du projet (données lourdes +
 * Java objet). Chaque ligne montre vers quel camp penche le point, avec son
 * intensité : c’est ce sens de la balance qui fait la valeur de la figure
 * (un inventaire sans penchant ne fait que répéter du texte).
 *
 * v3 (retour demandeur) : la grille v1 faisait bien son travail de balance
 * mais plaidait Merise (4-1 + verdict triomphaliste) ; les panneaux v2
 * étaient équilibrés mais aveugles. Ici : forme v1 (surlignages, chevrons),
 * fond projet 3-3, verdict neutre. `VersusPanel` supprimé avec la v2 — pas de
 * code mort.
 *
 * Nœud composite unique, zéro arête React Flow : grille CSS 460/260/460
 * (hauteurs égales par ligne), Merise navy à gauche, UML bleu à droite,
 * critère au centre, verdict neutre en bandeau. Aucune `<Handle>`.
 *
 * Net : bordure 2 px + teinte `0.12` ; léger : 1 px + `0.06` ; neutre : rien.
 * Chevrons SVG inline (pas de `▸` texte, fonte-dépendant) : cellule du camp
 * vers lequel ça penche, côté extérieur. Navy/bleu imposés par le brief
 * (exception hors SAFE_HUES, alpha en `hsl(…, …, …, a)` direct — le helper
 * `hsla()` force 100 %/40 %).
 */

const NAVY = 'hsl(222, 65%, 30%)'
const NAVY_NET = 'hsl(222, 65%, 30%, 0.12)'
const NAVY_SOFT = 'hsl(222, 65%, 30%, 0.06)'
const UML_BG = 'hsl(210, 100%, 40%, 0.08)'
const UML_NET = 'hsl(210, 100%, 40%, 0.14)'
const UML_BLUE = 'hsl(210, 100%, 40%)'

const HEAD_SIZE = 24
const CRIT_SIZE = 19
const CELL_SIZE = 20
const VERDICT_SIZE = 20

/** Même convention que les autres figures d’impression : `--org-font-scale`
 * est déjà recopiée pendant l’export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

function Chevron({ dir, strong, color }: { dir: 'left' | 'right'; strong: boolean; color: string }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      role="img"
      aria-label={dir === 'left' ? 'penche Merise' : 'penche UML'}
      style={{ flexShrink: 0, opacity: strong ? 1 : 0.5 }}
    >
      <polygon
        points={dir === 'left' ? '18,4 6,12 18,20' : '6,4 18,12 6,20'}
        fill={color}
      />
    </svg>
  )
}

function Cell({
  text,
  navy,
  winner,
  strong,
  dir,
}: {
  text: string
  navy: boolean
  winner: boolean
  strong: boolean
  dir: 'left' | 'right'
}) {
  const base = navy ? { backgroundColor: 'hsl(var(--background))', color: NAVY } : { backgroundColor: UML_BG }
  const hl = !winner
    ? {}
    : strong
      ? { borderWidth: 2, borderColor: navy ? NAVY : UML_BLUE, backgroundColor: navy ? NAVY_NET : UML_NET }
      : { borderWidth: 1, borderColor: navy ? NAVY : UML_BLUE, backgroundColor: navy ? NAVY_SOFT : UML_BG }
  return (
    <div
      data-cell={winner ? (navy ? 'merise' : 'uml') : 'none'}
      data-strong={winner && strong ? 'net' : 'faible'}
      className="flex items-center rounded-xl border-solid"
      style={{ padding: '16px 20px', gap: 12, ...base, ...hl }}
    >
      {winner && dir === 'left' && <Chevron dir="left" strong={strong} color={navy ? NAVY : UML_BLUE} />}
      <span className="leading-snug" style={{ ...px(CELL_SIZE), ...(winner ? { fontWeight: 600 } : {}) }}>
        {text}
      </span>
      {winner && dir === 'right' && <Chevron dir="right" strong={strong} color={navy ? NAVY : UML_BLUE} />}
    </div>
  )
}

function Row({ row }: { row: VersusRow }) {
  const winLeft = row.winner === 'left'
  const winRight = row.winner === 'right'
  return (
    <>
      <Cell text={row.left} navy winner={winLeft} strong={row.strong} dir="left" />
      <div className="flex items-center justify-center rounded-xl bg-muted" style={{ padding: '16px 12px' }}>
        <span className="text-center font-bold text-foreground" style={px(CRIT_SIZE)}>
          {row.criterion}
        </span>
      </div>
      <Cell text={row.right} navy={false} winner={winRight} strong={row.strong} dir="right" />
    </>
  )
}

export default function VersusNode({ data }: { data: EntityNodeData }) {
  const rows = data.versusRows ?? []
  const [verdictM, verdictU] = data.versusVerdict ?? ['', '']
  return (
    <div data-export-root className="flex w-full flex-col" style={{ width: data.exportWidth, gap: 16 }}>
      <div className="grid w-full" style={{ gridTemplateColumns: '460px 260px 460px', gap: '0 30px' }}>
        <div className="rounded-xl" style={{ padding: '14px 20px', backgroundColor: NAVY, textAlign: 'center' }}>
          <span className="font-bold" style={{ ...px(HEAD_SIZE), color: '#ffffff' }}>
            Merise
          </span>
        </div>
        <div className="flex items-center justify-center">
          <span className="font-bold tracking-wide text-muted-foreground uppercase" style={px(16)}>
            Point projet
          </span>
        </div>
        <div className="rounded-xl" style={{ padding: '14px 20px', backgroundColor: UML_BLUE, textAlign: 'center' }}>
          <span className="font-bold" style={{ ...px(HEAD_SIZE), color: '#ffffff' }}>
            UML
          </span>
        </div>
      </div>
      <div className="grid w-full" style={{ gridTemplateColumns: '460px 260px 460px', gap: '16px 30px' }}>
        {rows.map((row) => (
          <Row key={row.criterion} row={row} />
        ))}
      </div>
      <div
        data-verdict
        className="w-full rounded-xl border-solid bg-background"
        style={{ padding: '20px 28px', borderWidth: 2, borderColor: NAVY, textAlign: 'center' }}
      >
        <span className="leading-snug text-foreground" style={px(VERDICT_SIZE)}>
          <span style={{ color: NAVY, fontWeight: 700 }}>{verdictM}</span>
          {' — '}
          <span style={{ color: UML_BLUE, fontWeight: 700 }}>{verdictU}</span>
        </span>
      </div>
    </div>
  )
}
