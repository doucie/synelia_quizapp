import type { DiagramDefinition } from '../../types'

/**
 * Fonctionnalités implémentées — couverture par module en jauges (8.2).
 *
 * Le tableau § 8.2 en six lignes : une jauge par module, remplie selon le
 * niveau qualitatif (Élevé ×5, Moyen à élevé ×1), synthèse verbatim sous le
 * nom. Synthèses et niveaux repris du tableau, sans les raccourcir au-delà
 * du sens. Nœud composite unique, zéro arête (voir `GaugeNode`).
 */

const W = 1300

export const jaugesModules: DiagramDefinition = {
  id: 'memoire-jauges-modules',
  title: 'Fonctionnalités — couverture par module',
  category: 'memoire',
  domain: '8.2 — Fonctionnalités implémentées',
  nodes: [
    {
      id: 'gauges',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Couverture fonctionnelle par module',
        variant: 'gauge' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        gaugeRows: [
          {
            name: 'Campagnes et formulaires',
            icon: 'megaphone',
            level: 'high',
            summary: 'Création, configuration, partage d’accès, formulaires, versions, affectation.',
          },
          {
            name: 'Candidatures',
            icon: 'inbox',
            level: 'high',
            summary: 'Soumission publique, email, suivi, retrait, traitement recruteur.',
          },
          {
            name: 'Quiz technique',
            icon: 'checksquare',
            level: 'high',
            summary: 'Tentatives, chrono, randomisation, reprise, notation, correction.',
          },
          {
            name: 'Entretiens',
            icon: 'calendar',
            level: 'high',
            summary: 'Planification, réponse candidat, reprogrammation, archivage.',
          },
          {
            name: 'Évaluations et décisions',
            icon: 'sliders',
            level: 'high',
            summary: 'Critères, agrégats, décisions intermédiaires et finales, notifications.',
          },
          {
            name: 'Administration transverse',
            icon: 'tool',
            level: 'mid',
            summary: 'Permissions, configuration, emails, référentiels, supervision.',
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
