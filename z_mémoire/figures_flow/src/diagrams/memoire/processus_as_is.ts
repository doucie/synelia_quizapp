import type { DiagramDefinition } from '../../types'

/**
 * Figure 2 — Processus de recrutement as-is (§1.3.1).
 *
 * Verbatim de `figures_html/processus_recrutement_as_is.html` : bandeau
 * 5–7 outils / 0 standardisation / 0 % traçabilité (assumé, décision
 * utilisateur), 3 phases de chaînes d'outils, 6 ruptures, conclusion RGPD/
 * biais/perte de temps. Le SVG décoratif du source est abandonné ; typo
 * « Ressaissie » du source corrigée en « ressaisie ». Couleurs = jetons
 * `--fig-*` (danger/navy — voir `ProcessusAsIsNode`).
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
          'Chaque cycle de recrutement mobilise **5 à 7 outils différents** sans aucune communication entre eux. Les décisions reposent sur des **critères subjectifs**, sans historique consultable. En cas de litige, **impossible de reconstituer le fil décisionnel**.',
        asisPhases: [
          {
            title: "Diffusion de l'offre",
            tools: [
              { name: 'Traitement de texte', kind: 'Fichier .docx' },
              { name: 'Messagerie', kind: 'Envoi groupé manuel' },
              { name: 'Réseaux sociaux', kind: 'Publications manuelles' },
            ],
            breaks: [
              { label: 'Aucune liaison entre les outils' },
              { label: 'Diffusion non tracée' },
            ],
          },
          {
            title: 'Réception et tri des candidatures',
            tools: [
              { name: 'Boîte email', kind: 'CV + lettres en PJ' },
              { name: 'Tableur', kind: 'Suivi manuel · Doublons' },
              { name: 'Dossiers partagés', kind: 'Drive · NAS · Copies locales' },
            ],
            breaks: [
              { label: 'Ressaisie manuelle des données' },
              { label: 'Fichiers dispersés' },
            ],
          },
          {
            title: 'Évaluation et décision',
            tools: [
              { name: 'Formulaire externe', kind: 'Google Forms · Typeform' },
              { name: 'Appel / Visio', kind: 'Notes papier · Aucune trace' },
              { name: 'Décision finale', kind: 'Email · Aucun archivage' },
            ],
            breaks: [
              { label: 'Résultats déconnectés du dossier candidat' },
              { label: 'Décision sans justification documentée' },
            ],
          },
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
