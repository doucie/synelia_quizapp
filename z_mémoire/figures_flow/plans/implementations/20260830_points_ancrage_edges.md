# PLAN — Points d'ancrage des arêtes (offset / spacing)

## Statut (hand-off session)
- Implémentation faite, `vite build` OK, commit `a4ec9ca`.
- Vérification visuelle overlay confirmée par l'utilisateur (campagnes_pipeline + MCT v2 type mct_3_entretien).
- Overlay debug **gardé** (décision utilisateur « Garder ») — bouton `DEBUG` en haut-droite du canvas.
- Reliquat : Options A et B (section « En attente » ci-dessous) — non lancées.

---

Constat : le fix précédent « offset pour arêtes partageant le même handle » ne marche pas. Cette analyse approfondie (lecture des fichiers + code source de `@xyflow/react` v12) identifie les causes réelles et fixe un plan en 4 étapes.

## Faits établis (avec preuve dans le code)

- **Découverte clé — résolution des ancrages par React Flow v12** (`@xyflow/system`, `getHandle$1`) :
  ```js
  return (!handleId ? bounds[0] : bounds.find((d) => d.id === handleId)) || null;
  ```
  `EdgeWrapper` appelle `getEdgePosition({ sourceHandle: edge.sourceHandle || null, ... })`.
  Une arête **sans** `sourceHandle`/`targetHandle` est ancrée sur le **premier handle de ce type**, et
  `sourceX/sourceY/sourcePosition` valent la position de ce handle-là (pas un point calculé « intelligent »).

- Ordre DOM = ordre JSX (`querySelectorAll('.source')`) :
  - `EntityNode` : source `[right, left, top, bottom]`, target `[left, right, top, bottom]`
  - `MctOperation` / `MctSyncop` : source `[règle1, règle2, …]`, target `[top]`
  - Events / Results / SAT / MPT : `Handles()` standard (`right, left, top, bottom`)

- Conséquences :
  1. Toutes les arêtes MCD/MLD/MPD (sans handle) partent du premier handle source = **`right`** et arrivent sur le premier handle target = **`left`**.
  2. Arêtes d'événements → syncop : entrent par **`top`**.
  3. Une arête sans handle partant d'une opération s'ancrerait sur **la première règle**, pas `right`.

## Bugs identifiés

- **Bug A — `TraitementEdge.tsx` lit le mauvais endroit** : utilise `data?.sourceHandle` / `data?.targetHandle`
  (toujours `undefined`, car `DiagramCanvas.tsx:85-86` écrit ces champs au top-level de l'arête, pas dans `data`).
  Corrigé en destructurant les props de `EdgeProps`. ⚠️ Important découvert pendant l'implémentation : **React Flow v12
  n'expose pas `sourceHandle`/`targetHandle` dans `EdgeProps`** — `EdgeWrapper` passe `sourceHandleId`/`targetHandleId`
  (`@xyflow/react/dist/esm/index.mjs`, props du composant custom). Les deux composants alias donc
  `sourceHandleId: sourceHandle` pour conserver le reste du code inchangé.

- **Bug B — Groupage par handle *déclaré* au lieu de l'ancrage *résolu*** : `edgePathOffset` normalise `undefined → 'source'`,
  alors que React Flow résout physiquement `undefined → premier handle`. Deux arêtes partageant le même ancrage physique
  peuvent être dans des groupes différents (une sans handle + une sur `right`), et des arêtes à ancrages différents
  se retrouvent groupées sous la clé fourre-tout `'source'`.

- **Bug C — `cardinalityOffset` (`RelationshipEdge.tsx:56-83`)** : compare `e[handleKey] !== handleId` SANS normalisation
  → badge et chemin peuvent diverger du groupage path.

- **Bug D — Ordre hétérogène des handles** : le « premier handle » dépend du variant du nœud ; il faut le reproduire
  côté code pour que le groupage soit fidèle au rendu réel.

- Vérifié : les axes de dispersion (`srcOnHorizontalSide`, etc.) sont corrects car basés sur `sourcePosition`/`targetPosition` résolues.
- Vérifié : aucun diagramme ne contient deux arêtes au même handle **déclaré** → en l'état actuel le groupage ne pointe quasiment jamais.

## États persistants réels (localStorage) — à prendre en compte

L'analyse statique ne suffit pas : les ancrages réels dépendent de l'état runtime persisté sur la machine de l'utilisateur.

- **Sides de cardinalité** : popover d'une arête → `handleSideChange` écrit `sourceHandle`/`targetHandle` au **top-level**
  de l'arête + `setCardinalitySide` → `localStorage['figures_flow:edge_sides:<diagramId>']` (`useDiagramState.ts:70-84`).
- **Rechargement** : `DiagramCanvas.initialEdges` (`DiagramCanvas.tsx:72-95`) relit ces côtés via `loadCardinalitySides`
  et les remet dans `sourceHandle`/`targetHandle`.
- **Positions des nœuds** : persistées (`figures_flow:diagram:<id>`) et priorisées sur les positions en dur.
- **Conséquence** : « aucun diagramme n'a 2 arêtes au même handle » ne vaut pas pour l'environnement réel. Si l'utilisateur
  a épinglé deux arêtes d'un même nœud sur le même côté (ex. deux fois `right`), l'overlap existe → c'est le cas ciblé.
- **Incohérence découverte** : `getValidHandles` de `DiagramCanvas.tsx:30-39` ne gère pas `mct-syncop`
  (contrairement aux composants d'arêtes) → un côté sauvé sur un syncop n'est pas reconnu au chargement
  (`sourceHandle` reste `undefined`). Classé en Option B (en attente).
- **Risque de données périmées** : des `edge_sides` peuvent référencer des arêtes supprimées ou des handles invalides.
  Classé en Option A (en attente).
- Les fixes A/B/C lisent l'état **runtime** (`useEdges()` / `useNodes()`) → ils couvrent déjà les côtés sauvés.
- **L'overlay (Étape 1) montrera les vraies valeurs runtime** = localStorage appliqué (sides + positions). C'est lui qui
  tranchera la pertinence des Options A et B.

## Étapes

### Étape 1 — Instrumentation : overlay de debug temporaire
- [x] Nouveau mini-store `src/utils/edgeDebug.ts` : `get()/set()/subscribe()` (booléen, persisté dans
  `localStorage['figures_flow:debug_edges']`, défaut off).
- [x] Bouton flottant haut-droite du canvas dans `DiagramCanvas.tsx` pour basculer l'overlay.
- [x] Dans `RelationshipEdge` et `TraitementEdge`, via `useSyncExternalStore`, afficher sur chaque arête (dans `EdgeLabelRenderer`)
  un badge : `edgeId · sh:<déclaré>→<résolu> · th:<…> · groupe:[n] · off:<px>` (+ point sur l'ancrage résolu).
- [x] Objectif : voir les vraies valeurs dans le navigateur, avant/après correction.

### Étape 2 — Bug A : `TraitementEdge` lit le mauvais endroit
- [x] Destructurer `sourceHandleId`/`targetHandleId` d'`EdgeProps` (aliasés en `sourceHandle`/`targetHandle`).
- [x] Remplacer les usages de `data?.sourceHandle`/`data?.targetHandle` (lignes ~108-121) par les props.
- [x] `DiagramCanvas.tsx:85-86` n'a pas besoin de changement (déjà au top-level).

### Étape 3 — Bugs B+C : groupage par ancrage résolu
- [x] Nouveau helper partagé `src/components/Edges/edgeAnchors.ts` :
  - [x] `firstHandleId(node, 'source' | 'target')` reproduisant l'ordre DOM réel
    (entités / SAT / MPT → `right` / `left` ; MCT → `bottom` / `top` ;
    `mct-operation`/`mct-syncop` à règles → première `emissionRule` / `top`).
  - [x] `resolvedHandle = declared ?? firstHandleId(node, kind)` — fidèle à `getHandle$1` de React Flow v12.
- [x] `edgePathOffset` (les deux composants réécrits avec le helper) : chaque nœud obtenu via `useNodes()`,
  groupé par **ancrage résolu** (élimine la clé fourre-tout `'source'` de l'ancienne version).
- [x] `cardinalityOffset` (`RelationshipEdge.tsx`) : aligné sur la même clé résolue (accepte `Edge[]` runtime
  via `EdgeAnchorItem & { data?: Record<string, unknown> }`, valeurs de cardinalité lues en défensif).

### Étape 4 — Vérification
- [x] `npx vite build` OK. `tsc --noEmit` : **zéro erreur dans les fichiers modifiés/ajoutés**
  (`RelationshipEdge`, `TraitementEdge`, `edgeAnchors`, `edgeDebug`). Les erreurs restantes sont toutes
  pré-existantes et hors périmètre (mismatch `EntityNodeData`/`NodeProps` RF v12 dans EntityNode/ProcessNode/
  DiagramCanvas/useDiagramState/types/entityColors, `type: "process"` vs `"entity"` dans les diagrammes MCT v2,
  `panOnDrag={1}` DiagramCanvas:332, `onNodesInitialized` inutilisé).
- [ ] Contrôle visuel avec overlay activé sur :
  - [ ] `campagnes_pipeline` : `CAMPAGNE` a 2 arêtes → même ancrage résolu `right` (attendu : ±offset vertical).
  - [ ] un MCT v2 type `mct_3_entretien` : 2 arêtes d'événements → `syncop` par `top` (attendu : ±offset horizontal).
- [ ] Si les chiffres de l'overlay confirment, retirer l'overlay et committer.

## Fichiers concernés
- `src/components/Edges/TraitementEdge.tsx` (Bug A, et factorisation offset)
- `src/components/Edges/RelationshipEdge.tsx` (Bug C, factorisation offset)
- `src/components/Edges/edgeAnchors.ts` (nouveau — helpers ancrages résolus)
- `src/utils/edgeDebug.ts` (nouveau — état debug overlay)
- `src/components/DiagramCanvas.tsx` (bouton de debug)

## En attente — Options A et B (déclenchées par l'overlay, NON incluses dans cette passe)

- [ ] **Option A — Sanification des `edge_sides` périmées** : purge conservative au chargement des entrées impossibles
  (edgeId absent du diagramme, ou côté/handle absent des handles valides du nœud). À activer seulement si l'overlay
  révèle de telles données.
- [x] **Option B — Harmoniser + factoriser `getValidHandles`** : **fait** (voir « Option B » ci-dessous).
  Le reliquat est levé : les 3 copies ont été supprimées au profit de `validHandles` dans `edgeAnchors.ts`.
  L'Option A reste ouverte.
  ⚠️ B **doit** être associé à A : harmoniser sans sanifier peut « ressusciter » un côté sauvé pointant vers une règle
  d'émission renommée/supprimée → handle introuvable → erreur React Flow `008` → arête invisible.

### Option B — réalisée le 2026-10-01 (déclenchée par le MCT combiné)

Déclencheur : le reciblage des liens croisés du MCT combiné sur les triangles `mct-syncop` a rendu le
reliquat **bloquant**. `DiagramCanvas` valide au chargement les côtés persistés dans
`figures_flow:edge_sides:<diagramId>` via sa copie obsolète, qui acceptait les 4 côtés pour un `mct-syncop` →
un `to: 'left'` réinjecté visait un handle inexistant.

- `src/components/Edges/edgeAnchors.ts` : nouveau `validHandles(node, kind): Set<string>`, reprenant la
  logique déjà correcte de `TraitementEdge` (`mct-operation`/`mct-syncop` à règles ; `mct-sync`/`mct-syncop`
  en cible → `top`). `handleIdsOf` n'est **pas** touché : c'est l'ancrage par défaut, qui doit continuer à
  renvoyer 4 côtés même pour un `mct-sync`, sinon les figures existantes se décalent.
- Copies supprimées : `DiagramCanvas` (→ adaptateur mince `handlesOf`), `RelationshipEdge`, `TraitementEdge`.
- Effet de bord : `RelationshipEdge` devient cohérent sur `mct-sync`/`mct-syncop` (elle n'était utilisée que sur
  les arêtes `relationship`, donc aucun rendu existant n'est modifié).
- `mct_combine.ts` : les 7 liens croisés déclarent désormais `targetHandle: 'top'` explicitement, ce qui
  court-circuite le `??` sur `cardToSide` dans `DiagramCanvas` — les côtés périmés éventuels sont ignorés
  par construction. L'Option A (sanification) reste utile pour le nettoyage des données, pas pour la sécurité ici.

## Ancrages par défaut verticaux du MCT — fait le 2026-10-01

Demande : le MCT se lit de haut en bas, donc sortie par le bas et entrée par le haut.
Avant, tous les nœuds de processus partageaient l'ordre `right`/`left` de `Handles()`, y compris les MCT.

- [x] `src/components/Edges/edgeAnchors.ts` : `MCT_SOURCE_HANDLES = ['bottom','right','left','top']`,
      `MCT_TARGET_HANDLES = ['top','left','right','bottom']`, appliqués dans `handleIdsOf` pour les variants
      `mct-event`, `mct-sync`, `mct-syncop`, `mct-operation`, `mct-result` (ensemble `MCT_VERTICAL_VARIANTS`).
      La branche `emissionRules` reste prioritaire : les sources de règles sont déjà en `Position.Bottom`.
- [x] `src/components/Nodes/ProcessNode.tsx` : `Handles({ order })` paramétré ('horizontal' | 'vertical'),
      rendu par mapping `side → Position` au lieu de 8 balises en dur. Le handle visible (`bg-gray-400`)
      reste celui d'index 0, donc c'est bien l'ancrage par défaut qui est affiché.
      Appelé en `vertical` sur `MctEvent`, `MctSync`, `MctResult` et les fallbacks `: <Handles />`
      de `MctSyncop`/`MctOperation`. `SatHead`/`SatPhase`/`SatTask`/`SatLane`/`MptLayer` restent `horizontal`,
      `EntityNode.tsx` (MCD/MLD/MPD) n'est pas touché.
- [x] Incohérence corrigée au passage : `mct-sync` avait un défaut cible `left` alors que `validHandles`
      n'autorisait que `top`.
- [x] `validHandles` inchangé : les 4 côtés restent sélectionnables à la main sur les nœuds MCT.
- [x] Périmètre : MCT v2 + archive + MOT (MOT réutilise les MCT d'archive) **+ cibles `mct-event`** —
      décision utilisateur. Un default par variant s'applique donc partout, sans liste d'exclusion.
- [x] `mct_combine.ts` : les 7 liens croisés gardent `sourceHandle: 'bottom'` / `targetHandle: 'top'`
      en dur — rendu identique, mais indépendant du default.
- ⚠️ Rappel : `figures_flow:edge_sides:<id>` ne mémorise que les côtés choisis **à la main** et surcharge
  le default. Vider ces clés pour voir le nouveau comportement ; c'est l'Option A qui les nettoierait.
- [x] Vérifs : `npm run lint` → 68 erreurs TS, baseline inchangée, aucune nouvelle dans les fichiers touchés ;
  `npx vite build` OK.

## Décisions utilisateur
- Diagramme d'observation : « Plusieurs / je ne sais plus » → l'overlay devra couvrir n'importe quel diagramme.
- Overlay de debug : approuvé (temporaire).
- **Stratégie : Option C d'abord** (étapes 1-4 ci-dessus uniquement). Options A et B en attente conditionnelle de ce que
  révèlera l'overlay.