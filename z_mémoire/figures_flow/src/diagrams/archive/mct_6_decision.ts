import type { DiagramDefinition } from '../../types'

export const mct6Decision: DiagramDefinition = {
  id: 'mct-v2-6-decision',
  title: 'MCT v2 — Décision',
  category: 'archive',
  domain: 'MCT v2 — T6 · Décision',
  nodes: [
    {
      id: 'mct6-e1', type: 'process', position: { x: 220, y: 20 },
      data: { variant: 'mct-event', label: 'Prise de décision' },
    },
    {
      id: 'mct6-op', type: 'process', position: { x: 220, y: 200 },
      data: {
        variant: 'mct-syncop', label: 'T6 — Valider la décision',
        syncLabel: '',
        items: [
          'Appliquer la règle de décision',
        ],
        emissionRules: ['Favorable', 'Défavorable'],
      },
    },
    {
      id: 'mct6-r1', type: 'process', position: { x: 80, y: 450 },
      data: { variant: 'mct-result', label: 'Candidat retenu (RET)', rule: 'Favorable' },
    },
    {
      id: 'mct6-r2', type: 'process', position: { x: 400, y: 450 },
      data: { variant: 'mct-result', label: 'Candidat refusé (REF)', rule: 'Défavorable', fail: true },
    },
  ],
  edges: [
    { id: 'e-mct6-e1-op', source: 'mct6-e1', target: 'mct6-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-mct6-op-r1', source: 'mct6-op', target: 'mct6-r1', sourceHandle: 'Favorable', type: 'traitement', data: {} },
    { id: 'e-mct6-op-r2', source: 'mct6-op', target: 'mct6-r2', sourceHandle: 'Défavorable', type: 'traitement', data: { isDashed: true } },
  ],
}