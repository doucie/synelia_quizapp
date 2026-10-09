import type { DiagramDefinition } from '../../types'

/**
 * Besoins non fonctionnels — hub en étoile (3.3).
 *
 * 7 exigences qualité PAIRES autour d’un hub : l’inverse des concentriques,
 * où la taille EST hiérarchique. Distance et taille uniformes — toute
 * différence visuelle entre médaillons serait un contresens.
 *
 * Libellés sourcés du brief et de la table BNF (3.3) : noms et critères
 * verbatim. Nœud composite unique, zéro arête (voir `HubNode`) : hub encre +
 * 7 médaillons blancs + 7 traits fins sans pointes (appartenance, pas flux).
 */

const W = 1280

export const hubNfr: DiagramDefinition = {
  id: 'memoire-hub-nfr',
  title: 'Besoins non fonctionnels — hub qualité',
  category: 'memoire',
  domain: '3.3 — Besoins non fonctionnels',
  nodes: [
    {
      id: 'hub',
      type: 'entity' as const,
      position: { x: 0, y: 0 },
      style: { width: W },
      data: {
        label: 'Qualité du système SyneliaQuizApp',
        variant: 'hub' as const,
        // Toujours égal à `W` (cf. `exportWidth`).
        exportWidth: W,
        hubTitle: 'Qualité du système SyneliaQuizApp',
        spokes: [
          { id: 'BNF-01', name: 'Performance', icon: 'zap', criterion: 'Navigation fluide sur les parcours courants.' },
          { id: 'BNF-02', name: 'Sécurité', icon: 'shield', criterion: 'Authentification fiable, permissions vérifiées côté backend.' },
          { id: 'BNF-03', name: 'Fiabilité', icon: 'checkcircle', criterion: 'Transitions d’état contrôlées, historique cohérent.' },
          { id: 'BNF-04', name: 'Ergonomie', icon: 'eye', criterion: 'Écrans lisibles, vocabulaire homogène.' },
          { id: 'BNF-05', name: 'Maintenabilité', icon: 'tool', criterion: 'Architecture en couches, contrats d’API stables.' },
          { id: 'BNF-06', name: 'Traçabilité', icon: 'search', criterion: 'Historique exploitable des décisions et évaluations.' },
          { id: 'BNF-07', name: 'Conformité', icon: 'award', criterion: 'Données nécessaires uniquement, audit possible.' },
        ],
      },
    },
  ],
  edges: [],
  rigidLayout: true,
  fontScale: 4 / 3,
  fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
}
