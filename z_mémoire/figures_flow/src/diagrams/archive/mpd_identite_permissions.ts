// @ts-nocheck
import type { DiagramDefinition } from '../../types'

export const identitePermissions: DiagramDefinition = {
  id: 'mpd-identite-permissions',
  title: 'Identité & Permissions',
  category: 'archive',
  domain: 'Identité & Permissions',
  nodes: [
    {
      id: 'user',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'user',
        variant: 'mpd',
        attributes: [
          { name: 'id', isPK: true, type: 'int unsigned PK AUTO_INCREMENT' },
          { name: 'first_name', type: 'varchar(100) NN' },
          { name: 'last_name', type: 'varchar(100) NN' },
          { name: 'email', type: 'varchar(255) NN' },
          { name: 'username', type: 'varchar(100) NN' },
          { name: 'user_role', type: 'varchar(50) NN' },
          { name: 'is_active', type: 'tinyint(1) NN' },
        ],
      },
    },
    {
      id: 'business_group',
      type: 'entity',
      position: { x: 350, y: 150 },
      data: {
        label: 'business_group',
        variant: 'mpd',
        attributes: [
          { name: 'id', isPK: true, type: 'int unsigned PK AUTO_INCREMENT' },
          { name: 'group_name', type: 'varchar(255) NN' },
          { name: 'group_desc', type: 'text' },
        ],
      },
    },
    {
      id: 'entity_permission',
      type: 'entity',
      position: { x: 350, y: -150 },
      data: {
        label: 'entity_permission',
        variant: 'mpd',
        attributes: [
          { name: 'id', isPK: true, type: 'int unsigned PK AUTO_INCREMENT' },
          { name: 'entity_type', type: 'varchar(100) NN' },
          { name: 'entity_id', type: 'int unsigned NN' },
          { name: 'permission_key', type: 'varchar(100) NN' },
        ],
      },
    },
    {
      id: 'user_business_group',
      type: 'entity',
      position: { x: 150, y: 300 },
      data: {
        label: 'user_business_group',
        variant: 'mpd',
        attributes: [
          { name: 'id', isPK: true, type: 'int unsigned PK AUTO_INCREMENT' },
          { name: 'user_id', isFK: true, type: 'int unsigned NN' },
          { name: 'business_group_id', isFK: true, type: 'int unsigned NN' },
          { name: 'is_moderator', type: 'tinyint(1)' },
        ],
      },
    },
    {
      id: 'business_group_permission',
      type: 'entity',
      position: { x: 550, y: 250 },
      data: {
        label: 'business_group_permission',
        variant: 'mpd',
        attributes: [
          { name: 'id', isPK: true, type: 'int unsigned PK AUTO_INCREMENT' },
          { name: 'business_group_id', isFK: true, type: 'int unsigned NN' },
          { name: 'entity_permission_id', isFK: true, type: 'int unsigned NN' },
        ],
      },
    },
    {
      id: 'user_permission',
      type: 'entity',
      position: { x: 150, y: -300 },
      data: {
        label: 'user_permission',
        variant: 'mpd',
        attributes: [
          { name: 'id', isPK: true, type: 'int unsigned PK AUTO_INCREMENT' },
          { name: 'user_id', isFK: true, type: 'int unsigned NN' },
          { name: 'entity_permission_id', isFK: true, type: 'int unsigned NN' },
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

