// @ts-nocheck
import type { DiagramDefinition } from '../../types'

export const mct1bQuiz: DiagramDefinition = {
  id: 'mct-1b-quiz',
  title: 'MCT 1b — Quiz',
  category: 'archive',
  domain: 'MCT 1b — T2 · Passer le quiz de l\'étape en cours',
  nodes: [
    {
      id: 't2-e1', type: 'process', position: { x: 20, y: 20 },
      data: { variant: 'mct-event', label: 'Étape de quiz active' },
    },
    {
      id: 't2-e2', type: 'process', position: { x: 270, y: 20 },
      data: { variant: 'mct-event', label: 'Quiz démarré par le candidat' },
    },
    {
      id: 't2-e3', type: 'process', position: { x: 520, y: 20 },
      data: { variant: 'mct-event', label: 'Quota de tentatives non atteint' },
    },
    {
      id: 't2-s', type: 'process', position: { x: 290, y: 140 },
      data: { variant: 'mct-sync', label: 'ET' },
    },
    {
      id: 't2-op', type: 'process', position: { x: 80, y: 250 },
      data: {
        variant: 'mct-operation', label: 'T2 — Répondre au quiz de l\'étape en cours',
        items: [
          'Démarrer une session de quiz',
          'Générer les questions selon la configuration',
          'Enregistrer les réponses au fur et à mesure',
          'Calculer le score final à la fin du quiz',
          'Valider ou rejeter selon les règles de sélection',
        ],
        emissionRules: ['Score ≥ seuil', 'Correction manuelle requise', 'Score < seuil'],
      },
    },
    {
      id: 't2-r1', type: 'process', position: { x: 80, y: 520 },
      data: { variant: 'mct-result', label: 'Quiz réussi', rule: 'Score ≥ seuil' },
    },
    {
      id: 't2-r2', type: 'process', position: { x: 370, y: 520 },
      data: { variant: 'mct-result', label: 'En attente de correction', rule: 'Correction manuelle requise' },
    },
    {
      id: 't2-r3', type: 'process', position: { x: 640, y: 520 },
      data: { variant: 'mct-result', label: 'Quiz échoué', rule: 'Score < seuil', fail: true },
    },
  ],
  edges: [
    { id: 'e-t2-e1-s', source: 't2-e1', target: 't2-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-e2-s', source: 't2-e2', target: 't2-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-e3-s', source: 't2-e3', target: 't2-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-s-op', source: 't2-s', target: 't2-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-op-r1', source: 't2-op', target: 't2-r1', sourceHandle: 'Score ≥ seuil', type: 'traitement', data: {} },
    { id: 'e-t2-op-r2', source: 't2-op', target: 't2-r2', sourceHandle: 'Correction manuelle requise', type: 'traitement', data: {} },
    { id: 'e-t2-op-r3', source: 't2-op', target: 't2-r3', sourceHandle: 'Score < seuil', type: 'traitement', data: { isDashed: true } },
  ],
}

