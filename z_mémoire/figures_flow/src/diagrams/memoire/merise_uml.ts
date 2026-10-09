import type { DiagramDefinition } from '../../types'

/**
 * Merise vs UML — arbitrage nuancé (4.2.1 Démarche Merise retenue).
 *
 * PAS un vainqueur unique : Merise 4 lignes (2 nettes), UML 1 nette, 1
 * neutre. L’intensité du surlignage porte la nuance — si les 6 lignes avaient
 * l’air également tranchées, le schéma mentirait.
 *
 * Libellés sourcés du brief (versions courtes de la table 4.2.1). Nœud
 * composite unique, zéro arête (voir `VersusNode`) : Merise navy à gauche,
 * UML bleu clair à droite, critère au centre ; chevrons vers le camp gagnant ;
 * verdict en bandeau (Merise = colonne vertébrale, UML = complément flux).
 */

const W = 1320

export const meriseUml: DiagramDefinition = {
  id: 'memoire-merise-uml',
  title: 'Merise vs UML — arbitrage nuancé',
  category: 'memoire',
  domain: '4.2.1 — Démarche Merise retenue',
  nodes: [
    {
      id: 'versus',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Arbitrage Merise / UML par critère',
        variant: 'versus' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        versusRows: [
          { criterion: 'Nature de la méthode', left: 'Méthode systémique orientée SI', right: 'Langage orienté objet, indépendant d’une méthode', winner: null, strong: false },
          { criterion: 'Découpage proposé', left: 'Séparation données/traitements, 3 niveaux', right: 'Diagrammes sans démarche imposée', winner: 'left', strong: false },
          { criterion: 'Domaines riches en données', left: 'Très forte (MCD/MLD/MPD rigoureux)', right: 'Possible mais sans rigueur des cardinalités', winner: 'left', strong: true },
          { criterion: 'Comportements dynamiques', left: 'Couverte mais formalisme peu répandu', right: 'Très riche (séquences, états, UC)', winner: 'right', strong: true },
          { criterion: 'Maîtrise pédagogique', left: 'Largement enseignée en école ivoirienne', right: 'Maîtrisée mais usage dispersé', winner: 'left', strong: false },
          { criterion: 'Compatibilité projet', left: 'Excellente — structure autour de la base, pivot du système', right: 'Pertinente en complément pour les flux', winner: 'left', strong: true },
        ],
        versusVerdict: [
          'Merise = colonne vertébrale de la conception (MCD/MLD/MPD)',
          'UML = complément pour les flux et comportements dynamiques (séquences, cas d’utilisation)',
        ],
      },
    },
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
