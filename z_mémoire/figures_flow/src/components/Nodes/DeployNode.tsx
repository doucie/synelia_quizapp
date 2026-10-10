import { Handle, Position } from '@xyflow/react'
import type { EntityNodeData } from '../../types'
import { hsla } from '../../utils/color'
import { Logo } from './logos'

/**
 * Topologie de déploiement local (figure du mémoire, 6.6) : cadres hôte
 * (plein) et Compose (pointillé, conteneurisé) + 5 services (logo, nom, port
 * en évidence). Le trait plein/pointillé porte le sens « natif vs
 * conteneurisé », pas le fond.
 *
 * Deux rôles (`deployKind`) : `frame` (taille FIXE via `style.width` +
 * `minHeight` exact — le contenu, un simple titre, est toujours plus petit ;
 * rendu avant les services pour le z-order, sans `<Handle>`) et `service`
 * (logo 44 + nom 22 gras + port mono 26 teinte + note/badge). Tous les
 * handles des services sont déclarés : pas d’entrée dans les familles
 * verticales d’`edgeAnchors.ts`.
 *
 * Mono = stack système (pas de fonte custom : la mesure au harness EST la
 * vérité d’export).
 */

const TITLE_SIZE = 22
const NAME_SIZE = 22
// 24, pas 26 : `:9000 / 9001` en mono 26 passait sur 2 lignes dans 350 px
// (13 car. × ~21 px > 238 px utiles, relevé au harness).
const PORT_SIZE = 24
const NOTE_SIZE = 16
const BADGE_SIZE = 14
const LOGO = 44
const WHALE = 28

const MONO = "ui-monospace, 'Cascadia Mono', Menlo, Consolas, monospace"

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

function Frame({ data }: { data: EntityNodeData }) {
  const dashed = data.deployDashed === true
  return (
    <div
      data-export-root
      className="w-full rounded-xl border-solid bg-transparent"
      style={{
        minHeight: data.minHeight,
        borderWidth: 2,
        borderStyle: dashed ? 'dashed' : 'solid',
        borderColor: dashed ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))',
      }}
    >
      <div className="flex items-center" style={{ padding: '20px 28px', gap: 12 }}>
        {data.deployLogo && (
          <Logo name={data.deployLogo} size={WHALE} fill={data.deployAccent ?? 'hsl(var(--foreground))'} />
        )}
        <span className="font-bold text-foreground" style={px(TITLE_SIZE)}>
          {data.deployTitle}
        </span>
      </div>
    </div>
  )
}

function Service({ data }: { data: EntityNodeData }) {
  const accent = data.deployAccent ?? 'hsl(var(--foreground))'
  return (
    <div
      data-export-root
      className="flex w-full items-center rounded-xl border border-solid bg-background"
      style={{
        padding: '20px 24px',
        gap: 20,
        width: data.exportWidth,
        minHeight: data.minHeight,
        // `border-border` (95 %) invisible à l’impression : contour teinte
        // `0.35`, langage des étapes fig. 8.
        borderColor: hsla(data.deployAccent, 0.35),
      }}
    >
      {data.deployLogo && <Logo name={data.deployLogo} size={LOGO} fill={accent} />}
      <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 4 }}>
        <span className="font-bold text-foreground" style={px(NAME_SIZE)}>
          {data.label}
        </span>
        {data.deployPort && (
          <span className="font-bold" style={{ ...px(PORT_SIZE), fontFamily: MONO, color: accent }}>
            {data.deployPort}
          </span>
        )}
        {data.deployNote && (
          <span className="text-muted-foreground" style={px(NOTE_SIZE)}>
            {data.deployNote}
          </span>
        )}
      </div>
      {data.deployBadge && (
        <span
          className="font-bold tracking-wide"
          style={{
            ...px(BADGE_SIZE),
            padding: '4px 12px',
            borderRadius: 9999,
            whiteSpace: 'nowrap',
            border: '1px solid',
            borderColor: 'hsl(var(--muted-foreground))',
            color: 'hsl(var(--muted-foreground))',
            alignSelf: 'flex-start',
          }}
        >
          {data.deployBadge}
        </span>
      )}
      <Handle id="right" type="source" position={Position.Right} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="left" type="target" position={Position.Left} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="bottom" type="source" position={Position.Bottom} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="top" type="target" position={Position.Top} className="nodrag nopan" style={HANDLE_STYLE} />
    </div>
  )
}

export default function DeployNode({ data }: { data: EntityNodeData }) {
  if (data.deployKind === 'frame') return <Frame data={data} />
  return <Service data={data} />
}
