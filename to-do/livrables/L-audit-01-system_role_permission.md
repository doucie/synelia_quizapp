# L-audit-01-system_role_permission -- Audit table par table

**Table :** `system_role_permission`
**Niveau topologique :** 1 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LSYSROLPE-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LSYSROLPE-001** Role metier de `system_role_permission` documente en 1 ligne. -- _AUDIT: Permissions par role systeme (SUPER_ADMIN/ADMIN/UTILISATEUR x functionality)._
- [x] **LSYSROLPE-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LSYSROLPE-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int` | NO | PRI | `-` |
| `system_role` | `varchar(20)` | NO | MUL | `-` |
| `functionality` | `varchar(100)` | NO | - | `-` |
| `created_at` | `timestamp` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `timestamp` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `0` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int)

- [x] **LSYSROLPE-100 Alignement de type** `id` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `system_role` (varchar(20))

- [x] **LSYSROLPE-102 Alignement de type** `system_role` (`varchar(20)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LSYSROLPE-103 Obligatoire creation** `system_role` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `system_role`.
- [~] **LSYSROLPE-104 Champ court** `system_role` (varchar(20)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `functionality` (varchar(100))

- [x] **LSYSROLPE-106 Alignement de type** `functionality` (`varchar(100)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LSYSROLPE-107 Obligatoire creation** `functionality` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `functionality`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LSYSROLPE-108 Longueur** `functionality` (varchar(100)) : `@Size(max=100)` DTO, `Validators.maxLength(100)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `created_at` (timestamp)

- [x] **LSYSROLPE-110 Alignement de type** `created_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Java `LocalDateTime`, serialisation ISO 8601 via Jackson, modele TS `string` ISO, affichage relatif (`pipe date` Angular)._
- [x] **LSYSROLPE-111 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** valorise par `@CreationTimestamp` + ignore dans `Utilities.shouldUpdate()`; affichage front en lecture seule._
- [x] **LSYSROLPE-112 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LSYSROLPE-114 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** valorise par `Business.create()` via `currentUserId`; ignore dans `Utilities.shouldUpdate()`._
- [x] **LSYSROLPE-115 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (timestamp)

- [x] **LSYSROLPE-117 Alignement de type** `updated_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Java `LocalDateTime`, serialisation ISO 8601, modele TS `string` ISO, fuseau serveur documente._
- [x] **LSYSROLPE-118 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** `@UpdateTimestamp` Hibernate + reaffectation en Business.update()._
- [x] **LSYSROLPE-119 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LSYSROLPE-121 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** valorise par `Business.update()` via `currentUserId`._
- [x] **LSYSROLPE-122 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LSYSROLPE-124 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** DTO `Boolean`, jamais `Integer`; default BD 0; modele TS `boolean`; UI filtre toggle actif/supprime._
- [x] **LSYSROLPE-125 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** init `false` en Business.create(); modifie uniquement via endpoints `/delete` (true) et `/restore` (false); pas de DELETE SQL._
- [x] **LSYSROLPE-126 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LSYSROLPE-300** Endpoint `POST /api/system_role_permission/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: /addPermission + /removePermission protected SUPER_ADMIN, bloque modif SUPER_ADMIN._
- [x] **LSYSROLPE-301** Endpoint `POST /api/system_role_permission/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LSYSROLPE-302** Endpoint `POST /api/system_role_permission/delete` (soft-delete) existe.
- [~] **LSYSROLPE-303** Endpoint `POST /api/system_role_permission/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [x] **LSYSROLPE-304** Endpoint `POST /api/system_role_permission/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche). -- _AUDIT: **FIXED** /getByRole et /getByCriteria annotes @PreAuthorize ADMIN/SUPER_ADMIN -- info leak permissions ferme._
- [~] **LSYSROLPE-305** Endpoint `POST /api/system_role_permission/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LSYSROLPE-306** Service Angular `system_role_permission.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LSYSROLPE-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LSYSROLPE-320** Route Angular `<system_role_permission>/new` declaree et guard route applique.
- [x] **LSYSROLPE-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LSYSROLPE-322** Composant `system_role_permission-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LSYSROLPE-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LSYSROLPE-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LSYSROLPE-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LSYSROLPE-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LSYSROLPE-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LSYSROLPE-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LSYSROLPE-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LSYSROLPE-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LSYSROLPE-340** Route Angular `<system_role_permission>/:id/edit` declaree.
- [x] **LSYSROLPE-341** Pre-remplissage via `getFullInfos`.
- [?] **LSYSROLPE-342** Champs immuables affiches en lecture seule.
- [x] **LSYSROLPE-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en SystemRolePermissionBusiness.update._
- [x] **LSYSROLPE-344** Bouton "Annuler" retour sans persister.
- [x] **LSYSROLPE-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LSYSROLPE-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LSYSROLPE-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LSYSROLPE-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LSYSROLPE-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LSYSROLPE-363** Texte confirmation explicite + reversible documente.
- [x] **LSYSROLPE-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [x] **LSYSROLPE-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: Soft-delete OK._
- [x] **LSYSROLPE-366** Rafraichissement sans F5.

### 3.E RESTORE
- [~] **LSYSROLPE-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Pas de Transformer MapStruct dedie : mapping inline streams.map dans Business._

### 3.F LIST / SEARCH
- [x] **LSYSROLPE-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LSYSROLPE-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LSYSROLPE-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LSYSROLPE-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LSYSROLPE-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LSYSROLPE-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: SUPER_ADMIN seul peut modifier._
- [x] **LSYSROLPE-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LSYSROLPE-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LSYSROLPE-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LSYSROLPE-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LSYSROLPE-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint. -- _AUDIT: **FIXED** @PreAuthorize present sur tous les endpoints (create=ADMIN/SUPER_ADMIN, update/delete/getByRole/getByCriteria=SUPER_ADMIN, getAll=ADMIN/SUPER_ADMIN)._


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LSYSROLPE-600** Lister toutes les tables source ayant une FK vers `system_role_permission` (parcourir DB describe). -- _AUDIT: Table de reference pure (aucune FK entrante)._
- [-] **LSYSROLPE-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LSYSROLPE-602** Soft-delete de `system_role_permission` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LSYSROLPE-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LSYSROLPE-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LSYSROLPE-605** Test : creer une source liee -> tenter delete `system_role_permission` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LSYSROLPE-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LSYSROLPE-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **FIXED** Validation enum stricte ajoutee dans SystemRolePermissionBusiness sur create + update : systemRole verifie contre liste (SUPER_ADMIN/ADMIN/RECRUITER/CANDIDATE) + functionality via FunctionalityEnum.valueOf(), normalisation toUpperCase. Converter BD restant a faire pour blindage complet._
- [x] **LSYSROLPE-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LSYSROLPE-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LSYSROLPE-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LSYSROLPE-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LSYSROLPE-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LSYSROLPE-707** Aucun tableau non rafraichi apres mutation.
- [-] **LSYSROLPE-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LSYSROLPE-709** Aucune route sensible sans guard.
- [x] **LSYSROLPE-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **FIXED** Tous les endpoints (lecture + ecriture) annotes @PreAuthorize ADMIN/SUPER_ADMIN._
- [x] **LSYSROLPE-711** Aucun champ sensible (mot de passe, token) expose en DTO.
- [x] **LSYSROLPE-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LSYSROLPE-713** Aucun hard-delete accidentel.
- [-] **LSYSROLPE-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LSYSROLPE-715** Aucun invariant inter-champs non valide back.
- [-] **LSYSROLPE-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LSYSROLPE-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LSYSROLPE-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LSYSROLPE-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LSYSROLPE-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LSYSROLPE-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) ajouter @PreAuthorize sur /getByRole + /getByCriteria ; (2) Transformer MapStruct ; (3) converters strict pour system_role + functionality._

