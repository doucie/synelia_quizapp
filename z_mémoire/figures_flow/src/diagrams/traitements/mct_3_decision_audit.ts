import type { DiagramDefinition } from '../../types'

export const mct3DecisionAudit: DiagramDefinition = {
  id: 'mct-3-decision-audit',
  title: 'MCT 3 — Décision, Rollback & Audit',
  category: 'reference',
  domain: 'MCT 3 — Décision, Rollback & Audit (T4+T5+T6)',
  nodes: [
    /* ═══ T4 — PRONONCER UNE DÉCISION ═══ */
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

    /* ═══ T5 — ANNULER / ROLLBACK ═══ */
    {
      id: 't5-e1', type: 'process', position: { x: 150, y: 720 },
      data: { variant: 'mct-event', label: 'Décision antérieure existe', detail: '<code>decisions</code> ciblée non immuable<br/>(pas d\'ancre verrouillée)' },
    },
    {
      id: 't5-e2', type: 'process', position: { x: 430, y: 720 },
      data: { variant: 'mct-event', label: 'Recruteur annule / rollback', detail: 'Action <code>CANCEL</code> ou <code>ROLLBACK</code><br/>+ <code>justification</code> obligatoire' },
    },
    {
      id: 't5-s', type: 'process', position: { x: 290, y: 840 },
      data: { variant: 'mct-sync', label: 'Synchronisation', expression: 't5-e1 ∧ t5-e2' },
    },
    {
      id: 't5-op', type: 'process', position: { x: 150, y: 950 },
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
      id: 't5-r1', type: 'process', position: { x: 150, y: 1200 },
      data: { variant: 'mct-result', label: 'R1 · Parcours réouvert', detail: 'Le round redevient actif,<br/>notification recruteur.' },
    },
    {
      id: 't5-r2', type: 'process', position: { x: 480, y: 1200 },
      data: { variant: 'mct-result', label: 'R2 · Refus (décision ancrée)', detail: 'Annulation interdite,<br/>audit SECURITY.', fail: true },
    },

    /* ═══ T6 — AUDIT TRANSVERSE ═══ */
    {
      id: 't6-e1', type: 'process', position: { x: 250, y: 1370 },
      data: { variant: 'mct-event', label: 'Toute opération métier', detail: 'CREATE / UPDATE / DELETE / SUBMIT / CLOSE / VALIDATE / DECIDE / CANCEL' },
    },
    {
      id: 't6-op', type: 'process', position: { x: 680, y: 20 },
      data: {
        variant: 'mct-operation', label: 'T6 — Journaliser audit_event (transverse)',
        items: [
          'Sérialiser <code>before_json</code> / <code>after_json</code>',
          'Capturer acteur, type d\'entité, identifiant',
          'Persister <code>audit_event</code> sans bloquer l\'opération principale',
        ],
      },
    },
    {
      id: 't6-r1', type: 'process', position: { x: 730, y: 230 },
      data: { variant: 'mct-result', label: 'R · Trace conservée', detail: 'Disponible pour reporting<br/>et conformité RGPD.' },
    },
  ],
  edges: [
    /* T4 */
    { id: 'e-t4-e1-s', source: 't4-e1', target: 't4-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-e2-s', source: 't4-e2', target: 't4-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-e3-s', source: 't4-e3', target: 't4-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-s-op', source: 't4-s', target: 't4-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-op-r1', source: 't4-op', target: 't4-r1', type: 'traitement', data: {} },
    { id: 'e-t4-op-r2', source: 't4-op', target: 't4-r2', type: 'traitement', data: {} },
    { id: 'e-t4-op-r3', source: 't4-op', target: 't4-r3', type: 'traitement', data: { isDashed: true } },

    /* T5 */
    { id: 'e-t5-e1-s', source: 't5-e1', target: 't5-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t5-e2-s', source: 't5-e2', target: 't5-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t5-s-op', source: 't5-s', target: 't5-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t5-op-r1', source: 't5-op', target: 't5-r1', type: 'traitement', data: {} },
    { id: 'e-t5-op-r2', source: 't5-op', target: 't5-r2', type: 'traitement', data: { isDashed: true } },

    /* T6 */
    { id: 'e-t6-e1-op', source: 't6-e1', target: 't6-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t6-op-r1', source: 't6-op', target: 't6-r1', type: 'traitement', data: {} },

    /* Inter-traitements */
    { id: 'e-t4-op-t6-op', source: 't4-op', target: 't6-op', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t5-op-t6-op', source: 't5-op', target: 't6-op', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t4-r1-t5-e1', source: 't4-r1', target: 't5-e1', type: 'traitement', data: { isDashed: true } },
  ],
}
