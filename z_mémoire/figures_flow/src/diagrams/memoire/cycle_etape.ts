import { MarkerType } from '@xyflow/react'
import type { DiagramDefinition } from '../../types'

/**
 * Cycle de vie générique d’une étape du pipeline (4.3.3).
 *
 * Pas une séquence fixe d’étapes nommées : le cycle d’UNE étape quelconque
 * (quiz, présélection, entretien, décision). La flèche « réussie » repart en
 * boucle vers EN_ATTENTE — c’est elle qui prouve que le nombre et l’ordre des
 * étapes ne sont pas codés en dur. Si dernière étape, « réussie » mène à
 * DÉCIDÉ ; sinon les trois sorties d’échec (REJETÉ, ABANDONNÉE, RETIRÉE).
 *
 * États français = convention des figures du mémoire ; correspondance code
 * (`application_progress.progress_status`) : EN_ATTENTE ≈ `PENDING`,
 * EN_COURS ≈ `IN_PROGRESS`, réussie ≈ `COMPLETED`, échouée ≈ `FAILED`,
 * expirée ≈ `EXPIRED`, retirée ≈ `SKIPPED` / `CANCELLED`. DÉCIDÉ, REJETÉ,
 * ABANDONNÉE et RETIRÉE sont la lecture terminale du dossier.
 *
 * Pointes de flèche (`markerEnd`, première figure du projet à en porter) :
 * `EdgeWrapper` calcule l’URL et rend les `<defs>` globales depuis le champ
 * `markerEnd` de l’arête — `TraitementEdge` ne fait que retransmettre à
 * `BaseEdge`. Couleur explicite assortie au trait (l’héritage par défaut est
 * incertain) ; arêtes neutres et tirets : défaut (`#b1b1b7`, = le trait).
 * `smoothstep` conservé (règle `startsWith('mct')` inchangée) ; handles tous
 * déclarés ; l’ancre `right` d’EN_COURS porte 4 arêtes (offsets absorbés par
 * les coudes, précédent des sorties de la figure 4).
 */

const COL_X = 560
const COL_WIDTH = 480
const TERM_X = 1200
const TERM_WIDTH = 380

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

const active = (id: string, y: number, label: string, stateDesc: string) => ({
  id,
  type: 'entity' as const,
  position: { x: COL_X, y },
  style: { width: COL_WIDTH },
  data: {
    label,
    variant: 'state' as const,
    stateKind: 'active' as const,
    stateDesc,
    // Toujours égal à `COL_WIDTH` (cf. `exportWidth`).
    exportWidth: COL_WIDTH,
  },
})

const terminal = (
  id: string,
  y: number,
  label: string,
  stateTone: 'kept' | 'rejected' | 'muted',
) => ({
  id,
  type: 'entity' as const,
  position: { x: TERM_X, y },
  style: { width: TERM_WIDTH },
  data: {
    label,
    variant: 'state' as const,
    stateKind: 'terminal' as const,
    stateTone,
    // Toujours égal à `TERM_WIDTH` (cf. `exportWidth`).
    exportWidth: TERM_WIDTH,
  },
})

export const cycleEtape: DiagramDefinition = {
  id: 'memoire-cycle-etape',
  title: 'Cycle de vie générique d’une étape du pipeline',
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
    active('en-attente', 140, 'EN_ATTENTE', 'L’étape est prête à démarrer.'),
    active(
      'en-cours',
      430,
      'EN_COURS',
      'Étape active : quiz en passation, entretien planifié, etc.',
    ),
    terminal('decide', 140, 'DÉCIDÉ', 'kept'),
    terminal('rejete', 430, 'REJETÉ', 'rejected'),
    terminal('abandonnee', 580, 'ABANDONNÉE', 'muted'),
    terminal('retiree', 730, 'RETIRÉE', 'muted'),
  ],
  edges: [
    edge('e-depart', 'depart', 'en-attente', 'bottom', 'top'),
    edge('e-declenchement', 'en-attente', 'en-cours', 'bottom', 'top', { label: 'déclenchement' }),
    // La boucle : même abscisse des deux côtés → droite verticale pure.
    edge('e-reussie', 'en-cours', 'en-attente', 'left', 'left', {
      label: 'réussie',
      stroke: GREEN,
      marker: GREEN,
    }),
    edge('e-decide', 'en-cours', 'decide', 'right', 'left', {
      label: 'dernière étape',
      stroke: GREEN,
      marker: GREEN,
    }),
    edge('e-rejete', 'en-cours', 'rejete', 'right', 'left', {
      label: 'échouée',
      stroke: RED,
      marker: RED,
    }),
    edge('e-expiree', 'en-cours', 'abandonnee', 'right', 'left', { label: 'expirée', dashed: true }),
    edge('e-retiree', 'en-cours', 'retiree', 'right', 'left', { label: 'retirée', dashed: true }),
  ],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
