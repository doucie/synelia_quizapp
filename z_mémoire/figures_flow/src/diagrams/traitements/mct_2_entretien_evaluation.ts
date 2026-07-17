import type { DiagramDefinition } from '../../types'

export const mct2EntretienEvaluation: DiagramDefinition = {
  id: 'mct-2-entretien-evaluation',
  title: 'MCT 2 — Entretien & Évaluation',
  category: 'traitements',
  domain: 'MCT 2 — Entretien & Évaluation (T3)',
  nodes: [
    {
      id: 't3-e1', type: 'process', position: { x: 20, y: 20 },
      data: { variant: 'mct-event', label: 'Entretien planifié' },
    },
    {
      id: 't3-e2', type: 'process', position: { x: 520, y: 20 },
      data: { variant: 'mct-event', label: 'Évaluations soumises' },
    },
    {
      id: 't3-s', type: 'process', position: { x: 290, y: 140 },
      data: { variant: 'mct-sync', label: 'ET' },
    },
    {
      id: 't3-op', type: 'process', position: { x: 80, y: 250 },
      data: {
        variant: 'mct-operation', label: 'Conduire et évaluer l\'entretien',
        items: [
          'Vérifier la présence du candidat',
          'Recueillir les évaluations des évaluateurs',
          'Calculer le score moyen par critère',
          'Valider ou refuser l\'entretien',
        ],
        emissionRules: ['Évaluations favorables', 'Candidat absent', 'Score insuffisant'],
      },
    },
    {
      id: 't3-r1', type: 'process', position: { x: 80, y: 530 },
      data: { variant: 'mct-result', label: 'Entretien validé', rule: 'Évaluations favorables' },
    },
    {
      id: 't3-r2', type: 'process', position: { x: 390, y: 530 },
      data: { variant: 'mct-result', label: 'Entretien annulé', rule: 'Candidat absent', fail: true },
    },
    {
      id: 't3-r3', type: 'process', position: { x: 680, y: 530 },
      data: { variant: 'mct-result', label: 'Entretien refusé', rule: 'Score insuffisant', fail: true },
    },
  ],
  edges: [
    { id: 'e-t3-e1-s', source: 't3-e1', target: 't3-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-e2-s', source: 't3-e2', target: 't3-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-s-op', source: 't3-s', target: 't3-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-op-r1', source: 't3-op', target: 't3-r1', sourceHandle: 'Évaluations favorables', type: 'traitement', data: {} },
    { id: 'e-t3-op-r2', source: 't3-op', target: 't3-r2', sourceHandle: 'Candidat absent', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t3-op-r3', source: 't3-op', target: 't3-r3', sourceHandle: 'Score insuffisant', type: 'traitement', data: { isDashed: true } },
  ],
}
