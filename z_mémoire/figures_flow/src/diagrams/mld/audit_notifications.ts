import type { DiagramDefinition } from '../../types'

export const auditNotifications: DiagramDefinition = {
  id: 'mld-audit-notifications',
  title: 'Audit & Notifications',
  category: 'mld',
  domain: 'Audit & Notifications',
  nodes: [
    {
      id: 'notifications',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'notification',
        variant: 'mld',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'user_id', isFK: true },
          { name: 'notif_type' },
          { name: 'link' },
          { name: 'is_read' },
          { name: 'object_table_name' },
          { name: 'object_table_id' },
        ],
      },
    },
    {
      id: 'mail_log',
      type: 'entity',
      position: { x: 350, y: -150 },
      data: {
        label: 'mail_log',
        variant: 'mld',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'recipient_email' },
          { name: 'subject' },
          { name: 'status' },
          { name: 'event_code' },
          { name: 'notification_rule_id', isFK: true },
        ],
      },
    },
    {
      id: 'audit_event',
      type: 'entity',
      position: { x: 350, y: 150 },
      data: {
        label: 'evenement_audit',
        variant: 'mld',
        attributes: [
          { name: 'id', isPK: true },
          { name: 'actor_user_id', isFK: true },
          { name: 'entity_type' },
          { name: 'entity_id' },
          { name: 'action_type' },
          { name: 'before_state_json' },
          { name: 'after_state_json' },
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
