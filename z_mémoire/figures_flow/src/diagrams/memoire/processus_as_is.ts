import type { DiagramDefinition } from '../../types'

/**
 * Figure 2 — Scène as-is illustrée (§1.3.1), conception v3 (décision
 * utilisateur : représentation littérale — logos de réseaux + CV qui tombent
 * des canaux, rangement propre). Trois bandes : diffusion de l'offre vers 3
 * canaux réels (LinkedIn en marque, boîte email, plateformes d'emploi), puis
 * chaque canal lâche sa feuille-CV vers SON récepteur (dossiers partagés,
 * boîte email, tableur — verbatim §1.3.1 : « email, les réseaux professionnels
 * ou les plateformes d'emploi » ; récepteurs : Drive/NAS, mails, suivi
 * manuel), puis évaluation → décision (dossier incomplet). Deux ruptures `!`
 * entre bandes (symptômes), hint de la carte finale pour la justification
 * décisionnelle absente. Bandeau de stats conservé (5–7 / 0 / 0 %) ;
 * conclusion RGPD/biais/perte de temps verbatim du HTML d'origine. Couleurs =
 * jetons `--fig-*` (navy/danger/warning — voir `ProcessusAsIsNode`).
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
        asisChannels: [
          {
            label: 'LinkedIn',
            kind: 'logo',
            ref: 'linkedin',
            receiver: { icon: 'folder', label: 'Dossiers partagés', note: 'Drive · copies locales' },
          },
          {
            label: 'Boîte email',
            kind: 'icon',
            ref: 'mail',
            receiver: { icon: 'inbox', label: 'Boîte email', note: 'CV + lettres en pièces jointes' },
          },
          {
            label: "Plateformes d'emploi",
            kind: 'icon',
            ref: 'briefcase',
            receiver: { icon: 'grid', label: 'Tableur', note: 'Suivi manuel · doublons' },
          },
        ],
        asisEvals: [
          { title: 'Évaluations papier', icon: 'filetext', hint: 'grilles hétérogènes, notes dispersées' },
          { title: 'Appel / Visio', icon: 'phone', hint: 'jugement humain, aucune trace' },
          { title: 'Décision finale', icon: 'checksquare', hint: 'dossier incomplet, justification absente' },
        ],
        asisBreaks: [{ label: 'Diffusion non tracée' }, { label: 'Ressaisie manuelle · fichiers dispersés' }],
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
