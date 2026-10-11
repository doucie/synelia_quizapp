/**
 * Illustrations plates de la topologie de déploiement (fig. 16) : poste de
 * travail (hôte), fenêtre navigateur (Angular), stack de conteneurs (Docker).
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

/** Poste de travail : écran + tour (bandeau du cadre hôte, ~150×110). */
export function Workstation() {
  return (
    <svg width={150} height={110} viewBox="0 0 150 110" role="img" aria-label="poste de travail" style={{ flexShrink: 0 }}>
      <rect x="112" y="26" width="28" height="64" rx="4" fill={PAPER} stroke={INK} strokeWidth={3} />
      <circle cx="126" cy="38" r="3" fill="hsl(128, 100%, 40%)" />
      <line x1="118" y1="52" x2="134" y2="52" stroke={MUTED} strokeWidth={2} strokeLinecap="round" />
      <line x1="118" y1="60" x2="134" y2="60" stroke={MUTED} strokeWidth={2} strokeLinecap="round" />
      <rect x="18" y="6" width="86" height="60" rx="6" fill={PAPER} stroke={INK} strokeWidth={3} />
      <rect x="26" y="14" width="70" height="36" rx="3" fill={WASH} />
      <rect x="52" y="66" width="18" height="16" fill={MUTED} />
      <rect x="38" y="82" width="46" height="8" rx="4" fill={INK} />
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
