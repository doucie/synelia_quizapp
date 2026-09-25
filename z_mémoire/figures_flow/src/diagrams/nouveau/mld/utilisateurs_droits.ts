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
          { name: 'id_utilisateur', type: 'INT', isPK: true },
          { name: '#id_entreprise', type: 'INT', isFK: true },
          { name: 'nom', type: 'VARCHAR(100)' },
          { name: 'prenom', type: 'VARCHAR(100)' },
          { name: 'email', type: 'VARCHAR(255)' },
          { name: 'username', type: 'VARCHAR(100)' },
          { name: 'role_systeme', type: 'VARCHAR(50)' },
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
          { name: 'id_groupe_metier', type: 'INT', isPK: true },
          { name: 'libelle_groupe', type: 'VARCHAR(255)' },
          { name: 'description', type: 'TEXT', nullable: true },
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
          { name: 'id_permission_groupe', type: 'INT', isPK: true },
          { name: 'fonctionnalite', type: 'VARCHAR(100)' },
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
          { name: 'id_notification', type: 'INT', isPK: true },
          { name: '#id_utilisateur_destinataire', type: 'INT', isFK: true },
          { name: '#id_utilisateur_declencheur', type: 'INT', isFK: true, nullable: true },
          { name: 'type', type: 'VARCHAR(60)' },
          { name: 'lien', type: 'VARCHAR(255)', nullable: true },
          { name: 'est_lue', type: 'BOOLEAN' },
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
          { name: '#id_utilisateur', type: 'INT', isPK: true, isFK: true },
          { name: '#id_groupe_metier', type: 'INT', isPK: true, isFK: true },
          { name: 'est_moderateur', type: 'BOOLEAN' },
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
          { name: '#id_groupe_metier', type: 'INT', isPK: true, isFK: true },
          { name: '#id_permission_groupe', type: 'INT', isPK: true, isFK: true },
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
    },
    {
      id: 'e-appartenir-groupe',
      source: 'groupe_metier',
      target: 'appartenir',
      type: 'relationship',
    },
    {
      id: 'e-beneficier-groupe',
      source: 'groupe_metier',
      target: 'beneficier',
      type: 'relationship',
    },
    {
      id: 'e-beneficier-permission',
      source: 'permission_groupe',
      target: 'beneficier',
      type: 'relationship',
    },
    {
      id: 'e-obtenir',
      source: 'utilisateur',
      target: 'notification',
      type: 'relationship',
    },
    {
      id: 'e-declencher',
      source: 'utilisateur',
      target: 'notification',
      type: 'relationship',
    },
  ],
}