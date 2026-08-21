import type { DiagramDefinition } from '../../../types'

export const utilisateursDroits: DiagramDefinition = {
  id: 'mcd-utilisateurs-droits',
  title: 'Utilisateurs & droits',
  category: 'mcd',
  domain: 'Utilisateurs & droits',
  nodes: [
    {
      id: 'utilisateur',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'UTILISATEUR',
        variant: 'mcd',
        attributes: [
          { name: 'id_utilisateur', isPK: true },
          { name: 'nom' },
          { name: 'prenom' },
          { name: 'email' },
          { name: 'username' },
          { name: 'role_systeme' },
        ],
      },
    },
    {
      id: 'groupe_metier',
      type: 'entity',
      position: { x: 600, y: 0 },
      data: {
        label: 'GROUPE_METIER',
        variant: 'mcd',
        attributes: [
          { name: 'id_groupe', isPK: true },
          { name: 'libelle_groupe' },
          { name: 'description' },
        ],
      },
    },
    {
      id: 'groupe_permission',
      type: 'entity',
      position: { x: 400, y: 250 },
      data: {
        label: 'PERMISSION_GROUPE',
        variant: 'mcd',
        attributes: [
          { name: 'id_permission', isPK: true },
          { name: 'fonctionnalite' },
        ],
      },
    },
    {
      id: 'notification',
      type: 'entity',
      position: { x: 0, y: 600 },
      data: {
        label: 'NOTIFICATION',
        variant: 'mcd',
        attributes: [
          { name: 'id_notification', isPK: true },
          { name: 'type' },
          { name: 'lien' },
          { name: 'est_lue' },
        ],
      },
    },
  ],
  edges: [
    {
      id: 'e-appartenir',
      source: 'utilisateur',
      target: 'groupe_metier',
      type: 'relationship',
      data: { label: 'appartenir', cardFrom: '0,n', cardTo: '0,n', attributes: ['est_moderateur'] },
    },
    {
      id: 'e-beneficier-groupe-perm',
      source: 'groupe_metier',
      target: 'groupe_permission',
      type: 'relationship',
      data: { label: 'beneficier', cardFrom: '0,n', cardTo: '0,n' },
    },
    {
      id: 'e-obtenir',
      source: 'utilisateur',
      target: 'notification',
      type: 'relationship',
      data: { label: 'obtenir', cardFrom: '0,n', cardTo: '1,1', cardFromSide: 'right', cardToSide: 'left' },
    },
    {
      id: 'e-declencher',
      source: 'utilisateur',
      target: 'notification',
      type: 'relationship',
      data: { label: 'déclencher', cardFrom: '0,n', cardTo: '0,1', cardFromSide: 'bottom', cardToSide: 'top' },
    },
  ],
}
