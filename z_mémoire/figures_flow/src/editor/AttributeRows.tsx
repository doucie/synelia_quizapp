import { useEffect, useRef, useState } from 'react'
import { newAttr, type AttrDef, type Kind } from './model'

interface AttributeRowsProps {
  attributes: AttrDef[]
  kind: Kind
  /** `scope` regroupe les frappes d'un même champ en une seule annulation. */
  onChange: (next: AttrDef[], scope?: string) => void
}

/**
 * Édition des attributs d'une entité (ou d'une association en MCD).
 *
 * Chaque ligne est une saisie directe : pas de formulaire « ajouter » séparé,
 * pas de dialogue. `Entrée` ajoute l'attribut suivant, `Retour arrière` sur une
 * ligne vide la retire — c'est le geste attendu quand on remplit une liste.
 *
 * En MCD, seuls le nom et la clé primaire sont montrés : le type et la
 * nullabilité n'existent qu'au niveau physique, et les afficher laisserait
 * croire qu'ils sont rendus dans la figure.
 */
export default function AttributeRows({ attributes, kind, onChange }: AttributeRowsProps) {
  const [focusId, setFocusId] = useState<string | null>(null)
  const inputs = useRef(new Map<string, HTMLInputElement | null>())
  const isMld = kind === 'mld'

  useEffect(() => {
    if (!focusId) return
    const input = inputs.current.get(focusId)
    if (!input) return
    input.focus()
    input.select()
    setFocusId(null)
  }, [focusId, attributes])

  const update = (id: string, patch: Partial<AttrDef>) => {
    const field = Object.keys(patch)[0] ?? ''
    onChange(
      attributes.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      `attr:${id}:${field}`,
    )
  }

  const addAfter = (index: number) => {
    const attr = newAttr()
    const next = [...attributes]
    next.splice(index + 1, 0, attr)
    onChange(next)
    setFocusId(attr.id)
  }

  const remove = (id: string) => {
    onChange(attributes.filter((a) => a.id !== id))
  }

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= attributes.length) return
    const next = [...attributes]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Attributs ({attributes.length})
        </span>
        <button
          type="button"
          className="rounded px-1.5 py-0.5 text-[11px] text-primary hover:bg-muted"
          onClick={() => addAfter(attributes.length - 1)}
          title="Ajouter un attribut"
        >
          + attribut
        </button>
      </div>

      {attributes.length === 0 && (
        <p className="text-[11px] text-muted-foreground">
          Aucun attribut. « + attribut » pour commencer.
        </p>
      )}

      <ul className="flex flex-col gap-1">
        {attributes.map((attr, index) => (
          <li key={attr.id} className="flex items-start gap-1">
            <div className="flex flex-col gap-0.5 pt-1">
              <label
                className="flex items-center gap-1 text-[9px] text-muted-foreground"
                title="Clé primaire"
              >
                <input
                  type="checkbox"
                  className="h-3 w-3 accent-primary"
                  checked={!!attr.isPK}
                  onChange={(e) => update(attr.id, { isPK: e.target.checked })}
                />
                PK
              </label>
              {isMld && (
                <label
                  className="flex items-center gap-1 text-[9px] text-muted-foreground"
                  title="Clé étrangère"
                >
                  <input
                    type="checkbox"
                    className="h-3 w-3 accent-primary"
                    checked={!!attr.isFK}
                    onChange={(e) => update(attr.id, { isFK: e.target.checked })}
                  />
                  FK
                </label>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <input
                ref={(el) => {
                  inputs.current.set(attr.id, el)
                }}
                className="w-full rounded border border-border bg-background px-1.5 py-0.5 text-xs text-foreground outline-none focus:border-primary"
                value={attr.name}
                placeholder="nom_attribut"
                onChange={(e) => update(attr.id, { name: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addAfter(index)
                  } else if (e.key === 'Backspace' && attr.name === '') {
                    e.preventDefault()
                    remove(attr.id)
                  }
                }}
              />
              {isMld && (
                <div className="flex items-center gap-1">
                  <input
                    className="w-full rounded border border-border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground outline-none focus:border-primary"
                    value={attr.type ?? ''}
                    placeholder="INT, VARCHAR(100)…"
                    onChange={(e) => update(attr.id, { type: e.target.value })}
                  />
                  <label
                    className="flex shrink-0 items-center gap-1 text-[9px] text-muted-foreground"
                    title="Colonne nullable"
                  >
                    <input
                      type="checkbox"
                      className="h-3 w-3 accent-primary"
                      checked={!!attr.nullable}
                      onChange={(e) => update(attr.id, { nullable: e.target.checked })}
                    />
                    NULL
                  </label>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <button
                type="button"
                className="rounded px-1 text-[10px] text-muted-foreground hover:bg-muted disabled:opacity-30"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                title="Monter"
              >
                ↑
              </button>
              <button
                type="button"
                className="rounded px-1 text-[10px] text-muted-foreground hover:bg-muted disabled:opacity-30"
                onClick={() => move(index, 1)}
                disabled={index === attributes.length - 1}
                title="Descendre"
              >
                ↓
              </button>
            </div>

            <button
              type="button"
              className="mt-0.5 rounded px-1 text-xs text-muted-foreground hover:bg-muted hover:text-destructive"
              onClick={() => remove(attr.id)}
              title="Supprimer l’attribut"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
