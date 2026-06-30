import type { DiagramDefinition } from '../../types'

export const identitePermissions: DiagramDefinition = {
  id: 'mcd-identite-permissions',
  title: 'Identité & Permissions',
  category: 'mcd',
  domain: 'Identité & Permissions',
  nodes: [
    {
      id: 'utilisateur',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'utilisateur',
        variant: 'mcd',
        attributes: [
          { name: 'id_utilisateur', isPK: true },
          { name: 'nom' },
          { name: 'prénom' },
          { name: 'email' },
          { name: 'username' },
          { name: 'rôle_système' },
          { name: 'est_actif' },
        ],
      },
    },
    {
      id: 'groupe_metier',
      type: 'entity',
      position: { x: 350, y: 150 },
      data: {
        label: 'groupe_metier',
        variant: 'mcd',
        attributes: [
          { name: 'id_groupe', isPK: true },
          { name: 'libellé_groupe' },
          { name: 'description' },
        ],
      },
    },
    {
      id: 'permission_entite',
      type: 'entity',
      position: { x: 350, y: -150 },
      data: {
        label: 'permission_entite',
        variant: 'mcd',
        attributes: [
          { name: 'id_permission', isPK: true },
          { name: 'type_entité' },
          { name: 'id_entité' },
          { name: 'clé_permission' },
        ],
      },
    },
  ],
  edges: [
    {
      id: 'e-utilisateur-groupe',
      source: 'utilisateur',
      target: 'groupe_metier',
      type: 'relationship',
      data: {
        label: 'appartenir',
        cardFrom: '0,n',
        cardTo: '0,n',
      },
    },
    {
      id: 'e-groupe-permission',
      source: 'groupe_metier',
      target: 'permission_entite',
      type: 'relationship',
      data: {
        label: 'posséder',
        cardFrom: '1,1',
        cardTo: '0,n',
      },
    },
    {
      id: 'e-utilisateur-permission',
      source: 'utilisateur',
      target: 'permission_entite',
      type: 'relationship',
      data: {
        label: 'disposer',
        cardFrom: '0,n',
        cardTo: '0,n',
      },
    },
  ],
}
