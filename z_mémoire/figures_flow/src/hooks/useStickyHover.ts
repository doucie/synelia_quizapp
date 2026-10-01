import { useCallback, useEffect, useRef, useState } from 'react'

/** Délai avant d'effacer le survol, le temps qu'un `mouseenter` concurrent l'annule. */
const CLEAR_DELAY = 60

/**
 * Survol « collant » d'une section (un traitement).
 *
 * Un `mouseleave` suivi d'un `mouseenter` sur un élément voisin — la carte qu'on
 * quitte, le bouton du cadre qu'on rejoint, ou la carte suivante du même
 * traitement — passe par un état `null` intermédiaire qui ferait clignoter
 * l'encadrement. L'effacement est donc différé, et annulé dès qu'un `enter`
 * survient dans la fenêtre.
 */
export function useStickyHover() {
  const [hovered, setHovered] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  const cancel = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  const enter = useCallback(
    (id: string) => {
      cancel()
      setHovered(id)
    },
    [cancel],
  )

  const leave = useCallback(() => {
    cancel()
    timer.current = window.setTimeout(() => {
      timer.current = null
      setHovered(null)
    }, CLEAR_DELAY)
  }, [cancel])

  const clear = useCallback(() => {
    cancel()
    setHovered(null)
  }, [cancel])

  useEffect(() => cancel, [cancel])

  return { hovered, enter, leave, clear }
}
