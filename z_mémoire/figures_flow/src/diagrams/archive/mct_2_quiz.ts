import type { DiagramDefinition } from '../../types'

export const mct2Quiz: DiagramDefinition = {
  id: 'mct-v2-2-quiz',
  title: 'MCT v2 — Quiz',
  category: 'archive',
  domain: 'MCT v2 — T2 · Quiz',
  nodes: [
    {
      id: 'mct2-e1', type: 'process', position: { x: 220, y: 20 },
      data: { variant: 'mct-event', label: 'Quiz soumis par le candidat' },
    },
    {
      id: 'mct2-op', type: 'process', position: { x: 220, y: 200 },
      data: {
        variant: 'mct-syncop', label: 'T2 — Corriger le quiz',
        syncLabel: '',
        items: [
          'Calculer le score',
          'Appliquer les règles de sélection',
        ],
        emissionRules: ['Score ≥ seuil', 'Score < seuil'],
      },
    },
    {
      id: 'mct2-r1', type: 'process', position: { x: 80, y: 400 },
      data: { variant: 'mct-result', label: 'Quiz validé', rule: 'Score ≥ seuil' },
    },
    {
      id: 'mct2-r2', type: 'process', position: { x: 400, y: 400 },
      data: { variant: 'mct-result', label: 'Quiz échoué', rule: 'Score < seuil', fail: true },
    },
  ],
  edges: [
    { id: 'e-mct2-e1-op', source: 'mct2-e1', target: 'mct2-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-mct2-op-r1', source: 'mct2-op', target: 'mct2-r1', sourceHandle: 'Score ≥ seuil', type: 'traitement', data: {} },
    { id: 'e-mct2-op-r2', source: 'mct2-op', target: 'mct2-r2', sourceHandle: 'Score < seuil', type: 'traitement', data: { isDashed: true } },
  ],
}
