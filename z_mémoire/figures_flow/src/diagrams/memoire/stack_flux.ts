import type { DiagramDefinition } from '../../types'

/**
 * Stack technique — architecture 3-tiers avec flux (Fig. 8).
 *
 * Verbatim de `figures_html/stack_technique.html` : 3 couches
 * (Interface Angular 20.2 / Serveur Spring Boot 3.5.6 + Java 21 + Redis 7 +
 * MinIO S3 / Stockage Hibernate 6 + MySQL 8 + Flyway V1_069) et 2 connecteurs
 * bidirectionnels (HTTP·REST·JSON / DTO·JSON, JPA·JPQL / Entités·ResultSet).
 * Nœud composite unique, zéro arête (voir `StackFlowNode`).
 */

const W = 1150

// Couleurs de la palette documentaire (jetons --fig-*) : interface = danger,
// serveur = success, stockage = secondary. Addenda 20261020 : jetons de fill
// GELÉS verbatim dans les deux modes — encres d'accent gérées par
// `StackFlowNode` (nom/pills/logo/sqlFill).
const FRONT = 'var(--fig-danger)'
const BACK = 'var(--fig-success)'
const DATA = 'var(--fig-secondary)'

export const stackFlux: DiagramDefinition = {
  id: 'memoire-stack-flux',
  title: 'Stack technique — architecture 3-tiers',
  category: 'memoire',
  domain: 'Fig. 8 — Stack technique et flux',
  nodes: [
    {
      id: 'stackflow',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Stack technique de SyneliaQuizApp',
        variant: 'stackflow' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        stackflowLayers: [
          {
            name: 'Interface utilisateur',
            role: 'Navigateur recruteur / candidat',
            color: FRONT,
            pills: [
              { name: 'Angular', ver: '20.2' },
              { name: 'TypeScript', ver: '5.9' },
              { name: 'SCSS' },
            ],
          },
          {
            name: "Serveur d'application",
            role: 'MVC · Security · Mail · Virtual Threads',
            color: BACK,
            pills: [
              { name: 'Spring Boot', ver: '3.5.6' },
              { name: 'Java', ver: '21 LTS' },
              { name: 'Redis', ver: '7 · Cache' },
              { name: 'MinIO', ver: 'S3' },
            ],
          },
          {
            name: 'Stockage et persistance',
            role: 'ORM · Cache L2 · InnoDB · Migrations',
            color: DATA,
            pills: [
              { name: 'Hibernate', ver: '6.x' },
              { name: 'MySQL', ver: '8' },
              { name: 'Flyway', ver: 'V1_069' },
            ],
          },
        ],
        stackflowFlows: [
          { down: 'HTTP · REST · JSON', up: 'DTO · JSON' },
          { down: 'JPA · JPQL', up: 'Entités · ResultSet' },
        ],
      },
    },
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
