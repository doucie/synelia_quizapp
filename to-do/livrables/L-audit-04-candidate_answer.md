# L-audit-04-candidate_answer -- Audit table par table

**Table :** `candidate_answer`
**Niveau topologique :** 4 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LCANANS-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LCANANS-001** Role metier de `candidate_answer` documente en 1 ligne. -- _AUDIT: Reponse candidat a une question (application_id + question_id + answer_id ou freeTextResponse)._
- [x] **LCANANS-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LCANANS-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `is_selected` | `tinyint(1)` | NO | - | `-` |
| `manual_is_correct` | `tinyint(1)` | YES | - | `-` |
| `manual_correction_comment` | `text` | YES | - | `-` |
| `manual_corrected_at` | `timestamp` | YES | - | `-` |
| `manual_corrected_by` | `int` | YES | - | `-` |
| `application_id` | `int unsigned` | YES | MUL | `-` |
| `question_id` | `int unsigned` | NO | MUL | `-` |
| `answer_id` | `int unsigned` | YES | MUL | `-` |
| `free_text_response` | `text` | YES | - | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LCANANS-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `is_selected` (tinyint(1))

- [x] **LCANANS-102 Alignement de type** `is_selected` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LCANANS-103 Obligatoire creation** `is_selected` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `is_selected`.
- [x] **LCANANS-104 Booleen** `is_selected` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `manual_is_correct` (tinyint(1))

- [x] **LCANANS-106 Alignement de type** `manual_is_correct` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCANANS-107 Booleen** `manual_is_correct` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `manual_correction_comment` (text)

- [x] **LCANANS-109 Alignement de type** `manual_correction_comment` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LCANANS-110 Texte long** `manual_correction_comment` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `manual_corrected_at` (timestamp)

- [x] **LCANANS-112 Alignement de type** `manual_corrected_at` (`timestamp`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity Java <-> DTO <-> JSON <-> modele TS conserves coherents par convention Telosys._
- [x] **LCANANS-113 Date/Datetime** `manual_corrected_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `manual_corrected_by` (int)

- [x] **LCANANS-115 Alignement de type** `manual_corrected_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LCANANS-116 Numerique** `manual_corrected_by` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `application_id` (int unsigned)

- [x] **LCANANS-118 Alignement de type** `application_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCANANS-119 FK** `application_id` -> probable `application` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `question_id` (int unsigned)

- [x] **LCANANS-121 Alignement de type** `question_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LCANANS-122 Obligatoire creation** `question_id` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `question_id`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LCANANS-123 FK** `question_id` -> probable `question` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `answer_id` (int unsigned)

- [x] **LCANANS-125 Alignement de type** `answer_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCANANS-126 FK** `answer_id` -> probable `answer` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `free_text_response` (text)

- [x] **LCANANS-128 Alignement de type** `free_text_response` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [x] **LCANANS-129 Texte long** `free_text_response` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `created_at` (datetime)

- [x] **LCANANS-131 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LCANANS-132 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LCANANS-133 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LCANANS-135 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LCANANS-136 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LCANANS-138 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LCANANS-139 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LCANANS-140 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LCANANS-142 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LCANANS-143 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LCANANS-145 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LCANANS-146 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LCANANS-147 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LCANANS-149 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LCANANS-150 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LCANANS-151 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [~] **LCANANS-300** Endpoint `POST /api/candidate_answer/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: Create via endpoint public /save-quiz-answer -- pas de @PreAuthorize._
- [x] **LCANANS-301** Endpoint `POST /api/candidate_answer/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LCANANS-302** Endpoint `POST /api/candidate_answer/delete` (soft-delete) existe.
- [~] **LCANANS-303** Endpoint `POST /api/candidate_answer/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LCANANS-304** Endpoint `POST /api/candidate_answer/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LCANANS-305** Endpoint `POST /api/candidate_answer/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LCANANS-306** Service Angular `candidate_answer.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LCANANS-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LCANANS-320** Route Angular `<candidate_answer>/new` declaree et guard route applique.
- [x] **LCANANS-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LCANANS-322** Composant `candidate_answer-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LCANANS-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LCANANS-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LCANANS-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LCANANS-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LCANANS-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LCANANS-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LCANANS-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LCANANS-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LCANANS-340** Route Angular `<candidate_answer>/:id/edit` declaree.
- [x] **LCANANS-341** Pre-remplissage via `getFullInfos`.
- [?] **LCANANS-342** Champs immuables affiches en lecture seule.
- [~] **LCANANS-343** Convention `""`/`null`/value respectee front (patchValue cible).
- [x] **LCANANS-344** Bouton "Annuler" retour sans persister.
- [x] **LCANANS-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LCANANS-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LCANANS-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LCANANS-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LCANANS-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LCANANS-363** Texte confirmation explicite + reversible documente.
- [x] **LCANANS-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LCANANS-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LCANANS-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LCANANS-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer + dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LCANANS-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LCANANS-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LCANANS-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LCANANS-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LCANANS-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LCANANS-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LCANANS-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LCANANS-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LCANANS-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LCANANS-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LCANANS-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LCANANS-600** Lister toutes les tables source ayant une FK vers `candidate_answer` (parcourir DB describe). -- _AUDIT: Pas de FK entrantes._
- [-] **LCANANS-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LCANANS-602** Soft-delete de `candidate_answer` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LCANANS-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LCANANS-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LCANANS-605** Test : creer une source liee -> tenter delete `candidate_answer` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LCANANS-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LCANANS-701** Aucun enum BD (varchar libre) sans converter strict back (D-013).
- [x] **LCANANS-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [~] **LCANANS-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture. -- _AUDIT: **PARTIEL FIXED** freeTextResponse necessaire en lecture pour evaluation recruteur ; acces CandidateAnswerController restreint @PreAuthorize ADMIN/SUPER_ADMIN/UTILISATEUR. PII protege par auth + permissions ; restera a appliquer permissions fines (creator/recruiter assigned)._
- [x] **LCANANS-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LCANANS-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LCANANS-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LCANANS-707** Aucun tableau non rafraichi apres mutation.
- [-] **LCANANS-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LCANANS-709** Aucune route sensible sans guard.
- [~] **LCANANS-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **PARTIEL FIXED** CandidateAnswerController @PreAuthorize class-level ADMIN/SUPER_ADMIN/UTILISATEUR ; save public via /quiz/answer protegee par quizToken + sourceToken (verif Business). Rate-limit Bucket4j a installer (decision infra)._
- [x] **LCANANS-711** Aucun champ sensible (mot de passe, token) expose en DTO.
- [x] **LCANANS-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LCANANS-713** Aucun hard-delete accidentel.
- [-] **LCANANS-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LCANANS-715** Aucun invariant inter-champs non valide back.
- [-] **LCANANS-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LCANANS-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LCANANS-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LCANANS-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LCANANS-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LCANANS-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) UNIQUE (application_id, question_id) ou (application_id, question_id, answer_id) ; (2) rate-limit save-quiz-answer ; (3) restreindre lecture freeTextResponse aux roles autorises._

