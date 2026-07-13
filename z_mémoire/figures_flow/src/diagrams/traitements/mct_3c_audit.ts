import type { DiagramDefinition } from '../../types'

export const mct3cAudit: DiagramDefinition = {
  id: 'mct-3c-audit',
  title: 'MCT 3c — Audit',
  category: 'traitements',
  domain: 'MCT 3c — T6 · Journaliser audit_event (transverse)',
  nodes: [
    {
      id: 't6-e1', type: 'process', position: { x: 80, y: 20 },
      data: { variant: 'mct-event', label: 'Toute opération métier', detail: 'CREATE / UPDATE / DELETE / SUBMIT / CLOSE / VALIDATE / DECIDE / CANCEL' },
    },
    {
      id: 't6-op', type: 'process', position: { x: 80, y: 160 },
      data: {
        variant: 'mct-operation', label: 'T6 — Journaliser audit_event (transverse)',
        items: [
          'Sérialiser <code>before_json</code> / <code>after_json</code>',
          'Capturer acteur, type d\'entité, identifiant',
          'Persister <code>audit_event</code> sans bloquer l\'opération principale',
        ],
      },
    },
    {
      id: 't6-r1', type: 'process', position: { x: 80, y: 340 },
      data: { variant: 'mct-result', label: 'R · Trace conservée', detail: 'Disponible pour reporting<br/>et conformité RGPD.' },
    },
  ],
  edges: [
    { id: 'e-t6-e1-op', source: 't6-e1', target: 't6-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t6-op-r1', source: 't6-op', target: 't6-r1', type: 'traitement', data: {} },
  ],
}
