import type { DiagramDefinition } from '../../types'

export const auditNotifications: DiagramDefinition = {
  id: 'mcd-audit-notifications',
  title: 'Audit & Notifications',
  category: 'mcd',
  domain: 'Audit & Notifications',
  nodes: [
    {
      id: 'notification',
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: 'notification',
        variant: 'mcd',
        attributes: [
          { name: 'id_notification', isPK: true },
          { name: 'type' },
          { name: 'lien' },
          { name: 'est_lue' },
          { name: 'type_entité' },
          { name: 'id_entité' },
        ],
      },
    },
    {
      id: 'mail_log',
      type: 'entity',
      position: { x: 350, y: -150 },
      data: {
        label: 'mail_log',
        variant: 'mcd',
        attributes: [
          { name: 'id_mail', isPK: true },
          { name: 'destinataire' },
          { name: 'sujet' },
          { name: 'statut' },
          { name: 'code_évènement' },
        ],
      },
    },
    {
      id: 'evenement_audit',
      type: 'entity',
      position: { x: 350, y: 150 },
      data: {
        label: 'evenement_audit',
        variant: 'mcd',
        attributes: [
          { name: 'id_évènement', isPK: true },
          { name: 'type_entité' },
          { name: 'id_entité' },
          { name: 'type_action' },
          { name: 'acteur' },
        ],
      },
    },
  ],
  edges: [
    {
      id: 'e-mail-notification',
      source: 'mail_log',
      target: 'notification',
      type: 'relationship',
      data: {
        label: 'notifier',
        cardFrom: '0,n',
        cardTo: '0,n',
        isDashed: true,
      },
    },
    {
      id: 'e-audit-mail',
      source: 'evenement_audit',
      target: 'mail_log',
      type: 'relationship',
      data: {
        label: 'journaliser',
        cardFrom: '0,n',
        cardTo: '0,n',
        isDashed: true,
      },
    },
    {
      id: 'e-audit-notification',
      source: 'evenement_audit',
      target: 'notification',
      type: 'relationship',
      data: {
        label: 'tracer',
        cardFrom: '0,n',
        cardTo: '0,n',
        isDashed: true,
      },
    },
  ],
}
