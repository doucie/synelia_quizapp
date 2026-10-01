import { Lock, LockOpen, Move } from 'lucide-react'
import type { DiagramSection } from '../types'

/** Marge (px) entre la boîte des nœuds et le trait du cadre. */
export const FRAME_PAD = 16

export interface FrameBox {
  section: DiagramSection
  x: number
  y: number
  w: number
  h: number
  /** Teinte reprise de la couleur des cartes du traitement (`.treatment-frame`). */
  hue: number
  locked: boolean
  /** Cadre en survol (transitoire). */
  hovered: boolean
  /** Cadre persistant (dernier traitement cliqué ou déplacé). */
  focused: boolean
}

type HoverHandlers = {
  onHoverEnter: (prefix: string) => void
  onHoverLeave: () => void
}

interface TreatmentFramesProps extends HoverHandlers {
  frames: FrameBox[]
  onFocus: (prefix: string) => void
  /**
   * Le cadre capte le pointeur pour le survol, mais il couvrirait alors la
   * surface du canvas et interdirait d'y déplacer la vue au glisser. On relaie
   * donc le geste de panoramique à React Flow.
   */
  onPanStart: (e: React.PointerEvent<HTMLElement>) => void
}

const frameStyle = (f: FrameBox): React.CSSProperties =>
  ({ left: f.x, top: f.y, width: f.w, height: f.h, '--treatment-hue': f.hue }) as React.CSSProperties

/**
 * Encadrements des traitements, en surimpression du canvas.
 *
 * Le composant ne rend **que** les boîtes : le badge et les deux icônes vivent
 * dans une seconde couche (`TreatmentFrameControls`) au-dessus des nœuds, sinon
 * les cartes les masqueraient — et placées au-dessus du canvas, les boîtes
 * avaleront les clics destinés aux nœuds. Voir `DiagramCanvas` pour le montage.
 *
 * Le corps de la boîte capte le pointeur : c'est ce qui fait que l'encadrement
 * reste visible quand on traverse la gouttière entre deux cartes d'un même
 * traitement, et pas seulement quand on survole une carte.
 */
export default function TreatmentFrames({
  frames,
  onHoverEnter,
  onHoverLeave,
  onFocus,
  onPanStart,
}: TreatmentFramesProps) {
  return (
    <>
      {frames.map((f) => (
        <div
          key={f.section.id}
          className="treatment-frame"
          data-treatment={f.section.prefix}
          data-hovered={f.hovered || undefined}
          data-focused={f.focused || undefined}
          style={frameStyle(f)}
          onMouseEnter={() => onHoverEnter(f.section.prefix)}
          onMouseLeave={onHoverLeave}
          onPointerDown={onPanStart}
          onClick={() => onFocus(f.section.prefix)}
        />
      ))}
    </>
  )
}

interface TreatmentFrameControlsProps extends HoverHandlers {
  frames: FrameBox[]
  /** Enregistre la rangée montée pour que `DiagramCanvas` puisse la positionner. */
  registerOverlay: (id: string, el: HTMLDivElement | null) => void
  onToggleLock: (section: DiagramSection) => void
  onMoveStart: (e: React.PointerEvent<HTMLElement>, prefix: string) => void
}

/**
 * Le badge et les deux icônes d'un encadrement : « déplacer le traitement » et
 * « verrouiller ».
 *
 * Couche au-dessus des nœuds (z-index élevé) pour rester cliquables, d'où le
 * `onHoverEnter` / `onHoverLeave` câblés des deux côtés : le survol ne doit pas
 * disparaître quand le pointeur passe du cadre à son bouton, deux éléments
 * distincts que le délai du `useStickyHover` couvre.
 *
 * Chaque traitement est rendu dans une rangée unique — le badge `T0` à gauche, les
 * deux icônes à droite — dont la position et la largeur sont écrites en JS
 * (`applyControlsLayout`), en px écran : rien ici ne dépend du zoom, et rien n'est
 * masqué quel que soit le zoom. Le nom complet du traitement n'est pas repris : au
 * zoom d'ensemble d'une figure combinée, le cadre le plus étroit ne fait que ~39 px
 * de large, et l'id suffit à l'identifier.
 *
 * La rangée n'existe que pour le traitement survolé ou focalisé : au repos un
 * traitement n'a aucun trait, ses icônes n'auraient donc rien à quoi s'accrocher et
 * flotteraient sur la figure. Un traitement *verrouillé* n'y échappe pas — une puce
 * cadenas isolée se litrait comme un élément détaché, sans lien avec son traitement.
 * Il reste donc déverrouillable : le cadre transparent capte toujours le pointeur
 * (`.treatment-frame` est en `pointer-events: auto`), donc le survol fait réapparaître
 * cadre et icônes.
 */
export function TreatmentFrameControls({
  frames,
  registerOverlay,
  onHoverEnter,
  onHoverLeave,
  onToggleLock,
  onMoveStart,
}: TreatmentFrameControlsProps) {
  return (
    <>
      {frames
        .filter((f) => f.hovered || f.focused)
        .map((f) => (
        <div
          key={f.section.id}
          ref={(el) => registerOverlay(f.section.id, el)}
          className="treatment-overlay"
          data-treatment={f.section.prefix}
        >
          <span className="treatment-badge">{f.section.id}</span>
          <div
            className="treatment-controls"
            onMouseEnter={() => onHoverEnter(f.section.prefix)}
            onMouseLeave={onHoverLeave}
          >
            <button
              type="button"
              className="treatment-btn treatment-btn--move"
              title="Déplacer le traitement entier"
              aria-label={`Déplacer le traitement ${f.section.id}`}
              onPointerDown={(e) => onMoveStart(e, f.section.prefix)}
            >
              <Move size={14} />
            </button>
            <button
              type="button"
              className="treatment-btn"
              data-variant={f.locked ? 'locked' : 'unlocked'}
              title={
                f.locked
                  ? 'Déverrouiller — déplacer les éléments séparément'
                  : 'Verrouiller — déplacer le traitement entier'
              }
              aria-label={
                f.locked
                  ? `Déverrouiller le traitement ${f.section.id}`
                  : `Verrouiller le traitement ${f.section.id}`
              }
              onClick={() => onToggleLock(f.section)}
            >
              {f.locked ? <Lock size={14} /> : <LockOpen size={14} />}
            </button>
          </div>
        </div>
        ))}
    </>
  )
}
