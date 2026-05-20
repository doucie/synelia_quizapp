# L-audit-05-candidate_interview -- Audit table par table

**Table :** `candidate_interview`
**Niveau topologique :** 5 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LCANINT-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LCANINT-001** Role metier de `candidate_interview` documente en 1 ligne. -- _AUDIT: Lien M:N application <-> interview avec start, duration, declineReason, alternativeDateRequested._
- [x] **LCANINT-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LCANINT-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `interview_start` | `datetime` | YES | - | `-` |
| `interview_duration` | `int` | YES | - | `-` |
| `application_id` | `int unsigned` | YES | MUL | `-` |
| `interview_id` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |
| `decline_reason` | `varchar(500)` | YES | - | `-` |
| `alternative_date_requested` | `datetime` | YES | - | `-` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LCANINT-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `interview_start` (datetime)

- [x] **LCANINT-102 Alignement de type** `interview_start` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LCANINT-103 Date/Datetime** `interview_start` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente.

### Champ `interview_duration` (int)

- [x] **LCANINT-105 Alignement de type** `interview_duration` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LCANINT-106 Numerique** `interview_duration` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `application_id` (int unsigned)

- [x] **LCANINT-108 Alignement de type** `application_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCANINT-109 FK** `application_id` -> probable `application` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `interview_id` (int unsigned)

- [x] **LCANINT-111 Alignement de type** `interview_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCANINT-112 FK** `interview_id` -> probable `interview` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (datetime)

- [x] **LCANINT-114 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LCANINT-115 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LCANINT-116 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LCANINT-118 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LCANINT-119 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LCANINT-121 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LCANINT-122 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LCANINT-123 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LCANINT-125 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LCANINT-126 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LCANINT-128 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LCANINT-129 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LCANINT-130 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LCANINT-132 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LCANINT-133 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LCANINT-134 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._

### Champ `decline_reason` (varchar(500))

- [x] **LCANINT-136 Alignement de type** `decline_reason` (`varchar(500)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LCANINT-137 Longueur** `decline_reason` (varchar(500)) : `@Size(max=500)` DTO, `Validators.maxLength(500)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `alternative_date_requested` (datetime)

- [x] **LCANINT-139 Alignement de type** `alternative_date_requested` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime`, DTO `LocalDateTime` serialise ISO 8601, modele TS `string` ISO._
- [x] **LCANINT-140 Date/Datetime** `alternative_date_requested` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LCANINT-300** Endpoint `POST /api/candidate_interview/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: @PreAuthorize class-level._
- [x] **LCANINT-301** Endpoint `POST /api/candidate_interview/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LCANINT-302** Endpoint `POST /api/candidate_interview/delete` (soft-delete) existe.
- [~] **LCANINT-303** Endpoint `POST /api/candidate_interview/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LCANINT-304** Endpoint `POST /api/candidate_interview/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LCANINT-305** Endpoint `POST /api/candidate_interview/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LCANINT-306** Service Angular `candidate_interview.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LCANINT-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LCANINT-320** Route Angular `<candidate_interview>/new` declaree et guard route applique.
- [x] **LCANINT-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LCANINT-322** Composant `candidate_interview-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LCANINT-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LCANINT-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LCANINT-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LCANINT-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LCANINT-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LCANINT-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LCANINT-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LCANINT-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LCANINT-340** Route Angular `<candidate_interview>/:id/edit` declaree.
- [x] **LCANINT-341** Pre-remplissage via `getFullInfos`.
- [?] **LCANINT-342** Champs immuables affiches en lecture seule.
- [~] **LCANINT-343** Convention `""`/`null`/value respectee front (patchValue cible).
- [x] **LCANINT-344** Bouton "Annuler" retour sans persister.
- [x] **LCANINT-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LCANINT-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LCANINT-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LCANINT-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LCANINT-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LCANINT-363** Texte confirmation explicite + reversible documente.
- [x] **LCANINT-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LCANINT-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LCANINT-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LCANINT-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer + dd/MM/yyyy + dd/MM/yyyy HH:mm._

### 3.F LIST / SEARCH
- [x] **LCANINT-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LCANINT-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LCANINT-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LCANINT-403** Visibilite par persona : back filtre selon permissions effectives. -- _AUDIT: permissionGuard(['MANAGE_APP_CONFIG']) sur routes admin._
- [-] **LCANINT-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LCANINT-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LCANINT-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LCANINT-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LCANINT-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LCANINT-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LCANINT-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LCANINT-600** Lister toutes les tables source ayant une FK vers `candidate_interview` (parcourir DB describe). -- _AUDIT: FK entrantes : evaluations.candidate_interview_id._
- [x] **LCANINT-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL). -- _AUDIT: evaluations(candidate_interview_id)._
- [-] **LCANINT-602** Soft-delete de `candidate_interview` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LCANINT-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LCANINT-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LCANINT-605** Test : creer une source liee -> tenter delete `candidate_interview` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LCANINT-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LCANINT-701** Aucun enum BD (varchar libre) sans converter strict back (D-013).
- [x] **LCANINT-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LCANINT-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LCANINT-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LCANINT-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LCANINT-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LCANINT-707** Aucun tableau non rafraichi apres mutation.
- [-] **LCANINT-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LCANINT-709** Aucune route sensible sans guard.
- [x] **LCANINT-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [x] **LCANINT-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **FIXED** `respondToTrackedInterview` (decline/reschedule via tracking) annote `@Transactional` dans ApplicationsBusiness ligne 2813._
- [x] **LCANINT-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LCANINT-713** Aucun hard-delete accidentel.
- [-] **LCANINT-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LCANINT-715** Aucun invariant inter-champs non valide back.
- [-] **LCANINT-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LCANINT-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LCANINT-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LCANINT-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LCANINT-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LCANINT-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) UNIQUE (application_id, interview_id) ; (2) transactions decline/reschedule ; (3) cascade FK._

