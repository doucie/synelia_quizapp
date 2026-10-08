# Cycle d’occurrence + bandeau dossier — Figure 7 RECONSTRUITE (2026-10-07)

> Remplace le premier schéma (boucle « réussie », DÉCIDÉ universel), qui était
> sémantiquement faux : rien ne retourne en attente, et le verdict n’est pas un
> état universel. Enquête code : sous-agent + enums lus
> (`ProgressStatus`, `QuizStatus`, `InterviewStatus`, `DecisionMode`,
> `StageType`, `DecisionType`).

- [x] Enquête `quizapp\src` (moteur réel)
- [x] Types : `stateKind += 'ghost' | 'dossier' | 'tag'`
- [x] `StateNode` : handles complets, rendus `Ghost`/`Dossier`/`ZoneTag`
- [x] Modèle `cycle_etape.ts` réécrit (12 nœuds / 11 arêtes / 11 pastilles)
- [x] Validation navigateur + export + `measure-svg` + defs `m0/m1/m2`
- [x] Caption + légende body réécrites + recompile PDF
- [x] `tsc` (baseline 76, binaire local), commit

## Vrai moteur (`ApplicationProgressBusiness.java`)

- Occurrences **pré-créées `PENDING`** à l’init (`initProgressForApplication`,
  L300-342) : avancer = activer (`activateNextPendingStage`, premier `PENDING`
  d’ordre supérieur), jamais créer. Un seul `IN_PROGRESS`.
- `passStage` → `COMPLETED` → suivante (fin si aucune). `failStage` →
  `FAILED` → cascade `SKIPPED` + arrêt si éliminatoire, sinon suite.
  `skipStage` → `SKIPPED` (`CANDIDATURE`/`DECISION` non skippables).
  `rollbackStage` → vrai retour en `IN_PROGRESS` (dessiné depuis `COMPLETED`,
  valable pour tout résolu). Gardes : requis résolu, mail requis, unicité.
- Verdict : la décision fait muter l’étape `PRESELECTION`/`DECISION` via
  `pass/failStage` — pas un état universel.
- Omis (non pilotés) : `AWAITING_VALIDATION` (priorité d’affichage),
  `EXPIRED`/`CANCELLED` quiz (l’inactivité donne `FAILED`).

## Schéma (12 nœuds / 11 arêtes / 11 pastilles)

- Colonne `x=560` : départ → PENDING → IN_PROGRESS → COMPLETED → fantôme
  « ÉTAPE SUIVANTE » (pointillés, « fin s’il n’y en a plus »). SKIPPED à
  gauche, FAILED à droite.
- Rollback pointillés COMPLETED `left` → IN_PROGRESS `left` (« réouverture »).
- Bandeau dossier `y=1280` (tag + 4 mini-boîtes 300, bord tirets) : REJETÉ
  ← FAILED « si éliminatoire », ACCEPTÉ ← COMPLETED « si DECISION »,
  ABANDONNÉE/RETIRÉE ← IN_PROGRESS « inactivité » / « retrait » — tirets fins,
  flèche neutre. Seul groupe de 2 : `left` IN_PROGRESS (fourche ±14 assumée
  sur tirets) ; toutes les descentes pleines en groupe de 1, droites.
- `stateKind: 'ghost' | 'dossier' | 'tag'` ; `Terminal` gagne `top` target +
  `bottom` source ; `Active` a tous les handles des deux types.
- Export 1600×1380 : 12 rasters exacts + surcouche 11 pastilles + 3 defs.

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
   retransmet `markerEnd` (calcul `EdgeWrapper`, defs globales RF).
   Couleur explicite par arête (héritage par défaut incertain).

## Couleurs d’états + séparation rollback/lectures (réglages)

- Occurrences teintées : PENDING `210`, IN_PROGRESS `240`, COMPLETED `128`,
  SKIPPED `30` (ambre), FAILED `0` — bordure 2 px + nom coloré + fond `0.08`
  (`stateTone`: `pending`/`active`/`done`/`skipped`, même langage que MySQL).
- Rollback en tirets **bleus `240`** (couleur de sa destination) vs lectures
  grises ; **couloir propre** (`completed right` → `in-progress right`,
  `x≈1026` vérifié vide — à gauche les voies partageaient `x≈560`) ;
  pastilles disjointes vérifiées à l’écran.
- Dossier : tirets `1.5 → 2.5 px` (illisibles à l’échelle d’impression avant),
  tons inchangés.
- **Épaisseurs + pastilles cibles** : traits à 2 px via `isStrong` (champ
  existant, défaut `1.5` inchangé), dossier `3 px`, fantôme `2.5 px` ;
  pastilles `labelPx` 24 + `whiteSpace: nowrap` (fini les retours ligne) ;
  `data.labelBorder` opt-in (bordure pastille assortie à la cible : rouge
  vers REJETÉ, vert vers ACCEPTÉ — défaut `border-border` inchangé).
- **Ambre + gris foncé** : `saut autorisé` en ambre `30` (couleur de SKIPPED,
  trait + flèche + pastille) ; lectures `inactivité`/`retrait` en
  `hsl(var(--muted-foreground))` (~47 % vs ~72 % du défaut — marqueurs OK car
  RF passe la couleur en `style`, pas en attribut).
- Micro-décalages : SKIPPED `y` 430 → **280 (haut**, la voie `inactivité` file à
  gauche à `y≈505), fantôme `y` 1010 → 1080 (pastille `si DECISION` chevauchée).
- **Ancres étagées `right`/`right-low`** : `échec` sort au centre, `réouverture`
  arrive à `top: 75%` (~37 px plus bas) — même côté, points distincts (RF
  mesure les positions réelles, le style inline bat la feuille de
  positionnement ; `right-low` en fin de `TARGET_HANDLES`, défauts inchangés).
  Abandon des diagonales `right→bottom` / ∩ `top→top` (collisions reportées
  sur `activation` et `validation`). Vérifié à l’écran.
