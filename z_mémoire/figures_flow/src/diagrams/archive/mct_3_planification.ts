import type { DiagramDefinition } from '../../types'

export const mct3Planification: DiagramDefinition = {
  id: 'mct-v2-3-planification',
  title: 'MCT v2 — Planification de l\'entretien',
  category: 'archive',
  domain: 'MCT v2 — T3 · Planification',
  nodes: [
    {
      id: 'mct3-e1', type: 'process', position: { x: 220, y: 20 },
      data: { variant: 'mct-event', label: 'Candidat accepté pour l\'évaluation' },
    },
    {
      id: 'mct3-op', type: 'process', position: { x: 220, y: 200 },
      data: {
        variant: 'mct-syncop', label: 'T3 — Planifier l\'entretien',
        syncLabel: '',
        items: [
          'Bloquer le créneau dans l\'agenda',
          'Envoyer l\'invitation au candidat et aux recruteurs',
        ],
        emissionRules: ['Toujours'],
      },
    },
    {
      id: 'mct3-r1', type: 'process', position: { x: 220, y: 420 },
      data: { variant: 'mct-result', label: 'Entretien planifié', rule: 'Toujours' },
    },
  ],
  edges: [
    { id: 'e-mct3-e1-op', source: 'mct3-e1', target: 'mct3-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-mct3-op-r1', source: 'mct3-op', target: 'mct3-r1', sourceHandle: 'Toujours', type: 'traitement', data: {} },
  ],
}