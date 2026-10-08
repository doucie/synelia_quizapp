import type { DiagramDefinition } from '../../types'

/**
 * Authentification — fourche puis convergence (3.2.1).
 *
 * Deux mécanismes complètement différents aboutissent au même résultat : un
 * accès contrôlé. Le point du schéma est la convergence finale, pas la
 * comparaison des chemins — d’où la géométrie en Y (un point en haut, deux
 * colonnes qui divergent, une boîte large en bas), volontairement distincte
 * du comparateur de pipelines (deux rails indépendants).
 *
 * Libellés sourcés du brief et des deux paragraphes de 3.2.1 (internes :
 * droits globaux du rôle + droits contextualisés campagne/entité ; candidat :
 * vérification d’email, codes de suivi, liens contextualisés). Les emojis du
 * brief sont rendus par des icônes Feather (pas d’emoji dans les figures).
 *
 * Arêtes `type: 'traitement'` posées par arête, muettes, tous handles
 * déclarés : pas d’entrée dans les familles verticales d’`edgeAnchors.ts`
 * (réservées MCT/orga). Les deux arêtes de convergence portent
 * `noAnchorOffset` : elles partagent l’ancrage `top` de la boîte commune, et
 * sans ça l’offset les éventaillerait à ±14 px (deux traits côte à côte au
 * lieu d’un seul point). En `smoothstep`, les deux segments finaux verticaux
 * se recouvrent exactement — un seul tronc. La fourche, elle, garde l’offset
 * (±14 px = l’éventail voulu).
 */

const LEFT = 'hsl(210, 100%, 40%)'
const RIGHT = 'hsl(330, 100%, 40%)'

const COL_W = 480
const LEFT_X = 60
const RIGHT_X = 660
const START_W = 560
const START_X = 320
const MERGE_W = 1080
const MERGE_X = 60
const STEP_MIN = 116
const STEP_PITCH = 140
const STEPS_Y = 340
const MERGE_Y = 940

const start = (id: string, y: number, label: string) => ({
  id,
  type: 'entity' as const,
  position: { x: START_X, y },
  style: { width: START_W },
  data: {
    label,
    variant: 'auth' as const,
    authKind: 'start' as const,
    // Toujours égal à `START_W` (cf. `exportWidth`).
    exportWidth: START_W,
  },
})

const band = (id: string, y: number, label: string, authColor: string, x: number) => ({
  id,
  type: 'entity' as const,
  position: { x, y },
  style: { width: COL_W },
  data: {
    label,
    variant: 'auth' as const,
    authKind: 'band' as const,
    authColor,
    // Toujours égal à `COL_W` (cf. `exportWidth`).
    exportWidth: COL_W,
  },
})

const step = (
  id: string,
  y: number,
  label: string,
  authIcon: 'key' | 'shield' | 'users' | 'lock' | 'link' | 'mail' | 'hash' | 'usercheck',
  authColor: string,
  x: number,
) => ({
  id,
  type: 'entity' as const,
  position: { x, y },
  style: { width: COL_W },
  data: {
    label,
    variant: 'auth' as const,
    authKind: 'step' as const,
    authIcon,
    authColor,
    minHeight: STEP_MIN,
    // Toujours égal à `COL_W` (cf. `exportWidth`).
    exportWidth: COL_W,
  },
})

const edge = (id: string, source: string, target: string, converge = false) => ({
  id,
  source,
  target,
  sourceHandle: 'bottom',
  targetHandle: 'top',
  type: 'traitement' as const,
  // Convergence en un point unique : l’offset d’ancrage partagé est ignoré
  // des deux côtés (cf. `noAnchorOffset` sur `RelationshipEdgeData`).
  data: converge ? { noAnchorOffset: true as const } : {},
})

export const authFourche: DiagramDefinition = {
  id: 'memoire-auth-fourche',
  title: 'Authentification — fourche puis convergence',
  category: 'memoire',
  domain: '3.2.1 — Authentification et gestion des utilisateurs',
  nodes: [
    start('start', 40, 'Un utilisateur arrive sur la plateforme'),
    band('band-left', 220, 'Utilisateurs internes', LEFT, LEFT_X),
    band('band-right', 220, 'Candidat — parcours public', RIGHT, RIGHT_X),
    step('l1', STEPS_Y, 'Connexion par identifiants', 'key', LEFT, LEFT_X),
    step('l2', STEPS_Y + STEP_PITCH, 'Vérification du rôle système (RBAC)', 'shield', LEFT, LEFT_X),
    step('l3', STEPS_Y + 2 * STEP_PITCH, 'Vérification des droits contextualisés', 'users', LEFT, LEFT_X),
    step('l4', STEPS_Y + 3 * STEP_PITCH, 'Accès à l’espace interne différencié', 'lock', LEFT, LEFT_X),
    step('r1', STEPS_Y, 'Lien/token contextualisé reçu', 'link', RIGHT, RIGHT_X),
    step('r2', STEPS_Y + STEP_PITCH, 'Vérification de l’adresse email', 'mail', RIGHT, RIGHT_X),
    step('r3', STEPS_Y + 2 * STEP_PITCH, 'Génération d’un code de suivi personnel', 'hash', RIGHT, RIGHT_X),
    step('r4', STEPS_Y + 3 * STEP_PITCH, 'Accès restreint à sa propre candidature', 'usercheck', RIGHT, RIGHT_X),
    {
      id: 'merge',
      type: 'entity' as const,
      position: { x: MERGE_X, y: MERGE_Y },
      style: { width: MERGE_W },
      data: {
        label: 'Accès contrôlé, conforme aux droits réels de l’utilisateur',
        variant: 'auth' as const,
        authKind: 'merge' as const,
        minHeight: 96,
        // Toujours égal à `MERGE_W` (cf. `exportWidth`).
        exportWidth: MERGE_W,
      },
    },
  ],
  edges: [
    edge('e-start-l1', 'start', 'l1'),
    edge('e-start-r1', 'start', 'r1'),
    edge('e-l1-l2', 'l1', 'l2'),
    edge('e-l2-l3', 'l2', 'l3'),
    edge('e-l3-l4', 'l3', 'l4'),
    edge('e-r1-r2', 'r1', 'r2'),
    edge('e-r2-r3', 'r2', 'r3'),
    edge('e-r3-r4', 'r3', 'r4'),
    edge('e-l4-merge', 'l4', 'merge', true),
    edge('e-r4-merge', 'r4', 'merge', true),
  ],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
