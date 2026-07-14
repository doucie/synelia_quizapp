import type { DiagramDefinition } from '../../types'

export const mct1bQuiz: DiagramDefinition = {
  id: 'mct-1b-quiz',
  title: 'MCT 1b — Quiz',
  category: 'traitements',
  domain: 'MCT 1b — T2 · Passer le quiz du round courant',
  nodes: [
    {
      id: 't2-e1', type: 'process', position: { x: 20, y: 20 },
      data: { variant: 'mct-event', label: 'Round QUIZ ouvert' },
    },
    {
      id: 't2-e2', type: 'process', position: { x: 270, y: 20 },
      data: { variant: 'mct-event', label: 'Candidat ouvre le quiz' },
    },
    {
      id: 't2-e3', type: 'process', position: { x: 520, y: 20 },
      data: { variant: 'mct-event', label: 'Quota tentatives non atteint' },
    },
    {
      id: 't2-s', type: 'process', position: { x: 290, y: 140 },
      data: { variant: 'mct-sync', label: 'ET' },
    },
    {
      id: 't2-op', type: 'process', position: { x: 80, y: 250 },
      data: {
        variant: 'mct-operation', label: 'T2 — Passer le quiz du round courant',
        items: [
          'Démarrer une session de quiz',
          'Générer les questions selon la configuration',
          'Enregistrer les réponses au fur et à mesure',
          'Calculer le score final à la fin du quiz',
          'Valider ou rejeter selon les règles de sélection',
        ],
        emissionRules: ['Score ≥ seuil', 'Score entre seuils', 'Score < seuil'],
      },
    },
    {
      id: 't2-r1', type: 'process', position: { x: 80, y: 520 },
      data: { variant: 'mct-result', label: 'Quiz réussi (auto)', rule: 'Score ≥ seuil' },
    },
    {
      id: 't2-r2', type: 'process', position: { x: 370, y: 520 },
      data: { variant: 'mct-result', label: 'À corriger manuellement', rule: 'Score entre seuils' },
    },
    {
      id: 't2-r3', type: 'process', position: { x: 640, y: 520 },
      data: { variant: 'mct-result', label: 'Échec sous seuil', rule: 'Score < seuil', fail: true },
    },
  ],
  edges: [
    { id: 'e-t2-e1-s', source: 't2-e1', target: 't2-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-e2-s', source: 't2-e2', target: 't2-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-e3-s', source: 't2-e3', target: 't2-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-s-op', source: 't2-s', target: 't2-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-op-r1', source: 't2-op', target: 't2-r1', sourceHandle: 'Score ≥ seuil', type: 'traitement', data: {} },
    { id: 'e-t2-op-r2', source: 't2-op', target: 't2-r2', sourceHandle: 'Score entre seuils', type: 'traitement', data: {} },
    { id: 'e-t2-op-r3', source: 't2-op', target: 't2-r3', sourceHandle: 'Score < seuil', type: 'traitement', data: { isDashed: true } },
  ],
}
