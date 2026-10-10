import type { DiagramDefinition } from '../../types'

/**
 * Merise/UML — balance 3-3 projet (4.2.1 Démarche Merise retenue).
 *
 * 6 points projet-spécifiques, 3 vers Merise, 3 vers UML : le vrai visage du
 * projet (données lourdes + Java objet). Chaque ligne montre vers quel camp
 * penche le point, avec son intensité — c’est ce sens de la balance qui fait
 * la valeur de la figure (v1 : forme juste, fond biaisé 4-1 + verdict
 * triomphaliste ; v2 : fond équilibré mais aveugle, simple répétition de
 * texte). Ici : forme v1, fond 3-3, verdict neutre.
 *
 * Textes validés avec le demandeur (même sens que le matériau équilibré).
 * Nœud composite unique, zéro arête (voir `VersusNode`) : Merise navy à
 * gauche, UML bleu à droite, point projet au centre ; chevrons vers le camp
 * du penchant ; verdict neutre en bandeau.
 */

const W = 1320

export const meriseUml: DiagramDefinition = {
  id: 'memoire-merise-uml',
  title: 'Merise / UML — balance 3-3 projet',
  category: 'memoire',
  domain: '4.2.1 — Démarche Merise retenue',
  nodes: [
    {
      id: 'versus',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Balance Merise / UML pour ce projet',
        variant: 'versus' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        versusRows: [
          { criterion: 'Base relationnelle', left: 'MCD → MLD → SQL mécanique, sans redondance', right: 'Mapping objet-relationnel à trancher', winner: 'left', strong: true },
          { criterion: 'Règles de gestion', left: 'Cardinalités et normalisation garde-fous', right: 'Pas de normalisation intégrée', winner: 'left', strong: true },
          { criterion: 'Équipe métier', left: 'Accessible aux non-techniciens', right: 'Courbe d’apprentissage, jargon objet', winner: 'left', strong: false },
          { criterion: 'Code objet', left: 'Pas d’héritage ni de méthodes', right: 'Java/Spring : classes, JPA, interfaces', winner: 'right', strong: true },
          { criterion: 'Comportements dynamiques', left: 'MCT/MOT peu pratiqués', right: 'Séquences, UC, états, activités', winner: 'right', strong: true },
          { criterion: 'Agilité et outillage', left: 'Cycle en V rigide', right: 'Génération de code, itérations courtes', winner: 'right', strong: false },
        ],
        versusVerdict: [
          'Base et règles → Merise',
          'code objet, agile, comportements → UML',
        ],
      },
    },
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
