import type { DiagramDefinition } from '../../../types'

export const mct4Decision: DiagramDefinition = {
  id: 'mct-v2-4-decision',
  title: 'MCT v2 — Décision',
  category: 'traitements',
  domain: 'MCT v2 — T4 · Décision',
  nodes: [
    {
      id: 'mct4-e1', type: 'process', position: { x: 220, y: 20 },
      data: { variant: 'mct-event', label: 'Dossier prêt pour décision' },
    },
    {
      id: 'mct4-op', type: 'process', position: { x: 220, y: 200 },
      data: {
        variant: 'mct-syncop', label: 'T4 — Valider la décision',
        syncLabel: '',
        items: [
          'Appliquer la règle de décision',
        ],
        emissionRules: ['Favorable', 'En attente', 'Défavorable'],
      },
    },
    {
      id: 'mct4-r1', type: 'process', position: { x: 30, y: 420 },
      data: { variant: 'mct-result', label: 'Candidat retenu', rule: 'Favorable' },
    },
    {
      id: 'mct4-r2', type: 'process', position: { x: 220, y: 420 },
      data: { variant: 'mct-result', label: 'Candidat en attente', rule: 'En attente' },
    },
    {
      id: 'mct4-r3', type: 'process', position: { x: 410, y: 420 },
      data: { variant: 'mct-result', label: 'Candidat refusé', rule: 'Défavorable', fail: true },
    },
  ],
  edges: [
    { id: 'e-mct4-e1-op', source: 'mct4-e1', target: 'mct4-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-mct4-op-r1', source: 'mct4-op', target: 'mct4-r1', sourceHandle: 'Favorable', type: 'traitement', data: {} },
    { id: 'e-mct4-op-r2', source: 'mct4-op', target: 'mct4-r2', sourceHandle: 'En attente', type: 'traitement', data: {} },
    { id: 'e-mct4-op-r3', source: 'mct4-op', target: 'mct4-r3', sourceHandle: 'Défavorable', type: 'traitement', data: { isDashed: true } },
  ],
}
