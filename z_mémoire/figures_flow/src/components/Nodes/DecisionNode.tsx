import { Handle, Position } from '@xyflow/react'
import type { EntityNodeData } from '../../types'
import { Logo, LOGO_BRAND } from './logos'

/**
 * Arbre de décision du choix du SGBD (figure du mémoire) : questions binaires
 * en bulles neutres, feuilles écartées en retrait à gauche, MySQL 8 retenu en
 * bas au centre, plus grand et en vert.
 *
 * Composant générique et réutilisable : le modèle fournit le rôle
 * (`decisionKind`), le logo (`decisionLogo`) et le justificatif
 * (`decisionNote`). Les logos sont des SVG **inline** (paths Simple Icons,
 * CC0, usage nominatif dans une figure comparative) : aucune `<img>`, donc
 * aucun risque réseau/CORS pendant l’export — le raster clone du DOM et les
 * logos en font partie. La version grisée des écartés est un `fill`
 * explicite (`currentColor` sous `text-muted-foreground`), pas un filtre CSS,
 * dont le rendu dans le clone de capture n’est pas garanti.
 *
 * `<Handle>` invisibles en `style` inline (même contournement que `OrgNode` :
 * la feuille xyflow non mise en couche bat Tailwind de 3 px) : `top` en cible
 * partout, `bottom` en source sur les questions. Toutes les arêtes de la
 * figure déclarent leurs handles, le défaut d’ancrage ne s’applique donc
 * jamais — pas d’entrée dans les familles verticales d’`edgeAnchors.ts`,
 * réservées au MCT et à l’organigramme.
 */

/** Logos : paths partagés dans `logos.tsx` (aussi utilisés par la tour). */

/** Vert safe hue de validation (valeurs exactes du mémoire). */
const KEPT = 'hsl(128, 100%, 40%)'
const KEPT_BG = 'rgba(0, 204, 27, 0.094)'

const QUESTION_SIZE = 24
const LEAF_NAME_SIZE = 24
const LEAF_NOTE_SIZE = 20
const TAG_SIZE = 18
const KEPT_NAME_SIZE = 28
const ANSWER_SIZE = 22

/** Même convention que les autres figures d’impression : `--org-font-scale`
 * est déjà recopiée pendant l’export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

/** Boîte nulle : l’ancre (centre de la boîte) tombe exactement sur le bord de
 * la carte, et aucune pastille n’est capturée dans le SVG exporté. Même
 * contournement que `OrgNode` : style inline, seul niveau qui bat la feuille
 * xyflow non mise en couche. */
const HANDLE_STYLE = {
  width: 0,
  height: 0,
  minWidth: 0,
  minHeight: 0,
  border: 'none',
  background: 'transparent',
} as const

function Tag({ kept }: { kept?: boolean }) {
  return (
    <span
      className="font-bold tracking-wide"
      style={{
        ...px(TAG_SIZE),
        padding: '2px 10px',
        borderRadius: 9999,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        ...(kept
          ? { backgroundColor: KEPT, color: '#ffffff' }
          : {
              border: '1px solid',
              borderColor: 'hsl(var(--muted-foreground))',
              color: 'hsl(var(--muted-foreground))',
            }),
      }}
    >
      {kept ? (
        <>
          RETENU
          {/* Check SVG inline, pas « ✓ » : `currentColor` (blanc sur vert). */}
          <svg width={TAG_SIZE} height={TAG_SIZE} viewBox="0 0 24 24" role="img" aria-label="retenu">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </>
      ) : (
        'ÉCARTÉ'
      )}
    </span>
  )
}

function Question({ data }: { data: EntityNodeData }) {
  return (
    <div
      data-export-root
      className="bg-muted w-full rounded-xl"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      style={{ padding: '20px 24px', width: data.exportWidth }}
    >
      <span className="leading-snug font-semibold text-foreground" style={px(QUESTION_SIZE)}>
        {data.label}
      </span>
      {/* Question : on sort par le bas, on entre par le haut — même ordre que
        la famille verticale d’`edgeAnchors.ts`, sans y entrer (toutes les
        arêtes de la figure déclarent leurs handles). */}
      <Handle id="bottom" type="source" position={Position.Bottom} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="top" type="target" position={Position.Top} className="nodrag nopan" style={HANDLE_STYLE} />
    </div>
  )
}

function Leaf({ data, kept }: { data: EntityNodeData; kept?: boolean }) {
  const logo = data.decisionLogo ?? 'mysql'
  return (
    <div
      data-export-root
      className="w-full rounded-xl bg-background"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      style={{
        padding: kept ? '24px 28px' : '20px 24px',
        width: data.exportWidth,
        // Écartées : `2px muted` — le `1px border` (95 % de clarté en clair)
        // se fondait dans la page blanche. Même famille que le tag ÉCARTÉ.
        border: kept ? `3px solid ${KEPT}` : '2px solid hsl(var(--muted-foreground))',
        backgroundColor: kept ? KEPT_BG : undefined,
      }}
    >
      <div className="flex items-center gap-4">
        <Logo
          name={logo}
          size={kept ? 56 : 40}
          fill={kept ? LOGO_BRAND[logo] : 'currentColor'}
          className={kept ? undefined : 'text-muted-foreground'}
        />
        <span className="leading-tight font-bold text-foreground" style={px(kept ? KEPT_NAME_SIZE : LEAF_NAME_SIZE)}>
          {data.label}
        </span>
        <span style={{ marginLeft: 'auto' }}>
          <Tag kept={kept} />
        </span>
      </div>
      {data.decisionNote && (
        <div className="leading-snug text-foreground/85" style={{ ...px(LEAF_NOTE_SIZE), marginTop: 12 }}>
          {data.decisionNote}
        </div>
      )}
      {/* Feuille : on n’entre que par le haut. */}
      <Handle id="top" type="target" position={Position.Top} className="nodrag nopan" style={HANDLE_STYLE} />
    </div>
  )
}

export default function DecisionNode({ data }: { data: EntityNodeData }) {
  if (data.decisionKind === 'out') return <Leaf data={data} />
  if (data.decisionKind === 'kept') return <Leaf data={data} kept />
  if (data.decisionKind === 'answer') return <Answer data={data} />
  return <Question data={data} />
}

/**
 * Réponse à une question : la pastille « Oui » / « Non » est un vrai nœud, pas
 * une étiquette d’arête. C’est elle qui porte les deux issues (la feuille
 * écartée et la suite) : la question n’a qu’une seule liaison, vers sa
 * réponse. Handles `top` en cible, `bottom` (suite) et `left` (écart) en
 * source — tous déclarés par les arêtes, pas d’entrée dans les familles
 * verticales d’`edgeAnchors.ts`.
 */
function Answer({ data }: { data: EntityNodeData }) {
  return (
    <div
      data-export-root
      className="w-full rounded-full bg-background"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      // Bordure `muted` comme les écartées : `border` (95 % de clarté) serait
      // invisible sur page blanche.
      style={{
        padding: '10px 28px',
        width: data.exportWidth,
        border: '2px solid hsl(var(--muted-foreground))',
      }}
    >
      <div className="text-center font-bold text-foreground" style={px(ANSWER_SIZE)}>
        {data.label}
      </div>
      <Handle id="bottom" type="source" position={Position.Bottom} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="left" type="source" position={Position.Left} className="nodrag nopan" style={HANDLE_STYLE} />
      <Handle id="top" type="target" position={Position.Top} className="nodrag nopan" style={HANDLE_STYLE} />
    </div>
  )
}
