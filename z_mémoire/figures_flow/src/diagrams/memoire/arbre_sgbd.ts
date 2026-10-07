import type { DiagramDefinition } from '../../types'

/**
 * Choix du SGBD — arbre de décision (2.4.4).
 *
 * Un raisonnement d’élimination en 3 étapes qui aboutit à MySQL 8 : chaque
 * nœud pose une vraie question binaire, les pastilles Oui/Non sont sur les
 * traits. La branche survivante descend tout droit au centre
 * (Q1→Q2→Q3→MySQL 8) ; les trois feuilles écartées sortent à gauche, à leur
 * niveau. Libellés sourcés du texte : tableau de 2.4.4 (forces/limites des
 * quatre options) et § « MySQL 8 a été retenu… » (JPA/Hibernate, Flyway,
 * « fragilité accrue »).
 *
 * Arêtes `type: 'traitement'` posées par arête : le défaut `relationship`
 * (catégorie `memoire`) afficherait des cartes de cardinalité avec boutons ↺,
 * hors sujet ici. `data.label` donne la pastille Oui/Non native de
 * `TraitementEdge`. Pas de `straight` : la règle « quelles figures sont
 * droites » (`startsWith('mct')` dans `DiagramCanvas`) est inchangée — en
 * `smoothstep`, les descentes centrées restent droites et les sorties
 * latérales font des coudes orthogonaux, ce qui convient à un arbre.
 * Tous les handles sont déclarés : `bottom` en source, `top` en cible.
 */

const Q_WIDTH = 480
const Q_X = 560
const LEAF_WIDTH = 420
const LEAF_X = 60
const KEPT_WIDTH = 560
const KEPT_X = 520

const question = (id: string, y: number, label: string) => ({
  id,
  type: 'entity' as const,
  position: { x: Q_X, y },
  style: { width: Q_WIDTH },
  data: {
    label,
    variant: 'decision' as const,
    decisionKind: 'question' as const,
    // Toujours égal à `Q_WIDTH` (cf. `exportWidth`).
    exportWidth: Q_WIDTH,
  },
})

const leaf = (
  id: string,
  y: number,
  label: string,
  decisionLogo: 'mysql' | 'postgresql' | 'mongodb' | 'mariadb',
  decisionNote: string,
) => ({
  id,
  type: 'entity' as const,
  position: { x: LEAF_X, y },
  style: { width: LEAF_WIDTH },
  data: {
    label,
    variant: 'decision' as const,
    decisionKind: 'out' as const,
    decisionLogo,
    decisionNote,
    // Toujours égal à `LEAF_WIDTH` (cf. `exportWidth`).
    exportWidth: LEAF_WIDTH,
  },
})

const edge = (id: string, source: string, target: string, label: string, onAxis?: boolean) => ({
  id,
  source,
  target,
  sourceHandle: 'bottom',
  targetHandle: 'top',
  type: 'traitement' as const,
  // Pastilles à 22 px : le 10 px par défaut est calibré pour le MCT (12 px),
  // invisible à côté du texte à 24 px de l’arbre.
  // `noAnchorOffset` sur les descentes survivantes : elles partagent l’ancrage
  // `bottom` avec la sortie latérale (±14 px), ce qui coudait la descente —
  // elles restent pile sur l’axe, la pastille tombe sur le trait.
  data: { label, labelPx: 22, ...(onAxis ? { noAnchorOffset: true } : {}) },
})

export const arbreSgbd: DiagramDefinition = {
  id: 'memoire-arbre-sgbd',
  title: 'Choix du SGBD — arbre de décision',
  category: 'memoire',
  domain: '2.4.4 — Choix du système de gestion de base de données',
  nodes: [
    question(
      'q1',
      40,
      'Domaine fortement relationnel avec contraintes d’intégrité fortes ?',
    ),
    leaf(
      'leaf-mongo',
      400,
      'MongoDB',
      'mongodb',
      'Schéma flexible, mais contraintes à réimplémenter applicativement : fragilité accrue.',
    ),
    question(
      'q2',
      400,
      'Besoin de types avancés (JSONB, extensions) avec un bénéfice métier immédiat ?',
    ),
    leaf(
      'leaf-pg',
      760,
      'PostgreSQL',
      'postgresql',
      'Surdimensionné : complexité d’exploitation sans gain métier immédiat.',
    ),
    question(
      'q3',
      760,
      'MariaDB apporte-t-il un gain fonctionnel décisif par rapport à MySQL 8 ?',
    ),
    leaf(
      'leaf-maria',
      1120,
      'MariaDB',
      'mariadb',
      'Compatible, mais aucun gain décisif.',
    ),
    {
      id: 'leaf-mysql',
      type: 'entity' as const,
      position: { x: KEPT_X, y: 1120 },
      style: { width: KEPT_WIDTH },
      data: {
        label: 'MySQL 8',
        variant: 'decision' as const,
        decisionKind: 'kept' as const,
        decisionLogo: 'mysql' as const,
        decisionNote:
          'Meilleur compromis : maturité, intégration JPA/Flyway, coût d’exploitation accessible.',
        // Toujours égal à `KEPT_WIDTH` (cf. `exportWidth`).
        exportWidth: KEPT_WIDTH,
      },
    },
  ],
  edges: [
    edge('e-q1-mongo', 'q1', 'leaf-mongo', 'Non'),
    edge('e-q1-q2', 'q1', 'q2', 'Oui', true),
    edge('e-q2-pg', 'q2', 'leaf-pg', 'Oui'),
    edge('e-q2-q3', 'q2', 'q3', 'Non', true),
    edge('e-q3-maria', 'q3', 'leaf-maria', 'Non'),
    // Conclusion par élimination, pas réponse Oui/Non — « Oui » provisoire,
    // à rejuger à l’écran avec le demandeur.
    edge('e-q3-mysql', 'q3', 'leaf-mysql', 'Oui', true),
  ],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
