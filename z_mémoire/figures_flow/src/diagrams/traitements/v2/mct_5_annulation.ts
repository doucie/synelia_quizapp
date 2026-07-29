import type { DiagramDefinition } from '../../../types'

export const mct5Annulation: DiagramDefinition = {
  id: 'mct-v2-5-annulation',
  title: 'MCT v2 — Annulation',
  category: 'traitements',
  domain: 'MCT v2 — T5 · Annulation',
  nodes: [
    {
      id: 'mct5-e1', type: 'process', position: { x: 220, y: 20 },
      data: { variant: 'mct-event', label: 'Demande d\'annulation' },
    },
    {
      id: 'mct5-op', type: 'process', position: { x: 220, y: 200 },
      data: {
        variant: 'mct-syncop', label: 'T5 — Traiter l\'annulation',
        syncLabel: '',
        items: [
          'Vérifier l\'éligibilité à l\'annulation',
        ],
        emissionRules: ['Autorisée', 'Refusée'],
      },
    },
    {
      id: 'mct5-r1', type: 'process', position: { x: 80, y: 420 },
      data: { variant: 'mct-result', label: 'Décision annulée', rule: 'Autorisée' },
    },
    {
      id: 'mct5-r2', type: 'process', position: { x: 400, y: 420 },
      data: { variant: 'mct-result', label: 'Décision maintenue', rule: 'Refusée', fail: true },
    },
  ],
  edges: [
    { id: 'e-mct5-e1-op', source: 'mct5-e1', target: 'mct5-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-mct5-op-r1', source: 'mct5-op', target: 'mct5-r1', sourceHandle: 'Autorisée', type: 'traitement', data: {} },
    { id: 'e-mct5-op-r2', source: 'mct5-op', target: 'mct5-r2', sourceHandle: 'Refusée', type: 'traitement', data: { isDashed: true } },
  ],
}
