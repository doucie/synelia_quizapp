import { useState } from 'react'
import AttributeRows from './AttributeRows'
import { CARDINALITIES, edgeSidesKey, type EntityDef, type LinkDef, type ModelDoc } from './model'

export type Selection = { kind: 'entity'; id: string } | { kind: 'link'; id: string } | null

interface InspectorProps {
  doc: ModelDoc
  selection: Selection
  onSelect: (selection: Selection) => void
  onChangeTitle: (title: string) => void
  onChangeEntity: (id: string, patch: Partial<EntityDef>, scope?: string) => void
  onChangeLink: (id: string, patch: Partial<LinkDef>, scope?: string) => void
  onDelete: (kind: 'entity' | 'link', id: string) => void
  onAddEntity: () => void
  onAddLink: (from: string, to: string) => void
  /** Replié en rail : le canevas récupère la largeur, le panneau reste atteignable. */
  collapsed: boolean
  onToggleCollapsed: () => void
}

const labelCls = 'text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'
const inputCls =
  'w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary'

/**
 * Panneau de droite : tout ce qu'on ne peut pas saisir directement sur le
 * canevas (noms, types, cardinalités). Il suit la sélection React Flow, donc
 * cliquer une carte ou une arête suffit à changer de sujet.
 *
 * Le panneau ne détient aucun état : il lit le document et remonte des
 * modifications ciblées (`{ name }`, `{ attributes }`…). L'historique
 * (annuler / rétablir) est tenu par `ModelEditor`, un seul endroit.
 */
export default function Inspector({
  doc,
  selection,
  onSelect,
  onChangeTitle,
  onChangeEntity,
  onChangeLink,
  onDelete,
  onAddEntity,
  onAddLink,
  collapsed,
  onToggleCollapsed,
}: InspectorProps) {
  const entity = selection?.kind === 'entity' ? doc.entities.find((e) => e.id === selection.id) : undefined
  const link = selection?.kind === 'link' ? doc.links.find((l) => l.id === selection.id) : undefined
  const entityName = (id: string) => doc.entities.find((e) => e.id === id)?.name.trim() || 'SANS_NOM'

  /* Choix du sens d'une nouvelle association. Les valeurs retenues sont
     recalculées à chaque rendu : supprimer une entité ne doit pas laisser un
     `<select>` pointant sur un identifiant mort. */
  const [linkFrom, setLinkFrom] = useState('')
  const [linkTo, setLinkTo] = useState('')
  const fromId = doc.entities.some((e) => e.id === linkFrom) ? linkFrom : (doc.entities[0]?.id ?? '')
  const toId = doc.entities.some((e) => e.id === linkTo) ? linkTo : (doc.entities[1]?.id ?? '')

  /* Rail replié : il garde une trace du panneau (sinon on ne saurait plus qu'il
     existe) sans prendre la largeur d'un formulaire. Aucun état ici : le repli
     appartient à `ModelEditor`, qui le mémorise. */
  if (collapsed) {
    return (
      <aside className="flex h-full w-8 shrink-0 flex-col items-center gap-2 overflow-hidden border-l border-border bg-background py-2">
        <button
          type="button"
          className="rounded px-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={onToggleCollapsed}
          title="Déplier le panneau"
          aria-label="Déplier le panneau"
          aria-expanded={false}
        >
          ‹
        </button>
        <button
          type="button"
          className="flex-1 rounded px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted hover:text-foreground"
          style={{ writingMode: 'vertical-rl' }}
          onClick={onToggleCollapsed}
          tabIndex={-1}
          title="Déplier le panneau"
        >
          Panneau
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col overflow-y-auto border-l border-border bg-background">
      <header className="flex items-center justify-between gap-1 border-b border-border px-3 py-2">
        <h2 className="text-xs font-semibold text-foreground">
          {entity ? 'Entité' : link ? 'Association' : 'Modèle'}
        </h2>
        <div className="flex items-center gap-1">
          {(entity || link) && (
            <button
              type="button"
              className="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted"
              onClick={() => onSelect(null)}
            >
              fermer
            </button>
          )}
          <button
            type="button"
            className="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onToggleCollapsed}
            title="Replier le panneau"
            aria-label="Replier le panneau"
            aria-expanded
          >
            ›
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-4 p-3">
        {!entity && !link && (
          <>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Titre</label>
              <input
                className={inputCls}
                value={doc.title}
                onChange={(e) => onChangeTitle(e.target.value)}
                placeholder="Nom du modèle"
              />
            </div>

            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Double-clic sur le fond : nouvelle entité. Glisser d’un point d’ancrage à un autre :
              association. <span className="text-foreground">Suppr</span> retire la sélection.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted"
                onClick={onAddEntity}
              >
                + entité
              </button>
            </div>

            {doc.entities.length >= 2 && (
              <div className="flex flex-col gap-1 rounded border border-border p-2">
                <span className={labelCls}>Nouvelle association</span>
                <select
                  className={inputCls}
                  value={fromId}
                  onChange={(e) => setLinkFrom(e.target.value)}
                >
                  {doc.entities.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name.trim() || 'SANS_NOM'}
                    </option>
                  ))}
                </select>
                <div className="text-center text-[10px] text-muted-foreground">↓</div>
                <select
                  className={inputCls}
                  value={toId}
                  onChange={(e) => setLinkTo(e.target.value)}
                >
                  {doc.entities.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name.trim() || 'SANS_NOM'}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted disabled:opacity-40"
                  onClick={() => onAddLink(fromId, toId)}
                  disabled={!fromId || !toId || fromId === toId}
                >
                  Relier
                </button>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className={labelCls}>Entités ({doc.entities.length})</span>
              <ul className="flex flex-col">
                {doc.entities.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-xs text-foreground hover:bg-muted"
                      onClick={() => onSelect({ kind: 'entity', id: e.id })}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: e.color }}
                        aria-hidden
                      />
                      <span className="truncate">{e.name.trim() || 'SANS_NOM'}</span>
                      <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                        {e.attributes.length}
                      </span>
                    </button>
                  </li>
                ))}
                {doc.entities.length === 0 && (
                  <li className="px-1.5 text-[11px] text-muted-foreground">Aucune entité.</li>
                )}
              </ul>
            </div>

            <div className="flex flex-col gap-1">
              <span className={labelCls}>Associations ({doc.links.length})</span>
              <ul className="flex flex-col">
                {doc.links.map((l) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      className="flex w-full flex-col rounded px-1.5 py-1 text-left text-xs text-foreground hover:bg-muted"
                      onClick={() => onSelect({ kind: 'link', id: l.id })}
                    >
                      <span className="truncate">{l.name.trim() || '(sans nom)'}</span>
                      <span className="truncate text-[10px] text-muted-foreground">
                        {entityName(l.from)} → {entityName(l.to)}
                      </span>
                    </button>
                  </li>
                ))}
                {doc.links.length === 0 && (
                  <li className="px-1.5 text-[11px] text-muted-foreground">Aucune association.</li>
                )}
              </ul>
            </div>
          </>
        )}

        {entity && (
          <>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Nom</label>
              <input
                className={inputCls}
                value={entity.name}
                autoFocus
                onChange={(e) => onChangeEntity(entity.id, { name: e.target.value }, `entity:${entity.id}:name`)}
                placeholder="NOM_ENTITE"
              />
            </div>

            <AttributeRows
              attributes={entity.attributes}
              kind={doc.kind}
              onChange={(attributes, scope) => onChangeEntity(entity.id, { attributes }, scope)}
            />

            {entity.badge && (
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Étiquette</label>
                <input
                  className={inputCls}
                  value={entity.badge}
                  onChange={(e) =>
                    onChangeEntity(entity.id, { badge: e.target.value || undefined }, `entity:${entity.id}:badge`)
                  }
                  placeholder="TABLE, JONCTION…"
                />
              </div>
            )}

            <button
              type="button"
              className="rounded border border-border px-2 py-1 text-xs text-destructive hover:bg-muted"
              onClick={() => onDelete('entity', entity.id)}
            >
              Supprimer l’entité
            </button>
          </>
        )}

        {link && (
          <>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Nom de l’association</label>
              <input
                className={inputCls}
                value={link.name}
                autoFocus
                onChange={(e) => onChangeLink(link.id, { name: e.target.value }, `link:${link.id}:name`)}
                placeholder="(sans nom)"
              />
            </div>

            <div className="rounded border border-border px-2 py-1.5 text-[11px] text-muted-foreground">
              <div className="truncate">{entityName(link.from)}</div>
              <div className="text-center leading-none">↓</div>
              <div className="truncate">{entityName(link.to)}</div>
              <button
                type="button"
                className="mt-1 w-full rounded border border-border px-1.5 py-0.5 text-[11px] text-foreground hover:bg-muted"
                onClick={() => onChangeLink(link.id, { from: link.to, to: link.from, cardFrom: link.cardTo, cardTo: link.cardFrom })}
              >
                inverser le sens
              </button>
            </div>

            {doc.kind === 'mcd' && (
              <>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Cardinalité — {entityName(link.from)}</label>
                  <input
                    className={inputCls}
                    list={`cards-${link.id}`}
                    value={link.cardFrom ?? ''}
                    onChange={(e) => onChangeLink(link.id, { cardFrom: e.target.value }, `link:${link.id}:cfrom`)}
                    placeholder="0,n"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Cardinalité — {entityName(link.to)}</label>
                  <input
                    className={inputCls}
                    list={`cards-${link.id}`}
                    value={link.cardTo ?? ''}
                    onChange={(e) => onChangeLink(link.id, { cardTo: e.target.value }, `link:${link.id}:cto`)}
                    placeholder="1,1"
                  />
                </div>
                <datalist id={`cards-${link.id}`}>
                  {CARDINALITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>

                <LinkAttributes
                  attributes={link.attributes ?? []}
                  onChange={(attributes) => onChangeLink(link.id, { attributes }, `link:${link.id}:attrs`)}
                />
              </>
            )}

            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Côtés d’ancrage : clic sur les pastilles de cardinalité, sur le canevas.
            </p>

            <button
              type="button"
              className="rounded border border-border px-2 py-1 text-xs text-destructive hover:bg-muted"
              onClick={() => onDelete('link', link.id)}
            >
              Supprimer l’association
            </button>
          </>
        )}
      </div>

      <footer className="mt-auto border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
        Clé des côtés : <code>{edgeSidesKey(doc.id)}</code>
      </footer>
    </aside>
  )
}

/**
 * Attributs portés par une association (MCD) : ce sont de simples libellés, ils
 * s'affichent dans la pastille de l'arête — pas de type, pas de clé.
 */
function LinkAttributes({
  attributes,
  onChange,
}: {
  attributes: string[]
  onChange: (next: string[]) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className={labelCls}>Attributs portés</span>
        <button
          type="button"
          className="rounded px-1.5 py-0.5 text-[11px] text-primary hover:bg-muted"
          onClick={() => onChange([...attributes, ''])}
        >
          + attribut
        </button>
      </div>
      {attributes.map((value, index) => (
        <div key={index} className="flex items-center gap-1">
          <input
            className={inputCls}
            value={value}
            placeholder="date_affectation…"
            onChange={(e) => onChange(attributes.map((a, i) => (i === index ? e.target.value : a)))}
          />
          <button
            type="button"
            className="rounded px-1 text-xs text-muted-foreground hover:bg-muted hover:text-destructive"
            onClick={() => onChange(attributes.filter((_, i) => i !== index))}
            title="Retirer"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
