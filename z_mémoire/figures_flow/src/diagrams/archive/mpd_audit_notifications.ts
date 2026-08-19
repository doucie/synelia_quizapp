// @ts-nocheck
import type { DiagramDefinition } from '../../types'

export const auditNotifications: DiagramDefinition = {
  id: 'mpd-audit-notifications',
  title: 'Audit & Notifications',
  category: 'archive',
  domain: 'Audit & Notifications',
  nodes: [
    {
      id: 'notifications',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'notifications',
        variant: 'mpd',
        attributes: [
          { name: 'id', isPK: true, type: 'int unsigned PK AUTO_INCREMENT' },
          { name: 'user_id', isFK: true, type: 'int unsigned NN' },
          { name: 'notif_type', type: 'varchar(50) NN' },
          { name: 'link', type: 'varchar(500)' },
          { name: 'is_read', type: 'tinyint(1) NN' },
          { name: 'object_table_name', type: 'varchar(100) NN' },
          { name: 'object_table_id', type: 'int unsigned NN' },
        ],
      },
    },
    {
      id: 'mail_log',
      type: 'entity',
      position: { x: 350, y: -150 },
      data: {
        label: 'mail_log',
        variant: 'mpd',
        attributes: [
          { name: 'id', isPK: true, type: 'int unsigned PK AUTO_INCREMENT' },
          { name: 'recipient_email', type: 'varchar(255) NN' },
          { name: 'subject', type: 'varchar(500) NN' },
          { name: 'status', type: 'varchar(50) NN' },
          { name: 'event_code', type: 'varchar(60)' },
          { name: 'notification_rule_id', isFK: true, type: 'int unsigned' },
        ],
      },
    },
    {
      id: 'audit_event',
      type: 'entity',
      position: { x: 350, y: 150 },
      data: {
        label: 'audit_event',
        variant: 'mpd',
        attributes: [
          { name: 'id', isPK: true, type: 'int unsigned PK AUTO_INCREMENT' },
          { name: 'actor_user_id', isFK: true, type: 'int unsigned' },
          { name: 'entity_type', type: 'varchar(60) NN' },
          { name: 'entity_id', type: 'int unsigned NN' },
          { name: 'action_type', type: 'varchar(60) NN' },
          { name: 'before_state_json', type: 'json' },
          { name: 'after_state_json', type: 'json' },
        ],
      },
    },
  ],
  edges: [
    {
      id: 'e-mail-notif',
      source: 'mail_log',
      target: 'notifications',
      type: 'relationship',
      data: { isDashed: true },
    },
    {
      id: 'e-audit-mail',
      source: 'audit_event',
      target: 'mail_log',
      type: 'relationship',
      data: { isDashed: true },
    },
    {
      id: 'e-audit-notif',
      source: 'audit_event',
      target: 'notifications',
      type: 'relationship',
      data: { isDashed: true },
    },
  ],
}

