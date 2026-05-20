# Livrable B — Inventaire exhaustif du backend Spring Boot

**Date :** 2026-05-11
**Source :** subagent Explore + lectures directes
**Statut :** ✅ Complet

> Consolide les sections B.1 → B.9 du plan. Format checklist `- [ ]` pour actions à mener.

---

## B.1 — Entités JPA (`dao/entity/`)

**Bilan : 38 entités ↔ 38 tables BD métier — couverture 1:1.**

- [x] 🟢 **OK** : 38 entités présentes pour les 38 tables BD (hors `flyway_schema_history` qui est technique).
- [ ] 🔵 **[BACK — entité]** : vérifier que toutes les entités ont `@Column(name="...")` aligné sur les noms SQL réels — *certaines entités pourraient utiliser des noms Java sans `name=` explicite et casser la résolution avec `naming-strategy`*.
- [ ] 🔵 **[BACK — entité]** : aligner le type Java de `is_deleted` partout (la BD mélange `tinyint(1)` et `bit(1)`) — actuellement code Java probablement `Boolean isDeleted` partout, à confirmer.
- [ ] 🔵 **[BACK — entité]** : vérifier la présence et le typage de `createdBy`/`updatedBy` sur les **5 tables où la BD utilise `int unsigned` au lieu de `int`** : `email_template`, `form`, `form_questions`, `form_version`, `invitation_code`, `legal_text`, `smtp_config`, `pipeline_stage` (entité `int` ↔ BD `int unsigned`).

### Enums utilisés dans les entités
| Entité | Champ | Enum Java |
|---|---|---|
| `Answer` | `answerType` | `AnswerType` |
| `Applications` | `quizStatus` | `QuizStatus` |
| `CandidateAsk` | `askStatus` | `CandidateAskStatus` |
| `EmailTemplate` | `actionType` | `EmailActionType` |
| `PipelineStage` | `stageType` | `StageType` |
| `Question` | `questionType` | `QuestionType` |
| `User` | `userRole` | `UserRole` |
| `EmailVerificationToken` | `tokenType` | `TokenType` |

**À CONFIRMER** que `Applications` mappe aussi en enum : `applicationStatus`, `interviewStatus`, `quizManualCorrectionStatus` (champs `varchar` BD).

---

## B.2 — Repositories (`dao/repository/`)

**Bilan : 38 repositories standards + 12 repos `customize/_*Repository.java`.**

- [x] 🟢 **OK** : tous les repositories existent (un par entité).
- [ ] 🔵 **[BACK — repository]** : auditer les repos `customize/_*` pour vérifier qu'ils correspondent bien aux DTOs `_<Entity>Dto` (cohérence pattern « double repo / double DTO »).

---

## B.3 — DTOs (`dao/dto/` ou `utils/dto/`)

**Bilan : 38 `<Entity>Dto.java` + 30 `_<Entity>Dto.java`.**

- [ ] 🟠 **INCOMPLET [BACK — DTO]** : 8 entités sans variante `_<Entity>Dto.java` :
  - `BusinessGroupPermission`
  - `Decision`
  - `EmailTemplatePreset`
  - `EmailVerificationToken`
  - `GroupChangeRequest`
  - `UserBusinessGroup`
  - *(2 autres à confirmer par diff)*
- [ ] 🔵 **[BACK — DTO]** : créer les variantes manquantes pour homogénéiser le pattern (sauf si décision explicite de ne pas en avoir).

---

## B.4 — Business (`business/`)

**Bilan : 43 services (38 métier + 5 utilitaires).**

### Services COMPLETS (7 méthodes standards)
`AnswerBusiness`, `ApplicationProgressBusiness`, `ApplicationsBusiness`, `CampaignCrudBusiness`, `CampaignsBusiness`, `CandidateAnswerBusiness`, `CandidateAskBusiness`, `CandidateInterviewBusiness`, `DecisionBusiness`, `DepartmentsBusiness`, `EmailTemplateBusiness`, `EmailVerificationTokenBusiness`, `EntityPermissionBusiness`, `EvaluationsBusiness`, `FormBusiness`, `FormVersionBusiness`, `InterviewsBusiness`, `InvitationCodeBusiness`, `LegalTextBusiness`, `NotificationsBusiness`, `PipelineStageBusiness`, `PipelineTemplateBusiness`, `QuestionBusiness`, `SmtpConfigBusiness`, `SpecialitiesBusiness`, `SystemRolePermissionBusiness`, `UserBusiness`, `UserPermissionOverrideBusiness`.

### Services INCOMPLETS (manque ≥1 méthode standard)
- [ ] 🟠 **[BACK — business]** : `AppConfigBusiness` — manque `updateAll`, `getAllByCriteria`, `getFullInfos`
- [ ] 🟠 **[BACK — business]** : `BusinessGroupBusiness` — manque `updateAll`, `getAllByCriteria`, `getFullInfos`
- [ ] 🟠 **[BACK — business]** : `BusinessGroupPermissionBusiness` — manque `updateAll`, `getAllByCriteria`, `getFullInfos`
- [ ] 🟠 **[BACK — business]** : `CandidateTokenBusiness` — manque `getByCriteria`, `getAllByCriteria`, `getFullInfos`
- [ ] 🟠 **[BACK — business]** : `FormQuestionsBusiness` — manque `getByCriteria`, `getAllByCriteria`, `getFullInfos`
- [ ] 🟠 **[BACK — business]** : `GroupChangeRequestBusiness` — manque `getAllByCriteria`, `getFullInfos`
- [ ] 🟠 **[BACK — business]** : `InterviewParticipantBusiness` — manque `updateAll`, `getAllByCriteria`, `getFullInfos`
- [ ] 🟠 **[BACK — business]** : `SourceTokenBusiness` — manque `getAllByCriteria`, `getFullInfos`
- [ ] 🟠 **[BACK — business]** : `UserBusinessGroupBusiness` — manque `updateAll`, `getAllByCriteria`, `getFullInfos`

### Services utilitaires (hors pattern CRUD)
`EmailBusiness`, `EmailOperationalAlertService`, `OnlineStatsBusiness`, `PermissionService`, `PlatformReadinessService`, `CampaignPublicAccessService`. **OK — pas de standardisation attendue.**

---

## B.5 — Controllers (`controller/` ou `rest/api/`)

**Bilan : 43 controllers, ~300+ endpoints, tous en POST (sauf 1 GET de debug).**

### Endpoints standards par entité (vérifiés)
Le rapport subagent confirme la présence des 7 endpoints standards sur :
- `/answer`, `/applications`, `/campaigns`, `/specialities`, `/user`, `/systemRolePermission`, `/entityPermission`, `/userPermissionOverride`.

### Endpoints standards INCOMPLETS (entité avec endpoints manquants)
- [ ] 🟠 **[BACK — controller]** : aligner sur les 9 entités à business incomplet (cf. B.4).

### Endpoints custom métier détectés (NON CRUD)
- [x] 🟢 **OK** : `/applications/verify-email`, `/applications/get-quiz`, `/applications/save-quiz-answer`, `/applications/complete-quiz`, `/applications/touch-quiz`
- [x] 🟢 **OK** : `/interviews/schedule`, `/interviews/evaluate`
- [x] 🟢 **OK** : `/smtpConfig/testConnection`
- [x] 🟢 **OK** : `/applicationProgress/{byApplication,advance,fail,skip,rollback,currentStage,migratableCandidates,migrateMultiple}`
- [x] 🟢 **OK** : `/auth/{authenticate,verify-token,refresh}`
- [x] 🟢 **OK** : `/files/upload/cv` (multipart)
- [x] 🟢 **OK** : `/dashboard/*` (stats), `/qeel/*` (intégration externe)

### Exception à la règle "POST only"
- [ ] 🔵 **[BACK — controller]** : `UserDebugController.roles-debug` est en `GET` — **statut : debug uniquement** ; à supprimer ou wrap en POST si on veut respecter strictement la règle.

---

## B.6 — Enums Java (`utils/enums/` ou `dao/entity/`)

**Bilan : 13 enums.**

| Enum | Valeurs | Couverture BD |
|---|---|---|
| `AnswerType` | SINGLE_CHOICE, MULTIPLE_CHOICE, FREE_TEXT | `answer.answer_type` ✅ |
| `CandidateAskStatus` | PENDING, APPROVED, REJECTED, REVIEWED | `candidate_ask.ask_status` ✅ |
| `EmailActionType` | APPLICATION_VERIFICATION, PASSWORD_RESET, INVITATION_CODE, CANDIDATE_ASK_RESULT, PRE_SCREEN_DECISION, FINAL_DECISION, INTERVIEW_INVITE, QUIZ_INVITE, WELCOME | `email_template.action_type` ✅ |
| `FormAssignmentExhaustionPolicy` | REPEAT, STOP, RANDOM | `campaigns.form_assignment_exhaustion_policy` ✅ |
| `FormAssignmentStrategy` | SEQUENTIAL, RANDOM, BALANCED | `campaigns.form_assignment_strategy` ✅ |
| `FunctionalityEnum` | ~152 valeurs (VIEW/CREATE/UPDATE/DELETE × 38 entités + spéciales) | `business_group_permission.functionality`, `system_role_permission.functionality`, `entity_permission.permission_key`, `user_permission_override.functionality` ✅ |
| `ManualCorrectionStatus` | PENDING, CORRECTED, REJECTED | `applications.quiz_manual_correction_status` ⚠️ — BD default `NOT_REQUIRED` mais enum ne contient PAS `NOT_REQUIRED` |
| `OperatorEnum` | EQ, NEQ, GT, LT, CONTAINS | usage interne critères |
| `ProgressStatus` | NOT_STARTED, IN_PROGRESS, COMPLETED, ABANDONED | `application_progress.progress_status` ⚠️ — BD default `PENDING` ne figure pas dans l'enum |
| `QuestionType` | SINGLE_CHOICE, MULTIPLE_CHOICE, FREE_TEXT, MATCHING, ORDERING | `question.question_type` ✅ |
| `QuizStatus` | NOT_STARTED, IN_PROGRESS, COMPLETED, ABANDONED, EXPIRED | `applications.quiz_status` ✅ |
| `StageType` | APPLICATION, PRE_SCREEN, INTERVIEW, EVALUATION, FINAL_DECISION, OFFER | `pipeline_stage.stage_type` ⚠️ — divergence avec FRONT (FRONT a CANDIDATURE, QUIZ, PRESELECTION, INTERVIEW, TECHNICAL_TEST, EVALUATION, DECISION, CUSTOM) |
| `UserRole` | SUPER, ADMIN, RECRUITER, CANDIDATE | `user.user_role`, `system_role_permission.system_role`, `invitation_code.role` ⚠️ — divergence : code Spring Security utilise `SUPER_ADMIN` dans `@PreAuthorize` et FRONT utilise `UTILISATEUR` |

### Enums **manquants côté backend** (champs varchar BD sans enum Java explicite)
- [ ] 🔴 **MANQUANT [BACK — enum]** : `Applications.applicationStatus` (varchar(8)) — pas d'enum Java.
- [ ] 🔴 **MANQUANT [BACK — enum]** : `Applications.interviewStatus` (varchar(20)) — pas d'enum Java.
- [ ] 🔴 **MANQUANT [BACK — enum]** : `Campaigns.campaignStatus` (varchar(7)) — pas d'enum Java identifié.
- [ ] 🔴 **MANQUANT [BACK — enum]** : `CandidateAsk.requestType` (varchar(10)) — pas d'enum Java identifié.
- [ ] 🔴 **MANQUANT [BACK — enum]** : `Decision.decisionType` (varchar(50)) — pas d'enum Java identifié.
- [ ] 🔴 **MANQUANT [BACK — enum]** : `Interviews.interviewStatus` (varchar(20)) — pas d'enum Java identifié.
- [ ] 🔴 **MANQUANT [BACK — enum]** : `Interviews.interviewType` (varchar(20)) — pas d'enum Java identifié.
- [ ] 🔴 **MANQUANT [BACK — enum]** : `EntityPermission.entityType` (varchar(50)) — pas d'enum Java identifié.
- [ ] 🔴 **MANQUANT [BACK — enum]** : `EmailTemplatePreset.category` — enum BD explicite mais **pas reflété en Java** (ou alors présent mais pas identifié par le subagent).
- [ ] 🔴 **MANQUANT [BACK — enum]** : `GroupChangeRequest.status` — enum BD explicite (PENDING/APPROVED/REJECTED) sans enum Java identifié.
- [ ] 🔴 **MANQUANT [BACK — enum]** : `Notifications.notifType` (varchar(100)) — pas d'enum Java.
- [ ] 🔴 **MANQUANT [BACK — enum]** : `Question.difficultyLevel` (varchar(20)) — pas d'enum Java.

### Divergences à résoudre
- [ ] 🟠 **DIVERGENT [FULL-STACK]** : `StageType` BACK ≠ FRONT (BACK: 6 valeurs, FRONT: 8 valeurs).
- [ ] 🟠 **DIVERGENT [FULL-STACK]** : `UserRole` valeurs incohérentes entre enum Java (`SUPER`), Spring Security (`SUPER_ADMIN`), FRONT (`UTILISATEUR`).
- [ ] 🟠 **DIVERGENT [BACK]** : `ManualCorrectionStatus` ne contient pas la valeur `NOT_REQUIRED` qui est la **valeur par défaut BD**.
- [ ] 🟠 **DIVERGENT [BACK]** : `ProgressStatus` ne contient pas la valeur `PENDING` qui est la **valeur par défaut BD**.

---

## B.7 — Sécurité / permissions

- [x] 🟢 **OK** : `FunctionalityEnum` couvre les 38 entités × VIEW/CREATE/UPDATE/DELETE.
- [x] 🟢 **OK** : 4 rôles définis : SUPER, ADMIN, RECRUITER, CANDIDATE.
- [x] 🟢 **OK** : Pattern `EntityPermission` + `PermissionService` + `@PreAuthorize` ciblé.
- [ ] 🔴 **INCOHÉRENT [BACK — sécurité]** : `@PreAuthorize` utilise `'SUPER_ADMIN'` (string) alors que l'enum `UserRole` vaut `SUPER`. À vérifier dans `SecurityConfig` la conversion role-name.
- [ ] 🔴 **INCOHÉRENT [BACK — sécurité]** : `QuestionController` autorise `'UTILISATEUR'` (FR) au lieu de `RECRUITER` ou `CANDIDATE`.
- [ ] 🔵 **[BACK — sécurité]** : auditer la liste exhaustive des controllers SANS `@PreAuthorize` — le subagent indique qu'ils s'appuient sur EntityPermission au niveau business mais il faut vérifier qu'aucun endpoint sensible n'est ouvert.

---

## B.8 — Migrations Flyway

**Bilan : 36 migrations V1_001 → V1_036 (V1_034 manquant — saut de numéro à vérifier).**

- [x] 🟢 **RÉSOLU** : V1_034 absent du dossier est une **suppression involontaire** ; la migration reste enregistrée en BD (`flyway_schema_history`), donc pas de problème de checksum. Optionnel : recréer un fichier placeholder. *(cf. J.1)*
- [x] 🟢 **OK** : trajectoire schéma cohérente : creation initiale → formes → pipelines → permissions → groupes → presets emails → assignment strategies → quiz manual correction → app config evolutions.
- [ ] 🔵 **[BACK — migration]** : extraire pour chaque migration la liste des `ALTER TABLE` (DROP COLUMN, RENAME COLUMN) — pour détecter les colonnes mortes que le code utiliserait encore. *(Hors scope de ce livrable, à faire en Phase G.)*

---

## B.9 — Configuration applicative

- [x] 🟢 **OK** : `SecurityConfig`, `MailConfig`, `MinioConfig`, `WebSocketConfig`, `CacheConfig`, `LoggingAspect`, `ThymeleafConfig` présents.
- [ ] 🔵 **[BACK — config]** : confirmer que `MinioConfig` est bien utilisé pour `/files/upload/cv` (le projet a aussi `quizapp/uploads/cv/` local — possible doublon stockage).
- [ ] 🔵 **[BACK — config]** : vérifier les profils Spring actifs (`dev`/`test`/`prod`) et que les valeurs SMTP/Minio ne sont pas hardcodées.

---

## B.10 — Synthèse des actions backend à mener

### Priorité 1 — Cohérence enums (bloquant pour traçabilité)
1. Créer enums manquants : `ApplicationStatus`, `InterviewStatus`, `CampaignStatus`, `RequestType`, `DecisionType`, `InterviewType`, `EntityType`, `EmailTemplatePresetCategory`, `GroupChangeRequestStatus`, `NotificationType`, `DifficultyLevel`.
2. Compléter enums incomplets : ajouter `NOT_REQUIRED` à `ManualCorrectionStatus`, `PENDING` à `ProgressStatus`.
3. Aligner `StageType` BACK ↔ FRONT.
4. Standardiser `UserRole` (BACK enum, Spring Security, FRONT, BD).

### Priorité 2 — Compléter le pattern CRUD standard
5. Implémenter les 9 business incomplets (cf. B.4).
6. Implémenter les endpoints correspondants dans les controllers.
7. Compléter les 8 DTO `_<Entity>Dto` manquants.

### Priorité 3 — Sécurité
8. Auditer endpoints sans `@PreAuthorize`.
9. Harmoniser noms de rôles (string vs enum).
10. Confirmer / supprimer `UserDebugController.roles-debug` (GET).
