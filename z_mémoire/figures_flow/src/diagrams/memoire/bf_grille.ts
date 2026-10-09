import type { DiagramDefinition } from '../../types'

/**
 * Besoins fonctionnels — grille de cartes à pictogrammes (3.2.8).
 *
 * 8 blocs fonctionnels groupés par nature (socle, parcours séquentiel,
 * transverse) : la grille 4×2 reste d’un seul tenant, **seule la teinte de
 * fond** code le groupe — pas de bandeau, pas de titre de section, pas de
 * bordure, pour la distinguer de la matrice de permissions. Les 8 cartes sont
 * strictement identiques : médaillon-icône, badge ID, nom, phrase-attente.
 *
 * Libellés sourcés de la matrice BF (3.2.8) : noms verbatim, phrases-attentes
 * raccourcies à l’essentiel sans changer le sens (la matrice porte des
 * phrases longues, incompatibles avec des cartes uniformes).
 *
 * Icônes Feather (même jeu que fig. 8-9), sauf BF-03 : pas de mégaphone chez
 * Feather → Heroicons outline (MIT), stroke normalisé (voir `icons.tsx`).
 * Zéro arête (précédent fig. 6) : aucune `<Handle>`.
 */

const PARCOURS = 'hsl(210, 100%, 40%)'
const TRANSVERSE = 'hsl(30, 100%, 40%)'

const CARD_W = 360
const CARD_X = [40, 440, 840, 1240]
const ROW_Y = [40, 400]
const CARD_MIN = 310

type BfIcon =
  | 'lock'
  | 'layers'
  | 'megaphone'
  | 'inbox'
  | 'checksquare'
  | 'calendar'
  | 'bell'
  | 'grid'

const card = (
  id: string,
  col: number,
  row: number,
  bfId: string,
  label: string,
  bfDesc: string,
  bfIcon: BfIcon,
  bfColor?: string,
) => ({
  id,
  type: 'entity' as const,
  position: { x: CARD_X[col], y: ROW_Y[row] },
  style: { width: CARD_W },
  data: {
    label,
    variant: 'bf' as const,
    bfId,
    bfDesc,
    bfIcon,
    bfColor,
    minHeight: CARD_MIN,
    // Toujours égal à `CARD_W` (cf. `exportWidth`).
    exportWidth: CARD_W,
  },
})

export const bfGrille: DiagramDefinition = {
  id: 'memoire-bf-grille',
  title: 'Besoins fonctionnels — grille de cartes',
  category: 'memoire',
  domain: '3.2.8 — Matrice synthétique des besoins fonctionnels',
  nodes: [
    card('bf01', 0, 0, 'BF-01', 'Authentification et droits', 'Sécuriser les accès, différencier les responsabilités.', 'lock'),
    card('bf02', 1, 0, 'BF-02', 'Référentiels', 'Données stables, administrables, réutilisables.', 'layers'),
    card('bf03', 2, 0, 'BF-03', 'Campagnes', 'Créer et piloter une campagne de bout en bout.', 'megaphone', PARCOURS),
    card('bf04', 3, 0, 'BF-04', 'Candidatures', 'Dossiers fiables, suivi autonome du candidat.', 'inbox', PARCOURS),
    card('bf05', 0, 1, 'BF-05', 'Quiz', 'Objectiver l’évaluation initiale.', 'checksquare', PARCOURS),
    card('bf06', 1, 1, 'BF-06', 'Entretiens et décisions', 'Coordonner la suite après le quiz.', 'calendar', PARCOURS),
    card('bf07', 2, 1, 'BF-07', 'Notifications', 'Informer les acteurs au moment utile.', 'bell', TRANSVERSE),
    card('bf08', 3, 1, 'BF-08', 'Pilotage', 'Visibilité pour les équipes RH.', 'grid', TRANSVERSE),
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
