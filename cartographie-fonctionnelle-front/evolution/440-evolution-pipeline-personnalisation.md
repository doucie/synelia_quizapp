# Note — Plan d'implémentation : personnalisation avancée du pipeline

**Date :** 2026-08-12 (mise à jour 2026-08-14)
**Statut :** Terminée (Lots 0 → D livrés, commit `fcab9de`) — corrections, permissions/rescapés front, track-by composite, multi-rounds (Lot A), versionnage fin des étapes (Lot B), règles de notification éditables (Lot C) et grille d'évaluation par étape INTERVIEW (Lot D) livrés backend + frontend. Le runtime de lecture de la grille est assuré par le socle 430 ; le CRUD de la bibliothèque de grilles (Règles B/C/D, nettoyage des orphelins) est **hors périmètre** et re-pointé vers la note 460.
**Périmètre :** `pipeline_template`, `pipeline_stage`, `pipeline_stage_notification_rule`, runtime `application_progress` / `application_quiz_attempt` / `interviews` / `decision`, front `pipeline-templates` / `pipeline-template-edit`, permissions, migrations Flyway, doc `bd_documentee` et page d'exemples

> Cette note coordonne les 5 limites identifiées du pipeline personnalisable (verdict : fonctionnel en mono-round) et fixe le plan de livraison en 6 lots. Elle s'appuie sur la note 420 (multi-occurrences) et la note 430 (grilles à verrou à l'usage) : elle ne les remplace pas, elle les orchestre et les complète (versionnage des étapes, règles de notification éditables, corrections).

## 1. Verdict et limites à régler

Le pipeline personnalisable est **fonctionnel et implémenté en mono-round** : catalogue (liste + badges + modales), éditeur (inline, DnD, switches, activation + blocages), garde-fous backend, runtime skip/email. Cinq limites métier ont été validées et font l'objet de ce plan :

1. **Pas de rounds multiples** — une seule occurrence par type d'étape (impossible d'avoir 2 entretiens ou 2 quiz).
2. **Verrou binaire du template** — `is_locked` au premier candidat, édition gelée en bloc ; pas de versionnage fin des étapes.
3. **Config email non éditable** — `pipeline_stage_notification_rule` sans CRUD ni UI (scripts V1_075/V1_076 seulement).
4. **Personnalisation étape limitée** — `config_json` restreint, pas de screening auto par quiz, pas de grille d'évaluation rattachée à l'entretien via UI (sujet de la note 430).
5. **Incohérences / risques** — `create()` accepte `isActive=true` sans readiness ; `delete()` sans garde campagne ouverte ; `setDefault()`/`duplicate()` sans vérification du verrou ; `update()` sans bornes CANDIDATURE/DECISION ; permissions front incohérentes ; rescapés `EVALUATION`.

## 2. Décisions retenues

- [x] **Verrou → versionnage fin des étapes** : l'édition n'est plus gelée en bloc ; chaque étape se verrouille individuellement à son usage réel, et les étapes verrouillées évoluent par révisions (mécanisme détaillé en section 4).
- [x] `pipeline_template.is_locked` est **conservé en base mais cesse de bloquer l'édition** (info de compat / badge historique).
- [x] `setAsDefault()` reste **autorisé** sur un template verrouillé ou contenant des étapes verrouillées (un pipeline en production peut rester le défaut de la campagne).
- [x] Le fichier du plan est `440-evolution-pipeline-personnalisation.md`, ordre de livraison **Lot 0 → A → B → C → D**.
- [x] L'entité et le repository de `pipeline_stage_notification_rule` **existent déjà** : le chantier email est du CRUD + UI, pas du schéma.
- [x] `duplicate()` doit **copier les règles de notification** (gap actuel : il copie les étapes mais pas les règles).

## 3. Les 6 lots de travail

### Lot 0 — Corrections de bugs (quick wins)

Indépendant, livrable en premier, sans migration.

- [x] **`create()` n'impose pas la readiness** (`PipelineTemplateBusiness.create`, ~L50-102) : forcer `isActive=false` à la création ; l'activation passe par le `setDefault()`/activation vérifiés (cohérent avec la fiche 41).
- [x] **`delete()` sans garde campagne ouverte** (`~L168-207`) : réutiliser la vérification de `ensureTemplateCanBeDisabled` avant suppression.
- [x] **`duplicate()` ne copie pas les règles de notification** : copier les `pipeline_stage_notification_rule` de chaque étape dans le duplicate.
- [x] **`update()` n'impose pas les bornes** (`PipelineStageBusiness.update`) : interdire de re-typer CANDIDATURE/DECISION et garantir la position tête/queue, y compris via un update direct d'API.
- [x] **Permissions front incohérentes** :
  - route édit `pipeline-templates/:id/edit` : accepter `VIEW_PIPELINE_TEMPLATE` (lecture seule — l'éditeur gère déjà le mode verrouillé) en plus de `UPDATE_PIPELINE_TEMPLATE` ;
  - menu latéral (`dashboard.ts` L201-207) : aligner la permission d'affichage sur `VIEW_PIPELINE_TEMPLATE` ;
  - les mutations restent protégées côté backend (aucun relâchement de droits d'écriture).
- [x] **Rescapés EVALUATION** (`pipeline-template-edit.ts` ~L424-431) : retirer la fallback dropdown `EVALUATION` et le label legacy (données déjà migrées par V1_076).
- [x] **`track by stageOrder`** → composite `id || uid` dans `pipeline-template-edit.html` L88/L122 et `pipeline-templates.html` L120 (évite la perte de focus/state, devient indispensable en multi-rounds).
- [x] Vérifier l'ordre de déactivation dans `save()` (`pipeline-template-edit.ts` ~L525-528) : la déactivation avant sauvegarde des étapes peut laisser le template désactivé si une étape échoue — documenter ou améliorer.

### Lot A — Multi-rounds (item 1)

Socle : note 420 (phases A-F). Aucune migration de schéma (la multiplicité est une règle applicative, pas une contrainte de base).

Backend :

- [x] **Lever le verrou singleton** :
  - `ensureSingletonStageTypeNotDuplicated` et `isSingletonIntermediateStageType` **supprimés** de `PipelineStageBusiness` (create et update) ;
  - doublons QUIZ/PRESELECTION/INTERVIEW **retirés** de `validateTemplateReadiness` (`PipelineTemplateBusiness`) ;
  - unicité CANDIDATURE/DECISION (bornes), ordre continu et « ≥1 étape intermédiaire » **conservés** — bornes désormais imposées aussi via update direct d'API (`update_rejectsRetypingBoundaryStage`, `update_rejectsMovingBoundaryStageFromHeadOrTail`).
- [x] **Runtime occurrence-aware** (le cœur du chantier, détaillé en phase E de la 420) :
  - `ApplicationProgressBusiness` : `listProgressOccurrences(applicationId, stageType)` public (L1142), `findProgressByStageType` délègue désormais à la liste d'occurrences ; `updateStageScore` rendu public pour le scoring par occurrence ;
  - `ApplicationsBusiness` : la notation quiz passe par `resolveQuizProgress` (occurrence déjà chargée) au lieu d'une résolution par type seule (L3192-3212) ;
  - `InterviewsBusiness` : le calcul des rounds itère sur `listProgressOccurrences(applicationId, "INTERVIEW")` avec `roundOffset` (L488-508) ; `findByTemplateIdAndStageType` remplacé par `countByTemplateIdAndStageType` (L185) et la résolution d'étape par `application_progress` (L796) ;
  - `PipelineStageRepository.findByTemplateIdAndStageType` → **`countByTemplateIdAndStageType`** (L34) ; plus aucun usage du singleton dans le code (grep = 0).
- [x] Tests : templates à 2 quiz / 2 entretiens / 2 présélections (readiness OK, runtime qui crée et skip le 2e round correctement) :
  - `PipelineStageBusinessTest` : `create_allowsMultipleOccurrencesOfIntermediateStageTypes`, `update_allowsRetypingStageToAnAlreadyUsedIntermediateType`, bornes ;
  - `ApplicationProgressBusinessTest` : `listProgressOccurrences_returnsAllOccurrencesInStageOrder`, `resolveProgressByStageType_prefersNextPendingRoundOccurrence` ;
  - `InterviewsBusinessTest` : `create_linksInterviewToActiveInterviewRoundOccurrence` (2e round d'entretien).

Frontend :

- [x] `pipeline.interfaces.ts` `SINGLETON_INTERMEDIATE_STAGE_TYPES` : **constante et contrainte d'unicité supprimées** (`getPipelineReadinessIssues` ne limite plus que `CANDIDATURE == 1` et `DECISION >= 1`).
- [x] `getEditableStageTypeOptions` (`pipeline-template-edit.ts`) : un type déjà utilisé dans le template est à nouveau proposé (specs `still offers an already used intermediate type in editable options`).
- [x] `addStage()` / `hasAvailableStageTypeForCreation` : toujours disponible (hors template verrouillé) — spec `allows adding a second QUIZ round (multi-rounds)`.
- [x] Mettre à jour les specs associées : `pipeline-template-edit.spec.ts` couvert (multi-rounds) ; `pipeline-templates.spec.ts` couvert à la clôture (14 tests : aperçu = actifs via `getByTemplate`, états readiness, filtre, create brouillon, duplicate, setDefault, delete).

### Lot B — Versionnage fin des étapes (item 2)

Socle : fiche 41 §5.5 et section 4 de la présente note. C'est le chantier qui remplace le verrou binaire. Détail du mécanisme : section 4.

- [x] **Migration `V1_082__add_pipeline_stage_is_active.sql`** :
  - `is_active` BIT NOT NULL DEFAULT 1 ;
  - colonne générée `active_slot = IF(is_active, stage_order, NULL)` ;
  - `UNIQUE(pipeline_template_id, active_slot)` — au plus une révision active par slot ;
  - backfill : toutes les étapes existantes actives (comportement inchangé à la migration).
- [x] **Entité/DTO/transformer** `PipelineStage` : ajouter `isActive`.
- [x] **Repository** : requêtes actives (`findActiveByTemplateIdOrderByStageOrder`, `countActiveByTemplateId`, `findInactiveRevisions`), helper de verrou dérivé (`findUsedStageIds`) via `ApplicationProgressRepository`.
- [x] **Algorithme d'édition** (`PipelineStageBusiness.applyTargetConfig` + `saveTemplateStages`) : diff entre révisions actives (par `stage_order`) et config cible envoyée — voir section 4.3. Supprimer le blocage global `is_locked`.
- [x] **Readiness / activation / reorder** : évaluation sur les **révisions actives** uniquement.
- [x] Frontend : l'éditeur charge et sauvegarde les actifs uniquement ; badge verrou **par étape** ; réordonner = réordonner les actifs ; `isActive`/`isLocked` dans `pipeline.interfaces.ts`.
- [x] Tests : étape verrouillée modifiée → nouvelle révision ; réactivation d'une révision inactive identique ; slot retiré → désactivation (pas de suppression) ; readiness sur actifs.

### Lot C — Règles de notification éditables (item 3)

Aucune migration (table + entité + repo existants).

- [x] **Backend** : Business + DTO + transformer + Controller sur `pipeline_stage_notification_rule` ; endpoints GET par étape (`/byStage`), create / update / delete logique, `saveStageRules` (remplacement bulk), `getByCriteria` ; validations (trigger_code enum `STAGE_EMAIL` par défaut, outcome_code normalisé sur `StageType`, email_template_id FK, `is_automatic ⇒ is_required`) ; runtime actuel compatible (`ApplicationProgressBusiness` L1194, `DecisionBusiness` L1045, `InterviewsBusiness` L729). Tests : `PipelineStageNotificationRuleBusinessTest` (11 tests).
- [x] **Frontend** : panneau « Règles de notification » par étape dans l'éditeur (déclencheur, issue, modèle d'email, required/automatic/manual), add/edit/delete, picker de modèles d'email (endpoint générique existant), enregistrement bulk via `POST /pipelineStageNotificationRule/saveStageRules`. Tests : `pipeline-template-edit.spec.ts` (chargement, brouillon, save bulk, étape non enregistrée).
- [x] Couplage avec Lot 0 : la copie des règles dans `duplicate()`.

### Lot D — Grille d'évaluation par étape INTERVIEW (item 4)

Socle : note 430 (phases A-C : colonne `evaluation_grid_template_version_id`, hash, verrou à l'usage).

- [x] **Éditeur** : section « Grille d'évaluation » sur les étapes INTERVIEW — picker grille → version (catalogue `POST /evaluationGrid/templates` : templates actifs + versions publiées), lecture seule si l'étape est verrouillée (Lot B), nettoyage du champ si le type quitte INTERVIEW.
- [x] **Backend** : poser `pipeline_stage.evaluation_grid_template_version_id` via l'update d'étape (`saveTemplateStages`/`applyTargetConfig`), validation 430 (`validateEvaluationGrid` dans `PipelineStageBusiness` : grille uniquement sur INTERVIEW, version existante). Tests : `PipelineStageBusinessTest` (acceptation sur INTERVIEW, refus sur QUIZ, version inexistante refusée).
- [x] **Runtime** : la grille de notation est lue via l'étape — socle 430 Phase C (`EvaluationsBusiness.loadStageCriteria` L1009-1036 passe par `pipeline_stage.evaluation_grid_template_version_id`, `deriveGlobalScoreFromEvaluationItems` L636-681).
- [x] Couplage : la colonne grille « voyage » avec les révisions d'étape du Lot B (une révision porte sa propre version de grille) — vérifié par test sur la persistance du champ via le diff.
- **Hors périmètre 440** : le CRUD de la bibliothèque de grilles (créer/éditer des grilles et versions), les Règles B/C/D de versionnage (`content_hash` forme canonique, réutilisation par contenu, repointage) et le nettoyage des orphelins — re-pointés vers la note 460. Le Lot D ne fournit que le picker lecture seule (`POST /evaluationGrid/templates`), le backend pose + validation `validateEvaluationGrid`, et la persistance via le diff.

## 4. Mécanisme du versionnage fin des étapes (Lot B)

### 4.1 Aujourd'hui

`pipeline_template.is_locked = 1` dès le premier candidat ; l'éditeur se fige **en bloc** : plus rien de modifiable, même une étape jamais atteinte (ex. DECISION). Tout ou rien.

### 4.2 Demain

1. **Verrou dérivé, non stocké** : une étape est verrouillée s'il existe un `application_progress` qui la référence avec un statut **non-PENDING** (au moins un candidat l'a atteinte). Une étape jamais utilisée reste éditable même si le template « a vu » des candidats.
2. **Versionnage par slot** : chaque position du pipeline est un « slot ». À un instant donné, un slot a **au plus une révision active** + éventuellement des révisions inactives (historique). Garanti par `UNIQUE(pipeline_template_id, active_slot)`.
3. **Historique intact** : `application_progress.pipeline_stage_id` pointe toujours la **ligne d'origine** (jamais repointée) → une candidature passée lit la révision réellement vécue ; les nouveaux candidats prennent les révisions actives. Le runtime de lecture (`ApplicationProgressBusiness`) est inchangé de ce côté.

### 4.3 Algorithme d'édition

Le front n'envoie que la **configuration visible cible** (liste ordonnée des étapes actives). Le backend fait un diff avec les révisions actives courantes (par `stage_order`) :

| Cas | Action |
|---|---|
| Slot inchangé | garde la révision |
| Slot modifié + étape **non verrouillée** | modifie sur place (label, type, flags, config_json, grille…) |
| Slot modifié + étape **verrouillée** | passe l'actuelle en `is_active=false` (historique) ; puis **réactive une révision inactive identique** au même slot, sinon **crée une nouvelle révision** active |
| Slot retiré + non verrouillé | soft-delete |
| Slot retiré + verrouillé | `is_active=false` (reste en historique) |

### 4.4 Readiness / ordre / frontend

- **Readiness / activation** : évaluées sur les **révisions actives** (bornes CANDIDATURE/DECISION, ordre continu, ≥1 intermédiaire).
- **Frontend** : l'éditeur ne charge/sauvegarde que les actifs ; badge verrou **par étape** (plus de bandeau global) ; réordonner = réordonner les actifs (les inactifs gardent leur `stage_order` historique).
- `is_locked` du template : conservé en base, plus utilisé pour bloquer l'édition.

### 4.5 Exemple concret

Pipeline `[CANDIDATURE, QUIZ, INTERVIEW, DECISION]`, 5 candidats ont passé le QUIZ → CANDIDATURE et QUIZ verrouillées, INTERVIEW/DECISION libres :

- Ajouter un TEST en position 3 : possible, INTERVIEW/DECISION glissent. Les 5 candidats gardent leur QUIZ historique, les nouveaux font QUIZ + TEST.
- Modifier le libellé de l'INTERVIEW : possible (non verrouillée), sur place.
- Une fois l'INTERVIEW atteinte, toute modif ultérieure passe par révision (nouvelle ligne ou réactivation d'une révision identique).

## 5. Numérotation des migrations

- **430 (révisée)** : `V1_078__add_grid_lock_usage_schema.sql`, `V1_079__backfill_grid_usage_phase_b.sql`, `V1_080__drop_stage_evaluation_criterion.sql` + `V1_081__fix_content_hash_varchar.sql` (correction CHAR→VARCHAR de `content_hash` pour la validation Hibernate).
- **440** : `V1_082__add_pipeline_stage_is_active.sql` (Lot B).
- Lot 0 (corrections), Lot A (multi-rounds), Lot C (règles email), Lot D (grille) : **aucune migration** (colonnes `evaluation_grid_template_version_id` et tables de règles déjà présentes, V1_078 et V1_075/V1_076).

## 6. Checklist transverse

- [x] `mvnw compile` + tests backend (spring-boot) : 159 tests, dont 3 échecs pré-existants `QuestionBusinessTest` (hors périmètre 440).
- [x] `ng build --configuration=development` sans erreur.
- [x] Tests à couvrir (Lot A) :
  - `PipelineStageBusinessTest` : bornes, re-typage interdit, multi-types — **fait** ;
  - `ApplicationProgressBusinessTest` : résolution par occurrence (multi-rounds) — **fait** ;
  - `InterviewsBusinessTest` : 2e round d'entretien — **fait** ;
  - `pipeline-template-edit.spec.ts` : multi-rounds — **fait**.
- [x] Tests du Lot B :
  - `PipelineStageBusinessTest` (réécrit, moteur `saveTemplateStages`/`applyTargetConfig`) — **fait** ;
  - `PipelineTemplateBusinessTest` (create inactif, readiness sur actifs, update déverrouillé, delete gardé) — **fait** ;
  - `pipeline-template-edit.spec.ts` (verrou par étape, save bulk `saveTemplateStages`, reorder local) — **fait**.
- [x] Tests du Lot C (règles de notification) :
  - `PipelineStageNotificationRuleBusinessTest` (11 tests : create/update/delete, `saveStageRules` bulk, `getByStage`, validations) — **fait** ;
  - `pipeline-template-edit.spec.ts` (brouillon de règle, suppression locale, `saveStageRules`, étape non enregistrée) — **fait**.
- [x] Tests du Lot D (grille) :
  - `PipelineStageBusinessTest` (grille acceptée sur INTERVIEW, refusée sur QUIZ, version inexistante refusée, persistance via le diff) — **fait** ;
  - `pipeline-template-edit.spec.ts` (payload `evaluationGridTemplateVersionId`, nettoyage quand le type quitte INTERVIEW) — **fait**.
- [x] Tests restants (lots C/D) : `pipeline-templates.spec.ts` (14 tests : aperçu = actifs via `getByTemplate`, états readiness, filtre, create brouillon, duplicate, setDefault, delete) — **fait**.
- [x] Mettre à jour les notes :
  - cocher les phases E/F de la note 420 (résolutions par occurrence, sortie de `email_required`/`email_automatic`) — **fait** (note 420, fiche 41) ;
  - enrichir la 430 avec l'intégration éditeur (section « Grille d'évaluation ») — **fait (430, section 7)** ;
  - fiches cartographie 40/41 ; entités 260-pipeline-stages, 110-evaluations, 230-application-progress — **fait**.
- [x] Mini-BD `bd_documentee/exemples/data.js` : exemple multi-rounds (2 INTERVIEW), règles de notification, grille liée, `is_active`/`active_slot` — cohérent avec la 430 (section 9).
- [x] Collections Postman des nouveaux endpoints (Lot C : `pipelineStageNotificationRule`, Lot D : `evaluationGrid/templates`) — **fait** (v1 + v2, 20 dossiers/79 requêtes, parité vérifiée ; correction au passage de 2 lignes `"raw"` orphelines qui invalidaient le JSON v2 pré-existant).

## 7. Points d'attention

- **Résolution par type → par occurrence** : c'est le risque principal du Lot A — toute résolution `findByStageType` laissée en place casserait les rounds multiples. **Vérifié sur le Lot A livré** : `findByTemplateIdAndStageType` = 0 usage (remplacé par `countByTemplateIdAndStageType`) ; les `findProgressByStageType` restants délèguent tous à `resolveProgressByStageType`/`listProgressOccurrences` (occurrence-aware) — seules les résolutions de bornes CANDIDATURE/DECISION restent par type.
- **UNIQUE(template_id, active_slot)** : l'ordre des opérations du Lot B doit garantir qu'un slot ne porte jamais deux actifs à l'instant T (transaction + verrouillage de ligne).
- **Révisions inactives jamais repointées** : une candidature passée lit sa révision d'origine ; interdire tout repointage d'`application_progress`.
- **`duplicate()`** : copier étapes + règles de notification + (si actif) grille liée — sinon le duplicata perd la config.
- **Permissions** : la lecture seule en `VIEW_PIPELINE_TEMPLATE` ne doit jamais exposer les mutations ; le backend reste l'autorité.
- **Cohérence avec la 430** : la colonne grille voyage avec la révision d'étape (Lot B) ; le verrou de version de grille et le verrou d'étape sont deux mécanismes distincts et cumulables.

## 8. Fichiers cartographie liés

- `cartographie-fonctionnelle-front/evolution/420-evolution-pipeline-multi-occurrences.md` : phases E/F à cocher, cible multi-rounds.
- `cartographie-fonctionnelle-front/evolution/430-evolution-grilles-verrou-usage.md` : socle du Lot D.
- `cartographie-fonctionnelle-front/evolution/460-evolution-bibliotheque-grilles.md` : CRUD de la bibliothèque de grilles + Règles B/C/D + nettoyage des orphelins (hors périmètre 440, re-pointés).
- `quizapp/src/main/java/tech/synelia/quizapp/business/PipelineTemplateBusiness.java`, `PipelineStageBusiness.java`, `ApplicationProgressBusiness.java`, `ApplicationsBusiness.java`, `InterviewsBusiness.java`, `DecisionBusiness.java`
- `quizapp/src/main/java/tech/synelia/quizapp/business/PipelineStageNotificationRuleBusiness.java`, `EvaluationGridBusiness.java` (Lot C/D)
- `quizapp/src/main/java/tech/synelia/quizapp/rest/api/PipelineStageNotificationRuleController.java`, `EvaluationGridController.java` (Lot C/D)
- `quizapp/src/main/java/tech/synelia/quizapp/dao/repository/PipelineStageRepository.java`, `PipelineStageNotificationRuleRepository.java` (existant — CRUD ajouté), `EvaluationGridTemplateRepository.java` (nouveau), `ApplicationProgressRepository.java`
- `quizapp/src/main/java/tech/synelia/quizapp/dao/entity/PipelineStageNotificationRule.java` (existant — CRUD à créer), `EvaluationGridTemplate.java` (nouveau)
- `quizapp/src/main/java/tech/synelia/quizapp/utils/dto/PipelineStageNotificationRuleDto.java`, `utils/dto/transformer/PipelineStageNotificationRuleTransformer.java`, `utils/enums/NotificationTrigger.java`, `utils/dto/EvaluationGridTemplateDto.java`, `utils/dto/EvaluationGridTemplateVersionDto.java`
- `quizapp/src/main/resources/db/migration/` : prochain script `V1_082__add_pipeline_stage_is_active.sql` (le `V1_081__fix_content_hash_varchar.sql` est déjà pris par la correction de la 430)
- `quizapp_front/src/app/pages/dashboard/pipeline-templates/`, `pipeline-template-edit/`
- `quizapp_front/src/app/core/services/pipeline-template.service.ts`, `pipeline-stage.service.ts`, `pipeline-stage-notification-rule.service.ts` (nouveau), `evaluation-grid.service.ts` (nouveau), `email-template.service.ts`, `core/models/pipeline.interfaces.ts`, `app.routes.ts` (L555-564), `core/guards/role.guard.ts` (L56-82), `pages/dashboard/dashboard.ts` (menu, L201-207)
- `cartographie-fonctionnelle-front/bd_documentee/quizapp_db_documentation_20260810.md`, `bd_documentee/exemples/data.js`
