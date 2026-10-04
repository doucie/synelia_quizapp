/**
 * Teinte une couleur `hsl(H, S%, L%)` — le format que portent les `data.color`
 * des figures — sans impose la syntaxe relative `hsl(from …)`, que la
 * rasterisation DOM de l'export SVG ne maîtrise pas.
 *
 * Une couleur absente ou d'un autre format renvoie `undefined` : l'appelant
 * n'applique alors aucun fond, plutôt que de peindre en noir.
 */
export function hsla(color: string | undefined, alpha: number): string | undefined {
  if (!color) return
  const m = color.match(/^hsl\((\d+)/)
  if (!m) return
  return `hsla(${m[1]}, 100%, 40%, ${alpha})`
}
