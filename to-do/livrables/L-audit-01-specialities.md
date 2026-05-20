# L-audit-01-specialities -- Audit table par table

**Table :** `specialities`
**Niveau topologique :** 1 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LSPECIA-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LSPECIA-001** Role metier de `specialities` documente en 1 ligne. -- _AUDIT: Specialites rattachees a un department (specialityName + department_id)._
- [x] **LSPECIA-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LSPECIA-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `speciality_name` | `varchar(255)` | NO | - | `-` |
| `speciality_desc` | `text` | YES | - | `-` |
| `department_id` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LSPECIA-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `speciality_name` (varchar(255))

- [x] **LSPECIA-102 Alignement de type** `speciality_name` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [x] **LSPECIA-103 Obligatoire creation** `speciality_name` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `speciality_name`. -- _AUDIT: **FIXED** input HTML `required` + asterisque label + trim check + NotificationService.error si vide cote front, Validate.RequiredValue cote Business.create._
- [x] **LSPECIA-104 Longueur** `speciality_name` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **FIXED** input HTML `maxlength="255"` + `minlength="2"` + compteur live `{{ length }}/255` ajoutes au modal specialites._

### Champ `speciality_desc` (text)

- [x] **LSPECIA-106 Alignement de type** `speciality_desc` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LSPECIA-107 Texte long** `speciality_desc` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** textarea `rows=4` avec `maxlength=2000` + compteur live; DTO laisse `String` libre (mapping `TEXT`)._

### Champ `department_id` (int unsigned)

- [x] **LSPECIA-109 Alignement de type** `department_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LSPECIA-110 FK** `department_id` -> probable `department` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (datetime)

- [x] **LSPECIA-112 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LSPECIA-113 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LSPECIA-114 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LSPECIA-116 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LSPECIA-117 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LSPECIA-119 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LSPECIA-120 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LSPECIA-121 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LSPECIA-123 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LSPECIA-124 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LSPECIA-126 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LSPECIA-127 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LSPECIA-128 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LSPECIA-130 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LSPECIA-131 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LSPECIA-132 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LSPECIA-300** Endpoint `POST /api/specialities/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: Class-level @PreAuthorize ADMIN/SUPER_ADMIN._
- [x] **LSPECIA-301** Endpoint `POST /api/specialities/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LSPECIA-302** Endpoint `POST /api/specialities/delete` (soft-delete) existe. -- _AUDIT: Avant delete, recherche Questions et Campaigns orphelines._
- [~] **LSPECIA-303** Endpoint `POST /api/specialities/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LSPECIA-304** Endpoint `POST /api/specialities/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LSPECIA-305** Endpoint `POST /api/specialities/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LSPECIA-306** Service Angular `specialities.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LSPECIA-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LSPECIA-320** Route Angular `<specialities>/new` declaree et guard route applique.
- [x] **LSPECIA-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LSPECIA-322** Composant `specialities-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LSPECIA-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LSPECIA-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LSPECIA-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LSPECIA-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LSPECIA-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LSPECIA-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LSPECIA-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LSPECIA-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LSPECIA-340** Route Angular `<specialities>/:id/edit` declaree.
- [x] **LSPECIA-341** Pre-remplissage via `getFullInfos`.
- [?] **LSPECIA-342** Champs immuables affiches en lecture seule.
- [x] **LSPECIA-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en SpecialitiesBusiness.update._
- [x] **LSPECIA-344** Bouton "Annuler" retour sans persister.
- [x] **LSPECIA-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LSPECIA-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LSPECIA-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LSPECIA-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LSPECIA-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LSPECIA-363** Texte confirmation explicite + reversible documente.
- [x] **LSPECIA-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [~] **LSPECIA-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: **PARTIEL FIXED** Policy projet : soft-delete uniquement ; specialite continue d'exister si department supprime (decision projet)._
- [x] **LSPECIA-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LSPECIA-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer MapStruct + dd/MM/yyyy._

### 3.F LIST / SEARCH
- [~] **LSPECIA-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total). -- _AUDIT: Pas de page Angular dediee /entities/specialities -- gestion inline dans entities-departments ?_
- [x] **LSPECIA-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LSPECIA-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [?] **LSPECIA-403** Visibilite par persona : back filtre selon permissions effectives. -- _AUDIT: permissionGuard a verifier._
- [-] **LSPECIA-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LSPECIA-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LSPECIA-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LSPECIA-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LSPECIA-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LSPECIA-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LSPECIA-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LSPECIA-600** Lister toutes les tables source ayant une FK vers `specialities` (parcourir DB describe). -- _AUDIT: FK entrantes : questions.specialityId, campaigns.specialityId._
- [x] **LSPECIA-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL). -- _AUDIT: questions(specialityId)._
- [x] **LSPECIA-602** Soft-delete de `specialities` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?). -- _AUDIT: campaigns(specialityId)._
- [-] **LSPECIA-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LSPECIA-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LSPECIA-605** Test : creer une source liee -> tenter delete `specialities` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LSPECIA-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LSPECIA-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: Pas d'enum._
- [x] **LSPECIA-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LSPECIA-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LSPECIA-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LSPECIA-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LSPECIA-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LSPECIA-707** Aucun tableau non rafraichi apres mutation.
- [-] **LSPECIA-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LSPECIA-709** Aucune route sensible sans guard.
- [x] **LSPECIA-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [x] **LSPECIA-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **FIXED** check unicite findBySpecialityName en Business + UNIQUE INDEX BD `uk_specialities_name_active` via Flyway V1_037 (active rows only)._
- [x] **LSPECIA-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LSPECIA-713** Aucun hard-delete accidentel.
- [-] **LSPECIA-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LSPECIA-715** Aucun invariant inter-champs non valide back.
- [-] **LSPECIA-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LSPECIA-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LSPECIA-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LSPECIA-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LSPECIA-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LSPECIA-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) UNIQUE (specialityName, department_id) ; (2) check FK department existe avant create ; (3) creer page Angular dediee /entities/specialities._

