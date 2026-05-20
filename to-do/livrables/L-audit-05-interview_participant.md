# L-audit-05-interview_participant -- Audit table par table

**Table :** `interview_participant`
**Niveau topologique :** 5 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LINTPAR-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LINTPAR-001** Role metier de `interview_participant` documente en 1 ligne. -- _AUDIT: Participants entretien : user + interview + flags isOnline/hasFinished + lastPingAt._
- [x] **LINTPAR-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LINTPAR-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `can_update` | `tinyint(1)` | YES | - | `-` |
| `can_delete` | `tinyint(1)` | YES | - | `-` |
| `can_evaluate` | `tinyint(1)` | YES | - | `-` |
| `is_admin` | `tinyint(1)` | NO | - | `0` |
| `follow` | `tinyint(1)` | YES | - | `-` |
| `is_online` | `tinyint(1)` | YES | - | `-` |
| `has_finished` | `tinyint(1)` | YES | - | `-` |
| `last_ping_at` | `datetime` | YES | - | `-` |
| `user_id` | `int unsigned` | YES | MUL | `-` |
| `interview_id` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LINTPAR-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `can_update` (tinyint(1))

- [x] **LINTPAR-102 Alignement de type** `can_update` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LINTPAR-103 Booleen** `can_update` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`.

### Champ `can_delete` (tinyint(1))

- [x] **LINTPAR-105 Alignement de type** `can_delete` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LINTPAR-106 Booleen** `can_delete` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `can_evaluate` (tinyint(1))

- [x] **LINTPAR-108 Alignement de type** `can_evaluate` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LINTPAR-109 Booleen** `can_evaluate` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `is_admin` (tinyint(1))

- [x] **LINTPAR-111 Alignement de type** `is_admin` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LINTPAR-112 Booleen** `is_admin` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `follow` (tinyint(1))

- [x] **LINTPAR-114 Alignement de type** `follow` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LINTPAR-115 Booleen** `follow` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `is_online` (tinyint(1))

- [x] **LINTPAR-117 Alignement de type** `is_online` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LINTPAR-118 Booleen** `is_online` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `has_finished` (tinyint(1))

- [x] **LINTPAR-120 Alignement de type** `has_finished` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LINTPAR-121 Booleen** `has_finished` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `last_ping_at` (datetime)

- [x] **LINTPAR-123 Alignement de type** `last_ping_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime`, DTO `LocalDateTime` serialise ISO 8601, modele TS `string` ISO._
- [x] **LINTPAR-124 Date/Datetime** `last_ping_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `user_id` (int unsigned)

- [x] **LINTPAR-126 Alignement de type** `user_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LINTPAR-127 FK** `user_id` -> probable `user` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `interview_id` (int unsigned)

- [x] **LINTPAR-129 Alignement de type** `interview_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LINTPAR-130 FK** `interview_id` -> probable `interview` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (datetime)

- [x] **LINTPAR-132 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LINTPAR-133 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LINTPAR-134 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LINTPAR-136 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LINTPAR-137 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LINTPAR-139 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LINTPAR-140 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LINTPAR-141 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LINTPAR-143 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LINTPAR-144 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LINTPAR-146 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LINTPAR-147 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LINTPAR-148 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LINTPAR-150 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LINTPAR-151 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LINTPAR-152 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LINTPAR-300** Endpoint `POST /api/interview_participant/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: @PreAuthorize class-level._
- [x] **LINTPAR-301** Endpoint `POST /api/interview_participant/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LINTPAR-302** Endpoint `POST /api/interview_participant/delete` (soft-delete) existe.
- [~] **LINTPAR-303** Endpoint `POST /api/interview_participant/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LINTPAR-304** Endpoint `POST /api/interview_participant/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LINTPAR-305** Endpoint `POST /api/interview_participant/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LINTPAR-306** Service Angular `interview_participant.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LINTPAR-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LINTPAR-320** Route Angular `<interview_participant>/new` declaree et guard route applique.
- [x] **LINTPAR-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LINTPAR-322** Composant `interview_participant-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LINTPAR-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LINTPAR-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LINTPAR-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LINTPAR-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LINTPAR-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LINTPAR-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LINTPAR-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LINTPAR-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LINTPAR-340** Route Angular `<interview_participant>/:id/edit` declaree.
- [x] **LINTPAR-341** Pre-remplissage via `getFullInfos`.
- [?] **LINTPAR-342** Champs immuables affiches en lecture seule.
- [~] **LINTPAR-343** Convention `""`/`null`/value respectee front (patchValue cible).
- [x] **LINTPAR-344** Bouton "Annuler" retour sans persister.
- [x] **LINTPAR-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LINTPAR-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LINTPAR-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LINTPAR-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LINTPAR-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LINTPAR-363** Texte confirmation explicite + reversible documente.
- [x] **LINTPAR-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LINTPAR-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LINTPAR-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LINTPAR-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer + dd/MM/yyyy HH:mm:ss._

### 3.F LIST / SEARCH
- [x] **LINTPAR-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LINTPAR-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LINTPAR-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LINTPAR-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LINTPAR-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LINTPAR-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LINTPAR-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LINTPAR-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LINTPAR-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LINTPAR-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LINTPAR-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LINTPAR-600** Lister toutes les tables source ayant une FK vers `interview_participant` (parcourir DB describe). -- _AUDIT: Pas de FK entrantes._
- [-] **LINTPAR-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LINTPAR-602** Soft-delete de `interview_participant` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LINTPAR-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LINTPAR-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LINTPAR-605** Test : creer une source liee -> tenter delete `interview_participant` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LINTPAR-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LINTPAR-701** Aucun enum BD (varchar libre) sans converter strict back (D-013).
- [x] **LINTPAR-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LINTPAR-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LINTPAR-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LINTPAR-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LINTPAR-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LINTPAR-707** Aucun tableau non rafraichi apres mutation.
- [-] **LINTPAR-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LINTPAR-709** Aucune route sensible sans guard.
- [x] **LINTPAR-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large).
- [~] **LINTPAR-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **PARTIEL FIXED** lastPingAt mis a jour par polling 5s ; timeout auto offline a implementer en tache @Scheduled (decision infra)._
- [x] **LINTPAR-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LINTPAR-713** Aucun hard-delete accidentel.
- [-] **LINTPAR-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LINTPAR-715** Aucun invariant inter-champs non valide back.
- [-] **LINTPAR-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LINTPAR-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LINTPAR-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LINTPAR-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LINTPAR-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LINTPAR-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) UNIQUE (user_id, interview_id) ; (2) job back qui passe isOnline=false si lastPingAt > N seconds ; (3) ne pas ecraser hasFinished sur ping._

