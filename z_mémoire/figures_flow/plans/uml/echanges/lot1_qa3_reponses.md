# Échange collab — Lot 1 ter : 5 questions de suivi → réponses (à envoyer à Claude)

> Suite de `lot1_qa2_reponses.md`. Mêmes conventions : questions recopiées
> telles quelles, faits sourcés `fichier:ligne`, `NON TROUVÉ` écrit en
> toutes lettres, rien d’inventé. Base : `quizapp/` + `quizapp_front/`.

---

## Q1. Functionality exacte par endpoint + seed RECRUITER (UTILISATEUR)

Rappel seed : `UTILISATEUR` = socle du rôle `RECRUITER` (`UserRole.java:44`) :
`VIEW/CREATE/UPDATE_CAMPAIGNS|APPLICATIONS|INTERVIEWS|EVALUATIONS|DECISIONS`,
`VIEW_SOURCE_TOKEN|CANDIDATE_TOKEN|PIPELINE_TEMPLATE|PIPELINE_STAGE|
APPLICATION_PROGRESS|NOTIFICATIONS|BUSINESS_GROUP|QUESTION|ANSWER|FORM|
FORM_QUESTIONS|FORM_VERSION|DEPARTMENTS|SPECIALITIES`, `ADVANCE_PIPELINE`
(`V1_013:160-203`). Ni `DELETE_*`, ni `PLANIFY/CORRECT_TEST/FOLLOW`,
ni `MIGRATE_CANDIDATE_PIPELINE`, ni `*_CANDIDATE_ASK`, ni `*_SOURCE_TOKEN`
(hors VIEW).

- `/applicationProgress/advance|fail|skip` → `ensureCampaignMutationAllowed`
  (`ApplicationProgressBusiness.java:1283-1310`) : globale
  `UPDATE_APPLICATION_PROGRESS` **ou** `ADVANCE_PIPELINE` (`:1298-1301`) +
  clés entité `ADMIN` / `ADVANCE_PIPELINE` (`:1302-1303`). UTILISATEUR a les
  deux globales (`:188-189`) → **passe** (contrôleurs `:116-165` sans
  functionality propre, auth simple).
- `/applicationProgress/rollback` → `ensureCampaignRollbackAllowed`
  (`:1312-1335`) : globale `MIGRATE_CANDIDATE_PIPELINE` ou clé `ADMIN`
  (`:1323-1328`). UTILISATEUR : **ni l’une ni l’autre en seed → refusé**
  sauf override/groupe.
- `/applicationProgress/migrateMultiple` (`:227-237` → `:880-886`,
  `:816-875`) : **aucun contrôle** trouvé (ni factory ni
  `hasScopedPermission` ; le seul contrôle migration,
  `ensureCampaignRollbackAllowed`, sert `rollback`, pas `migrateMultiple`).
  Passe sous simple authentification — trou signalé, pas une règle.
- `/campaigns/publish|open|close|pause|resume|unpublish|archive|unarchive`
  (`CampaignsController.java:185-255`) : **aucune functionality**
  (ex. `publishCampaign :735-780` : seuls prérequis spécialité + template +
  formulaire). Passe avec le rôle de classe (`ADMIN/SUPER_ADMIN/RECRUITER`,
  `:52`).
- `/candidateAsk/update` (`CandidateAskController.java:81-87`) : globale
  `UPDATE_CANDIDATE_ASK` via factory, **absente du seed UTILISATEUR →
  refusé** sauf override (métier `:198-303` sans contrôle propre).
- `/interviews/create` : `CREATE_INTERVIEWS` (seed ✓ **passe**) ;
  `/interviews/finish` (`:148-158`) : métier `UPDATE_INTERVIEWS` /
  `UPDATE_EVALUATIONS` + clés `ADMIN/PLANIFY/EVALUATE`
  (`InterviewsBusiness.java:1310-1316`) → passe via fallback global.
- `/decisions/create` : `CREATE_DECISIONS` (factory) + `ADVANCE_PIPELINE`
  (métier `DecisionBusiness.java:127-133`, clés `ADMIN/ADVANCE_PIPELINE`
  `:1266-1272`) → seed ✓ **passe** (idem update/delete avec
  `UPDATE/DELETE_DECISIONS`, `:304-310`, `:553-559`).

## Q2. Justification fail/skip/rollback + effet concret de fail

- **Facultative.** Contrôleurs `fail|skip|rollback`
  (`ApplicationProgressController.java:133-182`) : seuls `applicationId` +
  `pipelineStageId` exigés (`:139-141`, `:156-158`, `:173-175`) ;
  `dto.getNotes()` transité (`:143`, `:160`, `:177`) sans `FIELD_EMPTY`.
  Aucune obligation trouvée dans `failStageForUser :405`, `skipStageForUser
  :459`, `rollbackStageForUser :505` (tous relaient `notes` à `:410`,
  `:464`, `:510`).
- **Concret fail** : `failStage` (`ApplicationProgressBusiness.java:
  410-439`) → statut `FAILED` (+ `completedAt/validatedBy`), **cascade
  `SKIPPED` sur les étapes suivantes si l’étape est éliminatoire** (`:439`).
- Concret skip : `skipStage` (`:464-487`) → `SKIPPED`, **refusé** si étape
  obligatoire sans `allowSkip` en `configJson` (`:1261-1267`) ou mail requis
  en attente (`:476`). Concret rollback : `rollbackStage` (`:510-590`) →
  cible `IN_PROGRESS`, suivantes resetées (`:571`), mails annulés (`:569`).

## Q3. Liens de diffusion : qui gère, et où dans l’interface ?

- Endpoints (`SourceTokenController.java`) : verrou de classe
  `ADMIN,SUPER_ADMIN` (`:56`) + `CREATE_SOURCE_TOKEN` (`:75-78`),
  `UPDATE_SOURCE_TOKEN` (`:87-90`), `DELETE_SOURCE_TOKEN` (`:95-98`),
  `VIEW_SOURCE_TOKEN` (`:103-114`). Seed UTILISATEUR : **`VIEW_SOURCE_TOKEN`
  seul** (`V1_013:182`) → recruteur : lecture OK, **création/modification/
  révocation refusées**. Publics : `GET validate|info` (`permitAll`,
  `:141,:198`, `SecurityConfig.java:60`).
- Interface : **oui dans `campaign-detail`** (`quizapp_front/.../dashboard/
  campaign-detail/campaign-detail.ts:263` lecture, `:371-377` création,
  `:472` assignation formulaire, `:526` suppression, `:543-546` copie
  `${origin}/postuler/${tokenString}`, vues `:149,486,524-533`), **non dans
  la liste** (`campaigns.ts` : grep `sourceToken` NON TROUVÉ).
- **Aucun gate `*_SOURCE_TOKEN` côté front** (`campaign-detail.ts` : seuls
  checks entité CORRECT_TEST/update/delete) : l’écran suppose le rôle,
  le backend refuse. Oui, ça fait partie de la gestion de campagne
  (onglet dédié du détail, pas page séparée).

## Q4. Reset mot de passe + profil

- **Pas de `forgot-password` / `reset-password`** (NON TROUVÉ back et front).
  Réel : `POST /userManager/reinitialiserMotDePasse`
  (`user/managment/UserManagmentController.java:176-178`, **authentifié** —
  NON whitelisté, `SecurityConfig.java:56,64` ne citent que
  `connexion` + `registerWithCode`).
- Ordre (`UserManagmentBusiness.java:390-511`) : email exigé (`:400-406`),
  `findByEmail` (`:408`), garde `requireEmailDeliveryAvailable(PASSWORD_RESET)`
  (`:421`), **mot de passe généré 8 car.** (`:425`), hash BCrypt (`:428`),
  flag `isDefaultPassword` (`:426`), template `PASSWORD_RESET` (`:450-451`,
  vars `first_name,last_name,email,new_password,app_link` `:452-457`),
  envoi (`:467`). **Pas de token, pas d’étape validation, pas de mot de
  passe choisi.**
- À distinguer : `changerMotDePasse` (`:246-326`, ancien hash vérifié
  `:274-297`, même id imposé `:307-312`) et `changerEmail` (`:144-153`
  contrôleur).
- Profil (`profile.ts`) : `firstName/lastName` → `POST /user/update`
  (`user.service.ts:432-436,459`), email (+ mot de passe courant,
  `:236-239` → `POST /userManager/changerEmail`), password dédié
  (`POST /userManager/changerMotDePasse`, `:349-355`). Rôle, username,
  téléphone : **NON modifiables** depuis le profil.

## Q5. Notifications in-app : lue, autres actions

- Champ lu/non-lu : oui, `is_read` (`dao/entity/Notifications.java:61-62`).
- Marquer comme lue : oui mécaniquement — `POST /notifications/update
  {data:{id,isRead:true}}` (`NotificationsController.java:81-87` →
  `NotificationsBusiness.java:214-216`), front `markAsRead()` (`notification.
  service.ts:185-206`) et `markAllAsRead()` (`datas:[{id,isRead:true}]`,
  `:211-232`). **Réserve** : `UPDATE_NOTIFICATIONS` absent du seed
  UTILISATEUR (que `VIEW`, `V1_013:191`) → recruteur seedé **refusé** sans
  override (contrôle `BusinessFactory.java:221-225`).
- Autres : `delete` (soft `isDeleted`, `:89-95` → `:279-325`), `getByCriteria`
  = « mes notifications » (filtre `userId` forcé sauf ADMIN/SUPER,
  `:335-392`), `getAllByCriteria`, `custom`, create/update/restore côté
  front (`:338-358`).
