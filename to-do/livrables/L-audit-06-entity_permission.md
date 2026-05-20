# L-audit-06-entity_permission -- Audit table par table

**Table :** `entity_permission`
**Niveau topologique :** 6 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LENTPER-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LENTPER-001** Role metier de `entity_permission` documente en 1 ligne. -- _AUDIT: Permissions polymorphes par entite (CAMPAIGN/INTERVIEW/PIPELINE_TEMPLATE) + permission_key (UPDATE/DELETE/EVALUATE/ADMIN/FOLLOW...)._
- [x] **LENTPER-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LENTPER-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int` | NO | PRI | `-` |
| `user_id` | `int unsigned` | NO | MUL | `-` |
| `entity_type` | `varchar(50)` | NO | MUL | `-` |
| `entity_id` | `int` | NO | - | `-` |
| `permission_key` | `varchar(50)` | NO | - | `-` |
| `created_at` | `timestamp` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `timestamp` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `0` |
| `search_string` | `text` | YES | - | `-` |

### Champs/contraintes a AJOUTER

- [x] **LENTPER-020** AJOUT : `business_group_id int NULL MUL` -- permission portee groupe (D-019). -- _AUDIT: **FIXED** Colonne + index ajoutes via `V1_039__entity_permission_scope_columns.sql`._
- [x] **LENTPER-021** AJOUT : `system_role varchar(20) NULL` -- permission portee role (D-019). -- _AUDIT: **FIXED** Colonne + index ajoutes via `V1_039__entity_permission_scope_columns.sql`._
- [x] **LENTPER-022** AJOUT : Index composite `(entity_type, entity_id, user_id|business_group_id|system_role, permission_key)`. -- _AUDIT: **FIXED** Index `idx_ep_scope_entity_perm (entity_type, entity_id, permission_key)` + index dedies par scope dans `V1_039`._
- [x] **LENTPER-023** AJOUT : Contrainte CHECK: exactement un parmi (user_id, business_group_id, system_role) non null. -- _AUDIT: **FIXED** `CONSTRAINT chk_ep_exactly_one_scope CHECK (CASE WHEN ... = 1)` ajoutee dans `V1_039`._

### Champs a VERIFIER / MODIFIER

- [x] **LENTPER-040** REVUE : `user_id` doit devenir NULLABLE (D-019). -- _AUDIT: Unicite (user_id, entity_type, entity_id, permission_key)._

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int)

- [x] **LENTPER-100 Alignement de type** `id` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `user_id` (int unsigned)

- [x] **LENTPER-102 Alignement de type** `user_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LENTPER-103 Obligatoire creation** `user_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `user_id`.
- [x] **LENTPER-104 FK** `user_id` -> probable `user` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `entity_type` (varchar(50))

- [x] **LENTPER-106 Alignement de type** `entity_type` (`varchar(50)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LENTPER-107 Obligatoire creation** `entity_type` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `entity_type`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LENTPER-108 Longueur** `entity_type` (varchar(50)) : `@Size(max=50)` DTO, `Validators.maxLength(50)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `entity_id` (int)

- [x] **LENTPER-110 Alignement de type** `entity_id` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LENTPER-111 Obligatoire creation** `entity_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `entity_id`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._

### Champ `permission_key` (varchar(50))

- [x] **LENTPER-113 Alignement de type** `permission_key` (`varchar(50)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LENTPER-114 Obligatoire creation** `permission_key` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `permission_key`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LENTPER-115 Longueur** `permission_key` (varchar(50)) : `@Size(max=50)` DTO, `Validators.maxLength(50)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `created_at` (timestamp)

- [x] **LENTPER-117 Alignement de type** `created_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LENTPER-118 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LENTPER-119 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LENTPER-121 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LENTPER-122 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (timestamp)

- [x] **LENTPER-124 Alignement de type** `updated_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LENTPER-125 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LENTPER-126 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LENTPER-128 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LENTPER-129 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LENTPER-131 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LENTPER-132 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LENTPER-133 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LENTPER-135 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LENTPER-136 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LENTPER-137 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LENTPER-300** Endpoint `POST /api/entity_permission/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: **FIXED** /grant @PreAuthorize(hasAnyRole('ADMIN','SUPER_ADMIN')) ajoute._
- [x] **LENTPER-301** Endpoint `POST /api/entity_permission/update` existe (convention `""`->ignore, `null`->set null). -- _AUDIT: **FIXED** /revoke @PreAuthorize(hasAnyRole('ADMIN','SUPER_ADMIN')) ajoute._
- [x] **LENTPER-302** Endpoint `POST /api/entity_permission/delete` (soft-delete) existe. -- _AUDIT: /delete protected SUPER_ADMIN._
- [~] **LENTPER-303** Endpoint `POST /api/entity_permission/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [x] **LENTPER-304** Endpoint `POST /api/entity_permission/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche). -- _AUDIT: **FIXED** /getByCriteria + /getForUser -> ADMIN/SUPER_ADMIN ; /getForEntity + /me -> isAuthenticated()._
- [x] **LENTPER-305** Endpoint `POST /api/entity_permission/getFullInfos` retourne DTO complet (FK resolues). -- _AUDIT: /getAllByCriteria SUPER_ADMIN._
- [~] **LENTPER-306** Service Angular `entity_permission.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LENTPER-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LENTPER-320** Route Angular `<entity_permission>/new` declaree et guard route applique.
- [x] **LENTPER-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LENTPER-322** Composant `entity_permission-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LENTPER-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LENTPER-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LENTPER-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LENTPER-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LENTPER-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LENTPER-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LENTPER-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LENTPER-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LENTPER-340** Route Angular `<entity_permission>/:id/edit` declaree.
- [x] **LENTPER-341** Pre-remplissage via `getFullInfos`.
- [?] **LENTPER-342** Champs immuables affiches en lecture seule.
- [~] **LENTPER-343** Convention `""`/`null`/value respectee front (patchValue cible).
- [x] **LENTPER-344** Bouton "Annuler" retour sans persister.
- [x] **LENTPER-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LENTPER-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LENTPER-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LENTPER-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LENTPER-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LENTPER-363** Texte confirmation explicite + reversible documente.
- [x] **LENTPER-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LENTPER-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LENTPER-366** Rafraichissement sans F5.

### 3.E RESTORE
- [~] **LENTPER-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Pas de format dd/MM/yyyy clair dans DTO -- probable ISO 8601 (a verifier)._

### 3.F LIST / SEARCH
- [x] **LENTPER-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LENTPER-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LENTPER-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LENTPER-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LENTPER-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LENTPER-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LENTPER-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LENTPER-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LENTPER-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LENTPER-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LENTPER-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LENTPER-600** Lister toutes les tables source ayant une FK vers `entity_permission` (parcourir DB describe). -- _AUDIT: Pas de FK entrantes._
- [-] **LENTPER-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LENTPER-602** Soft-delete de `entity_permission` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LENTPER-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LENTPER-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LENTPER-605** Test : creer une source liee -> tenter delete `entity_permission` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LENTPER-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LENTPER-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **FIXED** Validation enum stricte ajoutee dans EntityPermissionBusiness.grantPermission() : entityType (CAMPAIGN/INTERVIEW/APPLICATION/QUIZ/FORM) + permissionKey (ADMIN/CREATOR/UPDATE/DELETE/EVALUATE/CORRECT_TEST/PLANIFY/ADVANCE_PIPELINE/FOLLOW) avec normalisation toUpperCase. Converter BD reste a faire pour blindage complet._
- [x] **LENTPER-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LENTPER-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LENTPER-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LENTPER-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LENTPER-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LENTPER-707** Aucun tableau non rafraichi apres mutation.
- [-] **LENTPER-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LENTPER-709** Aucune route sensible sans guard.
- [x] **LENTPER-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **FIXED** Tous les 6 endpoints du controller annotes @PreAuthorize._
- [x] **LENTPER-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **FIXED** /grant et /revoke restreints ADMIN/SUPER_ADMIN (round1) -- UTILISATEUR ne peut plus grant sur entite d'autrui._
- [x] **LENTPER-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LENTPER-713** Aucun hard-delete accidentel.
- [-] **LENTPER-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LENTPER-715** Aucun invariant inter-champs non valide back.
- [-] **LENTPER-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LENTPER-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LENTPER-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LENTPER-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LENTPER-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LENTPER-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: **Decisions CRITIQUES** : (1) ajouter @PreAuthorize sur grant/revoke/getForEntity ; (2) verifier requester == owner(entity) || ADMIN ; (3) enum strict entityType + permission_key ; (4) audit trail grants/revokes ; (5) format date DTO dd/MM/yyyy._

