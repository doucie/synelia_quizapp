import type { DiagramDefinition } from '../../types'

export const mct7Annulation: DiagramDefinition = {
  id: 'mct-v2-7-annulation',
  title: 'MCT v2 — Annulation',
  category: 'archive',
  domain: 'MCT v2 — T7 · Annulation',
  nodes: [
    {
      id: 'mct7-e1', type: 'process', position: { x: 220, y: 20 },
      data: { variant: 'mct-event', label: 'Demande d\'annulation' },
    },
    {
      id: 'mct7-op', type: 'process', position: { x: 220, y: 200 },
      data: {
        variant: 'mct-syncop', label: 'T7 — Traiter l\'annulation',
        syncLabel: '',
        items: [
          'Vérifier l\'éligibilité à l\'annulation',
        ],
        emissionRules: ['Autorisée', 'Refusée'],
      },
    },
    {
      id: 'mct7-r1', type: 'process', position: { x: 80, y: 420 },
      data: { variant: 'mct-result', label: 'Décision annulée', rule: 'Autorisée' },
    },
    {
      id: 'mct7-r2', type: 'process', position: { x: 400, y: 420 },
      data: { variant: 'mct-result', label: 'Décision maintenue', rule: 'Refusée', fail: true },
    },
  ],
  edges: [
    { id: 'e-mct7-e1-op', source: 'mct7-e1', target: 'mct7-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-mct7-op-r1', source: 'mct7-op', target: 'mct7-r1', sourceHandle: 'Autorisée', type: 'traitement', data: {} },
    { id: 'e-mct7-op-r2', source: 'mct7-op', target: 'mct7-r2', sourceHandle: 'Refusée', type: 'traitement', data: { isDashed: true } },
  ],
}
