
# 2026-08-03 Audit des dependances legacy - avant cloture phases E/F migration 420

Date: 2026-08-03

Source de reference: `bd_actuelle/quizapp_db_cible_post_420_migration.md` (cible theorique post-E/F)

## 1. Objet

Ce document est l'audit de dependances (phase 0) exige avant toute migration de cloture E/F de la migration 420. Il repond a la question suivante:

- quelles colonnes legacy encore presentes dans le schema `20260601` sont encore lues ou ecrites par le code backend et le front
- qui depend de ces colonnes, en lecture et en ecriture
- quelle est la surface de refactorisation a realiser avant de pouvoir dropper physiquement ces colonnes

Chaque colonne legacy est rattachee a son type de dependance:

- `READ` = le code lit la colonne (recupere une valeur persistee ou derivee)
- `WRITE` = le code ecrit la colonne (persiste une valeur)
- `API/DTO` = la colonne est exposee dans un DTO / transformer
- `SEARCH` = la colonne est un critere de recherche (Specification / Criteria)
- `REPO` = un repository requete par cette colonne (JPQL/derived)
- `FRONT` = le front consomme la colonne via les DTO

La liste des colonnes a retirer est reprise du doc cible, section 7.

## 2. Etat general

Toutes les colonnes legacy ciblees pour suppression sont **encore presentes** dans le schema actuel, dans les entites JPA, dans les DTO et sont **encore utilisees activement** par le runtime et le front.

Aucune migration de cloture (E/F) n'existe encore: la derniere migration est `V1_069__widen_status_columns.sql` qui ne fait qu'elargir `applications.application_status` (VARCHAR(50) NULL) et `applications.quiz_status` (VARCHAR(50) NOT NULL). Ces colonnes sont donc toujours operationnelles.

Aucun `evaluation_room_code` n'existe dans le code (`0` reference). Le renommage `interview_evaluations_link` -> `evaluation_room_code` n'est pas commence.

Les nouvelles colonnes de synthese cible (`current_application_progress_id`, `current_pipeline_stage_id`, `last_progressed_at`, `aggregated_quiz_score*`, `aggregated_evaluation_score*`, `abandoned_at`, `abandon_reason`, `abandoned_from_application_progress_id`) n'apparaissent dans **aucun** fichier Java (`0` reference). Elles existent peut-etre en DB (via V1_060 phase A) mais ne sont pas mappees ni utilisees par le code.

## 3. Les migrations 420 actuelles (phases A-D)

- `V1_060__add_multi_occurrence_phase_a_schema.sql` - schema multi-occurrence (`application_quiz_attempt`, colonnes `applications.*`)
- `V1_061__backfill_multi_occurrence_phase_b.sql` - backfill legacy -> multi-occurrence
- `V1_062__add_application_current_interview_evaluation_mirror.sql`
- `V1_063__add_application_current_preselection_mirror.sql`
- `V1_064__add_application_current_final_decision_mirror.sql`
- `V1_065__add_application_current_pipeline_stage_mirror.sql`
- `V1_066__link_interviews_to_application_progress.sql`
- `V1_067__backfill_missing_legacy_pipeline_runtime.sql`
- `V1_068__add_source_token_is_public.sql` (hors perimetre 420)
- `V1_069__widen_status_columns.sql` (elargissement, pas de suppression)

Conclusion: le travail effectue jusqu'ici est additif (on construit le nouveau modele a cote). Le nettoyage (rename + DROP) n'a pas commence.

## 4. Audit par table / colonne

### 4.1 `applications` (16 colonnes a retirer)

Colonnes cibles: `quiz_score`, `total_evaluation_score`, `total_evaluation_number`, `total_evaluation_percentage`, `application_status`, `quiz_token`, `quiz_status`, `quiz_level`, `total_questions`, `quiz_score_percent`, `quiz_manual_correction_status`, `time_elapsed`, `quiz_timed_snapshot`, `quiz_total_time_allowed_snapshot`, `quiz_last_activity_at`, `interview_date`, `interview_status`

Entite: `quizapp/src/main/java/tech/synelia/quizapp/dao/entity/Applications.java`
- toutes ces colonnes sont mappees (lignes 77-128)
- plus les miroirs `current_*` deja ajoutes (V1_062-065)

DTO: `quizapp/src/main/java/tech/synelia/quizapp/utils/dto/ApplicationsDto.java`
- lignes 45-59: champs legacy exposes
- lignes 107-122: `SearchParam<...>` pour chacun (critere de recherche)

Transformer: `quizapp/src/main/java/tech/synelia/quizapp/utils/dto/transformer/ApplicationsTransformer.java`
- mappings explicites des champs legacy (ex. lignes 44, 49-50, 89-96)

Dependances runtime (exemples significatifs, `ApplicationsBusiness.java`):

| Colonne | Type | References |
| --- | --- | --- |
| `quiz_status` | READ/WRITE | lignes 291, 780, 1037, 1255-1287, 1810, 2208, 2654-2679, 3156, 3169, 3303-3316, 3538 |
| `quiz_score` | READ/WRITE | lignes 2202, 2210, 2337, 3171 |
| `quiz_score_percent` | READ/WRITE | lignes 2202, 2212, 2339, 2935-2936, 3173, 3308-3329 |
| `quiz_level` | READ/WRITE | lignes 293, 1256, 1281, 2079-2096 |
| `total_questions` | READ/WRITE | lignes 784, 2211, 2338, 3172 |
| `quiz_manual_correction_status` | READ/WRITE | lignes 294, 2213, 2340, 3174, 3320 |
| `time_elapsed` | READ/WRITE | lignes 785, 2214, 2280, 3060-3124 |
| `quiz_timed_snapshot` | READ/WRITE | lignes 2759, 2788-2790, 3114-3124, 3176 |
| `quiz_total_time_allowed_snapshot` | READ/WRITE | lignes 2760, 2790, 3115-3124, 3177 |
| `quiz_last_activity_at` | READ/WRITE | lignes 2835-2836, 2873, 3155, 3178, 4178 |
| `quiz_token` | READ/WRITE | lignes 292, 357, 380, 1036, 2690-2692, 3170, 3283, 3492, 4155-4163 |
| `application_status` | READ/WRITE | lignes 2203, 2209, 3194-3201, 3615 |
| `interview_date` | WRITE | lignes 3194-3201 (synchro depuis interviews) |
| `interview_status` | READ/WRITE | lignes 3194-3201, 3220-3226 (derive de interviews) |
| `total_evaluation_score/number/percentage` | WRITE | maintenus par synchronisation (voir EvaluationsBusiness) |

Autres dependances:

- `ApplicationProgressBusiness.syncApplicationStatus(...)` (ligne 956) ecrit `applications.application_status` (ligne 978); appele depuis ~15 endroits du pipeline runtime
- `DecisionBusiness.syncApplicationStatusFromCurrentDecisions(...)` (ligne 726) ecrit aussi `application_status` (ligne 741)
- `ApplicationsRepository.findByApplicationStatus(...)` (ligne 124) - recherche par `application_status`
- `ApplicationsRepository` criteres de recherche (lignes 399-400) sur `quizScore`
- `DashboardController` lit massivement ces colonnes: `applicationStatus` (224, 279-285), `quizStatus` (232, 317-327), `quizScorePercent` (317-329), `getIsCancel` (270)
- tests: `ApplicationsBusinessTest.java` (lignes 189-618) depend de toutes ces colonnes

Role particulier de `application_status`: il est encore la source de verite du statut candidat derive (derive depuis le pipeline et re-ecrit a chaque transition). Le front en depend pour afficher le statut.

### 4.2 `application_progress` (2 colonnes)

Colonnes cibles: `decided_by`, `mail_sent`

Entite: `ApplicationProgress.java`
- `mail_sent` (ligne 49), `decided_by` (ligne 81, FK vers User)

DTO/Transformer: `ApplicationProgressDto.java` (`mailSent` ligne 24, `decidedById` ligne 35, `decidedByFirstName/LastName` lignes 47-48, params lignes 68/77); `ApplicationProgressTransformer.java` (lignes 37-39, 81, 87, 94)

Dependances runtime:

- `ApplicationProgressBusiness` - `mailSent` ~10 refs, `decidedBy` ~12 refs (marquage mail envoye, decision)
- `_ApplicationProgressRepository` - critere `applicationId` (ligne 53) et `mailSent`/`decidedBy` (3 refs chacun)
- `DecisionBusiness` - `getMailSent()` (1 ref), `getEmailRequired/Automatic` (1 ref)
- front: `pipeline.interfaces.ts` (`mailSent`, `decidedById`, `decidedByFirstName/LastName`), `application-progress.service.ts` (`decidedBy` 4 refs), `entities-application-progress.ts/html`

Note: `decided_by` est un `ManyToOne` vers `User` et sert au rattachement utilisateur du progrès; `mail_sent` sert au suivi d'envoi d'email de stage. Le doc cible les retire au profit du round runtime pur.

### 4.3 `pipeline_stage` (2 colonnes)

Colonnes cibles: `email_required`, `email_automatic`

Entite: `PipelineStage.java` (lignes 47, 50)

DTO/Transformer: `PipelineStageDto.java` (lignes 24-25, 55-56); `PipelineStageTransformer.java` (2 refs chacune)

Dependances runtime:

- `PipelineStageBusiness` - 9 refs chacune (validation/readiness)
- `PipelineTemplateBusiness` - 4 refs chacune
- `_PipelineStageRepository` - 3 refs chacune (criteres)
- `InterviewsBusiness` - 1 ref chacune (politique email entretien)
- `DecisionBusiness` - 1 ref chacune
- `ApplicationProgressBusiness` - `getEmailRequired()` 1 ref
- front: `pipeline.interfaces.ts` (lignes 25-26, 46, 108-109), `pipeline-template-edit.ts` (14 refs chacune), `pipeline-stage.service.ts` (2 refs chacune), html/spec associes

Note: le doc cible indique que la politique de notification doit vivre dans `pipeline_stage_notification_rule` a la place.

### 4.4 `candidate_answer` (1 colonne)

Colonne cible: `application_id`

Entite: `CandidateAnswer.java` (ligne 75, FK `applications`)

DTO/Transformer: `CandidateAnswerTransformer.java` (n'expose pas directement `application_id` mais l'entite y est liee)

Dependances runtime (le point le plus lourd pour cette table):

- `CandidateAnswerRepository`:
  - `findByApplicationId(...)` (ligne 51-52)
  - `findByApplicationIdAndAnswerId(...)` (ligne 63-64)
  - `findByApplicationIdAndQuestionId(...)` (ligne 69-70)
  - critere `e.applications.id` (ligne 214)
- `ApplicationsBusiness`:
  - `candidateAnswerRepository.findByApplicationId(...)` (lignes 592, 2598)
  - `findByApplicationIdAndQuestionId(...)` (ligne 2616)
  - `findByApplicationIdAndAnswerId(...)` (ligne 2633)
  - `candidateAnswer.setApplications(...)` (ligne 2638)
- `CandidateAnswerBusiness`:
  - `entityToSave.setApplications(...)` (lignes 177, 666, 741)
  - `getApplications()` (lignes 394, 406, 429-430, 541-542, 566)
  - `findByApplicationIdAndQuestionId(...)` (ligne 503)
- `CandidateAnswerController` (rest) et `CandidateAnswerBusiness`

Remplacement: les `application_quiz_attempt_id` equivalents existent deja (`findByApplicationQuizAttemptId`, `findByApplicationQuizAttemptIdAndAnswerId`, `findByApplicationQuizAttemptIdAndQuestionId`), donc le basculement du runtime quiz vers l'occurrence precise est le chemin de migration.

### 4.5 `interviews` (6 colonnes)

Colonnes cibles: `campaign_id`, `application_id`, `interview_evaluations_link`, `interview_mail_sent`, `evaluation_score`, `evaluation_number`, `evaluation_percentage`

Entite: `Interviews.java`
- `interviewEvaluationsLink` (ligne 65-66) -> cible `evaluation_room_code`
- `interviewMailSent` (ligne 71-72)
- `evaluationScore` (85-86), `evaluationNumber` (88-89), `evaluationPercentage` (91-92)
- FK: `campaign_id` (122-123), `application_id` (126-127), `application_progress_id` (130-131)

DTO/Transformer: `InterviewsDto.java` (lignes 37-42, 71-76); `InterviewsTransformer.java` (`getPipelineStage` 5 refs)

Dependances runtime (`InterviewsBusiness.java` - 40 refs `getApplications`, 16 `getCampaigns`):

| Colonne | Type | References |
| --- | --- | --- |
| `campaign_id` | READ/WRITE | `InterviewsRepository.findByCampaignId` (142-143), `InterviewsBusiness` setCampaigns (293), critere (287) |
| `application_id` | READ/WRITE | `InterviewsRepository.findByApplicationId` (150-151), `ApplicationsBusiness.selectCurrentInterview` (3192), `InterviewsBusiness` setApplications (309), `EvaluationsBusiness` (781) |
| `interview_evaluations_link` | READ/WRITE | `InterviewsBusiness` setInterviewEvaluationsLink (328), 6 refs get/set; front `interview.service.ts`, `entities-interviews.ts`, `candidate-detail.ts`, `evaluations-list.ts`, `evaluation.service.ts` |
| `interview_mail_sent` | READ/WRITE | `InterviewsBusiness` (193, 361, 704, 711), 8 refs; front `interview-create.ts`, `interviews.ts`, `track-application.ts` |
| `evaluation_score/number/percentage` | READ/WRITE | `InterviewsBusiness` (1308-1310, 1327-1329), `EvaluationsBusiness` (721-723), `ApplicationsBusiness` (3196-3198) |

Note: `application_progress_id` est deja ajoute (V1_066) et utilise (`InterviewsBusiness` ligne 743, `InterviewsRepository`). C'est la cle de remplacement des `application_id`/`campaign_id`.

### 4.6 `candidate_interview` (3 colonnes)

Colonnes cibles: `interview_start`, `interview_duration`, `application_id`

Entite: `CandidateInterview.java` (interview_start ligne 46, interview_duration ligne 49, FK applications ligne 91)

DTO/Transformer: `CandidateInterviewDto.java` (interviewStart ligne 36, interviewDuration ligne 37, params 65-66); `CandidateInterviewTransformer.java` (lignes 42, 83-84)

Dependances runtime:

- `CandidateInterviewRepository` - `findByApplicationId` (124-125), critere (256)
- `CandidateInterviewBusiness` - `setApplications` (201), interviewStart/Duration (3 et 4 refs)
- `ApplicationsBusiness` - `getInterviewStart` (7 refs, dont 3883, 3914, 4281), `getApplications` (3849-3850, 4225, 4272, 4548-4549)
- `InterviewsBusiness` - `setInterviewStart` (624), 5 refs get/set
- `EvaluationsBusiness` - `getApplications` (705, 710, 852-853, 1145, 1174)
- front: `evaluation.service.ts`, `track-application.ts`, `entities-candidate-interview.html`, `entities-interviews.ts`, `entities-applications.ts/html`, `decisions.ts`

### 4.7 `evaluations` (2 colonnes)

Colonnes cibles: `candidate_mark`, `recruiter_comment`

Entite: `Evaluations.java` (candidateMark ligne 52, recruiterComment ligne 55)

DTO/Transformer: `EvaluationsDto.java` (candidateMark ligne 36, recruiterComment ligne 37, params 59-60); `EvaluationsTransformer.java` (lignes 76-77)

Dependances runtime:

- `EvaluationsBusiness` - candidateMark 12 refs, recruiterComment 5 refs (saisie note et commentaire, calcul score)
- `EvaluationsRepository` - candidateMark 4 refs, recruiterComment 3 refs (criteres + `sumMarksByApplicationId` 147-148)
- `DashboardController` - `getIsCancel`/statistiques basees sur evaluations (voir 4.8)
- front: `evaluation.service.ts`, `evaluations.ts`, `evaluations-list.*`, `entities-evaluations.html`, `entities-candidate-interview.html`, `entity-detail-panel.ts`

Note: ces champs sont la substance meme de la saisie d'evaluation. Leur retrait suppose le passage a `evaluation_item` + `global_score`/`global_comment`.

### 4.8 `decisions` (3 colonnes)

Colonnes cibles: `is_cancel`, `application_id`, `pipeline_stage_id`

Entite: `Decision.java` (isCancel ligne 50, FK application ligne 83, FK pipelineStage, FK applicationProgress)

DTO/Transformer: `DecisionDto.java` (isCancel ligne 31, param 56); `DecisionTransformer.java` (isCancel 4 refs, getPipelineStage 2 refs)

Dependances runtime (`DecisionBusiness.java` - 30 refs getPipelineStage, 19 refs isCancel, 6 refs getApplications):

| Colonne | Type | References |
| --- | --- | --- |
| `is_cancel` | READ/WRITE | `DecisionBusiness` set/get (323, 853, 862, 902), 19 refs; `DecisionRepository._DecisionRepository` critere (3 refs); `DashboardController` (270) |
| `application_id` | READ/WRITE | `DecisionBusiness` setApplication (152, 336, 884, 906), getApplication (879, 930); `DecisionRepository.findByApplicationId` (30-31); critere `_DecisionRepository` (59) |
| `pipeline_stage_id` | READ/WRITE | `DecisionBusiness` setPipelineStage (162, 346, 895, 912, 1249); `ApplicationProgressBusiness.findByApplicationIdAndPipelineStageId` (110, 325, 1008, 1177); `DecisionTransformer` (2 refs); front `pipeline.interfaces.ts` |

Note: `application_progress_id` est deja present dans `Decision` et deja ecrit (lignes 167, 351, 875, 909, 1242). C'est la cle de remplacement.

## 5. Colonnes de remplacement deja en place

Les colonnes cibles du modele runtime sont deja creees et partiellement utilisees. L'audit montre que le code bascule deja progressivement:

| Legacy | Remplacement | Etat |
| --- | --- | --- |
| `applications.quiz_status` | `application_quiz_attempt.quiz_status` | les deux ecrits; le code lit en cascade (attempt d'abord, puis application) |
| `applications.quiz_token` | `application_quiz_attempt.quiz_token` | meme cascade |
| `candidate_answer.application_id` | `candidate_answer.application_quiz_attempt_id` | le nouveau existe; l'ancien encore requis pour les vieux flux |
| `interviews.application_id`/`campaign_id` | `interviews.application_progress_id` | deja ajoute (V1_066) et utilise |
| `decisions.application_id`/`pipeline_stage_id` | `decisions.application_progress_id` | deja ajoute et utilise |
| `evaluations.candidate_mark`/`recruiter_comment` | `evaluation_item` + `evaluations.global_score`/`global_comment` | nouveau partiellement en place |

## 6. Synthese par couche

### Backend (Java)

- `ApplicationsBusiness.java` est la dependance la plus lourde: 130 refs aux getters/setters legacy `applications.*`
- `InterviewsBusiness.java`: 40 refs (getApplications) + 16 refs (getCampaigns) + evaluations/interviewEvaluationsLink/interviewMailSent
- `ApplicationProgressBusiness.java`: 33 refs getPipelineStage, 12 decidedBy, 10 mailSent, + syncApplicationStatus
- `DecisionBusiness.java`: 30 refs getPipelineStage, 19 isCancel, 6 getApplications
- `EvaluationsBusiness.java`: 12 candidateMark, 5 recruiterComment, 9 getApplications
- `DashboardController.java`: 11 refs legacy (statistiques / dashboard)
- Repositories avec dependances: `ApplicationsRepository`, `InterviewsRepository`, `CandidateAnswerRepository`, `CandidateInterviewRepository`, `DecisionRepository`, `EvaluationsRepository`, `ApplicationProgressRepository`, `_PipelineStageRepository`, `_DecisionRepository`, `_ApplicationProgressRepository`

### DTO / API

Toutes les colonnes legacy sont exposees dans les DTO et leurs `SearchParam` (criteria de recherche):

- `ApplicationsDto` (16 colonnes + params)
- `InterviewsDto` (interviewDate, interviewStatus, interviewEvaluationsLink, interviewMailSent + params)
- `CandidateInterviewDto` (interviewStart, interviewDuration + params)
- `EvaluationsDto` (candidateMark, recruiterComment + params)
- `DecisionDto` (isCancel + param)
- `PipelineStageDto` (emailRequired, emailAutomatic + params)
- `ApplicationProgressDto` (mailSent, decidedBy* + params)

Les `SearchParam` correspondent a des criteres de filtre exposés par l'API d'administration (`_ApplicationsRepository`, `_InterviewsRepository`, etc.).

### Front (Angular)

- `pipeline.interfaces.ts` - expose `emailRequired`, `emailAutomatic`, `mailSent`, `decidedById`, `decidedByFirstName/LastName`, `applicationId`, `pipelineStageId`
- `application-status.constants.ts` - 11 statuts application (utilises partout)
- Ecrans les plus dependants:
  - `applications.ts/html` (admin applications) - quizScore, quizStatus, quizToken, interviewStatus, applicationStatus
  - `entities-applications.ts/html/spec` - quizToken (21 refs), interviewStatus (9), quizStatus (10), applicationStatus, quizScorePercent, interviewStart/Duration
  - `interviews.ts/html` - interviewDate (29), interviewStatus (17), interviewMailSent, interviewEvaluationsLink
  - `interview-create.ts/html` - interviewDate, interviewStatus, interviewMailSent
  - `pipeline-template-edit.ts/html` - emailRequired/emailAutomatic (14 refs chacune)
  - `track-application.ts/html` - applicationStatus, interviewStart/Duration, interviewMailSent, quizStatus, quizToken
  - `candidate-detail.ts/html` - applicationStatus, interviewStatus, quizStatus, quizScore, quizScorePercent, totalQuestions, interviewEvaluationsLink
  - `decisions.ts/html` - isCancel (9 refs), quizScore, interviewStatus
  - `evaluations.ts/html`, `evaluations-list.*` - candidateMark, recruiterComment, evaluationScore/Number/Percentage
  - `entities-decisions.ts/html` - isCancel
  - `entities-candidate-interview.html` - interviewStart, interviewDuration, candidateMark, recruiterComment
  - `entities-application-progress.ts/html` - decidedBy, mailSent

## 7. Dependances bloqueantes avant DROP

Ordre de criticite (ce qui empeche le DROP tant que ce n'est pas traite):

1. **`applications.application_status`** - derive ecrit a chaque transition pipeline (`syncApplicationStatus`), lu par Dashboard, ApplicationsRepository.findByApplicationStatus, et tout le front. Bloque tout.
2. **`applications.quiz_*`** (8 colonnes quiz) - runtime quiz complet ecrit encore ces colonnes (synchronisation depuis attempt). Bloque le DROP.
3. **`interviews.application_id`/`campaign_id`** - create entretien ecrit encore ces FK; `findByApplicationId`/`findByCampaignId` sont utilises par le runtime entretien.
4. **`candidate_answer.application_id`** - encore ecrit et lu par le runtime quiz et le backfill.
5. **`candidate_interview.application_id`** - encore ecrit (CandidateInterviewBusiness) et traverse par EvaluationsBusiness.
6. **`decisions.application_id`/`pipeline_stage_id`** - encore ecrits par DecisionBusiness; lecture via findByApplicationId.
7. **`is_cancel`** - cree/derive encore en decision, lu par Dashboard.
8. **`evaluations.candidate_mark`/`recruiter_comment`** - saisie encore active (pas encore migree vers evaluation_item).
9. **`interview_evaluations_link`** - encore ecrit/generé (InterviewsBusiness ligne 328) et consomme par le front (pas de `evaluation_room_code`).
10. **`pipeline_stage.email_required`/`email_automatic`** - encore ecrits par l'editeur pipeline front et valides par le backend.
11. **`application_progress.decided_by`/`mail_sent`** - encore ecrits par le pipeline runtime.
12. **`interview_start`/`interview_duration`** (candidate_interview) - encore ecrits a la creation/reschedule et affiches.

## 8. Zones sans dependance (securite relative)

- `mail_log.event_code` - hors perimetre de cette audit (note du doc cible §3)
- `audit_event`, `pipeline_stage_notification_rule`, `mail_log` - tables deja alignees

## 9. Recommandations pour la suite

1. **Bascule de runtime quiz** - faire lire/ecrire `application_quiz_attempt` comme source primaire partout (deja partiellement en cascade), puis retirer la synchro vers `applications.quiz_*`.
2. **Bascule de runtime entretien** - cibler explicitement l'occurrence `application_progress` a la creation d'entretien et arreter d'ecrire `applications.interview_*` et `interviews.campaign_id`.
3. **Statut candidat** - remplacer la source de verite `applications.application_status` par la position pipeline (`current_application_progress_id`, `current_pipeline_stage_id`), avec un DTO derive. Adapter Dashboard et le front.
4. **Renommage** - `interview_evaluations_link` -> `evaluation_room_code` (entite, DTO, migrations, front) une fois les flux generant le lien migres.
5. **Enums** - aligner `StageType`, `ProgressStatus`, `QuizStatus`, `InterviewStatus` + introduire `evaluation_status`, `decision_mode`, `candidate_response_status` (voir doc cible §2).
6. **Migrations E/F** - une fois les dependances ci-dessus couvertes, ecrire `V1_070+` avec les renames et DROP COLUMN de la liste §7 du doc cible.
7. **Entites JPA** - mapper les colonnes de synthese cible manquantes (`current_application_progress_id`, `aggregated_*`, `abandoned_*`, `last_progressed_at`) et retirer les champs legacy.
8. **Front** - supprimer les champs legacy des interfaces et ecrans apres migration des API.

## 10. Perimetre de ce document

Cet audit couvre uniquement les dependances statiques sur les colonnes a retirer en cible post-420. Il ne couvre pas:

- le contenu exact des `SearchParam` (filtres admin) ligne par ligne - consulte les `_*Repository`
- la sequence precise des migrations E/F a ecrire
- la strategie de bascule de runtime (data migration) - c'est le plan d'implementation a batir apres cet audit

## Annexe - comptage brut des references (backend main)

Chiffres obtenus par comptage regex sur `quizapp/src/main/java`:

- `ApplicationsBusiness.java`: 130 refs getters/setters `applications.*` legacy
- `InterviewsBusiness.java`: 40 refs
- `DashboardController.java`: 11 refs
- `EvaluationsBusiness.java`: 11 refs
- `ApplicationsRepository.java`: 10 refs
- `InterviewsRepository.java`: 4 refs
- `DecisionBusiness.java`: 3 refs
- `ApplicationProgressBusiness.java`: 2 refs
- `CampaignsTransformer.java`: 2 refs
- `CampaignsRepository.java`: 2 refs
- `DecisionTransformer.java`: 6 refs isCancel/pipelineStage
- `PipelineStageTransformer.java`: 4 refs email*
- `ApplicationProgressTransformer.java`: 4 refs decidedBy/mailSent
- `_PipelineStageRepository.java`: 6 refs email*
- `_DecisionRepository.java`: 6 refs
- `_ApplicationProgressRepository.java`: 6 refs
- `EvaluationsRepository.java`: 7 refs candidateMark/recruiterComment
- `CandidateInterviewRepository.java`: 6 refs interviewStart/Duration
- `CandidateInterviewBusiness.java`: 7 refs
- `PipelineStageBusiness.java`: 18 refs email*
- `PipelineTemplateBusiness.java`: 8 refs email*
