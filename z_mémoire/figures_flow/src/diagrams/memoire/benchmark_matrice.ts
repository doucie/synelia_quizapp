import type { DiagramDefinition } from '../../types'

/**
 * Matrice de benchmark — comparaison des solutions du marché (Fig. 7).
 *
 * Verbatim de `figures_html/matrice_benchmark.html` : 6 catégories,
 * 14 fonctionnalités, colonnes Workable / Greenhouse / HackerRank /
 * SyneliaQuizApp. Les précisions autrefois affichées dans la colonne Synelia
 * (« Logo, couleurs, description »…) sont retirées de la figure : elles restent
 * verbatim dans la source HTML. Nœud composite unique, zéro arête (voir
 * `BenchmarkNode`).
 */

const W = 1250

const yes = () => ({ tone: 'yes' as const, text: 'Oui' })
const partial = () => ({ tone: 'partial' as const, text: '~' })
const no = () => ({ tone: 'no' as const, text: 'Non' })

export const benchmarkMatrice: DiagramDefinition = {
  id: 'memoire-benchmark-matrice',
  title: 'Matrice de benchmark — solutions du marché',
  category: 'memoire',
  domain: 'Fig. 7 — Benchmark et positionnement',
  nodes: [
    {
      id: 'benchmark',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Matrice comparative des solutions de recrutement',
        variant: 'benchmark' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        benchmarkCols: ['Fonctionnalité', 'Workable', 'Greenhouse', 'HackerRank', 'SyneliaQuizApp'],
        benchmarkSections: [
          {
            title: 'Gestion des campagnes',
            rows: [
              { feature: 'Création de campagnes', values: [yes(), yes(), no(), yes()] },
              { feature: 'Pages publiques personnalisables', values: [yes(), yes(), no(), yes()] },
              { feature: 'Filtrage par métadonnées', values: [partial(), yes(), no(), yes()] },
            ],
          },
          {
            title: 'Quiz et évaluation technique',
            rows: [
              { feature: 'Quiz paramétrables', values: [no(), no(), yes(), yes()] },
              { feature: 'Correction automatique', values: [no(), no(), yes(), yes()] },
              { feature: 'Limite de temps par quiz', values: [no(), no(), yes(), yes()] },
            ],
          },
          {
            title: 'Pipeline et workflow',
            rows: [
              { feature: 'Pipeline configurable', values: [yes(), yes(), partial(), yes()] },
              { feature: "Changement d'étape automatique", values: [partial(), yes(), no(), yes()] },
            ],
          },
          {
            title: 'Entretiens et évaluation',
            rows: [
              { feature: "Planification d'entretiens", values: [yes(), yes(), no(), yes()] },
              { feature: "Grille d'évaluation multi-critères", values: [partial(), yes(), no(), yes()] },
            ],
          },
          {
            title: 'Gouvernance et sécurité',
            rows: [
              { feature: 'RBAC multi-niveaux', values: [partial(), partial(), no(), yes()] },
              { feature: 'Traçabilité et audit', values: [partial(), partial(), no(), yes()] },
            ],
          },
          {
            title: 'Déploiement et coût',
            rows: [
              { feature: 'Open source / auto-hébergé', values: [no(), no(), no(), yes()] },
              {
                feature: 'Coût annuel (500 candidats)',
                values: [
                  { tone: 'cost', text: '~6 000 €' },
                  { tone: 'cost', text: '~8 500 €' },
                  { tone: 'cost', text: '~4 000 €' },
                  { tone: 'yes', text: '~1 200 €' },
                ],
              },
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
