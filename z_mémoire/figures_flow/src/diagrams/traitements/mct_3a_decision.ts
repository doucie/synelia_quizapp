import type { DiagramDefinition } from '../../types'

export const mct3aDecision: DiagramDefinition = {
  id: 'mct-3a-decision',
  title: 'MCT 3a — Décision',
  category: 'traitements',
  domain: 'MCT 3a — T4 · Prononcer une décision (présélection ou finale)',
  nodes: [
    {
      id: 't4-e1', type: 'process', position: { x: 20, y: 20 },
      data: { variant: 'mct-event', label: 'Round DECISION ouvert', detail: '<code>PRESELECTION</code> ou <code>DECISION</code><br/>en statut <code>OPENED</code>' },
    },
    {
      id: 't4-e2', type: 'process', position: { x: 270, y: 20 },
      data: { variant: 'mct-event', label: 'Recruteur saisit décision', detail: 'Type = <code>RECRUTE</code> / <code>NON_RETENU</code><br/>/ <code>EN_ATTENTE</code>' },
    },
    {
      id: 't4-e3', type: 'process', position: { x: 520, y: 20 },
      data: { variant: 'mct-event', label: 'Habilitation OK', detail: '<code>entity_permission</code><br/>= <code>CAN_DECIDE</code> sur campagne' },
    },
    {
      id: 't4-s', type: 'process', position: { x: 230, y: 140 },
      data: { variant: 'mct-sync', label: 'Synchronisation', expression: 't4-e1 ∧ t4-e2 ∧ t4-e3' },
    },
    {
      id: 't4-op', type: 'process', position: { x: 80, y: 250 },
      data: {
        variant: 'mct-operation', label: 'T4 — Prononcer une décision (présélection ou finale)',
        items: [
          'Créer <code>decisions</code> (FK <code>application_progress_id</code>, <code>decision_mode = NORMAL</code>)',
          'Renseigner <code>justification</code> si non triviale',
          'Valider l\'<code>application_progress</code> (<code>validated_at</code>, <code>validated_by</code>)',
          'Recalculer <code>applications.current_application_progress_id</code> et ouvrir le round suivant',
          'Si décision finale <code>NON_RETENU</code> : verrouiller la candidature',
          'Évaluer règles <code>ON_PRESELECTION_*</code> / <code>ON_FINAL_DECISION</code>',
          'Si <code>requires_manual_confirmation</code> : créer <code>mail_log</code> en attente',
          'Émettre <code>audit_event</code> DECIDE',
        ],
      },
    },
    {
      id: 't4-r1', type: 'process', position: { x: 80, y: 520 },
      data: { variant: 'mct-result', label: 'R1 · Round suivant ouvert', detail: 'Pour décision intermédiaire :<br/>nouvelle ligne <code>application_progress</code>.' },
    },
    {
      id: 't4-r2', type: 'process', position: { x: 370, y: 520 },
      data: { variant: 'mct-result', label: 'R2 · Candidature finalisée', detail: 'Décision finale <code>RECRUTE</code> /<br/><code>NON_RETENU</code> + mail final.' },
    },
    {
      id: 't4-r3', type: 'process', position: { x: 660, y: 520 },
      data: { variant: 'mct-result', label: 'R3 · Confirmation manuelle', detail: 'Mail en attente,<br/>recruteur doit confirmer envoi.' },
    },
  ],
  edges: [
    { id: 'e-t4-e1-s', source: 't4-e1', target: 't4-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-e2-s', source: 't4-e2', target: 't4-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-e3-s', source: 't4-e3', target: 't4-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-s-op', source: 't4-s', target: 't4-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-op-r1', source: 't4-op', target: 't4-r1', type: 'traitement', data: {} },
    { id: 'e-t4-op-r2', source: 't4-op', target: 't4-r2', type: 'traitement', data: {} },
    { id: 'e-t4-op-r3', source: 't4-op', target: 't4-r3', type: 'traitement', data: { isDashed: true } },
  ],
}
