import type { DiagramDefinition } from '../../types'

/**
 * Palette documentaire du mémoire — les 7 jetons de couleur de
 * `template_memoire/typst/theme.typ` (`palette`), puis 9 **propositions** de
 * démonstration tirées de la même échelle Chakra que le thème (sémantiques,
 * neutres, chromatiques) : elles ne vivent PAS dans `theme.typ` (valeur non
 * normative, à valider avant tout usage documentaire).
 *
 * Verbatim du thème (lignes 1-8) : chaque hex est repris tel quel, l'usage est
 * celui effectivement constaté dans `theme.typ` (tableaux alternés, note-box,
 * cartes Merise pour `accent_soft`) et les sections. Nœud composite unique,
 * zéro arête (voir `PaletteNode`).
 *
 * Catégorie `palette` (et non `memoire`, malgré l'id) : c'est un outil de
 * référence couleur, pas une figure de chapitre. L'id `memoire-palette-typst`
 * est conservé pour ne pas casser l'URL ni le nom du SVG exporté.
 */

const W = 1280

const THEME = 'Jetons du thème (theme.typ)'
const PROPOSED = 'Proposition — à valider'
const CHROMA = 'Proposition — chromatiques (à valider)'

export const paletteTypst: DiagramDefinition = {
  id: 'memoire-palette-typst',
  title: 'Palette documentaire du mémoire',
  category: 'palette',
  domain: 'Palette — couleurs du document',
  nodes: [
    {
      id: 'palette',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Palette du mémoire (theme.typ)',
        variant: 'palette' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        paletteSwatches: [
          { name: 'primary', hex: '#1a365d', use: 'Titres de chapitres, filets 0,85 pt', group: THEME },
          { name: 'secondary', hex: '#2c5282', use: 'Sous-titres, petites capitales', group: THEME },
          { name: 'accent', hex: '#3182ce', use: 'Liens et étiquettes', group: THEME },
          {
            name: 'accent_soft',
            hex: '#f7fafc',
            use: 'Tableaux alternés, note-box, cartes Merise',
            inkOnSwatch: true,
            group: THEME,
          },
          { name: 'ink', hex: '#1a202c', use: 'Texte fort, citations', group: THEME },
          { name: 'muted', hex: '#4a5568', use: 'Textes secondaires, légendes', group: THEME },
          { name: 'line', hex: '#cbd5e0', use: 'Filets et cadres', inkOnSwatch: true, group: THEME },
          // Propositions (démonstration) — échelle Chakra, comme theme.typ.
          { name: 'success', hex: '#38a169', use: 'Succès, validations', group: PROPOSED },
          { name: 'warning', hex: '#dd6b20', use: 'Avertissements', group: PROPOSED },
          { name: 'danger', hex: '#e53e3e', use: 'Erreurs, rejets', group: PROPOSED },
          { name: 'info', hex: '#319795', use: 'Information, transitions', group: PROPOSED },
          {
            name: 'surface',
            hex: '#edf2f7',
            use: 'Fonds de surface clairs',
            inkOnSwatch: true,
            group: PROPOSED,
          },
          { name: 'tone', hex: '#718096', use: 'Gris intermédiaire', group: PROPOSED },
          // Chroma (démonstration) — même échelle Chakra, hues franches.
          { name: 'yellow', hex: '#ecc94b', use: "Surlignage, points d'attention", inkOnSwatch: true, group: CHROMA },
          { name: 'purple', hex: '#805ad5', use: 'Badges et étiquettes', group: CHROMA },
          { name: 'pink', hex: '#d53f8c', use: 'Accents secondaires', group: CHROMA },
        ],
      },
    },
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
