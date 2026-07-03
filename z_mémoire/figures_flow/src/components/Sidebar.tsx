import { diagrams } from '../diagrams'
import type { DiagramDefinition, Category } from '../types'

interface SidebarProps {
  activeId: string
  onSelect: (diagram: DiagramDefinition) => void
  expanded: Record<string, boolean>
  onToggle: (key: string) => void
}

const categories: { label: string; key: Category }[] = [
  { label: 'MCD — Conceptuel', key: 'mcd' },
  { label: 'MLD — Logique', key: 'mld' },
  { label: 'MPD — Physique', key: 'mpd' },
  { label: 'Traitements', key: 'traitements' },
]

const categoryIcons: Record<Category, string> = {
  mcd: '⊞',
  mld: '⊡',
  mpd: '◈',
  traitements: '⚙',
}

export default function Sidebar({ activeId, onSelect, expanded, onToggle }: SidebarProps) {

  return (
    <aside className="flex h-full w-[260px] flex-col border-r border-border bg-background">
      <div className="border-border border-b px-4 py-3 text-sm font-bold text-foreground">
        Figures Flow
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
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
                    <button
                      key={d.id}
                      onClick={() => onSelect(d)}
                      className={`rounded-md px-3 py-1.5 text-left text-xs transition-colors ${
                        activeId === d.id
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {d.domain}
                    </button>
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
