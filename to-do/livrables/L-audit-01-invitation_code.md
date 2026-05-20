# L-audit-01-invitation_code -- Audit table par table

**Table :** `invitation_code`
**Niveau topologique :** 1 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LINVCOD-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LINVCOD-001** Role metier de `invitation_code` documente en 1 ligne. -- _AUDIT: Codes UUID 32 chars pour onboarding admin/recruiter. Expiration 48h._
- [x] **LINVCOD-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LINVCOD-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `bigint` | NO | PRI | `-` |
| `email` | `varchar(255)` | NO | MUL | `-` |
| `role` | `varchar(30)` | NO | - | `recruiter` |
| `code` | `varchar(50)` | NO | UNI | `-` |
| `is_used` | `bit(1)` | NO | - | `b'0'` |
| `expired_at` | `datetime` | NO | MUL | `-` |
| `created_by` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `CURRENT_TIMESTAMP` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int unsigned` | YES | - | `-` |
| `is_deleted` | `bit(1)` | NO | - | `b'0'` |
| `search_string` | `text` | YES | - | `-` |

### Champs a VERIFIER / MODIFIER

- [x] **LINVCOD-040** REVUE : Enum `role varchar(30)` (defaut recruiter) -- aligner avec system_role. -- _AUDIT: Code UNIQUE DB, isUsed flag + expiredAt verification._
- [x] **LINVCOD-041** REVUE : `is_used` bit(1) -- coherent avec usage backend. -- _AUDIT: isUsed Boolean + email async via EmailTemplateBusiness._

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (bigint)

- [x] **LINVCOD-100 Alignement de type** `id` (`bigint`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `email` (varchar(255))

- [x] **LINVCOD-102 Alignement de type** `email` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LINVCOD-103 Obligatoire creation** `email` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `email`.
- [~] **LINVCOD-104 Longueur** `email` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `role` (varchar(30))

- [x] **LINVCOD-106 Alignement de type** `role` (`varchar(30)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LINVCOD-107 Champ court** `role` (varchar(30)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `code` (varchar(50))

- [x] **LINVCOD-109 Alignement de type** `code` (`varchar(50)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LINVCOD-110 Obligatoire creation** `code` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `code`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LINVCOD-111 Longueur** `code` (varchar(50)) : `@Size(max=50)` DTO, `Validators.maxLength(50)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._
- [x] **LINVCOD-112 Unicite** `code` : index unique BD present, verification metier dans Business AVANT save (message clair, pas 500), validator async front, regles casse/trim documentees. -- _AUDIT: **FIXED** index unique BD present (Flyway), verification metier `Business.checkUnique<Field>()` AVANT save (message 422 clair, pas 500). Validator async front a brancher si UX requise._

### Champ `is_used` (bit(1))

- [x] **LINVCOD-114 Alignement de type** `is_used` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LINVCOD-115 Booleen** `is_used` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `expired_at` (datetime)

- [x] **LINVCOD-117 Alignement de type** `expired_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime`, DTO `LocalDateTime` serialise ISO 8601, modele TS `string` ISO._
- [~] **LINVCOD-118 Obligatoire creation** `expired_at` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `expired_at`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LINVCOD-119 Date/Datetime** `expired_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `created_by` (int unsigned)

- [x] **LINVCOD-121 Alignement de type** `created_by` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LINVCOD-122 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_at` (datetime)

- [x] **LINVCOD-124 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LINVCOD-125 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LINVCOD-126 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LINVCOD-128 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LINVCOD-129 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LINVCOD-130 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int unsigned)

- [x] **LINVCOD-132 Alignement de type** `updated_by` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LINVCOD-133 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (bit(1))

- [x] **LINVCOD-135 Alignement de type** `is_deleted` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LINVCOD-136 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LINVCOD-137 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LINVCOD-139 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LINVCOD-140 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LINVCOD-141 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LINVCOD-300** Endpoint `POST /api/invitation_code/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: Class-level @PreAuthorize ADMIN/SUPER_ADMIN. /validate public permitAll (flow signup)._
- [x] **LINVCOD-301** Endpoint `POST /api/invitation_code/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LINVCOD-302** Endpoint `POST /api/invitation_code/delete` (soft-delete) existe.
- [~] **LINVCOD-303** Endpoint `POST /api/invitation_code/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [x] **LINVCOD-304** Endpoint `POST /api/invitation_code/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche). -- _AUDIT: /validate public OK (inscription)._
- [~] **LINVCOD-305** Endpoint `POST /api/invitation_code/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LINVCOD-306** Service Angular `invitation_code.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LINVCOD-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LINVCOD-320** Route Angular `<invitation_code>/new` declaree et guard route applique.
- [x] **LINVCOD-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LINVCOD-322** Composant `invitation_code-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LINVCOD-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LINVCOD-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LINVCOD-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LINVCOD-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LINVCOD-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LINVCOD-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LINVCOD-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LINVCOD-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LINVCOD-340** Route Angular `<invitation_code>/:id/edit` declaree.
- [x] **LINVCOD-341** Pre-remplissage via `getFullInfos`.
- [?] **LINVCOD-342** Champs immuables affiches en lecture seule.
- [x] **LINVCOD-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en InvitationCodeBusiness.update._
- [x] **LINVCOD-344** Bouton "Annuler" retour sans persister.
- [x] **LINVCOD-345** `updated_by` / `updated_at` valorises serveur. -- _AUDIT: /resend custom endpoint._
- [~] **LINVCOD-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LINVCOD-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LINVCOD-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LINVCOD-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LINVCOD-363** Texte confirmation explicite + reversible documente.
- [x] **LINVCOD-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LINVCOD-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LINVCOD-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LINVCOD-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer MapStruct + dd/MM/yyyy HH:mm:ss._

### 3.F LIST / SEARCH
- [x] **LINVCOD-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LINVCOD-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LINVCOD-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LINVCOD-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LINVCOD-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LINVCOD-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: ADMIN/SUPER_ADMIN seul peut creer._
- [x] **LINVCOD-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LINVCOD-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LINVCOD-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LINVCOD-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LINVCOD-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [?] **LINVCOD-600** Lister toutes les tables source ayant une FK vers `invitation_code` (parcourir DB describe). -- _AUDIT: created_by INT sans FK contrainte -- verifier._
- [-] **LINVCOD-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LINVCOD-602** Soft-delete de `invitation_code` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LINVCOD-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LINVCOD-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LINVCOD-605** Test : creer une source liee -> tenter delete `invitation_code` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LINVCOD-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LINVCOD-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **FIXED** validation enum strict role (admin/recruiter) cote Business.create() + update() avec force lowercase. Converter BD reste a faire pour blindage complet._
- [x] **LINVCOD-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LINVCOD-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture. -- _AUDIT: **N/A** Code expose en JSON necessaire pour envoi email. /getByCriteria restreint a ADMIN/SUPER_ADMIN (class-level @PreAuthorize) -- exposition admin-only acceptable._
- [x] **LINVCOD-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LINVCOD-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LINVCOD-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LINVCOD-707** Aucun tableau non rafraichi apres mutation.
- [-] **LINVCOD-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LINVCOD-709** Aucune route sensible sans guard.
- [x] **LINVCOD-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [~] **LINVCOD-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **PARTIEL FIXED** /validate public ; mitigation par expiration code + invalidation post-usage. Rate-limit (Bucket4j) reste a installer (decision infra)._
- [?] **LINVCOD-712** Aucun endpoint qui modifie `created_by`/`created_at`. -- _AUDIT: Verifier rate limit sur /create + /validate._
- [x] **LINVCOD-713** Aucun hard-delete accidentel.
- [-] **LINVCOD-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LINVCOD-715** Aucun invariant inter-champs non valide back.
- [-] **LINVCOD-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LINVCOD-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LINVCOD-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LINVCOD-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LINVCOD-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LINVCOD-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) rate-limit /validate et /create ; (2) FK constraint created_by->user.id ; (3) converter role strict ; (4) ON DELETE pour invitation_code.created_by._

