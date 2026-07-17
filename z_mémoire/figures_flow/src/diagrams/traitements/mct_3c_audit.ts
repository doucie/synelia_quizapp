import type { DiagramDefinition } from '../../types'

export const mct3cAudit: DiagramDefinition = {
  id: 'mct-3c-audit',
  title: 'MCT 3c — Audit',
  category: 'traitements',
  domain: 'MCT 3c — T6 · Journaliser audit_event',
  nodes: [
    {
      id: 't6-e1', type: 'process', position: { x: 80, y: 20 },
      data: { variant: 'mct-event', label: 'Toute opération métier' },
    },
    {
      id: 't6-s', type: 'process', position: { x: 80, y: 140 },
      data: { variant: 'mct-sync', label: '' },
    },
    {
      id: 't6-op', type: 'process', position: { x: 80, y: 260 },
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
      id: 't6-r1', type: 'process', position: { x: 80, y: 520 },
      data: { variant: 'mct-result', label: 'Trace enregistrée', rule: 'Opération journalisée' },
    },
  ],
  edges: [
    { id: 'e-t6-e1-s', source: 't6-e1', target: 't6-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t6-s-op', source: 't6-s', target: 't6-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t6-op-r1', source: 't6-op', target: 't6-r1', type: 'traitement', data: {} },
  ],
}
