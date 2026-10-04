import type { DiagramDefinition } from '../../types'

export const mct8Audit: DiagramDefinition = {
  id: 'mct-v2-8-audit',
  title: 'MCT v2 — Audit',
  category: 'archive',
  domain: 'MCT v2 — T8 · Audit',
  nodes: [
    {
      id: 'mct8-e1', type: 'process', position: { x: 220, y: 20 },
      data: { variant: 'mct-event', label: 'Toute opération métier réalisée' },
    },
    {
      id: 'mct8-op', type: 'process', position: { x: 220, y: 200 },
      data: {
        variant: 'mct-syncop', label: 'T8 — Journaliser l\'audit',
        syncLabel: '',
        items: [
          'Enregistrer la trace d\'audit',
        ],
        emissionRules: ['Toujours'],
      },
    },
    {
      id: 'mct8-r1', type: 'process', position: { x: 220, y: 450 },
      data: { variant: 'mct-result', label: 'Trace enregistrée', rule: 'Toujours' },
    },
  ],
  edges: [
    { id: 'e-mct8-e1-op', source: 'mct8-e1', target: 'mct8-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-mct8-op-r1', source: 'mct8-op', target: 'mct8-r1', sourceHandle: 'Toujours', type: 'traitement', data: {} },
  ],
}
