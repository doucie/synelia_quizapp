import type { DiagramDefinition } from '../../types'

export const mct2EntretienEvaluation: DiagramDefinition = {
  id: 'mct-2-entretien-evaluation',
  title: 'MCT 2 — Entretien & Évaluation',
  category: 'traitements',
  domain: 'MCT 2 — Entretien & Évaluation (T3)',
  nodes: [
    {
      id: 't3-e1', type: 'process', position: { x: 20, y: 20 },
      data: { variant: 'mct-event', label: 'Round INTERVIEW ouvert', detail: '<code>application_progress</code><br/>de type <code>INTERVIEW</code> en <code>OPENED</code>' },
    },
    {
      id: 't3-e2', type: 'process', position: { x: 270, y: 20 },
      data: { variant: 'mct-event', label: 'Recruteur planifie', detail: 'Saisie date / type / lieu<br/>+ <code>interview_participant</code>' },
    },
    {
      id: 't3-e3', type: 'process', position: { x: 520, y: 20 },
      data: { variant: 'mct-event', label: 'Réponse candidat reçue', detail: '<code>candidate_response_status</code><br/>= <code>ACCEPTED</code> / <code>REFUSED</code> / <code>ALT</code>' },
    },
    {
      id: 't3-e4', type: 'process', position: { x: 770, y: 20 },
      data: { variant: 'mct-event', label: 'Évaluateurs soumettent', detail: 'Toutes les <code>evaluations</code><br/>du participant sont <code>SUBMITTED</code>' },
    },
    {
      id: 't3-s', type: 'process', position: { x: 290, y: 140 },
      data: { variant: 'mct-sync', label: 'Synchronisation', expression: 't3-e1 ∧ t3-e2 ∧ (t3-e3 = ACCEPTED) ∧ t3-e4' },
    },
    {
      id: 't3-op', type: 'process', position: { x: 80, y: 250 },
      data: {
        variant: 'mct-operation', label: 'T3 — Conduire le cycle entretien → évaluation',
        items: [
          'Créer <code>interviews</code> (FK <code>application_progress_id</code>) + <code>candidate_interview</code>',
          'Créer <code>interview_participant</code> (recruteurs et évaluateurs)',
          'Notifier le candidat (règle <code>ON_INTERVIEW_PLANNED</code>) et collecter sa réponse',
          'Pour chaque évaluateur : créer <code>evaluations</code> + un <code>evaluation_item</code> par <code>pipeline_stage_evaluation_criterion</code>',
          'À la clôture : agréger les scores → <code>applications.aggregated_evaluation_score</code>',
          'Émettre <code>audit_event</code> CLOSE + VALIDATE',
        ],
      },
    },
    {
      id: 't3-r1', type: 'process', position: { x: 80, y: 510 },
      data: { variant: 'mct-result', label: 'R1 · Entretien validé', detail: 'Round INTERVIEW clôturé,<br/>passage au round DECISION.' },
    },
    {
      id: 't3-r2', type: 'process', position: { x: 390, y: 510 },
      data: { variant: 'mct-result', label: 'R2 · Candidat refuse', detail: 'Round annulé, candidature<br/>marquée <code>application_abandoned</code>.', fail: true },
    },
    {
      id: 't3-r3', type: 'process', position: { x: 680, y: 510 },
      data: { variant: 'mct-result', label: 'R3 · Alternative demandée', detail: 'Reschedule → boucle T3,<br/>notification recruteur.' },
    },
  ],
  edges: [
    { id: 'e-t3-e1-s', source: 't3-e1', target: 't3-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-e2-s', source: 't3-e2', target: 't3-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-e3-s', source: 't3-e3', target: 't3-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-e4-s', source: 't3-e4', target: 't3-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-s-op', source: 't3-s', target: 't3-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-op-r1', source: 't3-op', target: 't3-r1', type: 'traitement', data: {} },
    { id: 'e-t3-op-r2', source: 't3-op', target: 't3-r2', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t3-op-r3', source: 't3-op', target: 't3-r3', type: 'traitement', data: { isDashed: true } },
  ],
}
