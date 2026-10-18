import type { EntityNodeData } from '../../types'

/**
 * Figure 4 — Vraie pyramide des objectifs (§1.4.1) : 3 objectifs généraux du
 * texte s'étagent du socle vers le sommet (digitaliser → automatiser →
 * collaborer) et l'apex dépasse la liste : « Piloter par la donnée »,
 * annoté `perspective` (cf. perspectives du mémoire). La forme du triangle
 * porte le sens — plus de colonne de cartes ni de légende (décisions
 * utilisateur v2 : vraie pyramide, apex perspective).
 *
 * Motif `MoscowNode` (clip-path en %, racine étirée… ici une seule colonne :
 * l'axe MATURITÉ à gauche, la pyramide centrée) ; jamais `height`,
 * `exportWidth` px inline, corps `calc(var(--org-font-scale,1)*Npx)`,
 * `tinted()` = `color-mix` (jamais `hsla` sur `var()`). L'apex (bande la plus
 * étroite) ancre son texte tout en bas de la bande ; les autres bandes
 * centrent à ~56 %.
 */

const TITLE_SIZE = 17
const LINE_SIZE = 12
const NOTE_SIZE = 10.5
const AXIS_SIZE = 15

/** Demi-largeur de chaque bande : de 0 % (apex) à 50 % (base). */
function bandClip(i: number): string {
  const topHalf = 12.5 * i
  const bottomHalf = 12.5 * (i + 1)
  return `polygon(${50 - topHalf}% 0%, ${50 + topHalf}% 0%, ${50 + bottomHalf}% 100%, ${50 - bottomHalf}% 100%)`
}

function px(value: number) {
  return { fontSize: `calc(var(--org-font-scale, 1) * ${value}px)` }
}

export default function ObjectifsPyramidNode({ data }: { data: EntityNodeData }) {
  const levels = data.objPyrLevels ?? []
  return (
    <div data-export-root className="flex w-full items-stretch justify-center" style={{ width: data.exportWidth, gap: 16 }}>
      {/* Axe de maturité : flèche en haut, libellé vertical bas → haut. */}
      <div className="flex shrink-0 flex-col items-center" style={{ width: 28, padding: '2px 0' }}>
        <svg width={12} height={9} viewBox="0 0 12 9" style={{ display: 'block' }}>
          <polygon points="6,0 0,9 12,9" fill="var(--fig-frame)" />
        </svg>
        <div className="flex-1" style={{ width: 1.8, backgroundColor: 'var(--fig-frame)', margin: '3px 0' }} />
        <span
          className="font-semibold"
          style={{
            ...px(AXIS_SIZE),
            color: 'var(--fig-frame)',
            letterSpacing: 2,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            margin: '4px 0',
          }}
        >
          MATURITÉ
        </span>
      </div>

      {/* Pyramide : 4 bandes égales en `flex: 1`, découpées en pourcentages. */}
      <div className="flex flex-col" style={{ width: 660 }}>
        {levels.map((lv, i) => (
          <div
            key={lv.title}
            className="relative flex min-w-0 justify-center"
            style={{ flex: 1, clipPath: bandClip(i), backgroundColor: lv.color }}
          >
            <div
              className="absolute flex flex-col items-center text-center"
              style={{
                left: '50%',
                top: i === 0 ? '82%' : '56%',
                transform: 'translate(-50%, -38%)',
                gap: 2,
              }}
            >
              <span className="font-bold" style={{ ...px(TITLE_SIZE), color: 'var(--fig-soft)' }}>
                {lv.title}
              </span>
              {lv.lines.map((line) => (
                <span key={line} style={{ ...px(LINE_SIZE), color: 'var(--fig-soft)', opacity: 0.85 }}>
                  {line}
                </span>
              ))}
              {lv.note && (
                <span className="italic" style={{ ...px(NOTE_SIZE), color: 'var(--fig-soft)', opacity: 0.8 }}>
                  {lv.note}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
