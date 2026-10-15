# Échange collab — Lot 1 bis : 8 questions de suivi → réponses (à envoyer à Claude)

> Suite de `lot1_qa_reponses.md`. Mêmes conventions : questions recopiées
> telles quelles, faits sourcés `fichier:ligne`, `NON TROUVÉ` écrit en
> toutes lettres, rien d’inventé. Base : `quizapp/` + `quizapp_front/`.

---

## Q1. Formulaires, questions, réponses : le recruteur peut-il créer/modifier ?

> Le backend autorise le rôle RECRUITER sur ces contrôleurs, mais le frontend réserve les pages à super/admin. Un recruteur peut-il créer ou modifier un formulaire, une question ou une réponse, oui ou non ? Quels endpoints exactement ?

**NON par défaut.** Le `@PreAuthorize` large laisse passer le rôle, mais le
contrôle effectif est la `functionality`, absente du socle recruteur.

- Gardes rôle (passent pour RECRUITER) : `FormController.java:39`,
  `QuestionController.java:39` (`AnswerController.java:39` identique,
  `hasAnyRole('ADMIN','SUPER_ADMIN','RECRUITER')`). Exigences :
  `CREATE_FORM` (`FormController.java:59`, enum `FunctionalityEnum.java:72`),
  et symétriquement `CREATE_QUESTION` / `CREATE_ANSWER` + `UPDATE_*`.
- Chaîne de décision : `ControllerFactory.create` → `BusinessFactory.create`
  (`business/fact/BusinessFactory.java:70-73`) → `checkUserAccess`
  (`:209-227`) : si `functionality != DEFAULT`, `permissionService.
  hasPermission(user, functionality)` sinon `PermissionDeniedDataAccessException`
  (`:221-226`).
- Seed (`V1_013`) : `ADMIN` a `CREATE/UPDATE_FORM|QUESTION|ANSWER` (`:67-70`,
  `:97-100`, `:12-15`) ; `UTILISATEUR` (= socle RECRUITER via `UserRole.fromValue`,
  `UserRole.java:44`) n’a que `VIEW_FORM` (`:198`), `VIEW_FORM_QUESTIONS` /
  `VIEW_FORM_VERSION` (`:199-200`), `VIEW_QUESTION` (`:195`), `VIEW_ANSWER`
  (`:196`). Aucune ligne `RECRUITER` en seed.
- Groupes `V1_018:18-43` : aucune permission `FORM*` (Recrutement =
  campagnes/candidatures/entretiens/évaluations ; RH = users/départements/
  spécialités ; Communication = notifications/templates).
- Donc : recruteur sans groupe ni override → `combined` sans `CREATE_FORM`
  → refus. **OUI seulement avec** override `GRANT` (`user_permission_override`)
  ou droit d’entité contextuel. Front cohérent : pages réservées super/admin
  (`roleGuard` + `VIEW/UPDATE_FORM`, `app.routes.ts` dashboard/forms,
  questions, answers).
- Endpoints concernés : `POST /form|question|answer/create|update|
  updateDeleted|updateAll|delete|getByCriteria|getAllByCriteria|custom`.

## Q2. Modèles d’email : qui peut vraiment les gérer ?

> EmailTemplate est noté "SUPER_ADMIN or ADMIN" dans la classe, mais tu l'as rangé dans "SUPER_ADMIN seul". Qui peut vraiment créer, modifier ou supprimer un modèle d'email ?

**Correction de notre part : la classe a raison.** `EmailTemplateController.java:33`
(`hasRole('SUPER_ADMIN') or hasRole('ADMIN')`) — le rangement « SUPER_ADMIN
seul » du fichier précédent est faux.

- CRUD : `POST /emailTemplate/create|update|delete` (`:48,57,65`) + lecture
  (`getByCriteria :73`, `getByActionType :81`).
- Seed : `ADMIN` a `VIEW/CREATE/UPDATE/DELETE_EMAIL_TEMPLATE`
  (`V1_013:117-120`). `UTILISATEUR` : rien. Donc **SUPER_ADMIN + ADMIN**,
  recruteur exclu (sauf override).
- Modèles seedés par type d’action : `V1_004:77-104` ; presets :
  `EmailTemplatePresetController.java` (classe `SUPER_ADMIN or ADMIN`, `:32`).

## Q3. Correction manuelle du quiz : endpoint, permission, rôle, conflit candidateanswer

> Quel endpoint, quelle permission (CORRECT_TEST ?), quel rôle, et quel contrôleur gère candidateanswer (tu as signalé un conflit filtre/méthode) ?

- Endpoint : **`POST /candidateanswer/custom`** (`CandidateAnswerController.java:
  122-149`), avec `datas[0].action = "manualCorrection"` (une réponse :
  `id` + `manualIsCorrect`, questions `TEXT` non-`manualCorrectionRequired`,
  `CandidateAnswerBusiness.java:379-404`) ou `"manualQuestionCorrection"`
  (par question : `applicationId` + `questionId` + score borné,
  `:451-485`). Dispatch `:367-373`.
- Permission : **`CORRECT_TEST`** (`FunctionalityEnum.java:32`) + clés
  d’entité `ADMIN`/`CREATOR`/`CORRECT_TEST` via `hasScopedPermission(...,
  "CAMPAIGN", campaignId, CORRECT_TEST, "ADMIN", "CREATOR", "CORRECT_TEST")`
  (`:407-414`, `:488-495`). Refus : « Accès refusé: droits insuffisants
  pour corriger ce test. »
- Rôle : classe `ADMIN, SUPER_ADMIN, RECRUITER` (`CandidateAnswerController.
  java:39`). `custom()` ne passe pas par `ControllerFactory` : seuls jouent
  le rôle de classe + le contrôle métier + `actorUserId` non nul (`:386-388`).
- Conflit résolu : filtre `permitAll` sur `/candidateanswer/**`
  (`SecurityConfig.java:61`) MAIS `@PreAuthorize` méthode (`@EnableMethodSecurity`,
  `:22`) + `actorUserId` rejettent l’anonyme. **Le parcours public ne passe
  PAS par là** : réponses via `POST /applications/save-quiz-answer`
  (`ApplicationsController.java:137` → `saveQuizAnswer :1943`), ouvert
  (`SecurityConfig.java:33,58`), autorisé par **`quizToken`**
  (`resolveQuizToken` + `validateQuizSessionAccess :1978-1997`), pas par rôle.

## Q4. CV du candidat anonyme

> Comment un candidat anonyme envoie-t-il son CV, alors que /files/upload/cv est isAuthenticated ? Par quel endpoint ?

- `POST /files/upload/cv` exige un authentifié (classe `isAuthenticated()`,
  `FileController.java:39`, méthode `:63-67`, `MultipartFile + candidateEmail
  + fileType`). Un sans-compte est rejeté (filtre `:69` + garde).
- Le candidat anonyme passe par **`POST /applications/create`** (public,
  `SecurityConfig.java:30,58`, `ApplicationsController.java:63-73`, sans
  `@PreAuthorize`) — **en JSON, pas en multipart** (aucun `MultipartFile`
  dans `ApplicationsController` ni `create :232-469`).
- Le CV y est une **simple chaîne `candidateCvPath`, optionnelle**
  (`dao/entity/Applications.java:65`, DTO `:41` de `ApplicationsDto`,
  `ApplicationsBusiness.java:255` « CV optionnel pour le moment »,
  update `:520-521`).
- `multipart` / pièces jointes de candidature : **NON TROUVÉ** (seuls
  `FileController` authentifié et pièces jointes d’emails SMTP,
  `HostingUtils.java:135-173`).

## Q5. Parcours candidat : ordre, email obligatoire, quiz obligatoire, stage_type

> L'ordre exact create → verify-email → get-quiz. La vérification de l'email est-elle obligatoire avant le quiz ? Le quiz est-il obligatoire dans toutes les campagnes ? Liste toutes les valeurs de pipeline_stage.stage_type et ce que chacune déclenche.

- Ordre confirmé : `POST /applications/create` (`:63`) → `POST
  /applications/verify-email` (`:117`, crée tentative + `quizToken`)
  → `POST /applications/get-quiz` (`:127`) → `save-quiz-answer` (`:137`)
  → `complete-quiz` (`:147`), `touch-quiz` (`:157`, activité + anti-triche).
- **Email OBLIGATOIRE avant quiz** : `validateQuizSessionAccess` exige
  token + `emailVerified` + non-abandon + non-`COMPLETED`
  (`ApplicationsBusiness.java:2701-2725`).
- **Quiz NON obligatoire partout** : succès sans quiz s’il n’y a pas
  d’étape `QUIZ` (`verifyEmail :1093-1115`).
- `stage_type` : 5 valeurs (`utils/enums/StageType.java:3-8`),
  `PipelineStage.stageType` (`dao/entity/PipelineStage.java:32-33`),
  pipeline borné CANDIDATURE…DECISION (`PipelineStageBusiness.java:319-320,
  537-541`) :
  - `CANDIDATURE` : dépôt + vérification email, première étape fixe.
  - `QUIZ` : tentative (`PENDING→STARTED→COMPLETED`), chrono, réponses,
    score + anti-triche (`ensureQuizStageReady :3155`,
    `syncQuizProgressAfterScoring :3513`, seuil défaut 50.0 `:207`).
  - `PRESELECTION` : filtre/tri avant la suite (`:1248`).
  - `INTERVIEW` : planification, convocation, réponse, clôture
    (`resolveProgressByStageType ...INTERVIEW`, `InterviewsBusiness`).
  - `DECISION` : verdict (pré-sélection/final), emails, dernière étape fixe.

## Q6. Notifications : événements, auto vs manuel

> Liste les événements qui envoient un email ou une notification in-app, et lesquels sont automatiques ou nécessitent une confirmation manuelle (requires_manual_confirmation).

- 9 `EmailActionType` (`utils/enums/EmailActionType.java:8-18`) :
  - `APPLICATION_VERIFICATION` : systématique à la création
    (`ApplicationsBusiness.java:930-958`, template requis).
  - `PASSWORD_RESET` : sur demande utilisateur (`UserManagmentBusiness.
    java:450-467`).
  - `INVITATION_CODE` : à la création d’invitation
    (`InvitationCodeBusiness.java:473-527`).
  - `CANDIDATE_ASK_RESULT` : toujours après traitement de la demande
    (`CandidateAskBusiness.java:552,694-749`).
  - `PRE_SCREEN_DECISION` / `FINAL_DECISION` : **croisées règle**
    (`DecisionBusiness.java:1030-1124`) — pas d’envoi si `!isRequired`
    (`:1049-1051`) ; si `!isAutomatic`, envoi seulement si
    **`sendDecisionEmailRequested == true`** (`:1052-1054` = la
    « confirmation manuelle ») ; anti-doublon (`:1056`).
  - `INTERVIEW_INVITE` : **croisée règle** — auto seulement si
    `isRequired && isAutomatic` (`InterviewsBusiness.java:728-738`) ;
    anti-doublon (`:740-749`).
  - `QUIZ_INVITE`, `WELCOME` : **NON TROUVÉ** (enum + preset uniquement —
    code mort / non câblé).
- Règle (`dao/entity/PipelineStageNotificationRule.java:46-52`) :
  `isRequired` / `isAutomatic` / `requiresManualConfirmation` (défauts
  `false`), invariant « automatique ⇒ requise »
  (`PipelineStageNotificationRuleBusiness.java:126-130`).
  **`requiresManualConfirmation` : stockée mais JAMAIS branchée** — le
  « manuel » passe par `sendDecisionEmailRequested` et l’absence
  d’auto-envoi, pas par cette colonne.
- Retrait volontaire : **aucun email**, notif in-app `APPLICATION_WITHDRAWN`
  (`ApplicationsBusiness.java:3871-3877,4635-4660`).
- In-app (créations synchrones directes, **sans** règle auto/manuel) :
  `APPLICATION_RECEIVED` (`:4594-4601`), `APPLICATION_WITHDRAWN`,
  `INTERVIEW_DECLINED` / `INTERVIEW_RESCHEDULE_REQUESTED` (`:4116,4131`,
  destinataires à clés `:4615`), `EVALUATION_COMPLETED`
  (`InterviewsBusiness.java:1487-1494`), `GROUP_CHANGE_*`
  (`GroupChangeRequestBusiness.java:303-334`), alertes SMTP
  (`EMAIL_SMTP_CONFIG_MISSING`, `EMAIL_DELIVERY_FAILED`,
  `EMAIL_TEMPLATE_VARIABLE_MISSING`, `EmailOperationalAlertService.java:
  26-28`, vers SUPER+ADMIN).

## Q7. Partage d’accès : qui peut accorder un droit d’entité ?

> Qui peut accorder un droit d'entité (EntityPermission grant) : le créateur de la campagne, ou seulement admin/super ?

**Seulement ADMIN / SUPER_ADMIN.** Gardes : `grant` (`EntityPermissionController.
java:44`) et `revoke` (`:57-58`) exigent `hasAnyRole('ADMIN','SUPER_ADMIN')`.
Le métier (`EntityPermissionBusiness.java:53-127`, scope unique `:148-163`,
clés validées `:185-193`) ne vérifie PAS que l’appelant est CREATOR/ADMIN
de l’entité (le `PermissionService` injecté au contrôleur `:42` ne sert
même pas à grant/revoke). Un porteur de clé `CREATOR` sans rôle
ADMIN/SUPER_ADMIN est rejeté avant le métier.

## Q8. Qeel : rôle et nature

> Que font /api/qeel/stats et /health, et est-ce un système externe ou une fonctionnalité utilisateur ?

- `GET /api/qeel/stats` (`rest/api/QeelController.java:36-53`) : retourne
  `OnlineStatsDto` (`totalUsers/onlineUsers` via `onlineStatsBusiness`,
  500 + zéros en exception). `GET /api/qeel/health` (`:58-61`) : simple
  `200 "QEEL service is running"`. Ouverts sans auth
  (`SecurityConfig.java:57`, avec `/ws/**`).
- **Utilitaire interne, pas fonctionnalité utilisateur** : « Qui Est En
  Ligne » — présence temps réel (`websocket/QeelWebSocketHandler.java`),
  aucun lien candidature/quiz/entretien/décision, aucun email/notif.
  À représenter comme acteur système secondaire au mieux, jamais comme
  cas d’utilisation.
