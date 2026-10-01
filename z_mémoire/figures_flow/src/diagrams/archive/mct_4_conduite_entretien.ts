import type { DiagramDefinition } from '../../types'

export const mct4ConduiteEntretien: DiagramDefinition = {
  id: 'mct-v2-4-conduite-entretien',
  title: 'MCT v2 — Conduire l\'entretien',
  category: 'archive',
  domain: 'MCT v2 — T4 · Conduire l\'entretien',
  nodes: [
    {
      id: 'mct4-e1', type: 'process', position: { x: 220, y: 20 },
      data: { variant: 'mct-event', label: 'Date et heure de l\'entretien atteintes' },
    },
    {
      id: 'mct4-op', type: 'process', position: { x: 220, y: 200 },
      data: {
        variant: 'mct-syncop', label: 'T4 — Conduire l\'entretien',
        syncLabel: '',
        items: [
          'Vérifier la présence du candidat',
          'Notifier les participants',
        ],
        emissionRules: ['Candidat présent', 'Candidat absent', 'Report demandé'],
      },
    },
    {
      id: 'mct4-r1', type: 'process', position: { x: 30, y: 420 },
      data: { variant: 'mct-result', label: 'Entretien en cours', rule: 'Candidat présent' },
    },
    {
      id: 'mct4-r2', type: 'process', position: { x: 220, y: 420 },
      data: { variant: 'mct-result', label: 'Entretien annulé', rule: 'Candidat absent', fail: true },
    },
    {
      id: 'mct4-r3', type: 'process', position: { x: 410, y: 420 },
      data: { variant: 'mct-result', label: 'Entretien reporté', rule: 'Report demandé' },
    },
  ],
  edges: [
    { id: 'e-mct4-e1-op', source: 'mct4-e1', target: 'mct4-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-mct4-op-r1', source: 'mct4-op', target: 'mct4-r1', sourceHandle: 'Candidat présent', type: 'traitement', data: {} },
    { id: 'e-mct4-op-r2', source: 'mct4-op', target: 'mct4-r2', sourceHandle: 'Candidat absent', type: 'traitement', data: { isDashed: true } },
    { id: 'e-mct4-op-r3', source: 'mct4-op', target: 'mct4-r3', sourceHandle: 'Report demandé', type: 'traitement', data: {} },
  ],
}