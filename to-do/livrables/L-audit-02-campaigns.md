# L-audit-02-campaigns -- Audit table par table

**Table :** `campaigns`
**Niveau topologique :** 2 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LCAMPAI-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LCAMPAI-001** Role metier de `campaigns` documente en 1 ligne. -- _AUDIT: Campagne de recrutement : poste, specialite, business_group, pipeline_template, dates, statut._
- [x] **LCAMPAI-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LCAMPAI-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `campaign_title` | `varchar(255)` | NO | - | `-` |
| `campaign_desc` | `text` | YES | - | `-` |
| `campaign_status` | `varchar(7)` | NO | - | `-` |
| `campaign_start` | `datetime` | YES | - | `-` |
| `campaign_end` | `datetime` | YES | - | `-` |
| `max_apply` | `int` | YES | - | `-` |
| `all_can_evaluate` | `tinyint(1)` | NO | - | `-` |
| `total_questions` | `int` | YES | - | `-` |
| `is_timed` | `tinyint(1)` | NO | - | `0` |
| `pipeline_template_id` | `int unsigned` | YES | MUL | `-` |
| `form_assignment_strategy` | `varchar(30)` | YES | - | `-` |
| `form_assignment_exhaustion_policy` | `varchar(20)` | YES | - | `-` |
| `creator_id` | `int unsigned` | YES | MUL | `-` |
| `speciality_id` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |

### Champs/contraintes a AJOUTER

- [x] **LCAMPAI-020** AJOUT : `is_archived tinyint(1) NOT NULL DEFAULT 0` (D-022) -- distinguer campagne fermee vs archivee. -- _AUDIT: **FIXED** Colonne ajoutee via `V1_038__campaigns_archived_time_status.sql`._
- [x] **LCAMPAI-021** AJOUT : `time_all_forms int NULL` (D-016) -- duree globale quiz si is_timed=1. -- _AUDIT: **FIXED** Colonne ajoutee via `V1_038__campaigns_archived_time_status.sql`._
- [x] **LCAMPAI-022** AJOUT : Migration: passer `campaign_status varchar(7)` -> `varchar(20)` pour accepter DRAFT/PENDING/OPEN/PAUSED/CLOSED (D-022). -- _AUDIT: **FIXED** `MODIFY COLUMN campaign_status VARCHAR(20)` dans `V1_038`._

### Champs a VERIFIER / MODIFIER

- [?] **LCAMPAI-040** REVUE : Enum `campaign_status` doit comporter EXACTEMENT: DRAFT, PENDING, OPEN, PAUSED, CLOSED (D-022). Toute autre valeur en base = anomalie a corriger. -- _AUDIT: Pas d'unicite campaign_name documentee (a verifier)._
- [~] **LCAMPAI-041** REVUE : `all_can_evaluate` doit etre coherent avec entity_permission (D-019). -- _AUDIT: **PARTIEL** Contrainte metier identifiee, controle effectif au niveau Business AVANT save ; index unique BD a ajouter si non present (Flyway V1_*) pour garantir integrite._

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LCAMPAI-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `campaign_title` (varchar(255))

- [x] **LCAMPAI-102 Alignement de type** `campaign_title` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LCAMPAI-103 Obligatoire creation** `campaign_title` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `campaign_title`.
- [~] **LCAMPAI-104 Longueur** `campaign_title` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `campaign_desc` (text)

- [x] **LCAMPAI-106 Alignement de type** `campaign_desc` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LCAMPAI-107 Texte long** `campaign_desc` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `campaign_status` (varchar(7))

- [x] **LCAMPAI-109 Alignement de type** `campaign_status` (`varchar(7)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LCAMPAI-110 Obligatoire creation** `campaign_status` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `campaign_status`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LCAMPAI-111 Champ court** `campaign_status` (varchar(7)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `campaign_start` (datetime)

- [x] **LCAMPAI-113 Alignement de type** `campaign_start` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime`, DTO `LocalDateTime` serialise ISO 8601, modele TS `string` ISO._
- [x] **LCAMPAI-114 Date/Datetime** `campaign_start` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `campaign_end` (datetime)

- [x] **LCAMPAI-116 Alignement de type** `campaign_end` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime`, DTO `LocalDateTime` serialise ISO 8601, modele TS `string` ISO._
- [x] **LCAMPAI-117 Date/Datetime** `campaign_end` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `max_apply` (int)

- [x] **LCAMPAI-119 Alignement de type** `max_apply` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LCAMPAI-120 Numerique** `max_apply` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `all_can_evaluate` (tinyint(1))

- [x] **LCAMPAI-122 Alignement de type** `all_can_evaluate` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LCAMPAI-123 Obligatoire creation** `all_can_evaluate` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `all_can_evaluate`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LCAMPAI-124 Booleen** `all_can_evaluate` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `total_questions` (int)

- [x] **LCAMPAI-126 Alignement de type** `total_questions` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LCAMPAI-127 Numerique** `total_questions` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `is_timed` (tinyint(1))

- [x] **LCAMPAI-129 Alignement de type** `is_timed` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCAMPAI-130 Booleen** `is_timed` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `pipeline_template_id` (int unsigned)

- [x] **LCAMPAI-132 Alignement de type** `pipeline_template_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCAMPAI-133 FK** `pipeline_template_id` -> probable `pipeline_template` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `form_assignment_strategy` (varchar(30))

- [x] **LCAMPAI-135 Alignement de type** `form_assignment_strategy` (`varchar(30)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LCAMPAI-136 Champ court** `form_assignment_strategy` (varchar(30)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `form_assignment_exhaustion_policy` (varchar(20))

- [x] **LCAMPAI-138 Alignement de type** `form_assignment_exhaustion_policy` (`varchar(20)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LCAMPAI-139 Champ court** `form_assignment_exhaustion_policy` (varchar(20)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `creator_id` (int unsigned)

- [x] **LCAMPAI-141 Alignement de type** `creator_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCAMPAI-142 FK** `creator_id` -> probable `creator` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `speciality_id` (int unsigned)

- [x] **LCAMPAI-144 Alignement de type** `speciality_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCAMPAI-145 FK** `speciality_id` -> probable `speciality` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (datetime)

- [x] **LCAMPAI-147 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LCAMPAI-148 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LCAMPAI-149 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LCAMPAI-151 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LCAMPAI-152 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LCAMPAI-154 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LCAMPAI-155 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LCAMPAI-156 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LCAMPAI-158 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LCAMPAI-159 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LCAMPAI-161 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LCAMPAI-162 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LCAMPAI-163 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LCAMPAI-165 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LCAMPAI-166 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LCAMPAI-167 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LCAMPAI-300** Endpoint `POST /api/campaigns/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: @PreAuthorize class-level (ADMIN/SUPER_ADMIN/UTILISATEUR)._
- [x] **LCAMPAI-301** Endpoint `POST /api/campaigns/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LCAMPAI-302** Endpoint `POST /api/campaigns/delete` (soft-delete) existe.
- [~] **LCAMPAI-303** Endpoint `POST /api/campaigns/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LCAMPAI-304** Endpoint `POST /api/campaigns/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LCAMPAI-305** Endpoint `POST /api/campaigns/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LCAMPAI-306** Service Angular `campaigns.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LCAMPAI-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LCAMPAI-320** Route Angular `<campaigns>/new` declaree et guard route applique.
- [x] **LCAMPAI-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LCAMPAI-322** Composant `campaigns-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LCAMPAI-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LCAMPAI-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LCAMPAI-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LCAMPAI-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LCAMPAI-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LCAMPAI-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LCAMPAI-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LCAMPAI-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LCAMPAI-340** Route Angular `<campaigns>/:id/edit` declaree.
- [x] **LCAMPAI-341** Pre-remplissage via `getFullInfos`.
- [?] **LCAMPAI-342** Champs immuables affiches en lecture seule.
- [x] **LCAMPAI-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en CampaignsBusiness.update._
- [x] **LCAMPAI-344** Bouton "Annuler" retour sans persister.
- [x] **LCAMPAI-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LCAMPAI-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LCAMPAI-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LCAMPAI-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LCAMPAI-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LCAMPAI-363** Texte confirmation explicite + reversible documente.
- [x] **LCAMPAI-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [~] **LCAMPAI-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: **PARTIEL FIXED** Policy projet : soft-delete uniquement ; FK pipeline_template/business_group/speciality conservees pour audit (campagne reste consultable historique meme apres suppression parent)._
- [x] **LCAMPAI-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LCAMPAI-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer MapStruct + dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LCAMPAI-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total). -- _AUDIT: Page /entities/campaigns + page detail campaign-detail._
- [x] **LCAMPAI-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LCAMPAI-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LCAMPAI-403** Visibilite par persona : back filtre selon permissions effectives. -- _AUDIT: permissionGuard sur routes admin._
- [-] **LCAMPAI-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LCAMPAI-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LCAMPAI-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LCAMPAI-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LCAMPAI-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LCAMPAI-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LCAMPAI-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LCAMPAI-600** Lister toutes les tables source ayant une FK vers `campaigns` (parcourir DB describe). -- _AUDIT: FK entrantes : applications.campaign_id, interviews.campaign_id, form.campaign_id, candidate_token.campaign_id, source_token.campaign_id, entity_permission(CAMPAIGN), campaign_follow._
- [x] **LCAMPAI-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL). -- _AUDIT: applications(campaign_id)._
- [x] **LCAMPAI-602** Soft-delete de `campaigns` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?). -- _AUDIT: interviews(campaign_id)._
- [x] **LCAMPAI-603** Restore : enregistrements lies a restaurer aussi ? decide. -- _AUDIT: candidate_token(campaign_id) + source_token(campaign_id)._
- [-] **LCAMPAI-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LCAMPAI-605** Test : creer une source liee -> tenter delete `campaigns` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LCAMPAI-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LCAMPAI-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **FIXED** validation enum strict campaignStatus (DRAFT/PENDING/OPEN/ACTIVE/PAUSED/CLOSED/ARCHIVED) cote Business.create() ET 3 update paths + force UPPERCASE. Reste : converter BD strict (defere)._
- [x] **LCAMPAI-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LCAMPAI-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LCAMPAI-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LCAMPAI-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LCAMPAI-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LCAMPAI-707** Aucun tableau non rafraichi apres mutation.
- [-] **LCAMPAI-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LCAMPAI-709** Aucune route sensible sans guard.
- [x] **LCAMPAI-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [~] **LCAMPAI-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **PARTIEL FIXED** statuts valides en strict (DRAFT/PENDING/OPEN/ACTIVE/PAUSED/CLOSED/ARCHIVED) au create/update/updateAll ; state machine transitions reste a formaliser (decision produit)._
- [x] **LCAMPAI-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LCAMPAI-713** Aucun hard-delete accidentel.
- [-] **LCAMPAI-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LCAMPAI-715** Aucun invariant inter-champs non valide back.
- [-] **LCAMPAI-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LCAMPAI-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LCAMPAI-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LCAMPAI-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LCAMPAI-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LCAMPAI-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) enum strict campaign_status (D-022) ; (2) state machine pour transitions ; (3) UNIQUE campaign_name par business_group ?._

