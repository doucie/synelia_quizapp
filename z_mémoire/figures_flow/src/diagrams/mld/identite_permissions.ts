import type { DiagramDefinition } from '../../types'

export const identitePermissions: DiagramDefinition = {
  id: 'mld-identite-permissions',
  title: 'Identité & Permissions',
  category: 'mld',
  domain: 'Identité & Permissions',
  nodes: [
    {
      id: 'user',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'utilisateur',
        variant: 'mld',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'first_name' },
          { name: 'last_name' },
          { name: 'email' },
          { name: 'username' },
          { name: 'user_role' },
          { name: 'is_active' },
        ],
      },
    },
    {
      id: 'business_group',
      type: 'entity',
      position: { x: 350, y: 150 },
      data: {
        label: 'groupe_metier',
        variant: 'mld',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'group_name' },
          { name: 'group_desc' },
        ],
      },
    },
    {
      id: 'entity_permission',
      type: 'entity',
      position: { x: 350, y: -150 },
      data: {
        label: 'permission_entite',
        variant: 'mld',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'entity_type' },
          { name: 'entity_id' },
          { name: 'permission_key' },
        ],
      },
    },
    {
      id: 'user_business_group',
      type: 'entity',
      position: { x: 150, y: 300 },
      data: {
        label: 'utilisateur_groupe',
        variant: 'mld',
        badge: 'JONCTION',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'user_id', isFK: true },
          { name: 'business_group_id', isFK: true },
          { name: 'is_moderator' },
        ],
      },
    },
    {
      id: 'business_group_permission',
      type: 'entity',
      position: { x: 550, y: 250 },
      data: {
        label: 'groupe_permission',
        variant: 'mld',
        badge: 'JONCTION',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'business_group_id', isFK: true },
          { name: 'entity_permission_id', isFK: true },
        ],
      },
    },
    {
      id: 'user_permission',
      type: 'entity',
      position: { x: 150, y: -300 },
      data: {
        label: 'utilisateur_permission',
        variant: 'mld',
        badge: 'JONCTION',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'user_id', isFK: true },
          { name: 'entity_permission_id', isFK: true },
        ],
      },
    },
  ],
  edges: [
    {
      id: 'e-user-ubg',
      source: 'user',
      target: 'user_business_group',
      type: 'relationship',
      data: { isStrong: true },
    },
    {
      id: 'e-bgroup-ubg',
      source: 'business_group',
      target: 'user_business_group',
      type: 'relationship',
      data: { isStrong: true },
    },
    {
      id: 'e-bgroup-bgp',
      source: 'business_group',
      target: 'business_group_permission',
      type: 'relationship',
      data: { isStrong: true },
    },
    {
      id: 'e-perm-bgp',
      source: 'entity_permission',
      target: 'business_group_permission',
      type: 'relationship',
      data: { isStrong: true },
    },
    {
      id: 'e-user-up',
      source: 'user',
      target: 'user_permission',
      type: 'relationship',
      data: { isStrong: true },
    },
    {
      id: 'e-perm-up',
      source: 'entity_permission',
      target: 'user_permission',
      type: 'relationship',
      data: { isStrong: true },
    },
  ],
}
