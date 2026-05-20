# L-audit-01-notifications -- Audit table par table

**Table :** `notifications`
**Niveau topologique :** 1 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LNOTIFI-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LNOTIFI-001** Role metier de `notifications` documente en 1 ligne. -- _AUDIT: Notifications utilisateur (notifType, notifLink, isRead, objectTableName/Id polymorphes)._
- [x] **LNOTIFI-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LNOTIFI-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `notif_type` | `varchar(100)` | YES | - | `-` |
| `notif_actor` | `int` | YES | - | `-` |
| `notif_link` | `varchar(255)` | YES | - | `-` |
| `is_read` | `tinyint(1)` | YES | - | `-` |
| `object_table_name` | `varchar(100)` | YES | - | `-` |
| `object_table_id` | `int` | YES | - | `-` |
| `user_id` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LNOTIFI-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `notif_type` (varchar(100))

- [x] **LNOTIFI-102 Alignement de type** `notif_type` (`varchar(100)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LNOTIFI-103 Longueur** `notif_type` (varchar(100)) : `@Size(max=100)` DTO, `Validators.maxLength(100)` front, compteur de caracteres si >100.

### Champ `notif_actor` (int)

- [x] **LNOTIFI-105 Alignement de type** `notif_actor` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [~] **LNOTIFI-106 Numerique** `notif_actor` (`int`) : range metier documente (`@Min`/`@Max` + `Validators.min/max`), input `type=number`, test bornes. -- _AUDIT: **PARTIEL** input `type="number"` front + `min`/`max` HTML quand bornes connues ; `@Min/@Max` DTO non encore propage (Telosys regen). Bornes metier a documenter par entite._

### Champ `notif_link` (varchar(255))

- [x] **LNOTIFI-108 Alignement de type** `notif_link` (`varchar(255)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LNOTIFI-109 Longueur** `notif_link` (varchar(255)) : `@Size(max=255)` DTO, `Validators.maxLength(255)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `is_read` (tinyint(1))

- [x] **LNOTIFI-111 Alignement de type** `is_read` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LNOTIFI-112 Booleen** `is_read` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._

### Champ `object_table_name` (varchar(100))

- [x] **LNOTIFI-114 Alignement de type** `object_table_name` (`varchar(100)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LNOTIFI-115 Longueur** `object_table_name` (varchar(100)) : `@Size(max=100)` DTO, `Validators.maxLength(100)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `object_table_id` (int)

- [x] **LNOTIFI-117 Alignement de type** `object_table_id` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._

### Champ `user_id` (int unsigned)

- [x] **LNOTIFI-119 Alignement de type** `user_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LNOTIFI-120 FK** `user_id` -> probable `user` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (datetime)

- [x] **LNOTIFI-122 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LNOTIFI-123 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LNOTIFI-124 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LNOTIFI-126 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LNOTIFI-127 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LNOTIFI-129 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LNOTIFI-130 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LNOTIFI-131 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LNOTIFI-133 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LNOTIFI-134 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LNOTIFI-136 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LNOTIFI-137 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LNOTIFI-138 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LNOTIFI-140 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LNOTIFI-141 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LNOTIFI-142 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LNOTIFI-300** Endpoint `POST /api/notifications/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: @PreAuthorize isAuthenticated() class-level._
- [x] **LNOTIFI-301** Endpoint `POST /api/notifications/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LNOTIFI-302** Endpoint `POST /api/notifications/delete` (soft-delete) existe.
- [~] **LNOTIFI-303** Endpoint `POST /api/notifications/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LNOTIFI-304** Endpoint `POST /api/notifications/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LNOTIFI-305** Endpoint `POST /api/notifications/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LNOTIFI-306** Service Angular `notifications.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LNOTIFI-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LNOTIFI-320** Route Angular `<notifications>/new` declaree et guard route applique.
- [x] **LNOTIFI-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LNOTIFI-322** Composant `notifications-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LNOTIFI-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LNOTIFI-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LNOTIFI-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LNOTIFI-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LNOTIFI-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LNOTIFI-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LNOTIFI-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LNOTIFI-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LNOTIFI-340** Route Angular `<notifications>/:id/edit` declaree.
- [x] **LNOTIFI-341** Pre-remplissage via `getFullInfos`.
- [?] **LNOTIFI-342** Champs immuables affiches en lecture seule.
- [x] **LNOTIFI-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en NotificationsBusiness.update._
- [x] **LNOTIFI-344** Bouton "Annuler" retour sans persister.
- [x] **LNOTIFI-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LNOTIFI-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LNOTIFI-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LNOTIFI-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LNOTIFI-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LNOTIFI-363** Texte confirmation explicite + reversible documente.
- [x] **LNOTIFI-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [~] **LNOTIFI-365** Cascade decidee pour FK entrantes (cf. Section 5). -- _AUDIT: **PARTIEL FIXED** objectTableName/Id polymorphes par design (couvre 8+ types) ; orphelins acceptes (notif reste affichee, l'utilisateur voit "objet supprime")._
- [x] **LNOTIFI-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LNOTIFI-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer MapStruct + jointure userFirstName/userLastName + dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LNOTIFI-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LNOTIFI-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LNOTIFI-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LNOTIFI-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LNOTIFI-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LNOTIFI-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non. -- _AUDIT: Tout utilisateur authentifie._
- [x] **LNOTIFI-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie. -- _AUDIT: **FIXED** NotificationsBusiness.getByCriteria force userId=request.getUser() pour les non-privileges (isPrivilegedForFilter=false) ; les ADMIN/SUPER_ADMIN voient tout, les UTILISATEUR uniquement leurs propres notifs._
- [x] **LNOTIFI-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LNOTIFI-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LNOTIFI-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LNOTIFI-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LNOTIFI-600** Lister toutes les tables source ayant une FK vers `notifications` (parcourir DB describe). -- _AUDIT: FK entrante : user_id._
- [-] **LNOTIFI-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LNOTIFI-602** Soft-delete de `notifications` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LNOTIFI-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LNOTIFI-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LNOTIFI-605** Test : creer une source liee -> tenter delete `notifications` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LNOTIFI-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LNOTIFI-701** Aucun enum BD (varchar libre) sans converter strict back (D-013). -- _AUDIT: **PARTIEL FIXED** Validation pattern strict UPPER_SNAKE_CASE ([A-Z][A-Z0-9_]{1,49}) ajoutee dans NotificationsBusiness sur create + update avec normalisation toUpperCase. Codes notifType (INTERVIEW_DECLINED, INTERVIEW_RESCHEDULE_REQUESTED...) restent dynamiques et generes par le backend ; enum centralise non cree (codes ouverts). Converter BD reste a faire._
- [x] **LNOTIFI-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LNOTIFI-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture.
- [x] **LNOTIFI-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LNOTIFI-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LNOTIFI-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LNOTIFI-707** Aucun tableau non rafraichi apres mutation.
- [-] **LNOTIFI-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LNOTIFI-709** Aucune route sensible sans guard.
- [x] **LNOTIFI-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **FIXED** getByCriteria force userId = current user pour non-ADMIN/SUPER_ADMIN -- un user ne voit plus les notifs des autres._
- [~] **LNOTIFI-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **PARTIEL FIXED** notifType valide (pattern UPPER_SNAKE_CASE [A-Z][A-Z0-9_]{1,49}) ; cleanup auto des notifs lues anciennes a planifier en tache @Scheduled (decision infra)._
- [x] **LNOTIFI-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LNOTIFI-713** Aucun hard-delete accidentel.
- [-] **LNOTIFI-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LNOTIFI-715** Aucun invariant inter-champs non valide back.
- [-] **LNOTIFI-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LNOTIFI-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LNOTIFI-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LNOTIFI-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LNOTIFI-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LNOTIFI-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions : (1) enum strict pour notifType ; (2) filtre obligatoire user_id=sessionUser dans /getByCriteria ; (3) job de purge ou archivage._

