import type { DiagramDefinition } from '../../types'

export const mct5Evaluation: DiagramDefinition = {
  id: 'mct-v2-5-evaluation',
  title: 'MCT v2 — Évaluation',
  category: 'archive',
  domain: 'MCT v2 — T5 · Évaluation',
  nodes: [
    {
      id: 'mct5-e1', type: 'process', position: { x: 220, y: 20 },
      data: { variant: 'mct-event', label: 'Fiches d\'évaluation renseignées' },
    },
    {
      id: 'mct5-op', type: 'process', position: { x: 220, y: 200 },
      data: {
        variant: 'mct-syncop', label: 'T5 — Synthétiser et arbitrer le bilan',
        syncLabel: 'ET',
        items: [
          'Consolider les évaluations',
          'Appliquer les critères de validation',
        ],
        emissionRules: ['Favorable', 'Insuffisant'],
      },
    },
    {
      id: 'mct5-r1', type: 'process', position: { x: 80, y: 400 },
      data: { variant: 'mct-result', label: 'Entretien validé', rule: 'Favorable' },
    },
    {
      id: 'mct5-r2', type: 'process', position: { x: 400, y: 400 },
      data: { variant: 'mct-result', label: 'Entretien refusé', rule: 'Insuffisant', fail: true },
    },
  ],
  edges: [
    { id: 'e-mct5-e1-op', source: 'mct5-e1', target: 'mct5-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-mct5-op-r1', source: 'mct5-op', target: 'mct5-r1', sourceHandle: 'Favorable', type: 'traitement', data: {} },
    { id: 'e-mct5-op-r2', source: 'mct5-op', target: 'mct5-r2', sourceHandle: 'Insuffisant', type: 'traitement', data: { isDashed: true } },
  ],
}