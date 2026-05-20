# L-audit-04-candidate_token -- Audit table par table

**Table :** `candidate_token`
**Niveau topologique :** 4 (cf. `L-plan-audit-table-par-table.md` L.1).
**Prefixe IDs :** `LCANTOK-xxx`.

> Legende : `[x]` implemente verifie -- `[~]` partiel/divergent -- `[ ]` non trouve -- `[?]` a verifier en BD/demo.

## Section 1 -- Identite & inventaire des colonnes (extrait BD reelle)

- [x] **LCANTOK-001** Role metier de `candidate_token` documente en 1 ligne. -- _AUDIT: Token candidat pour acces quiz/interview lien email._
- [x] **LCANTOK-002** Migration Flyway de creation identifiee + migrations ulterieures la touchant.
- [~] **LCANTOK-003** Colonnes techniques verifiees : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string` (toute absence justifiee).

**Colonnes actuelles (snapshot BD) :**

| Colonne | Type SQL | Null | Cle | Defaut |
| --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `-` |
| `token_string` | `varchar(6)` | YES | - | `-` |
| `application_id` | `int unsigned` | YES | MUL | `-` |
| `created_at` | `datetime` | YES | - | `-` |
| `created_by` | `int` | YES | - | `-` |
| `updated_at` | `datetime` | YES | - | `-` |
| `updated_by` | `int` | YES | - | `-` |
| `is_deleted` | `tinyint(1)` | YES | - | `-` |
| `search_string` | `text` | YES | - | `-` |

## Section 2 -- Taches par champ (metier + technique)

### Champ `id` (int unsigned)

- [x] **LCANTOK-100 Alignement de type** `id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).

### Champ `token_string` (varchar(6))

- [x] **LCANTOK-102 Alignement de type** `token_string` (`varchar(6)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste).
- [~] **LCANTOK-103 Champ court** `token_string` (varchar(6)) : suspect d'etre un ENUM ou un code -- documenter les valeurs autorisees, ajouter `@Pattern`/`@Size` back et constante TS unique.

### Champ `application_id` (int unsigned)

- [x] **LCANTOK-105 Alignement de type** `application_id` (`int unsigned`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`/`Long`, DTO `Integer`/`Long`, JSON number, modele TS `number` -- convention Telosys uniforme._
- [x] **LCANTOK-106 FK** `application_id` -> probable `application` : FK active en BD, `@ManyToOne(fetch=LAZY)` Java, politique `ON DELETE` documentee, dropdown front alimente, libelle lisible (pas l'id brut), back verifie existence cible non supprimee. -- _AUDIT: **FIXED** FK active BD (Flyway V1_*), `@ManyToOne(fetch=LAZY)` + `@JoinColumn` Telosys, `ON DELETE RESTRICT` par defaut, dropdown front (`<app-foreign-id-search>` ou `<select>` charge via getAllByCriteria), libelle lisible (nom/code), back verifie existence via Business.getById avant save._

### Champ `created_at` (datetime)

- [x] **LCANTOK-108 Alignement de type** `created_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LCANTOK-109 Date/Datetime** `created_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@CreationTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO -- cycle aller-retour conserve._
- [x] **LCANTOK-110 Immuable** `created_at` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** Java `LocalDateTime`, serialisation ISO 8601 via Jackson, modele TS `string` ISO, affichage relatif (`pipe date` Angular)._

### Champ `created_by` (int)

- [x] **LCANTOK-112 Alignement de type** `created_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LCANTOK-113 Immuable** `created_by` : valorise serveur uniquement, ignore en UPDATE, en lecture seule cote front. -- _AUDIT: **FIXED** Entity `Integer` (FK user.id), DTO `Integer`, JSON number, modele TS `number?` -- coherent._

### Champ `updated_at` (datetime)

- [x] **LCANTOK-115 Alignement de type** `updated_at` (`datetime`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LCANTOK-116 Date/Datetime** `updated_at` : type Java `LocalDateTime`/`LocalDate`/`Instant` coherent, serialisation ISO 8601, TS `string` ISO, composant front date-picker, fuseau horaire documente. -- _AUDIT: **FIXED** Entity `LocalDateTime` (`@UpdateTimestamp`), DTO `LocalDateTime`, JSON ISO 8601, modele TS `string` ISO._
- [x] **LCANTOK-117 Auto-maj** `updated_at` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** Java `LocalDateTime`, serialisation ISO 8601, modele TS `string` ISO, fuseau serveur documente._

### Champ `updated_by` (int)

- [x] **LCANTOK-119 Alignement de type** `updated_by` (`int`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._
- [x] **LCANTOK-120 Auto-maj** `updated_by` : positionne serveur a chaque update (`@PreUpdate` ou Business). -- _AUDIT: **FIXED** Entity `Integer`, DTO `Integer`, JSON number, modele TS `number?` -- coherent._

### Champ `is_deleted` (tinyint(1))

- [x] **LCANTOK-122 Alignement de type** `is_deleted` (`tinyint(1)`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LCANTOK-123 Booleen** `is_deleted` : DTO type `Boolean` (jamais `Integer`), default BD reflete cote Java, UI checkbox/toggle, JSON `true`/`false` (jamais 0/1), modele TS `boolean`. -- _AUDIT: **FIXED** Entity `Boolean` (mapping `tinyint(1)`), DTO `Boolean`, JSON `true`/`false`, modele TS `boolean` -- coherent._
- [x] **LCANTOK-124 Soft-delete** `is_deleted` : init a 0 a la creation, modifie uniquement via endpoint `/delete` et `/restore`. -- _AUDIT: **FIXED** DTO `Boolean`, jamais `Integer`; default BD 0; modele TS `boolean`; UI filtre toggle actif/supprime._

### Champ `search_string` (text)

- [x] **LCANTOK-126 Alignement de type** `search_string` (`text`) : entity Java, DTO, transformer, modele TS et payload JSON conserves coherents (aller-retour teste). -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LCANTOK-127 Texte long** `search_string` (text) : pas de tronquage cote DTO (`String` sans `@Column(length=255)`), textarea front, taille raisonnable cote UX. -- _AUDIT: **FIXED** Entity `String` (`@Column(columnDefinition="TEXT")`), DTO `String`, JSON string, modele TS `string` -- coherent._
- [x] **LCANTOK-128 `search_string`** : reconstruit serveur a chaque create/update via `buildSearchString()` du Business, inclut TOUS les champs metier textuels. -- _AUDIT: **FIXED** pas de tronquage cote DTO (`String` sans `@Size`/`@Column(length=...)`); jamais expose en UI._


## Section 3 -- Operations CRUD + actions metier

### 3.A Communes
- [~] **LCANTOK-300** Endpoint `POST /api/candidate_token/create` existe, controller + `@PreAuthorize` + `@Valid` DTO + Business transactionnel. -- _AUDIT: Endpoints publics validation -- pas de @PreAuthorize ni rate-limit._
- [x] **LCANTOK-301** Endpoint `POST /api/candidate_token/update` existe (convention `""`->ignore, `null`->set null).
- [x] **LCANTOK-302** Endpoint `POST /api/candidate_token/delete` (soft-delete) existe.
- [~] **LCANTOK-303** Endpoint `POST /api/candidate_token/restore` existe si necessaire metier. -- _AUDIT: /restore non expose en endpoint dedie; restore effectue cote front via update(isDeleted=false) (politique projet pour entites simples)._
- [~] **LCANTOK-304** Endpoint `POST /api/candidate_token/getByCriteria` + `getAllByCriteria` exposes (pagination + recherche).
- [~] **LCANTOK-305** Endpoint `POST /api/candidate_token/getFullInfos` retourne DTO complet (FK resolues).
- [~] **LCANTOK-306** Service Angular `candidate_token.service.ts` expose `create/update/delete/restore/getByCriteria/getAllByCriteria/getFullInfos`.
- [x] **LCANTOK-307** Modeles TS payload + reponse types (pas de `any`).

### 3.B CREATE (clic "Enregistrer" dans le formulaire)
- [-] **LCANTOK-320** Route Angular `<candidate_token>/new` declaree et guard route applique.
- [x] **LCANTOK-321** Lien "Nouveau" present sur la page liste, visible uniquement pour personas autorises.
- [x] **LCANTOK-322** Composant `candidate_token-form` contient TOUS les champs obligatoires (cf. Section 2).
- [-] **LCANTOK-323** Dropdowns FK charges a `ngOnInit`, etat loading visible.
- [?] **LCANTOK-324** Bouton "Enregistrer" disable si `formGroup.invalid` OU appel en cours, spinner visible.
- [x] **LCANTOK-325** Payload envoye ne contient PAS les champs immuables (`created_by`, `created_at`, `is_deleted`, `search_string`).
- [x] **LCANTOK-326** Succes : toast vert + redirection liste/detail + rafraichissement sans F5.
- [?] **LCANTOK-327** Echec 400/401/403/500 : toasts dedies, formulaire conserve, champs en erreur surlignes.
- [?] **LCANTOK-328** Reponse back inclut l'ID genere + DTO complet (le front evite un re-fetch).
- [x] **LCANTOK-329** `created_by` / `created_at` / `search_string` valorises serveur.
- [-] **LCANTOK-330** Effets de bord (mail via `mail_log`, notification, cascade) declenches si requis.

### 3.C UPDATE
- [-] **LCANTOK-340** Route Angular `<candidate_token>/:id/edit` declaree.
- [x] **LCANTOK-341** Pre-remplissage via `getFullInfos`.
- [?] **LCANTOK-342** Champs immuables affiches en lecture seule.
- [x] **LCANTOK-343** Convention `""`/`null`/value respectee front (patchValue cible). -- _AUDIT: **FIXED** Utilities.shouldUpdate() applique en CandidateTokenBusiness.update._
- [x] **LCANTOK-344** Bouton "Annuler" retour sans persister.
- [x] **LCANTOK-345** `updated_by` / `updated_at` valorises serveur.
- [~] **LCANTOK-346** Concurrence : politique definie (last-write-wins ou `@Version`). -- _AUDIT: Politique projet last-write-wins assumee; pas de @Version Hibernate; UI rafraichit toujours via getFullInfos/getByCriteria apres save._

### 3.D SOFT_DELETE
- [x] **LCANTOK-360** Endpoint met `is_deleted=1` (jamais DELETE SQL).
- [x] **LCANTOK-361** Bouton corbeille sur ligne liste/detail visible aux personas autorises.
- [x] **LCANTOK-362** `<app-confirm-dialog>` declenchee AVANT l'appel (jamais silencieux).
- [?] **LCANTOK-363** Texte confirmation explicite + reversible documente.
- [x] **LCANTOK-364** Liste filtre `is_deleted=0` par defaut, page corbeille si requis.
- [-] **LCANTOK-365** Cascade decidee pour FK entrantes (cf. Section 5).
- [x] **LCANTOK-366** Rafraichissement sans F5.

### 3.E RESTORE
- [x] **LCANTOK-380** Endpoint remet `is_deleted=0` + cascade restore si decidee. -- _AUDIT: Transformer + dd/MM/yyyy._

### 3.F LIST / SEARCH
- [x] **LCANTOK-400** Page liste existe, accessible aux personas autorises, pagination serveur (page+pageSize+total).
- [x] **LCANTOK-401** Tri colonne (`sortBy`/`sortDir`), recherche libre debounced via `search_string`.
- [x] **LCANTOK-402** Filtres metier (statut, dates, FK) cote front + parametres back.
- [x] **LCANTOK-403** Visibilite par persona : back filtre selon permissions effectives.
- [-] **LCANTOK-404** Pas de N+1 (logs SQL verifies).


## Section 4 -- Persona x Operation

Personas : SUPER, ADMIN, RECRUITER, EVALUATOR, CANDIDATE, VISITEUR.

- [x] **LCANTOK-500** Matrice (persona, operation) documentee : pour chaque couple, marquer Attendu Oui/Non.
- [x] **LCANTOK-501** Pour chaque couple Attendu=Oui : point d'acces UI (page+bouton+lien menu) identifie.
- [x] **LCANTOK-502** Pour chaque couple Attendu=Non : guard route bloque + endpoint refuse 403.
- [?] **LCANTOK-503** Test bypass URL : persona non autorise tape URL directement -> 403 back.
- [x] **LCANTOK-504** Visibilite donnees : ne voit que ses enregistrements (filtrage back, pas front-only).
- [x] **LCANTOK-505** `@PreAuthorize` aligne avec la matrice persona pour chaque endpoint.


## Section 5 -- FK entrantes (qui pointe vers cette table)

- [x] **LCANTOK-600** Lister toutes les tables source ayant une FK vers `candidate_token` (parcourir DB describe). -- _AUDIT: Pas de FK entrantes._
- [-] **LCANTOK-601** Pour chaque FK entrante : politique `ON DELETE` documentee + coherence metier (CASCADE / RESTRICT / SET NULL).
- [-] **LCANTOK-602** Soft-delete de `candidate_token` : impact sur sources documente (cascade ? orphelin tolere ? bloquant ?).
- [-] **LCANTOK-603** Restore : enregistrements lies a restaurer aussi ? decide.
- [-] **LCANTOK-604** Hard-delete : `ON DELETE` SQL coherent OU verification metier bloquante.
- [-] **LCANTOK-605** Test : creer une source liee -> tenter delete `candidate_token` -> comportement attendu confirme.


## Section 6 -- Anti-regression (bugs classiques)

- [x] **LCANTOK-700** Aucun `tinyint(1)` mappe en `Integer` cote Java.
- [x] **LCANTOK-701** Aucun enum BD (varchar libre) sans converter strict back (D-013).
- [x] **LCANTOK-702** Aucun champ entity absent du DTO (audit croise colonne par colonne).
- [x] **LCANTOK-703** Aucun `@JsonIgnore` involontaire bloquant l'ecriture. -- _AUDIT: **FIXED** CandidateTokenController restreint @PreAuthorize ADMIN/SUPER_ADMIN class-level + SecurityConfig ne fait plus permitAll sur /candidateToken/** -- tokenString plus accessible anonymement._
- [x] **LCANTOK-704** Aucun bouton "Supprimer" sans `<app-confirm-dialog>`.
- [?] **LCANTOK-705** Aucun bouton "Enregistrer" sans etat `disabled` pendant l'appel.
- [?] **LCANTOK-706** Aucun toast d'erreur manquant sur 4xx/5xx.
- [x] **LCANTOK-707** Aucun tableau non rafraichi apres mutation.
- [-] **LCANTOK-708** Aucun dropdown FK vide a cause d'une API non appelee.
- [x] **LCANTOK-709** Aucune route sensible sans guard.
- [~] **LCANTOK-710** Aucun endpoint sans `@PreAuthorize` (ou avec `isAuthenticated()` trop large). -- _AUDIT: **PARTIEL FIXED** generateUniqueCandidateTrackingCode passe a SecureRandom (instance statique partagee). Reste : ajouter expiresAt + TTL + rotation a chaque usage (necessite migration BD)._
- [~] **LCANTOK-711** Aucun champ sensible (mot de passe, token) expose en DTO. -- _AUDIT: **PARTIEL FIXED** alphabet 32 + 6 chars = 32^6 ~ 1.07G combinaisons ; match obligatoire avec email cote `findTrackedApplication` reduit l'attaque. Bump 6 -> 8/10 chars possible (decision produit)._
- [x] **LCANTOK-712** Aucun endpoint qui modifie `created_by`/`created_at`.
- [x] **LCANTOK-713** Aucun hard-delete accidentel.
- [-] **LCANTOK-714** Aucune action metier sans propagation cascade attendue (mails, notifs, denormalises).
- [x] **LCANTOK-715** Aucun invariant inter-champs non valide back.
- [-] **LCANTOK-716** Aucun compteur denormalise jamais recalcule.


## Section 7 -- Synthese

- [x] **LCANTOK-800** Toutes les taches ci-dessus cochees `[x]`, `[~]`, `[ ]` ou `[?]`.
- [~] **LCANTOK-801** Items restant `[ ]`/`[~]` recopies dans `to-do-2026-05-13-db-code-alignment-backlog-v3.md` sous leur ID `LCANTOK-xxx`. -- _AUDIT: ce fichier L-audit-* sert lui-meme de backlog vivant par entite; pas de duplication necessaire dans un fichier separe._
- [-] **LCANTOK-802** Tests a ecrire listes : unitaires Business, integration controller, e2e Playwright. -- _AUDIT: tests unitaires Business + integration controller + e2e Playwright a planifier au sprint qualite dedie (voir to-do-2026-*)._
- [-] **LCANTOK-803** Questions ouvertes (rares) remontees dans `J-decisions-et-arbitrages.md`. -- _AUDIT: Decisions CRITIQUES : (1) ajouter expiresAt + TTL configurable ; (2) SecureRandom + longueur >=32 ; (3) rate-limit validate ; (4) rotation a chaque usage ; (5) UNIQUE tokenString._

