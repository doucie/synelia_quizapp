// @ts-nocheck
import type { DiagramDefinition } from '../../types'

export const mct3DecisionAudit: DiagramDefinition = {
  id: 'mct-3-decision-audit',
  title: 'MCT 3 — Décision, Rollback & Audit',
  category: 'archive',
  domain: 'MCT 3 — Décision, Rollback & Audit (T4+T5+T6)',
  nodes: [
    /* ═══ T4 — VALIDER LA DÉCISION DU RECRUTEUR ═══ */
    {
      id: 't4-e1', type: 'process', position: { x: 20, y: 20 },
      data: { variant: 'mct-event', label: 'Candidat en phase de décision' },
    },
    {
      id: 't4-e2', type: 'process', position: { x: 520, y: 20 },
      data: { variant: 'mct-event', label: 'Décision du recruteur' },
    },
    {
      id: 't4-s', type: 'process', position: { x: 290, y: 140 },
      data: { variant: 'mct-sync', label: 'ET' },
    },
    {
      id: 't4-op', type: 'process', position: { x: 80, y: 250 },
      data: {
        variant: 'mct-operation', label: 'Valider la décision du recruteur',
        items: [
          'Vérifier les droits du recruteur (habilitation)',
          'Recueillir la justification de la décision',
          'Enregistrer dans l\'audit',
        ],
        emissionRules: ['Décision favorable', 'Décision en sursis', 'Décision défavorable'],
      },
    },
    {
      id: 't4-r1', type: 'process', position: { x: 80, y: 520 },
      data: { variant: 'mct-result', label: 'Candidat retenu', rule: 'Décision favorable' },
    },
    {
      id: 't4-r2', type: 'process', position: { x: 370, y: 520 },
      data: { variant: 'mct-result', label: 'Candidat en attente', rule: 'Décision en sursis' },
    },
    {
      id: 't4-r3', type: 'process', position: { x: 660, y: 520 },
      data: { variant: 'mct-result', label: 'Candidat refusé', rule: 'Décision défavorable', fail: true },
    },

    /* ═══ T5 — GÉRER LA DEMANDE D'ANNULATION ═══ */
    {
      id: 't5-e1', type: 'process', position: { x: 150, y: 720 },
      data: { variant: 'mct-event', label: 'Décision antérieure non immuable' },
    },
    {
      id: 't5-e2', type: 'process', position: { x: 430, y: 720 },
      data: { variant: 'mct-event', label: 'Demande d\'annulation formulée' },
    },
    {
      id: 't5-s', type: 'process', position: { x: 290, y: 840 },
      data: { variant: 'mct-sync', label: 'ET' },
    },
    {
      id: 't5-op', type: 'process', position: { x: 150, y: 950 },
      data: {
        variant: 'mct-operation', label: 'Gérer la demande d\'annulation',
        items: [
          'Vérifier les droits du recruteur (habilitation à annuler)',
          'Vérifier si l\'annulation est possible',
          'Recueillir le justificatif (obligatoire)',
          'Enregistrer dans l\'audit',
        ],
        emissionRules: ['Annulation autorisée', 'Décision immuable'],
      },
    },
    {
      id: 't5-r1', type: 'process', position: { x: 150, y: 1200 },
      data: { variant: 'mct-result', label: 'Étape réouverte', rule: 'Annulation autorisée' },
    },
    {
      id: 't5-r2', type: 'process', position: { x: 480, y: 1200 },
      data: { variant: 'mct-result', label: 'Décision inchangée', rule: 'Décision immuable', fail: true },
    },

    /* ═══ T6 — AUDIT TRANSVERSE ═══ */
    {
      id: 't6-e1', type: 'process', position: { x: 250, y: 1370 },
      data: { variant: 'mct-event', label: 'Toute opération métier' },
    },
    {
      id: 't6-s', type: 'process', position: { x: 250, y: 1490 },
      data: { variant: 'mct-sync', label: '' },
    },
    {
      id: 't6-op', type: 'process', position: { x: 680, y: 20 },
      data: {
        variant: 'mct-operation', label: 'T6 — Journaliser audit_event',
        items: [
          'Comparer l\'état avant et après changement',
          'Identifier qui a fait le changement',
          'Enregistrer la trace dans l\'audit',
        ],
        emissionRules: ['Opération journalisée'],
      },
    },
    {
      id: 't6-r1', type: 'process', position: { x: 730, y: 230 },
      data: { variant: 'mct-result', label: 'Trace enregistrée', rule: 'Opération journalisée' },
    },
  ],
  edges: [
    /* T4 edges */
    { id: 'e-t4-e1-s', source: 't4-e1', target: 't4-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-e2-s', source: 't4-e2', target: 't4-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-s-op', source: 't4-s', target: 't4-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-op-r1', source: 't4-op', target: 't4-r1', sourceHandle: 'Décision favorable', type: 'traitement', data: {} },
    { id: 'e-t4-op-r2', source: 't4-op', target: 't4-r2', sourceHandle: 'Décision en sursis', type: 'traitement', data: {} },
    { id: 'e-t4-op-r3', source: 't4-op', target: 't4-r3', sourceHandle: 'Décision défavorable', type: 'traitement', data: { isDashed: true } },
    /* T5 edges */
    { id: 'e-t5-e1-s', source: 't5-e1', target: 't5-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t5-e2-s', source: 't5-e2', target: 't5-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t5-s-op', source: 't5-s', target: 't5-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t5-op-r1', source: 't5-op', target: 't5-r1', sourceHandle: 'Annulation autorisée', type: 'traitement', data: {} },
    { id: 'e-t5-op-r2', source: 't5-op', target: 't5-r2', sourceHandle: 'Décision immuable', type: 'traitement', data: { isDashed: true } },
    /* T6 edges */
    { id: 'e-t6-e1-s', source: 't6-e1', target: 't6-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t6-s-op', source: 't6-s', target: 't6-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t6-op-r1', source: 't6-op', target: 't6-r1', type: 'traitement', data: {} },
    /* Cross-section edges */
    { id: 'e-t4-op-t6-op', source: 't4-op', target: 't6-op', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t5-op-t6-op', source: 't5-op', target: 't6-op', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t4-r1-t5-e1', source: 't4-r1', target: 't5-e1', type: 'traitement', data: { isDashed: true } },
  ],
}

