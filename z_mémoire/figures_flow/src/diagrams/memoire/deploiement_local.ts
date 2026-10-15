import { MarkerType } from '@xyflow/react'
import type { DiagramDefinition } from '../../types'

/**
 * Exécution locale et DevOps — topologie de déploiement (6.6).
 *
 * Où ça tourne concrètement (pas l’architecture logique) : natif sur l’hôte
 * (Angular, Spring, MySQL-externe) vs conteneurisé (Redis, MinIO dans le
 * cadre pointillé Compose). Le trait plein/pointillé porte le sens, pas le
 * fond. Ports en évidence, pastille « proxy /api/** » sur le lien
 * Angular→Spring.
 *
 * Libellés et ports sourcés du § 6.6 et de la table des services (:1274-1278) :
 * MySQL hors Compose (:1267), proxy Angular (:1269). 2 cadres tailles fixes +
 * 5 services, 4 flèches `markerEnd` (pattern fig. 7). Routage sans
 * recouvrement (voir plan) ; tous handles déclarés.
 */

const ANGULAR = 'hsl(335, 100%, 40%)'
const SPRING = 'hsl(100, 100%, 40%)'
const MYSQL = 'hsl(128, 100%, 40%)'
const REDIS = 'hsl(0, 100%, 40%)'
const MINIO = 'hsl(210, 100%, 40%)'

const arrow = () => ({ type: MarkerType.ArrowClosed as const })

const frame = (
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  deployTitle: string,
  deployDashed = false,
  deployLogo?: 'docker',
  deployAccent?: string,
  deployIcon?: 'monitor',
  deployArt?: 'host-machine' | 'containers',
  deployArtAfter?: boolean,
) => ({
  id,
  type: 'entity' as const,
  position: { x, y },
  style: { width: w },
  data: {
    label: deployTitle,
    variant: 'deploy' as const,
    deployKind: 'frame' as const,
    deployTitle,
    deployDashed,
    ...(deployLogo ? { deployLogo, deployAccent } : {}),
    ...(deployIcon ? { deployIcon } : {}),
    ...(deployArt ? { deployArt, ...(deployArtAfter ? { deployArtAfter: true as const } : {}) } : {}),
    minHeight: h,
    // Toujours égal à `w` (cf. `exportWidth`).
    exportWidth: w,
  },
})

const service = (
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  deployLogo: 'angular' | 'springboot' | 'mysql' | 'redis' | 'minio' | null,
  deployAccent: string,
  deployPort: string,
  deployNote?: string,
  deployBadge?: string,
  // Illustration à la place du logo (fig. 16 : navigateur Angular).
  deployArt?: 'browser',
  // Icône Feather à droite du texte (fig. 16 : cylindre BD sur MySQL,
  // badge EXTERNE retiré — retour demandeur).
  deployIcon?: 'database',
) => ({
  id,
  type: 'entity' as const,
  position: { x, y },
  style: { width: w },
  data: {
    label,
    variant: 'deploy' as const,
    deployKind: 'service' as const,
    ...(deployLogo ? { deployLogo } : {}),
    ...(deployArt ? { deployArt } : {}),
    deployAccent,
    deployPort,
    ...(deployNote ? { deployNote } : {}),
    ...(deployBadge ? { deployBadge } : {}),
    ...(deployIcon ? { deployIcon } : {}),
    minHeight: h,
    // Toujours égal à `w` (cf. `exportWidth`).
    exportWidth: w,
  },
})

const edge = (
  id: string,
  source: string,
  target: string,
  sourceHandle: string,
  targetHandle: string,
  label?: string,
  // Corps de la pastille : 20 sur le couloir Angular→Spring (170 px) —
  // ~150 px de pastille pour ~7,5 pt imprimés ; le padding large
  // (`TraitementEdge`, ≥20) s’applique — à valider sans débordement.
  labelPx?: number,
) => ({
  id,
  source,
  target,
  sourceHandle,
  targetHandle,
  type: 'traitement' as const,
  markerEnd: arrow(),
  data: {
    isStrong: true as const,
    ...(label ? { label, labelPx: labelPx ?? 12 } : {}),
  },
})

export const deploiementLocal: DiagramDefinition = {
  id: 'memoire-deploiement-local',
  title: 'Exécution locale — topologie de déploiement',
  category: 'memoire',
  domain: '6.6 — Exécution locale et chaîne DevOps',
  nodes: [
    // Cadres d’abord (z-order) : l’hôte EST le poste (écran 1520 + colonne-
    // tour à droite + bande bureau : pied et tour HORS de l’écran), Compose
    // pointillé + baleine + conteneurs. L’écran opaque est SOUS les arêtes
    // (`data-edges-above` + `edgesAbove` à l’export), sinon les 4 traits
    // disparaîtraient. Services en coordonnées locales inchangées.
    frame('frame-host', 20, 20, 1700, 1200, 'Machine hôte (développement local)', false, undefined, undefined, undefined, 'host-machine'),
    frame('frame-compose', 1050, 470, 450, 510, 'Docker Compose', true, 'docker', MINIO, undefined, 'containers', true),
    service('svc-ng', 90, 240, 380, 150, 'Angular dev-server', null, ANGULAR, ':4200', 'dev-server HMR', undefined, 'browser'),
    service('svc-spring', 680, 200, 380, 150, 'Spring Boot', 'springboot', SPRING, ':8080', 'API REST'),
    service('svc-mysql', 90, 660, 460, 180, 'MySQL 8', 'mysql', MYSQL, ':3306', 'migrations Flyway', undefined, undefined, 'database'),
    service('svc-redis', 1090, 570, 370, 140, 'Redis 7', 'redis', REDIS, ':6379', 'cache, sessions'),
    service('svc-minio', 1090, 765, 370, 140, 'MinIO', 'minio', MINIO, ':9000 / 9001', 'objets S3, console'),
  ],
  edges: [
    edge('e-ng-sp', 'svc-ng', 'svc-spring', 'right', 'left', 'proxy /api/**', 20),
    edge('e-sp-mysql', 'svc-spring', 'svc-mysql', 'bottom', 'top'),
    // Redis : départ `right` (et non `bottom`) — le segment horizontal à
    // y≈464 frôlait la bordure du cadre ; à y≈285 la zone est vide, puis
    // descente x≈1349 jusqu’au `top-right` intouché (retour demandeur).
    edge('e-sp-redis', 'svc-spring', 'svc-redis', 'right', 'top-right'),
    edge('e-sp-minio', 'svc-spring', 'svc-minio', 'bottom', 'left'),
  ],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
