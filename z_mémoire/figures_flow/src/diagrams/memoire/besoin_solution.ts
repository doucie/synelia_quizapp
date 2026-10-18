import type { DiagramDefinition } from '../../types'

/**
 * Figure 3 — L'éparpillement aspiré par la plateforme (§1.3.3).
 *
 * Entonnoir (décision utilisateur) : nuage d'outils et de pratiques éclatés
 * (verbatim des §1.3.1/1.3.2), SyneliaQuizApp au centre, 4 sorties = les 4
 * raisons du § (centraliser, automatiser, standardiser, tracer). Les 6 blocs
 * numérotés et la colonne « VERS » du HTML d'origine sont abandonnés.
 * Couleurs = jetons `--fig-*` (voir `BesoinFunnelNode`).
 */
const W = 1360

export const besoinSolution: DiagramDefinition = {
  id: 'memoire-besoin-solution',
  title: 'Du besoin à la solution — synthèse',
  category: 'memoire',
  domain: '1.3.3 — Nécessité d’une solution digitale',
  nodes: [
    {
      id: 'pairs',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Du besoin à la solution — synthèse',
        variant: 'pairs' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        besoinScatter: [
          { label: 'Boîte mail', tilt: -6 },
          { label: 'Excel', tilt: 4 },
          { label: 'Drive · NAS', tilt: -3 },
          { label: 'Google Forms', tilt: 5 },
          { label: 'Appels', tilt: -5 },
          { label: 'Critères variables', tilt: 3 },
          { label: 'Double saisie', tilt: -4 },
          { label: 'Aucune trace', tilt: 6 },
        ],
        besoinOutputs: [
          {
            title: 'Centraliser',
            line: 'Un référentiel commun à tous les acteurs',
            icon: 'database',
            color: 'secondary',
          },
          {
            title: 'Automatiser',
            line: 'Fin des opérations répétitives',
            icon: 'zap',
            color: 'success',
          },
          {
            title: 'Standardiser',
            line: 'Grilles et processus homogènes',
            icon: 'sliders',
            color: 'warning',
          },
          {
            title: 'Tracer',
            line: 'Suivi clair et transparent du parcours',
            icon: 'eye',
            color: 'neutral',
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
