import type { DiagramDefinition, EntityNode, RelationshipEdge } from '../types'
import { SAFE_HUES } from '../utils/entityColors'

/**
 * Modèle de données de l'éditeur MCD / MLD.
 *
 * Une figure utilisateur n'est pas un `DiagramDefinition` figé : c'est un
 * document (`ModelDoc`) relu depuis `localStorage`, puis converti en nœuds et
 * arêtes au moment du rendu. Les composants du reste de l'application
 * (`EntityNode`, `RelationshipEdge`) ne connaissent que cette conversion —
 * c'est ce qui garantit un rendu identique aux figures écrites en dur.
 *
 * Invariant : `EntityDef.id` === `node.id` et `LinkDef.id` === `edge.id`.
 * Aucune table de correspondance : les callbacks de React Flow (déplacement,
 * suppression, connexion) manipulent directement les identifiants du document.
 */

export type Kind = 'mcd' | 'mld'

export interface AttrDef {
  id: string
  name: string
  /** MLD seulement : INT, VARCHAR(100)… ignoré en MCD (non affiché). */
  type?: string
  isPK?: boolean
  isFK?: boolean
  nullable?: boolean
}

export interface EntityDef {
  id: string
  name: string
  position: { x: number; y: number }
  attributes: AttrDef[]
  /** Teinte figée à la création : une suppression ne doit pas recolorer les autres. */
  color: string
  /** Étiquette de carte (`TABLE`, `JONCTION`…), conservée à l'import des figures du mémoire. */
  badge?: string
}

export interface LinkDef {
  id: string
  name: string
  from: string
  to: string
  /** MCD seulement. */
  cardFrom?: string
  cardTo?: string
  /** Attributs portés par l'association (MCD), affichés dans la pastille. */
  attributes?: string[]
}

export interface ModelDoc {
  version: 1
  id: string
  title: string
  kind: Kind
  entities: EntityDef[]
  links: LinkDef[]
  updatedAt: number
}

/** Préfixe de slug : `useDiagramRoute` n'accepte qu'un seul segment d'URL. */
export const MODEL_ROUTE_PREFIX = 'modele-'
export const MODELS_ROUTE = 'mes-modeles'

export const CARDINALITIES = ['0,1', '1,1', '0,n', '1,n'] as const
export type Cardinality = (typeof CARDINALITIES)[number]

export function uid(prefix: string): string {
  const suffix =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${suffix}`
}

export function colorFor(index: number): string {
  return `hsl(${SAFE_HUES[index % SAFE_HUES.length]}, 100%, 40%)`
}

/** Clé des côtés d'arêtes (`figures_flow:edge_sides:<clé>`) réutilisée telle quelle. */
export function edgeSidesKey(docId: string): string {
  return `${MODEL_ROUTE_PREFIX}${docId}`
}

export function newAttr(name = ''): AttrDef {
  return { id: uid('a'), name }
}

export function newEntity(name: string, index: number, x = 80, y = 80): EntityDef {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return {
    id: uid('e'),
    name,
    position: { x, y },
    attributes: [newAttr(slug ? `id_${slug}` : '')],
    color: colorFor(index),
  }
}

/** Nouvelle entité nommée sans collision, posée à la suite de celles existantes. */
export function addEntity(doc: ModelDoc, position?: { x: number; y: number }): { doc: ModelDoc; entity: EntityDef } {
  const name = uniqueName(
    doc.entities.map((e) => e.name),
    doc.kind === 'mld' ? 'TABLE' : 'ENTITE',
  )
  const last = doc.entities[doc.entities.length - 1]
  const entity = newEntity(
    name,
    doc.entities.length,
    position?.x ?? (last ? last.position.x + 260 : 80),
    position?.y ?? (last ? last.position.y : 80),
  )
  // Une table neuve a un identifiant technique, et c'est la clé primaire :
  // le cas par défaut du MLD, celui qu'on réécrit le moins souvent.
  if (doc.kind === 'mld' && entity.attributes[0]) {
    entity.attributes[0] = { ...entity.attributes[0], isPK: true }
  }
  return { doc: { ...doc, entities: [...doc.entities, entity] }, entity }
}

export function newDoc(kind: Kind, title: string): ModelDoc {
  return {
    version: 1,
    id: uid('m'),
    title,
    kind,
    entities: [],
    links: [],
    updatedAt: Date.now(),
  }
}

/** Nom libre : `ENTITE`, `ENTITE_2`, `ENTITE_3`… */
export function uniqueName(taken: string[], base: string): string {
  const set = new Set(taken.map((t) => t.trim().toUpperCase()))
  if (!set.has(base.toUpperCase())) return base
  let i = 2
  while (set.has(`${base}_${i}`.toUpperCase())) i++
  return `${base}_${i}`
}

/**
 * Conversion document → nœuds React Flow.
 *
 * Le libellé vide reçoit un substitut : une carte sans titre serait mesurée à
 * zéro et les ancrages d'arêtes partiraient d'un point faux. Le nom réel reste
 * dans le document, c'est le panneau qui le montre.
 */
export function toNodes(doc: ModelDoc): EntityNode[] {
  return doc.entities.map((entity) => ({
    id: entity.id,
    type: 'entity' as const,
    position: entity.position,
    data: {
      label: entity.name.trim() || 'SANS_NOM',
      variant: doc.kind,
      badge: entity.badge,
      color: entity.color,
      attributes: entity.attributes.map((attr, i) => ({
        name: attr.name.trim() || `attribut_${i + 1}`,
        type: doc.kind === 'mld' ? attr.type : undefined,
        isPK: attr.isPK,
        isFK: attr.isFK,
        nullable: attr.nullable,
      })),
    },
  }))
}

export function toEdges(doc: ModelDoc): RelationshipEdge[] {
  return doc.links.map((link) => ({
    id: link.id,
    source: link.from,
    target: link.to,
    type: 'relationship' as const,
    data: {
      label: link.name.trim() || undefined,
      // `diagramId` : `RelationshipEdge` s'en sert pour persister le côté choisi
      // par son popover. On lui donne une clé stable, distincte des figures
      // statiques, sinon le réglage fuirait d'un modèle à l'autre.
      diagramId: edgeSidesKey(doc.id),
      cardFrom: doc.kind === 'mcd' ? link.cardFrom : undefined,
      cardTo: doc.kind === 'mcd' ? link.cardTo : undefined,
      attributes: doc.kind === 'mcd' ? link.attributes : undefined,
    },
  }))
}

/**
 * Import d'une figure écrite en dur (les 5 MCD / 5 MLD du mémoire).
 *
 * Les arêtes dont une extrémité n'est pas une entité sont abandonnées : le
 * document ne modélise que des entités, il n'y a pas de nœud libre à conserver.
 */
export function fromDiagram(def: DiagramDefinition): ModelDoc {
  const entities: EntityDef[] = def.nodes
    .filter((n) => n.type === 'entity')
    .map((n, i) => ({
      id: n.id,
      name: String(n.data.label ?? ''),
      position: { ...n.position },
      color: n.data.color ?? colorFor(i),
      badge: n.data.badge,
      attributes: (n.data.attributes ?? []).map((a) => ({
        id: uid('a'),
        name: a.name,
        type: a.type,
        isPK: a.isPK,
        isFK: a.isFK,
        nullable: a.nullable,
      })),
    }))

  const ids = new Set(entities.map((e) => e.id))
  const links: LinkDef[] = def.edges
    .filter((e) => ids.has(e.source) && ids.has(e.target))
    .map((e) => ({
      id: e.id,
      name: String(e.data?.label ?? ''),
      from: e.source,
      to: e.target,
      cardFrom: e.data?.cardFrom,
      cardTo: e.data?.cardTo,
      attributes: e.data?.attributes,
    }))

  return {
    version: 1,
    id: uid('m'),
    title: def.title,
    kind: def.category === 'mld' ? 'mld' : 'mcd',
    entities,
    links,
    updatedAt: Date.now(),
  }
}

/** Relit un document stocké : un localStorage abîmé ne doit pas casser la page. */
export function sanitizeDoc(raw: unknown): ModelDoc | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Partial<ModelDoc>
  if (typeof r.id !== 'string' || typeof r.title !== 'string') return null
  const kind: Kind = r.kind === 'mld' ? 'mld' : 'mcd'
  const entities = Array.isArray(r.entities)
    ? r.entities
        .filter((e): e is EntityDef => !!e && typeof e.id === 'string')
        .map((e, i) => ({
          id: e.id,
          name: typeof e.name === 'string' ? e.name : '',
          position: {
            x: Number.isFinite(e.position?.x) ? e.position.x : 80 + i * 40,
            y: Number.isFinite(e.position?.y) ? e.position.y : 80 + i * 40,
          },
          color: typeof e.color === 'string' ? e.color : colorFor(i),
          badge: e.badge,
          attributes: Array.isArray(e.attributes)
            ? e.attributes.map((a) => ({
                id: typeof a?.id === 'string' ? a.id : uid('a'),
                name: typeof a?.name === 'string' ? a.name : '',
                type: a?.type,
                isPK: !!a?.isPK,
                isFK: !!a?.isFK,
                nullable: !!a?.nullable,
              }))
            : [],
        }))
    : []
  const ids = new Set(entities.map((e) => e.id))
  const links = Array.isArray(r.links)
    ? r.links
        .filter(
          (l): l is LinkDef =>
            !!l && typeof l.id === 'string' && ids.has(l.from) && ids.has(l.to),
        )
        .map((l) => ({
          id: l.id,
          name: typeof l.name === 'string' ? l.name : '',
          from: l.from,
          to: l.to,
          cardFrom: l.cardFrom,
          cardTo: l.cardTo,
          attributes: Array.isArray(l.attributes) ? l.attributes.filter((a) => typeof a === 'string') : undefined,
        }))
    : []

  return {
    version: 1,
    id: r.id,
    title: r.title,
    kind,
    entities,
    links,
    updatedAt: Number.isFinite(r.updatedAt) ? (r.updatedAt as number) : Date.now(),
  }
}
