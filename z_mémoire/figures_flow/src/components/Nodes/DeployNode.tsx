import { Handle, Position } from '@xyflow/react'
import type { EntityNodeData } from '../../types'
import { hsla } from '../../utils/color'
import { Logo } from './logos'
import { FeatherIcon } from './icons'
import { HostTower, Browser, ContainerStack } from './deployArt'

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

function Art({ kind }: { kind: 'browser' | 'containers' }) {
  if (kind === 'browser') return <Browser />
  return <ContainerStack />
}

/** Le cadre hôte EST le poste, en scène verticale : l’ÉCRAN (coque bordure
 * encre 3 px, fond uni, lunette haute avec le titre centré, menton) occupe
 * le haut et contient les services ; la BANDE BUREAU (transparente) accueille
 * la ligne de bureau, le col du pied (du menton au socle) et la tour posée
 * sur la ligne — pied et tour HORS de l’écran, comme en vrai. Les services
 * finissent à 960 locaux (Compose), le menton couvre 960→1000 : grandir le
 * cadre (1000→1200, 1520→1700 pour la colonne-tour à droite) ne touche ni
 * services ni arêtes, le cadre n’est qu’un fond.
 *
 * `minHeight: inherit` : le flux (écran seul, hauteur fixe INTERNE — admise,
 * précédent `ScopeNode` fig. 2) reste sous le plancher, la scène mesure donc
 * exactement `minHeight` (invariant n°2). Cotes relevées : aucune arête sous
 * y≈1000 dans les x du pied (centre) et de la tour (gauche).
 */
const SCREEN_H = 1000
const DESK_LINE_Y = 1190 // haut de la ligne de bureau (3 px)

function HostMachine({ title }: { title?: string }) {
  return (
    <div className="relative w-full" style={{ minHeight: 'inherit' }}>
      {/* Écran : 1520 fixe, aligné à gauche — la colonne-tour (1520→1700)
        reste transparente au-dessus de la tour : la tour est À CÔTÉ de
        l’écran, pas dessous. Largeur fixe INTERNE admise (cf. commentaire). */}
      <div
        className="rounded-xl"
        style={{
          width: 1520,
          height: SCREEN_H,
          background: 'hsl(var(--muted))',
          border: '3px solid hsl(var(--foreground))',
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{ height: 76, borderBottom: '2px solid hsl(var(--foreground))', padding: '0 24px' }}
        >
          <span className="font-bold text-foreground" style={{ ...px(TITLE_SIZE), whiteSpace: 'nowrap' }}>
            {title}
          </span>
        </div>
      </div>
      {/* Ligne de bureau : jusqu’à la colonne-tour, à droite de l’écran. */}
      <div style={{ position: 'absolute', top: DESK_LINE_Y, left: 40, right: 20, height: 3, borderRadius: 2, background: 'hsl(var(--foreground))' }} />
      {/* Pied : col du menton jusqu’au socle posé sur la ligne — centré
        SOUS L’ÉCRAN (760), pas au centre du cadre (la colonne-tour
        décentrerait le moniteur de son pied). */}
      <div style={{ position: 'absolute', top: SCREEN_H, left: 760, transform: 'translateX(-50%)', width: 24, height: DESK_LINE_Y - 14 - SCREEN_H, background: 'hsl(var(--muted-foreground))' }} />
      <div style={{ position: 'absolute', top: DESK_LINE_Y - 14, left: 760, transform: 'translateX(-50%)', width: 150, height: 14, borderRadius: 7, background: 'hsl(var(--foreground))' }} />
      {/* Tour À CÔTÉ de l’écran (colonne 1520→1700), posée sur la ligne,
        affleurant le bas de l’écran (zéro recouvrement). Descente Redis
        (x≈1349) et MinIO à l’écart, relevé au plan. */}
      <div style={{ position: 'absolute', top: DESK_LINE_Y - 190, left: 1555 }}>
        <HostTower />
      </div>
    </div>
  )
}

function Frame({ data }: { data: EntityNodeData }) {
  if (data.deployArt === 'host-machine') {
    return (
      <div data-export-root className="w-full" style={{ minHeight: data.minHeight }}>
        <HostMachine title={data.deployTitle} />
      </div>
    )
  }
  const dashed = data.deployDashed === true
  // Tirets = conteneurisé : bordure sur l’accent du cadre (bleu baleine
  // exact pour Compose — retour demandeur), pas un gris neutre.
  const borderColor = dashed
    ? (data.deployAccent ?? 'hsl(var(--muted-foreground))')
    : 'hsl(var(--foreground))'
  return (
    <div
      data-export-root
      className="w-full rounded-xl border-solid bg-transparent"
      style={{
        minHeight: data.minHeight,
        borderWidth: 2,
        borderStyle: dashed ? 'dashed' : 'solid',
        borderColor,
      }}
    >
      <div className="flex items-center" style={{ padding: '20px 28px', gap: 12 }}>
        {data.deployArt && !data.deployArtAfter && <Art kind={data.deployArt} />}
        {data.deployLogo && (
          <Logo name={data.deployLogo} size={WHALE} fill={data.deployAccent ?? 'hsl(var(--foreground))'} />
        )}
        {data.deployIcon && (
          <FeatherIcon kind={data.deployIcon} size={WHALE} color="hsl(var(--foreground))" />
        )}
        <span className="font-bold text-foreground" style={{ ...px(TITLE_SIZE), whiteSpace: 'nowrap', flexShrink: 0 }}>
          {data.deployTitle}
        </span>
        {data.deployArt && data.deployArtAfter && (
          <span style={{ marginLeft: 'auto' }}>
            <Art kind={data.deployArt} />
          </span>
        )}
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
      {data.deployArt === 'browser' ? (
        <Art kind="browser" />
      ) : (
        data.deployLogo && <Logo name={data.deployLogo} size={LOGO} fill={accent} />
      )}
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
      {/* Cylindre BD à droite du texte (MySQL : dauphin à gauche, texte au
        milieu, cylindre à droite — retour demandeur, badge EXTERNE retiré).
        Teinte accent de la carte, taille miroir du logo. */}
      {data.deployIcon && (
        <FeatherIcon kind={data.deployIcon} size={LOGO} color={accent} />
      )}
      <Handle id="right" type="source" position={Position.Right} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="left" type="source" position={Position.Left} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="bottom" type="source" position={Position.Bottom} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="top" type="source" position={Position.Top} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="right" type="target" position={Position.Right} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="left" type="target" position={Position.Left} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="bottom" type="target" position={Position.Bottom} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="top" type="target" position={Position.Top} className="nodrag nopan" style={HANDLE_STYLE} />
      {/* Ancre décalée : React Flow mesure la position DOM, l’ancre tombe à
        70 % de la largeur — utilisée par l’arrivée redis (par le haut, à
        droite du titre « Docker Compose »). Le popover ne la propose pas. */}
      <Handle id="top-right" type="target" position={Position.Top} className="nodrag nopan" style={{ ...HANDLE_STYLE, left: '70%' }} />
    </div>
  )
}

export default function DeployNode({ data }: { data: EntityNodeData }) {
  if (data.deployKind === 'frame') return <Frame data={data} />
  return <Service data={data} />
}
