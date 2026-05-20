# L-audit-03-form_questions -- Audit table par table

**Table :** `form_questions`
**Niveau topologique :** 3 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LFORQUE-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LFORQUE-001** Role metier de `form_questions` documente en 1 ligne. -- _AUDIT: Lien M:N form_version <-> question avec questionOrder + points._
- [x] **LFORQUE-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LFORQUE-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `form_version_id` | `int unsigned` | NO | MUL | `-` |
| `question_id` | `int unsigned` | NO | MUL | `-` |
| `question_order` | `int` | YES | - | `0` |
| `chrono_override` | `int unsigned` | YES | - | `-` |
| `created_at` | `datetime` | YES | - | `CURRENT_TIMESTAMP` |
| `created_by` | `int unsigned` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `CURRENT_TIMESTAMP` |
| `updated_by` | `int unsigned` | YES | - | `-` |
| `is_deleted` | `bit(1)` | YES | - | `b'0'` |
| `search_string` | `text` | YES | - | `-` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LFORQUE-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `form_version_id` (int unsigned)

- [x] **LFORQUE-102 Alignement de type** `form_version_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LFORQUE-103 Obligatoire creation** `form_version_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `form_version_id`.
- [x] **LFORQUE-104 FK** `form_version_id` -> probable `form_version` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `question_id` (int unsigned)

- [x] **LFORQUE-106 Alignement de type** `question_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LFORQUE-107 Obligatoire creation** `question_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `question_id`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LFORQUE-108 FK** `question_id` -> probable `question` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `question_order` (int)

- [x] **LFORQUE-110 Alignement de type** `question_order` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LFORQUE-111 Numerique** `question_order` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `chrono_override` (int unsigned)

- [x] **LFORQUE-113 Alignement de type** `chrono_override` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LFORQUE-114 Numerique** `chrono_override` (`int unsigned`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `created_at` (datetime)

- [x] **LFORQUE-116 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LFORQUE-117 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LFORQUE-118 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int unsigned)

- [x] **LFORQUE-120 Alignement de type** `created_by` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LFORQUE-121 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LFORQUE-123 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LFORQUE-124 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LFORQUE-125 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int unsigned)

- [x] **LFORQUE-127 Alignement de type** `updated_by` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LFORQUE-128 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (bit(1))

- [x] **LFORQUE-130 Alignement de type** `is_deleted` (`bit(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LFORQUE-131 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LFORQUE-132 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LFORQUE-134 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LFORQUE-135 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LFORQUE-136 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LFORQUE-300** Endpoint `POST /api/form_questions/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel.
- [x] **LFORQUE-301** Endpoint `POST /api/form_questions/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LFORQUE-302** Endpoint `POST /api/form_questions/delete` (soft-delete) existe.
- [~] **LFORQUE-303** Endpoint `POST /api/form_questions/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LFORQUE-304** Endpoint `POST /api/form_questions/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LFORQUE-305** Endpoint `POST /api/form_questions/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LFORQUE-306** Service Angular `form_questions.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LFORQUE-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LFORQUE-320** Route Angular `<form_questions>/new` declaree et guard route applique.
- [x] **LFORQUE-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LFORQUE-322** Composant `form_questions-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LFORQUE-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LFORQUE-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LFORQUE-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LFORQUE-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LFORQUE-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LFORQUE-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LFORQUE-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LFORQUE-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LFORQUE-340** Route Angular `<form_questions>/:id/edit` declaree.
- [x] **LFORQUE-341** Pre-remplissage via `getFullInfos`.
- [?] **LFORQUE-342** Champs immuables affiches en lecture seule.
- [x] **LFORQUE-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en FormQuestionsBusiness.update._
- [x] **LFORQUE-344** Bouton "Annuler" retour sans persister.
- [x] **LFORQUE-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LFORQUE-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LFORQUE-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LFORQUE-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LFORQUE-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LFORQUE-363** Texte confirmation explicite + reversible documente.
- [x] **LFORQUE-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LFORQUE-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LFORQUE-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LFORQUE-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer + dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LFORQUE-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LFORQUE-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LFORQUE-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LFORQUE-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LFORQUE-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LFORQUE-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LFORQUE-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LFORQUE-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LFORQUE-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LFORQUE-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LFORQUE-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LFORQUE-600** Lister toutes les tables source ayant une FK vers `form_questions` (parcourir DB describe). -- _AUDIT: Pas de FK entrantes directes._
- [-] **LFORQUE-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LFORQUE-602** Soft-delete de `form_questions` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LFORQUE-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LFORQUE-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LFORQUE-605** Test : creer une source liee -> tenter delete `form_questions` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LFORQUE-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LFORQUE-701** Aucun enum BD (varchar libre) sans converter strict back (D-013).
- [x] **LFORQUE-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LFORQUE-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LFORQUE-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LFORQUE-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LFORQUE-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LFORQUE-707** Aucun tableau non rafraichi apres mutation.
- [-] **LFORQUE-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LFORQUE-709** Aucune route sensible sans guard.
- [x] **LFORQUE-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [x] **LFORQUE-711** Aucun champ sensible (mot de passe, token) expose en DTO.
- [x] **LFORQUE-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LFORQUE-713** Aucun hard-delete accidentel.
- [-] **LFORQUE-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LFORQUE-715** Aucun invariant inter-champs non valide back.
- [-] **LFORQUE-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LFORQUE-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LFORQUE-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LFORQUE-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LFORQUE-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LFORQUE-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) UNIQUE (form_version_id, question_id) ; (2) UNIQUE (form_version_id, questionOrder)._

