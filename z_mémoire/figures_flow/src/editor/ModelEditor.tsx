import { useCallback, useEffect, useRef, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import { exportSvg } from '../utils/exportSvg'
import EditorCanvas from './EditorCanvas'
import Inspector, { type Selection } from './Inspector'
import {
  addEntity,
  sanitizeDoc,
  uid,
  type EntityDef,
  type Kind,
  type LinkDef,
  type ModelDoc,
} from './model'
import { deleteModel, loadModel, saveModel } from './store'

const HISTORY_LIMIT = 80
/** Regroupe les frappes d'un même champ en une seule annulation. */
const BURST_MS = 1500
const SAVE_DEBOUNCE = 400
/** Repli du panneau de droite : préférence d'affichage, pas une donnée du modèle. */
const PANEL_KEY = 'figures_flow:editor:panneau'

type PanelState = 'collapsed' | 'expanded'

function readPanelPreference(): PanelState {
  try {
    return localStorage.getItem(PANEL_KEY) === 'collapsed' ? 'collapsed' : 'expanded'
  } catch {
    return 'expanded'
  }
}

function writePanelPreference(state: PanelState): void {
  try {
    localStorage.setItem(PANEL_KEY, state)
  } catch {
    /* quota / mode privé : le repli reste valable pour la session */
  }
}

interface ModelEditorProps {
  modelId: string
  onBack: () => void
  onOpenModel: (id: string) => void
  fullscreen: boolean
  onToggleFullscreen: () => void
}

interface ConfirmRequest {
  title: string
  message: string
  confirmLabel: string
  resolve: (ok: boolean) => void
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'modele'
  )
}

function download(content: string, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

/**
 * Page d'édition d'un modèle.
 *
 * Le document est la seule source de vérité : le canevas en dérive des nœuds et
 * des arêtes, jamais l'inverse. Trois services sont tenus ici, et nulle part
 * ailleurs :
 * - l'enregistrement (debounce + vidage à la sortie) ;
 * - l'historique annuler / rétablir, par instantanés du document ;
 * - les confirmations destructrices, via `ConfirmDialog`.
 */
export default function ModelEditor({
  modelId,
  onBack,
  onOpenModel,
  fullscreen,
  onToggleFullscreen,
}: ModelEditorProps) {
  const [doc, setDoc] = useState<ModelDoc | null>(() => loadModel(modelId))
  const [selection, setSelection] = useState<Selection>(null)
  const [showBackground, setShowBackground] = useState(true)
  const [saved, setSaved] = useState(true)
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [panelPreference, setPanelPreference] = useState<PanelState>(readPanelPreference)
  /* Volatile : le plein écran replie le panneau sans toucher à la préférence,
     pour qu'en sortir rende l'état d'avant. `null` = pas de choix en cours. */
  const [panelOverride, setPanelOverride] = useState<PanelState | null>(null)
  const [, setRevision] = useState(0)
  const fileInput = useRef<HTMLInputElement>(null)

  const panelCollapsed =
    (panelOverride ?? (fullscreen ? 'collapsed' : panelPreference)) === 'collapsed'

  /* Toute bascule plein écran abandonne la décision de session : on entre replié,
     on sort avec la préférence enregistrée. */
  useEffect(() => {
    setPanelOverride(null)
  }, [fullscreen])

  const togglePanel = useCallback(() => {
    const next: PanelState = panelCollapsed ? 'expanded' : 'collapsed'
    setPanelOverride(next)
    if (!fullscreen) {
      setPanelPreference(next)
      writePanelPreference(next)
    }
  }, [fullscreen, panelCollapsed])

  const docRef = useRef(doc)
  docRef.current = doc
  const history = useRef<{ past: ModelDoc[]; future: ModelDoc[] }>({ past: [], future: [] })
  const burst = useRef<{ key: string; at: number } | null>(null)

  const ask = useCallback(
    (options: Omit<ConfirmRequest, 'resolve'>) =>
      new Promise<boolean>((resolve) => setConfirmRequest({ ...options, resolve })),
    [],
  )

  const commit = useCallback((next: ModelDoc) => {
    docRef.current = next
    setDoc(next)
    setSaved(false)
  }, [])

  /**
   * Modifie le document en empilant l'état précédent. `scope` identifie le champ
   * saisi : tant que la même rafale dure, on ne pose qu'un point de reprise —
   * annuler une frappe caractère par caractère n'aide personne.
   */
  const update = useCallback(
    (updater: (current: ModelDoc) => ModelDoc, scope?: string) => {
      const previous = docRef.current
      if (!previous) return
      const next = updater(previous)
      if (next === previous) return
      const now = Date.now()
      const sameBurst = !!scope && burst.current?.key === scope && now - burst.current.at < BURST_MS
      if (!sameBurst) {
        history.current.past.push(previous)
        if (history.current.past.length > HISTORY_LIMIT) history.current.past.shift()
      }
      burst.current = scope ? { key: scope, at: now } : null
      history.current.future = []
      setRevision((r) => r + 1)
      commit(next)
    },
    [commit],
  )

  const undo = useCallback(() => {
    const previous = history.current.past.pop()
    const current = docRef.current
    if (!previous || !current) return
    history.current.future.push(current)
    burst.current = null
    setRevision((r) => r + 1)
    commit(previous)
  }, [commit])

  const redo = useCallback(() => {
    const next = history.current.future.pop()
    const current = docRef.current
    if (!next || !current) return
    history.current.past.push(current)
    burst.current = null
    setRevision((r) => r + 1)
    commit(next)
  }, [commit])

  const requestDelete = useCallback(
    async (kind: 'entity' | 'link', id: string) => {
      const current = docRef.current
      if (!current) return
      if (kind === 'entity') {
        const entity = current.entities.find((e) => e.id === id)
        if (!entity) return
        const links = current.links.filter((l) => l.from === id || l.to === id)
        if (links.length > 0) {
          const ok = await ask({
            title: 'Supprimer l’entité',
            message: `« ${entity.name.trim() || 'SANS_NOM'} » porte ${links.length} association${
              links.length > 1 ? 's' : ''
            }, qui seront supprimées aussi.`,
            confirmLabel: 'Supprimer',
          })
          if (!ok) return
        }
        update((d) => ({
          ...d,
          entities: d.entities.filter((e) => e.id !== id),
          links: d.links.filter((l) => l.from !== id && l.to !== id),
        }))
      } else {
        update((d) => ({ ...d, links: d.links.filter((l) => l.id !== id) }))
      }
      setSelection((s) => (s && s.id === id ? null : s))
    },
    [ask, update],
  )

  /* Enregistrement différé : chaque frappe ne doit pas réécrire tout le
     document, et une fermeture d'onglet ne doit rien perdre. */
  useEffect(() => {
    if (!doc || saved) return
    const timer = setTimeout(() => {
      saveModel(doc)
      setSaved(true)
    }, SAVE_DEBOUNCE)
    return () => clearTimeout(timer)
  }, [doc, saved])

  useEffect(() => {
    const flush = () => {
      const current = docRef.current
      if (current) saveModel(current)
    }
    window.addEventListener('beforeunload', flush)
    return () => {
      window.removeEventListener('beforeunload', flush)
      flush()
    }
  }, [])

  useEffect(() => {
    if (!doc) return
    document.title = `${doc.title} — Modèle — Figures Flow`
  }, [doc])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  /* Clavier : annuler / rétablir / enregistrer / supprimer. Les raccourcis
     d'édition sont neutralisés dans un champ de saisie, où ils appartiennent au
     navigateur. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      const mod = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()

      if (mod && key === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
        return
      }
      if (mod && key === 'y') {
        event.preventDefault()
        redo()
        return
      }
      if (mod && key === 's') {
        event.preventDefault()
        const current = docRef.current
        if (current) {
          saveModel(current)
          setSaved(true)
        }
        return
      }
      if (typing) return
      if ((event.key === 'Delete' || event.key === 'Backspace') && selection) {
        event.preventDefault()
        void requestDelete(selection.kind, selection.id)
        return
      }
      /* En plein écran, Échap est le geste de sortie (géré par `App`) : y vider
         aussi la sélection donnerait deux effets pour une touche. */
      if (event.key === 'Escape' && !fullscreen) setSelection(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [fullscreen, redo, requestDelete, selection, undo])

  const changeTitle = useCallback(
    (title: string) => update((d) => ({ ...d, title }), 'title'),
    [update],
  )

  const changeEntity = useCallback(
    (id: string, patch: Partial<EntityDef>, scope?: string) =>
      update(
        (d) => ({ ...d, entities: d.entities.map((e) => (e.id === id ? { ...e, ...patch } : e)) }),
        scope,
      ),
    [update],
  )

  const changeLink = useCallback(
    (id: string, patch: Partial<LinkDef>, scope?: string) =>
      update(
        (d) => ({ ...d, links: d.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) }),
        scope,
      ),
    [update],
  )

  const createEntity = useCallback(() => {
    const box: { entity?: EntityDef } = {}
    update((d) => {
      const result = addEntity(d)
      box.entity = result.entity
      return result.doc
    })
    if (box.entity) setSelection({ kind: 'entity', id: box.entity.id })
  }, [update])

  const createLink = useCallback(
    (from: string, to: string) => {
      if (!from || !to || from === to) return
      const box: { id?: string } = {}
      update((d) => {
        if (d.links.some((l) => l.from === from && l.to === to)) return d
        const link: LinkDef = { id: uid('l'), name: '', from, to, cardFrom: '0,n', cardTo: '1,1' }
        box.id = link.id
        return { ...d, links: [...d.links, link] }
      })
      if (box.id) setSelection({ kind: 'link', id: box.id })
    },
    [update],
  )

  const changeKind = useCallback(
    (kind: Kind) => update((d) => (d.kind === kind ? d : { ...d, kind })),
    [update],
  )

  const handleExportSvg = useCallback(() => {
    const current = docRef.current
    if (!current) return
    if (current.entities.length === 0) {
      setNotice('Rien à exporter : la figure est vide.')
      return
    }
    void exportSvg(`${slugify(current.title)}.svg`)
  }, [])

  const handleExportJson = useCallback(() => {
    const current = docRef.current
    if (!current) return
    download(JSON.stringify(current, null, 2), `${slugify(current.title)}.json`, 'application/json')
  }, [])

  const handleImport = useCallback(
    async (file: File) => {
      let raw: unknown
      try {
        raw = JSON.parse(await file.text())
      } catch {
        setNotice('Fichier JSON illisible.')
        return
      }
      const parsed = sanitizeDoc(raw)
      if (!parsed) {
        setNotice('Document non reconnu.')
        return
      }
      const imported: ModelDoc = {
        ...parsed,
        id: uid('m'),
        title: parsed.title.trim() || file.name.replace(/\.json$/i, ''),
        entities: parsed.entities.map((e) => ({ ...e, position: { ...e.position } })),
        links: parsed.links.map((l) => ({ ...l })),
        updatedAt: Date.now(),
      }
      saveModel(imported)
      onOpenModel(imported.id)
    },
    [onOpenModel],
  )

  const handleDeleteModel = useCallback(async () => {
    const current = docRef.current
    if (!current) return
    const ok = await ask({
      title: 'Supprimer le modèle',
      message: `« ${current.title} » et ses ${current.entities.length} entités seront définitivement perdus.`,
      confirmLabel: 'Supprimer',
    })
    if (!ok) return
    deleteModel(current.id)
    onBack()
  }, [ask, onBack])

  if (!doc) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">Ce modèle n’existe pas ou a été supprimé.</p>
        <button
          type="button"
          className="rounded border border-border px-3 py-1 text-xs text-foreground hover:bg-muted"
          onClick={onBack}
        >
          Mes modèles
        </button>
      </div>
    )
  }

  const canUndo = history.current.past.length > 0
  const canRedo = history.current.future.length > 0

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <header className="flex flex-wrap items-center gap-2 border-b border-border bg-background px-3 py-1.5">
        <button
          type="button"
          className="rounded px-1.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={onBack}
        >
          ← Mes modèles
        </button>
        <input
          className="min-w-[120px] flex-1 rounded border border-transparent bg-transparent px-1.5 py-1 text-sm font-medium text-foreground outline-none hover:border-border focus:border-primary"
          value={doc.title}
          onChange={(e) => changeTitle(e.target.value)}
          aria-label="Titre du modèle"
        />
        <div className="flex overflow-hidden rounded border border-border">
          {(['mcd', 'mld'] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              className={`px-2 py-1 text-[11px] uppercase ${
                doc.kind === kind
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              onClick={() => changeKind(kind)}
              title={kind === 'mcd' ? 'Modèle conceptuel' : 'Modèle logique'}
            >
              {kind}
            </button>
          ))}
        </div>

        <span className="text-[10px] text-muted-foreground">{saved ? 'Enregistré' : 'Modifications…'}</span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded px-1.5 py-1 text-xs text-foreground hover:bg-muted disabled:opacity-30"
            onClick={undo}
            disabled={!canUndo}
            title="Annuler (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-1 text-xs text-foreground hover:bg-muted disabled:opacity-30"
            onClick={redo}
            disabled={!canRedo}
            title="Rétablir (Ctrl+Maj+Z)"
          >
            ↷
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-1 text-xs text-foreground hover:bg-muted"
            onClick={() => setShowBackground((v) => !v)}
            title="Afficher / masquer la grille"
          >
            grille
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-1 text-xs text-foreground hover:bg-muted"
            onClick={handleExportSvg}
            title="Exporter la figure en SVG"
          >
            SVG
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-1 text-xs text-foreground hover:bg-muted"
            onClick={handleExportJson}
            title="Exporter le modèle en JSON"
          >
            JSON
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-1 text-xs text-foreground hover:bg-muted"
            onClick={() => fileInput.current?.click()}
            title="Importer un modèle JSON"
          >
            Importer
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-1 text-xs text-foreground hover:bg-muted"
            onClick={togglePanel}
            title={panelCollapsed ? 'Déplier le panneau' : 'Replier le panneau'}
            aria-label={panelCollapsed ? 'Déplier le panneau' : 'Replier le panneau'}
            aria-expanded={!panelCollapsed}
          >
            {panelCollapsed ? '⟨' : '⟩'}
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-1 text-xs text-foreground hover:bg-muted"
            onClick={onToggleFullscreen}
            title={fullscreen ? 'Quitter le plein écran (Échap)' : 'Mode plein écran'}
            aria-label={fullscreen ? 'Quitter le plein écran' : 'Mode plein écran'}
            aria-pressed={fullscreen}
          >
            ⛶
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-1 text-xs text-destructive hover:bg-muted"
            onClick={() => void handleDeleteModel()}
          >
            Supprimer
          </button>
        </div>

        {notice && <span className="text-[10px] text-destructive">{notice}</span>}
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1" style={{ height: '100%' }}>
          <EditorCanvas
            doc={doc}
            onChange={update}
            onSelectionChange={setSelection}
            showBackground={showBackground}
          />
        </div>
        <Inspector
          doc={doc}
          selection={selection}
          onSelect={setSelection}
          onChangeTitle={changeTitle}
          onChangeEntity={changeEntity}
          onChangeLink={changeLink}
          onDelete={(kind, id) => void requestDelete(kind, id)}
          onAddEntity={createEntity}
          onAddLink={createLink}
          collapsed={panelCollapsed}
          onToggleCollapsed={togglePanel}
        />
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleImport(file)
          event.target.value = ''
        }}
      />

      {confirmRequest && (
        <ConfirmDialog
          open
          title={confirmRequest.title}
          message={confirmRequest.message}
          confirmLabel={confirmRequest.confirmLabel}
          onConfirm={() => {
            confirmRequest.resolve(true)
            setConfirmRequest(null)
          }}
          onCancel={() => {
            confirmRequest.resolve(false)
            setConfirmRequest(null)
          }}
        />
      )}
    </div>
  )
}
