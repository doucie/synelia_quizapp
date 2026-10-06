import type { DiagramDefinition } from '../../types'

/**
 * Acteurs du système — présentation neutre et plate.
 *
 * Les quatre colonnes sont volontairement interchangeables : même largeur, même
 * cercle, même typographie et même hauteur minimale. L’ordre suit le texte de la
 * section 1.3.2, sans indiquer une hiérarchie. Les couleurs distinguent les
 * rôles ; elles ne les classent pas et ne devront pas servir d’échelle
 * hiérarchique dans une autre figure.
 */

const CANVAS_MARGIN = 120
const COLUMN_WIDTH = 555
const COLUMN_GAP = 60
const COLUMN_MIN_HEIGHT = 360
const RULE_Y = 440
const RULE_WIDTH = 4 * COLUMN_WIDTH + 3 * COLUMN_GAP

const ACTORS = [
  {
    id: 'super-administrateur',
    initial: 'SA',
    role: 'Super administrateur',
    roleFunction: 'Pilotage global et paramètres sensibles',
    color: 'hsl(210, 100%, 40%)',
  },
  {
    id: 'administrateur',
    initial: 'A',
    role: 'Administrateur',
    roleFunction: 'Référentiels et configuration technique',
    color: 'hsl(240, 100%, 40%)',
  },
  {
    id: 'recruteur',
    initial: 'R',
    role: 'Recruteur',
    roleFunction: 'Pilotage opérationnel du recrutement',
    color: 'hsl(285, 100%, 40%)',
  },
  {
    id: 'candidat',
    initial: 'C',
    role: 'Candidat',
    roleFunction: 'Parcours public sécurisé',
    color: 'hsl(330, 100%, 40%)',
  },
] as const

export const acteursSysteme: DiagramDefinition = {
  id: 'memoire-acteurs-systeme',
  title: 'Acteurs du système',
  category: 'memoire',
  domain: '1.3.2 — Acteurs du système',
  nodes: [
    ...ACTORS.map((actor, index) => ({
      id: actor.id,
      type: 'entity' as const,
      position: {
        x: CANVAS_MARGIN + index * (COLUMN_WIDTH + COLUMN_GAP),
        y: 0,
      },
      style: { width: COLUMN_WIDTH },
      data: {
        label: actor.role,
        variant: 'actor' as const,
        actorInitial: actor.initial,
        actorFunction: actor.roleFunction,
        color: actor.color,
        minHeight: COLUMN_MIN_HEIGHT,
        // Toujours égal à `COLUMN_WIDTH` : c’est cette valeur, en px inline
        // sur la racine, qui fige la largeur à l’export (cf. `exportWidth`).
        exportWidth: COLUMN_WIDTH,
      },
    })),
    {
      id: 'filet-commun',
      type: 'entity' as const,
      position: { x: CANVAS_MARGIN, y: RULE_Y },
      style: { width: RULE_WIDTH },
      data: {
        label: '',
        variant: 'actor' as const,
        actorRule: true,
        color: 'hsl(210, 100%, 40%)',
        // Toujours égal à `RULE_WIDTH` (cf. `exportWidth`).
        exportWidth: RULE_WIDTH,
      },
    },
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
