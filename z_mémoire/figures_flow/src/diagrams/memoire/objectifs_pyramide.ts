import type { DiagramDefinition } from '../../types'

/**
 * Figure 4 — Pyramide des objectifs du projet (§1.4.1).
 *
 * Verbatim de `figures_html/pyramide_objectifs.html`, ordre sommet → socle
 * (4 Piloter … 1 Digitaliser, comme le source). La légende du source est
 * supprimée (redondante des bandes). Ordre des bandes d'affichage :
 * Piloter / Collaborer / Automatiser / Digitaliser. Couleurs = jetons
 * `--fig-*` (navy/success/warning/secondary, top → base — voir
 * `ObjectifsPyramidNode`).
 */
const W = 1240

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
            num: 4,
            title: 'Piloter par la donnée',
            items: [
              'KPIs de recrutement',
              'Analyse des sources',
              'Taux de conversion',
              'Amélioration continue',
            ],
          },
          {
            num: 3,
            title: 'Faciliter la collaboration',
            items: [
              'Évaluations multi-recruteurs',
              'Tableaux de bord partagés',
              'Notifications temps réel',
              'Traçabilité décisionnelle',
            ],
          },
          {
            num: 2,
            title: 'Automatiser les évaluations',
            items: [
              'Quiz paramétrables',
              'Correction automatique',
              'Pipeline configurable',
              'Relances et notifications',
              'Scoring objectif',
            ],
          },
          {
            num: 1,
            title: 'Digitaliser le processus de recrutement',
            items: [
              'Plateforme web centralisée',
              'Base candidats unique',
              'Gestion des campagnes',
              'Suppression Excel / emails',
              'Portail candidat autonome',
            ],
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
