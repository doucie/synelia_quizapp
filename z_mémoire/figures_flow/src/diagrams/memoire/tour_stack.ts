import type { DiagramDefinition } from '../../types'

/**
 * Pile technique retenue — synthèse visuelle (2.4.5).
 *
 * Pas un nouveau comparatif : la stack assemblée comme un tout cohérent après
 * les choix individuels (figures 2.4.3, 2.4.4 et § backend). Quatre couches
 * empilées — Frontend en haut (ce que l’utilisateur voit), Base de données en
 * bas (fondation) — chacune avec son logo officiel recoloré en accent
 * SAFE_HUES, son nom, sa raison (une ligne du tableau de synthèse, raccourcie
 * sans changer le sens) et ses alternatives en fantômes. Le style « REST en
 * couches » n’est pas une techno mais un style transversal : bandeau vertical
 * fin à gauche de la tour, alternatives en légende dessous.
 *
 * Accents (cohérents avec les figures précédentes) : Angular `335` (figure 3),
 * MySQL `128` (figure 4), Spring `100`, Flyway `0`. Fantômes en retrait
 * (puces `muted`, sans bordure, sans barré) : traces du raisonnement, pas des
 * options concurrentes. Sans arêtes : aucun `<Handle>`.
 */

const BAND_WIDTH = 72
const LAYER_X = BAND_WIDTH + 24
const LAYER_WIDTH = 1060
const LAYER_MIN_HEIGHT = 150
const LAYER_GAP = 20
const CAPTION_WIDTH = LAYER_X + LAYER_WIDTH

const layer = (
  id: string,
  row: number,
  label: string,
  stackLogo: 'angular' | 'springboot' | 'flyway' | 'mysql',
  stackColor: string,
  stackReason: string,
  stackGhosts: string[],
) => ({
  id,
  type: 'entity' as const,
  position: { x: LAYER_X, y: row * (LAYER_MIN_HEIGHT + LAYER_GAP) },
  style: { width: LAYER_WIDTH },
  data: {
    label,
    variant: 'stack' as const,
    stackKind: 'layer' as const,
    stackLogo,
    stackColor,
    stackReason,
    stackGhosts,
    // Toujours égal à `LAYER_WIDTH` (cf. `exportWidth`).
    exportWidth: LAYER_WIDTH,
  },
})

export const tourStack: DiagramDefinition = {
  id: 'memoire-tour-stack',
  title: 'Pile technique retenue — synthèse',
  category: 'memoire',
  domain: '2.4.5 — Synthèse comparative',
  nodes: [
    {
      id: 'band-rest',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: BAND_WIDTH },
      data: {
        label: 'REST en couches',
        variant: 'stack' as const,
        stackKind: 'band' as const,
        // Toujours égal à `BAND_WIDTH` (cf. `exportWidth`).
        exportWidth: BAND_WIDTH,
      },
    },
    layer(
      'couche-frontend',
      0,
      'Angular',
      'angular',
      'hsl(335, 100%, 40%)',
      'Framework opinionné, typage strict, structure stable.',
      ['React', 'Vue.js'],
    ),
    layer(
      'couche-backend',
      1,
      'Spring Boot',
      'springboot',
      'hsl(100, 100%, 40%)',
      'Structure imposée, sécurité intégrée, domaine relationnel.',
      ['Node.js', 'Django', 'ASP.NET Core', 'Laravel'],
    ),
    layer(
      'couche-migrations',
      2,
      'Flyway',
      'flyway',
      'hsl(0, 100%, 40%)',
      'Versionnage simple, lisible, livraison incrémentale.',
      ['Liquibase', 'scripts manuels'],
    ),
    layer(
      'couche-bdd',
      3,
      'MySQL 8',
      'mysql',
      'hsl(128, 100%, 40%)',
      'Intégrité relationnelle, exploitation simple, JPA + Flyway.',
      ['PostgreSQL', 'MongoDB', 'MariaDB'],
    ),
    {
      id: 'legende-rest',
      type: 'entity' as const,
      // Sous la tour : 4 couches et leurs 3 gouttières, plus une respiration.
      position: { x: 0, y: 4 * LAYER_MIN_HEIGHT + 3 * LAYER_GAP + 40 },
      style: { width: CAPTION_WIDTH },
      data: {
        label:
          'Style transversal : REST en couches — écartés : GraphQL, monolithe sans couches, microservices.',
        variant: 'stack' as const,
        stackKind: 'caption' as const,
        // Toujours égal à `CAPTION_WIDTH` (cf. `exportWidth`).
        exportWidth: CAPTION_WIDTH,
      },
    },
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
