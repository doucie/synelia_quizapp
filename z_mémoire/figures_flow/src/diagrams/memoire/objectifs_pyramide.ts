import type { DiagramDefinition } from '../../types'

/**
 * Figure 4 — Vraie pyramide des objectifs du projet (§1.4.1).
 *
 * Vrai triangle (motif MoscowNode), apex = « Piloter par la donnée » annoté
 * `perspective` (conception v2 après refonte). Couleurs = jetons `--fig-*`
 * (navy/success/warning/secondary, sommet → socle — voir
 * `ObjectifsPyramidNode`).
 */
const W = 720

export const objectifsPyramide: DiagramDefinition = {
  id: 'memoire-objectifs-pyramide',
  title: 'Pyramide des objectifs du projet',
  category: 'memoire',
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
