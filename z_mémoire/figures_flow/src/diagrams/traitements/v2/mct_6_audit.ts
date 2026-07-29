import type { DiagramDefinition } from '../../../types'

export const mct6Audit: DiagramDefinition = {
  id: 'mct-v2-6-audit',
  title: 'MCT v2 — Audit',
  category: 'traitements',
  domain: 'MCT v2 — T6 · Audit',
  nodes: [
    {
      id: 'mct6-e1', type: 'process', position: { x: 220, y: 20 },
      data: { variant: 'mct-event', label: 'Opération métier réalisée' },
    },
    {
      id: 'mct6-op', type: 'process', position: { x: 220, y: 200 },
      data: {
        variant: 'mct-syncop', label: 'T6 — Journaliser l\'audit',
        syncLabel: '',
        items: [
          'Enregistrer la trace d\'audit',
        ],
        emissionRules: ['Toujours'],
      },
    },
    {
      id: 'mct6-r1', type: 'process', position: { x: 220, y: 420 },
      data: { variant: 'mct-result', label: 'Trace enregistrée', rule: 'Toujours' },
    },
  ],
  edges: [
    { id: 'e-mct6-e1-op', source: 'mct6-e1', target: 'mct6-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-mct6-op-r1', source: 'mct6-op', target: 'mct6-r1', sourceHandle: 'Toujours', type: 'traitement', data: {} },
  ],
}
