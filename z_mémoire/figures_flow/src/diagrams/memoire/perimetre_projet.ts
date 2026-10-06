import type { DiagramDefinition } from '../../types'

/**
 * Frontières du projet — périmètre couvert et exclusions assumées (v1).
 *
 * Le cadre domine la composition : bandeau-titre navy pleine largeur, bordure
 * épaisse, six lignes incluses à hauteur égale. Les cinq exclusions sont en
 * retrait (plus petites, neutres, sans bordure) : secondaires, mais lisibles.
 * Aucune ligne de liaison — la secondarité suffit, et des pointillés se
 * liraient comme des flux.
 *
 * Contenu aligné sur le mémoire : les six inclus couvrent BF-01 à BF-08
 * (l’item campagnes fusionne campagnes, formulaires versionnés et pipeline).
 * La paie et les contrats, pourtant exclus en 1.3.3, sont absents de la figure
 * sans rejoindre les inclus : leur gestion est une piste future assumée, et la
 * figure reste volontairement floue à ce sujet. Traçabilité et audit sont
 * transverses, portés par les décisions : pas d’item séparé.
 */

const MARGIN = 80
const FRAME_WIDTH = 820
const GAP = 60
const EXCLUDED_WIDTH = 640
const EXCLUDED_X = MARGIN + FRAME_WIDTH + GAP
/** Pas vertical des exclus : hauteur de ligne 62 + gouttière 14. */
const EXCLUDED_PITCH = 76
/**
 * Centrage vertical de la colonne des exclus sur le cadre : cadre 572 −
 * colonne 366 (5×62 + 4×14), divisé par 2. Les deux valeurs sont
 * arithmétiques, pas mesurées : le centrage ne peut pas dériver.
 *
 * La paie et les contrats ont été retirés des exclus sans rejoindre les
 * inclus : leur gestion (comme celle des entreprises) est une piste future
 * assumée, et la figure reste volontairement floue à ce sujet.
 */
const EXCLUDED_Y0 = 103
/** Légende sous le cadre : cadre ≈ 572 px + respiration 28. */
const CAPTION_Y = 600

const INCLUDED = [
  'Utilisateurs, accès et référentiels',
  'Campagnes, formulaires et pipeline',
  'Candidatures et suivi candidat',
  'Quiz technique et correction',
  'Entretiens, évaluations et décisions',
  'Notifications et pilotage',
] as const

const EXCLUDED = [
  'Intégration directe avec les job boards',
  'Visioconférence intégrée',
  'Application mobile native',
  'Multilingue',
  'Matching automatique par IA',
] as const

export const perimetreProjet: DiagramDefinition = {
  id: 'memoire-perimetre-projet',
  title: 'Frontières du projet',
  category: 'memoire',
  domain: '1.3.3 — Frontières du projet',
  nodes: [
    {
      id: 'perimetre-cadre',
      type: 'entity' as const,
      position: { x: MARGIN, y: 0 },
      style: { width: FRAME_WIDTH },
      data: {
        label: 'Périmètre couvert — SyneliaQuizApp v1',
        variant: 'scope' as const,
        scopeKind: 'frame',
        scopeItems: [...INCLUDED],
        // Toujours égal à `FRAME_WIDTH` (cf. `exportWidth`).
        exportWidth: FRAME_WIDTH,
      },
    },
    ...EXCLUDED.map((item, index) => ({
      id: `exclu-${index}`,
      type: 'entity' as const,
      position: { x: EXCLUDED_X, y: EXCLUDED_Y0 + index * EXCLUDED_PITCH },
      style: { width: EXCLUDED_WIDTH },
      data: {
        label: item,
        variant: 'scope' as const,
        scopeKind: 'item' as const,
        scopeTone: 'excluded' as const,
        // Toujours égal à `EXCLUDED_WIDTH` (cf. `exportWidth`).
        exportWidth: EXCLUDED_WIDTH,
      },
    })),
    {
      id: 'perimetre-legende',
      type: 'entity' as const,
      position: { x: MARGIN, y: CAPTION_Y },
      style: { width: FRAME_WIDTH },
      data: {
        label: 'Version 1 — cœur du processus de recrutement.',
        variant: 'scope' as const,
        scopeKind: 'caption' as const,
        // Toujours égal à `FRAME_WIDTH` (cf. `exportWidth`).
        exportWidth: FRAME_WIDTH,
      },
    },
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
