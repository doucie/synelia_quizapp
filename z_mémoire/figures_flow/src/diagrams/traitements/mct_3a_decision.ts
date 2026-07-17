import type { DiagramDefinition } from '../../types'

export const mct3aDecision: DiagramDefinition = {
  id: 'mct-3a-decision',
  title: 'MCT 3a — Décision',
  category: 'traitements',
  domain: 'MCT 3a — T4 · Valider la décision du recruteur',
  nodes: [
    {
      id: 't4-e1', type: 'process', position: { x: 20, y: 20 },
      data: { variant: 'mct-event', label: 'Candidat en phase de décision' },
    },
    {
      id: 't4-e2', type: 'process', position: { x: 520, y: 20 },
      data: { variant: 'mct-event', label: 'Décision du recruteur' },
    },
    {
      id: 't4-s', type: 'process', position: { x: 290, y: 140 },
      data: { variant: 'mct-sync', label: 'ET' },
    },
    {
      id: 't4-op', type: 'process', position: { x: 80, y: 250 },
      data: {
        variant: 'mct-operation', label: 'Valider la décision du recruteur',
        items: [
          'Vérifier les droits du recruteur (habilitation)',
          'Recueillir la justification de la décision',
          'Enregistrer dans l\'audit',
        ],
        emissionRules: ['Décision favorable', 'Décision en sursis', 'Décision défavorable'],
      },
    },
    {
      id: 't4-r1', type: 'process', position: { x: 80, y: 520 },
      data: { variant: 'mct-result', label: 'Candidat retenu', rule: 'Décision favorable' },
    },
    {
      id: 't4-r2', type: 'process', position: { x: 370, y: 520 },
      data: { variant: 'mct-result', label: 'Candidat en attente', rule: 'Décision en sursis' },
    },
    {
      id: 't4-r3', type: 'process', position: { x: 660, y: 520 },
      data: { variant: 'mct-result', label: 'Candidat refusé', rule: 'Décision défavorable', fail: true },
    },
  ],
  edges: [
    { id: 'e-t4-e1-s', source: 't4-e1', target: 't4-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-e2-s', source: 't4-e2', target: 't4-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-s-op', source: 't4-s', target: 't4-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-op-r1', source: 't4-op', target: 't4-r1', sourceHandle: 'Décision favorable', type: 'traitement', data: {} },
    { id: 'e-t4-op-r2', source: 't4-op', target: 't4-r2', sourceHandle: 'Décision en sursis', type: 'traitement', data: {} },
    { id: 'e-t4-op-r3', source: 't4-op', target: 't4-r3', sourceHandle: 'Décision défavorable', type: 'traitement', data: { isDashed: true } },
  ],
}
