import type { DiagramDefinition } from '../../types'

export const mct3aDecision: DiagramDefinition = {
  id: 'mct-3a-decision',
  title: 'MCT 3a — Décision',
  category: 'traitements',
  domain: 'MCT 3a — T4 · Prononcer une décision',
  nodes: [
    {
      id: 't4-e1', type: 'process', position: { x: 20, y: 20 },
      data: { variant: 'mct-event', label: 'Round DECISION ouvert' },
    },
    {
      id: 't4-e2', type: 'process', position: { x: 270, y: 20 },
      data: { variant: 'mct-event', label: 'Recruteur saisit décision' },
    },
    {
      id: 't4-e3', type: 'process', position: { x: 520, y: 20 },
      data: { variant: 'mct-event', label: 'Habilitation OK' },
    },
    {
      id: 't4-s', type: 'process', position: { x: 230, y: 140 },
      data: { variant: 'mct-sync', label: 'ET' },
    },
    {
      id: 't4-op', type: 'process', position: { x: 80, y: 250 },
      data: {
        variant: 'mct-operation', label: 'T4 — Prononcer une décision',
        items: [
          'Créer la décision avec mode NORMAL',
          'Valider le round et ouvrir le suivant',
          'Si finale NON_RETENU : verrouiller la candidature',
        ],
        emissionRules: ['Round suivant ouvert', 'Candidature finalisée', 'Confirmation manuelle'],
      },
    },
    {
      id: 't4-r1', type: 'process', position: { x: 80, y: 520 },
      data: { variant: 'mct-result', label: 'Round suivant ouvert', rule: 'Round suivant ouvert' },
    },
    {
      id: 't4-r2', type: 'process', position: { x: 370, y: 520 },
      data: { variant: 'mct-result', label: 'Candidature finalisée', rule: 'Candidature finalisée' },
    },
    {
      id: 't4-r3', type: 'process', position: { x: 660, y: 520 },
      data: { variant: 'mct-result', label: 'Confirmation manuelle', rule: 'Confirmation manuelle' },
    },
  ],
  edges: [
    { id: 'e-t4-e1-s', source: 't4-e1', target: 't4-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-e2-s', source: 't4-e2', target: 't4-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-e3-s', source: 't4-e3', target: 't4-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-s-op', source: 't4-s', target: 't4-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-op-r1', source: 't4-op', target: 't4-r1', type: 'traitement', data: {} },
    { id: 'e-t4-op-r2', source: 't4-op', target: 't4-r2', type: 'traitement', data: {} },
    { id: 'e-t4-op-r3', source: 't4-op', target: 't4-r3', type: 'traitement', data: { isDashed: true } },
  ],
}
