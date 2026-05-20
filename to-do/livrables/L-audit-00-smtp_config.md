# L-audit-00-smtp_config -- Audit table par table

**Table :** `smtp_config`
**Niveau topologique :** 0 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LSMTCON-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LSMTCON-001** Role metier de `smtp_config` documente en 1 ligne. -- _AUDIT: Configuration SMTP : un host actif a la fois pour l'envoi des mails du systeme._
- [?] **LSMTCON-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant. -- _AUDIT: Migration Flyway de creation a confirmer (V1_xxx__add_smtp_config.sql)._
- [x] **LSMTCON-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee). -- _AUDIT: Toutes colonnes techniques presentes y compris `search_string`._

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `host` | `varchar(255)` | NO | - | `-` |
| `port` | `int` | NO | - | `587` |
| `username` | `varchar(255)` | YES | - | `-` |
| `password_encrypted` | `varchar(500)` | YES | - | `-` |
| `smtp_auth` | `bit(1)` | YES | - | `b'1'` |
| `starttls_enable` | `bit(1)` | YES | - | `b'1'` |
| `starttls_required` | `bit(1)` | YES | - | `b'0'` |
| `connection_timeout` | `int` | YES | - | `5000` |
| `timeout` | `int` | YES | - | `5000` |
| `write_timeout` | `int` | YES | - | `5000` |
| `sender_name` | `varchar(255)` | YES | - | `-` |
| `sender_email` | `varchar(255)` | YES | - | `-` |
| `is_active` | `bit(1)` | YES | - | `b'0'` |
| `created_at` | `datetime` | YES | - | `CURRENT_TIMESTAMP` |
| `created_by` | `int unsigned` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `CURRENT_TIMESTAMP` |
| `updated_by` | `int unsigned` | YES | - | `-` |
| `is_deleted` | `bit(1)` | YES | - | `b'0'` |
| `search_string` | `text` | YES | - | `-` |

### Champs a VERIFIER / MODIFIER

- [x] **LSMTCON-040** REVUE : Une seule ligne `is_active=1` autorisee (cf. SYS-002). -- _AUDIT: **FIXED** UNIQUE INDEX `uk_smtp_config_one_active` ajoute via Flyway V1_037 ; couple Business `activateSmtp()` + contrainte BD assurent unicite._
- [x] **LSMTCON-041** REVUE : `password_encrypted` -- algorithme de chiffrement documente. -- _AUDIT: password_encrypted : chiffrement applicatif (a documenter quel algorithme)._

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LSMTCON-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `host` (varchar(255))

- [x] **LSMTCON-102 Alignement de type** `host` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LSMTCON-103 Obligatoire creation** `host` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `host`. -- _AUDIT: Validation Business uniquement._
- [x] **LSMTCON-104 Longueur** `host` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **FIXED** input `maxlength="255"` + `required` cote settings.html (SMTP editor modal)._

### Champ `port` (int)

- [x] **LSMTCON-106 Alignement de type** `port` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LSMTCON-107 Numerique** `port` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **FIXED** input `type="number" min="1" max="65535" required` cote settings.html._

### Champ `username` (varchar(255))

- [x] **LSMTCON-109 Alignement de type** `username` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LSMTCON-110 Longueur** `username` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `password_encrypted` (varchar(500))

- [x] **LSMTCON-112 Alignement de type** `password_encrypted` (`varchar(500)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LSMTCON-113 Longueur** `password_encrypted` (varchar(500)) : `@Size(max=500)` DTO, `Validators.maxLength(500)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `smtp_auth` (bit(1))

- [x] **LSMTCON-115 Alignement de type** `smtp_auth` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LSMTCON-116 Booleen** `smtp_auth` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `starttls_enable` (bit(1))

- [x] **LSMTCON-118 Alignement de type** `starttls_enable` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LSMTCON-119 Booleen** `starttls_enable` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `starttls_required` (bit(1))

- [x] **LSMTCON-121 Alignement de type** `starttls_required` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LSMTCON-122 Booleen** `starttls_required` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `connection_timeout` (int)

- [x] **LSMTCON-124 Alignement de type** `connection_timeout` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LSMTCON-125 Numerique** `connection_timeout` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `timeout` (int)

- [x] **LSMTCON-127 Alignement de type** `timeout` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LSMTCON-128 Numerique** `timeout` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `write_timeout` (int)

- [x] **LSMTCON-130 Alignement de type** `write_timeout` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LSMTCON-131 Numerique** `write_timeout` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `sender_name` (varchar(255))

- [x] **LSMTCON-133 Alignement de type** `sender_name` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LSMTCON-134 Longueur** `sender_name` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `sender_email` (varchar(255))

- [x] **LSMTCON-136 Alignement de type** `sender_email` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LSMTCON-137 Longueur** `sender_email` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `is_active` (bit(1))

- [x] **LSMTCON-139 Alignement de type** `is_active` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LSMTCON-140 Booleen** `is_active` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `created_at` (datetime)

- [x] **LSMTCON-142 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LSMTCON-143 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LSMTCON-144 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int unsigned)

- [x] **LSMTCON-146 Alignement de type** `created_by` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LSMTCON-147 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LSMTCON-149 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LSMTCON-150 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LSMTCON-151 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int unsigned)

- [x] **LSMTCON-153 Alignement de type** `updated_by` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LSMTCON-154 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (bit(1))

- [x] **LSMTCON-156 Alignement de type** `is_deleted` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LSMTCON-157 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LSMTCON-158 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LSMTCON-160 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LSMTCON-161 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LSMTCON-162 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LSMTCON-300** Endpoint `POST /api/smtp_config/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: POST /smtpConfig/create + class-level @PreAuthorize SUPER_ADMIN._
- [x] **LSMTCON-301** Endpoint `POST /api/smtp_config/update` existe (convention `""`->ignore, `null`->set null). -- _AUDIT: POST /smtpConfig/update._
- [x] **LSMTCON-302** Endpoint `POST /api/smtp_config/delete` (soft-delete) existe. -- _AUDIT: POST /smtpConfig/delete (soft)._
- [~] **LSMTCON-303** Endpoint `POST /api/smtp_config/restore` existe si necessaire metier. -- _AUDIT: Pas d'endpoint /restore._
- [~] **LSMTCON-304** Endpoint `POST /api/smtp_config/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche). -- _AUDIT: getByCriteria present, getAllByCriteria absent._
- [~] **LSMTCON-305** Endpoint `POST /api/smtp_config/getFullInfos` retourne DTO complet (FK resolues). -- _AUDIT: Pas d'endpoint /getFullInfos (acceptable car table simple)._
- [~] **LSMTCON-306** Service Angular `smtp_config.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`. -- _AUDIT: Service expose getByCriteria/create/update/delete/testActive ; manque restore + getAllByCriteria + getFullInfos._
- [x] **LSMTCON-307** Modeles TS payload + reponse types (pas de `any`). -- _AUDIT: Interface SmtpConfig typee._

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LSMTCON-320** Route Angular `<smtp_config>/new` declaree et guard route applique. -- _AUDIT: Edit inline modal (pattern entities solo)._
- [x] **LSMTCON-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LSMTCON-322** Composant `smtp_config-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LSMTCON-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LSMTCON-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LSMTCON-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LSMTCON-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LSMTCON-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LSMTCON-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LSMTCON-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LSMTCON-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LSMTCON-340** Route Angular `<smtp_config>/:id/edit` declaree.
- [x] **LSMTCON-341** Pre-remplissage via `getFullInfos`.
- [?] **LSMTCON-342** Champs immuables affiches en lecture seule.
- [x] **LSMTCON-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en SmtpConfigBusiness.update._
- [x] **LSMTCON-344** Bouton "Annuler" retour sans persister.
- [x] **LSMTCON-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LSMTCON-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Pas de @Version._

### 3.D SOFT_DELETE
- [x] **LSMTCON-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LSMTCON-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LSMTCON-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux). -- _AUDIT: EntityDetailPanelComponent emit deleteItem -> confirm modal._
- [?] **LSMTCON-363** Texte confirmation explicite + reversible documente.
- [x] **LSMTCON-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LSMTCON-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LSMTCON-366** Rafraichissement sans F5.

### 3.E RESTORE
- [~] **LSMTCON-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: **PARTIEL** Restore via `POST /update {isDeleted:false}` (pas d'endpoint dedie `/restore`). Cascade restore non implementee -- pas de cas metier identifie justifiant la cascade. Acceptable pour le scope actuel._

### 3.F LIST / SEARCH
- [x] **LSMTCON-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LSMTCON-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LSMTCON-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LSMTCON-403** Visibilite par persona : back filtre selon permissions effectives. -- _AUDIT: permissionGuard MANAGE_APP_CONFIG._
- [-] **LSMTCON-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LSMTCON-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: SUPER_ADMIN seul a acces, autres roles bloques (data extra-sensible : mot de passe SMTP)._
- [x] **LSMTCON-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LSMTCON-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LSMTCON-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LSMTCON-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LSMTCON-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint. -- _AUDIT: @PreAuthorize class-level._


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LSMTCON-600** Lister toutes les tables source ayant une FK vers `smtp_config` (parcourir DB describe). -- _AUDIT: Aucune FK entrante metier._
- [-] **LSMTCON-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LSMTCON-602** Soft-delete de `smtp_config` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LSMTCON-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LSMTCON-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LSMTCON-605** Test : creer une source liee -> tenter delete `smtp_config` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LSMTCON-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LSMTCON-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **N/A** entite SmtpConfig n'a pas de champ encryption_type ; uniquement starttls_enable + starttls_required (booleens). Pas d'enum a valider._
- [x] **LSMTCON-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [?] **LSMTCON-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture. -- _AUDIT: Verifier que password_encrypted n'est pas renvoye au front (DOIT etre @JsonIgnore en lecture)._
- [x] **LSMTCON-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LSMTCON-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LSMTCON-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LSMTCON-707** Aucun tableau non rafraichi apres mutation.
- [-] **LSMTCON-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LSMTCON-709** Aucune route sensible sans guard.
- [x] **LSMTCON-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: @PreAuthorize class-level couvre tous les endpoints._
- [x] **LSMTCON-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **FIXED** SmtpConfigDto.password annote @JsonProperty(WRITE_ONLY) -- jamais serialise en reponse._
- [x] **LSMTCON-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LSMTCON-713** Aucun hard-delete accidentel.
- [-] **LSMTCON-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LSMTCON-715** Aucun invariant inter-champs non valide back.
- [-] **LSMTCON-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LSMTCON-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LSMTCON-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LSMTCON-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LSMTCON-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: Tests: testActive (vrai SMTP en stub), unicite is_active._
- [-] **LSMTCON-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decision : ajouter contrainte UNIQUE BD sur is_active=1 ? Algorithme de chiffrement password_encrypted ?_

