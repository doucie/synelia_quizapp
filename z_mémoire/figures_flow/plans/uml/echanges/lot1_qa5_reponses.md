# Échange collab — Lot 1 quinquies : 5 questions administration → réponses (à envoyer à Claude)

> Suite de `lot1_qa4_reponses.md`. Mêmes conventions : questions recopiées
> telles quelles, faits sourcés `fichier:ligne`, `NON TROUVÉ` écrit en
> toutes lettres, rien d’inventé. Base : `quizapp/` + `quizapp_front/`.

---

## Q1. Gestion des utilisateurs : endpoints, rôles, ADMIN vs SUPER_ADMIN

> Les endpoints de gestion des utilisateurs (UserController et UserManagment) : créer, modifier, verrouiller/déverrouiller (champ is_locked), supprimer, basculer le mode admin. Pour chacun : le rôle ou la permission requise, et ce qui distingue ADMIN de SUPER_ADMIN.

### UserController — `POST /user/*` (classe `ADMIN,SUPER_ADMIN`, `:60`)

| Endpoint | Rôle/permission | Source |
|---|---|---|
| `create` | Classe + `CREATE_USER` (`:82`) | UserController.java:79 |
| `update` | Classe + `UPDATE_USER` (`:94`) | :91 |
| `delete` | Classe + `DELETE_USER` (`:164`) | :161 |
| `getByCriteria` | Classe + `VIEW_USER` (`:172`) | :169 |
| `getAllByCriteria`, `updateAll` | **SUPER_ADMIN** (méthode) | :177, :151 |
| `updateDeleted` | **SUPER_ADMIN** (méthode, même pattern que les autres contrôleurs) | pattern `updateDeleted` |
| `update-admin-mode` (PUT) | **Aucun rôle** — soi-même uniquement (`dto.id == authId` imposé `:125-134`, 403 sinon) ; seul champ modifié : `adminMode` (`UserBusiness.java:706`) | UserController.java:99-137 |

### Verrouillage — `POST /userManager/verrouiller|déverrouiller` (`UserManagmentController.java:208-270`)

- **Aucune garde de rôle ni functionality** (classe sans `@PreAuthorize`
  `:32-36`, corps sans contrôle) : seul `request.getUser` + `dto.id`
  exigés. Tout authentifié techniquement (à modéliser comme cas admin —
  principe bugs vs logique).
- Effet : `is_locked` (`dao/entity/User.java:81-82`) posé à `true`
  (`UserManagmentBusiness.java:561`) / `false` (`:650`), refus si déjà
  dans l’état (`:555`, `:645`).
- Compte verrouillé **ne peut pas se connecter** : `connexion :150-154`
  rejette avant `lastConnectionDate` (`:163`) et JWT (`:191`).

### Ce qui distingue ADMIN de SUPER_ADMIN

- ADMIN = plancher immuable (`V1_013:6-8`, tout sauf `SMTP_CONFIG`,
  `APP_CONFIG`, `MANAGE_SYSTEM_ROLES`) ; SUPER_ADMIN = zéro ligne en seed,
  **bypass total en code** (`PermissionService.java:46-59`).
- Méthodes réservées SUPER : `getAllByCriteria`, `updateAll`,
  `updateDeleted` (pattern général), `MANAGE_SYSTEM_ROLES`
  (rôles/permissions système).

## Q2. Référentiels départements et spécialités : qui et avec quoi ?

> Les référentiels gérés par l'admin (départements, spécialités) et par qui (permission VIEW/CREATE/UPDATE/DELETE exacte).

- Classe `ADMIN,SUPER_ADMIN` (`DepartmentsController.java:52`,
  `SpecialitiesController.java:52` — pattern identique).
- `POST /departments|specialities/create|update|delete|getByCriteria` :
  `CREATE|UPDATE|DELETE|VIEW_DEPARTMENTS` (`:72,84,92,100`) et
  `CREATE|UPDATE|DELETE|VIEW_SPECIALITIES` (`SpecialitiesController:72,84,
  102,110`).
- Seed : ADMIN ×4 sur chaque (`V1_013:52-55`, `:107-110`) ; UTILISATEUR :
  `VIEW_DEPARTMENTS` + `VIEW_SPECIALITIES` seuls (`:202-203`).
- **Donc : lecture pour tous les internes, écriture ADMIN/SUPER (+ override).**

## Q3. Écrans d’administration du frontend : titre, route, permissions, super-only

> Pour chaque entrée du menu admin, le titre, la route et les permissions requises. Distingue ce qui est réservé au super admin.

Réservé **super admin** (menu `roles:['super']`, `dashboard.ts`) :

| Titre menu | Route | Permissions |
|---|---|---|
| Rôles système | `/dashboard/system-role-permissions` | `MANAGE_SYSTEM_ROLES` |
| Groupes métiers | `/dashboard/business-groups` | `MANAGE_SYSTEM_ROLES` |
| Permissions utilisateurs | `/dashboard/user-permissions` | `MANAGE_SYSTEM_ROLES` |
| Entités | `/dashboard/entities` (+ dropdown Accès rapide, ~30 entités) | `VIEW_APP_CONFIG` (**sans `roleGuard`** — filtre super au menu seulement, pas à la route, `app.routes.ts:97-100`) |
| Modèle Merise | `/dashboard/merise` | `VIEW_APP_CONFIG` (idem, `:101-105`) |

Super + admin (menu `roles:[super,admin]`) : Départements, Spécialités,
Questions, Réponses, Formulaires (`/dashboard/<entité>`, `roleGuard` +
`VIEW_*`) ; Utilisateurs (`/dashboard/users`, `VIEW_USER`,
super/admin/recruiter au menu). Paramètres (`/dashboard/settings`,
`VIEW_APP_CONFIG` + `VIEW_EMAIL_TEMPLATE`).

## Q4. Demande de changement de groupe : qui crée, qui traite, effets

> Qui la crée, qui la traite, et ce que fait le traitement (affectation automatique ou non, notification envoyée).

- Crée : **tout authentifié pour soi-même** (`dto.userId == request.user`,
  sinon `ROLE_ADMIN/ROLE_SUPER_ADMIN` exigé,
  `GroupChangeRequestBusiness.java:64-71`) + `CREATE_GROUP_CHANGE_REQUEST`
  (`GroupChangeRequestController.java:38-41`). Statut initial `PENDING`
  (`:107`).
- Traite : **ADMIN/SUPER_ADMIN** (`@PreAuthorize`, `:47`) +
  `UPDATE_GROUP_CHANGE_REQUEST` (`:48-51`). Méthodes métier
  `approveRequest` (`:253-255`) / `ensureUserMembership` (`:262-293`) /
  `notifyRequester` (`:313-321`) / `createNotification` (`:323-334`).
- Effet (`:152-165`) : statut posé (`:153`), `processedAt/processedBy`
  si APPROVED/REJECTED (`:154-156`), **affectation `user_business_group`
  automatique si approuvé** (`:159-161` → `:276-292`, `isModerator=false`
  si création `:283`), **notification `GROUP_CHANGE_APPROVED/REJECTED` au
  demandeur** (`:313-321`). Modérateurs notifiés **à la création seulement**
  (`:115` + `:299-311`, `GROUP_CHANGE_REQUEST`).
- Pas de garde de transition (autre valeur posée librement `:153`).

## Q5. Écrans « Modèle Merise » et « Entités » : à quoi servent-ils ?

> À quoi servent-ils (outil de supervision, consultation de données, autre) ?

- **Modèle Merise** (`merise.ts:36-44`, titre `merise.html:6`) :
  **visualiseur statique** du schéma BD — 20 tables en dur (`:68-361`),
  relations (`:364-393`), zoom/pan/recherche/sélection (`:51-58`),
  stats calculées (`:396-417`). Lecture seule : **ni supervision
  d’activité, ni génération**.
- **Entités** (`entities.ts:21-27`, titre `Gestion des Entités`,
  `entities.html:10-13`) : **hub de consultation + navigation** — ~30
  entités (`:43-369`), recherche (`:372-380`), **compteurs de volumes**
  via `DashboardStatsService.getCounts()` (`:391-407`), navigation CRUD
  (`navigateToEntity :516-540`). Supervision des volumes + porte d’entrée,
  pas de génération.
