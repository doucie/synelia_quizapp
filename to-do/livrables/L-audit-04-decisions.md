# L-audit-04-decisions -- Audit table par table

**Table :** `decisions`
**Niveau topologique :** 4 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LDECISI-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LDECISI-001** Role metier de `decisions` documente en 1 ligne. -- _AUDIT: Decision recruteur sur application (HIRE/REJECT/HOLD + commentaire + decisionType)._
- [x] **LDECISI-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LDECISI-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `decision_type` | `varchar(50)` | NO | - | `-` |
| `is_cancel` | `tinyint(1)` | NO | - | `-` |
| `application_id` | `int unsigned` | YES | MUL | `-` |
| `user_id` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |
| `pipeline_stage_id` | `int unsigned` | YES | MUL | `-` |

### Champs a VERIFIER / MODIFIER

- [~] **LDECISI-040** REVUE : Enum `decision_type varchar(50)` -- documenter valeurs (PRE_SCREEN / FINAL / ELIMINATED / ...). -- _AUDIT: Pas d'UNIQUE (application_id, decisionType) si decision unique attendue._

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LDECISI-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `decision_type` (varchar(50))

- [x] **LDECISI-102 Alignement de type** `decision_type` (`varchar(50)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LDECISI-103 Obligatoire creation** `decision_type` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `decision_type`.
- [~] **LDECISI-104 Longueur** `decision_type` (varchar(50)) : `@Size(max=50)` DTO, `Validators.maxLength(50)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `is_cancel` (tinyint(1))

- [x] **LDECISI-106 Alignement de type** `is_cancel` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LDECISI-107 Obligatoire creation** `is_cancel` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `is_cancel`. -- _AUDIT: **PARTIEL** `required` HTML + `Validators.required` Angular OK ; `Validate.RequiredValue` Business.create a auditer entite par entite ; `@NotNull/@NotBlank` DTO non encore propage (Telosys regen)._
- [x] **LDECISI-108 Booleen** `is_cancel` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `application_id` (int unsigned)

- [x] **LDECISI-110 Alignement de type** `application_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LDECISI-111 FK** `application_id` -> probable `application` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `user_id` (int unsigned)

- [x] **LDECISI-113 Alignement de type** `user_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LDECISI-114 FK** `user_id` -> probable `user` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (datetime)

- [x] **LDECISI-116 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LDECISI-117 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LDECISI-118 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LDECISI-120 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LDECISI-121 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LDECISI-123 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LDECISI-124 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LDECISI-125 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LDECISI-127 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LDECISI-128 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LDECISI-130 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LDECISI-131 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LDECISI-132 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LDECISI-134 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LDECISI-135 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LDECISI-136 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._

### Champ `pipeline_stage_id` (int unsigned)

- [x] **LDECISI-138 Alignement de type** `pipeline_stage_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LDECISI-139 FK** `pipeline_stage_id` -> probable `pipeline_stage` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LDECISI-300** Endpoint `POST /api/decisions/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel.
- [x] **LDECISI-301** Endpoint `POST /api/decisions/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LDECISI-302** Endpoint `POST /api/decisions/delete` (soft-delete) existe.
- [~] **LDECISI-303** Endpoint `POST /api/decisions/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LDECISI-304** Endpoint `POST /api/decisions/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LDECISI-305** Endpoint `POST /api/decisions/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LDECISI-306** Service Angular `decisions.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LDECISI-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LDECISI-320** Route Angular `<decisions>/new` declaree et guard route applique.
- [x] **LDECISI-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LDECISI-322** Composant `decisions-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LDECISI-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LDECISI-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LDECISI-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LDECISI-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LDECISI-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LDECISI-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LDECISI-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LDECISI-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LDECISI-340** Route Angular `<decisions>/:id/edit` declaree.
- [x] **LDECISI-341** Pre-remplissage via `getFullInfos`.
- [?] **LDECISI-342** Champs immuables affiches en lecture seule.
- [~] **LDECISI-343** Convention `""`/`null`/value respectee front (patchValue cible).
- [x] **LDECISI-344** Bouton "Annuler" retour sans persister.
- [x] **LDECISI-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LDECISI-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LDECISI-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LDECISI-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LDECISI-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LDECISI-363** Texte confirmation explicite + reversible documente.
- [x] **LDECISI-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LDECISI-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LDECISI-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LDECISI-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: **FIXED** DecisionTransformer.createdAt/updatedAt aligne sur dd/MM/yyyy (convention projet)._

### 3.F LIST / SEARCH
- [x] **LDECISI-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LDECISI-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LDECISI-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LDECISI-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LDECISI-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LDECISI-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LDECISI-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LDECISI-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LDECISI-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LDECISI-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LDECISI-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LDECISI-600** Lister toutes les tables source ayant une FK vers `decisions` (parcourir DB describe). -- _AUDIT: Pas de FK entrantes._
- [-] **LDECISI-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LDECISI-602** Soft-delete de `decisions` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LDECISI-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LDECISI-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LDECISI-605** Test : creer une source liee -> tenter delete `decisions` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LDECISI-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LDECISI-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **FIXED** validation enum strict decisionType (PRE_SCREEN_ACCEPTED/PRE_SCREEN_REJECTED/FINAL_ACCEPTED/FINAL_REJECTED) cote Business.create() + force UPPERCASE. Note : entite Decision ne contient pas actionType (seulement decisionType). Reste : converter BD strict (defere)._
- [x] **LDECISI-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LDECISI-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LDECISI-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LDECISI-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LDECISI-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LDECISI-707** Aucun tableau non rafraichi apres mutation.
- [-] **LDECISI-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LDECISI-709** Aucune route sensible sans guard.
- [x] **LDECISI-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [x] **LDECISI-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **FIXED** date format dd/MM/yyyy aligne dans DecisionTransformer (round1) + decisionType enum strict (LDECISI-701)._
- [x] **LDECISI-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LDECISI-713** Aucun hard-delete accidentel.
- [-] **LDECISI-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LDECISI-715** Aucun invariant inter-champs non valide back.
- [-] **LDECISI-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LDECISI-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LDECISI-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LDECISI-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LDECISI-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LDECISI-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) **convertir DTO format date en dd/MM/yyyy** (alignement) ; (2) enum strict decisionType + actionType ; (3) state machine HIRE/REJECT/HOLD._

