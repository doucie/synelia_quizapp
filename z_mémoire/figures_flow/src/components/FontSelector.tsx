import { useState, useRef, useEffect } from 'react'
import { useFontPreference } from '../hooks/useFontPreference'

export default function FontSelector() {
  const { font, setFont, fonts } = useFontPreference()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = fonts.find((f) => f.id === font)
  const style = { fontFamily: selected?.stack }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
        title="Changer la police"
      >
        <span style={style}>Aa</span>
        <span className="text-[10px] opacity-60">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-background py-1 shadow-lg">
          {fonts.map((f) => (
            <button
              key={f.id}
              onClick={() => { setFont(f.id); setOpen(false) }}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-muted ${font === f.id ? 'bg-primary/10 font-semibold text-primary' : 'text-foreground'}`}
            >
              <span style={{ fontFamily: f.stack }}>{f.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
