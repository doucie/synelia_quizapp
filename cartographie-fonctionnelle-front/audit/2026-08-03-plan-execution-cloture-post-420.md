# 2026-08-03 Plan d'execution - cloture phases E/F migration 420

Date: 2026-08-03

Base: `audit/2026-08-03-audit-dependances-legacy-post-420.md` + `bd_actuelle/quizapp_db_cible_post_420_migration.md`

## 1. Objet

Ce document est le plan d'execution issu de l'audit des dependances legacy. Il repond a la question: quels attributs supprimer du code, par quoi les remplacer, et dans quel ordre.

Principe directeur (repris du doc cible §6): les identifiants de round font foi via `application_progress_id`; `applications` devient une table de resume et de pointeurs courants. Aucun DROP ne precede la bascule de runtime de la dependance correspondante.

## 2. Matrice de remplacement exhaustive

Chaque ligne = un attribut a retirer. `TYPE`: R=read, W=write, API=DTO, SEARCH=critere, FRONT=front. `REMPLACEMENT`: attribut cible ou regle. `CIBLE`: couche(s) a modifier.

### 2.1 `applications` (17 colonnes)

| Colonne actuelle | Type | Remplacement cible | Cible |
| --- | --- | --- | --- |
| `quiz_score` | R/W | `application_quiz_attempt.score` (detail) + `aggregated_quiz_score` (resume) | ApplicationsBusiness, DTO, Dashboard, front |
| `quiz_status` | R/W | `application_quiz_attempt.quiz_status` (cascade existante a inverser) | ApplicationsBusiness, DTO, Dashboard, front |
| `quiz_level` | R/W | retire; remplace par position courante du quiz (resolu au runtime via attempt + question) | ApplicationsBusiness, DTO, front |
| `total_questions` | R/W | `application_quiz_attempt.total_questions` | ApplicationsBusiness, DTO, front |
| `quiz_score_percent` | R/W | `application_quiz_attempt.score_percent` + `aggregated_quiz_score_percent` | ApplicationsBusiness, DTO, Dashboard, front |
| `quiz_manual_correction_status` | R/W | `application_quiz_attempt.manual_correction_status` | ApplicationsBusiness, DTO, front |
| `time_elapsed` | R/W | `application_quiz_attempt.time_elapsed` | ApplicationsBusiness, DTO, front |
| `quiz_timed_snapshot` | R/W | `application_quiz_attempt.timed_snapshot` | ApplicationsBusiness, DTO |
| `quiz_total_time_allowed_snapshot` | R/W | `application_quiz_attempt.total_time_allowed_snapshot` | ApplicationsBusiness, DTO |
| `quiz_last_activity_at` | R/W | `application_quiz_attempt.last_activity_at` | ApplicationsBusiness, DTO |
| `quiz_token` | R/W | `application_quiz_attempt.quiz_token` | ApplicationsBusiness, DTO, front |
| `application_status` | R/W/SEARCH | retire; derive depuis `current_pipeline_progress_status` + `current_application_progress_id` (pas de colonne cible) | ApplicationProgressBusiness, DecisionBusiness, ApplicationsRepository, DTO, Dashboard, front |
| `interview_date` | W | retire; lu depuis `interviews.interview_date` (via application_progress) | ApplicationsBusiness (sync), transformer, DTO, front |
| `interview_status` | R/W | retire; lu depuis `interviews.interview_status` | ApplicationsBusiness, DTO, front |
| `total_evaluation_score` | W | `aggregated_evaluation_score` | EvaluationsBusiness, ApplicationsBusiness, DTO |
| `total_evaluation_number` | W | retire; `count(evaluations)` calcule a la lecture | EvaluationsBusiness, DTO |
| `total_evaluation_percentage` | W | `aggregated_evaluation_score_percent` | EvaluationsBusiness, DTO |

Remarque: `quiz_status`/`quiz_token` ont deja une cascade (lecture attempt d'abord, puis application). La bascule consiste a supprimer le fallback vers `applications`.

### 2.2 `application_progress` (2 colonnes)

| Colonne actuelle | Type | Remplacement cible | Cible |
| --- | --- | --- | --- |
| `decided_by` | R/W | retire; decideur porte par `decisions.user_id` ancre sur `application_progress_id` (ou `validated_by`/`skipped_by` existants) | ApplicationProgressBusiness, DTO, transformer, front |
| `mail_sent` | R/W | retire; trace dans `mail_log` + politique dans `pipeline_stage_notification_rule` | ApplicationProgressBusiness, DTO, transformer, front |

### 2.3 `pipeline_stage` (2 colonnes)

| Colonne actuelle | Type | Remplacement cible | Cible |
| --- | --- | --- | --- |
| `email_required` | R/W/SEARCH | `pipeline_stage_notification_rule` (nouvelle politique) | PipelineStageBusiness, PipelineTemplateBusiness, DTO, transformer, repo, front |
| `email_automatic` | R/W/SEARCH | `pipeline_stage_notification_rule` | idem |

### 2.4 `candidate_answer` (1 colonne)

| Colonne actuelle | Type | Remplacement cible | Cible |
| --- | --- | --- | --- |
| `application_id` | R/W | `application_quiz_attempt_id` (deja present + equivalents repository existants) | CandidateAnswerRepository, CandidateAnswerBusiness, ApplicationsBusiness |

### 2.5 `interviews` (7 colonnes)

| Colonne actuelle | Type | Remplacement cible | Cible |
| --- | --- | --- | --- |
| `campaign_id` | R/W/SEARCH | retire; campagne atteignable via `application_progress -> applications -> source_token -> campaigns` | InterviewsRepository, InterviewsBusiness, DTO |
| `application_id` | R/W/SEARCH | `application_progress_id` (deja present, V1_066) | InterviewsRepository, InterviewsBusiness, ApplicationsBusiness, EvaluationsBusiness, DTO |
| `interview_evaluations_link` | R/W | **rename** -> `evaluation_room_code` (colonne cible varchar(8)) | Interviews.java, InterviewsDto, InterviewsBusiness, front |
| `interview_mail_sent` | R/W | retire; `mail_log` | InterviewsBusiness, DTO, front |
| `evaluation_score` | R/W | retire; calcule depuis `evaluations` a la lecture | InterviewsBusiness, EvaluationsBusiness, DTO, front |
| `evaluation_number` | R/W | retire; `count(evaluations)` | idem |
| `evaluation_percentage` | R/W | retire; moyenne calculee a la lecture | idem |

### 2.6 `candidate_interview` (3 colonnes)

| Colonne actuelle | Type | Remplacement cible | Cible |
| --- | --- | --- | --- |
| `interview_start` | R/W | retire; utiliser `interviews.interview_date` (deja utilise par le transformer) | CandidateInterviewBusiness, InterviewsBusiness, ApplicationsBusiness, DTO, transformer, front |
| `interview_duration` | R/W | retire; pas d'equivalent cible (a rearbitrer: porter dans la planification ou abandonner) | CandidateInterviewBusiness, DTO, transformer, front |
| `application_id` | R/W | retire; atteignable via `interviews.application_progress_id` | CandidateInterviewRepository, CandidateInterviewBusiness, ApplicationsBusiness, EvaluationsBusiness, DTO |

### 2.7 `evaluations` (2 colonnes)

| Colonne actuelle | Type | Remplacement cible | Cible |
| --- | --- | --- | --- |
| `candidate_mark` | R/W/SEARCH | `evaluation_item` (detail) + `evaluations.global_score` (synthese) | EvaluationsBusiness, EvaluationsRepository, DTO, transformer, front |
| `recruiter_comment` | R/W/SEARCH | `evaluations.global_comment` | idem |

### 2.8 `decisions` (3 colonnes)

| Colonne actuelle | Type | Remplacement cible | Cible |
| --- | --- | --- | --- |
| `is_cancel` | R/W/SEARCH | `decision_mode` = `CANCEL` (cible: STANDARD/CANCEL/OVERRIDE/ROLLBACK) | DecisionBusiness, DecisionDto, DecisionTransformer, _DecisionRepository, DashboardController, front |
| `application_id` | R/W/SEARCH | `application_progress_id` (deja present et ecrit) | DecisionBusiness, DecisionRepository, _DecisionRepository, DTO, front |
| `pipeline_stage_id` | R/W | `application_progress_id` | DecisionBusiness, DecisionTransformer, ApplicationProgressBusiness, front |

## 3. Inventaire des methodes de derivation a refactorer

| Methode | Fichier | Colonnes legacy | Action |
| --- | --- | --- | --- |
| `syncApplicationQuizSummaryFromAttempt(...)` | ApplicationsBusiness.java:3164 | toutes `applications.quiz_*` | SUPPRIMER l'ecriture legacy; garder uniquement la synchro `current_*`/`aggregated_*` |
| `syncApplicationInterviewSummary(...)` | ApplicationsBusiness.java:3187 | `interview_date`, `interview_status`, `current_interview_evaluation_*` | conserver miroirs, arreter d'ecrire `interview_date`/`interview_status` |
| `selectCurrentInterview(...)` | ApplicationsBusiness.java | lecture `interviews.application_id` | basculer sur `application_progress_id` |
| `getInterviewSummaryPriority(...)` | ApplicationsBusiness.java:3220 | `interview_status` (lecture) | adapter a la source interviews |
| `syncApplicationStatus(...)` | ApplicationProgressBusiness.java:956 | `application_status` | remplacer la derive par `current_pipeline_*` miroirs |
| `syncApplicationStatusFromCurrentDecisions(...)` | DecisionBusiness.java:726 | `application_status` | idem |
| `resolveTrackedApplicationStatus(...)` | ApplicationsBusiness.java:3615 | `application_status` | derive DTO sans persistance |
| `normalizeDecisionMode(...)` | DecisionBusiness.java:853 | `is_cancel` | consolider vers `decision_mode` |
| `findByApplicationStatus(...)` | ApplicationsRepository.java:124 | `application_status` | remplacer par critere `current_pipeline_progress_status` |
| `findByApplicationIdAndAnswerId/QuestionId` | CandidateAnswerRepository.java | `application_id` | supprimer; utiliser les equivalents `findByApplicationQuizAttemptId...` |
| `findByApplicationId(...)` (CandidateAnswer) | CandidateAnswerRepository.java:51 | `application_id` | remplacer par parcours attempt |
| `findByApplicationId(...)` (Interviews) | InterviewsRepository.java:150 | `application_id` | remplacer par `application_progress` |
| `findByCampaignId(...)` (Interviews) | InterviewsRepository.java:142 | `campaign_id` | remplacer par `application_progress -> application -> source_token` |
| `findByApplicationId(...)` (Decision) | DecisionRepository.java:30 | `application_id` | remplacer par `application_progress_id` |
| `findByApplicationId(...)` (CandidateInterview) | CandidateInterviewRepository.java:124 | `application_id` | remplacer par navigation interviews |
| `sumMarksByApplicationId(...)` | EvaluationsRepository.java:147 | `candidate_mark` (via navigation) | remplacer par `evaluation_item` |
| `getEmailRequired/getEmailAutomatic` | PipelineStageBusiness/PipelineTemplateBusiness/InterviewsBusiness/DecisionBusiness/ApplicationProgressBusiness | `email_*` | remplacer par `pipeline_stage_notification_rule` |

## 4. Ordre d'execution par phase

Regle d'ordre: chaque phase doit laisser le projet compilable et les tests verts. Les migrations E/F sont ecrites a la toute fin, apres la bascule de runtime complete.

### Phase 1 - Fondations multi-occurrence quiz (perimetre: applications.quiz_* + candidate_answer.application_id)

Objectif: arreter de lire/ecrire les colonnes quiz de `applications`; basculer tout le runtime sur `application_quiz_attempt`.

Taches:

- [ ] `CandidateAnswerRepository`: supprimer `findByApplicationId`, `findByApplicationIdAndAnswerId`, `findByApplicationIdAndQuestionId`; basculer les appels (ApplicationsBusiness 2598/2616/2633, CandidateAnswerBusiness 503) sur les equivalents `findByApplicationQuizAttemptId...`.
- [ ] `CandidateAnswerBusiness`/`ApplicationsBusiness`: arreter `candidateAnswer.setApplications(...)`; utiliser uniquement `setApplicationQuizAttempt`.
- [ ] `ApplicationsBusiness.syncApplicationQuizSummaryFromAttempt`: ne plus ecrire `applications.quiz_*`; ne garder que les miroirs `current_*`/`aggregated_*` (a ajouter si absents).
- [ ] Remplacer les lectures directes `application.getQuiz*()` par `quizAttempt.getQuiz*()` (lignes 2202-2214, 3303-3329, 2935-2936, 3538, 4178, 2654-2679, 3028-3124).
- [ ] `ApplicationsBusiness` + Dashboard: arreter la synchro des statuts quiz sur `applications`; le resume passe par les colonnes `aggregated_*` calculees.
- [ ] DTO/Transformer: retirer `quiz_*` de `ApplicationsDto` et `ApplicationsTransformer`; ajouter `aggregated_*` si besoin d'exposition.
- [ ] Front: mettre a jour `application.service.ts`, `applications.*`, `entities-applications.*`, `candidate-detail.*`, `quiz.*`, `track-application.*` pour lire le quiz via le resume attempt (DTO derive).
- [ ] Tests: `ApplicationsBusinessTest` + spec front.

Sortie de phase: aucune reference legacy quiz dans le code; build + tests verts.

### Phase 2 - Statut candidat (perimetre: applications.application_status)

Objectif: supprimer la derive ecrite de `application_status`.

Taches:

- [ ] `ApplicationProgressBusiness.syncApplicationStatus`: remplacer l'ecriture `app.setApplicationStatus(...)` par la mise a jour des miroirs `current_pipeline_stage_type/label/progress_status` (+ `current_application_progress_id`/`current_pipeline_stage_id` si presents).
- [ ] `DecisionBusiness.syncApplicationStatusFromCurrentDecisions`: idem (miroirs `current_preselection_*`/`current_final_decision_*`).
- [ ] `ApplicationsRepository.findByApplicationStatus`: basculer sur un critere `current_pipeline_progress_status`.
- [ ] DTO/Transformer: retirer `applicationStatus`; exposer le statut derive (computed, non persiste).
- [ ] `DashboardController` (lignes 224-329): utiliser les miroirs.
- [ ] Front: `application-status.constants.ts` reste pour l'affichage des libelles, mais la source change; `applications.*`, `candidate-detail.*`, `track-application.*`, `decisions.*`, `interview-create.*`.
- [ ] `ApplicationsBusiness.resolveTrackedApplicationStatus` (3615): conserver comme derive de lecture seule.

Sortie de phase: `application_status` plus ecrit nulle part; uniquement lu en compat (a retirer ensuite).

### Phase 3 - Entretien / evaluation (perimetre: interviews.*, candidate_interview.*, evaluations.*)

Objectif: ancrer l'entretien sur `application_progress_id`; arreter les colonnes legacy interviews/candidate_interview; migrer la saisie evaluation vers `evaluation_item`.

Taches:

- [ ] `InterviewsBusiness` create/update: ne plus ecrire `campaign_id`/`application_id`; ecrire `application_progress_id` (existe deja: ligne 743).
- [ ] `InterviewsRepository`: supprimer `findByCampaignId`/`findByApplicationId`; ajouter `findByApplicationProgressId`; basculer `ApplicationsBusiness.selectCurrentInterview` (3192) et `EvaluationsBusiness` (781).
- [ ] `InterviewsBusiness` (622): `link.setApplications(interview.getApplications())` -> retrouver le link via `application_progress`.
- [ ] Renommage `interview_evaluations_link` -> `evaluation_room_code`: entite `Interviews.java` (65-66), `InterviewsDto`, `InterviewsBusiness` (328), generation du code; front `interview.service.ts`, `entities-interviews.*`, `candidate-detail.ts`, `evaluations-list.*`, `evaluation.service.ts`.
- [ ] `interviews.evaluation_*` (1308-1310, 1327-1329, 721-723): arreter l'ecriture; calculer a la lecture depuis `evaluations`/`evaluation_item` dans le DTO/transformer.
- [ ] `interview_mail_sent` (193, 361, 704, 711): arreter; tracer via `mail_log`.
- [ ] `candidate_interview`: arreter `interview_start`/`interview_duration`/`application_id` (ecritures: CandidateInterviewBusiness 201, InterviewsBusiness 624, ApplicationsBusiness 3883/3914); le transformer utilise deja `interviews.interview_date` (ligne 45).
- [ ] `CandidateInterviewRepository.findByApplicationId` + `EvaluationsBusiness` (705-710, 852-853, 1145-1174): naviguer via `interviews.application_progress_id`.
- [ ] Migrer la saisie `candidate_mark`/`recruiter_comment` vers `evaluation_item` + `global_score`/`global_comment` (EvaluationsBusiness 12+5 refs, EvaluationsRepository 147-155).
- [ ] DTO/Transformer/Front: `InterviewsDto`, `CandidateInterviewDto`, `EvaluationsDto` + ecrans `interviews.*`, `interview-create.*`, `evaluations.*`, `evaluations-list.*`, `track-application.*`, `candidate-detail.*`, `entities-*`.

Sortie de phase: entretien/runtime sur `application_progress_id`; evaluations sur `evaluation_item`; rename fait.

### Phase 4 - Decisions (perimetre: decisions.*, application_progress.decided_by)

Objectif: ancrer les decisions sur `application_progress_id`; remplacer `is_cancel` par `decision_mode`.

Taches:

- [ ] `DecisionBusiness` create/update: ne plus ecrire `application_id`/`pipeline_stage_id` (lignes 152, 162, 336, 346, 884, 895, 906, 912, 1249); garder `application_progress_id` (deja present).
- [ ] `DecisionRepository.findByApplicationId` + `_DecisionRepository` (59): basculer sur `application_progress_id`.
- [ ] `normalizeDecisionMode` (853): consolider `is_cancel` -> `decision_mode`; retirer `getIsCancel/setIsCancel`.
- [ ] `DashboardController` (270): utiliser `decision_mode != CANCEL`.
- [ ] `application_progress.decided_by`: arreter l'ecriture (ApplicationProgressBusiness); decideur via `decisions.user_id`.
- [ ] DTO/Transformer/Front: `DecisionDto`, `DecisionTransformer`, `entities-decisions.*`, `decisions.*`, `pipeline.interfaces.ts`.

Sortie de phase: decisions mono-ancrees sur `application_progress_id`; `is_cancel`/`decided_by` plus utilises.

### Phase 5 - Pipeline stage emails (perimetre: pipeline_stage.email_*)

Objectif: deplacer la politique email vers `pipeline_stage_notification_rule`.

Taches:

- [ ] Definir le modele de `pipeline_stage_notification_rule` (table deja "alignee" dans le doc cible): charger les regles existantes `email_required`/`email_automatic` dans les regles de notification (migration de donnees).
- [ ] `PipelineStageBusiness` (9 refs), `PipelineTemplateBusiness` (4 refs), `_PipelineStageRepository` (3 refs), `InterviewsBusiness`/`DecisionBusiness`/`ApplicationProgressBusiness` (1 ref chacune): remplacer la lecture par la regle.
- [ ] DTO/Transformer: retirer `emailRequired`/`emailAutomatic`.
- [ ] Front: `pipeline.interfaces.ts`, `pipeline-stage.service.ts`, `pipeline-template-edit.*`.

Sortie de phase: `email_*` plus lu nulle part.

### Phase 6 - Migrations E/F et nettoyage final

Objectif: ecrire les migrations qui renomment et droppent physiquement les colonnes; mettre a jour les entites JPA et le snapshot.

Taches:

- [ ] Migration `V1_070__rename_interview_evaluations_link.sql`: `ALTER TABLE interviews RENAME COLUMN interview_evaluations_link TO evaluation_room_code;`
- [ ] Migration `V1_071__drop_legacy_pipeline_columns.sql`: DROP des colonnes de la liste §7 du doc cible, par table, dans l'ordre des phases ci-dessus.
- [ ] Entites JPA: retirer les champs legacy (Applications 77-128, ApplicationProgress 49/81, PipelineStage 47/50, CandidateAnswer 75, Interviews 65-72/85-92/122-127, CandidateInterview 46/49/91, Evaluations 52/55, Decision 50/83).
- [ ] Mapper les colonnes de synthese cible manquantes: `current_application_progress_id`, `current_pipeline_stage_id`, `last_progressed_at`, `aggregated_quiz_score(_percent)`, `aggregated_evaluation_score(_percent)`, `abandoned_at`, `abandon_reason`, `abandoned_from_application_progress_id`.
- [ ] Enums: aligner `StageType` (retirer TECHNICAL_TEST/EVALUATION/CUSTOM), `ProgressStatus` (PASSED->COMPLETED, +AWAITING_VALIDATION), `QuizStatus` (+EXPIRED/CANCELLED), `InterviewStatus` (cible 6 valeurs); introduire `EvaluationStatus`, `DecisionMode`, `CandidateResponseStatus`.
- [ ] Mettre a jour `quizapp_db_described_2026MMDD.md` (nouveau snapshot) et `quizapp_db_cible_post_420_migration.md` si besoin.

Sortie de phase: schema = cible post-420; code sans reference legacy.

### Phase 7 - Front (nettoyage final)

Objectif: retirer les champs legacy restants des interfaces et ecrans.

Taches:

- [ ] `pipeline.interfaces.ts`: retirer `emailRequired`, `emailAutomatic`, `mailSent`, `decidedById`, `decidedByFirstName/LastName`, `applicationId`, `pipelineStageId`.
- [ ] Interfaces DTO cote front (application, interview, evaluation, decision, candidate-interview): retirer les champs supprimes.
- [ ] Ecrans: `applications.*`, `entities-applications.*`, `interviews.*`, `interview-create.*`, `entities-interviews.*`, `evaluations.*`, `evaluations-list.*`, `entities-candidate-interview.*`, `entities-decisions.*`, `decisions.*`, `pipeline-template-edit.*`, `track-application.*`, `candidate-detail.*`, `entities-application-progress.*`.
- [ ] Specs front associes.

## 5. Risques et points a verifier

- `application_status` est la dependance la plus transverse (derive ecrite ~15 endroits + Dashboard + front): sa bascule (Phase 2) est le point critique.
- `quiz_level` et `interview_duration` n'ont aucun equivalent cible: necessitent un arbitrage BA avant Phase 1/3 (recommandation: `quiz_level` resolu au runtime, `interview_duration` porte par la planification ou abandonne).
- La saisie `candidate_mark`/`recruiter_comment` est encore la source de notation active: la bascule vers `evaluation_item` doit conserver le scoring historique (migration de donnees).
- Les `SearchParam` exposes par l'API admin (`_*Repository`) seront retires en meme temps que les champs des DTO: verifier la compatibilite des filtres du front admin.

## 6. Definition of done

- [ ] `rg` sur le backend: 0 reference aux getters/setters legacy cibles (liste §2).
- [ ] `rg` sur le front: 0 reference aux champs legacy cibles (liste §2).
- [ ] `mvn compile` + tests backend verts.
- [ ] Build front + specs verts.
- [ ] Migrations V1_070/V1_071 appliquees; schema conforme au doc cible §5.
- [ ] Nouveau snapshot `quizapp_db_described_*.md` a jour.

## 7. Dependances entre phases

```
Phase 1 (quiz)  -> Phase 2 (statut) peut commencer en parallele (application_status
                   ne depend pas des colonnes quiz) MAIS partage ApplicationsBusiness:
                   preferer sequence.
Phase 3 (entretien) depend de Phase 2 pour application_status (sync interviews
                   utilise le statut). 
Phase 4 (decisions) depend de Phase 3 (application_progress_id interviews).
Phase 5 (email stage) independante; peut etre mene en parallele de 3/4.
Phase 6 (migrations) apres 1-5. Phase 7 (front) en continu ou apres 6.
```

Ordre recommande: 1 -> 2 -> 3 -> 4 -> (5 en parallele) -> 6 -> 7.
