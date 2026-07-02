import type { DiagramDefinition } from '../../types'

export const mpt2EntretienDecision: DiagramDefinition = {
  id: 'mpt-2-entretien-decision',
  title: 'MPT 2 — Entretien & Décision',
  category: 'traitements',
  domain: 'MPT 2 — Entretien & Décision',
  nodes: [
    /* ═══ T3 — PLANIFIER ENTRETIEN ═══ */
    {
      id: 't3-trig', type: 'process', position: { x: 20, y: 20 },
      data: { variant: 'mpt-layer', layer: 'trigger', label: 'Déclencheur', items: ['Round INTERVIEW ouvert', 'Recruteur planifie'] },
    },
    {
      id: 't3-fe', type: 'process', position: { x: 300, y: 20 },
      data: { variant: 'mpt-layer', layer: 'fe', label: 'IHM Angular', items: ['InterviewSchedulerComponent', 'Formulaire date/type/lieu', 'Sélection participants'] },
    },
    {
      id: 't3-ctrl', type: 'process', position: { x: 580, y: 20 },
      data: { variant: 'mpt-layer', layer: 'controller', label: 'Contrôleur REST', items: ['InterviewController', 'POST /api/interviews', 'PUT /api/interviews/{id}'] },
    },
    {
      id: 't3-svc', type: 'process', position: { x: 20, y: 180 },
      data: { variant: 'mpt-layer', layer: 'service', label: 'Service métier', items: ['InterviewService', 'scheduleInterview(progId, dto)', 'Crée interview + candidate_interview', 'Affecte interview_participant', 'Notifie candidat (règle ON_INTERVIEW_PLANNED)'] },
    },
    {
      id: 't3-repo', type: 'process', position: { x: 330, y: 180 },
      data: { variant: 'mpt-layer', layer: 'repo', label: "Couche d'accès", items: ['InterviewRepository', 'CandidateInterviewRepository', 'InterviewParticipantRepository', 'NotificationRuleRepository'] },
    },
    {
      id: 't3-db', type: 'process', position: { x: 640, y: 180 },
      data: { variant: 'mpt-layer', layer: 'db', label: 'SGBD MySQL', items: ['INSERT interviews', 'INSERT candidate_interview', 'INSERT interview_participant', 'INSERT mail_log'] },
    },
    {
      id: 't3-ext', type: 'process', position: { x: 890, y: 180 },
      data: { variant: 'mpt-layer', layer: 'ext', label: 'Externe', items: ['SMTP → mail convocation', 'Notification in-app'] },
    },
    {
      id: 't3-res', type: 'process', position: { x: 240, y: 370 },
      data: { variant: 'mpt-layer', layer: 'result', label: 'Résultats émis', items: ['Entretien planifié → mail candidat + notif participants', 'Candidat accepte → mise à jour response_status', 'Candidat refuse → round annulé, abandon', 'Candidat propose alternative → reschedule, notif recruteur'] },
    },

    /* ═══ T4 — DÉCIDER ═══ */
    {
      id: 't4-trig', type: 'process', position: { x: 20, y: 510 },
      data: { variant: 'mpt-layer', layer: 'trigger', label: 'Déclencheur', items: ['Round DECISION ouvert', 'Recruteur saisit décision'] },
    },
    {
      id: 't4-fe', type: 'process', position: { x: 300, y: 510 },
      data: { variant: 'mpt-layer', layer: 'fe', label: 'IHM Angular', items: ['DecisionPanelComponent', 'Sélection type décision', 'Justification obligatoire si annulation'] },
    },
    {
      id: 't4-ctrl', type: 'process', position: { x: 580, y: 510 },
      data: { variant: 'mpt-layer', layer: 'controller', label: 'Contrôleur REST', items: ['DecisionController', 'POST /api/decisions', 'PUT /api/decisions/{id}/cancel'] },
    },
    {
      id: 't4-svc', type: 'process', position: { x: 20, y: 670 },
      data: { variant: 'mpt-layer', layer: 'service', label: 'Service métier', items: ['DecisionService', 'createDecision(progId, dto)', 'cancelDecision(decisionId, justification)', 'Valide progress → recalcule current_progress_id', "Vérifie requires_manual_confirmation"] },
    },
    {
      id: 't4-db', type: 'process', position: { x: 330, y: 670 },
      data: { variant: 'mpt-layer', layer: 'db', label: 'SGBD MySQL', items: ['INSERT decisions', 'UPDATE application_progress', 'UPDATE applications.current_*', 'INSERT audit_event (DECIDE)', 'INSERT mail_log (si confirmation requise)'] },
    },
    {
      id: 't4-ext', type: 'process', position: { x: 640, y: 670 },
      data: { variant: 'mpt-layer', layer: 'ext', label: 'Externe', items: ['SMTP → mail final', 'Notification in-app'] },
    },
    {
      id: 't4-res', type: 'process', position: { x: 200, y: 830 },
      data: { variant: 'mpt-layer', layer: 'result', label: 'Résultats émis', items: ['Round suivant ouvert → nouvelle ligne application_progress', 'Candidature finalisée RECRUTE/NON_RETENU → mail final', 'Mail en attente → recruteur doit confirmer envoi', 'Annulation → CANCEL/ROLLBACK + réouverture round'] },
    },
  ],
  edges: [
    /* T3 */
    { id: 'e-t3-trig-fe', source: 't3-trig', target: 't3-fe', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-fe-ctrl', source: 't3-fe', target: 't3-ctrl', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-ctrl-svc', source: 't3-ctrl', target: 't3-svc', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-svc-repo', source: 't3-svc', target: 't3-repo', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-repo-db', source: 't3-repo', target: 't3-db', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-svc-ext', source: 't3-svc', target: 't3-ext', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t3-db-res', source: 't3-db', target: 't3-res', type: 'traitement', data: {} },

    /* T4 */
    { id: 'e-t4-trig-fe', source: 't4-trig', target: 't4-fe', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-fe-ctrl', source: 't4-fe', target: 't4-ctrl', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-ctrl-svc', source: 't4-ctrl', target: 't4-svc', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-svc-db', source: 't4-svc', target: 't4-db', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-svc-ext', source: 't4-svc', target: 't4-ext', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t4-db-res', source: 't4-db', target: 't4-res', type: 'traitement', data: {} },
  ],
}
