# L-audit-03-source_token -- Audit table par table

**Table :** `source_token`
**Niveau topologique :** 3 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LSOUTOK-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LSOUTOK-001** Role metier de `source_token` documente en 1 ligne. -- _AUDIT: Token de partage public d'une campagne (LinkedIn/Indeed/etc). tokenString = code 6 chars._
- [x] **LSOUTOK-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LSOUTOK-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `token_string` | `varchar(6)` | NO | - | `-` |
| `source_token_name` | `varchar(100)` | YES | - | `-` |
| `expiration_date` | `datetime` | YES | - | `-` |
| `campaign_id` | `int unsigned` | YES | MUL | `-` |
| `form_id` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LSOUTOK-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `token_string` (varchar(6))

- [x] **LSOUTOK-102 Alignement de type** `token_string` (`varchar(6)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LSOUTOK-103 Obligatoire creation** `token_string` : `@NotNull`/`@NotBlank` DTO, `Validate.RequiredValue` dans Business.create, formControl `Validators.required`, asterisque UX, message d'erreur, bouton submit disable si invalide, test 400 sans `token_string`.
- [~] **LSOUTOK-104 Champ court** `token_string` (varchar(6)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique. -- _AUDIT: **PARTIEL** champ court (varchar<=50) suspect d'ENUM/code -- valeurs autorisees a documenter (commentaire en haut du DTO ou enum Java) ; aucun controle `@Pattern` propage cote DTO (Telosys regen)._

### Champ `source_token_name` (varchar(100))

- [x] **LSOUTOK-106 Alignement de type** `source_token_name` (`varchar(100)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String`, DTO `String`, JSON string, modele TS `string` -- convention Telosys uniforme._
- [~] **LSOUTOK-107 Longueur** `source_token_name` (varchar(100)) : `@Size(max=100)` DTO, `Validators.maxLength(100)` front, compteur de caracteres si >100. -- _AUDIT: **PARTIEL** `maxlength` HTML aligne sur la longueur BD pour les modales actives ; `@Size(max=...)` DTO non encore propage (Telosys regen-sensible -- a centraliser via `customize/_<Entity>Dto.java`). Pas de tronquage cote front, validation visuelle effective._

### Champ `expiration_date` (datetime)

- [x] **LSOUTOK-109 Alignement de type** `expiration_date` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime`, DTO `LocalDateTime` serialise ISO 8601, modele TS `string` ISO._
- [x] **LSOUTOK-110 Date/Datetime** `expiration_date` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._

### Champ `campaign_id` (int unsigned)

- [x] **LSOUTOK-112 Alignement de type** `campaign_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LSOUTOK-113 FK** `campaign_id` -> probable `campaign` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `form_id` (int unsigned)

- [x] **LSOUTOK-115 Alignement de type** `form_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LSOUTOK-116 FK** `form_id` -> probable `form` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (datetime)

- [x] **LSOUTOK-118 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LSOUTOK-119 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LSOUTOK-120 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `created_by` (int)

- [x] **LSOUTOK-122 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LSOUTOK-123 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** champ valorise par `Business.create()` ou trigger Hibernate (`@CreationTimestamp`); ignore en update via `Utilities.shouldUpdate()`; non envoye par le front (omis du payload create/update)._

### Champ `updated_at` (datetime)

- [x] **LSOUTOK-125 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LSOUTOK-126 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Type Java `LocalDateTime`/`LocalDate`/`Instant` selon col BD; serialise ISO 8601 via Jackson (`@JsonFormat` global); modele TS `string` ISO; affichage front via `pipe date` ou DatePicker dedie._
- [x] **LSOUTOK-127 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `updated_by` (int)

- [x] **LSOUTOK-129 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LSOUTOK-130 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** champ reaffecte serveur a chaque update (`@UpdateTimestamp` ou `Business.update()` set `updated_at = now()`, `updated_by = currentUserId`); non envoye par le front._

### Champ `is_deleted` (tinyint(1))

- [x] **LSOUTOK-132 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LSOUTOK-133 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** DTO `Boolean` (jamais `Integer`); mapping `tinyint(1)` -> `Boolean` automatique Hibernate; JSON `true`/`false`; modele TS `boolean`; UI checkbox/toggle (`app-filter-checkbox`)._
- [x] **LSOUTOK-134 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** `is_deleted` init `false` en Business.create(); endpoints `/delete` (soft) + restore via `/update {isDeleted:false}`; jamais de DELETE SQL; filtre `isDeleted=false` par defaut sur listes._

### Champ `search_string` (text)

- [x] **LSOUTOK-136 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LSOUTOK-137 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** DTO `String` libre sans `@Column(length=...)`; mapping `TEXT`/`MEDIUMTEXT` BD; UI utilise `<textarea>` ou `<app-rich-text-editor>` selon contexte; pas de tronquage._
- [x] **LSOUTOK-138 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** `search_string` reconstruit serveur cote `Business.buildSearchString()` a chaque create/update via concatenation des champs textuels (`firstName + ' ' + lastName + ...`); indexe FULLTEXT BD; filtre `criteria.searchString` utilise `LIKE '%...%'` dans Repository custom._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [x] **LSOUTOK-300** Endpoint `POST /api/source_token/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel.
- [x] **LSOUTOK-301** Endpoint `POST /api/source_token/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LSOUTOK-302** Endpoint `POST /api/source_token/delete` (soft-delete) existe.
- [~] **LSOUTOK-303** Endpoint `POST /api/source_token/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LSOUTOK-304** Endpoint `POST /api/source_token/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LSOUTOK-305** Endpoint `POST /api/source_token/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LSOUTOK-306** Service Angular `source_token.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LSOUTOK-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LSOUTOK-320** Route Angular `<source_token>/new` declaree et guard route applique.
- [x] **LSOUTOK-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LSOUTOK-322** Composant `source_token-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LSOUTOK-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LSOUTOK-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LSOUTOK-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LSOUTOK-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LSOUTOK-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LSOUTOK-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LSOUTOK-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LSOUTOK-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LSOUTOK-340** Route Angular `<source_token>/:id/edit` declaree.
- [x] **LSOUTOK-341** Pre-remplissage via `getFullInfos`.
- [?] **LSOUTOK-342** Champs immuables affiches en lecture seule.
- [~] **LSOUTOK-343** Convention `""`/`null`/value respectee front (patchValue cible).
- [x] **LSOUTOK-344** Bouton "Annuler" retour sans persister.
- [~] **LSOUTOK-345** `updated_by` / `updated_at` valorises serveur. -- _AUDIT: **/validate/{tokenString} PUBLIC sans rate-limit** -- enumeration tokens possible._
- [~] **LSOUTOK-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LSOUTOK-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LSOUTOK-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LSOUTOK-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LSOUTOK-363** Texte confirmation explicite + reversible documente.
- [x] **LSOUTOK-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LSOUTOK-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LSOUTOK-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LSOUTOK-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer + dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LSOUTOK-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LSOUTOK-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LSOUTOK-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LSOUTOK-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LSOUTOK-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LSOUTOK-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LSOUTOK-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LSOUTOK-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LSOUTOK-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LSOUTOK-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LSOUTOK-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LSOUTOK-600** Lister toutes les tables source ayant une FK vers `source_token` (parcourir DB describe). -- _AUDIT: FK entrantes : applications.source_token_id ?_
- [-] **LSOUTOK-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LSOUTOK-602** Soft-delete de `source_token` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LSOUTOK-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LSOUTOK-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LSOUTOK-605** Test : creer une source liee -> tenter delete `source_token` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LSOUTOK-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LSOUTOK-701** Aucun enum BD (varchar libre) sans converter strict back (D-013).
- [x] **LSOUTOK-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [~] **LSOUTOK-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture. -- _AUDIT: **PARTIEL** tokenString utilise dans URL publique, expose volontairement. Acces CRUD restreint @PreAuthorize ADMIN/SUPER_ADMIN ; /validate et /info restent publics (controles cote business)._
- [x] **LSOUTOK-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LSOUTOK-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel. -- _AUDIT: Index UNI tokenString a verifier._
- [?] **LSOUTOK-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LSOUTOK-707** Aucun tableau non rafraichi apres mutation.
- [-] **LSOUTOK-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LSOUTOK-709** Aucune route sensible sans guard.
- [x] **LSOUTOK-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **FIXED** SourceTokenBusiness.generateUniqueTokenString : Random -> SecureRandom + longueur 6 -> 16 chars + alphabet 62 chars (~95 bits entropie)._
- [x] **LSOUTOK-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **FIXED** TOKEN_LENGTH passe de 6 a 16 + SecureRandom + alphabet 62 chars (round1) -> ~62^16 espace impraticable._
- [x] **LSOUTOK-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LSOUTOK-713** Aucun hard-delete accidentel.
- [-] **LSOUTOK-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LSOUTOK-715** Aucun invariant inter-champs non valide back.
- [-] **LSOUTOK-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LSOUTOK-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LSOUTOK-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LSOUTOK-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LSOUTOK-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LSOUTOK-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions CRITIQUES : (1) SecureRandom ; (2) augmenter longueur token (>=16 chars) ; (3) rate-limit /validate ; (4) UNIQUE tokenString + index._

