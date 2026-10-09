import type { EntityNodeData, HubSpoke } from '../../types'
import { FeatherIcon } from './icons'

/**
 * Hub qualité (figure du mémoire, 3.3) : 7 exigences PAIRES autour d’un hub —
 * l’inverse des concentriques, où la taille EST hiérarchique. Ici distance et
 * taille sont uniformes : toute différence visuelle entre médaillons serait
 * un contresens.
 *
 * Nœud composite unique, zéro arête React Flow (précédent `RingsNode`) : hub
 * SVG + 7 médaillons + 7 traits fins **sans pointes** (appartenance, pas
 * flux) calculés. Aucune `<Handle>`.
 *
 * Égalité stricte : médaillons blancs, anneau 2 px encre, icônes et noms
 * encre — **aucune teinte**, contrairement aux figures précédentes. Hub
 * encre, texte blanc. Critère radialement vers l’extérieur (le « sous » du
 * brief vu du centre : tout-écran-bas cognerait le hub pour le médaillon du
 * haut), `/85` — le « petit gris » en `muted` ne passe pas la règle contraste.
 */

const CX = 640
const CY = 575
const W = 1280
const H = 1140
const HUB_R = 130
const ORBIT = 340
const MED_R = 85

const HUB_SIZE = 24
const ICON = 38
const NAME_SIZE = 20
const ID_SIZE = 14
const CRITERION_SIZE = 16
// Bloc resserré (200) et repoussé au-delà du cercle (centre à +201) : à 230
// de large et +101, la moitié intérieure recouvrait le médaillon sur les
// rayons latéraux. Voir plan.
const CRITERION_W = 200
const CRITERION_OFF = MED_R + 16 + CRITERION_W / 2

/** Même convention que les autres figures d’impression : `--org-font-scale`
 * est déjà recopiée pendant l’export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

/** Position du médaillon `i` (ordre horaire depuis le haut). */
function spokePos(i: number, n: number) {
  const a = (-90 + (i * 360) / n) * (Math.PI / 180)
  const dx = Math.cos(a)
  const dy = Math.sin(a)
  return { x: CX + ORBIT * dx, y: CY + ORBIT * dy, dx, dy }
}

function Medallion({ spoke, index, total }: { spoke: HubSpoke; index: number; total: number }) {
  const p = spokePos(index, total)
  return (
    <>
      <div
        className="absolute flex flex-col items-center"
        style={{ left: p.x - MED_R, top: p.y - MED_R, width: MED_R * 2, height: MED_R * 2 }}
      >
        <span style={{ marginTop: 26 }}>
          <FeatherIcon kind={spoke.icon} size={ICON} color="hsl(var(--foreground))" />
        </span>
        <span className="font-bold text-foreground" style={{ ...px(NAME_SIZE), marginTop: 6 }}>
          {spoke.name}
        </span>
        <span className="font-bold tracking-wide text-muted-foreground" style={px(ID_SIZE)}>
          {spoke.id}
        </span>
      </div>
      <div
        className="absolute"
        style={{
          left: p.x + p.dx * CRITERION_OFF - CRITERION_W / 2,
          top: p.y + p.dy * CRITERION_OFF - 20,
          width: CRITERION_W,
          textAlign: 'center',
        }}
      >
        <span className="leading-snug text-foreground/85" style={px(CRITERION_SIZE)}>
          {spoke.criterion}
        </span>
      </div>
    </>
  )
}

export default function HubNode({ data }: { data: EntityNodeData }) {
  const spokes = data.spokes ?? []
  return (
    <div data-export-root className="relative w-full" style={{ width: data.exportWidth, height: H }}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        style={{ position: 'absolute', left: 0, top: 0 }}
      >
        {/* Traits d’appartenance : hub → médaillons, sans pointes. */}
        {spokes.map((spoke, i) => {
          const p = spokePos(i, spokes.length)
          return (
            <line
              key={`l-${spoke.id}`}
              x1={CX + p.dx * HUB_R}
              y1={CY + p.dy * HUB_R}
              x2={p.x - p.dx * MED_R}
              y2={p.y - p.dy * MED_R}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1.5}
            />
          )
        })}
        <circle cx={CX} cy={CY} r={HUB_R} fill="hsl(var(--foreground))" />
        {spokes.map((spoke, i) => {
          const p = spokePos(i, spokes.length)
          return (
            <circle
              key={spoke.id}
              cx={p.x}
              cy={p.y}
              r={MED_R}
              fill="hsl(var(--background))"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
            />
          )
        })}
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ left: CX - HUB_R, top: CY - HUB_R, width: HUB_R * 2, height: HUB_R * 2, textAlign: 'center' }}
      >
        <span className="font-bold leading-snug whitespace-nowrap" style={{ ...px(HUB_SIZE), color: '#ffffff' }}>
          {data.hubTitle}
        </span>
      </div>
      {spokes.map((spoke, i) => (
        <Medallion key={spoke.id} spoke={spoke} index={i} total={spokes.length} />
      ))}
    </div>
  )
}
