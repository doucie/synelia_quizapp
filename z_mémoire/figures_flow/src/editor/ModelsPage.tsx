import { useCallback, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import { diagrams, getDiagram } from '../diagrams'
import { fromDiagram } from './model'
import { createModel, deleteModel, duplicateModel, renameModel, saveModel, useModels } from './store'
import type { Kind } from './model'

interface ModelsPageProps {
  onOpen: (id: string) => void
}

interface ConfirmRequest {
  title: string
  message: string
  onConfirm: () => void
}

/**
 * Liste des modèles de l'utilisateur.
 *
 * Elle ne connaît que le store : créer, renommer, dupliquer et supprimer se font
 * ici, l'édition se fait dans `ModelEditor`. Les anciennes figures (MCD / MLD
 * écrites dans `diagrams/nouveau/`) restent accessibles dans la sidebar : cette
 * page ne montre que ce que l'utilisateur a créé.
 */
export default function ModelsPage({ onOpen }: ModelsPageProps) {
  const models = useModels()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [legacyId, setLegacyId] = useState('')
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null)

  /* Les figures écrites en dur restent la référence : les importer crée une
     copie indépendante, modifiable. Aucun lien n'est conservé avec l'original
     — le document est la seule source de vérité une fois importé. */
  const legacyDiagrams = diagrams.filter((d) => d.category === 'mcd' || d.category === 'mld')

  const importLegacy = () => {
    const definition = legacyId ? getDiagram(legacyId) : undefined
    if (!definition) return
    const doc = fromDiagram(definition)
    saveModel(doc)
    onOpen(doc.id)
  }

  const create = useCallback(
    (kind: Kind) => {
      const doc = createModel(kind, kind === 'mcd' ? 'Nouveau MCD' : 'Nouveau MLD')
      onOpen(doc.id)
    },
    [onOpen],
  )

  const startRename = (id: string, title: string) => {
    setEditingId(id)
    setDraftTitle(title)
  }

  const commitRename = () => {
    if (editingId && draftTitle.trim()) renameModel(editingId, draftTitle.trim())
    setEditingId(null)
  }

  const requestDelete = (id: string, title: string) => {
    setConfirmRequest({
      title: 'Supprimer le modèle',
      message: `« ${title} » sera définitivement perdu.`,
      onConfirm: () => {
        deleteModel(id)
        setConfirmRequest(null)
      },
    })
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b border-border bg-background px-4 py-2">
        <h1 className="text-sm font-semibold text-foreground">Mes modèles</h1>
        <span className="text-[11px] text-muted-foreground">
          {models.length} modèle{models.length > 1 ? 's' : ''}
        </span>
        <div className="ml-auto flex gap-1">
          <button
            type="button"
            className="rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted"
            onClick={() => create('mcd')}
          >
            + MCD
          </button>
          <button
            type="button"
            className="rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted"
            onClick={() => create('mld')}
          >
            + MLD
          </button>
        </div>
      </header>

      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-1.5">
        <label className="text-[11px] text-muted-foreground" htmlFor="legacy-import">
          Partir d’une figure existante
        </label>
        <select
          id="legacy-import"
          className="max-w-[280px] rounded border border-border bg-background px-1.5 py-1 text-xs text-foreground outline-none focus:border-primary"
          value={legacyId}
          onChange={(e) => setLegacyId(e.target.value)}
        >
          <option value="">— choisir —</option>
          {legacyDiagrams.map((d) => (
            <option key={d.id} value={d.id}>
              {d.category.toUpperCase()} · {d.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted disabled:opacity-40"
          onClick={importLegacy}
          disabled={!legacyId}
        >
          Importer une copie
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {models.length === 0 && (
          <div className="mx-auto mt-16 max-w-md rounded border border-dashed border-border p-6 text-center">
            <p className="text-sm text-foreground">Aucun modèle pour l’instant.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Un MCD se dessine seul (entités, attributs, associations). Un MLD se dessine de la
              même façon, avec les types et les clés. Aucune dérivation automatique : les deux
              modèles sont indépendants.
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <button
                type="button"
                className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                onClick={() => create('mcd')}
              >
                Créer un MCD
              </button>
              <button
                type="button"
                className="rounded border border-border px-3 py-1 text-xs text-foreground hover:bg-muted"
                onClick={() => create('mld')}
              >
                Créer un MLD
              </button>
            </div>
          </div>
        )}

        <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
          {models.map((model) => (
            <li key={model.id} className="flex flex-col rounded border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                  {model.kind}
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {new Date(model.updatedAt).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {editingId === model.id ? (
                <input
                  className="mt-2 w-full rounded border border-primary bg-background px-1.5 py-1 text-sm text-foreground outline-none"
                  value={draftTitle}
                  autoFocus
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename()
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                />
              ) : (
                <button
                  type="button"
                  className="mt-2 truncate text-left text-sm font-medium text-foreground hover:underline"
                  onClick={() => onOpen(model.id)}
                  onDoubleClick={() => startRename(model.id, model.title)}
                >
                  {model.title}
                </button>
              )}

              <p className="mt-1 text-[11px] text-muted-foreground">
                {model.entityCount} entité{model.entityCount > 1 ? 's' : ''} · {model.linkCount}{' '}
                association{model.linkCount > 1 ? 's' : ''}
              </p>

              <div className="mt-2 flex flex-wrap gap-1">
                <button
                  type="button"
                  className="rounded px-1.5 py-0.5 text-[11px] text-primary hover:bg-muted"
                  onClick={() => onOpen(model.id)}
                >
                  ouvrir
                </button>
                <button
                  type="button"
                  className="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted"
                  onClick={() => startRename(model.id, model.title)}
                >
                  renommer
                </button>
                <button
                  type="button"
                  className="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted"
                  onClick={() => {
                    const copy = duplicateModel(model.id)
                    if (copy) onOpen(copy.id)
                  }}
                >
                  dupliquer
                </button>
                <button
                  type="button"
                  className="rounded px-1.5 py-0.5 text-[11px] text-destructive hover:bg-muted"
                  onClick={() => requestDelete(model.id, model.title)}
                >
                  supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {confirmRequest && (
        <ConfirmDialog
          open
          title={confirmRequest.title}
          message={confirmRequest.message}
          confirmLabel="Supprimer"
          onConfirm={confirmRequest.onConfirm}
          onCancel={() => setConfirmRequest(null)}
        />
      )}
    </div>
  )
}
