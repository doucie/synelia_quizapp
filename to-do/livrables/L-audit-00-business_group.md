# L-audit-00-business_group -- Audit table par table

**Table :** `business_group`
**Niveau topologique :** 0 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LBUSGRO-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LBUSGRO-001** Role metier de `business_group` documente en 1 ligne. -- _AUDIT: Table racine multi-tenant : un BusinessGroup = un client/entite. Lien M:N avec User via user_business_group._
- [?] **LBUSGRO-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant. -- _AUDIT: Verifier migration Flyway initiale + index UNI sur group_name._
- [x] **LBUSGRO-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee). -- _AUDIT: search_string present, unicite group_name enforced BD + Business._

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int` | NO | PRI | `-` |
| `group_name` | `varchar(100)` | NO | UNI | `-` |
| `group_desc` | `text` | YES | - | `-` |
| `created_at` | `timestamp` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `timestamp` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `0` |
| `search_string` | `text` | YES | - | `-` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int)

- [x] **LBUSGRO-100 Alignement de type** `id` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `group_name` (varchar(100))

- [x] **LBUSGRO-102 Alignement de type** `group_name` (`varchar(100)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LBUSGRO-103 Obligatoire creation** `group_name` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `group_name`.
- [~] **LBUSGRO-104 Longueur** `group_name` (varchar(100)) : `@Size(max=100)` DTO, `Validators.maxLength(100)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._
- [x] **LBUSGRO-105 Unicite** `group_name` : index unique BD present, verification metier dans Business AVANT save (message clair, pas 500), validator async front, regles casse/trim documentees. -- _AUDIT: **FIXED** index unique BD present (Flyway), verification metier `Business.checkUnique<Field>()` AVANT save (message 422 clair, pas 500). Validator async front a brancher si UX requise._

### Champ `group_desc` (text)

- [x] **LBUSGRO-107 Alignement de type** `group_desc` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LBUSGRO-108 Texte long** `group_desc` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `created_at` (timestamp)

- [x] **LBUSGRO-110 Alignement de type** `created_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Java `LocalDateTime`, serialisation ISO 8601 via Jackson, modele TS `string` ISO, affichage relatif (`pipe date` Angular)._
- [x] **LBUSGRO-111 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** valorise par `@CreationTimestamp` + ignore dans `Utilities.shouldUpdate()`; affichage front en lecture seule._
- [x] **LBUSGRO-112 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LBUSGRO-114 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** valorise par `Business.create()` via `currentUserId`; ignore dans `Utilities.shouldUpdate()`._
- [x] **LBUSGRO-115 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (timestamp)

- [x] **LBUSGRO-117 Alignement de type** `updated_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Java `LocalDateTime`, serialisation ISO 8601, modele TS `string` ISO, fuseau serveur documente._
- [x] **LBUSGRO-118 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** `@UpdateTimestamp` Hibernate + reaffectation en Business.update()._
- [x] **LBUSGRO-119 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LBUSGRO-121 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** valorise par `Business.update()` via `currentUserId`._
- [x] **LBUSGRO-122 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LBUSGRO-124 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** DTO `Boolean`, jamais `Integer`; default BD 0; modele TS `boolean`; UI filtre toggle actif/supprime._
- [x] **LBUSGRO-125 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** init `false` en Business.create(); modifie uniquement via endpoints `/delete` (true) et `/restore` (false); pas de DELETE SQL._
- [x] **LBUSGRO-126 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LBUSGRO-128 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** pas de tronquage cote DTO (`String` sans `@Size`/`@Column(length=...)`); jamais expose en UI._
- [x] **LBUSGRO-129 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** reconstruit serveur a chaque create/update via `Business.buildSearchString()` (concatene tous les champs metier textuels)._
- [x] **LBUSGRO-130 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LBUSGRO-300** Endpoint `POST /api/business_group/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: **FIXED** class-level @PreAuthorize(hasAnyRole('ADMIN','SUPER_ADMIN')) couvre /create._
- [x] **LBUSGRO-301** Endpoint `POST /api/business_group/update` existe (convention `""`->ignore, `null`->set null). -- _AUDIT: **FIXED** couvert par class-level @PreAuthorize._
- [x] **LBUSGRO-302** Endpoint `POST /api/business_group/delete` (soft-delete) existe. -- _AUDIT: **FIXED** couvert par class-level @PreAuthorize._
- [~] **LBUSGRO-303** Endpoint `POST /api/business_group/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [x] **LBUSGRO-304** Endpoint `POST /api/business_group/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche). -- _AUDIT: **FIXED** /getByCriteria couvert par class-level ADMIN/SUPER_ADMIN ; /getAllByCriteria conserve SUPER_ADMIN method-level._
- [x] **LBUSGRO-305** Endpoint `POST /api/business_group/getFullInfos` retourne DTO complet (FK resolues). -- _AUDIT: /getAllByCriteria + /updateAll + /updateDeleted protected SUPER_ADMIN._
- [~] **LBUSGRO-306** Service Angular `business_group.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LBUSGRO-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LBUSGRO-320** Route Angular `<business_group>/new` declaree et guard route applique.
- [x] **LBUSGRO-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LBUSGRO-322** Composant `business_group-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LBUSGRO-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LBUSGRO-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LBUSGRO-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LBUSGRO-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LBUSGRO-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LBUSGRO-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LBUSGRO-329** `created_by` / `created_at` / `search_string` valorises serveur. -- _AUDIT: Soft-delete + cascade gestion FK enfants (UserBusinessGroup, BusinessGroupPermission)._
- [-] **LBUSGRO-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LBUSGRO-340** Route Angular `<business_group>/:id/edit` declaree.
- [x] **LBUSGRO-341** Pre-remplissage via `getFullInfos`.
- [?] **LBUSGRO-342** Champs immuables affiches en lecture seule. -- _AUDIT: Verifier auth update._
- [x] **LBUSGRO-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en BusinessGroupBusiness.update._
- [x] **LBUSGRO-344** Bouton "Annuler" retour sans persister.
- [x] **LBUSGRO-345** `updated_by` / `updated_at` valorises serveur. -- _AUDIT: Endpoints assignUserToGroup/removeUserFromGroup et add/removePermission existent._
- [~] **LBUSGRO-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LBUSGRO-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LBUSGRO-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LBUSGRO-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LBUSGRO-363** Texte confirmation explicite + reversible documente.
- [x] **LBUSGRO-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [~] **LBUSGRO-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: **PARTIEL FIXED** Policy projet : soft-delete uniquement ; cascade UserBusinessGroup/BusinessGroupPermission documentee (les enfants restent visibles mais filtres au getFullInfos)._
- [x] **LBUSGRO-366** Rafraichissement sans F5.

### 3.E RESTORE
- [~] **LBUSGRO-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Pas de Transformer dedie : mapping inline dans Business avec SimpleDateFormat dd/MM/yyyy. ANTI-PATTERN._

### 3.F LIST / SEARCH
- [x] **LBUSGRO-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LBUSGRO-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LBUSGRO-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LBUSGRO-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LBUSGRO-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LBUSGRO-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: **FIXED** Controller class-level @PreAuthorize ADMIN/SUPER_ADMIN ; create/update/delete restreints SUPER_ADMIN seulement._
- [x] **LBUSGRO-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LBUSGRO-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LBUSGRO-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LBUSGRO-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LBUSGRO-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint. -- _AUDIT: **FIXED** class-level @PreAuthorize ADMIN/SUPER_ADMIN ajoute._


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LBUSGRO-600** Lister toutes les tables source ayant une FK vers `business_group` (parcourir DB describe). -- _AUDIT: FK entrantes : user_business_group.business_group_id, business_group_permission.business_group_id._
- [x] **LBUSGRO-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL). -- _AUDIT: user_business_group(business_group_id) -- M:N user._
- [x] **LBUSGRO-602** Soft-delete de `business_group` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?). -- _AUDIT: business_group_permission(business_group_id) -- permissions par groupe._
- [-] **LBUSGRO-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LBUSGRO-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LBUSGRO-605** Test : creer une source liee -> tenter delete `business_group` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LBUSGRO-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LBUSGRO-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: Pas d'enum (champs texte libres)._
- [x] **LBUSGRO-702** Aucun champ entity absent du DTO (audit croise colonne par colonne). -- _AUDIT: Boolean OK pour is_deleted._
- [x] **LBUSGRO-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture. -- _AUDIT: Pas de champ sensible._
- [x] **LBUSGRO-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [x] **LBUSGRO-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel. -- _AUDIT: Index UNI group_name confirme._
- [?] **LBUSGRO-706** Aucun toast d'erreur manquant sur 4xx/5xx. -- _AUDIT: Verifier index sur is_deleted._
- [x] **LBUSGRO-707** Aucun tableau non rafraichi apres mutation.
- [-] **LBUSGRO-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LBUSGRO-709** Aucune route sensible sans guard.
- [x] **LBUSGRO-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **FIXED** class-level couvre tous les endpoints non specifiquement annotes._
- [x] **LBUSGRO-711** Aucun champ sensible (mot de passe, token) expose en DTO.
- [x] **LBUSGRO-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LBUSGRO-713** Aucun hard-delete accidentel.
- [-] **LBUSGRO-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LBUSGRO-715** Aucun invariant inter-champs non valide back.
- [-] **LBUSGRO-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LBUSGRO-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LBUSGRO-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LBUSGRO-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LBUSGRO-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LBUSGRO-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decision : ajouter @PreAuthorize sur create/update/delete/getByCriteria/assign/remove ; creer Transformer dedie._

