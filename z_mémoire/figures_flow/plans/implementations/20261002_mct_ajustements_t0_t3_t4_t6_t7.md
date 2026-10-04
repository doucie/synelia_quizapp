# Plan — Ajustements MCT v2 : T0, T3, T4, T6, T7

Cinq traitements revus sur la figure, après relecture critique du modèle :

- **T0** — un item d'opération ne disait pas ce qu'il vérifiait ;
- **T3** — la planification n'avait qu'une branche, alors qu'un créneau peut être refusé
  ou reporté ;
- **T4** — un report demandé était présenté comme s'il était accordé ;
- **T6** — aucun événement déclencheur, et une décision ternaire ;
- **T7** — le libellé de synchronisation était rogné par la forme du pentagone.

`plans/mct/nouveaux_mct.md` reste la **source de vérité** : c'est lui qui porte le
modèle, le code suit.

---

## 1. T0 — item pipeline

`Valider l'adéquation avec les modèles de pipeline disponibles` ne disait pas l'adéquation
de quoi avec quoi. Vérification dans le back : la seule règle réelle est que le modèle de
pipeline retenu doit **exister et être actif**, à défaut de quoi le système reprend le modèle
par défaut (`CampaignsBusiness.create`, contrôle du `pipeline_template_id`). Aucune règle
de compatibilité n'existe ailleurs.

`Vérifier la disponibilité du modèle de pipeline retenu`.

Écart assumé du 2026-10-01 refermé : `plans/implementations/20261001_mct_t0_t8_alignment.md`
avait conservé « le plan le mentionne dans l'objectif de T0 mais pas dans ses items ».

- [x] `src/diagrams/archive/mct_0_creation_campagne.ts`

## 2. T3 — le créneau peut ne pas être confirmé

Une seule branche (`Toujours`) ne disait rien d'un refus de date ni d'une demande de
replanification. Deux branches suffisent : `Créneau confirmé` / `Report demandé`, les deux
cas « ça ne se planifie pas » étant couverts par la seconde.

| | Avant | Après |
|---|---|---|
| règles | `Toujours` | `Créneau confirmé` / `Report demandé` |
| résultats | `Entretien planifié` | `Entretien planifié` / `Demande de report transmise` |
| positions | `x: 220` | `x: 80 / 400` (gabarit 2 résultats, comme T6 et T7) |

**`r1` reste `Entretien planifié`** : c'est la branche qui alimente `x-t3-r1-t4-op`, le lien
vers T4. Les résultats sont terminaux — ils ne rebouclent pas sur l'opération (choix arbitré
le 2026-10-02 : une arête réflexive dans `parcours-2` se superposerait aux trois traitements
de la rangée).

- [x] `src/diagrams/archive/mct_3_planification.ts`

## 3. T4 — le report n'est pas accordé

Quand un report est demandé sur le moment, il n'est pas accepté : la demande part vers le
responsable. `Entretien reporté` affirmait le contraire.

- `Entretien reporté` → `Demande de report transmise`

Les règles (`Candidat présent` / `Candidat absent` / `Report demandé`) et les items ne
changent pas. **Aucun item ajouté** : `Transmettre la demande de report au responsable` a été
écarté, trop long (48 car.) et redondant avec le résultat — d'où l'absence d'ajout de hauteur
sur la carte. Le décalage des résultats ne vient donc que du §7 (ils passent à `y: 450`).

- [x] `src/diagrams/archive/mct_4_conduite_entretien.ts`

## 4. T6 — événement déclencheur et décision binaire

Deux corrections :

1. **Un événement manquait.** T6 était le seul traitement sans ligne `event:` ; la décision
   ne se prend pas toute seule à l'issue de T5, le recruteur la provoque. Ajout de
   `mct6-e1` (`Prise de décision`) et de l'arête `e-mct6-e1-op` — T6 adopte la structure des
   8 autres traitements.
2. **`Candidat en attente` (ATT) est retiré.** La décision est binaire : c'est ce qui permet
   à T7 de formuler sa synchronisation en deux termes. `r3` disparaît, `r2` devient le
   refus, les résultats passent en `x: 80 / 400`.

**Les parenthèses des sigles sont conservées** — `Candidat retenu (RET)` / `Candidat refusé
(REF)`. C'est une exception à la règle « parenthèses techniques retirées » : ces sigles sont
les référents de la formule `(RET OU REF) ET DA` écrite sur le pentagone de T7. Sans eux, la
formule n'a plus de sens lisible sur la figure. La règle est restreinte à `(profil créateur)`
et `(quota non atteint)`, et l'exception est écrite dans
`plans/mct/nouveaux_mct.md` → « Raccourcissement des libellés ».

Le pentagone de T6 reste vide : la couture T5→T6 n'est pas représentée dans `parcours-3`, donc
une seule flèche y arrive (la sienne). Exactement le cas de T3 — voir la règle `syncLabel`
dans `AGENTS.md`.

- [x] `src/diagrams/archive/mct_6_decision.ts`

## 5. T7 — `(RET OU REF) ET DA`

La disparition de `ATT` se répercute sur la formule de synchronisation. Le lien croisé
`x-t6-r3-t7-op` est retiré de `mct_combine.ts` : les arêtes croisées de `parcours-3` passent
de 3 à 2, soit **2/2/2/0** sur les quatre figures.

- [x] `src/diagrams/archive/mct_7_annulation.ts`
- [x] `src/diagrams/traitements/v2/mct_combine.ts`

## 6. Libellé de synchronisation rogné

**Symptôme** : sur T7, le bas du libellé `(RET OU REF) ET DA` disparaissait.

**Cause** : le clip-path du pentagone réserve le rectangle pleine largeur à ses **50 %
supérieurs** seulement — `polygon(0% 0%, 100% 0%, 100% 50%, 50% 100%, 0% 50%)`. La boîte fait
`12 + 18 + 12 = 42 px` avec `py-3` (ligne de 12 px / 1.5 = 18 px), donc **21 px utiles** en
partie haute, alors que le texte descend à ~30 px : les ~9 px du bas tombent dans la partie
effilée, où la conique mord de part et d'autre.

C'est un défaut de **hauteur**, pas de largeur : la largeur n'a aucune prise sur le rognage,
puisque la conique est calculée sur les 50 % de la *hauteur*.

**Correctif** : `py-3` → `pt-3 pb-7` sur les deux pentagones à 12 px, `py-1` → `pt-1 pb-4` sur
celui à 8 px (+10 px de hauteur). La pointe s'étire vers le bas, la bande utile passe de 21 à
26.75 px, et le libellé tient dans le rectangle plein. La largeur d'origine est **conservée** :
les conteneurs restent en `items-center` et le pentagone garde son `fit-content`
(`min-w-[80px]`), ce qui est la convention Merise.

La valeur vient de la règle `paddingBottom ≥ paddingTop + 2 × encre − lineBox` : à 12 px, avec
une encre de capitale ≈ 1.4em majorée de la descendante de parenthèse (16.8 px) et une ligne de
18 px, il faut `12 + 2 × 16.8 − 18 ≈ 27.6 px`, donc **28** (`pb-7`).

| Pentagone | Police | Padding | Contexte | Conséquence |
|---|---|---|---|---|
| `MctSyncop` | 12 px (9 px sur T7) | `pt-3 pb-7` | pentagone **fusionné** à l'opération dans un même nœud | mange l'écart vers les résultats → voir §7 |
| `MctSync` | 12 px | `pt-3 pb-7` | nœud autonome, opération 68–110 px plus bas | rien à reprendre dans les MCT legacy, **sauf** le MOT v2 qui les réutilise en positions absolues → voir §7 |
| `MotSync` | 8 px | `pt-1 pb-4` | **code mort**, `motMatrix` n'est fourni par aucune figure enregistrée | aucun effet |

**Faux remèdes, revertés dans la foulée** : une première version passait le conteneur de
`MctSyncop` en `items-stretch`, ce qui alignait chaque pentagone sur la largeur de son
opération (280–356 px au lieu de ~130). C'était traiter la mauvaise dimension, et les
pentagones devenaient massifs — ce qui n'est pas la convention Merise. Le revert est fait,
`items-center` est revenu. Une seconde version s'est arrêtée à `pb-[18px]` (+6 px) : la coupe
en bande persistait sur T7. Ne pas revenir à l'une ou l'autre.

**Taille de police : `syncFontSize`**. Rétrograder n'était pas une option, le libellé devant
rester sur une seule ligne. `(RET OU REF) ET DA` est le seul libellé assez long pour déformer
le gabarit — à 12 px il produit un pentagone de 162 px de large sous une opération de 280 px.
`EntityNodeData` porte donc un champ optionnel `syncFontSize?: number`, lu **uniquement** par
`MctSyncop` et composé avec le curseur global :
`calc(var(--mct-sync-scale, 1) * ${syncFontSize ?? 12}px)`. Seul `mct_7_annulation.ts` le
renseigne (`syncFontSize: 9`). C'est un réglage **typographique** : il rend le libellé
proportionné à son opération, il ne sert pas à éviter le rognage — c'est le padding qui s'en
charge.

**Échelle de correction** : la valeur exacte dépend des métriques de Cabinet Grotesk
(ascendante / descendante), qui ne sont pas mesurables ici — `fontTools` n'est pas installé.
La règle ci-dessus donne 28 px à 12 px et 16 px à 8 px ; la marge réelle est de +2.15 px sur le
libellé de T7 à 9 px, et de +0.2 px sur un éventuel libellé 12 px — ce dernier cas est sans
conséquence puisque les libellés à 12 px sont `ET` (2 caractères) ou vides, trop étroits pour
être atteints par la conique. Si un libellé 12 px long apparaît un jour : `pb-7` → `pb-8`.
Le correctif reste exact à l'échelle de police 1 : au-delà de ~1.3 sur le curseur `sync` de la
barre MOT, le libellé peut être rogné à nouveau. Rendre ça exact à toute échelle coûterait
+12 px et des paddings en `em` — écarté.

- [x] `src/components/Nodes/ProcessNode.tsx`
- [x] `src/types/index.ts`
- [x] `src/diagrams/archive/mct_7_annulation.ts`

---

## 7. Descente des rangées de résultats

Le `MctSyncop` étant fusionné avec son opération, ses +10 px se retranchent sur l'écart qui
sépare l'opération de ses résultats. Cet écart était déjà d'environ **4 px pour T0** (3 items
+ 1 règle ⇒ opération ≈ 174 px, pentagone 42 px, résultats à `y: 420`) : les +10 px l'auraient
amené à ~0 et la flèche aurait disparu.

Les résultats descendent donc de **+30 px**, ce qui rend ~24 px à T0 :

| Fichiers | Avant | Après |
|---|---|---|
| `mct_0`, `mct_1`, `mct_3`, `mct_4`, `mct_6`, `mct_7`, `mct_8` | `y: 420` | `y: 450` |
| `mct_2_quiz`, `mct_5_evaluation` | `y: 400` | `y: 450` |

T2 et T5 étaient 20 px plus haut que les sept autres : `450` **normalise les neuf** sur la
même valeur. Au passage, l'incohérence disparaît.

Le `MctSync` des figures legacy, lui, est un nœud autonome : ses +10 px ne rognent que
l'écart de 68–110 px qui le sépare de son opération. **Sauf `motOrganisationnelV2`**, qui
réutilise précisément ces figures legacy en positions absolues : ses 7 traitements gagnent 10 px
chacun alors qu'ils débordent déjà les `rowHeights` par défaut (400 px pour un traitement legacy
qui mesure ~510 px). C'est le point le plus à surveiller côté MOT.

Ce qui **ne change pas** : l'événement reste à `y: 20` et l'opération à `y: 200` dans les neuf
traitements — l'alignement T0–T8 décrit par
`plans/implementations/20261001_mct_t0_t8_alignment.md` est préservé, seule la rangée du bas
bouge.

`ROW_HEIGHT` reste à **640** : le cadre le plus bas tombe à ≈ 486 et la rangée suivante
démarre à 660, il reste 174 px de marge. Le commentaire « le nœud le plus bas d'un MCT est à
y ≈ 500 » de `mct_combine.ts` reste exact.

- [x] les 9 fichiers de `src/diagrams/archive/mct_[0-8]_*.ts`

---

## Documentation

- [x] `plans/mct/nouveaux_mct.md` — items T0, `rules`/`results` T3, `results` T4, T6
      (événement + `rules`/`results` + suppression du paragraphe « seul traitement sans
      ligne `event:` »), T7 (retrait de `ATT`), exception sur les sigles dans «
      Raccourcissement des libellés », objectif de T6 dans la vue métier, forme du pentagone
      (§ « Trapèze → pentagone »), coquilles `: event:` et `event result-T1:` corrigées.
- [x] `AGENTS.md` — bloc « État actuel (MCT v2 = les 9 traitements T0–T8) » et « Piège
      localStorage ».

## Vérification

- [x] `npx tsc --noEmit` — 75 erreurs, soit les 74 préexistantes de `HEAD` + celle du nœud
      `mct3-r2` ajouté (même cas que tous les autres nœuds : `type: 'process'` non assignable
      au `'entity'` du `NodeProps` de React Flow). Aucune nouvelle classe d'erreur.
- [x] `npx vite build` — OK. `dist/` étant versionné, `git checkout -- dist` le remet à l'état
      de `HEAD` juste après.
- [ ] **Contrôle visuel** : vider `figures_flow:diagram:mct-v2-parcours-1` à `-4` (bouton `↺`
      de la toolbar) avant de juger — les positions sauvegardées des nœuds `t0-*` à `t8-*` sont
      antérieures aux nouveaux `y` de résultats. Les `edge_sides` périmées sont ignorées
      d'office : `DiagramCanvas` les valide contre `validHandles`.
- [ ] Sur `parcours-2` / `-3` : T3 et T6 doivent avoir 2 résultats écartés en 80/400, T6 son
      événement `Prise de décision`, T3 ses 2 branches, T7 `(RET OU REF) ET DA` entièrement
      lisible dans le pentagone.
- [ ] Les 9 traitements : pentagone redevenu étroit (~130 px, largeur de son libellé), pointe
      +10 px plus basse, écart opération → résultats lisible partout.
- [ ] T7 : `(RET OU REF) ET DA` entièrement lisible, à 9 px, sur une seule ligne, et
      proportionné à l'opération de 280 px qu'il surmonte.
- [ ] Une figure legacy (`mct-1a-candidature`) : rien ne doit avoir bougé, le pentagone étant
      suivi à 68–110 px.
- [ ] `mot-organisationnel-v2` : ses 7 traitements legacy gagnent 10 px chacun alors qu'ils
      débordent déjà les `rowHeights` (400 px par défaut pour ~510 px de traitement) — vérifier
      qu'aucun recouvrement n'apparaît entre lignes.
- [ ] Overlay `DEBUG` sur `parcours-3` : le groupe `top` de T7 passe de 4 à 3 flèches, donc
      des offsets de ±14 px au lieu de −28 / 0 / +28.
