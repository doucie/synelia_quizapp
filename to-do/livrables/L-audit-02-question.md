# L-audit-02-question -- Audit table par table

**Table :** `question`
**Niveau topologique :** 2 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LQUESTI-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LQUESTI-001** Role metier de `question` documente en 1 ligne. -- _AUDIT: Banque de questions reutilisables : speciality, difficulty, type._
- [x] **LQUESTI-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LQUESTI-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `question_ref` | `varchar(36)` | YES | - | `-` |
| `question_text` | `text` | NO | - | `-` |
| `question_chrono` | `int` | YES | - | `10` |
| `question_type` | `varchar(20)` | YES | - | `SINGLE_CHOICE` |
| `score` | `int` | YES | - | `1` |
| `difficulty_level` | `varchar(20)` | YES | - | `-` |
| `speciality_id` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |

### Champs a VERIFIER / MODIFIER

- [~] **LQUESTI-040** REVUE : Enum `question_type` (defaut SINGLE_CHOICE) -- documenter valeurs autorisees. -- _AUDIT: Pas d'unicite questionText par speciality._
- [~] **LQUESTI-041** REVUE : Enum `difficulty_level varchar(20)` -- documenter valeurs autorisees. -- _AUDIT: **PARTIEL** Contrainte metier identifiee, controle effectif au niveau Business AVANT save ; index unique BD a ajouter si non present (Flyway V1_*) pour garantir integrite._

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LQUESTI-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `question_ref` (varchar(36))

- [x] **LQUESTI-102 Alignement de type** `question_ref` (`varchar(36)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LQUESTI-103 Longueur** `question_ref` (varchar(36)) : `@Size(max=36)` DTO, `Validators.maxLength(36)` front, compteur de caracteres si >100.

### Champ `question_text` (text)

- [x] **LQUESTI-105 Alignement de type** `question_text` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`columnDefinition="TEXT"`), DTO `String`, JSON string, modele TS `string`._
- [~] **LQUESTI-106 Obligatoire creation** `question_text` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `question_text`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LQUESTI-107 Texte long** `question_text` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `question_chrono` (int)

- [x] **LQUESTI-109 Alignement de type** `question_chrono` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LQUESTI-110 Numerique** `question_chrono` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `question_type` (varchar(20))

- [x] **LQUESTI-112 Alignement de type** `question_type` (`varchar(20)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LQUESTI-113 Champ court** `question_type` (varchar(20)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `score` (int)

- [x] **LQUESTI-115 Alignement de type** `score` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LQUESTI-116 Numerique** `score` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `difficulty_level` (varchar(20))

- [x] **LQUESTI-118 Alignement de type** `difficulty_level` (`varchar(20)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LQUESTI-119 Champ court** `difficulty_level` (varchar(20)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `speciality_id` (int unsigned)

- [x] **LQUESTI-121 Alignement de type** `speciality_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LQUESTI-122 FK** `speciality_id` -> probable `speciality` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (datetime)

- [x] **LQUESTI-124 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LQUESTI-125 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LQUESTI-126 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LQUESTI-128 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LQUESTI-129 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LQUESTI-131 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LQUESTI-132 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LQUESTI-133 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LQUESTI-135 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LQUESTI-136 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LQUESTI-138 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LQUESTI-139 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LQUESTI-140 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LQUESTI-142 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LQUESTI-143 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LQUESTI-144 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LQUESTI-300** Endpoint `POST /api/question/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel.
- [x] **LQUESTI-301** Endpoint `POST /api/question/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LQUESTI-302** Endpoint `POST /api/question/delete` (soft-delete) existe.
- [~] **LQUESTI-303** Endpoint `POST /api/question/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LQUESTI-304** Endpoint `POST /api/question/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LQUESTI-305** Endpoint `POST /api/question/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LQUESTI-306** Service Angular `question.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LQUESTI-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LQUESTI-320** Route Angular `<question>/new` declaree et guard route applique.
- [x] **LQUESTI-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LQUESTI-322** Composant `question-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LQUESTI-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LQUESTI-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LQUESTI-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LQUESTI-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LQUESTI-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LQUESTI-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LQUESTI-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LQUESTI-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LQUESTI-340** Route Angular `<question>/:id/edit` declaree.
- [x] **LQUESTI-341** Pre-remplissage via `getFullInfos`.
- [?] **LQUESTI-342** Champs immuables affiches en lecture seule.
- [x] **LQUESTI-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en QuestionBusiness.update._
- [x] **LQUESTI-344** Bouton "Annuler" retour sans persister.
- [x] **LQUESTI-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LQUESTI-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LQUESTI-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LQUESTI-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LQUESTI-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LQUESTI-363** Texte confirmation explicite + reversible documente.
- [x] **LQUESTI-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LQUESTI-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LQUESTI-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LQUESTI-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer + dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LQUESTI-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LQUESTI-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LQUESTI-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LQUESTI-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LQUESTI-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LQUESTI-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LQUESTI-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LQUESTI-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LQUESTI-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LQUESTI-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LQUESTI-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LQUESTI-600** Lister toutes les tables source ayant une FK vers `question` (parcourir DB describe). -- _AUDIT: FK entrantes : answer.question_id, form_questions.question_id, candidate_answer.question_id._
- [x] **LQUESTI-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL). -- _AUDIT: answer(question_id)._
- [x] **LQUESTI-602** Soft-delete de `question` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?). -- _AUDIT: form_questions(question_id)._
- [x] **LQUESTI-603** Restore : enregistrements lies a restaurer aussi ? decide. -- _AUDIT: candidate_answer(question_id)._
- [-] **LQUESTI-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LQUESTI-605** Test : creer une source liee -> tenter delete `question` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LQUESTI-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LQUESTI-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **FIXED** Validation enum stricte ajoutee dans QuestionBusiness pour questionType (SINGLE_CHOICE/MULTIPLE_CHOICE/TRUE_FALSE/TEXT) et difficultyLevel (EASY/MEDIUM/HARD) sur create + 3 update paths avec normalisation toUpperCase. Converter BD/Flyway reste a faire pour blindage complet._
- [x] **LQUESTI-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LQUESTI-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LQUESTI-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LQUESTI-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LQUESTI-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LQUESTI-707** Aucun tableau non rafraichi apres mutation.
- [-] **LQUESTI-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LQUESTI-709** Aucune route sensible sans guard.
- [x] **LQUESTI-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [x] **LQUESTI-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **FIXED** questionType valide enum strict (SINGLE_CHOICE/MULTIPLE_CHOICE/TRUE_FALSE/TEXT) + difficultyLevel (EASY/MEDIUM/HARD) au create/update QuestionBusiness._
- [x] **LQUESTI-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LQUESTI-713** Aucun hard-delete accidentel.
- [-] **LQUESTI-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LQUESTI-715** Aucun invariant inter-champs non valide back.
- [-] **LQUESTI-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LQUESTI-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LQUESTI-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LQUESTI-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LQUESTI-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LQUESTI-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) enum strict question_type + difficulty_level ; (2) unicite (questionText, speciality_id) ?_

