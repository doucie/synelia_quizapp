import type { DiagramDefinition } from '../../types'

/**
 * Acteurs et responsabilités — cercles concentriques (3.2.9, tableau 1).
 *
 * Le périmètre de contrôle de chaque acteur EN CONTIENT un autre : centre =
 * Candidat (périmètre restreint), extérieur = Super admin (englobant). Ne pas
 * inverser — ici centre ≠ important.
 *
 * Cible le **premier** tableau (Acteur/Opérations/Données/Niveau de
 * contrôle) : le second (Oui/Non/Partiel) est déjà traité en matrice à
 * pastilles. Opérations et données raccourcies (le tableau porte des listes
 * longues) ; niveaux de contrôle verbatim.
 *
 * Nœud composite unique, zéro arête (voir `RingsNode`) : disques SVG en
 * transparence décroissante vers l’extérieur, rôle + niveau sur chaque
 * anneau, 4 callouts combinés autour.
 */

const W = 1500

export const anneauxActeurs: DiagramDefinition = {
  id: 'memoire-anneaux-acteurs',
  title: 'Acteurs et responsabilités — périmètres englobants',
  category: 'memoire',
  domain: '3.2.9 — Matrice acteurs et responsabilités',
  nodes: [
    {
      id: 'anneaux',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Périmètres de contrôle des acteurs',
        variant: 'rings' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        rings: [
          {
            role: 'Candidat',
            control: 'Contrôle limité à son parcours personnel.',
            color: 'hsl(330, 100%, 40%)',
            initial: 'C',
            ops: ['postuler', 'vérifier son email', 'passer un quiz', 'suivre sa candidature'],
            items: ['son propre dossier', 'ses réponses', 'ses statuts publics'],
          },
          {
            role: 'Recruteur',
            control: 'Contrôle opérationnel contextualisé par campagne et par entité.',
            color: 'hsl(285, 100%, 40%)',
            initial: 'R',
            ops: ['créer une campagne', 'planifier un entretien', 'évaluer', 'décider'],
            items: ['campagnes assignées', 'candidatures', 'évaluations', 'décisions'],
          },
          {
            role: 'Administrateur',
            control: 'Contrôle d’administration métier.',
            color: 'hsl(240, 100%, 40%)',
            initial: 'A',
            ops: ['gérer utilisateurs', 'référentiels', 'permissions'],
            items: ['utilisateurs', 'groupes métier', 'référentiels', 'paramètres'],
          },
          {
            role: 'Super administrateur',
            control: 'Contrôle maximal et structurant.',
            color: 'hsl(210, 100%, 40%)',
            initial: 'SA',
            ops: ['superviser la plateforme', 'réglages globaux', 'gouvernance de sécurité'],
            items: ['configuration globale', 'rôles système', 'supervision transverse'],
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
