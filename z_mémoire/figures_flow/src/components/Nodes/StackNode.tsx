import type { EntityNodeData } from '../../types'
import { Logo } from './logos'

/**
 * Tour de la pile technique (figure du mémoire) : quatre couches retenues
 * empilées (Frontend → Backend → Migrations → Base de données), un bandeau
 * transversal pour le style REST, une légende pour ses alternatives.
 *
 * Composant générique et réutilisable : le modèle fournit le rôle
 * (`stackKind`), le logo (`stackLogo`), l’accent (`stackColor`), la raison
 * (`stackReason`) et les fantômes (`stackGhosts`).
 *
 * Couleurs : un accent SAFE_HUES par couche (Angular `335` comme la figure 3,
 * MySQL `128` comme la figure 4, Spring `100`, Flyway `0`), logos recolorés
 * uniformément — jamais un mélange marque/noir. Les fantômes restent en
 * retrait (petites puces `muted`, sans bordure, **sans barré** : barré =
 * illisible + connotation d’erreur) : ce ne sont que des traces du
 * raisonnement des figures précédentes, pas des options concurrentes.
 *
 * Aucun `<Handle>` : la figure ne contient aucune arête, comme les figures
 * 1-3. Le bandeau tient sa hauteur d’un `minHeight` calculé (4 couches +
 * 3 gouttières) : `min-height` survit au `clone.style.height = 'auto'` de
 * l’export, contrairement à `height` — et les couches ont elles-mêmes un
 * `minHeight` égal, donc le total est exact, pas estimé.
 */

const NAME_SIZE = 28
const REASON_SIZE = 20
const GHOST_SIZE = 18
const BAND_SIZE = 20
const CAPTION_SIZE = 20

const LOGO_SIZE = 48
const LAYER_MIN_HEIGHT = 150
const LAYER_GAP = 20

/** Même convention que les autres figures d’impression : `--org-font-scale`
 * est déjà recopiée pendant l’export SVG. */
function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

function Layer({ data }: { data: EntityNodeData }) {
  const color = data.stackColor ?? 'hsl(var(--foreground))'
  const ghosts = data.stackGhosts ?? []
  return (
    <div
      data-export-root
      className="flex w-full items-center gap-6 rounded-xl bg-background"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      // `minHeight`, pas `height` : l’export abandonne les hauteurs posées.
      style={{
        padding: '20px 28px',
        width: data.exportWidth,
        minHeight: LAYER_MIN_HEIGHT,
        border: '1px solid hsl(var(--border))',
      }}
    >
      <Logo name={data.stackLogo ?? 'mysql'} size={LOGO_SIZE} fill={color} />
      <span className="leading-tight font-bold whitespace-nowrap" style={{ ...px(NAME_SIZE), color }}>
        {data.label}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2" style={{ marginLeft: 'auto' }}>
        {data.stackReason && (
          <span className="leading-snug text-foreground/85" style={px(REASON_SIZE)}>
            {data.stackReason}
          </span>
        )}
        {ghosts.length > 0 && (
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground" style={px(GHOST_SIZE)}>
              Écartés :
            </span>
            {ghosts.map((g) => (
              <span
                key={g}
                className="bg-muted text-muted-foreground rounded-full whitespace-nowrap"
                style={{ ...px(GHOST_SIZE), padding: '2px 10px' }}
              >
                {g}
              </span>
            ))}
          </span>
        )}
      </span>
    </div>
  )
}

function Band({ data, height }: { data: EntityNodeData; height: number }) {
  return (
    <div
      data-export-root
      className="bg-muted flex w-full items-center justify-center rounded-xl"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      // Hauteur exacte par `minHeight` (cf. contrat du module) : les 4 couches
      // et leurs 3 gouttières, mêmes constantes que le modèle (`tour_stack`).
      style={{ width: data.exportWidth, minHeight: height }}
    >
      <span
        className="font-semibold text-foreground/85"
        style={{ ...px(BAND_SIZE), writingMode: 'vertical-rl' }}
      >
        {data.label}
      </span>
    </div>
  )
}

export default function StackNode({ data }: { data: EntityNodeData }) {
  if (data.stackKind === 'band') {
    // 4 couches + 3 gouttières, mêmes constantes que le modèle (`tour_stack`).
    return <Band data={data} height={4 * LAYER_MIN_HEIGHT + 3 * LAYER_GAP} />
  }
  if (data.stackKind === 'caption') {
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
  return <Layer data={data} />
}
