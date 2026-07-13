import type { DiagramDefinition } from '../../types'

export const mct3bRollback: DiagramDefinition = {
  id: 'mct-3b-rollback',
  title: 'MCT 3b — Rollback',
  category: 'traitements',
  domain: 'MCT 3b — T5 · Annuler / réouvrir une décision',
  nodes: [
    {
      id: 't5-e1', type: 'process', position: { x: 150, y: 20 },
      data: { variant: 'mct-event', label: 'Décision antérieure existe', detail: '<code>decisions</code> ciblée non immuable<br/>(pas d\'ancre verrouillée)' },
    },
    {
      id: 't5-e2', type: 'process', position: { x: 430, y: 20 },
      data: { variant: 'mct-event', label: 'Recruteur annule / rollback', detail: 'Action <code>CANCEL</code> ou <code>ROLLBACK</code><br/>+ <code>justification</code> obligatoire' },
    },
    {
      id: 't5-s', type: 'process', position: { x: 290, y: 140 },
      data: { variant: 'mct-sync', label: 'Synchronisation', expression: 't5-e1 ∧ t5-e2' },
    },
    {
      id: 't5-op', type: 'process', position: { x: 150, y: 250 },
      data: {
        variant: 'mct-operation', label: 'T5 — Annuler / réouvrir une décision',
        items: [
          'Créer une nouvelle <code>decisions</code> avec <code>decision_mode = CANCEL</code> ou <code>ROLLBACK</code>',
          'Renseigner <code>cancels_decision_id</code> + <code>justification</code>',
          'Recalculer <code>applications.current_application_progress_id</code>',
          'Réouvrir l\'<code>application_progress</code> ciblé (<code>reopened_at</code>, <code>reopened_by</code>)',
          'Émettre <code>audit_event</code> CANCEL / ROLLBACK',
        ],
      },
    },
    {
      id: 't5-r1', type: 'process', position: { x: 150, y: 500 },
      data: { variant: 'mct-result', label: 'R1 · Parcours réouvert', detail: 'Le round redevient actif,<br/>notification recruteur.' },
    },
    {
      id: 't5-r2', type: 'process', position: { x: 480, y: 500 },
      data: { variant: 'mct-result', label: 'R2 · Refus (décision ancrée)', detail: 'Annulation interdite,<br/>audit SECURITY.', fail: true },
    },
  ],
  edges: [
    { id: 'e-t5-e1-s', source: 't5-e1', target: 't5-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t5-e2-s', source: 't5-e2', target: 't5-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t5-s-op', source: 't5-s', target: 't5-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t5-op-r1', source: 't5-op', target: 't5-r1', type: 'traitement', data: {} },
    { id: 'e-t5-op-r2', source: 't5-op', target: 't5-r2', type: 'traitement', data: { isDashed: true } },
  ],
}
