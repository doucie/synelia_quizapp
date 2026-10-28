import type { MouseEvent as ReactMouseEvent } from 'react'
import { diagrams } from '../diagrams'
import { MODELS_ROUTE, MODEL_ROUTE_PREFIX } from '../editor/model'
import { useModels } from '../editor/store'
import type { DiagramDefinition, Category } from '../types'

interface SidebarProps {
  activeId: string
  /** Segment d'URL courant : `mes-modeles`, `modele-<id>` ou l'id d'une figure. */
  routeId: string
  onSelect: (diagram: DiagramDefinition) => void
  onNavigate: (route: string) => void
  expanded: Record<string, boolean>
  onToggle: (key: string) => void
}

const categories: { label: string; key: Category }[] = [
  { label: 'MCD — Conceptuel', key: 'mcd' },
  { label: 'MLD — Logique', key: 'mld' },
  { label: 'MPD — Physique', key: 'mpd' },
  { label: 'MPD — Script SQL', key: 'mpd-sql' },
  { label: 'Traitements', key: 'traitements' },
  { label: 'MOT', key: 'mot' },
  { label: 'Organigramme', key: 'organigramme' },
  { label: 'Mémoire', key: 'memoire' },
  { label: 'UML', key: 'uml' },
  { label: 'Anciennes figures', key: 'archive' },
  { label: 'Palette', key: 'palette' },
]

const categoryIcons: Record<Category, string> = {
  mcd: '⊞',
  mld: '⊡',
  mpd: '◈',
  'mpd-sql': '▤',
  traitements: '⚙',
  mot: '☰',
  organigramme: '⌸',
  memoire: '◍',
  uml: '◑',
  archive: '◀',
  palette: '◉',
}

export default function Sidebar({
  activeId,
  routeId,
  onSelect,
  onNavigate,
  expanded,
  onToggle,
}: SidebarProps) {
  const models = useModels()

  /* Même politique que les figures : vraie ancre (menu contextuel, nouvel
     onglet, copier le lien), clic gauche simple intercepté pour rester dans la
     SPA. Ctrl/clic et bouton du milieu laissent le navigateur faire. */
  const followLink = (event: ReactMouseEvent<HTMLAnchorElement>, route: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onNavigate(route)
  }

  return (
    <aside className="relative z-10 flex h-full w-[260px] flex-col border-r border-border bg-background">
      <div className="border-border border-b px-4 py-3 text-sm font-bold text-foreground">
        Figures Flow
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="mb-2 border-b border-border pb-2">
          <a
            href={`/${MODELS_ROUTE}`}
            aria-current={routeId === MODELS_ROUTE ? 'page' : undefined}
            onClick={(e) => followLink(e, MODELS_ROUTE)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              routeId === MODELS_ROUTE
                ? 'bg-primary/10 text-primary'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            <span className="w-4">◫</span>
            <span className="flex-1">Mes modèles</span>
            <span className="text-[10px] opacity-50">{models.length}</span>
          </a>

          {models.length > 0 && (
            <div className="ml-2 mt-0.5 flex flex-col gap-0.5">
              {models.map((model) => {
                const route = `${MODEL_ROUTE_PREFIX}${model.id}`
                return (
                  <a
                    key={model.id}
                    href={`/${route}`}
                    title={model.title}
                    aria-current={routeId === route ? 'page' : undefined}
                    onClick={(e) => followLink(e, route)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors ${
                      routeId === route
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="shrink-0 text-[9px] uppercase opacity-60">{model.kind}</span>
                    <span className="truncate">{model.title}</span>
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {categories.map((cat) => {
          const catDiagrams = diagrams.filter((d) => d.category === cat.key)
          return (
            <div key={cat.key} className="mb-1">
              <button
                onClick={() => onToggle(cat.key)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-foreground hover:bg-muted"
              >
                <span className="w-4">{categoryIcons[cat.key]}</span>
                <span className="flex-1">{cat.label}</span>
                <span className="text-[10px] opacity-50">{catDiagrams.length}</span>
              </button>
              {expanded[cat.key] && (
                <div className="ml-2 flex flex-col gap-0.5">
                  {catDiagrams.map((d) => (
                    /* Vraie ancre (et non un bouton) : le menu contextuel du
                       navigateur retrouve « Ouvrir dans un nouvel onglet » et
                       « Copier l'adresse du lien », et Ctrl/clic-milieu
                       fonctionnent nativement. Le clic gauche simple est
                       intercepté pour rester dans la SPA (pushState). */
                    <a
                      key={d.id}
                      href={`/${d.id}`}
                      title={d.title}
                      aria-current={activeId === d.id ? 'page' : undefined}
                      onClick={(e) => {
                        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                        e.preventDefault()
                        onSelect(d)
                      }}
                      className={`block rounded-md px-3 py-1.5 text-left text-xs transition-colors ${
                        activeId === d.id
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {d.domain}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
