import type { DiagramDefinition } from '../../types'

/**
 * Figure 2 — Chaîne à maillons rompus (§1.3.1).
 *
 * Le § parle de « maillons » simples répartis entre plusieurs outils et
 * plusieurs personnes : la figure dessine la chaîne — 4 maillons (icônes
 * Feather, précisions courtes issues du texte) — et les 3 ruptures qui les
 * séparent (symptômes verbatim). Bandeau de stats conservé (5–7 / 0 / 0 %,
 * décision utilisateur) ; conclusion RGPD/biais/perte de temps verbatim du
 * HTML d'origine. Couleurs = jetons `--fig-*` (navy/danger — voir
 * `ProcessusAsIsNode`).
 */
const W = 1240

export const processusAsIs: DiagramDefinition = {
  id: 'memoire-processus-as-is',
  title: 'Processus de recrutement traditionnel — état des lieux',
  category: 'memoire',
  domain: '1.3.1 — Processus traditionnel',
  nodes: [
    {
      id: 'asis',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Processus de recrutement traditionnel — état des lieux',
        variant: 'asis' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        asisStats: [
          { num: '5–7', label: 'Outils distincts' },
          { num: '0', label: 'Standardisation' },
          { num: '0 %', label: 'Traçabilité' },
        ],
        asisProblem:
          '**5 à 7 outils** sans communication entre eux, décisions **subjectives**, fil décisionnel **irreconstituable**.',
        asisLinks: [
          { title: "Diffusion de l'offre", icon: 'megaphone', hint: 'email, réseaux, plateformes' },
          { title: 'Réception et tri', icon: 'inbox', hint: 'relues manuellement, critères variables' },
          { title: 'Évaluation', icon: 'tool', hint: 'entretiens, questionnaires externes, jugements' },
          { title: 'Décision', icon: 'checksquare', hint: 'présélection, poursuite, rejet — sans formalisation' },
        ],
        asisBreaks: [
          { label: "Pertes d'information" },
          { label: 'Lenteurs' },
          { label: 'Dépendance à la mémoire individuelle' },
        ],
        asisConclusion:
          '**Conséquence :** un processus éclaté, sans standardisation ni traçabilité, qui expose l’entreprise à des **risques de non-conformité RGPD**, des **biais de recrutement**, et une **perte de temps** considérable pour les équipes RH. La mise en place d’une **plateforme unifiée — SyneliaQuizApp** — devient indispensable.',
      },
    },
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
