import type { DiagramDefinition } from '../../types'

/**
 * Figure 2 — Scène as-is illustrée (§1.3.1), conception v4 (retours au rendu
 * de la v3 : « Offre » placée EN HAUT et reliée aux 3 canaux ; canaux = 3
 * vraies plateformes d'emploi — LinkedIn/Indeed/Glassdoor, on ne partage pas
 * les offres par email ; bandeau de statistiques et conclusion du bas
 * supprimés, le texte dit déjà le reste). Trois bandes : diffusion de l'offre
 * (arbre en T vers 3 logos en marque), puis chaque canal lâche sa feuille-CV
 * vers SON récepteur (dossiers partagés, boîte email, tableur — verbatim
 * §1.3.1 « les réseaux professionnels ou les plateformes d'emploi » ; mails/
 * Drive/suivi manuel du contexte), puis évaluation → décision (dossier
 * incomplet). Deux ruptures `!` entre bandes (symptômes). Couleurs = jetons
 * `--fig-*` + marques LOGO_BRAND (voir `ProcessusAsIsNode`).
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
        asisChannels: [
          {
            label: 'LinkedIn',
            ref: 'linkedin',
            receiver: { icon: 'folder', label: 'Dossiers partagés', note: 'Drive · copies locales' },
          },
          {
            label: 'Indeed',
            ref: 'indeed',
            receiver: { icon: 'inbox', label: 'Boîte email', note: 'CV + lettres en pièces jointes' },
          },
          {
            label: 'Glassdoor',
            ref: 'glassdoor',
            receiver: { icon: 'grid', label: 'Tableur', note: 'Suivi manuel · doublons' },
          },
        ],
        asisEvals: [
          { title: 'Évaluations papier', icon: 'filetext', hint: 'grilles hétérogènes, notes dispersées' },
          { title: 'Appel / Visio', icon: 'phone', hint: 'jugement humain, aucune trace' },
          { title: 'Décision finale', icon: 'checksquare', hint: 'dossier incomplet, justification absente' },
        ],
        asisBreaks: [{ label: 'Diffusion non tracée' }, { label: 'Ressaisie manuelle · fichiers dispersés' }],
      },
    },
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
