// @ts-nocheck
import type { DiagramDefinition } from '../../types'

export const mct0bCreationCampagne: DiagramDefinition = {
  id: 'mct-0b-creation-campagne',
  title: 'MCT 0b — Créer la campagne',
  category: 'archive',
  domain: 'MCT 0b — T0 · Créer la campagne',
  nodes: [
    {
      id: 't0b-e1', type: 'process', position: { x: 140, y: 20 },
      data: { variant: 'mct-event', label: 'Modèle de pipeline disponible' },
    },
    {
      id: 't0b-e2', type: 'process', position: { x: 520, y: 20 },
      data: { variant: 'mct-event', label: 'Formulaires configurés' },
    },
    {
      id: 't0b-s', type: 'process', position: { x: 310, y: 140 },
      data: { variant: 'mct-sync', label: 'ET' },
    },
    {
      id: 't0b-op', type: 'process', position: { x: 140, y: 250 },
      data: {
        variant: 'mct-operation', label: 'T0 — Créer la campagne',
        items: [
          'Contrôler les informations obligatoires',
          'Vérifier le modèle de pipeline sélectionné',
          'Vérifier la cohérence des dates',
          'Enregistrer la campagne au statut de brouillon',
          'Donner les droits d\'accès au créateur',
        ],
        emissionRules: ['OK', 'KO'],
      },
    },
    {
      id: 't0b-r1', type: 'process', position: { x: 140, y: 530 },
      data: { variant: 'mct-result', label: 'Campagne créée', rule: 'OK' },
    },
    {
      id: 't0b-r2', type: 'process', position: { x: 520, y: 530 },
      data: { variant: 'mct-result', label: 'Erreur lors de la création', rule: 'KO', fail: true },
    },
  ],
  edges: [
    { id: 'e-t0b-e1-s', source: 't0b-e1', target: 't0b-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t0b-e2-s', source: 't0b-e2', target: 't0b-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t0b-s-op', source: 't0b-s', target: 't0b-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t0b-op-r1', source: 't0b-op', target: 't0b-r1', sourceHandle: 'OK', type: 'traitement', data: {} },
    { id: 'e-t0b-op-r2', source: 't0b-op', target: 't0b-r2', sourceHandle: 'KO', type: 'traitement', data: { isDashed: true } },
  ],
}

