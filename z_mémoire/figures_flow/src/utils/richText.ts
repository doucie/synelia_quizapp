/**
 * Rendu de gras léger pour les figures du mémoire : découpe une phrase
 * verbatim sur les marqueurs `**…**` du modèle de données et rend les
 * segments couverts en `strong`, les autres en normal. Un seul niveau,
 * pas d'imbrication — le verbatim des HTML sources n'en demande pas plus.
 */
export function richParts(text: string): { bold: boolean; text: string }[] {
  return text
    .split('**')
    .filter((seg) => seg.length > 0)
    .map((seg, i) => ({ bold: i % 2 === 1, text: seg }))
}
