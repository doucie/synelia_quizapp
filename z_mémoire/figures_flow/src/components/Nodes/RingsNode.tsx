import type { EntityNodeData, RingData } from '../../types'
import { hsla } from '../../utils/color'

/**
 * Acteurs concentriques (figure du mémoire, 3.2.9, tableau 1) : le périmètre
 * de contrôle de chaque acteur EN CONTIENT un autre — centre = Candidat
 * (restreint), extérieur = Super admin (englobant). Ne pas inverser.
 *
 * Nœud composite unique, zéro arête React Flow (précédent `ScopeNode`,
 * fig. 6/10) : 4 disques SVG (`r` 140/230/320/410, alpha décroissante vers
 * l’extérieur + contour 2 px teinte) + labels HTML absolus + 4 callouts +
 * lignes de fuite SVG calculées (`C + r·d̂`, déterministes, pas mesurées).
 * Aucune `<Handle>`, aucun ancrage à régler.
 *
 * Teintes et initiales fig. 1 : la taille porte la hiérarchie, la couleur
 * identifie le rôle (précédent fig. 6/8). La pastille-initiale marque le
 * point où chaque anneau touche son callout (rappel fig. 1).
 */

const CX = 750
const CY = 470
const RADII = [140, 230, 320, 410]
const ALPHAS = [0.26, 0.19, 0.13, 0.08]
const W = 1500
const H = 940

const ROLE_SIZE = 22
const CALLOUT_ROLE_SIZE = 20
const MICRO_SIZE = 13
const ITEM_SIZE = 15
const PASTILLE = 36

/** Même convention que les autres figures d’impression : `--org-font-scale`
 * est déjà recopiée pendant l’export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

/** Point de l’anneau `r` dans la direction de la cible `(tx, ty)`. */
function touch(r: number, tx: number, ty: number) {
  const dx = tx - CX
  const dy = ty - CY
  const d = Math.hypot(dx, dy) || 1
  return { x: CX + (r * dx) / d, y: CY + (r * dy) / d }
}

/** Largeur max du texte d’anneau (corde de la bande, voir plan). */
const LABEL_W = [230, 270, 340, 400]
/**
 * Ordonnée du rôle seul : milieux radiaux (disque centré, bandes 185/275/365).
 * Le niveau de contrôle a déménagé dans les callouts (retour demandeur) : un
 * texte à cheval sur deux anneaux disait l’inverse du message de contenance.
 * Règle uniforme pour les quatre — le cas spécial « R en haut » a disparu
 * avec sa cause.
 */
const LABEL_Y = [CY, CY + 185, CY + 275, CY + 365]

/** Callouts : gauche (Candidat bas, Recruteur haut), droite (Admin haut,
 * Super admin bas). `ty` = point d’ancrage (bord intérieur de la boîte). */
const CALLOUTS = [
  { side: 'left' as const, top: 620, ty: 710 },
  { side: 'left' as const, top: 230, ty: 320 },
  { side: 'right' as const, top: 230, ty: 320 },
  { side: 'right' as const, top: 620, ty: 710 },
]
const CALLOUT_X = { left: 20, right: 1180 }
const CALLOUT_W = 300

function Callout({ ring, slot }: { ring: RingData; slot: number }) {
  const cfg = CALLOUTS[slot]
  const x = CALLOUT_X[cfg.side]
  return (
    <div
      className="absolute flex flex-col rounded-xl border border-solid bg-background"
      style={{
        left: x,
        top: cfg.top,
        width: CALLOUT_W,
        padding: '16px 20px',
        gap: 8,
        borderColor: hsla(ring.color, 0.35),
      }}
    >
      <span className="font-bold" style={{ ...px(CALLOUT_ROLE_SIZE), color: ring.color }}>
        {ring.role}
      </span>
      <span className="font-bold tracking-wide text-muted-foreground uppercase" style={px(MICRO_SIZE)}>
        Opérations
      </span>
      <span className="leading-snug text-foreground/85" style={px(ITEM_SIZE)}>
        {ring.ops.join(', ')}.
      </span>
      <span className="font-bold tracking-wide text-muted-foreground uppercase" style={px(MICRO_SIZE)}>
        Données
      </span>
      <span className="leading-snug text-foreground/85" style={px(ITEM_SIZE)}>
        {ring.items.join(', ')}.
      </span>
      <span className="font-bold tracking-wide text-muted-foreground uppercase" style={px(MICRO_SIZE)}>
        Niveau de contrôle
      </span>
      <span className="leading-snug text-foreground/85 italic" style={px(ITEM_SIZE)}>
        {ring.control}
      </span>
    </div>
  )
}

export default function RingsNode({ data }: { data: EntityNodeData }) {
  const rings = data.rings ?? []
  return (
    <div data-export-root className="relative w-full" style={{ width: data.exportWidth, height: H }}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        style={{ position: 'absolute', left: 0, top: 0 }}
      >
        {/* Disques de l’extérieur vers le centre : le plus opaque dessus. */}
        {[3, 2, 1, 0].map((i) => (
          <circle
            key={rings[i]?.role ?? i}
            cx={CX}
            cy={CY}
            r={RADII[i]}
            fill={hsla(rings[i]?.color, ALPHAS[i]) ?? 'transparent'}
            stroke={rings[i]?.color ?? 'none'}
            strokeWidth={2}
          />
        ))}
        {/* Lignes de fuite : anneau → bord intérieur du callout. */}
        {rings.map((ring, i) => {
          const cfg = CALLOUTS[i]
          const anchorX = cfg.side === 'left' ? CALLOUT_X.left + CALLOUT_W : CALLOUT_X.right
          const p = touch(RADII[i], anchorX, cfg.ty)
          return (
            <line
              key={`l-${ring.role}`}
              x1={p.x}
              y1={p.y}
              x2={anchorX}
              y2={cfg.ty}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1.5}
            />
          )
        })}
      </svg>
      {/* Pastilles-initiales aux points de contact (rappel fig. 1). */}
      {rings.map((ring, i) => {
        const cfg = CALLOUTS[i]
        const anchorX = cfg.side === 'left' ? CALLOUT_X.left + CALLOUT_W : CALLOUT_X.right
        const p = touch(RADII[i], anchorX, cfg.ty)
        return (
          <span
            key={`p-${ring.role}`}
            className="absolute inline-flex items-center justify-center rounded-full font-bold"
            style={{
              left: p.x - PASTILLE / 2,
              top: p.y - PASTILLE / 2,
              width: PASTILLE,
              height: PASTILLE,
              backgroundColor: ring.color,
              color: '#ffffff',
              ...px(16),
            }}
          >
            {ring.initial}
          </span>
        )
      })}
      {/* Rôles seuls, centrés au milieu radial (voir `LABEL_Y`). */}
      {rings.map((ring, i) => (
        <div
          key={`t-${ring.role}`}
          className="absolute flex flex-col items-center"
          style={{
            left: CX - LABEL_W[i] / 2,
            top: LABEL_Y[i] - 15,
            width: LABEL_W[i],
            textAlign: 'center',
          }}
        >
          <span className="font-bold text-foreground" style={px(ROLE_SIZE)}>
            {ring.role}
          </span>
        </div>
      ))}
      {rings.map((ring, i) => (
        <Callout key={`c-${ring.role}`} ring={ring} slot={i} />
      ))}
    </div>
  )
}
