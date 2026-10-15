# Échange collab — Lot 1 : questions de Claude → réponses (à envoyer à Claude)

> Protocole : ce fichier contient les 5 questions de Claude recopiées
> telles quelles, suivies des réponses vérifiées sur le dépôt réel.
> Convention : chaque fait porte sa source `fichier:ligne`. `NON TROUVÉ`
> et `NON VISIBLE` sont écrits en toutes lettres, rien n’est inventé.
> Base : `quizapp/` (backend Spring Boot), `quizapp_front/` (Angular),
> `z_mémoire/template_memoire/typst/sections/body.typ` (mémoire).

---

## Q1. ACTEURS

> Liste tous les rôles existants : valeurs possibles de user.user_role, de
> entity_permission.system_role, rôle d'une invitation
> (invitation_code.role), et rôle du candidat (avec ou sans compte, voir
> candidate_accounts_enabled). Pour chacun : sa signification, comment il
> est attribué, et fichier:ligne. Dis aussi s'il existe une hiérarchie
> entre rôles (un rôle qui inclut les droits d'un autre).

### 1.1 `user.user_role` — 4 rôles, pas 3

Référentiel unique : `quizapp/src/main/java/tech/synelia/quizapp/utils/enums/UserRole.java:8-12`.

| Rôle (`value` stocké) | `systemRole` | Signification | Attribution |
|---|---|---|---|
| `super` (SUPER) | `SUPER_ADMIN` | Super administrateur : bypass total des permissions (`PermissionService.java:46-59`), gouvernance plateforme | Création par invitation `super` ou en base (`UserBusiness.java:805-809`) |
| `admin` (ADMIN) | `ADMIN` | Administrateur : plancher immuable (tout sauf `SMTP_CONFIG`, `APP_CONFIG`, `MANAGE_SYSTEM_ROLES`, `V1_013:6-8`) | Invitation `admin` ou création admin |
| `recruiter` (RECRUITER, alias `UTILISATEUR`) | `RECRUITER` | Recruteur : lecture large + création campagnes/candidatures/entretiens/évaluations/décisions, pas de `DELETE_*` | Invitation `recruiter` (défaut, `InvitationCodeBusiness.java:102-104`) |
| `candidate` (CANDIDATE) | `CANDIDATE` | Candidat avec compte (soumis au flag §1.3) | Invitation `candidate` si flag actif, sinon rejet |

Normalisation insensible casse/espaces + préfixes `ROLE_*` : `UserRole.java:30-58`. Colonne `user_role varchar(20) NULL` : `dao/entity/User.java:75-76`.

### 1.2 Hiérarchie : vraie ET fausse (à modéliser avec la nuance)

- **Vraie au niveau Spring-Security** : `security/JwtAuthenticationFilter.java:51-57` — `SUPER` hérite `ROLE_SUPER_ADMIN+ROLE_ADMIN+ROLE_RECRUITER`, `ADMIN` hérite `ROLE_ADMIN+ROLE_RECRUITER`. Seul usage : `config/SecurityConfig.java:67` (`/user/set-users-online` réservé ADMIN/SUPER_ADMIN).
- **Fausse au niveau fonctionnel** : `business/PermissionService.java:215-239` — l’ADMIN ne fait PAS l’union avec les permissions RECRUITER (`computeEffectivePermissions` = rôle propre + groupes + overrides). Un ADMIN sans groupe n’a que son plancher.
- Le diagramme peut garder la généralisation Admin→Recruteur **à condition d’écrire** : rôles techniques hérités, permissions métier séparées.

### 1.3 `invitation_code.role` — rôle du futur compte

- Colonne `role VARCHAR(30) NOT NULL DEFAULT 'recruiter'` : `db/migration/V1_007__add_invitation_code.sql:5`. Entité : `dao/entity/InvitationCode.java:24-25`.
- À la **création** d’invitation : seuls `admin`/`recruiter` acceptés (`business/InvitationCodeBusiness.java:253-261`, défaut `recruiter` si null `:102-104`). Code 32 car., expiry +48h défaut (`:107-112`).
- À l’**inscription** (`registerWithCode`, `user/managment/UserManagmentBusiness.java:740-813`) : 4 rôles consommables (`super/admin/recruiter/candidate`, `:760-766`), email contraint à celui de l’invitation (`:784-789`), code marqué utilisé (`:813`).
- Validation du code : vide/inconnu/utilisé/expiré rejetés (`InvitationCodeBusiness.java:299-322`).

### 1.4 Rôle du candidat : avec ou sans compte (`candidate_accounts_enabled`)

- Interrupteur global `app_config.candidate_accounts_enabled`, défaut **0 = désactivé** : `db/migration/V1_028:1-3`, `dao/entity/AppConfig.java:42-43`.
- **Avec compte** (`User` de rôle `candidate`) : inscription rejetée si flag inactif (`UserManagmentBusiness.java:768-773`), connexion rejetée même avec bon mot de passe (`:156-161`). Seule lecture backend du flag : `areCandidateAccountsEnabled()` (`:824-827`).
- **Sans compte** (parcours normal) : candidature/quiz/suivi via tokens publics, **non concerné** par ce flag (aucune autre lecture trouvée).
- Réglage front : `quizapp_front/.../dashboard/settings/settings.ts:440` (mêmes défauts).

### 1.5 `entity_permission.system_role` — scope rôle, pas un nouveau rôle

- Colonne `system_role VARCHAR(20) NULL` (`dao/entity/EntityPermission.java:41-42`, ajoutée `V1_039:14-26` avec CHECK « exactement un scope parmi user_id / business_group_id / system_role »).
- 4 valeurs = `SUPER_ADMIN / ADMIN / RECRUITER / CANDIDATE` (`business/EntityPermissionBusiness.java:165-173`, via `UserRole.normalizeSystemRole`).
- Sens : droit posé sur un couple `(entity_type, entity_id)` + `permission_key` au bénéfice de **tous les utilisateurs du rôle**, sans désigner personne.
- Clés (`utils/enums/EntityPermissionKey.java:3-12`) : `ADMIN, CREATOR, UPDATE, DELETE, EVALUATE, CORRECT_TEST, PLANIFY, ADVANCE_PIPELINE, FOLLOW`. Cibles (`EntityPermissionType.java:3-8`) : `CAMPAIGN, INTERVIEW, APPLICATION, QUIZ, FORM`.
- **Pas d’acteur « Évaluateur »** : aucun `UserRole.EVALUATOR`. Évaluer = permission d’entité (`EVALUATE`) OU participation à l’entretien (`business/EvaluationsBusiness.java:801-829`).

---

## Q2. BACKEND

> Pour chaque contrôleur REST : le chemin de base, puis chaque endpoint avec les colonnes : Méthode HTTP, URL, Fonctionnalité en une phrase, Rôle ou permission requis (@PreAuthorize, config de sécurité, valeur de "functionality"), Public/Authentifié, Contrôleur:ligne. Donne d'abord le nombre total d'endpoints et le nombre par contrôleur.

Conventions du projet (tout-en-POST) : `POST /entité/action` avec `{user, datas[]}`. Base des fichiers : `quizapp/src/main/java/tech/synelia/quizapp/rest/api/`. Whitelist publique : `config/SecurityConfig.java:56-69`.

### 2.1 Totaux : 312 endpoints, 47 contrôleurs

Nombre par contrôleur : Answer 8, AppConfig 5, ApplicationProgress 15, Applications 16, AuthPermissions 1, BusinessGroup 13, BusinessGroupPermission 4, CampaignForm 8, Campaigns 17, CandidateAnswer 8, CandidateAsk 6, CandidateInterview 6, CandidateToken 6, Dashboard 4, Decision 4, Departments 8, EmailTemplate 5, EmailTemplatePreset 4, EmailVerificationToken 4, EntityPermission 8, EvaluationGrid 1, Evaluations 7, File 4, Form 8, FormQuestions 8, FormVersion 8, GroupChangeRequest 4, InterviewParticipant 6, Interviews 7, InvitationCode 6, LegalText 4, MailLog 6, Notifications 6, PipelineStage 10, PipelineStageNotificationRule 6, PipelineTemplate 9, PublicCampaigns 2, Qeel 2, Question 8, SmtpConfig 5, SourceToken 8, Specialities 7, SystemRolePermission 7, UserBusinessGroup 4, UserController 12, UserDebug 1, UserPermissionOverride 6.

Routes **publiques** (whitelist) : `POST /userManager/connexion`, `POST /userManager/registerWithCode`, 10× `POST /applications/create|verify-email|get-quiz|save-quiz-answer|complete-quiz|touch-quiz|withdraw|track|respond-interview|submit-ask`, 2× `POST /campaigns/public/*`, 2× `GET /sourceToken/validate|info`, `POST /candidateanswer/**` (conflit filtre/méthode à signaler), `POST /legalText/getByCriteria`, `POST /invitationCode/validate`, `GET /api/qeel/**`, `/ws/**`, swagger. Tout le reste : authentifié.

### 2.2 Regroupement par profil de sécurité (détail complet ci-dessous en §2.3)

- **Public parcours candidat** : Applications (10 whitelistées), PublicCampaigns (2), SourceToken validate/info (GET ×2), InvitationCode validate, LegalText getByCriteria, CandidateAnswer (filtre permitAll, méthodes restreintes), Qeel (2).
- **ADMIN + SUPER_ADMIN** : BusinessGroup (13), BusinessGroupPermission (4), Departments (8), EmailVerificationToken (4), EntityPermission (8, nuances `isAuthenticated` sur `getForEntity/me`), PipelineStage (10), PipelineStageNotificationRule (6), PipelineTemplate (9), Specialities (7), SystemRolePermission (7), UserController (12), UserDebug (1), UserPermissionOverride (6), InvitationCode sauf validate (5), GroupChangeRequest update/delete (méthodes).
- **ADMIN + SUPER_ADMIN + RECRUITER** : Answer, CampaignForm, Campaigns (17, dont publish/open/close/pause/resume/unpublish/archive/unarchive), CandidateAsk, CandidateInterview, CandidateToken, Dashboard (GET ×4), Decision, Evaluations, File, Form, FormQuestions, FormVersion, Interviews (dont finish), InterviewParticipant, Notifications, Question, UserBusinessGroup (assignation restreinte ADMIN).
- **SUPER_ADMIN seul** : AppConfig (5), LegalText create/update/delete (méthodes), MailLog (6), SmtpConfig (5), EmailTemplate + Preset (classe `SUPER_ADMIN or ADMIN`).
- **Tout authentifié** : AuthPermissions/me, EntityPermission getForEntity/me, File, GroupChangeRequest create/get, Notifications.

### 2.3 Détail : endpoints non-CRUD (actions métier, un par un)

| Méthode | URL | Fonctionnalité | Rôle/permission | Public/Auth | Source |
|---|---|---|---|---|---|
| POST | /applications/verify-email | Vérifier l’email (crée tentative quiz) | NON VISIBLE | Public | ApplicationsController.java:117 |
| POST | /applications/get-quiz | Charger quiz + règles anti-triche | NON VISIBLE | Public | :127 |
| POST | /applications/save-quiz-answer | Sauvegarder une réponse | NON VISIBLE | Public | :137 |
| POST | /applications/complete-quiz | Clôturer + scorer | NON VISIBLE | Public | :147 |
| POST | /applications/touch-quiz | Activité + événements anti-triche | NON VISIBLE | Public | :157 |
| POST | /applications/track | Suivi par code + email | NON VISIBLE | Public | :178 |
| POST | /applications/respond-interview | Accepter / demander replanification | NON VISIBLE | Public | :188 |
| POST | /applications/submit-ask | Demande IDENTITY/EMAIL/PHONE | NON VISIBLE | Public | :208 |
| POST | /applications/withdraw | Retrait volontaire (+ notif recruteurs) | NON VISIBLE | Public | :225 |
| POST | /applicationProgress/advance | Valider étape (passStage) | NON VISIBLE | Auth | ApplicationProgressController.java:116 |
| POST | /applicationProgress/fail | Marquer échec (+ cascade SKIPPED si éliminatoire) | NON VISIBLE | Auth | :133 |
| POST | /applicationProgress/skip | Sauter étape (si non obligatoire, sans mail en attente) | NON VISIBLE | Auth | :150 |
| POST | /applicationProgress/rollback | Réouvrir (reset + annule mails) | NON VISIBLE | Auth | :167 |
| POST | /applicationProgress/migrateMultiple | Migration pipeline multiple | NON VISIBLE | Auth | :227 |
| POST | /campaigns/publish|open|close|pause|resume|unpublish|archive|unarchive | Cycle de vie campagne | Classe ADMIN/SUPER_ADMIN/RECRUITER | Auth | CampaignsController.java:185-255 |
| POST | /campaigns/checkEditPermission | Droit d’édition (CAN_EDIT) | Classe | Auth | :167 |
| POST | /interviews/finish | Clôturer (→ CLOSED, sync évaluations) | Classe + CREATE/UPDATE_INTERVIEWS | Auth | InterviewsController.java:148 |
| POST | /pipelineTemplate/setDefault | Modèle par défaut | Classe ADMIN/SUPER_ADMIN | Auth | PipelineTemplateController.java:96 |
| POST | /pipelineTemplate/duplicate | Dupliquer modèle | Classe | Auth | :113 |
| POST | /pipelineStage/reorder | Réordonner étapes | Classe | Auth | PipelineStageController.java:114 |
| POST | /pipelineStage/saveTemplateStages | Sauvegarder étapes du modèle | Classe | Auth | :131 |
| POST | /pipelineStageNotificationRule/byStage | Règles d’une étape | Classe | Auth | PipelineStageNotificationRuleController.java:73 |
| POST | /invitationCode/validate | Valider code (inscription) | permitAll | Public | InvitationCodeController.java:84 |
| POST | /invitationCode/resend | Renvoyer code | Classe ADMIN/SUPER_ADMIN | Auth | :96 |
| POST | /smtpConfig/test | Tester envoi SMTP | Classe SUPER_ADMIN | Auth | SmtpConfigController.java:77 |
| POST | /entityPermission/grant|revoke | Octroyer/révoquer droit entité | ADMIN/SUPER_ADMIN | Auth | EntityPermissionController.java:45,58 |
| POST | /entityPermission/me | Mes droits | isAuthenticated | Auth | :97 |
| POST | /groupChangeRequest/create | Demander changement de groupe | isAuthenticated + CREATE_GROUP_CHANGE_REQUEST | Auth | GroupChangeRequestController.java:38 |
| POST | /groupChangeRequest/update|delete | Traiter/supprimer demande | ADMIN/SUPER_ADMIN | Auth | :48,57 |
| POST | /user/update-admin-mode (PUT) | Basculer mode admin | Classe ADMIN/SUPER_ADMIN | Auth | UserController.java:99 |
| POST | /userPermissionOverride/setOverride|removeOverride | Forcer/retirer surcharge | ADMIN/SUPER_ADMIN | Auth | UserPermissionOverrideController.java:37,50 |
| POST | /systemRolePermission/addPermission|removePermission | Modifier rôle système | SUPER_ADMIN | Auth | SystemRolePermissionController.java:51,64 |
| POST | /userBusinessGroup/create|update|delete | Assigner groupes (méthodes ADMIN) | Classe + méthode ADMIN/SUPER_ADMIN | Auth | UserBusinessGroupController.java:38,48,57 |
| POST | /legalText/getByCriteria | Lire CGU/confidentialité | VIEW_LEGAL_TEXT | Public | LegalTextController.java:75 |
| GET | /sourceToken/validate/{token} | Valider lien source (6 car.) | NON VISIBLE | Public | SourceTokenController.java:141 |
| GET | /sourceToken/info/{token} | Infos lien source | NON VISIBLE | Public | :198 |
| POST | /campaigns/public/getAvailable|getById | Campagnes publiées | NON VISIBLE | Public | PublicCampaignsController.java:28,33 |
| GET | /api/dashboard/counts|overview-stats|check-dependencies|check-parent | Indicateurs + dépendances | Classe ADMIN/SUPER_ADMIN/RECRUITER | Auth | DashboardController.java:161,193,452,543 |
| GET | /files/download/{f}\|exists\|config ; POST /files/upload/cv | Fichiers/CV | isAuthenticated | Auth | FileController.java:63,174,212,254 |
| GET | /api/qeel/stats|health | Présence/santé QEEL | NON VISIBLE | Public | QeelController.java:36,58 |
| POST | /evaluations/getCriteria | Critères d’évaluation | Classe + RECRUITER | Auth | EvaluationsController.java:109 |
| POST | /evaluationGrid/templates | Gabarits de grille | Classe ADMIN/SUPER_ADMIN | Auth | EvaluationGridController.java:35 |
| POST | /emailTemplate/getByActionType | Modèle par type d’action | Classe SUPER/ADMIN | Auth | EmailTemplateController.java:81 |
| POST | /authPermissions/me | Profil + permissions connecté | NON VISIBLE | Auth | AuthPermissionsController.java:50 |
| POST | /user/set-users-online | Forcer présence (debug) | ADMIN/SUPER_ADMIN (+ SecurityConfig.java:67) | Auth | UserDebugController.java:29 |

CRUD standard (non listés un par un) : chaque entité suit `create/update/updateDeleted/updateAll/delete/getByCriteria/getAllByCriteria/custom` en `POST /entité/action`, classe `@PreAuthorize` du contrôleur + `VIEW/CREATE/UPDATE/DELETE_<ENTITÉ>` — voir §2.1 pour les lignes exactes par contrôleur.

---

## Q3. FRONTEND

> Liste les routes Angular avec : chemin, composant, guard appliqué, rôle requis, et l'entrée de menu correspondante. Donne aussi les pages accessibles sans connexion (parcours du candidat).

Source unique : `quizapp_front/src/app/app.routes.ts`. Guards : `core/guards/auth.guard.ts` (`authGuard`, `noAuthGuard`), `core/guards/role.guard.ts` (`roleGuard`, `permissionGuard([...])` = AU MOINS UNE permission, bypass super-admin, sinon `/dashboard?error=access_denied` ; `campaignViewGuard`, `campaignEditGuard`, `interviewCreateGuard`), `core/guards/source-token.guard.ts` (`sourceTokenGuard` : format 6 alphanum + validation API).

### 3.1 Public sans guard (parcours candidat + vitrine)

| Chemin | Composant | Menu |
|---|---|---|
| `/` | HomeComponent | Header Accueil, Footer Accueil |
| `/campagnes` (+ redirect `/campaigns`) | CampaignsComponent | Footer Campagnes |
| `/suivre-candidature` | TrackApplicationComponent | Header + Footer « Suivre ma candidature », CTA home |
| `/postuler/campagne/:campaignId` | ApplyPositionComponent | Aucune (lien transmis) |
| `/verify-email/:token` | VerifyEmailComponent | Aucune (lien email) |
| `/quiz/:applicationId/:quizToken` | QuizComponent (sécurité par `quizToken` URL, pas de guard) | Aucune (lien transmis) |
| `/postuler/:sourceToken` | ApplyPositionComponent, `sourceTokenGuard` (rejet → `/` si token invalide) | Aucune |

### 3.2 Sans connexion mais refus si connecté (`noAuthGuard` → dashboard)

`/connexion` (ConnexionComponent, Footer Connexion), `/inscription` (InscriptionComponent, sans menu), `/mot-de-passe-oublie` (sans menu).

### 3.3 Dashboard (parent `authGuard`, sinon → `/connexion`)

| Chemin | Composant | Guard / rôles | Menu sidebar |
|---|---|---|---|
| `/dashboard/overview` | OverviewComponent | authGuard | Tableau de bord (super,admin,recruiter + VIEW_CAMPAIGNS) |
| `/dashboard/profile` | ProfileComponent | authGuard | User-menu Profil (pas de sidebar) |
| `/dashboard/settings` | SettingsComponent | authGuard | Paramètres (VIEW_APP_CONFIG + VIEW_EMAIL_TEMPLATE) |
| `/dashboard/departments` | DepartmentsComponent | roleGuard + VIEW_DEPARTMENTS, super,admin | Départements |
| `/dashboard/specialities` | SpecialitiesComponent | roleGuard + VIEW_SPECIALITIES, super,admin | Spécialités |
| `/dashboard/questions` | QuestionsComponent | roleGuard + VIEW_QUESTION, super,admin | Questions |
| `/dashboard/answers` | AnswersComponent | roleGuard + VIEW_ANSWER, super,admin | Réponses |
| `/dashboard/forms` (+ `/new`, `/:id/edit`) | FormsComponent / FormEditorPageComponent | roleGuard + VIEW/CREATE/UPDATE_FORM, super,admin | Formulaires |
| `/dashboard/users` | UsersComponent | VIEW_USER | Utilisateurs (super,admin,recruiter) |
| `/dashboard/campaigns` (+ `/new`, `/:id/edit` via `campaignEditGuard`, `/:id` via `campaignViewGuard` : VIEW/UPDATE/DELETE_CAMPAIGNS global OU droit entité CAMPAIGN ADMIN/CREATOR/UPDATE/DELETE/EVALUATE/PLANIFY/ADVANCE_PIPELINE/FOLLOW) | CampaignsComponent / CampaignFormComponent / CampaignDetailComponent | VIEW_CAMPAIGNS (+ guards entité) | Campagnes |
| `/dashboard/candidates` (+ `/:id`) | ApplicationsComponent / CandidateDetailComponent | VIEW_APPLICATIONS | Candidatures |
| `/dashboard/decisions` | DecisionsComponent | VIEW_DECISIONS | Décisions |
| `/dashboard/interviews` (+ `/create` via `interviewCreateGuard` : CREATE/UPDATE_INTERVIEWS ou PLANIFY ou droit campagne) | InterviewsComponent / InterviewCreateComponent | VIEW_INTERVIEWS | Entretiens |
| `/dashboard/evaluations` | EvaluationsListComponent | VIEW_EVALUATIONS | Évaluations |
| `/dashboard/evaluate` (+ `/:link`, plein écran sans layout) | EvaluationsComponent | authGuard seul | Aucune |
| `/dashboard/pipeline-templates` (+ `/:id/edit`) | PipelineTemplatesComponent / PipelineTemplateEditComponent | VIEW_PIPELINE_TEMPLATE (+ UPDATE pour edit) | Modèles Pipeline |
| `/dashboard/email-editor`, `/:id`, `/email-presets`, `/:id` | EmailEditorComponent | VIEW_EMAIL_TEMPLATE | Aucune sidebar |
| `/dashboard/system-role-permissions` | SystemRolePermissionsComponent | MANAGE_SYSTEM_ROLES | Rôles système (super) |
| `/dashboard/business-groups` | BusinessGroupsComponent | MANAGE_SYSTEM_ROLES | Groupes métiers (super) |
| `/dashboard/user-permissions` | UserPermissionsComponent | MANAGE_SYSTEM_ROLES | Permissions utilisateurs (super) |
| `/dashboard/entities` (+ dropdown Accès rapide) | EntitiesComponent | VIEW_APP_CONFIG | Entités (super) |
| `/dashboard/merise` | MeriseComponent | VIEW_APP_CONFIG | Modèle Merise (super) |
| `/dashboard/entities/<36 entités>[/:page]` | EntitiesXxxComponent (×36 : campaigns, users, departments, specialities, questions, answers, applications, interviews, source-tokens, evaluations, candidate-answers, candidate-ask, candidate-interview, candidate-token, interview-participant, decisions, notifications, forms, campaign-form, form-questions, pipeline-templates, pipeline-stages, application-progress, email-verification-tokens, business-group-permissions, user-business-groups, email-templates, mail-log, smtp-config, legal-texts, app-config, invitation-codes, business-groups, system-role-permissions, user-permission-overrides, entity-permissions) | VIEW_* de l’entité (MANAGE_SYSTEM_ROLES pour les 3 permissions système) | Dropdown groupé (Cœur métier, Quiz, Formulaires, Pipeline, Communication, Configuration, Permissions) |

---

## Q4. PERMISSIONS EN BASE

> Exécute et donne le résultat de : SELECT system_role, functionality FROM system_role_permission WHERE is_deleted = 0 ORDER BY system_role; puis les valeurs distinctes de business_group_permission.functionality.

**NON EXÉCUTÉ sur base live** (pas d’accès fiable d’ici sans manipuler le mot de passe — à exécuter en local : `mysql -u <user> -p quizapp_db -e "SELECT system_role, functionality FROM system_role_permission WHERE is_deleted = 0 ORDER BY system_role, functionality;"` ; un écart avec le seed ci-dessous signale une base ayant évolué). **Contenu seed exhaustif** (source de vérité versionnée) :

### 4.1 `V1_013__default_system_permissions.sql` — ADMIN : 115 couples (l.10-154)

En-tête : plancher immuable, tout sauf `SMTP_CONFIG, APP_CONFIG, MANAGE_SYSTEM_ROLES`. `VIEW/CREATE/UPDATE/DELETE` × 27 groupes : ANSWER, APPLICATIONS, CAMPAIGN_CRUD, CAMPAIGNS, CANDIDATE_ANSWER, CANDIDATE_ASK, CANDIDATE_INTERVIEW, CANDIDATE_TOKEN, DEPARTMENTS, DECISIONS, EVALUATIONS, FORM, FORM_QUESTIONS, FORM_VERSION, INTERVIEW_CRUD, INTERVIEWS, NOTIFICATIONS, QUESTION, SOURCE_TOKEN, SPECIALITIES, USER, EMAIL_TEMPLATE, LEGAL_TEXT, INVITATION_CODE, PIPELINE_TEMPLATE, PIPELINE_STAGE, APPLICATION_PROGRESS + `ADVANCE_PIPELINE, MANAGE_PIPELINE_TEMPLATE, MIGRATE_CANDIDATE_PIPELINE` + `VIEW/CREATE/UPDATE/DELETE_BUSINESS_GROUP`.

### 4.2 Même fichier — UTILISATEUR (= recruteur) : 30 couples (l.160-203, entièrement overridable)

`VIEW/CREATE/UPDATE_CAMPAIGNS`, `VIEW/CREATE/UPDATE_APPLICATIONS`, `VIEW/CREATE/UPDATE_INTERVIEWS`, `VIEW/CREATE/UPDATE_EVALUATIONS`, `VIEW/CREATE/UPDATE_DECISIONS`, `VIEW_SOURCE_TOKEN`, `VIEW_CANDIDATE_TOKEN`, `VIEW_PIPELINE_TEMPLATE`, `VIEW_PIPELINE_STAGE`, `VIEW_APPLICATION_PROGRESS`, `ADVANCE_PIPELINE`, `VIEW_NOTIFICATIONS`, `VIEW_BUSINESS_GROUP`, `VIEW_QUESTION`, `VIEW_ANSWER`, `VIEW_FORM`, `VIEW_FORM_QUESTIONS`, `VIEW_FORM_VERSION`, `VIEW_DEPARTMENTS`, `VIEW_SPECIALITIES`. **Ni `DELETE_*`, ni `PLANIFY/CORRECT_TEST/FOLLOW`, ni écriture USER/SMTP/EMAIL_TEMPLATE.** (`SUPER_ADMIN` : zéro ligne, bypass code. `CANDIDATE` : zéro ligne, endpoints publics uniquement.)

### 4.3 `V1_018` — groupes, associations, overrides, GROUP_CHANGE_REQUEST

- Groupes : 1 Recrutement (10 : VIEW/CREATE/UPDATE_CAMPAIGNS, VIEW/CREATE/UPDATE_APPLICATIONS, VIEW/CREATE_INTERVIEWS, VIEW/CREATE_EVALUATIONS), 2 Gestion RH (7 : VIEW/CREATE/UPDATE_USER, VIEW/CREATE_DEPARTMENTS, VIEW/CREATE_SPECIALITIES), 3 Communication (4 : VIEW/CREATE_NOTIFICATIONS, VIEW/CREATE_EMAIL_TEMPLATE).
- Associations : user2 Marie ADMIN → groupes 1 (modératrice) + 2 ; user3 Jean RECRUITER → groupes 1 + 3.
- Overrides : user3 +DELETE_CAMPAIGNS (GRANT), −CREATE_EVALUATIONS (DENY) ; user2 +MANAGE_SYSTEM_ROLES (GRANT).
- GROUP_CHANGE_REQUEST : ADMIN ×4 (VIEW/CREATE/UPDATE/DELETE), UTILISATEUR ×2 (CREATE/VIEW).

### 4.4 Valeurs distinctes de `business_group_permission.functionality` (déduites du seed)

VIEW_CAMPAIGNS, CREATE_CAMPAIGNS, UPDATE_CAMPAIGNS, VIEW_APPLICATIONS, CREATE_APPLICATIONS, UPDATE_APPLICATIONS, VIEW_INTERVIEWS, CREATE_INTERVIEWS, VIEW_EVALUATIONS, CREATE_EVALUATIONS, VIEW_USER, CREATE_USER, UPDATE_USER, VIEW_DEPARTMENTS, CREATE_DEPARTMENTS, VIEW_SPECIALITIES, CREATE_SPECIALITIES, VIEW_NOTIFICATIONS, CREATE_NOTIFICATIONS, VIEW_EMAIL_TEMPLATE, CREATE_EMAIL_TEMPLATE.

---

## Q5. MÉMOIRE

> Si le mémoire contient un chapitre sur les besoins, les spécifications fonctionnelles ou des user stories, copie la liste (titres et libellés uniquement) avec le numéro de section.

Source : `z_mémoire/template_memoire/typst/sections/body.typ`. Pas de « user stories » nommées ; l’équivalent = besoins §3 + UC-01→07 + RG + matrice BF.

- **§3.1.1 Parties prenantes** (`body.typ:372-381`) : Candidat / Recruteur / Administrateur / Super administrateur (attentes, risques, conséquences conception).
- **§3.2.1 Authentification et gestion des utilisateurs** (`:390`) : droits globaux + contextualisés ; parcours public par liens, codes, email.
- **§3.2.2 Gestion des données de référence** (`:400`) : départements, spécialités, questions, réponses, formulaires, groupes métier.
- **§3.2.3 Campagnes de recrutement** (`:405`) : cycle de vie, pipeline, formulaires, liens de diffusion, partage d’accès.
- **§3.2.4 Candidatures et suivi candidat** (`:417`) : soumission, suivi public, réponse convocation, correction, abandon.
- **§3.2.5 Quiz technique** (`:429`) : formulaire versionné, chrono, sauvegarde, score, correction manuelle.
- **§3.2.6 Entretiens, évaluations et décisions** (`:434`) : planification, convocation, réponse, évaluation collaborative, décision.
- **§3.2.7 Notifications et dashboard** (`:439`) : emails + in-app (vérification, convocation, réponse, demande, décision, défaut config critique).
- **§3.2.8 Matrice BF** (`:449-463`) : BF-01 Authentification et droits / BF-02 Référentiels / BF-03 Campagnes / BF-04 Candidatures / BF-05 Quiz / BF-06 Entretiens et décisions / BF-07 Notifications / BF-08 Pilotage.
- **§3.2.9a Matrice acteurs** (`:470-480`) : Candidat (restreint) / Recruteur (contextualisé) / Administrateur (métier) / Super admin (maximal).
- **§3.2.9b Matrice Oui/Non/Partiel** (`:489-502`) : connexion+dashboard, créer/modifier utilisateur, référentiels, créer/configurer campagne, formulaires+versions, traiter candidatures, planifier entretien, évaluer+décider, postuler+quiz, suivre sa candidature (4 colonnes Super/Admin/Recruteur/Candidat).
- **§3.3 BNF-01→07** (`:504+`) : Performance / Sécurité / Fiabilité / Ergonomie / Maintenabilité / Traçabilité / Conformité.
- **§3.4.2 UC-01→UC-07** (`:548-561`) : UC-01 Candidat postuler / UC-02 Candidat email+quiz / UC-03 Recruteur campagne / UC-04 Recruteur entretien / UC-05 Évaluateur appréciation (⚠️ libellé à renommer : pas de rôle, voir Q1.5) / UC-06 Administrateur utilisateurs+référentiels / UC-07 Super admin paramètres+supervision.
- **§3.6 RG-01→RG-09** (`:577-592`) : campagnes, accès public, email, versionning, pipeline (`application_progress` source de vérité), entretiens/décisions, permissions (rôle + contexte), correction traçable, audit.
