import type { DiagramDefinition } from '../../types'

/**
 * Dépôt — arborescence (6.3 Implémentation du frontend).
 *
 * La structure du dépôt comme ce qu’elle est littéralement : un arbre de
 * dossiers, pas un tableau déguisé — racine en haut à gauche, 3 branches en
 * dessous reliées par des traits en L. Noms en monospace (évoque du code),
 * descriptions en italique à droite.
 *
 * Logos fig. 5 (rappel direct, même stack à un autre moment du mémoire) :
 * Angular pour `quizapp_front/`, Spring Boot pour `quizapp/`, baleine Docker
 * officielle pour `docker-compose.yml`.
 *
 * Libellés sourcés du brief et de la table 6.3. Nœud composite unique, zéro
 * arête (voir `TreeNode`).
 */

const W = 1400

const ANGULAR = 'hsl(335, 100%, 40%)'
const SPRING = 'hsl(100, 100%, 40%)'
const DOCKER = 'hsl(210, 100%, 40%)'

export const arbreDepot: DiagramDefinition = {
  id: 'memoire-arbre-depot',
  title: 'Dépôt — arborescence',
  category: 'memoire',
  domain: '6.3 — Implémentation du frontend',
  nodes: [
    {
      id: 'depot',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Dépôt SyneliaQuizApp',
        variant: 'tree' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        treeTitle: 'Dépôt SyneliaQuizApp',
        treeBranches: [
          {
            name: 'quizapp/',
            sub: 'Application Spring Boot',
            logo: 'springboot' as const,
            color: SPRING,
            desc: 'Centralise la logique métier, la sécurité, les accès aux données, les endpoints REST et les services transverses.',
          },
          {
            name: 'quizapp_front/',
            sub: 'Application Angular',
            logo: 'angular' as const,
            color: ANGULAR,
            desc: 'Porte l’expérience utilisateur, les formulaires, les écrans métier et les flux de navigation.',
          },
          {
            name: 'docker-compose.yml',
            sub: 'Services d’infrastructure locale',
            logo: 'docker' as const,
            color: DOCKER,
            desc: 'Décrit les dépendances techniques utiles au développement et aux validations locales.',
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
