# Note — Bibliothèque de grilles d'évaluation : CRUD, versionnage (Règles B/C/D) et nettoyage des orphelins

**Date :** 2026-08-15
**Statut :** Non implémentée — reliquats re-pointés depuis les notes 430 et 440 (le Lot D de la 440 ne fournit que le picker lecture seule `POST /evaluationGrid/templates`).
**Périmètre :** `evaluation_grid_template`, `evaluation_grid_template_version`, `evaluation_grid_template_item`, `pipeline_stage.evaluation_grid_template_version_id`, UI back-office de bibliothèque de grilles, doc `bd_documentee` et page d'exemples

> Note de reliquats : la note 430 a livré le mécanisme de données (colonnes `content_hash` UNIQUE + `locked_at`, verrou à l'usage, bascule lecture/écriture de l'évaluation via l'étape) et la note 440 a livré le rattachement d'une grille à une étape INTERVIEW depuis l'éditeur de template. Le CRUD de la bibliothèque (créer/éditer des grilles et versions) et les services de versionnage (Règles B/C/D) restent à livrer ici.

## 1. Périmètre (items re-pointés depuis la 430)

- [ ] **CRUD de la bibliothèque de grilles** : entités, repos, business, endpoints et UI pour créer/éditer `evaluation_grid_template`, `evaluation_grid_template_version` et `evaluation_grid_template_item` (provenant de 430 §1 « Périmètre » et §11).
- [ ] **Services de versionnage (Règles B/C/D)** : `content_hash` sur forme canonique, réutilisation par contenu, repointage (430 §4 lignes 49-51, checklist §8 ligne 185). Le mécanisme de données est en place (colonnes `content_hash` UNIQUE + `locked_at`, verrou à l'usage).
- [ ] **Gardes de verrou du CRUD** : refus d'écriture sur une version verrouillée ; immutabilité des items d'une version verrouillée (430 §7.2 ligne 184).
- [ ] **Nettoyage des orphelins** : immédiat au repointage + balayage périodique ; suppression logique uniquement, jamais physique, jamais sur les versions publiées (430 §8 ligne 228).
- [ ] **Audit** : journaliser en `audit_event` (actions `GRID_*`) la pose du verrou, les repointages, les nettoyages d'orphelins et les créations de versions (430 §10).

## 2. Règles de versionnage cibles

- **Règle A** : une version utilisée (verrouillée) ne se modifie plus ; toute personnalisation passe par une nouvelle version.
- **Règle B — zéro changement** : si après édition le contenu est identique, on ne crée rien et on garde la version actuelle.
- **Règle C — réutilisation par contenu** : si le contenu édité correspond à une version existante, on pointe l'étape vers cette version au lieu d'en créer une nouvelle ; la version abandonnée est nettoyée immédiatement si `locked_at IS NULL` et `is_published = 0` et plus référencée par aucune étape.
- **Règle D — contenu inédit** : sinon, création d'une v(n+1), éditable jusqu'à son premier usage.
- Le verrou est **global et permanent** : une version utilisée reste verrouillée même si l'étape qui la référençait se repointe ailleurs.

## 3. Points d'attention hérités de la 430

- `content_hash` est une empreinte de contenu (forme canonique, ordre des items inclus, **sans l'id de version**) — deux versions au contenu identique partagent le même hash, c'est le mécanisme de la Règle C.
- `content_hash` UNIQUE bloque la création de doublons ; la Règle C (repointer) doit être implémentée **avant** toute tentative de création pour éviter les erreurs UNIQUE au runtime (y compris en cas de sauvegardes concurrentes).
- Collation explicite sur les hash temporaires (`utf8mb4_unicode_ci`) pour éviter l'erreur 1267 « illegal mix of collations ».
- Snapshots `weight_snapshot` / `max_score_snapshot` d'`evaluation_item` restent la ceinture-bretelles d'affichage des évaluations historiques.

## 4. Fichiers cartographie liés

- `cartographie-fonctionnelle-front/evolution/430-evolution-grilles-verrou-usage.md` : mécanisme de versionnage fourni, Règles B/C/D et orphelins re-pointés ici.
- `cartographie-fonctionnelle-front/evolution/440-evolution-pipeline-personnalisation.md` : Lot D (rattachement grille → étape INTERVIEW), CRUD de bibliothèque hors périmètre re-pointé ici.
- `quizapp/src/main/java/tech/synelia/quizapp/rest/api/EvaluationGridController.java` : actuellement lecture seule (`POST /evaluationGrid/templates`) — à étendre avec le CRUD.
- `quizapp/src/main/java/tech/synelia/quizapp/business/EvaluationGridBusiness.java`, `dao/repository/EvaluationGridTemplateRepository.java`, `dao/entity/EvaluationGridTemplate.java`, `utils/dto/EvaluationGridTemplateDto.java`, `EvaluationGridTemplateVersionDto.java`.
- `cartographie-fonctionnelle-front/bd_documentee/quizapp_db_documentation_20260810.md`, `bd_documentee/exemples/data.js`.
