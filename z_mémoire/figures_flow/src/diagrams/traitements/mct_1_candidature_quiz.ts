import type { DiagramDefinition } from '../../types'

export const mct1CandidatureQuiz: DiagramDefinition = {
  id: 'mct-1-candidature-quiz',
  title: 'MCT 1 — Candidature & Quiz',
  category: 'reference',
  domain: 'MCT 1 — Candidature & Quiz (T1+T2)',
  nodes: [
    /* ═══ T1 — SOUMETTRE CANDIDATURE ═══ */
    {
      id: 't1-e1', type: 'process', position: { x: 20, y: 20 },
      data: { variant: 'mct-event', label: 'Campagne ouverte et accessible' },
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
          'Enregistrer la candidature avec les infos du candidat',
          'Lancer le parcours de sélection prévu par la campagne',
          'Ouvrir la première étape du parcours',
          'Remettre les scores à zéro',
        ],
        emissionRules: ['OK', 'Quota atteint', 'Token invalide'],
      },
    },
    {
      id: 't1-r1', type: 'process', position: { x: 80, y: 490 },
      data: { variant: 'mct-result', label: 'Candidature enregistrée', rule: 'OK' },
    },
    {
      id: 't1-r2', type: 'process', position: { x: 370, y: 490 },
      data: { variant: 'mct-result', label: 'Quota dépassé', rule: 'Quota atteint', fail: true },
    },
    {
      id: 't1-r3', type: 'process', position: { x: 640, y: 490 },
      data: { variant: 'mct-result', label: 'Lien invalide', rule: 'Token invalide', fail: true },
    },

    /* ═══ T2 — PASSER LE QUIZ ═══ */
    {
      id: 't2-e1', type: 'process', position: { x: 20, y: 670 },
      data: { variant: 'mct-event', label: 'Étape de quiz active' },
    },
    {
      id: 't2-e2', type: 'process', position: { x: 270, y: 670 },
      data: { variant: 'mct-event', label: 'Quiz démarré par le candidat' },
    },
    {
      id: 't2-e3', type: 'process', position: { x: 520, y: 670 },
      data: { variant: 'mct-event', label: 'Quota de tentatives non atteint' },
    },
    {
      id: 't2-s', type: 'process', position: { x: 290, y: 790 },
      data: { variant: 'mct-sync', label: 'ET' },
    },
    {
      id: 't2-op', type: 'process', position: { x: 80, y: 900 },
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
      id: 't2-r1', type: 'process', position: { x: 80, y: 1170 },
      data: { variant: 'mct-result', label: 'Quiz réussi', rule: 'Score ≥ seuil' },
    },
    {
      id: 't2-r2', type: 'process', position: { x: 370, y: 1170 },
      data: { variant: 'mct-result', label: 'En attente de correction', rule: 'Correction manuelle requise' },
    },
    {
      id: 't2-r3', type: 'process', position: { x: 640, y: 1170 },
      data: { variant: 'mct-result', label: 'Quiz échoué', rule: 'Score < seuil', fail: true },
    },
  ],
  edges: [
    { id: 'e-t1-e1-s', source: 't1-e1', target: 't1-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-e2-s', source: 't1-e2', target: 't1-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-e3-s', source: 't1-e3', target: 't1-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-e4-s', source: 't1-e4', target: 't1-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-s-op', source: 't1-s', target: 't1-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-op-r1', source: 't1-op', target: 't1-r1', sourceHandle: 'OK', type: 'traitement', data: {} },
    { id: 'e-t1-op-r2', source: 't1-op', target: 't1-r2', sourceHandle: 'Quota atteint', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t1-op-r3', source: 't1-op', target: 't1-r3', sourceHandle: 'Token invalide', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t1-r1-t2-e1', source: 't1-r1', target: 't2-e1', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t2-e1-s', source: 't2-e1', target: 't2-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-e2-s', source: 't2-e2', target: 't2-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-e3-s', source: 't2-e3', target: 't2-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-s-op', source: 't2-s', target: 't2-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-op-r1', source: 't2-op', target: 't2-r1', sourceHandle: 'Score ≥ seuil', type: 'traitement', data: {} },
    { id: 'e-t2-op-r2', source: 't2-op', target: 't2-r2', sourceHandle: 'Correction manuelle requise', type: 'traitement', data: {} },
    { id: 'e-t2-op-r3', source: 't2-op', target: 't2-r3', sourceHandle: 'Score < seuil', type: 'traitement', data: { isDashed: true } },
  ],
}
