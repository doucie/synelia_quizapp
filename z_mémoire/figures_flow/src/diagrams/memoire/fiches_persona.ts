import type { DiagramDefinition } from '../../types'

/**
 * Fiches persona des parties prenantes (3.1.1).
 *
 * Quatre cartes en grille 2×2, structure strictement identique (même
 * `minHeight`, le plus haut mesuré) : avatar illustré, nom du rôle, trois
 * blocs (attentes / risque métier / conséquence conception). Textes verbatim
 * du tableau de 3.1.1. Teintes des rôles reprises de la figure 1 (SA `210`,
 * A `240`, R `285`, C `330`) : les deux figures parlent des mêmes acteurs.
 * Avatars DiceBear « Notionists » (CC0), même style graphique, fond teinté
 * par rôle — volontairement illustrés, là où la figure 1 restait sobre
 * (cercles à initiales).
 */

const CARD_WIDTH = 560
const CARD_GAP = 40
// Relevé en validation : le recruteur (texte le plus long) mesure ~770 px,
// les autres 700–735. Plancher commun à 780 : structure strictement identique,
// avec 10 px de marge (précédent des planchers de l’organigramme : un plancher
// issu d’une mesure rend la géométrie exacte).
const CARD_MIN_HEIGHT = 780

const persona = (
  id: string,
  col: number,
  row: number,
  label: string,
  personaAvatar: 'candidat' | 'recruteur' | 'admin' | 'superadmin',
  personaColor: string,
  personaAttentes: string,
  personaRisque: string,
  personaConception: string,
) => ({
  id,
  type: 'entity' as const,
  position: { x: col * (CARD_WIDTH + CARD_GAP), y: row * (CARD_MIN_HEIGHT + CARD_GAP) },
  style: { width: CARD_WIDTH },
  data: {
    label,
    variant: 'persona' as const,
    personaAvatar,
    personaColor,
    personaAttentes,
    personaRisque,
    personaConception,
    minHeight: CARD_MIN_HEIGHT,
    // Toujours égal à `CARD_WIDTH` (cf. `exportWidth`).
    exportWidth: CARD_WIDTH,
  },
})

export const fichesPersona: DiagramDefinition = {
  id: 'memoire-fiches-persona',
  title: 'Parties prenantes — fiches persona',
  category: 'memoire',
  domain: '3.1.1 — Parties prenantes et périmètre étudié',
  nodes: [
    persona(
      'persona-candidat',
      0,
      0,
      'Candidat',
      'candidat',
      'hsl(330, 100%, 40%)',
      'Postuler sans friction, comprendre les étapes, conserver un suivi autonome.',
      'Abandon en cours de parcours, incompréhension des statuts, perte de confiance dans le processus.',
      'Surface publique simple, sécurisée, guidée et clairement séparée des écrans internes.',
    ),
    persona(
      'persona-recruteur',
      1,
      0,
      'Recruteur / évaluateur',
      'recruteur',
      'hsl(285, 100%, 40%)',
      'Piloter les campagnes, filtrer les dossiers, collaborer sur les entretiens et les évaluations.',
      'Décisions prises hors contexte, dispersion de l’information, difficulté à partager l’évaluation.',
      'Vues consolidées par campagne, historique d’avancement et permissions contextualisées.',
    ),
    persona(
      'persona-admin',
      0,
      1,
      'Administrateur',
      'admin',
      'hsl(240, 100%, 40%)',
      'Gérer les utilisateurs, les référentiels et le paramétrage d’exploitation.',
      'Dérive des droits, données incohérentes, configuration fragile.',
      'Référentiels administrables, contrôle d’accès fin et traçabilité des actions techniques.',
    ),
    persona(
      'persona-superadmin',
      1,
      1,
      'Super administrateur',
      'superadmin',
      'hsl(210, 100%, 40%)',
      'Gouverner la plateforme, superviser la sécurité et maintenir la configuration globale.',
      'Mauvaise gouvernance des rôles, défaut de supervision ou de paramétrage global.',
      'Séparation nette entre administration métier et administration de plateforme.',
    ),
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
