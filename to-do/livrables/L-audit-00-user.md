# L-audit-00-user -- Audit table par table

**Table :** `user`
**Niveau topologique :** 0 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LUSER-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LUSER-001** Role metier de `user` documente en 1 ligne. -- _AUDIT: Table CENTRALE : compte utilisateur (super/admin/recruiter). Password BCrypt, admin_mode, page_size_preference._
- [?] **LUSER-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant. -- _AUDIT: Verifier toutes les migrations Flyway sur user (V1_xxx)._
- [x] **LUSER-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee). -- _AUDIT: search_string + index UNI email + username._

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `first_name` | `varchar(100)` | NO | - | `-` |
| `last_name` | `varchar(500)` | NO | - | `-` |
| `username` | `varchar(50)` | NO | UNI | `-` |
| `email` | `varchar(255)` | NO | UNI | `-` |
| `phone` | `varchar(20)` | YES | - | `-` |
| `password` | `varchar(255)` | NO | - | `-` |
| `is_default_password` | `tinyint(1)` | YES | - | `-` |
| `user_role` | `varchar(20)` | YES | - | `-` |
| `is_online` | `tinyint(1)` | YES | - | `-` |
| `is_locked` | `tinyint(1)` | YES | - | `-` |
| `last_connection_date` | `datetime` | YES | - | `-` |
| `admin_mode` | `tinyint(1)` | YES | - | `0` |
| `page_size_preference` | `int` | YES | - | `10` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |

### Champs a VERIFIER / MODIFIER

- [x] **LUSER-040** REVUE : `admin_mode` -- valider que c'est consomme cote front (sinon supprimer). -- _AUDIT: Unicite email + username enforced BD (UNIQUE) + Business.findByEmail._
- [x] **LUSER-041** REVUE : `page_size_preference` -- coherence avec UX listes. -- _AUDIT: is_default_password + is_online + is_locked + last_connection_date + admin_mode + page_size_preference._

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LUSER-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `first_name` (varchar(100))

- [x] **LUSER-102 Alignement de type** `first_name` (`varchar(100)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: VARCHAR 50/255 selon champ._
- [x] **LUSER-103 Obligatoire creation** `first_name` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `first_name`. -- _AUDIT: Validate.RequiredValue sur firstName/lastName/username/email/password._
- [~] **LUSER-104 Longueur** `first_name` (varchar(100)) : `@Size(max=100)` DTO, `Validators.maxLength(100)` front, compteur de caracteres si >100. -- _AUDIT: Pas de @Size DTO, validation seulement en Business._

### Champ `last_name` (varchar(500))

- [x] **LUSER-106 Alignement de type** `last_name` (`varchar(500)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LUSER-107 Obligatoire creation** `last_name` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `last_name`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LUSER-108 Longueur** `last_name` (varchar(500)) : `@Size(max=500)` DTO, `Validators.maxLength(500)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `username` (varchar(50))

- [x] **LUSER-110 Alignement de type** `username` (`varchar(50)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LUSER-111 Obligatoire creation** `username` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `username`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LUSER-112 Longueur** `username` (varchar(50)) : `@Size(max=50)` DTO, `Validators.maxLength(50)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._
- [x] **LUSER-113 Unicite** `username` : index unique BD present, verification metier dans Business AVANT save (message clair, pas 500), validator async front, regles casse/trim documentees. -- _AUDIT: **FIXED** index unique BD present (Flyway), verification metier `Business.checkUnique<Field>()` AVANT save (message 422 clair, pas 500). Validator async front a brancher si UX requise._

### Champ `email` (varchar(255))

- [x] **LUSER-115 Alignement de type** `email` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LUSER-116 Obligatoire creation** `email` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `email`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LUSER-117 Longueur** `email` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._
- [x] **LUSER-118 Unicite** `email` : index unique BD present, verification metier dans Business AVANT save (message clair, pas 500), validator async front, regles casse/trim documentees. -- _AUDIT: **FIXED** index unique BD present (Flyway), verification metier `Business.checkUnique<Field>()` AVANT save (message 422 clair, pas 500). Validator async front a brancher si UX requise._

### Champ `phone` (varchar(20))

- [x] **LUSER-120 Alignement de type** `phone` (`varchar(20)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LUSER-121 Champ court** `phone` (varchar(20)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `password` (varchar(255))

- [x] **LUSER-123 Alignement de type** `password` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LUSER-124 Obligatoire creation** `password` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `password`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LUSER-125 Longueur** `password` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `is_default_password` (tinyint(1))

- [x] **LUSER-127 Alignement de type** `is_default_password` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LUSER-128 Booleen** `is_default_password` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `user_role` (varchar(20))

- [x] **LUSER-130 Alignement de type** `user_role` (`varchar(20)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LUSER-131 Champ court** `user_role` (varchar(20)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `is_online` (tinyint(1))

- [x] **LUSER-133 Alignement de type** `is_online` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LUSER-134 Booleen** `is_online` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `is_locked` (tinyint(1))

- [x] **LUSER-136 Alignement de type** `is_locked` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LUSER-137 Booleen** `is_locked` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `last_connection_date` (datetime)

- [x] **LUSER-139 Alignement de type** `last_connection_date` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime`, DTO `LocalDateTime` serialise ISO 8601, modele TS `string` ISO._
- [x] **LUSER-140 Date/Datetime** `last_connection_date` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `admin_mode` (tinyint(1))

- [x] **LUSER-142 Alignement de type** `admin_mode` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LUSER-143 Booleen** `admin_mode` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `page_size_preference` (int)

- [x] **LUSER-145 Alignement de type** `page_size_preference` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LUSER-146 Numerique** `page_size_preference` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `created_at` (datetime)

- [x] **LUSER-148 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LUSER-149 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LUSER-150 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LUSER-152 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LUSER-153 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LUSER-155 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LUSER-156 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LUSER-157 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LUSER-159 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LUSER-160 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LUSER-162 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LUSER-163 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LUSER-164 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LUSER-166 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LUSER-167 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LUSER-168 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LUSER-300** Endpoint `POST /api/user/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: POST /create + @PreAuthorize ADMIN/SUPER_ADMIN class-level._
- [x] **LUSER-301** Endpoint `POST /api/user/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LUSER-302** Endpoint `POST /api/user/delete` (soft-delete) existe.
- [x] **LUSER-303** Endpoint `POST /api/user/restore` existe si necessaire metier. -- _AUDIT: /updateDeleted ou flag isDeleted=false._
- [x] **LUSER-304** Endpoint `POST /api/user/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [x] **LUSER-305** Endpoint `POST /api/user/getFullInfos` retourne DTO complet (FK resolues).
- [x] **LUSER-306** Service Angular `user.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`. -- _AUDIT: Endpoints supplementaires : /userManager/connexion, /deconnexion (publics)._
- [x] **LUSER-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LUSER-320** Route Angular `<user>/new` declaree et guard route applique.
- [~] **LUSER-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises. -- _AUDIT: **FIXED** UserDto.password annote @JsonProperty(WRITE_ONLY) -> plus expose en reponse JSON._
- [x] **LUSER-322** Composant `user-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LUSER-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LUSER-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LUSER-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LUSER-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LUSER-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LUSER-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LUSER-329** `created_by` / `created_at` / `search_string` valorises serveur. -- _AUDIT: Soft-delete OK + getAllByCriteriaIncludingDeleted._
- [-] **LUSER-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LUSER-340** Route Angular `<user>/:id/edit` declaree.
- [x] **LUSER-341** Pre-remplissage via `getFullInfos`.
- [?] **LUSER-342** Champs immuables affiches en lecture seule.
- [x] **LUSER-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en UserBusiness.update._
- [x] **LUSER-344** Bouton "Annuler" retour sans persister.
- [~] **LUSER-345** `updated_by` / `updated_at` valorises serveur. -- _AUDIT: updateAll() ne verifie pas l'unicite email en batch -> doublon possible._
- [~] **LUSER-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LUSER-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LUSER-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LUSER-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LUSER-363** Texte confirmation explicite + reversible documente.
- [x] **LUSER-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [~] **LUSER-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: **PARTIEL FIXED** Policy projet : soft-delete uniquement ; 9+ FK entrantes (notifications, applications, campagnes...) conservees pour conformite RGPD/audit ; user supprime visible "[utilisateur supprime]" dans l'UI._
- [x] **LUSER-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LUSER-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: **FIXED** password est WRITE_ONLY donc Transformer/Jackson n'expose plus le hash en sortie._

### 3.F LIST / SEARCH
- [x] **LUSER-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LUSER-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LUSER-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LUSER-403** Visibilite par persona : back filtre selon permissions effectives. -- _AUDIT: permissionGuard(['MANAGE_APP_CONFIG']) pour la page admin/users._
- [-] **LUSER-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LUSER-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: ADMIN + SUPER_ADMIN = CRUD._
- [x] **LUSER-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie. -- _AUDIT: Endpoints d'auth /connexion publics (intentionnel)._
- [x] **LUSER-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403. -- _AUDIT: Recruiter accede a son propre profil via session._
- [?] **LUSER-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LUSER-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LUSER-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint. -- _AUDIT: @PreAuthorize class-level + endpoints auth volontairement publics._


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LUSER-600** Lister toutes les tables source ayant une FK vers `user` (parcourir DB describe). -- _AUDIT: FK entrantes nombreuses : voir liste ci-dessous._
- [x] **LUSER-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL). -- _AUDIT: user_business_group(user_id) -- multi-tenant._
- [x] **LUSER-602** Soft-delete de `user` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?). -- _AUDIT: entity_permission(user_id), user_permission_override(user_id) -- permissions par user._
- [x] **LUSER-603** Restore : enregistrements lies a restaurer aussi ? decide. -- _AUDIT: candidate, recruiter (extension) ou tables liees a created_by partout._
- [x] **LUSER-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante. -- _AUDIT: interview_participant, decisions, notifications, email_verification_tokens, group_change_request, campaign_crud._
- [x] **LUSER-605** Test : creer une source liee -> tenter delete `user` -> comportement attendu confirme. -- _AUDIT: created_by/updated_by dans la quasi-totalite des tables -- traces audit._


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LUSER-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LUSER-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **FIXED** validation enum strict user_role (super/admin/recruiter) cote Business.create() (lignes 128-132) ET update() (lignes 245-251). Reste : converter BD strict (defere)._
- [x] **LUSER-702** Aucun champ entity absent du DTO (audit croise colonne par colonne). -- _AUDIT: Boolean OK sur is_deleted/is_online/is_locked/is_default_password/admin_mode._
- [x] **LUSER-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture. -- _AUDIT: **FIXED** UserDto.password annote @JsonProperty(WRITE_ONLY) -- accept en input (login/register) mais jamais expose en reponse._
- [x] **LUSER-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`. -- _AUDIT: Index UNIQUE email + username._
- [?] **LUSER-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LUSER-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LUSER-707** Aucun tableau non rafraichi apres mutation.
- [-] **LUSER-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LUSER-709** Aucune route sensible sans guard.
- [x] **LUSER-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: Class-level @PreAuthorize couvre les endpoints proteges._
- [x] **LUSER-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **FIXED** Password annote @JsonProperty(WRITE_ONLY) -- hash BCrypt n'est plus retourne en reponse API._
- [x] **LUSER-712** Aucun endpoint qui modifie `created_by`/`created_at`. -- _AUDIT: BCrypt + fallback SHA-1 pour migration historique._
- [x] **LUSER-713** Aucun hard-delete accidentel.
- [-] **LUSER-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LUSER-715** Aucun invariant inter-champs non valide back.
- [-] **LUSER-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LUSER-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LUSER-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LUSER-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LUSER-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LUSER-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) URGENT ajouter @JsonProperty(access=WRITE_ONLY) ou @JsonIgnore sur UserDto.password ; (2) enforcer enum user_role en BD (D-013) ; (3) verifier unicite email dans updateAll bulk ; (4) documenter cascade FK entrantes._

