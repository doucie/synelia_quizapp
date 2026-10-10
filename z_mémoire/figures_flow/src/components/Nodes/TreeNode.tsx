import type { EntityNodeData } from '../../types'
import { Logo } from './logos'

/**
 * Arborescence de dépôt (figure du mémoire, 6.3) : le dépôt comme ce qu’il
 * est, un arbre — racine en haut à gauche, tronc vertical, 3 coudes en L vers
 * les branches. Rappel direct fig. 5 (mêmes logos Angular/Spring + baleine
 * Docker, autre moment du mémoire).
 *
 * Nœud composite unique, zéro arête React Flow (précédent `RingsNode`) :
 * racine + 3 rangées HTML + tronc/coudes SVG calculés. Aucune `<Handle>`.
 *
 * Noms en monospace système (`ui-monospace`, pas de fonte custom : la mesure
 * au harness EST la vérité d’export), descriptions en italique `/85` à
 * droite. Sous-titre empilé sous le nom (38 car. mono ≈ 500 px, pas de place
 * en ligne).
 */

const W = 1400
const ROOT_X = 40
const ROOT_Y = 30
const TRUNK_X = 70
const ROW_X = 140
const ROW_TOPS = [140, 300, 460]
const ROW_MIN = 130
const H = 640

const ROOT_SIZE = 24
const NAME_SIZE = 22
const SUB_SIZE = 16
const DESC_SIZE = 18
const LOGO = 44

const MONO = "ui-monospace, 'Cascadia Mono', Menlo, Consolas, monospace"

/** Même convention que les autres figures d’impression : `--org-font-scale`
 * est déjà recopiée pendant l’export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

export default function TreeNode({ data }: { data: EntityNodeData }) {
  const branches = data.treeBranches ?? []
  const mids = ROW_TOPS.map((y) => y + ROW_MIN / 2)
  const trunkTop = ROOT_Y + 62
  const trunkBottom = mids[mids.length - 1]
  return (
    <div data-export-root className="relative w-full" style={{ width: data.exportWidth, height: H }}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="arborescence du dépôt"
        style={{ position: 'absolute', left: 0, top: 0 }}
      >
        <line
          x1={TRUNK_X}
          y1={trunkTop}
          x2={TRUNK_X}
          y2={trunkBottom}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={2}
        />
        {mids.map((y, i) => (
          <line
            key={branches[i]?.name ?? i}
            x1={TRUNK_X}
            y1={y}
            x2={ROW_X}
            y2={y}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={2}
          />
        ))}
      </svg>
      <div
        className="absolute font-bold text-foreground"
        style={{ left: ROOT_X, top: ROOT_Y, ...px(ROOT_SIZE) }}
      >
        {data.treeTitle}
      </div>
      {branches.map((b, i) => (
        <div
          key={b.name}
          className="absolute flex items-center"
          style={{ left: ROW_X, top: ROW_TOPS[i], minHeight: ROW_MIN, gap: 20 }}
        >
          <Logo name={b.logo} size={LOGO} fill={b.color} />
          <div className="flex flex-col" style={{ width: 430, gap: 2 }}>
            <span className="font-bold text-foreground" style={{ ...px(NAME_SIZE), fontFamily: MONO }}>
              {b.name}
            </span>
            <span className="text-muted-foreground" style={px(SUB_SIZE)}>
              {b.sub}
            </span>
          </div>
          <span className="leading-snug text-foreground/85 italic" style={{ ...px(DESC_SIZE), maxWidth: 640 }}>
            {b.desc}
          </span>
        </div>
      ))}
    </div>
  )
}
