import type { DiagramDefinition } from '../../types'

export const mct1aCandidature: DiagramDefinition = {
  id: 'mct-1a-candidature',
  title: 'MCT 1a — Candidature',
  category: 'traitements',
  domain: 'MCT 1a — T1 · Soumettre la candidature',
  nodes: [
    {
      id: 't1-e1', type: 'process', position: { x: 20, y: 20 },
      data: { variant: 'mct-event', label: 'Lien campagne ouvert', detail: 'Candidat clique le lien public<br/>(<code>source_token</code> joint)' },
    },
    {
      id: 't1-e2', type: 'process', position: { x: 270, y: 20 },
      data: { variant: 'mct-event', label: 'Email candidat vérifié', detail: 'Double opt-in OK<br/>(code à 6 chiffres validé)' },
    },
    {
      id: 't1-e3', type: 'process', position: { x: 520, y: 20 },
      data: { variant: 'mct-event', label: 'Quota campagne ouvert', detail: '<code>campaigns.max_apply</code><br/>non atteint' },
    },
    {
      id: 't1-e4', type: 'process', position: { x: 770, y: 20 },
      data: { variant: 'mct-event', label: 'Formulaire actif', detail: 'Au moins une<br/><code>form_version</code> publiée' },
    },
    {
      id: 't1-s', type: 'process', position: { x: 290, y: 140 },
      data: { variant: 'mct-sync', label: 'Synchronisation', expression: 't1-e1 ∧ t1-e2 ∧ t1-e3 ∧ t1-e4' },
    },
    {
      id: 't1-op', type: 'process', position: { x: 80, y: 250 },
      data: {
        variant: 'mct-operation', label: 'T1 — Soumettre la candidature',
        items: [
          'Créer <code>applications</code> (snapshot identité, source, formulaire)',
          'Résoudre <code>pipeline_template</code> de la campagne, instancier la liste des <code>pipeline_stage</code>',
          'Créer <code>application_progress[0]</code> sur l\'étape <code>CANDIDATURE</code> (statut <code>OPENED</code>)',
          'Initialiser <code>application.current_application_progress_id</code> + agrégats à 0',
          'Évaluer les <code>pipeline_stage_notification_rule</code> de l\'étape (trigger <code>ON_STAGE_START</code>)',
          'Émettre <code>audit_event</code> CREATE (acteur = candidat anonyme)',
        ],
      },
    },
    {
      id: 't1-r1', type: 'process', position: { x: 80, y: 490 },
      data: { variant: 'mct-result', label: 'R1 · Candidature créée', detail: 'Mail d\'accusé envoyé,<br/>notification recruteur,<br/>round CANDIDATURE ouvert.' },
    },
    {
      id: 't1-r2', type: 'process', position: { x: 370, y: 490 },
      data: { variant: 'mct-result', label: 'R2 · Quota atteint', detail: 'Réponse <code>409</code>,<br/>aucune ligne créée,<br/>audit REJECT.', fail: true },
    },
    {
      id: 't1-r3', type: 'process', position: { x: 640, y: 490 },
      data: { variant: 'mct-result', label: 'R3 · Token invalide / expiré', detail: 'Réponse <code>403</code>,<br/>journalisation <code>audit_event</code> SECURITY.', fail: true },
    },
  ],
  edges: [
    { id: 'e-t1-e1-s', source: 't1-e1', target: 't1-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-e2-s', source: 't1-e2', target: 't1-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-e3-s', source: 't1-e3', target: 't1-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-e4-s', source: 't1-e4', target: 't1-s', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-s-op', source: 't1-s', target: 't1-op', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-op-r1', source: 't1-op', target: 't1-r1', type: 'traitement', data: {} },
    { id: 'e-t1-op-r2', source: 't1-op', target: 't1-r2', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t1-op-r3', source: 't1-op', target: 't1-r3', type: 'traitement', data: { isDashed: true } },
  ],
}
