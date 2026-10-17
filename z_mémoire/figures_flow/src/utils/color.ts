/**
 * Teinte une couleur — sans imposer la syntaxe relative `hsl(from …)`, que la
 * rasterisation DOM de l'export SVG ne maîtrise pas. Deux entrées acceptées :
 * `hsl(H, S%, L%)` (le format que portent les `data.color` des figures) et
 * `#rrggbb` (les jetons de palette, hex verbatim).
 *
 * Une couleur absente ou d'un autre format renvoie `undefined` : l'appelant
 * n'applique alors aucun fond, plutôt que de peindre en noir.
 */
export function hsla(color: string | undefined, alpha: number): string | undefined {
  if (!color) return
  const hsl = color.match(/^hsl\((\d+)/)
  if (hsl) return `hsla(${hsl[1]}, 100%, 40%, ${alpha})`
  const hex = color.match(/^#([0-9a-f]{6})$/i)
  if (hex) {
    const n = parseInt(hex[1], 16)
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
  }
  return
}
