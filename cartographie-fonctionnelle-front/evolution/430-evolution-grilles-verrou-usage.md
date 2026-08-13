# Note — Évolution des grilles d'évaluation : versionnage par verrou à l'usage et réutilisation par contenu

**Date :** 2026-08-11
**Statut :** Implémentée (Phases 0–D) ; services de versionnage (Règles B/C/D) et CRUD de la bibliothèque de grilles portés par la note 440
**Périmètre :** `pipeline_stage`, `pipeline_stage_evaluation_criterion`, `evaluation_grid_template`, `evaluation_grid_template_version`, `evaluation_grid_template_item`, `evaluations`, `evaluation_item`, doc `bd_documentee` et page d'exemples

> Cette note remplace et corrige la partie « critères effectifs sur le stage » de la note 420 (`pipeline_stage_evaluation_criterion`) : la copie par étape est abandonnée au profit d'un rattachement direct étape → version de grille, avec verrou au premier usage et déduplication par contenu.

## 1. Décisions retenues

- [x] Une étape d'évaluation ne porte qu'une seule grille → colonne directe `pipeline_stage.evaluation_grid_template_version_id` (nullable, FK), pas de table de liaison.
- [x] `pipeline_stage_evaluation_criterion` est supprimée : les critères ne vivent plus que dans `evaluation_grid_template_item`.
- [x] Le versionnage repose sur un **verrou à l'usage** : une version est immuable dès qu'une évaluation la référence. Tant qu'elle n'a jamais noté un candidat, on peut la modifier sur place.
- [x] Le verrou se déclenche à la **première ligne `evaluation_item` réellement saisie** (évaluation DRAFT avec au moins un item, soumise ou validée). Un brouillon **vide (0 item) ne verrouille rien** : il n'y a pas eu d'utilisation.
- [x] `content_hash` est une **colonne de `evaluation_grid_template_version`**, calculée sur l'ensemble ordonné de ses items. Il **ne contient pas l'id de la version** : c'est une empreinte de contenu, pas une identité (sinon la réutilisation par contenu devient impossible).
- [x] Le hash est calculé sur une **forme canonique** (normalisation `config_json` : clés triées, suppression des espaces ; labels trimés ; `DOUBLE` arrondis à précision fixe ; règle explicite `NULL` vs `0`), sinon du bruit d'écriture créerait de fausses « nouvelles versions ».
- [x] `is_published` / `published_at` sont **conservés** mais n'ont plus rien à voir avec le verrou : ils signifient « disponible pour les étapes ». Le verrou est l'usage.
- [x] Réutilisation par contenu : si le contenu édité correspond à une version existante, on pointe vers celle-ci au lieu d'en créer une nouvelle (pas d'empilement de versions redondantes).
- [x] Zéro changement = aucune nouvelle version (pas de v3 inutile).
- [x] `evaluation_item` référence directement l'item de grille (`evaluation_grid_template_item_id`) ; les snapshots `weight_snapshot` / `max_score_snapshot` sont conservés.
- [x] La déduplication par contenu est garantie par la base via `content_hash` **UNIQUE** sur `evaluation_grid_template_version`.
- [x] **Immutabilité des items d'une version verrouillée** : interdite côté application (et renforcée par un trigger éventuel) ; la base ne l'empêche pas d'elle-même.
- [x] **Nettoyage des versions orphelines** (créées puis abandonnées) : suppression logique immédiate au repointage + balayage de sécurité périodique. Jamais de suppression physique ; jamais de nettoyage des versions publiées.
- [x] **Backfill** : rebranchement déterministe via le lien d'origine, cas ambigus extraits pour **arbitrage manuel**, table de correspondance réversible, et fusion par contenu pendant la migration.
- [x] **Contrat API renommé** : `pipelineStageEvaluationCriterionId` → `evaluationGridTemplateItemId` (DTO, front et tests), décidé en revue — le champ ne pointe plus un critère d'étape mais un item de grille.
- [x] **Périmètre** : le CRUD de la bibliothèque de grilles (entités, repos, business, endpoints, UI, éditeur « picker grille → version ») est **porté par la note 440** ; la présente note fournit le mécanisme de versionnage (Règles B/C/D) et la bascule de l'évaluation, pas le CRUD ni l'UI.

## 2. Problème cible

Aujourd'hui les critères d'une grille d'évaluation sont dupliqués :

- `evaluation_grid_template_item` définit les critères de la grille (versionnée, réutilisable) ;
- `pipeline_stage_evaluation_criterion` recopie ces mêmes critères (order, label, type, max_score, weight, is_required, config_json) pour chaque étape, avec en plus un lien nullable vers la version d'origine.

Cette duplication présente plusieurs défauts :

- **dérive** : les deux tables sont quasi identiques ; toute évolution de colonne doit être maintenue deux fois (`criterion_type` est déjà « à confirmer » dans les deux enums) ;
- **redondance** : 8 critères de grille × N étapes qui l'utilisent = 8 × N lignes au lieu de 8 ;
- **cohérence non garantie par la base** : un critère d'étape pointe vers la version, pas vers l'item ; rien n'empêche des lignes incohérentes ;
- **pas de vue directe** « quelle grille utilise cette étape ? ».

Le besoin réel est uniquement la **conservation** : une grille déjà utilisée pour noter un candidat ne doit jamais être perdue ni modifiée rétroactivement. Ce besoin est couvert par le versionnage (verrou à l'usage + réutilisation par contenu), sans copie par étape.

## 3. Règles de versionnage (verrou à l'usage + contenu)

### 3.1 Règles métier

- **Règle A — verrou à l'usage** : une version est immuable dès qu'au moins une ligne `evaluation_item` **réellement saisie** référence un item de cette version (évaluation DRAFT avec au moins un item, soumise ou validée). Un brouillon vide (0 item) ne verrouille pas. Tant qu'elle n'a jamais été utilisée, elle est modifiable **sur place** (pas de v2).
- **Règle B — zéro changement** : si après édition le contenu est identique, on ne crée rien et on garde la version actuelle (pas de v3).
- **Règle C — réutilisation par contenu** : si après édition le contenu correspond à une version existante (utilisée ou non), on pointe l'étape vers cette version au lieu d'en créer une nouvelle.
- **Règle D — contenu inédit** : sinon, on crée une v(n+1), éditable jusqu'à son premier usage.

Le verrou est **global** : une version utilisée reste verrouillée même si l'étape qui la référençait se repointe ailleurs (les évaluations historiques restent rattachées).

### 3.2 Mécanisme technique

- `content_hash` VARCHAR(64) **UNIQUE** sur `evaluation_grid_template_version` : empreinte SHA-256 (hex) de l'**ensemble ordonné** des items de la version. **L'id de la version n'en fait pas partie** (empreinte de contenu, pas identité) : deux versions au contenu identique ont le même hash, c'est le mécanisme de la Règle C. L'ordre compte : deux grilles identiques mais dans un ordre différent ne partagent pas le même hash.
- Empreinte par item : `criterion_order` | `label` | `criterion_type` | `max_score` | `weight` | `is_required` | `config_json`. Calcul sur **forme canonique** : `config_json` normalisé (clés triées, sans espaces superflus), labels trimés, `DOUBLE` arrondis à précision fixe, règle explicite `NULL` vs `0`. Hash global = hash de la concaténation ordonnée des hash d'items.
- `locked_at` datetime **nullable** sur `evaluation_grid_template_version` : posé **transactionnellement** à la création de la première `evaluation_item` réellement saisie qui référence la version (DRAFT avec item, soumise ou validée). `is_locked` = `locked_at IS NOT NULL`. **Un brouillon vide ne pose pas le verrou** : on ne matérialise jamais de lignes d'item tant que l'évaluateur n'a rien saisi.
- Le lien de référence est la version : `pipeline_stage.evaluation_grid_template_version_id` → une version ; `evaluation_item.evaluation_grid_template_item_id` → un item de la version. Comme la version est verrouillée à l'usage, ses items ne peuvent plus être modifiés après coup — **l'immutabilité des items d'une version verrouillée est une règle applicative** (la base n'empêche pas un `UPDATE` direct sur un item ; un trigger peut la renforcer).

### 3.3 Flux de sauvegarde (application)

1. Charger la version actuellement liée à l'étape (via `pipeline_stage.evaluation_grid_template_version_id`).
2. Si `is_locked` → toute modification passe obligatoirement par une nouvelle version (jamais sur place).
3. Calculer `content_hash` du nouveau contenu (forme canonique) :
   - égal au hash actuel → **Règle B**, rien ne change ;
   - égal au hash d'une version existante → **Règle C**, on repointe l'étape sur cette version ; la version abandonnée est alors **nettoyée immédiatement** si elle est `locked_at IS NULL` **et** `is_published = 0` **et** plus référencée par aucune étape (suppression logique dans la même transaction) ;
   - inédit → **Règle D**, création d'une nouvelle version (verrouillée à son premier usage).
4. `content_hash` UNIQUE fait échouer toute tentative de créer deux versions au contenu identique ; en cas de course (deux sauvegardes concurrentes du même contenu), l'une échoue sur l'UNIQUE et doit réessayer via la Règle C (repointage).

## 4. Cible de modèle

```
evaluation_grid_template
   └─ evaluation_grid_template_version   (is_published = disponibilité ; locked_at = verrou ; content_hash UNIQUE)
        └─ evaluation_grid_template_item  (les critères — seule source des critères)

pipeline_stage ── evaluation_grid_template_version_id ──> evaluation_grid_template_version
        ▲
evaluation_item ── evaluation_grid_template_item_id ────> evaluation_grid_template_item
   (+ weight_snapshot / max_score_snapshot conservés)
```

Table supprimée : `pipeline_stage_evaluation_criterion`.

## 5. Évolutions par table

### 5.1 `pipeline_stage`

Ajouter :

- `evaluation_grid_template_version_id` int unsigned **nullable** MUL — version de grille utilisée par l'étape d'évaluation (nullable : étape sans évaluation). FK → `evaluation_grid_template_version(id)`.

Ne pas ajouter de table de liaison : une étape = une grille.

### 5.2 `evaluation_grid_template_version`

Ajouter :

- `content_hash` VARCHAR(64) **NULL**, contrainte **UNIQUE** (une seule version par contenu). Empreinte de contenu calculée sur les items (forme canonique), **sans l'id de la version**. Défaut `\N` tant que le backfill n'a pas calculé les hash.
- `locked_at` datetime **nullable** — posé à la première `evaluation_item` réellement saisie (brouillon vide non verrouillant). `is_locked` = `locked_at IS NOT NULL`.

Conserver : `is_published`, `published_at` (= disponibilité pour les étapes, indépendant du verrou).

### 5.3 `evaluation_item`

Modifier :

- ajouter `evaluation_grid_template_item_id` int unsigned **NULL** (Phase A), FK → `evaluation_grid_template_item(id)` + index. Renseignée par le backfill (Phase B), puis passage `NOT NULL` après bascule (Phase C/D).
- recréer le UNIQUE sur `(evaluation_id, evaluation_grid_template_item_id)` : garantie « une évaluation ne note pas deux fois le même item » (l'ancien `uk_evaluation_item_criterion` est supprimé en Phase D).
- en Phase D : suppression de la FK `fk_evaluation_item_criterion`, des index `uk_evaluation_item_criterion` / `idx_evaluation_item_criterion` et de la colonne `pipeline_stage_evaluation_criterion_id`.

Conserver : `score_value`, `text_value`, `weight_snapshot`, `max_score_snapshot`.

### 5.4 `evaluation_grid_template_item`

Inchangée : elle reste la source unique des critères. Les items d'une version verrouillée sont immuables (règle applicative + trigger éventuel).

### 5.5 Suppressions

- `pipeline_stage_evaluation_criterion` : données migrées puis table supprimée (voir phases). Sa suppression exige d'abord de retirer sur `evaluation_item` la FK `fk_evaluation_item_criterion`, l'index `idx_evaluation_item_criterion`, le UNIQUE `uk_evaluation_item_criterion` et la colonne `pipeline_stage_evaluation_criterion_id` (Phase D).
- `legacy_criterion_mapping` : table temporaire de rebranchement, supprimée en Phase D.

## 6. Stratégie de migration (par phases)

### Phase 0 — Cadrage final (fait)

Sorties figées :

- une étape = une grille (colonne directe, pas de liaison) ;
- verrou = **première `evaluation_item` réellement saisie** (brouillon vide non verrouillant) ;
- `is_published` conservé comme disponibilité ;
- déduplication par `content_hash` UNIQUE (Règles A–D), hash sur forme canonique sans id de version ;
- immutabilité des items d'une version verrouillée (règle applicative + trigger éventuel) ;
- nettoyage des orphelins : immédiat au repointage + balayage périodique, jamais de suppression physique, jamais sur les versions publiées ;
- `pipeline_stage_evaluation_criterion` supprimée ;
- `evaluation_item` pointe les items de grille, snapshots conservés.

### Phase A — Ajouter le schéma cible sans casser l'existant

Script SQL de référence : `quizapp/src/main/resources/db/migration/V1_078__add_grid_lock_usage_schema.sql`

Checklist :

- [x] `ALTER TABLE pipeline_stage ADD COLUMN evaluation_grid_template_version_id int unsigned NULL`, FK → `evaluation_grid_template_version(id)`, index.
- [x] `ALTER TABLE evaluation_grid_template_version ADD COLUMN content_hash CHAR(64) NULL`, index **UNIQUE** sur `content_hash`. *(Type corrigé en `VARCHAR(64)` par `V1_081` — l'entité `@Column(length=64)` attend `varchar(64)` et la validation Hibernate échouait sur `char(64)`.)*
- [x] `ALTER TABLE evaluation_grid_template_version ADD COLUMN locked_at datetime NULL`.
- [x] `ALTER TABLE evaluation_item ADD COLUMN evaluation_grid_template_item_id int unsigned NULL`, FK + index. (Ajout d'une colonne nullable, sans recâbler tout de suite : les lignes restent lisibles.)
- [x] Vérifier que l'existant n'est pas cassé : aucun `NOT NULL`, aucune suppression, aucune contrainte bloquante.

### Phase B — Backfill et contrôles de cohérence

Script SQL de référence : `quizapp/src/main/resources/db/migration/V1_079__backfill_grid_usage_phase_b.sql`

Objectif : reconstituer les données depuis `pipeline_stage_evaluation_criterion`, sans perte, avec un rebranchement **déterministe** et **réversible**.

Checklist :

- [x] **Reconstruire les versions par étape** : pour chaque `pipeline_stage` ayant des `pipeline_stage_evaluation_criterion`, créer (si besoin) une `evaluation_grid_template_version` qui regroupe ses critères, en réutilisant la version d'origine quand tous les critères de l'étape portent le même `evaluation_grid_template_version_id` et sont identiques aux items de cette version.
- [x] **Fusion par contenu pendant la migration** : calculer le `content_hash` dès la reconstruction et fusionner les étapes dont le contenu reconstruit est identique (une seule version pour plusieurs étapes) — évite de gonfler le nombre de versions.
- [x] **Table de correspondance réversible** : créer une table temporaire `legacy_criterion_mapping` (`old_pipeline_stage_evaluation_criterion_id`, `new_evaluation_grid_template_item_id`) qui sert de source unique au rebranchement d'`evaluation_item`. Elle permet la vérification et la reprise sans risque.
- [x] **Rattacher l'étape** : renseigner `pipeline_stage.evaluation_grid_template_version_id` pour chaque étape reconstruite.
- [x] **Isoler les cas non déterministes** : tout ce qui ne matche pas proprement (critères saisis à la main, poids modifiés, `criterion_order` dupliqué, label modifié) est extrait dans une **liste d'arbitrage** (journalisée en `audit_event`, actions `PHASE_B_*`) et doit être tranché **manuellement avant** le rebranchement final.
- [x] **Rebrancher `evaluation_item`** à partir de `legacy_criterion_mapping` uniquement ; jamais de devinette dans le script.
- [x] **Renseigner `locked_at`** : pour chaque version ayant au moins une `evaluation_item` référencée, poser `locked_at`.
- [x] **Contrôles de cohérence obligatoires** (dans une transaction annulable) :
  - `COUNT(evaluation_item)` avant = après (aucune ligne perdue) ;
  - aucune `evaluation_item` orpheline (toutes pointent un item existant) ;
  - aucune étape `INTERVIEW` sans grille si des évaluations existent ;
  - `content_hash` cohérent avec le contenu des items (recalcul de contrôle) ;
  - `locked_at` non nul sur toute version référencée par une `evaluation_item`, nul sinon.
- [x] Sortir une liste de cas ambigus à arbitrer manuellement avant toute bascule. (Sur le jeu de référence : 0 cas — tables sources vides, `PHASE_B_COMPLETED` en audit.)

> Validation effectuée : script testé sur base jetable (réutilisation, reconstruction, fusion par contenu, `criterion_order` dupliqué → arbitrage, verrou `locked_at`, garde 7.3 SIGNAL) puis appliqué au dev DB (`1.079`, checksum aligné). Aucun drift fichier/base.

### Phase C — Bascule lecture / écriture (backend)

Checklist :

- [x] Lecture du formulaire d'évaluation d'une étape : `loadStageCriteria` (`EvaluationsBusiness.java:1009-1036`) passe par `pipeline_stage.evaluation_grid_template_version_id` → items de la version (au lieu de `pipeline_stage_evaluation_criterion`).
- [x] Fallback de score : `deriveGlobalScoreFromEvaluationItems` (`EvaluationsBusiness.java:636-681`) ne charge plus le critère via `PipelineStageEvaluationCriterionRepository`, mais via l'item de grille.
- [x] Écriture : création d'`evaluation_item` sur `evaluation_grid_template_item_id` (avec validation « l'item appartient bien à la grille du stage courant »).
- [x] Pose de `locked_at` transactionnelle à la **première `evaluation_item` réellement saisie** (score ou texte non vides ; brouillon vide non verrouillant) : garantie par la transaction `BusinessFactory.create/update` (`@Transactional(rollbackFor=...)`), avec audit `GRID_VERSION_LOCKED`. Le **refus d'écriture sur une version verrouillée** et **l'immutabilité des items d'une version verrouillée** sont des gardes du CRUD de la bibliothèque de grilles → **note 440**.
- [ ] Services de versionnage (Règles B/C/D) : `content_hash` sur forme canonique, réutilisation par contenu, repointage. **Reportés à la note 440** (décision de périmètre : aucun appelant n'existe encore ; la 440 les consommera avec son CRUD). Le mécanisme de données (colonnes `content_hash` UNIQUE + `locked_at`, verrou à l'usage) est en place.
- [x] Renommer le contrat API `pipelineStageEvaluationCriterionId` → `evaluationGridTemplateItemId` : `EvaluationItemDto`, `evaluation.service.ts`, `evaluations.ts`, `entities-applications.ts`, `evaluations-list.ts` + specs back (`EvaluationsBusinessTest`, `EvaluationsControllerTest`) et front (`evaluations.spec.ts`, `entities-applications.spec.ts`, `evaluations-list.spec.ts`).
- [x] Supprimer les lectures/écritures résiduelles sur `pipeline_stage_evaluation_criterion` (entité, repository, `EvaluationsBusiness`).

> Validation effectuée : compile backend OK, `EvaluationsBusinessTest` (9 tests, dont verrou `locked_at`) et `EvaluationsControllerTest` (7 tests) verts ; typecheck front (`tsc --noEmit` sur `tsconfig.spec.json`) OK. Création des entités/repos grille (`EvaluationGridTemplateVersion`, `EvaluationGridTemplateItem`) et du champ `PipelineStage.evaluationGridTemplateVersionId`.

### Phase D — Suppression

Script SQL de référence : `quizapp/src/main/resources/db/migration/V1_080__drop_stage_evaluation_criterion.sql`

Checklist :

- [x] Vérifier qu'aucune lecture ni écriture ne référence plus `pipeline_stage_evaluation_criterion` (grep : 0 occurrence dans `src/main` et `src/test`, entité/repo/business supprimés en Phase C).
- [x] Sur `evaluation_item` : créer le UNIQUE `(evaluation_id, evaluation_grid_template_item_id)` (après backfill complet), puis drop de la FK `fk_evaluation_item_criterion`, de l'index `idx_evaluation_item_criterion`, du UNIQUE `uk_evaluation_item_criterion` et de la colonne `pipeline_stage_evaluation_criterion_id` (en plus : passage `evaluation_grid_template_item_id` à `NOT NULL`, pré-vérifié).
- [x] `DROP TABLE legacy_criterion_mapping`.
- [x] `DROP TABLE pipeline_stage_evaluation_criterion`.
- [x] Mettre à jour le doc `bd_documentee` et la page d'exemples (section 8).

> Validation effectuée : V1_080 appliquée sur le dev (`localhost:3306/quizapp_db`) — tables supprimées, colonne basculée `NOT NULL`, UNIQUE recréé, `content_hash` UNIQUE intact, `flyway_schema_history` vert (1.080), audit `PHASE_D_COMPLETED`. Script robuste : suppressions conditionnelles (`information_schema`), re-run après échec partiel possible ; le nouveau UNIQUE est créé **avant** le drop de l'ancien (il couvre la FK `evaluation_item → evaluations` via `evaluation_id`).

## 7. Checklist base de données

- [x] colonne `pipeline_stage.evaluation_grid_template_version_id` (nullable, FK, index)
- [x] colonnes `content_hash` (UNIQUE, forme canonique, sans id de version) et `locked_at` sur `evaluation_grid_template_version`
- [x] colonne `evaluation_item.evaluation_grid_template_item_id` + FK + index
- [x] UNIQUE `(evaluation_id, evaluation_grid_template_item_id)` recréé sur `evaluation_item` (Phase D)
- [x] table temporaire `legacy_criterion_mapping` pour le rebranchement réversible
- [x] backfill des versions (avec fusion par contenu), du rattachement étape, du `content_hash`, du rebranchement `evaluation_item`, du `locked_at`
- [x] arbitrage manuel des cas non déterministes avant rebranchement final (aucun cas sur le jeu de référence)
- [x] contrôles de cohérence Phase B (aucune perte, aucun orphelin, hash valides, transaction annulable)
- [x] bascule lecture/écriture backend (verrou à la première item saisie, transactionnel) + renommage du contrat API (Règles B/C/D reportées à la note 440)
- [ ] nettoyage des orphelins (immédiat au repointage + balayage périodique) — **note 440** (le repointage relève des Règles B/C/D)
- [x] Phase D sur `evaluation_item` : drop FK `fk_evaluation_item_criterion`, index `idx_evaluation_item_criterion`, UNIQUE `uk_evaluation_item_criterion`, colonne `pipeline_stage_evaluation_criterion_id`
- [x] `DROP TABLE legacy_criterion_mapping` puis `DROP TABLE pipeline_stage_evaluation_criterion`
- [x] index / contraintes UNIQUE sur `content_hash` vérifiés après migration

## 8. Checklist documentation (doc + page d'exemples)

- [x] `cartographie-fonctionnelle-front/bd_documentee/quizapp_db_documentation_20260810.md` :
  - retirer la table 3 `pipeline_stage_evaluation_criterion` (et sa famille si elle devient vide) ;
  - ajouter `evaluation_grid_template_version_id` à `pipeline_stage` ;
  - ajouter `content_hash` / `locked_at` à `evaluation_grid_template_version` ;
  - remplacer la FK `pipeline_stage_evaluation_criterion_id` par `evaluation_grid_template_item_id` sur `evaluation_item` ;
  - retirer `pipeline_stage_evaluation_criterion.criterion_type` de la liste des enums.
- [x] `cartographie-fonctionnelle-front/bd_documentee/exemples/data.js` :
  - retirer la table 3 de la famille « Pipeline » (48 → 47 tables) ;
  - étape 4 (`INTERVIEW`) → `evaluation_grid_template_version_id = 1` ;
  - ajouter `content_hash` aux versions de grille (v1, v2 non publiée) ;
  - `evaluation_item` pointe les items 1–3 de la grille v1 ;
  - mettre à jour le bloc `cles` (supprimer les FK de `pipeline_stage_evaluation_criterion`, ajouter `pipeline_stage:evaluation_grid_template_version_id` et `evaluation_item:evaluation_grid_template_item_id`).
- [x] Front : renommer `pipelineStageEvaluationCriterionId` → `evaluationGridTemplateItemId` dans `core/services/evaluation.service.ts`, `pages/dashboard/evaluations/evaluations.ts`, `pages/dashboard/entities/solo/applications/entities-applications.ts`, `pages/dashboard/evaluations-list/evaluations-list.ts` + specs.
- [x] Page d'exemples : rien de spécifique si les données suffisent ; vérifier la légende et les liens FK après mise à jour des données (`node --check` OK, 47 tables, lignes cohérentes, aucun lien FK vers une table inexistante).

## 9. Points d'attention pour éviter les erreurs

- **Le `content_hash` ne contient jamais l'id de la version** : c'est une empreinte de contenu. Deux versions au contenu identique partagent le même hash, c'est le mécanisme de la Règle C.
- **Collation explicite sur les hash temporaires** : `SHA2()` renvoie une chaîne dans la collation de **connexion** (mysql CLI vs JDBC/Flyway ≠ collation des colonnes `utf8mb4_unicode_ci`) → toute comparaison `<>` entre un `content_hash` de colonne et un hash de table temporaire lève une erreur 1267 « illegal mix of collations ». Déclarer les colonnes temporaires en `CHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci` (piège rencontré en Phase B).
- **Normalisation canonique obligatoire avant le hash** : `config_json` (clés triées, sans espaces superflus), labels trimés, `DOUBLE` arrondis à précision fixe, `NULL` vs `0` explicite. Sinon un enregistrement sans vrai changement crée une fausse nouvelle version (l'inverse de la Règle B).
- **Ne jamais modifier une version verrouillée** : toute personnalisation d'une grille utilisée passe par une nouvelle version (Règle A). Idem pour les **items** d'une version verrouillée : immutables (règle applicative, trigger en renfort).
- **Le verrou se pose à la première `evaluation_item` réellement saisie** : ne jamais matérialiser de lignes d'item tant que l'évaluateur n'a rien saisi, sinon verrouillage prématuré.
- **Le verrou est global et permanent** : une fois posé, `locked_at` ne se retire pas (aucun undo) ; une version verrouillée reste verrouillée même si l'étape se repointe ailleurs.
- **L'ordre des items compte** : le hash porte l'ordre ; réordonner = nouveau contenu.
- **Contraintes UNIQUE** : `content_hash` UNIQUE bloque la création de doublons par contenu ; la Règle C (repointer) doit être implémentée avant toute tentative de création pour éviter les erreurs UNIQUE au runtime (y compris en cas de sauvegardes concurrentes).
- **Orphelins** : nettoyage immédiat au repointage + balayage périodique. Toujours en suppression logique, jamais physique ; ne jamais toucher aux versions publiées (elles sont intentionnelles, même inutilisées).
- **Snapshots** : `weight_snapshot` / `max_score_snapshot` d'`evaluation_item` restent la ceinture-bretelles d'affichage des évaluations historiques.
- **Audit** : journaliser en `audit_event` (actions `PHASE_B_*`, puis `GRID_*` au runtime) la pose du verrou, les repointages, les nettoyages d'orphelins et les créations de versions.

## 10. Fichiers cartographie liés

- `cartographie-fonctionnelle-front/evolution/420-evolution-pipeline-multi-occurrences.md` : section 4.1 et références à `pipeline_stage_evaluation_criterion` corrigées — design remplacé par la présente note, table supprimée (V1_080).
- `cartographie-fonctionnelle-front/evolution/440-evolution-pipeline-personnalisation.md` : **dépendance** — le CRUD de la bibliothèque de grilles (entités, repos, business, endpoints, UI, éditeur « picker grille → version ») est porté par la note 440, qui consomme les services de versionnage (Règles B/C/D) fournis par la présente note.
- `cartographie-fonctionnelle-front/bd_documentee/quizapp_db_documentation_20260810.md`
- `cartographie-fonctionnelle-front/bd_documentee/exemples/data.js`, `exemples/app.js`, `exemples/index.html`, `exemples/style.css`
- `quizapp/src/main/resources/db/migration/` : scripts Flyway `V1_078__add_grid_lock_usage_schema.sql`, `V1_079__backfill_grid_usage_phase_b.sql`, `V1_080__drop_stage_evaluation_criterion.sql` (créés et appliqués).
