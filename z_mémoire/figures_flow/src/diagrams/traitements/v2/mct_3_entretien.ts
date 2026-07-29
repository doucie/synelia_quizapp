import type { DiagramDefinition } from '../../../types'

export const mct3Entretien: DiagramDefinition = {
  id: 'mct-v2-3-entretien',
  title: 'MCT v2 — Entretien',
  category: 'traitements',
  domain: 'MCT v2 — T3 · Entretien',
  nodes: [
    {
      id: 'mct3-e1', type: 'process', position: { x: 120, y: 20 },
      data: { variant: 'mct-event', label: 'Entretien planifié' },
    },
    {
      id: 'mct3-e2', type: 'process', position: { x: 420, y: 20 },
      data: { variant: 'mct-event', label: 'Évaluations soumises' },
    },
    {
      id: 'mct3-op', type: 'process', position: { x: 220, y: 200 },
      data: {
        variant: 'mct-syncop', label: 'T3 — Évaluer l\'entretien',
        syncLabel: 'ET',
        items: [
          'Consolider les évaluations',
          'Appliquer les critères de validation',
        ],
        emissionRules: ['Favorable', 'Insuffisant'],
      },
    },
    {
      id: 'mct3-r1', type: 'process', position: { x: 80, y: 400 },
      data: { variant: 'mct-result', label: 'Entretien validé', rule: 'Favorable' },
    },
    {
      id: 'mct3-r2', type: 'process', position: { x: 400, y: 400 },
      data: { variant: 'mct-result', label: 'Entretien refusé', rule: 'Insuffisant', fail: true },
    },
  ],
  edges: [
    { id: 'e-mct3-e1-op', source: 'mct3-e1', target: 'mct3-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-mct3-e2-op', source: 'mct3-e2', target: 'mct3-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-mct3-op-r1', source: 'mct3-op', target: 'mct3-r1', sourceHandle: 'Favorable', type: 'traitement', data: {} },
    { id: 'e-mct3-op-r2', source: 'mct3-op', target: 'mct3-r2', sourceHandle: 'Insuffisant', type: 'traitement', data: { isDashed: true } },
  ],
}
