import type { DiagramDefinition } from '../../types'

export const mct6Decision: DiagramDefinition = {
  id: 'mct-v2-6-decision',
  title: 'MCT v2 — Décision',
  category: 'archive',
  domain: 'MCT v2 — T6 · Décision',
  nodes: [
    {
      id: 'mct6-op', type: 'process', position: { x: 220, y: 200 },
      data: {
        variant: 'mct-syncop', label: 'T6 — Valider la décision',
        syncLabel: '',
        items: [
          'Appliquer la règle de décision',
        ],
        emissionRules: ['Favorable', 'En attente', 'Défavorable'],
      },
    },
    {
      id: 'mct6-r1', type: 'process', position: { x: 30, y: 420 },
      data: { variant: 'mct-result', label: 'Candidat retenu', rule: 'Favorable' },
    },
    {
      id: 'mct6-r2', type: 'process', position: { x: 220, y: 420 },
      data: { variant: 'mct-result', label: 'Candidat en attente', rule: 'En attente' },
    },
    {
      id: 'mct6-r3', type: 'process', position: { x: 410, y: 420 },
      data: { variant: 'mct-result', label: 'Candidat refusé', rule: 'Défavorable', fail: true },
    },
  ],
  edges: [
    { id: 'e-mct6-op-r1', source: 'mct6-op', target: 'mct6-r1', sourceHandle: 'Favorable', type: 'traitement', data: {} },
    { id: 'e-mct6-op-r2', source: 'mct6-op', target: 'mct6-r2', sourceHandle: 'En attente', type: 'traitement', data: {} },
    { id: 'e-mct6-op-r3', source: 'mct6-op', target: 'mct6-r3', sourceHandle: 'Défavorable', type: 'traitement', data: { isDashed: true } },
  ],
}