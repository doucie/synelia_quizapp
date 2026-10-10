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
  deployLogo: 'angular' | 'springboot' | 'mysql' | 'redis' | 'minio',
  deployAccent: string,
  deployPort: string,
  deployNote?: string,
  deployBadge?: string,
) => ({
  id,
  type: 'entity' as const,
  position: { x, y },
  style: { width: w },
  data: {
    label,
    variant: 'deploy' as const,
    deployKind: 'service' as const,
    deployLogo,
    deployAccent,
    deployPort,
    ...(deployNote ? { deployNote } : {}),
    ...(deployBadge ? { deployBadge } : {}),
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
    ...(label ? { label, labelPx: 12 } : {}),
  },
})

export const deploiementLocal: DiagramDefinition = {
  id: 'memoire-deploiement-local',
  title: 'Exécution locale — topologie de déploiement',
  category: 'memoire',
  domain: '6.6 — Exécution locale et chaîne DevOps',
  nodes: [
    // Cadres d’abord (z-order) : hôte plein, Compose pointillé + baleine.
    frame('frame-host', 20, 20, 1520, 1000, 'Machine hôte (développement local)'),
    frame('frame-compose', 1050, 470, 450, 510, 'Docker Compose', true, 'docker', MINIO),
    service('svc-ng', 90, 130, 380, 150, 'Angular dev-server', 'angular', ANGULAR, ':4200', 'dev-server HMR'),
    service('svc-spring', 640, 130, 380, 150, 'Spring Boot', 'springboot', SPRING, ':8080', 'API REST'),
    service('svc-mysql', 90, 620, 460, 180, 'MySQL 8', 'mysql', MYSQL, ':3306', 'migrations Flyway', 'EXTERNE'),
    service('svc-redis', 1090, 570, 370, 140, 'Redis 7', 'redis', REDIS, ':6379', 'cache, sessions'),
    service('svc-minio', 1090, 765, 370, 140, 'MinIO', 'minio', MINIO, ':9000 / 9001', 'objets S3, console'),
  ],
  edges: [
    edge('e-ng-sp', 'svc-ng', 'svc-spring', 'right', 'left', 'proxy /api/**'),
    edge('e-sp-mysql', 'svc-spring', 'svc-mysql', 'bottom', 'top'),
    edge('e-sp-redis', 'svc-spring', 'svc-redis', 'bottom', 'top'),
    edge('e-sp-minio', 'svc-spring', 'svc-minio', 'right', 'left'),
  ],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
