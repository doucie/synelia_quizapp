import { MarkerType } from '@xyflow/react'
import type { DiagramDefinition } from '../../types'

/**
 * Cycle de vie d’une occurrence d’étape (4.3.3) — reconstruit sur le vrai
 * moteur (`ApplicationProgressBusiness`), pas sur le mémoire.
 *
 * - Toutes les occurrences sont pré-créées `PENDING` à l’init : avancer, c’est
 *   activer (`activateNextPendingStage` = premier `PENDING` d’ordre supérieur),
 *   jamais créer. Un seul `IN_PROGRESS` à la fois.
 * - `passStage` : `COMPLETED` → activation suivante (fin s’il n’y en a plus).
 * - `failStage` : `FAILED` → si éliminatoire, cascade `SKIPPED` + arrêt, sinon
 *   on continue. `skipStage` : `SKIPPED` → suite (`CANDIDATURE`/`DECISION`
 *   non skippables). `rollbackStage` : vrai retour en arrière vers
 *   `IN_PROGRESS` (dessiné depuis `COMPLETED`, valable pour tout résolu).
 * - Gardes : précédent requis résolu, pas de mail requis en attente.
 * - Verdict : pas un état universel — la décision (`PRE_SCREEN`/`FINAL`,
 *   accepté/rejeté) fait muter l’étape `PRESELECTION`/`DECISION` via le moteur.
 * - `AWAITING_VALIDATION` (jamais piloté côté progression) et
 *   `EXPIRED`/`CANCELLED` quiz (déclarés, jamais posés — l’inactivité donne
 *   `FAILED`) sont omis, voir légende body.
 *
 * Le bandeau bas n’est pas le moteur mais sa LECTURE dossier (miroirs,
 * `applicationAbandoned`, retrait) : mini-boîtes en pointillés reliées en
 * tirets fins avec pastille-condition — jamais des transitions.
 *
 * Flèches `markerEnd` (couleur explicite), pastilles `labelPx: 22`,
 * `smoothstep` (règle `startsWith('mct')` inchangée), handles tous déclarés.
 * Chaque ancre ne porte que des arêtes compatibles : les groupes de 2 ne
 * concernent que des tirets fins (fourche ±14 assumée, précédent fig. 4),
 * les descentes pleines restent en groupe de 1, droites.
 */

const COL_X = 560
const COL_WIDTH = 480
const SIDE_X = 60
const SIDE_WIDTH = 380
const TERM_X = 1200
const TERM_WIDTH = 380
const BAND_Y = 1280
const TAG_Y = 1220

const GREEN = 'hsl(128, 100%, 40%)'
const RED = 'hsl(0, 100%, 40%)'

const arrow = (color?: string) => ({ type: MarkerType.ArrowClosed as const, ...(color ? { color } : {}) })

const edge = (
  id: string,
  source: string,
  target: string,
  sourceHandle: string,
  targetHandle: string,
  opts: { label?: string; stroke?: string; dashed?: boolean; marker?: string } = {},
) => ({
  id,
  source,
  target,
  sourceHandle,
  targetHandle,
  type: 'traitement' as const,
  markerEnd: arrow(opts.marker),
  data: {
    ...(opts.label ? { label: opts.label, labelPx: 22 } : {}),
    ...(opts.stroke ? { stroke: opts.stroke } : {}),
    ...(opts.dashed ? { isDashed: true } : {}),
  },
})

const active = (id: string, x: number, y: number, w: number, label: string, stateDesc: string) => ({
  id,
  type: 'entity' as const,
  position: { x, y },
  style: { width: w },
  data: {
    label,
    variant: 'state' as const,
    stateKind: 'active' as const,
    stateDesc,
    // Toujours égal à la largeur posée (cf. `exportWidth`).
    exportWidth: w,
  },
})

const terminal = (
  id: string,
  x: number,
  y: number,
  w: number,
  label: string,
  stateTone: 'kept' | 'rejected' | 'muted',
) => ({
  id,
  type: 'entity' as const,
  position: { x, y },
  style: { width: w },
  data: {
    label,
    variant: 'state' as const,
    stateKind: 'terminal' as const,
    stateTone,
    // Toujours égal à la largeur posée (cf. `exportWidth`).
    exportWidth: w,
  },
})

const dossier = (
  id: string,
  x: number,
  label: string,
  stateTone: 'kept' | 'rejected' | 'muted',
) => ({
  id,
  type: 'entity' as const,
  position: { x, y: BAND_Y },
  style: { width: 300 },
  data: {
    label,
    variant: 'state' as const,
    stateKind: 'dossier' as const,
    stateTone,
    // Toujours égal à 300 (cf. `exportWidth`).
    exportWidth: 300,
  },
})

export const cycleEtape: DiagramDefinition = {
  id: 'memoire-cycle-etape',
  title: 'Cycle de vie d’une occurrence d’étape',
  category: 'memoire',
  domain: '4.3.3 — Diagrammes d’activités et d’états',
  nodes: [
    {
      id: 'depart',
      type: 'entity' as const,
      position: { x: 800 - 12, y: 40 },
      style: { width: 24 },
      data: {
        label: '',
        variant: 'state' as const,
        stateKind: 'start' as const,
        exportWidth: 24,
      },
    },
    active('pending', COL_X, 140, COL_WIDTH, 'PENDING', 'Occurrence créée à l’init, en attente d’activation.'),
    active('in-progress', COL_X, 430, COL_WIDTH, 'IN_PROGRESS', 'Une seule active à la fois : quiz, entretien, décision…'),
    active('completed', COL_X, 720, COL_WIDTH, 'COMPLETED', 'Score ≥ seuil ou validation manuelle.'),
    terminal('failed', TERM_X, 430, TERM_WIDTH, 'FAILED', 'rejected'),
    terminal('skipped', SIDE_X, 430, SIDE_WIDTH, 'SKIPPED', 'muted'),
    {
      id: 'etape-suivante',
      type: 'entity' as const,
      position: { x: 600, y: 1010 },
      style: { width: 400 },
      data: {
        label: 'ÉTAPE SUIVANTE — même cycle',
        variant: 'state' as const,
        stateKind: 'ghost' as const,
        stateDesc: 'Fin du pipeline s’il n’y en a plus.',
        // Toujours égal à 400 (cf. `exportWidth`).
        exportWidth: 400,
      },
    },
    {
      id: 'tag-dossier',
      type: 'entity' as const,
      position: { x: SIDE_X, y: TAG_Y },
      style: { width: 600 },
      data: {
        label: 'DOSSIER (lecture)',
        variant: 'state' as const,
        stateKind: 'tag' as const,
        exportWidth: 600,
      },
    },
    dossier('d-abandonnee', SIDE_X, 'ABANDONNÉE', 'muted'),
    dossier('d-retiree', 390, 'RETIRÉE', 'muted'),
    dossier('d-accepte', 720, 'ACCEPTÉ', 'kept'),
    dossier('d-rejete', 1050, 'REJETÉ', 'rejected'),
  ],
  edges: [
    edge('e-init', 'depart', 'pending', 'bottom', 'top', { label: 'init' }),
    edge('e-activation', 'pending', 'in-progress', 'bottom', 'top', { label: 'activation' }),
    edge('e-validation', 'in-progress', 'completed', 'bottom', 'top', { label: 'validation' }),
    edge('e-next', 'completed', 'etape-suivante', 'bottom', 'top', {
      label: 'activation suivante',
      stroke: GREEN,
      marker: GREEN,
    }),
    edge('e-fail', 'in-progress', 'failed', 'right', 'left', {
      label: 'échec',
      stroke: RED,
      marker: RED,
    }),
    edge('e-skip', 'pending', 'skipped', 'left', 'top', { label: 'saut autorisé', dashed: true }),
    // Seule réouverture dessinée (depuis COMPLETED) : `rollbackStage` vaut
    // pour tout état résolu — voir légende body pour FAILED.
    edge('e-reopen', 'completed', 'in-progress', 'left', 'left', { label: 'réouverture', dashed: true }),
    // Lectures dossier : tirets fins, flèche neutre, pastille-condition.
    edge('e-l-rejete', 'failed', 'd-rejete', 'bottom', 'top', { label: 'si éliminatoire', dashed: true }),
    edge('e-l-accepte', 'completed', 'd-accepte', 'right', 'top', { label: 'si DECISION', dashed: true }),
    edge('e-l-abandon', 'in-progress', 'd-abandonnee', 'left', 'top', { label: 'inactivité', dashed: true }),
    edge('e-l-retrait', 'in-progress', 'd-retiree', 'left', 'top', { label: 'retrait', dashed: true }),
  ],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
