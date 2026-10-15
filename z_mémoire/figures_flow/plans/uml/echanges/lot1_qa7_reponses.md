# Échange collab — Lot 1 septies : tables de transitions de statuts (à envoyer à Claude)

> Suite de `lot1_qa6_reponses.md`. Mêmes conventions : questions recopiées,
> table Source / Cible / Événement déclencheur / Condition-garde / Effets
> de bord / Fichier:ligne. **Chaque setter trouvé figure ci-dessous ; les
> valeurs jamais posées sont marquées JAMAIS POSÉ.** Rien d’inventé.

---

## Q1. `application_progress.progress_status`

Enum : `PENDING, IN_PROGRESS, AWAITING_VALIDATION, COMPLETED, FAILED, SKIPPED`
(`quizapp/.../utils/enums/ProgressStatus.java:3-9`). Colonne
`progress_status NOT NULL` (`dao/entity/ApplicationProgress.java:32-33`).

| Source | Cible | Événement déclencheur (endpoint / scheduler / action) | Condition / garde | Effets de bord | Fichier:ligne |
|---|---|---|---|---|---|
| — | PENDING | Création candidature (`initProgressForApplication`, 1 ligne par stage + `lockTemplate`) | Toujours | Occurrences pré-créées, moteur = activer | ApplicationProgressBusiness.java:329,337 |
| — | PENDING | Migration (nouveau stage) | Nouveau stage sans occurrence | Occurrence créée | :865 |
| PENDING | IN_PROGRESS | Activation auto (`advanceToNextStage` 1er PENDING restant) | Reste un PENDING | `startedAt` (`activateStage :998`) | :362-364,966,998 |
| PENDING | IN_PROGRESS | `POST /applicationProgress/update` + `updateStageScore(activateIfPending)` ; quiz (`ensureQuizStageReady`) | Score posé sur PENDING | Activation + `startedAt` | :647,:3167 (ApplicationsBusiness) |
| IN_PROGRESS | COMPLETED | `POST /applicationProgress/advance` → `passStage` | Permission `UPDATE_APPLICATION_PROGRESS` ou `ADVANCE_PIPELINE` + clés ADMIN/ADVANCE (`:1294-1303`) | `completedAt/validatedBy/score/notes` (`:381-383`), **active l’étape suivante** (`:397`) | :347-358,371-400 |
| IN_PROGRESS | COMPLETED | Quiz validé (`syncQuizProgressAfterScoring`) | `scorePercent >= passingScore` (défaut 50.0), correction non-PENDING | Idem + `updateStageScore` | ApplicationsBusiness.java:3511-3519 |
| IN_PROGRESS | COMPLETED | Entretien validé (`resolveScoredStage`) | Score entretien | Idem | :682-687 |
| IN_PROGRESS | FAILED | `POST /fail` → `failStage` | Mêmes droits que advance | `FAILED` (`:421-423`) ; **si éliminatoire → SKIPPED en cascade** (`:439`) | :405-454 |
| IN_PROGRESS | FAILED | Quiz insuffisant / inactivité / entretien échoué | Score < seuil ; 15 min sans activité (scheduler 60 s) | Idem + abandon candidature si inactivité (`:3093-3115`) | ApplicationsBusiness.java:3521,:3093,:687 |
| IN_PROGRESS | SKIPPED | `POST /skip` → `skipStage` | Étape non obligatoire (`isSkipAllowed`, `allowSkip` en config `:1261-1267`) + pas de mail requis en attente (`:476`) | `SKIPPED` (`:482-487`) | :459-500 |
| Résolu | IN_PROGRESS (+ suivantes PENDING) | `POST /rollback` → `rollbackStage` | `hasProgressToRewind` (`:524`) ; droits `MIGRATE_CANDIDATE_PIPELINE` ou clé ADMIN (`:1312-1335`) | Reset started/completed/score/notes (`:571`), **mails annulés** (`:569,582`) | :505-590 |
| Quelconque | Quelconque | `POST /applicationProgress/update` (CRUD) | `ProgressStatus.fromValue` strict (`:1216`) | Normalisation, pas de garde métier | :186 |
| — | AWAITING_VALIDATION | **JAMAIS POSÉ** (aucun setter) — normalisation (`:1216`) et priorité d’affichage (`:1118`) seules | — | Ne pas dessiner comme état atteignable (ou pointillés « non piloté ») | — |

Miroir lecture seule : `applications.current_pipeline_*` dérivé par `syncApplicationStatus` (`:893`, après chaque mutation).

## Q2. `application_quiz_attempt.quiz_status` (+ screening)

Enum : `PENDING, STARTED, COMPLETED, EXPIRED, CANCELLED`
(`quizapp/.../utils/enums/QuizStatus.java:6-30`). Colonne `quiz_status NOT NULL`
(`dao/entity/ApplicationQuizAttempt.java:35-36`).

| Source | Cible | Événement | Condition | Effets | Fichier:ligne |
|---|---|---|---|---|---|
| — | PENDING | `verify-email` (`createQuizAttemptForVerifiedApplication`) | Token valide, étape QUIZ existante | `screeningMode=NONE`, `manualCorrectionStatus=NOT_REQUIRED`, `timeElapsed=0`, snapshot timing | ApplicationsBusiness.java:3434-3462 |
| PENDING | STARTED | 1er `get-quiz` / `touchQuizLastActivity` | Session valide | `startedAt`, `lastActivityAt` | :1358-1368,:3031-3033 |
| STARTED | COMPLETED | `complete-quiz` / expiration / triche FAIL / inactivité | — | `completedAt/lastActivityAt`, scoring, verrou version | :3255,:3249-3267 |
| — | EXPIRED, CANCELLED | **JAMAIS POSÉS** (aucun setter) | — | Ne pas dessiner | — |

`screening_result` (chaînes libres, `ApplicationsBusiness.java:2764-2770`) :
`NONE` (création `:3452`) → `WATCHED` (activité suspecte sans seuil) /
`FLAGGED` (seuil atteint, politique FLAG + `cheatFlagCount++`) / `FAILED`
(seuil atteint, politique FAIL → clôture + 403). `total = tabSwitch +
fullscreenExit` (`:2757`, COPY_PASTE ignoré).
`manualCorrectionStatus` (`ManualCorrectionStatus.java:3-6`) :
`NOT_REQUIRED` / `PENDING` / `COMPLETED` ; **PENDING bloque la bascule QUIZ**
(progress reste IN_PROGRESS, `:3502-3504`).

## Q3. `evaluations.evaluation_status` (+ participant)

Enum : `DRAFT, SUBMITTED, VALIDATED, CANCELLED`
(`quizapp/.../utils/enums/EvaluationStatus.java:3-6`). Colonne
`evaluation_status` (`dao/entity/Evaluations.java:52-53`).

| Source | Cible | Événement (endpoint) | Condition | Effets | Fichier:ligne |
|---|---|---|---|---|---|
| — | SUBMITTED | `POST /evaluations/create` | `CREATE_EVALUATIONS` | `submittedAt` | EvaluationsBusiness.java:156 |
| Quelconque | SUBMITTED | `POST /evaluations/update` (force si vide) | `UPDATE_EVALUATIONS` | — | :308 |
| — | DRAFT, VALIDATED, CANCELLED | **JAMAIS POSÉS** (aucun setter) | — | Le diagramme « brouillon, soumise, validée » serait **faux** : modéliser SUBMITTED seul (+ note) | — |

Participant (`InterviewParticipant.evaluation_status`, `:43-44`) :
→ SUBMITTED (`:1242`) / → null si 0 évaluation (`:1246`). Endpoints :
`POST /evaluations/*`, `POST /interviewParticipant/*`.

## Q4. `interviews.interview_status`, `candidate_interview`, `candidate_response_status`

Enum entretien : `SCHEDULED, IN_PROGRESS, AWAITING_EVALUATION,
AWAITING_VALIDATION, CLOSED, CANCELLED`
(`quizapp/.../utils/enums/InterviewStatus.java:3-9`). Colonne
`interview_status NOT NULL` (`dao/entity/Interviews.java:59-60`).
⚠️ Commentaire obsolète `Interviews.java:60` (PENDING/SCHEDULED/STARTED/
OVER/POSTPONED/ARCHIVED) — dérive doc, ne pas recopier.

| Source | Cible | Événement (endpoint) | Condition | Effets | Fichier:ligne |
|---|---|---|---|---|---|
| — | Quelconque | `POST /interviews/create|update` (valeur arbitraire normalisée) | `CREATE/UPDATE_INTERVIEWS` | Valeur libre (`normalizeInterviewStatus`) | InterviewsBusiness.java:325-328 |
| Quelconque | IN_PROGRESS | Passage en cours | — | Génère `evaluationRoomCode` (`:331-335`) | :331-335 |
| Quelconque | CLOSED | `POST /interviews/finish` (idempotent) | `UPDATE_INTERVIEWS/UPDATE_EVALUATIONS` + clés ADMIN/PLANIFY/EVALUATE (`:1310-1316`) | Sync étapes évaluation (`:1386`) | :1282-1346 |
| — | AWAITING_EVALUATION, AWAITING_VALIDATION | **JAMAIS POSÉS** (tri `:1116-1118` seul) | — | Ne pas dessiner comme atteignables | — |

`candidate_response_status` (`CandidateInterview.java:47-48`, 4 valeurs
`CandidateResponseStatus.java:3-7`) — `candidate_interview` n’a **pas**
d’autre statut (pas de cycle propre) :

| Source | Cible | Événement | Condition | Effets | Fichier:ligne |
|---|---|---|---|---|---|
| — | PENDING | Création du lien (planification / reset si planning modifié) | Entretien créé | En attente de réponse | InterviewsBusiness.java:655,693 |
| PENDING | ACCEPTED | `POST /applications/respond-interview` (candidat, public) | Lien valide, entretien non CLOSED (`:4078`) | Entretien (re)SCHEDULED (`:4101`) | ApplicationsBusiness.java:4097-4101 |
| PENDING | DECLINED | Idem | Idem | — + notif `INTERVIEW_DECLINED` aux recruteurs | :4113 |
| PENDING | RESCHEDULE_REQUESTED | Idem | Idem | Entretien **CANCELLED** (`:4129`) + notif `INTERVIEW_RESCHEDULE_REQUESTED` | :4127-4129 |
