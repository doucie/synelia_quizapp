# PLAN — Placement des rôles sur la boucle réflexive (fit par segments)

## Statut
- Plan validé (orientations OK). Implémentation à faire après OK global.
- Fichier : `z_mémoire/figures_flow/plans/implementations/20260917_roles_reflexifs_fit_segments.md`

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

- [ ] Déclarer les constantes (`ROLE_FIT_RATIO`, `ROLE_LINE_GAP`, `ROLE_CHAR_W`,
      `ROLE_CHAR_H`, `LABEL_RESERVE`).
- [ ] `placeRole(...)` : pure fonction géométrique (segment A/B, labelPos, texte, côté)
      retournant `{ anchor: {x,y}, orientation: 'vertical' | 'horizontal', placement }`.
- [ ] Branchage dans la section rôle des deux badges : si `isSelfLoop` → `placeRole`
      (boucle), sinon → placement axial simple + `ROLE_LINE_GAP`.
- [ ] Ajuster `roleOuterStyle` / le mode de rendu pour intégrer l'offset `ROLE_LINE_GAP`
      et l'ancrage coin (repli).
- [ ] `e-annuler` : aucun changement de données (rôles + `reflexSpread: 60` déjà en place).

## Vérifs

- `npx tsc --noEmit` (aucune nouvelle erreur) puis `npx vite build`.
- Essais visuels : boucle Top/Top **rapprochée** (dist faible) et **agrandie**, côtés
  mixtes, pattes Left/Right — rôles toujours lisibles, ne dépassant plus le coin.
- Tuner `ROLE_FIT_RATIO` / `ROLE_LINE_GAP` / `LABEL_RESERVE` selon le rendu.

## Commits

1. `feat(edge): role fit par segments sur boucle reflexive (migration arc si >60%)`
2. `build(diagrams): artefacts dist`