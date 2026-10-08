import { useEffect } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  useNodes,
  useReactFlow,
  type EdgeProps,
  type Node,
} from '@xyflow/react'
import type { RelationshipEdgeData } from '../../types'
import { useEdgeDebugEnabled } from '../../utils/edgeDebug'

interface Pt {
  x: number
  y: number
}

/**
 * Polyligne orthogonale à angles arrondis.
 *
 * Les points consécutifs confondus sont retirés avant calcul : un segment de
 * longueur nulle n'a pas de direction, donc pas de repère d'arrondi possible.
 * Le rayon est bridé à la moitié de chaque segment adjacent, sinon l'arrondi
 * débordait sur les branches courtes et déformait le tracé.
 */
function roundedPolyline(points: Pt[], radius: number): string {
  const pts: Pt[] = []
  for (const q of points) {
    const last = pts[pts.length - 1]
    if (!last || Math.abs(last.x - q.x) > 0.5 || Math.abs(last.y - q.y) > 0.5) pts.push(q)
  }
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`

  const seq = pts.map((q) => `${q.x},${q.y}`)
  if (radius <= 0 || pts.length === 2) return `M${seq.join(' L')}`

  let d = `M${seq[0]}`
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1]
    const cur = pts[i]
    const next = pts[i + 1]
    const lenPrev = Math.hypot(cur.x - prev.x, cur.y - prev.y)
    const lenNext = Math.hypot(next.x - cur.x, next.y - cur.y)
    // Trois points alignés ne forment pas un angle : arrondir ici ne ferait
    // qu'ajouter une courbe parasite au milieu d'un segment droit. C'est le cas
    // des branches d'un service, toutes verticales et confondues.
    const cross = (cur.x - prev.x) * (next.y - cur.y) - (cur.y - prev.y) * (next.x - cur.x)
    const r = Math.min(radius, lenPrev / 2, lenNext / 2)
    if (r < 0.5 || cross === 0) {
      d += ` L${cur.x},${cur.y}`
      continue
    }
    const enter = {
      x: cur.x + ((prev.x - cur.x) / lenPrev) * r,
      y: cur.y + ((prev.y - cur.y) / lenPrev) * r,
    }
    const leave = {
      x: cur.x + ((next.x - cur.x) / lenNext) * r,
      y: cur.y + ((next.y - cur.y) / lenNext) * r,
    }
    d += ` L${enter.x},${enter.y} Q${cur.x},${cur.y} ${leave.x},${leave.y}`
  }
  d += ` L${seq[seq.length - 1]}`
  return d
}

const DEFAULT_BUS_GAP = 56
const DEFAULT_BUS_RADIUS = 12
/**
 * Motif de tirets du rattachement PMO, repris de l'organigramme d'origine
 * (`stroke-dasharray: 6 3` sur le SVG qu'il pose à la main).
 *
 * Un `6 3` court et serré se lit comme un pointillé de rattachement, là où le
 * `7 5` se lisait comme un trait pointillé long, plus proche d'un lien polygonal
 * que d'un organigramme.
 */
const DASH_PMO = '6 3'

/**
 * Arête de distribution d'un organigramme : on descend sous la boîte parente,
 * on court horizontalement, puis on redescend sur le bas de l'enfant.
 *
 * Le nom de famille vient de l'organigramme : plusieurs enfants d'un même parent
 * partagent la **même** hauteur de barre. Comme `busGap` ne dépend que de la
 * position de la source, deux frères le calculent à l'identique et leurs
 * segments horizontaux se recouvrent — d'où la barre continue.
 *
 * Conséquence assumée : ces arêtes n'appliquent ni `edgePathOffset` ni le
 * décalage de `TraitementEdge`. Un éventail d'ancrages est précisément ce qu'un
 * organigramme ne veut pas — il veut une seule barre, pas une gerbe.
 *
 * `data.trunkFraction` déplace la course horizontale le long de la descente : à
 * 0.5, l'arête part du **milieu du tronc** et non de la barre. C'est ce dont le
 * PMO a besoin pour s'accrocher à la liaison qui descend du SG — sa source reste
 * le SG, mais le point de départ visible est au milieu du segment partagé. Le
 * coude qui suit absorbe l'écart entre la hauteur supposée et la hauteur réelle
 * de la cible, donc rien n'a à être calé au px près dans la figure.
 */
export default function OrgBusEdge({
  id,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data: edgePropsData,
  selected,
}: EdgeProps) {
  const data = (edgePropsData ?? {}) as RelationshipEdgeData

  const gap = data.busGap ?? DEFAULT_BUS_GAP
  // Sans `trunkFraction`, la course horizontale se fait sur la barre. fraction 1
  // redonne ce comportement, fraction 0 la fait partir du bord de la source.
  const runY = sourceY + gap * (data.trunkFraction ?? 1)
  const radius = data.busRadius ?? DEFAULT_BUS_RADIUS
  const stroke = selected ? undefined : data.stroke
  const path = roundedPolyline(
    [
      { x: sourceX, y: sourceY },
      { x: sourceX, y: runY },
      { x: targetX, y: runY },
      { x: targetX, y: targetY },
    ],
    radius,
  )

  const debug = useEdgeDebugEnabled()
  const nodes = useNodes()
  const targetNode = nodes.find((n) => n.id === target)
  const { getNodes } = useReactFlow()
  const diagramId = data.diagramId ?? ''
  useEffect(() => {
    if (!debug) return
    // `useNodes()` est inutilisable pour lire les hauteurs : React Flow **mute
    // l'objet nœud en place** quand il mesure
    // (`element.measured = { ...change.dimensions }`), donc le tableau `state.nodes`
    // garde la même identité, le `shallow` de `useStore` ne voit rien et aucun
    // re-render n'a lieu. Il faut donc une lecture **frais** du store, répétée sur
    // quelques frames : `getNodes()` n'est pas abonné, il voit la mutation.
    // Le drapeau DEBUG étant persisté, il est souvent déjà actif au montage — donc
    // la première passe tombe avant la mesure, d'où la boucle.
    let frame = 0
    let tries = 0
    // L'effet est présent dans les 8 arêtes de la figure, mais le journal est
    // déjà dédupliqué par signature : une seule boucle par figure suffit. En
    // dessous, 8 boucles de frames reliraient le même `getNodes()` pour rien.
    const pollKey = diagramId || '?'
    if (polling.has(pollKey)) return
    polling.add(pollKey)
    const tick = () => {
      const fresh = getNodes()
      const pending = fresh.some((n) => n.measured?.height === undefined)
      reportMeasuredHeights(fresh, diagramId)
      if (pending && tries < 60) {
        tries += 1
        frame = requestAnimationFrame(tick)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      polling.delete(pollKey)
    }
  }, [debug, getNodes, diagramId])

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        // Trois cas, et un seul porteur de couleur : la sélection, sinon la
        // figure, sinon le défaut de l'application. Une couleur posée par la
        // figure est passée par `style` et non par une classe utilitaire, qu'elle
        // ne pourrait pas remplacer — la classe passerait après le style inline.
        className={
          stroke ? undefined : selected ? 'stroke-primary' : 'stroke-[var(--xy-edge-stroke-default)]'
        }
        interactionWidth={20}
        style={{
          stroke,
          strokeWidth: data.isStrong ? 2 : 1.5,
          strokeDasharray: data.isDashed ? DASH_PMO : undefined,
        }}
      />
      {debug && (
        // Portail obligatory : `BaseEdge` rend un `<path>` dans le `<svg>` de
        // React Flow, donc un `<div>` posé à côté de `BaseEdge` serait créé dans
        // le namespace SVG — un élément inconnu, sans rendu. `EdgeLabelRenderer`
        // le projette dans le conteneur des libellés, qui est du HTML et porte la
        // même transformation que le canevas : les coordonnées restent celles de
        // la figure.
        <EdgeLabelRenderer>
          <OrgBusDebug
            id={id}
            gap={gap}
            trunk={data.trunkFraction ?? 1}
            runY={runY}
            targetY={targetY}
            radius={radius}
            sourceX={sourceX}
            targetX={targetX}
            // `measured.height` est la hauteur **réellement rendue**, celle qui
            // compte : c'est elle que React Flow utilise pour poser le handle, donc
            // pour calculer `targetY`. Le plancher vient de `data.minHeight`, et
            // `node.data` est typé `unknown` à l'image de `OrgNode`, d'où le cast
            // étroit sur le seul champ lu.
            measuredHeight={targetNode?.measured?.height}
            minHeight={(targetNode?.data as { minHeight?: number } | undefined)?.minHeight}
          />
        </EdgeLabelRenderer>
      )}
    </>
  )
}

const DEBUG_STYLE = {
  position: 'absolute',
  zIndex: 900,
  pointerEvents: 'none',
} as const

/** Signature déjà journalisée, pour ne pas répéter le tableau à chaque rendu. */
const reported = new Set<string>()

/** Figures déjà sous surveillance de mesure : une seule boucle de frames chacune. */
const polling = new Set<string>()

/**
 * Tableau de mesure des hauteurs, journalisé une fois par jeu de valeurs.
 *
 * C'est l'instrument qui a servi à caler `NOM` dans la figure de l'organigramme :
 * on ne peut pas prédire la hauteur d'une boîte — celle d'un texte dépend de la
 * fonte réelle, et `min-height` n'est qu'un plancher, donc une boîte trop basse
 * grandit et décale tout ce qui s'y raccorde. Les valeurs de `NOM` sont donc des
 * **mesures**, pas un calcul ; le tableau est la procédure pour les reprendre.
 *
 * Le dépassement est la seule colonne qui compte : il vaut `mesuré − plancher`,
 * donc 0 quand le plancher tient. Une rangée où il dépasse l'entraxe de deux
 * boîtes fait se chevaucher les boîtes — le cas des services, dont l'écart est
 * faible.
 */
function reportMeasuredHeights(nodes: Node[], diagramId: string) {
  const rows = nodes.map((n) => {
    const floor = (n.data as { minHeight?: number } | undefined)?.minHeight
    const h = n.measured?.height
    return {
      id: n.id,
      plancher: floor ?? '-',
      mesure: h === undefined ? 'non mesuré' : Math.round(h),
      depassement: h === undefined || floor === undefined ? '-' : Math.round(h - floor),
    }
  })

  // La signature est calculée ici et non passée en argument : la mesure mute les
  // nœuds en place, donc un jeu identique de valeurs est le seul signe qu'il n'y
  // a rien de neuf à afficher.
  const signature = rows.map((r) => `${r.id}:${r.depassement}`).join('|')
  const key = `${diagramId}|${signature}`
  if (reported.has(key)) return
  reported.add(key)

  const overflowing = rows.filter((r) => typeof r.depassement === 'number' && r.depassement > 0)
  console.group(`[orgBus] hauteurs mesurées — ${diagramId || 'figure inconnue'}`)
  console.table(rows)
  console.log(
    overflowing.length === 0
      ? 'aucun plancher dépassé'
      : `planchers dépassés : ${overflowing.map((r) => `${r.id} +${r.depassement}`).join(', ')}`,
  )
  console.groupEnd()
}

/**
 * Overlay de debug, même contenu que celui de `RelationshipEdge` : deux points
 * sur les extrémités **résolues** et une étiquette de diagnostic.
 *
 * Il répond à la seule question que la géométrie statique ne peut pas trancher :
 * la course horizontale est à une hauteur fixe (`runY`), alors que la cible est
 * atteinte à son centre réel (`targetY`). Les deux ne coïncident que si la boîte
 * tient dans son plancher `minHeight`. Sinon `dY` est non nul, la polyligne se
 * termine par un petit segment vertical, et le raccord cesse d'être un segment
 * horizontal unique — ce qui se lit à l'œil comme un arrondi sur la face, alors
 * que la cause est une hauteur de texte que la figure ne peut pas mesurer.
 *
 * `h` compare la hauteur mesurée au plancher : c'est le diagnostic direct, et il
 * vaut pour les 23 boîtes de la figure, pas seulement pour le PMO.
 */
function OrgBusDebug({
  id,
  gap,
  trunk,
  runY,
  targetY,
  radius,
  sourceX,
  targetX,
  measuredHeight,
  minHeight,
}: {
  id: string
  gap: number
  trunk: number
  runY: number
  targetY: number
  radius: number
  sourceX: number
  targetX: number
  measuredHeight?: number
  minHeight?: number
}) {
  return (
    <>
      <div style={{ ...DEBUG_STYLE, left: sourceX - 3, top: targetY - 3, width: 6, height: 6, borderRadius: 9999, background: '#e11d48' }} />
      <div style={{ ...DEBUG_STYLE, left: targetX - 3, top: targetY - 3, width: 6, height: 6, borderRadius: 9999, background: '#e11d48' }} />
      <div
        style={{
          ...DEBUG_STYLE,
          left: sourceX + 12,
          top: runY - 26,
          fontSize: 9,
          lineHeight: 1.4,
          fontFamily: 'monospace',
          color: '#e11d48',
          background: 'rgba(255, 255, 255, 0.88)',
          border: '1px solid #e11d48',
          borderRadius: 4,
          padding: '1px 4px',
          whiteSpace: 'nowrap',
        }}
      >
        {`${id} | gap:${gap} trunk:${trunk} | runY:${Math.round(runY)} targetY:${Math.round(targetY)} | dY:${Math.round(targetY - runY)} | r:${radius} | h:${Math.round(measuredHeight ?? 0)}/${minHeight ?? '-'}`}
      </div>
    </>
  )
}
