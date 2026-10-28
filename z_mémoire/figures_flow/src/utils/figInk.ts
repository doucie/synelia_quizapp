/**
 * Encres d'accent pour les figures mémoire (« 20261017 dark tokens » addenda
 * 20261020) : les semantics de la palette document (`--fig-success`,
 * `--fig-danger`…) sont **gelées verbatim** dans les deux modes (la couleur est
 * la donnée, comme les hex de la fig. 22) — seuls les neutres/monochromes et
 * les encres dédiées suivent le thème.
 *
 * `accentInk()` transpose une couleur de données ("token d'accent figé") vers
 * son **encre d'accent** (`var(--fig-danger)` → `var(--fig-danger-ink)`), à
 * utiliser pour tout ce qui est posé EN TEXTE / liseré fluide sur le fond de
 * page (noms, pills, badges, icônes, annotations) — afin de rester lisible en
 * sombre. À l'écran comme à l'export (thème clair forcé par `withLightTheme`),
 * l'encre vaut la même valeur saturée : le rendu clair est inchangé.
 *
 * Mapping simple : par nom de jeton (`var(--fig-<role>)` →
 * `var(--fig-<role>-ink)`) et par teinte brute (`hsl(H, 100%, 40%)` de
 * `niveaux_tests` → encres `--fig-hue-<H>-ink`). Toute autre chaîne (hex
 * verbatim, `hsl(...)` hors repère, token neutre déjà adapté) passe à
 * l'identité : les figures hors périmètre ne changent rien.
 */

const HUE_INK: Record<string, string> = {
  '240': 'var(--fig-hue-240-ink)',
  '128': 'var(--fig-hue-128-ink)',
  '30': 'var(--fig-hue-30-ink)',
}

/** `hsl(240, 100%, 40%)` → captures hue / sat / light. */
const HSL_RE = /^hsl\(\s*(\d+),\s*100%,\s*40%\)$/

export function accentInk(color: string): string {
  const m = HSL_RE.exec(color.trim())
  if (m && HUE_INK[m[1]]) return HUE_INK[m[1]]
  const token = /^var\(--fig-(\w+)\)$/.exec(color.trim())
  if (token && !['soft', 'line', 'frame', 'tint', 'on-fill', 'flow', 'flow-soft', 'flow-line', 'flow-ink', 'cost', 'cost-ink', 'soft-ink', 'line-ink', 'frame-ink', 'tint-ink'].includes(token[1])) {
    return `var(--fig-${token[1]}-ink)`
  }
  return color
}
