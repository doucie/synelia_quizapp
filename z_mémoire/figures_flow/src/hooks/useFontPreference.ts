import { useEffect, useState } from 'react'

const STORAGE_KEY = 'figures_flow:font'
const DEFAULT_FONT = 'Cabinet Grotesk'

export const FONTS = [
  { id: 'Cabinet Grotesk', label: 'Cabinet Grotesk', stack: "'Cabinet Grotesk', system-ui, sans-serif" },
  { id: 'Poppins', label: 'Poppins', stack: "'Poppins', system-ui, sans-serif" },
  { id: 'Inter', label: 'Inter', stack: "'Inter', system-ui, sans-serif" },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', stack: "'Plus Jakarta Sans', system-ui, sans-serif" },
  { id: 'System', label: 'System', stack: "system-ui, sans-serif" },
] as const

export function useFontPreference() {
  const [font, setFont] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_FONT
  })

  useEffect(() => {
    const entry = FONTS.find((f) => f.id === font)
    if (entry) {
      document.documentElement.style.setProperty('--font-sans', entry.stack)
      localStorage.setItem(STORAGE_KEY, font)
    }
  }, [font])

  return { font, setFont, fonts: FONTS }
}
