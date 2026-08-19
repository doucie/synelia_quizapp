// @ts-nocheck
import type { DiagramDefinition } from '../../types'

export const sat1SetupPreselection: DiagramDefinition = {
  id: 'sat-1-setup-preselection',
  title: 'SAT 1 — Setup à Présélection',
  category: 'archive',
  domain: 'SAT 1 — Setup à Présélection (T0→T3)',
  nodes: [
    /* ── Lane backgrounds ── */
    {
      id: 'lane-cand', type: 'process', position: { x: 170, y: 70 },
      data: { variant: 'sat-lane', label: '', dimensions: { width: 240, height: 860 } },
    },
    {
      id: 'lane-syst', type: 'process', position: { x: 420, y: 70 },
      data: { variant: 'sat-lane', label: '', badge: 'auto', dimensions: { width: 240, height: 860 } },
    },
    {
      id: 'lane-recr', type: 'process', position: { x: 670, y: 70 },
      data: { variant: 'sat-lane', label: '', badge: 'alt', dimensions: { width: 240, height: 860 } },
    },
    {
      id: 'lane-eval', type: 'process', position: { x: 920, y: 70 },
      data: { variant: 'sat-lane', label: '', badge: 'eval', dimensions: { width: 200, height: 860 } },
    },
    {
      id: 'lane-adm', type: 'process', position: { x: 1130, y: 70 },
      data: { variant: 'sat-lane', label: '', badge: 'adm', dimensions: { width: 200, height: 860 } },
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

    /* ═══ T0 — CONFIGURATION ═══ */
    {
      id: 'p0', type: 'process', position: { x: 20, y: 100 },
      data: { variant: 'sat-phase', label: 'T0 — Setup<small><br/>asynchrone</small>' },
    },
    {
      id: 't0-adm', type: 'process', position: { x: 1140, y: 100 },
      data: { variant: 'sat-task', label: 'Définir pipeline_template', meta: 'adm', detail: 'Stages, critères, règles de notification.' },
    },
    {
      id: 't0-recr', type: 'process', position: { x: 680, y: 100 },
      data: { variant: 'sat-task', label: 'Créer la campagne', meta: 'manual', detail: 'Choix template, formulaires, sources, ouverture.' },
    },

    /* ═══ T1 — CANDIDATURE ═══ */
    {
      id: 'p1', type: 'process', position: { x: 20, y: 240 },
      data: { variant: 'sat-phase', label: 'T1 — Candidature<small><br/>temps réel</small>' },
    },
    {
      id: 't1-cand', type: 'process', position: { x: 180, y: 240 },
      data: { variant: 'sat-task', label: 'Soumettre candidature', meta: 'interactive', detail: 'Identité, CV, lettre, double opt-in email.' },
    },
    {
      id: 't1-syst', type: 'process', position: { x: 430, y: 240 },
      data: { variant: 'sat-task', label: 'Créer applications + progress[0]', meta: 'auto', detail: 'Résout template, instancie stages, audit CREATE, mail accusé.' },
    },

    /* ═══ T2 — QUIZ ═══ */
    {
      id: 'p2', type: 'process', position: { x: 20, y: 390 },
      data: { variant: 'sat-phase', label: 'T2 — Quiz<small><br/>chronométré</small>' },
    },
    {
      id: 't2-open', type: 'process', position: { x: 430, y: 400 },
      data: { variant: 'sat-task', label: 'Ouvrir round QUIZ', meta: 'auto', detail: 'Crée application_quiz_attempt + quiz_token, notifie.' },
    },
    {
      id: 't2-cand', type: 'process', position: { x: 180, y: 390 },
      data: { variant: 'sat-task', label: 'Passer le quiz', meta: 'interactive', detail: 'Réponses candidate_answer rattachées à la tentative.' },
    },
    {
      id: 't2-score', type: 'process', position: { x: 430, y: 520 },
      data: { variant: 'sat-task', label: 'Calculer score + screening', meta: 'auto', detail: 'Agrège score_percent, applique screening_mode, met à jour aggregated_quiz_score.' },
    },

    /* ═══ T3 — PRÉSÉLECTION ═══ */
    {
      id: 'p3', type: 'process', position: { x: 20, y: 660 },
      data: { variant: 'sat-phase', label: 'T3 — Présélection<small><br/>différé</small>' },
    },
    {
      id: 't3-recr-read', type: 'process', position: { x: 680, y: 660 },
      data: { variant: 'sat-task', label: 'Consulter résultats QUIZ', meta: 'manual', detail: 'Filtre, exporte, compare tentatives.' },
    },
    {
      id: 't3-recr-dec', type: 'process', position: { x: 680, y: 770 },
      data: { variant: 'sat-task', label: 'Saisir décision PRESELECTION', meta: 'manual', detail: 'Crée decisions sur application_progress courant, justification.' },
    },
    {
      id: 't3-syst', type: 'process', position: { x: 430, y: 770 },
      data: { variant: 'sat-task', label: 'Clôturer round + ouvrir suivant', meta: 'auto', detail: 'Valide application_progress, recalcule current_application_progress_id, notifie.' },
    },
  ],
  edges: [
    { id: 'e-t0-adm-recr', source: 't0-adm', target: 't0-recr', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t0-recr-t1-cand', source: 't0-recr', target: 't1-cand', type: 'traitement', data: { isDashed: true } },
    { id: 'e-t1-cand-syst', source: 't1-cand', target: 't1-syst', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t1-syst-t2-open', source: 't1-syst', target: 't2-open', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-open-cand', source: 't2-open', target: 't2-cand', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-cand-score', source: 't2-cand', target: 't2-score', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t2-score-recr-read', source: 't2-score', target: 't3-recr-read', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-recr-read-dec', source: 't3-recr-read', target: 't3-recr-dec', type: 'traitement', data: { isStrong: true } },
    { id: 'e-t3-recr-dec-syst', source: 't3-recr-dec', target: 't3-syst', type: 'traitement', data: { isStrong: true } },
  ],
}

