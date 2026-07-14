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
      data: { variant: 'mct-event', label: 'Round DECISION ouvert' },
    },
    {
      id: 't4-e2', type: 'process', position: { x: 270, y: 20 },
      data: { variant: 'mct-event', label: 'Recruteur saisit décision' },
    },
    {
      id: 't4-e3', type: 'process', position: { x: 520, y: 20 },
      data: { variant: 'mct-event', label: 'Habilitation OK' },
    },
    {
      id: 't4-s', type: 'process', position: { x: 230, y: 140 },
      data: { variant: 'mct-sync', label: 'ET' },
    },
    {
      id: 't4-op', type: 'process', position: { x: 80, y: 250 },
      data: {
        variant: 'mct-operation', label: 'T4 — Prononcer une décision',
        items: [
          'Prendre la décision sur la candidature',
          'Clôturer l\'étape et passer à la suivante',
          'Si dernière étape et refus : clore définitivement',
        ],
        emissionRules: ['Round suivant ouvert', 'Candidature finalisée', 'Confirmation manuelle'],
      },
    },
    {
      id: 't4-r1', type: 'process', position: { x: 80, y: 520 },
      data: { variant: 'mct-result', label: 'Round suivant ouvert', rule: 'Round suivant ouvert' },
    },
    {
      id: 't4-r2', type: 'process', position: { x: 370, y: 520 },
      data: { variant: 'mct-result', label: 'Candidature finalisée', rule: 'Candidature finalisée' },
    },
    {
      id: 't4-r3', type: 'process', position: { x: 660, y: 520 },
      data: { variant: 'mct-result', label: 'Confirmation manuelle', rule: 'Confirmation manuelle' },
    },

    /* ═══ T5 — ANNULER / ROLLBACK ═══ */
    {
      id: 't5-e1', type: 'process', position: { x: 150, y: 720 },
      data: { variant: 'mct-event', label: 'Décision antérieure non immuable' },
    },
    {
      id: 't5-e2', type: 'process', position: { x: 430, y: 720 },
      data: { variant: 'mct-event', label: 'Recruteur annule / rollback' },
    },
    {
      id: 't5-s', type: 'process', position: { x: 290, y: 840 },
      data: { variant: 'mct-sync', label: 'ET' },
    },
    {
      id: 't5-op', type: 'process', position: { x: 150, y: 950 },
      data: {
        variant: 'mct-operation', label: 'T5 — Annuler / réouvrir une décision',
        items: [
          'Annuler ou revenir sur une décision',
          'Expliquer la raison de l\'annulation',
          'Rouvrir l\'étape concernée',
        ],
        emissionRules: ['Parcours réouvert', 'Refus (décision ancrée)'],
      },
    },
    {
      id: 't5-r1', type: 'process', position: { x: 150, y: 1200 },
      data: { variant: 'mct-result', label: 'Parcours réouvert', rule: 'Parcours réouvert' },
    },
    {
      id: 't5-r2', type: 'process', position: { x: 480, y: 1200 },
      data: { variant: 'mct-result', label: 'Refus (décision ancrée)', rule: 'Refus (décision ancrée)', fail: true },
    },

    /* ═══ T6 — AUDIT TRANSVERSE ═══ */
    {
      id: 't6-e1', type: 'process', position: { x: 250, y: 1370 },
      data: { variant: 'mct-event', label: 'Toute opération métier' },
    },
    {
      id: 't6-op', type: 'process', position: { x: 680, y: 20 },
      data: {
        variant: 'mct-operation', label: 'T6 — Journaliser audit_event',
        items: [
          'Comparer l\'état avant et après changement',
          'Identifier qui a fait le changement',
          'Enregistrer l\'historique sans ralentir le processus',
        ],
      },
    },
    {
      id: 't6-r1', type: 'process', position: { x: 730, y: 230 },
      data: { variant: 'mct-result', label: 'Trace conservée' },
    },
  ],
  edges: [
    { id: 'e-t4-e1-s', source: 't4-e1', target: 't4-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-e2-s', source: 't4-e2', target: 't4-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-e3-s', source: 't4-e3', target: 't4-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-s-op', source: 't4-s', target: 't4-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-op-r1', source: 't4-op', target: 't4-r1', sourceHandle: 'Round suivant ouvert', type: 'traitement', data: {} },
    { id: 'e-t4-op-r2', source: 't4-op', target: 't4-r2', sourceHandle: 'Candidature finalisée', type: 'traitement', data: {} },
    { id: 'e-t4-op-r3', source: 't4-op', target: 't4-r3', sourceHandle: 'Confirmation manuelle', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t5-e1-s', source: 't5-e1', target: 't5-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t5-e2-s', source: 't5-e2', target: 't5-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t5-s-op', source: 't5-s', target: 't5-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t5-op-r1', source: 't5-op', target: 't5-r1', sourceHandle: 'Parcours réouvert', type: 'traitement', data: {} },
    { id: 'e-t5-op-r2', source: 't5-op', target: 't5-r2', sourceHandle: 'Refus (décision ancrée)', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t6-e1-op', source: 't6-e1', target: 't6-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t6-op-r1', source: 't6-op', target: 't6-r1', type: 'traitement', data: {} },
    { id: 'e-t4-op-t6-op', source: 't4-op', target: 't6-op', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t5-op-t6-op', source: 't5-op', target: 't6-op', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t4-r1-t5-e1', source: 't4-r1', target: 't5-e1', type: 'traitement', data: { isDashed: true } },
  ],
}
