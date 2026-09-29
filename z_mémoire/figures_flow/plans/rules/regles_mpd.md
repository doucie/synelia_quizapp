# Règles Merise — MPD

> Source : règles de transformation MLD → MPD (méthode Merise).
> Utilisées comme référence méthodologique pour le mémoire (§7.7), en continuité avec les règles
> MCD (§7.5, `plans/rules/regles_mcd.md`) et MLD (§7.6, `plans/rules/regles_mld.md`).
> Application au projet : `plans/implementations/20260928_passage_mld_mpd.md`.

---

## Principe directeur — le MPD est un SGBD, pas un modèle

- Le MCD décrit **le monde réel**, le MLD décrit **la structure relationnelle**, le MPD décrit
  **les tables d'un SGBD précis**. Ici : **MySQL** (cf. `quizapp/` — JPA/Hibernate, migrations
  Flyway).
- Le passage MLD → MPD est donc **une traduction + un ajout de décisions physiques**, jamais une
  réécriture conceptuelle :
- **Ce qui est reconduit à l'identique** : le nombre de tables, les colonnes, les clés primaires
  (y compris les clés composites), les clés étrangères et leur **nullabilité**. Le MLD a déjà
  tranché la structure ; le MPD ne la remet pas en cause.
- **Ce qui est ajouté** : les types SQL concrets, les contraintes `NOT NULL` / `UNIQUE` /
  `FOREIGN KEY`, les politiques de suppression, le moteur, le charset, les index, les colonnes
  techniques.
- **Ce qui change** : la **convention de nommage** (français conceptuel → anglais aligné code),
  seul changement de forme autorisé au passage — et c'est précisément ce que documente la
  **table de correspondance** (ci-dessous).
- **Ce que le MPD n'invente jamais** : une colonne métier qui ne correspond à aucun attribut du
  MLD, ni une table qui ne correspond à aucune relation. Toute colonne physique absente du MLD
  est un **écart documenté** (règle 9), pas un ajout au MLD.
  > *Ex : la BD physique porte `applications.aggregated_quiz_score`, absent du MLD. Au MPD on ne
  > l'ajoute pas à la figure : on la **documente** comme dénormalisation assumée (règle 9).*

---

## 1. Chaque table logique devient une vraie table SQL, propre au SGBD ciblé

- Le MLD est en théorie indépendant du SGBD ; le MPD est écrit pour un moteur précis — ici
  **MySQL**.
- Chaque relation du MLD donne une table réelle, nommée en **minuscules snake_case**.
  > *Ex : la relation `CAMPAGNE` du MLD devient la table `campaigns`.*

---

## 2. Chaque attribut reçoit un type de données concret du SGBD

- Le type conceptuel (« texte », « entier », « booléen », « date ») devient un type SQL réel,
  choisi selon le volume et la précision attendus :
  - Texte court → `varchar(n)` ; texte long → `text` / `longtext`
  - Entier → `int`, `bigint`, ou `int unsigned` selon le volume et le signe attendus
  - Date/heure → `datetime` (date seule → `date`)
  - Booléen → `tinyint(1)` **ou** `bit(1)`
  - Score → `decimal(p,s)`
- Le MPD tranche là où le MLD ne le fait pas ; le choix doit être **homogène sur toute la base**
  (règle de cohérence).

> **Cas du projet** : la BD physique melange `is_deleted tinyint(1)` et `app_config.is_active
> bit(1)` pour du booléen — incohérence à uniformiser. Le MPD retient **`tinyint(1)`**
> partout, plus lisible en SQL et aligné sur le code applicatif.

---

## 3. Chaque identifiant conceptuel devient une clé primaire physique avec un mécanisme de génération

- L'identifiant du MLD devient une PK `AUTO_INCREMENT` : c'est le **niveau** où l'on choisit le
  mécanisme de génération, absent du MLD.
  ```sql
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  ```
- Le type `UNSIGNED` est retenu car une clé primaire n'a pas vocation à être négative ; il doit
  être **rigoureusement identique** sur la PK et sur les FK qui la référencent.
- **Une clé primaire composite n'est pas concernée** : le MLD a déjà fixé la composition
  (jonctions N,N), on la reconduit telle quelle, sans `AUTO_INCREMENT`.
  > *Ex : `PROPOSER(#id_campagne, #id_formulaire)` → `campaign_form` en PK composite
  > `(campaign_id, form_id)` — aucune colonne `id` n'est inventée.*

---

## 4. Chaque clé étrangère du MLD devient une contrainte `FOREIGN KEY` réelle, avec une politique de suppression à trancher

- Le MLD dit juste « il y a une FK » ; le MPD doit décider **ce qui se passe** si la ligne
  référencée est supprimée.
  ```sql
  FOREIGN KEY (id_utilisateur_destinataire) REFERENCES user(id)
    ON DELETE CASCADE   -- ou SET NULL, ou RESTRICT, selon la règle métier
  ```
- Les trois politiques ont un sens métier distinct :
  - `CASCADE` — l'enfant n'a **aucune existence propre** sans le parent ;
  - `RESTRICT` — le lien fait partie du **cycle de vie métier**, la suppression doit être traitée
    explicitement (archivage, blocage) ;
  - `SET NULL` — le lien est un **pointeur optionnel**, l'information est conservée sans sa cible.
- C'est une vraie décision à documenter, pas un détail.

> **Cas du projet** : la suppression d'un `user` — ses `notifications` doivent-elles disparaître
> (`CASCADE`) ou juste perdre leur destinataire (`SET NULL`) ? Le MPD retient `SET NULL` :
> une notification est un **historique**, elle survit à son destinataire. Cette décision est
> tracée dans le script d'enrichissement (`plans/mpd/`) plutôt que répétée sur chaque figure.

---

## 5. Les cardinalités minimales du MLD deviennent des contraintes `NOT NULL` / nullable

- Le MLD a déjà traduite chaque cardinalité en nullabilité ; le MPD la **matérialise** en
  contrainte SQL.
  - `(1,1)` → `NOT NULL` (déjà porté par `NOT NULL` au MLD)
  - `(0,1)` → colonne **nullable** (pas de contrainte)
- La règle MPD ne crée donc **aucune** nouvelle nullabilité : elle en fait une **contrainte
  opposable au SGBD**, que l'application ne peut plus contourner.
  > *Ex : la relation `CONVOCATION` porte `#id_entretien` **NOT NULL** au MLD (patte `(1,1)` de
  > l'association `proposer` : aucune convocation sans entretien) → `convocation.interview_id`
  > `INT UNSIGNED NOT NULL`.*

> **Attention** — la colonne ne doit pas être rendue nullable « parce que la base physique
> l'est ». La logique métier commande, la base s'ajuste ensuite (cf. règle 4 de `regles_mld.md`).

---

## 6. Les contraintes d'unicité deviennent des `UNIQUE KEY`

```sql
UNIQUE KEY (email), UNIQUE KEY (username)
```
- Le MLD ne porte pas d'unicité (c'est une notion physique) ; le MPD en introduit là où une
  contrainte d'unicité est implicite dans le métier — et c'est le **seul** niveau où l'on peut
  l'ajouter.
- Une clé étrangère composite peut être unique **sans** sa colonne `id` : c'est la contrainte
  qui remplace une colonne surrogate.
  > *Ex : un candidat ne peut avoir qu'une seule candidature par campagne → `UNIQUE
  > (candidate_id, campaign_id)` sur la table de liaison, sans clé primaire surrogate.*

> **Cas du projet** : le MLD actuel ne porte aucun candidat `UNIQUE` (`user.email` n'est pas
> déclaré unique au MLD) ; les unicités réelles (`email`, `username`, `token`) sont des choix
> applicatifs, portées par l'implémentation JPA et non par la figure. Elles sont rappelées dans
> le script d'enrichissement.

---

## 7. On ajoute les colonnes techniques absentes du MLD conceptuel

- C'est **exactement ici**, et seulement ici, qu'apparaissent tous les champs qu'on a exclus du
  MCD/MLD depuis le début : `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`,
  `search_string`. Le MPD est le seul niveau où ils ont leur place légitime.
- Ces colonnes sont **systématiques** (présentes sur toutes les tables) : elles ne portent pas
  d'information métier propre à une table.
- Elles alimentent l'audit, le soft delete et la recherche plein texte.

> **Cas du projet** : voir la **note de projet** ci-dessous — la règle est appliquée, mais
> **déléguée à un script SQL unique** au lieu d'être répétée sur les 21 tables des figures.

---

## 8. On choisit les index nécessaires aux performances, au-delà des clés

```sql
CREATE INDEX idx_mail_log_status ON mail_log(status);
```
- Décision **purement physique**, impossible à déduire du MLD : elle se prend à partir des
  **requêtes attendues** (ex. filtrer souvent les emails en échec).
- On n'indexe que ce qui est réellement interrogé ; un index en trop coûte à l'écriture.

> **Cas du projet** : les index sont listés dans `plans/mpd/colonnes_techniques.sql`, pas
> répétés sur les figures (note de projet).

---

## 9. On tranche les décisions de dénormalisation volontaire

- C'est le niveau où les écarts documentés deviennent officiels : `applications.aggregated_quiz_score`,
  `current_pipeline_stage_label` — absents du MLD théorique, ajoutés ici pour éviter des recalculs
  coûteux à chaque lecture.
- Le tableau récapitulatif des écarts devient, à ce stade, la **justification formelle** de ces
  ajouts : chaque colonne dénormalisée doit répondre à trois questions — *quelle requête
  évite-t-elle ?*, *à quel coût de cohérence ?*, *qui la rafraîchit ?*.
- Une colonne dénormalisée doit rester **identifiable** : on doit pouvoir la supprimer le jour où
  la requête qu'elle évite disparaît.

> **Cas du projet** : les colonnes `current_*` et `aggregated_*` de `applications` sont
> recensées (règle appliquée) et documentées dans `plans/mpd/`, mais **pas dessinées** dans les
> figures — voir la note de projet (ci-dessous). Rappel : le MCD/MLD reste la `bd_cible` (principe acté
> le 20260922), la dénormalisation est un optimum de performance, pas un modèle.

---

## 10. On choisit moteur de stockage, charset et collation

```sql
ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
```
- `InnoDB` pour les **transactions** et les **contraintes FK** (MyISAM les ignore) ;
- `utf8mb4` pour supporter les accents **et** les emoji sur 4 octets ;
- la collation détermine le comportement des comparaisons (insensibilité à la casse et aux
  accents pour `utf8mb4_unicode_ci`).

> **Cas du projet** : ces trois valeurs sont **identiques sur toutes les tables** ; elles sont
> posées une seule fois dans `plans/mpd/colonnes_techniques.sql` plutôt que répétées sur chaque
> bloc de figure (note de projet).

---

## 11. Les structures complexes exclues du MCD peuvent être réintégrées ici en JSON

- `pipeline_stage.config_json` — plutôt que créer une sous-table pour chaque variante de
  configuration, on stocke une structure flexible en JSON.
- Compromis pratique assumé au niveau physique uniquement : le MCD/MLD restent en 3FN, seul le
  stockage est assoupli pour une configuration *évolutive par nature*.
- Contrepartie à assumer : pas de contraintes sur le contenu, pas de jointure possible, index
  uniquement via les colonnes *générées*.

> **Cas du projet** : `evaluation_grid_criterion.config_json` est recensé (règle appliquée) et
> documenté dans le script d'enrichissement, pas dans la figure.

---

## 12. Les noms passent de la convention conceptuelle (français) à la convention physique réelle (anglais, alignée code)

```
CONVOCATION.statut_reponse → convocation.response_status
CANDIDATURE.id_candidature → applications.id
UTILISATEUR.est_en_ligne → user.is_online
```
- C'est ici que la **table de correspondance MCD↔MPD** (ci-dessous) prend tout son sens : elle documente
  exactement cette traduction, règle par règle.
- Le nom physique suit la **convention de nommage du code** (camelCase côté Telosys/JPA,
  snake_case en base), et non une traduction littérale.
  > *Ex : `#id_modele_pipeline` devient `pipeline_template_id` (le préfixe `id_` disparaît au profit
  > d'un suffixe `_id`, aligné sur le code Java).*

---

## Note de projet — ce que les figures MPD ne montrent pas

> Les règles **7, 8, 9, 10 et 11 sont appliquées** au projet. Elles ne sont simplement **pas
> répétées colonne par colonne sur les figures**, pour deux raisons :
>
> 1. **Lisibilité** — répéter 5 colonnes d'audit sur 21 tables noierait la lecture du diagramme
>    sous des informations identiques partout ; le MPD affiché perdrait sa valeur pédagogique
>    (le pédagogique, au MPD, c'est le typage et les contraintes de suppression).
> 2. **Cohérence de principe** — le MCD/MLD constitue la `bd_cible` (principe acté le 20260922) :
>    une colonne qui n'est pas dans le MLD n'a pas sa place **dans la figure**. Elle est
>    documentée, pas illustrée.
>
> **Où est-ce que ça vit à la place :** `plans/mpd/colonnes_techniques.sql` (un seul script,
> une section par règle) + `plans/mpd/README.md`.
>
> | Règle | Dans les figures | Dans le script |
> |---|---|---|
> | 7 — colonnes techniques | ❌ non | ✅ `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted` sur les 21 tables |
> | 8 — index | ❌ non | ✅ index sur les colonnes interrogées (`applications.status`, `application_progress.progress_status`, …) |
> | 9 — dénormalisation | ❌ non | ✅ bloc commented `applications.current_*` / `aggregated_*` |
> | 10 — moteur / charset | ❌ non | ✅ en-tête `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` |
> | 11 — JSON | ❌ non | ✅ `evaluation_grid_criterion.config_json` |
>
> **Conséquence de lecture :** une figure MPD = le MLD, avec ses types et ses contraintes. Le
> script SQL = le MLD, plus ce que la méthode physique ajoute par nature. Rien n'est perdu, tout
> est à un endroit.

---

## Notation graphique (figure)

Sur une figure de MPD, la table est rendue comme un **bloc de colonnes** sur 3 colonnes alignées
— **exactement le même rendu que le MLD**, pour que les deux figures se lisent de la même façon :

- **Format d'un bloc** : chaque colonne est rendue sur une ligne de **3 colonnes alignées** —
  `[PK|FK] nom | type SQL | NOT NULL/NULL` (sans en-têtes). L'en-tête du bloc porte le nom de la
  table et le badge `TABLE` (comme au MLD).
- **PK / FK** : badges `PK` / `FK` en tête de la première colonne. La PK est soulignée
  (`isPK`), la FK est marquée (`isFK`) — jamais soulignée, même quand elle est aussi PK
  (jonctions).
- **Type** (2ᵉ colonne) : type SQL MySQL de la colonne, en gris (`int unsigned`, `varchar(255)`,
  `decimal(5,2)`, `datetime`, `text`). Les conventions complémentaires sont ajoutées **en fin de
  chaîne** :
  - `UNI` pour une contrainte d'unicité (règle 6) ;
  - `FK → table.col` pour la cible référencée ;
  - `ON DELETE CASCADE | RESTRICT | SET NULL` pour la politique de suppression (règle 4).
  > *Ex : `int unsigned FK → applications.id ON DELETE CASCADE`.*
- **Nullabilité** (3ᵉ colonne) : `NOT NULL` ou `NULL` en gris, pilotée par `nullable`
  (`nullable: true` ↔ min 0). Tout attribut non marqué est `NOT NULL` par défaut.
- Un **lien entre deux tables** est un *lien de référencement* (FK) : il **ne porte ni verbe
  d'association, ni cardinalité** — la sémantique est portée par le badge `FK` et la colonne
  `type` à l'intérieur des blocs.
- Une **table de jonction** porte le badge `JONCTION` dans son en-tête, comme au MLD.

---

## Table de correspondance MCD ↔ MPD

Le MPD figure **21 tables** sur les 34 relations du MLD (périmètre de lecture limité à la chaîne
de recrutement — voir `plans/implementations/20260928_passage_mld_mpd.md`).

### Figure « Campagnes & candidatures » (`mpd-campagnes-candidatures`)

| Entité MCD | Relation MLD | Table MPD | Arbitrage ? |
|---|---|---|---|
| `CAMPAGNE` | `CAMPAGNE` | `campaigns` | — |
| `MODELE_PIPELINE` | `MODELE_PIPELINE` | `pipeline_template` | — |
| `ETAPE_PIPELINE` | `ETAPE_PIPELINE` | `pipeline_stage` | — |
| — (association `proposer`) | `PROPOSER` | `campaign_form` | — |
| `FORMULAIRE` | `FORMULAIRE` | `form` | — |
| `VERSION_FORMULAIRE` | `VERSION_FORMULAIRE` | `form_version` | — |
| — (association `contenir`) | `REGROUPER` | `form_questions` | — |
| `QUESTION` | `QUESTION` | `question` | — |
| `REPONSE` | `REPONSE` | `answer` | — |
| `CANDIDATURE` | `CANDIDATURE` | `applications` | — |
| `AVANCEMENT` | `AVANCEMENT` | `application_progress` | — |
| `DECISION` | `DECISION` | `decisions` | — |

### Figure « Entretiens & utilisateurs » (`mpd-entretiens-utilisateurs`)

| Entité MCD | Relation MLD | Table MPD | Arbitrage ? |
|---|---|---|---|
| `ENTRETIEN` | `ENTRETIEN` | `interviews` | — |
| `CONVOCATION` | `CONVOCATION` | `convocation` | ⚠ physique : `candidate_interview` |
| `EVALUATEUR_ENTRETIEN` | `EVALUATEUR_ENTRETIEN` | `interview_evaluator` | ⚠ physique : `interview_participant` |
| `EVALUATION` | `EVALUATION` | `evaluations` | — |
| `NOTE_CRITERE` | `NOTE_CRITERE` | `evaluation_item` | — |
| `GRILLE_MODELE` | `GRILLE_MODELE` | `evaluation_grid_template` | — |
| `VERSION_GRILLE` | `VERSION_GRILLE` | `evaluation_grid_template_version` | — |
| `CRITERE` | `CRITERE` | `evaluation_grid_criterion` | ⚠ physique : `evaluation_grid_template_item` |
| `UTILISATEUR` | `UTILISATEUR` | `user` | — |

### Correspondance des attributs — conventions appliquées

| MLD (français) | MPD (anglais, aligné code) |
|---|---|
| `id_campagne` (PK) | `id` |
| `#id_modele_pipeline` | `pipeline_template_id` |
| `est_publiee` / `est_archivee` / `est_actif` | `is_published` / `is_archived` / `is_active` |
| `libelle_modele` / `libelle_etape` / `libelle` | `template_name` / `stage_label` / `label` |
| `type_etape` / `type_critere` | `stage_type` / `criterion_type` |
| `ordre_etape` / `ordre` / `ordre_question` | `stage_order` / `criterion_order` / `question_order` |
| `enonce` | `statement` |
| `prenom_candidat` / `nom_candidat` | `candidate_first_name` / `candidate_last_name` |
| `date_naissance` | `candidate_birthdate` |
| `statut_progression` | `progress_status` |
| `statut_reponse` | `response_status` |
| `valeur_score` / `valeur_texte` | `score_value` / `text_value` |
| `coefficient_fige` / `note_max_figee` | `weight_snapshot` / `max_score_snapshot` |
| `coefficient` (CRITERE) | `weight` |
| `contenu_hashé` (sic) | `content_hash` |
| `peut_modifier` / `peut_supprimer` / `peut_evaluer` | `can_modify` / `can_delete` / `can_evaluate` |
| `a_termine` | `has_finished` |
| `date_soumission` / `date_validation` | `submitted_at` / `validated_at` |
| `verrouillee_le` | `locked_at` |
| `chaine_token` | `token_string` |
| `#id_decision_annulee` | `annulled_decision_id` — **divergence assumée** (physique : `cancels_decision_id`, nom inversé) |

### Relations MLD non figurées (13 sur 34)

`REGLE_NOTIFICATION`, `TOKEN_SOURCE`, `TOKEN_VERIFICATION_EMAIL`, `NOTIFICATION`,
`GROUPE_METIER`, `PERMISSION_GROUPE`, `APPARTENIR`, `BENEFICIER`, `ENTREPRISE`, `DEPARTEMENT`,
`SPECIALITE`, `CONFIGURATION`, `MODELE_EMAIL`.

> Elles restent complètement modélisées aux niveaux MCD et MLD. Le MPD en est un **extrait de
> lecture**, non un inventaire exhaustif — écart assumé et tracé dans le plan d'implémentation.

---

## Vérifications finales de cohérence

- Chaque table du MPD correspond à **une relation du MLD** — aucune table ajoutée « au cas où ».
  > *Ex : aucune table « technique » (audit, journal) ne doit apparaître dans les figures ; elle
  > appartient au script d'enrichissement.*
- Chaque colonne du MPD correspond à **un attribut du MLD** — aucune colonne métier inventée, et
  inversement aucun attribut du MLD oublié.
  > *Ex : `convocation.proposed_at` est legitimate car `CONVOCATION.date_proposee` existe au MLD ;
  > `campaigns.anti_cheat_enabled` ne l'est pas car aucun attribut du MLD ne le porte.*
- Chaque clé étrangère référence une **clé primaire existante**, et les **types correspondent
  exactement** (`INT UNSIGNED` ↔ `INT UNSIGNED`).
  > *Ex : `application_progress.application_id INT UNSIGNED` référence `applications.id INT
  > UNSIGNED` — jamais l'inverse.*
- La **nullabilité** de chaque colonne est **identique** à celle du MLD — le MPD ne relève ni ne
  relâche aucune contrainte.
  > *Ex : `campaigns.pipeline_template_id` reste `NULL` (patte `(0,1)` de l'association
  > `exploiter` au MCD).*
- Une **clé primaire composite** (table de jonction) ne comporte **ni `id` ni `AUTO_INCREMENT`**.
  > *Ex : `campaign_form` est en `PRIMARY KEY (campaign_id, form_id)`.*
- Chaque politique `ON DELETE` est **justifiée** par le cycle de vie métier (enfant sans existence
  propre / lien structurel / pointeur optionnel) — pas laissée au défaut implicite.
- Une table de jonction porte ses **deux** FK vers ses deux tables parentes, et **aucune** FK
  enfouie chez les tables parentes.
  > *Ex : `campaign_form` porte `campaign_id` **et** `form_id` ; `campaigns` et `form` ne portent
  > aucune colonne vers `campaign_form`.*
- Aucun **nom français**, aucune **majuscule**, aucun préfixe `#` ne subsiste au MPD.
  > *Ex : plus de `CAMPAGNE` ni de `#id_campagne` — seulement `campaigns` et `id`.*
- Aucun nom de table ou de colonne du MPD ne **contredit** une convention physique réelle : tout
  écart est justifié dans la table de correspondance.
  > *Ex : `candidate_interview` → `convocation` (arbitrage assumé), `interview_participant` →
  > `interview_evaluator` (arbitrage assumé).*
- Le typage est **homogène** sur l'ensemble des figures : un même concept logique ne reçoit pas
  deux types SQL différents.
  > *Ex : tout booléen en `TINYINT(1)`, tout score en `DECIMAL(5,2)`, tout identifiant en
  > `INT UNSIGNED`.*

---

## Vue « script SQL » (figures `mpd-sql-campagnes` et `mpd-sql-entretiens`)

Chaque figure MPD existe en **deux vues générées à partir d'une source unique**
(`src/diagrams/nouveau/mpd/schema.ts`) : la vue « tables » (blocs de colonnes)
et la vue « script » (un `CREATE TABLE` complet par bloc). Elles ne peuvent donc
jamais diverger.

### Ce que le script rend visible

| Règle | Vue « tables » | Vue « script » |
|---|---|---|
| 2 — types | ✅ dans la colonne type | ✅ types MySQL réels |
| 3 — PK | ✅ badge PK | ✅ `PRIMARY KEY` + `AUTO_INCREMENT` |
| 4 — politiques | ✅ `ON DELETE` dans la colonne type | ✅ lignes `CONSTRAINT … FOREIGN KEY … ON DELETE …` |
| 5 — nullabilité | ✅ colonne `NOT NULL` / `NULL` | ✅ `NOT NULL` / nullable déclaré |
| 6 — unicité | — | ✅ `UNIQUE KEY` |
| 7 — colonnes techniques | ❌ (hors MLD) | ✅ `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted` ajoutées sur les 21 tables |
| 8 — index | — | ✅ `KEY` |
| 10 — moteur / charset | — | ✅ `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` |

Les colonnes techniques (règle 7) sont **ajoutées par le générateur**, pas
recopiées 21 fois : elles ne sont pas des attributs du MLD et restent donc
absentes de la vue « tables » — la note de projet ci-dessus reste la règle.

### FK différées et cross-figures

`created_by` / `updated_by` ne sont pas contraignables dans le `CREATE TABLE` :
cela imposerait que `user` soit créée avant chaque table. Elles sont différées
en `ALTER TABLE` en fin de script (`toAuditConstraints()`), exécutable dans la
figure « Entretiens & utilisateurs » où `user` est créée.

Une FK dont la cible n'est **pas dans le jeu de tables de la figure** est
rendue en **commentaire SQL** — jamais comme une contrainte cassée :

- **cross-figure** : la cible existe dans la figure voisine (ex.
  `pipeline_stage.evaluation_grid_template_version_id`) ;
- **hors périmètre** : la cible est absente des 21 tables — les 13 relations
  non figurées (ex. `campaigns.speciality_id` → `specialities`).

Une figure « script » est donc un vrai script **exécutable** : chaque fragment
créé est ordonné par dépendance (une table référencée avant celle qui la
référence), et aucune contrainte vers une table absente n'est émise.

### Ordre de lecture

Les blocs sont disposés en **2 colonnes remplies colonne par colonne** : on lit
la 1re colonne de haut en bas, puis la 2e — l'ordre d'exécution du script,
rendu par l'ordre de la source (`script_campagnes.ts`, `script_entretiens.ts`).
Les 7 couleurs de la légende (5 teintes, réutilisées de `SAFE_HUES` + audit +
commentaire) expliquent le script sans couleur nouvelle au projet.

---

## Résumé — les 12 règles en une ligne chacune

| # | Règle | Effet au MPD |
|---|---|---|
| 1 | Table logique → table SQL du SGBD | `CAMPAGNE` → `campaigns` |
| 2 | Type concret par attribut | `text` / `tinyint(1)` / `decimal(5,2)` |
| 3 | Identifiant → PK physique générée | `id INT UNSIGNED AUTO_INCREMENT` |
| 4 | FK → contrainte `FOREIGN KEY` + politique | `ON DELETE CASCADE / RESTRICT / SET NULL` |
| 5 | Cardinalités min → `NOT NULL` / nullable | `(1,1)` → `NOT NULL`, `(0,1)` → `NULL` |
| 6 | Unicité → `UNIQUE KEY` | `UNIQUE (email)`, `UNIQUE (a_id, b_id)` |
| 7 | Colonnes techniques | `created_at`, `is_deleted`… → **script** |
| 8 | Index de performance | `CREATE INDEX …` → **script** |
| 9 | Dénormalisation assumée | `aggregated_*` → **script + tableau d'écarts** |
| 10 | Moteur, charset, collation | `InnoDB`, `utf8mb4` → **script** |
| 11 | Structure complexe → JSON | `config_json` → **script** |
| 12 | Noms français → conventions physiques | `statut_reponse` → `response_status` |
