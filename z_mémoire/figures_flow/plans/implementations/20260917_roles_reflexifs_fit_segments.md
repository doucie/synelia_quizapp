# PLAN — Placement des rôles sur la boucle réflexive (fit par segments)

## Statut
- v1 implémentée (`2dbc7cc` + `d2c7dca`) ; v2 (auto-fit) implémentée (`234fa6f` + `8393c4a`)
  mais **inopérante sur `e-annuler`** (voir cause racine v3 ci-dessous).
- **v3 (pilotage manuel par sliders)** : implémentée puis **remplacée par v4**.
- **v4 (le texte suit la polyligne patte + arc, SVG `textPath`)** : retenue et implémentée.
- **v5 (choix Pivoté / Droit par rôle)** : implémentée puis **remplacée par v6**.
- **v6 (sens de lecture auto + override, suppression du « Droit »)** : retenue et implémentée.
  Fichier : `z_mémoire/figures_flow/plans/implementations/20260917_roles_reflexifs_fit_segments.md`

## Contexte

Les rôles d'association (ex. `e-annuler` : `roleFrom: 'annule'`, `roleTo: 'est annulée'`)
sont rendus dans `RelationshipEdge.tsx`. Le rendu actuel aligne le texte **sur l'axe de la
patte** (`roleOuterStyle`) :
- pattes Top/Bottom → colonne verticale (`writing-mode: vertical-rl`) au-dessus/en dessous du chip ;
- pattes Left/Right → texte horizontal à gauche/droite.

**Problème** : le texte n'est contraint par aucune longueur. Sur une boucle réflexive,
« est annulée » fait une colonne d'~110 px alors que le segment vertical de la boucle ne
mesure que `M` (offset par défaut 90 px) → le rôle **dépasse le coin** de la boucle et se
retrouve à cheval sur le vide, illisible, surtout quand la `dist` (offset) est réduite.

**Objectif** : faire « suivre le rôle à une ligne » :
1. le rôle est décalé de **quelques px au-dessus de la patte** (pas dessus) ;
2. si le texte devient trop long pour son segment (**> 60 % de sa longueur**) et que le
   **segment perpendiculaire (l'arc)** est plus long / offre plus de place (en réservant la
   zone occupée par le verbe d'association « annuler »), le rôle **migre sur l'arc** ;
3. sinon, repli : ancrer le rôle à l'**extrémité libre du segment** (le texte « coule » vers
   la patte au lieu de sortir de la boucle).

### Faisabilité
- **Oui pour les boucles réflexives** (`buildReflexiveEdge`, `RelationshipEdge.tsx:122-232`) :
  toute la géométrie est connue (rect du nœud, `M` = offset, `S` = spread, `R` = rayon) →
  on peut dériver les segments et mesurer des longueurs.
- **Non fiable pour les arêtes simples** (2 entités) : la géométrie du tracé est pilotée par
  React Flow (`getSmoothStepPath`) → compromis : offset hors-ligne + ancrage uniquement.

---

## Géométrie rappel (`buildReflexiveEdge`)

- `sx, sy` : ancre source ; `tx, ty` : ancre cible (déjà décalées de `fromEdgeOff`/`toEdgeOff`).
- `outer` : ligne d'arc (perpandiculaire à la patte), à `M` du nœud.
- Même côté (ex. Top/Top) :
  - `sx = x0 - S (+ fromEdgeOff)`, `tx = x0 + S (+ toEdgeOff)`; `sy = ty = y0` (ou `y0+h`).
  - **Segment A** (patte) : `(sx,sy) → (sx,outer)` vertical, longueur `M` (idem `(tx,ty)`).
  - **Segment B** (arc) : `(sx+R, outer) → (tx−R, outer)` horizontal, longueur `~2·S − 2·R`.
- Côtés différents : A_src + tour de périmètre (B, multi-segments) + A_tgt ; B est long.

## Constantes réglables (à tuner à l'œil ensuite)

| Constante | Valeur | Rôle |
|---|---|---|
| `ROLE_FIT_RATIO` | `0.6` | seuil : rôle > 60 % de la longueur du segment → considéré trop long |
| `ROLE_LINE_GAP` | `6` px | décalage du texte hors de la ligne du segment |
| `ROLE_CHAR_W` | `6.5` px | largeur approx. d'un caractère (10 px italic) |
| `ROLE_CHAR_H` | `12` px | hauteur approx. d'une colonne verticale |
| `LABEL_RESERVE` | `80` px | zone réservée autour du libellé d'association (« annuler ») sur l'arc |

## Algorithme `placeRole`

Entrées : segment A (axe + longueur `LA`), segment B (arc, longueur `LB`, `labelPos`
= `labelX,labelY` du libellé), texte du rôle, côté (`sourcePosition`/`targetPosition`).

1. **Empreinte du texte dans l'axe de A**
   - A vertical (Top/Bottom) : hauteur `n·ROLE_CHAR_H`.
   - A horizontal (Left/Right) : largeur `n·ROLE_CHAR_W`.
2. **Candidat A** (défaut) : si `empreinte ≤ ROLE_FIT_RATIO · LA` → placer sur A, ancré
   près du chip, décalé de `ROLE_LINE_GAP` **à l'extérieur** de la boucle (côté opposé au
   centre du nœud).
3. **Candidat B** (migration) : sinon, sur l'arc B →
   - réserver `LABEL_RESERVE` centré sur `labelPos`,
   - choisir le **côté de B le plus long** (libre du label),
   - si `placeLibre ≥ empreinte` → placer sur B, lecture dans la direction de B, ancré au
     coin adjacent à A, décalé de `ROLE_LINE_GAP` hors de la ligne.
4. **Repli** : sinon, A ancré par l'**extrémité libre** (le coin) : le texte coule de l'arc
   vers la patte (déborde dans la boucle au lieu de sortir à l'extérieur).

## Rendu

- Orientation : axe de A ou de B selon le candidat retenu (`writing-mode: vertical-rl`
  pour les segments verticaux, texte horizontal pour les segments horizontaux).
- Offset `ROLE_LINE_GAP` perpendiculaire au segment → fini le texte « par-dessus » la patte.
- Fond léger `bg-background/80 rounded-sm px-0.5` conservé (croisement propre des traits).
- Arêtes non réflexives : seule l'offset `ROLE_LINE_GAP` est généralisé ; pas de migration.

---

## Changements — `src/components/Edges/RelationshipEdge.tsx`

- [x] Déclarer les constantes (`ROLE_FIT_RATIO`, `ROLE_LINE_GAP`, `ROLE_CHAR_W`,
      `ROLE_CHAR_H`, `LABEL_RESERVE`).
- [x] `placeRole(...)` : pure fonction géométrique (segment A/B, labelPos, texte, côté)
      retournant `{ anchor: {x,y}, orientation: 'vertical' | 'horizontal', placement }`.
- [x] Branchage dans la section rôle des deux badges : si `isSelfLoop` → `placeRole`
      (boucle), sinon → placement axial simple + `ROLE_LINE_GAP`.
- [x] Ajuster `roleOuterStyle` / le mode de rendu pour intégrer l'offset `ROLE_LINE_GAP`
      et l'ancrage coin (repli).
- [x] `e-annuler` : aucun changement de données (rôles + `reflexSpread: 60` déjà en place).

### Rendu final (implémentation)
- Rôles de la boucle rendus en **conteneurs dédiés** (`EdgeLabelRenderer`, coordonnées
  slide absolues) ; badges inchangés.
- Boucle même côté : migration arc si `foot > 0.6·A` ; sinon rôle sur la patte (P1)
  ancré près du chip; boucles côtés différents : pas d'arc → patte ou coin.
- Arêtes simples : rôles inchangés (alignement axial), décalage hors-ligne conservé.

---

## v2 — Auto-fit de la boucle (rôles sur l'arc de part et d'autre du libellé)

### Retour utilisateur (constat)
À `dist` minimale (M = 40), les rôles restaient sur leur patte **et entraient dans
l'entité** au lieu de migrer sur l'arc, alors que l'arc était plus long.

### Cause racine retrouvée
`LABEL_RESERVE = 80` centré sur un arc de ~104 px ne laissait que **12 px libres de chaque
côté** → `chooseArcSide` retournait `null` (migration impossible) → repli **coin** →
colonne de 132 px (« est annulée ») sur une patte de 40 px = **déborde dans l'entité**.
Et même mesuré juste, l'arc statique (104 px) ne pouvait pas contenir
« annuler » (~70 px) + « annule » (39) + « est annulée » (71) = ~180 px.

### Décision validée
**Élargir l'arc** : quand des rôles migrent, la boucle grandit en largeur pour leur faire
de la place de part et d'autre du libellé (conforme au schéma cible : `annuler` au centre,
`annule` à gauche, `est annulée` à droite).

### Changements v2 — `src/components/Edges/RelationshipEdge.tsx`
- [x] `LABEL_RESERVE` retiré ; ajout `LABEL_PAD = 24` (padding pilulier).
- [x] `computeLoopFit(...)` (appelé **avant** `buildReflexiveEdge`) :
  - empreinte rôles dans les deux axes ; rôle sur patte si `foot ≤ 0.6 · M` sinon **migre** ;
  - `labelFoot = len×6.5 + LABEL_PAD` ; budget **par côté** utile :
    `req_côté = labelFoot/2 + (migré? foot_arc + GAP : 0)` ;
  - `spread_eff = max(spread, ceil(R + max(req_gauche, req_droite)))` → l'arc est
    dimensionné pour le slot le plus exigeant, sans chevauchement du pilulier ;
  - `offset_eff = offset` (jamais d'allongement des pattes en v2).
- [x] Rebuild `buildReflexiveEdge` avec `spread_eff`/`offset_eff` → le tracé dessiné est la
      boucle agrandie.
- [x] `placeLoopRole(ctx, text, migrateArc)` : migrate → `arcRole` ancré coin
      (`roleFrom` côté gauche = `arcA`, `roleTo` côté droit = `arcB`) ; sinon P1 si
      `foot ≤ 0.6·LA`; sinon tapis coin (côtés différents uniquement).
- [x] P3 (repli coin débordant) éliminé pour les boucles **même côté** → plus jamais de
      colonne qui entre dans l'entité.
- [x] Overlay debug : affiche `eff:{offset_eff}/{spread_eff} mig:{0|1}/{0|1}`.

### Effet attendu
`e-annuler` à dist 40 / spread 60 → `spread_eff` monte à ~121 ; « annuler » centré sur
l'arc, « annule » au coin gauche, « est annulée » au coin droit, lisible, hors entité.

## v3 — Pilotage manuel par sliders (retenu)

### Retour utilisateur
« Je vois aucun changement » sur `e-annuler` malgré v2. Demande : pouvoir **déplacer
soi-même chaque rôle** le long de sa patte via un slider.

### Cause racine (pourquoi v2 ne s'appliquait jamais)
`EntityNode.tsx` déclare les handles dans l'ordre DOM source `right, left, top, bottom` et
cible `left, right, top, bottom`. Pour un self-loop, React Flow attribue donc par défaut
`sourcePosition = right` et `targetPosition = left` → `sourcePosition !== targetPosition`
→ `sameSideLoop === false` → `computeLoopFit` retournait tel quel (`migrate=false`).
**Toute la v2 était sautée.** La logique de détection de côté via `sourcePosition` était
donc le mauvais point d'appui : un self-loop a toujours **deux pattes distinctes** à
`fromEdgeOff`/`toEdgeOff` près.

### Décision validée
**Positionnement manuel** : un slider par rôle, de `0` (base du chip) à `100 %` de l'offset
`M` (extrémité libre de la patte). Sémantique : l'**ancre est le bout intérieur** et le
**texte s'étend vers l'extérieur** (jamais dans l'entité). Pas de slider pour le libellé
(le verbe reste centré par la boucle).

### Changements v3
- `src/types/index.ts` : `RelationshipEdgeData` + `roleFromPos?`, `roleToPos?` (0..1).
- `src/hooks/useDiagramState.ts` : `CardinalitySides` + `roleFromPos`/`roleToPos` ;
  `setReflexiveConfig` accepte ces clés.
- `src/components/DiagramCanvas.tsx` : merge des positions sauvegardées dans `initialEdges`.
- `src/components/Edges/RelationshipEdge.tsx` :
  - [x] **Supprimé** : `LoopRoleCtx`, `loopRoleCtx`, `wallRole`, `arcRole`, `LoopFit`,
        `computeLoopFit`, `placeLoopRole`, `sameSideLoop`, `loopFit`, `ROLE_FIT_RATIO`,
        `LABEL_PAD`.
  - [x] Ajout `patteRole(pos, base, M, t, side, text)` : ancre =
        `base + direction_extérieure · t·M`, texte étendu extérieur, décalé de
        `ROLE_LINE_GAP` perpendiculairement (`side = -1` roleFrom, `+1` roleTo).
  - [x] `buildReflexiveEdge` reçoit directement `loopOffset`/`loopSpread`.
  - [x] Popover : lignes « Rôle ⇤ » / « Rôle ⇥ » (range 0–100 step 5, valeur en %, reset),
        visibles si `isSelfLoop && data.role*`.
  - [x] Overlay debug : `pos:{sourcePosition}/{targetPosition} rF:{roleFromPos} rT:{roleToPos}`
        (remplace `eff/mig`).
- Données : `e-annuler` inchangé (`reflexSpread: 60`), positions rôles par défaut `0`.

### Effet attendu
À dist/spread donnés, l'utilisateur place « annule » et « est annulée » où il veut sur
chaque patte, sans qu'ils débordent dans l'entité (texte toujours vers l'extérieur).

## v4 — Le texte suit la polyligne (patte + arc) — **remplace v3**

### Retour utilisateur
Le rôle doit **suivre les lignes de lien** : quand le texte atteint le coin, il continue sur
l'arc (ex. `annu` sur l'arc puis `le` sur la patte, ou l'inverse), et le slider fait glisser
le texte **sur les deux lignes**.

### Décisions validées
- Lettres **pivotées** : elles suivent la tangente du tracé (comme l'existant `vertical-rl`).
- Amplitude du slider = **patte + arc**, jusqu'au coin opposé (0 = base du chip, 1 = coin).
- Rôle `from` ancré par son **début**, rôle `to` ancré par sa **fin** (bout intérieur, texte
  vers l'extérieur — inchangé depuis v3).

### Changements v4 — `src/components/Edges/RelationshipEdge.tsx` uniquement
- [x] `buildReflexiveEdge` retourne en plus `poly: [number, number][]` (polyligne à angles
      droits, même côté et côtés différents).
- [x] `rolePathFit(poly, rect)` : longueurs de segments → `total`, `maxFrom = total − patte
      cible`, `maxTo = total − patte source` ; décalage perpendiculaire `dy` **hors boucle**
      calculé depuis la 1re patte (`dy = ROLE_LINE_GAP · sign(dot(extérieur, normaleGlyphe))`).
- [x] Rendu SVG `textPath` (dans le `<g>` de l'arête, au-dessus du `BaseEdge`) :
      `<defs><path id="edge-rolepath-<id>">`, puis deux `<text>` :
      - from : `textAnchor="start"`, `startOffset = roleFromPos · maxFrom` ;
      - to : `textAnchor="end"`, `startOffset = total − roleToPos · maxTo` ;
      - style `fontSize 10`, italique, `fill: var(--color-muted-foreground)`, halo
        `paintOrder:'stroke'` + `stroke: var(--color-background)` (remplace la pilule HTML).
- [x] **Supprimés** : `patteRole`, `RolePlacement`, divs HTML des rôles self-loop, constantes
      `ROLE_COL_W`/`ROLE_ROW_H`/`ROLE_CHAR_W`/`ROLE_CHAR_H`.
- [x] Popover : sliders « Rôle ⇤ / ⇥ » inchangés (persistence `roleFromPos`/`roleToPos` 0..1).
- [x] Debug : `mF/mT` (longueurs max des sliders) ajoutés.
- Limites : rôles en SVG (sous l'overlay HTML) → peuvent être occultés par le libellé s'ils
      glissent pile dessous ; halo au lieu de la pilule.

## v5 — Choix « Pivoté / Droit » par rôle

### Retour utilisateur
« Quand le texte arrive sur une ligne verticale, il doit être à l'endroit. » Le mode
`textPath` pivote forcément les glyphes avec la tangente → ajout d'un **choix utilisateur**
par rôle, défaut **Pivoté** (rendu v4 conservé).

### Décisions validées
- Choix **par rôle** : `roleFromOrientation` / `roleToOrientation` (`'rotate' | 'upright'`).
- Défaut `'rotate'` si absent (aucun changement visuel).
- `rotate` = `<textPath>` (existant) ; `upright` = glyphes jamais tournés.

### Changements v5
- `src/types/index.ts` : `RelationshipEdgeData` + `roleFromOrientation?` / `roleToOrientation?`.
- `src/hooks/useDiagramState.ts` : `CardinalitySides` + ces 2 champs ;
  `setReflexiveConfig` accepte `number | string | undefined` et les 2 nouvelles clés.
- `src/components/DiagramCanvas.tsx` : merge des 2 champs sauvegardés.
- `src/components/Edges/RelationshipEdge.tsx` :
  - [x] `layoutUpright(poly, rect, text, startDist, fromEnd)` : parcourt la polyligne depuis
        le bout intérieur (polyligne inversée pour `roleTo`), avance `ROLE_CHAR_W` (horizontal)
        / `ROLE_CHAR_H` (vertical), décalage `ROLE_LINE_GAP` **hors boucle** par segment.
  - [x] Rendu `upright` : `<text x="…" y="…">` (une coordonnée par caractère),
        `textAnchor="middle"` + `dominantBaseline="central"` → glyphes à l'endroit, y compris
        empilés sur les verticales.
  - [x] `toDist = t·maxTo` (distance depuis le chip cible) pour le parcours inversé.
  - [x] Constantes `ROLE_CHAR_W = 6.5`, `ROLE_CHAR_H = 12` réintroduites.
  - [x] Popover : sous chaque rôle, `Texte  [Pivoté] [Droit]` ; « Pivoté » supprime la clé
        (défaut), « Droit » persiste `'upright'`.
- Cavalier connu : sur un segment parcouru à rebours de la lecture naturelle, les lettres
  restent à l'endroit mais la lecture suit le flux **vers l'extérieur** (une colonne peut se
  lire de bas en haut). Inhérent à « premier caractère au chip » ; le mode Pivoté reste dispo.

## v6 — Sens de lecture auto + override (suppression du « Droit ») — **remplace v5**

### Retour utilisateur
Le mode Pivoté laissait le texte **tête en bas** (rotation 180°) lorsqu'un rôle débordait sur
un tronçon parcouru à rebours (ex. l'arc du haut de `e-annuler`, droite→gauche). Le mode
« Droit » (v5) évitait le 180° mais inversait l'ordre des lettres (effet miroir). Demande :
garder les lettres **droites** (pivotées par le tracé, v4) mais **jamais à l'envers**.

### Diagnostic
Une boucle comporte **toujours** au moins un tronçon « à rebours » : un seul sens de parcours
ne peut pas tout rendre lisible. `<textPath>` oriente chaque glyphe selon la tangente → un
tronçon parcouru à rebours donne 180°. Il faut donc choisir le **sens de lecture par rôle**
selon la **portion réellement occupée** (recalculé à chaque déplacement du slider).

### Décisions validées
- **Retirer le mode « Droit »** (rendu `layoutUpright`).
- **Auto** par rôle : compter la longueur où `cos(tangente) < 0` (glyphes à l'envers) sur
  l'intervalle occupé et choisir le sens qui la minimise (égalité → sens normal).
- **Override manuel** par rôle : `Auto` (défaut) / `Normal` / `Inversé`.
- Un rôle chevauchant un coin peut garder un tronçon minoritaire à l'envers → l'override
  permet de choisir le tronçon à privilégier (stratégie par tronçon écartée).

### Changements v6
- `src/types/index.ts` : `roleFromOrientation`/`roleToOrientation` remplacés par
  `roleFromSense?` / `roleToSense?` (`'auto' | 'forward' | 'backward'`).
- `src/hooks/useDiagramState.ts` : `CardinalitySides` + clés `setReflexiveConfig` → sense.
- `src/components/DiagramCanvas.tsx` : merge des champs sense sauvegardés.
- `src/components/Edges/RelationshipEdge.tsx` :
  - [x] `roundedPath(points, R)` extrait de `buildReflexiveEdge` (coins arrondis) et réutilisé
        pour le cas « même côté » (sortie inchangée, vérifiée sur les 4 côtés).
  - [x] `buildReflexiveEdge` retourne en plus `pathReverse` (polyligne inversée).
  - [x] `upsideDownMeasure(poly, start, len)` + `resolveRoleSense(poly, start, len, sense)`.
  - [x] Rendu sur 2 `<path>` (`edge-rolepath-<id>` et `…-rev`) ; par rôle selon le sens :
        - from forward : `anchor="start"`, `offset=fromStart`, `dy=roleDy` ;
        - from backward : `anchor="end"`, `offset=total−fromStart`, `dy=−roleDy` ;
        - to forward : `anchor="end"`, `offset=toStart`, `dy=roleDy` ;
        - to backward : `anchor="start"`, `offset=toDist`, `dy=−roleDy`.
  - [x] **Supprimés** : `layoutUpright`, `UprightChar`, `UprightSeg`, `ROLE_CHAR_H`, `fromUpright`/
        `toUpright`, `fromChars`/`toChars`, branches `<text x=… y=…>` (`ROLE_CHAR_ADVANCE` conservé
        pour estimer la longueur d'un rôle).
  - [x] Popover : `Sens [Auto][Normal][Inversé]` par rôle (Auto = reset de clé).
  - [x] Debug : `sF`/`sT` (sens effectif).
- Les anciennes clés `roleFromOrientation:'upright'` en localStorage sont ignorées (pas de migration).

## Vérifs

- `npx tsc --noEmit` (aucune nouvelle erreur) puis `npx vite build`.
- Essais visuels : boucle Top/Top **rapprochée** (dist faible) et **agrandie**, côtés
  mixtes, pattes Left/Right — rôles toujours lisibles, ne dépassant plus le coin.
- Tuner `ROLE_LINE_GAP` / `ROLE_CHAR_W` / `ROLE_CHAR_H` selon le rendu.

## Commits

1. `feat(edge): role fit par segments sur boucle reflexive (migration arc si >60%)`
2. `build(diagrams): artefacts dist`
3. `feat(edge): position manuelle des roles sur les pattes (sliders)`
4. `build(diagrams): artefacts dist`
5. `feat(edge): roles suivant la polyligne de la boucle (textPath)`
6. `build(diagrams): artefacts dist`
7. `feat(edge): orientation par role pivotee ou droite (toggle)`
8. `build(diagrams): artefacts dist`
9. `feat(edge): sens de lecture auto des roles + override, retrait du mode droit`
10. `build(diagrams): artefacts dist`