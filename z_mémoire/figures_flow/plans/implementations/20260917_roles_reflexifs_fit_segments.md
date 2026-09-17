# PLAN — Placement des rôles sur la boucle réflexive (fit par segments)

## Statut
- v1 implémentée (`2dbc7cc` + `d2c7dca`) ; **v2 (auto-fit)** planifiée puis implémentée
  (`fix(edge)` + `build(diagrams)`) suite au retour « les rôles entrent dans l'entité à
  dist minimale ». Seuils réglables à tuner visuellement si besoin.
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

## Vérifs

- `npx tsc --noEmit` (aucune nouvelle erreur) puis `npx vite build`.
- Essais visuels : boucle Top/Top **rapprochée** (dist faible) et **agrandie**, côtés
  mixtes, pattes Left/Right — rôles toujours lisibles, ne dépassant plus le coin.
- Tuner `ROLE_FIT_RATIO` / `ROLE_LINE_GAP` / `LABEL_RESERVE` selon le rendu.

## Commits

1. `feat(edge): role fit par segments sur boucle reflexive (migration arc si >60%)`
2. `build(diagrams): artefacts dist`