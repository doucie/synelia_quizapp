import type { DiagramDefinition } from '../../types'

/**
 * Stratégie de tests — trois niveaux outillés (7.1).
 *
 * Les trois niveaux du texte, dans son ordre : unitaires/slice (stabiliser
 * le code), intégration (sécuriser les échanges entre couches), fonctionnel
 * (valider les parcours réels). Chaque bande porte son objectif, ses outils
 * et des exemples en langage courant, sourcés du dépôt réel : ~30 classes
 * de tests backend (`*BusinessTest`, `*ControllerTest`, contrat JSON,
 * critères repository), 2 collections Postman, ~22 specs frontend
 * (`quiz.spec`, `apply-position.spec`, `verify-email.spec`…).
 *
 * Bandes ÉGALES : la figure ne mesure pas l’effort, elle montre
 * l’organisation — pas une pyramide des volumes. Nœud composite unique,
 * zéro arête (voir `LevelsNode`).
 */

const W = 1100

export const niveauxTests: DiagramDefinition = {
  id: 'memoire-niveaux-tests',
  title: 'Stratégie de tests — trois niveaux',
  category: 'memoire',
  domain: '7.1 — Stratégie de tests',
  nodes: [
    {
      id: 'levels',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Trois niveaux de validation',
        variant: 'levels' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        testLevels: [
          {
            num: '1',
            name: 'Tests unitaires / slice',
            icon: 'tool',
            color: 'hsl(240, 100%, 40%)',
            goal: 'Stabiliser le code : permissions, formulaires et versions, évaluations, tokens, contrats JSON.',
            tools: ['mvnw test'],
            examples: ['permissions', 'formulaires', 'évaluations', 'tokens', 'contrats JSON'],
          },
          {
            num: '2',
            name: 'Tests d’intégration',
            icon: 'link',
            color: 'hsl(128, 100%, 40%)',
            goal: 'Sécuriser les échanges entre couches : endpoints REST, contrats, scénarios rejouables.',
            tools: ['tests contrôleurs', 'Postman'],
            examples: ['campagnes', 'quiz public', 'entretiens', 'notifications'],
          },
          {
            num: '3',
            name: 'Tests fonctionnels',
            icon: 'monitor',
            color: 'hsl(30, 100%, 40%)',
            goal: 'Valider les parcours réels : candidature, quiz, suivi, du point de vue utilisateur.',
            tools: ['spec.ts', 'recette manuelle'],
            examples: ['quiz public', 'candidature', 'vérification email', 'suivi'],
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
