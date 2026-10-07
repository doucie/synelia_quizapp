import type { DiagramDefinition } from '../../types'

/**
 * Choix du SGBD — arbre de décision (2.4.4).
 *
 * Un raisonnement d’élimination en 3 étapes qui aboutit à MySQL 8 : chaque
 * nœud pose une vraie question binaire. La question n’a qu’**une seule
 * liaison**, vers son nœud Réponse (« Oui » / « Non ») ; c’est la réponse qui
 * porte les deux issues — la feuille écartée à gauche, la suite au centre.
 * Répondre à la question élimine d’office la feuille, le tag ÉCARTÉ porte ce
 * sens : aucune pastille sur les traits, les nœuds Réponse sont les étiquettes.
 * Libellés sourcés du texte : tableau de 2.4.4 (forces/limites des quatre
 * options) et § « MySQL 8 a été retenu… » (JPA/Hibernate, Flyway,
 * « fragilité accrue »).
 *
 * Arêtes `type: 'traitement'` posées par arête : le défaut `relationship`
 * (catégorie `memoire`) afficherait des cartes de cardinalité avec boutons ↺,
 * hors sujet ici. `smoothstep` conservé (règle `startsWith('mct')` inchangée) :
 * les descentes centrées restent droites, les sorties latérales font des
 * coudes orthogonaux. Tous les handles sont déclarés ; chaque handle ne porte
 * qu’une seule arête, donc l’offset d’ancrage partagé ne s’applique nulle
 * part — pas d’entrée dans les familles verticales d’`edgeAnchors.ts`
 * (réservées MCT/orga), pas de `noAnchorOffset`.
 */

const Q_WIDTH = 480
const Q_X = 560
const LEAF_WIDTH = 420
const LEAF_X = 60
const KEPT_WIDTH = 560
const KEPT_X = 520
const ANSWER_WIDTH = 160
const ANSWER_X = 800 - ANSWER_WIDTH / 2

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

const SURVIVOR_STROKE = 'hsl(128, 100%, 40%)'

const edge = (
  id: string,
  source: string,
  target: string,
  sourceHandle: string = 'bottom',
  targetHandle: string = 'top',
  tone: 'out' | 'kept' = 'kept',
) => ({
  id,
  source,
  target,
  sourceHandle,
  targetHandle,
  type: 'traitement' as const,
  // Sorties : tirets (élimination). Descentes survivantes : vert safe hue
  // (le chemin retenu). `isDashed` et `stroke` existent sur `TraitementEdge`,
  // ce dernier lu aussi par `OrgBusEdge` — défauts inchangés ailleurs.
  data: tone === 'out' ? { isDashed: true } : { stroke: SURVIVOR_STROKE },
})

const answer = (id: string, y: number, label: string) => ({
  id,
  type: 'entity' as const,
  position: { x: ANSWER_X, y },
  style: { width: ANSWER_WIDTH },
  data: {
    label,
    variant: 'decision' as const,
    decisionKind: 'answer' as const,
    // Toujours égal à `ANSWER_WIDTH` (cf. `exportWidth`).
    exportWidth: ANSWER_WIDTH,
  },
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
    answer('a1', 240, 'Oui'),
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
    answer('a2', 620, 'Non'),
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
    answer('a3', 980, 'Oui'),
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
    edge('e-q1-a1', 'q1', 'a1'),
    edge('e-a1-mongo', 'a1', 'leaf-mongo', 'left', 'top', 'out'),
    edge('e-a1-q2', 'a1', 'q2'),
    edge('e-q2-a2', 'q2', 'a2'),
    edge('e-a2-pg', 'a2', 'leaf-pg', 'left', 'top', 'out'),
    edge('e-a2-q3', 'a2', 'q3'),
    edge('e-q3-a3', 'q3', 'a3'),
    edge('e-a3-maria', 'a3', 'leaf-maria', 'left', 'top', 'out'),
    // Conclusion par élimination — le « Oui » de A3 reste provisoire,
    // à rejuger à l’écran avec le demandeur.
    edge('e-a3-mysql', 'a3', 'leaf-mysql'),
  ],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
