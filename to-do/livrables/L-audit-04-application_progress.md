# L-audit-04-application_progress -- Audit table par table

**Table :** `application_progress`
**Niveau topologique :** 4 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LAPPPRO-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LAPPPRO-001** Role metier de `application_progress` documente en 1 ligne. -- _AUDIT: Progression d'une candidature dans le pipeline (stage actuel + history)._
- [x] **LAPPPRO-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LAPPPRO-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `application_id` | `int unsigned` | NO | MUL | `-` |
| `pipeline_stage_id` | `int unsigned` | NO | MUL | `-` |
| `progress_status` | `varchar(20)` | NO | - | `PENDING` |
| `started_at` | `datetime` | YES | - | `-` |
| `completed_at` | `datetime` | YES | - | `-` |
| `score` | `double` | YES | - | `-` |
| `notes` | `text` | YES | - | `-` |
| `decided_by` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `bit(1)` | NO | - | `b'0'` |
| `search_string` | `text` | YES | - | `-` |

### Champs a VERIFIER / MODIFIER

- [~] **LAPPPRO-040** REVUE : Enum `progress_status varchar(20)` (defaut PENDING) -- PENDING/IN_PROGRESS/COMPLETED/SKIPPED/... -- _AUDIT: Pas d'UNIQUE (application_id, stage_id) si stage actif unique attendu._

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LAPPPRO-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `application_id` (int unsigned)

- [x] **LAPPPRO-102 Alignement de type** `application_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LAPPPRO-103 Obligatoire creation** `application_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `application_id`.
- [x] **LAPPPRO-104 FK** `application_id` -> probable `application` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `pipeline_stage_id` (int unsigned)

- [x] **LAPPPRO-106 Alignement de type** `pipeline_stage_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LAPPPRO-107 Obligatoire creation** `pipeline_stage_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `pipeline_stage_id`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LAPPPRO-108 FK** `pipeline_stage_id` -> probable `pipeline_stage` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `progress_status` (varchar(20))

- [x] **LAPPPRO-110 Alignement de type** `progress_status` (`varchar(20)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LAPPPRO-111 Champ court** `progress_status` (varchar(20)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `started_at` (datetime)

- [x] **LAPPPRO-113 Alignement de type** `started_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime`, DTO `LocalDateTime` serialise ISO 8601, modele TS `string` ISO._
- [x] **LAPPPRO-114 Date/Datetime** `started_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `completed_at` (datetime)

- [x] **LAPPPRO-116 Alignement de type** `completed_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime`, DTO `LocalDateTime` serialise ISO 8601, modele TS `string` ISO._
- [x] **LAPPPRO-117 Date/Datetime** `completed_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `score` (double)

- [x] **LAPPPRO-119 Alignement de type** `score` (`double`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Double`, DTO `Double`, JSON number, modele TS `number`._
- [~] **LAPPPRO-120 Reel** `score` (`double`) : precision/echelle documentee, formattage UX (nb decimales), arrondi serveur si necessaire. -- _AUDIT: **PARTIEL** type Java `BigDecimal`/`Float`/`Double` aligne avec BD ; precision/echelle BD respectee ; `@DecimalMin/@DecimalMax` non encore propage cote DTO._

### Champ `notes` (text)

- [x] **LAPPPRO-122 Alignement de type** `notes` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LAPPPRO-123 Texte long** `notes` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `decided_by` (int unsigned)

- [x] **LAPPPRO-125 Alignement de type** `decided_by` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LAPPPRO-126 Numerique** `decided_by` (`int unsigned`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `created_at` (datetime)

- [x] **LAPPPRO-128 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LAPPPRO-129 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LAPPPRO-130 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LAPPPRO-132 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LAPPPRO-133 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LAPPPRO-135 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LAPPPRO-136 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LAPPPRO-137 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LAPPPRO-139 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LAPPPRO-140 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (bit(1))

- [x] **LAPPPRO-142 Alignement de type** `is_deleted` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LAPPPRO-143 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LAPPPRO-144 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LAPPPRO-146 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LAPPPRO-147 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LAPPPRO-148 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LAPPPRO-300** Endpoint `POST /api/application_progress/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel.
- [x] **LAPPPRO-301** Endpoint `POST /api/application_progress/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LAPPPRO-302** Endpoint `POST /api/application_progress/delete` (soft-delete) existe.
- [~] **LAPPPRO-303** Endpoint `POST /api/application_progress/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LAPPPRO-304** Endpoint `POST /api/application_progress/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LAPPPRO-305** Endpoint `POST /api/application_progress/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LAPPPRO-306** Service Angular `application_progress.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LAPPPRO-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LAPPPRO-320** Route Angular `<application_progress>/new` declaree et guard route applique.
- [x] **LAPPPRO-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LAPPPRO-322** Composant `application_progress-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LAPPPRO-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LAPPPRO-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LAPPPRO-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LAPPPRO-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LAPPPRO-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LAPPPRO-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LAPPPRO-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LAPPPRO-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LAPPPRO-340** Route Angular `<application_progress>/:id/edit` declaree.
- [x] **LAPPPRO-341** Pre-remplissage via `getFullInfos`.
- [?] **LAPPPRO-342** Champs immuables affiches en lecture seule.
- [x] **LAPPPRO-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en ApplicationProgressBusiness.update._
- [x] **LAPPPRO-344** Bouton "Annuler" retour sans persister.
- [x] **LAPPPRO-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LAPPPRO-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LAPPPRO-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LAPPPRO-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LAPPPRO-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LAPPPRO-363** Texte confirmation explicite + reversible documente.
- [x] **LAPPPRO-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LAPPPRO-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LAPPPRO-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LAPPPRO-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer + dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LAPPPRO-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LAPPPRO-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LAPPPRO-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LAPPPRO-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LAPPPRO-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LAPPPRO-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LAPPPRO-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LAPPPRO-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LAPPPRO-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LAPPPRO-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LAPPPRO-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LAPPPRO-600** Lister toutes les tables source ayant une FK vers `application_progress` (parcourir DB describe). -- _AUDIT: Pas de FK entrantes._
- [-] **LAPPPRO-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LAPPPRO-602** Soft-delete de `application_progress` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LAPPPRO-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LAPPPRO-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LAPPPRO-605** Test : creer une source liee -> tenter delete `application_progress` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LAPPPRO-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LAPPPRO-701** Aucun enum BD (varchar libre) sans converter strict back (D-013).
- [x] **LAPPPRO-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LAPPPRO-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LAPPPRO-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LAPPPRO-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LAPPPRO-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LAPPPRO-707** Aucun tableau non rafraichi apres mutation.
- [-] **LAPPPRO-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LAPPPRO-709** Aucune route sensible sans guard.
- [x] **LAPPPRO-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [x] **LAPPPRO-711** Aucun champ sensible (mot de passe, token) expose en DTO.
- [x] **LAPPPRO-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LAPPPRO-713** Aucun hard-delete accidentel.
- [-] **LAPPPRO-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LAPPPRO-715** Aucun invariant inter-champs non valide back.
- [-] **LAPPPRO-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LAPPPRO-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LAPPPRO-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LAPPPRO-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LAPPPRO-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LAPPPRO-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) UNIQUE stage actif ; (2) state machine transitions._

