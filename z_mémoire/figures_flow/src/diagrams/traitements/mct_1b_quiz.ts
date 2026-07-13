import type { DiagramDefinition } from '../../types'

export const mct1bQuiz: DiagramDefinition = {
  id: 'mct-1b-quiz',
  title: 'MCT 1b — Quiz',
  category: 'traitements',
  domain: 'MCT 1b — T2 · Passer le quiz du round courant',
  nodes: [
    {
      id: 't2-e1', type: 'process', position: { x: 20, y: 20 },
      data: { variant: 'mct-event', label: 'Round QUIZ ouvert', detail: '<code>application_progress</code> de type<br/><code>QUIZ</code> en statut <code>OPENED</code>' },
    },
    {
      id: 't2-e2', type: 'process', position: { x: 270, y: 20 },
      data: { variant: 'mct-event', label: 'Candidat ouvre /quiz/{token}', detail: 'Token de tentative résolu<br/>(ou nouvelle tentative permise)' },
    },
    {
      id: 't2-e3', type: 'process', position: { x: 520, y: 20 },
      data: { variant: 'mct-event', label: 'Quota tentatives', detail: '<code>config_json.max_attempts</code><br/>non atteint' },
    },
    {
      id: 't2-s', type: 'process', position: { x: 290, y: 140 },
      data: { variant: 'mct-sync', label: 'Synchronisation', expression: 't2-e1 ∧ t2-e2 ∧ t2-e3' },
    },
    {
      id: 't2-op', type: 'process', position: { x: 80, y: 250 },
      data: {
        variant: 'mct-operation', label: 'T2 — Passer le quiz du round courant',
        items: [
          'Créer <code>application_quiz_attempt</code> (FK <code>application_progress_id</code>) + <code>quiz_token</code>',
          'Résoudre <code>form_version</code> via <code>pipeline_stage.config_json.form_id</code>',
          'Persister chaque <code>candidate_answer</code> (FK <code>application_quiz_attempt_id</code>)',
          'À la complétion : agréger <code>score</code> / <code>score_percent</code> / <code>elapsed_time</code>',
          'Appliquer <code>screening_mode = AUTO_THRESHOLD</code> (comparer à <code>passing_score</code>)',
          'Mettre à jour <code>applications.aggregated_quiz_score(_percent)</code>',
          'Évaluer règle <code>ON_QUIZ_COMPLETED</code> + écrire <code>audit_event</code> SUBMIT',
        ],
      },
    },
    {
      id: 't2-r1', type: 'process', position: { x: 80, y: 520 },
      data: { variant: 'mct-result', label: 'R1 · Réussi (auto)', detail: 'Round QUIZ validé,<br/>progression auto vers le round suivant,<br/>notification recruteur.' },
    },
    {
      id: 't2-r2', type: 'process', position: { x: 370, y: 520 },
      data: { variant: 'mct-result', label: 'R2 · À corriger', detail: 'Tentative en attente de correction manuelle,<br/>notification évaluateur.' },
    },
    {
      id: 't2-r3', type: 'process', position: { x: 640, y: 520 },
      data: { variant: 'mct-result', label: 'R3 · Échec sous seuil', detail: 'Round QUIZ refusé,<br/>candidature marquée éliminée,<br/>mail <code>ON_QUIZ_FAILED</code>.', fail: true },
    },
  ],
  edges: [
    { id: 'e-t2-e1-s', source: 't2-e1', target: 't2-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-e2-s', source: 't2-e2', target: 't2-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-e3-s', source: 't2-e3', target: 't2-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-s-op', source: 't2-s', target: 't2-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-op-r1', source: 't2-op', target: 't2-r1', type: 'traitement', data: {} },
    { id: 'e-t2-op-r2', source: 't2-op', target: 't2-r2', type: 'traitement', data: {} },
    { id: 'e-t2-op-r3', source: 't2-op', target: 't2-r3', type: 'traitement', data: { isDashed: true } },
  ],
}
