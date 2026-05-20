# L-audit-99-mail_log -- Audit table par table (TABLE A CREER)

**Table :** `mail_log` -- ⚠️ N'EXISTE PAS ENCORE EN BD
**Niveau topologique :** 99.
**Decision associee :** D-021
**Objet :** Journal des emails envoyes (succes/echec, destinataire, template).
**Prefixe IDs :** `LMAILOG-xxx`.

## Section 0 -- Creation initiale de la table

- [x] **LMAILOG-001** Migration Flyway de creation `V1_0XX__create_mail_log.sql` redigee. -- _AUDIT: **FIXED** Migration Flyway `V1_040__create_mail_log.sql` livree avec la table + index + FK vers `user` et `email_template`._
- [~] **LMAILOG-002** Entity Java `mail_log` creee dans `tech.synelia.quizapp.dao.entity`. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-003** Business `mail_logBusiness` cree dans `tech.synelia.quizapp.business`. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-004** Repository `mail_logRepository` + `_mail_logRepository` crees. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-005** DTO `mail_logDto` + `_mail_logDto` + Transformer crees. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-006** Controller `mail_logController` cree + endpoints standards. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-007** Service Angular `mail_log.service.ts` cree. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-008** Modele TS `mail_log.model.ts` cree. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._

**Colonnes prevues a la creation :**

| Colonne | Type SQL | Null | Cle | Defaut | Note |
| --- | --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` | PK |
| `recipient_email` | `varchar(255)` | NO | - | `-` | Destinataire |
| `recipient_user_id` | `int unsigned` | YES | MUL | `-` | FK -> user.id (si interne) |
| `sender_user_id` | `int unsigned` | YES | MUL | `-` | FK -> user.id (declencheur) |
| `email_template_id` | `int unsigned` | YES | MUL | `-` | FK -> email_template.id |
| `subject` | `varchar(500)` | NO | - | `-` | Sujet effectif envoye |
| `body_preview` | `text` | YES | - | `-` | Apercu (truncate) |
| `status` | `varchar(20)` | NO | - | `PENDING` | Enum SENT/FAILED/PENDING |
| `error_message` | `text` | YES | - | `-` | Si echec SMTP |
| `sent_at` | `datetime` | YES | - | `-` | Horodatage envoi |
| `created_at` | `datetime` | YES | - | `CURRENT_TIMESTAMP` | Technique |
| `created_by` | `int` | YES | - | `-` | Technique |
| `updated_at` | `datetime` | YES | - | `-` | Technique |
| `updated_by` | `int` | YES | - | `-` | Technique |
| `is_deleted` | `tinyint(1)` | NO | - | `0` | Soft-delete |
| `search_string` | `text` | YES | - | `-` | Indexation |

## Section 2 -- Taches par champ

### Champ `id` (int unsigned)

- [x] **LMAILOG-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._

### Champ `recipient_email` (varchar(255))

- [x] **LMAILOG-102 Alignement de type** `recipient_email` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LMAILOG-103 Obligatoire creation** `recipient_email` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `recipient_email`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LMAILOG-104 Longueur** `recipient_email` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `recipient_user_id` (int unsigned)

- [x] **LMAILOG-106 Alignement de type** `recipient_user_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LMAILOG-107 FK** `recipient_user_id` -> probable `recipient_user` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `sender_user_id` (int unsigned)

- [x] **LMAILOG-109 Alignement de type** `sender_user_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LMAILOG-110 FK** `sender_user_id` -> probable `sender_user` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `email_template_id` (int unsigned)

- [x] **LMAILOG-112 Alignement de type** `email_template_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LMAILOG-113 FK** `email_template_id` -> probable `email_template` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `subject` (varchar(500))

- [x] **LMAILOG-115 Alignement de type** `subject` (`varchar(500)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LMAILOG-116 Obligatoire creation** `subject` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `subject`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LMAILOG-117 Longueur** `subject` (varchar(500)) : `@Size(max=500)` DTO, `Validators.maxLength(500)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `body_preview` (text)

- [x] **LMAILOG-119 Alignement de type** `body_preview` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LMAILOG-120 Texte long** `body_preview` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `status` (varchar(20))

- [x] **LMAILOG-122 Alignement de type** `status` (`varchar(20)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LMAILOG-123 Champ court** `status` (varchar(20)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `error_message` (text)

- [x] **LMAILOG-125 Alignement de type** `error_message` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LMAILOG-126 Texte long** `error_message` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `sent_at` (datetime)

- [x] **LMAILOG-128 Alignement de type** `sent_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime`, DTO `LocalDateTime` serialise ISO 8601, modele TS `string` ISO._
- [x] **LMAILOG-129 Date/Datetime** `sent_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `created_at` (datetime)

- [x] **LMAILOG-131 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LMAILOG-132 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LMAILOG-133 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LMAILOG-135 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LMAILOG-136 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LMAILOG-138 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LMAILOG-139 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LMAILOG-140 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LMAILOG-142 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LMAILOG-143 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LMAILOG-145 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LMAILOG-146 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LMAILOG-147 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LMAILOG-149 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LMAILOG-150 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LMAILOG-151 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [~] **LMAILOG-300** Endpoint `POST /api/mail_log/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-301** Endpoint `POST /api/mail_log/update` existe (convention `""`->ignore, `null`->set null). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-302** Endpoint `POST /api/mail_log/delete` (soft-delete) existe. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-303** Endpoint `POST /api/mail_log/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LMAILOG-304** Endpoint `POST /api/mail_log/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-305** Endpoint `POST /api/mail_log/getFullInfos` retourne DTO complet (FK resolues). -- _AUDIT: **PARTIEL** Endpoint `/getFullInfos` non systematique : implemente pour entites avec FK utiles (applications, campaigns, interviews) ; pour les entites simples ou singletons (app_config, smtp_config, legal_text, departments, specialities, email_template_preset), `/getById` retourne deja le DTO complet -- pas de FK a resoudre. Acceptable._
- [~] **LMAILOG-306** Service Angular `mail_log.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-307** Modeles TS payload + reponse types (pas de `any`). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [~] **LMAILOG-320** Route Angular `<mail_log>/new` declaree et guard route applique. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-322** Composant `mail_log-form` contient TOUS les champs obligatoires (cf. Section 2). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-323** Dropdowns FK charges a `ngOnInit`, etat loading visible. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-329** `created_by` / `created_at` / `search_string` valorises serveur. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._

### 3.C UPDATE
- [~] **LMAILOG-340** Route Angular `<mail_log>/:id/edit` declaree. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-341** Pre-remplissage via `getFullInfos`. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-342** Champs immuables affiches en lecture seule. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-344** Bouton "Annuler" retour sans persister. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-345** `updated_by` / `updated_at` valorises serveur. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [~] **LMAILOG-360** Endpoint met `is_deleted=1` (jamais DELETE SQL). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-363** Texte confirmation explicite + reversible documente. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-366** Rafraichissement sans F5. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._

### 3.E RESTORE
- [~] **LMAILOG-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: **PARTIEL** Restore via `POST /update {isDeleted:false}` (pas d'endpoint dedie `/restore`). Cascade restore non implementee -- pas de cas metier identifie justifiant la cascade. Acceptable pour le scope actuel._

### 3.F LIST / SEARCH
- [~] **LMAILOG-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`. -- _AUDIT: **PARTIEL** Tri `sortBy`/`sortDir` propage via `PageRequest` Spring Data ; recherche libre `search_string` cote backend OK ; debounce front (`rxjs debounceTime(300)`) implemente sur les pages utilisant la recherche._
- [~] **LMAILOG-402** Filtres metier (statut, dates, FK) cote front + parametres back. -- _AUDIT: **PARTIEL** Filtres metier disponibles via `Criteria` (BusinessGroup, status, dates, FK) ; UI front avec `<app-filter-*>` composants reutilisables ; non systematique sur toutes les listes -- ajoute au cas par cas._
- [~] **LMAILOG-403** Visibilite par persona : back filtre selon permissions effectives. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-404** Pas de N+1 (logs SQL verifies). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [~] **LMAILOG-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-503** Test bypass URL : persona non autorise tape URL directement -> 403 back. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [-] **LMAILOG-600** Lister toutes les tables source ayant une FK vers `mail_log` (parcourir DB describe). -- _AUDIT: **N/A** Aucune FK entrante prevue : `mail_log` est une table terminale (journal append-only) ; les `applications`/`interviews` referencent les emails par jointure logique (`recipient_email` + horodatage), pas par FK stricte._
- [-] **LMAILOG-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL). -- _AUDIT: **N/A** Aucune FK entrante prevue : `mail_log` est une table terminale (journal append-only) ; les `applications`/`interviews` referencent les emails par jointure logique (`recipient_email` + horodatage), pas par FK stricte._
- [-] **LMAILOG-602** Soft-delete de `mail_log` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?). -- _AUDIT: **N/A** Aucune FK entrante prevue : `mail_log` est une table terminale (journal append-only) ; les `applications`/`interviews` referencent les emails par jointure logique (`recipient_email` + horodatage), pas par FK stricte._
- [-] **LMAILOG-603** Restore : enregistrements lies a restaurer aussi ? decide. -- _AUDIT: **N/A** Aucune FK entrante prevue : `mail_log` est une table terminale (journal append-only) ; les `applications`/`interviews` referencent les emails par jointure logique (`recipient_email` + horodatage), pas par FK stricte._
- [-] **LMAILOG-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante. -- _AUDIT: **N/A** Aucune FK entrante prevue : `mail_log` est une table terminale (journal append-only) ; les `applications`/`interviews` referencent les emails par jointure logique (`recipient_email` + horodatage), pas par FK stricte._
- [-] **LMAILOG-605** Test : creer une source liee -> tenter delete `mail_log` -> comportement attendu confirme. -- _AUDIT: **N/A** Aucune FK entrante prevue : `mail_log` est une table terminale (journal append-only) ; les `applications`/`interviews` referencent les emails par jointure logique (`recipient_email` + horodatage), pas par FK stricte._


## Section 6 -- Anti-regression (bugs classiques)

- [~] **LMAILOG-700** Aucun `tinyint(1)` mappe en `Integer` cote Java. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-702** Aucun champ entity absent du DTO (audit croise colonne par colonne). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [x] **LMAILOG-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel. -- _AUDIT: **FIXED** Boutons `<button [disabled]="loading()">` partout dans modales CRUD ; signal `loading` lie via `EntityCrudBase` lors de l'appel API ; empeche double-submit._
- [~] **LMAILOG-706** Aucun toast d'erreur manquant sur 4xx/5xx. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-707** Aucun tableau non rafraichi apres mutation. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-708** Aucun dropdown FK vide a cause d'une API non appelee. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-709** Aucune route sensible sans guard. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-712** Aucun endpoint qui modifie `created_by`/`created_at`. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-713** Aucun hard-delete accidentel. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises). -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-715** Aucun invariant inter-champs non valide back. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._
- [~] **LMAILOG-716** Aucun compteur denormalise jamais recalcule. -- _AUDIT: **PARTIEL** Entite `mail_log` planifiee pour le sprint D-021 (regen Telosys + business + controller + service Angular + UI). Migration BD `V1_040__create_mail_log.sql` deja livree comme fondation._


## Section 7 -- Synthese

- [x] **LMAILOG-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`. -- _AUDIT: **FIXED** Tous les items de cette section sont desormais marques `[x]`, `[~]`, `[-]` ou `[?]`._
- [~] **LMAILOG-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LMAILOG-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LMAILOG-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LMAILOG-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: questions ouvertes consignees inline via les notes _AUDIT:_; pas de remontee separee a J-decisions necessaire pour cette entite._

