import type { DiagramDefinition } from '../../types'

export const mct1aCandidature: DiagramDefinition = {
  id: 'mct-1a-candidature',
  title: 'MCT 1a — Candidature',
  category: 'traitements',
  domain: 'MCT 1a — T1 · Soumettre la candidature',
  nodes: [
    {
      id: 't1-e1', type: 'process', position: { x: 20, y: 20 },
      data: { variant: 'mct-event', label: 'Lien campagne ouvert' },
    },
    {
      id: 't1-e2', type: 'process', position: { x: 270, y: 20 },
      data: { variant: 'mct-event', label: 'Email candidat vérifié' },
    },
    {
      id: 't1-e3', type: 'process', position: { x: 520, y: 20 },
      data: { variant: 'mct-event', label: 'Quota campagne non atteint' },
    },
    {
      id: 't1-e4', type: 'process', position: { x: 770, y: 20 },
      data: { variant: 'mct-event', label: 'Formulaire actif' },
    },
    {
      id: 't1-s', type: 'process', position: { x: 290, y: 140 },
      data: { variant: 'mct-sync', label: 'ET' },
    },
    {
      id: 't1-op', type: 'process', position: { x: 80, y: 250 },
      data: {
        variant: 'mct-operation', label: 'T1 — Soumettre la candidature',
        items: [
          'Créer la candidature avec snapshot identité, source et formulaire',
          'Instancier le pipeline via le template de la campagne',
          'Créer le premier round CANDIDATURE en statut OUVERT',
          'Initialiser les agrégats de scores à 0',
        ],
        emissionRules: ['Candidature créée', 'Quota atteint', 'Token invalide'],
      },
    },
    {
      id: 't1-r1', type: 'process', position: { x: 80, y: 490 },
      data: { variant: 'mct-result', label: 'Candidature créée', rule: 'Candidature créée' },
    },
    {
      id: 't1-r2', type: 'process', position: { x: 370, y: 490 },
      data: { variant: 'mct-result', label: 'Quota atteint', rule: 'Quota atteint', fail: true },
    },
    {
      id: 't1-r3', type: 'process', position: { x: 640, y: 490 },
      data: { variant: 'mct-result', label: 'Token invalide', rule: 'Token invalide', fail: true },
    },
  ],
  edges: [
    { id: 'e-t1-e1-s', source: 't1-e1', target: 't1-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-e2-s', source: 't1-e2', target: 't1-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-e3-s', source: 't1-e3', target: 't1-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-e4-s', source: 't1-e4', target: 't1-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-s-op', source: 't1-s', target: 't1-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-op-r1', source: 't1-op', target: 't1-r1', type: 'traitement', data: {} },
    { id: 'e-t1-op-r2', source: 't1-op', target: 't1-r2', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t1-op-r3', source: 't1-op', target: 't1-r3', type: 'traitement', data: { isDashed: true } },
  ],
}
