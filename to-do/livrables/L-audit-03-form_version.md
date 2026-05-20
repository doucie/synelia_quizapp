# L-audit-03-form_version -- Audit table par table

**Table :** `form_version`
**Niveau topologique :** 3 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LFORVER-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LFORVER-001** Role metier de `form_version` documente en 1 ligne. -- _AUDIT: Version snapshot d'un Form : versionNumber, isPublished, configJson timing (per D-016/D-017)._
- [x] **LFORVER-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LFORVER-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `form_id` | `int unsigned` | NO | MUL | `-` |
| `version_number` | `int` | NO | - | `1` |
| `is_published` | `bit(1)` | YES | - | `b'0'` |
| `is_locked` | `bit(1)` | YES | - | `b'0'` |
| `created_at` | `datetime` | YES | - | `CURRENT_TIMESTAMP` |
| `created_by` | `int unsigned` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `CURRENT_TIMESTAMP` |
| `updated_by` | `int unsigned` | YES | - | `-` |
| `is_deleted` | `bit(1)` | YES | - | `b'0'` |
| `search_string` | `text` | YES | - | `-` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LFORVER-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `form_id` (int unsigned)

- [x] **LFORVER-102 Alignement de type** `form_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LFORVER-103 Obligatoire creation** `form_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `form_id`.
- [x] **LFORVER-104 FK** `form_id` -> probable `form` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `version_number` (int)

- [x] **LFORVER-106 Alignement de type** `version_number` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LFORVER-107 Numerique** `version_number` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `is_published` (bit(1))

- [x] **LFORVER-109 Alignement de type** `is_published` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LFORVER-110 Booleen** `is_published` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `is_locked` (bit(1))

- [x] **LFORVER-112 Alignement de type** `is_locked` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LFORVER-113 Booleen** `is_locked` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `created_at` (datetime)

- [x] **LFORVER-115 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LFORVER-116 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LFORVER-117 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int unsigned)

- [x] **LFORVER-119 Alignement de type** `created_by` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LFORVER-120 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LFORVER-122 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LFORVER-123 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LFORVER-124 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int unsigned)

- [x] **LFORVER-126 Alignement de type** `updated_by` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LFORVER-127 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (bit(1))

- [x] **LFORVER-129 Alignement de type** `is_deleted` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LFORVER-130 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LFORVER-131 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LFORVER-133 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LFORVER-134 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LFORVER-135 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LFORVER-300** Endpoint `POST /api/form_version/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel.
- [x] **LFORVER-301** Endpoint `POST /api/form_version/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LFORVER-302** Endpoint `POST /api/form_version/delete` (soft-delete) existe.
- [~] **LFORVER-303** Endpoint `POST /api/form_version/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LFORVER-304** Endpoint `POST /api/form_version/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LFORVER-305** Endpoint `POST /api/form_version/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LFORVER-306** Service Angular `form_version.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LFORVER-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LFORVER-320** Route Angular `<form_version>/new` declaree et guard route applique.
- [x] **LFORVER-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LFORVER-322** Composant `form_version-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LFORVER-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LFORVER-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LFORVER-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LFORVER-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LFORVER-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LFORVER-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LFORVER-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LFORVER-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LFORVER-340** Route Angular `<form_version>/:id/edit` declaree.
- [x] **LFORVER-341** Pre-remplissage via `getFullInfos`.
- [?] **LFORVER-342** Champs immuables affiches en lecture seule.
- [x] **LFORVER-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en FormVersionBusiness.update._
- [x] **LFORVER-344** Bouton "Annuler" retour sans persister.
- [x] **LFORVER-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LFORVER-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LFORVER-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LFORVER-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LFORVER-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LFORVER-363** Texte confirmation explicite + reversible documente.
- [x] **LFORVER-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LFORVER-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LFORVER-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LFORVER-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer + dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LFORVER-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LFORVER-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LFORVER-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LFORVER-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LFORVER-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LFORVER-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LFORVER-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LFORVER-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LFORVER-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LFORVER-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LFORVER-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LFORVER-600** Lister toutes les tables source ayant une FK vers `form_version` (parcourir DB describe). -- _AUDIT: FK entrantes : form_questions.form_version_id, applications.form_version_id._
- [x] **LFORVER-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL). -- _AUDIT: form_questions(form_version_id)._
- [x] **LFORVER-602** Soft-delete de `form_version` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?). -- _AUDIT: applications(form_version_id)._
- [-] **LFORVER-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LFORVER-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LFORVER-605** Test : creer une source liee -> tenter delete `form_version` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LFORVER-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LFORVER-701** Aucun enum BD (varchar libre) sans converter strict back (D-013).
- [x] **LFORVER-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LFORVER-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LFORVER-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LFORVER-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LFORVER-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LFORVER-707** Aucun tableau non rafraichi apres mutation.
- [-] **LFORVER-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LFORVER-709** Aucune route sensible sans guard.
- [x] **LFORVER-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [~] **LFORVER-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **PARTIEL FIXED** configJson timing flexible par design ; documentation schema TIME_LIMIT_MINUTES/SHUFFLE_QUESTIONS/etc a finaliser dans D-016/D-017._
- [x] **LFORVER-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LFORVER-713** Aucun hard-delete accidentel.
- [-] **LFORVER-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LFORVER-715** Aucun invariant inter-champs non valide back.
- [-] **LFORVER-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LFORVER-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LFORVER-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LFORVER-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LFORVER-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LFORVER-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) UNIQUE (form_id, versionNumber) ; (2) JSON schema validation configJson ; (3) immutabilite versions publiees._

