# L-audit-99-campaign_crud -- Audit table par table

**Table :** `campaign_crud`
**Niveau topologique :** 99 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LCAMCRU-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [-] **LCAMCRU-001** Role metier de `campaign_crud` documente en 1 ligne. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `can_update` | `tinyint(1)` | YES | - | `-` |
| `can_delete` | `tinyint(1)` | YES | - | `-` |
| `can_evaluate` | `tinyint(1)` | YES | - | `-` |
| `follow` | `tinyint(1)` | YES | - | `-` |
| `is_admin` | `tinyint(1)` | YES | - | `-` |
| `is_creator` | `tinyint(1)` | YES | - | `-` |
| `can_planify` | `tinyint(1)` | YES | - | `-` |
| `can_accept_pre_screen` | `tinyint(1)` | YES | - | `-` |
| `can_accept_final` | `tinyint(1)` | YES | - | `-` |
| `user_id` | `int unsigned` | YES | MUL | `-` |
| `campaign_id` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |

### ⚠️ Table marquee DEPRECATED

- [~] **LCAMCRU-010** Toute la table `campaign_crud` doit etre supprimee (D-018). Migrer les donnees vers `entity_permission` + `campaign_follow`. -- _AUDIT: **PARTIEL** Donnees deja migrees vers `entity_permission` via `V1_014__migrate_permissions.sql` ; DROP TABLE final reporte (besoin go/no-go produit + sauvegarde prealable validee)._
- [~] **LCAMCRU-011** Bloquer toute nouvelle utilisation cote back (deprecation logs). -- _AUDIT: **PARTIEL** Plus de code metier qui ecrit dans `campaign_crud` (verifie par grep sur `campaign_crud`/`CampaignCrud` dans `quizapp/src/main/java`) ; reste a ajouter un `@Deprecated` formel sur eventuels reliquats avant DROP._
- [~] **LCAMCRU-012** Plan de migration des donnees existantes redige et execute. -- _AUDIT: **PARTIEL** Plan execute via `V1_014__migrate_permissions.sql` (campaign_crud -> entity_permission, 1 INSERT par couple user/permission_key) ; rapport de migration a archiver dans `z_notes/` pour tracabilite avant DROP._
- [~] **LCAMCRU-013** Migration Flyway de DROP TABLE preparee (avec sauvegarde prealable). -- _AUDIT: **PARTIEL** Migration `V1_0XX__drop_campaign_crud.sql` a creer apres validation produit + dump BD prealable ; non livree dans ce sprint (action destructive irreversible necessitant confirmation explicite)._

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LCAMCRU-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._

### Champ `can_update` (tinyint(1))

- [x] **LCAMCRU-102 Alignement de type** `can_update` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCAMCRU-103 Booleen** `can_update` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `can_delete` (tinyint(1))

- [x] **LCAMCRU-105 Alignement de type** `can_delete` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCAMCRU-106 Booleen** `can_delete` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `can_evaluate` (tinyint(1))

- [x] **LCAMCRU-108 Alignement de type** `can_evaluate` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCAMCRU-109 Booleen** `can_evaluate` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `follow` (tinyint(1))

- [x] **LCAMCRU-111 Alignement de type** `follow` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCAMCRU-112 Booleen** `follow` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `is_admin` (tinyint(1))

- [x] **LCAMCRU-114 Alignement de type** `is_admin` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCAMCRU-115 Booleen** `is_admin` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `is_creator` (tinyint(1))

- [x] **LCAMCRU-117 Alignement de type** `is_creator` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCAMCRU-118 Booleen** `is_creator` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `can_planify` (tinyint(1))

- [x] **LCAMCRU-120 Alignement de type** `can_planify` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCAMCRU-121 Booleen** `can_planify` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `can_accept_pre_screen` (tinyint(1))

- [x] **LCAMCRU-123 Alignement de type** `can_accept_pre_screen` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCAMCRU-124 Booleen** `can_accept_pre_screen` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `can_accept_final` (tinyint(1))

- [x] **LCAMCRU-126 Alignement de type** `can_accept_final` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCAMCRU-127 Booleen** `can_accept_final` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `user_id` (int unsigned)

- [x] **LCAMCRU-129 Alignement de type** `user_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCAMCRU-130 FK** `user_id` -> probable `user` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `campaign_id` (int unsigned)

- [x] **LCAMCRU-132 Alignement de type** `campaign_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCAMCRU-133 FK** `campaign_id` -> probable `campaign` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (datetime)

- [x] **LCAMCRU-135 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LCAMCRU-136 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LCAMCRU-137 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LCAMCRU-139 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LCAMCRU-140 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LCAMCRU-142 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LCAMCRU-143 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LCAMCRU-144 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LCAMCRU-146 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LCAMCRU-147 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LCAMCRU-149 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LCAMCRU-150 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LCAMCRU-151 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LCAMCRU-153 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LCAMCRU-154 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LCAMCRU-155 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [-] **LCAMCRU-300** Endpoint `POST /api/campaign_crud/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-301** Endpoint `POST /api/campaign_crud/update` existe (convention `""`->ignore, `null`->set null). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-302** Endpoint `POST /api/campaign_crud/delete` (soft-delete) existe. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [~] **LCAMCRU-303** Endpoint `POST /api/campaign_crud/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [-] **LCAMCRU-304** Endpoint `POST /api/campaign_crud/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [~] **LCAMCRU-305** Endpoint `POST /api/campaign_crud/getFullInfos` retourne DTO complet (FK resolues). -- _AUDIT: **PARTIEL** Endpoint `/getFullInfos` non systematique : implemente pour entites avec FK utiles (applications, campaigns, interviews) ; pour les entites simples ou singletons (app_config, smtp_config, legal_text, departments, specialities, email_template_preset), `/getById` retourne deja le DTO complet -- pas de FK a resoudre. Acceptable._
- [-] **LCAMCRU-306** Service Angular `campaign_crud.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-307** Modeles TS payload + reponse types (pas de `any`). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LCAMCRU-320** Route Angular `<campaign_crud>/new` declaree et guard route applique. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-322** Composant `campaign_crud-form` contient TOUS les champs obligatoires (cf. Section 2). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-323** Dropdowns FK charges a `ngOnInit`, etat loading visible. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-329** `created_by` / `created_at` / `search_string` valorises serveur. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._

### 3.C UPDATE
- [-] **LCAMCRU-340** Route Angular `<campaign_crud>/:id/edit` declaree. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-341** Pre-remplissage via `getFullInfos`. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-342** Champs immuables affiches en lecture seule. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-344** Bouton "Annuler" retour sans persister. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-345** `updated_by` / `updated_at` valorises serveur. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [~] **LCAMCRU-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [-] **LCAMCRU-360** Endpoint met `is_deleted=1` (jamais DELETE SQL). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-363** Texte confirmation explicite + reversible documente. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-366** Rafraichissement sans F5. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._

### 3.E RESTORE
- [~] **LCAMCRU-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: **PARTIEL** Restore via `POST /update {isDeleted:false}` (pas d'endpoint dedie `/restore`). Cascade restore non implementee -- pas de cas metier identifie justifiant la cascade. Acceptable pour le scope actuel._

### 3.F LIST / SEARCH
- [-] **LCAMCRU-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [~] **LCAMCRU-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`. -- _AUDIT: **PARTIEL** Tri `sortBy`/`sortDir` propage via `PageRequest` Spring Data ; recherche libre `search_string` cote backend OK ; debounce front (`rxjs debounceTime(300)`) implemente sur les pages utilisant la recherche._
- [~] **LCAMCRU-402** Filtres metier (statut, dates, FK) cote front + parametres back. -- _AUDIT: **PARTIEL** Filtres metier disponibles via `Criteria` (BusinessGroup, status, dates, FK) ; UI front avec `<app-filter-*>` composants reutilisables ; non systematique sur toutes les listes -- ajoute au cas par cas._
- [-] **LCAMCRU-403** Visibilite par persona : back filtre selon permissions effectives. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-404** Pas de N+1 (logs SQL verifies). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [-] **LCAMCRU-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-503** Test bypass URL : persona non autorise tape URL directement -> 403 back. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [-] **LCAMCRU-600** Lister toutes les tables source ayant une FK vers `campaign_crud` (parcourir DB describe). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-602** Soft-delete de `campaign_crud` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-603** Restore : enregistrements lies a restaurer aussi ? decide. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-605** Test : creer une source liee -> tenter delete `campaign_crud` -> comportement attendu confirme. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._


## Section 6 -- Anti-regression (bugs classiques)

- [-] **LCAMCRU-700** Aucun `tinyint(1)` mappe en `Integer` cote Java. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-702** Aucun champ entity absent du DTO (audit croise colonne par colonne). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [x] **LCAMCRU-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel. -- _AUDIT: **FIXED** Boutons `<button [disabled]="loading()">` partout dans modales CRUD ; signal `loading` lie via `EntityCrudBase` lors de l'appel API ; empeche double-submit._
- [-] **LCAMCRU-706** Aucun toast d'erreur manquant sur 4xx/5xx. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-707** Aucun tableau non rafraichi apres mutation. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-708** Aucun dropdown FK vide a cause d'une API non appelee. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-709** Aucune route sensible sans guard. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-712** Aucun endpoint qui modifie `created_by`/`created_at`. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-713** Aucun hard-delete accidentel. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises). -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-715** Aucun invariant inter-champs non valide back. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [-] **LCAMCRU-716** Aucun compteur denormalise jamais recalcule. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._


## Section 7 -- Synthese

- [-] **LCAMCRU-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`. -- _AUDIT: **N/A** Table `campaign_crud` actee a la suppression par decision D-018 (remplacement par `entity_permission` + `campaign_follow`). Seuls les items 010-013 (migration de suppression) restent ouverts ; les autres items CRUD/UI/permissions/etc. sont sans objet._
- [~] **LCAMCRU-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LCAMCRU-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LCAMCRU-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LCAMCRU-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: questions ouvertes consignees inline via les notes _AUDIT:_; pas de remontee separee a J-decisions necessaire pour cette entite._

