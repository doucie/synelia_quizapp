import type { EntityNodeData } from '../../types'

/**
 * Périmètre de projet (figure du mémoire) : un cadre composite dominant, des
 * lignes incluses mises en avant, des lignes exclues en retrait, une légende.
 *
 * Composant générique et réutilisable : le modèle fournit le titre (`label`),
 * les lignes (`scopeItems`) et le ton (`scopeTone`). Le cadre rend ses lignes
 * lui-même — un seul nœud, donc aucun risque de désalignement entre le cadre
 * et son contenu, et une seule cible d’export.
 *
 * Aucun `<Handle>` : la figure ne contient aucune arête. Les pointillés de
 * liaison vers les exclus ont été écartés au plan : six segments se liraient
 * comme des flux dans un mémoire qui utilise par ailleurs des flèches pour les
 * flux, et la secondarité suffit à marquer l’exclusion.
 */

/** Navy du mémoire (titres de `theme.typ`), en valeur verbatim. */
const NAVY = '#1a365d'
/** Vert de validation, même famille que les teintes `SAFE_HUES`. */
const CHECK = 'hsl(128, 100%, 35%)'

const TITLE_SIZE = 28
const ROW_SIZE = 24
const EXCLUDED_SIZE = 20
const CAPTION_SIZE = 20

/** Hauteurs fixes des lignes : elles garantissent des rangées strictement
 * égales. Ce sont des hauteurs *internes* au nœud, pas celle du nœud : la
 * règle « jamais de hauteur sur la carte exportée » ne s’y applique pas. */
const FRAME_ROW_HEIGHT = 66
const EXCLUDED_ROW_HEIGHT = 62
const TITLE_BAND_HEIGHT = 72

function px(value: number) {
  return {
    // Même convention que les autres figures d’impression : `--org-font-scale`
    // est déjà recopiée pendant l’export SVG.
    fontSize: `calc(var(--org-font-scale, 1) * ${value}px)`,
  }
}

function IncludedRow({ text, last }: { text: string; last: boolean }) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg"
      style={{
        height: FRAME_ROW_HEIGHT,
        padding: '0 16px',
        marginBottom: last ? 0 : 10,
        backgroundColor: 'hsla(128, 100%, 40%, 0.08)',
      }}
    >
      <span className="font-bold" style={{ ...px(ROW_SIZE), color: CHECK }}>
        ✓
      </span>
      <span className="leading-snug text-foreground" style={px(ROW_SIZE)}>
        {text}
      </span>
    </div>
  )
}

function ScopeFrame({ data }: { data: EntityNodeData }) {
  const items = data.scopeItems ?? []
  return (
    <div
      data-export-root
      className="w-full overflow-hidden rounded-xl bg-background"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      style={{ border: `3px solid ${NAVY}`, width: data.exportWidth }}
    >
      <div
        className="flex items-center justify-center text-center"
        style={{ height: TITLE_BAND_HEIGHT, backgroundColor: NAVY }}
      >
        <span className="font-semibold text-white" style={px(TITLE_SIZE)}>
          {data.label}
        </span>
      </div>
      <div style={{ padding: 24 }}>
        {items.map((item, i) => (
          <IncludedRow key={i} text={item} last={i === items.length - 1} />
        ))}
      </div>
    </div>
  )
}

function ExcludedItem({ data }: { data: EntityNodeData }) {
  return (
    <div
      data-export-root
      // Fond uni, pas `/40` : à 40 % d’opacité sur page blanche, la pill
      // devenait indiscernable du fond une fois imprimée — les boîtes, pourtant
      // de largeur égale, semblaient suivre la longueur du texte.
      className="bg-muted flex w-full items-center gap-3 rounded-lg"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      style={{ height: EXCLUDED_ROW_HEIGHT, padding: '0 16px', width: data.exportWidth }}
    >
      <span className="text-muted-foreground" style={px(EXCLUDED_SIZE)}>
        ⊘
      </span>
      {/* `/85`, comme la Figure 1 : à ~7 pt, `/75` restait difficile à lire
        dans le mémoire. La secondarité passe par la taille et le style
        romain, jamais par la pâleur. */}
      <span className="leading-snug text-foreground/85" style={px(EXCLUDED_SIZE)}>
        {data.label}
      </span>
    </div>
  )
}

export default function ScopeNode({ data }: { data: EntityNodeData }) {
  if (data.scopeKind === 'frame') return <ScopeFrame data={data} />
  if (data.scopeKind === 'caption') {
    return (
      <div
        data-export-root
        className="w-full text-center italic text-foreground/85"
        // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
        style={{ ...px(CAPTION_SIZE), width: data.exportWidth }}
      >
        {data.label}
      </div>
    )
  }
  return <ExcludedItem data={data} />
}
