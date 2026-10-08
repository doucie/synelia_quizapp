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

## Pièges (inchangés, cf. première version du plan)

- Handle cible manquant = arête non rendue ; `minHeight` pour la pastille ;
  ids de markers réécrits en `m0…` (détails § Pièges résolus).
