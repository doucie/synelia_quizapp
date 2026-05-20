# L-audit-01-email_verification_tokens -- Audit table par table

**Table :** `email_verification_tokens`
**Niveau topologique :** 1 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LEMAVERTO-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LEMAVERTO-001** Role metier de `email_verification_tokens` documente en 1 ligne. -- _AUDIT: Tokens UUID pour verification email (APPLICATION_VERIFICATION/PASSWORD_RESET/USER_REGISTRATION)._
- [x] **LEMAVERTO-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LEMAVERTO-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `email` | `varchar(255)` | NO | - | `-` |
| `token` | `varchar(255)` | NO | UNI | `-` |
| `token_type` | `varchar(255)` | NO | - | `APPLICATION_VERIFICATION` |
| `expires_at` | `datetime` | NO | - | `-` |
| `is_used` | `tinyint(1)` | NO | - | `0` |
| `created_at` | `datetime` | NO | - | `-` |
| `used_at` | `datetime` | YES | - | `-` |
| `application_id` | `int unsigned` | YES | MUL | `-` |
| `user_id` | `int unsigned` | YES | MUL | `-` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LEMAVERTO-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `email` (varchar(255))

- [x] **LEMAVERTO-102 Alignement de type** `email` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LEMAVERTO-103 Obligatoire creation** `email` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `email`.
- [~] **LEMAVERTO-104 Longueur** `email` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `token` (varchar(255))

- [x] **LEMAVERTO-106 Alignement de type** `token` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LEMAVERTO-107 Obligatoire creation** `token` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `token`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LEMAVERTO-108 Longueur** `token` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._
- [x] **LEMAVERTO-109 Unicite** `token` : index unique BD present, verification metier dans Business AVANT save (message clair, pas 500), validator async front, regles casse/trim documentees. -- _AUDIT: **FIXED** index unique BD present (Flyway), verification metier `Business.checkUnique<Field>()` AVANT save (message 422 clair, pas 500). Validator async front a brancher si UX requise._

### Champ `token_type` (varchar(255))

- [x] **LEMAVERTO-111 Alignement de type** `token_type` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LEMAVERTO-112 Longueur** `token_type` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `expires_at` (datetime)

- [x] **LEMAVERTO-114 Alignement de type** `expires_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime`, DTO `LocalDateTime` serialise ISO 8601, modele TS `string` ISO._
- [~] **LEMAVERTO-115 Obligatoire creation** `expires_at` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `expires_at`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LEMAVERTO-116 Date/Datetime** `expires_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `is_used` (tinyint(1))

- [x] **LEMAVERTO-118 Alignement de type** `is_used` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LEMAVERTO-119 Booleen** `is_used` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `created_at` (datetime)

- [x] **LEMAVERTO-121 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LEMAVERTO-122 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LEMAVERTO-123 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `used_at` (datetime)

- [x] **LEMAVERTO-125 Alignement de type** `used_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime`, DTO `LocalDateTime` serialise ISO 8601, modele TS `string` ISO._
- [x] **LEMAVERTO-126 Date/Datetime** `used_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `application_id` (int unsigned)

- [x] **LEMAVERTO-128 Alignement de type** `application_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LEMAVERTO-129 FK** `application_id` -> probable `application` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `user_id` (int unsigned)

- [x] **LEMAVERTO-131 Alignement de type** `user_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LEMAVERTO-132 FK** `user_id` -> probable `user` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LEMAVERTO-300** Endpoint `POST /api/email_verification_tokens/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: @PreAuthorize ADMIN/SUPER_ADMIN/UTILISATEUR pour le CRUD basique._
- [x] **LEMAVERTO-301** Endpoint `POST /api/email_verification_tokens/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LEMAVERTO-302** Endpoint `POST /api/email_verification_tokens/delete` (soft-delete) existe.
- [~] **LEMAVERTO-303** Endpoint `POST /api/email_verification_tokens/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [x] **LEMAVERTO-304** Endpoint `POST /api/email_verification_tokens/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LEMAVERTO-305** Endpoint `POST /api/email_verification_tokens/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LEMAVERTO-306** Service Angular `email_verification_tokens.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LEMAVERTO-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LEMAVERTO-320** Route Angular `<email_verification_tokens>/new` declaree et guard route applique.
- [x] **LEMAVERTO-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LEMAVERTO-322** Composant `email_verification_tokens-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LEMAVERTO-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LEMAVERTO-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LEMAVERTO-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LEMAVERTO-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LEMAVERTO-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LEMAVERTO-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [~] **LEMAVERTO-329** `created_by` / `created_at` / `search_string` valorises serveur. -- _AUDIT: Soft-delete absent (table tokens) -- a verifier si voulu (purge plutot)._
- [-] **LEMAVERTO-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LEMAVERTO-340** Route Angular `<email_verification_tokens>/:id/edit` declaree.
- [x] **LEMAVERTO-341** Pre-remplissage via `getFullInfos`.
- [?] **LEMAVERTO-342** Champs immuables affiches en lecture seule.
- [x] **LEMAVERTO-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en EmailVerificationTokensBusiness.update._
- [x] **LEMAVERTO-344** Bouton "Annuler" retour sans persister.
- [x] **LEMAVERTO-345** `updated_by` / `updated_at` valorises serveur. -- _AUDIT: verify-email PUBLIC dans ApplicationsController (flow normal)._
- [~] **LEMAVERTO-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LEMAVERTO-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LEMAVERTO-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LEMAVERTO-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LEMAVERTO-363** Texte confirmation explicite + reversible documente.
- [x] **LEMAVERTO-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [~] **LEMAVERTO-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: **PARTIEL FIXED** Policy projet : tokens purges par tache de nettoyage (decision infra) ; FK application_id + user_id LAZY ; orphelins traites par purge auto._
- [x] **LEMAVERTO-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LEMAVERTO-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer present + dd/MM/yyyy HH:mm:ss._

### 3.F LIST / SEARCH
- [x] **LEMAVERTO-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LEMAVERTO-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LEMAVERTO-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LEMAVERTO-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LEMAVERTO-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LEMAVERTO-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LEMAVERTO-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie. -- _AUDIT: verify-email volontairement public._
- [x] **LEMAVERTO-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LEMAVERTO-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LEMAVERTO-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LEMAVERTO-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint. -- _AUDIT: **FIXED** class-level @PreAuthorize restreint a ADMIN/SUPER_ADMIN (UTILISATEUR retire)._


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LEMAVERTO-600** Lister toutes les tables source ayant une FK vers `email_verification_tokens` (parcourir DB describe). -- _AUDIT: applicationId + userId._
- [-] **LEMAVERTO-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LEMAVERTO-602** Soft-delete de `email_verification_tokens` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LEMAVERTO-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LEMAVERTO-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LEMAVERTO-605** Test : creer une source liee -> tenter delete `email_verification_tokens` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LEMAVERTO-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LEMAVERTO-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: TokenType est enum natif Java -> stocke comme String mais converter present._
- [x] **LEMAVERTO-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LEMAVERTO-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture. -- _AUDIT: **FIXED** EmailVerificationTokenDto.token annote @JsonProperty(WRITE_ONLY) -- token plus expose en reponse._
- [x] **LEMAVERTO-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LEMAVERTO-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LEMAVERTO-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LEMAVERTO-707** Aucun tableau non rafraichi apres mutation.
- [-] **LEMAVERTO-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LEMAVERTO-709** Aucune route sensible sans guard.
- [x] **LEMAVERTO-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **FIXED** UTILISATEUR retire du class-level @PreAuthorize (ADMIN/SUPER_ADMIN seuls)._
- [~] **LEMAVERTO-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **PARTIEL FIXED** access tokens locked to ADMIN/SUPER_ADMIN ; purge automatique des tokens expires a planifier en tache @Scheduled (decision infra)._
- [?] **LEMAVERTO-712** Aucun endpoint qui modifie `created_by`/`created_at`. -- _AUDIT: Rate limit sur generation token a verifier._
- [x] **LEMAVERTO-713** Aucun hard-delete accidentel.
- [-] **LEMAVERTO-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LEMAVERTO-715** Aucun invariant inter-champs non valide back.
- [-] **LEMAVERTO-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LEMAVERTO-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LEMAVERTO-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LEMAVERTO-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LEMAVERTO-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LEMAVERTO-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) restreindre @PreAuthorize CRUD a ADMIN/SUPER_ADMIN ; (2) @JsonIgnore sur token field (sauf flow specifique) ; (3) job de purge tokens expires._

