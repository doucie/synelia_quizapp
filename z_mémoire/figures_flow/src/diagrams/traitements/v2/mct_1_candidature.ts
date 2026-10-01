import type { DiagramDefinition } from '../../../types'

export const mct1Candidature: DiagramDefinition = {
  id: 'mct-v2-1-candidature',
  title: 'MCT v2 — Candidature',
  category: 'traitements',
  domain: 'MCT v2 — T1 · Candidature',
  nodes: [
    {
      id: 'mct1-e1', type: 'process', position: { x: 220, y: 20 },
      data: { variant: 'mct-event', label: 'Candidature déposée' },
    },
    {
      id: 'mct1-op', type: 'process', position: { x: 220, y: 200 },
      data: {
        variant: 'mct-syncop', label: 'T1 — Vérifier la recevabilité de la candidature',
        syncLabel: '',
        items: [
          'Vérifier l\'éligibilité du candidat',
          'Valider la disponibilité des places (quota non atteint)',
        ],
        emissionRules: ['Éligible ET Quota OK', 'Non éligible OU Quota atteint'],
      },
    },
    {
      id: 'mct1-r1', type: 'process', position: { x: 80, y: 420 },
      data: { variant: 'mct-result', label: 'Candidat accepté pour l\'étape suivante', rule: 'Éligible ET Quota OK' },
    },
    {
      id: 'mct1-r2', type: 'process', position: { x: 400, y: 420 },
      data: { variant: 'mct-result', label: 'Candidature rejetée', rule: 'Non éligible OU Quota atteint', fail: true },
    },
  ],
  edges: [
    { id: 'e-mct1-e1-op', source: 'mct1-e1', target: 'mct1-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-mct1-op-r1', source: 'mct1-op', target: 'mct1-r1', sourceHandle: 'Éligible ET Quota OK', type: 'traitement', data: {} },
    { id: 'e-mct1-op-r2', source: 'mct1-op', target: 'mct1-r2', sourceHandle: 'Non éligible OU Quota atteint', type: 'traitement', data: { isDashed: true } },
  ],
}
