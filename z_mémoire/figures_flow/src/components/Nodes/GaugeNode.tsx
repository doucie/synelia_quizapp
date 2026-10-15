import type { EntityNodeData } from '../../types'
import { FeatherIcon } from './icons'

/**
 * Couverture fonctionnelle par module (figure du mémoire, 8.2
 * Fonctionnalités implémentées) : le tableau en jauges — une ligne par
 * module, remplissage selon le niveau qualitatif, synthèse en dessous.
 *
 * Nœud composite unique, zéro arête React Flow (précédent `LevelsNode`,
 * fig. 17) : 6 lignes en flux (hauteurs auto), seule la largeur est posée
 * (`exportWidth`), jamais `height` (invariant n°1). Aucune `<Handle>`.
 *
 * Deux longueurs de remplissage seulement, aucun pourcentage : les niveaux
 * sont qualitatifs (« Élevé », « Moyen à élevé »), un chiffre inventerait
 * une fausse précision. Icônes fig. 10 (grille BF) quand elles existent
 * (`megaphone`/`inbox`/`checksquare`/`calendar`) ; `sliders` (kanban fig. 13,
 * colonne Décisions et permissions) et `tool` en substitutions documentées —
 * ni balance ni engrenage n’existent chez Feather.
 */

const NAME_SIZE = 22
const LEVEL_SIZE = 18
const SUMMARY_SIZE = 16
const MEDALLION = 56
const GAUGE_H = 18
const GAUGE_W = 300

const GREEN = 'hsl(128, 100%, 40%)'
const AMBER = 'hsl(30, 100%, 40%)'

/** Même convention que les autres figures d’impression : `--org-font-scale`
 * est déjà recopiée pendant l’export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

export default function GaugeNode({ data }: { data: EntityNodeData }) {
  const rows = data.gaugeRows ?? []
  return (
    <div data-export-root className="flex w-full flex-col" style={{ width: data.exportWidth, gap: 16 }}>
      {rows.map((row) => {
        const high = row.level === 'high'
        const accent = high ? GREEN : AMBER
        const label = high ? 'Élevé' : 'Moyen à élevé'
        return (
          <div
            key={row.name}
            className="flex w-full items-center rounded-xl border border-solid bg-background"
            style={{ gap: 20, padding: '16px 24px', borderColor: 'hsl(var(--muted-foreground))', borderWidth: 1 }}
          >
            <span
              className="inline-flex shrink-0 items-center justify-center rounded-full"
              style={{ width: MEDALLION, height: MEDALLION, backgroundColor: 'hsl(var(--muted))', color: accent }}
            >
              <FeatherIcon kind={row.icon} size={28} color={accent} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 4 }}>
              <span className="font-bold text-foreground" style={px(NAME_SIZE)}>
                {row.name}
              </span>
              <span className="text-foreground/85 italic" style={px(SUMMARY_SIZE)}>
                {row.summary}
              </span>
            </div>
            <div className="flex shrink-0 flex-col" style={{ gap: 6 }}>
              <div
                className="rounded-full"
                style={{ width: GAUGE_W, height: GAUGE_H, backgroundColor: 'hsl(var(--muted))' }}
              >
                <div
                  className="rounded-full"
                  style={{ width: high ? '88%' : '64%', height: '100%', backgroundColor: accent }}
                />
              </div>
              <span className="font-bold" style={{ ...px(LEVEL_SIZE), color: accent, textAlign: 'right' }}>
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
