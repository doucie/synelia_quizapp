// @ts-nocheck
import type { DiagramDefinition } from '../../types'

export const candidatureQuiz: DiagramDefinition = {
  id: 'mcd-candidature-quiz',
  title: 'Candidature & Quiz',
  category: 'archive',
  domain: 'Candidature & Quiz',
  nodes: [
    {
      id: 'candidature',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'candidature',
        variant: 'mcd',
        attributes: [
          { name: 'id_candidature', isPK: true },
          { name: 'nom' },
          { name: 'prénom' },
          { name: 'email' },
          { name: 'téléphone' },
          { name: 'cv' },
          { name: 'lettre' },
        ],
      },
    },
    {
      id: 'avancement',
      type: 'entity',
      position: { x: 350, y: 0 },
      data: {
        label: 'avancement',
        variant: 'mcd',
        attributes: [
          { name: 'id_avancement', isPK: true },
          { name: 'statut_progression' },
          { name: 'date_début' },
          { name: 'date_fin' },
          { name: 'score' },
        ],
      },
    },
    {
      id: 'tentative_quiz',
      type: 'entity',
      position: { x: 700, y: -150 },
      data: {
        label: 'tentative_quiz',
        variant: 'mcd',
        attributes: [
          { name: 'id_tentative', isPK: true },
          { name: 'token_quiz' },
          { name: 'statut' },
          { name: 'score' },
          { name: 'score_pourcent' },
        ],
      },
    },
    {
      id: 'reponse_candidat',
      type: 'entity',
      position: { x: 1050, y: -150 },
      data: {
        label: 'reponse_candidat',
        variant: 'mcd',
        attributes: [
          { name: 'id_réponse_candidat', isPK: true },
          { name: 'est_sélectionnée' },
          { name: 'texte_libre' },
        ],
      },
    },
    {
      id: 'decision',
      type: 'entity',
      position: { x: 700, y: 150 },
      data: {
        label: 'decision',
        variant: 'mcd',
        attributes: [
          { name: 'id_décision', isPK: true },
          { name: 'type_décision' },
          { name: 'justification' },
        ],
      },
    },
    {
      id: 'demande_candidat',
      type: 'entity',
      position: { x: 350, y: 200 },
      data: {
        label: 'demande_candidat',
        variant: 'mcd',
        attributes: [
          { name: 'id_demande', isPK: true },
          { name: 'type_demande' },
          { name: 'statut' },
          { name: 'nouvel_email' },
        ],
      },
    },
  ],
  edges: [
    {
      id: 'e-candidature-avancement',
      source: 'candidature',
      target: 'avancement',
      type: 'relationship',
      data: {
        label: 'progresser',
        cardFrom: '1,1',
        cardTo: '1,n',
        isStrong: true,
      },
    },
    {
      id: 'e-avancement-tentative',
      source: 'avancement',
      target: 'tentative_quiz',
      type: 'relationship',
      data: {
        label: 'générer',
        cardFrom: '1,1',
        cardTo: '0,n',
        isStrong: true,
      },
    },
    {
      id: 'e-tentative-reponses',
      source: 'tentative_quiz',
      target: 'reponse_candidat',
      type: 'relationship',
      data: {
        label: 'comprendre',
        cardFrom: '1,1',
        cardTo: '0,n',
        isStrong: true,
      },
    },
    {
      id: 'e-avancement-decision',
      source: 'avancement',
      target: 'decision',
      type: 'relationship',
      data: {
        label: 'conclure',
        cardFrom: '1,1',
        cardTo: '0,n',
        isStrong: true,
      },
    },
    {
      id: 'e-candidature-demande',
      source: 'candidature',
      target: 'demande_candidat',
      type: 'relationship',
      data: {
        label: 'émettre',
        cardFrom: '1,1',
        cardTo: '0,n',
      },
    },
  ],
}

