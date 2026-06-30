import type { DiagramDefinition } from '../../types'

export const entretienEvaluation: DiagramDefinition = {
  id: 'mcd-entretien-evaluation',
  title: 'Entretien & Évaluation',
  category: 'mcd',
  domain: 'Entretien & Évaluation',
  nodes: [
    {
      id: 'entretien',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'entretien',
        variant: 'mcd',
        attributes: [
          { name: 'id_entretien', isPK: true },
          { name: 'date' },
          { name: 'type' },
          { name: 'lieu' },
          { name: 'lien_visio' },
          { name: 'statut' },
        ],
      },
    },
    {
      id: 'entretien_candidat',
      type: 'entity',
      position: { x: 350, y: -150 },
      data: {
        label: 'entretien_candidat',
        variant: 'mcd',
        attributes: [
          { name: 'id_entretien_candidat', isPK: true },
          { name: 'motif_refus' },
          { name: 'statut_réponse' },
        ],
      },
    },
    {
      id: 'participant_entretien',
      type: 'entity',
      position: { x: 350, y: 150 },
      data: {
        label: 'participant_entretien',
        variant: 'mcd',
        attributes: [
          { name: 'id_participant', isPK: true },
          { name: 'peut_modifier' },
          { name: 'peut_évaluer' },
          { name: 'statut_évaluation' },
        ],
      },
    },
    {
      id: 'evaluation',
      type: 'entity',
      position: { x: 700, y: 150 },
      data: {
        label: 'evaluation',
        variant: 'mcd',
        attributes: [
          { name: 'id_évaluation', isPK: true },
          { name: 'statut' },
          { name: 'date_soumission' },
          { name: 'score_global' },
        ],
      },
    },
    {
      id: 'item_evaluation',
      type: 'entity',
      position: { x: 1050, y: 150 },
      data: {
        label: 'item_evaluation',
        variant: 'mcd',
        attributes: [
          { name: 'id_item', isPK: true },
          { name: 'valeur_score' },
          { name: 'valeur_texte' },
          { name: 'poids_instantanné' },
        ],
      },
    },
    {
      id: 'critere_etape',
      type: 'entity',
      position: { x: 1050, y: -100 },
      data: {
        label: 'critere_etape',
        variant: 'mcd',
        attributes: [
          { name: 'id_critère', isPK: true },
          { name: 'ordre' },
          { name: 'libellé' },
          { name: 'type' },
          { name: 'max_score' },
          { name: 'poids' },
        ],
      },
    },
    {
      id: 'grille_evaluation',
      type: 'entity',
      position: { x: 1400, y: -100 },
      data: {
        label: 'grille_evaluation',
        variant: 'mcd',
        attributes: [
          { name: 'id_grille', isPK: true },
          { name: 'libellé' },
          { name: 'version_courante' },
        ],
      },
    },
  ],
  edges: [
    {
      id: 'e-entretien-convoquer',
      source: 'entretien',
      target: 'entretien_candidat',
      type: 'relationship',
      data: {
        label: 'convoquer',
        cardFrom: '1,1',
        cardTo: '1,n',
        isStrong: true,
      },
    },
    {
      id: 'e-entretien-inclure',
      source: 'entretien',
      target: 'participant_entretien',
      type: 'relationship',
      data: {
        label: 'inclure',
        cardFrom: '1,1',
        cardTo: '1,n',
      },
    },
    {
      id: 'e-entretien-evaluation',
      source: 'entretien',
      target: 'evaluation',
      type: 'relationship',
      data: {
        label: 'recevoir',
        cardFrom: '1,1',
        cardTo: '0,n',
        isStrong: true,
      },
    },
    {
      id: 'e-evaluation-items',
      source: 'evaluation',
      target: 'item_evaluation',
      type: 'relationship',
      data: {
        label: 'contenir',
        cardFrom: '1,1',
        cardTo: '1,n',
        isStrong: true,
      },
    },
    {
      id: 'e-item-critere',
      source: 'item_evaluation',
      target: 'critere_etape',
      type: 'relationship',
      data: {
        label: 'évaluer',
        cardFrom: '1,n',
        cardTo: '1,1',
      },
    },
    {
      id: 'e-critere-grille',
      source: 'critere_etape',
      target: 'grille_evaluation',
      type: 'relationship',
      data: {
        label: 'référencer',
        cardFrom: '0,n',
        cardTo: '0,1',
        isDashed: true,
      },
    },
  ],
}
