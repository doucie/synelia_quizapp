import type { DiagramDefinition } from '../../../types'

export const utilisateursDroits: DiagramDefinition = {
  id: 'mpd-utilisateurs-droits',
  title: 'Utilisateurs & droits',
  category: 'mpd',
  domain: 'Utilisateurs & droits',
  nodes: [
    {
      id: 'user',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'user',
        variant: 'mpd',
        attributes: [
          { name: 'id', type: 'int unsigned PK auto_increment', isPK: true },
          { name: 'nom', type: 'varchar(100)' },
          { name: 'prenom', type: 'varchar(500)' },
          { name: 'email', type: 'varchar(255) UNI' },
          { name: 'username', type: 'varchar(50) UNI' },
          { name: 'phone', type: 'varchar(20)' },
          { name: 'password', type: 'varchar(255)' },
          { name: 'is_default_password', type: 'tinyint(1)' },
          { name: 'user_role', type: 'varchar(20)' },
          { name: 'is_online', type: 'tinyint(1)' },
          { name: 'is_locked', type: 'tinyint(1)' },
          { name: 'last_connection_date', type: 'datetime' },
          { name: 'admin_mode', type: 'tinyint(1)' },
          { name: 'page_size_preference', type: 'int' },
        ],
      },
    },
    {
      id: 'business_group',
      type: 'entity',
      position: { x: 700, y: 0 },
      data: {
        label: 'business_group',
        variant: 'mpd',
        attributes: [
          { name: 'id', type: 'int PK auto_increment', isPK: true },
          { name: 'group_name', type: 'varchar(100) UNI' },
          { name: 'group_desc', type: 'text' },
        ],
      },
    },
    {
      id: 'entity_permission',
      type: 'entity',
      position: { x: 0, y: 500 },
      data: {
        label: 'entity_permission',
        variant: 'mpd',
        attributes: [
          { name: 'id', type: 'int PK auto_increment', isPK: true },
          { name: 'user_id', type: 'int unsigned FK → user.id', isFK: true },
          { name: 'business_group_id', type: 'int FK → business_group.id', isFK: true },
          { name: 'system_role', type: 'varchar(20) FK → system_role_permission.system_role' },
          { name: 'entity_type', type: 'varchar(50)' },
          { name: 'entity_id', type: 'int' },
          { name: 'permission_key', type: 'varchar(50)' },
        ],
      },
    },
    {
      id: 'system_role_permission',
      type: 'entity',
      position: { x: 500, y: 500 },
      data: {
        label: 'system_role_permission',
        variant: 'mpd',
        attributes: [
          { name: 'id', type: 'int PK auto_increment', isPK: true },
          { name: 'system_role', type: 'varchar(20) FK → user.user_role' },
          { name: 'fonctionnalite', type: 'varchar(100)' },
        ],
      },
    },
    {
      id: 'business_group_permission',
      type: 'entity',
      position: { x: 900, y: 500 },
      data: {
        label: 'business_group_permission',
        variant: 'mpd',
        attributes: [
          { name: 'id', type: 'int PK auto_increment', isPK: true },
          { name: 'business_group_id', type: 'int FK → business_group.id', isFK: true },
          { name: 'fonctionnalite', type: 'varchar(100)' },
        ],
      },
    },
    {
      id: 'user_business_group',
      type: 'entity',
      position: { x: 350, y: 250 },
      data: {
        label: 'user_business_group',
        variant: 'mpd',
        badge: 'JONCTION',
        attributes: [
          { name: 'id', type: 'int PK auto_increment', isPK: true },
          { name: 'user_id', type: 'int unsigned FK → user.id', isFK: true },
          { name: 'business_group_id', type: 'int FK → business_group.id', isFK: true },
          { name: 'is_moderator', type: 'tinyint(1)' },
        ],
      },
    },
    {
      id: 'user_permission_override',
      type: 'entity',
      position: { x: -300, y: 250 },
      data: {
        label: 'user_permission_override',
        variant: 'mpd',
        attributes: [
          { name: 'id', type: 'int PK auto_increment', isPK: true },
          { name: 'user_id', type: 'int unsigned FK → user.id', isFK: true },
          { name: 'fonctionnalite', type: 'varchar(100)' },
          { name: 'is_allowed', type: 'tinyint(1)' },
        ],
      },
    },
    {
      id: 'group_change_request',
      type: 'entity',
      position: { x: 700, y: 750 },
      data: {
        label: 'group_change_request',
        variant: 'mpd',
        attributes: [
          { name: 'id', type: 'int PK auto_increment', isPK: true },
          { name: 'user_id', type: 'int unsigned FK → user.id', isFK: true },
          { name: 'target_group_id', type: 'int FK → business_group.id', isFK: true },
          { name: 'reason', type: 'text' },
          { name: 'status', type: "enum('PENDING','APPROVED','REJECTED')" },
          { name: 'requested_at', type: 'timestamp' },
          { name: 'processed_at', type: 'timestamp' },
          { name: 'processed_by', type: 'int unsigned FK → user.id', isFK: true },
        ],
      },
    },
    {
      id: 'invitation_code',
      type: 'entity',
      position: { x: 1100, y: 0 },
      data: {
        label: 'invitation_code',
        variant: 'mpd',
        attributes: [
          { name: 'id', type: 'bigint PK auto_increment', isPK: true },
          { name: 'email', type: 'varchar(255)' },
          { name: 'role', type: 'varchar(30)' },
          { name: 'code', type: 'varchar(50) UNI' },
          { name: 'is_used', type: 'bit(1)' },
          { name: 'expired_at', type: 'datetime' },
          { name: 'created_by', type: 'int unsigned FK → user.id', isFK: true },
        ],
      },
    },
  ],
  edges: [],
}
