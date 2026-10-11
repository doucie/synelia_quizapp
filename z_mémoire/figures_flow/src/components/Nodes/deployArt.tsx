/**
 * Illustrations plates de la topologie de déploiement (fig. 16) : poste de
 * travail (écran du cadre hôte), fenêtre navigateur (Angular), stack de
 * conteneurs (Docker) + tour du poste-hôte.
 *
 * Dessinées main dans le langage des figures (aplats, 2-3 formes, palette
 * existante) — pas d’images téléchargées : zéro licence, net à l’impression,
 * rasterisées avec le nœud à l’export (SVG inline, comme les icônes). Co-loc
 * ici (usage unique, précédent `RgNode.Arrow`) plutôt qu’en jeu partagé.
 */

const INK = 'hsl(var(--foreground))'
const MUTED = 'hsl(var(--muted-foreground))'
const PAPER = 'hsl(var(--background))'
const WASH = 'hsl(var(--muted))'

/** Tour du poste-hôte (~110×190) : posée sur la bordure basse du cadre
 * (qui fait office de ligne de bureau), en bas à gauche sous MySQL —
 * zone vide relevée (aucune arête sous y≈800 à x<530). LED verte 128. */
export function HostTower() {
  return (
    <svg width={110} height={190} viewBox="0 0 110 190" role="img" aria-label="tour du poste hôte" style={{ flexShrink: 0, display: 'block' }}>
      <rect x="6" y="6" width="98" height="178" rx="6" fill={PAPER} stroke={INK} strokeWidth={4} />
      <circle cx="53" cy="28" r="5" fill="hsl(128, 100%, 40%)" />
      <line x1="30" y1="58" x2="80" y2="58" stroke={MUTED} strokeWidth={3} strokeLinecap="round" />
      <line x1="30" y1="72" x2="80" y2="72" stroke={MUTED} strokeWidth={3} strokeLinecap="round" />
      <line x1="30" y1="86" x2="80" y2="86" stroke={MUTED} strokeWidth={3} strokeLinecap="round" />
      <rect x="30" y="120" width="50" height="12" rx="6" fill={WASH} stroke={MUTED} strokeWidth={2} />
    </svg>
  )
}

/** Fenêtre navigateur : chrome + sidebar + barres (service Angular, ~130×100). */
export function Browser() {
  return (
    <svg width={130} height={100} viewBox="0 0 130 100" role="img" aria-label="navigateur web" style={{ flexShrink: 0 }}>
      <rect x="4" y="4" width="122" height="92" rx="8" fill={PAPER} stroke={INK} strokeWidth={2.5} />
      <line x1="4" y1="26" x2="126" y2="26" stroke={INK} strokeWidth={2} />
      <circle cx="15" cy="15" r="3.5" fill={MUTED} />
      <circle cx="26" cy="15" r="3.5" fill={MUTED} />
      <circle cx="37" cy="15" r="3.5" fill={MUTED} />
      <rect x="12" y="34" width="26" height="54" rx="3" fill="hsl(335, 100%, 40%, 0.15)" />
      <rect x="46" y="38" width="68" height="8" rx="4" fill="hsl(335, 100%, 40%, 0.45)" />
      <rect x="46" y="54" width="68" height="8" rx="4" fill={MUTED} opacity={0.5} />
      <rect x="46" y="70" width="48" height="8" rx="4" fill={MUTED} opacity={0.5} />
    </svg>
  )
}

/** Stack de 2 conteneurs (bandeau Compose, ~120×60) : 140 de large
    débordait du cadre (baleine + titre nowrap + stack > 450). */
export function ContainerStack() {
  return (
    <svg width={120} height={60} viewBox="0 0 140 70" role="img" aria-label="conteneurs" style={{ flexShrink: 0 }}>
      <rect x="6" y="36" width="128" height="30" rx="3" fill={PAPER} stroke={INK} strokeWidth={2.5} />
      {[26, 50, 74, 98, 122].map((x) => (
        <line key={`b-${x}`} x1={x} y1={39} x2={x} y2={63} stroke={INK} strokeWidth={1.5} />
      ))}
      <rect x="18" y="4" width="104" height="30" rx="3" fill="hsl(210, 100%, 40%, 0.12)" stroke={INK} strokeWidth={2.5} />
      {[38, 62, 86, 110].map((x) => (
        <line key={`t-${x}`} x1={x} y1={7} x2={x} y2={31} stroke={INK} strokeWidth={1.5} />
      ))}
    </svg>
  )
}
