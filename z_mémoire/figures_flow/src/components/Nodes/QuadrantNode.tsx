import type { EntityNodeData } from '../../types'

/**
 * Quadrant de positionnement (figure du mémoire) : pastilles sur deux axes de
 * compromis, étiquettes posées dans le blanc voisin, libellés d’axes aux
 * extrémités, fond zoné en teintes égales.
 *
 * Le marqueur de données (pastille) est découplé de son étiquette (tag) : des
 * cartes-points de 380 px se chevauchaient, alors que les trois positions
 * tiennent sans conflit dès que pastilles et tags sont dimensionnés séparément.
 * Aucune arête : les axes sont des nœuds-règles, comme le filet de la Figure 1.
 * Leçons appliquées d’office : `exportWidth` en px inline sur chaque racine
 * (jamais de `%`), et traits fixes sur enfants internes — une hauteur fixe sur
 * la racine serait écrasée par le `height: auto` de la capture (cf. §8).
 */

const TAG_NAME_SIZE = 22
const TAG_LEGEND_SIZE = 19
const AXIS_LABEL_SIZE = 19
const DOT_DIAMETER = 44

/** Même teinte, avec alpha — la fidélité passe par S/L d’origine, pas par une reconstruction. */
function withAlpha(color: string | undefined, alpha: number): string | undefined {
  if (!color) return undefined
  const m = color.match(/^hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/)
  if (!m) return undefined
  return `hsla(${m[1]}, ${m[2]}%, ${m[3]}%, ${alpha})`
}

/** Même teinte, assombrie — anneau des pastilles, dans la même famille. */
function darker(color: string | undefined, delta: number): string | undefined {
  if (!color) return undefined
  const m = color.match(/^hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/)
  if (!m) return undefined
  return `hsl(${m[1]}, ${m[2]}%, ${Math.max(0, Number(m[3]) - delta)}%)`
}

function px(value: number) {
  return {
    // Même convention que les autres figures d’impression : `--org-font-scale`
    // est déjà recopiée pendant l’export SVG.
    fontSize: `calc(var(--org-font-scale, 1) * ${value}px)`,
  }
}

function QuadDot({ data }: { data: EntityNodeData }) {
  // Pastille nue : le nom vit dans le tag voisin, la couleur suffit à
  // reconnaître. Anneau assombri + ombre douce : présente sans crier.
  return (
    <div
      data-export-root
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      style={{ width: data.exportWidth }}
    >
      <div
        className="rounded-full"
        style={{
          width: DOT_DIAMETER,
          height: DOT_DIAMETER,
          backgroundColor: data.quadColor,
          border: `3px solid ${darker(data.quadColor, 12)}`,
          boxShadow: `0 2px 6px ${withAlpha(data.quadColor, 0.25)}`,
        }}
      />
    </div>
  )
}

function QuadTag({ data }: { data: EntityNodeData }) {
  // Étiquette fluide langage OrgNode allégé : nom inline en gras coloré suivi
  // de la légende dans le même flux — aucun saut de ligne après le nom.
  // Fond légèrement transparent (teinte du langage), bordure uniforme 1 px
  // pour la définition print, barre latérale interne 4 px pleine hauteur.
  // Les trois tags font la même largeur : leurs boîtes restent comparables
  // alors que les textes diffèrent.
  return (
    <div
      data-export-root
      className="w-full overflow-hidden rounded-lg"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      style={{
        width: data.exportWidth,
        border: `1px solid ${withAlpha(data.quadColor, 0.35)}`,
        // 0.094 : même convention que le bandeau MPD-SQL, fond de
        // description dans la teinte du langage.
        backgroundColor: withAlpha(data.quadColor, 0.094),
      }}
    >
      <div className="flex items-stretch">
        <div style={{ width: 4, backgroundColor: data.quadColor }} />
        <div
          className="px-3 py-2 leading-snug text-foreground/85"
          style={px(TAG_LEGEND_SIZE)}
        >
          <span
            className="font-bold"
            style={{ color: data.quadColor, ...px(TAG_NAME_SIZE) }}
          >
            {data.label}&nbsp;:{' '}
          </span>
          {data.quadLegend}
        </div>
      </div>
    </div>
  )
}

function QuadZone({ data }: { data: EntityNodeData }) {
  const cells = data.quadCells ?? []
  return (
    <div
      data-export-root
      className="grid w-full grid-cols-2 overflow-hidden rounded-xl"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      style={{ width: data.exportWidth }}
    >
      {cells.map((cell, i) => (
        <div key={i} style={{ height: 500, backgroundColor: cell }} />
      ))}
    </div>
  )
}

function QuadAxis({ data }: { data: EntityNodeData }) {
  const vertical = data.quadKind === 'vline'
  // Longueurs du graphe de cette figure (1000 × 1000), en px inline :
  // explicite des deux côtés, sans dépendre d’aucune résolution de `%`.
  return (
    <div
      data-export-root
      // Racine à hauteur auto : le trait fixe vit sur l’enfant interne, sinon
      // la capture l’écraserait (même cause que le filet manquant, Figure 1).
      style={{ width: data.exportWidth }}
    >
      <div
        className="bg-foreground/30"
        style={vertical ? { width: 2, height: 1000 } : { width: 1000, height: 2 }}
      />
    </div>
  )
}

export default function QuadrantNode({ data }: { data: EntityNodeData }) {
  if (data.quadKind === 'zone') return <QuadZone data={data} />
  if (data.quadKind === 'dot') return <QuadDot data={data} />
  if (data.quadKind === 'tag') return <QuadTag data={data} />
  if (data.quadKind === 'hline' || data.quadKind === 'vline') {
    return <QuadAxis data={data} />
  }
  const align =
    data.quadAlign === 'right' ? 'right' : data.quadAlign === 'left' ? 'left' : 'center'
  return (
    <div
      data-export-root
      className="w-full text-foreground/85"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      style={{ ...px(AXIS_LABEL_SIZE), width: data.exportWidth, textAlign: align }}
    >
      {data.label}
    </div>
  )
}
