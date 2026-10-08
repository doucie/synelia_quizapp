/**
 * Jeu d’icônes Feather (MIT) partagé des figures du mémoire.
 *
 * Même convention que les icônes locales de `PersonaNode` : SVG inline,
 * `fill: none`, `stroke: currentColor`, coins arrondis — aucun `<img>`, donc
 * aucun risque réseau/CORS pendant l’export, le raster clone du DOM et les
 * icônes en font partie. `PersonaNode` garde son jeu local (hors périmètre).
 *
 * Pas de `ticket` chez Feather (il n’existe pas) : « lien/token » se rend par
 * `link`.
 */

export type FeatherIconKind =
  | 'key'
  | 'shield'
  | 'users'
  | 'lock'
  | 'link'
  | 'mail'
  | 'hash'
  | 'usercheck'

function Body({ kind }: { kind: FeatherIconKind }) {
  switch (kind) {
    case 'key':
      return (
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      )
    case 'shield':
      return <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    case 'users':
      return (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      )
    case 'lock':
      return (
        <>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </>
      )
    case 'link':
      return (
        <>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </>
      )
    case 'mail':
      return (
        <>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </>
      )
    case 'hash':
      return (
        <>
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </>
      )
    case 'usercheck':
      return (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <polyline points="17 11 19 13 23 9" />
        </>
      )
  }
}

export function FeatherIcon({
  kind,
  size = 20,
  color,
}: {
  kind: FeatherIconKind
  size?: number
  color?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      style={{ flexShrink: 0, color }}
    >
      <Body kind={kind} />
    </svg>
  )
}
