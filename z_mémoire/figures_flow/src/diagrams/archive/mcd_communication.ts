import type { DiagramDefinition } from '../../types'

export const communication: DiagramDefinition = {
  id: 'mcd-communication',
  title: 'Communication',
  category: 'archive',
  domain: 'Communication',
  nodes: [
    {
      id: 'modele_email',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'MODELE_EMAIL',
        variant: 'mcd',
        attributes: [
          { name: 'id_modele', isPK: true },
          { name: 'cle_modele' },
          { name: 'sujet_modele' },
          { name: 'corps_modele' },
          { name: 'description' },
          { name: 'type_action' },
          { name: 'est_actif' },
        ],
      },
    },
    {
      id: 'preset_modele_email',
      type: 'entity',
      position: { x: 600, y: 0 },
      data: {
        label: 'PRESET_MODELE_EMAIL',
        variant: 'mcd',
        attributes: [
          { name: 'id_preset', isPK: true },
          { name: 'nom' },
          { name: 'categorie' },
          { name: 'structure_html' },
          { name: 'description' },
        ],
      },
    },
    {
      id: 'journal_email',
      type: 'entity',
      position: { x: 0, y: 400 },
      data: {
        label: 'JOURNAL_EMAIL',
        variant: 'mcd',
        attributes: [
          { name: 'id_journal', isPK: true },
          { name: 'destinataire' },
          { name: 'sujet' },
          { name: 'statut' },
          { name: 'code_evenement' },
          { name: 'confirmation_requise' },
          { name: 'apercu_corps' },
          { name: 'message_erreur' },
          { name: 'date_envoi' },
        ],
      },
    },
  ],
  edges: [
    {
      id: 'e-presenter',
      source: 'modele_email',
      target: 'preset_modele_email',
      type: 'relationship',
      data: { label: 'presenter', cardFrom: '0,n', cardTo: '0,1' },
    },
    {
      id: 'e-utiliser',
      source: 'journal_email',
      target: 'modele_email',
      type: 'relationship',
      data: { label: 'employer', cardFrom: '0,n', cardTo: '0,1' },
    },
  ],
}
