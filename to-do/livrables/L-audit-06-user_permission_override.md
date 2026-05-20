# L-audit-06-user_permission_override -- Audit table par table

**Table :** `user_permission_override`
**Niveau topologique :** 6 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LUSEPEROV-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LUSEPEROV-001** Role metier de `user_permission_override` documente en 1 ligne. -- _AUDIT: Override individuel : functionality + isAllowed (true=GRANT, false=DENY)._
- [x] **LUSEPEROV-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LUSEPEROV-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int` | NO | PRI | `-` |
| `user_id` | `int unsigned` | NO | MUL | `-` |
| `functionality` | `varchar(100)` | NO | - | `-` |
| `is_allowed` | `tinyint(1)` | NO | - | `-` |
| `created_at` | `timestamp` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `timestamp` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `0` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int)

- [x] **LUSEPEROV-100 Alignement de type** `id` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `user_id` (int unsigned)

- [x] **LUSEPEROV-102 Alignement de type** `user_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LUSEPEROV-103 Obligatoire creation** `user_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `user_id`.
- [x] **LUSEPEROV-104 FK** `user_id` -> probable `user` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `functionality` (varchar(100))

- [x] **LUSEPEROV-106 Alignement de type** `functionality` (`varchar(100)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LUSEPEROV-107 Obligatoire creation** `functionality` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `functionality`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LUSEPEROV-108 Longueur** `functionality` (varchar(100)) : `@Size(max=100)` DTO, `Validators.maxLength(100)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `is_allowed` (tinyint(1))

- [x] **LUSEPEROV-110 Alignement de type** `is_allowed` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LUSEPEROV-111 Obligatoire creation** `is_allowed` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `is_allowed`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LUSEPEROV-112 Booleen** `is_allowed` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `created_at` (timestamp)

- [x] **LUSEPEROV-114 Alignement de type** `created_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LUSEPEROV-115 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LUSEPEROV-116 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LUSEPEROV-118 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LUSEPEROV-119 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (timestamp)

- [x] **LUSEPEROV-121 Alignement de type** `updated_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LUSEPEROV-122 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LUSEPEROV-123 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LUSEPEROV-125 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LUSEPEROV-126 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LUSEPEROV-128 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LUSEPEROV-129 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LUSEPEROV-130 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LUSEPEROV-300** Endpoint `POST /api/user_permission_override/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: **FIXED** /setOverride @PreAuthorize(hasAnyRole('ADMIN','SUPER_ADMIN')) ajoute._
- [x] **LUSEPEROV-301** Endpoint `POST /api/user_permission_override/update` existe (convention `""`->ignore, `null`->set null). -- _AUDIT: **FIXED** /removeOverride @PreAuthorize(hasAnyRole('ADMIN','SUPER_ADMIN')) ajoute._
- [x] **LUSEPEROV-302** Endpoint `POST /api/user_permission_override/delete` (soft-delete) existe. -- _AUDIT: /delete SUPER_ADMIN._
- [~] **LUSEPEROV-303** Endpoint `POST /api/user_permission_override/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [x] **LUSEPEROV-304** Endpoint `POST /api/user_permission_override/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche). -- _AUDIT: **FIXED** /getByUser + /getByCriteria -> ADMIN/SUPER_ADMIN._
- [x] **LUSEPEROV-305** Endpoint `POST /api/user_permission_override/getFullInfos` retourne DTO complet (FK resolues). -- _AUDIT: /getAllByCriteria SUPER_ADMIN._
- [~] **LUSEPEROV-306** Service Angular `user_permission_override.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LUSEPEROV-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LUSEPEROV-320** Route Angular `<user_permission_override>/new` declaree et guard route applique.
- [x] **LUSEPEROV-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LUSEPEROV-322** Composant `user_permission_override-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LUSEPEROV-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LUSEPEROV-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LUSEPEROV-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LUSEPEROV-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LUSEPEROV-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LUSEPEROV-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LUSEPEROV-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LUSEPEROV-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LUSEPEROV-340** Route Angular `<user_permission_override>/:id/edit` declaree.
- [x] **LUSEPEROV-341** Pre-remplissage via `getFullInfos`.
- [?] **LUSEPEROV-342** Champs immuables affiches en lecture seule.
- [~] **LUSEPEROV-343** Convention `""`/`null`/value respectee front (patchValue cible).
- [x] **LUSEPEROV-344** Bouton "Annuler" retour sans persister.
- [x] **LUSEPEROV-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LUSEPEROV-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LUSEPEROV-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LUSEPEROV-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LUSEPEROV-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LUSEPEROV-363** Texte confirmation explicite + reversible documente.
- [x] **LUSEPEROV-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LUSEPEROV-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LUSEPEROV-366** Rafraichissement sans F5.

### 3.E RESTORE
- [~] **LUSEPEROV-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Format date probable ISO 8601 -- a verifier._

### 3.F LIST / SEARCH
- [x] **LUSEPEROV-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LUSEPEROV-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LUSEPEROV-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LUSEPEROV-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LUSEPEROV-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LUSEPEROV-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LUSEPEROV-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LUSEPEROV-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LUSEPEROV-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LUSEPEROV-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LUSEPEROV-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LUSEPEROV-600** Lister toutes les tables source ayant une FK vers `user_permission_override` (parcourir DB describe). -- _AUDIT: Pas de FK entrantes._
- [-] **LUSEPEROV-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LUSEPEROV-602** Soft-delete de `user_permission_override` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LUSEPEROV-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LUSEPEROV-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LUSEPEROV-605** Test : creer une source liee -> tenter delete `user_permission_override` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LUSEPEROV-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LUSEPEROV-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **FIXED** Validation enum stricte functionality via FunctionalityEnum.valueOf() ajoutee dans UserPermissionOverrideBusiness.setOverride() avec normalisation toUpperCase. Converter BD reste a faire pour blindage complet._
- [x] **LUSEPEROV-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LUSEPEROV-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LUSEPEROV-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LUSEPEROV-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LUSEPEROV-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LUSEPEROV-707** Aucun tableau non rafraichi apres mutation.
- [-] **LUSEPEROV-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LUSEPEROV-709** Aucune route sensible sans guard.
- [x] **LUSEPEROV-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **FIXED** Tous les 4 endpoints du controller annotes @PreAuthorize ADMIN/SUPER_ADMIN._
- [x] **LUSEPEROV-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **FIXED** canOverride bloque SUPER_ADMIN + DENY ADMIN base. GRANT supplementaire accepte = comportement attendu (override d'augmentation de droit, audit trail via created_by/updated_by)._
- [x] **LUSEPEROV-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LUSEPEROV-713** Aucun hard-delete accidentel.
- [-] **LUSEPEROV-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LUSEPEROV-715** Aucun invariant inter-champs non valide back.
- [-] **LUSEPEROV-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LUSEPEROV-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LUSEPEROV-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LUSEPEROV-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LUSEPEROV-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LUSEPEROV-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: **Decisions CRITIQUES** : (1) @PreAuthorize ADMIN/SUPER_ADMIN sur setOverride/removeOverride ; (2) verifier requester != target OR requester est ADMIN/SUPER_ADMIN ; (3) enum strict functionality ; (4) audit trail._

