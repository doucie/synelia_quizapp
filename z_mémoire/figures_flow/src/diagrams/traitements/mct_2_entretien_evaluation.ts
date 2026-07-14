import type { DiagramDefinition } from '../../types'

export const mct2EntretienEvaluation: DiagramDefinition = {
  id: 'mct-2-entretien-evaluation',
  title: 'MCT 2 — Entretien & Évaluation',
  category: 'traitements',
  domain: 'MCT 2 — Entretien & Évaluation (T3)',
  nodes: [
    {
      id: 't3-e1', type: 'process', position: { x: 20, y: 20 },
      data: { variant: 'mct-event', label: 'Round INTERVIEW ouvert' },
    },
    {
      id: 't3-e2', type: 'process', position: { x: 270, y: 20 },
      data: { variant: 'mct-event', label: 'Recruteur planifie entretien' },
    },
    {
      id: 't3-e3', type: 'process', position: { x: 520, y: 20 },
      data: { variant: 'mct-event', label: 'Candidat accepte' },
    },
    {
      id: 't3-e4', type: 'process', position: { x: 770, y: 20 },
      data: { variant: 'mct-event', label: 'Évaluations soumises' },
    },
    {
      id: 't3-s', type: 'process', position: { x: 290, y: 140 },
      data: { variant: 'mct-sync', label: 'ET' },
    },
    {
      id: 't3-op', type: 'process', position: { x: 80, y: 250 },
      data: {
        variant: 'mct-operation', label: 'T3 — Conduire le cycle entretien → évaluation',
        items: [
          'Créer l\'entretien et les participations',
          'Notifier le candidat et collecter sa réponse',
          'Créer les évaluations et items par critère',
          'Agréger les scores à la clôture',
        ],
        emissionRules: ['Entretien validé', 'Candidat refuse', 'Alternative demandée'],
      },
    },
    {
      id: 't3-r1', type: 'process', position: { x: 80, y: 510 },
      data: { variant: 'mct-result', label: 'Entretien validé', rule: 'Entretien validé' },
    },
    {
      id: 't3-r2', type: 'process', position: { x: 390, y: 510 },
      data: { variant: 'mct-result', label: 'Candidat refuse', rule: 'Candidat refuse', fail: true },
    },
    {
      id: 't3-r3', type: 'process', position: { x: 680, y: 510 },
      data: { variant: 'mct-result', label: 'Alternative demandée', rule: 'Alternative demandée' },
    },
  ],
  edges: [
    { id: 'e-t3-e1-s', source: 't3-e1', target: 't3-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-e2-s', source: 't3-e2', target: 't3-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-e3-s', source: 't3-e3', target: 't3-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-e4-s', source: 't3-e4', target: 't3-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-s-op', source: 't3-s', target: 't3-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-op-r1', source: 't3-op', target: 't3-r1', type: 'traitement', data: {} },
    { id: 'e-t3-op-r2', source: 't3-op', target: 't3-r2', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t3-op-r3', source: 't3-op', target: 't3-r3', type: 'traitement', data: { isDashed: true } },
  ],
}
