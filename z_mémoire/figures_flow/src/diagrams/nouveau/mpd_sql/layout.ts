import type { DiagramDefinition, EntityNode, EntityNodeData } from '../../../types'
import { toLegendNode, toScriptNode, type MpdTable } from '../mpd/schema'

/**
 * Mise en page des figures « script SQL ».
 *
 * Grille de 2 colonnes remplie **colonne par colonne** : on lit la 1re colonne
 * de haut en bas, puis la 2e. C'est l'ordre d'exécution du script, ce qui
 * donne son sens pédagogique à la figure.
 *
 * Le Y n'est pas un pas constant : les blocs font de 8 à ~35 lignes selon la
 * table, donc un pas fixechevaucherait. On accumule la hauteur estimée de
 * chaque bloc. Les positions restent déplaçables et persistées en
 * localStorage — l'utilisateur peut réorganiser comme il veut.
 */

const BLOCK_WIDTH = 700
const COLUMN_GAP = 60
const ROW_GAP = 26
const COLUMNS = 2

// Estimation de hauteur, alignée sur `SqlScriptBlock` et `index.css`
// (font-size 11px, line-height 1.55).
const LINE_HEIGHT = 17
const HEADER_HEIGHT = 54
const FOOTER_HEIGHT = 32
const BODY_PADDING = 20

function estimateHeight(data: EntityNodeData): number {
  if (data.sqlLegend) return 54 + 7 * 20 + 16
  const lines = data.lineCount ?? 12
  const hasFooter = Boolean(data.meta || data.auditNote)
  return (
    HEADER_HEIGHT +
    lines * LINE_HEIGHT +
    BODY_PADDING +
    (hasFooter ? FOOTER_HEIGHT : 0)
  )
}

export interface ScriptFigureSpec {
  id: string
  title: string
  domain: string
  /** Ordre de création : une table référencée avant celle qui la référence. */
  order: string[]
  tables: MpdTable[]
  /** Position de la légende dans le flux (index de colonne, 0 ou 1). */
  legendColumn?: number
}

export function buildScriptFigure(spec: ScriptFigureSpec): DiagramDefinition {
  const { id, title, domain, order, tables, legendColumn = 1 } = spec

  const knownTables = tables.map((t) => t.name)
  const byName = new Map(tables.map((t) => [t.name, t]))

  const built: EntityNode[] = order.map((name) => {
    const table = byName.get(name)
    if (!table) throw new Error(`Table absente du périmètre de la figure ${id} : ${name}`)
    return toScriptNode(table, { x: 0, y: 0 }, { knownTables })
  })

  // La légende ouvre la 2e colonne : elle se voit sans descendre au bas de la 1re.
  const perColumn = Math.ceil((built.length + 1) / COLUMNS)
  built.splice(Math.min(legendColumn * perColumn, built.length), 0, toLegendNode({ x: 0, y: 0 }))

  // Placement : remplissage colonne par colonne, Y accumulé (hauteurs variables).
  const columnTops: number[] = new Array(COLUMNS).fill(0)
  const nodes: EntityNode[] = []
  for (let i = 0; i < built.length; i++) {
    const col = Math.min(Math.floor(i / perColumn), COLUMNS - 1)
    const y = columnTops[col]
    columnTops[col] = y + estimateHeight(built[i].data) + ROW_GAP
    nodes.push({ ...built[i], position: { x: col * (BLOCK_WIDTH + COLUMN_GAP), y } })
  }

  return { id, title, category: 'mpd-sql', domain, nodes, edges: [] }
}
