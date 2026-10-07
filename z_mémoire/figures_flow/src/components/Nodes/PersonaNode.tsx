import type { EntityNodeData } from '../../types'
import { PersonaAvatar, AVATAR_TINT } from './avatars'

/**
 * Fiches persona des parties prenantes (figure du mémoire) : avatar illustré,
 * nom du rôle, trois blocs (attentes / risque métier / conséquence conception).
 *
 * Composant générique et réutilisable : le modèle fournit l’avatar
 * (`personaAvatar`), la teinte du rôle (`personaColor`, teintes fig. 1 :
 * SA `210`, A `240`, R `285`, C `330`) et les trois textes verbatim du tableau
 * 3.1.1. Les quatre cartes partagent exactement la même structure et le même
 * `minHeight` (le plus haut mesuré) — seul le contenu change.
 *
 * Blocs au langage `QuadTag` (barre latérale 4 px + label majuscules + texte),
 * barre teintée par rôle : l’identité du rôle porte la couleur, les blocs se
 * distinguent par label et icône. Icônes Feather (MIT) inline : `star`
 * (attentes), `alert-triangle` (risque), `settings` (conception).
 * Avatars DiceBear « Notionists » (CC0), voir `avatars.tsx`.
 *
 * Aucun `<Handle>` : la figure ne contient aucune arête.
 */

const ROLE_SIZE = 28
const BLOCK_LABEL_SIZE = 18
const BLOCK_TEXT_SIZE = 20
const AVATAR_SIZE = 120
const ICON_SIZE = 20

/** Même convention que les autres figures d’impression : `--org-font-scale`
 * est déjà recopiée pendant l’export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

function Icon({ kind, color }: { kind: 'star' | 'alert' | 'settings'; color: string }) {
  const body =
    kind === 'star' ? (
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    ) : kind === 'alert' ? (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ) : (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    )
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      style={{ flexShrink: 0, color }}
    >
      {body}
    </svg>
  )
}

function Block({
  label,
  icon,
  text,
  color,
}: {
  label: string
  icon: 'star' | 'alert' | 'settings'
  text?: string
  color: string
}) {
  return (
    <div className="flex gap-3">
      {/* Liseré teinte du rôle, comme les tags de la figure 3. */}
      <div style={{ width: 4, borderRadius: 2, backgroundColor: color, flexShrink: 0 }} />
      <div className="flex min-w-0 flex-col gap-1">
        <span
          className="flex items-center gap-2 font-bold tracking-wide"
          style={{ ...px(BLOCK_LABEL_SIZE), color }}
        >
          <Icon kind={icon} color={color} />
          {label}
        </span>
        <span className="leading-snug text-foreground/85" style={px(BLOCK_TEXT_SIZE)}>
          {text}
        </span>
      </div>
    </div>
  )
}

export default function PersonaNode({ data }: { data: EntityNodeData }) {
  const color = data.personaColor ?? 'hsl(var(--foreground))'
  return (
    <div
      data-export-root
      className="flex w-full flex-col items-center gap-5 rounded-2xl bg-background"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      // `minHeight`, pas `height` : l’export abandonne les hauteurs posées.
      // Même plancher aux 4 cartes (le plus haut mesuré) : structure identique.
      style={{
        padding: '28px 32px',
        width: data.exportWidth,
        minHeight: data.minHeight,
        border: '1px solid hsl(var(--border))',
      }}
    >
      {/* Pastille teintée + avatar : le fond du SVG est déjà à la teinte,
        la pastille prolonge la même teinte en anneau (voir `AVATAR_TINT`). */}
      <span
        className="flex items-center justify-center overflow-hidden rounded-full"
        style={{
          width: AVATAR_SIZE + 24,
          height: AVATAR_SIZE + 24,
          backgroundColor: AVATAR_TINT[data.personaAvatar ?? 'candidat'],
        }}
      >
        <PersonaAvatar name={data.personaAvatar ?? 'candidat'} size={AVATAR_SIZE} />
      </span>
      <span className="text-center leading-tight font-bold" style={{ ...px(ROLE_SIZE), color }}>
        {data.label}
      </span>
      <span className="flex w-full flex-col gap-4">
        <Block label="Attentes" icon="star" text={data.personaAttentes} color={color} />
        <Block label="Risque métier" icon="alert" text={data.personaRisque} color={color} />
        <Block label="Conséquence conception" icon="settings" text={data.personaConception} color={color} />
      </span>
    </div>
  )
}
