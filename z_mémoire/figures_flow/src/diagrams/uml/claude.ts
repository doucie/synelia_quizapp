import type { DiagramDefinition } from '../../types'
import svgUcCandidat from './claude/cas_utilisation_candidat_v2.svg?raw'
import svgUcGlobal from './claude/cas_utilisation_global_v2.svg?raw'
import svgUcRecruteurSuivi from './claude/cas_utilisation_recruteur_suivi_v2.svg?raw'
import svgUcRecruteurCampagnes from './claude/cas_utilisation_recruteur_campagnes_entretiens.svg?raw'
import svgUcAdminDroits from './claude/cas_utilisation_admin_utilisateurs_droits.svg?raw'
import svgUcAdminConfig from './claude/cas_utilisation_admin_contenu_configuration.svg?raw'
import svgUcSuperAdmin from './claude/cas_utilisation_super_admin.svg?raw'
import svgUcCompteAcces from './claude/cas_utilisation_compte_acces.svg?raw'
import svgEtatsCampagne from './claude/etats_campagne.svg?raw'
import svgEtatsEtape from './claude/etats_etape_pipeline_v2.svg?raw'
import svgEtatsTentative from './claude/etats_tentative_quiz.svg?raw'
import svgSeqNominal from './claude/sequence_passer_le_quiz_nominal.svg?raw'
import svgSeqAnormales from './claude/sequence_passer_le_quiz_fins_anormales.svg?raw'
import svgComposants from './claude/composants_syneliaquizapp_v3.svg?raw'
import svgDeploiement from './claude/deploiement_cible_syneliaquizapp.svg?raw'

/**
 * Figures UML livrées par Claude (collab, `plans/uml/echanges/results_claude/`).
 *
 * SVG rendus TELS QUELS via la variante `claude` (`ClaudeSvgNode` +
 * `recolorClaudeSvg` : palette remappée, fonte Cabinet Grotesk, purge C2PA).
 * Originaux intacts dans `results_claude/`. Contenu non vérifié ici —
 * vérifications avancées plus tard (voir `plans/uml/verification.md` et
 * `plans/uml/echanges/corrections_demandees.md`).
 */

const W = 1200

const fig = (
  id: string,
  title: string,
  domain: string,
  claudeSvg: string,
): DiagramDefinition => ({
  id,
  title,
  category: 'uml',
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
      },
    },
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
})

export const umlUcCandidat = fig('uml-uc-candidat', 'Cas d’utilisation du candidat', 'UC — Candidat', svgUcCandidat)
export const umlUcGlobal = fig('uml-uc-global', 'Cas d’utilisation global', 'UC — Global', svgUcGlobal)
export const umlUcRecruteurSuivi = fig('uml-uc-recruteur-suivi', 'Cas d’utilisation — suivi recruteur', 'UC — Recruteur suivi', svgUcRecruteurSuivi)
export const umlUcRecruteurCampagnes = fig('uml-uc-recruteur-campagnes', 'Cas d’utilisation — campagnes et entretiens', 'UC — Recruteur campagnes', svgUcRecruteurCampagnes)
export const umlUcAdminDroits = fig('uml-uc-admin-droits', 'Cas d’utilisation — utilisateurs et droits', 'UC — Admin droits', svgUcAdminDroits)
export const umlUcAdminConfig = fig('uml-uc-admin-config', 'Cas d’utilisation — contenu et configuration', 'UC — Admin config', svgUcAdminConfig)
export const umlUcSuperAdmin = fig('uml-uc-super-admin', 'Cas d’utilisation du super administrateur', 'UC — Super admin', svgUcSuperAdmin)
export const umlUcCompteAcces = fig('uml-uc-compte-acces', 'Cas d’utilisation — compte et accès', 'UC — Compte et accès', svgUcCompteAcces)
export const umlEtatsCampagne = fig('uml-etats-campagne', 'États-transitions : campagne', 'États — Campagne', svgEtatsCampagne)
export const umlEtatsEtape = fig('uml-etats-etape', 'États-transitions : étape du pipeline', 'États — Étape', svgEtatsEtape)
export const umlEtatsTentative = fig('uml-etats-tentative', 'États-transitions : tentative de quiz', 'États — Tentative', svgEtatsTentative)
export const umlSeqNominal = fig('uml-seq-quiz-nominal', 'Séquence quiz — parcours nominal', 'Séquence — Quiz nominal', svgSeqNominal)
export const umlSeqAnormales = fig('uml-seq-quiz-anormales', 'Séquence quiz — fins anormales', 'Séquence — Fins anormales', svgSeqAnormales)
export const umlComposants = fig('uml-composants', 'Composants de SyneliaQuizApp', 'Architecture — Composants', svgComposants)
export const umlDeploiement = fig('uml-deploiement-cible', 'Déploiement cible de SyneliaQuizApp', 'Architecture — Déploiement', svgDeploiement)

export const umlClaudeFigures = [
  umlUcCandidat,
  umlUcGlobal,
  umlUcRecruteurSuivi,
  umlUcRecruteurCampagnes,
  umlUcAdminDroits,
  umlUcAdminConfig,
  umlUcSuperAdmin,
  umlUcCompteAcces,
  umlEtatsCampagne,
  umlEtatsEtape,
  umlEtatsTentative,
  umlSeqNominal,
  umlSeqAnormales,
  umlComposants,
  umlDeploiement,
]
