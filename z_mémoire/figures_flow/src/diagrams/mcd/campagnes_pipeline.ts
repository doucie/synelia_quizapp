import type { DiagramDefinition } from '../../types'

export const campagnesPipeline: DiagramDefinition = {
  id: 'mcd-campagnes-pipeline',
  title: 'Campagnes & Pipeline',
  category: 'mcd',
  domain: 'Campagnes & Pipeline',
  nodes: [
    {
      id: 'campagne',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'campagne',
        variant: 'mcd',
        attributes: [
          { name: 'id_campagne', isPK: true },
          { name: 'titre' },
          { name: 'description' },
          { name: 'statut' },
          { name: 'date_début' },
          { name: 'date_fin' },
          { name: 'max_candidatures' },
          { name: 'chronométrée' },
        ],
      },
    },
    {
      id: 'pipeline_template',
      type: 'entity',
      position: { x: 350, y: -200 },
      data: {
        label: 'pipeline_template',
        variant: 'mcd',
        attributes: [
          { name: 'id_template', isPK: true },
          { name: 'libellé_template' },
          { name: 'est_défaut' },
          { name: 'actif' },
          { name: 'verrou' },
        ],
      },
    },
    {
      id: 'etape_pipeline',
      type: 'entity',
      position: { x: 700, y: -200 },
      data: {
        label: 'etape_pipeline',
        variant: 'mcd',
        attributes: [
          { name: 'id_etape', isPK: true },
          { name: 'type_etape' },
          { name: 'ordre_etape' },
          { name: 'est_requise' },
          { name: 'est_éliminatoire' },
          { name: 'config_json' },
        ],
      },
    },
    {
      id: 'regle_notification',
      type: 'entity',
      position: { x: 1050, y: -300 },
      data: {
        label: 'regle_notification',
        variant: 'mcd',
        attributes: [
          { name: 'id_règle', isPK: true },
          { name: 'code_déclencheur' },
          { name: 'est_requise' },
          { name: 'est_automatique' },
        ],
      },
    },
    {
      id: 'formulaire',
      type: 'entity',
      position: { x: 350, y: 150 },
      data: {
        label: 'formulaire',
        variant: 'mcd',
        attributes: [
          { name: 'id_formulaire', isPK: true },
          { name: 'nom' },
          { name: 'description' },
          { name: 'est_actif' },
          { name: 'chronométré' },
        ],
      },
    },
    {
      id: 'version_formulaire',
      type: 'entity',
      position: { x: 700, y: 150 },
      data: {
        label: 'version_formulaire',
        variant: 'mcd',
        attributes: [
          { name: 'id_version', isPK: true },
          { name: 'numéro_version' },
          { name: 'publiée' },
          { name: 'verrouillée' },
          { name: 'questions_aléatoires' },
        ],
      },
    },
    {
      id: 'question',
      type: 'entity',
      position: { x: 1050, y: 150 },
      data: {
        label: 'question',
        variant: 'mcd',
        attributes: [
          { name: 'id_question', isPK: true },
          { name: 'énoncé' },
          { name: 'type' },
          { name: 'score' },
          { name: 'chrono' },
        ],
      },
    },
    {
      id: 'reponse_possible',
      type: 'entity',
      position: { x: 1400, y: 150 },
      data: {
        label: 'reponse_possible',
        variant: 'mcd',
        attributes: [
          { name: 'id_réponse', isPK: true },
          { name: 'texte' },
          { name: 'est_correcte' },
          { name: 'type' },
          { name: 'ordre' },
        ],
      },
    },
    {
      id: 'source_token',
      type: 'entity',
      position: { x: 350, y: -50 },
      data: {
        label: 'source_token',
        variant: 'mcd',
        attributes: [
          { name: 'id_source', isPK: true },
          { name: 'code' },
          { name: 'libellé' },
          { name: 'date_expiration' },
        ],
      },
    },
  ],
  edges: [
    {
      id: 'e-campagne-template',
      source: 'campagne',
      target: 'pipeline_template',
      type: 'relationship',
      data: {
        label: 'utiliser',
        cardFrom: '0,n',
        cardTo: '1,1',
      },
    },
    {
      id: 'e-campagne-formulaire',
      source: 'campagne',
      target: 'formulaire',
      type: 'relationship',
      data: {
        label: 'proposer',
        cardFrom: '1,n',
        cardTo: '1,n',
      },
    },
    {
      id: 'e-campagne-source',
      source: 'campagne',
      target: 'source_token',
      type: 'relationship',
      data: {
        label: 'générer',
        cardFrom: '1,1',
        cardTo: '0,n',
      },
    },
    {
      id: 'e-template-etapes',
      source: 'pipeline_template',
      target: 'etape_pipeline',
      type: 'relationship',
      data: {
        label: 'définir',
        cardFrom: '1,1',
        cardTo: '1,n',
        isStrong: true,
      },
    },
    {
      id: 'e-etape-regle',
      source: 'etape_pipeline',
      target: 'regle_notification',
      type: 'relationship',
      data: {
        label: 'déclencher',
        cardFrom: '1,1',
        cardTo: '0,n',
      },
    },
    {
      id: 'e-formulaire-versions',
      source: 'formulaire',
      target: 'version_formulaire',
      type: 'relationship',
      data: {
        label: 'versionner',
        cardFrom: '1,1',
        cardTo: '1,n',
        isStrong: true,
      },
    },
    {
      id: 'e-version-questions',
      source: 'version_formulaire',
      target: 'question',
      type: 'relationship',
      data: {
        label: 'contenir',
        cardFrom: '1,n',
        cardTo: '1,n',
      },
    },
    {
      id: 'e-question-reponses',
      source: 'question',
      target: 'reponse_possible',
      type: 'relationship',
      data: {
        label: 'proposer',
        cardFrom: '1,1',
        cardTo: '0,n',
        isStrong: true,
      },
    },
  ],
}
