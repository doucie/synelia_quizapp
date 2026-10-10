import type { DiagramDefinition } from '../../types'

/**
 * Merise et UML — inventaires équilibrés (4.2.1 Démarche Merise retenue).
 *
 * PAS de vainqueur : deux panneaux Atouts/Limites (4+4 chacun), sans
 * surlignage de camp, sans chevron. Le verdict est une ligne de choix
 * contextuel (données relationnelles → Merise ; objet, agile, comportements
 * → UML) — « on verra ce que ça donne », sans avantager Merise a priori.
 *
 * Contenu sourcé des analyses croisées (Claude/Gemini) et de la table 4.2.1 :
 * formulations courtes, même sens. La ligne « Maîtrise pédagogique » de la
 * table n’est pas reprise (retour demandeur : l’aspect francophone vit dans
 * le texte du mémoire, via l’atout « enseignement/administration
 * francophones »).
 *
 * Nœud composite unique, zéro arête (voir `VersusNode`) : Merise navy à
 * gauche, UML bleu à droite, verdict neutre en bandeau.
 */

const NAVY = 'hsl(222, 65%, 30%)'
const BLUE = 'hsl(210, 100%, 40%)'

const W = 1400

export const meriseUml: DiagramDefinition = {
  id: 'memoire-merise-uml',
  title: 'Merise et UML — atouts et limites',
  category: 'memoire',
  domain: '4.2.1 — Démarche Merise retenue',
  nodes: [
    {
      id: 'versus',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Atouts et limites de Merise et UML',
        variant: 'versus' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        versusPanels: [
          {
            title: 'Merise',
            color: NAVY,
            solid: true,
            strengths: [
              'MCD → MLD → SQL quasi mécanique, sans redondance.',
              'Cardinalités et normalisation : garde-fous des règles de gestion.',
              'Accessible aux équipes métier et décideurs non techniques.',
              'Vivante dans l’enseignement et l’administration francophones.',
            ],
            weaknesses: [
              'Pas d’objet : ni héritage, ni méthodes, ni polymorphisme.',
              'Cycle en V rigide, mal à l’aise avec l’agilité.',
              'Quasi inconnue hors francophonie : outils et ressources rares.',
              'MCT/MOT peu pratiqués sur le terrain.',
            ],
          },
          {
            title: 'UML',
            color: BLUE,
            solid: true,
            strengths: [
              'Standard international (OMG), compris par toute équipe.',
              'Pensé objet : classes, héritage, interfaces, méthodes.',
              'Besoins → architecture (UC, séquence, composants, déploiement).',
              'Outillé (génération de code) et compatible agile.',
            ],
            weaknesses: [
              'Bavard : facile de produire des diagrammes sans valeur.',
              'Classes ≠ MPD : mapping objet-relationnel à trancher.',
              'Pas de normalisation intégrée : moins de garde-fous données.',
              'Large et flexible : usages dispersés sans conventions.',
            ],
          },
        ],
        versusVerdict: [
          'Données relationnelles → Merise',
          'objet, agile, comportements → UML',
        ],
      },
    },
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
