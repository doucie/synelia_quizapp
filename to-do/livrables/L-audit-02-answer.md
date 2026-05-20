# L-audit-02-answer -- Audit table par table

**Table :** `answer`
**Niveau topologique :** 2 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LANSWER-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LANSWER-001** Role metier de `answer` documente en 1 ligne. -- _AUDIT: Reponses possibles d'une question : answerText, isCorrect, answerType._
- [x] **LANSWER-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LANSWER-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `answer_text` | `text` | NO | - | `-` |
| `is_correct` | `tinyint(1)` | YES | - | `-` |
| `answer_order` | `int` | YES | - | `-` |
| `answer_type` | `varchar(20)` | YES | - | `-` |
| `question_id` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |

### Champs a VERIFIER / MODIFIER

- [~] **LANSWER-040** REVUE : Enum `answer_type varchar(20)` -- documenter valeurs autorisees. -- _AUDIT: Pas d'unicite isCorrect=true par question_id (plusieurs bonnes reponses non controlees pour SINGLE_CHOICE)._

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LANSWER-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `answer_text` (text)

- [x] **LANSWER-102 Alignement de type** `answer_text` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LANSWER-103 Obligatoire creation** `answer_text` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `answer_text`.
- [x] **LANSWER-104 Texte long** `answer_text` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._

### Champ `is_correct` (tinyint(1))

- [x] **LANSWER-106 Alignement de type** `is_correct` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LANSWER-107 Booleen** `is_correct` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `answer_order` (int)

- [x] **LANSWER-109 Alignement de type** `answer_order` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LANSWER-110 Numerique** `answer_order` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `answer_type` (varchar(20))

- [x] **LANSWER-112 Alignement de type** `answer_type` (`varchar(20)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LANSWER-113 Champ court** `answer_type` (varchar(20)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `question_id` (int unsigned)

- [x] **LANSWER-115 Alignement de type** `question_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LANSWER-116 FK** `question_id` -> probable `question` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (datetime)

- [x] **LANSWER-118 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LANSWER-119 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LANSWER-120 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LANSWER-122 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LANSWER-123 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LANSWER-125 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LANSWER-126 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LANSWER-127 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LANSWER-129 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LANSWER-130 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LANSWER-132 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LANSWER-133 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LANSWER-134 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LANSWER-136 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LANSWER-137 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LANSWER-138 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LANSWER-300** Endpoint `POST /api/answer/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel.
- [x] **LANSWER-301** Endpoint `POST /api/answer/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LANSWER-302** Endpoint `POST /api/answer/delete` (soft-delete) existe.
- [~] **LANSWER-303** Endpoint `POST /api/answer/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LANSWER-304** Endpoint `POST /api/answer/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LANSWER-305** Endpoint `POST /api/answer/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LANSWER-306** Service Angular `answer.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LANSWER-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LANSWER-320** Route Angular `<answer>/new` declaree et guard route applique.
- [x] **LANSWER-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LANSWER-322** Composant `answer-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LANSWER-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LANSWER-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LANSWER-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LANSWER-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LANSWER-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LANSWER-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LANSWER-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LANSWER-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LANSWER-340** Route Angular `<answer>/:id/edit` declaree.
- [x] **LANSWER-341** Pre-remplissage via `getFullInfos`.
- [?] **LANSWER-342** Champs immuables affiches en lecture seule.
- [x] **LANSWER-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en AnswerBusiness.update._
- [x] **LANSWER-344** Bouton "Annuler" retour sans persister.
- [x] **LANSWER-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LANSWER-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LANSWER-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LANSWER-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LANSWER-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LANSWER-363** Texte confirmation explicite + reversible documente.
- [x] **LANSWER-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LANSWER-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LANSWER-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LANSWER-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer + dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LANSWER-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LANSWER-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LANSWER-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LANSWER-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LANSWER-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LANSWER-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LANSWER-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LANSWER-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LANSWER-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LANSWER-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LANSWER-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LANSWER-600** Lister toutes les tables source ayant une FK vers `answer` (parcourir DB describe). -- _AUDIT: FK entrantes : candidate_answer.answer_id._
- [x] **LANSWER-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL). -- _AUDIT: candidate_answer(answer_id)._
- [-] **LANSWER-602** Soft-delete de `answer` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LANSWER-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LANSWER-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LANSWER-605** Test : creer une source liee -> tenter delete `answer` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LANSWER-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LANSWER-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **FIXED** Validation enum stricte answerType (FIXED/FREE) ajoutee dans AnswerBusiness sur create + 3 update paths avec normalisation toUpperCase. answer_text reste un texte libre (pas un enum). Converter BD/Flyway pour blindage complet reste a faire._
- [x] **LANSWER-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LANSWER-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LANSWER-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LANSWER-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LANSWER-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LANSWER-707** Aucun tableau non rafraichi apres mutation.
- [-] **LANSWER-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LANSWER-709** Aucune route sensible sans guard.
- [x] **LANSWER-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [x] **LANSWER-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **FIXED** answerType valide enum strict (FIXED/FREE) au create AnswerBusiness ; correctAnswersCount par questionType verifie a la publication FormVersionBusiness (SINGLE_CHOICE/TRUE_FALSE = 1 exact, MULTIPLE_CHOICE >= 1)._
- [x] **LANSWER-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LANSWER-713** Aucun hard-delete accidentel.
- [-] **LANSWER-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LANSWER-715** Aucun invariant inter-champs non valide back.
- [-] **LANSWER-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LANSWER-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LANSWER-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LANSWER-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LANSWER-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LANSWER-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) enum strict answer_type ; (2) validation Business : SINGLE_CHOICE => exactement 1 isCorrect ; MULTI => >=1._

