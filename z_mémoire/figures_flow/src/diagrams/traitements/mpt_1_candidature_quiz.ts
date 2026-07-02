import type { DiagramDefinition } from '../../types'

export const mpt1CandidatureQuiz: DiagramDefinition = {
  id: 'mpt-1-candidature-quiz',
  title: 'MPT 1 — Candidature & Quiz',
  category: 'traitements',
  domain: 'MPT 1 — Candidature & Quiz',
  nodes: [
    /* ═══ T1 — SOUMETTRE CANDIDATURE ═══ */
    {
      id: 't1-trig', type: 'process', position: { x: 20, y: 20 },
      data: { variant: 'mpt-layer', layer: 'trigger', label: 'Déclencheur', items: ['Lien campagne ouvert', 'Candidat saisit le formulaire'] },
    },
    {
      id: 't1-fe', type: 'process', position: { x: 300, y: 20 },
      data: { variant: 'mpt-layer', layer: 'fe', label: 'IHM Angular', items: ['ApplyPositionComponent', 'Formulaire réactif', 'Upload CV (MinIO)', 'Vérification email (code 6 chiffres)'] },
    },
    {
      id: 't1-ctrl', type: 'process', position: { x: 580, y: 20 },
      data: { variant: 'mpt-layer', layer: 'controller', label: 'Contrôleur REST', items: ['PublicApplicationController', 'POST /api/public/apply', 'POST /api/public/verify-email', 'DTO: ApplyRequest, VerifyRequest'] },
    },
    {
      id: 't1-svc', type: 'process', position: { x: 20, y: 180 },
      data: { variant: 'mpt-layer', layer: 'service', label: 'Service métier', items: ['ApplicationService', 'createApplication(dto)', 'Vérifie max_apply campagne', 'Résout pipeline_template', 'Crée application_progress[0]'] },
    },
    {
      id: 't1-repo', type: 'process', position: { x: 320, y: 180 },
      data: { variant: 'mpt-layer', layer: 'repo', label: "Couche d'accès", items: ['ApplicationRepository', 'ApplicationProgressRepository', 'CampaignRepository.findById()', 'SourceTokenRepository'] },
    },
    {
      id: 't1-db', type: 'process', position: { x: 630, y: 180 },
      data: { variant: 'mpt-layer', layer: 'db', label: 'SGBD MySQL', items: ['INSERT applications', 'INSERT application_progress', 'UPDATE campaign max_apply', 'INSERT audit_event (CREATE)'] },
    },
    {
      id: 't1-res', type: 'process', position: { x: 300, y: 370 },
      data: { variant: 'mpt-layer', layer: 'result', label: 'Résultats émis', items: ['Candidature créée → mail accusé + notification recruteur', 'ou Quota atteint → 409, audit REJECT', 'ou Token invalide → 403, audit SECURITY'] },
    },

    /* ═══ T2 — PASSER LE QUIZ ═══ */
    {
      id: 't2-trig', type: 'process', position: { x: 20, y: 490 },
      data: { variant: 'mpt-layer', layer: 'trigger', label: 'Déclencheur', items: ['Round QUIZ ouvert', 'Candidat ouvre /quiz/{token}'] },
    },
    {
      id: 't2-fe', type: 'process', position: { x: 300, y: 490 },
      data: { variant: 'mpt-layer', layer: 'fe', label: 'IHM Angular', items: ['QuizComponent', 'Affichage question par question', 'Timer chronométré', 'Sauvegarde auto des réponses'] },
    },
    {
      id: 't2-ctrl', type: 'process', position: { x: 580, y: 490 },
      data: { variant: 'mpt-layer', layer: 'controller', label: 'Contrôleur REST', items: ['PublicQuizController', 'GET /api/public/quiz/{token}', 'POST /api/public/quiz/answer', 'POST /api/public/quiz/submit'] },
    },
    {
      id: 't2-svc', type: 'process', position: { x: 20, y: 650 },
      data: { variant: 'mpt-layer', layer: 'service', label: 'Service métier', items: ['QuizAttemptService', 'createAttempt(token, formVersion)', 'saveAnswer(attemptId, questionId, value)', 'computeScore() → screening'] },
    },
    {
      id: 't2-repo', type: 'process', position: { x: 320, y: 650 },
      data: { variant: 'mpt-layer', layer: 'repo', label: "Couche d'accès", items: ['QuizAttemptRepository', 'CandidateAnswerRepository', 'FormVersionRepository', 'QuestionRepository'] },
    },
    {
      id: 't2-db', type: 'process', position: { x: 630, y: 650 },
      data: { variant: 'mpt-layer', layer: 'db', label: 'SGBD MySQL', items: ['INSERT quiz_attempt', 'INSERT candidate_answer × N', 'UPDATE aggregated_quiz_score', 'INSERT audit_event (SUBMIT)'] },
    },
    {
      id: 't2-res', type: 'process', position: { x: 240, y: 800 },
      data: { variant: 'mpt-layer', layer: 'result', label: 'Résultats émis', items: ['Réussi auto → round validé, progression round suivant, notification', 'À corriger → attente correction manuelle, notification évaluateur', 'Échec sous seuil → round refusé, candidature éliminée, mail ON_QUIZ_FAILED'] },
    },
  ],
  edges: [
    /* T1 */
    { id: 'e-t1-trig-fe', source: 't1-trig', target: 't1-fe', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-fe-ctrl', source: 't1-fe', target: 't1-ctrl', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-ctrl-svc', source: 't1-ctrl', target: 't1-svc', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-svc-repo', source: 't1-svc', target: 't1-repo', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-repo-db', source: 't1-repo', target: 't1-db', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-db-res', source: 't1-db', target: 't1-res', type: 'traitement', data: {} },

    /* T2 */
    { id: 'e-t2-trig-fe', source: 't2-trig', target: 't2-fe', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-fe-ctrl', source: 't2-fe', target: 't2-ctrl', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-ctrl-svc', source: 't2-ctrl', target: 't2-svc', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-svc-repo', source: 't2-svc', target: 't2-repo', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-repo-db', source: 't2-repo', target: 't2-db', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-db-res', source: 't2-db', target: 't2-res', type: 'traitement', data: {} },
  ],
}
