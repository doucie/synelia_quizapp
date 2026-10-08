import { Handle, Position } from '@xyflow/react'
import type { EntityNodeData } from '../../types'
import { hsla } from '../../utils/color'
import { FeatherIcon } from './icons'

/**
 * Fourche d’authentification (figure du mémoire, 3.2.1) : un départ unique en
 * haut, deux colonnes d’étapes (internes / candidat), une convergence large
 * en bas. Le message est la convergence finale, pas la comparaison des chemins
 * — les étapes sont donc des lignes légères (médaillon-icône + texte), pas des
 * cartes.
 *
 * Composant générique et réutilisable : le modèle fournit le rôle (`authKind`),
 * l’icône (`authIcon`, jeu partagé `icons.tsx`) et la teinte de branche
 * (`authColor`, `210` internes / `330` candidat, cohérent fig. 1/6). La
 * convergence reste neutre (bordure encre 2 px) : colorer l’arrivée
 * réintroduirait une lecture « gagnant ».
 *
 * `<Handle>` invisibles en `style` inline (même contournement que `OrgNode` /
 * `DecisionNode`). Toutes les arêtes de la figure déclarent leurs handles —
 * pas d’entrée dans les familles verticales d’`edgeAnchors.ts`.
 */

const START_SIZE = 26
const BAND_SIZE = 20
const STEP_SIZE = 22
const MERGE_SIZE = 24
const MEDALLION = 44
const ICON = 22

/** Même convention que les autres figures d’impression : `--org-font-scale`
 * est déjà recopiée pendant l’export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

/** Boîte nulle : l’ancre tombe sur le bord de la carte, aucune pastille
 * capturée dans le SVG exporté. */
const HANDLE_STYLE = {
  width: 0,
  height: 0,
  minWidth: 0,
  minHeight: 0,
  border: 'none',
  background: 'transparent',
} as const

function Start({ data }: { data: EntityNodeData }) {
  return (
    <div
      data-export-root
      className="bg-muted w-full rounded-full"
      style={{ padding: '20px 32px', width: data.exportWidth, textAlign: 'center' }}
    >
      <span className="font-bold text-foreground" style={px(START_SIZE)}>
        {data.label}
      </span>
      <Handle id="bottom" type="source" position={Position.Bottom} className="nodrag nopan" style={HANDLE_STYLE} />
    </div>
  )
}

function Band({ data }: { data: EntityNodeData }) {
  const color = data.authColor ?? 'hsl(var(--foreground))'
  return (
    <div
      data-export-root
      className="w-full rounded-full border-solid"
      style={{
        padding: '12px 24px',
        width: data.exportWidth,
        textAlign: 'center',
        // Blanc opaque version thème (pas `#ffffff` figé : blanc sur blanc en
        // dark mode) + bordure 2 px couleur de branche : le bandeau se
        // distingue des étapes teintées et porte son statut d’en-tête.
        backgroundColor: 'hsl(var(--background))',
        borderWidth: 2,
        borderColor: color,
      }}
    >
      <span className="font-bold tracking-wide" style={{ ...px(BAND_SIZE), color }}>
        {data.label}
      </span>
    </div>
  )
}

function Step({ data }: { data: EntityNodeData }) {
  const color = data.authColor ?? 'hsl(var(--foreground))'
  return (
    <div
      data-export-root
      className="flex w-full items-center rounded-xl border border-solid"
      style={{
        padding: '16px 20px',
        gap: 16,
        width: data.exportWidth,
        minHeight: data.minHeight,
        borderColor: hsla(data.authColor, 0.35),
        backgroundColor: hsla(data.authColor, 0.06),
      }}
    >
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{
          width: MEDALLION,
          height: MEDALLION,
          flexShrink: 0,
          backgroundColor: hsla(data.authColor, 0.14),
          color,
        }}
      >
        {data.authIcon && <FeatherIcon kind={data.authIcon} size={ICON} />}
      </span>
      <span className="leading-snug font-semibold" style={{ ...px(STEP_SIZE), color }}>
        {data.label}
      </span>
      <Handle id="top" type="target" position={Position.Top} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="bottom" type="source" position={Position.Bottom} className="nodrag nopan" style={HANDLE_STYLE} />
    </div>
  )
}

function Merge({ data }: { data: EntityNodeData }) {
  return (
    <div
      data-export-root
      className="w-full rounded-xl border-solid bg-background"
      style={{
        padding: '24px 32px',
        width: data.exportWidth,
        minHeight: data.minHeight,
        textAlign: 'center',
        borderWidth: 2,
        borderColor: 'hsl(var(--foreground))',
      }}
    >
      <span className="font-bold text-foreground" style={px(MERGE_SIZE)}>
        {data.label}
      </span>
      <Handle id="top" type="target" position={Position.Top} className="nodrag nopan" style={HANDLE_STYLE} />
    </div>
  )
}

export default function AuthNode({ data }: { data: EntityNodeData }) {
  switch (data.authKind) {
    case 'band':
      return <Band data={data} />
    case 'step':
      return <Step data={data} />
    case 'merge':
      return <Merge data={data} />
    case 'start':
    default:
      return <Start data={data} />
  }
}
