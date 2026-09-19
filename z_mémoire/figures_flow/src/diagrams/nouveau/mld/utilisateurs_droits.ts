import type { DiagramDefinition } from '../../../types'

export const utilisateursDroits: DiagramDefinition = {
  id: 'mld-utilisateurs-droits',
  title: 'Utilisateurs & droits',
  category: 'mld',
  domain: 'Utilisateurs & droits',
  nodes: [
    {
      id: 'utilisateur',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'UTILISATEUR',
        variant: 'mld',
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
        variant: 'mld',
        attributes: [
          { name: 'id_groupe_metier', isPK: true },
          { name: 'libelle_groupe' },
          { name: 'description' },
        ],
      },
    },
    {
      id: 'permission_groupe',
      type: 'entity',
      position: { x: 400, y: 250 },
      data: {
        label: 'PERMISSION_GROUPE',
        variant: 'mld',
        attributes: [
          { name: 'id_permission_groupe', isPK: true },
          { name: 'fonctionnalite' },
        ],
      },
    },
    {
      id: 'notification',
      type: 'entity',
      position: { x: 0, y: 500 },
      data: {
        label: 'NOTIFICATION',
        variant: 'mld',
        attributes: [
          { name: 'id_notification', isPK: true },
          { name: '#id_utilisateur_destinataire', isFK: true },
          { name: '#id_utilisateur_declencheur', isFK: true, description: 'nullable' },
          { name: 'type' },
          { name: 'lien' },
          { name: 'est_lue' },
        ],
      },
    },
    {
      id: 'appartenir',
      type: 'entity',
      position: { x: 300, y: 150 },
      data: {
        label: 'APPARTENIR',
        variant: 'mld',
        badge: 'JONCTION',
        attributes: [
          { name: '#id_utilisateur', isPK: true, isFK: true },
          { name: '#id_groupe_metier', isPK: true, isFK: true },
          { name: 'est_moderateur' },
        ],
      },
    },
    {
      id: 'beneficier',
      type: 'entity',
      position: { x: 600, y: 250 },
      data: {
        label: 'BENEFICIER',
        variant: 'mld',
        badge: 'JONCTION',
        attributes: [
          { name: '#id_groupe_metier', isPK: true, isFK: true },
          { name: '#id_permission_groupe', isPK: true, isFK: true },
        ],
      },
    },
  ],
  edges: [
    {
      id: 'e-appartenir-utilisateur',
      source: 'utilisateur',
      target: 'appartenir',
      type: 'relationship',
      data: { label: 'appartenir', cardFrom: '0,n', cardTo: '1,1' },
    },
    {
      id: 'e-appartenir-groupe',
      source: 'groupe_metier',
      target: 'appartenir',
      type: 'relationship',
      data: { label: 'appartenir', cardFrom: '0,n', cardTo: '1,1' },
    },
    {
      id: 'e-beneficier-groupe',
      source: 'groupe_metier',
      target: 'beneficier',
      type: 'relationship',
      data: { label: 'beneficier', cardFrom: '0,n', cardTo: '1,1' },
    },
    {
      id: 'e-beneficier-permission',
      source: 'permission_groupe',
      target: 'beneficier',
      type: 'relationship',
      data: { label: 'beneficier', cardFrom: '0,n', cardTo: '1,1' },
    },
    {
      id: 'e-obtenir',
      source: 'utilisateur',
      target: 'notification',
      type: 'relationship',
      data: { label: 'obtenir', cardFrom: '0,n', cardTo: '1,1' },
    },
    {
      id: 'e-declencher',
      source: 'utilisateur',
      target: 'notification',
      type: 'relationship',
      data: { label: 'déclencher', cardFrom: '0,n', cardTo: '0,1' },
    },
  ],
}