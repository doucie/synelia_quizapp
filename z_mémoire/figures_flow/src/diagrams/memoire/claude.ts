import type { DiagramDefinition } from '../../types'
import svgProcessusAvant from './claude/processus_avant.svg?raw'
import svgObjectifs from './claude/objectifs.svg?raw'

/**
 * Figures du mémoire dessinées par Claude (collab, scripts Python autonomes
 * `plans/uml/echanges/results_claude/fig_1_*_gen_*.py` — pictogrammes
 * génériques, aucun logo de marque).
 *
 * SVG rendus TELS QUEL via la variante `claude` (`ClaudeSvgNode` +
 * `recolorClaudeSvg` : purge C2PA, fonte Cabinet Grotesk). Addenda 20261020
 * (demande explicite) : palette Claude **remappée vers la palette documentaire
 * du mémoire** (fig. 22 : jetons `theme.typ` + propositions Chakra) — le
 * contrat « aucun réagencement » porte la géométrie, pas la couleur. Les
 * pastels clairs (bordures/fonds de famille) n'existent pas dans la palette :
 * dérivés Chakra 100-300 de la même hue (bordures 200, fonds 100, flèches
 * 300). Un seul mappage partagé : les deux figures utilisent les mêmes
 * familles (bleu/vert/violet/sable/ambre/slate + encres neutres). Les hex
 * Les hex des familles sont des valeurs figées (couleur = donnée), comme
 * fig. 22. Les monochromes (encres, gris de trait, panneau, cartes) pointent
 * des jetons du thème : ils s'assombrissent en dark (doctrine addenda
 * 20261020 — seuls les monochromes ont un darkmode). Les blancs SANS trait
 * (badges numérotés et pastille translucide posés sur les bandes colorées,
 * textes de titre) restent blancs, `--fig-on-fill` de fait. Originaux
 * intacts dans `results_claude/`.
 */

const W = 1100

/**
 * Palette Claude → palette documentaire (clés = casse exacte des sources).
 * Le split/join opère sur toute chaîne : les surfaces blanches porteuses
 * d'un trait (cartes, médaillons, corps de pictos) sont traitées par une
 * clé longue partagée, et le fond du SVG par sa balise exacte (une par
 * figure).
 */
const CLAUDE_PALETTES = {
  // Encres de texte (posées sur les surfaces adaptatives).
  '#1F2A37': 'hsl(var(--foreground))', // INK → foreground
  '#5B6675': 'hsl(var(--muted-foreground))', // MUTED → muted-foreground
  '#9AA6B6': 'var(--fig-frame)', // PAPER (pictogrammes neutres) → frame
  // Famille bleu (« digitaliser », diffusion, marqueurs `ab`).
  '#2F5D9E': '#2c5282', // BLUE → secondary
  '#BFD0E8': '#bee3f8', // BLUE_LN → blue.200 (bordures)
  '#EAF1FA': '#ebf8ff', // BLUE_BG (fenêtre plateforme) → blue.100
  '#8FB0DD': '#90cdf4', // flèches bleu clair (§1.3.1) → blue.300
  '#9DB6DB': '#90cdf4', // lignes de l'offre → blue.300
  '#E4ECF8': '#ebf8ff', // rabat de l'offre → blue.100
  // Famille vert (« automatiser »).
  '#3F7D6B': '#38a169', // GREEN → success
  '#BCD8CF': '#c6f6d5', // GREEN_LN → green.200 (bordures)
  '#E9F3EF': '#f0fff4', // GREEN_BG → green.100
  // Famille violet (« collaborer »).
  '#7A4E9E': '#805ad5', // PURPLE → purple (proposition fig. 22)
  '#D6C6E4': '#e9d8fd', // PURPLE_LN → purple.200 (bordures)
  '#CDB9DE': '#d6bcfa', // lignes de la fiche partagée → purple.300
  // Famille sable (outils éclatés du §1.3.1).
  '#9A6B16': '#dd6b20', // SAND → warning
  '#E3D3AE': '#fbd38d', // SAND_LN → orange.200 (bordures)
  '#D9C28F': '#fbd38d', // lignes de la fiche sable → orange.200
  '#E3B988': '#f6ad55', // lignes de la feuille en doublon → orange.300
  // Ambre (repères numérotés, marqueurs `am`, pastille mac jaune).
  '#C0701A': '#ecc94b', // AMBER → yellow (proposition fig. 22)
  '#FDF3E4': '#ffedd5', // fond de la feuille en doublon (×2) → orange.100
  '#E9C46A': '#ecc94b', // pastille mac jaune → yellow
  // Famille slate (évaluateurs, décision, marqueurs `as`) — monochromes,
  // encres encadrées (gelées fig. 22 → vers -ink pour suivre le thème).
  '#4A5A70': 'var(--fig-neutral-ink)', // SLATE → neutral-ink
  '#C9D1DC': 'var(--fig-line)', // SLATE_LN → line
  '#7D8BA0': 'var(--fig-tone-ink)', // 2e évaluateur → tone-ink
  // Traits gris (monochromes).
  '#AEB8C6': 'var(--fig-frame)', // LINE (flèche neutre, marqueur `ah`) → frame
  '#C9CFD8': 'var(--fig-line)', // maillage pointillé « logique éclatée » → line
  '#B9C2CE': 'var(--fig-line)', // lignes des fiches → line
  '#E4E8EE': 'var(--fig-line)', // barre de progression → line
  '#EEF2F7': 'var(--fig-soft)', // rabat des fiches → soft
  // Cadres (monochromes).
  '#F8FAFC': 'hsl(var(--muted))', // fond du panneau → muted
  '#E1E5EB': 'hsl(var(--input))', // contour du panneau → input
  // Pastilles mac de la fenêtre plateforme.
  '#E58A7E': '#e53e3e', // rouge → danger
  '#8CC5A0': '#38a169', // vert → success
  // Surfaces neutres adaptatives — tout blanc porteur d'un trait : cartes,
  // médaillons (r=20/27/34) et corps de pictogrammes (aucun sur bandes
  // colorées, même dans `objectifs` : les traités saturés sont des pictos
  // sur cartes blanches). La couleur du trait suit, préservée.
  'fill="#FFFFFF" stroke="': 'fill="hsl(var(--card))" stroke="',
  // Fond du canvas, un par figure (balise exacte).
  '<rect width="1100" height="630" fill="#FFFFFF"/>':
    '<rect width="1100" height="630" fill="hsl(var(--background))"/>',
  '<rect width="1100" height="690" fill="#FFFFFF"/>':
    '<rect width="1100" height="690" fill="hsl(var(--background))"/>',
}

const fig = (
  id: string,
  title: string,
  domain: string,
  claudeSvg: string,
): DiagramDefinition => ({
  id,
  title,
  category: 'memoire',
  domain,
  nodes: [
    {
      id: 'fig',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: title,
        variant: 'claude' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        claudeSvg,
        claudeColors: CLAUDE_PALETTES,
      },
    },
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
})

export const processusAvant = fig(
  'memoire-processus-avant',
  'Processus de recrutement avant SyneliaQuizApp',
  '1.3.1 — Processus traditionnel',
  svgProcessusAvant,
)

export const objectifsGeneraux = fig(
  'memoire-objectifs-gen',
  'Objectifs généraux de SyneliaQuizApp',
  '1.4.1 — Objectifs généraux',
  svgObjectifs,
)

export const memoireClaudeFigures = [processusAvant, objectifsGeneraux]
