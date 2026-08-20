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
          { name: 'id', isPK: true },
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
          { name: 'id', isPK: true },
          { name: 'libelle_groupe' },
          { name: 'description' },
        ],
      },
    },
    {
      id: 'permission_entite',
      type: 'entity',
      position: { x: 0, y: 400 },
      data: {
        label: 'PERMISSION_ENTITE',
        variant: 'mld',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'utilisateur_id', isFK: true },
          { name: 'groupe_id', isFK: true },
          { name: 'type_entite' },
          { name: 'id_entite' },
          { name: 'cle_permission' },
        ],
      },
    },
    {
      id: 'system_role_permission',
      type: 'entity',
      position: { x: 400, y: 400 },
      data: {
        label: 'SYSTEM_ROLE_PERMISSION',
        variant: 'mld',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'system_role', isFK: true },
          { name: 'fonctionnalite' },
        ],
      },
    },
    {
      id: 'groupe_permission',
      type: 'entity',
      position: { x: 800, y: 400 },
      data: {
        label: 'GROUPE_PERMISSION',
        variant: 'mld',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'groupe_id', isFK: true },
          { name: 'fonctionnalite' },
        ],
      },
    },
    {
      id: 'utilisateur_groupe',
      type: 'entity',
      position: { x: 300, y: 200 },
      data: {
        label: 'UTILISATEUR_GROUPE',
        variant: 'mld',
        badge: 'JONCTION',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'utilisateur_id', isFK: true },
          { name: 'groupe_id', isFK: true },
          { name: 'est_moderateur' },
        ],
      },
    },
    {
      id: 'code_invitation',
      type: 'entity',
      position: { x: 1000, y: 0 },
      data: {
        label: 'CODE_INVITATION',
        variant: 'mld',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'email' },
          { name: 'role' },
          { name: 'code' },
          { name: 'est_utilise' },
          { name: 'date_expiration' },
          { name: 'cree_par', isFK: true },
        ],
      },
    },
  ],
  edges: [],
}
