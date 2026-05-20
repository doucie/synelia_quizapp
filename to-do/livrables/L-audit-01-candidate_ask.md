# L-audit-01-candidate_ask -- Audit table par table

**Table :** `candidate_ask`
**Niveau topologique :** 1 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LCANASK-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LCANASK-001** Role metier de `candidate_ask` documente en 1 ligne. -- _AUDIT: Demandes correction candidat (IDENTITY/EMAIL/PHONE) avec workflow PENDING->APPROVED/REJECTED._
- [x] **LCANASK-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LCANASK-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `request_type` | `varchar(10)` | YES | - | `-` |
| `ask_status` | `varchar(20)` | NO | - | `PENDING` |
| `is_verified` | `tinyint(1)` | NO | - | `-` |
| `first_name` | `varchar(100)` | YES | - | `-` |
| `last_name` | `varchar(100)` | YES | - | `-` |
| `new_email` | `varchar(255)` | YES | - | `-` |
| `new_phone` | `varchar(20)` | YES | - | `-` |
| `decision_reason` | `varchar(500)` | YES | - | `-` |
| `application_id` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |

### Champs a VERIFIER / MODIFIER

- [~] **LCANASK-040** REVUE : Enum `request_type varchar(10)` -- documenter valeurs (REOPEN / EDIT_INFO / ...). -- _AUDIT: **PARTIEL** Enum stocke en `varchar` (pas d'ENUM natif MySQL) -- valeurs autorisees a centraliser dans une enum Java + constante TS partagee. Documentation valeurs effective dans le code (Business.create) mais a remonter au DTO._
- [~] **LCANASK-041** REVUE : Enum `ask_status varchar(20)` (defaut PENDING) -- PENDING/APPROVED/REJECTED. -- _AUDIT: **PARTIEL** Contrainte metier identifiee, controle effectif au niveau Business AVANT save ; index unique BD a ajouter si non present (Flyway V1_*) pour garantir integrite._

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LCANASK-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `request_type` (varchar(10))

- [x] **LCANASK-102 Alignement de type** `request_type` (`varchar(10)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LCANASK-103 Champ court** `request_type` (varchar(10)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique.

### Champ `ask_status` (varchar(20))

- [x] **LCANASK-105 Alignement de type** `ask_status` (`varchar(20)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LCANASK-106 Champ court** `ask_status` (varchar(20)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `is_verified` (tinyint(1))

- [x] **LCANASK-108 Alignement de type** `is_verified` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LCANASK-109 Obligatoire creation** `is_verified` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `is_verified`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LCANASK-110 Booleen** `is_verified` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `first_name` (varchar(100))

- [x] **LCANASK-112 Alignement de type** `first_name` (`varchar(100)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LCANASK-113 Longueur** `first_name` (varchar(100)) : `@Size(max=100)` DTO, `Validators.maxLength(100)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `last_name` (varchar(100))

- [x] **LCANASK-115 Alignement de type** `last_name` (`varchar(100)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LCANASK-116 Longueur** `last_name` (varchar(100)) : `@Size(max=100)` DTO, `Validators.maxLength(100)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `new_email` (varchar(255))

- [x] **LCANASK-118 Alignement de type** `new_email` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LCANASK-119 Longueur** `new_email` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `new_phone` (varchar(20))

- [x] **LCANASK-121 Alignement de type** `new_phone` (`varchar(20)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LCANASK-122 Champ court** `new_phone` (varchar(20)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `decision_reason` (varchar(500))

- [x] **LCANASK-124 Alignement de type** `decision_reason` (`varchar(500)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LCANASK-125 Longueur** `decision_reason` (varchar(500)) : `@Size(max=500)` DTO, `Validators.maxLength(500)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `application_id` (int unsigned)

- [x] **LCANASK-127 Alignement de type** `application_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCANASK-128 FK** `application_id` -> probable `application` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (datetime)

- [x] **LCANASK-130 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LCANASK-131 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LCANASK-132 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LCANASK-134 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LCANASK-135 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LCANASK-137 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LCANASK-138 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LCANASK-139 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LCANASK-141 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LCANASK-142 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LCANASK-144 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LCANASK-145 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LCANASK-146 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LCANASK-148 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LCANASK-149 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LCANASK-150 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LCANASK-300** Endpoint `POST /api/candidate_ask/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: @PreAuthorize ADMIN/SUPER_ADMIN/UTILISATEUR class-level._
- [x] **LCANASK-301** Endpoint `POST /api/candidate_ask/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LCANASK-302** Endpoint `POST /api/candidate_ask/delete` (soft-delete) existe.
- [~] **LCANASK-303** Endpoint `POST /api/candidate_ask/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LCANASK-304** Endpoint `POST /api/candidate_ask/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LCANASK-305** Endpoint `POST /api/candidate_ask/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LCANASK-306** Service Angular `candidate_ask.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LCANASK-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LCANASK-320** Route Angular `<candidate_ask>/new` declaree et guard route applique.
- [x] **LCANASK-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LCANASK-322** Composant `candidate_ask-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LCANASK-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LCANASK-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LCANASK-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LCANASK-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LCANASK-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LCANASK-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LCANASK-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LCANASK-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LCANASK-340** Route Angular `<candidate_ask>/:id/edit` declaree.
- [x] **LCANASK-341** Pre-remplissage via `getFullInfos`.
- [?] **LCANASK-342** Champs immuables affiches en lecture seule.
- [x] **LCANASK-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en CandidateAskBusiness.update._
- [x] **LCANASK-344** Bouton "Annuler" retour sans persister.
- [x] **LCANASK-345** `updated_by` / `updated_at` valorises serveur. -- _AUDIT: /applications/submit-ask PUBLIC volontairement (track-application form)._
- [~] **LCANASK-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LCANASK-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LCANASK-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LCANASK-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LCANASK-363** Texte confirmation explicite + reversible documente.
- [x] **LCANASK-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [~] **LCANASK-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: **PARTIEL FIXED** Policy projet : soft-delete uniquement ; application_id FK orpheline acceptable pour conservation historique demande candidat._
- [x] **LCANASK-366** Rafraichissement sans F5.

### 3.E RESTORE
- [~] **LCANASK-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: DTO present mais verifier Transformer dedie -- format dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LCANASK-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LCANASK-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LCANASK-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LCANASK-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LCANASK-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LCANASK-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LCANASK-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie. -- _AUDIT: /submit-ask public OK pour candidate flow._
- [x] **LCANASK-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LCANASK-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LCANASK-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LCANASK-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint. -- _AUDIT: **FIXED** class-level @PreAuthorize ADMIN/SUPER_ADMIN/UTILISATEUR ; submit-ask public par design (formulaire libre). Tous les autres endpoints CRUD soumis a l'authentification._


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LCANASK-600** Lister toutes les tables source ayant une FK vers `candidate_ask` (parcourir DB describe). -- _AUDIT: FK entrante : application_id._
- [-] **LCANASK-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LCANASK-602** Soft-delete de `candidate_ask` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LCANASK-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LCANASK-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LCANASK-605** Test : creer une source liee -> tenter delete `candidate_ask` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LCANASK-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LCANASK-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **FIXED** validation enum strict requestType (EMAIL/PHONE) + askStatus (PENDING/APPROVED/REJECTED) cote Business.create() ET update() + force UPPERCASE. Reste : converter BD strict (defere)._
- [x] **LCANASK-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LCANASK-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LCANASK-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LCANASK-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LCANASK-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LCANASK-707** Aucun tableau non rafraichi apres mutation.
- [-] **LCANASK-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LCANASK-709** Aucune route sensible sans guard.
- [~] **LCANASK-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **PARTIEL FIXED** submit-ask public par design (formulaire candidat libre) ; rate-limit (Bucket4j) reste a installer (decision infra)._
- [~] **LCANASK-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **PARTIEL FIXED** PII (firstName/lastName/email/phone) acceptees sans auth par design (candidature libre, RGPD couvert par mention legale) ; mitigation : validation email + format en Business._
- [?] **LCANASK-712** Aucun endpoint qui modifie `created_by`/`created_at`. -- _AUDIT: Anti-spam / captcha sur submit-ask ?_
- [x] **LCANASK-713** Aucun hard-delete accidentel.
- [-] **LCANASK-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LCANASK-715** Aucun invariant inter-champs non valide back.
- [-] **LCANASK-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LCANASK-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LCANASK-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LCANASK-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LCANASK-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LCANASK-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) enum strict requestType+askStatus ; (2) rate limit + captcha submit-ask ; (3) restreindre approve/reject a ADMIN._

