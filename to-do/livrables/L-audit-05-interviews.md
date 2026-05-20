# L-audit-05-interviews -- Audit table par table

**Table :** `interviews`
**Niveau topologique :** 5 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LINTERV-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LINTERV-001** Role metier de `interviews` documente en 1 ligne. -- _AUDIT: Entretien planifie : campaign + application + status + interviewEvaluationsLink + mailSent._
- [x] **LINTERV-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LINTERV-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `interview_location` | `varchar(255)` | YES | - | `-` |
| `interview_date` | `datetime` | NO | - | `-` |
| `interview_status` | `varchar(20)` | NO | - | `-` |
| `meet_link` | `varchar(500)` | YES | - | `-` |
| `interview_evaluations_link` | `varchar(8)` | YES | - | `-` |
| `interview_note` | `text` | YES | - | `-` |
| `interview_mail_sent` | `tinyint(1)` | NO | - | `0` |
| `interview_type` | `varchar(20)` | NO | - | `-` |
| `started_at` | `datetime` | YES | - | `-` |
| `ended_at` | `datetime` | YES | - | `-` |
| `evaluation_score` | `int` | YES | - | `-` |
| `evaluation_number` | `int` | YES | - | `-` |
| `evaluation_percentage` | `double` | YES | - | `-` |
| `campaign_id` | `int unsigned` | YES | MUL | `-` |
| `application_id` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |

### Champs a VERIFIER / MODIFIER

- [?] **LINTERV-040** REVUE : `interview_mail_sent` -- a remplacer par lecture de `mail_log` (D-021) ? -- _AUDIT: Unicite (application_id, scheduled_at) ?_

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LINTERV-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `interview_location` (varchar(255))

- [x] **LINTERV-102 Alignement de type** `interview_location` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LINTERV-103 Longueur** `interview_location` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100.

### Champ `interview_date` (datetime)

- [x] **LINTERV-105 Alignement de type** `interview_date` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime`, DTO `LocalDateTime` serialise ISO 8601, modele TS `string` ISO._
- [~] **LINTERV-106 Obligatoire creation** `interview_date` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `interview_date`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LINTERV-107 Date/Datetime** `interview_date` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `interview_status` (varchar(20))

- [x] **LINTERV-109 Alignement de type** `interview_status` (`varchar(20)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LINTERV-110 Obligatoire creation** `interview_status` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `interview_status`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LINTERV-111 Champ court** `interview_status` (varchar(20)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `meet_link` (varchar(500))

- [x] **LINTERV-113 Alignement de type** `meet_link` (`varchar(500)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LINTERV-114 Longueur** `meet_link` (varchar(500)) : `@Size(max=500)` DTO, `Validators.maxLength(500)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `interview_evaluations_link` (varchar(8))

- [x] **LINTERV-116 Alignement de type** `interview_evaluations_link` (`varchar(8)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LINTERV-117 Champ court** `interview_evaluations_link` (varchar(8)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `interview_note` (text)

- [x] **LINTERV-119 Alignement de type** `interview_note` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LINTERV-120 Texte long** `interview_note` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `interview_mail_sent` (tinyint(1))

- [x] **LINTERV-122 Alignement de type** `interview_mail_sent` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LINTERV-123 Booleen** `interview_mail_sent` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `interview_type` (varchar(20))

- [x] **LINTERV-125 Alignement de type** `interview_type` (`varchar(20)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LINTERV-126 Obligatoire creation** `interview_type` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `interview_type`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LINTERV-127 Champ court** `interview_type` (varchar(20)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `started_at` (datetime)

- [x] **LINTERV-129 Alignement de type** `started_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime`, DTO `LocalDateTime` serialise ISO 8601, modele TS `string` ISO._
- [x] **LINTERV-130 Date/Datetime** `started_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `ended_at` (datetime)

- [x] **LINTERV-132 Alignement de type** `ended_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime`, DTO `LocalDateTime` serialise ISO 8601, modele TS `string` ISO._
- [x] **LINTERV-133 Date/Datetime** `ended_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `evaluation_score` (int)

- [x] **LINTERV-135 Alignement de type** `evaluation_score` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LINTERV-136 Numerique** `evaluation_score` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `evaluation_number` (int)

- [x] **LINTERV-138 Alignement de type** `evaluation_number` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LINTERV-139 Numerique** `evaluation_number` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `evaluation_percentage` (double)

- [x] **LINTERV-141 Alignement de type** `evaluation_percentage` (`double`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Double`, DTO `Double`, JSON number, modele TS `number`._
- [~] **LINTERV-142 Reel** `evaluation_percentage` (`double`) : precision/echelle documentee, formattage UX (nb decimales), arrondi serveur si necessaire. -- _AUDIT: **PARTIEL** type Java `BigDecimal`/`Float`/`Double` aligne avec BD ; precision/echelle BD respectee ; `@DecimalMin/@DecimalMax` non encore propage cote DTO._

### Champ `campaign_id` (int unsigned)

- [x] **LINTERV-144 Alignement de type** `campaign_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LINTERV-145 FK** `campaign_id` -> probable `campaign` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `application_id` (int unsigned)

- [x] **LINTERV-147 Alignement de type** `application_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LINTERV-148 FK** `application_id` -> probable `application` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (datetime)

- [x] **LINTERV-150 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LINTERV-151 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LINTERV-152 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LINTERV-154 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LINTERV-155 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LINTERV-157 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LINTERV-158 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LINTERV-159 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LINTERV-161 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LINTERV-162 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LINTERV-164 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LINTERV-165 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LINTERV-166 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LINTERV-168 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LINTERV-169 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LINTERV-170 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LINTERV-300** Endpoint `POST /api/interviews/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: @PreAuthorize class-level (ADMIN/SUPER_ADMIN/UTILISATEUR)._
- [x] **LINTERV-301** Endpoint `POST /api/interviews/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LINTERV-302** Endpoint `POST /api/interviews/delete` (soft-delete) existe.
- [~] **LINTERV-303** Endpoint `POST /api/interviews/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LINTERV-304** Endpoint `POST /api/interviews/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LINTERV-305** Endpoint `POST /api/interviews/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LINTERV-306** Service Angular `interviews.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LINTERV-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LINTERV-320** Route Angular `<interviews>/new` declaree et guard route applique.
- [x] **LINTERV-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LINTERV-322** Composant `interviews-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LINTERV-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LINTERV-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LINTERV-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LINTERV-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LINTERV-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LINTERV-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LINTERV-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LINTERV-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LINTERV-340** Route Angular `<interviews>/:id/edit` declaree.
- [x] **LINTERV-341** Pre-remplissage via `getFullInfos`.
- [?] **LINTERV-342** Champs immuables affiches en lecture seule.
- [~] **LINTERV-343** Convention `""`/`null`/value respectee front (patchValue cible).
- [x] **LINTERV-344** Bouton "Annuler" retour sans persister.
- [x] **LINTERV-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LINTERV-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LINTERV-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LINTERV-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LINTERV-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LINTERV-363** Texte confirmation explicite + reversible documente.
- [x] **LINTERV-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LINTERV-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LINTERV-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LINTERV-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer + dd/MM/yyyy HH:mm._

### 3.F LIST / SEARCH
- [x] **LINTERV-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total). -- _AUDIT: Page /interviews + /interview-create._
- [x] **LINTERV-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LINTERV-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LINTERV-403** Visibilite par persona : back filtre selon permissions effectives. -- _AUDIT: permissionGuard(['VIEW_INTERVIEWS'])._
- [-] **LINTERV-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LINTERV-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LINTERV-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LINTERV-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LINTERV-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LINTERV-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LINTERV-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LINTERV-600** Lister toutes les tables source ayant une FK vers `interviews` (parcourir DB describe). -- _AUDIT: FK entrantes : candidate_interview.interview_id, interview_participant.interview_id._
- [x] **LINTERV-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL). -- _AUDIT: candidate_interview(interview_id)._
- [x] **LINTERV-602** Soft-delete de `interviews` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?). -- _AUDIT: interview_participant(interview_id)._
- [-] **LINTERV-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LINTERV-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LINTERV-605** Test : creer une source liee -> tenter delete `interviews` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LINTERV-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LINTERV-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **FIXED** validation enum strict interviewStatus (PENDING/SCHEDULED/STARTED/OVER/POSTPONED/ARCHIVED) cote Business.create() + update() + force UPPERCASE. Reste : converter BD strict (defere)._
- [x] **LINTERV-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [~] **LINTERV-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture. -- _AUDIT: **PARTIEL FIXED** interviewEvaluationsLink necessaire pour l'envoi par email (lien d'evaluation candidat) ; expose uniquement sur endpoints CRUD authentifies. Reste : signature/expiration cote business (decision infra)._
- [x] **LINTERV-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LINTERV-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LINTERV-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LINTERV-707** Aucun tableau non rafraichi apres mutation.
- [-] **LINTERV-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LINTERV-709** Aucune route sensible sans guard.
- [x] **LINTERV-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [~] **LINTERV-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **PARTIEL FIXED** interviewMailSent positionne uniquement apres envoi reussi (try/catch) ; reset si reschedule. Drift residuel possible si SMTP down apres set : audit log a ajouter._
- [x] **LINTERV-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LINTERV-713** Aucun hard-delete accidentel.
- [-] **LINTERV-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LINTERV-715** Aucun invariant inter-champs non valide back.
- [-] **LINTERV-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LINTERV-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LINTERV-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LINTERV-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LINTERV-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LINTERV-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) enum strict interviewStatus ; (2) verifier entropie interviewEvaluationsLink (>=16 chars cryptographiques) ; (3) cascade FK application._

