import type { DiagramDefinition } from '../../types'

/**
 * Archivée : remplacée par la figure Claude `memoire-objectifs-gen`
 * (`src/diagrams/memoire/claude.ts`).
 *
 * Figure 4 — Vraie pyramide des objectifs du projet (§1.4.1), conception v3
 * (agrandissement : la v2 s'écroulait — la hauteur ne peut PAS venir des
 * bandes `flex:1` sans colonne de cartes ; ici hauteurs de bandes FIXES,
 * précédent « hauteurs fixes admises dans le nœud » de `perimetre_projet`).
 * Vrai triangle (motif MoscowNode), apex = « Piloter par la donnée » annoté
 * `perspective`. Couleurs = jetons `--fig-*` (navy/success/warning/secondary,
 * sommet → socle — voir `ObjectifsPyramidNode`).
 */
const W = 910

export const objectifsPyramide: DiagramDefinition = {
  id: 'memoire-objectifs-pyramide-archive',
  title: 'Pyramide des objectifs du projet',
  category: 'archive',
  domain: '1.4.1 — Objectifs généraux',
  nodes: [
    {
      id: 'objpyr',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Pyramide des objectifs du projet',
        variant: 'objpyr' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        objPyrLevels: [
          {
            title: 'Piloter par la donnée',
            lines: [],
            color: 'var(--fig-navy)',
            note: 'perspective',
          },
          {
            title: 'Faciliter la collaboration',
            lines: ['Évaluations multi-recruteurs', 'Coordination entretiens & décisions'],
            color: 'var(--fig-success)',
          },
          {
            title: 'Automatiser les évaluations',
            lines: ['Quiz configurable, correction automatique', 'Pré-filtrage plus objectif, jugement humain appuyé'],
            color: 'var(--fig-warning)',
          },
          {
            title: 'Digitaliser le processus',
            lines: ['Logique éclatée → plateforme centralisée', 'Moins de manipulations manuelles, parcours visible'],
            color: 'var(--fig-secondary)',
          },
        ],
      },
    },
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
