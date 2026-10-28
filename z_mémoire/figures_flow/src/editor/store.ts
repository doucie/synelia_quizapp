import { useEffect, useState } from 'react'
import {
  MODELS_ROUTE,
  MODEL_ROUTE_PREFIX,
  sanitizeDoc,
  uid,
  type Kind,
  type ModelDoc,
} from './model'

/**
 * Stockage des modèles utilisateur.
 *
 * Deux clés, comme le reste de l'application :
 * - `figures_flow:model:<id>` : le document complet ;
 * - `figures_flow:models` : l'index, pour peupler la sidebar sans désérialiser
 *   tous les documents.
 *
 * Toute écriture émet `figures_flow:models-changed` : la sidebar et la liste se
 * rafraîchissent sans qu'on ait à faire remonter des props à travers `App`.
 */

const DOC_PREFIX = 'figures_flow:model:'
const INDEX_KEY = 'figures_flow:models'
const CHANGED_EVENT = 'figures_flow:models-changed'

export interface ModelSummary {
  id: string
  title: string
  kind: Kind
  updatedAt: number
  entityCount: number
  linkCount: number
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function notify(): void {
  try {
    window.dispatchEvent(new Event(CHANGED_EVENT))
  } catch {
    /* environnement sans window (tests) : rien à notifier */
  }
}

export function summaryOf(doc: ModelDoc): ModelSummary {
  return {
    id: doc.id,
    title: doc.title,
    kind: doc.kind,
    updatedAt: doc.updatedAt,
    entityCount: doc.entities.length,
    linkCount: doc.links.length,
  }
}

export function listModels(): ModelSummary[] {
  const index = readJson<ModelSummary[]>(INDEX_KEY)
  if (!Array.isArray(index)) return []
  return index
    .filter((m): m is ModelSummary => !!m && typeof m.id === 'string' && typeof m.title === 'string')
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
}

function writeIndex(summaries: ModelSummary[]): void {
  writeJson(INDEX_KEY, summaries)
}

function upsertIndex(doc: ModelDoc): void {
  const next = listModels().filter((m) => m.id !== doc.id)
  next.push(summaryOf(doc))
  writeIndex(next)
}

export function loadModel(id: string): ModelDoc | null {
  if (!id) return null
  return sanitizeDoc(readJson<ModelDoc>(`${DOC_PREFIX}${id}`))
}

export function saveModel(doc: ModelDoc): void {
  const stamped: ModelDoc = { ...doc, updatedAt: Date.now() }
  if (!writeJson(`${DOC_PREFIX}${doc.id}`, stamped)) return
  upsertIndex(stamped)
  notify()
}

export function deleteModel(id: string): void {
  try {
    localStorage.removeItem(`${DOC_PREFIX}${id}`)
    // Le réglage des côtés d'arêtes est propre au modèle : il part avec lui.
    localStorage.removeItem(`figures_flow:edge_sides:${MODEL_ROUTE_PREFIX}${id}`)
    localStorage.removeItem(`figures_flow:diagram:${MODEL_ROUTE_PREFIX}${id}`)
  } catch {
    /* quota / mode privé : l'index reste la seule vérité */
  }
  writeIndex(listModels().filter((m) => m.id !== id))
  notify()
}

export function renameModel(id: string, title: string): void {
  const doc = loadModel(id)
  if (!doc) return
  saveModel({ ...doc, title })
}

export function duplicateModel(id: string): ModelDoc | null {
  const doc = loadModel(id)
  if (!doc) return null
  const copy: ModelDoc = {
    ...doc,
    id: uid('m'),
    title: `${doc.title} (copie)`,
    entities: doc.entities.map((e) => ({ ...e, position: { ...e.position } })),
    links: doc.links.map((l) => ({ ...l })),
    updatedAt: Date.now(),
  }
  saveModel(copy)
  return copy
}

export function createModel(kind: Kind, title: string): ModelDoc {
  const doc: ModelDoc = {
    version: 1,
    id: uid('m'),
    title,
    kind,
    entities: [],
    links: [],
    updatedAt: Date.now(),
  }
  saveModel(doc)
  return doc
}

export function modelsRoute(): string {
  return `/${MODELS_ROUTE}`
}

export function modelRoute(id: string): string {
  return `/${MODEL_ROUTE_PREFIX}${id}`
}

/** Liste réactive : se met à jour à chaque écriture du store. */
export function useModels(): ModelSummary[] {
  const [models, setModels] = useState<ModelSummary[]>(() => listModels())
  useEffect(() => {
    const refresh = () => setModels(listModels())
    window.addEventListener(CHANGED_EVENT, refresh)
    // Deux onglets ouverts : `storage` ne se déclenche que dans les autres onglets.
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
  return models
}
