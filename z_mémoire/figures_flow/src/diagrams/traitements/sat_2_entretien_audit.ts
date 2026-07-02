import type { DiagramDefinition } from '../../types'

export const sat2EntretienAudit: DiagramDefinition = {
  id: 'sat-2-entretien-audit',
  title: 'SAT 2 — Entretien à Audit',
  category: 'traitements',
  domain: 'SAT 2 — Entretien à Audit (T4→T7)',
  nodes: [
    /* ── Lane backgrounds ── */
    {
      id: 'lane-cand', type: 'process', position: { x: 170, y: 70 },
      data: { variant: 'sat-lane', label: '', dimensions: { width: 240, height: 920 } },
    },
    {
      id: 'lane-syst', type: 'process', position: { x: 420, y: 70 },
      data: { variant: 'sat-lane', label: '', badge: 'auto', dimensions: { width: 240, height: 920 } },
    },
    {
      id: 'lane-recr', type: 'process', position: { x: 670, y: 70 },
      data: { variant: 'sat-lane', label: '', badge: 'alt', dimensions: { width: 240, height: 920 } },
    },
    {
      id: 'lane-eval', type: 'process', position: { x: 920, y: 70 },
      data: { variant: 'sat-lane', label: '', badge: 'eval', dimensions: { width: 200, height: 920 } },
    },
    {
      id: 'lane-adm', type: 'process', position: { x: 1130, y: 70 },
      data: { variant: 'sat-lane', label: '', badge: 'adm', dimensions: { width: 200, height: 920 } },
    },

    /* ── Column headers ── */
    {
      id: 'h-time', type: 'process', position: { x: 20, y: 15 },
      data: { variant: 'sat-head', label: 'Phase' },
    },
    {
      id: 'h-cand', type: 'process', position: { x: 180, y: 15 },
      data: { variant: 'sat-head', label: 'Candidat' },
    },
    {
      id: 'h-syst', type: 'process', position: { x: 430, y: 15 },
      data: { variant: 'sat-head', label: 'Système (auto)', badge: 'auto' },
    },
    {
      id: 'h-recr', type: 'process', position: { x: 680, y: 15 },
      data: { variant: 'sat-head', label: 'Recruteur', badge: 'alt' },
    },
    {
      id: 'h-eval', type: 'process', position: { x: 930, y: 15 },
      data: { variant: 'sat-head', label: 'Évaluateur', badge: 'eval' },
    },
    {
      id: 'h-adm', type: 'process', position: { x: 1140, y: 15 },
      data: { variant: 'sat-head', label: 'Admin.', badge: 'adm' },
    },

    /* ═══ T4 — ENTRETIEN + ÉVALUATION ═══ */
    {
      id: 'p4', type: 'process', position: { x: 20, y: 100 },
      data: { variant: 'sat-phase', label: 'T4 — Entretien<small><br/>multi-acteurs</small>' },
    },
    {
      id: 't4-recr-plan', type: 'process', position: { x: 680, y: 100 },
      data: { variant: 'sat-task', label: 'Planifier l\'entretien', meta: 'manual', detail: 'Crée interviews rattaché au round, affecte interview_participant.' },
    },
    {
      id: 't4-syst-notif', type: 'process', position: { x: 430, y: 100 },
      data: { variant: 'sat-task', label: 'Notifier candidat + participants', meta: 'auto', detail: 'Mails ON_INTERVIEW_PLANNED, notifications in-app.' },
    },
    {
      id: 't4-cand-resp', type: 'process', position: { x: 180, y: 220 },
      data: { variant: 'sat-task', label: 'Accepter / refuser / proposer alternative', meta: 'interactive', detail: 'Met à jour candidate_interview.candidate_response_status.' },
    },
    {
      id: 't4-eval', type: 'process', position: { x: 930, y: 350 },
      data: { variant: 'sat-task', label: 'Remplir grille d\'évaluation', meta: 'eval', detail: 'Crée evaluations + un evaluation_item par critère.' },
    },
    {
      id: 't4-syst-aggr', type: 'process', position: { x: 430, y: 350 },
      data: { variant: 'sat-task', label: 'Clôturer + agréger', meta: 'auto', detail: 'Calcule aggregated_evaluation_score, valide le round, audit CLOSE + VALIDATE.' },
    },

    /* ═══ T5 — DÉCISION FINALE ═══ */
    {
      id: 'p5', type: 'process', position: { x: 20, y: 510 },
      data: { variant: 'sat-phase', label: 'T5 — Décision finale<small><br/>verrouillante</small>' },
    },
    {
      id: 't5-recr', type: 'process', position: { x: 680, y: 510 },
      data: { variant: 'sat-task', label: 'Saisir décision DECISION', meta: 'manual', detail: 'Type RECRUTE / NON_RETENU, justification finale.' },
    },
    {
      id: 't5-syst', type: 'process', position: { x: 430, y: 510 },
      data: { variant: 'sat-task', label: 'Envoyer email final + verrouiller', meta: 'auto', detail: 'Évalue règle ON_FINAL_DECISION, confirme envoi si requires_manual_confirmation.' },
    },

    /* ═══ T6 — ROLLBACK ═══ */
    {
      id: 'p6', type: 'process', position: { x: 20, y: 660 },
      data: { variant: 'sat-phase', label: 'T6 — Rollback<small><br/>exceptionnel</small>' },
    },
    {
      id: 't6-recr', type: 'process', position: { x: 680, y: 660 },
      data: { variant: 'sat-task', label: 'Annuler / réouvrir une décision', meta: 'manual', detail: 'decision_mode = CANCEL ou ROLLBACK + justification + cancels_decision_id.' },
    },
    {
      id: 't6-syst', type: 'process', position: { x: 430, y: 660 },
      data: { variant: 'sat-task', label: 'Recalculer parcours + audit ROLLBACK', meta: 'auto', detail: 'Réouvre application_progress, recalcule current_application_progress_id.' },
    },

    /* ═══ T7 — AUDIT ═══ */
    {
      id: 'p7', type: 'process', position: { x: 20, y: 820 },
      data: { variant: 'sat-phase', label: 'T7 — Audit<small><br/>transverse</small>' },
    },
    {
      id: 't7-syst', type: 'process', position: { x: 430, y: 820 },
      data: { variant: 'sat-task', label: 'Journaliser audit_event', meta: 'auto', detail: 'CREATE / UPDATE / DECIDE / CANCEL / SUBMIT / CLOSE / VALIDATE (asynchrone).' },
    },
    {
      id: 't7-adm', type: 'process', position: { x: 1140, y: 820 },
      data: { variant: 'sat-task', label: 'Consulter audit / superviser', meta: 'adm', detail: 'Filtres par acteur, période, action ; export RGPD.' },
    },
  ],
  edges: [
    /* T4 */
    { id: 'e-t4-recr-plan-notif', source: 't4-recr-plan', target: 't4-syst-notif', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-notif-cand', source: 't4-syst-notif', target: 't4-cand-resp', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-cand-eval', source: 't4-cand-resp', target: 't4-eval', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-eval-aggr', source: 't4-eval', target: 't4-syst-aggr', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t4-aggr-t5-recr', source: 't4-syst-aggr', target: 't5-recr', type: 'traitement', data: { isStrong: true } },

    /* T5 */
    { id: 'e-t5-recr-syst', source: 't5-recr', target: 't5-syst', type: 'traitement', data: { isStrong: true } },

    /* T6 (boucle exceptionnelle) */
    { id: 'e-t5-syst-t6-recr', source: 't5-syst', target: 't6-recr', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t6-recr-syst', source: 't6-recr', target: 't6-syst', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t6-syst-t5-recr', source: 't6-syst', target: 't5-recr', type: 'traitement', data: { isDashed: true } },

    /* T7 audit transverse */
    { id: 'e-t4-syst-aggr-t7', source: 't4-syst-aggr', target: 't7-syst', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t5-syst-t7', source: 't5-syst', target: 't7-syst', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t6-syst-t7', source: 't6-syst', target: 't7-syst', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t7-syst-adm', source: 't7-syst', target: 't7-adm', type: 'traitement', data: { isDashed: true } },
  ],
}
