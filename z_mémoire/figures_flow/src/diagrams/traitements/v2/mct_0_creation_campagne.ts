import type { DiagramDefinition } from '../../../types'

export const mct0CreationCampagne: DiagramDefinition = {
  id: 'mct-v2-0-creation-campagne',
  title: 'MCT v2 — Créer la campagne',
  category: 'traitements',
  domain: 'MCT v2 — T0 · Créer la campagne',
  nodes: [
    {
      id: 'mct0-e1', type: 'process', position: { x: 220, y: 20 },
      data: { variant: 'mct-event', label: 'Besoin d\'un nouveau recrutement' },
    },
    {
      id: 'mct0-op', type: 'process', position: { x: 220, y: 200 },
      data: {
        variant: 'mct-syncop', label: 'T0 — Initialiser la campagne',
        syncLabel: '',
        items: [
          'Vérifier la cohérence des dates de campagne',
          'Valider l\'adéquation avec les modèles de pipeline disponibles',
          'Attribuer les droits d\'accès par défaut (profil créateur)',
        ],
        emissionRules: ['Toujours'],
      },
    },
    {
      id: 'mct0-r1', type: 'process', position: { x: 220, y: 420 },
      data: { variant: 'mct-result', label: 'Campagne initialisée', rule: 'Toujours' },
    },
  ],
  edges: [
    { id: 'e-mct0-e1-op', source: 'mct0-e1', target: 'mct0-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-mct0-op-r1', source: 'mct0-op', target: 'mct0-r1', sourceHandle: 'Toujours', type: 'traitement', data: {} },
  ],
}
