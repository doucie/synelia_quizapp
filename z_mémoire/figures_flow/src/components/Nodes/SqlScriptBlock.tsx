import { useMemo } from 'react'
import { Download } from 'lucide-react'
import { tokenizeSql, type SqlTokenKind } from '../../utils/sqlTokens'
import { exportNodeSvg } from '../../utils/exportSvg'
import type { EntityNodeData } from '../../types'

/**
 * Bloc de code SQL — vue « script » du MPD.
 *
 * Rendu en deux modes :
 *  - `sql`     : le `CREATE TABLE` d'une table, avec numéros de ligne
 *  - `sqlLegend`: la légende de lecture (couleur → signification)
 *
 * Le composant est appelé par `EntityNode` sur la variante `mpd-sql` : on évite
 * d'élargir l'union `DiagramDefinition.nodes` et donc de toucher `loadPositions`,
 * `applyEntityColors` et `autoLayout` — autant de sources d'erreurs de typage
 * évitées sur un projet qui en porte déjà 70.
 */

function hsla(color: string | undefined, alpha: number): string | undefined {
  if (!color) return
  const m = color.match(/^hsl\((\d+)/)
  if (!m) return
  return `hsla(${m[1]}, 100%, 40%, ${alpha})`
}

function CodeLines({ sql }: { sql: string }) {
  const lines = useMemo(() => tokenizeSql(sql), [sql])

  return (
    <pre>
      {lines.map((tokens, i) => (
        <div key={i} className="flex gap-3">
          <span className="sql-gutter w-6 shrink-0 select-none">{i + 1}</span>
          <span className="min-w-0 whitespace-pre">
            {tokens.length === 0 ? ' ' : tokens.map((t, j) => (
              <span key={j} className={`sql-token-${t.kind as SqlTokenKind}`}>
                {t.text}
              </span>
            ))}
          </span>
        </div>
      ))}
    </pre>
  )
}

function Legend({ items }: { items: NonNullable<EntityNodeData['sqlLegend']> }) {
  return (
    <div className="flex flex-col gap-1.5 p-3">
      {items.map((item) => (
        <div key={item.kind} className="flex items-baseline gap-2 text-[11px]">
          <code className={`sql-token-${item.kind} w-40 shrink-0 font-mono`}>
            {item.sample}
          </code>
          <span className="text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function SqlScriptBlock({ data, id }: { data: EntityNodeData; id?: string }) {
  const { label, badge, mcd, meta, sql, lineCount, auditNote, color, sqlLegend } = data

  return (
    <div
      className="sql-block flex w-full flex-col overflow-hidden rounded-2xl border border-solid shadow-[0_7px_9px_0_rgba(0,0,0,0.02)]"
      style={color ? { borderColor: color } : undefined}
    >
      {/* ---- En-tête : identité de la table, hors script -------------------- */}
      <div
        className="flex items-center justify-between gap-2 border-b border-solid px-3 py-2"
        style={color ? { backgroundColor: hsla(color, 0.094), borderColor: hsla(color, 0.2) } : undefined}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {sql && (
              <span
                className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide"
                style={color ? { backgroundColor: hsla(color, 0.2), color } : undefined}
              >
                CREATE TABLE
              </span>
            )}
            <span
              className="truncate text-xs font-bold"
              style={color ? { color } : undefined}
            >
              {label}
            </span>
            {badge && (
              <span
                className="shrink-0 rounded px-1.5 text-[9px] font-bold"
                style={color ? { backgroundColor: hsla(color, 0.2), color } : undefined}
              >
                {badge}
              </span>
            )}
          </div>
          {mcd && (
            <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
              origine MLD&nbsp;: <span className="font-semibold">{mcd}</span>
              {lineCount != null && <span> · {lineCount} lignes</span>}
            </div>
          )}
        </div>
        {sql && id && (
          <button
            data-no-export
            onClick={() => exportNodeSvg(id, `${label}.sql.svg`)}
            className="nodrag nopan shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted"
            title={`Exporter le script de ${label} en SVG`}
          >
            <Download size={13} />
          </button>
        )}
      </div>

      {/* ---- Corps ------------------------------------------------------------ */}
      {sql ? (
        <>
          <div className="px-3 py-2.5">
            <CodeLines sql={sql} />
          </div>
          {(meta || auditNote) && (
            <div className="border-t border-solid border-border/60 px-3 py-1.5 text-[10px] leading-relaxed text-muted-foreground">
              {meta && <div>{meta}</div>}
              {auditNote && <div className="opacity-80">{auditNote}</div>}
            </div>
          )}
        </>
      ) : (
        sqlLegend && <Legend items={sqlLegend} />
      )}
    </div>
  )
}
