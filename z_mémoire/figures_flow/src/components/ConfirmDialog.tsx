import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  /** Libellé du bouton qui confirme. Un seul mot : Annuler reste l'action neutre. */
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Confirmation pour une action destructive, avant qu'elle ne soit appliquée.
 *
 * `ConfirmDialog` ne connaît rien du domaine : c'est le site d'appel qui fournit
 * le titre, le message et le libellé du bouton, donc **une instance par action**.
 * Partager un titre générique (« Êtes-vous sûr ? ») ferait perdre au dialogue sa
 * seule raison d'être — dire ce qui va être perdu.
 *
 * ## Pourquoi un portail
 *
 * Les deux toolbars MOT sont rendues **dans** le pane React Flow
 * (`MotEditToolbar.tsx`, `position: absolute`, `zIndex: 1000`), donc sous
 * `.react-flow__viewport`, qui porte un `transform: translate() scale()`. Un
 * `position: fixed` posé à cet endroit ne serait pas centré sur la fenêtre mais
 * sur le viewport, **et serait mis à l'échelle par le zoom** : à 200 %, une carte
 * de 300 px en ferait 600. Le seul correctif est de rendre sous `document.body`,
 * hors de toute transformation. Même raison que pour les rasters de l'export
 * (`utils/exportSvg.ts`), qui reparentent leur clone sous `body` pour la même
 * contrainte.
 *
 * ## `z-[1100]`, et pas `z-50`
 *
 * 1000 est le z-index le plus élevé du projet (`MotEditToolbar`, et les popovers
 * de `TraitementEdge` / `RelationshipEdge` qui le posent en `style` inline). Le
 * voile doit passer **au-dessus** des deux, sans quoi il s'arrête sous une toolbar
 * MOT. Ne pas « harmoniser » cette valeur en `z-50` : la modale devient invisible
 * dès qu'un motif MOT est ouvert.
 *
 * ## Focus sur Annuler, et non sur la confirmation
 *
 * C'est le choix qui fait la différence entre une protection et un formality : un
 * `Entrée` réflexe valide l'élément focusé. Sur une action qui relance la page et
 * perd les positions travaillées à la main, la focus doit être sur l'issue sans
 * risque. L'action destructive reste à un `Tab` de distance, jamais à un `Entrée`.
 *
 * Le piège de tabulation accompagne : sans lui, `Tab` sort de la carte et continue
 * de naviguer la page **derrière** la modale, ce qui est le défaut le plus visible
 * d'un dialogue écrit sans `role`.
 *
 * ## Couleurs
 *
 * Tout vient de tokens, sauf le voile : `bg-black/50`. L'alternative par token
 * (`bg-foreground/40`) donnerait un voile **clair** en mode sombre, donc plus un
 * voile du tout. Un aplat neutre à 50 % est un écart assumé, pas une couleur de
 * thème.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()
  const messageId = useId()
  const cardRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Focus à l'ouverture, restitution à la fermeture : sans le retour, l'utilisateur
  // repart au début du document après avoir annulé.
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    cancelRef.current?.focus()
    return () => previous?.focus?.()
  }, [open])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
        return
      }
      if (e.key !== 'Tab') return

      const focusables = cardRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])')
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement

      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg"
      >
        <h2 id={titleId} className="text-sm font-medium">
          {title}
        </h2>
        <p id={messageId} className="mt-2 text-xs text-muted-foreground">
          {message}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="rounded px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition-opacity hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}