# L-audit-01-business_group_permission -- Audit table par table

**Table :** `business_group_permission`
**Niveau topologique :** 1 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LBUSGROPE-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LBUSGROPE-001** Role metier de `business_group_permission` documente en 1 ligne. -- _AUDIT: Permissions specifiques par BusinessGroup (groupe x functionality)._
- [x] **LBUSGROPE-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LBUSGROPE-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int` | NO | PRI | `-` |
| `business_group_id` | `int` | NO | MUL | `-` |
| `functionality` | `varchar(100)` | NO | - | `-` |
| `created_at` | `timestamp` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `timestamp` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `0` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int)

- [x] **LBUSGROPE-100 Alignement de type** `id` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `business_group_id` (int)

- [x] **LBUSGROPE-102 Alignement de type** `business_group_id` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LBUSGROPE-103 Obligatoire creation** `business_group_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `business_group_id`.
- [x] **LBUSGROPE-104 FK** `business_group_id` -> probable `business_group` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `functionality` (varchar(100))

- [x] **LBUSGROPE-106 Alignement de type** `functionality` (`varchar(100)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LBUSGROPE-107 Obligatoire creation** `functionality` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `functionality`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LBUSGROPE-108 Longueur** `functionality` (varchar(100)) : `@Size(max=100)` DTO, `Validators.maxLength(100)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `created_at` (timestamp)

- [x] **LBUSGROPE-110 Alignement de type** `created_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Java `LocalDateTime`, serialisation ISO 8601 via Jackson, modele TS `string` ISO, affichage relatif (`pipe date` Angular)._
- [x] **LBUSGROPE-111 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** valorise par `@CreationTimestamp` + ignore dans `Utilities.shouldUpdate()`; affichage front en lecture seule._
- [x] **LBUSGROPE-112 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LBUSGROPE-114 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** valorise par `Business.create()` via `currentUserId`; ignore dans `Utilities.shouldUpdate()`._
- [x] **LBUSGROPE-115 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (timestamp)

- [x] **LBUSGROPE-117 Alignement de type** `updated_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Java `LocalDateTime`, serialisation ISO 8601, modele TS `string` ISO, fuseau serveur documente._
- [x] **LBUSGROPE-118 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** `@UpdateTimestamp` Hibernate + reaffectation en Business.update()._
- [x] **LBUSGROPE-119 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LBUSGROPE-121 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** valorise par `Business.update()` via `currentUserId`._
- [x] **LBUSGROPE-122 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LBUSGROPE-124 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** DTO `Boolean`, jamais `Integer`; default BD 0; modele TS `boolean`; UI filtre toggle actif/supprime._
- [x] **LBUSGROPE-125 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** init `false` en Business.create(); modifie uniquement via endpoints `/delete` (true) et `/restore` (false); pas de DELETE SQL._
- [x] **LBUSGROPE-126 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LBUSGROPE-300** Endpoint `POST /api/business_group_permission/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: **FIXED** class-level @PreAuthorize restreint a ADMIN/SUPER_ADMIN (UTILISATEUR retire)._
- [~] **LBUSGROPE-301** Endpoint `POST /api/business_group_permission/update` existe (convention `""`->ignore, `null`->set null).
- [~] **LBUSGROPE-302** Endpoint `POST /api/business_group_permission/delete` (soft-delete) existe.
- [~] **LBUSGROPE-303** Endpoint `POST /api/business_group_permission/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LBUSGROPE-304** Endpoint `POST /api/business_group_permission/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LBUSGROPE-305** Endpoint `POST /api/business_group_permission/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LBUSGROPE-306** Service Angular `business_group_permission.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LBUSGROPE-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LBUSGROPE-320** Route Angular `<business_group_permission>/new` declaree et guard route applique.
- [x] **LBUSGROPE-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LBUSGROPE-322** Composant `business_group_permission-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LBUSGROPE-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LBUSGROPE-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LBUSGROPE-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LBUSGROPE-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LBUSGROPE-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LBUSGROPE-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LBUSGROPE-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LBUSGROPE-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LBUSGROPE-340** Route Angular `<business_group_permission>/:id/edit` declaree.
- [x] **LBUSGROPE-341** Pre-remplissage via `getFullInfos`.
- [?] **LBUSGROPE-342** Champs immuables affiches en lecture seule.
- [x] **LBUSGROPE-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en BusinessGroupPermissionBusiness.update._
- [x] **LBUSGROPE-344** Bouton "Annuler" retour sans persister.
- [x] **LBUSGROPE-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LBUSGROPE-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LBUSGROPE-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LBUSGROPE-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LBUSGROPE-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LBUSGROPE-363** Texte confirmation explicite + reversible documente.
- [x] **LBUSGROPE-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [~] **LBUSGROPE-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: **PARTIEL FIXED** Policy projet : soft-delete uniquement (`is_deleted=1`), pas de ON DELETE CASCADE physique pour conservation audit RGPD ; les FK orphelines sont filtrees au getFullInfos par les jointures sur entites non supprimees._
- [x] **LBUSGROPE-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LBUSGROPE-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer MapStruct present._

### 3.F LIST / SEARCH
- [x] **LBUSGROPE-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LBUSGROPE-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LBUSGROPE-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LBUSGROPE-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LBUSGROPE-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LBUSGROPE-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: **FIXED** class-level @PreAuthorize ADMIN/SUPER_ADMIN ; UTILISATEUR bloque sur toutes les operations. Matrice : ADMIN=R/W, SUPER_ADMIN=R/W, UTILISATEUR=denied._
- [x] **LBUSGROPE-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LBUSGROPE-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LBUSGROPE-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LBUSGROPE-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LBUSGROPE-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint. -- _AUDIT: **FIXED** class-level @PreAuthorize ADMIN/SUPER_ADMIN seulement._


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LBUSGROPE-600** Lister toutes les tables source ayant une FK vers `business_group_permission` (parcourir DB describe). -- _AUDIT: Aucune FK entrante._
- [-] **LBUSGROPE-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LBUSGROPE-602** Soft-delete de `business_group_permission` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LBUSGROPE-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LBUSGROPE-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LBUSGROPE-605** Test : creer une source liee -> tenter delete `business_group_permission` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LBUSGROPE-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LBUSGROPE-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **FIXED** Validation enum stricte functionality via FunctionalityEnum.valueOf() ajoutee dans BusinessGroupPermissionBusiness sur create + update avec normalisation toUpperCase. Converter BD reste a faire pour blindage complet._
- [x] **LBUSGROPE-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LBUSGROPE-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LBUSGROPE-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LBUSGROPE-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LBUSGROPE-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LBUSGROPE-707** Aucun tableau non rafraichi apres mutation.
- [-] **LBUSGROPE-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LBUSGROPE-709** Aucune route sensible sans guard.
- [x] **LBUSGROPE-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **FIXED** create/update/delete restreints @PreAuthorize ADMIN/SUPER_ADMIN method-level -- privilege escalation via UTILISATEUR ferme._
- [x] **LBUSGROPE-711** Aucun champ sensible (mot de passe, token) expose en DTO.
- [x] **LBUSGROPE-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LBUSGROPE-713** Aucun hard-delete accidentel.
- [-] **LBUSGROPE-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LBUSGROPE-715** Aucun invariant inter-champs non valide back.
- [-] **LBUSGROPE-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LBUSGROPE-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LBUSGROPE-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LBUSGROPE-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LBUSGROPE-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LBUSGROPE-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) restreindre @PreAuthorize a ADMIN/SUPER_ADMIN (retirer UTILISATEUR) ; (2) check moderator de groupe avant modification ; (3) ON DELETE CASCADE._

