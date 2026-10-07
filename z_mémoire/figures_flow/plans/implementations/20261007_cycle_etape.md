# Cycle de vie générique d’une étape — Figure 7 (2026-10-07)

- [x] Types : `Variant += 'state'`, `stateKind`/`stateDesc`/`stateTone`
- [x] `StateNode.tsx` + dispatch `EntityNode` (variante `state`)
- [x] `markerEnd` retransmis par `TraitementEdge` + fix export des markers
- [x] Modèle `diagrams/memoire/cycle_etape.ts` + enregistrement (Mémoire 7/7)
- [x] Validation navigateur (7 nœuds / 7 arêtes / 6 pastilles / 7 flèches)
- [x] Export SVG + mesure + defs vérifiées + rendu live OK
- [x] Insert `body.typ` 4.3.3 + légende paragraphe + recompile PDF
- [x] `tsc` (baseline 76, binaire local), commit

## Géométrie

- Colonne centrale `x=560` (480 px) : départ ● `y=40`, EN_ATTENTE `y=140`,
  EN_COURS `y=430`. Boucle verte `left→left` (même abscisse → droite pure).
- Colonne droite `x=1200` (380 px) : DÉCIDÉ `y=140`, REJETÉ `y=430`,
  ABANDONNÉE `y=580`, RETIRÉE `y=730`. L’ancre `right` d’EN_COURS porte
  4 arêtes (offsets absorbés par les coudes, précédent fig. 4).
- Export : 7 nœuds aux largeurs exactes + surcouche 6 pastilles + 3 defs
  (`m0` neutre, `m1` vert, `m2` rouge).

## Pièges résolus (3, tous documentés dans le code)

1. **Boucle invisible** : elle ciblait un handle `left` de type source —
   React Flow ne rend pas une arête dont le handle cible manque. `Active`
   porte `left`/`right` dans les DEUX types (invisibles, figure rigide).
2. **Pastille vide** : `clone.style.height = 'auto'` écrasait la hauteur posée
   du départ (aucun contenu) → `minHeight`, pas `height` (longhand distinct).
3. **Markers absents de l’export** (le gros morceau) : RF émet `url('#id')`
   (quotes AVANT le hash) et ses ids portent des `hsl(…)` — l’ancien regex
   `url\(#…` ne matchait jamais (chemin mort) ; de plus `querySelector`
   lève sur ces ids et `url(#…(…)…)` serait tronqué par le parseur SVG.
   Réécriture `m0/m1/…` des deux côtés (def via `outerHTML` + regex sur le
   premier attribut — `&amp;` interdit l’égalité de chaîne) ; `TraitementEdge`
   retransmet `markerEnd` (calculé par `EdgeWrapper`, defs globales RF).
   Couleur explicite par arête (héritage par défaut incertain).

## Correspondance code (commentaire modèle)

- EN_ATTENTE ≈ `PENDING`, EN_COURS ≈ `IN_PROGRESS`, réussie ≈ `COMPLETED`,
  échouée ≈ `FAILED`, expirée ≈ `EXPIRED`, retirée ≈ `SKIPPED`/`CANCELLED`.
- États français = convention des figures du mémoire.
