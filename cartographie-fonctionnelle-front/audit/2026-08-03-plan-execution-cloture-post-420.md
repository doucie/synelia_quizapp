# 2026-08-03 Plan d'execution - cloture phases E/F migration 420

Date: 2026-08-03

Base: `audit/2026-08-03-audit-dependances-legacy-post-420.md` + `bd_actuelle/quizapp_db_cible_post_420_migration.md`

## 1. Objet

Ce document est le plan d'execution issu de l'audit des dependances legacy. Il repond a la question: quels attributs supprimer du code, par quoi les remplacer, et dans quel ordre.

Principe directeur (repris du doc cible §6): les identifiants de round font foi via `application_progress_id`; `applications` devient une table de resume et de pointeurs courants. Aucun DROP ne precede la bascule de runtime de la dependance correspondante, et chaque phase deplace d'abord les donnees de ses colonnes vers les colonnes cibles avant de dropper (regle "conserver les donnees"). Chaque phase porte sa propre migration (mouvement de donnees + DROP), appliquee et testee directement.

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
| `resolveTrackedApplicationStatus(...)` | ApplicationsBusiness.java:3615 | `application_status` | derive DTO sans persistance; source = miroirs `current_pipeline_*` + decisions (apres Phase 2) |
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

Regle d'ordre: chaque phase doit laisser le projet compilable, les tests verts, et le schema en etat testable (migration de phase appliquee). Ordre de chaque phase: 1) bascule runtime en code, 2) rg (0 reference legacy), 3) retrait entite/DTO/transformer/front, 4) ecriture de la migration de phase (mouvement de donnees puis DROP), 5) application + verification des donnees conservees (comptages avant/apres) + tests + smoke, 6) regeneration du snapshot BD. Une migration appliquee est immuable (Flyway): la bascule runtime doit etre verrouillee avant d'ecrire la migration.

### Phase 1 - Fondations multi-occurrence quiz (perimetre: applications.quiz_* + candidate_answer.application_id)

Objectif: arreter de lire/ecrire les colonnes quiz de `applications`; basculer tout le runtime sur `application_quiz_attempt`.

Prealables (decisions requises avant de commencer):

- [x] Arbitrage 1 `quiz_level` (RESOLU 2026-08-03): ABANDON DOCUMENTE. Marqueur de progression vestigial (ordre de la derniere question repondue): ecrit a la creation (:293), au demarrage (:1281) et a chaque reponse (:2079-2081), mais jamais lu cote backend (logs + retour DTO uniquement) ni consomme par le front (declare dans l'interface DTO, jamais utilise). `quiz_level` entre dans le DROP de V1_070; suppression des ecritures + DTO/entity.
- [x] Statut quiz Dashboard (RESOLU 2026-08-03): PROJECTION depuis `application_quiz_attempt.quiz_status`. Attempt courant = dernier non supprime (id max, `findByApplicationIdOrderByIdDesc(...).first()`). Pas de colonne additive. Candidature sans attempt = EXCLUE du `quizDistribution` (statut/score DTO null).

Taches:

- [ ] `CandidateAnswerRepository`: supprimer `findByApplicationId`, `findByApplicationIdAndAnswerId`, `findByApplicationIdAndQuestionId`; basculer les appels (ApplicationsBusiness 2598/2616/2633, CandidateAnswerBusiness 503) sur les equivalents `findByApplicationQuizAttemptId...`; supprimer le critere `e.applications.id` de `generateCriteria` (213-214) -> `e.applicationQuizAttempt.id`.
- [ ] `ApplicationsBusiness`: arreter `candidateAnswer.setApplications(...)` (2638, `buildCandidateAnswer`); supprimer les fallbacks legacy `findCandidateAnswersForQuizContext`/`findCandidateAnswersForQuestionContext`/`findCandidateAnswerForAnswerContext` (2598/2616/2633) et `shouldFallbackToLegacyQuizAnswers` (2649): l'attempt est desormais toujours requis.
- [ ] `CandidateAnswerBusiness`: create/update/updateDeleted/updateAll - valider `applicationQuizAttemptId` (requis) au lieu de `applicationId`; arreter `setApplications` (177/666/741); completer `CandidateAnswerTransformer.toEntity` (ligne 94 `ignore=true`) pour mapper `applicationQuizAttempt` depuis le DTO; conserver `setApplicationQuizAttempt` dans `resolveQuestionManualCorrectionCarrier` (565-567).
- [ ] `ApplicationsBusiness.syncApplicationQuizSummaryFromAttempt` (3164): ne plus ecrire `applications.quiz_*` (3169-3175); ecrire uniquement `aggregated_quiz_score`/`aggregated_quiz_score_percent`.
- [ ] `ApplicationsBusiness` demarrage quiz (1278-1282): arreter les ecritures directes `application.setQuizStatus(STARTED)`/`setQuizLevel`; ne muter que l'attempt (1287-1296); verifier que le flux garantit un attempt avant toute ecriture (creation au start si absent).
- [ ] Remplacer les lectures directes `application.getQuiz*()` par `quizAttempt.getQuiz*()`: 2202-2214, 3303-3329, 2935-2936, 3538, 4178, 2654-2679, 3028-3124, ET 1255-1259, 1810, 2087-2096 (`isQuizResumable`/`quizLevel`), 2788-2790 (timeout), 2835-2836 (`lastActivityAt`), 4155-4163 (fallback `quizToken`).
- [ ] Job planifie d'abandon `abandonInactiveQuizApplications` (2294-2313): remplacer `findActiveByQuizStatus(STARTED)` (miroir, `ApplicationsRepository` 180-181) par une requete sur les attempts (quizStatus STARTED, isDeleted=false, application non abandonnee); supprimer `findActiveByQuizStatus`.
- [ ] Retirer les ecritures doubles hors `syncApplicationQuizSummaryFromAttempt`: `applyQuizTimingSnapshot` (branche application), `refreshQuizTimingState` branche application (3060-3074, 3123), `touchQuizLastActivity` branche miroir (2872-2876), `completeQuizInternal` (3155); `getQuiz` doit lire `timeElapsed` depuis l'attempt (2214).
- [ ] `resolveQuizStatus` (2674-2679): supprimer la branche miroir `application.getQuizStatus()`. `validateQuizSessionAccess` (2684-2695): `expectedQuizToken` depuis l'attempt uniquement. `buildTrackedQuizData` (4153-4180): token/statut/lastActivity depuis l'attempt uniquement (plus de fallback application).
- [ ] Garantir "token emis => attempt existe" dans les 3 flux de creation de token (340-378, 1031-1049, 3480-3493): si `createQuizAttemptForVerifiedApplication` renvoie null, NE PAS poser `applications.quiz_token` (erreur explicite).
- [ ] Supprimer `findByQuizScore` (`ApplicationsRepository` 105-106): methode morte sans appelant.
- [ ] `ApplicationsBusiness`/`DashboardController` (230-235, 317-341): KPIs score/percent sur `aggregated_*`; KPIs par statut via projection attempt (dernier non supprime); candidature sans attempt exclue du `quizDistribution`; supprimer les lectures `getQuizStatus()`.
- [ ] DTO/Transformer: retirer `quiz_*` de `ApplicationsDto`/`ApplicationsTransformer` et les SearchParam associes (`ApplicationsRepository.generateCriteria` 399-400 `e.quizScore`, `quizStatus`/`quizLevel`/`quizToken` non mappes); exposer `aggregated_*`; retirer le filtre admin `quizStatus` (front `application.service.ts` 462 - no-op cote backend).
- [ ] Front: mettre a jour `application.service.ts`, `applications.*`, `entities-applications.*`, `candidate-detail.*`, `quiz.*`, `track-application.*` pour lire le quiz via le resume attempt (DTO derive); basculer l'envoi de reponse sur `applicationQuizAttemptId`; simplifier les fallbacks `attempt -> miroir` (miroir supprime): `applications.ts` (1335-1347), `entities-applications` (480-531), `evaluations-list` (187), `evaluations` (422), `interview-admin` (228), `decisions` (530).
- [ ] Entite JPA: retirer la FK `applications` de `CandidateAnswer.java` (75-76) et les champs quiz de `Applications.java` (77-120); mapper `aggregated_quiz_*`.
- [ ] Migration `V1_070__migrate_quiz_legacy_columns.sql` (mouvement de donnees puis DROP):
  - backfill de repli: rattacher les `candidate_answer` a `application_quiz_attempt_id` NULL au seul attempt de leur candidature (reprendre la logique `tmp_phase_b_single_quiz_attempt` de V1_061); tout NULL restant apres backfill -> echec explicite de la migration.
  - backfill `applications.aggregated_quiz_score(_percent)` depuis l'attempt.
  - DROP FK `fk_ca_application` (V1_001) ET `fk_candidate_answer_attempt_app` (composite V1_060) avant le DROP de la colonne; MODIFY `application_quiz_attempt_id` NOT NULL; ajout FK simple sur `application_quiz_attempt(id)`.
  - DROP `candidate_answer.application_id`.
  - DROP `applications.quiz_score`, `quiz_token`, `quiz_status`, `quiz_level`, `total_questions`, `quiz_score_percent`, `quiz_manual_correction_status`, `time_elapsed`, `quiz_timed_snapshot`, `quiz_total_time_allowed_snapshot`, `quiz_last_activity_at` (arbitrages 1 et 4 tranches; `quiz_level` inclus).
  - DDL MySQL non transactionnel: tester sur une copie de la BD avant application sur la BD partagee.
- [ ] Tests: `ApplicationsBusinessTest` (assertions 216-218/262/309 sur `getQuizStatus()`/`getQuizScore()` a reporter sur l'attempt/aggregated), spec front.

Sortie de phase: migration V1_070 appliquee; donnees conservees (comptages avant/apres dans la migration); aucune reference legacy quiz (rg backend+front); build + tests verts; snapshot BD regenere.

### Phase 2 - Statut candidat (perimetre: applications.application_status)

Objectif: supprimer la derive ecrite de `application_status`.

Taches:

- [ ] `ApplicationProgressBusiness.syncApplicationStatus`: remplacer l'ecriture `app.setApplicationStatus(...)` par la mise a jour des miroirs `current_pipeline_stage_type/label/progress_status` (+ `current_application_progress_id`/`current_pipeline_stage_id`).
- [ ] `DecisionBusiness.syncApplicationStatusFromCurrentDecisions`: idem (miroirs `current_preselection_*`/`current_final_decision_*`).
- [ ] `ApplicationsRepository.findByApplicationStatus`: basculer sur un critere `current_pipeline_progress_status`.
- [ ] DTO/Transformer: retirer `applicationStatus`; exposer le statut derive (computed, non persiste).
- [ ] `DashboardController` (lignes 224-329): utiliser les miroirs.
- [ ] Front: `application-status.constants.ts` reste pour l'affichage des libelles, mais la source change; `applications.*`, `candidate-detail.*`, `track-application.*`, `decisions.*`, `interview-create.*`.
- [ ] `ApplicationsBusiness.resolveTrackedApplicationStatus` (3615): reecrire la derive depuis les miroirs `current_pipeline_*` + decisions (la colonne `application_status` est droppee, `getApplicationStatus()` disparait).
- [ ] Entite JPA: retirer `applicationStatus` de `Applications.java` (89).
- [ ] Migration `V1_071__migrate_application_status.sql`: backfill des miroirs `current_pipeline_stage_type/label/progress_status` + `current_preselection_*` + `current_final_decision_*` (colonnes V1_063-065, potentiellement NULL) depuis l'etat pipeline courant; DROP `applications.application_status`.
- [ ] Tests: `ApplicationProgressBusinessTest`/`DecisionBusinessTest` + spec front.

Sortie de phase: migration V1_071 appliquee; miroirs backfilles (donnees conservees, statut recalculable); `application_status` plus ecrit ni lu; build + tests verts; snapshot BD regenere.

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
- [ ] `syncApplicationInterviewSummary` (ApplicationsBusiness 3187): arreter d'ecrire `applications.interview_date`/`interview_status`; basculer la synthese sur `aggregated_evaluation_*`.
- [ ] Entites JPA: retirer les champs legacy (`Interviews.java` 65-72/85-92/122-127, `CandidateInterview.java` 46/49/91, `Evaluations.java` 52/55, `Applications.java` `interview_date`/`interview_status`/`total_evaluation_*`); mapper `evaluation_room_code`.
- [ ] Migration `V1_072__migrate_interview_evaluation_columns.sql` (mouvement de donnees puis DROP): garde-fou 0 NULL sur `interviews.application_progress_id`; `candidate_interview.interview_start` -> `interviews.interview_date`; `evaluations.candidate_mark`/`recruiter_comment` -> `global_score`/`global_comment` (+ detail `evaluation_item`, arbitrage 3); backfill `applications.aggregated_evaluation_*` depuis `evaluations`; RENAME `interviews.interview_evaluations_link` -> `evaluation_room_code` (MODIFY varchar(8)); DROP `interviews.campaign_id`/`application_id`/`interview_mail_sent`/`evaluation_score`/`evaluation_number`/`evaluation_percentage`; DROP `candidate_interview.interview_start`/`application_id` (+ `interview_duration` selon arbitrage 2); DROP `evaluations.candidate_mark`/`recruiter_comment`; DROP `applications.interview_date`/`interview_status`/`total_evaluation_score`/`total_evaluation_number`/`total_evaluation_percentage`.
- [ ] Tests: `InterviewsBusinessTest`/`EvaluationsBusinessTest` + spec front.

Sortie de phase: migration V1_072 appliquee; entretien/runtime sur `application_progress_id`; evaluations sur `evaluation_item`/`global_score`; rename fait; donnees conservees; build + tests verts; snapshot BD regenere.

### Phase 4 - Decisions (perimetre: decisions.*, application_progress.decided_by)

Objectif: ancrer les decisions sur `application_progress_id`; remplacer `is_cancel` par `decision_mode`.

Taches:

- [ ] `DecisionBusiness` create/update: ne plus ecrire `application_id`/`pipeline_stage_id` (lignes 152, 162, 336, 346, 884, 895, 906, 912, 1249); garder `application_progress_id` (deja present).
- [ ] `DecisionRepository.findByApplicationId` + `_DecisionRepository` (59): basculer sur `application_progress_id`.
- [ ] `normalizeDecisionMode` (853): consolider `is_cancel` -> `decision_mode`; retirer `getIsCancel/setIsCancel`.
- [ ] `DashboardController` (270): utiliser `decision_mode != CANCEL`.
- [ ] `application_progress.decided_by`: arreter l'ecriture (ApplicationProgressBusiness); decideur via `decisions.user_id` et `validated_by`/`skipped_by` (colonnes V1_060).
- [ ] DTO/Transformer/Front: `DecisionDto`, `DecisionTransformer`, `entities-decisions.*`, `decisions.*`, `pipeline.interfaces.ts`.
- [ ] Entites JPA: retirer `isCancel`/`applications`/`pipelineStage` de `Decision.java` (50/83) et `decidedBy` de `ApplicationProgress.java` (81-82).
- [ ] Migration `V1_073__migrate_decision_columns.sql`: `is_cancel=1` -> `decision_mode='CANCEL'`; backfill `decisions.application_progress_id` (0 NULL restant) depuis l'occurrence pipeline; `application_progress.decided_by` -> `validated_by`/`skipped_by` (via `decisions.user_id`); DROP `decisions.is_cancel`/`application_id`/`pipeline_stage_id`; DROP `application_progress.decided_by`.
- [ ] Tests: `DecisionBusinessTest` + spec front.

Sortie de phase: migration V1_073 appliquee; decisions mono-ancrees sur `application_progress_id`; `is_cancel`/`decided_by` plus utilises; donnees conservees; build + tests verts; snapshot BD regenere.

### Phase 5 - Pipeline stage emails (perimetre: pipeline_stage.email_*)

Objectif: deplacer la politique email vers `pipeline_stage_notification_rule`.

Taches:

- [ ] Modeliser la lecture des regles de `pipeline_stage_notification_rule` (table creee en V1_060) pour remplacer `emailRequired`/`emailAutomatic`.
- [ ] `PipelineStageBusiness` (9 refs), `PipelineTemplateBusiness` (4 refs), `_PipelineStageRepository` (3 refs), `InterviewsBusiness`/`DecisionBusiness`/`ApplicationProgressBusiness` (1 ref chacune): remplacer la lecture par la regle.
- [ ] `application_progress.mail_sent`: arreter l'ecriture; tracer via `mail_log` (colonnes V1_060).
- [ ] DTO/Transformer: retirer `emailRequired`/`emailAutomatic`.
- [ ] Front: `pipeline.interfaces.ts`, `pipeline-stage.service.ts`, `pipeline-template-edit.*`.
- [ ] Entites JPA: retirer `emailRequired`/`emailAutomatic` de `PipelineStage.java` (47/50) et `mailSent` de `ApplicationProgress.java` (49).
- [ ] Migration `V1_074__migrate_email_rule_columns.sql`: seed `pipeline_stage_notification_rule` depuis `email_required`/`email_automatic` (regles de notification); `application_progress.mail_sent=1` -> ligne `mail_log` (si absente); DROP `pipeline_stage.email_required`/`email_automatic`; DROP `application_progress.mail_sent`.
- [ ] Tests: spec front + tests backend touches.

Sortie de phase: migration V1_074 appliquee; politique email dans `pipeline_stage_notification_rule`; trace mail dans `mail_log`; donnees conservees; build + tests verts; snapshot BD regenere.

### Phase 6 - Reconciliation finale

Objectif: reconciliation globale, alignement des enums, verification finale que le schema est conforme a la cible post-420.

Taches:

- [ ] Migration `V1_075__final_reconciliation.sql`: verifications croisees (comptages avant/apres, 0 perte), backfills residuels eventuels sur `aggregated_*`/`current_*`/`abandoned_*`.
- [ ] Mapper les colonnes de synthese cible restantes dans les entites JPA si non faites en phase: `current_application_progress_id`, `current_pipeline_stage_id`, `last_progressed_at`, `aggregated_*`, `abandoned_at`, `abandon_reason`, `abandoned_from_application_progress_id`.
- [ ] Enums: aligner `StageType` (retirer TECHNICAL_TEST/EVALUATION/CUSTOM), `ProgressStatus` (PASSED->COMPLETED, +AWAITING_VALIDATION), `QuizStatus` (+EXPIRED/CANCELLED), `InterviewStatus` (cible 6 valeurs); introduire `EvaluationStatus`, `DecisionMode`, `CandidateResponseStatus`.
- [ ] Verifications globales: `rg` backend + front a 0 reference legacy (DoD §6).
- [ ] Snapshot final `quizapp_db_described_*.md` + mise a jour du doc cible si besoin.

Sortie de phase: schema = cible post-420 (liste §7 du doc cible entierement traitee); code sans reference legacy; snapshots a jour.

### Phase 7 - Front (nettoyage final)

Objectif: retirer les champs legacy restants des interfaces et ecrans.

Taches:

- [ ] `pipeline.interfaces.ts`: retirer `emailRequired`, `emailAutomatic`, `mailSent`, `decidedById`, `decidedByFirstName/LastName`, `applicationId`, `pipelineStageId`.
- [ ] Interfaces DTO cote front (application, interview, evaluation, decision, candidate-interview): retirer les champs supprimes.
- [ ] Ecrans: `applications.*`, `entities-applications.*`, `interviews.*`, `interview-create.*`, `entities-interviews.*`, `evaluations.*`, `evaluations-list.*`, `entities-candidate-interview.*`, `entities-decisions.*`, `decisions.*`, `pipeline-template-edit.*`, `track-application.*`, `candidate-detail.*`, `entities-application-progress.*`.
- [ ] Specs front associes.

## 5. Risques et points a verifier

- `application_status` est la dependance la plus transverse (derive ecrite ~15 endroits + Dashboard + front): sa bascule (Phase 2) est le point critique.
- La regle "conserver les donnees" impose que chaque DROP soit precede du mouvement de donnees et d'une verification de comptage avant/apres dans la migration de phase.
- Une migration appliquee est immuable (Flyway): la bascule runtime de la phase doit etre verrouillee (rg + tests verts) avant d'ecrire la migration.
- DDL MySQL non transactionnel: chaque migration de phase (multi-ALTER) doit etre testee sur copie avant la BD partagee; ordonner DROP des FK avant DROP COLUMN.
- `CandidateAnswerBusiness.create()` peut produire des reponses a attempt NULL (transformer ignore `applicationQuizAttempt`): le backfill de repli de V1_070 est obligatoire avant le MODIFY NOT NULL, sinon la migration echoue ou genere des reponses orphelines.
- Les `SearchParam` exposes par l'API admin (`_*Repository`) seront retires en meme temps que les champs des DTO: verifier la compatibilite des filtres du front admin.

### Arbitrages BA (bloquants - colonnes sans cible, impossible de deplacer les donnees sans decision)

1. `quiz_level` (applications, Phase 1 - RESOLU 2026-08-03): ABANDON DOCUMENTE. Marqueur de progression vestigial (ordre de la derniere question repondue), ecrit mais jamais lu/consomme. Inclus dans le DROP de V1_070.
2. `interview_duration` (candidate_interview, Phase 3): rien dans la cible. Options: conserver dans la planification (colonne cible a definir) ou abandonner avec trace d'archive. Recommandation: porter dans la planification si utilise, sinon abandon documente.
3. Detail historique des evaluations (Phase 3): `candidate_mark` -> `global_score` est simple, mais les evaluations passees n'ont pas de critere (`evaluation_item.pipeline_stage_evaluation_criterion_id` NOT NULL). Options: creer un critere "legacy" par stage pour le detail historique, ou ne conserver que `global_score`/`global_comment` pour l'historique (les nouvelles saisies passent par les grilles).
4. Source du statut quiz Dashboard (Phase 1 - RESOLU 2026-08-03): PROJECTION depuis `application_quiz_attempt.quiz_status` (attempt courant = dernier non supprime, id max). Pas de colonne additive.

Decisions supplementaires (RESOLUES 2026-08-03):

- Candidature sans attempt: EXCLUE du `quizDistribution`; `quizStatus`/score DTO null.
- Filtre admin `quizStatus`: RETIRE (front `application.service.ts` 462 + DTO; deja no-op cote backend - seul `quizScore` etait mappe, `ApplicationsRepository` 400).
- `quiz_token`: GARANTIR "token emis => attempt existe" dans les 3 flux de creation (340-378, 1031-1049, 3480-3493); pas de token sans attempt.

## 6. Definition of done

- [ ] Pour chaque phase 1-5: migration de phase appliquee; donnees verifiees conservees (comptages avant/apres dans la migration).
- [ ] Snapshot `quizapp_db_described_*.md` regenere a chaque sortie de phase.
- [ ] `rg` sur le backend: 0 reference aux getters/setters legacy cibles (liste §2).
- [ ] `rg` sur le front: 0 reference aux champs legacy cibles (liste §2).
- [ ] `mvn compile` + tests backend verts.
- [ ] Build front + specs verts.
- [ ] Schema final conforme au doc cible §5/§7 (toutes les colonnes de la liste §7 retirees).

## 7. Dependances entre phases

```
Phase 1 (quiz)  -> Phase 2 (statut) peut commencer en parallele (application_status
                   ne depend pas des colonnes quiz) MAIS partage ApplicationsBusiness:
                   preferer sequence.
Phase 3 (entretien) depend de Phase 2 pour application_status (sync interviews
                   utilise le statut). 
Phase 4 (decisions) depend de Phase 3 (application_progress_id interviews).
Phase 5 (email stage) independante; peut etre mene en parallele de 3/4.
Migrations: une par phase (V1_070..V1_075), immuables et appliquees dans l'ordre
                   des phases; jamais modifiees une fois appliquees.
Phase 6 (reconciliation finale) apres 1-5. Phase 7 (front) en continu ou apres 6.
```

Ordre recommande: 1 -> 2 -> 3 -> 4 -> (5 en parallele) -> 6 -> 7.
