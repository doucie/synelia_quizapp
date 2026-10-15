/**
 * Recoloriage des SVG dessinés par Claude pour le mémoire (variante `claude`).
 *
 * Contrat : le SVG entre TEL QUEL (import `?raw`), seule la présentation
 * est remappée — palette, fonte, purge du manifeste C2PA. Aucun
 * réagencement : si la géométrie ne convient pas, c’est un nouvel aller
 * vers Claude, pas un bricolage ici.
 *
 * Toute couleur source non mappée est signalée (pastille rouge à l’écran,
 * hors export + `console.error`) : jamais de couleur Claude silencieuse
 * dans le mémoire.
 */

/** Palette Claude relevée sur ses 10 exemples (`exemples_claude_svg/`). */
export const DEFAULT_CLAUDE_MAP: Record<string, string> = {
  // Candidat (vert Claude) → teinte candidat fig. 1 (330).
  'rgb(225, 245, 238)': 'hsla(330, 100%, 40%, 0.12)',
  'rgb(15, 110, 86)': 'hsl(330, 100%, 40%)',
  // Interne (violet Claude) → teinte recruteur fig. 1 (285).
  'rgb(238, 237, 254)': 'hsla(285, 100%, 40%, 0.12)',
  'rgb(83, 74, 183)': 'hsl(285, 100%, 40%)',
  // Secondaire (systèmes externes).
  'rgb(241, 239, 232)': 'hsl(var(--muted))',
  'rgb(95, 94, 90)': 'hsl(var(--muted-foreground))',
  'rgb(68, 68, 65)': 'hsl(var(--foreground))',
  // Encres et traits.
  'rgb(11, 11, 11)': 'hsl(var(--foreground))',
  'rgb(0, 0, 0)': 'hsl(var(--foreground))',
  'rgb(82, 81, 78)': 'hsl(var(--foreground))',
  'rgb(137, 135, 129)': 'hsl(var(--muted-foreground))',
  // `context-stroke` (marqueurs) : non supporté par le rasteriseur Chrome,
  // la flèche serait invisible à l’export — repli sur le gris de trait.
  'context-stroke': 'hsl(var(--muted-foreground))',
  // Second lot (composants, déploiement, états, séquences) : variantes
  // sombres des deux familles + fond blanc cassé.
  'rgb(252, 252, 251)': 'hsl(var(--background))',
  'rgb(8, 80, 65)': 'hsl(330, 100%, 32%)',
  'rgb(60, 52, 137)': 'hsl(285, 100%, 32%)',
}

const FONT_FROM = 'font-family:anthropic-sans'
const FONT_TO = "font-family:'Cabinet Grotesk', system-ui, sans-serif"

/** Couleurs qui ne sont pas des choix de palette (jamais signalées). */
const COLOR_ALLOW = new Set([
  'none', 'transparent', 'currentcolor', 'inherit',
  'rgb(255, 255, 255)', '#ffffff', '#fff', 'white',
])

export interface RecolorResult {
  svg: string
  /** Couleurs sources restantes ni mappées ni bénignes. */
  unmapped: string[]
}

export function recolorClaudeSvg(
  raw: string,
  overrides: Record<string, string> = {},
): RecolorResult {
  const map = { ...DEFAULT_CLAUDE_MAP, ...overrides }
  // 1. Purge du manifeste C2PA (traçabilité de génération, inutile au print).
  let svg = raw.replace(/<metadata>[\s\S]*?<\/metadata>/, '')
  // 2. Fonte : pile du mémoire (déjà auto-hébergée pour l’export).
  svg = svg.split(FONT_FROM).join(FONT_TO)
  // 3. Palette.
  for (const [from, to] of Object.entries(map)) {
    svg = svg.split(from).join(to)
  }
  // 4. Couleurs restantes : signalées, jamais silencieuses.
  const leftovers = new Set<string>()
  for (const m of svg.matchAll(/rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b|[a-z-]+\(stroke\)/g)) {
    const v = m[0].toLowerCase()
    if (!COLOR_ALLOW.has(v) && !Object.values(map).some((t) => t.toLowerCase() === v)) {
      leftovers.add(m[0])
    }
  }
  return { svg, unmapped: [...leftovers] }
}
