import { Handle, Position } from '@xyflow/react'
import type { EntityNodeData } from '../../types'
import { hsla } from '../../utils/color'
import { FeatherIcon } from './icons'

/**
 * Correspondance notifications (figure du mémoire, 3.2.7) : événements métier
 * à gauche (boîtes grises neutres), canaux à droite (boîtes plus grandes,
 * accentuées), reliés par des courbes de Bézier qui se croisent au centre —
 * le « chargé » du milieu illustre le flux multiple vers peu de canaux.
 *
 * Composant générique et réutilisable : le modèle fournit le rôle
 * (`notifKind`), l’icône du canal (`notifIcon`, jeu partagé `icons.tsx`) et
 * son accent (`notifColor`, in-app `210` / email `330`, cohérent fig. 8).
 * L’exception (défaut de configuration critique → in-app seul, pointillé +
 * pastille) est portée par l’arête, pas par le nœud : les 6 événements
 * restent visuellement identiques.
 *
 * `<Handle>` invisibles en `style` inline (même contournement que `OrgNode` /
 * `DecisionNode`). Toutes les arêtes de la figure déclarent leurs handles —
 * pas d’entrée dans les familles verticales d’`edgeAnchors.ts`.
 */

const EVENT_SIZE = 20
const CHANNEL_NAME_SIZE = 26
const CAPTION_SIZE = 18
const MEDALLION = 56
const ICON = 28

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

function Event({ data }: { data: EntityNodeData }) {
  return (
    <div
      data-export-root
      className="bg-muted flex w-full items-center rounded-xl"
      style={{
        padding: '16px 20px',
        width: data.exportWidth,
        minHeight: data.minHeight,
      }}
    >
      <span className="leading-snug font-semibold text-foreground" style={px(EVENT_SIZE)}>
        {data.label}
      </span>
      <Handle id="right" type="source" position={Position.Right} className="nodrag nopan" style={HANDLE_STYLE} />
    </div>
  )
}

function Channel({ data }: { data: EntityNodeData }) {
  const color = data.notifColor ?? 'hsl(var(--foreground))'
  return (
    <div
      data-export-root
      className="flex w-full items-center rounded-xl border border-solid"
      style={{
        padding: '20px 24px',
        gap: 20,
        width: data.exportWidth,
        minHeight: data.minHeight,
        borderColor: hsla(data.notifColor, 0.35),
        backgroundColor: hsla(data.notifColor, 0.06),
      }}
    >
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{
          width: MEDALLION,
          height: MEDALLION,
          flexShrink: 0,
          backgroundColor: hsla(data.notifColor, 0.14),
          color,
        }}
      >
        {data.notifIcon && <FeatherIcon kind={data.notifIcon} size={ICON} />}
      </span>
      <span className="leading-snug font-bold" style={{ ...px(CHANNEL_NAME_SIZE), color }}>
        {data.label}
      </span>
      <Handle id="left" type="target" position={Position.Left} className="nodrag nopan" style={HANDLE_STYLE} />
    </div>
  )
}

function Caption({ data }: { data: EntityNodeData }) {
  return (
    <div data-export-root className="w-full" style={{ width: data.exportWidth }}>
      <span className="leading-snug text-foreground/85 italic" style={px(CAPTION_SIZE)}>
        {data.label}
      </span>
    </div>
  )
}

export default function NotifNode({ data }: { data: EntityNodeData }) {
  switch (data.notifKind) {
    case 'channel':
      return <Channel data={data} />
    case 'caption':
      return <Caption data={data} />
    case 'event':
    default:
      return <Event data={data} />
  }
}
