# 20261025 — Audit des pointillés des 15 figures UML (cible, sans statut)

Suite de `20261025_uml_cible_sans_statut.md` (qui traite la figure de
déploiement). Demande : « je vois qu'il y a le même problème sur plusieurs
figures UML où Muse Spark a mis des pointillés sur les cibles non implémentées ;
attention aux parties où les pointillés sont réellement conventionnels ».

## Méthode

Script d'extraction sur les 15 SVG de `src/diagrams/uml/claude/` : pour chaque
élément porteur de `stroke-dasharray` (attribut ou `style`), on relève le tag, la
géométrie (`rect`/`ellipse`/`line`/`path`/`polygon`), la présence de
`marker-end` et les 3 textes les plus proches. Les `<g>` ne portent jamais le
pointillé (vérifié : 0), donc aucun héritage à démêler.

⚠️ Chaque élément porte la valeur **deux fois** (attribut `stroke-dasharray="…"`
+ `style="stroke-dasharray:…"`). Les comptes bruts sont donc le double des
éléments : **116 occurrences = 58 éléments**.

## Classement

| Famille | Éléments | Figures | Verdict |
|---|---|---|---|
| `«include»`/`«extend»` | 16 | 7 UC | ✅ convention (flèches horizontales entre les deux colonnes de UC, x 297↔391, toujours étiquetées) |
| Dépendances | 10 | `composants_v3` | ✅ règle 5 (aucune forme pointillée : 0 `rect`/`ellipse`) |
| Séquences | 23 | 2 séquences | ✅ 8 lifelines, 4 séparateurs `alt`/`opt`, 11 retours (tous orientés droite→gauche) |
| Catégorie « droit contextuel » | 6 | 2 UC recruteur | ❌ notation inventée, **pas** un statut |
| Filets séparateurs | 3 | 2 états | ❌ mise en page, pas UML |
| Statut « cible/proposé » | 0 | — | ✅ déjà traité (déploiement) |

3 figures n'avaient aucun pointillé : `cas_utilisation_global_v2`,
`etats_etape_pipeline_v2`, `deploiement_cible`.

### Ce que le pointillé ne disait pas

- Les 4 UC cerclés (« Évaluer un candidat » ; « Rouvrir une étape », « Corriger
  un quiz », « Traiter une demande ») **existent** : rollback, correction
  manuelle, demandes de groupe, grille d'évaluation. Ce n'était donc pas
  « non implémenté » mais « soumis à un droit contextuel », renvoyé à une note
  violette par une puce elle aussi pointillée.
- **Provenance** : Claude, pas Muse Spark. `plans/uml/echanges/results_claude/`
  contient les mêmes 12 occurrences et les mêmes textes au caractère près ;
  l'intégration n'a fait que copier.
- La consigne « pointillés / non piloté » des échanges (`lot1_qa4` l.73,
  `lot1_qa7` l.30) ne concernait que `AWAITING_VALIDATION`, et Claude a tranché
  par l'**omission**, pas par le pointillé : aucune figure d'état ne portait de
  statut pointillé.

### Le même défaut, en texte

4 notes de bas de figure parlaient du **code** (existant), pas de la cible :
« transitions de la matrice sans endpoint : non représentées », « l'endpoint
update … contourne la matrice », « `EXPIRED`/`CANCELLED` définis dans le code
mais jamais utilisés », « `AWAITING_VALIDATION` défini dans le code mais jamais
utilisé ». Supprimées : la cible n'a pas à commenter les trous de l'existant.

## Modifications

| Fichier | Points retirés | Textes retirés | `viewBox` |
|---|---|---|---|
| `cas_utilisation_recruteur_campagnes_entretiens.svg` | 1 ellipse UC (cy=282) + 1 puce (cx=115) | note « Cas soumis à un droit contextuel… » | 686×365 → **686×334** |
| `cas_utilisation_recruteur_suivi_v2.svg` | 3 ellipses UC (cy=282, 378, 426) + 1 puce (cx=115) | idem (variante « groupe, surcharge… ») | 686×510 → **686×479** |
| `etats_campagne.svg` | filet y=480 | 2 notes de code (y=625, 639) | 680×655 → **680×616** |
| `etats_tentative_quiz.svg` | filets y=225 et y=435 | 1 note de code (y=612) — la note métier « *En attente* bloque la validation… » est conservée | 680×625 → **680×603** |
| `etats_etape_pipeline_v2.svg` | — | 1 note de code (y=448) | 680×470 → **inchangé** (cadre `0 0 680 470`) |

- [x] `stroke-dasharray` retiré **uniquement** sur les 4 ellipses (édition ligne
      à ligne) ; les 3 + 2 flèches `«include»`/`«extend»` des mêmes fichiers
      gardent le leur
- [x] `<desc>` réécrits : plus de « ce dernier cas dépendant d'un droit
      contextuel » ni de « selon ses droits contextuels »
- [x] `viewBox` recadré à `maxY + marge d'origine` (17/18/16/13 px), calculé
      après suppression et contrôlé (aucun élément coupé)
- [x] ordre/largeur des figures inchangés : seules des notes et des filets sont
      partis, aucun nœud ne bouge
- [x] masque de texte orphelin laissé dans `etats_etape_pipeline_v2`
      (`<defs><mask>` : `rect fill="black"` invisible, sans effet de rendu)
- [x] `plans/uml/verification.md` : section « Audit des pointillés »
- [x] `plans/uml/archi_regles.md` : point 3 de l'addenda précisé (note UML
      autorisée ; catégorie, filet, statut interdits)

## Vérifications

- [x] 15/15 SVG bien formés (`[xml]`)
- [x] **0 forme pointillée** dans tout le corpus (`rect`/`ellipse`/`polygon`/`circle`)
- [x] pointillés restants : **49 éléments = 98 occurrences brutes**, dont 37
      flèches + 12 lignes sans pointe (lifelines et séparateurs de cadre)
- [x] aucune mention résiduelle de « droit contextuel », « jamais utilisé »,
      « endpoint », « matrice », « non représenté » (ni `text` ni `desc`)
- [x] `npx vite build --outDir %TEMP%/…`

## Reste à faire

- [ ] relecture visuelle `npm run dev` des 5 figures (cadres pleins, pas de trou
      en bas, sections toujours lisibles sans filet)
- [ ] refaire les exports ⤓ des 4 figures dont le `viewBox` change
- [ ] `body.typ` ne référence encore aucune figure UML ; légendes à écrire à
      l'insertion
