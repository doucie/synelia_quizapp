import type { DiagramDefinition } from '../../types'

export const mct3bRollback: DiagramDefinition = {
  id: 'mct-3b-rollback',
  title: 'MCT 3b — Rollback',
  category: 'traitements',
  domain: 'MCT 3b — T5 · Annuler / réouvrir une décision',
  nodes: [
    {
      id: 't5-e1', type: 'process', position: { x: 150, y: 20 },
      data: { variant: 'mct-event', label: 'Décision antérieure non immuable' },
    },
    {
      id: 't5-e2', type: 'process', position: { x: 430, y: 20 },
      data: { variant: 'mct-event', label: 'Recruteur annule / rollback' },
    },
    {
      id: 't5-s', type: 'process', position: { x: 290, y: 140 },
      data: { variant: 'mct-sync', label: 'ET' },
    },
    {
      id: 't5-op', type: 'process', position: { x: 150, y: 250 },
      data: {
        variant: 'mct-operation', label: 'T5 — Annuler / réouvrir une décision',
        items: [
          'Créer décision avec mode CANCEL ou ROLLBACK',
          'Lier à la décision annulée et justifier',
          'Réouvrir le round ciblé',
        ],
        emissionRules: ['Parcours réouvert', 'Refus (décision ancrée)'],
      },
    },
    {
      id: 't5-r1', type: 'process', position: { x: 150, y: 500 },
      data: { variant: 'mct-result', label: 'Parcours réouvert', rule: 'Parcours réouvert' },
    },
    {
      id: 't5-r2', type: 'process', position: { x: 480, y: 500 },
      data: { variant: 'mct-result', label: 'Refus (décision ancrée)', rule: 'Refus (décision ancrée)', fail: true },
    },
  ],
  edges: [
    { id: 'e-t5-e1-s', source: 't5-e1', target: 't5-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t5-e2-s', source: 't5-e2', target: 't5-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t5-s-op', source: 't5-s', target: 't5-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t5-op-r1', source: 't5-op', target: 't5-r1', type: 'traitement', data: {} },
    { id: 'e-t5-op-r2', source: 't5-op', target: 't5-r2', type: 'traitement', data: { isDashed: true } },
  ],
}
