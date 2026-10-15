import type { EntityNodeData } from '../../types'
import { hsla } from '../../utils/color'
import { FeatherIcon } from './icons'

/**
 * Niveaux de validation (figure du mémoire, 7.1 Stratégie de tests) : les
 * trois niveaux du texte, dans son ordre — unitaires/slice, intégration,
 * fonctionnel — chacun avec son objectif, ses outils et des exemples en
 * langage courant. Trois bandes horizontales ÉGALES : aucune pyramide des
 * volumes, la figure ne prétend pas mesurer l’effort.
 *
 * Nœud composite unique, zéro arête React Flow (précédent `ScopeNode`,
 * fig. 2) : 3 bandes + rien d’autre. Aucune `<Handle>`.
 * Mise en page en flux (hauteurs auto) : seule la largeur est posée
 * (`exportWidth`), jamais `height` (invariant n°1).
 *
 * Exemples simplifiés (retour demandeur) : pas de noms de fichiers bruts,
 * et la mention « extraits » évite de faire croire à un inventaire.
 */

const NUM_SIZE = 26
const NAME_SIZE = 22
const GOAL_SIZE = 18
const CHIP_SIZE = 16
const MEDALLION = 60

const MONO = "ui-monospace, 'Cascadia Mono', Menlo, Consolas, monospace"

/** Même convention que les autres figures d’impression : `--org-font-scale`
 * est déjà recopiée pendant l’export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

export default function LevelsNode({ data }: { data: EntityNodeData }) {
  const levels = data.testLevels ?? []
  return (
    <div data-export-root className="flex w-full flex-col" style={{ width: data.exportWidth, gap: 20 }}>
      {levels.map((lv) => (
        <div
          key={lv.num}
          className="flex w-full rounded-xl border border-solid bg-background"
          style={{
            gap: 20,
            padding: '20px 24px',
            borderColor: hsla(lv.color, 0.3),
            borderLeftWidth: 6,
            borderLeftColor: lv.color,
          }}
        >
          {/* Médaillon : numéro + icône, teinte du niveau. */}
          <div className="flex shrink-0 flex-col items-center" style={{ gap: 4 }}>
            <span
              className="inline-flex items-center justify-center rounded-full font-bold"
              style={{ width: MEDALLION, height: MEDALLION, backgroundColor: hsla(lv.color, 0.14), color: lv.color, ...px(NUM_SIZE) }}
            >
              {lv.num}
            </span>
            <FeatherIcon kind={lv.icon} size={28} color={lv.color} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 8 }}>
            <span className="font-bold text-foreground" style={px(NAME_SIZE)}>
              {lv.name}
            </span>
            <span className="text-foreground/85" style={px(GOAL_SIZE)}>
              {lv.goal}
            </span>
            <div className="flex flex-wrap" style={{ gap: 8 }}>
              {lv.tools.map((t) => (
                <span
                  key={t}
                  className="font-bold"
                  style={{
                    ...px(CHIP_SIZE),
                    fontFamily: MONO,
                    padding: '4px 12px',
                    borderRadius: 9999,
                    whiteSpace: 'nowrap',
                    backgroundColor: 'hsl(var(--muted))',
                    color: lv.color,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap" style={{ gap: 8 }}>
              {lv.examples.map((ex) => (
                <span
                  key={ex}
                  className="text-foreground/85"
                  style={{
                    ...px(CHIP_SIZE),
                    padding: '4px 12px',
                    borderRadius: 9999,
                    whiteSpace: 'nowrap',
                    border: '1px solid hsl(var(--muted-foreground))',
                  }}
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
