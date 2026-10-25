import { useCallback, useEffect, useState } from 'react'

/**
 * Segment unique de l'URL : `/memoire-arbre-sgbd/` → `memoire-arbre-sgbd`.
 *
 * `null` pour la racine, un chemin multi-segments ou un encodage invalide : dans
 * ces cas `App` retombe sur la dernière figure connue puis normalise l'URL.
 */
export function slugFromPath(pathname: string): string | null {
  const raw = pathname.replace(/^\/+|\/+$/g, '')
  if (!raw || raw.includes('/')) return null
  try {
    return decodeURIComponent(raw)
  } catch {
    return null
  }
}

interface NavigateOptions {
  /** Remplacer l'entrée courante au lieu d'en ajouter une (normalisation de `/`). */
  replace?: boolean
}

/**
 * Routage de l'application, sans dépendance : une figure = un segment d'URL.
 *
 * L'URL est la source de vérité (un onglet = une figure, même quand plusieurs
 * onglets sont ouverts) ; `localStorage` ne sert plus que de repli pour une
 * arrivée sur `/`. La comparaison se fait sur le **slug** et non sur le
 * `pathname` brut, sinon `/memoire-x/` créerait une entrée d'historique alors
 * qu'il désigne déjà la figure courante.
 */
export function useDiagramRoute() {
  const [routeId, setRouteId] = useState<string | null>(() => slugFromPath(window.location.pathname))

  // Précédent / Suivant du navigateur : l'URL a déjà changé, on réaligne l'état.
  useEffect(() => {
    const onPopState = () => setRouteId(slugFromPath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((id: string, options: NavigateOptions = {}) => {
    if (slugFromPath(window.location.pathname) !== id) {
      const method = options.replace ? 'replaceState' : 'pushState'
      // `diagramId` : état des entrées futures (inspectable, jamais relu — l'URL
      // suffit et survit à un rechargement).
      window.history[method]({ diagramId: id }, '', `/${id}`)
    }
    setRouteId(id)
  }, [])

  return { routeId, navigate }
}
