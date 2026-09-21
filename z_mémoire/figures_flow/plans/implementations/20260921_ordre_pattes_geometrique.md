# PLAN — Ordre des pattes par géométrie (points d'ancrage)

## Contexte

Le fix d'ancrage `a4ec9ca` (offset par ancrage résolu) répartit les pattes qui
partagent le **même ancrage résolu** d'un nœud, mais les numérote dans
**l'ordre du tableau d'arêtes** (`idx = group.indexOf(edgeId)` dans
`edgePathOffset`, `edgeAnchors.ts`). Conséquence : l'ordre vertical (sides
`left`/`right`) ou horizontal (sides `top`/`bottom`) des pattes est figé par la
déclaration, impossible à permuter.

Or les positions des nœuds sont **runtime** : modifiables et persistées dans
`localStorage['figures_flow:diagram:<id>']` (`useDiagramState.loadPositions`).
L'ordre des pattes doit donc découler de la **géométrie des nœuds opposés**, pas
de l'ordre du tableau.

## Règle visée

Sur un nœud `E1` partageant 2 pattes A (vers `E2`) et B (vers `E3`) du même côté :
- côté **gauche/droit** → pattes dispersées sur **Y** : si `E3` est plus haut que
  `E2` (Y décroissant), la patte B passe automatiquement au-dessus de A ;
- côté **haut/bas** → pattes dispersées sur **X** : si `E3` est plus à gauche de
  `E2` (X décroissant), la patte B se place avant A.

Réactif : à chaque rendu / déplacement de nœud, l'ordre se recalcule à partir des
positions runtime (aucune persistance supplémentaire).

## Implémentation (`src/components/Edges/edgeAnchors.ts`)

Signature de `edgePathOffset` **inchangée** → `RelationshipEdge` et `TraitementEdge`
ne changent pas d'appel.

- [ ] Constantes de repli : `NODE_W_FALLBACK = 220`, `NODE_H_FALLBACK = 130`
  (alignées sur `RelationshipEdge.tsx` `measured?.width ?? 220` / `.height ?? 130`).
- [ ] `farAnchorPoint(edges, nodeById, side, edge) → { x, y }` :
  - nœud opposé = `target` (side `from`) ou `source` (side `to`), position runtime
    `node.position` + `node.measured` (repli 220×130) ;
  - ancre résolue sur ce nœud (`resolveHandleId`) :
    `top` → `(cx, y0)`, `bottom` → `(cx, y0 + h)`, `left` → `(x0, cy)`,
    `right` → `(x0 + w, cy)`, autre → centre ;
  - nœu absent → `{ x: 0, y: 0 }`.
- [ ] `edgeGroupSorted(edges, nodeById, side, nodeId, handleId) → string[]` :
  - groupe = `edgeAnchorGroup` (même périmètre) ;
  - axe : `handleId` `left`/`right` → tri croissant par `.y` ; sinon (`top`/`bottom`,
    règles d'émission MCT) → tri croissant par `.x` (comportement MCT conservé) ;
  - **tri stable** (ordinal de départ conservé en cas d'égalité) ;
  - boucles réflexives (`source === target`) : **déplacées en fin de groupe**
    (elles ont déjà leur propre géométrie de boucle via `buildReflexiveEdge`).
- [ ] `edgePathOffset` : `idx` = position de l'arête dans `edgeGroupSorted`
  (group length / `baseUnit` / `gap` inchangés).

## MCT (garde du comportement actuel)

- Règles d'émission (`mct-operation`/`mct-syncop`) : ancre ≠ `left`/`right` →
  dispersion sur **X**, comme aujourd'hui. Aucun changement d'axe.

## Fichiers concernés

- `src/components/Edges/edgeAnchors.ts` (modification)
- Ce fichier de plan.

## Vérification

- [ ] `npx tsc --noEmit` : aucune nouvelle erreur sur `edgeAnchors`
  (erreurs préexistantes connues hors périmètre).
- [ ] `npx vite build` OK.
- [ ] Contrôle visuel overlay DEBUG (`DEBUG` haut-droite) : un nœud à 2+ pattes
  sur le même côté (ex. ENTRETIEN droite `e-convoquer`/`e-inclure`, CAMPAGNE
  droite `e-utiliser`/`e-proposer`) → l'ordre des `off` suit la position
  runtime des cibles ; inverser deux entités → l'ordre bascule.

## Commits proposés (conventional commits)

1. `docs(plan): plan ordre géométrique des pattes (20260921)` — point de rollback.
2. `feat(edge): pattes ordonnées par géométrie du nœud opposé (runtime)` —
   `edgeAnchors.ts` (positions runtime, tri stable, réflexives en fin de groupe).