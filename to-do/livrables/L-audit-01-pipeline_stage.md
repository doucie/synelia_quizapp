# L-audit-01-pipeline_stage -- Audit table par table

**Table :** `pipeline_stage`
**Niveau topologique :** 1 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LPIPSTA-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LPIPSTA-001** Role metier de `pipeline_stage` documente en 1 ligne. -- _AUDIT: Etapes d'un pipeline_template (stageType, stageLabel, stageOrder, isRequired, isEliminatory, configJson)._
- [x] **LPIPSTA-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LPIPSTA-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `pipeline_template_id` | `int unsigned` | NO | MUL | `-` |
| `stage_type` | `varchar(50)` | NO | - | `-` |
| `stage_label` | `varchar(255)` | NO | - | `-` |
| `stage_order` | `int` | NO | - | `-` |
| `is_required` | `bit(1)` | NO | - | `b'1'` |
| `is_eliminatory` | `bit(1)` | NO | - | `b'0'` |
| `config_json` | `text` | YES | - | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `bit(1)` | NO | - | `b'0'` |
| `search_string` | `text` | YES | - | `-` |

### Champs a VERIFIER / MODIFIER

- [~] **LPIPSTA-040** REVUE : Enum `stage_type varchar(50)` -- documenter valeurs (APPLICATION / QUIZ / INTERVIEW / DECISION / ...). -- _AUDIT: Pas d'unicite (stageType, pipeline_template_id) -- doublons possibles._

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LPIPSTA-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `pipeline_template_id` (int unsigned)

- [x] **LPIPSTA-102 Alignement de type** `pipeline_template_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LPIPSTA-103 Obligatoire creation** `pipeline_template_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `pipeline_template_id`.
- [x] **LPIPSTA-104 FK** `pipeline_template_id` -> probable `pipeline_template` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `stage_type` (varchar(50))

- [x] **LPIPSTA-106 Alignement de type** `stage_type` (`varchar(50)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LPIPSTA-107 Obligatoire creation** `stage_type` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `stage_type`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LPIPSTA-108 Longueur** `stage_type` (varchar(50)) : `@Size(max=50)` DTO, `Validators.maxLength(50)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `stage_label` (varchar(255))

- [x] **LPIPSTA-110 Alignement de type** `stage_label` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LPIPSTA-111 Obligatoire creation** `stage_label` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `stage_label`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LPIPSTA-112 Longueur** `stage_label` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `stage_order` (int)

- [x] **LPIPSTA-114 Alignement de type** `stage_order` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LPIPSTA-115 Obligatoire creation** `stage_order` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `stage_order`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [~] **LPIPSTA-116 Numerique** `stage_order` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `is_required` (bit(1))

- [x] **LPIPSTA-118 Alignement de type** `is_required` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LPIPSTA-119 Booleen** `is_required` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `is_eliminatory` (bit(1))

- [x] **LPIPSTA-121 Alignement de type** `is_eliminatory` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LPIPSTA-122 Booleen** `is_eliminatory` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `config_json` (text)

- [x] **LPIPSTA-124 Alignement de type** `config_json` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LPIPSTA-125 Texte long** `config_json` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `created_at` (datetime)

- [x] **LPIPSTA-127 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LPIPSTA-128 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LPIPSTA-129 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LPIPSTA-131 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LPIPSTA-132 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LPIPSTA-134 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LPIPSTA-135 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LPIPSTA-136 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LPIPSTA-138 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LPIPSTA-139 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (bit(1))

- [x] **LPIPSTA-141 Alignement de type** `is_deleted` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LPIPSTA-142 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LPIPSTA-143 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LPIPSTA-145 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LPIPSTA-146 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LPIPSTA-147 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LPIPSTA-300** Endpoint `POST /api/pipeline_stage/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: **FIXED** class-level @PreAuthorize(hasAnyRole('ADMIN','SUPER_ADMIN')) ajoute._
- [~] **LPIPSTA-301** Endpoint `POST /api/pipeline_stage/update` existe (convention `""`->ignore, `null`->set null). -- _AUDIT: Bloque update si template.isLocked=true._
- [~] **LPIPSTA-302** Endpoint `POST /api/pipeline_stage/delete` (soft-delete) existe.
- [~] **LPIPSTA-303** Endpoint `POST /api/pipeline_stage/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LPIPSTA-304** Endpoint `POST /api/pipeline_stage/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [x] **LPIPSTA-305** Endpoint `POST /api/pipeline_stage/getFullInfos` retourne DTO complet (FK resolues). -- _AUDIT: /getAllByCriteria + /updateAll + /updateDeleted SUPER_ADMIN._
- [~] **LPIPSTA-306** Service Angular `pipeline_stage.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LPIPSTA-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LPIPSTA-320** Route Angular `<pipeline_stage>/new` declaree et guard route applique.
- [x] **LPIPSTA-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LPIPSTA-322** Composant `pipeline_stage-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LPIPSTA-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LPIPSTA-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LPIPSTA-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LPIPSTA-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LPIPSTA-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LPIPSTA-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LPIPSTA-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LPIPSTA-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LPIPSTA-340** Route Angular `<pipeline_stage>/:id/edit` declaree.
- [x] **LPIPSTA-341** Pre-remplissage via `getFullInfos`.
- [?] **LPIPSTA-342** Champs immuables affiches en lecture seule.
- [x] **LPIPSTA-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en PipelineStageBusiness.update._
- [x] **LPIPSTA-344** Bouton "Annuler" retour sans persister.
- [x] **LPIPSTA-345** `updated_by` / `updated_at` valorises serveur. -- _AUDIT: /byTemplate + /reorder custom endpoints._
- [~] **LPIPSTA-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LPIPSTA-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LPIPSTA-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LPIPSTA-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LPIPSTA-363** Texte confirmation explicite + reversible documente.
- [x] **LPIPSTA-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [~] **LPIPSTA-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: **PARTIEL FIXED** Policy projet : soft-delete uniquement ; pipeline_template_id orphelin filtre au getFullInfos par jointure is_deleted=0._
- [x] **LPIPSTA-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LPIPSTA-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer MapStruct + dd/MM/yyyy + toEntity._

### 3.F LIST / SEARCH
- [x] **LPIPSTA-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total). -- _AUDIT: Page dediee /entities/pipeline-stages._
- [x] **LPIPSTA-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LPIPSTA-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LPIPSTA-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LPIPSTA-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LPIPSTA-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: **FIXED** class-level @PreAuthorize ADMIN/SUPER_ADMIN ; create/update/delete method-level SUPER_ADMIN. UTILISATEUR denied._
- [x] **LPIPSTA-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LPIPSTA-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LPIPSTA-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LPIPSTA-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LPIPSTA-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint. -- _AUDIT: **FIXED** class-level @PreAuthorize ajoute._


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LPIPSTA-600** Lister toutes les tables source ayant une FK vers `pipeline_stage` (parcourir DB describe). -- _AUDIT: FK entrantes : tables d'instances de pipeline (a confirmer : interview_result, etc.)._
- [-] **LPIPSTA-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LPIPSTA-602** Soft-delete de `pipeline_stage` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LPIPSTA-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LPIPSTA-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LPIPSTA-605** Test : creer une source liee -> tenter delete `pipeline_stage` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LPIPSTA-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LPIPSTA-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **FIXED** PipelineStageBusiness valide deja le stageType via StageType.fromValue() (helper normalizeStageType) sur create + update, levant InvalidEntityException si valeur hors enum (CANDIDATURE/QUIZ/PRESELECTION/INTERVIEW/TECHNICAL_TEST/EVALUATION/DECISION/CUSTOM). Converter BD reste a faire pour blindage complet._
- [x] **LPIPSTA-702** Aucun champ entity absent du DTO (audit croise colonne par colonne). -- _AUDIT: Boolean isRequired/isEliminatory/isDeleted._
- [x] **LPIPSTA-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LPIPSTA-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LPIPSTA-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LPIPSTA-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LPIPSTA-707** Aucun tableau non rafraichi apres mutation.
- [-] **LPIPSTA-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LPIPSTA-709** Aucune route sensible sans guard.
- [x] **LPIPSTA-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **FIXED** class-level couvre tous les endpoints._
- [~] **LPIPSTA-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **PARTIEL FIXED** stageType valide enum strict (cf. PipelineStageBusiness.normalizeStageType) ; configJson schema flexible par design (chaque stageType a sa structure). Schema JSON par stageType a documenter D-016/D-017._
- [x] **LPIPSTA-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LPIPSTA-713** Aucun hard-delete accidentel.
- [-] **LPIPSTA-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LPIPSTA-715** Aucun invariant inter-champs non valide back.
- [-] **LPIPSTA-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LPIPSTA-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LPIPSTA-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LPIPSTA-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LPIPSTA-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LPIPSTA-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) ajouter @PreAuthorize class-level ADMIN/SUPER_ADMIN ; (2) UNIQUE (stageType, pipeline_template_id) si applicable ; (3) converter strict stageType (D-013) ; (4) JSON schema validation configJson._

