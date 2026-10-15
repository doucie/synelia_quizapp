/**
 * Enregistrement SVG avec choix du dossier (File System Access API).
 *
 * Le `download()` historique (`<a download>` + clic) range le fichier dans
 * `Téléchargements` sans question. Ici on ouvre le dialogue OS natif
 * (`showSaveFilePicker`, Chromium/Edge) avec le nom de figure suggéré, en
 * rouvrant au dernier dossier utilisé : le navigateur ne laisse présélectionner
 * aucun chemin absolu (sandbox), donc on mémorise le dernier *file handle*
 * (sélectionné par l'utilisateur) en IndexedDB et on le repasse en `startIn`
 * — le dialogue s'ouvre alors dans son dossier.
 *
 * Portée SVG uniquement (figure + bloc ⤓) : `exportPositions.ts` garde son
 * téléchargement silencieux. Navigateurs sans l'API (Firefox) : repli sur le
 * `download()` historique, comportement inchangé.
 */

interface FilePickerAcceptType {
  description?: string
  accept: Record<string, string[]>
}

interface SaveFilePickerOptions {
  suggestedName?: string
  /** Dossier de départ : `'downloads'` ou un handle mémorisé. */
  startIn?: unknown
  types?: FilePickerAcceptType[]
}

interface FileSystemWritable {
  write(data: Blob): Promise<void>
  close(): Promise<void>
}

interface FileSystemFileHandleLike {
  createWritable(): Promise<FileSystemWritable>
  queryPermission?: (desc?: { mode?: string }) => Promise<string>
  requestPermission?: (desc?: { mode?: string }) => Promise<string>
}

declare global {
  interface Window {
    showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandleLike>
  }
}

const DB_NAME = 'figures_flow'
const DB_STORE = 'handles'
const DB_KEY = 'last-svg-file'

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(DB_STORE)) {
          req.result.createObjectStore(DB_STORE)
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

function idbGet(db: IDBDatabase): Promise<FileSystemFileHandleLike | null> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DB_STORE, 'readonly')
      const req = tx.objectStore(DB_STORE).get(DB_KEY)
      req.onsuccess = () => resolve((req.result as FileSystemFileHandleLike | undefined) ?? null)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

function idbSet(db: IDBDatabase, handle: FileSystemFileHandleLike): Promise<void> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DB_STORE, 'readwrite')
      const req = tx.objectStore(DB_STORE).put(handle, DB_KEY)
      req.onsuccess = () => resolve()
      req.onerror = () => resolve()
    } catch {
      resolve()
    }
  })
}

async function getSavedHandle(): Promise<FileSystemFileHandleLike | null> {
  const db = await openDb()
  if (!db) return null
  try {
    const handle = await idbGet(db)
    db.close()
    return handle
  } catch {
    try { db.close() } catch { /* ignore */ }
    return null
  }
}

async function setSavedHandle(handle: FileSystemFileHandleLike): Promise<void> {
  const db = await openDb()
  if (!db) return
  try {
    await idbSet(db, handle)
  } finally {
    try { db.close() } catch { /* ignore */ }
  }
}

/** La permission d'un handle persisté retombe à chaque session : la redemander. */
async function ensureWritePermission(handle: FileSystemFileHandleLike): Promise<boolean> {
  try {
    if (typeof handle.queryPermission === 'function') {
      if ((await handle.queryPermission({ mode: 'readwrite' })) === 'granted') return true
    }
    if (typeof handle.requestPermission === 'function') {
      return (await handle.requestPermission({ mode: 'readwrite' })) === 'granted'
    }
    return true
  } catch {
    return false
  }
}

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError'
}

/** Repli historique : téléchargement silencieux vers `Téléchargements`. */
function fallbackDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function saveSvgBlob(blob: Blob, filename: string): Promise<void> {
  const picker = window.showSaveFilePicker
  if (typeof picker !== 'function') {
    fallbackDownload(blob, filename)
    return
  }

  let startIn: unknown = 'downloads'
  try {
    const saved = await getSavedHandle()
    if (saved && (await ensureWritePermission(saved))) startIn = saved
  } catch {
    startIn = 'downloads'
  }

  let handle: FileSystemFileHandleLike | null = null
  try {
    handle = await window.showSaveFilePicker!({
      suggestedName: filename,
      startIn,
      types: [{ description: 'Image SVG', accept: { 'image/svg+xml': ['.svg'] } }],
    })
  } catch (err) {
    // Annulation utilisateur : silence. Autre échec : ne jamais perdre
    // l'export, retomber sur le téléchargement classique.
    if (!isAbort(err)) {
      console.error('[saveWithPicker] picker failed, fallback download', err)
      fallbackDownload(blob, filename)
    }
    return
  }

  try {
    const writable = await handle.createWritable()
    await writable.write(blob)
    await writable.close()
  } catch (err) {
    console.error('[saveWithPicker] write failed, fallback download', err)
    fallbackDownload(blob, filename)
    return
  }

  try {
    await setSavedHandle(handle)
  } catch {
    /* mémorisation optionnelle */
  }
}
