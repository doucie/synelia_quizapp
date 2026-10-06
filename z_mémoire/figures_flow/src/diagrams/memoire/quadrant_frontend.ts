import type { DiagramDefinition } from '../../types'

/**
 * Choix du framework frontend — quadrant de positionnement (2.4.3).
 *
 * Angular nettement dans le coin supérieur droit, React au centre-gauche à
 * hauteur moyenne, Vue.js en bas à gauche du centre : l’écart de position
 * encode l’écart d’argumentation du texte, il n’est pas arbitraire. Aucun
 * quadrant surligné — c’est la position d’Angular qui parle d’elle-même.
 *
 * Découpage marqueur/étiquette : la pastille (44 px) porte la donnée sur la
 * coordonnée exacte, le tag (300 px) vit dans le blanc voisin. Des cartes de
 * 380 px se chevauchaient ; pastilles et tags ne se touchent nulle part.
 * Le fond zoné (quatre teintes `SAFE_HUES` à alpha égal) habille le graphe
 * sans classer personne.
 *
 * Légendes alignées sur le tableau de 2.4.3, sans retouche. Teintes exactes
 * `SAFE_HUES` : Angular `335`, React `210`, Vue `166`. Le vert `166` en texte
 * 9 pt est une limite assumée (~2:1) : pastilles, bordures et barres portent
 * la teinte exacte, le texte des descriptions reste en encre `/85` pour
 * rester lisible.
 */

/** Graphe : carré 1000 × 1000, origine en haut à gauche. */
const PLOT_SIZE = 1000
const PLOT_X = 320
const PLOT_Y = 120
const DOT_DIAMETER = 44
/**
 * Tags larges pour tenir en deux lignes (trois pour Angular, le plus long) :
 * nom inline + légende dans le même flux, sans saut après le nom.
 */
const TAG_WIDTH = 540

const dot = (id: string, fx: number, fy: number, label: string, quadColor: string) => ({
  id,
  type: 'entity' as const,
  position: {
    x: PLOT_X + fx * PLOT_SIZE - DOT_DIAMETER / 2,
    y: PLOT_Y + fy * PLOT_SIZE - DOT_DIAMETER / 2,
  },
  style: { width: DOT_DIAMETER },
  data: {
    label,
    variant: 'quadrant' as const,
    quadKind: 'dot' as const,
    quadColor,
    // Toujours égal à `DOT_DIAMETER` (cf. `exportWidth`).
    exportWidth: DOT_DIAMETER,
  },
})

const tag = (
  id: string,
  x: number,
  y: number,
  label: string,
  quadColor: string,
  quadLegend: string,
) => ({
  id,
  type: 'entity' as const,
  position: { x, y },
  style: { width: TAG_WIDTH },
  data: {
    label,
    variant: 'quadrant' as const,
    quadKind: 'tag' as const,
    quadColor,
    quadLegend,
    // Toujours égal à `TAG_WIDTH` (cf. `exportWidth`).
    exportWidth: TAG_WIDTH,
  },
})

export const quadrantFrontend: DiagramDefinition = {
  id: 'memoire-quadrant-frontend',
  title: 'Choix du framework frontend',
  category: 'memoire',
  domain: '2.4.3 — Choix du framework frontend',
  nodes: [
    {
      // Rendu premier → dessous : axes, pastilles et tags passent par-dessus.
      id: 'fond-zones',
      type: 'entity' as const,
      position: { x: PLOT_X, y: PLOT_Y },
      style: { width: PLOT_SIZE },
      data: {
        label: '',
        variant: 'quadrant' as const,
        quadKind: 'zone' as const,
        quadCells: [
          // Alpha 0.08 : assez présent pour survivre à l’impression (un lavis
          // à 0.06 frôlait l’invisible sur papier), assez léger pour ne
          // classer aucune zone — les quatre alphas restent identiques.
          'hsla(210, 90%, 55%, 0.08)',
          'hsla(30, 90%, 55%, 0.08)',
          'hsla(285, 70%, 60%, 0.08)',
          'hsla(330, 80%, 60%, 0.08)',
        ],
        exportWidth: PLOT_SIZE,
      },
    },
    {
      id: 'axe-horizontal',
      type: 'entity' as const,
      position: { x: PLOT_X, y: PLOT_Y + PLOT_SIZE / 2 },
      style: { width: PLOT_SIZE },
      data: {
        label: '',
        variant: 'quadrant' as const,
        quadKind: 'hline' as const,
        // Toujours égal à `PLOT_SIZE` (cf. `exportWidth`).
        exportWidth: PLOT_SIZE,
      },
    },
    {
      id: 'axe-vertical',
      type: 'entity' as const,
      position: { x: PLOT_X + PLOT_SIZE / 2, y: PLOT_Y },
      style: { width: 2 },
      data: {
        label: '',
        variant: 'quadrant' as const,
        quadKind: 'vline' as const,
        exportWidth: 2,
      },
    },
    dot('angular', 0.78, 0.2, 'Angular', 'hsl(335, 100%, 40%)'),
    dot('react', 0.38, 0.52, 'React', 'hsl(210, 100%, 40%)'),
    dot('vue', 0.44, 0.74, 'Vue.js', 'hsl(166, 100%, 40%)'),
    // L’axe vertical barre la droite des pastilles React et Vue : leurs tags
    // partent en bas à gauche (pastille à l’angle haut-droit). Angular, côté
    // libre, part en bas à droite (pastille à l’angle haut-gauche).
    tag(
      'tag-angular',
      1060,
      360,
      'Angular',
      'hsl(335, 100%, 40%)',
      'TypeScript par défaut, DI native, routage/formulaires intégrés, CLI complet',
    ),
    tag(
      'tag-react',
      130,
      668,
      'React',
      'hsl(210, 100%, 40%)',
      'Souplesse, large écosystème, mais choix complémentaires requis',
    ),
    tag(
      'tag-vue',
      190,
      888,
      'Vue.js',
      'hsl(166, 100%, 40%)',
      'Courbe douce, bonne documentation, écosystème entreprise restreint',
    ),
    {
      id: 'axe-haut',
      type: 'entity' as const,
      position: { x: PLOT_X + PLOT_SIZE / 2 - 300, y: 60 },
      style: { width: 600 },
      data: {
        label: 'Robuste entreprise, modules intégrés',
        variant: 'quadrant' as const,
        quadKind: 'axisLabel' as const,
        quadAlign: 'center' as const,
        exportWidth: 600,
      },
    },
    {
      id: 'axe-bas',
      type: 'entity' as const,
      position: { x: PLOT_X + PLOT_SIZE / 2 - 300, y: 1150 },
      style: { width: 600 },
      data: {
        label: 'Léger, écosystème généraliste',
        variant: 'quadrant' as const,
        quadKind: 'axisLabel' as const,
        quadAlign: 'center' as const,
        exportWidth: 600,
      },
    },
    {
      id: 'axe-gauche',
      type: 'entity' as const,
      position: { x: 50, y: 587 },
      style: { width: 250 },
      data: {
        label: 'Flexible, non opinionné',
        variant: 'quadrant' as const,
        quadKind: 'axisLabel' as const,
        quadAlign: 'right' as const,
        exportWidth: 250,
      },
    },
    {
      id: 'axe-droite',
      type: 'entity' as const,
      position: { x: PLOT_X + PLOT_SIZE + 20, y: 587 },
      style: { width: 250 },
      data: {
        label: 'Structure imposée, opinionné',
        variant: 'quadrant' as const,
        quadKind: 'axisLabel' as const,
        quadAlign: 'left' as const,
        exportWidth: 250,
      },
    },
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
