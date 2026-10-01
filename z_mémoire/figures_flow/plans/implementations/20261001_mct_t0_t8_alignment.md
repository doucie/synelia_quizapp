# PLAN — Alignement du MCT v2 sur les 9 traitements T0–T8

Date : 2026-10-01
Source de vérité : `plans/mct/nouveaux_mct.md` (« ce fichier est la source de vérité pour les MCT »)
Précédents : `20261001_decoupe_parcours_mct.md`, `20261001_aretes_droites_mct.md`

## Contexte

`nouveaux_mct.md` décrit **9 traitements (T0–T8)**, en séparant la planification, la conduite et
l'évaluation de l'entretien. Le code n'en comptait que **7** (T0–T6), l'entretien étant fondue dans
un traitement unique, et **les numérotations divergeaient** : le code appelait « T4 » ce que le plan
appelle T6. Le plan signalait lui-même l'écart (lignes 18-24) comme « un travail à faire ».

Décision : **le plan prime sur le code**. Le MCT v2 passe à 9 traitements, ids et fichiers alignés.

## Ce qui a été fait

### Les 9 traitements (`src/diagrams/archive/mct_*.ts`)

| Plan | Fichier | État |
|---|---|---|
| T0 Créer la campagne | `mct_0_creation_campagne.ts` | libellés corrigés |
| T1 Candidature | `mct_1_candidature.ts` | libellés corrigés |
| T2 Quiz | `mct_2_quiz.ts` | déjà conforme |
| **T3 Planification** | `mct_3_planification.ts` | **créé** |
| **T4 Conduire l'entretien** | `mct_4_conduite_entretien.ts` | **créé** |
| T5 Évaluation | `mct_5_evaluation.ts` | ex-`mct_3_entretien.ts` |
| T6 Décision | `mct_6_decision.ts` | ex-`mct_4_decision.ts` |
| T7 Annulation | `mct_7_annulation.ts` | ex-`mct_5_annulation.ts` |
| T8 Audit | `mct_8_audit.ts` | ex-`mct_6_audit.ts` |

`git mv` pour les 7 existants, donc l'historique suit les renommages. Les 9 fichiers portent
`category: 'archive'` et leur import est passé de `'../../../types'` à `'../../types'`.

### Libellés corrigés

| # | Emplacement | Avant | Après |
|---|---|---|---|
| 1 | T0 résultat | `Campagne initialisée` | `Campagne ouverte` |
| 2 | T0 opération | `Initialiser la campagne` | `Initialiser et ouvrir la campagne` |
| 3 | T0 item | `Attribuer les droits d'accès par défaut (profil créateur)` | `Attribuer les droits d'accès par défaut` |
| 4 | T1 événement | `Candidature déposée` | `Formulaire envoyé` |
| 5 | T1 item | `Valider la disponibilité des places (quota non atteint)` | `Valider la disponibilité des places` |
| 6 | T1 résultat | `Candidat accepté pour l'étape suivante` | `Candidat accepté pour quiz` |
| 7 | T5 événement | `Évaluations soumises` | `Fiches d'évaluation renseignées` |
| 8 | T5 opération | `T3 — Évaluer l'entretien` | `T5 — Synthétiser et arbitrer le bilan` |
| 9 | T8 événement | `Opération métier réalisée` | `Toute opération métier réalisée` |

Règle appliquée, sur les 9 figures : **le plan prime**, et un libellé trop long est raccourci
**seulement** s'il garde le même sens. D'où `Synthétiser et arbitrer le bilan` (au lieu de
« … de l'entretien ») et `Envoyer l'invitation au candidat et aux recruteurs` (au lieu de
« … recruteurs concernés »). Les parenthèses techniques comme `(profil créateur)` ou
`(quota non atteint)` sont retirées : ce sont des commentaires d'implémentation, pas du modèle.

**Écart assumé** : T0 conserve un item que le plan ne liste pas — « Valider l'adéquation avec les
modèles de pipeline disponibles ». Le plan le mentionne dans l'objectif de T0 (« avec ses dates,
modèle de pipeline et droits d'accès ») mais pas dans ses items ; le retirer ferait perdre une règle
de gestion réelle, ce qui dépasse une correction de libellé.

Le préfixe `T*n* — ` sur les libellés d'opération est conservé : c'est une convention de repérage
du code, pas un libellé que le plan contredit.

### T4 Conduire l'entretien, absent du code

Fidèlement au plan : événement `Date et heure de l'entretien atteintes`, opération
`Conduire l'entretien`, items `Vérifier la présence du candidat` / `Notifier les participants`, et les
**3 règles** `Candidat présent` / `Candidat absent` / `Report demandé` → `Entretien en cours` /
`Entretien annulé` / `Entretien reporté`. Dispose en 3 résultats comme T6
(`x = 30 / 220 / 410`). Le « T4 » est entièrement absent du code précédent : ni l'événement, ni
l'opération, ni les 3 branches, ni les résultats.

### Aucun changement de convention : les événements

Le plan annote l'enchaînement `event-result-T*n*` puis l'événement propre sur une ligne `event:`.
La convention du code, **conservée telle quelle**, est que l'arête entre traitements arrive sur la
**synchronisation** (`targetHandle: 'top'` du `mct-syncop`), pas sur un nœud d'événement : le
résultat du traitement précédent n'est pas redessiné comme événement du suivant.

Conséquence : une seule ligne `event:` par traitement est dessinée. **Les synchronisations ne sont
pas vides pour autant** : la flèche du `event-result` arrive bien sur le pentagone, donc il combine
2 événements et affiche `ET`. Corrigé le 2026-10-01 — voir « Opérateurs logiques des
synchronisations » plus bas.

Deux figures perdent donc un nœud d'événement, dont celle qui suivait le plan :

- l'ancien T3 (2 événements + `ET`) devient T5 Évaluation avec 1 événement ;
- T6 perd `Dossier prêt pour décision`, le plan ne donnant pour T6 qu'un `event-result-T5` et un
  `sync: (pentagone vide)` — T6 n'a donc **aucun** événement propre, son unique déclencheur est le
  résultat de T5. Dans `parcours-3` la flèche de T5 rend la lecture complète ; dans sa figure
  isolée, l'opération apparaît sans entrée visible.

Ce qu'il ne faut **pas** réintroduire : les nœuds `…-e2`/`…-e3` représentant un `event-result`.
Ni `ProcessNode.tsx` ni `edgeAnchors.ts` n'ont été touchés — `mct-event` rend
déjà un handle cible `top`, donc l'arête n'a pas besoin d'ancre nouvelle.

### Opérateurs logiques des synchronisations (corrigé le 2026-10-01)

Une première version de ce travail avait mis **tous** les `syncLabel` à `''`, en appliquant « en deçà
de 2 événements, le pentagone est vide » au seul nombre de lignes `event:`. C'était faux : un
`event-result` **est** un événement qui arrive sur la synchronisation, il n'est simplement pas
redessiné comme nœud. Un `mct-syncop` de T1 à T5 reçoit donc 2 flèches sur `top` — le lien croisé et
son événement propre — et `ET` est précisément l'opérateur qui les combine.

La règle appliquée, sans exception : **`syncLabel` est l'opérateur qui combine les flèches entrantes
réellement dessinées.**

| Traitement | Flèches entrantes | `syncLabel` |
|---|---|---|
| T0 | 1 (son événement) | `''` |
| T1 | 2 (événement + `x-t0-r1-t1-op`) | `ET` |
| T2 | 2 (événement + `x-t1-r1-t2-op`) | `ET` |
| T3 | 1 (son événement) | `''` — voir ci-dessous |
| T4 | 2 (événement + `x-t3-r1-t4-op`) | `ET` |
| T5 | 2 (événement + `x-t4-r1-t5-op`) | `ET` |
| T6 | 0 (couture T5→T6 filtrée) | `''` |
| T7 | 4 (3 résultats de T6 + son événement) | `(RET OU ATT OU REF) ET DA` |
| T8 | 1 (son événement) | `''` |

T0, T6 et T8 retombent d'eux-mêmes sur le vide, ce que le plan confirme. **T3 est l'écart assumé** :
le plan lui donne `sync: ET` parce que « Quiz validé » (T2) et « Candidat accepté pour l'évaluation »
sont deux événements, mais la couture T2→T3 n'est pas représentée dans `parcours-2` — une seule
flèche est visible, donc le pentagone reste vide, conformément à la règle ci-dessus.

Les sigles `RET`/`ATT`/`REF`/`DA` ne sont écrits que sur le pentagone de T7, où ils composent la
formule combinée exigée par le plan. Ils n'apparaissent ni dans les résultats de T6 ni dans ses
événements, conformément à la décision de ne pas parenthéser les libellés courts.

### Quatre figures de parcours

`mct_combine.ts` reste une fabrique `buildCombine`, alimentée par les 9 figures individuelles :

| Figure | Traitements | Arêtes croisées |
|---|---|---|
| `mct-v2-parcours-1` | T0, T1, T2 | 2 |
| `mct-v2-parcours-2` | T3, T4, T5 | 2 |
| `mct-v2-parcours-3` | T6, T7 | 3 (les 3 résultats de T6) |
| `mct-v2-parcours-4` | T8 | 0 |

**Deux coutures ne sont pas représentées** : T2→T3 et T5→T6. Une arête ne peut pas relier deux
figures ; `buildCombine` retire ces `CrossLink` et signale l'erreur via `console.error`. Rien n'est
ajouté pour les masquer. Les titres `1/4 … 4/4` portent la continuité, avec le texte du mémoire.

T8 est seul sur sa figure : l'audit est transverse, sans lien entrant ni sortant, il n'a jamais fait
partie de la chaîne. L'isoler garde les trois premières figures en lecture continue T0 → T7.

### Passage des figures individuelles en archive

Les 9 traitements portent `category: 'archive'` : ils ne sont plus lus isolément mais restent **la
seule définition du modèle** que les figures de parcours assemblent. C'est le même arrangement que
le MOT v2, qui importe ses MCT depuis `archive/`. Leurs **ids sont conservés** (`mct-v2-N-*`), donc
positions et verrous persistés survivent.

## Fichiers

| Action | Fichiers |
|---|---|
| Créer | `src/diagrams/archive/mct_3_planification.ts`, `…/mct_4_conduite_entretien.ts` |
| Déplacer (git mv) | les 7 `src/diagrams/traitements/v2/mct_[0-6]_*.ts` → `src/diagrams/archive/` |
| Renommer | `mct_3_entretien` → `mct_5_evaluation`, `mct_4_decision` → `mct_6_decision`, `mct_5_annulation` → `mct_7_annulation`, `mct_6_audit` → `mct_8_audit` |
| Réécrire | `src/diagrams/traitements/v2/mct_combine.ts` |
| Modifier | `src/diagrams/index.ts` |

Ni `ProcessNode.tsx`, ni `edgeAnchors.ts`, ni `DiagramCanvas.tsx`, ni `RelationshipEdge.tsx` /
`TraitementEdge.tsx` n'ont été modifiés.

## Validation

- [x] `npx vite build` : OK — 643.39 kB / 174.74 kB gzip.
**63 ids de figures, 0 doublon** (MCD 12 · MCT 22 · MLD 12 · MPD 11 · MPT 2 · SAT 2 · MOT 1 ·
palette 1).
- 22 figures MCT en segment droit (les 4 parcours + les 9 v2 archivées + les 9 v1), sans toucher
  au code : le critère `diagram.id.startsWith('mct')` les couvre déjà.
- [x] `npm run lint` : **74 erreurs**, toutes de nature préexistante.

### Sur la baseline de lint

La baseline n'est pas un nombre fixe : **le MCT produit une erreur `TS2322: Type '"process"' is not
assignable to type '"entity"'` par nœud**, un par nœud, à cause d'une incohérence de typage ancienne
(`EntityNode['type']` ne déclare que `'entity'`, alors que toutes les données de traitement écrivent
`'process'`). Le décompte suit donc le nombre de nœuds MCT.

| | Avant | Après |
|---|---|---|
| Erreurs hors MCT | 40 | 40 |
| Erreurs sur nœuds MCT (27 → 34) | 27 | 34 |
| `mct_combine.ts` | 1 | **0** |
| **Total** | **68** | **74** |

Écart = +8 (les deux figures créées : 3 + 5 nœuds) − 2 (deux événements retirés) − 1 (`mct_combine.ts`
corrigée en réécrivant ses helpers typés). **Aucune nouvelle nature d'erreur.**

## Points de vigilance

- **Positions périmées de `mct-v2-parcours-2`.** L'id ne change pas et les préfixes de nœuds sont
  identiques (`t3-mct3-*`…), donc les positions sauvegardées dans
  `figures_flow:diagram:mct-v2-parcours-2` sont réappliquées. Les nœuds communs (`t3-mct3-op`,
  `t3-mct3-r1`) gardent ainsi l'ancienne disposition au lieu de la nouvelle. Effet cosmétique, de
  quelques nœuds. Vider la clé règle le problème.
- **Les 3 arêtes T6 → T7 convergent sur le même `top`.** C'est le cas le plus dense du MCT : elles
  partagent l'ancrage résolu, donc l'offset les écarte, mais en segment droit elles forment un
  éventail serré.
- **T3 est le seul traitement à item long** (`Envoyer l'invitation au candidat et aux recruteurs`,
  52 caractères) — à contrôler au navigateur sur la largeur de carte.
- **Validation manuelle** : T3, T4, `parcours-2`, `parcours-3`, `parcours-4`, une figure archivée, et
  le MOT v2 inchangé.

## Reporté

- **MOT v3** : demandé par `nouveaux_mct.md` (MOT bâti sur les MCT v2), non fait. Le MOT v2 continue
  d'importer les MCT **d'archive v1**. Créer un MOT v3 suppose de généraliser les 6 littéraux
  `'mot-organisationnel-v2'` de `DiagramCanvas.tsx` (L28, 102, 103, 105, 116, 167) et le calcul des
  rangées `rowT0…rowT6` codées en dur dans `mot_organisationnel_v2.ts`.
- **Option A** : sanitisation des `edge_sides` périmées au chargement
  (`plans/implementations/20260830_points_ancrage_edges.md`).