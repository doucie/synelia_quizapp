import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'figures_flow:debug_edges'

let enabled = false
const listeners = new Set<() => void>()

if (typeof localStorage !== 'undefined') {
  try {
    enabled = localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    enabled = false
  }
}

export function isEdgeDebugEnabled(): boolean {
  return enabled
}

export function setEdgeDebugEnabled(value: boolean): void {
  enabled = value
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEY, '1')
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // ignore
  }
  for (const listener of listeners) listener()
}

export function subscribeEdgeDebug(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useEdgeDebugEnabled(): boolean {
  return useSyncExternalStore(subscribeEdgeDebug, isEdgeDebugEnabled, isEdgeDebugEnabled)
}