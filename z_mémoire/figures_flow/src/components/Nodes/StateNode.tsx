import { Handle, Position } from '@xyflow/react'
import type { EntityNodeData } from '../../types'

/**
 * Machine à états générique d’une étape du pipeline (figure du mémoire) :
 * pastille de départ, états actifs en colonne centrale, états terminaux à
 * droite.
 *
 * Composant générique et réutilisable : le modèle fournit le rôle
 * (`stateKind`), la précision (`stateDesc`) et le ton (`stateTone`). Conventions
 * de schéma normatif (UML/académique) : pastille ● pleine pour le départ,
 * rectangles aux coins faiblement arrondis pour les états, **pointes de
 * flèche sur toutes les transitions** (première figure du projet à en porter —
 * sans elles, le sens du cycle est illisible). Aucune image : le vectoriel
 * pur préserve la crédibilité du schéma.
 *
 * Terminaux au langage des feuilles de la figure 4 (bordure + fond teinté,
 * nom coloré) : DÉCIDÉ vert `128`, REJETÉ rouge `0`, ABANDONNÉE / RETIRÉE
 * gris `muted`. Actifs neutres (bordure `border`, fond de page).
 *
 * `<Handle>` invisibles en `style` inline (même contournement que `OrgNode` :
 * la feuille xyflow non mise en couche bat Tailwind de 3 px). Toutes les
 * arêtes de la figure déclarent leurs handles — pas d’entrée dans les
 * familles verticales d’`edgeAnchors.ts`.
 */

const STATE_NAME_SIZE = 24
const STATE_DESC_SIZE = 20
const SMALL_NAME_SIZE = 20
const TAG_SIZE = 18

/** Même convention que les autres figures d’impression : `--org-font-scale`
 * est déjà recopiée pendant l’export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

/** Boîte nulle : l’ancre (centre de la boîte) tombe exactement sur le bord de
 * la carte, et aucune pastille n’est capturée dans le SVG exporté. */
const HANDLE_STYLE = {
  width: 0,
  height: 0,
  minWidth: 0,
  minHeight: 0,
  border: 'none',
  background: 'transparent',
} as const

const TONE: Record<NonNullable<EntityNodeData['stateTone']>, { border: string; bg: string; text: string }> = {
  kept: {
    border: 'hsl(128, 100%, 40%)',
    bg: 'rgba(0, 204, 27, 0.094)',
    text: 'hsl(128, 100%, 40%)',
  },
  rejected: {
    border: 'hsl(0, 100%, 40%)',
    bg: 'hsla(0, 100%, 50%, 0.08)',
    text: 'hsl(0, 100%, 40%)',
  },
  muted: {
    border: 'hsl(var(--muted-foreground))',
    bg: 'hsl(var(--muted))',
    text: 'hsl(var(--muted-foreground))',
  },
}

function Start({ data }: { data: EntityNodeData }) {
  return (
    <div
      data-export-root
      className="rounded-full bg-foreground"
      // `exportWidth`, pas de largeur posée ailleurs : voir le contrat.
      // `minHeight`, pas `height` : l’export force `height: auto` sur le clone,
      // ce qui écraserait une hauteur posée et viderait la pastille (aucun
      // contenu) — `min-height` survit et garantit le disque de 24 px.
      style={{ width: data.exportWidth, minHeight: data.exportWidth }}
    >
      <Handle id="bottom" type="source" position={Position.Bottom} className="nodrag nopan" style={HANDLE_STYLE} />
    </div>
  )
}

function Active({ data }: { data: EntityNodeData }) {
  return (
    <div
      data-export-root
      className="w-full rounded-lg bg-background"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      style={{ padding: '20px 24px', width: data.exportWidth, border: '1px solid hsl(var(--border))' }}
    >
      <div className="text-center leading-tight font-bold text-foreground" style={px(STATE_NAME_SIZE)}>
        {data.label}
      </div>
      {data.stateDesc && (
        <div className="text-center leading-snug text-foreground/85" style={{ ...px(STATE_DESC_SIZE), marginTop: 8 }}>
          {data.stateDesc}
        </div>
      )}
      {/* Toutes les arêtes de la figure déclarent leurs handles — pas d’entrée
        dans les familles verticales d’`edgeAnchors.ts`. `left`/`right` dans
        les DEUX types : une arête n’est pas rendue si son handle cible manque.
        Handles inutilisés invisibles (boîte nulle, figure rigide). */}
      <Handle id="top" type="target" position={Position.Top} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="left" type="target" position={Position.Left} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="right" type="target" position={Position.Right} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="bottom" type="target" position={Position.Bottom} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="bottom" type="source" position={Position.Bottom} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="left" type="source" position={Position.Left} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="right" type="source" position={Position.Right} className="nodrag nopan" style={HANDLE_STYLE} />
    </div>
  )
}

function Terminal({ data }: { data: EntityNodeData }) {
  const tone = TONE[data.stateTone ?? 'muted']
  return (
    <div
      data-export-root
      className="w-full rounded-lg"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      style={{
        padding: '16px 24px',
        width: data.exportWidth,
        border: `2px solid ${tone.border}`,
        backgroundColor: tone.bg,
      }}
    >
      <div className="text-center leading-tight font-bold" style={{ ...px(STATE_NAME_SIZE), color: tone.text }}>
        {data.label}
      </div>
      {/* Lectures dossier (`bottom` → bandeau) + arrivées latérales. */}
      <Handle id="left" type="target" position={Position.Left} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="top" type="target" position={Position.Top} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="bottom" type="source" position={Position.Bottom} className="nodrag nopan" style={HANDLE_STYLE} />
    </div>
  )
}

/**
 * Étape suivante (fantôme) : la suite du pipeline n’est pas une boîte de plus,
 * c’est le même cycle qui recommence — tracé en pointillés, comme les fantômes
 * de la figure 5. On n’entre que par le haut.
 */
function Ghost({ data }: { data: EntityNodeData }) {
  return (
    <div
      data-export-root
      className="w-full rounded-xl bg-background"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      style={{
        padding: '16px 24px',
        width: data.exportWidth,
        border: '2px dashed hsl(var(--muted-foreground))',
      }}
    >
      <div className="text-center leading-tight font-bold text-muted-foreground" style={px(SMALL_NAME_SIZE)}>
        {data.label}
      </div>
      {data.stateDesc && (
        <div className="text-center leading-snug text-foreground/85" style={{ ...px(STATE_DESC_SIZE), marginTop: 8 }}>
          {data.stateDesc}
        </div>
      )}
      <Handle id="top" type="target" position={Position.Top} className="nodrag nopan" style={HANDLE_STYLE} />
    </div>
  )
}

/**
 * Lecture dossier : pas un état moteur mais un verdict dérivé (miroirs,
 * `applicationAbandoned`, retrait). Plus petite que les terminaux, bordure en
 * tirets, ton atténué — on n’entre que par le haut.
 */
function Dossier({ data }: { data: EntityNodeData }) {
  const tone = TONE[data.stateTone ?? 'muted']
  return (
    <div
      data-export-root
      className="w-full rounded-lg bg-background"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      style={{
        padding: '12px 20px',
        width: data.exportWidth,
        border: `1.5px dashed ${tone.border}`,
      }}
    >
      <div className="text-center leading-tight font-bold" style={{ ...px(SMALL_NAME_SIZE), color: tone.text }}>
        {data.label}
      </div>
      <Handle id="top" type="target" position={Position.Top} className="nodrag nopan" style={HANDLE_STYLE} />
    </div>
  )
}

/** Étiquette de zone, sans carte ni handle (comme les libellés d’axes fig. 3). */
function ZoneTag({ data }: { data: EntityNodeData }) {
  return (
    <div
      data-export-root
      className="w-full font-bold tracking-wide text-muted-foreground"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      style={{ ...px(TAG_SIZE), width: data.exportWidth }}
    >
      {data.label}
    </div>
  )
}

export default function StateNode({ data }: { data: EntityNodeData }) {
  if (data.stateKind === 'start') return <Start data={data} />
  if (data.stateKind === 'terminal') return <Terminal data={data} />
  if (data.stateKind === 'ghost') return <Ghost data={data} />
  if (data.stateKind === 'dossier') return <Dossier data={data} />
  if (data.stateKind === 'tag') return <ZoneTag data={data} />
  return <Active data={data} />
}
