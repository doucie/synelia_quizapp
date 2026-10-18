import type { DiagramDefinition } from '../../types'

/**
 * Pyramide MoSCoW des besoins fonctionnels (Fig. 23).
 *
 * Verbatim de `figures_html/pyramide_moscow.html` : 4 niveaux de priorité
 * (MUST/SHOULD/COULD/WON'T — 18/12/8/5 besoins) et leurs tags. La pyramide est
 * conservée (pas de bandes égales) ; les gradients du source sont remplacés par
 * des aplats unis sémantiques (rouge 0 / orange 30 / bleu 200 / gris).
 * Nœud composite unique, zéro arête (voir `MoscowNode`).
 */

const W = 1370

// Couleurs de la palette documentaire (jetons --fig-*, version sombre dans
// `index.css`), échelle de priorité red/amber/navy/neutral comme fig. 8.
const MUST = 'var(--fig-danger)'
const SHOULD = 'var(--fig-warning)'
const COULD = 'var(--fig-secondary)'
const WONT = 'var(--fig-neutral)'

export const moscowPyramide: DiagramDefinition = {
  id: 'memoire-moscow-pyramide',
  title: 'Priorisation MoSCoW — pyramide des besoins du MVP',
  category: 'memoire',
  domain: 'Fig. 23 — Priorisation MoSCoW',
  nodes: [
    {
      id: 'moscow',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Priorisation fonctionnelle — Méthode MoSCoW',
        variant: 'moscow' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        moscowLevels: [
          {
            name: 'MUST HAVE',
            count: '18 besoins',
            color: MUST,
            tags: [
              'Candidature publique',
              'Quiz technique',
              'Pipeline configurable',
              'Gestion campagnes',
              'Authentification JWT',
              'RBAC permissions',
              'Évaluation entretiens',
              'Décision finale',
              'Emails transactionnels',
              'Dashboard recruteur',
            ],
          },
          {
            name: 'SHOULD HAVE',
            count: '12 besoins',
            color: SHOULD,
            tags: [
              'Dashboard admin',
              'Export CSV / Excel',
              'Notifications in-app',
              'Planification entretiens',
              'Logos personnalisables',
              'Recherche avancée',
            ],
          },
          {
            name: 'COULD HAVE',
            count: '8 besoins',
            color: COULD,
            tags: ['Mode hors-ligne quiz', 'Intégration LinkedIn', 'Gamification scores', 'Multi-langue FR/EN'],
          },
          {
            name: "WON'T HAVE",
            count: '5 besoins',
            color: WONT,
            tags: ['IA matching CV/offre', 'Vidéo-conférence intégrée', 'Signature électronique'],
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
