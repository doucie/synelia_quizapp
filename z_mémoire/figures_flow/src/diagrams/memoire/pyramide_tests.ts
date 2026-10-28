import type { DiagramDefinition } from '../../types'

/**
 * Pyramide des tests des besoins de validation (§7.1).
 *
 * Verbatim de `figures_html/pyramide_tests.html` : 3 niveaux (E2E /
 * Intégration / Unitaires) et leurs callouts d'outillage. Les effectifs
 * (~15/45/120 specs) sont les ordres de grandeur **estimés** du source,
 * assumés ; le dépôt porte le sourcing fin (~30 classes backend, 2 collections
 * Postman, ~22 specs front — voir `niveaux_tests.ts`, laissée au catalogue).
 * Les gradients du source deviennent des aplats unis : jetons palette
 * documentaire `--fig-*` (danger/warning/success, cf. fig. 8/23) — addenda
 * 20261020 : jetons de fill gelés verbatim dans les deux modes, encres
 * d'accent et `--fig-on-fill` gérés par `TestsPyramidNode`. Le panneau
 * légende est retiré (redondant des callouts, ~180/JaCoCo/CI-CD portés par le
 * texte). Nœud composite unique, zéro arête (voir `TestsPyramidNode`).
 */

const W = 1248

const E2E = 'var(--fig-danger)'
const INT = 'var(--fig-warning)'
const UNIT = 'var(--fig-success)'

export const pyramideTests: DiagramDefinition = {
  id: 'memoire-pyramide-tests',
  title: 'Stratégie de tests — pyramide des tests',
  category: 'memoire',
  domain: '7.1 — Stratégie de tests',
  nodes: [
    {
      id: 'tpyramid',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Stratégie de tests — Pyramide des tests',
        variant: 'tpyramid' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        tpyramidLevels: [
          {
            name: 'E2E',
            count: '~15 scénarios',
            color: E2E,
            callout: {
              title: 'E2E · End-to-End',
              lines: ['Postman Collections · Newman CLI', 'Parcours candidat, recruteur, admin', 'Flux critiques'],
              tail: 'Lents · Peu nombreux · Coûteux',
            },
          },
          {
            name: 'Intégration',
            count: '~45 specs',
            color: INT,
            callout: {
              title: 'Intégration · API',
              lines: ['JUnit 5 · MockMvc · TestContainers', '@SpringBootTest · REST · services métier', 'Sécurité endpoints · validation DTO'],
              tail: 'Équilibre vitesse / couverture',
            },
          },
          {
            name: 'Unitaires',
            count: '~120 specs',
            color: UNIT,
            callout: {
              title: 'Unitaires',
              lines: ['JUnit 5 · Mockito · AssertJ', 'JaCoCo ≥ 75% · Services · mappers', 'Règles métier · calculs score'],
              tail: 'Rapides · Nombreux · Forte couverture',
            },
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
